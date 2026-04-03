import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Order from '../models/Order.js';
import mongoose from 'mongoose';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;

  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await User.countDocuments(query);

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    data: users,
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('orders', 'orderNumber orderStatus totalPrice createdAt');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, address } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ $or: [{ email }, { phone }] });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email or phone');
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
    address,
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const updateFields = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    role: req.body.role,
    address: req.body.address,
    verified: req.body.verified,
  };

  // Remove undefined fields
  Object.keys(updateFields).forEach(key => {
    if (updateFields[key] === undefined) delete updateFields[key];
  });

  user = await User.findByIdAndUpdate(req.params.id, updateFields, {
    new: true,
    runValidators: true,
  }).select('-password');

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user,
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent deleting admin users
  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Cannot delete admin users');
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

// @desc    Get user orders
// @route   GET /api/users/:id/orders
// @access  Private/Admin
export const getUserOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const total = await Order.countDocuments({ user: req.params.id });

  const orders = await Order.find({ user: req.params.id })
    .populate('orderItems.product', 'name images mainImage')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    data: orders,
  });
});

// @desc    Get dashboard stats
// @route   GET /api/users/stats/dashboard
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  // Total users
  const totalUsers = await User.countDocuments();
  const newUsersToday = await User.countDocuments({
    createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  });

  // Total orders
  const totalOrders = await Order.countDocuments();
  const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
  const processingOrders = await Order.countDocuments({ orderStatus: { $in: ['Confirmed', 'Processing'] } });

  // Revenue
  const revenueStats = await Order.aggregate([
    { $match: { paymentStatus: 'Paid' } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' },
        pendingRevenue: {
          $sum: {
            $cond: [{ $eq: ['$paymentStatus', 'Pending'] }, '$totalPrice', 0],
          },
        },
      },
    },
  ]);

  // Top selling products
  const topProducts = await Order.aggregate([
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.product',
        name: { $first: '$orderItems.name' },
        totalSold: { $sum: '$orderItems.quantity' },
        revenue: { $sum: '$orderItems.subtotal' },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $project: {
        productId: '$_id',
        name: '$product.name',
        image: '$product.mainImage',
        totalSold: 1,
        revenue: 1,
      },
    },
  ]);

  // Recent orders
  const recentOrders = await Order.find()
    .populate('user', 'name email phone')
    .populate('orderItems.product', 'name images mainImage')
    .sort({ createdAt: -1 })
    .limit(5);

  // Low stock products
  const Product = mongoose.model('Product');
  const lowStockProducts = await Product.find({
    $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    active: true,
  })
    .select('name slug stock lowStockThreshold images mainImage')
    .limit(10);

  res.status(200).json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        newToday: newUsersToday,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        processing: processingOrders,
      },
      revenue: {
        total: revenueStats[0]?.totalRevenue || 0,
        pending: revenueStats[0]?.pendingRevenue || 0,
      },
      topProducts,
      recentOrders,
      lowStockProducts,
    },
  });
});
