package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func ConnectPg() error {
	connStr := os.Getenv("DB_URL")
	if connStr == "" {
		return fmt.Errorf("DB_URL not set in .env")
	}

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return err
	}

	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxIdleTime(5 * time.Minute)

	if err := db.Ping(); err != nil {
		db.Close()
		return err
	}

	DB = db
	log.Println("Connected to Neon DB with pooling enabled")
	return nil
}

func ClosePg() {
	if DB != nil {
		if err := DB.Close(); err != nil {
			log.Printf("Error closing PostgreSQL connection: %v", err)
		}
	}
}

func Connect() error {
	if err := ConnectPg(); err != nil {
		return err
	}
	ConnectRedis()
	return nil
}

func Close() {
	ClosePg()
	CloseRedis()
}
