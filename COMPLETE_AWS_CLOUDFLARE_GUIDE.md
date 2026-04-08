# 🚀 COMPLETE AWS + CLOUDFLARE DEPLOYMENT GUIDE
## For: gadgetslagbe.com

---

## 📚 TABLE OF CONTENTS

1. [Understanding How Subdomains & Ports Work](#understanding)
2. [Cloudflare Subdomain Configuration](#cloudflare)
3. [AWS VPS Setup Step-by-Step](#aws-setup)
4. [Port Configuration Explained](#ports)
5. [Complete Deployment Steps](#deployment)
6. [Verification & Testing](#verification)

---

## 🔍 UNDERSTANDING HOW SUBDOMAINS & PORTS WORK

### **What is a Subdomain?**

```
Main domain:     gadgetslagbe.com
Subdomains:      api.gadgetslagbe.com      (for API)
                 admin.gadgetslagbe.com    (for Admin Panel)
                 www.gadgetslagbe.com      (for Client)
```

### **How DNS Resolution Works:**

```
User types: https://api.gadgetslagbe.com
     ↓
Browser asks Cloudflare: "What's the IP for api.gadgetslagbe.com?"
     ↓
Cloudflare DNS returns: YOUR_AWS_ELASTIC_IP
     ↓
Browser connects to AWS VPS via Cloudflare
     ↓
Nginx sees the request is for "api.gadgetslagbe.com"
     ↓
Nginx routes to the correct port (5000 for API)
     ↓
Backend server responds
```

### **IMPORTANT: Ports are NOT configured in Cloudflare!**

❌ **Cloudflare does NOT handle ports**  
✅ **Cloudflare only maps domain → IP address**  
✅ **Nginx handles which domain goes to which port**

```
Cloudflare DNS:
  api.gadgetslagbe.com     →     123.45.67.89 (Your AWS IP)
  admin.gadgetslagbe.com   →     123.45.67.89 (Same IP!)
  gadgetslagbe.com         →     123.45.67.89 (Same IP!)

Nginx (on your VPS) decides where to route:
  api.gadgetslagbe.com     →     Port 5000 (Backend API)
  admin.gadgetslagbe.com   →     Port 5174 (Admin App)
  gadgetslagbe.com         →     Port 5173 (Client App)
```

---

## ☁️ CLOUDFLARE SUBDOMAIN CONFIGURATION

### **Step 1: Login to Cloudflare**

1. Go to https://dash.cloudflare.com
2. Click on `gadgetslagbe.com`
3. Go to **DNS** → **Records**

### **Step 2: Add DNS Records**

Click **"Add Record"** and add these 4 A records:

#### **Record 1: Main Domain**
```
Type:            A
Name:            @
IPv4 address:    YOUR_ELASTIC_IP          (Replace with actual IP)
Proxy status:    Proxied (Orange cloud ON)
TTL:             Auto
Comments:        Main website
```

#### **Record 2: WWW Subdomain**
```
Type:            A
Name:            www
IPv4 address:    YOUR_ELASTIC_IP          (Same IP)
Proxy status:    Proxied (Orange cloud ON)
TTL:             Auto
Comments:        WWW redirect
```

#### **Record 3: Admin Subdomain**
```
Type:            A
Name:            admin
IPv4 address:    YOUR_ELASTIC_IP          (Same IP)
Proxy status:    Proxied (Orange cloud ON)
TTL:             Auto
Comments:        Admin dashboard
```

#### **Record 4: API Subdomain**
```
Type:            A
Name:            api
IPv4 address:    YOUR_ELASTIC_IP          (Same IP)
Proxy status:    Proxied (Orange cloud ON)
TTL:             Auto
Comments:        Backend API
```

### **Visual Example:**

```
Before (Empty):
┌──────┬──────────┬─────────────────┬──────────┬────────┐
│ Type │ Name     │ Content         │ Proxy    │ TTL    │
├──────┼──────────┼─────────────────┼──────────┼────────┤
│      │          │                 │          │        │
└──────┴──────────┴─────────────────┴──────────┴────────┘

After (Configured):
┌──────┬──────────┬─────────────────┬──────────┬────────┐
│ Type │ Name     │ Content         │ Proxy    │ TTL    │
├──────┼──────────┼─────────────────┼──────────┼────────┤
│ A    │ @        │ 54.213.123.45   | Proxied  │ Auto   │
│ A    | www      │ 54.213.123.45   | Proxied  │ Auto   │
│ A    | admin    │ 54.213.123.45   | Proxied  │ Auto   │
│ A    | api      │ 54.213.123.45   | Proxied  │ Auto   │
└──────┴──────────┴─────────────────┴──────────┴────────┘

(54.213.123.45 is example - use YOUR actual Elastic IP)
```

### **Step 3: Configure SSL/TLS Settings**

1. Go to **SSL/TLS** → **Overview**
2. Select **"Full (strict)"** mode
3. This ensures end-to-end encryption

```
SSL/TLS Mode Selection:

❌ Off            - No encryption
❌ Flexible       - Encryption only to Cloudflare
✅ Full (strict)  - Full encryption everywhere (CHOOSE THIS)
```

### **Step 4: Wait for DNS Propagation**

DNS usually takes **1-5 minutes** with Cloudflare.

**Test it:**
```bash
# Windows CMD or PowerShell:
ping gadgetslagbe.com
ping api.gadgetslagbe.com
ping admin.gadgetslagbe.com

# All should return YOUR Elastic IP
```

---

## 🖥️ AWS VPS SETUP (EC2 Instance)

### **Step 1: Launch EC2 Instance**

1. **Login to AWS Console**
   - Go to https://aws.amazon.com/console/
   - Login to your account

2. **Go to EC2 Dashboard**
   - Search "EC2" in the search bar
   - Click **EC2**

3. **Launch Instance**
   - Click **"Launch Instance"**
   - Click **"Create a new key pair"** (if you don't have one)
     - Name: `gadgetslagbe-key`
     - Type: RSA
     - Format: .pem
     - Download and **SAVE IT SECURELY**

4. **Configure Instance**
   ```
   Name: gadgetslagbe-server
   
   Application and OS Images:
     - Ubuntu Server 22.04 LTS (Free tier eligible)
   
   Instance type:
     - t2.micro (Free tier) or t3.small (Better performance)
   
   Key pair:
     - Select: gadgetslagbe-key
   
   Network settings:
     - Click "Create security group"
     - Add these rules:
       ✓ SSH (port 22)     - My IP only
       ✓ HTTP (port 80)    - Anywhere
       ✓ HTTPS (port 443)  - Anywhere
       ✓ Custom TCP 5000   - Anywhere (for API)
       ✓ Custom TCP 5173   - Anywhere (for Client)
       ✓ Custom TCP 5174   - Anywhere (for Admin)
   
   Configure storage:
     - 20 GB gp2 (minimum)
     - 30 GB recommended
   ```

5. **Launch Instance**
   - Click **"Launch Instance"**
   - Wait 1-2 minutes for it to start

### **Step 2: Allocate Elastic IP**

**Why?** Without Elastic IP, your public IP changes on restart!

1. **Go to Elastic IPs**
   - In EC2 Dashboard, left menu → **Elastic IPs**
   - Click **"Allocate Elastic IP address"**
   - Click **"Allocate"**

2. **Associate with Your Instance**
   - Select the Elastic IP
   - Click **Actions** → **Associate Elastic IP address**
   - Choose your instance: `gadgetslagbe-server`
   - Click **"Associate"**

3. **Note Your Elastic IP**
   ```
   Your Elastic IP: 54.213.123.45  (Example)
   SAVE THIS! You'll need it for Cloudflare DNS
   ```

### **Step 3: Connect to Your VPS via SSH**

#### **From Windows (PowerShell):**

```powershell
# Navigate to your key file location
cd C:\path\to\your\key\

# SSH into your VPS (replace with your actual IP and key)
ssh -i "gadgetslagbe-key.pem" ubuntu@54.213.123.45

# If asked about fingerprint, type: yes
```

#### **Using PuTTY (Alternative):**

1. **Convert .pem to .ppk**
   - Download PuTTYgen
   - Load your `.pem` file
   - Save private key as `.ppk`

2. **Connect with PuTTY**
   - Host Name: `ubuntu@54.213.123.45`
   - Auth → Private key: Select your `.ppk` file
   - Click **Open**

---

## 🔧 PORT CONFIGURATION EXPLAINED

### **How Ports Work in Your Application:**

```
┌──────────────────────────────────────────────────────┐
│                YOUR AWS VPS SERVER                   │
│                                                      │
│  ┌─────────────┐    ┌──────────┐    ┌──────────────┐ │
│  │   Nginx     │    │  Nginx   │    │   Nginx      │ │
│  │  Port 80    │    │ Port 443 │    │  Port 443    │ │
│  │  (HTTP)     │    │  (HTTPS) │    │   (HTTPS)    │ │
│  └──────┬──────┘    └────┬─────┘    └─────┬────────┘ │
│         │                │                │          │
│         └────────────────┴────────────────┘          │
│                          ↓                            │
│              ┌─────────────────────┐                 │
│              │   Nginx Routes      │                 │
│              │   Based on Domain   │                 │
│              └──────────┬──────────┘                 │
│                         ↓                             │
│         ┌───────────────┼───────────────┐            │
│         ↓               ↓               ↓            │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐        │
│   │ Client   │   │  Admin   │   │   API    │        │
│   │ :5173    │   │  :5174   │   │  :5000   │        │
│   └──────────┘   └──────────┘   └──────────┘        │
└──────────────────────────────────────────────────────┘
```

### **Port Mapping:**

| Service | Port | Domain | Purpose |
|---------|------|--------|---------|
| **Nginx (HTTP)** | 80 | All domains | Redirects to HTTPS |
| **Nginx (HTTPS)** | 443 | All domains | SSL termination |
| **Backend API** | 5000 | api.gadgetslagbe.com | Node.js server |
| **Client App** | 5173 | gadgetslagbe.com | React Vite dev server |
| **Admin App** | 5174 | admin.gadgetslagbe.com | React Vite dev server |

### **How Nginx Routes Traffic:**

```nginx
# User visits: https://api.gadgetslagbe.com
# Cloudflare sends to: YOUR_VPS_IP:443
# Nginx checks: "server_name" matches "api.gadgetslagbe.com"
# Nginx proxies to: http://127.0.0.1:5000

# User visits: https://admin.gadgetslagbe.com
# Cloudflare sends to: YOUR_VPS_IP:443
# Nginx checks: "server_name" matches "admin.gadgetslagbe.com"
# Nginx proxies to: http://127.0.0.1:5174

# User visits: https://gadgetslagbe.com
# Cloudflare sends to: YOUR_VPS_IP:443
# Nginx checks: "server_name" matches "gadgetslagbe.com"
# Nginx serves: Static files from /var/www/gadgetslagbe/client/dist
```

---

## 🚀 COMPLETE DEPLOYMENT STEPS

### **PHASE 1: PREPARE YOUR LOCAL FILES**

#### **1. Update Environment Files**

**On your Windows machine, update these files:**

**File: `server/.env.production`**
```env
NODE_ENV=production
PORT=5000
API_URL=https://api.gadgetslagbe.com/api

# MongoDB Atlas (Create free database at https://mongodb.com/cloud/atlas)
MONGODB_URI=mongodb+srv://YOUR_MONGO_USERNAME:YOUR_MONGO_PASSWORD@cluster0.abc123.mongodb.net/gadgetslagbe?retryWrites=true&w=majority

# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=PASTE_64_CHAR_RANDOM_STRING_HERE

# Cloudinary (Get free account at https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail App Password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=YOUR_16_CHAR_APP_PASSWORD
EMAIL_FROM=noreply@gadgetslagbe.com

CLIENT_URL=https://gadgetslagbe.com
ADMIN_URL=https://admin.gadgetslagbe.com
```

**File: `client/.env.production`**
```env
VITE_API_URL=https://api.gadgetslagbe.com/api
VITE_CLIENT_URL=https://gadgetslagbe.com
```

**File: `admin/.env.production`**
```env
VITE_API_URL=https://api.gadgetslagbe.com/api
VITE_ADMIN_URL=https://admin.gadgetslagbe.com
```

#### **2. Get MongoDB Atlas (Free Database)**

```bash
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create a FREE cluster (M0 Sandbox)
4. Create database user (username + password)
5. Network Access → Add IP: 0.0.0.0/0 (Allow from anywhere)
6. Get connection string:
   mongodb+srv://<username>:<password>@cluster0.abc123.mongodb.net/
7. Replace <username> and <password> with actual values
8. Add database name: gadgetslagbe
```

#### **3. Get Cloudinary (Free Image Hosting)**

```bash
1. Go to: https://cloudinary.com/users/register/free
2. Create free account
3. Dashboard shows:
   - Cloud Name: dxxxxxxx
   - API Key: 123456789012345
   - API Secret: abcdefghijklmnopqrst
4. Add these to server/.env.production
```

#### **4. Create Gmail App Password**

```bash
1. Go to: https://myaccount.google.com/apppasswords
2. Select: Mail
3. Select: Other (Custom name) → "gadgetslagbe"
4. Click Generate
5. Copy 16-character password (save it!)
6. Use this in EMAIL_PASS field
```

---

### **PHASE 2: UPLOAD TO AWS VPS**

#### **Method 1: Using Git (Recommended)**

```bash
# 1. Push your code to GitHub (if not already)
cd D:\Nerob\ecommarce-full-stack-by-ClaudeAI
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main

# 2. On your VPS (via SSH):
sudo apt update
sudo apt install -y git

cd /var/www
sudo git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git gadgetslagbe
cd gadgetslagbe
```

#### **Method 2: Using SCP (Direct Upload)**

**From Windows PowerShell:**

```powershell
# Navigate to your project
cd D:\Nerob\ecommarce-full-stack-by-ClaudeAI

# Upload entire project to VPS (replace IP and key path)
scp -i "C:\path\to\gadgetslagbe-key.pem" -r * ubuntu@54.213.123.45:/home/ubuntu/project/
```

**Then on VPS:**

```bash
# SSH into VPS
ssh -i "gadgetslagbe-key.pem" ubuntu@54.213.123.45

# Move files to proper location
sudo mkdir -p /var/www/gadgetslagbe
sudo mv /home/ubuntu/project/* /var/www/gadgetslagbe/
sudo chown -R ubuntu:ubuntu /var/www/gadgetslagbe
cd /var/www/gadgetslagbe
```

---

### **PHASE 3: INSTALL DEPENDENCIES ON VPS**

```bash
# SSH into your VPS
ssh -i "gadgetslagbe-key.pem" ubuntu@YOUR_ELASTIC_IP

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt install -y nodejs

# Verify installation
node --version   # Should show v18.x.x
npm --version    # Should show 9.x.x or higher

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Verify Nginx
sudo systemctl status nginx   # Should show "active (running)"
```

---

### **PHASE 4: INSTALL NODE MODULES & BUILD**

```bash
cd /var/www/gadgetslagbe

# 1. Install Server Dependencies
cd server
npm install --production
cd ..

# 2. Install & Build Client
cd client
npm install
npm run build
cd ..

# 3. Install & Build Admin
cd admin
npm install
npm run build
cd ..
```

---

### **PHASE 5: CONFIGURE ENVIRONMENT VARIABLES**

```bash
cd /var/www/gadgetslagbe

# Copy production env files
cp server/.env.production server/.env
cp client/.env.production client/.env
cp admin/.env.production admin/.env

# Edit server .env (use nano)
nano server/.env

# Update ALL values as shown in PHASE 1
# Press Ctrl+X, then Y, then Enter to save

# Verify client env
cat client/.env

# Verify admin env
cat admin/.env
```

---

### **PHASE 6: CONFIGURE NGINX**

```bash
# Copy nginx config file to VPS
# From Windows (PowerShell):
scp -i "C:\path\to\gadgetslagbe-key.pem" nginx.conf ubuntu@54.213.123.45:/home/ubuntu/

# On VPS:
sudo cp /home/ubuntu/nginx.conf /etc/nginx/sites-available/gadgetslagbe.com

# Create symlink
sudo ln -sf /etc/nginx/sites-available/gadgetslagbe.com /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx config
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx
sudo systemctl enable nginx
```

---

### **PHASE 7: START APPLICATIONS WITH PM2**

```bash
cd /var/www/gadgetslagbe

# Copy PM2 config
# From Windows:
scp -i "C:\path\to\gadgetslagbe-key.pem" ecosystem.config.cjs ubuntu@54.213.123.45:/home/ubuntu/

# On VPS:
cp /home/ubuntu/ecosystem.config.cjs .

# Create log directories
sudo mkdir -p /var/log/pm2
sudo chown ubuntu:ubuntu /var/log/pm2

# Start all apps
pm2 start ecosystem.config.cjs --env production

# Check status
pm2 status

# Should show:
# ┌────┬────────────────────────┬──────────┬──────┬───────────┬──────────┐
# │ id │ name                   │ mode     │ ↺    │ status    │ cpu      │
# ├────┼────────────────────────┼──────────┼──────┼───────────┼──────────┤
# │ 0  │ gadgetslagbe-api       │ cluster  │ 0    │ online    │ 0%       │
# │ 1  │ gadgetslagbe-client    │ fork     │ 0    │ online    │ 0%       │
# │ 2  │ gadgetslagbe-admin     │ fork     │ 0    │ online    │ 0%       │
# └────┴────────────────────────┴──────────┴──────┴───────────┴──────────┘

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Copy and run the command it shows you!
```

---

### **PHASE 8: INSTALL SSL CERTIFICATES**

**IMPORTANT: Only do this after DNS is fully propagated!**

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificates
sudo certbot --nginx \
  -d gadgetslagbe.com \
  -d www.gadgetslagbe.com \
  -d admin.gadgetslagbe.com \
  -d api.gadgetslagbe.com \
  --non-interactive \
  --agree-tos \
  --email YOUR_EMAIL@gmail.com \
  --redirect \
  --hsts

# This will:
# ✅ Generate SSL certificates
# ✅ Configure nginx for HTTPS
# ✅ Auto-redirect HTTP to HTTPS
# ✅ Enable HSTS (HTTP Strict Transport Security)

# Test auto-renewal
sudo certbot renew --dry-run
```

---

### **PHASE 9: TEST EVERYTHING**

```bash
# Test API
curl https://api.gadgetslagbe.com/api/health

# Should return:
# {"success":true,"message":"API is running","timestamp":"...","environment":"production"}

# Test Client
curl -I https://gadgetslagbe.com

# Should show: HTTP/2 200

# Test Admin
curl -I https://admin.gadgetslagbe.com

# Should show: HTTP/2 200

# Check all services
pm2 status
sudo systemctl status nginx

# Check logs
pm2 logs
tail -f /var/log/nginx/access.log
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] Cloudflare DNS has 4 A records (@, www, admin, api)
- [ ] All DNS records point to your Elastic IP
- [ ] DNS propagated (ping shows your IP)
- [ ] VPS running Ubuntu on AWS
- [ ] Elastic IP associated with instance
- [ ] Node.js 18.x installed
- [ ] Nginx installed and running
- [ ] PM2 installed and running 3 processes
- [ ] All `.env` files configured
- [ ] Client built (`npm run build`)
- [ ] Admin built (`npm run build`)
- [ ] SSL certificates installed
- [ ] https://gadgetslagbe.com works
- [ ] https://admin.gadgetslagbe.com works
- [ ] https://api.gadgetslagbe.com/api/health works

---

## 🆘 TROUBLESHOOTING

### **Problem: DNS Not Resolving**

```bash
# Wait 5-15 minutes for propagation
# Check Cloudflare DNS records
# Test:
nslookup gadgetslagbe.com
ping api.gadgetslagbe.com
```

### **Problem: 502 Bad Gateway**

```bash
# Backend not running
pm2 status
pm2 restart gadgetslagbe-api
pm2 logs gadgetslagbe-api

# Check if port 5000 is listening
netstat -tulpn | grep 5000
```

### **Problem: SSL Certificate Failed**

```bash
# Verify DNS is propagated
dig gadgetslagbe.com

# Check nginx config
sudo nginx -t

# Try again
sudo certbot renew --force-renewal
```

### **Problem: Can't SSH**

```bash
# Check AWS Security Group allows SSH (port 22)
# Check key file permissions:
chmod 400 gadgetslagbe-key.pem

# Use verbose SSH:
ssh -vvv -i "gadgetslagbe-key.pem" ubuntu@YOUR_IP
```

---

## 📊 MONITORING COMMANDS

```bash
# Real-time monitoring
pm2 monit

# View all logs
pm2 logs

# View API logs only
pm2 logs gadgetslagbe-api

# View resource usage
pm2 status

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log

# Server resource usage
htop
df -h
free -h
```

---

## 🎉 CONGRATULATIONS!

Your complete setup is now live:

```
🌐 Client:  https://gadgetslagbe.com
🔧 Admin:   https://admin.gadgetslagbe.com
📡 API:     https://api.gadgetslagbe.com/api
```

**Next Steps:**
1. Login to admin panel
2. Add products
3. Configure payment gateway
4. Test checkout flow
5. Monitor Cloudflare analytics

---

**Questions?** Check the logs or review this guide!

**Last Updated:** April 8, 2026
