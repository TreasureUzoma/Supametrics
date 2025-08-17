package roadmap

// Supametrics Worker Roadmap – Go Fiber
//
// Scope:
// - Analytics & background jobs service
// - Runs on Go Fiber for API endpoints
// - Cron jobs for scheduled tasks
// - API key scoped analytics
// - Secret key access for secure analytics retrieval
// - Redis for caching + job queue
// - Neon PostgreSQL for persistent storage

// TODO: Build a fancy api to show progress perc.


var Roadmap = map[string]any{
	"phases": []map[string]any{
		{
			"phase": "Phase 1: Core Setup",
			"tasks": []string{
				"Set up Go Fiber project structure",
				"Connect to Neon PostgreSQL",
				"Connect to Redis for caching + rate limits",
				"Env config for DB_URL, REDIS_URL",
				"Middleware: request logging, recovery, CORS",
			},
		},
		{
			"phase": "Phase 2: API Key Based Analytics",
			"tasks": []string{
				"API key authentication middleware (per project)",
				"Store incoming analytics events in Postgres",
				"Support batched event ingestion",
				"Cache hot analytics data in Redis",
				"Ensure events are scoped to API key owner",
			},
		},
		{
			"phase": "Phase 3: Analytics & Reports Writing & Retrievals",
			"tasks": []string{
				"Endpoint: POST /analytics (requires API key)",
				"Endpoint: GET /analytics/:id (requires API key)",
				"Endpoint: GET /reports:id (requires API key)",
				"Endpoint: GET /analytics/:id/:eventName (requires API key)",
				"Secret key based endpoint for owner-level access",
				"Pagination for large result sets",
				"Basic aggregation (count, sum, unique)",
			},
		},
		{
			"phase": "Phase 4: Cron Jobs & Workers",
			"tasks": []string{
				"Set up cron scheduler (e.g. robfig/cron)",
				"Rollups of analytics into summary tables",
				"Delete/Archive old raw events beyond retention",
				"Recalculate cached aggregates",
				"Send daily/weekly analytics emails",
				"Create daily/weekly analytics reports",
			},
		},
		{
			"phase": "Phase 5: Scaling & Optimization",
			"tasks": []string{
				"Async ingestion via Redis queue",
				"Bulk inserts to Postgres for high traffic",
				"Partition analytics tables for performance",
				"Introduce sharding if needed",
			},
		},
	},

	"middleware": []string{
		"apiKeyAuthMiddleware - Verifies API key for public analytics ingestion",
		"secretKeyAuthMiddleware - Verifies secret key for owner analytics retrieval",
		"rateLimitMiddleware - Prevents abuse",
	},

	"database": map[string]any{
		"primary": "Neon serverless PostgreSQL",
		"tables": []string{
			"analytics_events",
			"analytics_summary",
			"projects",
			"project_api_keys",
		},
		"cache": "Redis (hot analytics, queues, rate limiting)",
	},

	"testing": map[string][]string{
		"ingestion": {"valid API key", "invalid API key", "batch ingestion"},
		"retrieval": {"owner secret key access", "pagination", "aggregation"},
		"cron":      {"rollup runs daily", "old events archived"},
	},
}
