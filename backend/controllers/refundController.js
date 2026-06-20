const Refund = require('../models/Refund');
const Booking = require('../models/Booking');
const { calculateRefundPolicyFromBooking } = require('../utils/refundPolicy');

// Initialize Razorpay if valid credentials are provided
let razorpay;
try {
  const Razorpay = require('razorpay');
  if (
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET &&
    process.env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder_key'
  ) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (_) {}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Generate a mock transaction reference */
const mockTxnRef = () =>
  `MOCK-TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @desc    Get all refunds (paginated, filterable)
 * @route   GET /api/refunds
 * @access  Private/Admin
 */
exports.getRefunds = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    const { status, search } = req.query;

    const query = {};

    // Filter by status (map 'requested' to 'pending' for older client compatibility)
    if (status && status !== 'all') {
      if (status === 'requested') {
        query.status = 'pending';
      } else {
        query.status = status;
      }
    }

    // Build base pipeline
    const [refunds, total] = await Promise.all([
      Refund.find(query)
        .populate({
          path: 'bookingId',
          populate: [
            { path: 'trip', select: 'busName from to date departureTime operator' },
          ],
          select: 'seats passengers totalAmount cancelledAt cancellationReason razorpayPaymentId payment',
        })
        .populate('userId', 'name email')
        .populate('approvedBy', 'name email')
        .populate('processedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Refund.countDocuments(query),
    ]);

    // Aggregate stats
    const [stats] = await Refund.aggregate([
      {
        $group: {
          _id: null,
          totalPending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
          },
          totalApproved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] },
          },
          totalProcessing: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] },
          },
          totalRefunded: {
            $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] },
          },
          totalRejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] },
          },
          totalFailed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
          },
          totalAmountRefunded: {
            $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, '$refundAmount', 0] },
          },
          totalAmountPending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$refundAmount', 0] },
          },
        },
      },
    ]);

    const refundsWithPolicy = refunds.map((refund) => {
      const refundDoc = refund.toObject ? refund.toObject() : refund;
      const booking = refund.bookingId;
      const policy = booking?.trip?.date
        ? calculateRefundPolicyFromBooking({
            ...booking,
            trip: booking.trip,
            bookingDate: booking.bookingDate || booking.createdAt,
            totalAmount: booking.totalAmount,
          })
        : null;

      return {
        ...refundDoc,
        computedRefundPercentage: policy?.refundPercentage ?? refundDoc.refundPercentage ?? refundDoc.percentage ?? 0,
        computedRefundAmount: policy?.refundAmount ?? refundDoc.refundAmount ?? refundDoc.amount ?? 0,
        computedCancellationCharges: policy?.cancellationCharges ?? refundDoc.cancellationCharges ?? 0,
      };
    });

    res.status(200).json({
      success: true,
      data: refundsWithPolicy,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
      stats: stats || {
        totalPending: 0,
        totalApproved: 0,
        totalProcessing: 0,
        totalRefunded: 0,
        totalRejected: 0,
        totalFailed: 0,
        totalAmountRefunded: 0,
        totalAmountPending: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching refunds:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Get a single refund by ID
 * @route   GET /api/refunds/:id
 * @access  Private/Admin
 */
exports.getRefundById = async (req, res) => {
  try {
    const refund = await Refund.findById(req.params.id)
      .populate({
        path: 'bookingId',
        populate: { path: 'trip' },
      })
      .populate('userId', 'name email')
      .populate('approvedBy', 'name email')
      .populate('processedBy', 'name email');

    if (!refund) {
      return res.status(404).json({ success: false, message: 'Refund not found.' });
    }

    const booking = refund.bookingId;
    const policy = booking?.trip?.date
      ? calculateRefundPolicyFromBooking({
          ...booking,
          trip: booking.trip,
          bookingDate: booking.bookingDate || booking.createdAt,
          totalAmount: booking.totalAmount,
        })
      : null;

    res.status(200).json({
      success: true,
      data: {
        ...refund.toObject(),
        computedRefundPercentage: policy?.refundPercentage ?? refund.refundPercentage ?? refund.percentage ?? 0,
        computedRefundAmount: policy?.refundAmount ?? refund.refundAmount ?? refund.amount ?? 0,
        computedCancellationCharges: policy?.cancellationCharges ?? refund.cancellationCharges ?? 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Approve a refund request
 * @route   PUT /api/refunds/:id/approve
 * @access  Private/Admin
 */
exports.approveRefund = async (req, res) => {
  try {
    const refund = await Refund.findById(req.params.id);
    if (!refund) {
      return res.status(404).json({ success: false, message: 'Refund not found.' });
    }

    if (!['pending', 'requested'].includes(refund.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot approve a refund with status "${refund.status}". Only pending refunds can be approved.`,
      });
    }

    const booking = await Booking.findById(refund.bookingId).populate('trip');
    const policy = calculateRefundPolicyFromBooking(booking);

    refund.status = 'approved';
    refund.approvedBy = req.user._id;
    refund.approvedAt = new Date();
    refund.notes = req.body?.notes || '';
    refund.amount = policy.refundAmount;
    refund.refundAmount = policy.refundAmount;
    refund.percentage = policy.refundPercentage;
    refund.refundPercentage = policy.refundPercentage;
    refund.cancellationCharges = policy.cancellationCharges;
    refund.originalFare = booking?.totalAmount ?? refund.originalFare;
    await refund.save();

    // Sync booking
    await Booking.findByIdAndUpdate(refund.bookingId, {
      refundStatus: 'approved',
      refundAmount: policy.refundAmount,
      refundPercentage: policy.refundPercentage,
      cancellationCharges: policy.cancellationCharges,
    });

    res.status(200).json({
      success: true,
      message: 'Refund approved successfully. You can now process the payment.',
      data: refund,
    });
  } catch (error) {
    console.error('Error approving refund:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Reject a refund request
 * @route   PUT /api/refunds/:id/reject
 * @access  Private/Admin
 */
exports.rejectRefund = async (req, res) => {
  try {
    const refund = await Refund.findById(req.params.id);
    if (!refund) {
      return res.status(404).json({ success: false, message: 'Refund not found.' });
    }

    if (!['pending', 'requested', 'approved', 'processing'].includes(refund.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot reject a refund with status "${refund.status}".`,
      });
    }

    const { rejectionReason } = req.body || {};
    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is required.',
      });
    }

    refund.status = 'rejected';
    refund.rejectionReason = rejectionReason.trim();
    refund.approvedBy = req.user._id; // admin who acted
    refund.approvedAt = new Date();
    await refund.save();

    // Sync booking
    await Booking.findByIdAndUpdate(refund.bookingId, { refundStatus: 'rejected' });

    res.status(200).json({
      success: true,
      message: 'Refund rejected.',
      data: refund,
    });
  } catch (error) {
    console.error('Error rejecting refund:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Process (pay out) an approved refund
 * @route   POST /api/refunds/:id/process
 * @access  Private/Admin
 */
exports.processRefund = async (req, res) => {
  try {
    const refund = await Refund.findById(req.params.id).populate({
      path: 'bookingId',
      select: 'razorpayPaymentId totalAmount payment',
    });

    if (!refund) {
      return res.status(404).json({ success: false, message: 'Refund not found.' });
    }

    if (refund.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: `Cannot process a refund with status "${refund.status}". It must be "approved" first.`,
      });
    }

    // Prevent duplicate processing
    if (refund.razorpayRefundId || refund.transactionReference) {
      return res.status(400).json({
        success: false,
        message: 'This refund has already been processed.',
      });
    }

    let transactionReference = null;
    let paymentMethod = 'manual';
    let isDemo = false;

    const booking = await Booking.findById(refund.bookingId).populate('trip');
    const policy = calculateRefundPolicyFromBooking(booking);
    refund.amount = policy.refundAmount;
    refund.refundAmount = policy.refundAmount;
    refund.percentage = policy.refundPercentage;
    refund.refundPercentage = policy.refundPercentage;
    refund.cancellationCharges = policy.cancellationCharges;
    refund.originalFare = booking?.totalAmount ?? refund.originalFare;
    await refund.save();

    // Attempt real Razorpay refund
    const razorpayPaymentId = booking?.payment?.razorpayPaymentId || booking?.razorpayPaymentId || refund.razorpayPaymentId;

    if (
      razorpay &&
      razorpayPaymentId &&
      !razorpayPaymentId.startsWith('pay_demo_')
    ) {
      try {
        const rzpRefund = await razorpay.payments.refund(razorpayPaymentId, {
          amount: Math.round(refund.refundAmount * 100), // paise
          notes: {
            refundId: refund.refundId,
            bookingId: refund.bookingId._id.toString(),
            reason: refund.reason,
          },
        });
        transactionReference = rzpRefund.id;
        paymentMethod = 'razorpay';
      } catch (rzpError) {
        console.warn('Razorpay refund failed, falling back to mock:', rzpError.message);
        transactionReference = mockTxnRef();
        isDemo = true;
      }
    } else {
      // Demo / sandbox mode
      transactionReference = mockTxnRef();
      isDemo = true;
    }

    refund.status = 'refunded';
    refund.razorpayRefundId = transactionReference;
    refund.transactionReference = transactionReference;
    refund.paymentMethod = paymentMethod;
    refund.processedBy = req.user._id;
    refund.refundedAt = new Date();
    refund.notes = req.body?.notes || refund.notes;
    await refund.save();

    // Sync booking
    if (booking) {
      booking.refundStatus = 'refunded';
      if (booking.payment) {
        booking.payment.paymentStatus = 'refunded';
      }
      await booking.save();
    } else {
      await Booking.findByIdAndUpdate(refund.bookingId, {
        refundStatus: 'refunded',
        'payment.paymentStatus': 'refunded'
      });
    }

    res.status(200).json({
      success: true,
      message: isDemo
        ? `Mock refund processed. Transaction reference: ${transactionReference}`
        : `Refund of ₹${refund.refundAmount} processed via Razorpay. Transaction: ${transactionReference}`,
      data: refund,
      isDemo,
      transactionReference,
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
