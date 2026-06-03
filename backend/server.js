require('dotenv').config(); // Loads environment variables from a .env file into process.env
const express = require('express');
const cors = require('cors'); // Allows our React frontend to make requests to this backend
const morgan = require('morgan'); // Logs incoming HTTP requests to the console
const connectDB = require('./config/db');

// Connect to MongoDB Database
// We do this before starting the server so the DB is ready when requests come in.
connectDB();

// Initialize the Express Application
const app = express();

// --- Middleware Section ---
// Middleware are functions that run before every request hits our routes.
app.use(cors()); // Enables Cross-Origin Resource Sharing
app.use(express.json()); // Parses incoming JSON payloads so we can use req.body
app.use(morgan('dev')); // 'dev' format gives concise, color-coded logs

// Basic Route to check if API is alive
app.get('/', (req, res) => {
  res.send('BusKaro API is running...');
});

// --- Routing Section ---
// When a request comes to '/api/auth', Express forwards it to authRoutes.js
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/trips', require('./routes/tripRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// Define the port (from environment variable or fallback to 5000)
const PORT = process.env.PORT || 5000;

// Start the server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
