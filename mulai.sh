#!/bin/bash

# Urgent Studio - Development Script (Tanpa Docker)
# Jalankan dengan: ./mulai.sh

echo "🚀 Starting Urgent Studio Development Environment..."

# Check if PostgreSQL is running
if ! brew services list | grep -q "postgresql@14.*started"; then
    echo "📦 Starting PostgreSQL..."
    brew services start postgresql@14
    sleep 2
fi

# Check if database exists
if ! psql -lqt | cut -d \| -f 1 | grep -qw urgent_studio; then
    echo "🗄️ Creating database..."
    createdb urgent_studio
fi

# Run migrations
echo "🔄 Running database migrations..."
psql -d urgent_studio -f database/migrations/001_initial_schema.sql > /dev/null 2>&1
psql -d urgent_studio -f database/migrations/002_products_schema.sql > /dev/null 2>&1
psql -d urgent_studio -f database/migrations/005_add_users_is_active.sql > /dev/null 2>&1
psql -d urgent_studio -f database/migrations/006_add_updated_at_columns.sql > /dev/null 2>&1

# Load sample data if needed
if [ "$1" = "seed" ]; then
    echo "🌱 Loading sample data..."
    psql -d urgent_studio -f database/seed/real_products_data_fixed.sql > /dev/null 2>&1
fi

# Start backend
echo "⚡ Starting backend server..."
cd backend
source ../.env.local
go run . &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Test API
echo "🧪 Testing API..."
if curl -s http://localhost:8080/api/health > /dev/null; then
    echo "✅ Backend is running at http://localhost:8080"
    echo "✅ API Health Check: PASSED"
else
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend (optional)
if [ "$2" = "frontend" ]; then
    echo "🎨 Starting frontend..."
    cd ../frontend
    npm run dev &
    FRONTEND_PID=$!
    echo "✅ Frontend is running at http://localhost:3000"
fi

echo ""
echo "🎯 Development Environment Ready!"
echo "📊 Backend API: http://localhost:8080"
echo "🎨 Frontend: http://localhost:3000 (if started)"
echo "🗄️ Database: PostgreSQL (local)"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'echo "🛑 Stopping services..."; kill $BACKEND_PID 2>/dev/null; kill $FRONTEND_PID 2>/dev/null; exit 0' INT
wait