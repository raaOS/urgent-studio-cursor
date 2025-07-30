#!/bin/bash

# 🧪 Logging Test Script - Urgent Studio
# Script untuk testing implementasi logging frontend

echo "🚀 Starting Logging Tests..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if frontend server is running
print_status "Checking frontend server status..."
if curl -s http://localhost:9005 > /dev/null; then
    print_success "Frontend server is running on http://localhost:9005"
else
    print_error "Frontend server is not running. Please start with 'npm run dev'"
    exit 1
fi

# Check if backend server is running
print_status "Checking backend server status..."
if curl -s http://localhost:8080/health > /dev/null; then
    print_success "Backend server is running on http://localhost:8080"
else
    print_warning "Backend server is not running. Some logging features may not work."
fi

# Test logging API endpoint
print_status "Testing logging API endpoint..."
TEST_LOG='{
  "level": "info",
  "message": "Test log from script",
  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
  "context": {
    "source": "test-script",
    "testType": "single-log"
  }
}'

RESPONSE=$(curl -s -w "%{http_code}" -X POST \
  http://localhost:9005/api/logs \
  -H "Content-Type: application/json" \
  -d "$TEST_LOG")

HTTP_CODE="${RESPONSE: -3}"
if [ "$HTTP_CODE" = "200" ]; then
    print_success "Logging API endpoint is working (HTTP $HTTP_CODE)"
else
    print_error "Logging API endpoint failed (HTTP $HTTP_CODE)"
fi

# Test batch logging
print_status "Testing batch logging..."
BATCH_LOG='[
  {
    "level": "info",
    "message": "Batch test log 1",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
    "context": {"batch": true, "index": 1}
  },
  {
    "level": "warn",
    "message": "Batch test log 2",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
    "context": {"batch": true, "index": 2}
  }
]'

BATCH_RESPONSE=$(curl -s -w "%{http_code}" -X POST \
  http://localhost:9005/api/logs \
  -H "Content-Type: application/json" \
  -d "$BATCH_LOG")

BATCH_HTTP_CODE="${BATCH_RESPONSE: -3}"
if [ "$BATCH_HTTP_CODE" = "200" ]; then
    print_success "Batch logging is working (HTTP $BATCH_HTTP_CODE)"
else
    print_error "Batch logging failed (HTTP $BATCH_HTTP_CODE)"
fi

# Instructions for browser testing
echo ""
echo "🌐 Browser Testing Instructions:"
echo "================================"
echo "1. Open http://localhost:9005 in your browser"
echo "2. Open Developer Tools (F12)"
echo "3. Go to Console tab"
echo "4. Run these commands:"
echo ""
echo "   // Test all logging functions"
echo "   window.testLogging()"
echo ""
echo "   // Test remote logging"
echo "   window.testRemoteLogging()"
echo ""
echo "   // Test batch logging"
echo "   window.testBatchLogging()"
echo ""
echo "5. Check Network tab for API calls to /api/logs"
echo "6. Interact with the homepage (click buttons, submit forms)"
echo "7. Navigate to /admin/login to test component logging"

# Check log files (if any)
print_status "Checking for log files..."
if [ -d "logs" ]; then
    LOG_COUNT=$(find logs -name "*.log" | wc -l)
    if [ "$LOG_COUNT" -gt 0 ]; then
        print_success "Found $LOG_COUNT log files in logs/ directory"
        echo "Recent log entries:"
        find logs -name "*.log" -exec tail -5 {} \;
    else
        print_warning "No log files found in logs/ directory"
    fi
else
    print_warning "logs/ directory not found"
fi

echo ""
print_success "Logging test completed!"
echo "Check the browser console and network tab for detailed logging activity."