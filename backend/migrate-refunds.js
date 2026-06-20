const mongoose = require('mongoose');
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const Booking = require('./models/Booking');
const Refund = require('./models/Refund');
const Trip = require('./models/Trip');

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // 1. Migrate all Booking documents
    const bookings = await Booking.find().populate('trip');
    console.log(`Found ${bookings.length} total bookings to check and migrate.`);

    for (const booking of bookings) {
      let changed = false;

      // Set user-facing booking ID
      if (!booking.bookingId) {
        booking.bookingId = `BK-${booking._id.toString().slice(-5).toUpperCase()}`;
        changed = true;
      }

      // Set userId
      if (!booking.userId) {
        booking.userId = booking.user;
        changed = true;
      }

      // Set amountPaid
      if (booking.amountPaid === undefined) {
        booking.amountPaid = booking.totalAmount;
        changed = true;
      }

      // Set bookingStatus
      if (!booking.bookingStatus) {
        booking.bookingStatus = booking.status;
        changed = true;
      }

      // Set passengerDetails
      if (!booking.passengerDetails || booking.passengerDetails.length === 0) {
        booking.passengerDetails = booking.passengers || [];
        changed = true;
      }

      // Set busDetails
      if (!booking.busDetails || !booking.busDetails.busName) {
        booking.busDetails = {
          busName: booking.trip?.busName || '—',
          operator: booking.trip?.operator || '—',
          from: booking.trip?.from || '—',
          to: booking.trip?.to || '—',
          date: booking.trip?.date,
          departureTime: booking.trip?.departureTime || '—'
        };
        changed = true;
      }

      // Set payment nested details
      if (!booking.payment || !booking.payment.razorpayOrderId) {
        const isDemo = booking.razorpayPaymentId?.startsWith('pay_demo_') || booking.razorpayOrderId?.startsWith('order_demo_');
        booking.payment = {
          razorpayOrderId: booking.razorpayOrderId || null,
          razorpayPaymentId: booking.razorpayPaymentId || null,
          razorpaySignature: booking.razorpaySignature || null,
          paymentStatus: booking.status === 'confirmed' ? 'captured' : booking.status === 'cancelled' ? 'refunded' : 'pending',
          paymentMethod: isDemo ? 'Demo' : 'Razorpay',
          paidAt: booking.createdAt
        };
        changed = true;
      }

      // Update refundStatus mapping ('requested' -> 'pending')
      if (booking.refundStatus === 'requested') {
        booking.refundStatus = 'pending';
        changed = true;
      }

      if (changed) {
        await booking.save();
        console.log(`  Migrated booking schema: ${booking.bookingId}`);
      }
    }

    // 2. Migrate all Refund documents
    const refunds = await Refund.find();
    console.log(`Found ${refunds.length} total refund documents to check and migrate.`);

    for (const refund of refunds) {
      let changed = false;

      // Map old 'requested' status to 'pending'
      if (refund.status === 'requested') {
        refund.status = 'pending';
        changed = true;
      }

      // Populate aliased amount field
      if (refund.refundAmount === undefined) {
        refund.refundAmount = refund.amount;
        changed = true;
      }

      // Populate aliased percentage field
      if (refund.refundPercentage === undefined) {
        refund.refundPercentage = refund.percentage;
        changed = true;
      }

      // Populate razorpayPaymentId if missing
      if (!refund.razorpayPaymentId) {
        const matchingBooking = await Booking.findById(refund.bookingId);
        if (matchingBooking) {
          refund.razorpayPaymentId = matchingBooking.payment?.razorpayPaymentId || matchingBooking.razorpayPaymentId || null;
          changed = true;
        }
      }

      if (changed) {
        await refund.save();
        console.log(`  Migrated refund schema: ${refund.refundId}`);
      }
    }

    console.log('Migration completed successfully!');
    process.exit();
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
