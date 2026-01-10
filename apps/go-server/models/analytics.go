package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// AnalyticsEvent represents a record from analytics_events table
type AnalyticsEvent struct {
	ID             int            `json:"id" db:"id"`
	UUID           uuid.UUID      `json:"uuid" db:"uuid"`
	ProjectID      uuid.UUID      `json:"project_id" db:"project_id"`
	SessionID      string         `json:"session_id" db:"session_id"`
	VisitorID      *string        `json:"visitor_id,omitempty" db:"visitor_id"`
	Timestamp      time.Time      `json:"timestamp" db:"timestamp"`
	Pathname       string         `json:"pathname" db:"pathname"`
	Referrer       *string        `json:"referrer,omitempty" db:"referrer"`
	Hostname       *string        `json:"hostname,omitempty" db:"hostname"`
	UTMSource      *string        `json:"utm_source,omitempty" db:"utm_source"`
	UTMMedium      *string        `json:"utm_medium,omitempty" db:"utm_medium"`
	UTMCampaign    *string        `json:"utm_campaign,omitempty" db:"utm_campaign"`
	UTMTerm        *string        `json:"utm_term,omitempty" db:"utm_term"`
	UTMContent     *string        `json:"utm_content,omitempty" db:"utm_content"`
	Country        *string        `json:"country" db:"country"`
	City           *string        `json:"city" db:"city"`
	EventType      string         `json:"event_type" db:"event_type"`
	EventName      *string        `json:"event_name,omitempty" db:"event_name"`
	EventData      map[string]any `json:"event_data,omitempty" db:"event_data"`
	BrowserName    *string        `json:"browser_name,omitempty" db:"browser_name"`
	BrowserVersion *string        `json:"browser_version,omitempty" db:"browser_version"`
	OSName         *string        `json:"os_name,omitempty" db:"os_name"`
	OSVersion      *string        `json:"os_version,omitempty" db:"os_version"`
	DeviceType     *string        `json:"device_type,omitempty" db:"device_type"`
	UserAgent      *string        `json:"user_agent,omitempty" db:"user_agent"`
	Duration       *int           `json:"duration,omitempty" db:"duration"`
}

type AnalyticsEventRequest struct {
	Pathname string  `json:"pathname" validate:"required"`
	Referrer *string `json:"referrer,omitempty"`
	Hostname *string `json:"hostname,omitempty"`
	SessionID *string `json:"session_id,omitempty"`

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

// UnmarshalJSON implements custom unmarshaling to support both snake_case and camelCase
func (r *AnalyticsEventRequest) UnmarshalJSON(data []byte) error {
	type Alias AnalyticsEventRequest
	aux := struct {
		EventTypeAlt string         `json:"eventType"`
		EventNameAlt *string        `json:"eventName"`
		EventDataAlt map[string]any `json:"eventData"`
		SessionIDAlt *string        `json:"sessionId"`
		*Alias
	}{
		Alias: (*Alias)(r),
	}

	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}

	// Fallback to camelCase if snake_case is missing
	if r.EventType == "" && aux.EventTypeAlt != "" {
		r.EventType = aux.EventTypeAlt
	}
	if (r.EventName == nil || *r.EventName == "") && aux.EventNameAlt != nil {
		r.EventName = aux.EventNameAlt
	}
	if r.EventData == nil && aux.EventDataAlt != nil {
		r.EventData = aux.EventDataAlt
	}
	if (r.SessionID == nil || *r.SessionID == "") && aux.SessionIDAlt != nil {
		r.SessionID = aux.SessionIDAlt
	}

	return nil
}
