import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, AlertTriangle, Bus, MapPin, Calendar, Clock,
  Ticket, User, CheckCircle2, XCircle, ChevronRight, Info
} from "lucide-react";
import { useBookings } from "../context/BookingContext";
import { formatTo12Hour } from "../utils/formatters";
import { calculateRefundPolicy } from "../utils/refundPolicy";
import api from "../utils/api";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

// ── Refund policy calculation (mirrors backend logic exactly) ──────────────────
function calculateRefund(booking) {
  if (!booking) return null;

  const rawDate = booking.rawDate;
  const bookingDate = booking.bookingDate || booking.createdAt;
  const rawPrice = booking.rawPrice || booking.totalAmount || 0;
  const now = new Date();

  if (!rawDate || !bookingDate) {
    return { percent: 50, refundAmount: rawPrice * 0.5, charges: rawPrice * 0.5, expired: false };
  }

  const departureDateEndOfDay = new Date(rawDate);
  departureDateEndOfDay.setHours(23, 59, 59, 999);
  const timeToDepartureMs = departureDateEndOfDay.getTime() - now.getTime();

  if (timeToDepartureMs <= 0) {
    return { percent: 0, refundAmount: 0, charges: rawPrice, expired: true };
  }

  const policy = calculateRefundPolicy({
    totalAmount: rawPrice,
    tripDate: rawDate,
    bookingDate,
    cancelDate: now,
  });

  return {
    percent: policy.refundPercentage,
    refundAmount: policy.refundAmount,
    charges: policy.cancellationCharges ?? policy.charges,
    expired: false,
    daysBeforeDepartureWhenBooked: policy.daysBeforeDepartureWhenBooked,
    daysBeforeDepartureWhenCancelled: policy.daysBeforeDepartureWhenCancelled,
  };
}

// ── Reason options ────────────────────────────────────────────────────────
const CANCEL_REASONS = [
  "Change of travel plans",
  "Emergency / personal reasons",
  "Found a better option",
  "Incorrect booking details",
  "Health / medical reasons",
  "Other",
];

// ── Helper ────────────────────────────────────────────────────────────────
const formatDateDisplay = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return d; }
};

