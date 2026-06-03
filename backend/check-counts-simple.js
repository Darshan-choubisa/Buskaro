const mongoose = require('mongoose');
require('dotenv').config();
const Trip = require('./models/Trip');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const checkCountsSimple = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const total = await Trip.countDocuments();
  console.log(`TOTAL_COUNT:${total}`);

  const recent = await Trip.find().sort({ createdAt: -1 }).limit(1);
  if (recent.length > 0) {
    console.log(`LAST_CREATED:${recent[0].createdAt}`);
  }
  process.exit();
};

checkCountsSimple();
