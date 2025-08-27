package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"

	"supametrics/handlers"
	"supametrics/middleware"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env files found")
	}

	app := fiber.New()

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

	app.Listen(":3005")
}
