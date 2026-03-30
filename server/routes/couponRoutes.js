import express from 'express';
import {
  getCoupons,
  getCoupon,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  deactivateCoupon,
  activateCoupon,
} from '../controllers/couponController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/validate', validateCoupon);
router.get('/', protect, authorize('admin'), getCoupons);
router.get('/:id', protect, authorize('admin'), getCoupon);
router.post('/', protect, authorize('admin'), createCoupon);
router.put('/:id', protect, authorize('admin'), updateCoupon);
router.delete('/:id', protect, authorize('admin'), deleteCoupon);
router.put('/:id/deactivate', protect, authorize('admin'), deactivateCoupon);
router.put('/:id/activate', protect, authorize('admin'), activateCoupon);

export default router;
