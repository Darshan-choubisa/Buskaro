const express = require('express');
const router = express.Router();
const { getOperatorStats, getOperatorTrips, getOperatorBookings } = require('../controllers/operatorController');

router.get('/stats', getOperatorStats);
router.get('/trips', getOperatorTrips);
router.get('/bookings', getOperatorBookings);

module.exports = router;
