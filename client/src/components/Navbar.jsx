import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaMoon, FaUser, FaSignOutAlt, FaCrown, FaBars, FaTimes, FaSearch, FaHeart, FaShieldAlt } from 'react-icons/fa';

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
    return location.pathname === path ? 'text-gold-500 border-b-2 border-gold-500' : 'text-slate-100 hover:text-gold-300';
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
        <span className="flex items-center gap-1 bg-emerald-500 text-slate-100 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-400">
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
    <nav className="glass-card-dark sticky top-0 z-50 py-3.5 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 text-gold-500 font-serif text-xl md:text-2xl font-bold tracking-wide group">
          <FaMoon className="text-gold-400 group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-white group-hover:text-gold-300 transition-colors">Rohin Muslim</span>
          <span className="text-gold-500 font-sans font-light">Matrimony</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8 font-medium">
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
               <FaShieldAlt className="text-red-400" /> Admin Command Center
             </Link>
          )}
        </div>

        {/* Action Buttons & Profile Card */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4 bg-emerald-900/40 py-1.5 pl-3 pr-2.5 rounded-full border border-emerald-800">
              <div className="flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-100">{profile?.name || 'Member'}</span>
                <span className="flex justify-end mt-0.5">{renderPlanBadge(user.plan)}</span>
              </div>
              <Link to="/edit-profile" className="w-9 h-9 rounded-full overflow-hidden border-2 border-gold-500 bg-emerald-950 flex items-center justify-center hover:scale-105 transition-transform">
                {profile?.profilePhoto && profile.profilePhoto !== '/uploads/default-avatar.png' ? (
                  <img src={`http://localhost:5000${profile.profilePhoto}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="text-slate-300 text-sm" />
                )}
              </Link>
              <button onClick={handleLogout} className="text-slate-300 hover:text-red-400 p-2 transition-colors" title="Logout">
                <FaSignOutAlt className="text-lg" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-slate-100 hover:text-gold-300 font-semibold text-sm px-4 py-2 transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="bg-gold-gradient text-emerald-950 font-bold text-sm px-5 py-2.5 rounded-full shadow-lg hover:shadow-gold-500/20 hover:scale-105 transition-all">
                Register Free
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-slate-100 text-2xl focus:outline-none p-1.5">
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu Slider */}
      {isOpen && (
        <div className="lg:hidden mt-4 pt-4 border-t border-emerald-800 flex flex-col gap-4 font-medium animate-fadeIn">
          {(!user || user.role !== 'admin') && (
            <>
              <Link to="/" onClick={() => setIsOpen(false)} className="text-slate-100 hover:text-gold-400 py-1 transition-colors">Home</Link>
              <Link to="/plans" onClick={() => setIsOpen(false)} className="text-slate-100 hover:text-gold-400 py-1 transition-colors">Plans</Link>
            </>
          )}

          {user && user.role !== 'admin' && (
            <>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-slate-100 hover:text-gold-400 py-1 transition-colors">Dashboard</Link>
              <Link to="/search" onClick={() => setIsOpen(false)} className="text-slate-100 hover:text-gold-400 py-1 transition-colors">Search Matches</Link>
              <Link to="/interests" onClick={() => setIsOpen(false)} className="text-slate-100 hover:text-gold-400 py-1 transition-colors">Interests</Link>
            </>
          )}
          
          {user && user.role === 'admin' && (
             <Link to="/admin" onClick={() => setIsOpen(false)} className="text-red-400 hover:text-red-300 py-1 flex items-center gap-1.5 transition-colors">
               <FaShieldAlt /> Admin Dashboard
             </Link>
          )}

          {user ? (
            <div className="border-t border-emerald-850 pt-4 mt-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link to="/edit-profile" onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full overflow-hidden border-2 border-gold-500 bg-emerald-950 flex items-center justify-center">
                  {profile?.profilePhoto && profile.profilePhoto !== '/uploads/default-avatar.png' ? (
                    <img src={`http://localhost:5000${profile.profilePhoto}`} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <FaUser className="text-slate-300" />
                  )}
                </Link>
                <div className="flex flex-col">
                  <span className="text-slate-100 text-sm font-semibold">{profile?.name}</span>
                  <span className="flex mt-0.5">{renderPlanBadge(user.plan)}</span>
                </div>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-red-400 hover:text-red-300 py-1.5 transition-colors">
                <FaSignOutAlt /> Logout
              </button>
            </div>
          ) : (
            <div className="border-t border-emerald-850 pt-4 mt-2 flex flex-col gap-2.5">
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-center text-slate-100 hover:text-gold-400 py-2 border border-slate-700 rounded-full transition-colors">
                Sign In
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="text-center bg-gold-gradient text-emerald-950 font-bold py-2.5 rounded-full transition-all">
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
