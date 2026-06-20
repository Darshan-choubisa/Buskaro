import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  Ticket, 
  IndianRupee, 
  Users, 
  Percent, 
  Search, 
  Clock, 
  MapPin, 
  X, 
  ArrowRight, 
  Loader2, 
  RefreshCw,
  TrendingUp,
  ArrowLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

// Seeded Operators list to choose from for demo purposes
const OPERATORS = [
  'Mumbai Blue Sky',
  'Mumbai Shubh Yatra',
  'Mumbai Silver Line',
  'Mumbai National Express',
  'Mumbai Raj Express',
  'Mumbai Bharat Travels',
  'Delhi Speedy Motors',
  'Delhi Metro Express',
  'Bangalore Red Rose',
  'Bangalore National Express',
  'Bangalore Vistara Travels',
  'Chennai National Express',
  'Ahmedabad Silver Line',
  'Pune Royal Travels',
  'Hyderabad Metro Express',
  'Jaipur Vistara Travels',
  'Jaipur Pawan Travels',
  'Kolkata Intercity Pro',
  'Kolkata Swaraj Bus',
  'Surat Pawan Travels',
  'Nagpur Metro Express',
  'Nagpur Green Line',
  'Lucknow Raj Express',
  'Indore Golden Chariot',
  'Indore Red Rose',
  'Coimbatore Red Rose',
  'Visakhapatnam Royal Travels',
  'Patna Shubh Yatra'
];

