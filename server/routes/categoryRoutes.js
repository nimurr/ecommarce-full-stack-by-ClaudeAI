import express from 'express';
import {
  getCategories,
  getCategoryTree,
  getCategory,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getFeaturedCategories,
} from '../controllers/categoryController.js';
import { uploadCategoryImage } from '../controllers/uploadController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadSingle, handleMulterError } from '../middleware/multer.js';

const router = express.Router();

router.get('/tree', getCategoryTree);
router.get('/featured', getFeaturedCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/', getCategories);
router.get('/:id', getCategory);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);
router.post('/upload', protect, authorize('admin'), uploadSingle, handleMulterError, uploadCategoryImage);

export default router;
