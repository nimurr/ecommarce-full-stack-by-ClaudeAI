import express from 'express';
import {
  getSettings,
  updateSettings,
  updateFacebookPixel,
  getPublicSettings,
} from '../controllers/settingsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getSettings);
router.get('/public', getPublicSettings);

// Protected routes (Admin only)
router.put('/', protect, authorize('admin'), updateSettings);
router.put('/facebook-pixel', protect, authorize('admin'), updateFacebookPixel);

export default router;
