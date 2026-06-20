const express = require('express');
const router = express.Router();
const { getTrips, getTripById, createTrip, updateTrip, deleteTrip } = require('../controllers/tripController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getTrips);
router.get('/:id', getTripById);
router.post('/', protect, admin, createTrip);
router.put('/:id', protect, admin, updateTrip);
router.delete('/:id', protect, admin, deleteTrip);

module.exports = router;
