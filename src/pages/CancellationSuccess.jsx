import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2, Download, Ticket, ArrowRight, Home,
  Calendar, Clock, MapPin, Bus, User, ChevronRight,
  ReceiptText, RefreshCw
} from "lucide-react";
import { formatTo12Hour } from "../utils/formatters";
import { generateCancellationReceipt } from "../utils/receiptGenerator";
import Navbar from "../components/Navbar";

// ─────────────────────────────────────────────────────────────
const formatDateTime = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  } catch { return d; }
};

const formatDateOnly = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return d; }
};

const money = (n) => `₹${parseFloat(n || 0).toFixed(2)}`;

// ─────────────────────────────────────────────────────────────
export default function CancellationSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  useEffect(() => {
    if (!state?.booking || !state?.cancellation) {
      navigate("/my-bookings", { replace: true });
    }
  }, [navigate, state]);

  if (!state?.booking || !state?.cancellation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-slate-100 flex items-center justify-center">
        <div className="text-center text-slate-500">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent mx-auto mb-3" />
          <p className="text-sm font-medium">Redirecting to your bookings…</p>
        </div>
      </div>
    );
  }

  const { booking, cancellation } = state;
  const {
    cancelledAt,
    refundPercentage,
    refundAmount,
    cancellationCharges,
    refundStatus,
    cancellationReason,
    originalFare,
  } = cancellation;

  // Build receipt data payload
  const receiptData = {
    bookingId: booking.id,
    passengerName: booking.passengers?.[0]?.name || booking.passengerName || "Passenger",
    bookingDate: booking.bookingDate || booking.createdAt,
    busName: booking.busName || booking.operator || "—",
    busOperator: booking.operator || "—",
    busClass: booking.busClass || "—",
    from: booking.from,
    to: booking.to,
    journeyDate: booking.rawDate,
    departureTime: formatTo12Hour(booking.time),
    seats: booking.seat ? booking.seat.split(", ") : [],
    passengers: booking.passengers || [],
    originalFare,
    refundPercentage,
    cancellationCharges,
    refundAmount,
    refundStatus,
    cancelledAt,
    cancellationReason,
  };

  const handleDownloadReceipt = () => {
    generateCancellationReceipt(receiptData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-slate-100 font-sans">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 pt-24 pb-20">

        {/* ── Success Hero ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="text-center mb-8"
        >
          <div className="relative inline-flex items-center justify-center mb-4">
            {/* Pulsing rings */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="absolute w-24 h-24 rounded-full bg-emerald-400/20"
            />
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
              transition={{ repeat: Infinity, duration: 2.5, delay: 0.4 }}
              className="absolute w-32 h-32 rounded-full bg-emerald-400/10"
            />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-200">
              <CheckCircle2 size={38} className="text-white" strokeWidth={2.5} />
            </div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2"
          >
            Ticket Cancelled Successfully!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-500 text-sm max-w-sm mx-auto"
          >
            Your booking has been cancelled. A refund request has been submitted
            for Super Admin review.
          </motion.p>
        </motion.div>

        {/* ── Booking & Journey Details Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[#0d1b2a] rounded-2xl overflow-hidden mb-5 shadow-xl"
        >
          {/* Cancelled badge strip */}
          <div className="px-6 py-3 bg-rose-500/10 border-b border-rose-500/20 flex items-center justify-between">
            <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Ticket Cancelled</span>
            <span className="font-mono text-xs font-bold text-[#00c9a7]">{booking.id}</span>
          </div>

          {/* Route */}
          <div className="px-6 py-5 flex items-center gap-4 border-b border-slate-800">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">From</div>
              <div className="text-xl font-extrabold text-white">{booking.from}</div>
            </div>
            <ChevronRight className="text-[#00c9a7] flex-shrink-0" size={20} />
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">To</div>
              <div className="text-xl font-extrabold text-white">{booking.to}</div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 divide-x divide-slate-800">
            {[
              { icon: <Calendar size={12} />, label: "Journey Date", value: booking.date || formatDateOnly(booking.rawDate) },
              { icon: <Clock size={12} />, label: "Departure", value: formatTo12Hour(booking.time) },
              { icon: <Bus size={12} />, label: "Operator", value: booking.operator },
              { icon: <Ticket size={12} />, label: "Seats", value: booking.seat },
            ].map((item, i) => (
              <div key={i} className="px-4 py-3.5">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  {item.icon}
                  <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
                </div>
                <div className="text-xs font-bold text-slate-200 truncate">{item.value || "—"}</div>
              </div>
            ))}
          </div>

          {/* Passengers */}
          {booking.passengers?.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-800">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Passengers</div>
              <div className="flex flex-wrap gap-2">
                {booking.passengers.map((p, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-[#1b263b] border border-slate-700 rounded-lg px-2.5 py-1.5">
                    <User size={10} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-200">{p.name}</span>
                    <span className="text-[10px] font-black text-[#00c9a7] bg-teal-950/30 px-1.5 py-0.5 rounded">S{p.seatNumber}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cancellation timestamp */}
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <RefreshCw size={12} className="text-rose-400" />
              <span>Cancelled on <strong className="text-slate-200">{formatDateTime(cancelledAt)}</strong></span>
            </div>
            {cancellationReason && (
              <div className="text-xs text-slate-500 mt-1.5">
                Reason: <span className="text-slate-300 font-medium">{cancellationReason}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Refund Summary Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-5 shadow-sm"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <ReceiptText size={16} className="text-[#00c9a7]" />
            <h2 className="text-sm font-bold text-slate-700">Refund Summary</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {[
              { label: "Original Fare", value: money(originalFare), valueClass: "text-slate-800" },
              { label: "Refund Percentage", value: `${refundPercentage}%`, valueClass: "text-emerald-600 font-extrabold" },
              { label: "Cancellation Charges", value: `– ${money(cancellationCharges)}`, valueClass: "text-rose-500" },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center px-6 py-3.5">
                <span className="text-sm text-slate-500">{row.label}</span>
                <span className={`text-sm font-bold ${row.valueClass}`}>{row.value}</span>
              </div>
            ))}

            {/* Refund status */}
            <div className="flex justify-between items-center px-6 py-3.5">
              <span className="text-sm text-slate-500">Refund Status</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                refundStatus === 'refunded'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : refundStatus === 'approved'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : refundStatus === 'rejected'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {refundStatus === 'refunded'  ? '✓ Refunded'
                 : refundStatus === 'approved'  ? '⏳ Approved – Pending Payment'
                 : refundStatus === 'rejected'  ? '✗ Rejected'
                 : '⏳ Pending Admin Approval'}
              </span>
            </div>

            {/* Estimated time */}
            <div className="flex justify-between items-center px-6 py-3.5">
              <span className="text-sm text-slate-500">Estimated Processing Time</span>
              <span className="text-sm font-semibold text-slate-700">5–7 days after approval</span>
            </div>

            {/* Total refund */}
            <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-slate-900 to-[#0d1b2a]">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Refund Amount</div>
                <div className="text-xs text-slate-500">Will be credited to your original payment method</div>
              </div>
              <div className="text-2xl font-extrabold text-[#00c9a7]">{money(refundAmount)}</div>
            </div>
          </div>
        </motion.div>

        {/* ── Action Buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-3"
        >
          {/* Download Receipt */}
          <button
            id="btn-download-receipt"
            onClick={handleDownloadReceipt}
            className="w-full flex items-center justify-center gap-3 py-4 bg-[#0d1b2a] hover:bg-[#1b263b] text-white font-bold text-sm rounded-2xl transition-all duration-200 active:scale-[0.99] shadow-lg shadow-slate-200 group"
          >
            <Download size={17} className="group-hover:translate-y-0.5 transition-transform" />
            Download Cancellation Receipt
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              id="btn-view-my-bookings"
              onClick={() => navigate("/my-bookings")}
              className="flex items-center justify-center gap-2 py-3.5 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <Ticket size={15} />
              My Bookings
            </button>
            <button
              id="btn-book-another-ticket"
              onClick={() => navigate("/")}
              className="flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#00c9a7] to-teal-400 rounded-xl text-sm font-bold text-white hover:from-[#00b596] hover:to-teal-500 transition-all shadow-md shadow-teal-100 active:scale-[0.99]"
            >
              <Home size={15} />
              Book Another Ticket
            </button>
          </div>
        </motion.div>

        {/* ── Footer Note ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-center text-[11px] text-slate-400 mt-8 italic"
        >
          Need help? Contact BusKaro support. This cancellation is final and cannot be reversed.
        </motion.p>
      </main>
    </div>
  );
}
