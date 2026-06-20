const express = require('express');
const router = express.Router();
const { createBooking, getBookedSeatsForTrip, verifyPayment, cancelBooking, getMyBookings, getBookingById } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.post('/verify', protect, verifyPayment);
router.get('/my', protect, getMyBookings);           // Must come before /:id
router.get('/trip/:tripId', getBookedSeatsForTrip);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
