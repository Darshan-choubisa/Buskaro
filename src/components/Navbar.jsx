import { useState, useEffect } from "react";
import { Menu, X, Bus, ChevronLeft, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Navbar({ showBack = false, backPath = "-1" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        {/* Left Side: Back & Logo */}
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              onClick={() =>
                backPath === "-1" ? navigate(-1) : navigate(backPath)
              }
              className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors text-gray-600"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-[#00c9a7] p-1.5 rounded-lg">
              <Bus size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 italic">
              Bus<span className="text-[#00c9a7]">Karo</span>
            </span>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-[13px] text-gray-500 hover:text-[#00c9a7] transition-all font-semibold"
          >
            Home
          </Link>
          <Link
            to="/trips"
            className="text-[13px] text-gray-500 hover:text-[#00c9a7] transition-all font-semibold"
          >
            Schedules
          </Link>
          <Link
            to="/my-bookings"
            className="text-[13px] text-gray-500 hover:text-[#00c9a7] transition-all font-semibold"
          >
            My Bookings
          </Link>
          {/* <Link
            to="/admin"
            className="text-[13px] text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg hover:bg-emerald-100 transition-all font-bold"
          >
            Admin
          </Link> */}
        </div>

        {/* Auth Buttons / Profile */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                <User size={16} className="text-[#00c9a7]" />
                <span className="text-[13px] font-bold text-gray-700">
                  {user.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[13px] font-semibold text-gray-600 hover:text-[#00c9a7] transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="text-[13px] font-bold bg-[#0d1b2a] text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-all active:scale-95"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
          {[
            { label: "Home", path: "/" },
            { label: "Schedules", path: "/trips" },
            { label: "My Bookings", path: "/my-bookings" },
            { label: "Admin Panel", path: "/admin" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className="text-[14px] text-gray-700 font-medium"
            >
              {item.label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 pt-2 border-t border-gray-50">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-[#00c9a7]" />
                  <span className="text-[14px] font-bold text-gray-700">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="text-[14px] text-red-500 font-bold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-4">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-[14px] font-medium text-gray-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="text-[14px] font-bold text-[#00c9a7]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
