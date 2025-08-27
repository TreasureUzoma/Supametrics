package utils

import (
	"encoding/json"
	"log"
)

func ToJSON(v interface{}) string {
	if v == nil {
		return "null"
	}

	bytes, err := json.Marshal(v)
	if err != nil {
		log.Println("ToJSON error:", err)
		return "null"
	}
	return string(bytes)
}
