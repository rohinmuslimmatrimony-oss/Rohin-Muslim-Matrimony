import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaCrown, FaCheckCircle, FaTimes, FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaClock } from 'react-icons/fa';
import { SOCKET_BASE_URL } from '../services/api';
import DefaultAvatar from './DefaultAvatar';
import toast from 'react-hot-toast';

const HandpickedMatchModal = ({
  show,
  onClose,
  matches = [],
  onInterest,
  onDecline,
  user,
  profile,
  getCompleteness
}) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingInterest, setLoadingInterest] = useState(false);

  if (!show || !matches || matches.length === 0) return null;

  const currentMatch = matches[currentIndex];
  if (!currentMatch || !currentMatch.partner) return null;

  const p = currentMatch.partner;
  const isLast = currentIndex >= matches.length - 1;

  const handleInterestClick = async () => {
    if (user?.role !== 'admin' && getCompleteness) {
      const completeness = getCompleteness().score;
      if (completeness < 100) {
        toast.error('Please complete your profile to 100% before sending interest requests!', {
          icon: '🔒',
        });
        return;
      }
    }

    setLoadingInterest(true);
    try {
      if (onInterest) {
        await onInterest(p._id, currentMatch.matchId);
      }
    } finally {
      setLoadingInterest(false);
    }
  };

  const handleSkipClick = () => {
    if (onDecline) {
      onDecline(currentMatch.matchId);
    }
    if (isLast) {
      onClose();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleViewProfile = () => {
    onClose();
    navigate(`/profile/${p.user?._id || p._id}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 sm:p-6 md:p-8 overflow-y-auto transition-all duration-300 animate-fadeIn">
      {/* Modal Card */}
      <div className="w-full max-w-4xl bg-[#fffdfa] rounded-[28px] border-2 border-gold-500/40 shadow-2xl overflow-hidden relative animate-scaleUp flex flex-col md:flex-row my-auto max-h-[85vh] border-amber-400/40">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-30 text-slate-500 hover:text-slate-800 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-lg transition-all border border-slate-200 cursor-pointer"
          title="Close / View later in Activity"
        >
          <FaTimes className="text-base" />
        </button>

        {/* LEFT: Photo & Quick Badges */}
        <div className="w-full md:w-1/2 relative bg-slate-900 min-h-[260px] md:min-h-full flex items-center justify-center overflow-hidden">
          {p.profilePhoto && p.profilePhoto !== '/uploads/default-avatar.png' && p.profilePhoto !== '/uploads/blurred-avatar.png' ? (
            <img 
              src={`${SOCKET_BASE_URL}${p.profilePhoto}`} 
              alt={p.name} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-[#e2e8f0] flex items-center justify-center">
              <DefaultAvatar gender={p.gender} className={`w-full h-full object-contain ${p.profilePhoto === '/uploads/blurred-avatar.png' ? 'blur-md opacity-70' : ''}`} />
            </div>
          )}

          {/* Top Royal Badge */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-crimson-950 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg border border-amber-300/40">
              <FaCrown className="text-sm text-crimson-950" /> Handpicked by Matchmaker
            </span>
          </div>

          {/* Bottom 24-Hour Expiry Timer Banner */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/95 via-slate-900/80 to-transparent p-5 pt-12 text-white z-20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-serif font-bold tracking-tight text-white flex items-center gap-2">
                  {p.name}
                  {p.user?.isManuallyVerified && <FaCheckCircle className="text-emerald-400 text-sm" />}
                </h3>
                <p className="text-xs text-amber-300 font-semibold mt-0.5">
                  {p.age} yrs • {p.sect || 'Muslim'} • {p.city || 'India'}
                </p>
              </div>

              {/* 24-Hour Timer Chip */}
              <div className="bg-crimson-950/90 border border-amber-400/40 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md">
                <FaClock className="text-amber-400 animate-pulse text-xs" />
                <span>{currentMatch.hoursLeft}h {currentMatch.minutesLeft}m left</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Matchmaker Note & Details */}
        <div className="w-full md:w-1/2 p-5 md:p-7 flex flex-col justify-between overflow-y-auto bg-gradient-to-b from-amber-50/30 to-white">
          
          <div className="space-y-5">
            {/* Header info */}
            <div>
              <span className="text-[11px] font-extrabold text-amber-700 tracking-wider uppercase bg-amber-100/80 border border-amber-300/60 px-3 py-1 rounded-md">
                24-Hour Exclusive Match
              </span>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-crimson-950 mt-2">
                Personalized Recommendation
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Our matchmaking team reviewed both of your profiles and suggested this alliance.
              </p>
            </div>

            {/* Matchmaker Note Box */}
            <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-2xl relative">
              <span className="text-xs font-black text-amber-800 uppercase tracking-wider block mb-1 flex items-center gap-1">
                👑 Matchmaker's Note:
              </span>
              <p className="text-xs md:text-sm text-slate-700 italic leading-relaxed">
                "{currentMatch.message}"
              </p>
            </div>

            {/* Quick Profile Highlights */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-2.5">
                <FaBriefcase className="text-amber-600 text-sm flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Profession</span>
                  <span className="text-slate-800 font-bold truncate block">{p.profession || 'Not Specified'}</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-2.5">
                <FaGraduationCap className="text-amber-600 text-sm flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Education</span>
                  <span className="text-slate-800 font-bold truncate block">{p.education || 'Graduate'}</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-2.5">
                <FaMapMarkerAlt className="text-amber-600 text-sm flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Location</span>
                  <span className="text-slate-800 font-bold truncate block">{p.city || 'India'}, {p.state || ''}</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-2.5">
                <FaCrown className="text-amber-600 text-sm flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Sect / Marital</span>
                  <span className="text-slate-800 font-bold truncate block">{p.sect || 'Sunni'} • {p.maritalStatus || 'Never Married'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-200/80 mt-6 space-y-2.5">
            {currentMatch.isInterestSent ? (
              <div className="w-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold py-3 rounded-xl text-xs text-center flex items-center justify-center gap-2 shadow-sm">
                <FaCheckCircle className="text-sm" /> Interest Already Sent!
              </div>
            ) : (
              <button
                onClick={handleInterestClick}
                disabled={loadingInterest}
                className="w-full bg-gradient-to-r from-crimson-900 to-crimson-950 hover:from-crimson-800 hover:to-crimson-900 text-amber-300 font-extrabold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
              >
                {loadingInterest ? (
                  <span className="w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <FaHeart className="text-rose-400" /> Send Interest Now
                  </>
                )}
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={handleViewProfile}
                className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm"
              >
                👁️ View Full Biodata
              </button>

              <button
                onClick={handleSkipClick}
                className="px-4 py-2.5 text-xs text-slate-500 hover:text-slate-800 font-bold rounded-xl transition-all"
              >
                {isLast ? 'View in Activity' : 'Next Match ➔'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default HandpickedMatchModal;
