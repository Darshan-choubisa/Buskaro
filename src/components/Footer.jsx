import { X, MessageCircle, Mail, Bus } from 'lucide-react';

const resources = ['Route Map', 'Safety Protocols', 'Partner Login'];
const company   = ['Privacy Policy', 'Terms of Service', 'Careers'];

export default function Footer({ containerClassName = "max-w-7xl" }) {
  return (
    <footer className="bg-[#f8f9fd] border-t border-gray-100">
      <div className={`${containerClassName} mx-auto px-6 py-14`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-[#00c9a7] p-1 rounded-md">
                <Bus size={16} className="text-white" />
              </div>
              <span className="text-[17px] font-bold text-gray-900 italic">Bus<span className="text-[#00c9a7]">Karo</span></span>
            </div>
            <p className="text-gray-400 text-[12px] leading-relaxed max-w-[200px]">
              Defining the future of regional mobility through architectural excellence.
            </p>
          </div>

          {/* Resources */}
          <div className="text-center md:text-left">
            <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest mb-4">Resources</h4>
            <ul className="flex flex-col gap-2.5">
              {resources.map((item) => (
                <li key={item}>
                  <a href="#" className="text-[13px] text-gray-500 hover:text-gray-800 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="text-center md:text-left">
            <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest mb-4">Company</h4>
            <ul className="flex flex-col gap-2.5">
              {company.map((item) => (
                <li key={item}>
                  <a href="#" className="text-[13px] text-gray-500 hover:text-gray-800 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest mb-4">Connect</h4>
            <div className="flex items-center gap-3">
              {[X, MessageCircle, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <Icon size={14} className="text-gray-600" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-gray-100">
          <p className="text-center text-[11px] text-gray-400">
            © 2024 BusKaro Transit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}