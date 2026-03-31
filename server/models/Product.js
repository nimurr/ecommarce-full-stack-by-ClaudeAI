import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
    maxlength: [200, 'Product name cannot be more than 200 characters'],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a product description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters'],
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot be more than 500 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative'],
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative'],
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot be more than 100%'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please select a category'],
  },
  brand: {
    type: String,
    required: [true, 'Please provide a brand'],
    trim: true,
  },
  images: [
    {
      url: String,
      publicId: String,
      alt: String,
    },
  ],
  mainImage: {
    type: String,
    default: '',
  },
  stock: {
    type: Number,
    required: [true, 'Please provide stock quantity'],
    min: [0, 'Stock cannot be negative'],
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
  },
  sku: {
    type: String,
    unique: true,
    uppercase: true,
  },
  specifications: {
    type: Map,
    of: String,
  },
  features: [String],
  inBox: [String],
  warranty: {
    type: String,
    default: '1 Year',
  },
  returnPolicy: {
    type: String,
    default: '7 days return policy',
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
  numSold: {
    type: Number,
    default: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
  tags: [String],
  videoUrl: {
    type: String,
    default: '',
  },
  shipping: {
    weight: Number, // in kg
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
  },
  seo: {
    title: String,
    description: String,
    keywords: [String],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Create slug from name before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    let baseSlug = this.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
    let slug = baseSlug;
    let counter = 1;
    
    // Check if slug already exists
    const Product = mongoose.model('Product');
    Product.findOne({ slug }).then(existing => {
      while (existing) {
        slug = `${baseSlug}-${counter}`;
        counter++;
        return Product.findOne({ slug }).then(e => existing = e);
      }
      this.slug = slug;
      next();
    }).catch(next);
    return; // Don't call next() here, it's called in the Promise
  }
  if (this.isModified('price') && this.originalPrice) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  next();
});

// Generate SKU if not provided
productSchema.pre('save', function(next) {
  if (!this.sku) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.sku = `EL-${this.brand?.substring(0, 3).toUpperCase() || 'GEN'}-${timestamp}${random}`;
  }
  next();
});

// Virtual for checking if in stock
productSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

// Virtual for checking if low stock
productSchema.virtual('isLowStock').get(function() {
  return this.stock > 0 && this.stock <= this.lowStockThreshold;
});

// Index for better search performance
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ featured: 1, active: 1 });
productSchema.index({ rating: -1, numReviews: -1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
