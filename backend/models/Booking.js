const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  trip: {
    type: mongoose.Schema.ObjectId,
    ref: 'Trip',
    required: true
  },
  seats: {
    type: [String],
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundPercentage: {
    type: Number,
    default: 0
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String,
    default: ''
  },
  cancellationCharges: {
    type: Number,
    default: 0
  },
  refundStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'processing', 'refunded', 'rejected', 'failed'],
    default: 'none'
  },
  refundId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Refund',
    default: null
  },
  
  // Backward compatible payment fields
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },

  // New restructured visual/nested fields
  bookingId: {
    type: String,
    unique: true
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  passengerDetails: [{
    seatNumber: String,
    name: String
  }],
  busDetails: {
    busName: String,
    operator: String,
    from: String,
    to: String,
    date: Date,
    departureTime: String
  },
  amountPaid: {
    type: Number
  },
  payment: {
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    paymentStatus: { type: String, enum: ['pending', 'captured', 'failed', 'refunded'], default: 'pending' },
    paymentMethod: { type: String, default: 'Razorpay' },
    paidAt: { type: Date, default: null }
  },
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  passengers: [{
    seatNumber: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  }],
  bookingDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
