import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  // Total users
  const totalUsers = await User.countDocuments();
  
  // New users this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: startOfMonth }
  });

  // Total orders
  const totalOrders = await Order.countDocuments();
  
  // Orders by status
  const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
  const confirmedOrders = await Order.countDocuments({ orderStatus: 'Confirmed' });
  const processingOrders = await Order.countDocuments({ orderStatus: 'Processing' });
  const shippedOrders = await Order.countDocuments({ orderStatus: 'Shipped' });
  const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });
  const cancelledOrders = await Order.countDocuments({ orderStatus: 'Cancelled' });

  // Revenue calculations
  const revenueData = await Order.aggregate([
    { $match: { paymentStatus: 'Paid', orderStatus: { $ne: 'Cancelled' } } },
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
    { $match: { paymentStatus: 'Pending' } },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalPrice' },
        count: { $sum: 1 }
      }
    }
  ]);

  const pendingRevenue = pendingRevenueData.length > 0 ? pendingRevenueData[0].total : 0;

  // Monthly revenue (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const monthlyRevenue = await Order.aggregate([
    {
      $match: {
        paymentStatus: 'Paid',
        orderStatus: { $ne: 'Cancelled' },
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Top selling products
  const topProducts = await Order.aggregate([
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
    { $limit: 5 },
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

  // Low stock products - fixed query
  const allProducts = await Product.find({ active: true }).select('name slug stock lowStockThreshold images mainImage');
  const lowStockProducts = allProducts.filter(p => p.stock <= p.lowStockThreshold).slice(0, 5);

  // Total products
  const totalProducts = await Product.countDocuments();
  const activeProducts = await Product.countDocuments({ active: true });
  const lowStockCount = lowStockProducts.length;

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
      ordersByStatus: {
        pending: pendingOrders,
        confirmed: confirmedOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      monthlyRevenue,
      topProducts,
      recentOrders,
      lowStockProducts,
    },
  });
});
