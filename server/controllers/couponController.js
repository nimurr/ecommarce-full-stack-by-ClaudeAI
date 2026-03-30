import asyncHandler from 'express-async-handler';
import Coupon from '../models/Coupon.js';
import mongoose from 'mongoose';

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, active } = req.query;

  const query = {};
  if (active !== undefined) query.active = active === 'true';

  const total = await Coupon.countDocuments(query);

  const coupons = await Coupon.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  res.status(200).json({
    success: true,
    count: coupons.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    data: coupons,
  });
});

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private/Admin
export const getCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id)
    .populate('applicableCategories', 'name slug')
    .populate('applicableProducts', 'name slug')
    .populate('excludedProducts', 'name slug');

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  res.status(200).json({
    success: true,
    data: coupon,
  });
});

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
// @access  Public
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, userId, cartTotal } = req.body;

  if (!code) {
    res.status(400);
    throw new Error('Please provide coupon code');
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() })
    .populate('applicableCategories', 'name slug')
    .populate('applicableProducts', 'name slug')
    .populate('excludedProducts', 'name slug');

  if (!coupon) {
    res.status(404);
    throw new Error('Invalid coupon code');
  }

  // Check if coupon is valid
  if (!coupon.isValid()) {
    res.status(400);
    throw new Error('Coupon is not valid or expired');
  }

  // Check usage limit
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    res.status(400);
    throw new Error('Coupon usage limit reached');
  }

  // Check minimum purchase
  if (cartTotal && cartTotal < coupon.minPurchase) {
    res.status(400);
    throw new Error(`Minimum purchase of ৳${coupon.minPurchase} required`);
  }

  // Check applicable for user type
  if (coupon.applicableFor === 'new_users') {
    const Order = mongoose.model('Order');
    const orderCount = await Order.countDocuments({ user: userId });
    if (orderCount > 0) {
      res.status(400);
      throw new Error('Coupon is only for new users');
    }
  }

  // Calculate discount
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (cartTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else if (coupon.discountType === 'fixed') {
    discount = coupon.discountValue;
  } else if (coupon.discountType === 'free_shipping') {
    discount = 'FREE_SHIPPING';
  }

  res.status(200).json({
    success: true,
    data: {
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount,
      description: coupon.description,
    },
  });
});

// @desc    Create coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Coupon created successfully',
    data: coupon,
  });
});

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
export const updateCoupon = asyncHandler(async (req, res) => {
  let coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Coupon updated successfully',
    data: coupon,
  });
});

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  await coupon.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Coupon deleted successfully',
  });
});

// @desc    Deactivate coupon
// @route   PUT /api/coupons/:id/deactivate
// @access  Private/Admin
export const deactivateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  coupon.active = false;
  await coupon.save();

  res.status(200).json({
    success: true,
    message: 'Coupon deactivated successfully',
    data: coupon,
  });
});

// @desc    Activate coupon
// @route   PUT /api/coupons/:id/activate
// @access  Private/Admin
export const activateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  coupon.active = true;
  await coupon.save();

  res.status(200).json({
    success: true,
    message: 'Coupon activated successfully',
    data: coupon,
  });
});
