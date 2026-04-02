import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  createNotification,
  getNotificationsSummary,
} from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin', 'sub-admin'));

router.get('/summary', getNotificationsSummary);
router.get('/unread-count', getUnreadCount);
router.get('/', getNotifications);
router.put('/mark-all-read', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/delete-read', deleteReadNotifications);
router.delete('/:id', deleteNotification);
router.post('/', createNotification);

export default router;
