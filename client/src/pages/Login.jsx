import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaArrowRight, FaEye, FaEyeSlash, FaRegUser } from 'react-icons/fa';
import logo3 from '../assets/logo3.png';
import loginPageLogo from '../assets/login page logo.png';
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
    <>
      {/* ===================== MOBILE VIEW ===================== */}
      <div className="flex md:hidden flex-col items-center justify-start h-[100dvh] bg-[#FAF8F5] relative px-5 py-3 overflow-hidden font-sans z-0">
        
        {/* Bottom Decorative Section */}
        <div className="absolute bottom-0 left-0 w-full z-0 flex flex-col justify-end h-[28dvh] pointer-events-none overflow-hidden">
          {/* Faint Mosque Silhouettes */}
          <div className="absolute bottom-[5vh] left-0 w-full opacity-10 flex justify-center">
            <svg viewBox="0 0 1000 200" className="w-[120%] h-[16vh] text-[#C7A543]" fill="currentColor" preserveAspectRatio="none">
              <path d="M50,200 L50,120 L70,100 L70,80 L80,50 L90,80 L90,100 L110,120 L110,200 Z M250,200 L250,150 L270,130 L300,130 L320,150 L320,200 Z M450,200 L450,80 L470,60 L470,40 L480,10 L490,40 L490,60 L510,80 L510,200 Z M650,200 L650,120 L670,100 L670,80 L680,50 L690,80 L690,100 L710,120 L710,200 Z M850,200 L850,150 L870,130 L900,130 L920,150 L920,200 Z" />
            </svg>
          </div>
          {/* Downward Curve — Gold border + Red fill */}
          <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-[9vh] relative z-10">
            <path fill="#C7A543" d="M0,100 L0,20 Q500,80 1000,20 L1000,100 Z" />
            <path fill="#911326" d="M0,100 L0,26 Q500,86 1000,26 L1000,100 Z" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full flex flex-col items-center max-w-[320px] mx-auto">

          {/* Logo */}
          <Link to="/" className="w-full flex justify-center mb-0">
            <img src={logo3} alt="Rohin Muslim Matrimony Logo" className="h-[54px] w-auto object-contain" />
          </Link>

          {/* Decorative Divider */}
          <div className="flex items-center justify-center w-[140px] mx-auto mb-2">
            <div className="h-[1px] bg-[#D4AF37]/70 flex-1"></div>
            <svg className="w-[14px] h-[14px] mx-2 text-[#D4AF37]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <div className="h-[1px] bg-[#D4AF37]/70 flex-1"></div>
          </div>

          {/* Heading */}
          <h2 className="text-[#A11B32] text-[20px] font-bold font-serif mb-0.5 tracking-wide">Welcome Back</h2>
          <p className="text-[#6B7280] text-[10px] font-medium mb-4 text-center">Log in to continue your search for a perfect match</p>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-3">
            {/* Email Input */}
            <div className="space-y-[2px]">
              <label className="text-[#5C4E4E] text-[9.5px] font-medium ml-0.5" htmlFor="mobile-email">Email Address</label>
              <div className="relative flex items-center bg-[#FDFBF7] border border-[#D4AF37]/50 rounded-[9px] overflow-hidden focus-within:border-[#D4AF37] transition-all h-[38px]">
                <span className="absolute left-3 text-[#D4AF37]"><FaRegUser className="text-[12px]" /></span>
                <input
                  id="mobile-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full h-full pl-[34px] pr-3 bg-transparent border-none focus:outline-none text-[11px] text-[#5C4E4E] placeholder-[#A39B9B]"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-[2px]">
              <label className="text-[#5C4E4E] text-[9.5px] font-medium ml-0.5" htmlFor="mobile-password">Password</label>
              <div className="relative flex items-center bg-[#FDFBF7] border border-[#D4AF37]/50 rounded-[9px] overflow-hidden focus-within:border-[#D4AF37] transition-all h-[38px]">
                <span className="absolute left-3 text-[#D4AF37]"><FaLock className="text-[12px]" /></span>
                <input
                  id="mobile-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-full pl-[34px] pr-9 bg-transparent border-none focus:outline-none text-[11px] text-[#5C4E4E] placeholder-[#A39B9B]"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 text-[#D4AF37]">
                  {showPassword ? <FaEyeSlash className="text-[13px]" /> : <FaEye className="text-[13px]" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <div className="w-full flex justify-center pt-1">
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-[82%] bg-[#A11B32] hover:bg-[#8F172B] text-white font-medium py-[9px] rounded-[10px] shadow-sm transition-all flex items-center justify-center text-[13px] disabled:opacity-70 tracking-wide"
              >
                {isSubmitting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : "Log In"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center justify-center w-full my-3 opacity-80">
            <div className="h-[1px] bg-[#D4AF37]/50 flex-1"></div>
            <span className="mx-3 text-[#D4AF37] font-medium text-[11px]">or</span>
            <div className="h-[1px] bg-[#D4AF37]/50 flex-1"></div>
          </div>

          {/* Register Link */}
          <p className="text-[#5C4E4E] text-[11px] font-medium">
            Don't have a profile yet?{' '}
            <Link to="/register" className="text-[#A11B32] font-bold hover:underline">Register Free</Link>
          </p>
        </div>
      </div>

      {/* ===================== DESKTOP VIEW ===================== */}
      <div 
        className="hidden md:flex h-[calc(100vh-85px)] items-center justify-center px-4 relative bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${islamicBg})` }}
      >
      {/* Dark Overlay to give depth and ensure card contrast */}
      <div className="absolute inset-0 bg-black/35 z-0 pointer-events-none"></div>

      {/* Card Wrapper (Responsive, no overflow-hidden) */}
      <div className="w-[92%] sm:w-full max-w-md relative z-10">
        
        {/* Login Card */}
        <div className="w-full bg-gradient-to-b from-[#850f1d]/95 to-[#240307]/98 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.9),_0_0_30px_rgba(212,175,55,0.25)] border-2 border-[#d4af37] p-6 sm:p-7 md:p-8 relative">
          
          {/* Logo and Greeting */}
          <div className="flex flex-col items-center gap-0.5 mb-3 sm:mb-4 text-center">
            <Link to="/" className="group" title="Navigate to Home">
              <img src={loginPageLogo} alt="Rohin Muslim Matrimony Logo" className="hidden sm:block h-28 w-auto object-contain hover:scale-105 transition-transform duration-300 brightness-110" />
            </Link>
            <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold font-serif drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Welcome Back</h2>
            <p className="text-white/85 text-xs sm:text-sm font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Please log in to your halal matrimony account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[#ffd666] text-[10px] sm:text-xs font-bold uppercase tracking-wider pl-1 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)]" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#ffd666]">
                  <FaEnvelope className="text-xs sm:text-sm" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="enter your email address"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/35 border border-gold-500/35 hover:border-gold-500/60 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 focus:outline-none transition-all text-xs sm:text-sm text-white placeholder-white/40 font-semibold shadow-inner focus:shadow-[0_0_10px_rgba(212,175,55,0.3)]"
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
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#ffd666]">
                  <FaLock className="text-xs sm:text-sm" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="enter password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/35 border border-gold-500/35 hover:border-gold-500/60 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 focus:outline-none transition-all text-xs sm:text-sm text-white placeholder-white/40 font-semibold shadow-inner focus:shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#ffd666]/70 hover:text-[#ffd666] transition-colors"
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
    </>
  );
};

export default Login;
