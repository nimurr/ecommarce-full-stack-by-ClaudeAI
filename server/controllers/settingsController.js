import asyncHandler from 'express-async-handler';
import Settings from '../models/Settings.js';
import facebookPixelService from '../services/facebookPixel.js';

// @desc    Get settings
// @route   GET /api/settings
// @access  Public
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  
  // If no settings exist, create default settings
  if (!settings) {
    settings = await Settings.create({});
  }
  
  // Don't send sensitive data to client
  const publicSettings = {
    ...settings.toObject(),
    facebookPixel: {
      pixelId: settings.facebookPixel?.pixelId,
      isEnabled: settings.facebookPixel?.isEnabled,
    },
  };
  
  res.status(200).json({
    success: true,
    data: publicSettings,
  });
});

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  
  if (!settings) {
    settings = await Settings.create(req.body);
  } else {
    // Update facebook pixel service if pixel config changed
    if (req.body.facebookPixel) {
      settings.facebookPixel = req.body.facebookPixel;
      await settings.save();
      // Reinitialize pixel service with new config
      await facebookPixelService.initialize();
    } else {
      settings = await Settings.findOneAndUpdate({}, req.body, {
        new: true,
        runValidators: true,
      });
    }
  }
  
  res.status(200).json({
    success: true,
    message: 'Settings updated successfully',
    data: settings,
  });
});

// @desc    Update Facebook Pixel settings
// @route   PUT /api/settings/facebook-pixel
// @access  Private/Admin
export const updateFacebookPixel = asyncHandler(async (req, res) => {
  const { pixelId, accessToken, isEnabled } = req.body;
  
  let settings = await Settings.findOne();
  
  if (!settings) {
    settings = await Settings.create({
      facebookPixel: { pixelId, accessToken, isEnabled },
    });
  } else {
    settings.facebookPixel = { pixelId, accessToken, isEnabled };
    await settings.save();
    
    // Reinitialize pixel service with new config
    await facebookPixelService.initialize();
  }
  
  res.status(200).json({
    success: true,
    message: 'Facebook Pixel settings updated successfully',
    data: {
      pixelId: settings.facebookPixel.pixelId,
      isEnabled: settings.facebookPixel.isEnabled,
    },
  });
});

// @desc    Get public settings (for client)
// @route   GET /api/settings/public
// @access  Public
export const getPublicSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  
  if (!settings) {
    settings = await Settings.create({});
  }
  
  // Only send public data
  const publicSettings = {
    siteName: settings.siteName,
    siteTagline: settings.siteTagline,
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
    address: settings.address,
    socialMedia: settings.socialMedia,
    businessHours: settings.businessHours,
    shipping: settings.shipping,
    returnPolicy: settings.returnPolicy,
    seo: settings.seo,
    facebookPixel: {
      pixelId: settings.facebookPixel?.pixelId,
      isEnabled: settings.facebookPixel?.isEnabled,
    },
    googleAnalytics: {
      trackingId: settings.googleAnalytics?.trackingId,
      isEnabled: settings.googleAnalytics?.isEnabled,
    },
  };
  
  res.status(200).json({
    success: true,
    data: publicSettings,
  });
});
