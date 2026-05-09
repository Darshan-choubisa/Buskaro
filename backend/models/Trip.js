const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  busName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['AC Seater', 'AC Sleeper', 'Non-AC Seater', 'Non-AC Sleeper', 'Shivneri AC'],
    required: true
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  departureTime: {
    type: String,
    required: true
  },
  arrivalTime: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  availableSeats: {
    type: Number,
    default: 40
  },
  totalSeats: {
    type: Number,
    default: 40
  },
  date: {
    type: Date,
    required: true
  },
  features: [String],
  rating: {
    type: Number,
    default: 4.5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Trip', tripSchema);
