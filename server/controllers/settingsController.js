import asyncHandler from 'express-async-handler';
import Settings from '../models/Settings.js';

// @desc    Get settings
// @route   GET /api/settings
// @access  Public
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  
  // If no settings exist, create default settings
  if (!settings) {
    settings = await Settings.create({});
  }
  
  res.status(200).json({
    success: true,
    data: settings,
  });
});

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  
  if (!settings) {
    // Create settings if they don't exist
    settings = await Settings.create(req.body);
  } else {
    // Update existing settings
    settings = await Settings.findOneAndUpdate({}, req.body, {
      new: true,
      runValidators: true,
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Settings updated successfully',
    data: settings,
  });
});

// @desc    Get contact settings
// @route   GET /api/settings/contact
// @access  Public
export const getContactSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  
  if (!settings) {
    settings = await Settings.create({});
  }
  
  res.status(200).json({
    success: true,
    data: {
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      contactPhoneSecondary: settings.contactPhoneSecondary,
      address: settings.address,
      socialMedia: settings.socialMedia,
      businessHours: settings.businessHours,
    },
  });
});

// @desc    Get shipping settings
// @route   GET /api/settings/shipping
// @access  Public
export const getShippingSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  
  if (!settings) {
    settings = await Settings.create({});
  }
  
  res.status(200).json({
    success: true,
    data: settings.shipping,
  });
});
