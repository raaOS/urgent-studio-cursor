#!/bin/bash

# 📊 MONITORING & LOGGING SETUP - URGENT STUDIO
# Script untuk setup monitoring dan logging di production

set -e

echo "📊 SETTING UP MONITORING & LOGGING - URGENT STUDIO"
echo "=================================================="

# Configuration
MONITORING_DIR="/opt/monitoring"
LOG_DIR="/var/log/urgent-studio"
GRAFANA_PORT="3001"
PROMETHEUS_PORT="9090"

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

# Step 1: Create directories
log_info "Step 1: Creating monitoring directories..."
sudo mkdir -p $MONITORING_DIR
sudo mkdir -p $LOG_DIR
sudo mkdir -p $MONITORING_DIR/prometheus
sudo mkdir -p $MONITORING_DIR/grafana
sudo mkdir -p $MONITORING_DIR/alertmanager

# Step 2: Setup Prometheus configuration
log_info "Step 2: Setting up Prometheus..."
sudo tee $MONITORING_DIR/prometheus/prometheus.yml > /dev/null <<EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'urgent-studio-backend'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'nginx'
    static_configs:
      - targets: ['localhost:9113']

  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']
EOF

# Step 3: Setup Grafana provisioning
log_info "Step 3: Setting up Grafana..."
sudo mkdir -p $MONITORING_DIR/grafana/provisioning/datasources
sudo mkdir -p $MONITORING_DIR/grafana/provisioning/dashboards

sudo tee $MONITORING_DIR/grafana/provisioning/datasources/prometheus.yml > /dev/null <<EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://localhost:9090
    isDefault: true
EOF

sudo tee $MONITORING_DIR/grafana/provisioning/dashboards/dashboard.yml > /dev/null <<EOF
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
EOF

# Step 4: Create Docker Compose for monitoring
log_info "Step 4: Creating monitoring Docker Compose..."
sudo tee $MONITORING_DIR/docker-compose.monitoring.yml > /dev/null <<EOF
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "$PROMETHEUS_PORT:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "$GRAFANA_PORT:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=urgent-studio-admin
      - GF_USERS_ALLOW_SIGN_UP=false
    restart: unless-stopped

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    restart: unless-stopped

  nginx-exporter:
    image: nginx/nginx-prometheus-exporter:latest
    container_name: nginx-exporter
    ports:
      - "9113:9113"
    command:
      - '-nginx.scrape-uri=http://localhost/nginx_status'
    restart: unless-stopped

volumes:
  prometheus_data:
  grafana_data:
EOF

# Step 5: Setup log rotation
log_info "Step 5: Setting up log rotation..."
sudo tee /etc/logrotate.d/urgent-studio > /dev/null <<EOF
$LOG_DIR/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 deploy deploy
    postrotate
        systemctl reload urgent-studio-backend || true
    endscript
}
EOF

# Step 6: Create systemd service for monitoring
log_info "Step 6: Creating monitoring systemd service..."
sudo tee /etc/systemd/system/urgent-studio-monitoring.service > /dev/null <<EOF
[Unit]
Description=Urgent Studio Monitoring Stack
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$MONITORING_DIR
ExecStart=/usr/bin/docker-compose -f docker-compose.monitoring.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.monitoring.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Step 7: Setup alerting rules
log_info "Step 7: Setting up alerting rules..."
sudo tee $MONITORING_DIR/prometheus/alert_rules.yml > /dev/null <<EOF
groups:
  - name: urgent-studio-alerts
    rules:
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
          description: "CPU usage is above 80% for more than 5 minutes"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is above 85% for more than 5 minutes"

      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 10
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Low disk space"
          description: "Disk space is below 10%"

      - alert: ServiceDown
        expr: up{job="urgent-studio-backend"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Urgent Studio Backend is down"
          description: "The backend service has been down for more than 1 minute"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time"
          description: "95th percentile response time is above 1 second"
EOF

# Step 8: Start monitoring services
log_info "Step 8: Starting monitoring services..."
cd $MONITORING_DIR
sudo docker-compose -f docker-compose.monitoring.yml up -d

# Enable and start systemd service
sudo systemctl daemon-reload
sudo systemctl enable urgent-studio-monitoring
sudo systemctl start urgent-studio-monitoring

# Step 9: Setup backup monitoring
log_info "Step 9: Setting up backup monitoring..."
sudo tee /usr/local/bin/backup-monitoring.sh > /dev/null <<'EOF'
#!/bin/bash

BACKUP_DIR="/var/backups/urgent-studio"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup Grafana dashboards
docker exec grafana grafana-cli admin export-dashboard > $BACKUP_DIR/grafana-dashboards-$DATE.json

# Backup Prometheus data
docker exec prometheus tar -czf - /prometheus > $BACKUP_DIR/prometheus-data-$DATE.tar.gz

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -name "*.json" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Monitoring backup completed: $DATE"
EOF

sudo chmod +x /usr/local/bin/backup-monitoring.sh

# Add to crontab
(sudo crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-monitoring.sh") | sudo crontab -

# Step 10: Final checks
log_info "Step 10: Running final checks..."

sleep 30  # Wait for services to start

# Check Prometheus
if curl -f -s "http://localhost:$PROMETHEUS_PORT/-/healthy" > /dev/null; then
    log_info "✅ Prometheus is running"
else
    log_error "❌ Prometheus health check failed"
fi

# Check Grafana
if curl -f -s "http://localhost:$GRAFANA_PORT/api/health" > /dev/null; then
    log_info "✅ Grafana is running"
else
    log_error "❌ Grafana health check failed"
fi

log_info "🎉 MONITORING SETUP COMPLETED!"
log_info "=================================================="
log_info "Grafana: http://localhost:$GRAFANA_PORT (admin/urgent-studio-admin)"
log_info "Prometheus: http://localhost:$PROMETHEUS_PORT"
log_info "Node Exporter: http://localhost:9100"
log_info "=================================================="

log_warn "Next steps:"
log_warn "1. Import Grafana dashboards for Go applications"
log_warn "2. Configure alert notifications (email, Slack, etc.)"
log_warn "3. Setup SSL certificates for monitoring endpoints"
log_warn "4. Configure firewall rules"
log_warn "5. Test all alerts"

echo "📊 Monitoring setup completed!"