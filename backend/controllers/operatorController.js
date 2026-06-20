const Trip = require('../models/Trip');
const Booking = require('../models/Booking');

// @desc    Get operator dashboard stats
// @route   GET /api/operator/stats
// @access  Public (simulated portal, query param controls operator)
exports.getOperatorStats = async (req, res) => {
  try {
    const { operator } = req.query;
    if (!operator) {
      return res.status(400).json({ success: false, message: 'Operator name is required' });
    }

    const trips = await Trip.find({ busName: operator });
    const tripIds = trips.map(t => t._id);

    const bookings = await Booking.find({ trip: { $in: tripIds }, status: 'confirmed' });

    // Stats calculations
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalBookings = bookings.length;
    const totalBuses = trips.length;

    const totalCapacity = trips.reduce((sum, t) => sum + (t.totalSeats || 0), 0);
    const totalBookedSeats = trips.reduce((sum, t) => sum + ((t.totalSeats || 0) - (t.availableSeats || 0)), 0);
    const averageOccupancy = totalCapacity > 0 ? Math.round((totalBookedSeats / totalCapacity) * 100) : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalBookings,
        totalBuses,
        averageOccupancy
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get operator specific trips
// @route   GET /api/operator/trips
// @access  Public
exports.getOperatorTrips = async (req, res) => {
  try {
    const { operator } = req.query;
    if (!operator) {
      return res.status(400).json({ success: false, message: 'Operator name is required' });
    }

    const trips = await Trip.find({ busName: operator }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get operator specific bookings
// @route   GET /api/operator/bookings
// @access  Public
exports.getOperatorBookings = async (req, res) => {
  try {
    const { operator } = req.query;
    if (!operator) {
      return res.status(400).json({ success: false, message: 'Operator name is required' });
    }

    const trips = await Trip.find({ busName: operator });
    const tripIds = trips.map(t => t._id);

    const bookings = await Booking.find({ trip: { $in: tripIds } })
      .populate('user', 'name email')
      .populate('trip', 'busName type from to date departureTime arrivalTime')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
