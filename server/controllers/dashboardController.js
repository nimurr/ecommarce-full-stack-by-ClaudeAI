import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  // Current month dates
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Total users
  const totalUsers = await User.countDocuments();
  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: startOfMonth }
  });

  // Total orders
  const totalOrders = await Order.countDocuments();
  
  // Current month orders
  const monthOrders = await Order.find({
    createdAt: { $gte: startOfMonth, $lte: endOfMonth }
  });

  // Orders by status for current month
  const pendingOrders = await Order.countDocuments({ 
    orderStatus: 'Pending',
    createdAt: { $gte: startOfMonth, $lte: endOfMonth }
  });
  
  const confirmedOrders = await Order.countDocuments({ 
    orderStatus: 'Confirmed',
    createdAt: { $gte: startOfMonth, $lte: endOfMonth }
  });
  
  const processingOrders = await Order.countDocuments({ 
    orderStatus: 'Processing',
    createdAt: { $gte: startOfMonth, $lte: endOfMonth }
  });
  
  const shippedOrders = await Order.countDocuments({ 
    orderStatus: 'Shipped',
    createdAt: { $gte: startOfMonth, $lte: endOfMonth }
  });
  
  const deliveredOrders = await Order.countDocuments({ 
    orderStatus: 'Delivered',
    createdAt: { $gte: startOfMonth, $lte: endOfMonth }
  });
  
  const cancelledOrders = await Order.countDocuments({ 
    orderStatus: 'Cancelled',
    createdAt: { $gte: startOfMonth, $lte: endOfMonth }
  });

  // Revenue calculations for current month
  const revenueData = await Order.aggregate([
    { 
      $match: { 
        paymentStatus: 'Paid',
        orderStatus: { $ne: 'Cancelled' },
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      } 
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalPrice' },
        count: { $sum: 1 }
      }
    }
  ]);

  const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
  const totalPaidOrders = revenueData.length > 0 ? revenueData[0].count : 0;

  // Pending revenue (orders placed but not paid)
  const pendingRevenueData = await Order.aggregate([
    { 
      $match: { 
        paymentStatus: 'Pending',
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      } 
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalPrice' },
        count: { $sum: 1 }
      }
    }
  ]);

  const pendingRevenue = pendingRevenueData.length > 0 ? pendingRevenueData[0].total : 0;

  // Top selling products this month
  const topProducts = await Order.aggregate([
    { 
      $match: {
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      }
    },
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.product',
        name: { $first: '$orderItems.name' },
        totalSold: { $sum: '$orderItems.quantity' },
        revenue: { $sum: '$orderItems.subtotal' }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $project: {
        productId: '$_id',
        name: '$product.name',
        image: '$product.mainImage',
        totalSold: 1,
        revenue: 1
      }
    }
  ]);

  // Recent orders
  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .populate('orderItems.product', 'name images mainImage')
    .sort({ createdAt: -1 })
    .limit(5);

  // Low stock products
  const lowStockProducts = await Product.find({
    stock: { $lte: '$lowStockThreshold' },
    active: true
  })
    .select('name slug stock lowStockThreshold images mainImage')
    .limit(10);

  // Total products
  const totalProducts = await Product.countDocuments();
  const activeProducts = await Product.countDocuments({ active: true });
  const lowStockCount = await Product.countDocuments({
    stock: { $lte: '$lowStockThreshold' },
    active: true
  });

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalRevenue,
        pendingRevenue,
        totalOrders,
        totalPaidOrders,
        totalUsers,
        newUsersThisMonth,
        totalProducts,
        activeProducts,
        lowStockCount,
      },
      // Current month specific stats
      currentMonth: {
        month: now.toLocaleString('default', { month: 'long' }),
        year: now.getFullYear(),
        totalOrders: monthOrders.length,
        totalRevenue,
        pendingRevenue,
        ordersByStatus: {
          pending: pendingOrders,
          confirmed: confirmedOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
      },
      ordersByStatus: {
        pending: pendingOrders,
        confirmed: confirmedOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      topProducts,
      recentOrders,
      lowStockProducts,
    },
  });
});
