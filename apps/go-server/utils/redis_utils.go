package utils

import (
	"encoding/json"
	"fmt"
	"time"

	"supametrics/db"
	"github.com/redis/go-redis/v9"
)

var DefaultTTL = time.Hour * 1 // default cache expiry (1 hour)

// SetCache creates a cache entry with an id and object.
// You can pass a custom TTL; if not provided, DefaultTTL is used.
func SetCache(prefix, id string, data interface{}, ttl ...time.Duration) error {
	key := fmt.Sprintf("%s:%s", prefix, id)
	val, err := json.Marshal(data)
	if err != nil {
		return err
	}

	exp := DefaultTTL
	if len(ttl) > 0 {
		exp = ttl[0]
	}

	return db.Redis.Set(db.Ctx, key, val, exp).Err()
}

// GetCache retrieves cached data by id and unmarshals into `dest`
func GetCache(prefix, id string, dest interface{}) error {
	key := fmt.Sprintf("%s:%s", prefix, id)
	val, err := db.Redis.Get(db.Ctx, key).Result()
	if err == redis.Nil {
		return fmt.Errorf("cache miss for key %s", key)
	}
	if err != nil {
		return err
	}

	return json.Unmarshal([]byte(val), dest)
}

// UpdateCache replaces an existing cache entry
func UpdateCache(prefix, id string, data interface{}, ttl ...time.Duration) error {
	// Just call SetCache (overwrite behavior)
	return SetCache(prefix, id, data, ttl...)
}

// DeleteCache removes cached entry by id
func DeleteCache(prefix, id string) error {
	key := fmt.Sprintf("%s:%s", prefix, id)
	return db.Redis.Del(db.Ctx, key).Err()
}

// ExistsCache checks if a cache entry exists for the id
func ExistsCache(prefix, id string) (bool, error) {
	key := fmt.Sprintf("%s:%s", prefix, id)
	count, err := db.Redis.Exists(db.Ctx, key).Result()
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// IncrementCache increments a key in Redis with TTL
func IncrementCache(namespace, key string, ttl time.Duration) (int, error) {
	fullKey := namespace + ":" + key
	count, err := redisClient.Incr(ctx, fullKey).Result()
	if err != nil {
		return 0, err
	}
	redisClient.Expire(ctx, fullKey, ttl)
	return int(count), nil
}