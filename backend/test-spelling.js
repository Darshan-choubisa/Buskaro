const mongoose = require('mongoose');
require('dotenv').config();
const Trip = require('./models/Trip');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const testSearchSpelling = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const from = "Banglore"; // User's spelling
  const to = "Hyderabad";
  
  const trips = await Trip.find({
    from: { $regex: from, $options: 'i' },
    to: { $regex: to, $options: 'i' }
  });

  console.log(`Found ${trips.length} trips for misspelled "${from}" -> "${to}"`);

  const fromCorrect = "Bangalore";
  const tripsCorrect = await Trip.find({
    from: { $regex: fromCorrect, $options: 'i' },
    to: { $regex: to, $options: 'i' }
  }).limit(1);
  
  console.log(`Found ${tripsCorrect.length} trips for correct "${fromCorrect}" -> "${to}"`);

  process.exit();
};

testSearchSpelling();
