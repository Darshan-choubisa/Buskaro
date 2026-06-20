/**
 * receiptGenerator.js
 * Generates a real PDF cancellation receipt using jsPDF.
 * Automatically downloads as BusKaro_Cancellation_Receipt_[BookingID].pdf
 * — no browser print dialog involved.
 */
import { jsPDF } from 'jspdf';

const BRAND_COLOR   = '#00c9a7'; // teal
const DARK_BG       = '#0d1b2a';
const TEXT_DARK     = '#1e293b';
const TEXT_MUTED    = '#64748b';
const TEXT_LIGHT    = '#94a3b8';
const RED           = '#e11d48';
const GREEN         = '#059669';
const AMBER         = '#d97706';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (v) => (v !== undefined && v !== null && v !== '') ? String(v) : '—';

const money = (n) => `Rs.${parseFloat(n || 0).toFixed(2)}`;

const fmtDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch { return String(d); }
};

const fmtDateOnly = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return String(d); }
};

/** Draw a horizontal rule */
const hr = (doc, y, { r = 226, g = 232, b = 240, width = 0.3 } = {}) => {
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(width);
  doc.line(15, y, 195, y);
};

/** Draw a filled rect */
const rect = (doc, x, y, w, h, hexColor) => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  doc.setFillColor(r, g, b);
  doc.rect(x, y, w, h, 'F');
};

/** Set fill color from hex */
const hexFill = (doc, hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  doc.setFillColor(r, g, b);
};

/** Set text color from hex */
const hexText = (doc, hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  doc.setTextColor(r, g, b);
};

// ─── Refund status label & color ─────────────────────────────────────────────
const refundStatusDisplay = (status) => {
  switch (status) {
    case 'refunded':  return { label: 'Refunded',              color: GREEN };
    case 'approved':  return { label: 'Approved – Pending Pay', color: '#0891b2' };
    case 'rejected':  return { label: 'Rejected',              color: RED };
    case 'requested': return { label: 'Pending Admin Approval', color: AMBER };
    default:          return { label: 'Processing',            color: AMBER };
  }
};

// ─── Main export ──────────────────────────────────────────────────────────────

