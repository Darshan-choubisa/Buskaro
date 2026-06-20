const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Trip = require('./models/Trip');
const Booking = require('./models/Booking');

const checkBookings = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const total = await Booking.countDocuments();
    console.log(`Total bookings in DB: ${total}`);

    if (total > 0) {
      const bookings = await Booking.find().populate('trip').populate('user').limit(5);
      bookings.forEach((b, i) => {
        console.log(`${i+1}. Booking ID: ${b._id}`);
        console.log(`   User: ${b.user?.name} (${b.user?.email})`);
        console.log(`   Trip Bus: ${b.trip?.busName}`);
        console.log(`   Route: ${b.trip?.from} -> ${b.trip?.to}`);
        console.log(`   Seats: ${b.seats.join(', ')}`);
        console.log(`   Passengers: ${JSON.stringify(b.passengers)}`);
        console.log(`   Status: ${b.status}`);
      });
    }

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkBookings();
