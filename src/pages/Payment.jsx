import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBookings } from "../context/BookingContext";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { formatTo12Hour } from "../utils/formatters";
import api from "../utils/api";
import { ShieldCheck, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Payment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);
  const [sandboxData, setSandboxData] = useState(null);
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
  const passengerNames = location.state?.passengerNames || {};
  const passengersArray = Object.entries(passengerNames).map(([seatNumber, name]) => ({ seatNumber, name }));
  const totalPrice = selectedSeats.length * trip.price;

  useEffect(() => {
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
      navigate("/login", { state: { from: "/payment", trip, selectedSeats, passengerNames } });
      return;
    }

    toast.success("Step 3: Secure Payment", {
      icon: "💳",
      style: {
        borderRadius: "10px",
        background: "#0d1b2a",
        color: "#fff",
        fontWeight: "bold",
      },
    });
  }, [navigate, trip, selectedSeats]);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-900 flex flex-col">
      <Navbar showBack={true} backPath="/select-seat" />

      <main className="max-w-md mx-auto w-full px-4 sm:px-6 pt-28 pb-16 flex-grow flex flex-col justify-center">
        {/* Centered Order Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 w-full"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
            {/* Decorative Top Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#00c9a7] to-[#00d2ff]"></div>
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                Booking Summary
              </h3>
              <p className="text-sm font-medium text-gray-500 mt-1">
                Review your journey details
              </p>
            </div>

            <div className="space-y-6 pb-6 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    {trip.from}
                  </div>
                  <div className="font-bold text-gray-900">{formatTo12Hour(trip.depart)}</div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="text-[9px] font-bold text-[#00c9a7] uppercase tracking-[0.2em]">
                    DIRECT
                  </div>
                  <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#00c9a7] to-transparent opacity-40"></div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    {trip.to}
                  </div>
                  <div className="font-bold text-gray-900">{formatTo12Hour(trip.arrive)}</div>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#00c9a7] rounded-full"></div>
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                    Selected Seats
                  </span>
                </div>
                <span className="text-[#00c9a7] font-extrabold">{selectedSeats.join(", ")}</span>
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

            {/* Cancellation Policy */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-xl px-5 py-4 mb-2">
              <div className="flex items-center gap-2 mb-3">
                <Info size={14} className="text-blue-500 flex-shrink-0" />
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-widest">Cancellation & Refund Policy</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center flex-shrink-0">
                    <span className="text-[8px] font-black text-emerald-700">✓</span>
                  </span>
                  <div>
                    <span className="text-[11px] font-semibold text-gray-700">Booked ≥5 days before departure</span>
                    <span className="text-[10px] text-gray-500 block">AND cancel ≥3 days before departure</span>
                  </div>
                  <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap">100% Refund</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center flex-shrink-0">
                    <span className="text-[8px] font-black text-amber-700">!</span>
                  </span>
                  <div>
                    <span className="text-[11px] font-semibold text-gray-700">All other cases</span>
                    <span className="text-[10px] text-gray-500 block">(booked same-day, or cancel within 3 days)</span>
                  </div>
                  <span className="ml-auto text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap">50% Refund</span>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="pt-6 border-t border-gray-100">
              <div className="flex justify-between items-end mb-8">
                <span className="text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                  Total Amount
                </span>
                <span className="text-4xl font-black text-gray-900 tracking-tight">
                  ₹{totalPrice.toFixed(2)}
                </span>
              </div>
              
              <button 
                disabled={isProcessing}
                onClick={async () => {
                  setIsProcessing(true);
                  const loadingToast = toast.loading("Initializing transaction...", {
                    style: {
                      borderRadius: "10px",
                      background: "#0d1b2a",
                      color: "#fff",
                      fontWeight: "bold",
                    },
                  });

                  try {
                    // Load Razorpay script dynamically
                    const scriptLoaded = await loadRazorpayScript();
                    if (!scriptLoaded) {
                      toast.dismiss(loadingToast);
                      setIsProcessing(false);
                      toast.error("Failed to load Razorpay SDK. Please check your internet connection.");
                      return;
                    }

                    // Create pending booking on backend
                    const response = await api.post("/bookings", {
                      trip: trip.id || trip._id,
                      seats: selectedSeats,
                      totalAmount: totalPrice,
                      passengers: passengersArray
                    });

                    const { booking, razorpayOrder, isDemo } = response.data;
                    toast.dismiss(loadingToast);

                    // If backend is running with demo/placeholder keys, launch our custom Sandbox modal!
                    if (isDemo) {
                      setSandboxData({ booking, razorpayOrder });
                      setShowSandbox(true);
                      return;
                    }

                    // User info prefill helpers
                    let prefillInfo = { name: "Passenger", email: "passenger@buskaro.com" };
                    try {
                      const localUser = localStorage.getItem("user");
                      if (localUser) {
                        const parsedUser = JSON.parse(localUser);
                        prefillInfo.name = parsedUser.name || prefillInfo.name;
                        prefillInfo.email = parsedUser.email || prefillInfo.email;
                      }
                    } catch (e) {
                      console.log("Error loading user profile", e);
                    }

                    // Trigger Real Razorpay Checkout
                    const options = {
                      key: razorpayOrder.keyId,
                      amount: razorpayOrder.amount,
                      currency: razorpayOrder.currency,
                      name: "BusKaro",
                      description: `Seats: ${selectedSeats.join(", ")} | Operator: ${trip.busName || trip.operator || "BusKaro"}`,
                      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=120",
                      order_id: razorpayOrder.id,
                      handler: async function (paymentResponse) {
                        const verifyingToast = toast.loading("Verifying payment...", {
                          style: {
                            borderRadius: "10px",
                            background: "#0d1b2a",
                            color: "#fff",
                            fontWeight: "bold",
                          },
                        });
                        try {
                          await api.post("/bookings/verify", {
                            bookingId: booking._id,
                            razorpayOrderId: paymentResponse.razorpay_order_id,
                            razorpayPaymentId: paymentResponse.razorpay_payment_id,
                            razorpaySignature: paymentResponse.razorpay_signature
                          });

                          addBooking({
                            dbBookingId: booking._id,
                            bookingDate: booking.bookingDate || new Date().toISOString(),
                            rawDate: trip.date,
                            rawPrice: totalPrice,
                            from: trip.from,
                            to: trip.to,
                            date: trip.date ? new Date(trip.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                            time: trip.departureTime || formatTo12Hour(trip.depart) || "10:15 AM",
                            seat: selectedSeats.join(", "),
                            busType: trip.type,
                            operator: trip.busName || trip.operator,
                            busClass: trip.busClass || (trip.type?.includes("AC") ? "AC" : "Non-AC"),
                            price: `₹${totalPrice}`,
                            image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=400",
                            passengers: passengersArray
                          });

                          toast.dismiss(verifyingToast);
                          toast.success("Payment Verified & Ticket Booked! 🎉", {
                            duration: 3500,
                            style: {
                              borderRadius: "10px",
                              background: "#00c9a7",
                              color: "#fff",
                              fontWeight: "bold",
                            },
                          });
                          setTimeout(() => navigate('/my-bookings'), 1000);
                        } catch (err) {
                          toast.dismiss(verifyingToast);
                          setIsProcessing(false);
                          toast.error(err.response?.data?.message || "Payment verification failed.");
                        }
                      },
                      prefill: {
                        name: prefillInfo.name,
                        email: prefillInfo.email,
                        contact: "9999999999",
                      },
                      theme: {
                        color: "#00c9a7",
                      },
                      modal: {
                        ondismiss: function () {
                          setIsProcessing(false);
                          toast.error("Checkout cancelled by user.");
                        }
                      }
                    };

                    const rzp = new window.Razorpay(options);
                    rzp.open();

                  } catch (error) {
                    toast.dismiss(loadingToast);
                    setIsProcessing(false);
                    const errMsg = error.response?.data?.message || "Transaction initiation failed. Try again.";
                    toast.error(errMsg, {
                      duration: 4000,
                      style: {
                        borderRadius: "10px",
                        background: "#ef4444",
                        color: "#fff",
                        fontWeight: "bold",
                      }
                    });
                    if (error.response?.status === 400 && error.response?.data?.message?.includes("already reserved")) {
                      setTimeout(() => navigate('/select-seat', { state: { trip } }), 2000);
                    }
                  }
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
          
          {/* Secure Badge */}
          <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] pt-4">
            <ShieldCheck size={14} className="text-[#00c9a7]" />
            100% Safe & Secure Transaction
          </div>
        </motion.div>
      </main>

      {/* Sandbox Simulator Modal */}
      <AnimatePresence>
        {showSandbox && sandboxData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-[#0b132b] text-white w-full max-w-md rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl"
            >
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/10 p-6 border-b border-slate-800 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 shadow-inner">
                  <ShieldCheck size={26} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                    Razorpay Sandbox
                  </h4>
                  <p className="text-[11px] text-emerald-400 uppercase tracking-widest font-black">
                    Developer Mode Active
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Order ID</span>
                    <span className="font-mono text-slate-200 bg-slate-950 px-2 py-0.5 rounded text-[10px]">
                      {sandboxData.razorpayOrder.id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Ticket Price</span>
                    <span className="font-bold text-white">₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Seats</span>
                    <span className="font-bold text-emerald-400">{selectedSeats.join(", ")}</span>
                  </div>
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <p className="text-sm font-semibold text-slate-200">
                    Simulate Payment Gateway response
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
                    Because placeholder keys were found in your environment, the platform falls back to Sandbox mode. This allows you to completely test the verification workflow in a sandbox.
                  </p>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 gap-3 pt-2">
                  <button
                    onClick={async () => {
                      setShowSandbox(false);
                      const verifyingToast = toast.loading("Verifying simulated transaction...", {
                        style: {
                          borderRadius: "10px",
                          background: "#0d1b2a",
                          color: "#fff",
                          fontWeight: "bold",
                        },
                      });

                      try {
                        const mockPaymentId = `pay_demo_${Math.random().toString(36).substring(2, 10)}`;
                        const mockSignature = `sig_demo_${Math.random().toString(36).substring(2, 10)}`;

                        await api.post("/bookings/verify", {
                          bookingId: sandboxData.booking._id,
                          razorpayOrderId: sandboxData.razorpayOrder.id,
                          razorpayPaymentId: mockPaymentId,
                          razorpaySignature: mockSignature
                        });

                        addBooking({
                          dbBookingId: sandboxData.booking._id,
                          bookingDate: sandboxData.booking.bookingDate || new Date().toISOString(),
                          rawDate: trip.date,
                          rawPrice: totalPrice,
                          from: trip.from,
                          to: trip.to,
                          date: trip.date ? new Date(trip.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                          time: trip.departureTime || formatTo12Hour(trip.depart) || "10:15 AM",
                          seat: selectedSeats.join(", "),
                          busType: trip.type,
                          operator: trip.busName || trip.operator,
                          busClass: trip.busClass || (trip.type?.includes("AC") ? "AC" : "Non-AC"),
                          price: `₹${totalPrice}`,
                          image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=400",
                          passengers: passengersArray
                        });

                        toast.dismiss(verifyingToast);
                        toast.success("Transaction Simulated Successfully! 🎉", {
                          duration: 3500,
                          style: {
                            borderRadius: "10px",
                            background: "#00c9a7",
                            color: "#fff",
                            fontWeight: "bold",
                          },
                        });
                        setTimeout(() => navigate('/my-bookings'), 1000);
                      } catch (err) {
                        toast.dismiss(verifyingToast);
                        setIsProcessing(false);
                        toast.error("Simulated verification failed.");
                      }
                    }}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider hover:scale-[1.02] shadow-lg shadow-emerald-500/10 active:scale-95 transition-all"
                  >
                    Simulate Payment Success
                  </button>
                  <button
                    onClick={() => {
                      setShowSandbox(false);
                      setIsProcessing(false);
                      toast.error("Simulated Payment Declined ❌", {
                        style: {
                          borderRadius: "10px",
                          background: "#ef4444",
                          color: "#fff",
                          fontWeight: "bold",
                        },
                      });
                    }}
                    className="w-full border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300 font-bold py-3 rounded-xl text-[11px] uppercase tracking-wider active:scale-95 transition-all"
                  >
                    Simulate Payment Failure
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
