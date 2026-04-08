# 🚀 COMPLETE DEPLOYMENT GUIDE FOR gadgetslagbe.com

## 📋 PREREQUISITES

Before starting, ensure you have:

- ✅ AWS EC2 instance (Ubuntu 20.04/22.04) running
- ✅ Elastic IP allocated and associated with your instance
- ✅ Domain `gadgetslagbe.com` added to Cloudflare
- ✅ MongoDB Atlas database (or local MongoDB on VPS)
- ✅ SSH access to your VPS
- ✅ Root/sudo access on VPS

---

## 🎯 ARCHITECTURE OVERVIEW

```
Internet
    ↓
Cloudflare (DNS + CDN + SSL)
    ↓
AWS VPS Public IP (Elastic IP)
    ↓
Nginx (Reverse Proxy + SSL Termination)
    ↓
┌─────────────────┬──────────────────┬─────────────────┐
│   Client App    │   Admin App      │   API Server    │
│  Port 5173      │   Port 5174      │   Port 5000     │
│ gadgetslagbe    │ admin.gadgetslagbe│ api.gadgetslagbe│
└─────────────────┴──────────────────┴─────────────────┘
    ↓
MongoDB Atlas / Local MongoDB
```

---

## 📝 STEP-BY-STEP DEPLOYMENT

### STEP 1: CLOUDFLARE DNS CONFIGURATION

1. **Login to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Select your domain: `gadgetslagbe.com`

2. **Add DNS Records**

   Go to **DNS** → **Records** → **Add Records**

   | Type | Name | Content | Proxy Status |
   |------|------|---------|--------------|
   | A | `@` | `YOUR_ELASTIC_IP` | Proxied (Orange) |
   | A | `www` | `YOUR_ELASTIC_IP` | Proxied (Orange) |
   | A | `admin` | `YOUR_ELASTIC_IP` | Proxied (Orange) |
   | A | `api` | `YOUR_ELASTIC_IP` | Proxied (Orange) |

   **Replace `YOUR_ELASTIC_IP` with your actual AWS Elastic IP**

3. **SSL/TLS Settings**
   - Go to **SSL/TLS** → **Overview**
   - Set to **Full (strict)** mode
   - This ensures end-to-end encryption

4. **Wait for DNS Propagation**
   - Usually takes 5-15 minutes with Cloudflare
   - Test with: `ping gadgetslagbe.com`

---

### STEP 2: AWS VPS PREPARATION

1. **SSH into your VPS**
   ```bash
   ssh -i your-key.pem ubuntu@YOUR_ELASTIC_IP
   ```

2. **Update system packages**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Verify your Elastic IP**
   ```bash
   curl ifconfig.me
   # Should return your Elastic IP
   ```

---

### STEP 3: UPLOAD PROJECT FILES

**Option A: Clone from Git Repository (Recommended)**

```bash
# On your VPS
cd /var/www
sudo git clone https://github.com/yourusername/your-repo.git gadgetslagbe
cd gadgetslagbe
```

**Option B: Upload via SCP/SFTP**

From your local machine:
```bash
# Upload entire project
scp -i your-key.pem -r D:\Nerob\ecommarce-full-stack-by-ClaudeAI ubuntu@YOUR_ELASTIC_IP:/home/ubuntu/

# On VPS, move to proper location
ssh -i your-key.pem ubuntu@YOUR_ELASTIC_IP
sudo mkdir -p /var/www/gadgetslagbe
sudo mv /home/ubuntu/ecommarce-full-stack-by-ClaudeAI/* /var/www/gadgetslagbe/
sudo chown -R ubuntu:ubuntu /var/www/gadgetslagbe
```

---

### STEP 4: CONFIGURE ENVIRONMENT VARIABLES

1. **Edit Server `.env` file**

   ```bash
   cd /var/www/gadgetslagbe/server
   cp .env.production .env
   nano .env
   ```

   **Update these critical values:**

   ```env
   # Database - Get from MongoDB Atlas
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gadgetslagbe?retryWrites=true&w=majority

   # JWT Secret - Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   JWT_SECRET=a1b2c3d4e5f6... (64+ random characters)

   # Cloudinary - Get from https://cloudinary.com
   CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
   CLOUDINARY_API_KEY=your_actual_api_key
   CLOUDINARY_API_SECRET=your_actual_api_secret

   # Email - Use Gmail App Password
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your_16_char_app_password

   # Payment (SSLCommerz) - Get from https://sslcommerz.com
   SSLCOMMERZ_STORE_ID=your_store_id
   SSLCOMMERZ_STORE_PASSWORD=your_store_password

   # Courier (Steadfast) - Get from https://steadfast.com.bd
   STEADFAST_API_KEY=your_api_key
   STEADFAST_API_SECRET=your_api_secret
   ```

