const User = require('../models/User');
const Trip = require('../models/Trip');
const Booking = require('../models/Booking');
const Refund = require('../models/Refund');

// @desc    Get paginated trips for admin fleet management
// @route   GET /api/admin/trips
// @access  Private/Admin
exports.getAdminTrips = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim();

    const query = {};
    if (search) {
      query.$or = [
        { busName: { $regex: search, $options: 'i' } },
        { from: { $regex: search, $options: 'i' } },
        { to: { $regex: search, $options: 'i' } },
      ];
    }

    const [trips, total] = await Promise.all([
      Trip.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Trip.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: trips,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Admin (In a real app, you'd add admin middleware)
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTrips = await Trip.countDocuments();
    
    // Count bookings that are confirmed or cancelled (exclude pending checkout)
    const totalBookings = await Booking.countDocuments({ status: { $in: ['confirmed', 'cancelled'] } });
    const confirmedCount = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledCount = await Booking.countDocuments({ status: 'cancelled' });

    const bookings = await Booking.find({ status: { $in: ['confirmed', 'cancelled'] } });

    let grossRevenue = 0;         // Total collected from all confirmed + cancelled bookings
    let totalRefunded = 0;        // Amount actually returned to customers (refunded status)
    let cancellationChargesEarned = 0; // Fees kept on cancellations
    let netRevenue = 0;           // What admin actually keeps

    bookings.forEach((booking) => {
      if (booking.status === 'confirmed') {
        grossRevenue += booking.totalAmount || 0;
        netRevenue += booking.totalAmount || 0;
      } else if (booking.status === 'cancelled') {
        grossRevenue += booking.totalAmount || 0;
        if (booking.refundStatus === 'rejected') {
          // Refund rejected — admin keeps the full amount
          netRevenue += booking.totalAmount || 0;
          cancellationChargesEarned += booking.totalAmount || 0;
        } else if (booking.refundStatus === 'refunded') {
          // Money was actually returned — admin only keeps the cancellation fee
          const charges = booking.cancellationCharges || 0;
          const refundedBack = booking.refundAmount || (booking.totalAmount - charges);
          totalRefunded += refundedBack;
          cancellationChargesEarned += charges;
          netRevenue += charges;
        } else {
          // approved / processing / pending — refund approved but not yet paid out
          // conservatively count only cancellation charges as revenue
          const charges = booking.cancellationCharges || 0;
          cancellationChargesEarned += charges;
          netRevenue += charges;
        }
      }
    });

    // Pending refund amount (approved but not yet paid out)
    const [refundAgg] = await Refund.aggregate([
      {
        $group: {
          _id: null,
          pendingRefundAmount: {
            $sum: { $cond: [{ $in: ['$status', ['pending', 'approved', 'processing']] }, '$refundAmount', 0] },
          },
          totalRefundedAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, '$refundAmount', 0] },
          },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
          },
        },
      },
    ]);

    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('trip', 'operator from to')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalTrips,
        totalBookings,
        confirmedCount,
        cancelledCount,
        totalRevenue: netRevenue,       // net revenue (what admin keeps)
        grossRevenue,                   // total collected before refunds
        totalRefunded: refundAgg?.totalRefundedAmount || totalRefunded,
        pendingRefundAmount: refundAgg?.pendingRefundAmount || 0,
        pendingRefundCount: refundAgg?.pendingCount || 0,
        cancellationChargesEarned,
      },
      recentBookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('trip', 'operator from to departureTime arrivalTime')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Toggle block user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
exports.toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from blocking themselves
    if (req.user && req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot block or unblock yourself'
      });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (req.user && req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete yourself'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    // Clean up user bookings
    await Booking.deleteMany({ user: req.params.id });

    res.status(200).json({
      success: true,
      message: 'User and associated bookings deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
