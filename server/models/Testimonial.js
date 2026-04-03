import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Please provide a customer name'],
    trim: true,
  },
  customerTitle: {
    type: String,
    trim: true,
    default: '',
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: [true, 'Please provide a testimonial comment'],
    maxlength: [500, 'Comment cannot be more than 500 characters'],
  },
  image: {
    type: String,
    default: '',
  },
  active: {
    type: Boolean,
    default: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

testimonialSchema.index({ active: 1, featured: 1 });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

export default Testimonial;
