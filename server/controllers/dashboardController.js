import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Visitor from '../models/Visitor.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  const { period } = req.query; // 'month' or 'all'

  // Current month dates
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Determine date filter based on period
  const dateFilter = period === 'all' ? {} : { createdAt: { $gte: startOfMonth, $lte: endOfMonth } };
  const periodLabel = period === 'all' ? 'All Time' : now.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Total users
  const totalUsers = await User.countDocuments();
  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: startOfMonth }
  });

  // Total orders
  const totalOrders = await Order.countDocuments();

  // Orders by status based on period
  const pendingOrders = await Order.countDocuments({
    orderStatus: 'Pending',
    ...dateFilter
  });

  const confirmedOrders = await Order.countDocuments({
    orderStatus: 'Confirmed',
    ...dateFilter
  });

  const processingOrders = await Order.countDocuments({
    orderStatus: 'Processing',
    ...dateFilter
  });

  const shippedOrders = await Order.countDocuments({
    orderStatus: 'Shipped',
    ...dateFilter
  });

  const deliveredOrders = await Order.countDocuments({
    orderStatus: 'Delivered',
    ...dateFilter
  });

  const cancelledOrders = await Order.countDocuments({
    orderStatus: 'Cancelled',
    ...dateFilter
  });

  // Revenue calculations based on period
  const revenueMatch = {
    paymentStatus: 'Paid',
    orderStatus: { $ne: 'Cancelled' }
  };
  if (period !== 'all') {
    revenueMatch.createdAt = { $gte: startOfMonth, $lte: endOfMonth };
  }

  const revenueData = await Order.aggregate([
    { $match: revenueMatch },
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

  // Pending revenue based on period
  const pendingMatch = { paymentStatus: 'Pending' };
  if (period !== 'all') {
    pendingMatch.createdAt = { $gte: startOfMonth, $lte: endOfMonth };
  }

  const pendingRevenueData = await Order.aggregate([
    { $match: pendingMatch },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalPrice' },
        count: { $sum: 1 }
      }
    }
  ]);

  const pendingRevenue = pendingRevenueData.length > 0 ? pendingRevenueData[0].total : 0;

  // Orders count based on period
  const ordersCount = period === 'all'
    ? await Order.countDocuments()
    : await Order.countDocuments(dateFilter);

  // Top selling products based on period
  const topProductsMatch = {};
  if (period !== 'all') {
    topProductsMatch.createdAt = { $gte: startOfMonth, $lte: endOfMonth };
  }

  const topProducts = await Order.aggregate([
    { $match: topProductsMatch },
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

  // Recent orders - without populate to avoid lean() conflict
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5);

  // Low stock products - using $expr to compare stock field with lowStockThreshold field
  const lowStockProducts = await Product.find({
    $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    active: true
  })
    .select('name slug stock lowStockThreshold images mainImage')
    .limit(10);

  // Total products
  const totalProducts = await Product.countDocuments();
  const activeProducts = await Product.countDocuments({ active: true });
  const lowStockCount = await Product.countDocuments({
    $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    active: true
  });

  // Visitor statistics - Unique IPs (client site only)
  const totalUniqueVisitors = await Visitor.aggregate([
    { $group: { _id: '$ip' } },
    { $count: 'total' }
  ]);

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayVisitors = await Visitor.aggregate([
    { $match: { createdAt: { $gte: today } } },
    { $group: { _id: '$ip' } },
    { $count: 'total' }
  ]);

  const newVisitorsThisMonth = await Visitor.aggregate([
    { $match: { createdAt: { $gte: startOfMonth }, isFirstVisit: true } },
    { $group: { _id: '$ip' } },
    { $count: 'total' }
  ]);

  res.status(200).json({
    success: true,
    data: {
      period: periodLabel,
      overview: {
        totalRevenue,
        pendingRevenue,
        totalOrders,
        totalPaidOrders,
        ordersCount,
        totalUsers,
        newUsersThisMonth,
        totalProducts,
        activeProducts,
        lowStockCount,
        totalUniqueVisitors: totalUniqueVisitors[0]?.total || 0,
        todayVisitors: todayVisitors[0]?.total || 0,
        newVisitorsThisMonth: newVisitorsThisMonth[0]?.total || 0,
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
