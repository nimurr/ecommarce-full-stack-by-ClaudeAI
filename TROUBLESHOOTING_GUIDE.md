# 🔧 TROUBLESHOOTING GUIDE FOR gadgetslagbe.com

## Quick Problem Solver

---

## ❌ PROBLEM: "502 Bad Gateway"

### Symptoms:
- Website shows "502 Bad Gateway" error
- Nginx error log shows "connect() failed (111: Connection refused)"

### Solutions:

```bash
# 1. Check if backend is running
pm2 status

# 2. If API shows "stopped" or "errored"
pm2 restart gadgetslagbe-api
pm2 logs gadgetslagbe-api

# 3. Check if port 5000 is listening
netstat -tulpn | grep 5000

# 4. Check server .env file
cat /var/www/gadgetslagbe/server/.env | grep MONGODB_URI
# Make sure MongoDB URI is correct

# 5. Restart PM2
pm2 restart all
pm2 logs

# 6. Check nginx error log
tail -f /var/log/nginx/error.log
```

---

## ❌ PROBLEM: "DNS_PROBE_FINISHED_NXDOMAIN"

### Symptoms:
- Browser can't find gadgetslagbe.com
- "Server IP address could not be found"

### Solutions:

```bash
# 1. Check Cloudflare DNS records
# Login to Cloudflare dashboard
# Verify 4 A records exist:
#   A @ → YOUR_ELASTIC_IP
#   A www → YOUR_ELASTIC_IP
#   A admin → YOUR_ELASTIC_IP
#   A api → YOUR_ELASTIC_IP

# 2. Test DNS propagation
nslookup gadgetslagbe.com
ping gadgetslagbe.com

# 3. Wait 5-15 minutes for DNS propagation
# Or use: https://dnschecker.org/

# 4. Clear browser DNS cache
# Chrome: chrome://net-internals/#dns → Clear host cache
# Or use incognito mode
```

---

## ❌ PROBLEM: "SSL Certificate Error"

### Symptoms:
- Browser shows "Your connection is not private"
- ERR_CERT_DATE_INVALID or ERR_CERT_COMMON_NAME_INVALID

### Solutions:

```bash
# 1. Check if SSL certificate exists
sudo certbot certificates

# 2. If certificate is missing or expired
sudo certbot renew --force-renewal

# 3. Verify nginx SSL configuration
sudo nginx -t

# 4. Check certificate paths in nginx config
cat /etc/nginx/sites-available/gadgetslagbe.com | grep ssl_certificate

# 5. Reload nginx
sudo systemctl reload nginx

# 6. Verify SSL is working
curl -I https://gadgetslagbe.com
# Should show: HTTP/2 200
```

---

## ❌ PROBLEM: "Cannot Connect to Database"

### Symptoms:
- Server logs show "MongoDB connection error"
- API returns 500 error

### Solutions:

```bash
# 1. Check MongoDB URI in .env
cat /var/www/gadgetslagbe/server/.env | grep MONGODB_URI

# 2. Verify MongoDB Atlas Network Access
# Login to MongoDB Atlas
# Go to Network Access
# Add IP: 0.0.0.0/0 (allow from anywhere)
# OR add your VPS IP specifically

# 3. Test MongoDB connection
mongosh "mongodb+srv://username:password@cluster.mongodb.net/gadgetslagbe"

# 4. Check MongoDB Atlas cluster status
# Login to MongoDB Atlas
# Verify cluster is running (not paused)

# 5. Restart backend
pm2 restart gadgetslagbe-api
pm2 logs gadgetslagbe-api
```

---

## ❌ PROBLEM: "Images Not Uploading"

### Symptoms:
- Product image upload fails
- Console shows Cloudinary error

### Solutions:

```bash
# 1. Verify Cloudinary credentials in .env
cat /var/www/gadgetslagbe/server/.env | grep CLOUDINARY

# 2. Test Cloudinary account
# Login to https://cloudinary.com
# Verify account is active

# 3. Check file upload limits in nginx
cat /etc/nginx/sites-available/gadgetslagbe.com | grep client_max_body_size
# Should be: client_max_body_size 50M;

# 4. Restart nginx
sudo nginx -t && sudo systemctl reload nginx

# 5. Check upload directory permissions
sudo chmod -R 755 /var/www/gadgetslagbe/server/public
```

---

## ❌ PROBLEM: "CORS Error in Browser"

