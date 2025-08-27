package handlers

import (
	"log"
	"time"

	"supametrics/db"
	"supametrics/middleware"
	"supametrics/models"
	"supametrics/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type AnalyticsEventRequest struct {
	SessionID      string                 `json:"session_id" validate:"required"`
	VisitorID      *string                `json:"visitor_id,omitempty"`
	Pathname       string                 `json:"pathname" validate:"required"`
	Referrer       *string                `json:"referrer,omitempty"`
	Hostname       *string                `json:"hostname,omitempty"`
	UTMSource      *string                `json:"utm_source,omitempty"`
	UTMMedium      *string                `json:"utm_medium,omitempty"`
	UTMCampaign    *string                `json:"utm_campaign,omitempty"`
	UTMTerm        *string                `json:"utm_term,omitempty"`
	UTMContent     *string                `json:"utm_content,omitempty"`
	EventType      string                 `json:"event_type" validate:"required"`
	EventName      *string                `json:"event_name,omitempty"`
	EventData      map[string]any         `json:"event_data,omitempty"`
	BrowserName    *string                `json:"browser_name,omitempty"`
	BrowserVersion *string                `json:"browser_version,omitempty"`
	OSName         *string                `json:"os_name,omitempty"`
	OSVersion      *string                `json:"os_version,omitempty"`
	DeviceType     *string                `json:"device_type,omitempty"`
	UserAgent      *string                `json:"user_agent,omitempty"`
	Duration       *int                   `json:"duration,omitempty"`
	Timestamp      *time.Time             `json:"timestamp,omitempty"`
}

func LogAnalyticsEvent(c *fiber.Ctx) error {
	// project context from middleware
	ctxVal := c.Locals("project_ctx")
	if ctxVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Unauthorized",
		})
	}
	projectCtx := ctxVal.(middleware.ProjectContext)

	// parse request body
	var req AnalyticsEventRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid payload",
		})
	}

	// default timestamp
	eventTime := time.Now().UTC()
	if req.Timestamp != nil {
		eventTime = *req.Timestamp
	}

	// create the model object
	event := models.AnalyticsEvent{
		UUID:           uuid.New(),
		ProjectID:      uuid.MustParse(projectCtx.ProjectID),
		SessionID:      req.SessionID,
		VisitorID:      req.VisitorID,
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
		BrowserName:    req.BrowserName,
		BrowserVersion: req.BrowserVersion,
		OSName:         req.OSName,
		OSVersion:      req.OSVersion,
		DeviceType:     req.DeviceType,
		UserAgent:      req.UserAgent,
		Duration:       req.Duration,
	}

	// insert into DB
	query := `
		INSERT INTO analytics_events (
			uuid, project_id, session_id, visitor_id, timestamp, pathname,
			referrer, hostname, utm_source, utm_medium, utm_campaign,
			utm_term, utm_content, event_type, event_name, event_data,
			browser_name, browser_version, os_name, os_version,
			device_type, user_agent, duration
		) VALUES (
			$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23
		)
	`
	_, err := db.DB.Exec(query,
		event.UUID, event.ProjectID, event.SessionID, event.VisitorID, event.Timestamp,
		event.Pathname, event.Referrer, event.Hostname, event.UTMSource, event.UTMMedium,
		event.UTMCampaign, event.UTMTerm, event.UTMContent, event.EventType, event.EventName,
		utils.ToJSON(event.EventData), event.BrowserName, event.BrowserVersion,
		event.OSName, event.OSVersion, event.DeviceType, event.UserAgent, event.Duration,
	)
	if err != nil {
		log.Println("insert event error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to log event",
		})
	}

	// increment monthly project counter in Redis
	monthKey := time.Now().Format("2006-01")
	cacheKey := "events:" + projectCtx.ProjectID + ":" + monthKey
	_, _ = utils.IncrementCache("project_events", cacheKey, 30*24*time.Hour)

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Event logged",
	})
}
