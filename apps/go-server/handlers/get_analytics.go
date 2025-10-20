package handlers

import (
	"database/sql"
	"fmt"
	"log"
	"supametrics/db"
	"supametrics/middleware"
	"time"

	"github.com/gofiber/fiber/v2"
)

var allowedFilters = []string{
	"today",
	"yesterday",
	"thisweek",
	"thismonth",
	"thisyear",
}

func getTimeRange(filter string) (time.Time, time.Time, string) {
	now := time.Now().UTC()
	var startTime, endTime time.Time
	var bucketFormat string

	startOfDay := func(t time.Time) time.Time {
		return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.UTC)
	}
	endOfDay := func(t time.Time) time.Time {
		return time.Date(t.Year(), t.Month(), t.Day(), 23, 59, 59, 999000000, time.UTC)
	}

	switch filter {
	case "today":
		startTime = startOfDay(now)
		endTime = endOfDay(now)
		bucketFormat = "hour"
	case "yesterday":
		y := now.AddDate(0, 0, -1)
		startTime = startOfDay(y)
		endTime = endOfDay(y)
		bucketFormat = "hour"
	case "thisweek":
		// Assumes Monday start (common in analytics)
		weekday := now.Weekday()
		daysToMonday := int(weekday - time.Monday)
		if daysToMonday < 0 {
			daysToMonday += 7
		}
		startTime = startOfDay(now.AddDate(0, 0, -daysToMonday))
		endTime = endOfDay(now.AddDate(0, 0, 6-daysToMonday))
		bucketFormat = "day"
	case "thismonth":
		startTime = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
		endTime = endOfMonth(now)
		bucketFormat = "day"
	case "thisyear":
		startTime = time.Date(now.Year(), time.January, 1, 0, 0, 0, 0, time.UTC)
		endTime = endOfYear(now)
		bucketFormat = "month"
	default: // Fallback to today
		return getTimeRange("today")
	}
	return startTime, endTime, bucketFormat
}

func endOfMonth(t time.Time) time.Time {
	y, m, _ := t.Date()
	return time.Date(y, m+1, 0, 23, 59, 59, 999000000, time.UTC)
}

func endOfYear(t time.Time) time.Time {
	return time.Date(t.Year(), time.December, 31, 23, 59, 59, 999000000, time.UTC)
}

type AnalyticsSummary struct {
	TotalVisits    int `json:"totalVisits"`
	UniqueVisitors int `json:"uniqueVisitors"`
}

type FrequencyData struct {
	Time           time.Time `json:"time"`
	TotalVisits    int       `json:"totalVisits"`
	UniqueVisitors int       `json:"uniqueVisitors"`
}

func GetAnalytics(c *fiber.Ctx) error {
	ctx, ok := c.Locals("project_ctx").(middleware.ProjectContext)
	if !ok {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Project context missing"})
	}

	projectID := ctx.ProjectID
	filter := c.Query("filter", "today")
	eventName := c.Query("eventName")

	// Validate filter
	isValidFilter := false
	for _, f := range allowedFilters {
		if f == filter {
			isValidFilter = true
			break
		}
	}
	if !isValidFilter {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid filter provided",
		})
	}

	startTime, endTime, bucketFormat := getTimeRange(filter)

	// Build the base WHERE clause
	whereClause := "project_id = $1 AND timestamp >= $2 AND timestamp <= $3"
	queryArgs := []interface{}{projectID, startTime, endTime}

	if eventName != "" {
		whereClause += " AND event_name = $4"
		queryArgs = append(queryArgs, eventName)
	}

	// 2. Fetch Aggregations (Total Visits and Unique Visitors)
	summaryQuery := fmt.Sprintf(`
		SELECT 
			COUNT(*), 
			COUNT(DISTINCT visitor_id) 
		FROM analytics_events 
		WHERE %s;
	`, whereClause)

	var summary AnalyticsSummary
	err := db.DB.QueryRow(summaryQuery, queryArgs...).Scan(&summary.TotalVisits, &summary.UniqueVisitors)
	if err != nil && err != sql.ErrNoRows {
		log.Println("Analytics summary query error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Database error fetching summary"})
	}

	// 3. Fetch Time-Series Frequency Data (Frequency)
	frequencyQuery := fmt.Sprintf(`
		SELECT 
			date_trunc('%s', timestamp) AS time_bucket,
			COUNT(*) AS total_visits, 
			COUNT(DISTINCT visitor_id) AS unique_visitors 
		FROM analytics_events 
		WHERE %s 
		GROUP BY time_bucket 
		ORDER BY time_bucket;
	`, bucketFormat, whereClause)

	rows, err := db.DB.Query(frequencyQuery, queryArgs...)
	if err != nil {
		log.Println("Analytics frequency query error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Database error fetching frequency"})
	}
	defer rows.Close()

	var frequencyData []FrequencyData
	for rows.Next() {
		var fd FrequencyData
		if err := rows.Scan(&fd.Time, &fd.TotalVisits, &fd.UniqueVisitors); err != nil {
			log.Println("Error scanning frequency row:", err)
			continue
		}
		frequencyData = append(frequencyData, fd)
	}

	// 4. Return the consolidated response
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Analytics fetched successfully",
		"data": fiber.Map{
			"projectId":      projectID,
			"filter":         filter,
			"eventName":      eventName,
			"totalVisits":    summary.TotalVisits,
			"uniqueVisitors": summary.UniqueVisitors,
			"frequency":      frequencyData,
		},
	})
}
