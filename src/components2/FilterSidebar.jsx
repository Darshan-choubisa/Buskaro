import { useState } from 'react';

export default function FilterSidebar() {
  const [departure, setDeparture] = useState('morning');
  const [maxPrice, setMaxPrice] = useState(2000);

  return (
    <div className="space-y-8">
      {/* Price Range */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-300">
        <h3 className="text-[9px] sm:text-[11px] font-bold text-gray-400 tracking-[0.1em] mb-4 uppercase">Max Price: <span className="text-[#00c9a7]">₹{maxPrice}</span></h3>
        <div className="relative px-1">
          <input 
            type="range" 
            min="200" 
            max="3000" 
            step="50"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#00c9a7]"
          />
        </div>
        <div className="flex justify-between mt-4 text-[11px] font-bold text-gray-400">
          <span>₹200</span>
          <span>₹3000</span>
        </div>
      </div>

      {/* Departure */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-300">
        <h3 className="text-[9px] sm:text-[11px] font-bold text-gray-400 tracking-[0.1em] mb-5 uppercase">Departure Time</h3>
        <div className="flex flex-col gap-2">
          {[
            { id: 'morning', label: 'Morning (6AM - 12PM)' },
            { id: 'afternoon', label: 'Afternoon (12PM - 6PM)' },
            { id: 'evening', label: 'Night (6PM - 6AM)' }
          ].map((time) => (
            <button
              key={time.id}
              onClick={() => setDeparture(time.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${
                departure === time.id
                  ? 'bg-[#00c9a7] text-white shadow-md'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {time.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bus Type */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-300">
        <h3 className="text-[9px] sm:text-[11px] font-bold text-gray-400 tracking-[0.1em] mb-5 uppercase">Bus Type</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" defaultChecked className="hidden" />
            <div className="w-5 h-5 border-2 border-[#00c9a7] bg-[#00c9a7] rounded-md flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-[13px] font-semibold text-gray-900">AC Sleeper</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" className="hidden" />
            <div className="w-5 h-5 border-2 border-gray-200 rounded-md group-hover:border-[#00c9a7] transition-colors flex items-center justify-center">
              <div className="w-2 h-2 bg-transparent rounded-sm"></div>
            </div>
            <span className="text-[13px] font-semibold text-gray-600">Non-AC Seater</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" className="hidden" />
            <div className="w-5 h-5 border-2 border-gray-200 rounded-md group-hover:border-[#00c9a7] transition-colors flex items-center justify-center">
              <div className="w-2 h-2 bg-transparent rounded-sm"></div>
            </div>
            <span className="text-[13px] font-semibold text-gray-600">State Transport (ST)</span>
          </label>
        </div>
      </div>

      <div className="bg-[#00c9a708] border border-[#00c9a720] rounded-2xl p-6 text-[12px] text-[#00c9a7] font-semibold leading-relaxed">
        Valid ID proof required at boarding for all passengers.
      </div>
    </div>
  );
}