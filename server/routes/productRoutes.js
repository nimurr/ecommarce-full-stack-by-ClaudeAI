import express from 'express';
import {
  getProducts,
  getProduct,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getNewArrivals,
  getSearchSuggestions,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import fileUploadMiddleware from '../middleware/fileUpload.js';

const UPLOADS_FOLDER_PRODUCTS = './public/images';
const upload = fileUploadMiddleware(UPLOADS_FOLDER_PRODUCTS);

const router = express.Router();

router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/search/suggestions', getSearchSuggestions);
router.get('/slug/:slug', getProductBySlug);
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes (Admin only)
// Create product WITH image upload
router.post('/', 
  protect, 
  authorize('admin'), 
  upload.array('images', 10), // Upload multiple images for product
  createProduct
);

// Update product WITH image upload
router.put('/:id', 
  protect, 
  authorize('admin'), 
  upload.array('images', 10), // Upload new images
  updateProduct
);

router.delete('/:id', protect, authorize('admin'), deleteProduct);

export default router;
