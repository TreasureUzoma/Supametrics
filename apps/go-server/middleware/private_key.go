package middleware

import (
	"database/sql"
	"fmt"
	"log"
	"supametrics/db"
	"supametrics/utils"
	"time"

	"github.com/gofiber/fiber/v2"
)

func VerifyPrivateKey(c *fiber.Ctx) error {
	privateKey := c.Get("X-Private-Key")

	if err := utils.ValidateSecretKeyFormat(privateKey); err != nil {
		log.Println("api key format validation failed:", err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Invalid API key",
		})
	}

	ip := c.Locals("clientIP").(string)

	userAgent := c.Get("User-Agent")
	userHash := utils.GetUserHash(ip, userAgent)

	globalKey := fmt.Sprintf("ratelimit:global:%s", userHash)
	reqCount, _ := utils.IncrementCache("ratelimit", globalKey, time.Minute)
	if reqCount > 200 {
		return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
			"message": "Global rate limit exceeded",
		})
	}

	query := `
		SELECT 
			p.uuid AS project_id,
			p.team_id,
			CASE
				WHEN p.team_id IS NOT NULL THEN tu.uuid
				ELSE u.uuid
			END AS user_id,
			CASE
				WHEN p.team_id IS NOT NULL THEN tu.subscription_type
				ELSE u.subscription_type
			END AS subscription_type,
			CASE
				WHEN p.team_id IS NOT NULL THEN tu.status
				ELSE u.status
			END AS user_status,
			CASE
				WHEN p.team_id IS NOT NULL THEN tu.role
				ELSE u.role
			END AS user_role
		FROM project_api_keys pak
		JOIN projects p ON pak.project_id = p.uuid
		LEFT JOIN teams t ON p.team_id = t.uuid
		LEFT JOIN "user" tu ON t.owner_id = tu.uuid 
		JOIN "user" u ON p.user_id = u.uuid
		WHERE pak.secret_key = $1
		  AND pak.revoked = false
		LIMIT 1;
	`

	var ctx ProjectContext
	var teamID sql.NullString

	err := db.DB.QueryRow(query, privateKey).Scan(
		&ctx.ProjectID,
		&teamID,
		&ctx.UserID,
		&ctx.SubscriptionType,
		&ctx.UserStatus,
		&ctx.UserRole,
	)

	if teamID.Valid {
		ctx.TeamID = teamID.String
	}

	if err == sql.ErrNoRows {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "API key not found or revoked",
		})
	}
	if err != nil {
		log.Println("db error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Database error",
		})
	}

	rateScopeID := ctx.ProjectID
	if ctx.TeamID != "" {
		rateScopeID = ctx.TeamID
	}

	projectRateKey := fmt.Sprintf("ratelimit:project:%s:%s", rateScopeID, userHash)
	projectReqCount, _ := utils.IncrementCache("ratelimit", projectRateKey, time.Minute)

	projectLimit := utils.GetQuota(ctx.SubscriptionType)

	if projectReqCount > projectLimit {
		return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
			"message": "Project rate limit exceeded for your plan",
		})
	}

	now := time.Now()
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)

	cacheKey := fmt.Sprintf("events:%s:%s", ctx.ProjectID, startOfMonth.Format("2006-01"))
	var cachedCount int
	if err := utils.GetCache("project_events", cacheKey, &cachedCount); err == nil {
		ctx.TotalEvents = cachedCount
	} else {
		countQuery := `
			SELECT COUNT(*) 
			FROM analytics_events
			FROM analytics_events
			WHERE project_id = $1
			  AND timestamp >= $2;
		`
		err = db.DB.QueryRow(countQuery, ctx.ProjectID, startOfMonth).Scan(&ctx.TotalEvents)
		if err != nil {
			log.Println("db count error:", err)
			ctx.TotalEvents = 0
		}
		_ = utils.SetCache("project_events", cacheKey, ctx.TotalEvents, time.Minute)
	}

	quota := utils.GetQuota(ctx.SubscriptionType)

	if quota > 0 && ctx.TotalEvents > quota {
		return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
			"message": "Monthly event quota exceeded for this project",
		})
	}

	c.Locals("project_ctx", ctx)

	return c.Next()
}
