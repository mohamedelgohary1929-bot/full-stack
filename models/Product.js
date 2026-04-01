const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    farmer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Farmer reference is required.'],
    },
    name: {
      type:     String,
      required: [true, 'Product name is required.'],
      trim:     true,
    },
    category: {
      type:     String,
      required: [true, 'Category is required.'],
      trim:     true,
    },
    price: {
      type:     Number,
      required: [true, 'Price is required.'],
      min:      [0.01, 'Price must be greater than zero.'],
    },
    stockQuantity: {
      type:     Number,
      required: [true, 'Stock quantity is required.'],
      min:      [0, 'Stock quantity cannot be negative.'],
    },
    image: {
      type: String,
      trim: true,
    },
    isAvailable: {
      type:    Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
