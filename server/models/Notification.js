import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Notification type
  type: {
    type: String,
    enum: ['order', 'product', 'user', 'review', 'system'],
    required: true,
  },
  
  // Notification subtype
  subtype: {
    type: String,
    enum: [
      'new_order',
      'order_confirmed',
      'order_shipped',
      'order_delivered',
      'order_cancelled',
      'low_stock',
      'new_review',
      'new_user',
      'system_alert',
    ],
    required: true,
  },
  
  // Title of notification
  title: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Detailed message
  message: {
    type: String,
    required: true,
  },
  
  // Related order (if applicable)
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  
  // Related product (if applicable)
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  
  // Related user (if applicable)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  
  // Icon for notification
  icon: {
    type: String,
    default: '📦',
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  
  // Read status
  isRead: {
    type: Boolean,
    default: false,
  },
  
  // Read timestamp
  readAt: Date,
  
  // Read by (for multi-admin systems)
  readBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  
  // Action URL (optional)
  actionUrl: {
    type: String,
  },
  
  // Metadata (additional data)
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  
  // Created by (system or user)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Index for faster queries
notificationSchema.index({ type: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ subtype: 1, isRead: 1 });

// Static method to create order notification
notificationSchema.statics.createOrderNotification = async function(order, subtype) {
  const notificationData = {
    type: 'order',
    subtype,
    order: order._id,
    metadata: {
      orderNumber: order.orderNumber,
      customerName: order.shippingAddress?.fullName,
      totalAmount: order.totalPrice,
    },
  };

  // Set notification details based on subtype
  switch (subtype) {
    case 'new_order':
      notificationData.title = 'New Order Received';
      notificationData.message = `Order #${order.orderNumber} from ${order.shippingAddress?.fullName} for ৳${order.totalPrice}`;
      notificationData.icon = '🛒';
      notificationData.priority = 'high';
      notificationData.actionUrl = `/orders/${order._id}`;
      break;

    case 'order_confirmed':
      notificationData.title = 'Order Confirmed';
      notificationData.message = `Order #${order.orderNumber} has been confirmed`;
      notificationData.icon = '✅';
      notificationData.priority = 'medium';
      notificationData.actionUrl = `/orders/${order._id}`;
      break;

    case 'order_shipped':
      notificationData.title = 'Order Shipped';
      notificationData.message = `Order #${order.orderNumber} has been shipped`;
      notificationData.icon = '📦';
      notificationData.priority = 'medium';
      notificationData.actionUrl = `/orders/${order._id}`;
      break;

    case 'order_delivered':
      notificationData.title = 'Order Delivered';
      notificationData.message = `Order #${order.orderNumber} has been delivered successfully`;
      notificationData.icon = '🎉';
      notificationData.priority = 'low';
      notificationData.actionUrl = `/orders/${order._id}`;
      break;

    case 'order_cancelled':
      notificationData.title = 'Order Cancelled';
      notificationData.message = `Order #${order.orderNumber} has been cancelled`;
      notificationData.icon = '❌';
      notificationData.priority = 'high';
      notificationData.actionUrl = `/orders/${order._id}`;
      break;

    default:
      notificationData.title = 'Order Update';
      notificationData.message = `Order #${order.orderNumber} updated`;
      notificationData.icon = '📋';
  }

  return await this.create(notificationData);
};

// Static method to create low stock notification
notificationSchema.statics.createLowStockNotification = async function(product) {
  return await this.create({
    type: 'product',
    subtype: 'low_stock',
    product: product._id,
    title: 'Low Stock Alert',
    message: `${product.name} is running low on stock (only ${product.stock} left)`,
    icon: '⚠️',
    priority: 'urgent',
    actionUrl: `/products/${product._id}/edit`,
    metadata: {
      productName: product.name,
      currentStock: product.stock,
      threshold: product.lowStockThreshold,
    },
  });
};

// Static method to create review notification
notificationSchema.statics.createReviewNotification = async function(review) {
  return await this.create({
    type: 'review',
    subtype: 'new_review',
    title: 'New Review Received',
    message: `${review.userName} posted a ${review.rating}-star review on ${review.product?.name || 'a product'}`,
    icon: '⭐',
    priority: 'medium',
    actionUrl: `/reviews`,
    metadata: {
      reviewId: review._id,
      rating: review.rating,
      productName: review.product?.name,
    },
  });
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
