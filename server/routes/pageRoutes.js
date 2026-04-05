import express from 'express';
import {
  getPages,
  getPageById,
  getPageBySlug,
  getPagesByType,
  createPage,
  updatePage,
  deletePage,
  getNavigationPages,
} from '../controllers/pageController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/navigation', getNavigationPages);
router.get('/slug/:slug', getPageBySlug);
router.get('/type/:type', getPagesByType);

// Protected routes (Admin only)
router.get('/', protect, authorize('admin', 'sub-admin'), getPages);
router.get('/:id', protect, authorize('admin', 'sub-admin'), getPageById);
router.post('/', protect, authorize('admin', 'sub-admin'), createPage);
router.put('/:id', protect, authorize('admin', 'sub-admin'), updatePage);
router.delete('/:id', protect, authorize('admin', 'sub-admin'), deletePage);

export default router;
