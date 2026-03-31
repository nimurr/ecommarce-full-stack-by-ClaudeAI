import express from 'express';
import { uploadSingleImage, uploadMultipleImages } from '../controllers/uploadController.js';
import { protect, authorize } from '../middleware/auth.js';
import fileUploadMiddleware from '../middleware/fileUpload.js';

const UPLOADS_FOLDER_IMAGES = './public/images';
const upload = fileUploadMiddleware(UPLOADS_FOLDER_IMAGES);

const router = express.Router();

// Upload single image (for categories, single product image)
router.post('/single', 
  protect, 
  authorize('admin'), 
  upload.single('image'), 
  uploadSingleImage
);

// Upload multiple images (for products)
router.post('/multiple', 
  protect, 
  authorize('admin'), 
  upload.array('images', 10), 
  uploadMultipleImages
);

export default router;
