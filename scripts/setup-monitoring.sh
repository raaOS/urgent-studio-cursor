#!/bin/bash

# Performance Monitoring Setup Script
# This script sets up performance monitoring for production

set -e

echo "🚀 Setting up Performance Monitoring..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Create monitoring directory
MONITOR_DIR="monitoring"
mkdir -p $MONITOR_DIR

print_status "Creating performance monitoring configuration..."

# Create Prometheus configuration
cat > $MONITOR_DIR/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'urgent-studio-frontend'
    static_configs:
      - targets: ['frontend:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'urgent-studio-backend'
    static_configs:
      - targets: ['backend:8080']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    metrics_path: '/nginx_status'
    scrape_interval: 30s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
    scrape_interval: 60s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
EOF

# Create alert rules
cat > $MONITOR_DIR/alert_rules.yml << 'EOF'
groups:
  - name: urgent-studio-alerts
    rules:
      - alert: HighResponseTime
        expr: http_request_duration_seconds{quantile="0.95"} > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }}s"

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: DatabaseConnectionFailure
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection failure"
          description: "PostgreSQL database is down"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is above 90%"

      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage"
          description: "CPU usage is above 80%"
EOF

# Create Grafana dashboard configuration
cat > $MONITOR_DIR/grafana-dashboard.json << 'EOF'
{
  "dashboard": {
    "id": null,
    "title": "Urgent Studio Performance Dashboard",
    "tags": ["urgent-studio"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "http_request_duration_seconds{quantile=\"0.95\"}",
            "legendFormat": "95th percentile"
          }
        ],
        "yAxes": [
          {
            "label": "Seconds",
            "min": 0
          }
        ]
      },
      {
        "id": 2,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "Requests per second"
          }
        ]
      },
      {
        "id": 3,
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx errors per second"
          }
        ]
      },
      {
        "id": 4,
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100",
            "legendFormat": "Memory usage %"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
EOF

# Create monitoring docker-compose
cat > $MONITOR_DIR/docker-compose.monitoring.yml << 'EOF'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: urgent-studio-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - ./alert_rules.yml:/etc/prometheus/alert_rules.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: urgent-studio-grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - monitoring

  alertmanager:
    image: prom/alertmanager:latest
    container_name: urgent-studio-alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
    networks:
      - monitoring

volumes:
  prometheus_data:
  grafana_data:

networks:
  monitoring:
    driver: bridge
EOF

# Create alertmanager configuration
cat > $MONITOR_DIR/alertmanager.yml << 'EOF'
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@urgent-studio.com'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
  - name: 'web.hook'
    webhook_configs:
      - url: 'http://localhost:5001/'
        send_resolved: true

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'dev', 'instance']
EOF

# Create performance monitoring script
cat > $MONITOR_DIR/monitor.sh << 'EOF'
#!/bin/bash

# Performance monitoring script
echo "🔍 Starting performance monitoring..."

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo "Checking $service_name..."
    
    response=$(curl -s -o /dev/null -w "%{http_code},%{time_total}" "$url" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        status_code=$(echo $response | cut -d',' -f1)
        response_time=$(echo $response | cut -d',' -f2)
        
        if [ "$status_code" = "$expected_status" ]; then
            echo "✅ $service_name: OK (${response_time}s)"
        else
            echo "❌ $service_name: HTTP $status_code (${response_time}s)"
        fi
    else
        echo "❌ $service_name: Connection failed"
    fi
}

# Check all services
check_service "Frontend" "http://localhost:3000/api/health"
check_service "Backend" "http://localhost:8080/health"
check_service "Nginx" "http://localhost/health"

# Check system resources
echo ""
echo "📊 System Resources:"
echo "Memory: $(free -h | awk '/^Mem:/ {print $3 "/" $2}')"
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "Disk: $(df -h / | awk 'NR==2 {print $3 "/" $2 " (" $5 " used)"}')"

# Check Docker containers
echo ""
echo "🐳 Docker Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep urgent-studio

echo ""
echo "✅ Monitoring check completed at $(date)"
EOF

chmod +x $MONITOR_DIR/monitor.sh

# Create performance test script
cat > $MONITOR_DIR/performance-test.sh << 'EOF'
#!/bin/bash

# Performance testing script using Apache Bench
echo "🚀 Running performance tests..."

# Test frontend
echo "Testing Frontend..."
ab -n 100 -c 10 http://localhost:3000/ > frontend-perf.txt 2>&1

# Test API endpoints
echo "Testing API endpoints..."
ab -n 50 -c 5 http://localhost:3000/api/health > api-health-perf.txt 2>&1

# Test backend
echo "Testing Backend..."
ab -n 50 -c 5 http://localhost:8080/health > backend-perf.txt 2>&1

echo "📊 Performance test results:"
echo "Frontend average response time: $(grep 'Time per request' frontend-perf.txt | head -1 | awk '{print $4}') ms"
echo "API health average response time: $(grep 'Time per request' api-health-perf.txt | head -1 | awk '{print $4}') ms"
echo "Backend average response time: $(grep 'Time per request' backend-perf.txt | head -1 | awk '{print $4}') ms"

echo "✅ Performance tests completed"
EOF

chmod +x $MONITOR_DIR/performance-test.sh

# Create monitoring startup script
cat > $MONITOR_DIR/start-monitoring.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting monitoring stack..."

# Start monitoring services
docker-compose -f docker-compose.monitoring.yml up -d

echo "⏳ Waiting for services to start..."
sleep 10

echo "📊 Monitoring services started:"
echo "- Prometheus: http://localhost:9090"
echo "- Grafana: http://localhost:3001 (admin/admin123)"
echo "- Alertmanager: http://localhost:9093"

echo "✅ Monitoring stack is ready!"
EOF

chmod +x $MONITOR_DIR/start-monitoring.sh

print_status "Performance monitoring setup completed!"
print_status "Files created in $MONITOR_DIR/:"
ls -la $MONITOR_DIR/

echo ""
print_status "Next steps:"
echo "1. Start monitoring: cd $MONITOR_DIR && ./start-monitoring.sh"
echo "2. Run performance tests: cd $MONITOR_DIR && ./performance-test.sh"
echo "3. Check system health: cd $MONITOR_DIR && ./monitor.sh"
echo ""
print_status "Monitoring URLs:"
echo "- Prometheus: http://localhost:9090"
echo "- Grafana: http://localhost:3001 (admin/admin123)"
echo "- Alertmanager: http://localhost:9093"

print_warning "Remember to:"
echo "- Configure email alerts in alertmanager.yml"
echo "- Set up proper authentication for production"
echo "- Configure firewall rules for monitoring ports"
echo "- Set up SSL certificates for monitoring services"

echo ""
print_status "Performance monitoring setup completed! 🎉"