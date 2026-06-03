const mongoose = require('mongoose');
require('dotenv').config();
const Trip = require('./models/Trip');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const findExtraTrips = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  // Group by createdAt to see how many batches we have
  const batches = await Trip.aggregate([
    {
      $group: {
        _id: "$createdAt",
        count: { $sum: 1 },
        sample: { $first: "$busName" }
      }
    },
    { $sort: { _id: -1 } }
  ]);

  console.log('Batches found:');
  batches.forEach(b => {
    console.log(`- Created at: ${b._id} | Count: ${b.count} | Example: ${b.sample}`);
  });

  process.exit();
};

findExtraTrips();