export function generateBookingTicket(data, { download = true } = {}) {
  const {
    bookingId,
    passengerName,
    bookingDate,
    busName,
    busOperator,
    busClass,
    from,
    to,
    journeyDate,
    departureTime,
    seats,
    passengers,
    originalFare,
    bookingStatus = 'confirmed',
  } = data;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PAGE_W = 210;
  const MARGIN = 15;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  let y = 0;

  rect(doc, 0, 0, PAGE_W, 38, DARK_BG);
  rect(doc, MARGIN, 9, 18, 18, BRAND_COLOR);
  hexText(doc, '#ffffff');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('B', MARGIN + 4.5, 21);

  hexText(doc, '#ffffff');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BusKaro', MARGIN + 22, 19);

  hexText(doc, '#94a3b8');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text("India's Smart Bus Booking Platform", MARGIN + 22, 25);

  hexText(doc, BRAND_COLOR);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('TRAVEL TICKET', PAGE_W - MARGIN, 16, { align: 'right' });

  hexText(doc, '#e2e8f0');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(fmt(bookingId), PAGE_W - MARGIN, 23, { align: 'right' });

  hexText(doc, '#64748b');
  doc.text(`Generated: ${fmtDate(new Date())}`, PAGE_W - MARGIN, 29, { align: 'right' });

  y = 48;
  rect(doc, MARGIN, y, CONTENT_W, 16, bookingStatus === 'cancelled' ? '#fff1f2' : '#ecfdf5');
  doc.setDrawColor(bookingStatus === 'cancelled' ? 254 : 16, bookingStatus === 'cancelled' ? 205 : 185, bookingStatus === 'cancelled' ? 211 : 129);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y + 16, PAGE_W - MARGIN, y + 16);

  hexText(doc, bookingStatus === 'cancelled' ? '#be123c' : '#047857');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(bookingStatus === 'cancelled' ? 'TICKET CANCELLED' : 'BOOKING CONFIRMED', MARGIN + 6, y + 9.5);

  y += 26;

  const sectionTitle = (title) => {
    hexText(doc, TEXT_MUTED);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), MARGIN, y);
    hr(doc, y + 2);
    y += 8;
  };

  const infoRow = (label, value, { bold = false, valueColor = TEXT_DARK } = {}) => {
    hexText(doc, TEXT_MUTED);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(label, MARGIN, y);

    hexText(doc, valueColor);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.text(fmt(value), PAGE_W - MARGIN, y, { align: 'right' });
    y += 7;
  };

  sectionTitle('Booking Information');
  infoRow('Booking ID', bookingId, { bold: true, valueColor: '#0891b2' });
  infoRow('Primary Passenger', passengerName);
  infoRow('Booking Date', fmtDateOnly(bookingDate));
  infoRow('Seats', Array.isArray(seats) ? seats.join(', ') : fmt(seats));
  y += 3;

  sectionTitle('Journey Information');
  rect(doc, MARGIN, y, CONTENT_W, 18, '#f8fafc');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, y, CONTENT_W, 18, 2, 2, 'S');

  hexText(doc, TEXT_MUTED);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('FROM', MARGIN + 6, y + 6);
  hexText(doc, DARK_BG);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(fmt(from), MARGIN + 6, y + 13);

  hexText(doc, BRAND_COLOR);
  doc.setFontSize(14);
  doc.text('→', PAGE_W / 2, y + 11, { align: 'center' });

  hexText(doc, TEXT_MUTED);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('TO', PAGE_W - MARGIN - 6 - doc.getTextWidth(fmt(to)) / 2, y + 6);
  hexText(doc, DARK_BG);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(fmt(to), PAGE_W - MARGIN - 6, y + 13, { align: 'right' });

  y += 24;
  infoRow('Bus Name / Operator', `${fmt(busName)} · ${fmt(busOperator)}`);
  infoRow('Journey Date', fmtDateOnly(journeyDate));
  infoRow('Departure Time', fmt(departureTime));
  infoRow('Bus Class', fmt(busClass));
  y += 3;

  if (Array.isArray(passengers) && passengers.length > 0) {
    sectionTitle('Passenger Details');
    rect(doc, MARGIN, y, CONTENT_W, 8, '#f8fafc');
    hexText(doc, TEXT_MUTED);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('SEAT', MARGIN + 4, y + 5.5);
    doc.text('PASSENGER NAME', MARGIN + 30, y + 5.5);
    y += 8;
    hr(doc, y);

    passengers.forEach((p) => {
      hexText(doc, TEXT_DARK);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(fmt(p.seatNumber), MARGIN + 4, y + 5.5);
      doc.setFont('helvetica', 'normal');
      doc.text(fmt(p.name), MARGIN + 30, y + 5.5);
      y += 7;
      hr(doc, y);
    });
    y += 5;
  }

  sectionTitle('Fare Summary');
  infoRow('Total Fare', money(originalFare), { bold: true, valueColor: BRAND_COLOR });
  y += 2;
  hr(doc, y, { r: 15, g: 23, b: 42, width: 0.4 });
  y += 5;
  hexText(doc, TEXT_MUTED);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text('Please carry a valid ID and present this ticket while boarding.', PAGE_W / 2, y, { align: 'center' });

  if (download) {
    const safeId = String(bookingId || 'UNKNOWN').replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`BusKaro_Ticket_${safeId}.pdf`);
  }

  return doc;
}

