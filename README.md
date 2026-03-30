# Electronics eCommerce Platform - Fullstack MERN Application

A modern, production-ready fullstack eCommerce web application for selling electronic gadgets built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## 🎯 Project Overview

This system includes:
- **Customer-facing website** - Modern, responsive eCommerce store
- **Admin dashboard** - Complete management system
- **Backend REST API** - Secure, scalable API with JWT authentication
- **Third-party integrations** - Steadfast courier API, SMS gateway

## 📁 Project Structure

```
ecommerce-website/
├── client/                 # React customer website (Vite + Tailwind)
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux Toolkit slices
│   │   ├── utils/         # Utilities and API
│   │   └── ...
│   ├── package.json
│   └── ...
├── admin/                  # React admin dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── ...
│   ├── package.json
│   └── ...
├── server/                 # Node.js + Express backend
│   ├── config/            # Database, Cloudinary config
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Auth, error, upload middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── services/          # External API services
│   ├── server.js          # Entry point
│   └── package.json
├── .env.example           # Environment variables template
└── package.json           # Root package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Install admin dependencies
cd ../admin
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Server Configuration
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/electronics_ecommerce

# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_min_64_characters_long

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Steadfast Courier API
STEADFAST_API_KEY=your_steadfast_api_key
STEADFAST_API_SECRET=your_steadfast_api_secret

# SMS Gateway (SSL Wireless)
SSL_WIRELESS_API_KEY=your_ssl_api_key
SSL_WIRELESS_API_SECRET=your_ssl_secret
SSL_WIRELESS_SID=your_ssl_sid

# Frontend URLs
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

### 3. Create Admin User

Run the server and use the seed script or create via API:

```bash
# Start server
cd server
npm run dev

# In another terminal, create admin user via API
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@example.com",
    "phone": "01234567890",
    "password": "admin123"
  }'

# Then manually update the user role to 'admin' in MongoDB
```

### 4. Start Development Servers

```bash
# From root directory
npm run dev        # Runs both client and server
# OR run separately:
npm run server     # Backend on port 5000
npm run client     # Frontend on port 5173
npm run admin      # Admin on port 5174
```

### 5. Access the Application

- **Customer Website**: http://localhost:5173
- **Admin Dashboard**: http://localhost:5174
- **Backend API**: http://localhost:5000/api
- **API Health Check**: http://localhost:5000/api/health

## 🔐 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "01234567890",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "jwt_token_here"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Product Endpoints

#### Get All Products (with filters)
```http
GET /api/products?category=xxx&brand=Samsung&minPrice=1000&maxPrice=50000&sort=price_asc&page=1&limit=12
```

#### Get Single Product
```http
GET /api/products/:id
```

#### Create Product (Admin)
```http
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "iPhone 15 Pro",
  "description": "Latest Apple flagship...",
  "price": 129999,
  "originalPrice": 149999,
  "category": "category_id",
  "brand": "Apple",
  "stock": 50,
  "features": ["A17 Pro chip", "Titanium design"],
  "specifications": {
    "Display": "6.1-inch Super Retina XDR",
    "Storage": "256GB"
  }
}
```

### Order Endpoints

#### Create Order
```http
POST /api/orders
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "orderItems": [
    {
      "product": "product_id",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "01234567890",
    "address": "House 123, Road 45",
    "city": "Dhaka",
    "zipCode": "1200"
  },
  "paymentMethod": "COD"
}
```

#### Update Order Status (Admin)
```http
PUT /api/orders/:id/status
Authorization: Bearer <admin_token>

{
  "orderStatus": "Confirmed"
}
```

### Review Endpoints

#### Create Review
```http
POST /api/reviews
Authorization: Bearer <user_token>

{
  "product": "product_id",
  "rating": 5,
  "title": "Excellent product!",
  "comment": "Really happy with this purchase."
}
```

## 🔗 Third-Party Integrations

### Steadfast Courier API

Automatically sends order data after COD order confirmation.

**Required Environment Variables:**
```
STEADFAST_API_KEY=your_api_key
STEADFAST_API_SECRET=your_api_secret
STEADFAST_BASE_URL=https://api.steadfast.com.bd/api/v1
```

**Features:**
- Automatic delivery creation
- Real-time tracking
- Status updates

### SMS Gateway (SSL Wireless)

Sends SMS notifications for order confirmations and status updates.

**Required Environment Variables:**
```
SSL_WIRELESS_API_KEY=your_api_key
SSL_WIRELESS_API_SECRET=your_api_secret
SSL_WIRELESS_SID=your_sender_id
```

**SMS Triggers:**
- Order placement
- Order status changes
- OTP verification

### Cloudinary Image Upload

For product and category images.

**Required Environment Variables:**
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🛠️ Admin Dashboard Features

- **Dashboard Overview**: Sales statistics, recent orders, top products, low stock alerts
- **Product Management**: CRUD operations, image upload, inventory management
- **Category Management**: Hierarchical categories, featured categories
- **Order Management**: View all orders, update status, track deliveries
- **User Management**: View customers, manage roles
- **Review Moderation**: Approve/delete reviews
- **Coupon System**: Create discount codes, manage validity

## 🎨 Customer Website Features

- **Home Page**: Hero banner, featured products, categories, promotions
- **Product Listing**: Filters (price, category, brand, rating), sorting, pagination
- **Product Details**: Images, specifications, reviews, related products
- **Cart**: Add/update/remove items, quantity management
- **Checkout**: Shipping address, payment method (COD/Online)
- **Order Tracking**: Real-time order status, courier tracking
- **User Account**: Profile management, order history, wishlist
- **Search**: Product search with suggestions

## 🔐 Security Features

- JWT authentication with httpOnly cookies
- Role-based access control (Admin/User)
- Input validation with express-validator
- Rate limiting on API endpoints
- XSS protection
- MongoDB injection prevention
- CORS configuration
- Helmet security headers

## 📦 Database Models

- **User**: Authentication, profile, wishlist, addresses
- **Product**: Details, pricing, inventory, specifications
- **Category**: Hierarchical structure, SEO
- **Order**: Items, shipping, payment, tracking
- **Review**: Ratings, comments, verification
- **Coupon**: Discounts, validity, usage limits

## 🚀 Deployment

### Backend (Render/VPS)

```bash
# Build and start
npm run build
npm start
```

### Frontend (Vercel/Netlify)

```bash
# Build
npm run build

# Deploy dist folder
```

### Environment Variables for Production

Update all URLs to production domains and use production MongoDB Atlas connection.

## 📝 API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... },
  "count": 10,
  "page": 1,
  "pages": 5
}
```

## 🐛 Error Handling

Errors return:

```json
{
  "success": false,
  "message": "Error description"
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## 📄 License

MIT License - feel free to use this for learning or commercial projects.

## 👨‍💻 Support

For issues or questions, please check the code documentation or create an issue.
