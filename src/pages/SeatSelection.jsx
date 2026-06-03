import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../utils/api";
import {
  Wifi,
  Zap,
  ShieldCheck,
  ChevronLeft,
  UserCircle,
  Bus,
} from "lucide-react";
import { motion } from "framer-motion";

const SEAT_ROWS = [
  ["1A", "1B", null, "1C", "1D"],
  ["2A", "2B", null, "2C", "2D"],
  ["3A", "3B", null, "3C", "3D"],
  ["4A", "4B", null, "4C", "4D"],
  ["5A", "5B", null, "5C", "5D"],
  ["6A", "6B", null, "6C", "6D"],
];

export default function SeatSelection() {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const trip = location.state?.trip || { 
    from: "Mumbai", 
    to: "Pune", 
    price: 520, 
    type: "Premium Intercity Coach" 
  };

  const [passengerNames, setPassengerNames] = useState(location.state?.passengerNames || {});

  useEffect(() => {
    toast.success("Step 2: Choose your seat", {
      icon: "💺",
      style: {
        borderRadius: "10px",
        background: "#0d1b2a",
        color: "#fff",
        fontWeight: "bold",
      },
    });
  }, []);

  useEffect(() => {
    const fetchBookedSeats = async () => {
      if (!trip || !(trip.id || trip._id)) return;
      try {
        setIsLoading(true);
        const response = await api.get(`/bookings/trip/${trip.id || trip._id}`);
        setBookedSeats(response.data);
      } catch (error) {
        console.error("Error fetching booked seats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookedSeats();
  }, [trip]);

  const handleSeatClick = (seatId) => {
    if (bookedSeats.includes(seatId)) return;

    setSelectedSeats((prev) => {
      const isSelected = prev.includes(seatId);
      if (isSelected) {
        const updated = prev.filter((s) => s !== seatId);
        setPassengerNames((names) => {
          const newNames = { ...names };
          delete newNames[seatId];
          return newNames;
        });
        return updated;
      } else {
        return [...prev, seatId];
      }
    });
  };

  const handlePassengerNameChange = (seatId, name) => {
    setPassengerNames((prev) => ({
      ...prev,
      [seatId]: name,
    }));
  };

  const totalPrice = selectedSeats.length * trip.price;
  const arePassengerNamesFilled = selectedSeats.length > 0 && selectedSeats.every(seat => passengerNames[seat] && passengerNames[seat].trim() !== "");

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-900">
      <Navbar showBack={true} backPath="/trips" />

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-12 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        {/* Left Column: Seat Map */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-6 overflow-hidden"
        >
          {/* Banner */}
          <div className="relative h-32 sm:h-48 rounded-2xl overflow-hidden shadow-lg group">
            <img
              src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=2000"
              alt="Coach Interior"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-6 sm:px-8">
              <h2 className="text-lg sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">
                {trip.type}
              </h2>
              <p className="text-gray-300 text-[9px] sm:text-xs">
                Direct service from {trip.from} to {trip.to}
              </p>
            </div>
          </div>

          {/* Selector Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-gray-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12 gap-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                Choose your seat
              </h3>
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-gray-100 rounded-sm"></div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    Available
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-[#00c9a7] rounded-sm"></div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    Selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-gray-300 rounded-sm"></div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    Booked
                  </span>
                </div>
              </div>
            </div>

            {/* Seat Grid */}
            <div className="max-w-md mx-auto relative pt-12 pb-8 overflow-x-auto">
              {/* Steering Wheel Icon Placeholder */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 border-4 border-gray-100 rounded-full flex items-center justify-center opacity-20">
                <div className="w-5 h-1 bg-gray-100 rotate-45 rounded-full"></div>
              </div>

              <div className="min-w-[280px] space-y-3 sm:space-y-4">
                {SEAT_ROWS.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="flex justify-center gap-2 sm:gap-4"
                  >
                    {row.map((seatId, seatIndex) => {
                      if (seatId === null)
                        return (
                          <div
                            key={`aisle-${seatIndex}`}
                            className="w-8 sm:w-12"
                          ></div>
                        );

                      const isBooked = bookedSeats.includes(seatId);
                      const isSelected = selectedSeats.includes(seatId);

                      return (
                        <motion.button
                          key={seatId}
                          whileHover={!isBooked ? { scale: 1.05 } : {}}
                          whileTap={!isBooked ? { scale: 0.95 } : {}}
                          onClick={() => handleSeatClick(seatId)}
                          disabled={isBooked}
                          className={`
                            w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-[13px] transition-all duration-200
                            flex items-center justify-center border-2
                            ${
                              isBooked
                                ? "bg-gray-200 border-transparent text-gray-400 cursor-not-allowed"
                                : isSelected
                                  ? "bg-[#00c9a7] border-[#00c9a7] text-white shadow-lg shadow-[#00c9a730] scale-110"
                                  : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-[#00c9a7]"
                            }
                          `}
                        >
                          {seatId}
                        </motion.button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Summary */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-300 sticky top-24">
            <h3 className="text-xl font-bold text-gray-900 mb-8">
              Journey Summary
            </h3>

            {/* Route Timeline */}
            <div className="relative space-y-6 pl-6 mb-6">
              <div className="absolute left-[3px] top-2 bottom-2 w-[2px] bg-gray-100"></div>
              <div className="relative">
                <div className="absolute -left-[27px] top-1.5 w-2 h-2 rounded-full bg-gray-900 border-4 border-white shadow-sm"></div>
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                  Departure
                </div>
                <div className="text-[14px] font-bold text-gray-900">
                  {trip.from}
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-[27px] top-1.5 w-2 h-2 rounded-full bg-gray-200 border-4 border-white shadow-sm"></div>
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                  Arrival
                </div>
                <div className="text-[14px] font-bold text-gray-900">
                  {trip.to}
                </div>
              </div>
            </div>

            {/* Selection Details */}
            <div className="bg-gray-50 rounded-2xl p-5 space-y-4 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">
                  Selected Seats
                </span>
                <span className="text-gray-900 font-bold">
                  {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Passenger</span>
                <span className="text-gray-900 font-bold">General Member</span>
              </div>
            </div>

            {/* Passenger Name Inputs */}
            {selectedSeats.length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-5 space-y-4 mb-6 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                  Passenger Details
                </span>
                <div className="space-y-3">
                  {selectedSeats.map((seatId) => (
                    <div key={seatId} className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 flex justify-between">
                        <span>Passenger for Seat {seatId}</span>
                        <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter full name"
                        value={passengerNames[seatId] || ""}
                        onChange={(e) => handlePassengerNameChange(seatId, e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#00c9a7] focus:ring-1 focus:ring-[#00c9a7] transition-all"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            <div className="space-y-4 mb-10">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Onboard Amenities
              </span>
              <div className="flex gap-3">
                <div className="flex-1 flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <Wifi size={16} className="text-[#00c9a7]" />
                  <span className="text-[11px] font-bold text-gray-700">
                    Free Wi-Fi
                  </span>
                </div>
                <div className="flex-1 flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <Zap size={16} className="text-[#00c9a7]" />
                  <span className="text-[11px] font-bold text-gray-700">
                    Power Outlet
                  </span>
                </div>
              </div>
            </div>

            {/* Price & CTA */}
            <div className="pt-6 border-t border-gray-100">
              <div className="flex justify-between items-end mb-6">
                <span className="text-gray-500 font-medium text-sm">
                  Total Price
                </span>
                <span className="text-3xl font-bold text-gray-900">
                  ₹{totalPrice.toLocaleString()}
                </span>
              </div>
              <button
                disabled={selectedSeats.length === 0 || !arePassengerNamesFilled}
                onClick={() => {
                  const token = localStorage.getItem("token");
                  if (!token) {
                    toast.error("Please login to proceed with your booking.", {
                      style: {
                        borderRadius: "10px",
                        background: "#0d1b2a",
                        color: "#fff",
                        fontWeight: "bold",
                      },
                    });
                    navigate("/login", { state: { from: "/select-seat", trip, selectedSeats, passengerNames } });
                    return;
                  }
                  navigate("/payment", { state: { trip, selectedSeats, passengerNames } });
                }}
                className={`w-full font-bold py-4 rounded-xl transition-all text-xs uppercase tracking-widest ${
                  selectedSeats.length === 0 || !arePassengerNamesFilled
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed border-transparent shadow-none"
                    : "bg-gray-900 text-white hover:bg-[#00c9a7] hover:shadow-xl active:scale-95"
                }`}
              >
                Proceed to Payment
              </button>
              {selectedSeats.length > 0 && !arePassengerNamesFilled && (
                <div className="text-[10px] text-amber-500 font-bold uppercase tracking-wider text-center mt-3 animate-pulse">
                  ⚠️ Please enter name for all seats to proceed
                </div>
              )}
            </div>
          </div>

          {/* Security Badge */}
          <div className="bg-[#00c9a708] border border-[#00c9a715] rounded-2xl p-6 flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#00c9a7]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="text-[13px] font-bold text-gray-900">
                Secure Booking
              </div>
              <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                Protected by BusKaro guarantee.
              </div>
            </div>
          </div>
        </motion.aside>
      </main>

      <Footer />
    </div>
  );
}
