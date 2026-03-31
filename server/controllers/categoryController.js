import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const { parent, featured, active } = req.query;

  const query = {};
  if (parent !== undefined) query.parent = parent === 'null' ? null : parent;
  if (featured !== undefined) query.featured = featured === 'true';
  if (active !== undefined) query.active = active === 'true';

  const categories = await Category.find(query)
    .populate('parent', 'name slug')
    .sort({ order: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

// @desc    Get category tree (hierarchical)
// @route   GET /api/categories/tree
// @access  Public
export const getCategoryTree = asyncHandler(async (req, res) => {
  const rootCategories = await Category.find({ parent: null, active: true })
    .populate({
      path: 'children',
      match: { active: true },
      select: 'name slug image',
    })
    .select('name slug image description')
    .sort({ order: 1 });

  res.status(200).json({
    success: true,
    data: rootCategories,
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate('parent', 'name slug')
    .populate({
      path: 'children',
      select: 'name slug image productCount',
    })
    .populate({
      path: 'products',
      select: 'name slug price images mainImage rating numReviews',
      limit: 12,
    });

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug })
    .populate({
      path: 'products',
      match: { active: true },
      select: 'name slug price images mainImage rating numReviews brand',
      options: { sort: { createdAt: -1 } },
      limit: 24,
    });

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Create category WITH image upload
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  // Handle uploaded image
  if (req.file) {
    req.body.image = `/public/images/${req.file.filename}`;
  }

  const category = await Category.create(req.body);

  // If parent category, add to children
  if (req.body.parent) {
    await Category.findByIdAndUpdate(req.body.parent, {
      $push: { children: category._id },
    });
  }

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category,
  });
});

// @desc    Update category WITH image upload
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Handle parent change
  if (req.body.parent && req.body.parent !== category.parent?.toString()) {
    // Remove from old parent's children
    if (category.parent) {
      await Category.findByIdAndUpdate(category.parent, {
        $pull: { children: category._id },
      });
    }
    // Add to new parent's children
    await Category.findByIdAndUpdate(req.body.parent, {
      $push: { children: category._id },
    });
  }

  // Handle new uploaded image
  if (req.file) {
    req.body.image = `/public/images/${req.file.filename}`;
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: category,
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Check if category has products
  if (category.products && category.products.length > 0) {
    res.status(400);
    throw new Error(`Cannot delete category "${category.name}" because it has ${category.products.length} product(s). Please move or delete the products first.`);
  }

  // Remove from parent's children
  if (category.parent) {
    await Category.findByIdAndUpdate(category.parent, {
      $pull: { children: category._id },
    });
  }

  // Delete children references
  if (category.children && category.children.length > 0) {
    await Category.updateMany(
      { _id: { $in: category.children } },
      { $set: { parent: null } }
    );
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
  });
});

// @desc    Get featured categories
// @route   GET /api/categories/featured
// @access  Public
export const getFeaturedCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ featured: true, active: true })
    .select('name slug image description')
    .sort({ order: 1 })
    .limit(6);

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});
