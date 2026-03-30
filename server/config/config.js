import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  apiUrl: process.env.API_URL || 'http://localhost:5000/api',
  
  // Database
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/electronics_ecommerce',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'default_secret_change_in_production',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  jwtCookieExpire: parseInt(process.env.JWT_COOKIE_EXPIRE) || 7,
  
  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  
  // Steadfast Courier
  steadfast: {
    apiKey: process.env.STEADFAST_API_KEY,
    apiSecret: process.env.STEADFAST_API_SECRET,
    baseUrl: process.env.STEADFAST_BASE_URL || 'https://api.steadfast.com.bd/api/v1',
  },
  
  // SMS Gateway (SSL Wireless)
  sms: {
    sslWireless: {
      apiKey: process.env.SSL_WIRELESS_API_KEY,
      apiSecret: process.env.SSL_WIRELESS_API_SECRET,
      sid: process.env.SSL_WIRELESS_SID,
      baseUrl: process.env.SSL_WIRELESS_BASE_URL || 'https://api.sslwireless.com/smsapi',
    },
    bulkSmsBd: {
      apiKey: process.env.BULK_SMS_BD_API_KEY,
      senderId: process.env.BULK_SMS_BD_SENDER_ID || 'INFO',
    },
  },
  
  // SSLCommerz Payment
  sslcommerz: {
    storeId: process.env.SSLCOMMERZ_STORE_ID,
    storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD,
    apiUrl: process.env.SSLCOMMERZ_API_URL || 'https://sandbox.sslcommerz.com/gwprocess/v3/api.php',
  },
  
  // Email
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'noreply@yourelectronicsstore.com',
  },
  
  // Frontend URLs
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  adminUrl: process.env.ADMIN_URL || 'http://localhost:5174',
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 20,
  },
  
  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
  allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/webp'],
};

export default config;
