import { useNavigate } from 'react-router-dom';

export default function TripCard({ trip }) {
  const navigate = useNavigate();

  return (
    <div className={`relative bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 hover:shadow-md transition-all group`}>
      
      {trip.fastest && (
        <div className="absolute -top-3 right-4 bg-gray-900 text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg">
          Fastest
        </div>
      )}

      {/* Main Info */}
      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-[1.5fr_2fr_1.5fr] items-center gap-4 md:gap-8">
        
        {/* Departure */}
        <div className="flex flex-col items-center md:items-start">
          <span className="text-[9px] font-bold text-[#00c9a7] uppercase tracking-widest mb-0.5">Departure</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-none">{trip.depart}</span>  
          <span className="text-[11px] sm:text-[13px] font-semibold text-gray-400 mt-1">{trip.from}</span>
        </div>

        {/* Timeline */}
        <div className="flex flex-col items-center justify-center py-4 md:py-0">
          <div className="relative w-full h-8 flex items-center justify-center px-4">
            <div className="absolute left-0 w-3 h-3 rounded-full border-2 border-[#00c9a7] bg-white z-10"></div>
            <div className="h-[2px] bg-gray-100 w-full rounded-full">
              <div className="h-full bg-gradient-to-r from-[#00c9a7] to-gray-900 rounded-full w-[100%]"></div>
            </div>
            <div className="absolute right-0 w-3 h-3 rounded-full bg-gray-900 z-10 shadow-sm"></div>
            <div className="absolute -top-6 flex flex-col items-center">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Bus Time</span>
              <span className="text-[11px] font-bold text-[#0d1b2a] uppercase tracking-widest">{trip.duration}</span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-[11px] font-black text-gray-900 uppercase tracking-tighter">
              {trip.operator}
            </span>
            <span className={`text-[8px] font-bold px-2 py-0.5 rounded-md border ${
              trip.busClass === 'AC' 
                ? 'bg-blue-50 text-blue-600 border-blue-100' 
                : 'bg-gray-50 text-gray-500 border-gray-100'
            }`}>
              {trip.busClass}
            </span>
          </div>
        </div>

        {/* Arrival */}
        <div className="flex flex-col items-center md:items-end">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Arrival</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-none">{trip.arrive}</span>
          <span className="text-[11px] sm:text-[13px] font-semibold text-gray-400 mt-1">{trip.to}</span>
        </div>
      </div>

      {/* Price & Action */}
      <div className="w-full md:w-auto flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 md:pl-6 md:border-l border-gray-100">
         <div className="flex flex-col items-start md:items-center">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Starting from</span>
            <span className="text-lg sm:text-2xl font-bold text-gray-900 mt-0.5">₹{trip.price}</span>
         </div>
        <button 
          onClick={() => navigate('/select-seat', { state: { trip } })}
          className="bg-gray-900 text-white font-bold py-2 sm:py-2.5 px-6 sm:px-8 rounded-lg hover:bg-[#00c9a7] transition-all shadow-md active:scale-95 text-[11px] sm:text-xs"
        >
          Select
        </button>
      </div>

    </div>
  );
}