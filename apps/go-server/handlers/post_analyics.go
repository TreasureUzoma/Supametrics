package handlers

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"os"
	"time"

	"supametrics/db"
	"supametrics/middleware"
	"supametrics/models"
	"supametrics/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/mssola/user_agent"
	"github.com/oschwald/geoip2-golang"
)

var GeoDB *geoip2.Reader

func InitGeoDB(dbPath string) error {
	var err error
	GeoDB, err = geoip2.Open(dbPath)
	if err != nil {
		return fmt.Errorf("failed to open MaxMind GeoLite2 DB: %w", err)
	}

	info, _ := os.Stat(dbPath)
	if time.Since(info.ModTime()) > 30*24*time.Hour {
		fmt.Println("GeoLite2 DB may be outdated. Update recommended.")
	}

	fmt.Println("GeoLite2 database loaded:", dbPath)
	return nil
}

type GeoIPData struct {
	CountryName string
	City        string
}

func isPrivateIP(ipStr string) bool {
	ip := net.ParseIP(ipStr)
	if ip == nil {
		return false
	}

	if ip.IsPrivate() || ip.IsLoopback() {
		return true
	}
	return false
}

func getGeoIPLookup(ip string) (GeoIPData, error) {
	if ip == "" {
		return GeoIPData{CountryName: "Unknown", City: "Unknown"}, fmt.Errorf("IP address is empty")
	}

	parsedIP := net.ParseIP(ip)
	if parsedIP == nil {
		return GeoIPData{CountryName: "Unknown", City: "Unknown"}, fmt.Errorf("failed to parse IP: %s", ip)
	}

	if isPrivateIP(ip) {
		return GeoIPData{CountryName: "Private IP", City: "Private IP"}, nil
	}

	if GeoDB == nil {
		return GeoIPData{}, fmt.Errorf("GeoDB not initialized")
	}

	record, err := GeoDB.City(parsedIP)
	if err != nil {
		return fallbackGeoLookup(ip)
	}

	country := record.Country.IsoCode
	city := record.City.Names["en"]

	if country == "" {
		country = "Unknown"
	}
	if city == "" {
		city = "Unknown"
	}

	return GeoIPData{CountryName: country, City: city}, nil
}

