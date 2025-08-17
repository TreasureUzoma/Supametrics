package models

import (
	"time"

	"github.com/google/uuid"
)

// Report represents a record from reports table
type Report struct {
	ID          int            `json:"id" db:"id"`
	UUID        uuid.UUID      `json:"uuid" db:"uuid"`
	ProjectID   uuid.UUID      `json:"project_id" db:"project_id"`
	Name        string         `json:"name" db:"name"`
	Description *string        `json:"description,omitempty" db:"description"`
	Type        string         `json:"type" db:"type"`
	Data        map[string]any `json:"data" db:"data"`
	CreatedBy   uuid.UUID      `json:"created_by" db:"created_by"`
	CreatedAt   time.Time      `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at" db:"updated_at"`
}