### Symptoms:
- Browser console shows CORS policy error
- "Access to XMLHttpRequest blocked by CORS policy"

### Solutions:

```bash
# 1. Check server CORS configuration
cat /var/www/gadgetslagbe/server/server.js | grep -A 10 "allowedOrigins"

# 2. Verify .env has correct URLs
cat /var/www/gadgetslagbe/server/.env | grep CLIENT_URL
cat /var/www/gadgetslagbe/server/.env | grep ADMIN_URL

# 3. Should include:
# CLIENT_URL=https://gadgetslagbe.com
# ADMIN_URL=https://admin.gadgetslagbe.com

# 4. Restart backend
pm2 restart gadgetslagbe-api
```

---

## ❌ PROBLEM: "Admin Panel Not Loading"

### Symptoms:
- admin.gadgetslagbe.com shows blank page or 404

### Solutions:

```bash
# 1. Check if admin app is running
pm2 status
# Should show: gadgetslagbe-admin online

# 2. Check admin build files
ls -la /var/www/gadgetslagbe/admin/dist/
# Should have: index.html and assets/

# 3. If dist/ is missing, rebuild admin
cd /var/www/gadgetslagbe/admin
npm run build
pm2 restart gadgetslagbe-admin

# 4. Check nginx config for admin
cat /etc/nginx/sites-available/gadgetslagbe.com | grep -A 10 "admin.gadgetslagbe"

# 5. Check admin .env
cat /var/www/gadgetslagbe/admin/.env
# Should have: VITE_API_URL=https://api.gadgetslagbe.com/api
```

---

## ❌ PROBLEM: "API Returns 404"

### Symptoms:
- api.gadgetslagbe.com/api/products returns 404
- Health endpoint works but other routes don't

### Solutions:

```bash
# 1. Test health endpoint
curl https://api.gadgetslagbe.com/api/health
# Should return: {"success": true, "message": "API is running"}

# 2. Check if routes are registered
pm2 logs gadgetslagbe-api
# Look for route information

# 3. Check nginx proxy configuration
cat /etc/nginx/sites-available/gadgetslagbe.com | grep -A 10 "api.gadgetslagbe"

# 4. Verify backend is listening on port 5000
netstat -tulpn | grep 5000

# 5. Check server.js routes
cat /var/www/gadgetslagbe/server/server.js | grep app.use
```

---

## ❌ PROBLEM: "PM2 Process Keeps Crashing"

### Symptoms:
- `pm2 status` shows process restarting repeatedly
- `pm2 logs` shows error messages

### Solutions:

```bash
# 1. View detailed logs
pm2 logs gadgetslagbe-api --lines 100

# 2. Check for syntax errors
cd /var/www/gadgetslagbe/server
node -c server.js

# 3. Check for missing dependencies
npm install --production

# 4. Check for missing .env variables
cat .env
# Make sure all required variables are set

# 5. Run server manually to see errors
NODE_ENV=production node server.js

# 6. Check memory usage
pm2 monit
# If memory too high, increase limit in ecosystem.config.cjs

# 7. Restart with clean state
pm2 delete gadgetslagbe-api
pm2 start ecosystem.config.cjs --env production
```

---

## ❌ PROBLEM: "Nginx Won't Start"

### Symptoms:
- `sudo systemctl status nginx` shows failed
- `sudo nginx -t` shows configuration error

### Solutions:

```bash
# 1. Test nginx configuration
sudo nginx -t

# 2. Check error message
# Common errors:
# - "unknown directive" → syntax error in config
# - "host not found" → DNS issue
# - "bind() to 0.0.0.0:443 failed" → port already in use

# 3. Check for port conflicts
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# 4. Kill process using port 80/443
sudo fuser -k 80/tcp
sudo fuser -k 443/tcp

# 5. Check nginx config syntax
cat /etc/nginx/sites-available/gadgetslagbe.com

# 6. Look for missing semicolons or brackets
# Common mistake: missing semicolon after directive

# 7. Reload nginx
sudo systemctl reload nginx
```

---

## ❌ PROBLEM: "SSH Connection Refused"

### Symptoms:
- "Connection refused" when trying to SSH
- "Connection timed out"

### Solutions:

