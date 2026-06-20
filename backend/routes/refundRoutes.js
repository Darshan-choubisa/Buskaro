const express = require('express');
const router = express.Router();
const {
  getRefunds,
  getRefundById,
  approveRefund,
  rejectRefund,
  processRefund,
} = require('../controllers/refundController');
const { protect, admin } = require('../middleware/authMiddleware');

// All refund routes are admin-only
router.use(protect);
router.use(admin);

router.get('/', getRefunds);
router.get('/:id', getRefundById);
router.put('/:id/approve', approveRefund);
router.put('/:id/reject', rejectRefund);
router.post('/:id/process', processRefund);

module.exports = router;
