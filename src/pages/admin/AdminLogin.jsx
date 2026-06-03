import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, Bus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api";
import toast from "react-hot-toast";
import CryptoJS from "crypto-js";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Real-time Validation States
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });

  const navigate = useNavigate();

  // Validate on input changes if touched
  useEffect(() => {
    const newErrors = { email: "", password: "" };
    
    if (touched.email) {
      if (!email) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (touched.password) {
      if (!password) {
        newErrors.password = "Password is required";
      } else if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    }

    setErrors(newErrors);
  }, [email, password, touched]);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Trigger validation on both fields
    const allTouched = { email: true, password: true };
    setTouched(allTouched);

    const isEmailValid = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordValid = password && password.length >= 6;

    if (!isEmailValid || !isPasswordValid) {
      toast.error("Please fix validation errors before submitting.", {
        style: {
          borderRadius: "4px",
          background: "#0f172a",
          color: "#fff",
          border: "1px solid #ef4444",
          fontSize: "12px",
          fontWeight: "bold"
        }
      });
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Verifying security credentials...", {
      style: {
        borderRadius: "4px",
        background: "#0f172a",
        color: "#fff",
        border: "1px solid #334155",
        fontSize: "12px",
      }
    });

    try {
      const encryptedPassword = CryptoJS.AES.encrypt(password, 'super-temporary-key').toString();
      const response = await api.post("/auth/login", { email, password: encryptedPassword });
      const userData = response.data;

      // Crucial Admin Authorization Guard
      if (userData.role !== "admin") {
        toast.dismiss(loadingToast);
        toast.error("ACCESS DENIED: Insufficient administrative privileges.", {
          duration: 5000,
          style: {
            borderRadius: "4px",
            background: "#1e1b4b",
            color: "#fda4af",
            border: "1px solid #f43f5e",
            fontSize: "12px",
            fontWeight: "bold"
          }
        });
        setIsLoading(false);
        return;
      }

      // Safe authentication storage
      localStorage.setItem("token", userData.token);
      localStorage.setItem("user", JSON.stringify(userData));

      toast.dismiss(loadingToast);
      toast.success("ACCESS GRANTED. Welcome to Admin Console.", {
        duration: 4000,
        style: {
          borderRadius: "4px",
          background: "#022c22",
          color: "#6ee7b7",
          border: "1px solid #10b981",
          fontSize: "12px",
          fontWeight: "bold"
        }
      });

      // Redirect into admin dashboard
      setTimeout(() => navigate("/admin"), 1000);
    } catch (error) {
      toast.dismiss(loadingToast);
      setIsLoading(false);
      const errMsg = error.response?.data?.message || "Invalid authentication credentials.";
      toast.error(`LOGIN FAILED: ${errMsg}`, {
        duration: 4500,
        style: {
          borderRadius: "4px",
          background: "#0f172a",
          color: "#fff",
          border: "1px solid #ef4444",
          fontSize: "12px",
          fontWeight: "bold"
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-mono flex items-center justify-center p-4 sm:p-6 overflow-hidden relative selection:bg-[#00c9a7] selection:text-black">
      {/* Sleek cybernetic background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00c9a7]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[420px] bg-slate-900 border-2 border-slate-800 shadow-2xl p-8 flex flex-col space-y-8 relative z-10"
        style={{ borderRadius: "0px" }} // Boxy sharp corners
      >
        {/* Boxy Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-[#00c9a7] p-2 text-slate-950 font-black flex items-center justify-center">
              <Bus size={20} className="stroke-[2.5]" />
            </div>
            <span className="text-xl font-black text-white uppercase tracking-tighter">
              Bus<span className="text-[#00c9a7]">Karo</span>
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 text-[#00c9a7]">
              <Shield size={14} className="animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.25em] uppercase">Admin Portal</span>
            </div>
            <p className="text-slate-500 text-[11px] font-medium uppercase">
              Secure Administrative Access Point
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate autoComplete="off">
          {/* Email Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-0.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Mail size={12} className="text-[#00c9a7]" /> Email Address
              </label>
              {touched.email && errors.email && (
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-tight flex items-center gap-0.5">
                  <AlertCircle size={10} /> {errors.email}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur("email")}
                autoComplete="off"
                className={`w-full bg-slate-950 text-white font-semibold text-xs border focus:outline-none px-4 py-3.5 transition-all placeholder:text-slate-700 ${
                  touched.email && errors.email
                    ? "border-red-500 focus:border-red-500 ring-1 ring-red-500/20"
                    : "border-slate-800 focus:border-[#00c9a7] focus:ring-1 focus:ring-[#00c9a7]/20"
                }`}
                style={{ borderRadius: "0px" }} // Boxy sharp input
                disabled={isLoading}
              />
              {touched.email && !errors.email && email && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#00c9a7] rounded-full"></div>
              )}
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-0.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Lock size={12} className="text-[#00c9a7]" /> Password Key
              </label>
              {touched.password && errors.password && (
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-tight flex items-center gap-0.5">
                  <AlertCircle size={10} /> {errors.password}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
                autoComplete="new-password"
                className={`w-full bg-slate-950 text-white font-semibold text-xs border focus:outline-none pl-4 pr-10 py-3.5 transition-all placeholder:text-slate-700 ${
                  touched.password && errors.password
                    ? "border-red-500 focus:border-red-500 ring-1 ring-red-500/20"
                    : "border-slate-800 focus:border-[#00c9a7] focus:ring-1 focus:ring-[#00c9a7]/20"
                }`}
                style={{ borderRadius: "0px" }} // Boxy sharp input
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Glowing Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-950 text-[#00c9a7] border-2 border-[#00c9a7] font-black py-4 transition-all flex items-center justify-center gap-3 group active:scale-[0.98] hover:bg-[#00c9a7] hover:text-slate-950 hover:shadow-lg hover:shadow-[#00c9a710] disabled:opacity-40 disabled:cursor-not-allowed text-[11px] uppercase tracking-[0.2em] relative overflow-hidden"
            style={{ borderRadius: "0px" }}
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950/20 border-t-[#00c9a7] rounded-full animate-spin"></div>
                Decrypting...
              </>
            ) : (
              <>
                Initialize Access <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="text-center pt-2">
          <Link
            to="/"
            className="text-[10px] text-slate-600 font-bold uppercase tracking-widest hover:text-slate-400 transition-colors"
          >
            ← Return to Main Console
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
