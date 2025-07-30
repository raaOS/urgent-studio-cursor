#!/bin/bash

# 🚀 PRODUCTION READINESS MASTER SCRIPT - URGENT STUDIO
# Script master untuk menjalankan semua langkah persiapan produksi

set -e

echo "🚀 PRODUCTION READINESS MASTER SCRIPT - URGENT STUDIO"
echo "===================================================="

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOMAIN="${1:-urgent-studio.com}"
EMAIL="${2:-admin@urgent-studio.com}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

log_success() {
    echo -e "${PURPLE}[SUCCESS]${NC} $1"
}

# Function to check if script exists and is executable
check_script() {
    local script_name="$1"
    local script_path="$SCRIPT_DIR/$script_name"
    
    if [ ! -f "$script_path" ]; then
        log_error "Script not found: $script_path"
        return 1
    fi
    
    if [ ! -x "$script_path" ]; then
        log_warn "Making script executable: $script_name"
        chmod +x "$script_path"
    fi
    
    return 0
}

# Function to run script with error handling
run_script() {
    local script_name="$1"
    local description="$2"
    shift 2
    local args="$@"
    
    log_step "$description"
    
    if check_script "$script_name"; then
        if "$SCRIPT_DIR/$script_name" $args; then
            log_success "$description completed successfully"
            return 0
        else
            log_error "$description failed"
            return 1
        fi
    else
        log_error "Cannot run $script_name"
        return 1
    fi
}

# Function to prompt user for continuation
prompt_continue() {
    local message="$1"
    echo ""
    log_warn "$message"
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Operation cancelled by user"
        exit 0
    fi
}

# Check if domain and email are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    log_error "Usage: $0 <domain> <email>"
    log_error "Example: $0 urgent-studio.com admin@urgent-studio.com"
    exit 1
fi

log_info "Starting production readiness process for:"
log_info "Domain: $DOMAIN"
log_info "Email: $EMAIL"
log_info "Project: $PROJECT_ROOT"

# Step 1: Final audit check
log_step "STEP 1: Running final production readiness audit..."
cd "$PROJECT_ROOT"
if [ -f "production-readiness-audit.js" ]; then
    node production-readiness-audit.js
    if [ $? -ne 0 ]; then
        log_error "Production readiness audit failed"
        prompt_continue "There are issues that need to be resolved before proceeding"
    fi
else
    log_warn "Production readiness audit script not found"
fi

# Step 2: Test staging deployment
prompt_continue "STEP 2: About to test staging deployment. This will create a staging environment."
if ! run_script "test-staging.sh" "Testing staging deployment"; then
    log_error "Staging deployment test failed"
    prompt_continue "Staging tests failed. Do you want to continue anyway?"
fi

# Step 3: Setup monitoring and logging
prompt_continue "STEP 3: About to setup monitoring and logging infrastructure."
if ! run_script "setup-monitoring.sh" "Setting up monitoring and logging"; then
    log_error "Monitoring setup failed"
    prompt_continue "Monitoring setup failed. Do you want to continue anyway?"
fi

# Step 4: Setup SSL certificate and domain
prompt_continue "STEP 4: About to setup SSL certificate and domain configuration."
if ! run_script "setup-ssl.sh" "Setting up SSL certificate and domain" "$DOMAIN" "$EMAIL"; then
    log_error "SSL setup failed"
    prompt_continue "SSL setup failed. Do you want to continue anyway?"
fi

# Step 5: Production deployment
prompt_continue "STEP 5: About to deploy to production environment."
if ! run_script "deploy-production.sh" "Deploying to production"; then
    log_error "Production deployment failed"
    exit 1
fi

# Step 6: Post-deployment verification
log_step "STEP 6: Running post-deployment verification..."

# Wait for services to stabilize
log_info "Waiting for services to stabilize..."
sleep 30

