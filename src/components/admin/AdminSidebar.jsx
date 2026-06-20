import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bus, 
  Ticket, 
  Users, 
  IndianRupee, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success("Administrator logged out successfully.", {
      style: {
        borderRadius: "4px",
        background: "#0f172a",
        color: "#fff",
        border: "1px solid #334155",
        fontSize: "12px",
        fontWeight: "bold"
      }
    });
    navigate('/admin/login');
  };
  
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Buses & Trips', icon: Bus, path: '/admin/buses' },
    { name: 'Bookings', icon: Ticket, path: '/admin/bookings' },
    { name: 'Users', icon: Users, path: '/admin/users' },
    { name: 'Refunds', icon: IndianRupee, path: '/admin/refunds' },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-60 bg-slate-900 text-slate-300 flex flex-col z-50 border-r border-slate-800">
      <div className="p-5 border-b border-slate-800">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded flex items-center justify-center font-bold text-white text-sm">
            B
          </div>
          <span className="text-lg font-bold text-white tracking-tight">BusKaro <span className="text-indigo-400 text-[10px] uppercase tracking-wider font-semibold ml-1">Admin</span></span>
        </Link>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
              }`}
            >
              <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-500'} />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-all duration-200"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Sign out</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
