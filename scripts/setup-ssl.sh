#!/bin/bash

# 🔒 SSL CERTIFICATE & DOMAIN SETUP - URGENT STUDIO
# Script untuk setup domain dan SSL certificate untuk produksi

set -e

echo "🔒 SETTING UP SSL CERTIFICATE & DOMAIN - URGENT STUDIO"
echo "======================================================"

# Configuration
DOMAIN="${1:-urgent-studio.com}"
EMAIL="${2:-admin@urgent-studio.com}"
NGINX_CONF_DIR="/etc/nginx/sites-available"
NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"
SSL_DIR="/etc/ssl/urgent-studio"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if domain and email are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    log_error "Usage: $0 <domain> <email>"
    log_error "Example: $0 urgent-studio.com admin@urgent-studio.com"
    exit 1
fi

log_info "Setting up SSL for domain: $DOMAIN"
log_info "Contact email: $EMAIL"

# Step 1: Install Certbot
log_info "Step 1: Installing Certbot..."
if ! command -v certbot &> /dev/null; then
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
    log_info "✅ Certbot installed"
else
    log_info "✅ Certbot already installed"
fi

# Step 2: Create SSL directory
log_info "Step 2: Creating SSL directory..."
sudo mkdir -p $SSL_DIR

# Step 3: Create Nginx configuration for HTTP (before SSL)
log_info "Step 3: Creating initial Nginx configuration..."
sudo tee $NGINX_CONF_DIR/urgent-studio-http > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}
EOF

# Step 4: Enable the HTTP configuration
log_info "Step 4: Enabling HTTP configuration..."
sudo ln -sf $NGINX_CONF_DIR/urgent-studio-http $NGINX_ENABLED_DIR/
sudo nginx -t
sudo systemctl reload nginx

# Step 5: Obtain SSL certificate
log_info "Step 5: Obtaining SSL certificate..."
sudo certbot certonly \
    --webroot \
    --webroot-path=/var/www/html \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --domains $DOMAIN,www.$DOMAIN

if [ $? -eq 0 ]; then
    log_info "✅ SSL certificate obtained successfully"
else
    log_error "❌ Failed to obtain SSL certificate"
    exit 1
fi

# Step 6: Create full Nginx configuration with SSL
log_info "Step 6: Creating full Nginx configuration with SSL..."
sudo tee $NGINX_CONF_DIR/urgent-studio > /dev/null <<EOF
# Rate limiting
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;

# Upstream servers
upstream backend {
    server 127.0.0.1:8080;
    keepalive 32;
}

upstream frontend {
    server 127.0.0.1:3000;
    keepalive 32;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/$DOMAIN/chain.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Admin panel
    location /admin {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # API routes
    location /api {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Health check
    location /health {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Static files
    location /static {
        alias /var/www/urgent-studio/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Frontend (Next.js)
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Nginx status for monitoring
    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        deny all;
    }
}

# Monitoring subdomain (optional)
server {
    listen 443 ssl http2;
    server_name monitoring.$DOMAIN;
    
    # SSL Configuration (same certificate)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Basic auth for monitoring
    auth_basic "Monitoring Access";
    auth_basic_user_file /etc/nginx/.htpasswd;
    
    # Grafana
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Step 7: Create basic auth for monitoring
log_info "Step 7: Creating basic auth for monitoring..."
sudo htpasswd -cb /etc/nginx/.htpasswd admin urgent-studio-monitor

# Step 8: Remove old configuration and enable new one
log_info "Step 8: Enabling new SSL configuration..."
sudo rm -f $NGINX_ENABLED_DIR/urgent-studio-http
sudo ln -sf $NGINX_CONF_DIR/urgent-studio $NGINX_ENABLED_DIR/

# Step 9: Test and reload Nginx
log_info "Step 9: Testing and reloading Nginx..."
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
    log_info "✅ Nginx configuration reloaded"
else
    log_error "❌ Nginx configuration test failed"
    exit 1
fi

# Step 10: Setup automatic certificate renewal
log_info "Step 10: Setting up automatic certificate renewal..."
sudo tee /etc/systemd/system/certbot-renewal.service > /dev/null <<EOF
[Unit]
Description=Certbot Renewal
After=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/bin/certbot renew --quiet --no-self-upgrade --post-hook "systemctl reload nginx"
EOF

sudo tee /etc/systemd/system/certbot-renewal.timer > /dev/null <<EOF
[Unit]
Description=Run certbot renewal twice daily
Requires=certbot-renewal.service

[Timer]
OnCalendar=*-*-* 00,12:00:00
RandomizedDelaySec=3600
Persistent=true

[Install]
WantedBy=timers.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable certbot-renewal.timer
sudo systemctl start certbot-renewal.timer

# Step 11: Create SSL monitoring script
log_info "Step 11: Creating SSL monitoring script..."
sudo tee /usr/local/bin/ssl-monitor.sh > /dev/null <<'EOF'
#!/bin/bash

DOMAIN="$1"
ALERT_DAYS=30

if [ -z "$DOMAIN" ]; then
    echo "Usage: $0 <domain>"
    exit 1
fi

# Check certificate expiry
EXPIRY_DATE=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
CURRENT_EPOCH=$(date +%s)
DAYS_UNTIL_EXPIRY=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))

echo "SSL Certificate for $DOMAIN:"
echo "Expires: $EXPIRY_DATE"
echo "Days until expiry: $DAYS_UNTIL_EXPIRY"

if [ $DAYS_UNTIL_EXPIRY -lt $ALERT_DAYS ]; then
    echo "⚠️  WARNING: Certificate expires in $DAYS_UNTIL_EXPIRY days!"
    # Send alert (implement your notification method here)
else
    echo "✅ Certificate is valid"
fi
EOF

sudo chmod +x /usr/local/bin/ssl-monitor.sh

# Add SSL monitoring to crontab
(sudo crontab -l 2>/dev/null; echo "0 6 * * * /usr/local/bin/ssl-monitor.sh $DOMAIN") | sudo crontab -

# Step 12: Create firewall rules
log_info "Step 12: Configuring firewall..."
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw --force enable

# Step 13: Final SSL test
log_info "Step 13: Running SSL tests..."
sleep 5

# Test SSL certificate
if curl -f -s "https://$DOMAIN/health" > /dev/null; then
    log_info "✅ HTTPS health check passed"
else
    log_warn "⚠️  HTTPS health check failed - check your application"
fi

# Test SSL grade
log_info "Testing SSL configuration..."
SSL_GRADE=$(curl -s "https://api.ssllabs.com/api/v3/analyze?host=$DOMAIN&publish=off&startNew=on&all=done" | grep -o '"grade":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ ! -z "$SSL_GRADE" ]; then
    log_info "SSL Labs grade: $SSL_GRADE"
fi

log_info "🎉 SSL CERTIFICATE & DOMAIN SETUP COMPLETED!"
log_info "=================================================="
log_info "Domain: https://$DOMAIN"
log_info "Monitoring: https://monitoring.$DOMAIN (admin/urgent-studio-monitor)"
log_info "Certificate expires: $(date -d "$EXPIRY_DATE" '+%Y-%m-%d')"
log_info "Auto-renewal: Enabled (twice daily)"
log_info "=================================================="

log_warn "Next steps:"
log_warn "1. Update DNS records to point to this server"
log_warn "2. Test all endpoints with HTTPS"
log_warn "3. Update application configuration to use HTTPS"
log_warn "4. Setup monitoring alerts for certificate expiry"
log_warn "5. Consider adding additional subdomains if needed"

echo "🔒 SSL setup completed!"