import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaHome, FaCrown, FaThLarge, FaSearch, FaHeart } from 'react-icons/fa';

const BottomNavigation = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Show only if logged in and not admin
  if (!user || user.role === 'admin') return null;

  // Don't show on login/register pages
  const hiddenPaths = ['/login', '/register', '/admin'];
  if (hiddenPaths.includes(location.pathname)) return null;

  const navItems = [
    { label: 'Home', icon: FaHome, path: '/' },
    { label: 'Plans', icon: FaCrown, path: '/plans' },
    { label: 'Dashboard', icon: FaThLarge, path: '/dashboard' },
    { label: 'Search', icon: FaSearch, path: '/search' },
    { label: 'Interests', icon: FaHeart, path: '/interests' }
  ];

  const isTabActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#faf5ec] border-t border-gold-500/30 shadow-[0_-4px_12px_rgba(79,8,14,0.06)] lg:hidden h-14 flex items-center justify-around px-2">
      {navItems.map((item, idx) => {
        const IconComponent = item.icon;
        const active = isTabActive(item.path);

        return (
          <Link
            key={idx}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-200 ${
              active 
                ? 'scale-105' 
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            <IconComponent 
              className={`text-lg mb-0.5 transition-colors duration-200 ${
                active ? 'text-[#c59b27] drop-shadow-[0_1px_2px_rgba(197,155,39,0.2)]' : 'text-[#4f080e]/50'
              }`} 
            />
            <span 
              className={`text-[9px] uppercase tracking-wider leading-none transition-colors duration-200 ${
                active ? 'text-[#4f080e] font-extrabold' : 'text-[#4f080e]/60 font-medium'
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNavigation;
