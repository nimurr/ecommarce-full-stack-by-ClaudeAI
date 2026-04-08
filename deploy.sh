#!/bin/bash
# ============================================
# DEPLOYMENT SCRIPT FOR gadgetslagbe.com
# ============================================
# Run this on your AWS VPS server
# Usage: bash deploy.sh
# ============================================

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   🚀 Deploying gadgetslagbe.com to AWS VPS               ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (sudo bash deploy.sh)${NC}"
    exit 1
fi

# ============================================
# STEP 1: INSTALL SYSTEM DEPENDENCIES
# ============================================
echo -e "\n${YELLOW}[1/8] Installing system dependencies...${NC}"
apt update && apt upgrade -y
apt install -y curl wget git nginx certbot python3-certbot-nginx build-essential

# ============================================
# STEP 2: INSTALL NODE.JS (v18 LTS)
# ============================================
echo -e "\n${YELLOW}[2/8] Installing Node.js 18 LTS...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
node --version
npm --version

# ============================================
# STEP 3: INSTALL PM2
# ============================================
echo -e "\n${YELLOW}[3/8] Installing PM2 process manager...${NC}"
npm install -g pm2
pm2 --version

# ============================================
# STEP 4: SETUP PROJECT DIRECTORY
# ============================================
echo -e "\n${YELLOW}[4/8] Setting up project directory...${NC}"

PROJECT_DIR="/var/www/gadgetslagbe"
mkdir -p $PROJECT_DIR

# Copy project files (adjust source path as needed)
# If you're cloning from git, uncomment the next line:
# git clone <your-repo-url> $PROJECT_DIR

# If files are already in current directory, copy them:
# cp -r /path/to/your/project/* $PROJECT_DIR/

cd $PROJECT_DIR

# ============================================
# STEP 5: INSTALL DEPENDENCIES
# ============================================
echo -e "\n${YELLOW}[5/8] Installing Node.js dependencies...${NC}"

# Server dependencies
echo "Installing server dependencies..."
cd $PROJECT_DIR/server
npm install --production

# Client dependencies
echo "Installing client dependencies..."
cd $PROJECT_DIR/client
npm install
npm run build

# Admin dependencies
echo "Installing admin dependencies..."
cd $PROJECT_DIR/admin
npm install
npm run build

# ============================================
# STEP 6: CONFIGURE ENVIRONMENT VARIABLES
# ============================================
echo -e "\n${YELLOW}[6/8] Configuring environment variables...${NC}"

# Copy production env files
if [ -f "$PROJECT_DIR/server/.env.production" ]; then
    cp $PROJECT_DIR/server/.env.production $PROJECT_DIR/server/.env
    echo "✅ Server .env configured"
    echo -e "${RED}⚠️  IMPORTANT: Edit /var/www/gadgetslagbe/server/.env with your actual credentials!${NC}"
fi

if [ -f "$PROJECT_DIR/client/.env.production" ]; then
    cp $PROJECT_DIR/client/.env.production $PROJECT_DIR/client/.env
    echo "✅ Client .env configured"
fi

if [ -f "$PROJECT_DIR/admin/.env.production" ]; then
    cp $PROJECT_DIR/admin/.env.production $PROJECT_DIR/admin/.env
    echo "✅ Admin .env configured"
fi

# ============================================
# STEP 7: SETUP NGINX
# ============================================
echo -e "\n${YELLOW}[7/8] Configuring Nginx...${NC}"

# Copy nginx config
if [ -f "$PROJECT_DIR/nginx.conf" ]; then
    cp $PROJECT_DIR/nginx.conf /etc/nginx/sites-available/gadgetslagbe.com
    ln -sf /etc/nginx/sites-available/gadgetslagbe.com /etc/nginx/sites-enabled/gadgetslagbe.com
    rm -f /etc/nginx/sites-enabled/default
    
    # Test nginx config
    nginx -t
    if [ $? -eq 0 ]; then
        echo "✅ Nginx configuration is valid"
        systemctl restart nginx
        systemctl enable nginx
        echo "✅ Nginx restarted successfully"
    else
        echo -e "${RED}❌ Nginx configuration has errors!${NC}"
        exit 1
    fi
fi

# Create log directories
mkdir -p /var/log/nginx
mkdir -p /var/log/pm2

# ============================================
# STEP 8: START APPLICATIONS WITH PM2
# ============================================
echo -e "\n${YELLOW}[8/8] Starting applications with PM2...${NC}"

cd $PROJECT_DIR

# Stop any existing processes
pm2 delete all || true

# Start applications
if [ -f "ecosystem.config.cjs" ]; then
    pm2 start ecosystem.config.cjs --env production
    echo "✅ PM2 started from ecosystem config"
else
    # Manual start
    pm2 start server/server.js --name gadgetslagbe-api --env production
    cd $PROJECT_DIR/client && pm2 start npm --name gadgetslagbe-client -- run dev
    cd $PROJECT_DIR/admin && pm2 start npm --name gadgetslagbe-admin -- run dev
    echo "✅ PM2 started manually"
fi

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
echo "✅ PM2 startup configured"

# ============================================
# SETUP SSL CERTIFICATES
# ============================================
echo -e "\n${YELLOW}Setting up SSL certificates with Let's Encrypt...${NC}"
echo -e "${YELLOW}Note: Make sure your DNS is pointed to this server first!${NC}"

# Uncomment when ready:
# certbot --nginx -d gadgetslagbe.com -d www.gadgetslagbe.com -d admin.gadgetslagbe.com -d api.gadgetslagbe.com

# ============================================
# SETUP FIREWALL
# ============================================
echo -e "\n${YELLOW}Configuring firewall...${NC}"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
echo "✅ Firewall configured"

# ============================================
# FINAL STATUS
# ============================================
echo -e "\n${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║   ✅ Deployment Complete!                                 ║${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║   📡 API: https://api.gadgetslagbe.com                    ║${NC}"
echo -e "${GREEN}║   🛍️  Client: https://gadgetslagbe.com                    ║${NC}"
echo -e "${GREEN}║   ⚙️  Admin: https://admin.gadgetslagbe.com               ║${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║   📊 PM2 Status:${NC}"
pm2 status
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${YELLOW}📝 NEXT STEPS:${NC}"
echo "1. Edit /var/www/gadgetslagbe/server/.env with your actual credentials"
echo "2. Point your DNS (gadgetslagbe.com) to this server's public IP"
echo "3. Run: certbot --nginx -d gadgetslagbe.com -d www.gadgetslagbe.com -d admin.gadgetslagbe.com -d api.gadgetslagbe.com"
echo "4. Test all endpoints: curl https://api.gadgetslagbe.com/api/health"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo "  pm2 status                    - Check app status"
echo "  pm2 logs                      - View logs"
echo "  pm2 restart all               - Restart all apps"
echo "  pm2 restart gadgetslagbe-api  - Restart API only"
echo "  nginx -t                      - Test nginx config"
echo "  systemctl restart nginx       - Restart nginx"
echo ""
