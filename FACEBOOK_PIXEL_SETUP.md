# 🎯 Facebook Pixel - Complete Setup Guide

## ✅ What's Been Created

### **Backend:**
1. ✅ **Settings Model** - Stores Facebook Pixel ID, Access Token, and enabled status
2. ✅ **Facebook Pixel Service** - Server-side tracking (CAPI - Conversions API)
3. ✅ **Settings Controller** - API endpoints for pixel configuration
4. ✅ **Settings Routes** - `/api/settings/facebook-pixel`

### **Frontend (Client):**
1. ✅ **FacebookPixel Component** - Dynamically loads pixel based on admin settings
2. ✅ **Event Tracking Functions** - Pre-built functions for all events
3. ✅ **Auto-initialization** - Pixel loads automatically when enabled

### **Frontend (Admin):**
1. ✅ **Facebook Pixel Settings Page** - Configure pixel from dashboard
2. ✅ **Secure Storage** - Access token stored encrypted in database
3. ✅ **Testing Guide** - Built-in instructions for testing

---

## 🚀 How to Setup (Step-by-Step)

### **Step 1: Create Facebook Pixel**

1. Go to [Facebook Events Manager](https://www.facebook.com/events_manager)
2. Click **"Add Data Source"** → **"Web"** → **"Facebook Pixel"**
3. Name your pixel (e.g., "ElectroMart Pixel")
4. Click **"Create"**
5. Copy your **Pixel ID** (looks like: `123456789012345`)

### **Step 2: Generate Access Token**

1. In Events Manager, go to **Settings** (gear icon)
2. Scroll to **"Generated Tokens"** section
3. Click **"Generate Token"**
4. Select permissions: `Manage Pixel`, `Read Insights`
5. Copy the **Access Token** (long string)

### **Step 3: Configure in Admin Dashboard**

1. Login to admin dashboard: `http://localhost:5174/admin`
2. Go to **Settings** → **Facebook Pixel**
3. Enter:
   - **Pixel ID**: `123456789012345`
   - **Access Token**: (paste the long token)
   - **Enable Facebook Pixel**: ✓ Check this
4. Click **"Save Settings"**

### **Step 4: Verify Installation**

1. Install [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/) Chrome extension
2. Visit your client site: `http://localhost:5173`
3. Click the Pixel Helper extension icon
4. You should see:
   - ✅ Pixel ID detected
   - ✅ PageView event fired
   - ✅ No errors

---

## 📊 Events Tracked Automatically

### **Client-Side Events:**

| Event | When Triggered | Data Sent |
|-------|---------------|-----------|
| `PageView` | Every page load | URL, Referrer |
| `ViewContent` | Product page view | Product ID, Name, Price |
| `AddToCart` | Add to cart click | Product ID, Quantity, Value |
| `InitiateCheckout` | Checkout page load | Cart Items, Total Value |
| `CompleteRegistration` | User registers | Email (hashed) |

### **Server-Side Events:**

| Event | When Triggered | Data Sent |
|-------|---------------|-----------|
| `Purchase` | Order confirmed | Order ID, Items, Value, Email, Phone |

---

## 🔧 How to Use Tracking Functions

### **In ProductDetails.jsx:**
```jsx
import { trackViewContent, trackAddToCart } from '../components/FacebookPixel';

// Track product view
useEffect(() => {
  if (product) {
    trackViewContent(product);
  }
}, [product]);

// Track add to cart
const handleAddToCart = () => {
  trackAddToCart(product, quantity);
  // ... rest of your code
};
```

### **In Cart.jsx:**
```jsx
import { trackInitiateCheckout } from '../components/FacebookPixel';

// When going to checkout
const handleCheckout = () => {
  trackInitiateCheckout(cartItems, total);
  navigate('/checkout');
};
```

### **In OrderConfirmation.jsx:**
```jsx
import { trackPurchase } from '../components/FacebookPixel';

useEffect(() => {
  if (order) {
    trackPurchase(order);
  }
}, [order]);
```

---

## 🎯 Advanced Features

### **1. Server-Side Tracking (CAPI)**

The system automatically tracks purchases on the server for better accuracy:

```javascript
// server/controllers/orderController.js
import facebookPixelService from '../services/facebookPixel.js';

export const createOrder = asyncHandler(async (req, res) => {
  const order = await Order.create(orderData);
  
  // Track purchase server-side
  await facebookPixelService.trackPurchase(order, {
    email: req.user?.email,
    phone: req.user?.phone,
  });
  
  res.status(201).json({ success: true, data: order });
});
```

### **2. Dynamic Configuration**

Pixel settings are stored in database and loaded automatically:
- No hardcoded pixel IDs
- Admin can change pixel anytime
- Changes take effect immediately
- Both client and server use same configuration

### **3. Privacy & Compliance**

- Email and phone are hashed (SHA-256) before sending to Facebook
- User data is anonymized
- Complies with Facebook's data policies

---

## 🧪 Testing Your Pixel

### **Method 1: Facebook Pixel Helper**
1. Install extension
2. Visit your site
3. See all events fired

### **Method 2: Facebook Events Manager**
1. Go to Events Manager
2. Click on your pixel
3. See real-time events
4. Test different actions (view product, add to cart, purchase)

### **Method 3: Browser Console**
```javascript
// Check if pixel is loaded
console.log(window.fbq); // Should be a function

// Manually trigger test event
fbq('track', 'PageView');
```

---

## 📈 Viewing Results

### **In Facebook Ads Manager:**
1. Go to **Ads Manager**
2. Create new campaign
3. Select objective (Traffic, Conversions, etc.)
4. Choose your pixel
5. See conversion data

### **In Events Manager:**
1. View all events
2. See event frequency
3. Check for errors
4. Analyze user actions

---

## ⚠️ Troubleshooting

### **Pixel Not Firing:**
- Check if pixel is enabled in admin
- Verify pixel ID is correct
- Check browser console for errors
- Clear browser cache

### **Events Not Showing:**
- Wait 5-10 minutes (Facebook has delay)
- Check Events Manager → Test Events
- Verify event names are correct
- Check network tab for blocked requests

### **Server-Side Events Not Working:**
- Verify access token is valid
- Check server logs for errors
- Ensure pixel ID is saved in database
- Test with Facebook's Test Events tool

---

## 🎯 Best Practices

1. **Test Before Going Live**
   - Use test products
   - Complete test orders
   - Verify all events in Events Manager

2. **Monitor Regularly**
   - Check Events Manager weekly
   - Look for dropped events
   - Verify data matches your analytics

3. **Optimize for Conversions**
   - Track key events (Purchase, AddToCart)
   - Use conversion data for ad optimization
   - Create custom audiences from pixel data

4. **Stay Compliant**
   - Have privacy policy
   - Use cookie consent banner
   - Hash all user data (already done)

---

## 📞 Support

If you need help:
1. Check this guide first
2. Review Facebook's documentation
3. Check Events Manager for errors
4. Test with Pixel Helper extension

---

## ✅ Checklist

- [ ] Created Facebook Pixel in Events Manager
- [ ] Generated Access Token
- [ ] Saved Pixel ID in admin settings
- [ ] Saved Access Token in admin settings
- [ ] Enabled Facebook Pixel
- [ ] Installed Pixel Helper extension
- [ ] Verified PageView event
- [ ] Tested ViewContent event
- [ ] Tested AddToCart event
- [ ] Tested Purchase event
- [ ] Verified events in Events Manager

**You're all set! Your Facebook Pixel is now fully integrated and tracking!** 🎉
