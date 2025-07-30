# 🚀 Production Deployment Guide - Urgent Studio

Panduan lengkap untuk deployment aplikasi Urgent Studio ke production environment.

## 📋 Prerequisites

Sebelum menjalankan deployment, pastikan Anda memiliki:

1. **Server Requirements:**
   - Ubuntu 20.04+ atau CentOS 8+
   - Minimum 2GB RAM, 2 CPU cores
   - 20GB+ disk space
   - Root atau sudo access

2. **Domain & DNS:**
   - Domain yang sudah terdaftar
   - Akses ke DNS management
   - Email untuk SSL certificate

3. **Dependencies:**
   - Docker & Docker Compose
   - Node.js 18+
   - Go 1.21+
   - PostgreSQL 13+
   - Nginx

## 🛠️ Available Scripts

### 1. `production-master.sh` - Master Script
Script utama yang menjalankan semua langkah deployment secara otomatis.

```bash
./scripts/production-master.sh urgent-studio.com admin@urgent-studio.com
```

**Langkah yang dijalankan:**
1. Production readiness audit
2. Staging deployment test
3. Monitoring & logging setup
4. SSL certificate & domain setup
5. Production deployment
6. Post-deployment verification

### 2. `production-readiness-audit.js` - Audit Script
Memeriksa kesiapan aplikasi untuk production.

```bash
node production-readiness-audit.js
```

**Pemeriksaan yang dilakukan:**
- File konfigurasi (.env, package.json, dll)
- Build process (frontend & backend)
- TypeScript configuration
- ESLint compliance
- Dependencies security
- Database configuration
- Deployment readiness

### 3. `deploy-production.sh` - Production Deployment
Deploy aplikasi ke production environment.

```bash
./scripts/deploy-production.sh
```

**Fitur:**
- Pre-deployment checks
- Automated build process
- Service configuration
- Health checks
- Rollback capability

### 4. `setup-monitoring.sh` - Monitoring Setup
Setup monitoring dan logging infrastructure.

```bash
./scripts/setup-monitoring.sh
```

**Komponen yang disetup:**
- Prometheus (metrics collection)
- Grafana (visualization)
- Node Exporter (system metrics)
- Nginx Exporter (web server metrics)
- Log rotation
- Alerting rules

### 5. `setup-ssl.sh` - SSL Certificate Setup
Setup SSL certificate dan domain configuration.

```bash
./scripts/setup-ssl.sh urgent-studio.com admin@urgent-studio.com
```

**Fitur:**
- Let's Encrypt certificate
- Nginx SSL configuration
- Auto-renewal setup
- Security headers
- HTTPS redirect

### 6. `test-staging.sh` - Staging Environment Test
Test deployment di staging environment sebelum production.

```bash
./scripts/test-staging.sh
```

**Test yang dilakukan:**
- Service health checks
- Database connectivity
- API endpoint testing
- Load testing
- Security testing
- Performance monitoring

## 🚀 Quick Start

### Option 1: Automated Deployment (Recommended)

```bash
# Clone repository
git clone <repository-url>
cd urgent-studio-2025-main

# Run master script
./scripts/production-master.sh your-domain.com your-email@domain.com
```

### Option 2: Step-by-Step Deployment

```bash
# 1. Run audit
node production-readiness-audit.js

# 2. Test staging
./scripts/test-staging.sh

# 3. Setup monitoring
./scripts/setup-monitoring.sh

# 4. Setup SSL
./scripts/setup-ssl.sh your-domain.com your-email@domain.com

# 5. Deploy to production
./scripts/deploy-production.sh
```

## 📊 Monitoring & Logging

### Grafana Dashboard
- URL: `http://localhost:3001`
- Username: `admin`
- Password: `urgent-studio-admin`

### Prometheus Metrics
- URL: `http://localhost:9090`
- Metrics endpoint: `/metrics`

### Log Files
- Application: `/var/log/urgent-studio/`
- Nginx: `/var/log/nginx/`
- System: `journalctl -u urgent-studio-*`

