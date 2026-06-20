import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Ticket, Calendar, Clock, MapPin, ChevronRight, Bus, Download } from "lucide-react";
import { useBookings } from "../context/BookingContext";
import { useNavigate } from "react-router-dom";
import { formatTo12Hour } from "../utils/formatters";
import { generateBookingTicket, generateCancellationReceipt } from "../utils/receiptGenerator";
import { calculateRefundPolicy } from "../utils/refundPolicy";
import api from "../utils/api";
import toast from "react-hot-toast";

// Mock data removed to show only real user bookings


export default function MyBookings() {
  const { bookings: realBookings, clearBookings, cancelBookingInContext } = useBookings();
  const navigate = useNavigate();
  const [cancellingId, setCancellingId] = useState(null);
  
  // Only show real user-selected bookings
  const allBookings = realBookings;

  const getRefundEstimate = (booking) => {
    if (!booking.rawDate || !booking.bookingDate || !booking.rawPrice) {
      return { percent: 50, amount: (parseFloat(booking.price?.replace(/[^\d.]/g, '')) || 0) * 0.5, expired: false };
    }

    const departureDateEndOfDay = new Date(booking.rawDate);
    departureDateEndOfDay.setHours(23, 59, 59, 999);

    const cancelDate = new Date();
    const timeToDepartureMs = departureDateEndOfDay.getTime() - cancelDate.getTime();
    if (timeToDepartureMs <= 0) {
      return { percent: 0, amount: 0, expired: true };
    }

    const policy = calculateRefundPolicy({
      totalAmount: booking.rawPrice,
      tripDate: booking.rawDate,
      bookingDate: booking.bookingDate,
      cancelDate,
    });

    return { percent: policy.refundPercentage, amount: policy.refundAmount, expired: false };
  };

  // Navigate to the dedicated cancellation confirmation page
  const handleCancelTicket = (booking) => {
    const { expired } = getRefundEstimate(booking);
    if (expired) {
      toast.error("This trip has already departed. Cannot cancel ticket.", {
        style: { borderRadius: "10px", background: "#0d1b2a", color: "#fff", fontWeight: "bold" }
      });
      return;
    }
    navigate(`/cancel-ticket/${booking.id}`);
  };

  // Download a ticket or cancellation receipt depending on the booking state
  const handleDownloadReceipt = (booking) => {
    const basePayload = {
      bookingId: booking.id,
      passengerName: booking.passengers?.[0]?.name || "Passenger",
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
      originalFare: booking.rawPrice || booking.totalAmount || 0,
    };

    if (booking.status === 'Cancelled') {
      generateCancellationReceipt({
        ...basePayload,
        refundPercentage: booking.refundPercentage || 0,
        cancellationCharges: booking.cancellationCharges || 0,
        refundAmount: booking.refundAmount || 0,
        refundStatus: booking.refundStatus || "processing",
        cancelledAt: booking.cancelledAt,
        cancellationReason: booking.cancellationReason || "",
      });
      return;
    }

    generateBookingTicket({
      ...basePayload,
      bookingStatus: booking.status === 'Upcoming' ? 'confirmed' : booking.status,
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-900">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Bookings</h1>
            <p className="text-gray-500 mt-2 font-medium">View and manage your upcoming and past journeys.</p>
          </div>
          {allBookings.length > 0 && (
            <button 
              onClick={() => {
                if(window.confirm("Are you sure you want to clear your booking history?")) {
                  clearBookings();
                }
              }}
              className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-600 transition-colors border border-red-100 px-4 py-2 rounded-lg hover:bg-red-50"
            >
              Clear History
            </button>
          )}
        </motion.div>

        <div className="space-y-6">
          {allBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#0d1b2a] text-white rounded-xl overflow-hidden border border-[#1b263b] shadow-[0_4px_20px_rgba(13,27,42,0.15)] hover:border-[#00c9a7]/30 hover:shadow-[0_8px_30px_rgba(0,201,167,0.1)] transition-all duration-300 group flex flex-col md:flex-row items-stretch"
            >
              {/* Visual Section */}
              <div className="relative w-full md:w-48 h-32 md:h-auto bg-[#1b263b] flex-shrink-0">
                <img 
                  src={booking.image} 
                  alt="Bus" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${
                  booking.status === 'Upcoming' 
                    ? 'bg-[#00c9a7] text-white' 
                    : booking.status === 'Cancelled'
                    ? 'bg-rose-500 text-white shadow-[0_2px_10px_rgba(239,68,68,0.2)]'
                    : 'bg-slate-800 text-white border border-slate-700/50'
                }`}>
                  {booking.status}
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">From</div>
                      <div className="text-lg font-extrabold text-white">{booking.from}</div>
                    </div>
                    <ChevronRight size={18} className="text-slate-500 mt-4" />
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">To</div>
                      <div className="text-lg font-extrabold text-white">{booking.to}</div>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Booking ID</div>
                    <div className="font-mono text-sm font-bold text-[#00c9a7]">{booking.id}</div>
                  </div>
                </div>

                {booking.passengers && booking.passengers.length > 0 && (
                  <div className="mt-4 p-3 bg-[#1b263b] rounded-xl border border-slate-700/50 flex flex-col gap-1.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Passenger Details
                    </span>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                      {booking.passengers.map((p, idx) => (
                        <div key={idx} className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <span className="bg-[#0d1b2a]/60 text-slate-300 border border-slate-800 px-1.5 py-0.5 rounded text-[10px] font-black uppercase">
                            Seat {p.seatNumber}
                          </span>
                          {p.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                 <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 mt-6 pt-6 border-t border-dashed border-slate-800/80">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar size={14} className="text-slate-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Date</span>
                    </div>
                    <div className="text-sm font-bold text-slate-200">{booking.date}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock size={14} className="text-slate-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Time</span>
                    </div>
                    <div className="text-sm font-bold text-slate-200">{formatTo12Hour(booking.time)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Ticket size={14} className="text-[#00c9a7]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Seat</span>
                    </div>
                    <div className="text-sm font-bold text-slate-200">{booking.seat}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Bus size={14} className="text-[#00c9a7]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Bus Details</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="text-[11px] font-black text-white uppercase tracking-tighter group-hover:text-[#00c9a7] transition-colors">{booking.operator}</div>
                      <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded border ${
                        booking.busClass === 'AC' 
                          ? 'bg-teal-950/35 text-[#00c9a7] border-teal-900/30' 
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}>
                        {booking.busClass}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-400">
                      <div className="text-[10px] font-bold text-[#00c9a7]">₹</div>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Price</span>
                    </div>
                    <div className="text-sm font-bold text-[#00c9a7]">{booking.price}</div>
                  </div>
                </div>

                {booking.status === 'Cancelled' && (
                  <div className="mt-4 space-y-3">
                    <div className="p-3.5 bg-rose-950/20 border border-rose-900/30 rounded-xl flex items-center justify-between text-xs text-rose-200">
                      <div>
                        <span className="font-bold block uppercase tracking-wider text-[9px] text-rose-400">
                          Refund Request
                        </span>
                        <span className="font-extrabold text-sm text-rose-100">
                          ₹{booking.refundAmount?.toFixed(2) || 0}
                        </span>
                        {booking.cancelledAt && (
                          <span className="block text-[9px] text-rose-400/70 mt-0.5">
                            Cancelled: {new Date(booking.cancelledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="bg-rose-900/40 border border-rose-800/50 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-rose-300">
                          {booking.refundPercentage || 0}% Eligible
                        </span>
                        {/* 4-state Refund Status Badge */}
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                          booking.refundStatus === 'refunded'
                            ? 'bg-emerald-900/30 text-emerald-300 border-emerald-800/50'
                            : booking.refundStatus === 'approved'
                            ? 'bg-blue-900/30 text-blue-300 border-blue-800/50'
                            : booking.refundStatus === 'processing'
                            ? 'bg-indigo-900/30 text-indigo-300 border-indigo-800/50'
                            : booking.refundStatus === 'failed'
                            ? 'bg-red-900/30 text-red-300 border-red-800/50'
                            : booking.refundStatus === 'rejected'
                            ? 'bg-rose-900/50 text-rose-300 border-rose-700/50'
                            : 'bg-amber-900/30 text-amber-300 border-amber-800/50'
                        }`}>
                          {booking.refundStatus === 'refunded' ? '✓ Refunded'
                           : booking.refundStatus === 'approved' ? '⏳ Approved'
                           : booking.refundStatus === 'processing' ? '⏳ Processing Payout'
                           : booking.refundStatus === 'failed' ? '✗ Payout Failed'
                           : booking.refundStatus === 'rejected' ? '✗ Rejected'
                           : '⏳ Pending Approval'}
                        </span>
                      </div>
                    </div>
                    <button
                      id={`btn-download-receipt-${booking.id}`}
                      onClick={() => handleDownloadReceipt(booking)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-700 bg-slate-900/30 hover:bg-slate-800/40 rounded-xl text-[11px] font-bold text-slate-300 hover:text-white transition-all group"
                    >
                      <Download size={13} className="group-hover:translate-y-0.5 transition-transform" />
                      Download Cancellation Receipt
                    </button>
                  </div>
                )}

                {booking.status === 'Upcoming' && (
                  <div className="mt-6 flex flex-wrap justify-end gap-3">
                    <button
                      id={`btn-download-ticket-${booking.id}`}
                      onClick={() => handleDownloadReceipt(booking)}
                      className="flex items-center gap-2 text-[10px] font-bold text-[#00c9a7] uppercase tracking-widest hover:text-[#00c9a7]/80 transition-colors border border-[#00c9a7]/25 bg-[#00c9a7]/10 px-4 py-2 rounded-lg hover:bg-[#00c9a7]/15"
                    >
                      <Download size={13} className="transition-transform" />
                      Download Ticket
                    </button>
                    <button
                      disabled={cancellingId === booking.id}
                      onClick={() => handleCancelTicket(booking)}
                      className="text-[10px] font-bold text-rose-400 uppercase tracking-widest hover:text-rose-300 transition-colors border border-rose-950/45 bg-rose-950/20 px-4 py-2 rounded-lg hover:bg-rose-900/20 disabled:opacity-50"
                    >
                      {cancellingId === booking.id ? "Cancelling..." : "Cancel Ticket"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State Mockup - Only shown if no bookings */}
        {allBookings.length === 0 && (
          <div className="mt-16 text-center py-12 border-2 border-dashed border-gray-200 rounded-[2rem] bg-gray-50/50">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Ticket size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Looking for more journeys?</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">Discover new routes and book your next adventure with BusKaro.</p>
            <button 
              onClick={() => navigate("/")}
              className="mt-6 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#00c9a7] transition-all shadow-lg"
            >
              Search Buses
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
