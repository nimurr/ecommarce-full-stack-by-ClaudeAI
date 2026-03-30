import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please provide a coupon code'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  discountType: {
    type: String,
    required: [true, 'Please select discount type'],
    enum: ['percentage', 'fixed', 'free_shipping'],
  },
  discountValue: {
    type: Number,
    required: [true, 'Please provide discount value'],
    min: [0, 'Discount value cannot be negative'],
  },
  minPurchase: {
    type: Number,
    default: 0,
    min: [0, 'Minimum purchase cannot be negative'],
  },
  maxDiscount: {
    type: Number,
    default: null,
    min: [0, 'Maximum discount cannot be negative'],
  },
  usageLimit: {
    type: Number,
    default: null,
    min: [1, 'Usage limit must be at least 1'],
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  usageLimitPerUser: {
    type: Number,
    default: 1,
    min: [1, 'Usage limit per user must be at least 1'],
  },
  applicableCategories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
  ],
  applicableProducts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],
  excludedProducts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],
  startDate: {
    type: Date,
    required: [true, 'Please provide start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide end date'],
  },
  active: {
    type: Boolean,
    default: true,
  },
  applicableFor: {
    type: String,
    enum: ['all', 'new_users', 'existing_users'],
    default: 'all',
  },
}, {
  timestamps: true,
});

// Check if coupon is valid
couponSchema.methods.isValid = function() {
  const now = new Date();
  return (
    this.active &&
    this.startDate <= now &&
    this.endDate >= now &&
    (this.usageLimit === null || this.usageCount < this.usageLimit)
  );
};

// Index for better query performance
couponSchema.index({ code: 1 });
couponSchema.index({ active: 1, startDate: 1, endDate: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
