import express from 'express';
import {
  getBrands,
  getFeaturedBrands,
  getBrand,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
  toggleFeatured,
} from '../controllers/brandController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/featured', getFeaturedBrands);
router.get('/slug/:slug', getBrandBySlug);
router.get('/', getBrands);
router.get('/:id', getBrand);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), createBrand);
router.put('/:id', protect, authorize('admin'), updateBrand);
router.put('/:id/featured', protect, authorize('admin'), toggleFeatured);
router.delete('/:id', protect, authorize('admin'), deleteBrand);

export default router;
