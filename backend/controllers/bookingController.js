const Booking = require('../models/Booking');
const Trip = require('../models/Trip');
const Razorpay = require('razorpay');

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
      booking.status = 'confirmed';
      booking.razorpayOrderId = razorpayOrderId;
      booking.razorpayPaymentId = razorpayPaymentId || `pay_demo_${Math.random().toString(36).substring(7)}`;
      booking.razorpaySignature = razorpaySignature || `sig_demo_${Math.random().toString(36).substring(7)}`;
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
      await booking.save();
      return res.status(400).json({ message: 'Transaction signature verification failed. Payment tampered.' });
    }

    // Update booking status to confirmed
    booking.status = 'confirmed';
    booking.razorpayOrderId = razorpayOrderId;
    booking.razorpayPaymentId = razorpayPaymentId;
    booking.razorpaySignature = razorpaySignature;
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

