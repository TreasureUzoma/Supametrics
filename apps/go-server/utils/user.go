package utils

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

func GetRealClientIP(c *fiber.Ctx) string {
	if ip := c.Get("CF-Connecting-IP"); ip != "" {
		return ip
	}
	if ip := c.Get("X-Forwarded-For"); ip != "" {
		return strings.Split(ip, ",")[0]
	}
	if ip := c.Get("X-Real-IP"); ip != "" {
		return ip
	}
	return c.IP()
}

// GenerateAnonVisitorID creates a privacy-friendly, daily-reset visitor hash.
// It uses IP (truncated), User-Agent, and current date.
// This is similar to how Plausible/Simple Analytics work.
func GenerateAnonVisitorID(ip, userAgent string, t time.Time) string {
	// Anonymize IP: remove last octet for IPv4, shorten IPv6
	if ip == "" {
		ip = "unknown"
	} else {
		if strings.Contains(ip, ".") { // IPv4
			parts := strings.Split(ip, ".")
			if len(parts) == 4 {
				ip = fmt.Sprintf("%s.%s.%s.0", parts[0], parts[1], parts[2])
			}
		} else if strings.Contains(ip, ":") { // IPv6 (shorten)
			parts := strings.Split(ip, ":")
			if len(parts) > 2 {
				ip = strings.Join(parts[:2], ":") + "::"
			}
		}
	}

	if userAgent == "" {
		userAgent = "unknown"
	}

	// Only date matters (rotates daily)
	date := t.Format("2006-01-02")

	// Build fingerprint base
	base := fmt.Sprintf("%s|%s|%s", ip, userAgent, date)

	hash := sha256.Sum256([]byte(base))
	return hex.EncodeToString(hash[:])
}

// GetUserHash generates a stable hash for IP+UA (used for rate limiting, not analytics).
func GetUserHash(ip, userAgent string) string {
	if ip == "" {
		ip = "unknown"
	}
	if userAgent == "" {
		userAgent = "unknown"
	}

	base := fmt.Sprintf("%s|%s", ip, userAgent)
	hash := sha256.Sum256([]byte(base))
	return hex.EncodeToString(hash[:])[:16] // shorter for Redis keys
}
