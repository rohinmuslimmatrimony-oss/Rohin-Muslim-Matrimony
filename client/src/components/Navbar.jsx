import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaMoon, FaUser, FaSignOutAlt, FaCrown, FaBars, FaTimes, FaSearch, FaHeart, FaShieldAlt, FaBell } from 'react-icons/fa';
import { SOCKET_BASE_URL } from '../services/api';

import logo3 from '../assets/logo3.png';

const Navbar = () => {
  const { 
    user, 
    profile, 
    logout, 
    notifications, 
    unreadCount, 
    pendingRequestsCount, 
    markAsRead, 
    markAllAsRead 
  } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [showMobileUserMenu, setShowMobileUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleNotificationClick = (n) => {
    markAsRead(n._id);
    setShowNotifications(false);
    if (n.type === 'message_received') {
      if (window.innerWidth < 1024) {
        navigate(`/chat/${n.sender}`);
      } else {
        navigate('/interests');
      }
    } else {
      navigate('/interests');
    }
  };

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

  const renderPlanBadge = (plan) => {
    if (plan === 'premium') {
      return (
        <span className="flex items-center gap-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-300">
          <FaCrown className="text-[8px]" /> Premium
        </span>
      );
    }
    if (plan === 'elite') {
      return (
        <span className="flex items-center gap-0.5 bg-gold-50 text-gold-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-gold-300">
          <FaCrown className="text-[8px]" /> Elite
        </span>
      );
    }
    return (
      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-300">
        Free
      </span>
    );
  };

  return (
    <nav className="w-full bg-cream-50/80 backdrop-blur-md border-b border-crimson-900/10 py-3.5 px-4 md:px-8 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logo3} alt="Rohin Muslim Matrimony Logo" className="h-11 md:h-14 w-auto object-contain" />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 font-medium text-sm">
          {(!user || user.role !== 'admin') && (
            <>
              <Link to="/" className={isActive('/')}>Home</Link>
              <Link to="/plans" className={isActive('/plans')}>Plans</Link>
            </>
          )}

          {user && user.role !== 'admin' && (
            <>
              <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
              <Link to="/search" className={isActive('/search')}>Search Matches</Link>
              <Link to="/interests" className={`${isActive('/interests')} flex items-center gap-1.5`}>
                Interests
                {pendingRequestsCount > 0 && (
                  <span className="bg-gold-500 text-crimson-950 text-[10px] font-extrabold h-4 px-1.5 rounded-full flex items-center justify-center animate-pulse border border-crimson-900/10 shadow-sm">
                    {pendingRequestsCount}
                  </span>
                )}
              </Link>
            </>
          )}
          
          {user && user.role === 'admin' && (
             <Link to="/admin" className={`${isActive('/admin')} flex items-center gap-1.5`}>
               <FaShieldAlt /> Admin Dashboard
             </Link>
          )}
        </div>

        {/* User Account Controls / Authentication CTAs */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col text-right">
                <span className="text-sm font-bold text-slate-800">{profile?.name || 'Member'}</span>
                <span className="flex justify-end mt-0.5">{renderPlanBadge(user.plan)}</span>
              </div>
              <Link to="/edit-profile" className="w-9 h-9 rounded-full overflow-hidden border-2 border-gold-500 bg-crimson-950 flex items-center justify-center hover:scale-105 transition-transform">
                {profile?.profilePhoto && profile.profilePhoto !== '/uploads/default-avatar.png' ? (
                  <img src={`${SOCKET_BASE_URL}${profile.profilePhoto}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="text-slate-300 text-sm" />
                )}
              </Link>
              
              {/* Notification Bell Desktop */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`w-9 h-9 rounded-full bg-crimson-900/10 text-crimson-950 flex items-center justify-center hover:bg-crimson-900/20 active:scale-95 transition-all relative ${unreadCount > 0 ? 'animate-pulse bg-crimson-900/20' : ''}`}
                  title="Notifications"
                >
                  <FaBell className={`text-sm ${unreadCount > 0 ? 'text-crimson-600' : ''}`} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-extrabold h-4 w-4 rounded-full flex items-center justify-center border border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown Desktop */}
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-crimson-900/10 py-3 z-50 animate-fadeIn max-h-[400px] flex flex-col">
                      <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-800">Notifications ({unreadCount})</span>
                        {unreadCount > 0 && (
                          <button 
                            onClick={() => {
                              markAllAsRead();
                            }}
                            className="text-[10px] font-extrabold text-crimson-600 hover:text-crimson-700 transition-colors uppercase tracking-wider"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="overflow-y-auto max-h-[300px] divide-y divide-slate-100 flex-grow">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n._id}
                              onClick={() => handleNotificationClick(n)}
                              className={`flex items-start gap-3 p-3 hover:bg-slate-50 transition-colors cursor-pointer ${!n.isRead ? 'bg-crimson-50/40 border-l-2 border-crimson-600' : ''}`}
                            >
                              <div className="w-8 h-8 rounded-full bg-crimson-100 flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-crimson-900 text-xs border border-crimson-900/10">
                                {n.senderPhoto && n.senderPhoto !== '/uploads/default-avatar.png' && n.senderPhoto !== '/uploads/blurred-avatar.png' ? (
                                  <img src={`${SOCKET_BASE_URL}${n.senderPhoto}`} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  n.senderName ? n.senderName[0].toUpperCase() : 'M'
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-[11px] leading-snug text-slate-700 ${!n.isRead ? 'font-bold' : 'font-medium'}`}>
                                  {n.content}
                                </p>
                                <span className="text-[9px] font-semibold text-slate-400 mt-1 block">
                                  {formatTimeAgo(n.createdAt)}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

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

        {/* Mobile Control Icons */}
        <div className="flex items-center gap-3 lg:hidden">
          {user && (
            <>
              {/* Notification Bell Mobile */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowMobileUserMenu(false);
                    setIsOpen(false);
                  }}
                  className={`w-8 h-8 rounded-full bg-crimson-900/10 text-crimson-950 flex items-center justify-center hover:bg-crimson-900/20 transition-colors relative ${unreadCount > 0 ? 'animate-pulse bg-crimson-900/20' : ''}`}
                >
                  <FaBell className={`text-xs ${unreadCount > 0 ? 'text-crimson-600' : ''}`} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-extrabold h-3.5 w-3.5 rounded-full flex items-center justify-center border border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown Mobile */}
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                    <div className="absolute right-[-40px] mt-2.5 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2.5 z-50 animate-fadeIn max-h-[350px] flex flex-col">
                      <div className="flex items-center justify-between px-3 pb-2 border-b border-slate-100">
                        <span className="text-[10px] font-extrabold text-slate-800">Notifications ({unreadCount})</span>
                        {unreadCount > 0 && (
                          <button 
                            onClick={() => {
                              markAllAsRead();
                            }}
                            className="text-[9px] font-extrabold text-crimson-600 hover:text-crimson-700 transition-colors uppercase tracking-wider"
                          >
                            Mark all
                          </button>
                        )}
                      </div>
                      <div className="overflow-y-auto max-h-[250px] divide-y divide-slate-100 flex-grow">
                        {notifications.length === 0 ? (
                          <div className="py-6 text-center text-slate-400 text-[10px] font-semibold">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n._id}
                              onClick={() => handleNotificationClick(n)}
                              className={`flex items-start gap-2.5 p-2.5 hover:bg-slate-50 transition-colors cursor-pointer ${!n.isRead ? 'bg-crimson-50/40 border-l-2 border-crimson-600' : ''}`}
                            >
                              <div className="w-7 h-7 rounded-full bg-crimson-100 flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-crimson-900 text-[10px] border border-crimson-900/10">
                                {n.senderPhoto && n.senderPhoto !== '/uploads/default-avatar.png' && n.senderPhoto !== '/uploads/blurred-avatar.png' ? (
                                  <img src={`${SOCKET_BASE_URL}${n.senderPhoto}`} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  n.senderName ? n.senderName[0].toUpperCase() : 'M'
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-[10px] leading-snug text-slate-700 ${!n.isRead ? 'font-bold' : 'font-medium'}`}>
                                  {n.content}
                                </p>
                                <span className="text-[8px] font-semibold text-slate-400 mt-0.5 block">
                                  {formatTimeAgo(n.createdAt)}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User Avatar */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowMobileUserMenu(!showMobileUserMenu);
                    setIsOpen(false);
                  }} 
                  className="w-8 h-8 rounded-full overflow-hidden border border-gold-500 bg-crimson-950 flex items-center justify-center hover:scale-105 transition-transform"
                  aria-label="User menu"
                >
                  {profile?.profilePhoto && profile.profilePhoto !== '/uploads/default-avatar.png' ? (
                    <img src={`${SOCKET_BASE_URL}${profile.profilePhoto}`} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <FaUser className="text-slate-300 text-[10px]" />
                  )}
                </button>

                {/* Mobile User Menu Dropdown (Upgrade & Logout) */}
                {showMobileUserMenu && (
                  <div className="absolute right-0 mt-2.5 w-36 bg-white rounded-lg shadow-xl border border-slate-100 py-1.5 z-50 animate-fadeIn">
                    <button 
                      onClick={() => {
                        navigate('/plans');
                        setShowMobileUserMenu(false);
                      }} 
                      className="w-full text-left px-4 py-2 text-xs font-serif font-extrabold text-gold-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
                    >
                      <FaCrown className="text-xs text-gold-600" /> Upgrade Plan
                    </button>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setShowMobileUserMenu(false);
                      }} 
                      className="w-full text-left px-4 py-2 text-xs font-serif font-extrabold text-red-600 hover:bg-slate-50 flex items-center gap-1.5 transition-colors border-t border-slate-100 mt-1 pt-1.5"
                    >
                      <FaSignOutAlt className="text-xs" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {location.pathname !== '/login' && location.pathname !== '/register' && (
            <button 
              onClick={() => {
                setIsOpen(!isOpen);
                setShowMobileUserMenu(false);
              }} 
              className="text-slate-700 hover:text-slate-900 text-2xl focus:outline-none p-1.5"
            >
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          )}
        </div>
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
                    <img src={`${SOCKET_BASE_URL}${profile.profilePhoto}`} alt="Profile" className="w-full h-full object-cover" />
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
