#!/bin/bash

# 🧪 STAGING DEPLOYMENT TEST - URGENT STUDIO
# Script untuk test deployment di staging environment

set -e

echo "🧪 STAGING DEPLOYMENT TEST - URGENT STUDIO"
echo "=========================================="

# Configuration
STAGING_DIR="/opt/urgent-studio-staging"
STAGING_PORT_FRONTEND="3001"
STAGING_PORT_BACKEND="8081"
STAGING_DB_NAME="urgent_studio_staging"
STAGING_DB_USER="urgent_studio_staging"
STAGING_DB_PASS="staging_password_$(date +%s)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

# Step 1: Create staging directory
log_info "Step 1: Creating staging environment..."
sudo mkdir -p $STAGING_DIR
sudo chown $USER:$USER $STAGING_DIR

# Step 2: Copy source code to staging
log_info "Step 2: Copying source code to staging..."
cp -r . $STAGING_DIR/
cd $STAGING_DIR

# Step 3: Create staging environment file
log_info "Step 3: Creating staging environment..."
cat > .env.staging << EOF
# Database Configuration
DATABASE_URL="postgres://$STAGING_DB_USER:$STAGING_DB_PASS@localhost:5432/$STAGING_DB_NAME?sslmode=disable"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="$STAGING_DB_NAME"
DB_USER="$STAGING_DB_USER"
DB_PASSWORD="$STAGING_DB_PASS"

# Application Configuration
APP_ENV="staging"
APP_PORT="$STAGING_PORT_BACKEND"
APP_HOST="0.0.0.0"
FRONTEND_URL="http://localhost:$STAGING_PORT_FRONTEND"
BACKEND_URL="http://localhost:$STAGING_PORT_BACKEND"

# Security
JWT_SECRET="staging_jwt_secret_$(openssl rand -hex 32)"
SESSION_SECRET="staging_session_secret_$(openssl rand -hex 32)"
ENCRYPTION_KEY="$(openssl rand -hex 32)"

# CORS
CORS_ORIGINS="http://localhost:$STAGING_PORT_FRONTEND,http://127.0.0.1:$STAGING_PORT_FRONTEND"

# Logging
LOG_LEVEL="debug"
LOG_FILE="/var/log/urgent-studio/staging.log"

# File Upload
UPLOAD_DIR="/tmp/urgent-studio-staging/uploads"
MAX_FILE_SIZE="10MB"

# Email (Test configuration)
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_USER="test"
SMTP_PASS="test"
FROM_EMAIL="staging@urgent-studio.com"

# Payment (Test mode)


# Monitoring
ENABLE_METRICS="true"
METRICS_PORT="9090"
EOF

# Step 4: Setup staging database
log_info "Step 4: Setting up staging database..."
sudo -u postgres psql << EOF
CREATE DATABASE $STAGING_DB_NAME;
CREATE USER $STAGING_DB_USER WITH PASSWORD '$STAGING_DB_PASS';
GRANT ALL PRIVILEGES ON DATABASE $STAGING_DB_NAME TO $STAGING_DB_USER;
\q
EOF

# Step 5: Build frontend for staging
log_info "Step 5: Building frontend for staging..."
cd frontend

# Update Next.js config for staging
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.BACKEND_URL || 'http://localhost:8081',
    NEXT_PUBLIC_APP_ENV: 'staging'
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:8081'}/api/:path*`
      }
    ]
  }
}

module.exports = nextConfig
EOF

# Install dependencies and build
npm ci
npm run build

# Step 6: Build backend for staging
log_info "Step 6: Building backend for staging..."
cd ../backend

# Build Go application
go mod tidy
go build -o urgent-studio-staging .

# Step 7: Run database migrations
log_info "Step 7: Running database migrations..."
export DATABASE_URL="postgres://$STAGING_DB_USER:$STAGING_DB_PASS@localhost:5432/$STAGING_DB_NAME?sslmode=disable"
# Add your migration commands here if you have them
# ./urgent-studio-staging migrate

# Step 8: Create staging systemd services
log_info "Step 8: Creating staging systemd services..."

# Backend service
sudo tee /etc/systemd/system/urgent-studio-staging-backend.service > /dev/null << EOF
[Unit]
Description=Urgent Studio Staging Backend
After=network.target postgresql.service

