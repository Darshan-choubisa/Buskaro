import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Ticket, Calendar, Clock, MapPin, ChevronRight, Bus } from "lucide-react";
import { useBookings } from "../context/BookingContext";
import { useNavigate } from "react-router-dom";
import { formatTo12Hour } from "../utils/formatters";

// Mock data removed to show only real user bookings


export default function MyBookings() {
  const { bookings: realBookings, clearBookings } = useBookings();
  const navigate = useNavigate();
  
  // Only show real user-selected bookings
  const allBookings = realBookings;
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
