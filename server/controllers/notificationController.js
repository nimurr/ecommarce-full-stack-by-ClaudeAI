import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';

// @desc    Get all notifications for admin
// @route   GET /api/notifications
// @access  Private/Admin
export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type, isRead, priority } = req.query;

  const query = {};
  if (type) query.type = type;
  if (isRead !== undefined) query.isRead = isRead === 'true';
  if (priority) query.priority = priority;

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({ isRead: false });

  const notifications = await Notification.find(query)
    .populate('order', 'orderNumber orderStatus totalPrice')
    .populate('product', 'name images mainImage')
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    unreadCount,
    page: Number(page),
    pages: Math.ceil(total / limit),
    data: notifications,
  });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private/Admin
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ isRead: false });

  res.status(200).json({
    success: true,
    count,
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private/Admin
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    {
      isRead: true,
      readAt: new Date(),
      readBy: req.user.id,
    },
    { new: true }
  );

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: notification,
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private/Admin
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { isRead: false },
    {
      isRead: true,
      readAt: new Date(),
      readBy: req.user.id,
    }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private/Admin
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  await notification.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully',
  });
});

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/delete-read
// @access  Private/Admin
export const deleteReadNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ isRead: true });

  res.status(200).json({
    success: true,
    message: 'Read notifications deleted successfully',
  });
});

// @desc    Create notification (internal use)
// @route   POST /api/notifications
// @access  Private/Admin
export const createNotification = asyncHandler(async (req, res) => {
  const { type, subtype, title, message, order, product, user, icon, priority, actionUrl, metadata } = req.body;

  const notification = await Notification.create({
    type,
    subtype,
    title,
    message,
    order,
    product,
    user,
    icon,
    priority,
    actionUrl,
    metadata,
    createdBy: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: 'Notification created successfully',
    data: notification,
  });
});

// @desc    Get notifications summary for dashboard
// @route   GET /api/notifications/summary
// @access  Private/Admin
export const getNotificationsSummary = asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countDocuments({ isRead: false });
  
  const recentNotifications = await Notification.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title message icon priority isRead createdAt');

  const notificationsByType = await Notification.aggregate([
    {
      $group: {
        _id: '$type',
        total: { $sum: 1 },
        unread: {
          $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] },
        },
      },
    },
  ]);

  const notificationsByPriority = await Notification.aggregate([
    {
      $group: {
        _id: '$priority',
        total: { $sum: 1 },
        unread: {
          $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] },
        },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      unreadCount,
      recentNotifications,
      notificationsByType,
      notificationsByPriority,
    },
  });
});
