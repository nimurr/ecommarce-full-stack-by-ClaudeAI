import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';
import config from '../config/config.js';

// @desc    Upload category image
// @route   POST /api/categories/upload
// @access  Private/Admin
export const uploadCategoryImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image');
  }

  const imageData = {
    url: `${config.apiUrl.replace('/api', '')}/public/images/${req.file.filename}`,
    filename: req.file.filename,
    size: req.file.size,
  };

  res.status(200).json({
    success: true,
    data: imageData,
  });
});

// @desc    Upload single product image
// @route   POST /api/products/upload-single
// @access  Private/Admin
export const uploadSingleImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image');
  }

  const imageData = {
    url: `${config.apiUrl.replace('/api', '')}/public/images/${req.file.filename}`,
    filename: req.file.filename,
    size: req.file.size,
  };

  res.status(200).json({
    success: true,
    data: imageData,
  });
});
