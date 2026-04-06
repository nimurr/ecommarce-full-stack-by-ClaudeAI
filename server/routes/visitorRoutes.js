import express from 'express';
import { getVisitorStats, getVisitorCount, trackClientVisit } from '../controllers/visitorController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Track client site visit (Public - called from client app)
router.post('/track', trackClientVisit);

// Get visitor statistics (Admin only)
router.get('/stats', protect, authorize('admin', 'sub-admin'), getVisitorStats);

// Get total unique visitor count (Public)
router.get('/count', getVisitorCount);

export default router;
