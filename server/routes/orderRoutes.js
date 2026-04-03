import express from 'express';
import {
  getOrders,
  getMyOrders,
  getOrder,
  getOrderByNumber,
  createOrder,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  trackOrder,
  getOrderStats,
} from '../controllers/orderController.js';
import { generateInvoice } from '../controllers/invoiceController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats/summary', protect, authorize('admin'), getOrderStats);
router.get('/myorders', protect, getMyOrders);
router.get('/number/:orderNumber', getOrderByNumber);
router.get('/', protect, authorize('admin'), getOrders);
// Invoice route - must be before /:id to avoid conflict
router.get('/:id/invoice', protect, authorize('admin'), generateInvoice);
router.get('/:id', protect, getOrder);
router.get('/:id/track', trackOrder);
// Allow guest checkout (optional auth)
router.post('/', optionalAuth, createOrder);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);
router.put('/:id/payment', protect, updatePaymentStatus);
router.put('/:id/cancel', protect, cancelOrder);

export default router;
