import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaLock, FaArrowRight } from 'react-icons/fa';

const ProfileCompletenessBanner = () => {
  const { user, profile, getCompleteness } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);

  // Scroll listener to hide banner on scroll, show on stop
  useEffect(() => {
    let timeoutId = null;

    const handleScroll = () => {
      // Hide banner when scrolling
      setIsVisible(false);

      // Clear previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Show banner after 250ms of no scrolling activity
      timeoutId = setTimeout(() => {
        setIsVisible(true);
      }, 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // If not logged in, or is admin, don't show anything
  if (!user || user.role === 'admin') return null;

  // Don't show on register, login, or edit profile itself
  const hiddenPaths = ['/login', '/register', '/edit-profile', '/admin'];
  if (hiddenPaths.includes(location.pathname)) return null;

  const completeness = getCompleteness().score;

  // If 100% complete, hide the banner completely
  if (completeness >= 100) return null;

  return (
    <div 
      className={`w-full bg-[#4f080e] border-b-2 border-gold-500/50 text-white text-center text-xs md:text-sm font-medium transition-all duration-1000 ease-out shadow-[0_10px_25px_rgba(0,0,0,0.45)] py-2.5 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-1.5 sm:gap-2">
        <span className="flex items-center gap-1.5 text-gold-400 font-extrabold uppercase tracking-wider text-[10px] md:text-xs bg-crimson-950 px-2.5 py-0.5 rounded border border-gold-500 animate-pulse shadow-[0_0_12px_rgba(234,179,8,0.5)]">
          <FaLock className="text-[9px]" />
          Profile {completeness}%
        </span>
        <span className="text-slate-200">
          Complete your profile to get <strong>5x more visibility</strong> and unlock interest requests!
        </span>
        <button 
          onClick={() => navigate('/edit-profile')}
          className="bg-gold-gradient text-crimson-950 font-extrabold px-3 py-1 rounded-full text-xs md:text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_12px_rgba(234,179,8,0.5)] animate-pulse flex items-center gap-1 ml-1 cursor-pointer"
        >
          Complete Now <FaArrowRight className="text-[10px]" />
        </button>
      </div>
    </div>
  );
};

export default ProfileCompletenessBanner;
