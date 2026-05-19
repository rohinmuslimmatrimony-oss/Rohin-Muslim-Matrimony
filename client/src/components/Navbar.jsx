import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaMoon, FaUser, FaSignOutAlt, FaCrown, FaBars, FaTimes, FaSearch, FaHeart, FaShieldAlt } from 'react-icons/fa';

import logo3 from '../assets/logo3.png';

const Navbar = () => {
  const { user, profile, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path 
      ? 'text-slate-900 border-b-2 border-crimson-600 font-bold' 
      : 'text-slate-700 hover:text-slate-900 font-semibold';
  };

  // Plan badge renderer
  const renderPlanBadge = (plan) => {
    if (plan === 'elite') {
      return (
        <span className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full glow-gold border border-yellow-300 animate-pulse-gold">
          <FaCrown className="text-[10px]" /> Elite
        </span>
      );
    }
    if (plan === 'premium') {
      return (
        <span className="flex items-center gap-1 bg-crimson-500 text-slate-100 text-xs font-semibold px-2 py-0.5 rounded-full border border-crimson-400">
          Premium
        </span>
      );
    }
    return (
      <span className="bg-slate-600 text-slate-200 text-xs font-medium px-2 py-0.5 rounded-full border border-slate-500">
        Free
      </span>
    );
  };

  return (
    <nav className="glass-card sticky top-0 z-50 py-1.5 px-4 md:px-8 border-b border-slate-100">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logo3} alt="Rohin Muslim Matrimony Logo" className="h-11 md:h-14 w-auto object-contain" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8 text-sm md:text-base">
          {(!user || user.role !== 'admin') && (
            <>
              <Link to="/" className={`pb-1 transition-colors ${isActive('/')}`}>Home</Link>
              <Link to="/plans" className={`pb-1 transition-colors ${isActive('/plans')}`}>Plans</Link>
            </>
          )}

          {user && user.role !== 'admin' && (
            <>
              <Link to="/dashboard" className={`pb-1 transition-colors ${isActive('/dashboard')}`}>Dashboard</Link>
              <Link to="/search" className={`pb-1 transition-colors ${isActive('/search')}`}>Search Matches</Link>
              <Link to="/interests" className={`pb-1 transition-colors ${isActive('/interests')}`}>Interests</Link>
            </>
          )}
          
          {user && user.role === 'admin' && (
             <Link to="/admin" className={`pb-1 flex items-center gap-1.5 transition-colors ${isActive('/admin')}`}>
               <FaShieldAlt className="text-crimson-600" /> Admin Command Center
             </Link>
          )}
        </div>

        {/* Action Buttons & Profile Card */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4 bg-slate-100/80 py-1.5 pl-3 pr-2.5 rounded-full border border-slate-200">
              <div className="flex flex-col text-right">
                <span className="text-sm font-bold text-slate-800">{profile?.name || 'Member'}</span>
                <span className="flex justify-end mt-0.5">{renderPlanBadge(user.plan)}</span>
              </div>
              <Link to="/edit-profile" className="w-9 h-9 rounded-full overflow-hidden border-2 border-gold-500 bg-crimson-950 flex items-center justify-center hover:scale-105 transition-transform">
                {profile?.profilePhoto && profile.profilePhoto !== '/uploads/default-avatar.png' ? (
                  <img src={`http://localhost:5000${profile.profilePhoto}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="text-slate-300 text-sm" />
                )}
              </Link>
              <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 p-2 transition-colors" title="Logout">
                <FaSignOutAlt className="text-lg" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-slate-700 hover:text-slate-900 font-semibold text-sm px-4 py-2 transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="bg-gold-gradient text-crimson-950 font-bold text-sm px-5 py-2.5 rounded-full shadow-lg hover:shadow-gold-500/20 hover:scale-105 transition-all">
                Register Free
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-slate-700 hover:text-slate-900 text-2xl focus:outline-none p-1.5">
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu Slider */}
      {isOpen && (
        <div className="lg:hidden mt-4 pt-4 border-t border-slate-200 flex flex-col gap-4 font-medium animate-fadeIn">
          {(!user || user.role !== 'admin') && (
            <>
              <Link to="/" onClick={() => setIsOpen(false)} className="text-slate-700 hover:text-slate-900 font-semibold py-1 transition-colors">Home</Link>
              <Link to="/plans" onClick={() => setIsOpen(false)} className="text-slate-700 hover:text-slate-900 font-semibold py-1 transition-colors">Plans</Link>
            </>
          )}

          {user && user.role !== 'admin' && (
            <>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-slate-700 hover:text-slate-900 font-semibold py-1 transition-colors">Dashboard</Link>
              <Link to="/search" onClick={() => setIsOpen(false)} className="text-slate-700 hover:text-slate-900 font-semibold py-1 transition-colors">Search Matches</Link>
              <Link to="/interests" onClick={() => setIsOpen(false)} className="text-slate-700 hover:text-slate-900 font-semibold py-1 transition-colors">Interests</Link>
            </>
          )}
          
          {user && user.role === 'admin' && (
             <Link to="/admin" onClick={() => setIsOpen(false)} className="text-slate-700 hover:text-slate-900 font-semibold py-1 flex items-center gap-1.5 transition-colors">
               <FaShieldAlt /> Admin Dashboard
             </Link>
          )}

          {user ? (
            <div className="border-t border-slate-200 pt-4 mt-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link to="/edit-profile" onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full overflow-hidden border-2 border-gold-500 bg-crimson-950 flex items-center justify-center">
                  {profile?.profilePhoto && profile.profilePhoto !== '/uploads/default-avatar.png' ? (
                    <img src={`http://localhost:5000${profile.profilePhoto}`} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <FaUser className="text-slate-300" />
                  )}
                </Link>
                <div className="flex flex-col">
                  <span className="text-slate-800 text-sm font-bold">{profile?.name}</span>
                  <span className="flex mt-0.5">{renderPlanBadge(user.plan)}</span>
                </div>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-slate-700 hover:text-red-600 font-semibold py-1.5 transition-colors">
                <FaSignOutAlt /> Logout
              </button>
            </div>
          ) : (
            <div className="border-t border-slate-200 pt-4 mt-2 flex flex-col gap-2.5">
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-center text-slate-700 hover:text-slate-900 font-semibold py-2 border border-slate-200 rounded-full transition-colors">
                Sign In
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="text-center bg-gold-gradient text-crimson-950 font-bold py-2.5 rounded-full transition-all">
                Register Free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
