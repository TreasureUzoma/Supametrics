package db

import (
	"database/sql"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func ConnectPg() {
	connStr := os.Getenv("DB_URL")
	if connStr == "" {
		log.Fatal("DB_URL not set in .env")
	}

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Failed to open DB:", err)
	}

	// pool tuning
	db.SetMaxOpenConns(10)               // cap concurrent connections
	db.SetMaxIdleConns(5)                // keep a few idle conns warm
	db.SetConnMaxIdleTime(5 * time.Minute) // recycle idle connections

	if err := db.Ping(); err != nil {
		log.Fatal("Failed to ping DB:", err)
	}

	DB = db
	log.Println("Connected to Neon DB with pooling enabled")
}
