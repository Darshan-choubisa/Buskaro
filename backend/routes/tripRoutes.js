const express = require('express');
const router = express.Router();
const { getTrips, getTripById, createTrip, deleteTrip } = require('../controllers/tripController');

router.get('/', getTrips);
router.get('/:id', getTripById);
router.post('/', createTrip);
router.delete('/:id', deleteTrip);

module.exports = router;
