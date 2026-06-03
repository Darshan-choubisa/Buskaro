const express = require('express');
const router = express.Router();
const { createBooking, getBookedSeatsForTrip, verifyPayment } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.post('/verify', protect, verifyPayment);
router.get('/trip/:tripId', getBookedSeatsForTrip);

module.exports = router;