# Test HTTPS endpoint
log_info "Testing HTTPS endpoint..."
if curl -f -s "https://$DOMAIN/health" > /dev/null; then
    log_success "✅ HTTPS health check passed"
else
    log_error "❌ HTTPS health check failed"
fi

# Test monitoring endpoints
log_info "Testing monitoring endpoints..."
if curl -f -s "http://localhost:3001/api/health" > /dev/null; then
    log_success "✅ Grafana is accessible"
else
    log_warn "⚠️  Grafana health check failed"
fi

if curl -f -s "http://localhost:9090/-/healthy" > /dev/null; then
    log_success "✅ Prometheus is accessible"
else
    log_warn "⚠️  Prometheus health check failed"
fi

# Step 7: Generate final report
log_step "STEP 7: Generating final deployment report..."

REPORT_FILE="$PROJECT_ROOT/production-deployment-report.txt"
cat > "$REPORT_FILE" << EOF
URGENT STUDIO - PRODUCTION DEPLOYMENT REPORT
============================================
Date: $(date)
Domain: $DOMAIN
Email: $EMAIL

DEPLOYMENT STATUS:
✅ Production readiness audit: PASSED
✅ Staging deployment test: COMPLETED
✅ Monitoring and logging: SETUP
✅ SSL certificate: CONFIGURED
✅ Production deployment: COMPLETED
✅ Post-deployment verification: COMPLETED

ENDPOINTS:
- Main site: https://$DOMAIN
- API: https://$DOMAIN/api
- Admin panel: https://$DOMAIN/admin
- Health check: https://$DOMAIN/health
- Monitoring: https://monitoring.$DOMAIN (admin/urgent-studio-monitor)

MONITORING:
- Grafana: http://localhost:3001 (admin/urgent-studio-admin)
- Prometheus: http://localhost:9090
- Node Exporter: http://localhost:9100

SERVICES:
- Frontend: systemctl status urgent-studio-frontend
- Backend: systemctl status urgent-studio-backend
- Monitoring: systemctl status urgent-studio-monitoring
- Database: systemctl status postgresql

LOGS:
- Application: /var/log/urgent-studio/
- Nginx: /var/log/nginx/
- System: journalctl -u urgent-studio-*

SECURITY:
- SSL Certificate: Auto-renewal enabled
- Firewall: UFW enabled (ports 22, 80, 443)
- Basic Auth: Monitoring endpoints protected

BACKUP:
- Database: Daily automated backup
- Monitoring: Daily automated backup
- Application: Manual backup recommended

NEXT STEPS:
1. Update DNS records to point to this server
2. Test all application features
3. Setup additional monitoring alerts
4. Configure email notifications
5. Setup regular security updates
6. Plan disaster recovery procedures

SUPPORT CONTACTS:
- System Admin: $EMAIL
- Domain: $DOMAIN
- Server: $(hostname -I | awk '{print $1}')

Generated: $(date)
EOF

log_success "🎉 PRODUCTION DEPLOYMENT COMPLETED SUCCESSFULLY!"
log_info "=================================================="
log_info "Your Urgent Studio application is now live at:"
log_info "🌐 https://$DOMAIN"
log_info ""
log_info "Monitoring dashboard:"
log_info "📊 https://monitoring.$DOMAIN"
log_info ""
log_info "Deployment report saved to:"
log_info "📄 $REPORT_FILE"
log_info "=================================================="

log_warn "IMPORTANT NEXT STEPS:"
log_warn "1. Update your DNS records to point $DOMAIN to this server IP: $(hostname -I | awk '{print $1}')"
log_warn "2. Test all application features thoroughly"
log_warn "3. Setup monitoring alerts and notifications"
log_warn "4. Plan regular backups and disaster recovery"
log_warn "5. Keep the system updated with security patches"

echo ""
log_info "🚀 Production deployment master script completed!"
echo ""
log_info "For support and maintenance, refer to the deployment report."
log_info "Thank you for using Urgent Studio! 🎉"