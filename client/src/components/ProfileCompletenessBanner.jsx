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
      className={`fixed bottom-14 lg:bottom-0 left-0 right-0 z-30 w-full bg-gradient-to-r from-[#4f080e] via-[#330408] to-[#4f080e] border-t border-gold-500/30 text-white transition-all duration-500 ease-out shadow-[0_-4px_12px_rgba(0,0,0,0.15)] py-1.5 px-4 flex items-center justify-between ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-gold-400 font-extrabold uppercase tracking-wider text-[9px] md:text-[10px] bg-crimson-950/80 px-2 py-0.5 rounded border border-gold-500/40 shrink-0">
            <FaLock className="text-[8px]" />
            {completeness}%
          </span>
          <span className="text-slate-200 text-[10px] sm:text-xs font-medium line-clamp-1">
            Complete profile to unlock <strong>5x views!</strong>
          </span>
        </div>
        <button 
          onClick={() => navigate('/edit-profile')}
          className="bg-gold-gradient text-crimson-950 font-bold px-3 py-1 rounded-full text-[9px] sm:text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_0_8px_rgba(234,179,8,0.3)] flex items-center gap-0.5 cursor-pointer shrink-0"
        >
          Complete <FaArrowRight className="text-[8px]" />
        </button>
      </div>
    </div>
  );
};

export default ProfileCompletenessBanner;
