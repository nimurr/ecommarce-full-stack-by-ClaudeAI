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
import fileUpload from 'express-fileupload';
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

// Load env vars
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Serve static files for uploaded images
app.use('/public/images', express.static(path.join(__dirname, 'public/images')));

// Security middleware
app.use(helmet()); // Set security headers
app.use(mongoSanitize()); // Sanitize data against NoSQL injection
app.use(xss()); // Prevent XSS attacks
app.use(hpp()); // Prevent parameter pollution

// NOTE: Rate limiting disabled for better performance
// You can enable it in production by uncommenting the code below
/*
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);
*/

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cookie parser
app.use(cookieParser());

// CORS middleware - Allow all origins in development
app.use(cors({
  origin: true, // Allow all origins
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

// File upload middleware
app.use(fileUpload({
  createParentPath: true,
  limits: {
    fileSize: config.maxFileSize * 2, // Increased limit
  },
  useTempFiles: true,
  tempFileDir: path.join(__dirname, '../temp'),
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/users', userRoutes);

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
║   ✅ Rate Limiting: DISABLED                              ║
║   ✅ Auto Restart: ENABLED                                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Keep server alive - Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Unhandled Rejection Error:', err.message);
  console.log('🔄 Server will continue running...');
  // Don't exit process, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.log('🔄 Server will continue running...');
  // Don't exit process, just log the error
});

// MongoDB reconnection logic
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected, attempting to reconnect...');
  setTimeout(() => {
    connectDB();
  }, 5000); // Try to reconnect after 5 seconds
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📥 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('🔒 HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📥 SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('🔒 HTTP server closed');
    process.exit(0);
  });
});

export default app;
