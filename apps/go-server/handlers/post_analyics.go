package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net"
	"strings"
	"time"

	"supametrics/db"
	"supametrics/middleware"
	"supametrics/models"
	"supametrics/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/oschwald/geoip2-golang"
)

var GeoDB *geoip2.Reader

func InitGeoDB(dbPath string) error {
	var err error
	GeoDB, err = geoip2.Open(dbPath)
	if err != nil {
		return fmt.Errorf("failed to open MaxMind GeoLite2 DB at %s: %w", dbPath, err)
	}
	fmt.Printf("Successfully loaded MaxMind GeoLite2 database from %s\n", dbPath)
	return nil
}

type GeoIPData struct {
	CountryName string
	City        string
}

func getGeoIPLookup(ip string) (GeoIPData, error) {
	isLocalIP := ip == "" || ip == "unknown" || strings.HasPrefix(ip, "10.") || strings.HasPrefix(ip, "192.168.") || strings.HasPrefix(ip, "127.") || strings.HasPrefix(ip, "172.16.")

	if isLocalIP {
		return GeoIPData{
			CountryName: "Private IP",
			City:        "Private IP",
		}, nil
	}

	if GeoDB == nil {
		return GeoIPData{}, fmt.Errorf("GeoDB not initialized for public IP lookup")
	}

	record, err := GeoDB.City(net.ParseIP(ip))
	if err != nil {
		return GeoIPData{}, fmt.Errorf("MaxMind GeoLite2 lookup failed for %s: %w", ip, err)
	}

	country := record.Country.IsoCode
	city := record.City.Names["en"]

	if country == "" {
		country = "XX"
	}

	if city == "" {
		city = "Unknown"
	}

	if country == "XX" && city == "Unknown" {
		return GeoIPData{}, fmt.Errorf("Geolocation lookup for public IP %s failed to resolve to a known location", ip)
	}

	return GeoIPData{
		CountryName: country,
		City:        city,
	}, nil
}

type UAParsedData struct {
	BrowserName    string
	BrowserVersion string
	OSName         string
	OSVersion      string
	DeviceType     string
}

func mockParseUserAgent(userAgent string) UAParsedData {
	if strings.Contains(userAgent, "Chrome") && strings.Contains(userAgent, "Macintosh") {
		return UAParsedData{
			BrowserName:    "Chrome",
			BrowserVersion: "125.0.0",
			OSName:         "macOS",
			OSVersion:      "14.4",
			DeviceType:     "desktop",
		}
	}
	return UAParsedData{
		BrowserName:    "Unknown",
		BrowserVersion: "0.0",
		OSName:         "Unknown",
		OSVersion:      "0.0",
		DeviceType:     "unknown",
	}
}

func getOrCreateSessionID(c *fiber.Ctx) (string, error) {
	const cookieName = "supa_sid"
	const maxAge = 30 * time.Minute

	sessionID := c.Cookies(cookieName)

	if sessionID == "" {
		sessionID = uuid.New().String()
	}

	c.Cookie(&fiber.Cookie{
		Name:     cookieName,
		Value:    sessionID,
		Expires:  time.Now().Add(maxAge),
		HTTPOnly: true,
		Secure:   c.IsProxyTrusted(),
		SameSite: "Lax",
	})

	return sessionID, nil
}

func GenerateAnonVisitorID(ip, userAgent string, t time.Time) string {
	if ip == "" {
		ip = "unknown"
	} else {
		if strings.Contains(ip, ".") {
			parts := strings.Split(ip, ".")
			if len(parts) == 4 {
				ip = fmt.Sprintf("%s.%s.%s.0", parts[0], parts[1], parts[2])
			}
		} else if strings.Contains(ip, ":") {
			parts := strings.Split(ip, ":")
			if len(parts) > 2 {
				ip = strings.Join(parts[:2], ":") + "::"
			}
		}
	}

	if userAgent == "" {
		userAgent = "unknown"
	}

	date := t.Format("2006-01-02")
	base := fmt.Sprintf("%s|%s|%s", ip, userAgent, date)

	hash := sha256.Sum256([]byte(base))
	return hex.EncodeToString(hash[:])
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

	Country *string `json:"country,omitempty"`
	City    *string `json:"city,omitempty"`
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

	if req.Pathname == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Validation failed: pathname is required"})
	}
	if req.EventType == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Validation failed: event_type is required"})
	}

	clientIP := c.IP()
	userAgent := c.Get(fiber.HeaderUserAgent)
	eventTime := time.Now().UTC()

	sessionID, _ := getOrCreateSessionID(c)
	anonVisitorID := GenerateAnonVisitorID(clientIP, userAgent, eventTime)

	var country *string
	var city *string
	var placeholder string

	if req.Country != nil && req.City != nil {
		country = req.Country
		city = req.City
	} else {
		geoData, err := getGeoIPLookup(clientIP)

		if err != nil {
			// If GeoIP lookup fails for a public IP, log "Unknown Location"
			placeholder = "Unknown Location"
			country = &placeholder
			city = &placeholder
		} else if geoData.CountryName == "Private IP" {
			// If a private IP is detected, log "Private IP"
			country = &geoData.CountryName
			city = &geoData.City
		} else {
			// Successful public IP lookup
			country = &geoData.CountryName
			city = &geoData.City
		}
	}

	uaData := mockParseUserAgent(userAgent)
	browserName := &uaData.BrowserName
	browserVersion := &uaData.BrowserVersion
	osName := &uaData.OSName
	osVersion := &uaData.OSVersion
	deviceType := &uaData.DeviceType
	userAgentPtr := &userAgent

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
		Country:        country,
		City:           city,
		BrowserName:    browserName,
		BrowserVersion: browserVersion,
		OSName:         osName,
		OSVersion:      osVersion,
		DeviceType:     deviceType,
		UserAgent:      userAgentPtr,
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
			$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25
		)
	`
	_, err := db.DB.Exec(query,
		event.UUID, event.ProjectID, event.SessionID, event.VisitorID, event.Timestamp,
		event.Pathname, event.Referrer, event.Hostname, event.UTMSource, event.UTMMedium,
		event.UTMCampaign, event.UTMTerm, event.UTMContent, event.EventType, event.EventName,
		utils.ToJSON(event.EventData), event.Country, event.City, event.BrowserName, event.BrowserVersion,
		event.OSName, event.OSVersion, event.DeviceType, event.UserAgent, event.Duration,
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Failed to log event to database", "error": err.Error()})
	}

	monthKey := time.Now().Format("2006-01")
	cacheKey := "events:" + projectCtx.ProjectID + ":" + monthKey
	_, _ = utils.IncrementCache("project_events", cacheKey, 30*24*time.Hour)

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Event logged",
	})
}
