import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

// @desc    Get all products with filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    sort,
    page = 1,
    limit = 12,
    search,
    featured,
    inStock,
  } = req.query;

  // Build query
  const query = { active: true };

  if (category) query.category = category;
  if (brand) query.brand = { $regex: brand, $options: 'i' };
  if (featured) query.featured = featured === 'true';
  if (inStock) query.stock = { $gt: 0 };

  // Price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Rating filter
  if (rating) {
    query.rating = { $gte: Number(rating) };
  }

  // Search
  if (search) {
    query.$text = { $search: search };
  }

  // Count total products
  const total = await Product.countDocuments(query);

  // Build sort
  let sortOrder = { createdAt: -1 };
  if (sort) {
    switch (sort) {
      case 'price_asc':
        sortOrder = { price: 1 };
        break;
      case 'price_desc':
        sortOrder = { price: -1 };
        break;
      case 'rating':
        sortOrder = { rating: -1, numReviews: -1 };
        break;
      case 'popular':
        sortOrder = { numSold: -1 };
        break;
      case 'newest':
        sortOrder = { createdAt: -1 };
        break;
    }
  }

  // Pagination
  const skip = (page - 1) * limit;
  const products = await Product.find(query)
    .populate('category', 'name slug')
    .sort(sortOrder)
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    data: products,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug description')
    .populate({
      path: 'reviews',
      populate: { path: 'user', select: 'name avatar' },
      options: { sort: { createdAt: -1 } },
      limit: 10,
    });

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Get related products
  const relatedProducts = await Product.find({
    category: product.category._id,
    _id: { $ne: product._id },
    active: true,
  })
    .limit(4)
    .select('name slug price images mainImage rating numReviews');

  res.status(200).json({
    success: true,
    data: {
      product,
      relatedProducts,
    },
  });
});

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('category', 'name slug description')
    .populate({
      path: 'reviews',
      populate: { path: 'user', select: 'name avatar' },
      options: { sort: { createdAt: -1 } },
      limit: 10,
    });

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  // Add user who created the product
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  // Add product to category
  await Category.findByIdAndUpdate(req.body.category, {
    $push: { products: product._id },
  });

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product,
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Handle category change
  if (req.body.category && req.body.category !== product.category.toString()) {
    // Remove from old category
    await Category.findByIdAndUpdate(product.category, {
      $pull: { products: product._id },
    });
    // Add to new category
    await Category.findByIdAndUpdate(req.body.category, {
      $push: { products: product._id },
    });
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: product,
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Delete images from Cloudinary
  if (product.images && product.images.length > 0) {
    for (const image of product.images) {
      if (image.publicId) {
        await deleteFromCloudinary(image.publicId);
      }
    }
  }

  // Remove product from category
  await Category.findByIdAndUpdate(product.category, {
    $pull: { products: product._id },
  });

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
});

// @desc    Upload product image
// @route   POST /api/products/upload
// @access  Private/Admin
export const uploadProductImage = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.image) {
    res.status(400);
    throw new Error('Please upload an image');
  }

  const file = req.files.image;

  // Check file type
  if (!file.mimetype.startsWith('image')) {
    res.status(400);
    throw new Error('Please upload an image file');
  }

  // Check file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    res.status(400);
    throw new Error('Image size should be less than 5MB');
  }

  // Upload to Cloudinary
  const result = await uploadToCloudinary(file, 'products');

  res.status(200).json({
    success: true,
    data: result,
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ featured: true, active: true })
    .populate('category', 'name slug')
    .limit(8)
    .select('name slug price originalPrice discount images mainImage rating numReviews brand');

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
export const getNewArrivals = asyncHandler(async (req, res) => {
  const products = await Product.find({ active: true })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(8)
    .select('name slug price originalPrice discount images mainImage rating numReviews brand');

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get search suggestions
// @route   GET /api/products/search/suggestions
// @access  Public
export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(200).json({
      success: true,
      data: { products: [], categories: [], brands: [] },
    });
  }

  // Search products
  const products = await Product.find({
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { brand: { $regex: q, $options: 'i' } },
    ],
    active: true,
  })
    .limit(5)
    .select('name slug images mainImage price');

  // Search categories
  const categories = await Category.find({
    name: { $regex: q, $options: 'i' },
    active: true,
  })
    .limit(5)
    .select('name slug');

  // Get unique brands
  const brands = await Product.distinct('brand', {
    brand: { $regex: q, $options: 'i' },
    active: true,
  });

  res.status(200).json({
    success: true,
    data: { products, categories, brands: brands.slice(0, 5) },
  });
});