export default function CancelTicket() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { bookings, cancelBookingInContext } = useBookings();

  const [booking, setBooking] = useState(null);
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState("review"); // 'review' | 'confirm'

  // Load booking from context
  useEffect(() => {
    const found = bookings.find((b) => b.id === bookingId);
    if (found) {
      setBooking(found);
    } else {
      toast.error("Booking not found.");
      navigate("/my-bookings");
    }
  }, [bookingId, bookings, navigate]);

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-gray-500 font-medium animate-pulse">Loading booking details…</div>
      </div>
    );
  }

  const refund = calculateRefund(booking);
  const finalReason = reason === "Other" ? customReason : reason;

  const handleConfirmCancellation = async () => {
    if (!finalReason.trim()) {
      toast.error("Please select or enter a cancellation reason.", {
        style: { borderRadius: "10px", background: "#0d1b2a", color: "#fff" },
      });
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading("Processing cancellation…", {
      style: { borderRadius: "10px", background: "#0d1b2a", color: "#fff" },
    });

    try {
      let cancelledData = null;

      // Hit the real API if we have a DB booking ID
      if (booking.dbBookingId) {
        const res = await api.put(`/bookings/${booking.dbBookingId}/cancel`, {
          cancellationReason: finalReason,
        });
        cancelledData = res.data.booking;
      }

      const cancelledAt = cancelledData?.cancelledAt || new Date().toISOString();
      const charges = cancelledData?.cancellationCharges ?? refund.charges;
      const refundPct = cancelledData?.refundPercentage ?? refund.percent;
      const refundAmt = cancelledData?.refundAmount ?? refund.refundAmount;
      const refundId = cancelledData?.refundId || null;

      // Update context
      cancelBookingInContext(
        booking.id,
        refundAmt,
        refundPct,
        charges,
        cancelledAt,
        finalReason,
        'pending',
        refundId
      );

      toast.dismiss(toastId);

      // Navigate to success page with full data
      navigate('/cancellation-success', {
        state: {
          booking,
          cancellation: {
            cancelledAt,
            refundPercentage: refundPct,
            refundAmount: refundAmt,
            cancellationCharges: charges,
            refundStatus: 'pending',
            cancellationReason: finalReason,
            originalFare: booking.rawPrice || booking.totalAmount || 0,
            refundId,
          },
        },
      });
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || "Failed to cancel ticket. Please try again.", {
        style: { borderRadius: "10px", background: "#0d1b2a", color: "#fff" },
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-slate-100 font-sans">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 pt-28 pb-20">
        {/* ── Back Button ── */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/my-bookings")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-sm mb-6 transition-colors group"
          id="btn-back-to-bookings"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to My Bookings
        </motion.button>

        {/* ── Page Title ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
              <XCircle size={20} className="text-rose-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Cancel Ticket</h1>
          </div>
          <p className="text-slate-500 text-sm ml-13 pl-[52px]">
            Review the details below before confirming your cancellation.
          </p>
        </motion.div>

        {/* ── Booking Summary Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-[#0d1b2a] rounded-2xl overflow-hidden mb-5 shadow-xl"
        >
          {/* Header row */}
          <div className="px-6 pt-6 pb-4 border-b border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Booking ID</div>
                <div className="font-mono text-sm font-bold text-[#00c9a7]">{booking.id}</div>
              </div>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider">
                Upcoming
              </span>
            </div>
          </div>

          {/* Route */}
          <div className="px-6 py-5 flex items-center gap-4 border-b border-slate-800">
            <div className="text-center">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">From</div>
              <div className="text-xl font-extrabold text-white">{booking.from}</div>
            </div>
            <ChevronRight className="text-[#00c9a7] flex-shrink-0" size={20} />
            <div className="text-center">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">To</div>
              <div className="text-xl font-extrabold text-white">{booking.to}</div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-slate-800">
            {[
              { icon: <Calendar size={13} />, label: "Date", value: booking.date || formatDateDisplay(booking.rawDate) },
              { icon: <Clock size={13} />, label: "Departure", value: formatTo12Hour(booking.time) },
              { icon: <Ticket size={13} />, label: "Seats", value: booking.seat },
              { icon: <Bus size={13} />, label: "Operator", value: booking.operator },
            ].map((item, i) => (
              <div key={i} className="px-4 py-4">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1.5">
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
                    <User size={11} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-200">{p.name}</span>
                    <span className="text-[10px] font-black text-[#00c9a7] bg-teal-950/30 px-1.5 py-0.5 rounded">
                      Seat {p.seatNumber}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Refund Policy & Breakdown ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-5 shadow-sm"
        >
          <div className="px-6 pt-5 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Info size={15} className="text-blue-500" />
              <h2 className="text-sm font-bold text-slate-700">Refund Policy & Breakdown</h2>
            </div>
          </div>

          {/* Policy rules */}
          <div className="px-6 py-4 bg-blue-50/50 border-b border-blue-100">
            <p className="text-[11px] font-semibold text-blue-700 mb-2.5 uppercase tracking-wider">Applicable Policy Rules</p>
            {/* Day count badges */}
            {(refund.daysBeforeDepartureWhenBooked !== undefined) && (
              <div className="flex gap-2 mb-3">
                <div className={`flex-1 text-center rounded-lg px-3 py-2 border ${refund.daysBeforeDepartureWhenBooked >= 5 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Booked</div>
                  <div className={`text-base font-black ${refund.daysBeforeDepartureWhenBooked >= 5 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {Math.floor(refund.daysBeforeDepartureWhenBooked)}d
                  </div>
                  <div className={`text-[9px] font-bold ${refund.daysBeforeDepartureWhenBooked >= 5 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {refund.daysBeforeDepartureWhenBooked >= 5 ? '✓ ≥ 5 days' : '✗ < 5 days'} before trip
                  </div>
                </div>
                <div className={`flex-1 text-center rounded-lg px-3 py-2 border ${refund.daysBeforeDepartureWhenCancelled >= 3 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Cancelling</div>
                  <div className={`text-base font-black ${refund.daysBeforeDepartureWhenCancelled >= 3 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {Math.floor(refund.daysBeforeDepartureWhenCancelled)}d
                  </div>
                  <div className={`text-[9px] font-bold ${refund.daysBeforeDepartureWhenCancelled >= 3 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {refund.daysBeforeDepartureWhenCancelled >= 3 ? '✓ ≥ 3 days' : '✗ < 3 days'} before trip
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              {[
                { rule: "Booked ≥ 5 calendar days before departure AND cancelling ≥ 3 calendar days before departure", refund: "100% refund", highlight: refund.percent === 100 },
                { rule: "All other cases (booked < 5 days ahead, or cancelling < 3 days before)", refund: "50% refund", highlight: refund.percent === 50 },
              ].map((item, i) => (
                <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-lg ${item.highlight ? "bg-white border border-blue-200 shadow-sm" : "opacity-50"}`}>
                  {item.highlight
                    ? <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 flex-shrink-0 mt-0.5" />
                  }
                  <div>
                    <span className="text-[11px] font-semibold text-slate-700">{item.rule}</span>
                    <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${item.highlight ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      → {item.refund}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown table */}
          <div className="divide-y divide-slate-100">
            {[
              { label: "Original Fare", value: `₹${(booking.rawPrice || booking.totalAmount || 0).toFixed(2)}`, color: "text-slate-800" },
              { label: "Refund Percentage", value: `${refund.percent}%`, color: "text-emerald-600" },
              { label: "Cancellation Charges", value: `- ₹${refund.charges.toFixed(2)}`, color: "text-rose-500" },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center px-6 py-3.5">
                <span className="text-sm text-slate-500 font-medium">{row.label}</span>
                <span className={`text-sm font-bold ${row.color}`}>{row.value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center px-6 py-4 bg-slate-900 rounded-b-2xl">
              <span className="text-sm font-bold text-slate-300">Refund Amount</span>
              <span className="text-xl font-extrabold text-[#00c9a7]">₹{refund.refundAmount.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        {/* ── Cancellation Reason ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm"
        >
          <h2 className="text-sm font-bold text-slate-700 mb-4">Reason for Cancellation <span className="text-rose-400">*</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
            {CANCEL_REASONS.map((r) => (
              <button
                key={r}
                id={`reason-${r.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => setReason(r)}
                className={`text-left text-xs font-semibold px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                  reason === r
                    ? "border-[#00c9a7] bg-teal-50 text-teal-800"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {reason === r && <span className="mr-1.5">✓</span>}{r}
              </button>
            ))}
          </div>
          <AnimatePresence>
            {reason === "Other" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <textarea
                  id="custom-cancellation-reason"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Please describe your reason…"
                  rows={3}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 resize-none focus:outline-none focus:border-[#00c9a7] transition-colors"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Warning ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-xl px-5 py-4 mb-6"
        >
          <AlertTriangle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-rose-700 leading-relaxed">
            This action is <strong>irreversible</strong>. Once confirmed, your ticket will be cancelled
            and a refund of <strong>₹{refund.refundAmount.toFixed(2)}</strong> ({refund.percent}%) will be
            <strong> submitted for Super Admin approval</strong>. After approval, the refund will be
            credited within 5–7 business days.
          </p>
        </motion.div>

        {/* ── Action Buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <button
            id="btn-back-cancel"
            onClick={() => navigate("/my-bookings")}
            disabled={isProcessing}
            className="flex-1 py-3.5 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            ← Back
          </button>
          <button
            id="btn-confirm-cancellation"
            onClick={handleConfirmCancellation}
            disabled={isProcessing || !finalReason.trim()}
            className={`flex-1 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-300 shadow-lg ${
              isProcessing || !finalReason.trim()
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-rose-500 hover:bg-rose-600 active:scale-[0.98] shadow-rose-200"
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing…
              </span>
            ) : (
              "Confirm Cancellation"
            )}
          </button>
        </motion.div>
      </main>
    </div>
  );
}
