const Trip = require('../models/Trip');

// @desc    Get all trips
// @route   GET /api/trips
// @access  Public
exports.getTrips = async (req, res) => {
  try {
    const { from, to, date } = req.query;
    let query = {};

    if (from) query.from = new RegExp(`^${from}$`, 'i');
    if (to) query.to = new RegExp(`^${to}$`, 'i');
    
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

        // If still no trips, find ANY trips in that month to keep the UI populated
        if (trips.length === 0) {
          trips = await Trip.find({
            date: { $gte: startOfMonth, $lte: endOfMonth }
          }).limit(10);
        }
        
        // Shuffle the results to make them appear "random"
        trips = trips.sort(() => Math.random() - 0.5).slice(0, 5);
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
