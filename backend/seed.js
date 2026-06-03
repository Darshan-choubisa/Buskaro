require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const fs = require('fs');
const path = require('path');
const Trip = require('./models/Trip');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB for seeding...');
    
    await Trip.deleteMany();
    console.log('Old trips removed.');
    
    console.log('Reading trips_seed.json...');
    const rawData = fs.readFileSync(path.join(__dirname, 'trips_seed.json'), 'utf8');
    const jsonData = JSON.parse(rawData);
    console.log(`Loaded ${jsonData.length} trips from JSON.`);

    // Calculate date offset to shift trips to start from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let earliestInJson = new Date(jsonData[0].date.$date);
    jsonData.forEach(item => {
      const d = new Date(item.date.$date);
      if (d < earliestInJson) earliestInJson = d;
    });
    
    const offsetMs = today.getTime() - earliestInJson.getTime();
    console.log(`Shifting trips by ${Math.floor(offsetMs / (1000 * 60 * 60 * 24))} days to start from today.`);

    const trips = jsonData.map(trip => {
      const processedTrip = { ...trip };
      
      // Handle MongoDB extended JSON date format and apply offset
      if (processedTrip.date && processedTrip.date.$date) {
        const originalDate = new Date(processedTrip.date.$date);
        processedTrip.date = new Date(originalDate.getTime() + offsetMs);
      }
      
      // Remove MongoDB specific metadata fields to let Mongoose generate fresh ones
      delete processedTrip._id;
      delete processedTrip.__v;
      delete processedTrip.createdAt;
      delete processedTrip.updatedAt;
      
      return processedTrip;
    });
    
    console.log(`Processing and seeding ${trips.length} trips...`);
    
    // Using insertMany for performance
    await Trip.insertMany(trips);
    console.log('New trips seeded successfully!');
    
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();

