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

// Import error handlers
import { errorHandler, notFound } from './middleware/error.js';

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

// Load env vars
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Serve static files for uploaded images
app.use('/public', express.static(path.join(__dirname, 'public')));
console.log('✅ Static files served from:', path.join(__dirname, 'public'));

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
app.use(cors({
  origin: true,
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
    version: '1.0.0',
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
