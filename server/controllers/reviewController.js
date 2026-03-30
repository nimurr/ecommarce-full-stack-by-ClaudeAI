import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, rating, sortBy = 'createdAt' } = req.query;

  const query = { product: req.params.productId, approved: true };
  if (rating) query.rating = Number(rating);

  let sortOption = { [sortBy]: -1 };

  const total = await Review.countDocuments(query);

  const reviews = await Review.find(query)
    .populate('user', 'name avatar')
    .sort(sortOption)
    .limit(limit)
    .skip((page - 1) * limit);

  // Calculate rating distribution
  const ratingDistribution = await Review.aggregate([
    { $match: { product: req.params.productId, approved: true } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    data: reviews,
    ratingDistribution,
  });
});

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res) => {
  const { product, rating, title, comment, images } = req.body;

  // Check if product exists
  const productExists = await Product.findById(product);
  if (!productExists) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({
    product,
    user: req.user.id,
  });

  if (existingReview) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  // Check if user purchased the product (verified purchase)
  const Order = mongoose.model('Order');
  const purchasedOrder = await Order.findOne({
    user: req.user.id,
    orderItems: { $elemMatch: { product } },
    orderStatus: 'Delivered',
  });

  const review = await Review.create({
    product,
    user: req.user.id,
    userName: req.user.name,
    userAvatar: req.user.avatar,
    rating,
    title,
    comment,
    images,
    verified: !!purchasedOrder,
  });

  // Product rating will be updated automatically via middleware

  res.status(201).json({
    success: true,
    message: 'Review created successfully',
    data: review,
  });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = asyncHandler(async (req, res) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check if user owns the review
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this review');
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    data: review,
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check if user owns the review or is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  await review.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully',
  });
});

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Public
export const markHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  review.helpful += 1;
  await review.save();

  res.status(200).json({
    success: true,
    data: { helpful: review.helpful },
  });
});

// @desc    Mark review as not helpful
// @route   POST /api/reviews/:id/not-helpful
// @access  Public
export const markNotHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  review.notHelpful += 1;
  await review.save();

  res.status(200).json({
    success: true,
    data: { notHelpful: review.notHelpful },
  });
});

// @desc    Approve review (Admin)
// @route   PUT /api/reviews/:id/approve
// @access  Private/Admin
export const approveReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  review.approved = true;
  await review.save();

  res.status(200).json({
    success: true,
    message: 'Review approved successfully',
    data: review,
  });
});

// @desc    Respond to review (Admin)
// @route   POST /api/reviews/:id/respond
// @access  Private/Admin
export const respondToReview = asyncHandler(async (req, res) => {
  const { comment } = req.body;

  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  review.adminResponse = {
    comment,
    respondedAt: new Date(),
    respondedBy: req.user.id,
  };

  await review.save();

  res.status(200).json({
    success: true,
    message: 'Response added successfully',
    data: review,
  });
});

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews/admin
// @access  Private/Admin
export const getAllReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, approved, productId } = req.query;

  const query = {};
  if (approved !== undefined) query.approved = approved === 'true';
  if (productId) query.product = productId;

  const total = await Review.countDocuments(query);

  const reviews = await Review.find(query)
    .populate('product', 'name images')
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    data: reviews,
  });
});
