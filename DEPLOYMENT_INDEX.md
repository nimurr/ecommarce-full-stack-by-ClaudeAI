# 📚 DEPLOYMENT GUIDES INDEX FOR gadgetslagbe.com

Welcome! This is your complete deployment documentation. Choose the guide that matches your needs:

---

## 🚀 START HERE (If You're New)

### 📖 **Visual Architecture Guide**
**File:** [`VISUAL_ARCHITECTURE.md`](VISUAL_ARCHITECTURE.md)

**Read this first to understand:**
- How subdomains work
- How Cloudflare DNS works
- How ports are configured
- How requests flow through your system
- Complete architecture diagrams

**⏱️ Reading time:** 10 minutes

---

## 🎯 QUICK START (If You Want Fast Results)

### ⚡ **Quick Start Checklist**
**File:** [`QUICK_START.md`](QUICK_START.md)

**Use this if:**
- You already know how to deploy
- You want a simple checklist
- You need quick reference commands

**⏱️ Deployment time:** 30 minutes

---

## 📋 COMPLETE STEP-BY-STEP (Recommended)

### 📘 **Complete AWS + Cloudflare Guide**
**File:** [`COMPLETE_AWS_CLOUDFLARE_GUIDE.md`](COMPLETE_AWS_CLOUDFLARE_GUIDE.md)

**This is your main guide! It covers:**
- ✅ Cloudflare DNS configuration (with screenshots descriptions)
- ✅ AWS EC2 instance setup
- ✅ Elastic IP allocation
- ✅ Port configuration explained
- ✅ Complete deployment steps (9 phases)
- ✅ SSL certificate installation
- ✅ Verification and testing

**⏱️ Deployment time:** 45-60 minutes

---

## 🔧 WHEN THINGS GO WRONG

### 🛠️ **Troubleshooting Guide**
**File:** [`TROUBLESHOOTING_GUIDE.md`](TROUBLESHOOTING_GUIDE.md)

**Use this when:**
- You encounter errors
- Something isn't working
- You need to debug an issue
- You want common solutions

**Contains solutions for:**
- 502 Bad Gateway
- DNS errors
- SSL certificate errors
- Database connection issues
- CORS errors
- And many more...

---

## 📦 FILES YOU'VE CREATED

### Configuration Files:

| File | Purpose | Where to Find |
|------|---------|---------------|
| `server/.env.production` | Server environment variables | `server/` folder |
| `client/.env.production` | Client environment variables | `client/` folder |
| `admin/.env.production` | Admin environment variables | `admin/` folder |
| `nginx.conf` | Nginx reverse proxy configuration | Root folder |
| `ecosystem.config.cjs` | PM2 process manager config | Root folder |

### Deployment Scripts:

| File | Purpose | When to Use |
|------|---------|-------------|
| `deploy.sh` | Full automated deployment | First-time deployment |
| `quick-setup.sh` | SSL certificate setup | After DNS is configured |

### Documentation:

| File | Purpose | When to Read |
|------|---------|--------------|
| `VISUAL_ARCHITECTURE.md` | System diagrams | Before deployment (understand how it works) |
| `QUICK_START.md` | Checklist | During deployment |
| `COMPLETE_AWS_CLOUDFLARE_GUIDE.md` | Step-by-step guide | During deployment (main guide) |
| `TROUBLESHOOTING_GUIDE.md` | Problem solving | When you encounter errors |
| `DEPLOYMENT_GUIDE_gadgetslagbe.md` | Original comprehensive guide | Reference |

---

## 🎯 DEPLOYMENT FLOWCHART

Follow this order:

```
START
  ↓
1. Read: VISUAL_ARCHITECTURE.md (understand the system)
  ↓
2. Setup: AWS EC2 Instance + Elastic IP
  ↓
3. Setup: Cloudflare DNS Records (4 A records)
  ↓
4. Read: COMPLETE_AWS_CLOUDFLARE_GUIDE.md (follow steps)
  ↓
5. Execute: Upload files to VPS
  ↓
6. Execute: Install dependencies
  ↓
7. Execute: Configure environment variables (.env files)
  ↓
8. Execute: Run deploy.sh
  ↓
9. Execute: Run quick-setup.sh (SSL certificates)
  ↓
10. Test: Verify all endpoints work
  ↓
11. If errors → Read: TROUBLESHOOTING_GUIDE.md
  ↓
DONE! 🎉
```

---

## 🔑 IMPORTANT CONCEPTS

### Subdomains You'll Use:

```
gadgetslagbe.com           → Main customer website
www.gadgetslagbe.com       → Redirects to main (www version)
admin.gadgetslagbe.com     → Admin dashboard
api.gadgetslagbe.com       → Backend API
```

### Ports Explained:

```
Port 80   → HTTP (redirects to HTTPS)
Port 443  → HTTPS (Nginx receives here)
Port 5000 → Backend API (Node.js)
Port 5173 → Client App (React/Vite)
Port 5174 → Admin App (React/Vite)
```

