#!/bin/bash
# ============================================
# QUICK SETUP SCRIPT FOR gadgetslagbe.com
# ============================================
# Run this after DNS is configured
# Usage: bash quick-setup.sh
# ============================================

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   ⚡ Quick Setup for gadgetslagbe.com                     ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"

PROJECT_DIR="/var/www/gadgetslagbe"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (sudo bash quick-setup.sh)${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Step 1: Setting up SSL certificates...${NC}"
certbot --nginx \
    -d gadgetslagbe.com \
    -d www.gadgetslagbe.com \
    -d admin.gadgetslagbe.com \
    -d api.gadgetslagbe.com \
    --non-interactive \
    --agree-tos \
    --email your-email@gmail.com

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSL certificates installed successfully!${NC}"
else
    echo -e "${RED}❌ SSL setup failed. Check your DNS configuration.${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Step 2: Testing nginx configuration...${NC}"
nginx -t
if [ $? -eq 0 ]; then
    systemctl restart nginx
    echo -e "${GREEN}✅ Nginx restarted${NC}"
fi

echo -e "\n${YELLOW}Step 3: Restarting PM2 processes...${NC}"
cd $PROJECT_DIR
pm2 restart all
echo -e "${GREEN}✅ PM2 processes restarted${NC}"

echo -e "\n${YELLOW}Step 4: Testing API...${NC}"
sleep 2
curl -f https://api.gadgetslagbe.com/api/health || {
    echo -e "${RED}⚠️  API health check failed. Check logs: pm2 logs gadgetslagbe-api${NC}"
}

echo -e "\n${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║   ✅ Setup Complete!                                      ║${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║   🌐 Visit: https://gadgetslagbe.com                      ║${NC}"
echo -e "${GREEN}║   🔧 Admin: https://admin.gadgetslagbe.com                ║${NC}"
echo -e "${GREEN}║   📡 API: https://api.gadgetslagbe.com/api/health         ║${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${YELLOW}Verify everything is working:${NC}"
echo "  curl https://api.gadgetslagbe.com/api/health"
echo "  curl https://gadgetslagbe.com"
echo "  curl https://admin.gadgetslagbe.com"
echo ""
