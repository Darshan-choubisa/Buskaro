import { ShieldCheck } from 'lucide-react';

export default function FeatureCard() {
  return (
    <div className="bg-white rounded-2xl p-8 flex items-start gap-6 shadow-sm border border-gray-300 flex-1">
      <div className="w-14 h-14 bg-[#00c9a710] rounded-2xl flex items-center justify-center text-[#00c9a7] shrink-0">
        <ShieldCheck size={32} strokeWidth={1.5} />
      </div>
      
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-gray-900">Verified Intercity Routes</h3>
        <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-md">
          We partner with state transport and top private operators to ensure safe, on-time, and reliable travel across India.
        </p>
        
        <div className="flex gap-4 pt-2 grayscale opacity-50">
           <div className="w-10 h-8 bg-gray-200 rounded flex items-center justify-center text-[10px] font-bold">MSRTC</div>
           <div className="w-10 h-8 bg-gray-200 rounded flex items-center justify-center text-[10px] font-bold">GSRTC</div>
           <div className="w-10 h-8 bg-gray-200 rounded flex items-center justify-center text-[10px] font-bold">UPSRTC</div>
        </div>
      </div>
    </div>
  );
}