import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// @desc    Get all sub-admins
// @route   GET /api/admin/sub-admins
// @access  Private/Admin
export const getSubAdmins = asyncHandler(async (req, res) => {
  const subAdmins = await User.find({ 
    role: 'sub-admin',
    createdBy: req.user.id 
  }).select('-password');

  res.status(200).json({
    success: true,
    count: subAdmins.length,
    data: subAdmins,
  });
});

// @desc    Get single sub-admin
// @route   GET /api/admin/sub-admins/:id
// @access  Private/Admin
export const getSubAdmin = asyncHandler(async (req, res) => {
  const subAdmin = await User.findOne({ 
    _id: req.params.id,
    role: 'sub-admin',
    createdBy: req.user.id 
  }).select('-password');

  if (!subAdmin) {
    res.status(404);
    throw new Error('Sub-admin not found');
  }

  res.status(200).json({
    success: true,
    data: subAdmin,
  });
});

// @desc    Create sub-admin
// @route   POST /api/admin/sub-admins
// @access  Private/Admin
export const createSubAdmin = asyncHandler(async (req, res) => {
  const { name, email, phone, password, permissions } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ $or: [{ email }, { phone }] });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email or phone');
  }

  // Create sub-admin with permissions
  const subAdminData = {
    name,
    email,
    phone,
    password,
    role: 'sub-admin',
    permissions: permissions || {
      products: { view: false, create: false, edit: false, delete: false },
      orders: { view: false, updateStatus: false },
      categories: { view: false, create: false, edit: false, delete: false },
      users: { view: false },
      reviews: { view: false, approve: false, delete: false },
      coupons: { view: false, create: false, edit: false, delete: false },
      pages: { view: false, edit: false },
    },
    createdBy: req.user.id,
    isActive: true,
  };

  const subAdmin = await User.create(subAdminData);

  res.status(201).json({
    success: true,
    message: 'Sub-admin created successfully',
    data: {
      id: subAdmin._id,
      name: subAdmin.name,
      email: subAdmin.email,
      phone: subAdmin.phone,
      role: subAdmin.role,
      permissions: subAdmin.permissions,
    },
  });
});

// @desc    Update sub-admin
// @route   PUT /api/admin/sub-admins/:id
// @access  Private/Admin
export const updateSubAdmin = asyncHandler(async (req, res) => {
  const { name, email, phone, password, permissions, isActive } = req.body;

  let subAdmin = await User.findOne({ 
    _id: req.params.id,
    role: 'sub-admin',
    createdBy: req.user.id 
  });

  if (!subAdmin) {
    res.status(404);
    throw new Error('Sub-admin not found');
  }

  // Update fields
  if (name) subAdmin.name = name;
  if (email) subAdmin.email = email;
  if (phone) subAdmin.phone = phone;
  if (password) subAdmin.password = password;
  if (permissions) subAdmin.permissions = permissions;
  if (isActive !== undefined) subAdmin.isActive = isActive;

  await subAdmin.save();

  res.status(200).json({
    success: true,
    message: 'Sub-admin updated successfully',
    data: {
      id: subAdmin._id,
      name: subAdmin.name,
      email: subAdmin.email,
      phone: subAdmin.phone,
      role: subAdmin.role,
      permissions: subAdmin.permissions,
      isActive: subAdmin.isActive,
    },
  });
});

// @desc    Delete sub-admin
// @route   DELETE /api/admin/sub-admins/:id
// @access  Private/Admin
export const deleteSubAdmin = asyncHandler(async (req, res) => {
  const subAdmin = await User.findOne({ 
    _id: req.params.id,
    role: 'sub-admin',
    createdBy: req.user.id 
  });

  if (!subAdmin) {
    res.status(404);
    throw new Error('Sub-admin not found');
  }

  await subAdmin.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Sub-admin deleted successfully',
  });
});

// @desc    Update sub-admin permissions
// @route   PUT /api/admin/sub-admins/:id/permissions
// @access  Private/Admin
export const updatePermissions = asyncHandler(async (req, res) => {
  const { permissions } = req.body;

  const subAdmin = await User.findOne({ 
    _id: req.params.id,
    role: 'sub-admin',
    createdBy: req.user.id 
  });

  if (!subAdmin) {
    res.status(404);
    throw new Error('Sub-admin not found');
  }

  subAdmin.permissions = permissions;
  await subAdmin.save();

  res.status(200).json({
    success: true,
    message: 'Permissions updated successfully',
    data: {
      id: subAdmin._id,
      name: subAdmin.name,
      permissions: subAdmin.permissions,
    },
  });
});

// @desc    Activate/Deactivate sub-admin
// @route   PUT /api/admin/sub-admins/:id/status
// @access  Private/Admin
export const toggleStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  const subAdmin = await User.findOne({ 
    _id: req.params.id,
    role: 'sub-admin',
    createdBy: req.user.id 
  });

  if (!subAdmin) {
    res.status(404);
    throw new Error('Sub-admin not found');
  }

  subAdmin.isActive = isActive;
  await subAdmin.save();

  res.status(200).json({
    success: true,
    message: `Sub-admin ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: {
      id: subAdmin._id,
      isActive: subAdmin.isActive,
    },
  });
});
