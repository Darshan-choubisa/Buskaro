const mongoose = require('mongoose');

/**
 * Refund Schema
 * Tracks the full lifecycle of a refund from request → approval → processing.
 * Created automatically when a user cancels a confirmed booking.
 */
const refundSchema = new mongoose.Schema(
  {
    refundId: {
      type: String,
      unique: true,
      // e.g. REF-20240612-ABCD12
    },
    bookingId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Booking',
      required: true,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    refundAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    refundPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    originalFare: {
      type: Number,
      required: true,
    },
    cancellationCharges: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'processing', 'refunded', 'rejected', 'failed'],
      default: 'pending',
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpayRefundId: {
      type: String,
      default: null,
    },
    processedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      default: null,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    reason: {
      // User's cancellation reason
      type: String,
      default: '',
    },
    rejectionReason: {
      // Admin's rejection reason
      type: String,
      default: '',
    },
    // Admin who approved the refund
    approvedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    // Admin who processed the payment
    processedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      default: null,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    // Razorpay refund ID or mock reference
    transactionReference: {
      type: String,
      default: null,
    },
    paymentMethod: {
      type: String,
      default: 'original_payment_method',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// ── Pre-save hook: generate a unique refundId ──────────────────────────────
refundSchema.pre('save', function () {
  if (!this.refundId) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.refundId = `REF-${dateStr}-${rand}`;
  }
});

module.exports = mongoose.model('Refund', refundSchema);