[Service]
Type=simple
User=deploy
Group=deploy
WorkingDirectory=$STAGING_DIR/backend
Environment=PORT=$STAGING_PORT_BACKEND
EnvironmentFile=$STAGING_DIR/.env.staging
ExecStart=$STAGING_DIR/backend/urgent-studio-staging
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Frontend service
sudo tee /etc/systemd/system/urgent-studio-staging-frontend.service > /dev/null << EOF
[Unit]
Description=Urgent Studio Staging Frontend
After=network.target

[Service]
Type=simple
User=deploy
Group=deploy
WorkingDirectory=$STAGING_DIR/frontend
Environment=NODE_ENV=staging
Environment=PORT=$STAGING_PORT_FRONTEND
EnvironmentFile=$STAGING_DIR/.env.staging
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Step 9: Start staging services
log_info "Step 9: Starting staging services..."
sudo systemctl daemon-reload
sudo systemctl enable urgent-studio-staging-backend
sudo systemctl enable urgent-studio-staging-frontend
sudo systemctl start urgent-studio-staging-backend
sudo systemctl start urgent-studio-staging-frontend

# Wait for services to start
sleep 10

# Step 10: Run comprehensive tests
log_info "Step 10: Running comprehensive tests..."

# Test 1: Service health checks
log_test "Testing service health..."
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$STAGING_PORT_BACKEND/health" || echo "000")
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$STAGING_PORT_FRONTEND" || echo "000")

if [ "$BACKEND_HEALTH" = "200" ]; then
    log_info "✅ Backend health check passed"
else
    log_error "❌ Backend health check failed (HTTP $BACKEND_HEALTH)"
fi

if [ "$FRONTEND_HEALTH" = "200" ]; then
    log_info "✅ Frontend health check passed"
else
    log_error "❌ Frontend health check failed (HTTP $FRONTEND_HEALTH)"
fi

# Test 2: Database connectivity
log_test "Testing database connectivity..."
DB_TEST=$(PGPASSWORD=$STAGING_DB_PASS psql -h localhost -U $STAGING_DB_USER -d $STAGING_DB_NAME -c "SELECT 1;" 2>/dev/null | grep -c "1 row" || echo "0")
if [ "$DB_TEST" = "1" ]; then
    log_info "✅ Database connectivity test passed"
else
    log_error "❌ Database connectivity test failed"
fi

# Test 3: API endpoints
log_test "Testing API endpoints..."
API_PING=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$STAGING_PORT_BACKEND/api/ping" || echo "000")
if [ "$API_PING" = "200" ]; then
    log_info "✅ API ping test passed"
else
    log_error "❌ API ping test failed (HTTP $API_PING)"
fi

# Test 4: Load testing
log_test "Running load tests..."
if command -v ab &> /dev/null; then
    # Test backend load
    ab -n 100 -c 10 "http://localhost:$STAGING_PORT_BACKEND/health" > /tmp/backend-load-test.txt 2>&1
    BACKEND_RPS=$(grep "Requests per second" /tmp/backend-load-test.txt | awk '{print $4}')
    log_info "Backend RPS: $BACKEND_RPS"
    
    # Test frontend load
    ab -n 50 -c 5 "http://localhost:$STAGING_PORT_FRONTEND/" > /tmp/frontend-load-test.txt 2>&1
    FRONTEND_RPS=$(grep "Requests per second" /tmp/frontend-load-test.txt | awk '{print $4}')
    log_info "Frontend RPS: $FRONTEND_RPS"
else
    log_warn "Apache Bench not installed, skipping load tests"
fi

# Test 5: Memory and CPU usage
log_test "Checking resource usage..."
BACKEND_PID=$(pgrep -f "urgent-studio-staging" || echo "")
FRONTEND_PID=$(pgrep -f "npm.*start" || echo "")

if [ ! -z "$BACKEND_PID" ]; then
    BACKEND_MEM=$(ps -p $BACKEND_PID -o %mem --no-headers | tr -d ' ')
    BACKEND_CPU=$(ps -p $BACKEND_PID -o %cpu --no-headers | tr -d ' ')
    log_info "Backend - Memory: ${BACKEND_MEM}%, CPU: ${BACKEND_CPU}%"
fi

if [ ! -z "$FRONTEND_PID" ]; then
    FRONTEND_MEM=$(ps -p $FRONTEND_PID -o %mem --no-headers | tr -d ' ')
    FRONTEND_CPU=$(ps -p $FRONTEND_PID -o %cpu --no-headers | tr -d ' ')
    log_info "Frontend - Memory: ${FRONTEND_MEM}%, CPU: ${FRONTEND_CPU}%"
