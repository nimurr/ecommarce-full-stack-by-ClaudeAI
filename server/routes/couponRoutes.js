import express from 'express';
import {
  getCoupons,
  getCoupon,
  getHomepageCoupon,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  deactivateCoupon,
  activateCoupon,
} from '../controllers/couponController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public route for homepage coupon
router.get('/homepage', getHomepageCoupon);

// Validate coupon (public)
router.post('/validate', validateCoupon);

// Protected routes (Admin only)
router.get('/', protect, authorize('admin', 'sub-admin'), getCoupons);
router.get('/:id', protect, authorize('admin', 'sub-admin'), getCoupon);
router.post('/', protect, authorize('admin', 'sub-admin'), createCoupon);
router.put('/:id', protect, authorize('admin', 'sub-admin'), updateCoupon);
router.delete('/:id', protect, authorize('admin', 'sub-admin'), deleteCoupon);
router.put('/:id/deactivate', protect, authorize('admin', 'sub-admin'), deactivateCoupon);
router.put('/:id/activate', protect, authorize('admin', 'sub-admin'), activateCoupon);

export default router;
