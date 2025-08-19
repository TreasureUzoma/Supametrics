package utils

import (
	"errors"
	"regexp"
)

var (
	// public keys look like: supm_<32 hex chars>
	publicKeyRegex = regexp.MustCompile(`^supm_[a-f0-9]{32}$`)

	// secret keys look like: sk_<64 hex chars>
	secretKeyRegex = regexp.MustCompile(`^sk_[a-f0-9]{64}$`)
)

// ValidatePublicKeyFormat only checks if the key has the right format.
func ValidatePublicKeyFormat(publicKey string) error {
	if publicKey == "" {
		return errors.New("missing public key")
	}

	if !publicKeyRegex.MatchString(publicKey) {
		return errors.New("invalid public key format")
	}

	return nil
}

// ValidateSecretKeyFormat only checks if the key has the right format.
func ValidateSecretKeyFormat(secretKey string) error {
	if secretKey == "" {
		return errors.New("missing secret key")
	}

	if !secretKeyRegex.MatchString(secretKey) {
		return errors.New("invalid secret key format")
	}

	return nil
}
