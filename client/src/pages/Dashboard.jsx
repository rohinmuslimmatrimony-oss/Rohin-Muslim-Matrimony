import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  FaBriefcase, FaPhoneAlt, FaUserFriends, FaCheckCircle, 
  FaTimes, FaGraduationCap, FaSave, FaUserShield 
} from 'react-icons/fa';
import SimpleSpinner from '../components/SimpleSpinner';
import MobileMatchesFeed from '../components/MobileMatchesFeed';
import SupportContactCard from '../components/SupportContactCard';
import DesktopDailyRecommendationsModal from '../components/DesktopDailyRecommendationsModal';

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



const Dashboard = () => {
  const { user, profile, refreshUser, getCompleteness } = useContext(AuthContext);
  const navigate = useNavigate();

  // Modal States
  const [showWaliModal, setShowWaliModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showCareerModal, setShowCareerModal] = useState(false);

  // Form States for Modals
  const [waliContact, setWaliContact] = useState('');
  const [familyData, setFamilyData] = useState({
    fatherOccupation: '',
    motherOccupation: '',
    siblingsCount: 0
  });
  const [careerData, setCareerData] = useState({
    profession: '',
    education: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Daily Recommendations States
  const [dailyProfiles, setDailyProfiles] = useState([]);
  const [currentDailyIdx, setCurrentDailyIdx] = useState(0);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [sentRequests, setSentRequests] = useState([]);
  const recordedViewsRef = React.useRef(new Set());

  // Fetch daily recommendations
  const fetchDailyRecommendations = async () => {
    try {
      setLoadingDaily(true);
      const res = await api.get('/profiles/daily-recommendations');
      if (res.data.success) {
        // Filter out profiles already viewed today (localStorage check)
        const viewedIds = user?._id ? getDailyViewedIds(user._id) : [];
        const filtered = res.data.data.filter(p => {
          const pUserId = p.user?._id || p.user;
          return !viewedIds.includes(pUserId);
        });
        setDailyProfiles(filtered);
        
        setCurrentDailyIdx(0);
        if (filtered.length === 0 && res.data.data.length > 0) {
          // All already viewed today — jump to batch complete
          setCurrentDailyIdx(res.data.data.length);
          setDailyProfiles(res.data.data);
        }

        // Auto open logic on load (once per tab session)
        const hasAutoOpened = sessionStorage.getItem('daily_recs_auto_opened');
        if (!hasAutoOpened && filtered.length > 0) {
          setTimeout(() => {
            setShowDailyModal(true);
            sessionStorage.setItem('daily_recs_auto_opened', 'true');
          }, 800);
        }
      }
    } catch (error) {
      console.error('Failed to fetch daily recommendations:', error);
    } finally {
      setLoadingDaily(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const res = await api.get('/requests');
      if (res.data.success) {
        setSentRequests((res.data.sent || []).map(r => r.receiver?._id || r.receiver));
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  useEffect(() => {
    if (typeof refreshUser === 'function') {
      refreshUser();
    }
  }, []);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      fetchDailyRecommendations();
      fetchMyRequests();
    }
  }, [user?._id]);

  const recordDailyView = (profileUserId) => {
    if (!profileUserId || recordedViewsRef.current.has(profileUserId)) return;
    recordedViewsRef.current.add(profileUserId);
    if (user?._id) addDailyViewedId(user._id, profileUserId);
    api.post(`/profiles/daily-recommendations/view/${profileUserId}`)
      .then(() => {
        if (typeof refreshUser === 'function') refreshUser();
      })
      .catch(console.error);
  };

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
        setTimeout(() => {
          setCurrentDailyIdx(prev => prev + 1);
        }, 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send interest');
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  // Load profile values into modal inputs when profile loads
  useEffect(() => {
    if (profile) {
      setWaliContact(profile.waliContact || '');
      setFamilyData({
        fatherOccupation: profile.familyDetails?.fatherOccupation || '',
        motherOccupation: profile.familyDetails?.motherOccupation || '',
        siblingsCount: profile.familyDetails?.siblingsCount || 0
      });
      setCareerData({
        profession: profile.profession || '',
        education: profile.education || ''
      });
    }
  }, [profile]);

  if (!user || !profile) return <SimpleSpinner />;

  const { score: completeness, missingFields } = getCompleteness();

  // Helper to submit profile updates using FormData
  const handleUpdate = async (fieldsToUpdate) => {
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(fieldsToUpdate).forEach(key => {
        data.append(key, fieldsToUpdate[key]);
      });

      const res = await api.put('/profiles/my-profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Profile details updated successfully!');
        await refreshUser(); // Refresh Global state
        // Close all modals
        setShowWaliModal(false);
        setShowFamilyModal(false);
        setShowCareerModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* MOBILE VIEW (Matches Feed based on image -1) */}
      <div className="block md:hidden">
        <MobileMatchesFeed />
      </div>

      {/* DESKTOP VIEW (Standard Dashboard) */}
      <div className="hidden md:flex md:flex-col min-h-[calc(100vh-80px)] bg-cream-50 pt-4 pb-16 px-4 relative">
        {/* Background Decor */}
        <div className="absolute top-[0%] left-[0%] w-96 h-96 bg-crimson-900/5 rounded-full blur-[100px] -z-10"></div>
        <div className="absolute bottom-[0%] right-[0%] w-96 h-96 bg-gold-500/5 rounded-full blur-[100px] -z-10"></div>

        <div className="max-w-6xl mx-auto w-full relative z-10">
        
        {/* Welcome Header — unified single box */}
        <div className="w-full mb-4 md:mb-3 flex-shrink-0">
          <div className="rounded-xl p-[2px] bg-gradient-to-r from-[#d4af37] via-[#b21c2c] to-[#4f080e] shadow-2xl">
            <div className="bg-[#4f080e] rounded-[10px] relative overflow-hidden">
              {/* Ambient blobs */}
              <div className="absolute top-[-40%] left-[-5%] w-72 h-72 bg-gold-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="absolute bottom-[-40%] right-[-5%] w-72 h-72 bg-crimson-600/15 rounded-full blur-[80px] pointer-events-none"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-center md:items-stretch justify-between gap-4 px-6 py-4">
                {/* LEFT: Greeting */}
                <div className="flex flex-col justify-center flex-1">
                  <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#f5d97a] mb-0.5 drop-shadow-sm">Assalamu Alaikum, {profile.name}</h1>
                  <p className="text-slate-300 font-medium text-sm">Welcome to your Rohin Muslim Matrimony dashboard.</p>
                  {user.plan === 'free' && (
                    <button onClick={() => navigate('/plans')} className="mt-2 bg-gold-gradient text-crimson-950 px-5 py-1.5 rounded-lg font-bold shadow-lg hover:scale-105 transition-all text-xs w-max uppercase tracking-wider">
                      Upgrade Plan
                    </button>
                  )}
                </div>

                {/* DIVIDER */}
                <div className="hidden md:block w-px bg-gold-500/30 self-stretch mx-2"></div>

                {/* RIGHT: Begin Your Search */}
                 <div className="flex flex-col justify-center items-start md:items-end gap-2 flex-shrink-0 md:w-[320px]">
                   <div className="text-right w-full md:pr-2">
                     <h2 className="text-base md:text-lg font-serif text-gold-300 font-bold leading-none mb-1">Begin Your Search 🔍</h2>
                     <p className="text-slate-400 text-xs font-medium leading-tight">Find matches based on your preferences.</p>
                   </div>
                   <div className="flex gap-2.5 w-full justify-end">
                     <button
                       onClick={() => navigate('/search')}
                       className="relative overflow-hidden bg-gold-gradient hover:brightness-110 text-[#4f080e] border border-[#b28e28]/50 px-4 py-2 rounded-lg font-serif font-extrabold text-xs shadow-[0_0_18px_rgba(212,175,55,0.25)] hover:shadow-[0_0_25px_rgba(212,175,55,0.45)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 cursor-pointer flex-1 flex items-center justify-center gap-1.5"
                     >
                       <span className="relative z-10">Search Matches</span>
                     </button>
                     {user.role !== 'admin' && (
                       <button
                         onClick={() => setShowDailyModal(true)}
                         className="relative overflow-hidden bg-gradient-to-r from-[#e61a52] to-red-650 hover:brightness-110 text-white border border-red-700/30 px-4 py-2 rounded-lg font-serif font-extrabold text-xs shadow-[0_0_18px_rgba(230,26,82,0.25)] hover:shadow-[0_0_25px_rgba(230,26,82,0.45)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 cursor-pointer flex-1 flex items-center justify-center gap-1.5"
                       >
                         {/* Shimmer Effect */}
                         <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></span>
                         <span className="relative z-10 whitespace-nowrap">Daily Matches</span>
                         {(() => {
                           const viewedIds = user?._id ? getDailyViewedIds(user._id) : [];
                           const unswipedCount = Math.max(0, dailyProfiles.filter(p => !viewedIds.includes(p.user?._id || p.user)).length);
                           return unswipedCount > 0 ? (
                             <span className="bg-yellow-400 text-red-950 font-sans font-bold text-[9px] px-1.5 py-0.5 rounded-full animate-bounce flex items-center justify-center min-w-[15px] h-[15px] shadow-sm">
                               {unswipedCount}
                             </span>
                           ) : null;
                         })()}
                       </button>
                     )}
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* PROFILE COMPLETION BANNER */}
        {completeness < 100 && (
          <div 
            onClick={() => navigate('/edit-profile')}
            className="w-full mb-4 md:mb-3 rounded-lg p-0.5 bg-gradient-to-r from-gold-500/40 via-gold-400/20 to-gold-500/40 border border-gold-500/30 shadow-xl overflow-hidden cursor-pointer hover:scale-[1.01] hover:shadow-gold-500/20 transition-all duration-300"
          >
            <div className="bg-[#4f080e] rounded-lg p-4 md:py-3.5 md:px-6 text-white relative">
              <div className="absolute top-2 right-2 text-gold-500/20 text-xl">✨</div>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="text-center md:text-left space-y-1">
                  <span className="bg-gold-500/20 text-gold-400 text-[10px] font-extrabold uppercase tracking-widest px-3 py-0.5 rounded-full border border-gold-500/35">
                    Profile Status
                  </span>
                  <h2 className="text-lg md:text-xl font-serif font-bold">Complete your biodata to unlock better matches</h2>
                  <p className="text-slate-300 text-xs max-w-xl font-medium">
                    Detailed profiles get up to 5x more responses and faster mutual connections! Click here to update your profile.
                  </p>
                </div>
   
                <div className="w-full md:w-64 flex flex-col items-center md:items-end gap-1.5 flex-shrink-0">
                  <div className="flex justify-between w-full text-xs font-bold text-gold-400">
                    <span>COMPLETENESS</span>
                    <span>{completeness}%</span>
                  </div>
                  <div className="w-full bg-crimson-950 rounded-full h-3 overflow-hidden shadow-inner border border-gold-500/10">
                    <div 
                      className="bg-gold-gradient h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${completeness}%` }}
                    ></div>
                  </div>
                  {completeness === 100 ? (
                    <span className="text-emerald-400 text-xs font-extrabold flex items-center gap-1.5 mt-0.5">
                      <FaCheckCircle /> 100% Completed
                    </span>
                  ) : (
                    <span className="text-gold-400/80 text-xs font-semibold mt-0.5">
                      Complete all steps to get verified badge.
                    </span>
                  )}
                </div>
              </div>
              
              {missingFields && missingFields.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gold-500/20 text-left relative z-10">
                  <p className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-2">Remaining tasks to reach 100%:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-2.5">
                    {missingFields.map((field) => {
                      const isRequired = field.percentage > 0;
                      return (
                        <div 
                          key={field.name} 
                          className={`flex items-center justify-between rounded-lg px-3 py-2 transition-all duration-300 ${
                            isRequired 
                              ? 'bg-amber-950/60 border border-amber-500/45 shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:border-amber-400' 
                              : 'bg-crimson-950/30 border border-gold-500/10 opacity-75'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isRequired && (
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                            )}
                            <span className={`text-xs font-bold ${isRequired ? 'text-amber-100' : 'text-slate-300'}`}>
                              {field.name}
                            </span>
                          </div>
                          <span className={`text-xs font-black ${isRequired ? 'text-amber-400' : 'text-gold-500/60'}`}>
                            {isRequired ? `+${field.percentage}%` : 'Optional'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ONBOARDING QUICK CARDS (Conditional Rows) */}
        {completeness < 100 && (
          <div className="mb-6 md:mb-3 flex-shrink-0">
            <h2 className="text-lg font-serif font-bold text-[#4f080e] mb-3 flex items-center gap-2">
              💡 Quick Setup Tasks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card 1: Wali Details */}
              {(!profile.waliContact || profile.waliContact.trim() === '') && (
                <div className="unique-card-hybrid p-4 md:h-[185px] flex flex-col justify-between group hover:scale-[1.01] transition-all">
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-crimson-50 text-crimson-800 flex items-center justify-center mb-3 group-hover:bg-[#4f080e] group-hover:text-gold-400 transition-colors">
                      <FaPhoneAlt className="text-xs" />
                    </div>
                    <h3 className="text-[#4f080e] font-serif font-bold text-xs md:text-sm mb-1">Add Chaperone / Wali Contact</h3>
                    <span className="inline-block bg-slate-100 text-slate-600 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider mb-1">Optional</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold mb-3">
                      Build trust by adding your family chaperone contact.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowWaliModal(true)} 
                    className="relative z-10 bg-crimson-950 text-gold-400 px-4 py-2 rounded-lg text-[10px] font-bold shadow-md hover:bg-crimson-900 transition-all w-full uppercase tracking-wider"
                  >
                    Add Wali Details
                  </button>
                </div>
              )}

              {/* Card 2: Family Details */}
              {(!profile.familyDetails?.fatherOccupation || profile.familyDetails?.fatherOccupation.trim() === '') && (
                <div className="unique-card-hybrid p-4 md:h-[185px] flex flex-col justify-between group hover:scale-[1.01] transition-all">
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-crimson-50 text-crimson-800 flex items-center justify-center mb-3 group-hover:bg-[#4f080e] group-hover:text-gold-400 transition-colors">
                      <FaUserFriends className="text-xs" />
                    </div>
                    <h3 className="text-[#4f080e] font-serif font-bold text-xs md:text-sm mb-1">Add Family Background</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold mb-3">
                      Share details about parents' occupation and siblings to help matches learn about your household.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowFamilyModal(true)} 
                    className="relative z-10 bg-crimson-950 text-gold-400 px-4 py-2 rounded-lg text-[10px] font-bold shadow-md hover:bg-crimson-900 transition-all w-full uppercase tracking-wider"
                  >
                    Add Family details (+40%)
                  </button>
                </div>
              )}

              {/* Card 3: Career Details */}
              {(!profile.profession || profile.profession === 'Not Specified' ||
                !profile.education || profile.education === 'Not Specified') && (
                <div className="unique-card-hybrid p-4 md:h-[185px] flex flex-col justify-between group hover:scale-[1.01] transition-all">
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-crimson-50 text-crimson-800 flex items-center justify-center mb-3 group-hover:bg-[#4f080e] group-hover:text-gold-400 transition-colors">
                      <FaBriefcase className="text-xs" />
                    </div>
                    <h3 className="text-[#4f080e] font-serif font-bold text-xs md:text-sm mb-1">Update Career & Education</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold mb-3">
                      Matches value transparency! Change the default placeholders to your actual education and job.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowCareerModal(true)} 
                    className="relative z-10 bg-crimson-950 text-gold-400 px-4 py-2 rounded-lg text-[10px] font-bold shadow-md hover:bg-crimson-900 transition-all w-full uppercase tracking-wider"
                  >
                    Update Career (+40%)
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Existing System Cards (Plan, Views, Privacy) with Unique Gradient Borders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 md:mb-4 flex-shrink-0">
          {/* Plan Status Card */}
          <div className={`${user.plan === 'elite' ? 'unique-card-gold' : user.plan === 'premium' ? 'unique-card-crimson' : 'unique-card-hybrid'} p-4 md:py-3 md:px-4 md:h-[170px] flex flex-col justify-between overflow-hidden`}>
            <div className="relative">
              <h3 className="text-[#4f080e] text-sm font-bold uppercase tracking-wider mb-2">Current Membership</h3>
              <span className={`text-3xl md:text-4xl font-serif font-bold capitalize block mb-1 ${user.plan === 'elite' ? 'text-gold-600' : user.plan === 'premium' ? 'text-crimson-600' : 'text-crimson-950'}`}>
                {user.plan}
              </span>
              <p className="text-sm text-slate-500 leading-tight pr-2">
                {user.plan === 'free' ? 'Upgrade to connect with matches directly.' : 'Enjoying premium matchmaking benefits.'}
              </p>
            </div>
            <div className="flex items-center gap-3 relative z-10 mt-2">
              {user.plan !== 'elite' && (
                 <button onClick={() => navigate('/plans')} className="text-xs font-bold text-crimson-800 hover:text-gold-600 transition-colors">
                   Upgrade Options &rarr;
                 </button>
              )}
              <button onClick={() => navigate('/payment-info')} className="text-xs font-bold text-slate-600 hover:text-crimson-950 transition-colors border-l pl-3 border-slate-300">
                Payment Info 💳
              </button>
            </div>
          </div>
          {(() => {
            const quotaProfileViews = user?.quotaProfileViews ?? 0;
            const quotaInterests    = user?.quotaInterests ?? 0;
            const quotaContactViews = user?.quotaContactViews ?? 0;
            const isUnlimited = quotaProfileViews > 9000;
            const quotaExhausted = !isUnlimited && quotaProfileViews <= 0 && quotaInterests <= 0;

            return (
              <div className="unique-card-crimson p-4 md:py-3 md:px-4 md:h-[165px] flex flex-col justify-between">
                <div>
                  <h3 className="text-[#4f080e] text-sm font-bold uppercase tracking-wider mb-2">Plan Quota Remaining</h3>
                  {isUnlimited ? (
                    <p className="text-sm font-medium text-crimson-700 bg-crimson-50 px-2.5 py-1.5 rounded-md inline-block border border-crimson-200 w-full text-center">
                      ✨ Unlimited Access — Elite Plan
                    </p>
                  ) : quotaExhausted ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
                      <p className="text-red-700 font-bold text-xs">🔴 Quota Exhausted!</p>
                      <p className="text-red-500 text-[10px] mt-0.5">Renew your plan to continue.</p>
                      <button onClick={() => navigate('/plans')} className="mt-1.5 bg-crimson-700 hover:bg-crimson-800 text-white text-[10px] font-bold px-3 py-1 rounded-md transition-colors uppercase tracking-wider">
                        Renew Plan →
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-semibold">👁️ Profile Views</span>
                        <span className="font-bold text-crimson-800">{quotaProfileViews} left</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-crimson-600 to-gold-400 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((quotaProfileViews / Math.max(quotaProfileViews + 1, 10)) * 100, 100)}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-xs mt-0.5">
                        <span className="text-slate-600 font-semibold">💌 Interests</span>
                        <span className="font-bold text-crimson-800">{quotaInterests} left</span>
                      </div>
                      {user?.plan !== 'free' && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-semibold">📞 Contact Views</span>
                          <span className="font-bold text-crimson-800">{quotaContactViews} left</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {!isUnlimited && !quotaExhausted && (
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Quota resets on plan renewal.</p>
                )}
              </div>
            );
          })()}
          
          {/* Profile Status Card */}
          <div className="unique-card-hybrid p-4 md:py-3 md:px-4 md:h-[165px] flex flex-col justify-between">
             <h3 className="text-[#4f080e] text-sm font-bold uppercase tracking-wider mb-2">Privacy &amp; Status</h3>
             <div className="flex flex-col gap-2">
               <div className="flex items-center gap-3 bg-white/60 p-2.5 rounded-lg border border-slate-100">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base ${profile.isPhotoPublic ? 'bg-crimson-100 text-crimson-600' : 'bg-slate-200 text-slate-500'}`}>
                   {profile.isPhotoPublic ? '👁️' : '🔒'}
                 </div>
                 <div className="flex flex-col">
                   <span className="text-sm font-bold text-slate-800 leading-none">Photo Visibility</span>
                   <span className="text-xs text-slate-500 mt-0.5">{profile.isPhotoPublic ? 'Visible to public' : 'Blurred / Private'}</span>
                 </div>
               </div>
               
               <button onClick={() => navigate('/privacy-settings')} className="relative z-10 w-full py-2 border-2 border-crimson-900 text-crimson-950 rounded-lg text-sm font-bold hover:bg-crimson-50 transition-colors">
                 Manage Privacy Settings
               </button>
             </div>
          </div>
        </div>
        {/* Customer Support & Verification Section */}
        <div className="mb-6 md:mb-3 flex-shrink-0">
          <h2 className="text-lg md:text-xl font-serif font-bold text-[#4f080e] mb-3 flex items-center gap-2">
            🤝 Customer Support & Verification
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 md:col-span-2">
              <SupportContactCard plan={user.plan} />
            </div>
            <div className="unique-card-hybrid p-5 md:h-[200px] flex flex-col justify-between">
              <div>
                <h3 className="font-serif font-bold text-[#4f080e] text-base md:text-lg mb-2 flex items-center gap-1.5">
                  🛡️ Verify Your Profile
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Add a government-issued ID proof to get a green verified badge on your profile and build instant trust with other families.
                </p>
              </div>
              <button 
                onClick={() => navigate('/verify-identity')}
                className={`relative z-10 mt-2 w-full py-2.5 rounded-lg text-sm font-bold transition-all uppercase tracking-wider ${
                  user.isManuallyVerified
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 cursor-default'
                    : 'bg-crimson-950 hover:bg-crimson-900 text-gold-400 shadow-md'
                }`}
                disabled={user.isManuallyVerified}
              >
                {user.isManuallyVerified ? '✓ Identity Verified' : 'Verify Identity Now'}
              </button>
            </div>
          </div>
        </div>


        {/* MODAL 1: WALI CONTACT */}
        {showWaliModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-lg border border-gold-500/20 shadow-2xl p-6 relative animate-scaleUp">
              <button onClick={() => setShowWaliModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                <FaTimes />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-crimson-50 rounded-lg flex items-center justify-center text-crimson-900 mx-auto mb-3">
                  <FaPhoneAlt />
                </div>
                <h3 className="text-xl font-serif font-bold text-crimson-950">Add Chaperone / Wali</h3>
                <p className="text-xs text-slate-500 mt-1">Provide a valid contact number for family matching.</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleUpdate({ waliContact }); }} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Wali Mobile Number</label>
                  <input 
                    type="text" 
                    required 
                    value={waliContact} 
                    onChange={(e) => setWaliContact(e.target.value)} 
                    placeholder="e.g. +91 98765 43210" 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-gold-500 focus:outline-none text-sm font-semibold text-slate-800" 
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gold-gradient text-crimson-950 font-extrabold py-2.5 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-crimson-950 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <FaSave /> Save Chaperone Details
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: FAMILY BACKGROUND */}
        {showFamilyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-lg border border-gold-500/20 shadow-2xl p-6 relative animate-scaleUp">
              <button onClick={() => setShowFamilyModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                <FaTimes />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-crimson-50 rounded-lg flex items-center justify-center text-crimson-900 mx-auto mb-3">
                  <FaUserFriends />
                </div>
                <h3 className="text-xl font-serif font-bold text-crimson-950">Add Family Details</h3>
                <p className="text-xs text-slate-500 mt-1">Briefly tell matches about your family background.</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleUpdate(familyData); }} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Father's Occupation</label>
                  <input 
                    type="text" 
                    required 
                    value={familyData.fatherOccupation} 
                    onChange={(e) => setFamilyData({ ...familyData, fatherOccupation: e.target.value })} 
                    placeholder="e.g. Retired Govt Employee, Businessman" 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-gold-500 focus:outline-none text-sm font-semibold text-slate-800" 
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Mother's Occupation</label>
                  <input 
                    type="text" 
                    required 
                    value={familyData.motherOccupation} 
                    onChange={(e) => setFamilyData({ ...familyData, motherOccupation: e.target.value })} 
                    placeholder="e.g. Homemaker, Teacher" 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-gold-500 focus:outline-none text-sm font-semibold text-slate-800" 
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Number of Siblings</label>
                  <input 
                    type="number" 
                    min={0} 
                    required 
                    value={familyData.siblingsCount} 
                    onChange={(e) => setFamilyData({ ...familyData, siblingsCount: parseInt(e.target.value) || 0 })} 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-gold-500 focus:outline-none text-sm font-semibold text-slate-800" 
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gold-gradient text-crimson-950 font-extrabold py-2.5 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-crimson-950 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <FaSave /> Save Family Details
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: CAREER & EDUCATION */}
        {showCareerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-lg border border-gold-500/20 shadow-2xl p-6 relative animate-scaleUp">
              <button onClick={() => setShowCareerModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                <FaTimes />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-crimson-50 rounded-lg flex items-center justify-center text-crimson-900 mx-auto mb-3">
                  <FaBriefcase />
                </div>
                <h3 className="text-xl font-serif font-bold text-crimson-950">Update Career & Education</h3>
                <p className="text-xs text-slate-500 mt-1">Let matches know your academic and work profile.</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleUpdate(careerData); }} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Education / Degree</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FaGraduationCap /></span>
                    <input 
                      type="text" 
                      required 
                      value={careerData.education} 
                      onChange={(e) => setCareerData({ ...careerData, education: e.target.value })} 
                      placeholder="e.g. B.Tech / MBA / MBBS" 
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-gold-500 focus:outline-none text-sm font-semibold text-slate-800" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Profession / Occupation</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FaBriefcase /></span>
                    <input 
                      type="text" 
                      required 
                      value={careerData.profession} 
                      onChange={(e) => setCareerData({ ...careerData, profession: e.target.value })} 
                      placeholder="e.g. Software Engineer / Doctor" 
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-gold-500 focus:outline-none text-sm font-semibold text-slate-800" 
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gold-gradient text-crimson-950 font-extrabold py-2.5 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-crimson-950 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <FaSave /> Update Career Info
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: DESKTOP DAILY RECOMMENDATIONS */}
        <DesktopDailyRecommendationsModal
          show={showDailyModal}
          onClose={() => setShowDailyModal(false)}
          dailyProfiles={dailyProfiles}
          currentDailyIdx={currentDailyIdx}
          onSkip={handleSkipDaily}
          onInterest={handleInterestDaily}
          sentRequests={sentRequests}
          user={user}
          profile={profile}
          getCompleteness={getCompleteness}
        />

        </div>
      </div>
    </>

  );
};

export default Dashboard;
