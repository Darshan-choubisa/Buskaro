import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bus, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, name: userName } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      toast.success(`Welcome to BusKaro, ${userName}!`);
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#f8fafc] flex flex-col items-center p-4 sm:p-6 overflow-y-auto relative custom-scrollbar">
      {/* Header */}
      <div className="w-full max-w-7xl flex justify-between items-center mb-4 sm:mb-8 relative z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-[#00c9a7]">
            <ChevronLeft size={20} />
          </Link>
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-[#00c9a7] p-1.5 rounded-lg shadow-sm">
              <Bus size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 italic">
              Bus<span className="text-[#00c9a7]">Karo</span>
            </span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50 p-6 sm:p-8 flex flex-col items-center space-y-4 relative z-10"
      >
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Create account</h1>
          <p className="text-gray-500 text-[12px] sm:text-sm font-medium">Join BusKaro and start your journey</p>
        </div>

        <form className="w-full space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:ring-4 focus:ring-[#00c9a7]/5 focus:border-[#00c9a720] outline-none transition-all shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@email.com"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:ring-4 focus:ring-[#00c9a7]/5 focus:border-[#00c9a720] outline-none transition-all shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:ring-4 focus:ring-[#00c9a7]/5 focus:border-[#00c9a720] outline-none transition-all shadow-sm"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#00c9a7] text-white font-bold py-3.5 rounded-xl hover:bg-[#00b090] transition-all flex items-center justify-center gap-2 group active:scale-95 shadow-lg shadow-[#00c9a720] text-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="relative flex items-center justify-center py-1">
            <div className="w-full h-[1px] bg-gray-100"></div>
            <span className="absolute bg-white px-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">or</span>
          </div>

          <button type="button" className="w-full flex items-center justify-center gap-3 py-3 border border-gray-100 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all font-bold text-gray-600 shadow-sm active:scale-95 text-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </form>

        <p className="text-gray-500 text-[13px] sm:text-sm font-semibold pt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-[#00c9a7] font-bold hover:underline transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
