const express = require('express');
const router = express.Router();
const { getStats, getAllBookings, getAllUsers, toggleBlockUser, deleteUser } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Secure all admin routes
router.use(protect);
router.use(admin);

router.get('/stats', getStats);
router.get('/bookings', getAllBookings);
router.get('/users', getAllUsers);
router.put('/users/:id/block', toggleBlockUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