```bash
# 1. Verify instance is running
# Login to AWS Console → EC2 → Check instance state

# 2. Check Security Group
# AWS Console → EC2 → Security Groups
# Allow inbound SSH (port 22) from your IP

# 3. Verify Elastic IP is associated
# AWS Console → EC2 → Elastic IPs
# Should show associated with your instance

# 4. Check key file permissions
chmod 400 gadgetslagbe-key.pem

# 5. Use verbose SSH to see error
ssh -vvv -i "gadgetslagbe-key.pem" ubuntu@YOUR_ELASTIC_IP

# 6. Try connecting from AWS Console
# EC2 → Instances → Select instance → Connect
# Use EC2 Instance Connect (browser-based SSH)
```

---

## ❌ PROBLEM: "Cloudflare Shows Error 522"

### Symptoms:
- Cloudflare error page: "Connection timed out"
- Error 522

### Solutions:

```bash
# 1. Check if nginx is running
sudo systemctl status nginx

# 2. Check if ports are listening
sudo netstat -tulpn | grep nginx

# 3. Check AWS Security Group
# Must allow inbound HTTP (80) and HTTPS (443)

# 4. Check firewall on VPS
sudo ufw status
# Should allow: Nginx Full, OpenSSH

# 5. Test connection from outside
curl http://YOUR_ELASTIC_IP
# Should return something

# 6. Check nginx access logs
tail -f /var/log/nginx/access.log

# 7. Restart nginx
sudo systemctl restart nginx
```

---

## ❌ PROBLEM: "Client App Shows Blank Page"

### Symptoms:
- gadgetslagbe.com loads but shows blank/white page
- No errors in network tab

### Solutions:

```bash
# 1. Check browser console for errors (F12)
# Look for JavaScript errors

# 2. Verify client build files exist
ls -la /var/www/gadgetslagbe/client/dist/
# Should have index.html and assets/

# 3. Check client .env
cat /var/www/gadgetslagbe/client/.env
# Should have: VITE_API_URL=https://api.gadgetslagbe.com/api

# 4. Rebuild client
cd /var/www/gadgetslagbe/client
npm install
npm run build

# 5. Check nginx root directive
cat /etc/nginx/sites-available/gadgetslagbe.com | grep -A 5 "gadgetslagbe.com"
# root should point to: /var/www/gadgetslagbe/client/dist

# 6. Clear browser cache
# Hard refresh: Ctrl + Shift + R (Windows)
# Or use incognito mode
```

---

## 🔍 USEFUL DEBUGGING COMMANDS

```bash
# Check all services status
pm2 status
sudo systemctl status nginx
sudo systemctl status pm2-ubuntu

# View real-time logs
pm2 monit

# View specific app logs
pm2 logs gadgetslagbe-api
pm2 logs gadgetslagbe-client
pm2 logs gadgetslagbe-admin

# View nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Check ports
netstat -tulpn
sudo lsof -i :5000
sudo lsof -i :5173
sudo lsof -i :5174

# Check disk space
df -h

# Check memory
free -h

# Check CPU usage
htop

# Test endpoints
curl https://api.gadgetslagbe.com/api/health
curl -I https://gadgetslagbe.com
curl -I https://admin.gadgetslagbe.com

# Check SSL certificate
sudo certbot certificates
curl -vI https://gadgetslagbe.com 2>&1 | grep expire

# Check DNS
nslookup gadgetslagbe.com
dig gadgetslagbe.com
```

---

## 🆘 EMERGENCY RESTART

If everything is broken, run this:

```bash
# SSH to your VPS
ssh -i "gadgetslagbe-key.pem" ubuntu@YOUR_ELASTIC_IP

# Emergency restart script
cd /var/www/gadgetslagbe

# Restart everything
pm2 restart all
sudo systemctl restart nginx

# Check status
pm2 status
sudo systemctl status nginx

# Check logs for errors
pm2 logs --lines 50

# If still broken, check .env files
cat server/.env | grep MONGODB_URI
cat client/.env
cat admin/.env
```

---

## 📞 STILL NEED HELP?

1. **Check all logs** - They contain the error message
2. **Verify .env files** - 90% of issues are wrong configuration
3. **Test each component separately** - Isolate the problem
4. **Check Cloudflare dashboard** - Look for errors/warnings
5. **Verify AWS Security Groups** - Ensure ports are open

**Common mistakes:**
- ❌ Wrong MongoDB URI
- ❌ Missing JWT_SECRET
- ❌ Incorrect API URLs in client/admin .env
- ❌ SSL certificate expired
- ❌ Nginx config syntax error
- ❌ DNS not propagated yet

---

**Last Updated:** April 8, 2026