### How It Works:

```
User → Cloudflare DNS → Your VPS IP → Nginx (Port 443)
                                          ↓
                          Routes based on domain name:
                          - gadgetslagbe.com → Port 5173
                          - admin.gadget... → Port 5174
                          - api.gadget... → Port 5000
```

---

## 🎓 LEARNING PATH

### If you want to UNDERSTAND everything:

1. **How DNS Works** → Read VISUAL_ARCHITECTURE.md
2. **How Nginx Routes** → Read COMPLETE_AWS_CLOUDFLARE_GUIDE.md (Port section)
3. **How SSL Works** → Read VISUAL_ARCHITECTURE.md (SSL/TLS Flow)
4. **How PM2 Works** → Read COMPLETE_AWS_CLOUDFLARE_GUIDE.md (Phase 7)

### If you just want it WORKING:

1. Follow COMPLETE_AWS_CLOUDFLARE_GUIDE.md step-by-step
2. Don't skip any steps!
3. If errors occur → Check TROUBLESHOOTING_GUIDE.md

---

## ⚡ QUICK REFERENCE COMMANDS

### Check Status:
```bash
pm2 status                    # Check all apps
sudo systemctl status nginx   # Check nginx
pm2 monit                     # Real-time monitoring
```

### View Logs:
```bash
pm2 logs                      # All logs
pm2 logs gadgetslagbe-api     # API logs only
tail -f /var/log/nginx/error.log  # Nginx errors
```

### Restart Services:
```bash
pm2 restart all               # Restart all apps
pm2 restart gadgetslagbe-api  # Restart API only
sudo systemctl restart nginx  # Restart nginx
```

### Test Endpoints:
```bash
curl https://api.gadgetslagbe.com/api/health
curl -I https://gadgetslagbe.com
curl -I https://admin.gadgetslagbe.com
```

---

## 🔐 SECURITY CHECKLIST

Before going live, ensure:

- [ ] Strong JWT_SECRET generated (64+ characters)
- [ ] MongoDB has strong password
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Gmail uses App Password (not real password)
- [ ] SSL certificates installed and auto-renewing
- [ ] AWS Security Group restricts unnecessary ports
- [ ] `.env` files not committed to Git
- [ ] Rate limiting enabled
- [ ] File upload limits set
- [ ] CORS restricted to your domains

---

## 📞 NEED HELP?

### Error Messages:
→ Check [`TROUBLESHOOTING_GUIDE.md`](TROUBLESHOOTING_GUIDE.md)

### Step-by-Step Help:
→ Check [`COMPLETE_AWS_CLOUDFLARE_GUIDE.md`](COMPLETE_AWS_CLOUDFLARE_GUIDE.md)

### Architecture Questions:
→ Check [`VISUAL_ARCHITECTURE.md`](VISUAL_ARCHITECTURE.md)

### Quick Commands:
→ Check [`QUICK_START.md`](QUICK_START.md)

---

## 🎉 FINAL RESULT

After successful deployment, you'll have:

```
✅ https://gadgetslagbe.com          (Customer Store)
✅ https://admin.gadgetslagbe.com    (Admin Panel)
✅ https://api.gadgetslagbe.com      (Backend API)
✅ SSL/HTTPS everywhere
✅ Cloudflare CDN & Protection
✅ Auto-renewing SSL certificates
✅ PM2 process management
✅ Nginx reverse proxy
✅ MongoDB database connection
```

---

## 📊 DEPLOYMENT TIMELINE

| Phase | Task | Time |
|-------|------|------|
| 1 | Setup AWS EC2 + Elastic IP | 10 min |
| 2 | Configure Cloudflare DNS | 5 min |
| 3 | DNS Propagation | 5-15 min |
| 4 | Upload Files to VPS | 10 min |
| 5 | Install Dependencies | 10 min |
| 6 | Configure Environment | 10 min |
| 7 | Setup Nginx + PM2 | 10 min |
| 8 | Install SSL Certificates | 5 min |
| 9 | Testing & Verification | 10 min |
| **Total** | | **75-85 min** |

---

## 🎯 NEXT STEPS AFTER DEPLOYMENT

1. **Add Products**
   - Login to admin panel
   - Create categories
   - Add products with images

2. **Configure Payment Gateway**
   - Setup SSLCommerz account
   - Add credentials to `.env`
   - Test payment flow

3. **Setup Email Notifications**
   - Verify Gmail app password works
   - Test order confirmation emails

4. **Configure Delivery**
   - Setup Steadfast account
   - Add API credentials
   - Test delivery creation

5. **Monitor Everything**
   - Check Cloudflare analytics
   - Monitor PM2 logs
   - Review MongoDB usage

---

**Good luck with your deployment! 🚀**

**Last Updated:** April 8, 2026  
**Version:** 1.0.0
