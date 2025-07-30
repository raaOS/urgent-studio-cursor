#!/bin/bash

# Urgent Studio - Stop Script
# Jalankan dengan: ./stop.sh

echo "🛑 Stopping Urgent Studio Development Environment..."

# Kill backend processes
echo "⚡ Stopping backend..."
pkill -f "go run"
pkill -f "backend"

# Kill frontend processes
echo "🎨 Stopping frontend..."
pkill -f "npm run dev"
pkill -f "next dev"

# Stop PostgreSQL (optional)
if [ "$1" = "all" ]; then
    echo "📦 Stopping PostgreSQL..."
    brew services stop postgresql@14
fi

echo "✅ All services stopped!"