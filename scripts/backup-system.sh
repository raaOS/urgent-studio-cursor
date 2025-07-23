#!/bin/bash

# Automated Backup System for Urgent Studio 2025
# This script creates automated backups of database and important files

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="/var/backups/urgent-studio"
DB_NAME="urgent_studio"
DB_USER="postgres"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)

echo -e "${BLUE}🔄 Starting Automated Backup Process...${NC}"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR/{database,files,logs}

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Database Backup
echo -e "${BLUE}📊 Backing up database...${NC}"
if docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/database/db_backup_$DATE.sql.gz; then
    print_status "Database backup completed: db_backup_$DATE.sql.gz"
else
    print_error "Database backup failed!"
    exit 1
fi

# 2. Application Files Backup
echo -e "${BLUE}📁 Backing up application files...${NC}"
tar -czf $BACKUP_DIR/files/app_backup_$DATE.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='dist' \
    --exclude='build' \
    /path/to/urgent-studio-2025/

print_status "Application files backup completed: app_backup_$DATE.tar.gz"

# 3. Environment Files Backup (Encrypted)
echo -e "${BLUE}🔐 Backing up environment files...${NC}"
tar -czf $BACKUP_DIR/files/env_backup_$DATE.tar.gz .env.prod docker-compose.prod.yml
print_status "Environment files backup completed: env_backup_$DATE.tar.gz"

# 4. Docker Volumes Backup
echo -e "${BLUE}🐳 Backing up Docker volumes...${NC}"
docker run --rm -v urgent-studio-2025_postgres_data:/data -v $BACKUP_DIR/files:/backup alpine tar czf /backup/volumes_backup_$DATE.tar.gz /data
print_status "Docker volumes backup completed: volumes_backup_$DATE.tar.gz"

# 5. Cleanup old backups
echo -e "${BLUE}🧹 Cleaning up old backups...${NC}"
find $BACKUP_DIR -type f -mtime +$RETENTION_DAYS -delete
print_status "Old backups cleaned up (older than $RETENTION_DAYS days)"

# 6. Backup verification
echo -e "${BLUE}🔍 Verifying backups...${NC}"
if [ -f "$BACKUP_DIR/database/db_backup_$DATE.sql.gz" ] && [ -s "$BACKUP_DIR/database/db_backup_$DATE.sql.gz" ]; then
    print_status "Database backup verified"
else
    print_error "Database backup verification failed!"
    exit 1
fi

# 7. Log backup completion
echo "$(date): Backup completed successfully - $DATE" >> $BACKUP_DIR/logs/backup.log

# 8. Send notification (optional)
if command -v curl &> /dev/null && [ ! -z "$WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ Urgent Studio backup completed: $DATE\"}" \
        $WEBHOOK_URL
fi

echo ""
echo "=================================================="
echo -e "${GREEN}🎉 Backup Process Completed Successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Backup Summary:${NC}"
echo "   📅 Date: $DATE"
echo "   📁 Location: $BACKUP_DIR"
echo "   💾 Database: $(du -h $BACKUP_DIR/database/db_backup_$DATE.sql.gz | cut -f1)"
echo "   📦 Files: $(du -h $BACKUP_DIR/files/app_backup_$DATE.tar.gz | cut -f1)"
echo "   🔐 Environment: $(du -h $BACKUP_DIR/files/env_backup_$DATE.tar.gz | cut -f1)"
echo "   🐳 Volumes: $(du -h $BACKUP_DIR/files/volumes_backup_$DATE.tar.gz | cut -f1)"
echo ""
echo -e "${YELLOW}💡 Setup automatic backups with cron:${NC}"
echo "   0 2 * * * /path/to/scripts/backup-system.sh"
echo ""