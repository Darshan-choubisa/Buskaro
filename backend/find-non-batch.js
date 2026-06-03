const mongoose = require('mongoose');
require('dotenv').config();
const Trip = require('./models/Trip');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const findNonBatchTrips = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  // Find the most common createdAt
  const commonBatch = await Trip.aggregate([
    { $group: { _id: "$createdAt", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 }
  ]);

  if (commonBatch.length === 0) {
    console.log('No trips found');
    process.exit();
  }

  const batchTime = commonBatch[0]._id;
  const batchCount = commonBatch[0].count;
  console.log(`Main batch time: ${batchTime} (Count: ${batchCount})`);

  const totalCount = await Trip.countDocuments();
  console.log(`Total count: ${totalCount}`);

  if (totalCount > batchCount) {
    console.log(`Found ${totalCount - batchCount} trips NOT in the main batch.`);
    const extras = await Trip.find({ createdAt: { $ne: batchTime } }).limit(10);
    extras.forEach(t => {
      console.log(`- ${t.busName} (${t.from} -> ${t.to}) | Created: ${t.createdAt}`);
    });
  } else {
    console.log('No extra trips found.');
  }

  process.exit();
};

findNonBatchTrips();
