import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Notification from '../models/Notification.js';
import steadfastService from '../services/steadfast.js';
import smsService from '../services/sms.js';
import config from '../config/config.js';

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
  const { status, paymentStatus, page = 1, limit = 20, startDate, endDate } = req.query;

  const query = {};
  if (status) query.orderStatus = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const total = await Order.countDocuments(query);

  const orders = await Order.find(query)
    .populate('user', 'name email phone')
    .populate('orderItems.product', 'name images mainImage')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    data: orders,
  });
});

// @desc    Get user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const total = await Order.countDocuments({ user: req.user.id });

  const orders = await Order.find({ user: req.user.id })
    .populate('orderItems.product', 'name images mainImage')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    data: orders,
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('orderItems.product', 'name images mainImage price')
    .populate('coupon', 'code discountType discountValue');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if user is authorized (handle guest orders)
  if (order.user) {
    // For registered users
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to access this order');
    }
  } else {
    // For guest orders - only admin can access
    if (!req.user || req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to access this order');
    }
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Get order by order number
// @route   GET /api/orders/number/:orderNumber
// @access  Public (for tracking)
export const getOrderByNumber = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber })
    .populate('orderItems.product', 'name images mainImage price')
    .populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Create order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, couponCode, notes } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Validate products and calculate prices
  let itemsPrice = 0;
  const validatedItems = [];

  for (const item of orderItems) {
    const product = await Product.findById(item.product);

    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.product}`);
    }

    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    const subtotal = product.price * item.quantity;
    itemsPrice += subtotal;

    validatedItems.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      price: product.price,
      image: product.mainImage,
      subtotal,
      selectedColor: item.selectedColor || '',
      selectedSize: item.selectedSize || '',
    });
  }

  // Apply coupon if provided
  let discountPrice = 0;
  let coupon = null;

  if (couponCode) {
    coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

    if (!coupon) {
      res.status(400);
      throw new Error('Invalid coupon code');
    }

    if (!coupon.isValid()) {
      res.status(400);
      throw new Error('Coupon is not valid');
    }

    if (itemsPrice < coupon.minPurchase) {
      res.status(400);
      throw new Error(`Minimum purchase of ৳${coupon.minPurchase} required`);
    }

    // Calculate discount
    if (coupon.discountType === 'percentage') {
      discountPrice = (itemsPrice * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountPrice > coupon.maxDiscount) {
        discountPrice = coupon.maxDiscount;
      }
    } else if (coupon.discountType === 'fixed') {
      discountPrice = coupon.discountValue;
    }

    coupon.usageCount += 1;
    await coupon.save();
  }

  // Shipping price (free shipping for orders over 1000 BDT)
  const shippingPrice = itemsPrice > 1000 ? 0 : 60;

  // Tax (VAT 5%)
  const taxPrice = itemsPrice * 0.05;

  // Total
  const totalPrice = itemsPrice + shippingPrice + taxPrice - discountPrice;

  // Create order (user is optional for guest checkout)
  const orderData = {
    orderItems: validatedItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    discountPrice,
    totalPrice,
    coupon: coupon?._id,
    couponCode: couponCode?.toUpperCase(),
    notes,
  };

  // Attach user if logged in
  if (req.user) {
    orderData.user = req.user.id;
  }

  const order = await Order.create(orderData);

  // Create notification for new order
  await Notification.createOrderNotification(order, 'new_order');

  // Send order confirmation SMS
  try {
    await smsService.sendSMS(
      shippingAddress.phone,
      smsService.getOrderConfirmationSMS(order)
    );
  } catch (error) {
    console.error('Failed to send order SMS:', error);
  }

  // Send to Steadfast courier if COD
  if (paymentMethod === 'COD') {
    try {
      const courierResponse = await steadfastService.createDelivery(order);
      if (courierResponse && courierResponse.success) {
        order.courierInfo = {
          courierName: 'Steadfast',
          trackingNumber: courierResponse.trackingNumber,
          consignmentId: courierResponse.consignmentId,
          status: 'Pending',
          sentToCourier: true,
          sentAt: new Date(),
        };
        await order.save();
      }
    } catch (error) {
      console.error('Failed to send to Steadfast:', error);
    }
  }

  // Populate order for response
  const populatedOrder = await Order.findById(order._id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name images mainImage');

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: populatedOrder,
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, deliveryStatus, adminNotes } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (orderStatus) {
    order.orderStatus = orderStatus;

    // Update delivery status based on order status
    if (orderStatus === 'Delivered') {
      order.deliveredAt = new Date();
      order.deliveryStatus = 'Delivered';
      // Create notification for delivered order
      await Notification.createOrderNotification(order, 'order_delivered');
    } else if (orderStatus === 'Confirmed') {
      // Create notification for confirmed order
      await Notification.createOrderNotification(order, 'order_confirmed');
    } else if (orderStatus === 'Shipped') {
      // Create notification for shipped order
      await Notification.createOrderNotification(order, 'order_shipped');
    } else if (orderStatus === 'Cancelled') {
      order.cancelledAt = new Date();
      // Restore product stock
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
      // Create notification for cancelled order
      await Notification.createOrderNotification(order, 'order_cancelled');
    }

    // Send SMS notification
    try {
      await smsService.sendSMS(
        order.shippingAddress.phone,
        smsService.getOrderStatusSMS(order, orderStatus)
      );
    } catch (error) {
      console.error('Failed to send status SMS:', error);
    }
  }

  if (deliveryStatus) {
    order.deliveryStatus = deliveryStatus;
  }

  if (adminNotes) {
    order.adminNotes = adminNotes;
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    data: order,
  });
});

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment
// @access  Private
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus, transactionId, paymentGateway } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
    if (paymentStatus === 'Paid') {
      order.paymentInfo = {
        transactionId: transactionId || '',
        paymentGateway: paymentGateway || '',
        paidAt: new Date(),
        amount: order.totalPrice,
      };
    }
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Payment status updated successfully',
    data: order,
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if user is authorized
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to cancel this order');
  }

  // Check if order can be cancelled
  if (['Shipped', 'Out for Delivery', 'Delivered'].includes(order.orderStatus)) {
    res.status(400);
    throw new Error('Cannot cancel order that has been shipped');
  }

  order.orderStatus = 'Cancelled';
  order.cancelledAt = new Date();
  order.cancelReason = reason;

  // Restore product stock
  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  await order.save();

  // Send cancellation SMS
  try {
    await smsService.sendSMS(
      order.shippingAddress.phone,
      smsService.getOrderStatusSMS(order, 'Cancelled')
    );
  } catch (error) {
    console.error('Failed to send cancellation SMS:', error);
  }

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: order,
  });
});

// @desc    Track order delivery
// @route   GET /api/orders/:id/track
// @access  Public
export const trackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .select('orderNumber orderStatus deliveryStatus courierInfo createdAt deliveredAt');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // If has courier tracking, get latest status
  if (order.courierInfo?.trackingNumber) {
    try {
      const trackingData = await steadfastService.trackDelivery(
        order.courierInfo.trackingNumber
      );
      if (trackingData && trackingData.success) {
        order.courierInfo.status = trackingData.status;
        if (trackingData.statusHistory) {
          order.courierInfo.statusHistory = trackingData.statusHistory;
        }
        await order.save();
      }
    } catch (error) {
      console.error('Failed to track order:', error);
    }
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Get order statistics
// @route   GET /api/orders/stats/summary
// @access  Private/Admin
export const getOrderStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const matchQuery = {};
  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
    if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
  }

  const stats = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        totalItems: { $sum: { $sum: '$orderItems.quantity' } },
        avgOrderValue: { $avg: '$totalPrice' },
      },
    },
  ]);

  // Status breakdown
  const statusBreakdown = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 },
        revenue: { $sum: '$totalPrice' },
      },
    },
  ]);

  // Payment status breakdown
  const paymentBreakdown = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$paymentStatus',
        count: { $sum: 1 },
        revenue: { $sum: '$totalPrice' },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      summary: stats[0] || { totalOrders: 0, totalRevenue: 0, totalItems: 0, avgOrderValue: 0 },
      statusBreakdown,
      paymentBreakdown,
    },
  });
});
