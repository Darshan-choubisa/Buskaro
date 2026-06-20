const mongoose = require('mongoose');
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const Booking = require('./models/Booking');
const Refund = require('./models/Refund');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const totalBookings = await Booking.countDocuments();
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    const pendingRefundBookings = await Booking.countDocuments({ refundStatus: 'requested' });

    console.log(`Total Bookings: ${totalBookings}`);
    console.log(`Cancelled Bookings: ${cancelledBookings}`);
    console.log(`Refund Requested Bookings: ${pendingRefundBookings}`);

    if (cancelledBookings > 0) {
      const list = await Booking.find({ status: 'cancelled' }).limit(10);
      list.forEach((b, i) => {
        console.log(`Cancelled Booking ${i+1}:`);
        console.log(`  ID: ${b._id}`);
        console.log(`  refundStatus: ${b.refundStatus}`);
        console.log(`  refundAmount: ${b.refundAmount}`);
        console.log(`  refundId: ${b.refundId}`);
      });
    }

    const totalRefunds = await Refund.countDocuments();
    console.log(`Total Refunds in Refund collection: ${totalRefunds}`);
    if (totalRefunds > 0) {
      const refunds = await Refund.find().limit(10);
      refunds.forEach((r, i) => {
        console.log(`Refund ${i+1}:`);
        console.log(`  ID: ${r._id}`);
        console.log(`  refundId: ${r.refundId}`);
        console.log(`  bookingId: ${r.bookingId}`);
        console.log(`  status: ${r.status}`);
      });
    }

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
