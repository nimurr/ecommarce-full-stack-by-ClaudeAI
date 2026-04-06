import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  // Website Information
  siteName: {
    type: String,
    default: 'ElectroMart',
  },
  siteTagline: {
    type: String,
    default: 'Your One-Stop Electronics Store',
  },
  siteDescription: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  
  // Contact Information
  contactEmail: {
    type: String,
    lowercase: true,
    trim: true,
  },
  contactPhone: {
    type: String,
    trim: true,
  },
  contactPhoneSecondary: {
    type: String,
    trim: true,
  },
  
  // Address
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Bangladesh',
    },
  },
  
  // Social Media Links
  socialMedia: {
    facebook: {
      type: String,
      default: '',
    },
    twitter: {
      type: String,
      default: '',
    },
    instagram: {
      type: String,
      default: '',
    },
    linkedin: {
      type: String,
      default: '',
    },
    youtube: {
      type: String,
      default: '',
    },
  },
  
  // Business Hours
  businessHours: {
    saturday: {
      open: { type: String, default: '9:00 AM' },
      close: { type: String, default: '9:00 PM' },
    },
    sunday: {
      open: { type: String, default: '9:00 AM' },
      close: { type: String, default: '9:00 PM' },
    },
    monday: {
      open: { type: String, default: '9:00 AM' },
      close: { type: String, default: '9:00 PM' },
    },
    tuesday: {
      open: { type: String, default: '9:00 AM' },
      close: { type: String, default: '9:00 PM' },
    },
    wednesday: {
      open: { type: String, default: '9:00 AM' },
      close: { type: String, default: '9:00 PM' },
    },
    thursday: {
      open: { type: String, default: '9:00 AM' },
      close: { type: String, default: '9:00 PM' },
    },
    friday: {
      open: { type: String, default: '9:00 AM' },
      close: { type: String, default: '9:00 PM' },
    },
  },
  
  // Shipping Information
  shipping: {
    freeShippingThreshold: {
      type: Number,
      default: 1000,
    },
    shippingFee: {
      type: Number,
      default: 60,
    },
    dhakaShippingFee: {
      type: Number,
      default: 60,
    },
    othersShippingFee: {
      type: Number,
      default: 120,
    },
    estimatedDeliveryDays: {
      type: String,
      default: '3-7 business days',
    },
  },
  
  // Return Policy
  returnPolicy: {
    type: String,
    default: '7 days return policy',
  },
  
  // Logo & Branding
  logo: {
    type: String,
    default: '',
  },
  favicon: {
    type: String,
    default: '',
  },
  
  // SEO
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    googleAnalyticsId: String,
  },
  
  // Marketing & Analytics
  facebookPixel: {
    pixelId: {
      type: String,
      default: '',
      trim: true,
    },
    accessToken: {
      type: String,
      default: '',
      trim: true,
    },
    isEnabled: {
      type: Boolean,
      default: false,
    },
  },
  googleTagManager: {
    trackingId: {
      type: String,
      default: '',
      trim: true,
    },
    isEnabled: {
      type: Boolean,
      default: false,
    },
  },
  bulkSMSBD: {
    apiKey: {
      type: String,
      default: '',
      trim: true,
    },
    senderId: {
      type: String,
      default: '',
      trim: true,
    },
    isEnabled: {
      type: Boolean,
      default: false,
    },
  },
  googleAnalytics: {
    trackingId: {
      type: String,
      default: '',
      trim: true,
    },
    isEnabled: {
      type: Boolean,
      default: false,
    },
  },
}, {
  timestamps: true,
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
