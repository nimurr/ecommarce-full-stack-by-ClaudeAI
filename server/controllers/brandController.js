import asyncHandler from 'express-async-handler';
import Brand from '../models/Brand.js';

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
export const getBrands = asyncHandler(async (req, res) => {
  const { isActive, isFeatured, page = 1, limit = 20 } = req.query;

  const query = {};
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';

  const total = await Brand.countDocuments(query);

  const brands = await Brand.find(query)
    .sort({ displayOrder: 1, name: 1 })
    .limit(limit)
    .skip((page - 1) * limit);

  res.status(200).json({
    success: true,
    count: brands.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    data: brands,
  });
});

// @desc    Get featured brands (for homepage)
// @route   GET /api/brands/featured
// @access  Public
export const getFeaturedBrands = asyncHandler(async (req, res) => {
  const { limit = 12 } = req.query;

  const brands = await Brand.find({ 
    isActive: true, 
    isFeatured: true 
  })
  .sort({ displayOrder: 1 })
  .limit(Number(limit));

  res.status(200).json({
    success: true,
    count: brands.length,
    data: brands,
  });
});

// @desc    Get single brand by ID
// @route   GET /api/brands/:id
// @access  Public
export const getBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id)
    .populate('products', 'name slug price images mainImage rating');

  if (!brand) {
    res.status(404);
    throw new Error('Brand not found');
  }

  res.status(200).json({
    success: true,
    data: brand,
  });
});

// @desc    Get brand by slug
// @route   GET /api/brands/slug/:slug
// @access  Public
export const getBrandBySlug = asyncHandler(async (req, res) => {
  const brand = await Brand.findOne({ slug: req.params.slug })
    .populate('products', 'name slug price images mainImage rating numReviews');

  if (!brand) {
    res.status(404);
    throw new Error('Brand not found');
  }

  res.status(200).json({
    success: true,
    data: brand,
  });
});

// @desc    Create brand
// @route   POST /api/brands
// @access  Private/Admin
export const createBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Brand created successfully',
    data: brand,
  });
});

// @desc    Update brand
// @route   PUT /api/brands/:id
// @access  Private/Admin
export const updateBrand = asyncHandler(async (req, res) => {
  let brand = await Brand.findById(req.params.id);

  if (!brand) {
    res.status(404);
    throw new Error('Brand not found');
  }

  brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Brand updated successfully',
    data: brand,
  });
});

// @desc    Delete brand
// @route   DELETE /api/brands/:id
// @access  Private/Admin
export const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    res.status(404);
    throw new Error('Brand not found');
  }

  // Check if brand has products
  if (brand.products && brand.products.length > 0) {
    res.status(400);
    throw new Error('Cannot delete brand with products. Remove products first.');
  }

  await brand.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Brand deleted successfully',
  });
});

// @desc    Toggle brand featured status
// @route   PUT /api/brands/:id/featured
// @access  Private/Admin
export const toggleFeatured = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    res.status(404);
    throw new Error('Brand not found');
  }

  brand.isFeatured = !brand.isFeatured;
  await brand.save();

  res.status(200).json({
    success: true,
    message: `Brand ${brand.isFeatured ? 'featured' : 'unfeatured'}`,
    data: brand,
  });
});
