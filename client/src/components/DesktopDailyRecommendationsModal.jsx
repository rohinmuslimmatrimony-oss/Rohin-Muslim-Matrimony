import React, { useState } from 'react';
import { FaHeart, FaCrown, FaCheckCircle, FaLock, FaTimes } from 'react-icons/fa';
import { SOCKET_BASE_URL } from '../services/api';
import DefaultAvatar from './DefaultAvatar';

const DesktopDailyRecommendationsModal = ({
  show,
  onClose,
  dailyProfiles = [],
  currentDailyIdx = 0,
  onSkip,
  onInterest,
  sentRequests = [],
  user,
  profile,
  getCompleteness
}) => {
  const [loadingInterest, setLoadingInterest] = useState(false);

  if (!show) return null;

  const handleInterestClick = async (profileId) => {
    setLoadingInterest(true);
    try {
      await onInterest(profileId);
    } finally {
      setLoadingInterest(false);
    }
  };

  const isBatchComplete = currentDailyIdx >= dailyProfiles.length;
  const p = !isBatchComplete ? dailyProfiles[currentDailyIdx] : null;

  // Get user profile photo
  const userPhoto = profile?.profilePhoto && profile.profilePhoto !== '/uploads/default-avatar.png' && profile.profilePhoto !== '/uploads/blurred-avatar.png'
    ? `${SOCKET_BASE_URL}${profile.profilePhoto}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-md p-4 transition-all duration-300 animate-fadeIn">
      {/* Modal Wrapper */}
      <div className="w-full max-w-4xl bg-[#fffcf8] rounded-[28px] border border-gold-500/20 shadow-2xl overflow-hidden relative animate-scaleUp flex flex-col md:flex-row min-h-[520px] max-h-[85vh]">
        
        {/* Close Button (Global for Modal) */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-20 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all"
        >
          <FaTimes className="text-lg" />
        </button>

        {isBatchComplete ? (
          /* BATCH COMPLETE SCREEN */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white min-h-[500px]">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 text-4xl mb-5 shadow-inner">
              🎉
            </div>
            <h3 className="text-2xl font-serif font-bold text-slate-800 mb-2">Daily Batch Complete</h3>
            <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-6">
              Mashallah! You have viewed all of your recommended profiles for today. Check back tomorrow for a fresh batch of tailored matches!
            </p>
            <button 
              onClick={onClose}
              className="bg-crimson-950 text-gold-400 hover:bg-crimson-900 px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all uppercase tracking-wider"
            >
              Back to Dashboard
            </button>
          </div>
        ) : !p ? (
          /* NO RECOMMENDATIONS FOUND */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white min-h-[500px]">
            <span className="text-4xl mb-4">✨</span>
            <h3 className="text-xl font-serif font-bold text-slate-800 mb-2">No Recommendations Found</h3>
            <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-6">
              Update your partner preferences in Edit Profile to get personalized recommendations!
            </p>
            <button 
              onClick={onClose}
              className="bg-crimson-950 text-gold-400 hover:bg-crimson-900 px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all uppercase tracking-wider"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          /* RECOMMENDATION ACTIVE STATE */
          <>
            {/* LEFT SIDE: Image and Profile Overlay */}
            <div className="w-full md:w-1/2 relative bg-slate-900 min-h-[350px] md:min-h-0">
              {p.profilePhoto && p.profilePhoto !== '/uploads/default-avatar.png' && p.profilePhoto !== '/uploads/blurred-avatar.png' ? (
                <img 
                  src={`${SOCKET_BASE_URL}${p.profilePhoto}`}
                  alt={p.name} 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 w-full h-full bg-[#e2e8f0] flex items-center justify-center">
                  <DefaultAvatar gender={p.gender} className={`w-full h-full object-contain ${p.profilePhoto === '/uploads/blurred-avatar.png' ? 'blur-md opacity-70' : ''}`} />
                  {p.profilePhoto === '/uploads/blurred-avatar.png' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/10">
                       <div className="bg-black/40 backdrop-blur-sm rounded-full w-14 h-14 flex items-center justify-center shadow-lg border border-white/10">
                         <FaLock className="text-xl text-white/90" />
                       </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Bottom Gradient for Text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
              
              {/* Overlay Details */}
              <div className="absolute bottom-6 left-6 right-6 text-left">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="bg-crimson-900/90 text-gold-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-crimson-750/30">
                    Daily recommendation
                  </span>
                  {(p.user?.plan === 'premium' || p.user?.plan === 'elite') && (
                    <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm border ${
                      p.user.plan === 'elite'
                        ? 'bg-gradient-to-r from-[#d4af37] via-[#f3e3a3] to-[#b28e28] text-[#4f080e] border-[#b28e28]/50'
                        : 'bg-gradient-to-r from-[#10b981] via-[#6ee7b7] to-[#047857] text-white border-[#047857]/50'
                    }`}>
                      <FaCrown className={p.user.plan === 'elite' ? 'text-[#4f080e]' : 'text-white'} /> 
                      {p.user.plan === 'elite' ? 'ELITE' : 'PREMIUM'}
                    </span>
                  )}
                </div>
                
                <h3 className="text-3xl font-bold font-serif text-white tracking-wide flex items-center gap-2 mb-1">
                  {p.name}, {p.age}
                  {p.user?.isManuallyVerified && (
                    <FaCheckCircle className="text-[#3b82f6] text-xl drop-shadow-sm" title="Identity Verified" />
                  )}
                </h3>
                <p className="text-white/80 text-sm font-semibold tracking-wide">
                  {p.profession || 'Student'} • {p.city} • {p.sect}
                </p>
              </div>
            </div>

            {/* RIGHT SIDE: Compatibility & Checklist Details */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[85vh]">
              
              {/* Top Details & Header */}
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-extrabold text-[#e61a52] uppercase tracking-widest pl-0.5">
                    Recommendation {currentDailyIdx + 1} of {dailyProfiles.length}
                  </span>
                  <h4 className="text-xl font-serif font-bold text-slate-800 mt-1">Profile Compatibility</h4>
                </div>

                {/* Compatibility Visualizer */}
                <div className="bg-[#fcf7ef] rounded-2xl p-4 border border-gold-500/10 shadow-inner">
                  <div className="flex items-center justify-center gap-6">
                    {/* User Profile */}
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full border-2 border-gold-500 overflow-hidden shadow bg-white">
                        {userPhoto ? (
                          <img src={userPhoto} alt="You" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-slate-100 text-xs">YOU</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Match Score Indicator */}
                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="text-2xl text-[#e61a52] animate-pulse">❤️</span>
                      <span className="text-[10px] font-black text-white mt-1 bg-gradient-to-r from-[#e61a52] to-red-500 rounded-full px-3 py-1 whitespace-nowrap shadow-sm tracking-wide">
                        {p.matchScore}/5 MATCH
                      </span>
                    </div>
                    
                    {/* Candidate Profile */}
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full border-2 border-gold-500 overflow-hidden shadow bg-white relative">
                        {p.profilePhoto && p.profilePhoto !== '/uploads/default-avatar.png' && p.profilePhoto !== '/uploads/blurred-avatar.png' ? (
                          <img src={`${SOCKET_BASE_URL}${p.profilePhoto}`} alt="Partner" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-slate-100 text-xs uppercase">
                            {p.name[0]}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-xs font-semibold text-slate-500 mt-3.5 leading-relaxed">
                    Based on your partner preferences and cultural criteria
                  </p>
                </div>

                {/* Match checklist comparison */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block pl-0.5">Matching Traits</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {p.matchDetails && Object.keys(p.matchDetails).map((key) => {
                      const detail = p.matchDetails[key];
                      return (
                        <div key={key} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/50">
                          <div className="flex flex-col text-left">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-none">{detail.label}</span>
                            <span className="text-xs font-bold text-slate-700 mt-1 truncate max-w-[140px]">{detail.value}</span>
                          </div>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-inner ${
                            detail.matched ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'
                          }`}>
                            {detail.matched ? '✓' : '✕'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => onSkip(p.user?._id || p.user)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-extrabold py-3 rounded-xl flex items-center justify-center gap-1.5 text-xs active:scale-95 transition-all uppercase tracking-wider shadow-sm"
                >
                  ✕ Skip Match
                </button>
                
                {sentRequests.includes(p.user?._id || p.user) ? (
                  <button 
                    disabled
                    className="bg-slate-50 text-slate-400 border border-slate-200 font-extrabold py-3 rounded-xl flex items-center justify-center gap-1.5 text-xs cursor-default uppercase tracking-wider"
                  >
                    ✓ Interest Sent
                  </button>
                ) : (
                  <button 
                    onClick={() => handleInterestClick(p.user?._id || p.user)}
                    disabled={loadingInterest}
                    className="bg-gradient-to-r from-[#e61a52] to-red-600 hover:brightness-110 text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-1.5 text-xs active:scale-95 transition-all uppercase tracking-wider shadow-md shadow-red-500/10 disabled:opacity-75"
                  >
                    {loadingInterest ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>❤️ Send Interest</>
                    )}
                  </button>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DesktopDailyRecommendationsModal;
