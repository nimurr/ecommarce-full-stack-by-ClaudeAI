import express from 'express';
import {
  getAllTestimonials,
  getPublicTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialActive,
} from '../controllers/testimonialController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getPublicTestimonials);

// Admin routes
router.use(protect);
router.use(authorize('admin', 'sub-admin'));

router.get('/admin', getAllTestimonials);
router.post('/', createTestimonial);
router.put('/:id', updateTestimonial);
router.delete('/:id', deleteTestimonial);
router.put('/:id/toggle-active', toggleTestimonialActive);

export default router;
