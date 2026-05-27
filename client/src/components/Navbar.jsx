import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaMoon, FaUser, FaSignOutAlt, FaCrown, FaBars, FaTimes, FaSearch, FaHeart, FaShieldAlt, FaBell, FaDownload, FaCheckCircle } from 'react-icons/fa';
import { SOCKET_BASE_URL } from '../services/api';
import DefaultAvatar from './DefaultAvatar';

import logo3 from '../assets/logo.png';

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const desktopNotifyRef = useRef(null);
  const mobileNotifyRef = useRef(null);

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (!desktopNotifyRef.current || !desktopNotifyRef.current.contains(event.target)) &&
        (!mobileNotifyRef.current || !mobileNotifyRef.current.contains(event.target))
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
      if (window.innerWidth < 768) {
        navigate(`/chat/${n.sender}`);
      } else {
        navigate('/activity');
      }
    } else {
      navigate('/activity');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path
      ? 'text-[#4f080e] border-b-2 border-[#4f080e] font-bold'
      : 'text-slate-700 hover:text-[#4f080e] font-semibold';
  };



  return (
    <nav className="w-full bg-[#faf9f6] border-b border-[#d4af37]/35 py-3.5 px-4 md:px-8 transition-colors shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logo3} alt="Rohin Muslim Matrimony Logo" className="h-11 md:h-14 w-auto object-contain" />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 font-medium text-sm">
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
              <Link to="/activity" className={`${isActive('/activity')} flex items-center gap-1.5`}>
                Activity
                {pendingRequestsCount > 0 && (
                  <span className="bg-gold-500 text-crimson-950 text-[10px] font-extrabold h-4 px-1.5 rounded-full flex items-center justify-center animate-pulse border border-crimson-900/10 shadow-sm">
                    {pendingRequestsCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {user && user.role === 'admin' && (
            <Link to="/admin" className="bg-gradient-to-r from-gold-400 to-gold-600 text-crimson-950 hover:from-gold-300 hover:to-gold-500 font-bold px-5 py-2.5 rounded-xl text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-gold-500/10 border border-gold-300 hover:scale-105 active:scale-95 transition-all">
              <FaShieldAlt className="text-crimson-950 text-xs" /> Admin Dashboard
            </Link>
          )}
        </div>

        {/* User Account Controls / Authentication CTAs */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    {user?.role === 'admin' && (
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-slate-900 text-white shadow-sm flex items-center gap-1">
                        <FaShieldAlt className="text-crimson-500 text-[9px]" />
                        ADMIN
                      </span>
                    )}
                    {user?.role === 'admin' ? 'Administrator' : (profile?.name || 'Member')}
                  </span>
                </div>
              </div>
              <div className="relative">
                <Link to="/my-profile" className={`block w-10 h-10 rounded-full overflow-hidden border-2 bg-crimson-950 flex items-center justify-center hover:scale-105 transition-transform ${user.plan === 'elite' ? 'border-gold-500 shadow-[0_0_8px_rgba(212,175,55,0.6)]' : user.plan === 'premium' ? 'border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'border-slate-300'}`}>
                  {profile?.profilePhoto && profile.profilePhoto !== '/uploads/default-avatar.png' ? (
                    <img src={`${SOCKET_BASE_URL}${profile.profilePhoto}`} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <DefaultAvatar gender={profile?.gender} className="w-full h-full object-contain bg-[#e2e8f0]" />
                  )}
                </Link>
                {user.isManuallyVerified && (
                  <FaCheckCircle className="absolute -bottom-1 -right-1 text-blue-500 bg-white rounded-full text-sm border-2 border-white" />
                )}
              </div>

              {/* Notification Bell Desktop */}
              <div className="relative" ref={desktopNotifyRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition-all relative ${unreadCount > 0 ? 'animate-pulse bg-slate-200' : ''}`}
                  title="Notifications"
                >
                  <FaBell className={`text-sm ${unreadCount > 0 ? 'text-gold-600' : ''}`} />
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
                        {notifications.filter(n => !n.isRead).length === 0 ? (
                          <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                            No new notifications
                          </div>
                        ) : (
                          notifications.filter(n => !n.isRead).map((n) => (
                            <div
                              key={n._id}
                              onClick={() => handleNotificationClick(n)}
                              className="flex items-start gap-3 p-3 hover:bg-slate-50 transition-colors cursor-pointer bg-crimson-50/40 border-l-2 border-crimson-600"
                            >
                              <div className="w-8 h-8 rounded-full bg-crimson-100 flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-crimson-900 text-xs border border-crimson-900/10">
                                {n.senderPhoto && n.senderPhoto !== '/uploads/default-avatar.png' && n.senderPhoto !== '/uploads/blurred-avatar.png' ? (
                                  <img src={`${SOCKET_BASE_URL}${n.senderPhoto}`} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  n.senderName ? n.senderName[0].toUpperCase() : 'M'
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[11px] leading-snug text-slate-800 font-bold">
                                    {n.title || 'Notification'}
                                  </span>
                                  <span className="text-[9px] font-semibold text-slate-400 flex-shrink-0">
                                    {formatTimeAgo(n.createdAt)}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                                  {n.message}
                                </p>
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
              <Link to="/login" className="text-slate-700 hover:text-[#4f080e] font-semibold text-sm px-4 py-2 transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="bg-gold-gradient text-crimson-950 font-bold text-sm px-5 py-2.5 rounded-full shadow-lg hover:shadow-gold-500/20 hover:scale-105 transition-all">
                Register Free
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Control Icons */}
        <div className="flex items-center gap-3 md:hidden">
          {user && (
            <>
              {/* Notification Bell Mobile */}
              <div className="relative" ref={mobileNotifyRef}>
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setIsOpen(false);
                  }}
                  className={`w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 transition-colors relative ${unreadCount > 0 ? 'animate-pulse bg-slate-200' : ''}`}
                >
                  <FaBell className={`text-xs ${unreadCount > 0 ? 'text-gold-600' : ''}`} />
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
                        {notifications.filter(n => !n.isRead).length === 0 ? (
                          <div className="py-6 text-center text-slate-400 text-[10px] font-semibold">
                            No new notifications
                          </div>
                        ) : (
                          notifications.filter(n => !n.isRead).map((n) => (
                            <div
                              key={n._id}
                              onClick={() => handleNotificationClick(n)}
                              className="flex items-start gap-2.5 p-2.5 hover:bg-slate-50 transition-colors cursor-pointer bg-crimson-50/40 border-l-2 border-crimson-600"
                            >
                              <div className="w-7 h-7 rounded-full bg-crimson-100 flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-crimson-900 text-[10px] border border-crimson-900/10">
                                {n.senderPhoto && n.senderPhoto !== '/uploads/default-avatar.png' && n.senderPhoto !== '/uploads/blurred-avatar.png' ? (
                                  <img src={`${SOCKET_BASE_URL}${n.senderPhoto}`} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  n.senderName ? n.senderName[0].toUpperCase() : 'M'
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] leading-snug text-slate-800 font-bold">
                                    {n.title || 'Notification'}
                                  </span>
                                  <span className="text-[8px] font-semibold text-slate-400 flex-shrink-0">
                                    {formatTimeAgo(n.createdAt)}
                                  </span>
                                </div>
                                <p className="text-[9px] text-slate-500 mt-0.5 leading-snug">
                                  {n.message}
                                </p>
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
                <Link
                  to="/my-profile"
                  onClick={() => setIsOpen(false)}
                  className={`block w-9 h-9 rounded-full overflow-hidden border-2 bg-crimson-950 flex items-center justify-center hover:scale-105 transition-transform ${user.plan === 'elite' ? 'border-gold-500 shadow-[0_0_8px_rgba(212,175,55,0.6)]' : user.plan === 'premium' ? 'border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'border-slate-300'}`}
                  aria-label="User profile"
                >
                  {profile?.profilePhoto && profile.profilePhoto !== '/uploads/default-avatar.png' ? (
                    <img src={`${SOCKET_BASE_URL}${profile.profilePhoto}`} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <DefaultAvatar gender={profile?.gender} className="w-full h-full object-contain bg-[#e2e8f0]" />
                  )}
                </Link>
                {user.isManuallyVerified && (
                  <FaCheckCircle className="absolute -bottom-0.5 -right-0.5 text-blue-500 bg-white rounded-full text-[12px] border-2 border-white" />
                )}
              </div>
            </>
          )}

          {location.pathname !== '/login' && location.pathname !== '/register' && (!user || user.role === 'admin') && (
            <button
              onClick={() => {
                setIsOpen(!isOpen);
              }}
              className="text-slate-800 hover:text-[#4f080e] text-2xl focus:outline-none p-1.5"
            >
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Slider */}
      {isOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-slate-200 flex flex-col gap-4 font-medium animate-fadeIn">
          {(!user || user.role !== 'admin') && (
            <>
              <Link to="/" onClick={() => setIsOpen(false)} className="text-slate-700 hover:text-[#4f080e] font-semibold py-1 transition-colors">Home</Link>
              <Link to="/plans" onClick={() => setIsOpen(false)} className="text-slate-700 hover:text-[#4f080e] font-semibold py-1 transition-colors">Plans</Link>
            </>
          )}

          {user && user.role !== 'admin' && (
            <>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-slate-700 hover:text-[#4f080e] font-semibold py-1 transition-colors">Dashboard</Link>
              <Link to="/search" onClick={() => setIsOpen(false)} className="text-slate-700 hover:text-[#4f080e] font-semibold py-1 transition-colors">Search Matches</Link>
              <Link to="/activity" onClick={() => setIsOpen(false)} className="text-slate-700 hover:text-[#4f080e] font-semibold py-1 transition-colors">Activity</Link>
            </>
          )}

          {user && user.role === 'admin' && (
            <Link to="/admin" onClick={() => setIsOpen(false)} className="bg-gradient-to-r from-gold-400 to-gold-600 text-crimson-950 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 my-2 shadow-md">
              <FaShieldAlt className="text-crimson-950 text-sm" /> Admin Dashboard
            </Link>
          )}

          {!isStandalone && (
            <button
              onClick={() => {
                alert("To install: Tap your browser menu (⋮) or the 'Share' icon and select 'Install App' or 'Add to Home Screen'.");
                setIsOpen(false);
              }}
              className="text-left text-[#4f080e] hover:text-[#7f181e] font-bold py-1 flex items-center gap-1.5 transition-colors border-t border-slate-200 mt-1 pt-3"
            >
              <FaDownload /> Install App
            </button>
          )}

          {user ? (
            <div className="border-t border-slate-200 pt-4 mt-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Link to="/my-profile" onClick={() => setIsOpen(false)} className={`block w-11 h-11 rounded-full overflow-hidden border-2 bg-crimson-950 flex items-center justify-center ${user.plan === 'elite' ? 'border-gold-500 shadow-[0_0_8px_rgba(212,175,55,0.6)]' : user.plan === 'premium' ? 'border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'border-slate-300'}`}>
                    {profile?.profilePhoto && profile.profilePhoto !== '/uploads/default-avatar.png' ? (
                      <img src={`${SOCKET_BASE_URL}${profile.profilePhoto}`} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <DefaultAvatar gender={profile?.gender} className="w-full h-full object-contain bg-[#e2e8f0]" />
                    )}
                  </Link>
                  {user.isManuallyVerified && (
                    <FaCheckCircle className="absolute -bottom-0.5 -right-0.5 text-blue-500 bg-white rounded-full text-[14px] border-2 border-white" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col text-left">
                    <span className="text-slate-800 text-sm font-bold flex items-center gap-1.5">
                      {user?.role === 'admin' && (
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-slate-900 text-white shadow-sm flex items-center gap-1">
                          <FaShieldAlt className="text-crimson-500 text-[9px]" />
                          ADMIN
                        </span>
                      )}
                      {user?.role === 'admin' ? 'Administrator' : (profile?.name || 'Member')}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-slate-700 hover:text-red-600 font-semibold py-1.5 transition-colors">
                <FaSignOutAlt /> Logout
              </button>
            </div>
          ) : (
            <div className="border-t border-slate-200 pt-4 mt-2 flex flex-col gap-2.5">
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-center text-slate-700 hover:text-crimson-900 font-semibold py-2 border border-slate-200 rounded-full transition-colors">
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
