import mongoose from 'mongoose';

const sliderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [500, 'Subtitle cannot exceed 500 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  image: {
    type: String,
    required: [true, 'Please provide an image'],
  },
  buttonText: {
    type: String,
    default: 'Shop Now',
    trim: true,
  },
  buttonLink: {
    type: String,
    default: '/products',
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  // Optional: Link type (internal route or external URL)
  linkType: {
    type: String,
    enum: ['route', 'url'],
    default: 'route',
  },
  // Background gradient colors
  bgColorStart: {
    type: String,
    default: '#037dbc',
  },
  bgColorEnd: {
    type: String,
    default: '#075c89',
  },
}, {
  timestamps: true,
});

// Index for ordering
sliderSchema.index({ order: 1, isActive: 1 });

const Slider = mongoose.model('Slider', sliderSchema);

export default Slider;
