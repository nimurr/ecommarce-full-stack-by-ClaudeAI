import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserOrders,
  getDashboardStats,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats/dashboard', protect, authorize('admin', 'sub-admin'), getDashboardStats);
router.get('/', protect, authorize('admin', 'sub-admin'), getUsers);
router.get('/:id', protect, authorize('admin', 'sub-admin'), getUser);
router.get('/:id/orders', protect, authorize('admin', 'sub-admin'), getUserOrders);
router.post('/', protect, authorize('admin', 'sub-admin'), createUser);
router.put('/:id', protect, authorize('admin', 'sub-admin'), updateUser);
router.delete('/:id', protect, authorize('admin', 'sub-admin'), deleteUser);

export default router;