export function generateCancellationReceipt(data, { download = true } = {}) {
  const {
    bookingId,
    passengerName,
    bookingDate,
    busName,
    busOperator,
    busClass,
    from,
    to,
    journeyDate,
    departureTime,
    seats,
    passengers,
    originalFare,
    refundPercentage,
    cancellationCharges,
    refundAmount,
    refundStatus,
    cancelledAt,
    cancellationReason,
  } = data;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PAGE_W = 210;
  const MARGIN = 15;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  let y = 0;

  // ── Header Band ──────────────────────────────────────────────────────────
  rect(doc, 0, 0, PAGE_W, 38, DARK_BG);

  // Brand icon (teal square)
  rect(doc, MARGIN, 9, 18, 18, BRAND_COLOR);
  hexText(doc, '#ffffff');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('B', MARGIN + 4.5, 21);

  // Brand name
  hexText(doc, '#ffffff');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BusKaro', MARGIN + 22, 19);

  // Tagline
  hexText(doc, '#94a3b8');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text("India's Smart Bus Booking Platform", MARGIN + 22, 25);

  // Receipt type (right aligned)
  hexText(doc, BRAND_COLOR);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CANCELLATION RECEIPT', PAGE_W - MARGIN, 16, { align: 'right' });

  hexText(doc, '#e2e8f0');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(fmt(bookingId), PAGE_W - MARGIN, 23, { align: 'right' });

  hexText(doc, '#64748b');
  doc.text(`Generated: ${fmtDate(new Date())}`, PAGE_W - MARGIN, 29, { align: 'right' });

  y = 38;

  // ── Status Banner ────────────────────────────────────────────────────────
  rect(doc, 0, y, PAGE_W, 14, '#fff1f2');
  doc.setDrawColor(254, 205, 211);
  doc.setLineWidth(0.4);
  doc.line(0, y + 14, PAGE_W, y + 14);

  // Red dot
  doc.setFillColor(225, 29, 72);
  doc.circle(MARGIN + 3, y + 7, 2.5, 'F');

  hexText(doc, '#be123c');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('TICKET CANCELLED', MARGIN + 9, y + 8);

  hexText(doc, '#9f1239');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Cancelled on: ${fmtDate(cancelledAt)}`, PAGE_W - MARGIN, y + 8, { align: 'right' });

  y += 22;

  // ── Section helper ───────────────────────────────────────────────────────
  const sectionTitle = (title) => {
    hexText(doc, TEXT_MUTED);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), MARGIN, y);
    hr(doc, y + 2);
    y += 8;
  };

  const infoRow = (label, value, { bold = false, valueColor = TEXT_DARK } = {}) => {
    hexText(doc, TEXT_MUTED);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(label, MARGIN, y);

    hexText(doc, valueColor);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.text(fmt(value), PAGE_W - MARGIN, y, { align: 'right' });
    y += 7;
  };

  // ── Booking Information ──────────────────────────────────────────────────
  sectionTitle('Booking Information');
  infoRow('Booking ID', bookingId, { bold: true, valueColor: '#0891b2' });
  infoRow('Primary Passenger', passengerName);
  infoRow('Booking Date', fmtDateOnly(bookingDate));
  infoRow('Seats', Array.isArray(seats) ? seats.join(', ') : fmt(seats));
  y += 3;

  // ── Journey Information ──────────────────────────────────────────────────
  sectionTitle('Journey Information');

  // Route box
  rect(doc, MARGIN, y, CONTENT_W, 18, '#f8fafc');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, y, CONTENT_W, 18, 2, 2, 'S');

  // From
  hexText(doc, TEXT_MUTED);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('FROM', MARGIN + 6, y + 6);
  hexText(doc, DARK_BG);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(fmt(from), MARGIN + 6, y + 13);

  // Arrow
  hexText(doc, BRAND_COLOR);
  doc.setFontSize(14);
  doc.text('→', PAGE_W / 2, y + 11, { align: 'center' });

  // To
  hexText(doc, TEXT_MUTED);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('TO', PAGE_W - MARGIN - 6 - doc.getTextWidth(fmt(to)) / 2, y + 6);
  hexText(doc, DARK_BG);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(fmt(to), PAGE_W - MARGIN - 6, y + 13, { align: 'right' });

  y += 24;

  infoRow('Bus Name / Operator', `${fmt(busName)} · ${fmt(busOperator)}`);
  infoRow('Journey Date', fmtDateOnly(journeyDate));
  infoRow('Departure Time', fmt(departureTime));
  infoRow('Bus Class', fmt(busClass));
  y += 3;

  // ── Passenger Details ────────────────────────────────────────────────────
  if (Array.isArray(passengers) && passengers.length > 0) {
    sectionTitle('Passenger Details');
    // Table header
    rect(doc, MARGIN, y, CONTENT_W, 8, '#f8fafc');
    hexText(doc, TEXT_MUTED);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('SEAT', MARGIN + 4, y + 5.5);
    doc.text('PASSENGER NAME', MARGIN + 30, y + 5.5);
    y += 8;
    hr(doc, y);

    passengers.forEach((p) => {
      hexText(doc, TEXT_DARK);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(fmt(p.seatNumber), MARGIN + 4, y + 5.5);
      doc.setFont('helvetica', 'normal');
      doc.text(fmt(p.name), MARGIN + 30, y + 5.5);
      y += 7;
      hr(doc, y);
    });
    y += 5;
  }

  // ── Cancellation Information ─────────────────────────────────────────────
  sectionTitle('Cancellation Information');
  infoRow('Cancellation Date & Time', fmtDate(cancelledAt));
  if (cancellationReason) infoRow('Reason', cancellationReason);
  y += 3;

  // ── Refund Information ───────────────────────────────────────────────────
  sectionTitle('Refund Information');

  const statusInfo = refundStatusDisplay(refundStatus);

  // Refund table
  const rows = [
    { label: 'Original Fare',        value: money(originalFare),         color: TEXT_DARK,  bold: false },
    { label: 'Refund Percentage',    value: `${refundPercentage || 0}%`, color: GREEN,      bold: true  },
    { label: 'Cancellation Charges', value: `– ${money(cancellationCharges)}`, color: RED, bold: false },
    { label: 'Refund Status',        value: statusInfo.label,            color: statusInfo.color, bold: true },
  ];

  rows.forEach((row) => {
    hexText(doc, TEXT_MUTED);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(row.label, MARGIN, y);

    hexText(doc, row.color);
    doc.setFont('helvetica', row.bold ? 'bold' : 'normal');
    doc.setFontSize(8.5);
    doc.text(fmt(row.value), PAGE_W - MARGIN, y, { align: 'right' });
    y += 7;
  });

  y += 2;
  hr(doc, y, { r: 15, g: 23, b: 42, width: 0.4 });
  y += 1;

  // Total row (dark band)
  rect(doc, MARGIN, y, CONTENT_W, 16, DARK_BG);

  hexText(doc, '#94a3b8');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('REFUND AMOUNT', MARGIN + 6, y + 7);

  hexText(doc, '#94a3b8');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Will be credited after admin processing', MARGIN + 6, y + 12.5);

  hexText(doc, BRAND_COLOR);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(money(refundAmount), PAGE_W - MARGIN - 6, y + 11, { align: 'right' });

  y += 22;

  // Processing time note
  hexText(doc, TEXT_MUTED);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('⏱ After admin approval, estimated refund time: 5–7 business days', MARGIN, y);
  y += 12;

  // ── Footer ───────────────────────────────────────────────────────────────
  hr(doc, y);
  y += 5;
  hexText(doc, TEXT_MUTED);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text('This is a system-generated cancellation receipt. For support, contact BusKaro customer care.', PAGE_W / 2, y, { align: 'center' });
  y += 5;
  hexText(doc, TEXT_LIGHT);
  doc.text(`BusKaro © ${new Date().getFullYear()} · Generated on ${fmtDate(new Date())}`, PAGE_W / 2, y, { align: 'center' });

  // ── Save PDF ─────────────────────────────────────────────────────────────
  if (download) {
    const safeId = String(bookingId || 'UNKNOWN').replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`BusKaro_Cancellation_Receipt_${safeId}.pdf`);
  }

  return doc;
}
