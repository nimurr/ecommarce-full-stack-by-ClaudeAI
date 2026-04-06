import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  visitorId: {
    type: String,
    required: true,
    index: true,
  },
  ip: {
    type: String,
    required: true,
    index: true,
  },
  userAgent: {
    type: String,
  },
  page: {
    type: String,
  },
  referrer: {
    type: String,
  },
  browser: {
    type: String,
  },
  os: {
    type: String,
  },
  device: {
    type: String,
    enum: ['desktop', 'tablet', 'mobile', 'unknown'],
    default: 'unknown',
  },
  country: {
    type: String,
  },
  city: {
    type: String,
  },
  isFirstVisit: {
    type: Boolean,
    default: true,
  },
  lastVisit: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Create compound index for efficient unique visitor queries
visitorSchema.index({ visitorId: 1, createdAt: -1 });
visitorSchema.index({ ip: 1, createdAt: -1 });

const Visitor = mongoose.model('Visitor', visitorSchema);

export default Visitor;
