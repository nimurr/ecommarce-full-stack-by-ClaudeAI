import asyncHandler from 'express-async-handler';
import Slider from '../models/Slider.js';

// @desc    Get all sliders
// @route   GET /api/sliders
// @access  Public (for client), Private (for admin)
export const getSliders = asyncHandler(async (req, res) => {
  const { isActive } = req.query;
  
  const query = {};
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const sliders = await Slider.find(query).sort({ order: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: sliders.length,
    data: sliders,
  });
});

// @desc    Get single slider
// @route   GET /api/sliders/:id
// @access  Private/Admin
export const getSlider = asyncHandler(async (req, res) => {
  const slider = await Slider.findById(req.params.id);

  if (!slider) {
    res.status(404);
    throw new Error('Slider not found');
  }

  res.status(200).json({
    success: true,
    data: slider,
  });
});

// @desc    Create slider
// @route   POST /api/sliders
// @access  Private/Admin
export const createSlider = asyncHandler(async (req, res) => {
  const slider = await Slider.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Slider created successfully',
    data: slider,
  });
});

// @desc    Update slider
// @route   PUT /api/sliders/:id
// @access  Private/Admin
export const updateSlider = asyncHandler(async (req, res) => {
  let slider = await Slider.findById(req.params.id);

  if (!slider) {
    res.status(404);
    throw new Error('Slider not found');
  }

  slider = await Slider.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Slider updated successfully',
    data: slider,
  });
});

// @desc    Delete slider
// @route   DELETE /api/sliders/:id
// @access  Private/Admin
export const deleteSlider = asyncHandler(async (req, res) => {
  const slider = await Slider.findById(req.params.id);

  if (!slider) {
    res.status(404);
    throw new Error('Slider not found');
  }

  await slider.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Slider deleted successfully',
  });
});

// @desc    Toggle slider active status
// @route   PUT /api/sliders/:id/toggle
// @access  Private/Admin
export const toggleSliderStatus = asyncHandler(async (req, res) => {
  const slider = await Slider.findById(req.params.id);

  if (!slider) {
    res.status(404);
    throw new Error('Slider not found');
  }

  slider.isActive = !slider.isActive;
  await slider.save();

  res.status(200).json({
    success: true,
    message: `Slider ${slider.isActive ? 'activated' : 'deactivated'}`,
    data: slider,
  });
});

// @desc    Update slider order
// @route   PUT /api/sliders/:id/order
// @access  Private/Admin
export const updateSliderOrder = asyncHandler(async (req, res) => {
  const { order } = req.body;
  
  const slider = await Slider.findByIdAndUpdate(
    req.params.id,
    { order },
    { new: true, runValidators: true }
  );

  if (!slider) {
    res.status(404);
    throw new Error('Slider not found');
  }

  res.status(200).json({
    success: true,
    message: 'Slider order updated',
    data: slider,
  });
});
