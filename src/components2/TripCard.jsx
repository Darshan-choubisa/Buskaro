import { useNavigate } from 'react-router-dom';
import { Star, Bus } from 'lucide-react';

export default function TripCard({ trip }) {
  const navigate = useNavigate();

  // Calculate dynamic single seats count for realism (matching mockup pattern)
  const singleSeatsCount = Math.max(1, Math.floor((trip.seatsLeft || 21) / 4));

  return (
    <div className="bg-[#0d1b2a] text-white rounded-2xl p-5 md:p-6 shadow-[0_4px_20px_rgba(13,27,42,0.15)] border border-[#1b263b] hover:border-[#00c9a7]/30 hover:shadow-[0_8px_30px_rgba(0,201,167,0.1)] transition-all duration-300 group">
      
      {/* Top Row: Operator details, Rating, Time Details, Price */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 pb-4">
        
        {/* Left Side: Brand Name & Bus Type */}
        <div className="flex-1 min-w-[200px] flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight leading-none group-hover:text-[#00c9a7] transition-colors duration-200">
              {trip.operator}
            </h3>
            <div className="p-1 bg-[#1b263b] rounded border border-slate-700/50 flex items-center justify-center">
              <Bus size={13} className="text-slate-400" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium tracking-tight">
            {trip.type || `${trip.busClass} Seater/Sleeper (2+1)`}
          </p>
        </div>

        {/* Rating Badge */}
        <div className="flex items-center">
          <div className="bg-[#0f8a5f] text-white text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
            <Star size={11} className="fill-white text-white" />
            <span>{trip.rating || '4.2'}</span>
          </div>
        </div>

        {/* Departure/Arrival Times, Duration, Seat Count */}
        <div className="flex-1 flex flex-col md:items-center gap-1">
          <div className="flex items-center gap-2 text-[15px] sm:text-[16px] font-bold text-white tracking-tight">
            <span>{trip.depart}</span>
            <span className="text-slate-600 font-light">—</span>
            <span>{trip.arrive}</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium tracking-tight whitespace-nowrap">
            {trip.duration} · {trip.seatsLeft || 21} Seats ({singleSeatsCount} Single)
          </p>
        </div>

        {/* Price and Onwards Label */}
        <div className="flex-shrink-0 flex flex-col md:items-end gap-0.5">
          <span className="text-lg font-bold text-white">
            ₹{(trip.price || 0).toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            Onwards
          </span>
        </div>

      </div>

      {/* Dotted Separator Line */}
      <div className="border-t border-dashed border-slate-800/80 my-1" />

      {/* Bottom Row: Promotions / Features & View Seats CTA */}
      <div className="flex items-center justify-between pt-4 gap-4">
        
        {/* Left Side Pill Badges */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {trip.seatsLeft < 5 && (
            <span className="bg-rose-950/35 text-rose-300 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-rose-900/30 animate-pulse">
              Only {trip.seatsLeft} seats left
            </span>
          )}
          {trip.busClass === 'AC' ? (
            <span className="bg-teal-950/35 text-[#00c9a7] text-[10px] font-semibold px-2.5 py-1 rounded-full border border-teal-900/30">
              AC Luxury
            </span>
          ) : (
            <span className="bg-slate-900 text-slate-400 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-slate-800">
              Regular Class
            </span>
          )}
        </div>

        {/* Right Side: View Seats button using website color */}
        <div>
          <button 
            onClick={() => navigate('/select-seat', { state: { trip } })}
            className="bg-[#00c9a7] hover:bg-[#00b394] active:scale-95 text-white font-bold py-2 px-5 sm:px-6 rounded-full text-[12px] sm:text-[13px] tracking-tight transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center"
          >
            View seats
          </button>
        </div>

      </div>

    </div>
  );
}