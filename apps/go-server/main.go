package main

import (
	"log"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"

	"supametrics/db"
	"supametrics/handlers"
	"supametrics/middleware"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env files found")
	}

	if err := db.Connect(); err != nil {
		log.Fatalf("FATAL: Failed to initialize database connections: %v", err)
	}
	defer db.Close()

	geoDBPath := os.Getenv("IP2LOCATION_DB_PATH")
	if geoDBPath == "" {
		log.Println("WARNING: IP2LOCATION_DB_PATH not set. GeoIP lookups will use fallbacks.")
	} else {
		if err := handlers.InitGeoDB(geoDBPath); err != nil {
			log.Fatalf("FATAL: Failed to initialize MaxMind GeoIP database: %v", err)
		}
	}

	app := fiber.New(fiber.Config{
		ProxyHeader: fiber.HeaderXForwardedFor,
	})

	clientUrls := os.Getenv("APP_URL")

	// split comma-separated URLs into a slice
	allowedOrigins := strings.Split(clientUrls, ",")
	for i, origin := range allowedOrigins {
		allowedOrigins[i] = strings.TrimSuffix(strings.TrimSpace(origin), "/")
	}

	app.Use(cors.New(cors.Config{
		AllowOriginsFunc: func(origin string) bool {
			requestOrigin := strings.TrimSuffix(origin, "/")

			// If no env is set, allow all
			if len(allowedOrigins) == 0 || (len(allowedOrigins) == 1 && allowedOrigins[0] == "") {
				return true
			}

			for _, allowed := range allowedOrigins {
				if requestOrigin == allowed {
					return true
				}
			}
			return false
		},
		AllowHeaders: "Origin, Content-Type, Accept, Authorization, X-Private-Key, X-Forwarded-For, X-Public-Key",
		AllowMethods: "GET, POST, PUT, HEAD, OPTIONS",
	}))

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Hello Nerd! Visit supametrics.com, powered by Go - Fiber!",
		})
	})

	v1 := app.Group("/api/v1")

	v1.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "API is healthy",
		})
	})

	v1.Post("/analytics/log", middleware.VerifyPublicKey, handlers.LogAnalyticsEvent)

	v1.Get("/analytics/project", middleware.VerifyPrivateKey, handlers.GetAnalytics)
	v1.Get("/analytics/project/:eventName", middleware.VerifyPrivateKey, handlers.GetAnalytics)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3005"
	}

	log.Fatal(app.Listen(":" + port))
}
