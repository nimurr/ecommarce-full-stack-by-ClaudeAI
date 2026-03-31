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
import { protect, authorize } from '../middleware/auth.js';
import fileUploadMiddleware from '../middleware/fileUpload.js';

const UPLOADS_FOLDER_CATEGORIES = './public/images';
const upload = fileUploadMiddleware(UPLOADS_FOLDER_CATEGORIES);

const router = express.Router();

router.get('/tree', getCategoryTree);
router.get('/featured', getFeaturedCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/', getCategories);
router.get('/:id', getCategory);

// Protected routes (Admin only)
// Create category WITH image upload
router.post('/', 
  protect, 
  authorize('admin'), 
  upload.single('image'), // Upload single image for category
  createCategory
);

// Update category WITH image upload
router.put('/:id', 
  protect, 
  authorize('admin'), 
  upload.single('image'), // Upload new image
  updateCategory
);

router.delete('/:id', protect, authorize('admin'), deleteCategory);

export default router;
