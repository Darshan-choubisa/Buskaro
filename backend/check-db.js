require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Trip = require('./models/Trip');
const Booking = require('./models/Booking');

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('\x1b[36m%s\x1b[0m', '--- DATABASE STATUS ---');

    const userCount = await User.countDocuments();
    const tripCount = await Trip.countDocuments();
    const bookingCount = await Booking.countDocuments();

    console.log(`Users: ${userCount}`);
    console.log(`Trips: ${tripCount}`);
    console.log(`Bookings: ${bookingCount}\n`);

    if (userCount > 0) {
      console.log('\x1b[33m%s\x1b[0m', 'Recent Users:');
      const users = await User.find().limit(5);
      users.forEach(u => console.log(` - ${u.name} (${u.email})`));
    }

    if (tripCount > 0) {
      console.log('\n\x1b[33m%s\x1b[0m', 'Available Trips:');
      const trips = await Trip.find().limit(5);
      trips.forEach(t => console.log(` - ${t.busName}: ${t.from} -> ${t.to} (₹${t.price})`));
    }

    process.exit();
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
};

checkDB();
