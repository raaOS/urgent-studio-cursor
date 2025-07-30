#!/bin/bash

# 🚀 DEPLOYMENT SCRIPT - URGENT STUDIO PRODUCTION
# Script untuk deploy aplikasi ke VPS production

set -e  # Exit on any error

echo "🚀 STARTING PRODUCTION DEPLOYMENT - URGENT STUDIO"
echo "=================================================="

# Configuration
APP_NAME="urgent-studio"
DEPLOY_USER="deploy"
DEPLOY_HOST="your-vps-ip-address"
DEPLOY_PATH="/var/www/urgent-studio"
BACKUP_PATH="/var/backups/urgent-studio"
NGINX_CONFIG="/etc/nginx/sites-available/urgent-studio"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    log_error "Please run this script from the project root directory"
    exit 1
fi

# Step 1: Pre-deployment checks
log_info "Step 1: Running pre-deployment checks..."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    log_error ".env.production file not found!"
    log_warn "Please create .env.production with your production environment variables"
    exit 1
fi

# Run tests
log_info "Running frontend build test..."
cd frontend
npm run build
cd ..

log_info "Running backend build test..."
cd backend
go build -o urgent-studio-backend .
cd ..

# Step 2: Create deployment package
log_info "Step 2: Creating deployment package..."

# Create temporary deployment directory
TEMP_DIR=$(mktemp -d)
log_info "Using temporary directory: $TEMP_DIR"

# Copy necessary files
cp -r frontend/out $TEMP_DIR/frontend || cp -r frontend/.next $TEMP_DIR/frontend
cp -r backend $TEMP_DIR/
cp .env.production $TEMP_DIR/.env
cp docker-compose.prod.yml $TEMP_DIR/
cp nginx/nginx.conf $TEMP_DIR/

# Create deployment archive
cd $TEMP_DIR
tar -czf urgent-studio-deployment.tar.gz *
cd -

# Step 3: Upload to server
log_info "Step 3: Uploading to production server..."

# Create backup of current deployment
ssh $DEPLOY_USER@$DEPLOY_HOST "
    if [ -d '$DEPLOY_PATH' ]; then
        sudo mkdir -p $BACKUP_PATH
        sudo cp -r $DEPLOY_PATH $BACKUP_PATH/backup-\$(date +%Y%m%d-%H%M%S)
        log_info 'Created backup of current deployment'
    fi
"

# Upload new deployment
scp $TEMP_DIR/urgent-studio-deployment.tar.gz $DEPLOY_USER@$DEPLOY_HOST:/tmp/

# Step 4: Deploy on server
log_info "Step 4: Deploying on production server..."

ssh $DEPLOY_USER@$DEPLOY_HOST "
    # Stop services
    sudo systemctl stop urgent-studio-backend || true
    sudo systemctl stop nginx || true
    
    # Create deployment directory
    sudo mkdir -p $DEPLOY_PATH
    cd $DEPLOY_PATH
    
    # Extract new deployment
    sudo tar -xzf /tmp/urgent-studio-deployment.tar.gz
    sudo chown -R $DEPLOY_USER:$DEPLOY_USER $DEPLOY_PATH
    
    # Install/update dependencies
    cd $DEPLOY_PATH/backend
    go mod download
    go build -o urgent-studio-backend .
    
    # Setup systemd service
    sudo tee /etc/systemd/system/urgent-studio-backend.service > /dev/null <<EOF
[Unit]
Description=Urgent Studio Backend
After=network.target

[Service]
Type=simple
User=$DEPLOY_USER
WorkingDirectory=$DEPLOY_PATH/backend
ExecStart=$DEPLOY_PATH/backend/urgent-studio-backend
Restart=always
RestartSec=5
Environment=PATH=/usr/local/go/bin:/usr/bin:/bin
EnvironmentFile=$DEPLOY_PATH/.env

[Install]
WantedBy=multi-user.target
EOF

    # Setup nginx configuration
    sudo cp $DEPLOY_PATH/nginx.conf $NGINX_CONFIG
    sudo ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/urgent-studio
    
    # Test nginx configuration
    sudo nginx -t
    
    # Start services
    sudo systemctl daemon-reload
    sudo systemctl enable urgent-studio-backend
    sudo systemctl start urgent-studio-backend
    sudo systemctl start nginx
    
    # Check service status
    sudo systemctl status urgent-studio-backend --no-pager
    sudo systemctl status nginx --no-pager
"

# Step 5: Health check
log_info "Step 5: Running health checks..."

sleep 10  # Wait for services to start

# Check if backend is responding
if curl -f -s "http://$DEPLOY_HOST:8080/api/health" > /dev/null; then
    log_info "✅ Backend health check passed"
else
    log_error "❌ Backend health check failed"
    exit 1
fi

# Check if nginx is serving the frontend
if curl -f -s "http://$DEPLOY_HOST" > /dev/null; then
    log_info "✅ Frontend health check passed"
else
    log_error "❌ Frontend health check failed"
    exit 1
fi

# Cleanup
rm -rf $TEMP_DIR
ssh $DEPLOY_USER@$DEPLOY_HOST "rm -f /tmp/urgent-studio-deployment.tar.gz"

log_info "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
log_info "=================================================="
log_info "Frontend: http://$DEPLOY_HOST"
log_info "Backend API: http://$DEPLOY_HOST:8080"
log_info "Admin Panel: http://$DEPLOY_HOST/admin"
log_info "=================================================="

# Step 6: Post-deployment tasks
log_info "Step 6: Post-deployment recommendations..."
log_warn "Don't forget to:"
log_warn "1. Setup SSL certificate (Let's Encrypt)"
log_warn "2. Configure domain DNS"
log_warn "3. Setup monitoring and alerts"
log_warn "4. Test all functionality"
log_warn "5. Setup automated backups"

echo "🚀 Deployment script completed!"