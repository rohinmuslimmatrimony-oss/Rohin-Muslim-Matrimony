import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api, { SOCKET_BASE_URL } from '../services/api';
import toast from 'react-hot-toast';
import { FaSearch, FaBookmark, FaComment, FaHeart, FaCrown, FaCheckCircle, FaLock } from 'react-icons/fa';
import SimpleSpinner from './SimpleSpinner';
import { useNavigate } from 'react-router-dom';
import DefaultAvatar from './DefaultAvatar';

// Helper: get today's localStorage key for daily viewed profiles
const getDailyViewedKey = (userId) => {
  const today = new Date().toISOString().slice(0, 10); // e.g. "2026-06-09"
  return `daily_viewed_${userId}_${today}`;
};

const getDailyViewedIds = (userId) => {
  try {
    const raw = localStorage.getItem(getDailyViewedKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const addDailyViewedId = (userId, profileUserId) => {
  try {
    const key = getDailyViewedKey(userId);
    const existing = getDailyViewedIds(userId);
    if (!existing.includes(profileUserId)) {
      existing.push(profileUserId);
      localStorage.setItem(key, JSON.stringify(existing));
    }
  } catch {}
};

const MobileMatchesFeed = () => {
  const { user, profile, getCompleteness } = useContext(AuthContext);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Matches'); // 'Matches', 'Daily', or 'Online'

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [confirmCancelProfileId, setConfirmCancelProfileId] = useState(null);
  const navigate = useNavigate();

  // Daily Recommendations State
  const [dailyProfiles, setDailyProfiles] = useState([]);
  const [currentDailyIdx, setCurrentDailyIdx] = useState(0);
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [isBatchComplete, setIsBatchComplete] = useState(false);
  // Track which profiles were recorded as viewed in this session
  const recordedViewsRef = React.useRef(new Set());

  useEffect(() => {
    fetchProfiles();
    fetchMyRequests();
    fetchDailyRecommendations();
  }, [user?._id]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profiles', { params: { limit: 10, page: 1 } });
      if (res.data.success) {
        setProfiles(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const res = await api.get('/requests');
      if (res.data.success) {
        setSentRequests((res.data.sent || []).map(r => r.receiver?._id || r.receiver));
        setReceivedRequests((res.data.received || []).map(r => r.sender?._id || r.sender));
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  const fetchDailyRecommendations = async () => {
    try {
      setLoadingDaily(true);
      const res = await api.get('/profiles/daily-recommendations');
      if (res.data.success) {
        if (res.data.batchComplete || (res.data.data.length === 0 && res.data.totalBatchCount > 0)) {
          setDailyProfiles([]);
          setIsBatchComplete(true);
          setCurrentDailyIdx(0);
        } else {
          setDailyProfiles(res.data.data || []);
          setIsBatchComplete(false);
          setCurrentDailyIdx(0);
        }
      }
    } catch (error) {
      console.error('Failed to fetch daily recommendations:', error);
    } finally {
      setLoadingDaily(false);
    }
  };

  const handleAction = async (action, profileId) => {
    if (action === 'message') {
      navigate('/chat');
      return;
    }

    if (action === 'Interest') {
      if (user?.role !== 'admin') {
        const completeness = getCompleteness().score;
        if (completeness < 100) {
          toast.error('Please complete your profile details to 100% on the Dashboard before sending interest requests!', {
            duration: 5000,
            icon: '🔒',
          });
          return;
        }
      }

      try {
        const res = await api.post(`/requests/send/${profileId}`);
        if (res.data.success) {
          toast.success('Interest sent successfully!');
          setSentRequests(prev => [...prev, profileId]);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to send interest');
      }
      return;
    }

    if (action === 'Shortlist') {
      try {
        const res = await api.post(`/profiles/shortlist/${profileId}`);
        if (res.data.success) {
          toast.success(res.data.message);
          // Update the shortlisted status in the profiles list
          setProfiles(prevProfiles =>
            prevProfiles.map(p => {
              const pUserId = p.user?._id || p.user;
              if (pUserId === profileId) {
                const isShortlisted = p.shortlistedBy?.includes(user?._id);
                const updatedShortlistedBy = isShortlisted
                  ? p.shortlistedBy.filter(uid => uid !== user?._id)
                  : [...(p.shortlistedBy || []), user?._id];
                return { ...p, shortlistedBy: updatedShortlistedBy };
              }
              return p;
            })
          );
        }
      } catch (error) {
        if (error.response?.status === 403 && error.response?.data?.message?.includes('upgrade')) {
          toast.error(
            <div className="flex items-center justify-between gap-2.5">
              <span>{error.response.data.message}</span>
              <button 
                onClick={() => navigate('/plans')}
                className="bg-gold-gradient text-crimson-950 text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow hover:scale-105 transition-all whitespace-nowrap"
              >
                Upgrade
              </button>
            </div>,
            { duration: 6000 }
          );
        } else {
          toast.error(error.response?.data?.message || 'Action failed');
        }
      }
      return;
    }
  };

  const handleCancelInterest = async (profileId) => {
    try {
      const res = await api.delete(`/requests/cancel/${profileId}`);
      if (res.data.success) {
        toast.success('Interest request withdrawn successfully.');
        setSentRequests(prev => prev.filter(id => id !== profileId));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to withdraw interest');
    }
  };

  // Record a daily rec view to both localStorage and DB (idempotent)
  const recordDailyView = (profileUserId) => {
    if (!profileUserId || recordedViewsRef.current.has(profileUserId)) return;
    recordedViewsRef.current.add(profileUserId);
    // Save to localStorage immediately so refresh/remount knows
    if (user?._id) addDailyViewedId(user._id, profileUserId);
    // Also persist to DB in background
    api.post(`/profiles/daily-recommendations/view/${profileUserId}`).catch(console.error);
  };

  // Daily swipe controls
  const handleSkipDaily = (profileId) => {
    recordDailyView(profileId);
    setCurrentDailyIdx(prev => prev + 1);
  };

  const handleInterestDaily = async (profileId) => {
    if (user?.role !== 'admin') {
      const completeness = getCompleteness().score;
      if (completeness < 100) {
        toast.error('Please complete your profile details to 100% on the Dashboard before sending interest requests!', {
          duration: 5000,
          icon: '🔒',
        });
        return;
      }
    }

    try {
      const res = await api.post(`/requests/send/${profileId}`);
      if (res.data.success) {
        toast.success('Interest sent successfully!');
        setSentRequests(prev => [...prev, profileId]);
        recordDailyView(profileId);
        // Auto-advance after a brief delay
        setTimeout(() => {
          setCurrentDailyIdx(prev => prev + 1);
        }, 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send interest');
    }
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#faf8f5] pb-24 font-outfit">
      {/* Category Tabs / Pills Navigation (Fixed right under Navbar) */}
      <div className="sticky top-16 z-40 bg-white shadow-sm border-b border-slate-200/80 flex items-center justify-start gap-2 py-3 px-4 overflow-x-auto">
        <button 
          onClick={() => navigate('/search')} 
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shrink-0 shadow-2xs"
        >
          <FaSearch className="text-[11px] text-slate-500" /> Search
        </button>
        <button 
          onClick={() => setActiveTab('Matches')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'Matches' ? 'bg-[#e61a52] text-white shadow-md' : 'bg-transparent text-slate-600 hover:bg-slate-100'
          }`}
        >
          Matches
        </button>
        <button 
          onClick={() => setActiveTab('Daily')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'Daily' ? 'bg-[#e61a52] text-white shadow-md' : 'bg-transparent text-slate-600 hover:bg-slate-100'
          }`}
        >
          Daily Recommendations
        </button>
        <button 
          onClick={() => setActiveTab('Online')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'Online' ? 'bg-[#e61a52] text-white shadow-md' : 'bg-transparent text-slate-600 hover:bg-slate-100'
          }`}
        >
          Online
        </button>
      </div>

      {/* Profile Feed & Views */}
      <div className="flex-1 px-4 mt-4 space-y-6">
        
        {/* DAILY RECOMMENDATIONS TAB VIEW */}
        {activeTab === 'Daily' && (
          <div className="w-full max-w-md mx-auto">
            {loadingDaily ? (
              <SimpleSpinner />
            ) : dailyProfiles.length === 0 ? (
              <div className="text-center p-8 bg-white border border-slate-200/60 rounded-3xl mt-10 shadow-sm flex flex-col items-center justify-center min-h-[30vh]">
                <span className="text-3xl mb-3">✨</span>
                <h3 className="text-base font-bold text-slate-800 mb-1.5">No recommendations found</h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Try updating your partner preferences in Edit Profile to get matches that match your preferences!
                </p>
              </div>
            ) : currentDailyIdx >= dailyProfiles.length ? (
              <div className="text-center p-8 bg-white border border-slate-200/60 rounded-3xl mt-10 shadow-sm flex flex-col items-center justify-center min-h-[35vh]">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 text-3xl mb-4 shadow-inner">
                  🎉
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1.5">Daily Batch Complete</h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Mashallah! You have swiped/viewed all of your recommended profiles for today. Check back tomorrow for a fresh batch!
                </p>
              </div>
            ) : (
              (() => {
                const p = dailyProfiles[currentDailyIdx];
                const userPhoto = profile?.profilePhoto && profile.profilePhoto !== '/uploads/default-avatar.png'
                  ? `${SOCKET_BASE_URL}${profile.profilePhoto}`
                  : null;

                return (
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-md border-t-4 border-t-[#e61a52]">
                    
                    {/* Header: batch details */}
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-extrabold text-[#e61a52] uppercase tracking-wider">
                        Daily Recommendation ({currentDailyIdx + 1}/{dailyProfiles.length})
                      </span>
                    </div>

                    {/* Main Image Banner with gradient overlay */}
                    <div className="w-full h-56 relative rounded-2xl overflow-hidden shadow-inner bg-slate-900 mb-5">
                      {p.profilePhoto && p.profilePhoto !== '/uploads/default-avatar.png' && p.profilePhoto !== '/uploads/blurred-avatar.png' ? (
                        <img 
                          src={`${SOCKET_BASE_URL}${p.profilePhoto}`}
                          alt={p.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full relative bg-[#e2e8f0]">
                          <DefaultAvatar gender={p.gender} className={`w-full h-full object-contain bg-[#e2e8f0] ${p.profilePhoto === '/uploads/blurred-avatar.png' ? 'blur-md opacity-70' : ''}`} />
                          {p.profilePhoto === '/uploads/blurred-avatar.png' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/10">
                               <div className="bg-black/40 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center shadow-lg border border-white/10">
                                 <FaLock className="text-lg text-white/90 drop-shadow-md" />
                               </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>
                      
                      {/* Badge and basic overlay text */}
                      <div className="absolute bottom-3 left-4 right-4 text-left">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-xl font-bold text-white tracking-wide">
                            {p.name}, {p.age}
                          </h3>
                          {p.user?.isManuallyVerified && (
                            <FaCheckCircle className="text-[#3b82f6] text-sm" />
                          )}
                        </div>
                        <p className="text-[11px] text-white/90 font-medium">
                          {p.profession || 'Student'} • {p.city} • {p.sect}
                        </p>
                      </div>
                    </div>

                    {/* Compatibility Visualizer */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/40 shadow-inner mb-5">
                      <div className="flex items-center justify-center gap-6 relative">
                        {/* User avatar */}
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full border-2 border-gold-500 overflow-hidden shadow bg-white">
                            {userPhoto ? (
                              <img src={userPhoto} alt="You" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-slate-100 text-xs">YOU</div>
                            )}
                          </div>
                        </div>
                        
                        {/* Match score visual */}
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-[#e61a52] text-lg animate-pulse">❤️</span>
                          <span className="text-[9px] font-black text-white mt-1 bg-gradient-to-r from-[#e61a52] to-red-500 rounded-full px-2.5 py-0.5 whitespace-nowrap shadow-sm">
                            {p.matchScore}/5 MATCH
                          </span>
                        </div>
                        
                        {/* Candidate avatar */}
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full border-2 border-gold-500 overflow-hidden shadow bg-white relative">
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
                      <p className="text-center text-[10.5px] font-bold text-slate-500 mt-2.5 leading-relaxed">
                        Matches {p.matchScore} of your partner preferences & cultural traits
                      </p>
                    </div>

                    {/* Checklist comparisons */}
                    <div className="space-y-2.5">
                      <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-left pl-0.5">Matching Details</h4>
                      {p.matchDetails && Object.keys(p.matchDetails).map((key) => {
                        const detail = p.matchDetails[key];
                        return (
                          <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/50">
                            <div className="flex flex-col text-left">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-none">{detail.label}</span>
                              <span className="text-xs font-bold text-slate-750 mt-1">{detail.value}</span>
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

                    {/* Action Swipe Buttons */}
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <button 
                        onClick={() => handleSkipDaily(p.user?._id || p.user)}
                        className="bg-white border border-slate-200 text-slate-600 font-extrabold py-3 rounded-xl flex items-center justify-center gap-1 text-xs active:scale-95 transition-transform uppercase tracking-wider shadow-sm"
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
                          onClick={() => handleInterestDaily(p.user?._id || p.user)}
                          className="bg-[#e61a52] text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-1 text-xs active:scale-95 transition-transform uppercase tracking-wider shadow-md shadow-red-500/10"
                        >
                          ❤️ Send Interest
                        </button>
                      )}
                    </div>

                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* MATCHES AND ONLINE FEEDS */}
        {activeTab !== 'Daily' && (
          loading ? (
            <SimpleSpinner />
          ) : profiles.length === 0 ? (
            <div className="text-center mt-10 text-slate-500 font-medium">No matches found.</div>
          ) : (
            profiles.map((p, idx) => {
              return (
                <div 
                  key={p._id} 
                  className="w-full h-[65vh] relative rounded-3xl overflow-hidden shadow-xl bg-slate-900 cursor-pointer"
                  onClick={() => navigate(`/profile/${p.user?._id || p.user}`)}
                >
                  {/* Background Image/Placeholder */}
                  <div className="absolute inset-0">
                    {p.profilePhoto && p.profilePhoto !== '/uploads/default-avatar.png' && p.profilePhoto !== '/uploads/blurred-avatar.png' ? (
                      <img 
                        src={`${SOCKET_BASE_URL}${p.profilePhoto}`}
                        alt={p.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full relative bg-[#e2e8f0]">
                        <DefaultAvatar gender={p.gender} className={`w-full h-full object-contain bg-[#e2e8f0] ${p.profilePhoto === '/uploads/blurred-avatar.png' ? 'blur-md opacity-70' : ''}`} />
                        {p.profilePhoto === '/uploads/blurred-avatar.png' && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                             <div className="bg-black/40 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center shadow-lg border border-white/10 mt-[-30px]">
                               <FaLock className="text-2xl text-white/90 drop-shadow-md" />
                             </div>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Dark Gradient Overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90"></div>
                  </div>
                  
                  {/* Image Gallery Icon (top right) */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <span className="text-white text-xs">📸</span>
                  </div>

                  {/* High Match Chances Badge (Mock) */}
                  {activeTab === 'Online' && (
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5">
                      <span className="text-white text-xs font-semibold tracking-wide flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                        High Match Chances
                      </span>
                    </div>
                  )}

                  {/* Profile Details */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 pt-12">
                    {activeTab === 'Online' && (
                       <div className="flex items-center gap-1.5 mb-1.5">
                         <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                         <span className="text-white font-bold text-[11px] uppercase tracking-wider">Online</span>
                       </div>
                    )}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-1.5">
                        {p.name}
                        {p.user?.isManuallyVerified && (
                          <FaCheckCircle className="text-[#3b82f6] text-lg drop-shadow-sm" title="Identity Verified" />
                        )}
                        <span className="font-light text-white/80">, {p.age}</span>
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
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
                    
                    <p className="text-white/85 text-xs mb-5 font-medium leading-relaxed tracking-wide">
                      {p.profession || 'Student'} • {p.city} • {p.sect}
                    </p>

                    {/* Action Buttons */}
                    {(() => {
                      const targetUserId = p.user?._id || p.user;
                      const isShortlisted = p.shortlistedBy?.includes(user?._id);
                      const isSent = sentRequests.includes(targetUserId);
                      const isReceived = receivedRequests.includes(targetUserId);

                      return (
                        <div className="flex items-center justify-between px-3 gap-4 pb-2">
                          <div 
                            className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform" 
                            onClick={(e) => { e.stopPropagation(); handleAction('Shortlist', targetUserId); }}
                          >
                            <button className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg border border-white/5 transition-all ${
                              isShortlisted ? 'bg-amber-500 shadow-amber-500/30' : 'bg-[#111111]'
                            }`}>
                              <FaBookmark className="text-sm" />
                            </button>
                            <span className="text-white text-[10px] font-semibold tracking-wider">
                              {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                            </span>
                          </div>

                          <div 
                            className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform" 
                            onClick={(e) => { e.stopPropagation(); handleAction('message', targetUserId); }}
                          >
                            <button className="w-14 h-14 rounded-full bg-[#5c7cfa] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                              <FaComment className="text-xl" />
                            </button>
                            <span className="text-white text-[10px] font-semibold tracking-wider">Message</span>
                          </div>

                          {confirmCancelProfileId === targetUserId ? (
                            <div className="flex flex-col items-center gap-1.5 bg-[#111111]/80 backdrop-blur-sm border border-red-500/30 rounded-2xl p-1.5 shadow-lg transition-all duration-300">
                              <span className="text-white text-[9px] font-bold tracking-tight">Withdraw?</span>
                              <div className="flex gap-1">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelInterest(targetUserId);
                                    setConfirmCancelProfileId(null);
                                  }}
                                  className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm cursor-pointer"
                                >
                                  Yes
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmCancelProfileId(null);
                                  }}
                                  className="bg-slate-600 hover:bg-slate-700 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full cursor-pointer"
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className={`flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform ${
                                isReceived ? 'opacity-80 pointer-events-none' : ''
                              }`} 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isSent) {
                                  setConfirmCancelProfileId(targetUserId);
                                } else if (!isReceived) {
                                  handleAction('Interest', targetUserId);
                                }
                              }}
                            >
                              <button className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
                                isSent 
                                  ? 'bg-slate-500 hover:bg-red-600 shadow-none' 
                                  : isReceived 
                                  ? 'bg-emerald-600 shadow-emerald-500/30' 
                                  : 'bg-[#fa5252] shadow-red-500/30'
                              }`}>
                                <FaHeart className="text-sm" />
                              </button>
                              <span className="text-white text-[10px] font-semibold tracking-wider">
                                {isSent ? 'Sent' : isReceived ? 'Received' : 'Interest'}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  );
};

export default MobileMatchesFeed;
