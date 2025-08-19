package utils

import (
	"fmt"
	"time"

	"supametrics/db"
)

// AllowRequest increments a counter for a fingerprint and checks against a limit.
// Returns true if request is allowed, false if rate-limited.
func AllowRequest(fingerprint string, limit int, window time.Duration) (bool, error) {
	key := fmt.Sprintf("rate:%s", fingerprint)

	// increment counter
	count, err := db.Redis.Incr(db.Ctx, key).Result()
	if err != nil {
		return false, err
	}

	// set TTL if first request
	if count == 1 {
		_ = db.Redis.Expire(db.Ctx, key, window).Err()
	}

	return int(count) <= limit, nil
}
