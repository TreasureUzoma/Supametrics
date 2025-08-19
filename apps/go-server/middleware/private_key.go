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

	// validate format only (no DB check yet)
	if err := utils.ValidateSecretKeyFormat(privateKey); err != nil {
		log.Println("api key format validation failed:", err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Invalid API key",
		})
	}

	// --- Global rate limiting (defense against bots / key scanners) ---
	ip := c.Get("X-Forwarded-For")
	if ip == "" {
		ip = c.IP()
	}
	userAgent := c.Get("User-Agent")
	userHash := utils.GetUserHash(ip, userAgent)

	globalKey := fmt.Sprintf("ratelimit:global:%s", userHash)
	reqCount, _ := utils.IncrementCache("ratelimit", globalKey, time.Minute)
	if reqCount > 200 { // 200 req/min/IP
		return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
			"message": "Global rate limit exceeded",
		})
	}

	// fetch project + user info from DB
	query := `
		SELECT 
			p.uuid AS project_id,
			u.uuid AS user_id,
			u.subscription_type,
			u.status,
			u.role
		FROM project_api_keys pak
		JOIN projects p ON pak.project_id = p.uuid
		JOIN "user" u ON p.user_id = u.uuid
		WHERE pak.secret_key = $1
		  AND pak.revoked = false
		LIMIT 1;
	`

	var ctx ProjectContext
	err := db.DB.QueryRow(query, privateKey).Scan(
		&ctx.ProjectID,
		&ctx.UserID,
		&ctx.SubscriptionType,
		&ctx.UserStatus,
		&ctx.UserRole,
	)
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

	// --- Project-specific rate limiting ---
	projectRateKey := fmt.Sprintf("ratelimit:project:%s:%s", ctx.ProjectID, userHash)
	projectReqCount, _ := utils.IncrementCache("ratelimit", projectRateKey, time.Minute)

	// dynamic per-plan limits
	var projectLimit int
	switch ctx.SubscriptionType {
	case "free":
		projectLimit = 2000
	case "pro":
		projectLimit = 20000
	case "enterprise":
		projectLimit = 100000
	default:
		projectLimit = 2000
	}

	if projectReqCount > projectLimit {
		return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
			"message": "Project rate limit exceeded for your plan",
		})
	}

	// --- Event count quota check ---
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

	// enforce quota by subscription
	var quota int
	switch ctx.SubscriptionType {
	case "free":
		quota = 15000
	case "pro":
		quota = 150000
	case "enterprise":
		quota = -1 // unlimited
	default:
		quota = 15000
	}

	if quota > 0 && ctx.TotalEvents > quota {
		return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
			"message": "Monthly event quota exceeded for this project",
		})
	}

	// attach to context for later handlers
	c.Locals("project_ctx", ctx)

	return c.Next()
}
