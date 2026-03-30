import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import config from '../config/config.js';
import smsService from '../services/sms.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ $or: [{ email }, { phone }] });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email or phone');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    phone,
    password,
  });

  // Send welcome SMS
  try {
    await smsService.sendSMS(
      phone,
      `Welcome ${name}! Thank you for registering with Electronics Store. Start shopping now at ${config.clientUrl}`
    );
  } catch (error) {
    console.error('Failed to send welcome SMS:', error);
  }

  // Generate token
  const token = user.getSignedJwtToken();

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Check for user (include password for comparison)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Generate token
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      token,
    },
  });
});

// @desc    Login with phone
// @route   POST /api/auth/login-phone
// @access  Public
export const loginWithPhone = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    res.status(400);
    throw new Error('Please provide phone and password');
  }

  const user = await User.findOne({ phone }).select('+password');
  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token,
    },
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      address: user.address,
      wishlist: user.wishlist,
      verified: user.verified,
    },
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
    },
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current and new password');
  }

  const user = await User.findById(req.user.id).select('+password');

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
    data: { token },
  });
});

// @desc    Add to wishlist
// @route   POST /api/auth/wishlist/:productId
// @access  Private
export const addToWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user.wishlist.includes(req.params.productId)) {
    res.status(400);
    throw new Error('Product already in wishlist');
  }

  user.wishlist.push(req.params.productId);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Added to wishlist',
    data: user.wishlist,
  });
});

// @desc    Remove from wishlist
// @route   DELETE /api/auth/wishlist/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  user.wishlist = user.wishlist.filter(
    id => id.toString() !== req.params.productId
  );
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Removed from wishlist',
    data: user.wishlist,
  });
});

// @desc    Get wishlist
// @route   GET /api/auth/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist');

  res.status(200).json({
    success: true,
    data: user.wishlist,
  });
});
