import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Import config and database
import config from './config/config.js';
import connectDB from './config/db.js';
import { optimizeConnection, createIndexes } from './config/databaseOptimizer.js';
import cacheService from './services/cache.js';

// Import error handlers
import { errorHandler, notFound } from './middleware/error.js';

// Import performance middleware
import { enableCompression, enableSecurity, apiRateLimiter, enableLogging, responseTime } from './middleware/performance.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import pageRoutes from './routes/pageRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import subAdminRoutes from './routes/subAdminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import sliderRoutes from './routes/sliderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import visitorRoutes from './routes/visitorRoutes.js';

// Import middleware
import { trackVisitor } from './middleware/visitorTracking.js';

// Load env vars
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to database with optimizations
connectDB();
optimizeConnection();

// Initialize express app
const app = express();

// Serve static files for uploaded images
app.use('/public', express.static(path.join(__dirname, '..', 'public')));
console.log('✅ Static files served from:', path.join(__dirname, '..', 'public'));

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cookie parser
app.use(cookieParser());

// CORS middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://gadgetslagbe.com',
  'https://www.gadgetslagbe.com',
  'https://admin.gadgetslagbe.com',
  'https://api.gadgetslagbe.com',
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Compression middleware
app.use(compression());

// Logging middleware (development only)
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/admin/sub-admins', subAdminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sliders', sliderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/visitors', visitorRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// Root endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Electronics eCommerce API',
    version: '1.0.1',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      reviews: '/api/reviews',
      coupons: '/api/coupons',
      users: '/api/users',
    },
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
const PORT = config.port || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Electronics eCommerce Server                         ║
║                                                           ║
║   📡 Server: http://localhost:${PORT}                       ║
║   🔗 API: http://localhost:${PORT}/api                      ║
║   🌍 Environment: ${config.nodeEnv.padEnd(33)}║
║                                                           ║
║   ✅ Multer Upload: ENABLED                               ║
║   ✅ Auto Restart: ENABLED                                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Keep server alive
process.on('unhandledRejection', (err) => {
  console.error('❌ Error:', err.message);
  console.log('🔄 Server continuing...');
});

process.on('uncaughtException', (err) => {
  console.error('❌ Exception:', err.message);
  console.log('🔄 Server continuing...');
});

// MongoDB reconnection
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected, reconnecting...');
  setTimeout(() => connectDB(), 5000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📥 Closing server...');
  server.close(() => {
    console.log('🔒 Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📥 Closing server...');
  server.close(() => {
    console.log('🔒 Server closed');
    process.exit(0);
  });
});

export default app;
