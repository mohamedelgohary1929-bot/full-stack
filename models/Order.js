const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    business: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Business reference is required.'],
    },
    farmer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Farmer reference is required.'],
    },
    products: [
      {
        product: {
          type:     mongoose.Schema.Types.ObjectId,
          ref:      'Product',
          required: [true, 'Product reference is required.'],
        },
        quantity: {
          type:     Number,
          required: [true, 'Quantity is required.'],
          min:      [1, 'Quantity must be at least 1.'],
        },
        price: {
          type:     Number,
          required: [true, 'Price is required.'],
          min:      [0.01, 'Price must be greater than zero.'],
        },
      },
    ],
    totalAmount: {
      type:     Number,
      required: [true, 'Total amount is required.'],
    },
    paymentMethod: {
      type:     String,
      enum:     ['online', 'cash'],
      required: [true, 'Payment method is required.'],
    },
    status: {
      type:    String,
      enum:    ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    commission: {
      type:     Number,
      required: [true, 'Commission is required.'],
    },
    farmerAmount: {
      type:     Number,
      required: [true, 'Farmer amount is required.'],
    },
    paymentStatus: {
      type:    String,
      enum:    ['pending', 'paid'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
