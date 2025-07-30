#!/bin/bash

# Database connection parameters
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}
DB_NAME=${DB_NAME:-urgent_studio}

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "Error: PostgreSQL client (psql) is not installed."
    exit 1
fi

# Function to run SQL file
run_sql_file() {
    local file=$1
    echo "Running migration: $file"
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$file"
    if [ $? -ne 0 ]; then
        echo "Error running migration: $file"
        exit 1
    fi
}

# Create database if it doesn't exist
echo "Checking if database exists..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME"

# Run all SQL files in order
echo "Running migrations..."
for file in $(ls -v *.sql); do
    run_sql_file "$file"
done

echo "Migrations completed successfully!"