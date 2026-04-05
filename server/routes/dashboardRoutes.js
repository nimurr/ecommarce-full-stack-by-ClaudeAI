import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics (Admin only)
router.get('/stats', protect, authorize('admin', 'sub-admin'), getDashboardStats);

export default router;
