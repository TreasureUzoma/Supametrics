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

type ProjectContext struct {
	ProjectID        string `json:"project_id"`
	UserID           string `json:"user_id"`
	SubscriptionType string `json:"subscription_type"`
	UserStatus       string `json:"status"`
	UserRole         string `json:"role"`
	TotalEvents      int    `json:"total_events"`
}

func VerifyPublicKey(c *fiber.Ctx) error {
	publicKey := c.Get("X-Public-Key")

	// identify client (IP + User-Agent)
	ip := c.Get("X-Forwarded-For")
	if ip == "" {
		ip = c.IP()
	}
	userAgent := c.Get("User-Agent")
	userHash := utils.GetUserHash(ip, userAgent)

	if err := utils.ValidatePublicKeyFormat(publicKey); err != nil {
		// track invalid attempts per client
		invalidKey := fmt.Sprintf("invalidkey:%s", userHash)
		failCount, _ := utils.IncrementCache("security", invalidKey, 5*time.Minute)

		if failCount > 10 {
			// block this client temporarily
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"message": "Too many invalid API key attempts, try again later",
			})
		}

		log.Println("api key format validation failed:", err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Invalid API key",
		})
	}

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
		WHERE pak.public_key = $1
		  AND pak.revoked = false
		LIMIT 1;
	`

	var ctx ProjectContext
	err := db.DB.QueryRow(query, publicKey).Scan(
		&ctx.ProjectID,
		&ctx.UserID,
		&ctx.SubscriptionType,
		&ctx.UserStatus,
		&ctx.UserRole,
	)
	if err == sql.ErrNoRows {
		// count as invalid attempt
		invalidKey := fmt.Sprintf("invalidkey:%s", userHash)
		_, _ = utils.IncrementCache("security", invalidKey, 5*time.Minute)

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

	// limits depend on plan
	limit := 200 // free plan default (200 req/min per project)
	if ctx.SubscriptionType == "pro" {
		limit = 2000 // pro projects get higher rate
	} else if ctx.SubscriptionType == "enterprise" {
		limit = 0 // unlimited
	}

	if limit > 0 {
		rateKey := fmt.Sprintf("ratelimit:%s", ctx.ProjectID)
		reqCount, _ := utils.IncrementCache("ratelimit", rateKey, time.Minute)
		if reqCount > limit {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"message": "Rate limit exceeded for this project",
			})
		}
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

	quota := 15000 // free plan
	if ctx.SubscriptionType == "pro" {
		quota = 1000000
	} else if ctx.SubscriptionType == "enterprise" {
		quota = 0 // unlimited
	}

	if quota > 0 && ctx.TotalEvents > quota {
		return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
			"message": "Event quota exceeded for this project",
		})
	}

	// attach context for later handlers
	c.Locals("project_ctx", ctx)
	return c.Next()
}
