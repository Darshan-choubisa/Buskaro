export default function ReferCard() {
  return (
    <div className="bg-gray-900 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-6 shadow-xl relative overflow-hidden group flex-1"
         style={{ background: 'linear-gradient(to bottom right, #0a0f1e, #1a2340)' }}>
      
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-[#00c9a705] pointer-events-none"></div>

      <div className="relative z-10">
        <p className="text-[10px] font-bold text-[#00c9a7] tracking-[0.3em] uppercase mb-4">Refer a Friend</p>
        <h3 className="text-3xl font-extrabold text-white leading-tight">Get ₹500 Credit</h3>
      </div>
      
      <button className="relative z-10 bg-white text-gray-900 font-bold text-[13px] px-8 py-3 rounded-xl hover:bg-[#00c9a7] hover:text-white transition-all shadow-lg active:scale-95">
        Invite Now
      </button>
    </div>
  );
}