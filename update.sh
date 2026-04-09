#!/bin/bash
echo "🚀 Updating project..."

cd ~/Project/ecommarce-full-stack-by-ClaudeAI

# Pull latest code
git pull

# Install dependencies
cd server && npm install --production && cd ..
cd client && npm install && npm run build && cd ..
cd admin && npm install && npm run build && cd ..

# Copy builds to web directory
sudo rm -rf /var/www/gadgetslagbe/client/dist
sudo rm -rf /var/www/gadgetslagbe/admin/dist
sudo cp -r client/dist /var/www/gadgetslagbe/client/
sudo cp -r admin/dist /var/www/gadgetslagbe/admin/
sudo chown -R www-data:www-data /var/www/gadgetslagbe/

# Restart all services
pm2 restart all
pm2 save

echo "✅ Update complete!"