fi

# Test 6: Log analysis
log_test "Analyzing logs..."
BACKEND_ERRORS=$(sudo journalctl -u urgent-studio-staging-backend --since "5 minutes ago" | grep -i error | wc -l)
FRONTEND_ERRORS=$(sudo journalctl -u urgent-studio-staging-frontend --since "5 minutes ago" | grep -i error | wc -l)

log_info "Backend errors in last 5 minutes: $BACKEND_ERRORS"
log_info "Frontend errors in last 5 minutes: $FRONTEND_ERRORS"

# Test 7: Security tests
log_test "Running security tests..."
# Test CORS
CORS_TEST=$(curl -s -H "Origin: http://malicious-site.com" "http://localhost:$STAGING_PORT_BACKEND/api/ping" -w "%{http_code}" -o /dev/null || echo "000")
if [ "$CORS_TEST" = "403" ] || [ "$CORS_TEST" = "000" ]; then
    log_info "✅ CORS protection working"
else
    log_warn "⚠️  CORS might not be properly configured"
fi

# Test 8: Functional tests
log_test "Running functional tests..."
cd $STAGING_DIR/frontend
if [ -f "package.json" ] && grep -q "test" package.json; then
    npm test -- --watchAll=false --passWithNoTests
    if [ $? -eq 0 ]; then
        log_info "✅ Frontend tests passed"
    else
        log_error "❌ Frontend tests failed"
    fi
else
    log_warn "No frontend tests found"
fi

cd $STAGING_DIR/backend
if [ -f "go.mod" ]; then
    go test ./... -v
    if [ $? -eq 0 ]; then
        log_info "✅ Backend tests passed"
    else
        log_error "❌ Backend tests failed"
    fi
else
    log_warn "No backend tests found"
fi

# Step 11: Generate test report
log_info "Step 11: Generating test report..."
cat > $STAGING_DIR/staging-test-report.txt << EOF
URGENT STUDIO - STAGING DEPLOYMENT TEST REPORT
==============================================
Date: $(date)
Environment: Staging

SERVICE STATUS:
- Backend Health: HTTP $BACKEND_HEALTH
- Frontend Health: HTTP $FRONTEND_HEALTH
- Database: $([ "$DB_TEST" = "1" ] && echo "Connected" || echo "Failed")
- API Ping: HTTP $API_PING

PERFORMANCE:
- Backend RPS: ${BACKEND_RPS:-"N/A"}
- Frontend RPS: ${FRONTEND_RPS:-"N/A"}
- Backend Memory: ${BACKEND_MEM:-"N/A"}%
- Backend CPU: ${BACKEND_CPU:-"N/A"}%
- Frontend Memory: ${FRONTEND_MEM:-"N/A"}%
- Frontend CPU: ${FRONTEND_CPU:-"N/A"}%

LOGS:
- Backend Errors (5min): $BACKEND_ERRORS
- Frontend Errors (5min): $FRONTEND_ERRORS

SECURITY:
- CORS Test: $([ "$CORS_TEST" = "403" ] && echo "PASS" || echo "REVIEW")

CONFIGURATION:
- Frontend Port: $STAGING_PORT_FRONTEND
- Backend Port: $STAGING_PORT_BACKEND
- Database: $STAGING_DB_NAME
- Environment: staging

NEXT STEPS:
1. Review any failed tests above
2. Check application logs for errors
3. Verify all features work as expected
4. Run additional manual testing
5. If all tests pass, proceed with production deployment
EOF

# Step 12: Cleanup option
log_info "Step 12: Staging environment ready!"

log_info "🎉 STAGING DEPLOYMENT TEST COMPLETED!"
log_info "=================================================="
log_info "Frontend: http://localhost:$STAGING_PORT_FRONTEND"
log_info "Backend: http://localhost:$STAGING_PORT_BACKEND"
log_info "Database: $STAGING_DB_NAME"
log_info "Test Report: $STAGING_DIR/staging-test-report.txt"
log_info "=================================================="

log_warn "Commands to manage staging:"
log_warn "- View logs: sudo journalctl -u urgent-studio-staging-backend -f"
log_warn "- Stop services: sudo systemctl stop urgent-studio-staging-*"
log_warn "- Start services: sudo systemctl start urgent-studio-staging-*"
log_warn "- Remove staging: sudo rm -rf $STAGING_DIR && sudo systemctl disable urgent-studio-staging-*"

echo "🧪 Staging deployment test completed!"