2. **Verify Client `.env`**

   ```bash
   cd /var/www/gadgetslagbe/client
   cat .env.production
   ```

   Should contain:
   ```env
   VITE_API_URL=https://api.gadgetslagbe.com/api
   VITE_CLIENT_URL=https://gadgetslagbe.com
   ```

3. **Verify Admin `.env`**

   ```bash
   cd /var/www/gadgetslagbe/admin
   cat .env.production
   ```

   Should contain:
   ```env
   VITE_API_URL=https://api.gadgetslagbe.com/api
   VITE_ADMIN_URL=https://admin.gadgetslagbe.com
   ```

---

### STEP 5: RUN DEPLOYMENT SCRIPT

1. **Make script executable**

   ```bash
   cd /var/www/gadgetslagbe
   chmod +x deploy.sh
   ```

2. **Run deployment**

   ```bash
   sudo bash deploy.sh
   ```

   This will:
   - ✅ Install Node.js, npm, PM2
   - ✅ Install Nginx
   - ✅ Install all dependencies
   - ✅ Build client and admin apps
   - ✅ Configure Nginx
   - ✅ Start all services with PM2

3. **Watch for errors**
   - If any step fails, check the error message
   - Fix the issue and re-run the script

---

### STEP 6: INSTALL SSL CERTIFICATES

**IMPORTANT: Only run this AFTER DNS is fully propagated!**

1. **Run quick setup script**

   ```bash
   sudo bash quick-setup.sh
   ```

   OR manually with Certbot:

   ```bash
   sudo certbot --nginx \
     -d gadgetslagbe.com \
     -d www.gadgetslagbe.com \
     -d admin.gadgetslagbe.com \
     -d api.gadgetslagbe.com
   ```

2. **Follow Certbot prompts**
   - Enter your email
   - Agree to terms
   - Choose whether to redirect HTTP to HTTPS (Yes)

3. **Verify certificates**
   ```bash
   sudo certbot certificates
   ```

---

### STEP 7: VERIFY DEPLOYMENT

1. **Check PM2 status**

   ```bash
   pm2 status
   ```

   All apps should show `online` status

2. **Check Nginx**

   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

3. **Test API**

   ```bash
   curl https://api.gadgetslagbe.com/api/health
   ```

   Should return:
   ```json
   {
     "success": true,
     "message": "API is running",
     "timestamp": "2024-...",
     "environment": "production"
   }
   ```

4. **Test Websites**

   Open in browser:
   - https://gadgetslagbe.com (Client)
   - https://admin.gadgetslagbe.com (Admin)
   - https://api.gadgetslagbe.com/api (API)

---

### STEP 8: SETUP AUTO-RENEWAL

1. **Test SSL auto-renewal**

   ```bash
   sudo certbot renew --dry-run
   ```

2. **Verify cron job**

   ```bash
   sudo crontab -l
   ```

   Should show Certbot renewal task

---

## 🔧 USEFUL COMMANDS

### PM2 Commands
```bash
pm2 status                    # Check all apps status
pm2 logs                      # View all logs
pm2 logs gadgetslagbe-api     # View API logs only
pm2 restart all               # Restart all apps
pm2 restart gadgetslagbe-api  # Restart API only
pm2 stop all                  # Stop all apps
pm2 delete all                # Remove all apps
pm2 monit                     # Real-time monitoring
```

### Nginx Commands
```bash
sudo nginx -t                 # Test configuration
sudo systemctl restart nginx  # Restart nginx
sudo systemctl reload nginx   # Reload config (no downtime)
sudo systemctl status nginx   # Check status
tail -f /var/log/nginx/access.log  # View access logs
```

### SSL Commands
```bash
sudo certbot certificates     # List certificates
sudo certbot renew            # Renew certificates
sudo certbot delete --cert-name gadgetslagbe.com  # Delete cert
```

