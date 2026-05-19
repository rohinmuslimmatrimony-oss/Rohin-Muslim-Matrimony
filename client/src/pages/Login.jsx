import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaMoon, FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';
import logo3 from '../assets/logo3.png';

const Login = () => {
  const { login, user, loading } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 relative bg-cream-50 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[10%] left-[10%] w-80 h-80 bg-crimson-900/5 rounded-full blur-[80px]"></div>
      <div className="absolute bottom-[10%] right-[10%] w-80 h-80 bg-gold-500/5 rounded-full blur-[80px]"></div>

      <div className="w-full max-w-md glass-card rounded-3xl shadow-xl border border-crimson-950/5 overflow-hidden p-8 md:p-10 relative z-10">
        {/* Logo and Greeting */}
        <div className="flex flex-col items-center gap-2 mb-6 text-center">
          <img src={logo3} alt="Rohin Muslim Matrimony Logo" className="h-16 w-auto object-contain" />
          <h2 className="text-slate-900 text-2xl md:text-3xl font-bold font-serif mt-2">Welcome Back</h2>
          <p className="text-slate-500 text-sm">Please log in to your halal matrimony account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-1" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <FaEnvelope className="text-sm" />
              </span>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter your email address"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none transition-all text-sm text-slate-800"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-slate-700 text-xs font-bold uppercase tracking-wider" htmlFor="password">
                Password
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <FaLock className="text-sm" />
              </span>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="enter password"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none transition-all text-sm text-slate-800"
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full bg-gold-gradient text-crimson-950 font-bold py-3.5 rounded-2xl shadow-lg hover:shadow-gold-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 mt-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-crimson-950 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>Log In Account <FaArrowRight /></>
            )}
          </button>
        </form>

        {/* Demo Users Section */}
        <div className="border-t border-slate-150 pt-6 mt-8 text-center space-y-3">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Demo Access Details</p>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 text-left bg-crimson-900/5 p-3.5 rounded-2xl border border-crimson-800/10">
            <div>
              <span className="font-bold text-crimson-900 block">Admin Access:</span>
              <span>admin@matrimony.com</span>
              <span className="block italic text-slate-400">pass: admin123</span>
            </div>
            <div>
              <span className="font-bold text-crimson-900 block">Free Member:</span>
              <span>zayd.khan@gmail.com</span>
              <span className="block italic text-slate-400">pass: password123</span>
            </div>
            <div className="col-span-2 border-t border-crimson-900/10 pt-2 mt-1">
              <span className="font-bold text-crimson-900 block">Premium Member:</span>
              <span>riza.hussein@gmail.com</span>
              <span className="block italic text-slate-400">pass: password123</span>
            </div>
          </div>
        </div>

        {/* Call to Register */}
        <p className="text-slate-500 text-sm mt-8 text-center">
          Don't have a profile yet?{' '}
          <Link to="/register" className="text-crimson-900 font-bold hover:underline">
            Register Free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
