# 🚀 QUICK START CHECKLIST FOR gadgetslagbe.com

## ✅ BEFORE DEPLOYMENT

- [ ] AWS EC2 instance running (Ubuntu 20.04/22.04)
- [ ] Elastic IP allocated and associated with instance
- [ ] MongoDB Atlas database created
- [ ] Cloudflare account setup with gadgetslagbe.com
- [ ] SSH key ready for VPS access

## ✅ CLOUDFLARE SETUP (5 minutes)

1. **Add DNS Records in Cloudflare:**
   - [ ] A record: `@` → YOUR_ELASTIC_IP (Proxied)
   - [ ] A record: `www` → YOUR_ELASTIC_IP (Proxied)
   - [ ] A record: `admin` → YOUR_ELASTIC_IP (Proxied)
   - [ ] A record: `api` → YOUR_ELASTIC_IP (Proxied)

2. **SSL/TLS Settings:**
   - [ ] Set to "Full (strict)" mode

3. **Wait for propagation:**
   - [ ] Test: `ping gadgetslagbe.com` (should resolve to your IP)

## ✅ SERVER SETUP (15-20 minutes)

1. **SSH to VPS:**
   ```bash
   ssh -i your-key.pem ubuntu@YOUR_ELASTIC_IP
   ```

2. **Upload/Clone Project:**
   - [ ] Files uploaded to `/var/www/gadgetslagbe`

3. **Configure Environment Variables:**
   - [ ] Edit `server/.env` with production credentials
   - [ ] Generate JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - [ ] Add MongoDB URI
   - [ ] Add Cloudinary credentials
   - [ ] Add Email credentials
   - [ ] Copy `.env.production` to `.env` in client and admin folders

4. **Run Deployment Script:**
   ```bash
   cd /var/www/gadgetslagbe
   sudo bash deploy.sh
   ```
   - [ ] Script completed without errors

5. **Install SSL Certificates:**
   ```bash
   sudo bash quick-setup.sh
   ```
   - [ ] SSL certificates installed successfully

## ✅ VERIFICATION (5 minutes)

- [ ] Test API: `curl https://api.gadgetslagbe.com/api/health`
- [ ] Visit: https://gadgetslagbe.com
- [ ] Visit: https://admin.gadgetslagbe.com
- [ ] Visit: https://api.gadgetslagbe.com/api

## ✅ POST-DEPLOYMENT (10 minutes)

- [ ] Login to admin panel
- [ ] Add first product
- [ ] Test checkout flow
- [ ] Verify email notifications work
- [ ] Test payment gateway (if configured)
- [ ] Check all logs: `pm2 logs`

## 🔧 TROUBLESHOOTING COMMANDS

```bash
# Check status
pm2 status
sudo systemctl status nginx

# View logs
pm2 logs
tail -f /var/log/nginx/error.log

# Restart services
pm2 restart all
sudo systemctl restart nginx

# Test configuration
sudo nginx -t
```

## 📚 IMPORTANT FILES CREATED

1. **Environment Files:**
   - `server/.env.production` - Server production config
   - `client/.env.production` - Client production config
   - `admin/.env.production` - Admin production config

2. **Configuration Files:**
   - `nginx.conf` - Nginx reverse proxy configuration
   - `ecosystem.config.cjs` - PM2 process manager configuration

3. **Deployment Scripts:**
   - `deploy.sh` - Full deployment script
   - `quick-setup.sh` - SSL and final setup script

4. **Documentation:**
   - `DEPLOYMENT_GUIDE_gadgetslagbe.md` - Complete guide
   - `QUICK_START.md` - This file

## 🎯 DOMAIN STRUCTURE

```
https://gadgetslagbe.com          → Client (Customer-facing store)
https://www.gadgetslagbe.com      → Client (redirects to non-www)
https://admin.gadgetslagbe.com    → Admin Dashboard
https://api.gadgetslagbe.com      → Backend API
```

## 🔐 CRITICAL SECURITY STEPS

- [ ] Generate strong JWT_SECRET (64+ chars)
- [ ] Use strong MongoDB password
- [ ] Whitelist VPS IP in MongoDB Atlas
- [ ] Use Gmail app password (not real password)
- [ ] Keep .env files secure (never commit to git)
- [ ] Enable AWS security group restrictions
- [ ] Regular system updates

## 📞 NEED HELP?

Check the full guide: `DEPLOYMENT_GUIDE_gadgetslagbe.md`

Common issues and solutions are in the troubleshooting section.
