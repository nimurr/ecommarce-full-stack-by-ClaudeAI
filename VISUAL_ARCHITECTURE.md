# 🎯 VISUAL GUIDE: How Everything Connects

## 📡 COMPLETE ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET USERS                          │
│                    (Customers visiting your site)                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 1. User types: https://gadgetslagbe.com
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CLOUDFLARE (DNS + CDN)                     │
│                                                                 │
│  DNS Records:                                                   │
│  ┌──────────────────┬──────────────────┬──────────────────┐    │
│  │  gadgetslagbe    │  admin.gadget..  │  api.gadget..    │    │
│  │  ↓               │  ↓               │  ↓               │    │
│  │  54.213.123.45   │  54.213.123.45   │  54.213.123.45   │    │
│  └──────────────────┴──────────────────┴──────────────────┘    │
│                                                                 │
│  SSL/TLS: Full (strict)                                         │
│  Proxy: ON (Orange cloud)                                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 2. Cloudflare forwards to AWS VPS IP
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AWS VPS (EC2 Instance)                        │
│              Public IP: 54.213.123.45                           │
│              Private IP: 172.31.xx.xx (Internal)                │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    NGINX (Port 443)                       │ │
│  │              (Reverse Proxy + SSL)                        │ │
│  │                                                           │ │
│  │  Routes based on domain name:                             │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │ if Host = gadgetslagbe.com     → Port 5173         │ │ │
│  │  │ if Host = admin.gadgetslagbe.com → Port 5174       │ │ │
│  │  │ if Host = api.gadgetslagbe.com   → Port 5000       │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  └────────────┬──────────────┬──────────────┬───────────────┘ │
│               │              │              │                 │
│               │              │              │                 │
│               ▼              ▼              ▼                 │
│  ┌─────────────────┐ ┌──────────────┐ ┌──────────────────┐   │
│  │  CLIENT APP     │ │  ADMIN APP   │ │  BACKEND API     │   │
│  │  (React/Vite)   │ │ (React/Vite) │ │  (Node.js/Exp)   │   │
│  │  Port: 5173     │ │ Port: 5174   │ │  Port: 5000      │   │
│  │  Static Files   │ │ Static Files │ │  MongoDB Access  │   │
│  │  /var/www/...   │ │ /var/www/... │ │  PM2 Managed     │   │
│  │  /client/dist   │ │ /admin/dist  │ │                  │   │
│  └────────┬────────┘ └──────┬───────┘ └────────┬─────────┘   │
│           │                 │                   │             │
└───────────┼─────────────────┼───────────────────┼─────────────┘
            │                 │                   │
            │                 │                   ▼
            │                 │        ┌──────────────────────┐
            │                 │        │   MongoDB Atlas      │
            │                 │        │   (Cloud Database)   │
            │                 │        │   mongodb+srv://...  │
            │                 │        └──────────────────────┘
            │                 │
            │                 ▼
            │        ┌──────────────────────┐
            │        │   Cloudinary CDN     │
            │        │   (Image Storage)    │
            │        └──────────────────────┘
            │
            ▼
   ┌────────────────────┐
   │  External Services │
   │  - SSLCommerz      │
   │  - Steadfast       │
   │  - Email (Gmail)   │
   │  - SMS Gateway     │
   └────────────────────┘
```

---

## 🔄 REQUEST FLOW EXAMPLES

### **Example 1: Customer Visits Homepage**

```
Step 1: Customer types "https://gadgetslagbe.com" in browser

Step 2: Browser asks Cloudflare DNS: "What's the IP?"
        Cloudflare responds: "54.213.123.45"

Step 3: Browser connects to 54.213.123.45 (your AWS VPS)
        Request: GET /  (Host: gadgetslagbe.com)

Step 4: Nginx receives request on port 443
        Checks: server_name matches "gadgetslagbe.com"
        Action: Serves static files from /var/www/gadgetslagbe/client/dist/

Step 5: Browser receives HTML/CSS/JS
        React app loads in browser
        Customer sees your e-commerce store

Step 6: React app makes API calls to:
        https://api.gadgetslagbe.com/api/products
        
        This goes through same path, but Nginx routes to port 5000
```

### **Example 2: Admin Logs In**

```
Step 1: Admin visits "https://admin.gadgetslagbe.com"

Step 2: Same DNS resolution → 54.213.123.45

Step 3: Nginx sees Host: "admin.gadgetslagbe.com"
        Routes to port 5174 (Admin React app)

Step 2: Admin app loads, then makes API request:
        POST https://api.gadgetslagbe.com/api/auth/login
        
Step 3: Nginx sees Host: "api.gadgetslagbe.com"
        Routes to port 5000 (Node.js backend)

Step 4: Backend validates credentials, returns JWT token

Step 5: Admin sees dashboard
```

### **Example 3: Customer Makes Purchase**

```
Customer → gadgetslagbe.com (Port 5173)
   ↓
Add to cart (local state)
   ↓
Checkout → api.gadgetslagbe.com/api/orders (Port 5000)
   ↓
Backend creates order in MongoDB
   ↓
Backend calls SSLCommerz for payment
   ↓
Customer pays on SSLCommerz gateway
   ↓
SSLCommerz calls backend webhook
   ↓
Backend updates order status
   ↓
Backend sends email via Gmail SMTP
   ↓
Backend calls Steadfast for delivery
   ↓
