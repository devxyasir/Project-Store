const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  images: [{
    type: String,
    required: [true, 'At least one product image is required']
  }],
  technologies: [{
    type: String,
    required: [true, 'Technologies are required']
  }],
  downloadLink: {
    type: String,
    required: [true, 'Download link is required']
  },
  buyers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for text search
ProductSchema.index({ 
  title: 'text', 
  description: 'text',
  technologies: 'text'
});

// Virtual for buyer count
ProductSchema.virtual('buyerCount').get(function() {
  // Add null check to prevent error when buyers is undefined
  return this.buyers && Array.isArray(this.buyers) ? this.buyers.length : 0;
});

// Set toJSON option to include virtuals and ensure price is returned correctly
ProductSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    // Ensure price is always returned as its original numeric value
    // This prevents price from being affected by buyer count
    if (ret.price) {
      ret.price = parseFloat(ret.price);
    }
    return ret;
  }
});

ProductSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', ProductSchema);
