const Trip = require('../models/Trip');

// @desc    Get all trips
// @route   GET /api/trips
// @access  Public
exports.getTrips = async (req, res) => {
  console.log('--- GET TRIPS REQUEST ---', req.query);
  try {
    const { from, to, date } = req.query;
    let query = {};

    if (from) query.from = { $regex: from, $options: 'i' };
    if (to) query.to = { $regex: to, $options: 'i' };
    
    if (date) {
      const searchDate = new Date(date);
      searchDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      // Try finding trips for the exact date first
      let trips = await Trip.find({ ...query, date: { $gte: searchDate, $lt: nextDay } });

      // If no trips for exact date, find trips for the same month and same route
      if (trips.length === 0) {
        const startOfMonth = new Date(searchDate.getFullYear(), searchDate.getMonth(), 1);
        const endOfMonth = new Date(searchDate.getFullYear(), searchDate.getMonth() + 1, 0, 23, 59, 59);
        
        trips = await Trip.find({ 
          ...query, 
          date: { $gte: startOfMonth, $lte: endOfMonth } 
        });
      }
      
      return res.json(trips);
    }

    const trips = await Trip.find(query);
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Public
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (trip) {
      res.json(trip);
    } else {
      res.status(404).json({ message: 'Trip not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private/Admin
exports.createTrip = async (req, res) => {
  try {
    const { busName, type, from, to, departureTime, arrivalTime, duration, price, availableSeats, totalSeats, date, features } = req.body;

    // Validation
    if (!busName || !type || !from || !to || !departureTime || !arrivalTime || !duration || !price || !date) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const trip = new Trip({
      busName,
      type,
      from,
      to,
      departureTime,
      arrivalTime,
      duration,
      price,
      availableSeats: availableSeats || totalSeats || 40,
      totalSeats: totalSeats || 40,
      date: new Date(date),
      features: features || [],
      rating: 4.5
    });

    const savedTrip = await trip.save();
    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: savedTrip
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Delete a trip
// @route   DELETE /api/trips/:id
// @access  Private/Admin
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (trip) {
      res.json({ success: true, message: 'Trip deleted successfully' });
    } else {
      res.status(404).json({ message: 'Trip not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
