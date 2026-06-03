import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Users, ArrowRightLeft } from "lucide-react";
import { motion } from "framer-motion";

const CITIES = [
  "Mumbai",
  "Pune",
  "Delhi",
  "Jaipur",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Digha",
  "Ahmedabad",
  "Surat",
  "Lucknow",
  "Goa",
  "Kochi",
];

export default function HeroSection() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [passengers, setPassengers] = useState(1);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const fromRef = useRef(null);
  const toRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromRef.current && !fromRef.current.contains(event.target)) {
        setShowFromSuggestions(false);
      }
      if (toRef.current && !toRef.current.contains(event.target)) {
        setShowToSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (!from || !to) return;
    navigate(`/trips?from=${from}&to=${to}&date=${date}`);
  };

  const filteredFromCities = CITIES.filter(
    (city) => city.toLowerCase().includes(from.toLowerCase()) && city !== to,
  );

  const filteredToCities = CITIES.filter(
    (city) => city.toLowerCase().includes(to.toLowerCase()) && city !== from,
  );

  const swapCities = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const selectFromCity = (city) => {
    setFrom(city);
    setShowFromSuggestions(false);
  };

  const selectToCity = (city) => {
    setTo(city);
    setShowToSuggestions(false);
  };

  return (
    <section
      className="relative w-full min-h-screen flex items-center overflow-hidden"
      style={{
        background: "linear-gradient(to bottom right, #0d1b2a, #1b263b)",
      }}
    >
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=2000"
        alt="Bus on highway"
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d1b2acc] via-[#0d1b2a88] to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-28 pb-16 flex flex-col lg:flex-row items-center justify-between gap-16">
        {/* Left: Headline */}
        <div className="flex-1 max-w-xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#00c9a7]/10 text-[#00c9a7] text-[11px] font-bold uppercase tracking-widest mb-6 border border-[#00c9a7]/20">
              India's Premium Bus Network
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-extrabold text-white leading-[1.05] tracking-tight">
              Journey with <br />
              <span className="text-[#00c9a7]">Distinction.</span>
            </h1>
            <p className="mt-6 text-gray-400 text-[14px] sm:text-[16px] leading-relaxed max-w-md font-medium">
              Experience the next generation of regional travel with silent
              interiors, clockwork scheduling, and nationwide coverage.
            </p>
          </motion.div>
        </div>

        {/* Right: Search Card */}
        <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl p-8 flex flex-col gap-6 border border-gray-100">
          <div className="space-y-5 relative">
            {/* From */}
            <div className="relative" ref={fromRef}>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                From
              </label>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-4 mt-1.5 border border-gray-200 focus-within:border-[#00c9a7] focus-within:bg-white transition-all shadow-sm">
                <MapPin size={18} className="text-[#00c9a7]" />
                <input
                  type="text"
                  placeholder="Select Departure"
                  value={from}
                  onFocus={() => setShowFromSuggestions(true)}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    setShowFromSuggestions(true);
                  }}
                  className="flex-1 text-[14px] outline-none text-gray-900 font-semibold placeholder-gray-200 bg-transparent"
                />
              </div>

              {/* Suggestions Dropdown */}
              {showFromSuggestions && filteredFromCities.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-2 max-h-48 overflow-y-auto">
                  {filteredFromCities.map((city) => (
                    <div
                      key={city}
                      onClick={() => selectFromCity(city)}
                      className="w-full text-left px-4 py-3 text-[13px] font-semibold text-gray-700 hover:bg-[#00c9a7]/5 hover:text-[#00c9a7] cursor-pointer transition-colors flex items-center gap-3"
                    >
                      <MapPin size={14} className="text-gray-300" />
                      {city}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Swap Button */}
            <button
              onClick={swapCities}
              type="button"
              className="absolute right-8 top-[88px] z-10 bg-white border border-gray-100 p-2 rounded-full shadow-md text-[#00c9a7] hover:bg-[#00c9a7] hover:text-white transition-all active:scale-90"
            >
              <ArrowRightLeft size={16} />
            </button>

            {/* To */}
            <div className="relative" ref={toRef}>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                To
              </label>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-4 mt-1.5 border border-gray-200 focus-within:border-[#00c9a7] focus-within:bg-white transition-all shadow-sm">
                <MapPin size={18} className="text-[#00c9a7]" />
                <input
                  type="text"
                  placeholder="Select Destination"
                  value={to}
                  onFocus={() => setShowToSuggestions(true)}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setShowToSuggestions(true);
                  }}
                  className="flex-1 text-[14px] outline-none text-gray-900 font-semibold placeholder-gray-300 bg-transparent"
                />
              </div>

              {showToSuggestions && filteredToCities.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-2 max-h-48 overflow-y-auto">
                  {filteredToCities.map((city) => (
                    <div
                      key={city}
                      onClick={() => selectToCity(city)}
                      className="w-full text-left px-4 py-3 text-[13px] font-semibold text-gray-700 hover:bg-[#00c9a7]/5 hover:text-[#00c9a7] cursor-pointer transition-colors flex items-center gap-3"
                    >
                      <MapPin size={14} className="text-gray-300" />
                      {city}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Date Row */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Date
              </label>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-4 mt-1.5 border border-gray-200 focus-within:border-[#00c9a7] focus-within:bg-white transition-all shadow-sm">
                <Calendar size={18} className="text-[#00c9a7]" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 text-[13px] outline-none text-gray-900 font-bold bg-transparent w-full"
                />
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleSearch}
            className="w-full bg-[#0d1b2a] text-white text-[15px] font-bold py-5 mt-4 rounded-2xl hover:bg-black transition-all active:scale-[0.98] tracking-wide shadow-lg shadow-[#0d1b2a20]"
          >
            Search Journeys
          </button>
        </div>
      </div>
    </section>
  );
}
