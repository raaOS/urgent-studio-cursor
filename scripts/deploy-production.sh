#!/bin/bash

# Production Deployment Script for Urgent Studio 2025
# This script handles the complete production deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="urgent-studio-2025"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"

echo -e "${BLUE}🚀 Starting Production Deployment for ${PROJECT_NAME}${NC}"
echo "=================================================="

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required files exist
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if [ ! -f "$COMPOSE_FILE" ]; then
    print_error "docker-compose.prod.yml not found!"
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    print_warning ".env.prod not found, creating from template..."
    if [ -f ".env.prod.example" ]; then
        cp .env.prod.example .env.prod
        print_warning "Please edit .env.prod with your production values before continuing!"
        read -p "Press Enter after editing .env.prod..."
    else
        print_error ".env.prod.example not found!"
        exit 1
    fi
fi

print_status "Prerequisites check completed"

# Setup security
echo -e "${BLUE}🔒 Setting up security...${NC}"
if [ -f "scripts/setup-security.sh" ]; then
    chmod +x scripts/setup-security.sh
    ./scripts/setup-security.sh
else
    print_warning "Security setup script not found, skipping..."
fi

# Build and test frontend
echo -e "${BLUE}🏗️  Building and testing frontend...${NC}"
cd frontend

# Install dependencies
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Run type check
echo "Running type check..."
npm run typecheck

# Run tests
echo "Running tests..."
npm test

# Build for production
echo "Building for production..."
npm run build

# Run linting
echo "Running linting..."
npm run lint

cd ..
print_status "Frontend build and tests completed"

# Build and start services
echo -e "${BLUE}🐳 Building and starting Docker services...${NC}"

# Stop any existing services
echo "Stopping existing services..."
docker-compose -f $COMPOSE_FILE down --remove-orphans

# Build images
echo "Building Docker images..."
docker-compose -f $COMPOSE_FILE build --no-cache

# Start services
echo "Starting services..."
docker-compose -f $COMPOSE_FILE up -d

print_status "Docker services started"

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 30

# Health checks
echo -e "${BLUE}🏥 Running health checks...${NC}"

# Check if frontend is responding
if curl -f -s http://localhost/health > /dev/null; then
    print_status "Frontend health check passed"
else
    print_error "Frontend health check failed"
fi

# Check if backend is responding
if curl -f -s http://localhost/api/ping > /dev/null; then
    print_status "Backend health check passed"
else
    print_error "Backend health check failed"
fi

# Check if database is responding
if docker-compose -f $COMPOSE_FILE exec -T postgres pg_isready > /dev/null; then
    print_status "Database health check passed"
else
    print_error "Database health check failed"
fi

# Show running services
echo -e "${BLUE}📊 Service Status:${NC}"
docker-compose -f $COMPOSE_FILE ps

# Show logs for any failed services
echo -e "${BLUE}📝 Recent logs:${NC}"
docker-compose -f $COMPOSE_FILE logs --tail=20

# Final status
echo ""
echo "=================================================="
echo -e "${GREEN}🎉 Production deployment completed!${NC}"
echo ""
echo -e "${BLUE}📍 Access your application:${NC}"
echo "   🌐 Frontend: https://localhost"
echo "   🔧 API: https://localhost/api"
echo "   📊 Admin: https://localhost/admin"
echo ""
echo -e "${BLUE}📊 Monitoring:${NC}"
echo "   📈 Grafana: http://localhost:3001"
echo "   🔍 Logs: docker-compose -f $COMPOSE_FILE logs -f"
echo ""
echo -e "${YELLOW}⚠️  Important Notes:${NC}"
echo "   • Make sure to update SSL certificates for production"
echo "   • Review and update all default passwords"
echo "   • Set up proper backup procedures"
echo "   • Configure monitoring alerts"
echo "   • Review security settings"
echo ""
echo -e "${BLUE}🛠️  Useful Commands:${NC}"
echo "   • View logs: docker-compose -f $COMPOSE_FILE logs -f [service]"
echo "   • Restart service: docker-compose -f $COMPOSE_FILE restart [service]"
echo "   • Stop all: docker-compose -f $COMPOSE_FILE down"
echo "   • Update: git pull && ./scripts/deploy-production.sh"
echo ""