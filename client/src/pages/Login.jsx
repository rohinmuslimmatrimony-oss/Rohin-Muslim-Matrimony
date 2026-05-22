import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import logo3 from '../assets/logo3.png';
import islamicBg from '../assets/islamic_bg_login.png';

const Login = () => {
  const { login, user, loading } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);
    
    if (res.success) {
      if (res.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div 
      className="min-h-[85vh] flex items-center justify-center px-4 py-10 sm:py-16 relative bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${islamicBg})` }}
    >
      {/* Dark Overlay to give depth and ensure card contrast */}
      <div className="absolute inset-0 bg-black/30 z-0 pointer-events-none"></div>

      {/* Card Wrapper (Responsive, no overflow-hidden) */}
      <div className="w-[92%] sm:w-full max-w-md relative z-10">
        
        {/* Login Card */}
        <div className="w-full bg-[#180205]/18 backdrop-blur-[4px] rounded-2xl sm:rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-gold-500/30 p-6 sm:p-8 md:p-10 relative">
          
          {/* Logo and Greeting */}
          <div className="flex flex-col items-center gap-1.5 mb-4 sm:mb-6 text-center">
            <Link to="/" className="group" title="Navigate to Home">
              <img src={logo3} alt="Rohin Muslim Matrimony Logo" className="hidden sm:block h-16 w-auto object-contain hover:scale-105 transition-transform duration-300 brightness-110" />
            </Link>
            <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold font-serif sm:mt-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Welcome Back</h2>
            <p className="text-white/80 text-xs sm:text-sm font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Please log in to your halal matrimony account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[#ffd666] text-[10px] sm:text-xs font-bold uppercase tracking-wider pl-1 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)]" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/60">
                  <FaEnvelope className="text-xs sm:text-sm" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="enter your email address"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/15 border border-white/20 focus:border-white/40 focus:ring-1 focus:ring-white/40 focus:outline-none transition-all text-xs sm:text-sm text-white placeholder-slate-400"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[#ffd666] text-[10px] sm:text-xs font-bold uppercase tracking-wider drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)]" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/60">
                  <FaLock className="text-xs sm:text-sm" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="enter password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-black/15 border border-white/20 focus:border-white/40 focus:ring-1 focus:ring-white/40 focus:outline-none transition-all text-xs sm:text-sm text-white placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/60 hover:text-white transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash className="text-xs sm:text-sm" /> : <FaEye className="text-xs sm:text-sm" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full bg-gold-gradient text-crimson-950 font-bold py-3 rounded-xl shadow-lg hover:shadow-gold-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 mt-4 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-crimson-950 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>Log In Account <FaArrowRight /></>
              )}
            </button>
          </form>

          {/* Divider separator */}
          <div className="border-t border-white/10 mt-5 pt-5"></div>

          {/* Call to Register */}
          <p className="text-white/85 text-xs sm:text-sm text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            Don't have a profile yet?{' '}
            <Link to="/register" className="text-[#ffd666] font-bold hover:underline hover:text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)]">
              Register Free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
