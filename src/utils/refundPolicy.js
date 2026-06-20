const MS_IN_A_DAY = 1000 * 60 * 60 * 24;

const normalizeToStartOfDay = (value) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  date.setHours(0, 0, 0, 0);
  return date;
};

export function calculateRefundPolicy({ totalAmount = 0, tripDate, bookingDate, cancelDate = new Date() } = {}) {
  const amount = Number(totalAmount) || 0;
  const departureDate = normalizeToStartOfDay(tripDate);
  const bookedOnDate = normalizeToStartOfDay(bookingDate);
  const cancelledOnDate = normalizeToStartOfDay(cancelDate);

  if (!departureDate || !bookedOnDate || !cancelledOnDate) {
    return {
      refundPercentage: 50,
      refundAmount: amount * 0.5,
      charges: amount * 0.5,
      cancellationCharges: amount * 0.5,
      isFullRefundEligible: false,
      daysBeforeDepartureWhenBooked: null,
      daysBeforeDepartureWhenCancelled: null,
    };
  }

  const daysBeforeDepartureWhenBooked = (departureDate.getTime() - bookedOnDate.getTime()) / MS_IN_A_DAY;
  const daysBeforeDepartureWhenCancelled = (departureDate.getTime() - cancelledOnDate.getTime()) / MS_IN_A_DAY;
  const isFullRefundEligible = daysBeforeDepartureWhenBooked >= 5 && daysBeforeDepartureWhenCancelled >= 3;
  const refundPercentage = isFullRefundEligible ? 100 : 50;
  const refundAmount = (amount * refundPercentage) / 100;
  const charges = amount - refundAmount;

  return {
    refundPercentage,
    refundAmount,
    charges,
    cancellationCharges: charges,
    isFullRefundEligible,
    daysBeforeDepartureWhenBooked,
    daysBeforeDepartureWhenCancelled,
  };
}

export function calculateRefundPolicyFromBooking(booking, options = {}) {
  const tripDate = booking?.trip?.date || booking?.tripDate || booking?.journeyDate;
  const bookingDate = booking?.bookingDate || booking?.createdAt;
  const cancelDate = options.cancelDate || new Date();

  return calculateRefundPolicy({
    totalAmount: booking?.totalAmount || booking?.amount || 0,
    tripDate,
    bookingDate,
    cancelDate,
  });
}