Order complete!
```

---

## 🔌 PORT CONFIGURATION VISUAL

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR AWS VPS SERVER                      │
│                                                             │
│  INCOMING PORTS (From Internet via Cloudflare):            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Port 80   → HTTP  → Redirects to HTTPS (Port 443)  │  │
│  │  Port 443  → HTTPS → Nginx processes requests       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  INTERNAL PORTS (Only accessible via Nginx proxy):        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Port 5000  → Backend API (Node.js + Express)       │  │
│  │  Port 5173  → Client App (React/Vite - Static)      │  │
│  │  Port 5174  → Admin App (React/Vite - Static)       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  OUTGOING CONNECTIONS:                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Port 27017  → MongoDB Atlas (Database)              │  │
│  │  Port 587    → Gmail SMTP (Email)                    │  │
│  │  Port 443    → External APIs (SSLCommerz, etc)       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌐 CLOUDFLARE DNS EXPLAINED

### **What Cloudflare Sees:**

```
┌──────────────────────────────────────────────────┐
│          CLOUDFLARE DNS TABLE                    │
├──────────┬──────────┬───────────────┬────────────┤
│ Type     │ Name     │ Content       │ Proxy      │
├──────────┼──────────┼───────────────┼────────────┤
│ A        │ @        │ 54.213.123.45 | Proxied    │
│ A        │ www      │ 54.213.123.45 | Proxied    │
│ A        │ admin    │ 54.213.123.45 | Proxied    │
│ A        │ api      │ 54.213.123.45 | Proxied    │
└──────────┴──────────┴───────────────┴────────────┘

ALL subdomains point to THE SAME IP!
Nginx on your VPS decides where to route based on domain name.
```

### **What Cloudflare DOES NOT Do:**

```
❌ Cloudflare does NOT configure ports
❌ Cloudflare does NOT route to different ports
❌ Cloudflare does NOT know about your services

Cloudflare ONLY:
✅ Maps domain name → IP address
✅ Provides SSL/TLS encryption
✅ Caches static content (CDN)
✅ Protects from DDoS attacks

PORT routing is done by NGINX on YOUR VPS!
```

---

## 🏗️ NGINX ROUTING EXPLAINED

```nginx
# When request comes to port 443 (HTTPS)

server {
    listen 443 ssl;
    server_name api.gadgetslagbe.com;  # ← Checks Host header
    
    location / {
        proxy_pass http://127.0.0.1:5000;  # ← Routes to port 5000
    }
}

server {
    listen 443 ssl;
    server_name admin.gadgetslagbe.com;  # ← Checks Host header
    
    location / {
        root /var/www/gadgetslagbe/admin/dist;  # ← Serves static files
    }
}

server {
    listen 443 ssl;
    server_name gadgetslagbe.com;  # ← Checks Host header
    
    location / {
        root /var/www/gadgetslagbe/client/dist;  # ← Serves static files
    }
}
```

---

## 📦 FILE STRUCTURE ON VPS

```
/var/www/gadgetslagbe/
│
├── server/
│   ├── .env                    # Production environment variables
│   ├── server.js               # Express application
│   ├── package.json
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── node_modules/
│
├── client/
│   ├── .env                    # Production URLs
│   ├── dist/                   # Built static files (after npm run build)
│   │   ├── index.html
│   │   ├── assets/
│   │   │   ├── index-abc123.js
│   │   │   └── index-def456.css
│   │   └── ...
│   ├── src/
│   └── package.json
│
├── admin/
│   ├── .env                    # Production URLs
│   ├── dist/                   # Built static files
│   │   ├── index.html
│   │   ├── assets/
│   │   └── ...
│   ├── src/
│   └── package.json
│
├── nginx.conf                  # Nginx configuration
├── ecosystem.config.cjs        # PM2 configuration
├── deploy.sh                   # Deployment script
└── quick-setup.sh              # SSL setup script
```

---

## 🔐 SSL/TLS FLOW

```
1. User's Browser
        ↓  HTTPS Request (encrypted)
        
2. Cloudflare Edge Server
        ↓  Validates SSL certificate
        ↓  Re-encrypts traffic
        ↓  Forwards to your VPS (encrypted)
        
3. Your VPS (Nginx on Port 443)
        ↓  Decrypts with SSL certificate
        ↓  Routes to appropriate port
        ↓  Internal communication (can be HTTP)
        
4. Application (Node.js/React)
        ↓  Processes request
        ↓  Returns response
        
5. Reverse path back to user
```

---

## 🚀 DEPLOYMENT CHECKLIST (Quick Reference)

```
☐ AWS EC2 Instance Created (Ubuntu 22.04)
☐ Elastic IP Allocated & Associated
☐ Security Group Configured (Ports 22, 80, 443, 5000, 5173, 5174)
☐ MongoDB Atlas Database Created
☐ Cloudflare DNS Configured (4 A records)
☐ SSH Key Ready
│
☐ Files Uploaded to VPS
☐ Node.js 18.x Installed
☐ Dependencies Installed (server, client, admin)
☐ Environment Variables Configured
☐ Nginx Configured & Running
☐ PM2 Processes Running (api, client, admin)
☐ SSL Certificates Installed (Certbot)
│
☐ https://gadgetslagbe.com         → Working
☐ https://admin.gadgetslagbe.com   → Working
☐ https://api.gadgetslagbe.com     → Working
```

---

## 💡 KEY CONCEPTS TO REMEMBER

```
1. Cloudflare DNS = Phone book (maps names to IPs)
2. Nginx = Receptionist (routes to correct department/port)
3. Ports = Departments (API, Client, Admin)
4. SSL = Secure envelope (encryption)
5. PM2 = Manager (keeps apps running)
6. MongoDB = Filing cabinet (database)

All subdomains point to SAME IP in Cloudflare.
NGINX decides where to route based on domain name.
```

---

**Need more help?** Read `COMPLETE_AWS_CLOUDFLARE_GUIDE.md` for step-by-step instructions!
