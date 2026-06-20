const Booking = require('../models/Booking');
const Trip = require('../models/Trip');
const Refund = require('../models/Refund');
const Razorpay = require('razorpay');
const { calculateRefundPolicy } = require('../utils/refundPolicy');

// Initialize Razorpay SDK if valid credentials are provided
let razorpay;
if (
  process.env.RAZORPAY_KEY_ID && 
  process.env.RAZORPAY_KEY_SECRET && 
  process.env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder_key'
) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// @desc    Create a new booking and Razorpay order
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { trip, seats, totalAmount } = req.body;

    if (!trip || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: 'Please provide a trip and select at least one seat.' });
    }

    // Check if the trip exists
    const tripExists = await Trip.findById(trip);
    if (!tripExists) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    // Check if any of the selected seats are already confirmed
    const alreadyBooked = await Booking.findOne({
      trip,
      seats: { $in: seats },
      status: 'confirmed'
    });

    if (alreadyBooked) {
      return res.status(400).json({
        message: 'One or more of the selected seats are already reserved. Please go back and choose other seats.'
      });
    }

    // Create the booking with 'pending' status
    const booking = await Booking.create({
      user: req.user._id,
      trip,
      seats,
      totalAmount,
      status: 'pending',
      passengers: req.body.passengers
    });

    const visualId = `BK-${booking._id.toString().slice(-5).toUpperCase()}`;
    booking.bookingId = visualId;
    booking.userId = req.user._id;
    booking.amountPaid = totalAmount;
    booking.passengerDetails = req.body.passengers;
    booking.bookingStatus = 'pending';
    booking.busDetails = {
      busName: tripExists.busName || '—',
      operator: tripExists.operator || '—',
      from: tripExists.from || '—',
      to: tripExists.to || '—',
      date: tripExists.date,
      departureTime: tripExists.departureTime || '—'
    };
    booking.payment = {
      razorpayOrderId: null,
      razorpayPaymentId: null,
      razorpaySignature: null,
      paymentStatus: 'pending',
      paymentMethod: 'Razorpay',
      paidAt: null
    };
    await booking.save();

    // Generate Razorpay Order
    if (razorpay) {
      try {
        const options = {
          amount: Math.round(totalAmount * 100), // Razorpay expects amount in paise
          currency: 'INR',
          receipt: booking._id.toString()
        };
        const rzpOrder = await razorpay.orders.create(options);
        
        booking.razorpayOrderId = rzpOrder.id;
        booking.payment.razorpayOrderId = rzpOrder.id;
        await booking.save();

        return res.status(201).json({
          booking,
          razorpayOrder: {
            id: rzpOrder.id,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID
          },
          isDemo: false
        });
      } catch (rzpError) {
        console.warn('Razorpay order creation failed, falling back to demo mode:', rzpError);
      }
    }

    // Demo Sandbox Mode Fallback
    const demoOrderId = `order_demo_${booking._id}_${Math.random().toString(36).substring(4, 8)}`;
    booking.razorpayOrderId = demoOrderId;
    booking.payment.razorpayOrderId = demoOrderId;
    await booking.save();

    res.status(201).json({
      booking,
      razorpayOrder: {
        id: demoOrderId,
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        keyId: 'rzp_test_placeholder_key'
      },
      isDemo: true
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay payment signature and confirm booking
// @route   POST /api/bookings/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Check if it's a demo order
    if (razorpayOrderId && razorpayOrderId.startsWith('order_demo_')) {
      const mockPayId = razorpayPaymentId || `pay_demo_${Math.random().toString(36).substring(7)}`;
      const mockSig = razorpaySignature || `sig_demo_${Math.random().toString(36).substring(7)}`;

      booking.status = 'confirmed';
      booking.bookingStatus = 'confirmed';
      booking.razorpayOrderId = razorpayOrderId;
      booking.razorpayPaymentId = mockPayId;
      booking.razorpaySignature = mockSig;

      booking.payment = {
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: mockPayId,
        razorpaySignature: mockSig,
        paymentStatus: 'captured',
        paymentMethod: 'Demo',
        paidAt: new Date()
      };
      await booking.save();

      // Update availableSeats on the Trip
      const tripExists = await Trip.findById(booking.trip);
      if (tripExists) {
        tripExists.availableSeats = Math.max(0, tripExists.availableSeats - booking.seats.length);
        await tripExists.save();
      }

      return res.status(200).json({
        success: true,
        message: 'Demo payment verified and booking confirmed successfully!',
        booking
      });
    }

    // Real Razorpay signature verification
    const crypto = require('crypto');
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpaySignature) {
      booking.status = 'cancelled';
      booking.bookingStatus = 'cancelled';
      booking.payment = {
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: razorpayPaymentId,
        razorpaySignature: razorpaySignature,
        paymentStatus: 'failed',
        paymentMethod: 'Razorpay',
        paidAt: null
      };
      await booking.save();
      return res.status(400).json({ message: 'Transaction signature verification failed. Payment tampered.' });
    }

    // Update booking status to confirmed
    booking.status = 'confirmed';
    booking.bookingStatus = 'confirmed';
    booking.razorpayOrderId = razorpayOrderId;
    booking.razorpayPaymentId = razorpayPaymentId;
    booking.razorpaySignature = razorpaySignature;

    booking.payment = {
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId,
      razorpaySignature: razorpaySignature,
      paymentStatus: 'captured',
      paymentMethod: 'Razorpay',
      paidAt: new Date()
    };
    await booking.save();

    // Update availableSeats on the Trip
    const tripExists = await Trip.findById(booking.trip);
    if (tripExists) {
      tripExists.availableSeats = Math.max(0, tripExists.availableSeats - booking.seats.length);
      await tripExists.save();
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and booking confirmed successfully!',
      booking
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings for the logged-in user
// @route   GET /api/bookings/my
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('trip')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('trip');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    // Check ownership
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to view this booking.' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all booked seats for a specific trip
// @route   GET /api/bookings/trip/:tripId
// @access  Public
exports.getBookedSeatsForTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    // Find all confirmed bookings for this trip
    const bookings = await Booking.find({ trip: tripId, status: 'confirmed' });

    // Aggregate seats
    let bookedSeats = [];
    bookings.forEach(booking => {
      bookedSeats = bookedSeats.concat(booking.seats);
    });

    // Deduplicate
    const uniqueBookedSeats = [...new Set(bookedSeats)];

    res.json(uniqueBookedSeats);
  } catch (error) {
    console.error('Error fetching booked seats:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel a booking and calculate refund
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('trip');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Check ownership
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to cancel this booking.' });
    }

    // Check if booking is confirmed
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Only confirmed bookings can be cancelled.' });
    }

    const trip = booking.trip;
    if (!trip) {
      return res.status(404).json({ message: 'Associated trip not found.' });
    }

    const departureDateEndOfDay = new Date(trip.date);
    departureDateEndOfDay.setHours(23, 59, 59, 999);

    const bookingDate = new Date(booking.bookingDate || booking.createdAt);
    const cancelDate = new Date();

    // Safety check: Cannot cancel if the trip day has fully ended
    const timeToDepartureMs = departureDateEndOfDay.getTime() - cancelDate.getTime();
    if (timeToDepartureMs <= 0) {
      return res.status(400).json({ message: 'Cannot cancel a trip that has already departed.' });
    }

    const policy = calculateRefundPolicy({
      totalAmount: booking.totalAmount,
      tripDate: trip.date,
      bookingDate,
      cancelDate,
    });

    const refundPercentage = policy.refundPercentage;
    const refundAmount = policy.refundAmount;
    const cancellationCharges = policy.cancellationCharges;
    const cancellationReason = req.body.cancellationReason || '';

    // Update booking status
    booking.status = 'cancelled';
    booking.bookingStatus = 'cancelled';
    booking.refundAmount = refundAmount;
    booking.refundPercentage = refundPercentage;
    booking.cancellationCharges = cancellationCharges;
    booking.cancellationReason = cancellationReason;
    booking.refundStatus = 'pending';
    booking.cancelledAt = cancelDate;

    // Create a Refund document — Admin must approve before money is returned
    const refundDoc = await Refund.create({
      bookingId: booking._id,
      userId: booking.user,
      razorpayPaymentId: booking.payment?.razorpayPaymentId || booking.razorpayPaymentId || null,
      amount: refundAmount,
      refundAmount: refundAmount,
      percentage: refundPercentage,
      refundPercentage: refundPercentage,
      originalFare: booking.totalAmount,
      cancellationCharges,
      status: 'pending',
      reason: cancellationReason,
    });

    booking.refundId = refundDoc._id;
    await booking.save();

    // Restore seat availability on the Trip
    trip.availableSeats = Math.min(trip.totalSeats, trip.availableSeats + booking.seats.length);
    await trip.save();

    res.status(200).json({
      success: true,
      message: `Booking cancelled. Refund of ₹${refundAmount} (${refundPercentage}%) has been submitted for admin approval.`,
      booking,
      refund: refundDoc,
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: error.message });
  }
};


