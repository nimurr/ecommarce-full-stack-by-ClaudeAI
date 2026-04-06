import express from 'express';
import {
  getSettings,
  updateSettings,
  updateFacebookPixel,
  updateGoogleTagManager,
  updateBulkSMSBD,
  getPublicSettings,
} from '../controllers/settingsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getSettings);
router.get('/public', getPublicSettings);

// Protected routes (Admin only)
router.put('/', protect, authorize('admin', 'sub-admin'), updateSettings);
router.put('/facebook-pixel', protect, authorize('admin', 'sub-admin'), updateFacebookPixel);
router.put('/google-tag-manager', protect, authorize('admin', 'sub-admin'), updateGoogleTagManager);
router.put('/bulk-sms', protect, authorize('admin'), updateBulkSMSBD);

export default router;
