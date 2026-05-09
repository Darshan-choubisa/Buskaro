import { Bus } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white mt-32">
      <div className="max-w-[1400px] mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1 rounded-md">
            <Bus size={16} className="text-white" />
          </div>
          <span className="text-[17px] font-extrabold tracking-tight text-gray-900 italic">Bus<span className="text-blue-600">Karo</span></span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-10 text-[11px] font-bold text-gray-400 tracking-[0.2em]">
          <a href="#" className="hover:text-gray-900 transition-colors uppercase">Data Privacy</a>
          <a href="#" className="hover:text-gray-900 transition-colors uppercase">Service Terms</a>
          <a href="#" className="hover:text-gray-900 transition-colors uppercase">Contact Hub</a>
        </div>

        {/* Info */}
        <div className="text-[10px] font-medium text-gray-400 tracking-wider text-center md:text-right">
          © 2024 BUSKARO. DESIGNED FOR REGIONAL EXCELLENCE.
        </div>
      </div>
    </footer>
  );
}