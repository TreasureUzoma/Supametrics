package utils

const (
	FreeQuota      = 15_000
	PaidQuota      = 1_000_000
	UnlimitedQuota = 0
)

func GetQuota(plan string) int {
	switch plan {
	case "paid":
		return PaidQuota
	case "enterprise":
		return UnlimitedQuota
	default:
		return FreeQuota
	}
}
