package db

import (
	"context"
	"log"
	"os"

	"github.com/redis/go-redis/v9"
)

var Redis *redis.Client
var Ctx = context.Background()

func ConnectRedis() {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		log.Fatal("REDIS_URL not set in .env")
	}

	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Fatalf("Failed to parse Redis URL: %v", err)
	}

	Redis = redis.NewClient(opt)

	// test connection
	_, err = Redis.Ping(Ctx).Result()
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}

	log.Println("Connected to Redis")
}

func CloseRedis() {
	if Redis != nil {
		if err := Redis.Close(); err != nil {
			log.Printf("Error closing Redis connection: %v", err)
		}
	}
}
