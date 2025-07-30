package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

// Database connection instance
// var db *sql.DB - Commented out to avoid duplicate declaration

// InitDBMain initializes the database connection for main.go
func InitDBMain() (*sql.DB, error) {
	// Get database connection details from environment variables
	host := getEnvMain("DB_HOST", "localhost")
	port := getEnvMain("DB_PORT", "5432")
	user := getEnvMain("DB_USER", "postgres")
	password := getEnvMain("DB_PASSWORD", "postgres")
	dbname := getEnvMain("DB_NAME", "urgent_studio")
	sslmode := getEnvMain("DB_SSLMODE", "disable")

	// Create connection string
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode)

	// Open database connection
	dbConn, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database connection: %v", err)
	}

	// Set connection pool settings
	dbConn.SetMaxOpenConns(25)
	dbConn.SetMaxIdleConns(5)
	dbConn.SetConnMaxLifetime(5 * time.Minute)

	// Test the connection
	err = dbConn.Ping()
	if err != nil {
		return nil, fmt.Errorf("failed to ping database: %v", err)
	}

	log.Println("Successfully connected to the database")
	return dbConn, nil
}

// getEnvMain gets an environment variable or returns a default value for main.go
func getEnvMain(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// CloseDBMain closes the database connection for main.go
func CloseDBMain(dbConn *sql.DB) {
	if dbConn != nil {
		if err := dbConn.Close(); err != nil {
			log.Printf("Error closing database connection: %v", err)
		} else {
			log.Println("Database connection closed")
		}
	}
}