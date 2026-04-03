import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    default: '',
  },
  subtotal: {
    type: Number,
    required: true,
  },
  // Product variants
  selectedColor: {
    type: String,
    default: '',
  },
  selectedSize: {
    type: String,
    default: '',
  },
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    uppercase: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Made optional for guest checkout
  },
  guestInfo: {
    name: String,
    email: String,
    phone: String,
  },
  orderItems: [orderItemSchema],
  shippingAddress: {
    fullName: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone number'],
    },
    address: {
      type: String,
      required: [true, 'Please provide address'],
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
    },
    state: {
      type: String,
    },
    zipCode: {
      type: String,
    },
    country: {
      type: String,
      default: 'Bangladesh',
    },
    landmark: {
      type: String,
    },
  },
  paymentMethod: {
    type: String,
    required: [true, 'Please select payment method'],
    enum: ['COD', 'Online', 'Card'],
    default: 'COD',
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending',
  },
  paymentInfo: {
    transactionId: String,
    paymentGateway: String,
    paidAt: Date,
    amount: Number,
  },
  itemsPrice: {
    type: Number,
    required: true,
  },
  taxPrice: {
    type: Number,
    default: 0,
  },
  shippingPrice: {
    type: Number,
    default: 0,
  },
  discountPrice: {
    type: Number,
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Refunded'],
    default: 'Pending',
  },
  deliveryStatus: {
    type: String,
    enum: ['Pending', 'In Transit', 'Delivered', 'Failed', 'Returned'],
    default: 'Pending',
  },
  courierInfo: {
    courierName: String,
    trackingNumber: String,
    consignmentId: String,
    status: String,
    statusHistory: [
      {
        status: String,
        message: String,
        location: String,
        timestamp: Date,
      },
    ],
    sentToCourier: {
      type: Boolean,
      default: false,
    },
    sentAt: Date,
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
  },
  couponCode: {
    type: String,
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters'],
  },
  adminNotes: {
    type: String,
  },
  invoice: {
    invoiceNumber: String,
    invoiceUrl: String,
    generatedAt: Date,
  },
  deliveredAt: Date,
  cancelledAt: Date,
  cancelReason: String,
}, {
  timestamps: true,
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.orderNumber = `ORD-${timestamp}${random}`;
  }
  next();
});

// Calculate total price
orderSchema.pre('save', function(next) {
  if (this.orderItems && this.orderItems.length > 0) {
    this.itemsPrice = this.orderItems.reduce((acc, item) => acc + item.subtotal, 0);
    // Total = itemsPrice + shippingPrice - discountPrice (no tax)
    this.totalPrice = this.itemsPrice + this.shippingPrice - this.discountPrice;
  }
  next();
});

// Update product stock after order
orderSchema.post('save', async function() {
  if (this.orderStatus === 'Confirmed' || this.orderStatus === 'Delivered') {
    const Product = mongoose.model('Product');
    for (const item of this.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, numSold: item.quantity },
      });
    }
  }
});

// Index for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
