import express from 'express';
import {
  getProducts,
  getProduct,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  getFeaturedProducts,
  getNewArrivals,
  getSearchSuggestions,
} from '../controllers/productController.js';
import { uploadSingleImage } from '../controllers/uploadController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadMultiple, uploadSingle, handleMulterError } from '../middleware/multer.js';

const router = express.Router();

router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/search/suggestions', getSearchSuggestions);
router.get('/slug/:slug', getProductBySlug);
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.post('/upload', protect, authorize('admin'), uploadMultiple, handleMulterError, uploadProductImage);
router.post('/upload-single', protect, authorize('admin'), uploadSingle, handleMulterError, uploadSingleImage);

export default router;
