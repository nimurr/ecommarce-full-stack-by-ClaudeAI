import asyncHandler from 'express-async-handler';
import Page from '../models/Page.js';

// @desc    Get all pages (Admin)
// @route   GET /api/pages
// @access  Private/Admin
export const getPages = asyncHandler(async (req, res) => {
  const { type, isActive } = req.query;

  const query = {};
  if (type) query.type = type;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const pages = await Page.find(query).sort({ displayOrder: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: pages.length,
    data: pages,
  });
});

// @desc    Get single page by ID (Admin)
// @route   GET /api/pages/:id
// @access  Private/Admin
export const getPageById = asyncHandler(async (req, res) => {
  const page = await Page.findById(req.params.id);

  if (!page) {
    res.status(404);
    throw new Error('Page not found');
  }

  res.status(200).json({
    success: true,
    data: page,
  });
});

// @desc    Get page by slug (Public)
// @route   GET /api/pages/slug/:slug
// @access  Public
export const getPageBySlug = asyncHandler(async (req, res) => {
  const page = await Page.findOne({ 
    slug: req.params.slug,
    isActive: true 
  });

  if (!page) {
    res.status(404);
    throw new Error('Page not found');
  }

  res.status(200).json({
    success: true,
    data: page,
  });
});

// @desc    Get pages by type (Public)
// @route   GET /api/pages/type/:type
// @access  Public
export const getPagesByType = asyncHandler(async (req, res) => {
  const pages = await Page.find({ 
    type: req.params.type,
    isActive: true 
  }).sort({ displayOrder: 1 });

  res.status(200).json({
    success: true,
    count: pages.length,
    data: pages,
  });
});

// @desc    Create page
// @route   POST /api/pages
// @access  Private/Admin
export const createPage = asyncHandler(async (req, res) => {
  const page = await Page.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Page created successfully',
    data: page,
  });
});

// @desc    Update page
// @route   PUT /api/pages/:id
// @access  Private/Admin
export const updatePage = asyncHandler(async (req, res) => {
  let page = await Page.findById(req.params.id);

  if (!page) {
    res.status(404);
    throw new Error('Page not found');
  }

  page = await Page.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Page updated successfully',
    data: page,
  });
});

// @desc    Delete page
// @route   DELETE /api/pages/:id
// @access  Private/Admin
export const deletePage = asyncHandler(async (req, res) => {
  const page = await Page.findById(req.params.id);

  if (!page) {
    res.status(404);
    throw new Error('Page not found');
  }

  await page.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Page deleted successfully',
  });
});

// @desc    Get all active pages for footer/menu (Public)
// @route   GET /api/pages/navigation
// @access  Public
export const getNavigationPages = asyncHandler(async (req, res) => {
  const pages = await Page.find({ 
    isActive: true 
  })
  .select('title slug type displayOrder')
  .sort({ displayOrder: 1 });

  res.status(200).json({
    success: true,
    count: pages.length,
    data: pages,
  });
});
