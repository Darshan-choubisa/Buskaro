const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateRefundPolicy } = require('../utils/refundPolicy');

test('returns 100% refund when booked 5 days ahead and cancelled 3 days before', () => {
  const result = calculateRefundPolicy({
    totalAmount: 1000,
    tripDate: new Date(2026, 5, 18),
    bookingDate: new Date(2026, 5, 13, 15, 0),
    cancelDate: new Date(2026, 5, 15, 10, 0),
  });

  assert.equal(result.refundPercentage, 100);
  assert.equal(result.refundAmount, 1000);
  assert.equal(result.cancellationCharges, 0);
});

test('returns 50% refund for other cancellation windows', () => {
  const result = calculateRefundPolicy({
    totalAmount: 1000,
    tripDate: new Date(2026, 5, 18),
    bookingDate: new Date(2026, 5, 14, 15, 0),
    cancelDate: new Date(2026, 5, 15, 10, 0),
  });

  assert.equal(result.refundPercentage, 50);
  assert.equal(result.refundAmount, 500);
  assert.equal(result.cancellationCharges, 500);
});
