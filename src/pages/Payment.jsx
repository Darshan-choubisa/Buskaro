import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useBookings } from "../context/BookingContext";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { formatTo12Hour } from "../utils/formatters";
import {
  CreditCard,
  ShieldCheck,
  ChevronLeft,
  UserCircle,
  Phone,
  Home,
  CheckCircle,
  Bus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Payment() {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { addBooking } = useBookings();
  
  const trip = location.state?.trip || { 
    from: "Mumbai", 
    to: "Pune", 
    price: 520, 
    depart: "10:15 AM",
    arrive: "01:00 PM",
    type: "Premium Intercity Coach" 
  };
  
  const selectedSeats = location.state?.selectedSeats || ["3C"];
  const totalPrice = selectedSeats.length * trip.price;

  useEffect(() => {
    toast.success("Step 3: Secure Payment", {
      icon: "💳",
      style: {
        borderRadius: "10px",
        background: "#0d1b2a",
        color: "#fff",
        fontWeight: "bold",
      },
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-900">
      <Navbar showBack={true} backPath="/select-seat" />

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-12 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        {/* Left Column: Payment Options */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 sm:space-y-8"
        >
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 sm:h-8 bg-[#00c9a7] rounded-full"></div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Payment Details
              </h2>
            </div>
            <p className="text-gray-500 text-[13px] sm:text-[15px] font-medium ml-4">
              Complete your booking securely using your preferred payment method.
            </p>
          </div>

          {/* Payment Method Selector - Modern Glassmorphism Tab Style */}
          <div className="bg-white/60 backdrop-blur-sm p-1.5 rounded-xl border border-gray-300 flex flex-wrap sm:flex-nowrap gap-2 shadow-sm">
            {[
              { id: "card", label: "Card", icon: CreditCard },
              { id: "upi", label: "UPI", icon: Phone },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`flex-1 min-w-[80px] flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 rounded-lg transition-all duration-300 ${
                  paymentMethod === method.id
                    ? "bg-gray-900 text-white shadow-xl shadow-gray-200 scale-[1.02]"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <method.icon size={16} className={paymentMethod === method.id ? "text-[#00c9a7]" : ""} />
                <span className="font-bold text-[10px] sm:text-[13px] tracking-wide uppercase">
                  {method.label}
                </span>
              </button>
            ))}
          </div>

          {/* Form Container */}
          <div className="relative group">
            {/* Decorative Background Element */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00c9a7] to-[#00d2ff] rounded-2xl blur opacity-[0.03] group-hover:opacity-[0.06] transition duration-1000"></div>
            
            <div className="relative bg-white rounded-2xl p-5 sm:p-8 shadow-xl shadow-gray-100/50 border border-gray-300 overflow-hidden">
              <AnimatePresence mode="wait">
                {/* Card Form */}
                {paymentMethod === "card" && (
                  <motion.div
                    key="card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">Credit or Debit Card</h3>
                      <div className="flex gap-2">
                        <div className="px-2 h-6 bg-gray-50 rounded border border-gray-100 flex items-center justify-center">
                          <span className="text-[8px] font-black italic text-blue-800 tracking-tighter">VISA</span>
                        </div>
                        <div className="px-2 h-6 bg-gray-50 rounded border border-gray-100 flex items-center justify-center">
                          <span className="text-[8px] font-black italic text-orange-600 tracking-tighter">MasterCard</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2 col-span-full">
                        <label className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. DARSHAN KADAM"
                          className="w-full bg-white border border-gray-200 rounded-xl px-5 sm:px-6 py-3.5 sm:py-4 text-sm font-semibold focus:border-[#00c9a7] focus:ring-4 focus:ring-[#00c9a708] outline-none transition-all duration-300 placeholder:text-gray-300"
                        />
                      </div>
                      <div className="space-y-2 col-span-full">
                        <label className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">
                          Card Number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            className="w-full bg-white border border-gray-200 rounded-xl px-5 sm:px-6 py-3.5 sm:py-4 text-sm font-mono tracking-widest focus:border-[#00c9a7] focus:ring-4 focus:ring-[#00c9a708] outline-none transition-all duration-300 placeholder:text-gray-300"
                          />
                          <CreditCard
                            size={18}
                            className="absolute right-5 sm:right-6 top-1/2 -translate-y-1/2 text-gray-300"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">
                          Expiration
                        </label>
                        <input
                          type="text"
                          placeholder="MM / YY"
                          className="w-full bg-white border border-gray-200 rounded-xl px-5 sm:px-6 py-3.5 sm:py-4 text-sm font-semibold focus:border-[#00c9a7] focus:ring-4 focus:ring-[#00c9a708] outline-none transition-all duration-300 placeholder:text-gray-300 text-center"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">
                          Security Code
                        </label>
                        <input
                          type="password"
                          placeholder="CVV"
                          className="w-full bg-white border border-gray-200 rounded-xl px-5 sm:px-6 py-3.5 sm:py-4 text-sm font-semibold focus:border-[#00c9a7] focus:ring-4 focus:ring-[#00c9a708] outline-none transition-all duration-300 placeholder:text-gray-300 text-center"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-4 bg-gray-50 p-5 rounded-xl border border-gray-300">
                      <div className="mt-1 bg-white p-1.5 rounded-lg shadow-sm">
                        <ShieldCheck size={16} className="text-[#00c9a7]" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[13px] font-bold text-gray-800">Bank-level Security</p>
                        <p className="text-[11px] leading-relaxed text-gray-500 font-medium">
                          Your payment is secured with 256-bit AES encryption. We do not store your full card details on our servers.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* UPI Section */}
                {paymentMethod === "upi" && (
                  <motion.div
                    key="upi"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8 py-4"
                  >
                    <div className="text-center space-y-3">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#00c9a710] to-[#00d2ff10] rounded-2xl flex items-center justify-center mx-auto text-[#00c9a7] rotate-3 hover:rotate-0 transition-transform duration-500 shadow-inner">
                        <Phone size={36} />
                      </div>
                      <h3 className="font-extrabold text-xl text-gray-900">Pay via UPI</h3>
                      <p className="text-sm text-gray-500 max-w-xs mx-auto font-medium">
                        Enter your VPA / UPI ID to receive a payment request on your mobile.
                      </p>
                    </div>

                    <div className="max-w-md mx-auto space-y-6">
                      <div className="relative group/input">
                        <input
                          type="text"
                          placeholder="username@bank / mobile-number"
                          className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-5 text-sm font-bold focus:border-[#00c9a7] focus:ring-4 focus:ring-[#00c9a708] outline-none transition-all duration-300"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-[12px] hover:bg-[#00c9a7] hover:shadow-lg hover:shadow-[#00c9a730] transition-all">
                          Verify
                        </button>
                      </div>

                      <div className="flex items-center justify-center gap-6 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                        <span className="text-[10px] font-black italic text-gray-400">G Pay</span>
                        <span className="text-[10px] font-black italic text-gray-400">PhonePe</span>
                        <span className="text-[10px] font-black italic text-gray-400">Paytm</span>
                        <span className="text-[10px] font-black italic text-gray-400">Amazon Pay</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Net Banking Section Removed */}
              </AnimatePresence>
            </div>
          </div>

          {/* Secure Badge Mini */}
          <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] pt-2">
            <ShieldCheck size={14} className="text-[#00c9a7]" />
            100% Safe & Secure Transaction
          </div>
        </motion.div>

        {/* Right Column: Order Summary */}
        <motion.aside 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6 mt-4 sm:mt-0"
        >
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-300 sticky top-24">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 sm:mb-8">
              Booking Summary
            </h3>

            <div className="space-y-6 pb-6 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    {trip.from}
                  </div>
                  <div className="font-bold text-gray-900">{formatTo12Hour(trip.depart)}</div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em]">
                    DIRECT
                  </div>
                  <div className="w-12 h-[1px] bg-gray-100"></div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    {trip.to}
                  </div>
                  <div className="font-bold text-gray-900">{formatTo12Hour(trip.arrive)}</div>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#00c9a7] rounded-full"></div>
                  <span className="text-gray-500 font-medium">
                    Selected Seat
                  </span>
                </div>
                <span className="text-gray-900 font-bold">{selectedSeats.join(", ")}</span>
              </div>
            </div>

            {/* Fare Breakdown */}
            <div className="py-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Base Fare</span>
                <span className="text-gray-900 font-bold">₹{(totalPrice * 0.95).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Taxes & Fees</span>
                <span className="text-gray-900 font-bold">₹{(totalPrice * 0.05).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Discount</span>
                <span className="text-emerald-500 font-bold">- ₹0.00</span>
              </div>
            </div>

            {/* Total */}
            <div className="pt-6 border-t border-gray-100">
              <div className="flex justify-between items-end mb-8">
                <span className="text-gray-500 font-medium text-sm">
                  Amount to Pay
                </span>
                <span className="text-3xl font-bold text-gray-900">
                  ₹{totalPrice.toFixed(2)}
                </span>
              </div>
              <button 
                disabled={isProcessing}
                onClick={() => {
                  setIsProcessing(true);
                  const loadingToast = toast.loading("Processing Payment...", {
                    style: {
                      borderRadius: "10px",
                      background: "#0d1b2a",
                      color: "#fff",
                      fontWeight: "bold",
                    },
                  });

                  setTimeout(() => {
                    addBooking({
                      from: trip.from,
                      to: trip.to,
                      date: trip.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                      time: formatTo12Hour(trip.depart) || "10:15 AM",
                      seat: selectedSeats.join(", "),
                      busType: trip.type,
                      operator: trip.operator,
                      busClass: trip.busClass,
                      price: `₹${totalPrice}`,
                      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=400"
                    });
                    
                    toast.dismiss(loadingToast);
                    toast.success("Payment Successful! 🎉", {
                      duration: 3000,
                      style: {
                        borderRadius: "10px",
                        background: "#00c9a7",
                        color: "#fff",
                        fontWeight: "bold",
                      },
                    });
                    
                    setTimeout(() => navigate('/my-bookings'), 1000);
                  }, 2000);
                }}
                className={`w-full ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-[#00c9a7]'} text-white font-bold py-4 rounded-xl transition-all shadow-xl active:scale-95 text-sm uppercase tracking-widest flex items-center justify-center gap-2`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : "Pay Securely"}
              </button>
            </div>

          </div>
        </motion.aside>
      </main>

      <Footer />
    </div>
  );
}
