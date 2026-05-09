import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import TripCard from "../components2/TripCard";
import FeatureCard from "../components2/FeatureCard";
import ReferCard from "../components2/ReferCard";
import Footer from "../components/Footer";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Pencil, ArrowRight, ArrowLeft, Calendar, User, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { formatTo12Hour } from "../utils/formatters";

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date =
    searchParams.get("date") || new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!from || !to) {
      setIsLoading(false);
      return;
    }

    const fetchTrips = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(
          `/trips?from=${from}&to=${to}&date=${date}`,
        );
        // Map backend fields to frontend expected fields
        const operators = ["Kalpana Travels", "Ashok Travels", "Shrinath Solitaire", "Rishabh Travels", "Zingbus", "Patel Travels", "VRL Travels", "Neeta Tours", "SRS Travels", "Orange Travels"];
        const busClasses = ["AC", "Non-AC"];
        
        const mappedTrips = response.data.map((t, idx) => ({
          id: t._id,
          operator: operators[idx % operators.length],
          busClass: busClasses[idx % 2], // Simple alternating logic for variety
          depart: formatTo12Hour(t.departureTime),
          arrive: formatTo12Hour(t.arrivalTime),
          from: t.from,
          to: t.to,
          duration: t.duration,
          type: t.type,
          price: t.price,
          date: date,
          fastest: t.duration.includes("2H"), // Example logic for fastest
          highlighted: t.type.includes("Shivneri"),
        }));
        setTrips(mappedTrips);
        
        toast.success("Step 1: Select your preferred bus", {
          icon: "🚌",
          style: {
            borderRadius: "10px",
            background: "#0d1b2a",
            color: "#fff",
            fontWeight: "bold",
          },
        });
      } catch (error) {
        toast.error("Failed to fetch trips. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, [from, to, date]);

  if (!from || !to) {
    return (
      <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-900">
        <Navbar showBack={true} backPath="/" />
        <main className="max-w-7xl mx-auto px-6 pt-40 pb-12 flex flex-col items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 max-w-sm w-full"
          >
            <div className="w-16 h-16 bg-[#00c9a7]/5 rounded-2xl flex items-center justify-center mx-auto text-[#00c9a7] mb-2">
              <MapPin size={32} />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Add your destination</h2>
              <p className="text-gray-400 text-sm font-medium">Select source & destination to see trips.</p>
            </div>
            <button 
              onClick={() => navigate("/")}
              className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-[#00c9a7] transition-all shadow-lg shadow-gray-200 active:scale-95 text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 mt-4"
            >
              <ArrowLeft size={14} />
              Go to Home
            </button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-900">
      <Navbar showBack={true} backPath="/" />

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        {/* Header Section */}
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6 border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-xl sm:text-4xl md:text-5xl font-bold tracking-tight flex items-center gap-2 sm:gap-4 text-gray-900">
              {from} <ArrowRight className="text-gray-300" size={24} /> {to}
            </h1>
            <div className="flex gap-4 mt-6">
              <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-2 flex items-center gap-3 shadow-sm text-[13px] font-semibold text-gray-600">
                <Calendar size={16} className="text-[#00c9a7]" /> {date}
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-2 flex items-center gap-3 shadow-sm text-[13px] font-semibold text-gray-600">
                <User size={16} className="text-[#00c9a7]" /> Select Seat
              </div>
            </div>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 bg-white border border-gray-200 px-6 py-3 rounded-lg text-[14px] font-bold text-gray-900 hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm"
          >
            <Pencil size={16} />
            Modify Search
          </Link>
        </div>

        {/* Content Layout */}
        <div className="max-w-5xl mx-auto">
          {/* Results List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : trips.length > 0 ? (
              <div className="space-y-3">
                <AnimatePresence>
                  {trips.map((trip, index) => (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                        ease: [0.2, 0.8, 0.2, 1],
                      }}
                    >
                      <TripCard trip={trip} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 font-medium">
                  No trips found for this route and date.
                </p>
              </div>
            )}

            {/* Bottom Cards */}
            <div className="flex flex-col md:flex-row gap-8 pt-8">
              <FeatureCard />
              <ReferCard />
            </div>
          </div>
        </div>
      </main>

      <Footer containerClassName="max-w-5xl" />
    </div>
  );
}
