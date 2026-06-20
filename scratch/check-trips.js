const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });
const Trip = require('./backend/models/Trip');
const connectDB = require('./backend/config/db');

const checkTrips = async () => {
  try {
    await connectDB();
    const trips = await Trip.find().limit(5);
    console.log('--- Database Trips ---');
    trips.forEach(t => {
      console.log(`ID: ${t._id}`);
      console.log(`Route: ${t.from} -> ${t.to}`);
      console.log(`Operator: ${t.busName}`);
      console.log(`Date: ${t.date}`);
      console.log(`Seats: ${t.availableSeats}/${t.totalSeats}`);
      console.log('---------------------');
    });
    process.exit();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkTrips();
