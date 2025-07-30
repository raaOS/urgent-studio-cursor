# Makefile for Urgent Studio Backend

.PHONY: run build clean test

# Default target
all: run

# Run the server
run:
	go run simple_server.go

# Build the server
build:
	go build -o server simple_server.go

# Clean build artifacts
clean:
	rm -f server

# Run tests
test:
	go test -v ./...

# Install dependencies
deps:
	go mod tidy

# Create database (requires PostgreSQL)
db-create:
	psql -U postgres -c "CREATE DATABASE urgent_studio;"

# Drop database (requires PostgreSQL)
db-drop:
	psql -U postgres -c "DROP DATABASE IF EXISTS urgent_studio;"

# Run database migrations
db-migrate:
	cd migrations && ./run_migrations.sh

# Reset database (drop, create, and migrate)
db-reset: db-drop db-create db-migrate