export default function OperatorDashboard() {
  const [selectedOperator, setSelectedOperator] = useState('Mumbai Blue Sky');
  const [stats, setStats] = useState(null);
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  
  // Seating Map Dialog State
  const [selectedTripForMap, setSelectedTripForMap] = useState(null);
  const [showSeatingModal, setShowSeatingModal] = useState(false);

  const fetchData = async (operator) => {
    setLoadingStats(true);
    setLoadingTrips(true);
    setLoadingBookings(true);

    try {
      // 1. Fetch Stats
      const statsRes = await api.get(`/operator/stats?operator=${encodeURIComponent(operator)}`);
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      // 2. Fetch Trips
      const tripsRes = await api.get(`/operator/trips?operator=${encodeURIComponent(operator)}`);
      if (tripsRes.data.success) {
        setTrips(tripsRes.data.data);
      }

      // 3. Fetch Bookings
      const bookingsRes = await api.get(`/operator/bookings?operator=${encodeURIComponent(operator)}`);
      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.data);
      }

    } catch (error) {
      console.error('Error fetching operator data:', error);
      toast.error('Failed to load operator details');
    } finally {
      setLoadingStats(false);
      setLoadingTrips(false);
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchData(selectedOperator);
  }, [selectedOperator]);

  // Seating layout builder helper
  const getSeatingLayout = (trip) => {
    // Generate standard 40 seats (e.g. 1A, 1B, 1C, 1D ... up to 10D)
    const columns = ['A', 'B', 'C', 'D'];
    const rows = Array.from({ length: 10 }, (_, i) => i + 1);
    
    // Find occupied seats for this trip
    const occupiedMap = {};
    bookings
      .filter(b => b.trip?._id === trip._id && b.status === 'confirmed')
      .forEach(b => {
        b.seats.forEach(seat => {
          // Check if passenger name is logged
          const passenger = b.passengers?.find(p => p.seatNumber === seat);
          occupiedMap[seat] = {
            booked: true,
            passengerName: passenger ? passenger.name : (b.user?.name || 'Customer'),
            bookingId: b._id
          };
        });
      });

    return { rows, columns, occupiedMap };
  };

  const handleOpenSeatingMap = (trip) => {
    setSelectedTripForMap(trip);
    setShowSeatingModal(true);
  };

  const filteredBookings = bookings.filter(b => 
    b.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.seats?.join(', ').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Custom Header for Operator Portal */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 border-b border-slate-700 shadow-sm backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-slate-100 rounded text-xs font-semibold transition-all shadow-sm"
            >
              <ArrowLeft size={14} />
              Back to Home
            </button>
          </div>
          
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-[#00c9a7] p-1.5 rounded-lg">
              <Bus size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-100 italic">
              Bus<span className="text-[#00c9a7]">Karo</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-20 space-y-6">
        
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800 p-6 rounded border border-slate-700 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs tracking-wider uppercase">
              <Bus size={14} />
              Operator Portal
            </div>
            <h1 className="text-xl font-bold text-slate-100 mt-1">
              {selectedOperator} Dashboard
            </h1>
            <p className="text-slate-400 text-sm">
              Real-time Passenger Seat Tracking & Route Management
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Switch Operator:
            </span>
            <select
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-slate-100 rounded text-sm px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-semibold"
            >
              {OPERATORS.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
            <button 
              onClick={() => fetchData(selectedOperator)}
              className="p-2 bg-slate-700 border border-slate-600 hover:bg-slate-600 text-slate-300 rounded transition-all shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue Stat */}
          <div className="bg-slate-800 px-4 py-3 rounded border border-slate-700 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-emerald-900/40 text-emerald-400 flex items-center justify-center">
                <IndianRupee size={20} />
              </div>
              <div>
                <p className="text-slate-400 text-[12px] font-semibold uppercase tracking-wider">Total Revenue</p>
                {loadingStats ? (
                  <div className="h-6 w-20 bg-slate-700 animate-pulse rounded mt-0.5"></div>
                ) : (
                  <h3 className="text-lg font-bold text-slate-100 leading-none mt-0.5">₹{stats?.totalRevenue?.toLocaleString() || 0}</h3>
                )}
              </div>
            </div>
            {!loadingStats && (
              <div className="text-[11px] font-bold px-1.5 py-0.5 rounded text-emerald-400 bg-emerald-900/40">
                +12%
              </div>
            )}
          </div>

          {/* Occupancy Stat */}
          <div className="bg-slate-800 px-4 py-3 rounded border border-slate-700 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-indigo-900/40 text-indigo-400 flex items-center justify-center">
                <Percent size={20} />
              </div>
              <div>
                <p className="text-slate-400 text-[12px] font-semibold uppercase tracking-wider">Avg. Occupancy</p>
                {loadingStats ? (
                  <div className="h-6 w-20 bg-slate-700 animate-pulse rounded mt-0.5"></div>
                ) : (
                  <h3 className="text-lg font-bold text-slate-100 leading-none mt-0.5">{stats?.averageOccupancy || 0}%</h3>
                )}
              </div>
            </div>
          </div>

          {/* Bookings Stat */}
          <div className="bg-slate-800 px-4 py-3 rounded border border-slate-700 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-indigo-900/40 text-indigo-400 flex items-center justify-center">
                <Ticket size={20} />
              </div>
              <div>
                <p className="text-slate-400 text-[12px] font-semibold uppercase tracking-wider">Confirmed Tickets</p>
                {loadingStats ? (
                  <div className="h-6 w-20 bg-slate-700 animate-pulse rounded mt-0.5"></div>
                ) : (
                  <h3 className="text-lg font-bold text-slate-100 leading-none mt-0.5">{stats?.totalBookings || 0}</h3>
                )}
              </div>
            </div>
          </div>

          {/* Fleet Stat */}
          <div className="bg-slate-800 px-4 py-3 rounded border border-slate-700 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-indigo-900/40 text-indigo-400 flex items-center justify-center">
                <Bus size={20} />
              </div>
              <div>
                <p className="text-slate-400 text-[12px] font-semibold uppercase tracking-wider">Active Fleet</p>
                {loadingStats ? (
                  <div className="h-6 w-20 bg-slate-700 animate-pulse rounded mt-0.5"></div>
                ) : (
                  <h3 className="text-lg font-bold text-slate-100 leading-none mt-0.5">{stats?.totalBuses || 0}</h3>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Active Fleet List */}
        <div className="bg-slate-800 border border-slate-700 rounded shadow-sm overflow-hidden min-h-[350px]">
          <div className="px-4 py-3 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Bus size={16} className="text-indigo-400" />
              Fleet Routes & Occupancy Status
            </h2>
            <span className="bg-indigo-900/40 text-indigo-400 px-2 py-0.5 rounded text-[10px] font-bold">
              {trips.length} Trips
            </span>
          </div>

          <div className="overflow-x-auto">
            {loadingTrips ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
                <Loader2 className="animate-spin text-indigo-400" size={32} />
                <p className="text-sm font-medium">Loading schedules...</p>
              </div>
            ) : trips.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/30 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-5 py-3">Route</th>
                    <th className="px-5 py-3">Schedule</th>
                    <th className="px-5 py-3">Seats Occupied</th>
                    <th className="px-5 py-3 text-right">Passenger Seat Map</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {trips.map((trip) => {
                    const bookedCount = trip.totalSeats - trip.availableSeats;
                    const occupancyPercent = trip.totalSeats > 0 ? Math.round((bookedCount / trip.totalSeats) * 100) : 0;
                    
                    return (
                      <tr key={trip._id} className="hover:bg-slate-700/40 transition-all text-slate-300">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-slate-100 font-bold">
                            <span>{trip.from}</span>
                            <ArrowRight size={12} className="text-slate-500" />
                            <span>{trip.to}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">#{trip._id.slice(-6).toUpperCase()}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-slate-200 font-semibold">{trip.departureTime} - {trip.arrivalTime}</div>
                          <div className="text-xs text-slate-500">{new Date(trip.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${
                                  occupancyPercent > 80 ? 'bg-emerald-500' :
                                  occupancyPercent > 50 ? 'bg-indigo-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${occupancyPercent}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-bold text-slate-300">
                              {bookedCount}/{trip.totalSeats} ({occupancyPercent}%)
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleOpenSeatingMap(trip)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold shadow-sm transition-all"
                          >
                            Watch Seats
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <p className="text-xs font-medium">No trips registered for this operator.</p>
              </div>
            )}
          </div>
        </div>

        {/* Passenger Bookings Manifest */}
        <div className="bg-slate-800 border border-slate-700 rounded shadow-sm overflow-hidden min-h-[350px]">
          <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Users size={16} className="text-indigo-400" />
              Passenger Bookings Manifest
            </h2>
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search passengers or Booking ID..." 
                className="w-full pl-10 pr-4 py-1.5 bg-slate-700 border border-slate-600 rounded text-xs text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loadingBookings ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
                <Loader2 className="animate-spin text-indigo-400" size={32} />
                <p className="text-xs">Fetching bookings manifest...</p>
              </div>
            ) : filteredBookings.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/30 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-5 py-3">Booking ID</th>
                    <th className="px-5 py-3">Passenger(s)</th>
                    <th className="px-5 py-3">Assigned Seats</th>
                    <th className="px-5 py-3">Route (From - To)</th>
                    <th className="px-5 py-3">Booking Date</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-700/40 transition-all text-slate-300">
                      <td className="px-5 py-4 font-mono text-xs font-bold text-indigo-400 uppercase">
                        #{b._id.slice(-6)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-slate-100 font-bold">{b.user?.name || 'Customer'}</div>
                        <div className="text-xs text-slate-500">{b.user?.email || 'N/A'}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {b.seats.map((seat) => (
                            <span 
                              key={seat}
                              className="px-2 py-0.5 bg-slate-700 text-slate-200 border border-slate-600 rounded text-xs font-bold font-mono"
                            >
                              Seat {seat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                          <span>{b.trip?.from}</span>
                          <ArrowRight size={12} className="text-slate-500" />
                          <span>{b.trip?.to}</span>
                        </div>
                        <span className="text-[10px] text-indigo-400 font-semibold">
                          {b.trip?.busName} ({b.trip?.type})
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500">
                        {b.createdAt ? new Date(b.createdAt).toLocaleString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'}) : 'N/A'}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-100">
                        ₹{b.totalAmount}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          b.status === 'confirmed' ? 'text-emerald-400 bg-emerald-900/40' :
                          b.status === 'pending' ? 'text-amber-400 bg-amber-900/40' :
                          'text-rose-400 bg-rose-900/40'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Ticket size={24} className="mb-2 opacity-25" />
                <p className="text-xs font-semibold">No bookings match the search criteria.</p>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Visual 2D Seating Layout Modal */}
      {showSeatingModal && selectedTripForMap && (() => {
        const { rows, columns, occupiedMap } = getSeatingLayout(selectedTripForMap);
        
        return (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-800 rounded border border-slate-700 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">
                    Live Passenger Seat Map
                  </h2>
                  <p className="text-xs text-slate-400">
                    {selectedTripForMap.from} to {selectedTripForMap.to} ({selectedTripForMap.departureTime})
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowSeatingModal(false);
                    setSelectedTripForMap(null);
                  }}
                  className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body: Seating Grid */}
              <div className="p-6 flex flex-col items-center">
                {/* Seating Indicators Legend */}
                <div className="flex gap-4 mb-6 text-xs bg-slate-900/50 p-3 rounded border border-slate-700">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-slate-700 rounded border border-slate-600"></div>
                    <span className="text-slate-400">Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-rose-500 rounded border border-rose-600 shadow-[0_0_10px_rgba(239,68,68,0.15)]"></div>
                    <span className="text-rose-600 font-bold">Booked / Occupied</span>
                  </div>
                </div>

                {/* Driver indicator to mimic physical layout */}
                <div className="w-full max-w-[280px] flex justify-end mb-4 border-b border-slate-700 pb-2">
                  <div className="text-[10px] text-slate-400 font-bold border border-slate-700 px-2 py-1 rounded bg-slate-900/50 uppercase tracking-widest flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-500"></div>
                    Driver Wheel
                  </div>
                </div>

                {/* Grid */}
                <div className="space-y-3 bg-slate-900/50 p-4 rounded border border-slate-700 max-w-[320px] w-full shadow-inner">
                  {rows.map((row) => (
                    <div key={row} className="flex justify-between items-center gap-2">
                      
                      {/* Left Column (A & B) */}
                      <div className="flex gap-3">
                        {['A', 'B'].map((col) => {
                          const seatId = `${row}${col}`;
                          const state = occupiedMap[seatId];
                          
                          return (
                            <div 
                              key={seatId} 
                              className={`relative group w-10 h-10 rounded flex items-center justify-center text-[10px] font-bold font-mono transition-all border ${
                                state?.booked
                                  ? 'bg-rose-900/40 border-rose-700 text-rose-400 cursor-help shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                                  : 'bg-slate-700 border-slate-600 text-slate-400 hover:border-indigo-500 hover:bg-slate-600 hover:text-indigo-400 cursor-pointer'
                              }`}
                            >
                              {seatId}
                              
                              {/* Custom Tooltip showing passenger name */}
                              {state?.booked && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] bg-slate-800 text-white rounded px-2 py-1 text-[10px] font-bold opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-xl z-20">
                                  Passenger: {state.passengerName}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Bus Aisle */}
                      <div className="w-8 text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Aisle
                      </div>

                      {/* Right Column (C & D) */}
                      <div className="flex gap-3">
                        {['C', 'D'].map((col) => {
                          const seatId = `${row}${col}`;
                          const state = occupiedMap[seatId];
                          
                          return (
                            <div 
                              key={seatId} 
                              className={`relative group w-10 h-10 rounded flex items-center justify-center text-[10px] font-bold font-mono transition-all border ${
                                state?.booked
                                  ? 'bg-rose-900/40 border-rose-700 text-rose-400 cursor-help shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                                  : 'bg-slate-700 border-slate-600 text-slate-400 hover:border-indigo-500 hover:bg-slate-600 hover:text-indigo-400 cursor-pointer'
                              }`}
                            >
                              {seatId}
                              
                              {/* Custom Tooltip showing passenger name */}
                              {state?.booked && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] bg-slate-800 text-white rounded px-2 py-1 text-[10px] font-bold opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-xl z-20">
                                  Passenger: {state.passengerName}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-slate-700 bg-slate-900/50 flex justify-end">
                <button
                  onClick={() => {
                    setShowSeatingModal(false);
                    setSelectedTripForMap(null);
                  }}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 hover:bg-slate-600 text-slate-200 rounded text-xs font-semibold shadow-sm transition-all"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
