const mongoose = require('mongoose');
require('dotenv').config();
const Trip = require('./models/Trip');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const testSearch = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const from = "Bangalore";
  const to = "Hyderabad";
  
  const trips = await Trip.find({
    from: { $regex: from, $options: 'i' },
    to: { $regex: to, $options: 'i' }
  }).limit(5);

  console.log(`Found ${trips.length} trips for ${from} -> ${to}`);
  trips.forEach(t => {
    console.log(`- ${t.busName} on ${t.date}`);
  });

  process.exit();
};

testSearch();
