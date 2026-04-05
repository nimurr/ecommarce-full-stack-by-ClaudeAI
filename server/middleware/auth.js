import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import config from '../config/config.js';

// Protect routes - verify JWT token
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Get user from token
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
});

// Authorize specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Admin has access to everything
    if (req.user.role === 'admin') {
      return next();
    }

    // For sub-admins, check if sub-admin role is allowed
    if (req.user.role === 'sub-admin' && roles.includes('sub-admin')) {
      // Get full path for checking
      const fullPath = (req.originalUrl || req.url || '').split('?')[0];
      
      // Dashboard, Products, Categories, Orders are accessible to any sub-admin by default
      // We check if the URL contains these resources anywhere
      const isAllowed = 
        fullPath.includes('/dashboard') || 
        fullPath.includes('/products') || 
        fullPath.includes('/categories') || 
        fullPath.includes('/orders');
      
      if (isAllowed) {
        return next();
      }
      
      // Map route names to permission resources for other routes
      const pathParts = fullPath.split('/').filter(Boolean);
      const resourceIndex = pathParts.indexOf('api') !== -1 ? pathParts.indexOf('api') + 1 : 0;
      const resource = pathParts[resourceIndex] || '';
      
      const resourceMap = {
        'products': 'products',
        'orders': 'orders',
        'categories': 'categories',
        'users': 'users',
        'reviews': 'reviews',
        'coupons': 'coupons',
        'pages': 'pages',
        'brands': 'products',
        'settings': 'pages',
        'notifications': 'orders',
        'sliders': 'products',
        'testimonials': 'reviews',
        'upload': 'products',
      };
      
      // Check if resource exists in permissions and sub-admin has at least one permission enabled
      if (resourceMap[resource] && req.user.permissions[resourceMap[resource]]) {
        const hasAccess = Object.values(req.user.permissions[resourceMap[resource]]).some(val => val === true);
        if (hasAccess) {
          return next();
        }
      }
    }

    return res.status(403).json({
      success: false,
      message: `User role '${req.user.role}' is not authorized to access this route`,
    });
  };
};

// Optional auth - attach user if token exists but don't require it
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = await User.findById(decoded.id);
    } catch (error) {
      // Token invalid, continue without user
    }
  }

  next();
});
