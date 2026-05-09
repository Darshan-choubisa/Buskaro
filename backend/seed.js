require('dotenv').config();
const mongoose = require('mongoose');
const Trip = require('./models/Trip');

const routes = [
  { from: "Mumbai", to: "Pune", basePrice: 400, duration: "3H 15M" },
  { from: "Delhi", to: "Jaipur", basePrice: 550, duration: "5H 30M" },
  { from: "Bangalore", to: "Hyderabad", basePrice: 1100, duration: "9H 00M" },
  { from: "Chennai", to: "Bangalore", basePrice: 500, duration: "6H 30M" },
  { from: "Ahmedabad", to: "Mumbai", basePrice: 700, duration: "7H 45M" },
  { from: "Pune", to: "Goa", basePrice: 900, duration: "10H 30M" },
  { from: "Hyderabad", to: "Bangalore", basePrice: 1100, duration: "9H 30M" },
  { from: "Mumbai", to: "Ahmedabad", basePrice: 700, duration: "8H 00M" },
  { from: "Delhi", to: "Chandigarh", basePrice: 450, duration: "5H 00M" },
  { from: "Bangalore", to: "Kochi", basePrice: 1300, duration: "12H 00M" }
];

const busTypes = [
  { type: "AC Seater", priceMod: 1, seats: 40 },
  { type: "AC Sleeper", priceMod: 1.5, seats: 30 },
  { type: "Non-AC Seater", priceMod: 0.8, seats: 45 },
  { type: "Non-AC Sleeper", priceMod: 1.2, seats: 36 },
  { type: "Shivneri AC", priceMod: 1.3, seats: 40 }
];

const busNames = [
  "Express Plus", "Royal Travels", "Green Line", "Speedy Motors", "Luxury Cruiser",
  "Blue Sky", "Red Rose", "National Express", "Intercity Pro", "Vistara Travels"
];

const allFeatures = ["WiFi", "Charging Port", "Water Bottle", "Blanket", "Pillow", "CCTV", "Reading Light"];

const generateTrips = () => {
  const trips = [];
  const today = new Date("2026-05-04");
  const endOfMonth = new Date("2026-05-31");
  
  // Calculate remaining days in the month
  const diffTime = Math.abs(endOfMonth - today);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 

  for (let i = 0; i < diffDays; i++) { // From today to end of month
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);

    routes.forEach((route, routeIdx) => {
      // 2 trips per route per day
      for (let j = 0; j < 2; j++) {
        const busType = busTypes[Math.floor(Math.random() * busTypes.length)];
        const busName = `${busNames[Math.floor(Math.random() * busNames.length)]} ${route.from.substring(0, 3)}`;
        
        const departureHour = (6 + (j * 8) + Math.floor(Math.random() * 4)) % 24;
        const departureMin = Math.random() > 0.5 ? "30" : "00";
        const departureTime = `${departureHour.toString().padStart(2, '0')}:${departureMin}`;
        
        // Simplified arrival time calculation
        const durationHours = parseInt(route.duration.split('H')[0]);
        const arrivalHour = (departureHour + durationHours) % 24;
        const arrivalTime = `${arrivalHour.toString().padStart(2, '0')}:${departureMin}`;

        const price = Math.round(route.basePrice * busType.priceMod);
        const rating = (4 + Math.random() * 1).toFixed(1);
        
        // Randomly pick 2-4 features
        const features = [];
        const featuresCount = 2 + Math.floor(Math.random() * 3);
        const shuffledFeatures = [...allFeatures].sort(() => 0.5 - Math.random());
        for(let k=0; k<featuresCount; k++) features.push(shuffledFeatures[k]);

        trips.push({
          busName,
          type: busType.type,
          from: route.from,
          to: route.to,
          departureTime,
          arrivalTime,
          duration: route.duration,
          price,
          availableSeats: Math.floor(Math.random() * busType.seats),
          totalSeats: busType.seats,
          date: new Date(currentDate).setHours(0, 0, 0, 0),
          features,
          rating: parseFloat(rating)
        });
      }
    });
  }
  return trips;
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB for seeding...');
    
    await Trip.deleteMany();
    console.log('Old trips removed.');
    
    const trips = generateTrips();
    console.log(`Generated ${trips.length} trips.`);
    
    await Trip.insertMany(trips);
    console.log('New trips seeded successfully!');
    
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();
