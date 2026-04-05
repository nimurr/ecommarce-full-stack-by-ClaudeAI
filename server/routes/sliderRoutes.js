import express from 'express';
import {
  getSliders,
  getSlider,
  createSlider,
  updateSlider,
  deleteSlider,
  toggleSliderStatus,
  updateSliderOrder,
} from '../controllers/sliderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public route (for client to fetch active sliders)
router.get('/', getSliders);

// Protected routes (Admin only)
router.get('/:id', protect, authorize('admin', 'sub-admin'), getSlider);
router.post('/', protect, authorize('admin', 'sub-admin'), createSlider);
router.put('/:id', protect, authorize('admin', 'sub-admin'), updateSlider);
router.delete('/:id', protect, authorize('admin', 'sub-admin'), deleteSlider);
router.put('/:id/toggle', protect, authorize('admin', 'sub-admin'), toggleSliderStatus);
router.put('/:id/order', protect, authorize('admin', 'sub-admin'), updateSliderOrder);

export default router;
