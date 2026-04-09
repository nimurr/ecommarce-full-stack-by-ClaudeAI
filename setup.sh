#!/bin/bash
# ============================================
# ONE-CLICK DEPLOY SCRIPT
# ============================================
# Run this: bash setup.sh
# ============================================

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting setup...${NC}"

# Install dependencies
echo "Installing system packages..."
sudo apt update -y
sudo apt install -y nodejs build-essential nginx git
sudo npm install -g pm2

# Install node dependencies
echo "Installing server..."
cd server && npm install --production && cd ..

echo "Installing client..."
cd client && npm install && npm run build && cd ..

echo "Installing admin..."
cd admin && npm install && npm run build && cd ..

# Copy env files
echo "Setting up .env files..."
cp server/.env.production server/.env
cp client/.env.production client/.env
cp admin/.env.production admin/.env

# Nginx setup
echo "Configuring nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/gadgetslagbe.com
sudo ln -sf /etc/nginx/sites-available/gadgetslagbe.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Create SSL dir
sudo mkdir -p /etc/ssl/certs
sudo mkdir -p /etc/ssl/private

# Generate cert
openssl req -x509 -nodes \
  -days 365 \
  -newkey rsa:2048 \
  -keyout /tmp/ssl.key \
  -out /tmp/ssl.crt \
  -subj "/CN=gadgetslagbe.com"

# Move certs
sudo mv /tmp/ssl.key /etc/ssl/private/gadgetslagbe.com.key
sudo mv /tmp/ssl.crt /etc/ssl/certs/gadgetslagbe.com.crt

# Setup dirs
sudo mkdir -p /var/www/gadgetslagbe
sudo cp -r client/dist /var/www/gadgetslagbe/client/
sudo cp -r admin/dist /var/www/gadgetslagbe/admin/

# Create public dir
mkdir -p /var/www/gadgetslagbe/client/dist/public
sudo ln -sf ~/Project/ecommarce-full-stack-by-ClaudeAI/public/images /var/www/gadgetslagbe/client/dist/public/images

# Fix perms
sudo chmod 755 ~
sudo chmod 755 ~/Project
sudo chmod 755 ~/Project/ecommarce-full-stack-by-ClaudeAI

# Test nginx
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Start PM2
pm2 start server/server.js --name api
cd client && pm2 start npm --name client -- run dev && cd ..
cd admin && pm2 start npm --name admin -- run dev && cd ..

# Save PM2
pm2 save

echo ""
echo -e "${GREEN}✅ DONE!${NC}"
echo -e "${GREEN}Check: curl http://localhost:5000/api/health${NC}"
