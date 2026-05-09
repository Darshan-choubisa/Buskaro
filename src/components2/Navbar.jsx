import { Link } from 'react-router-dom';
import { Bus } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Bus size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 italic">Bus<span className="text-blue-600">Karo</span></span>
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-10">
          <Link to="/trips" className="text-[13px] font-semibold text-gray-900 border-b-2 border-blue-600 pb-1">
            Schedules
          </Link>
          <Link to="#" className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors">
            My Bookings
          </Link>
          <Link to="#" className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Stations
          </Link>
          <Link to="#" className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Support
          </Link>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-[13px] font-medium text-gray-700 hover:text-gray-900 transition-colors">
            Sign In
          </Link>
          <Link to="/signup" className="bg-gray-900 text-white text-[13px] font-semibold rounded-full px-5 py-2 hover:bg-blue-600 transition-colors shadow-sm">
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}