func fallbackGeoLookup(ip string) (GeoIPData, error) {
	url := fmt.Sprintf("http://ip-api.com/json/%s?fields=country,city,status,message", ip)
	resp, err := http.Get(url)
	if err != nil {
		return GeoIPData{}, fmt.Errorf("fallback lookup failed: %w", err)
	}
	defer resp.Body.Close()

	var data struct {
		Status  string `json:"status"`
		Country string `json:"country"`
		City    string `json:"city"`
		Message string `json:"message"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return GeoIPData{}, err
	}

	if data.Status != "success" {
		return GeoIPData{}, fmt.Errorf("fallback lookup error: %s", data.Message)
	}

	return GeoIPData{CountryName: data.Country, City: data.City}, nil
}

type UAParsedData struct {
	BrowserName    string
	BrowserVersion string
	OSName         string
	OSVersion      string
	DeviceType     string
}

func parseUserAgent(uaString string) UAParsedData {
	if uaString == "" {
		return UAParsedData{
			BrowserName:    "Unknown",
			BrowserVersion: "0.0",
			OSName:         "Unknown",
			OSVersion:      "0.0",
			DeviceType:     "unknown",
		}
	}

	ua := user_agent.New(uaString)
	name, version := ua.Browser()
	os := ua.OS()

	deviceType := "desktop"
	if ua.Mobile() {
		deviceType = "mobile"
	}

	return UAParsedData{
		BrowserName:    name,
		BrowserVersion: version,
		OSName:         os,
		OSVersion:      "Unknown",
		DeviceType:     deviceType,
	}
}

type AnalyticsEventRequest struct {
	Pathname string  `json:"pathname" validate:"required"`
	Referrer *string `json:"referrer,omitempty"`
	Hostname *string `json:"hostname,omitempty"`

	UTMSource   *string `json:"utm_source,omitempty"`
	UTMMedium   *string `json:"utm_medium,omitempty"`
	UTMCampaign *string `json:"utm_campaign,omitempty"`
	UTMTerm     *string `json:"utm_term,omitempty"`
	UTMContent  *string `json:"utm_content,omitempty"`

	EventType string         `json:"event_type" validate:"required"`
	EventName *string        `json:"event_name,omitempty"`
	EventData map[string]any `json:"event_data,omitempty"`

	Duration *int `json:"duration,omitempty"`
}

func LogAnalyticsEvent(c *fiber.Ctx) error {
	ctxVal := c.Locals("project_ctx")
	if ctxVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Unauthorized"})
	}
	projectCtx := ctxVal.(middleware.ProjectContext)

	var req AnalyticsEventRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid payload"})
	}

	if req.Pathname == "" || req.EventType == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Missing required fields"})
	}

	clientIP := c.IP()

	if clientIP == "" && c.Context().RemoteAddr() != nil {
		ipPort := c.Context().RemoteAddr().String()
		host, _, err := net.SplitHostPort(ipPort)
		if err == nil {
			clientIP = host
		}
	}

	if clientIP == "" {
		clientIP = "Unknown"
	}

	userAgent := c.Get(fiber.HeaderUserAgent)
	eventTime := time.Now().UTC()

	sessionID := uuid.New().String()
	anonVisitorID := utils.GenerateAnonVisitorID(clientIP, userAgent, eventTime)

	geoData, err := getGeoIPLookup(clientIP)
	if err != nil {
		geoData = GeoIPData{CountryName: "Unknown", City: "Unknown"}
	}

	uaData := parseUserAgent(userAgent)

	event := models.AnalyticsEvent{
		UUID:           uuid.New(),
		ProjectID:      uuid.MustParse(projectCtx.ProjectID),
		SessionID:      sessionID,
		VisitorID:      &anonVisitorID,
		Timestamp:      eventTime,
		Pathname:       req.Pathname,
		Referrer:       req.Referrer,
		Hostname:       req.Hostname,
		UTMSource:      req.UTMSource,
		UTMMedium:      req.UTMMedium,
		UTMCampaign:    req.UTMCampaign,
		UTMTerm:        req.UTMTerm,
		UTMContent:     req.UTMContent,
		EventType:      req.EventType,
		EventName:      req.EventName,
		EventData:      req.EventData,
		Country:        &geoData.CountryName,
		City:           &geoData.City,
		BrowserName:    &uaData.BrowserName,
		BrowserVersion: &uaData.BrowserVersion,
		OSName:         &uaData.OSName,
		OSVersion:      &uaData.OSVersion,
		DeviceType:     &uaData.DeviceType,
		UserAgent:      &userAgent,
		Duration:       req.Duration,
	}

	query := `
		INSERT INTO analytics_events (
			uuid, project_id, session_id, visitor_id, timestamp, pathname,
			referrer, hostname, utm_source, utm_medium, utm_campaign,
			utm_term, utm_content, event_type, event_name, event_data,
			country, city, browser_name, browser_version, os_name, os_version,
			device_type, user_agent, duration
		) VALUES (
			$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
			$17,$18,$19,$20,$21,$22,$23,$24,$25
		)
	`

	_, err = db.DB.Exec(query,
		event.UUID, event.ProjectID, event.SessionID, event.VisitorID, event.Timestamp,
		event.Pathname, event.Referrer, event.Hostname, event.UTMSource, event.UTMMedium,
		event.UTMCampaign, event.UTMTerm, event.UTMContent, event.EventType, event.EventName,
		utils.ToJSON(event.EventData), event.Country, event.City, event.BrowserName,
		event.BrowserVersion, event.OSName, event.OSVersion, event.DeviceType,
		event.UserAgent, event.Duration,
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to log event",
			"error":   err.Error(),
		})
	}

	cacheKey := fmt.Sprintf("events:%s:%s", projectCtx.ProjectID, time.Now().Format("2006-01"))
	_, _ = utils.IncrementCache("project_events", cacheKey, 30*24*time.Hour)

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Event logged",
	})
}