### System Commands
```bash
sudo ufw status               # Check firewall
sudo ufw allow 'Nginx Full'   # Allow nginx
netstat -tulpn                # Check listening ports
htop                          # Monitor resources
df -h                         # Check disk space
```

---

## 🚨 TROUBLESHOOTING

### Problem: 502 Bad Gateway

**Solution:**
```bash
# Check if backend is running
pm2 status

# Check backend logs
pm2 logs gadgetslagbe-api

# Restart backend
pm2 restart gadgetslagbe-api

# Check nginx error logs
tail -f /var/log/nginx/error.log
```

### Problem: SSL Certificate Errors

**Solution:**
```bash
# Verify DNS is pointing correctly
dig gadgetslagbe.com

# Check certificate
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal
```

### Problem: Can't Connect to Server

**Checklist:**
1. ✅ Elastic IP associated with instance
2. ✅ Security group allows ports 80, 443
3. ✅ Nginx is running: `sudo systemctl status nginx`
4. ✅ Firewall allows traffic: `sudo ufw status`
5. ✅ DNS propagated: `ping gadgetslagbe.com`

### Problem: Database Connection Failed

**Solution:**
```bash
# Check MongoDB URI in .env
cat /var/www/gadgetslagbe/server/.env | grep MONGODB_URI

# Test connection
mongosh "mongodb+srv://..."

# Check MongoDB Atlas IP whitelist
# Add your VPS IP to MongoDB Atlas network access
```

### Problem: CORS Errors

**Solution:**

Edit `server/server.js` and update CORS config:
```javascript
app.use(cors({
  origin: [
    'https://gadgetslagbe.com',
    'https://www.gadgetslagbe.com',
    'https://admin.gadgetslagbe.com'
  ],
  credentials: true,
}));
```

---

## 🔐 SECURITY CHECKLIST

- [ ] Changed JWT_SECRET to strong random value
- [ ] Set strong MongoDB password
- [ ] Enabled MongoDB Atlas IP whitelist (add only VPS IP)
- [ ] Generated Gmail app password (not using real password)
- [ ] SSL certificates installed and auto-renewing
- [ ] Firewall configured (only ports 22, 80, 443 open)
- [ ] `.env` files not committed to git
- [ ] Rate limiting enabled
- [ ] File upload size limited
- [ ] Security headers configured (helmet, hpp, xss)

---

## 📊 MONITORING & MAINTENANCE

### Daily Checks
```bash
# Check app status
pm2 status

# Check disk space
df -h

# Check logs for errors
pm2 logs --lines 100
```

### Weekly Tasks
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update npm packages
cd /var/www/gadgetslagbe/server && npm update
cd /var/www/gadgetslagbe/client && npm update
cd /var/www/gadgetslagbe/admin && npm update

# Restart apps to apply updates
pm2 restart all
```

### Monthly Tasks
- Review MongoDB Atlas usage
- Check Cloudflare analytics
- Review error logs
- Backup database
- Test SSL renewal

---

## 🔄 DEPLOYING UPDATES

When you make code changes:

```bash
# On VPS
cd /var/www/gadgetslagbe

# Pull latest changes (if using git)
git pull origin main

# Install new dependencies
cd server && npm install
cd ../client && npm install && npm run build
cd ../admin && npm install && npm run build

# Restart apps
cd /var/www/gadgetslagbe
pm2 restart all

# Monitor logs
pm2 logs
```

---

## 📞 SUPPORT

If you encounter issues:

1. Check logs: `pm2 logs` and `/var/log/nginx/`
2. Verify services: `pm2 status` and `sudo systemctl status nginx`
3. Test endpoints: `curl https://api.gadgetslagbe.com/api/health`
4. Check Cloudflare dashboard for DNS/SSL issues
5. Verify AWS security groups allow traffic

---

## 🎉 CONGRATULATIONS!

Your e-commerce platform is now live at:

- 🌐 **Client**: https://gadgetslagbe.com
- 🔧 **Admin**: https://admin.gadgetslagbe.com
- 📡 **API**: https://api.gadgetslagbe.com/api

**Next Steps:**
- Add products via admin panel
- Configure payment gateway (SSLCommerz)
- Setup email notifications
- Test checkout flow
- Monitor analytics in Cloudflare

---

**Last Updated:** April 8, 2026
**Version:** 1.0.0
