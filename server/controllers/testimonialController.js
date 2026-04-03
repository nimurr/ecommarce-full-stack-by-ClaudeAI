import asyncHandler from 'express-async-handler';
import Testimonial from '../models/Testimonial.js';

// @desc    Get all testimonials (Admin)
// @route   GET /api/testimonials/admin
// @access  Private/Admin
export const getAllTestimonials = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, active, featured } = req.query;

  const filter = {};
  if (active !== undefined) filter.active = active === 'true';
  if (featured !== undefined) filter.featured = featured === 'true';

  const testimonials = await Testimonial.find(filter)
    .sort({ order: 1, createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Testimonial.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: testimonials.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: testimonials,
  });
});

// @desc    Get active testimonials (Public)
// @route   GET /api/testimonials
// @access  Public
export const getPublicTestimonials = asyncHandler(async (req, res) => {
  const { limit = 10, featured } = req.query;

  const filter = { active: true };
  if (featured === 'true') filter.featured = true;

  const testimonials = await Testimonial.find(filter)
    .sort({ order: 1, createdAt: -1 })
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: testimonials.length,
    data: testimonials,
  });
});

// @desc    Create testimonial
// @route   POST /api/testimonials
// @access  Private/Admin
export const createTestimonial = asyncHandler(async (req, res) => {
  const { customerName, customerTitle, rating, comment, image, active, featured, order } = req.body;

  const testimonial = await Testimonial.create({
    customerName,
    customerTitle: customerTitle || '',
    rating,
    comment,
    image: image || '',
    active: active !== undefined ? active : true,
    featured: featured || false,
    order: order || 0,
  });

  res.status(201).json({
    success: true,
    data: testimonial,
  });
});

// @desc    Update testimonial
// @route   PUT /api/testimonials/:id
// @access  Private/Admin
export const updateTestimonial = asyncHandler(async (req, res) => {
  const { customerName, customerTitle, rating, comment, image, active, featured, order } = req.body;

  let testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    res.status(404);
    throw new Error('Testimonial not found');
  }

  testimonial.customerName = customerName || testimonial.customerName;
  testimonial.customerTitle = customerTitle !== undefined ? customerTitle : testimonial.customerTitle;
  testimonial.rating = rating || testimonial.rating;
  testimonial.comment = comment || testimonial.comment;
  testimonial.image = image !== undefined ? image : testimonial.image;
  testimonial.active = active !== undefined ? active : testimonial.active;
  testimonial.featured = featured !== undefined ? featured : testimonial.featured;
  testimonial.order = order !== undefined ? order : testimonial.order;

  await testimonial.save();

  res.status(200).json({
    success: true,
    data: testimonial,
  });
});

// @desc    Delete testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private/Admin
export const deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    res.status(404);
    throw new Error('Testimonial not found');
  }

  await testimonial.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Testimonial deleted successfully',
  });
});

// @desc    Toggle testimonial active status
// @route   PUT /api/testimonials/:id/toggle-active
// @access  Private/Admin
export const toggleTestimonialActive = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    res.status(404);
    throw new Error('Testimonial not found');
  }

  testimonial.active = !testimonial.active;
  await testimonial.save();

  res.status(200).json({
    success: true,
    data: testimonial,
  });
});
