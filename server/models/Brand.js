import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a brand name'],
    trim: true,
    unique: true,
    maxlength: [100, 'Brand name cannot exceed 100 characters'],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  logo: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  website: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],
  metaTitle: {
    type: String,
    maxlength: [100, 'Meta title cannot exceed 100 characters'],
  },
  metaDescription: {
    type: String,
    maxlength: [300, 'Meta description cannot exceed 300 characters'],
  },
}, {
  timestamps: true,
});

// Create slug from name before saving
brandSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

const Brand = mongoose.model('Brand', brandSchema);

export default Brand;
