const mongoose = require('mongoose');
require('dotenv').config();
const Trip = require('./models/Trip');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const checkCounts = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const total = await Trip.countDocuments();
  console.log(`Total trips in DB: ${total}`);

  const recent = await Trip.find().sort({ createdAt: -1 }).limit(35);
  console.log(`Top 35 most recently created trips:`);
  recent.forEach((t, i) => {
    console.log(`${i+1}. ${t.busName} (${t.from} -> ${t.to}) - Created at: ${t.createdAt}`);
  });

  process.exit();
};

checkCounts();