## 🔒 Security Features

### SSL/TLS
- Let's Encrypt certificates
- Auto-renewal (twice daily)
- Strong cipher suites
- HSTS headers

### Firewall
- UFW enabled
- Only ports 22, 80, 443 open
- Rate limiting on API endpoints

### Authentication
- JWT tokens for API
- Basic auth for monitoring
- Session management

## 🗄️ Database

### Production Database
- PostgreSQL 13+
- Automated backups
- Connection pooling
- SSL connections

### Backup Strategy
- Daily automated backups
- 30-day retention
- Point-in-time recovery

## 🔧 Configuration Files

### Environment Variables
```bash
# Production environment
.env.production

# Staging environment  
.env.staging
```

### Service Configuration
```bash
# Systemd services
/etc/systemd/system/urgent-studio-*.service

# Nginx configuration
/etc/nginx/sites-available/urgent-studio
```

## 📈 Performance Optimization

### Frontend (Next.js)
- Static generation
- Image optimization
- Bundle splitting
- CDN ready

### Backend (Go)
- Connection pooling
- Caching layers
- Graceful shutdown
- Health checks

### Database
- Indexed queries
- Connection pooling
- Query optimization
- Monitoring

## 🚨 Troubleshooting

### Common Issues

1. **SSL Certificate Failed**
   ```bash
   # Check DNS records
   dig your-domain.com
   
   # Retry certificate
   sudo certbot renew --dry-run
   ```

2. **Service Not Starting**
   ```bash
   # Check service status
   sudo systemctl status urgent-studio-backend
   
   # View logs
   sudo journalctl -u urgent-studio-backend -f
   ```

3. **Database Connection Failed**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Test connection
   psql -h localhost -U urgent_studio -d urgent_studio
   ```

### Health Check Commands

```bash
# Application health
curl https://your-domain.com/health

# API health
curl https://your-domain.com/api/ping

# Monitoring health
curl http://localhost:3001/api/health
curl http://localhost:9090/-/healthy
```

## 🔄 Maintenance

### Regular Tasks

1. **System Updates**
   ```bash
   sudo apt update && sudo apt upgrade
   ```

2. **Certificate Renewal**
   ```bash
   sudo certbot renew
   ```

3. **Log Cleanup**
   ```bash
   sudo logrotate -f /etc/logrotate.d/urgent-studio
   ```

4. **Database Maintenance**
   ```bash
   sudo -u postgres psql -c "VACUUM ANALYZE;"
   ```

### Backup Verification

```bash
# Test database backup
sudo -u postgres pg_restore --list /var/backups/urgent-studio/latest.sql

# Test monitoring backup
ls -la /var/backups/urgent-studio/
```

## 📞 Support

### Service Management

```bash
# Start services
sudo systemctl start urgent-studio-*

# Stop services
sudo systemctl stop urgent-studio-*

# Restart services
sudo systemctl restart urgent-studio-*

# View service status
sudo systemctl status urgent-studio-*
```

### Log Analysis

```bash
# Application logs
sudo tail -f /var/log/urgent-studio/app.log

# Error logs
sudo grep -i error /var/log/urgent-studio/*.log

# System logs
sudo journalctl -u urgent-studio-* --since "1 hour ago"
```

## 🎯 Next Steps After Deployment

1. **DNS Configuration**
   - Point your domain to server IP
   - Setup CDN (optional)
   - Configure subdomains

2. **Monitoring Setup**
   - Configure alert notifications
   - Setup Slack/email alerts
   - Create custom dashboards

3. **Security Hardening**
   - Setup fail2ban
   - Configure intrusion detection
   - Regular security audits

4. **Performance Optimization**
   - Setup CDN
   - Configure caching
   - Database tuning

5. **Disaster Recovery**
   - Test backup restoration
   - Document recovery procedures
   - Setup monitoring alerts

## 📝 License

This deployment guide is part of the Urgent Studio project.

---

**Happy Deploying! 🚀**

For additional support, please refer to the deployment report generated after successful deployment.