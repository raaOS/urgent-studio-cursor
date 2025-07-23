#!/bin/bash

# Production Security Setup Script
# This script sets up security configurations for production deployment

set -e

echo "🔒 Setting up production security configurations..."

# Create SSL directory if it doesn't exist
mkdir -p ssl

# Generate self-signed SSL certificate for development/testing
# In production, replace with real SSL certificates from Let's Encrypt or CA
if [ ! -f ssl/cert.pem ] || [ ! -f ssl/private.key ]; then
    echo "📜 Generating SSL certificates..."
    openssl req -x509 -newkey rsa:4096 -keyout ssl/private.key -out ssl/cert.pem -days 365 -nodes \
        -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Urgent Studio/OU=IT Department/CN=localhost"
    chmod 600 ssl/private.key
    chmod 644 ssl/cert.pem
    echo "✅ SSL certificates generated"
fi

# Set proper file permissions
echo "🔐 Setting secure file permissions..."
find . -name "*.env*" -exec chmod 600 {} \; 2>/dev/null || true
find . -name "docker-compose*.yml" -exec chmod 644 {} \;
find . -name "Dockerfile*" -exec chmod 644 {} \;

# Create production environment file if it doesn't exist
if [ ! -f .env.prod ]; then
    echo "📝 Creating production environment template..."
    cp .env.prod.example .env.prod
    echo "⚠️  IMPORTANT: Edit .env.prod with your actual production values!"
fi

echo "✅ Security setup completed!"
echo ""
echo "🚨 SECURITY CHECKLIST:"
echo "1. ✅ SSL certificates generated"
echo "2. ✅ File permissions secured"
echo "3. ✅ Environment template created"
echo "4. ⚠️  Update .env.prod with real values"
echo "5. ⚠️  Replace self-signed SSL with real certificates"
echo "6. ⚠️  Review and update all default passwords"
echo ""