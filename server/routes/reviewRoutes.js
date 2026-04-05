import express from 'express';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
  markNotHelpful,
  approveReview,
  respondToReview,
  getAllReviews,
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/admin', protect, authorize('admin', 'sub-admin'), getAllReviews);
router.get('/product/:productId', getProductReviews);
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/helpful', markHelpful);
router.post('/:id/not-helpful', markNotHelpful);
router.put('/:id/approve', protect, authorize('admin', 'sub-admin'), approveReview);
router.post('/:id/respond', protect, authorize('admin', 'sub-admin'), respondToReview);

export default router;
