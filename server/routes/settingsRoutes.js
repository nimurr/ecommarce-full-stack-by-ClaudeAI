import express from 'express';
import {
  getSettings,
  updateSettings,
  getContactSettings,
  getShippingSettings,
} from '../controllers/settingsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getSettings);
router.get('/contact', getContactSettings);
router.get('/shipping', getShippingSettings);

// Protected routes (Admin only)
router.put('/', protect, authorize('admin'), updateSettings);

export default router;
