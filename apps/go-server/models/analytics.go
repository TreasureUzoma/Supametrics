package models

import (
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