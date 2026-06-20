import test from 'node:test';
import assert from 'node:assert/strict';
import { generateBookingTicket } from './receiptGenerator.js';

test('generateBookingTicket returns a PDF document with booking details', () => {
  const doc = generateBookingTicket(
    {
      bookingId: 'BK-1001',
      passengerName: 'Asha Rao',
      bookingDate: '2026-06-14T10:00:00.000Z',
      busName: 'Comfort Express',
      busOperator: 'BlueBird',
      busClass: 'AC',
      from: 'Bengaluru',
      to: 'Mysuru',
      journeyDate: '2026-06-16T00:00:00.000Z',
      departureTime: '10:15 PM',
      seats: ['12A', '12B'],
      passengers: [
        { seatNumber: '12A', name: 'Asha Rao' },
        { seatNumber: '12B', name: 'Ravi Rao' },
      ],
      originalFare: 1200,
      bookingStatus: 'confirmed',
    },
    { download: false }
  );

  assert.ok(doc, 'expected a PDF document');
  assert.equal(typeof doc.save, 'function');
});
