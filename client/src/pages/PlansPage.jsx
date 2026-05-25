import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaCrown, FaStar, FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';

const PlansPage = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState({ premium: 999, elite: 1999 });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.success && res.data.data) {
          setPrices({ premium: res.data.data.premiumPrice, elite: res.data.data.elitePrice });
        }
      } catch (error) {
        console.error('Failed to load dynamic pricing');
      }
    };
    fetchSettings();
  }, []);

  const handleUpgrade = async (planName) => {
    if (!user) {
      toast.error('Please login to upgrade your plan');
      navigate('/login');
      return;
    }

    if (user.plan === planName) {
      toast.error(`You are already on the ${planName} plan!`);
      return;
    }

    setLoading(true);
    try {
      toast.loading(`Processing payment via ${import.meta.env.VITE_PAYMENT_MODE || 'Mock Gateway'}...`, { id: 'payment' });
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const res = await api.put('/auth/upgrade', { plan: planName });
      
      if (res.data.success) {
        toast.success(`Payment Successful! Upgraded to ${planName.toUpperCase()} plan.`, { id: 'payment' });
        await refreshUser();
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed', { id: 'payment' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen md:min-h-0 md:h-[calc(100vh-80px)] bg-gradient-to-b from-[#55080f] via-[#4f080e] to-[#2b0306] pt-20 pb-20 md:pt-6 md:pb-10 px-4 md:px-8 relative overflow-hidden flex flex-col justify-center">
      {/* Golden Glowing Halo Decor */}
      <div className="absolute top-[10%] left-[50%] -translate-x-1/2 w-full max-w-4xl h-[450px] bg-gradient-to-b from-gold-500/20 via-gold-600/5 to-transparent rounded-full blur-[120px] -z-10 animate-pulse-gold"></div>

      <div className="max-w-6xl mx-auto text-center mb-6 md:mb-4 relative z-10 flex-shrink-0">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gold-400 mb-3 md:mb-1">
          Choose Your Halal Journey
        </h1>
        <p className="text-rose-100/80 max-w-2xl mx-auto text-base md:text-sm">
          Unlock premium features to find your life partner faster. Your privacy is guaranteed with our state-of-the-art security features.
        </p>
      </div>

      <div className="max-w-6xl w-full mx-auto relative mt-4 md:mt-2 bg-[#faf6ee]/90 backdrop-blur-md rounded-lg p-6 md:p-8 border border-[#d4af37]/35 shadow-xl flex-grow-0">
        {/* Left Fanoos Lantern */}
        <div className="absolute top-[-40px] left-[-35px] hidden lg:block z-30 pointer-events-none">
          <svg width="60" height="150" viewBox="0 0 60 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_4px_8px_rgba(212,175,55,0.35)]">
            <line x1="30" y1="0" x2="30" y2="40" stroke="#d4af37" strokeWidth="2" strokeDasharray="3 3"/>
            <circle cx="30" cy="45" r="5" stroke="#d4af37" strokeWidth="2" fill="none"/>
            <path d="M20 55 C20 50, 40 50, 40 55 L45 65 L15 65 Z" fill="#d4af37"/>
            <path d="M15 65 L18 105 L42 105 L45 65 Z" fill="url(#lantern-grad-left)" stroke="#d4af37" strokeWidth="2"/>
            <path d="M30 75 C33 75, 35 78, 35 81 C35 84, 32 87, 30 87 C28 87, 27 86, 26 85 C29 85, 31 83, 31 81 C31 79, 29 77, 27 77 C28 76, 29 75, 30 75 Z" fill="#faf7c3"/>
            <path d="M18 105 L30 118 L42 105 Z" fill="#d4af37"/>
            <line x1="30" y1="118" x2="30" y2="135" stroke="#d4af37" strokeWidth="2"/>
            <circle cx="30" cy="138" r="3" fill="#d4af37"/>
            <defs>
              <linearGradient id="lantern-grad-left" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#b21c2c"/>
                <stop offset="100%" stopColor="#7a0e19"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Right Fanoos Lantern */}
        <div className="absolute top-[-40px] right-[-35px] hidden lg:block z-30 pointer-events-none">
          <svg width="60" height="150" viewBox="0 0 60 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_4px_8px_rgba(212,175,55,0.35)]">
            <line x1="30" y1="0" x2="30" y2="40" stroke="#d4af37" strokeWidth="2" strokeDasharray="3 3"/>
            <circle cx="30" cy="45" r="5" stroke="#d4af37" strokeWidth="2" fill="none"/>
            <path d="M20 55 C20 50, 40 50, 40 55 L45 65 L15 65 Z" fill="#d4af37"/>
            <path d="M15 65 L18 105 L42 105 L45 65 Z" fill="url(#lantern-grad-right)" stroke="#d4af37" strokeWidth="2"/>
            <path d="M30 75 C33 75, 35 78, 35 81 C35 84, 32 87, 30 87 C28 87, 27 86, 26 85 C29 85, 31 83, 31 81 C31 79, 29 77, 27 77 C28 76, 29 75, 30 75 Z" fill="#faf7c3"/>
            <path d="M18 105 L30 118 L42 105 Z" fill="#d4af37"/>
            <line x1="30" y1="118" x2="30" y2="135" stroke="#d4af37" strokeWidth="2"/>
            <circle cx="30" cy="138" r="3" fill="#d4af37"/>
            <defs>
              <linearGradient id="lantern-grad-right" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#b21c2c"/>
                <stop offset="100%" stopColor="#7a0e19"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-5 relative z-10 items-stretch">
          
          {/* FREE PLAN */}
          <div className="unique-card-hybrid bg-white p-6 md:py-3 md:px-4 flex flex-col hover:-translate-y-1 transition-all duration-300 md:h-[330px] justify-between relative pt-8 shadow-sm">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-slate-200 px-5 py-1.5 rounded-md text-slate-700 text-[10px] font-extrabold uppercase tracking-widest shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:scale-105 transition-transform duration-300 z-20">
              Basic
            </div>
            <div className="mb-2 md:mb-1">
              <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs md:text-sm mb-0.5">Free Tier</h3>
              <div className="flex items-end gap-1">
                <span className="text-2xl md:text-2xl font-serif font-extrabold text-[#4f080e]">Free</span>
              </div>
            </div>
            <DynamicFeatureList planKey="freePlanFeatures" theme="free" />
            {user?.plan === 'free' ? (
              <button 
                disabled
                className="relative z-10 w-full py-2.5 md:py-1.5 rounded-lg font-bold text-crimson-950 bg-crimson-900/10 transition-colors disabled:opacity-50 mt-4 md:mt-1 text-sm md:text-xs"
              >
                Current Plan
              </button>
            ) : (user?.plan === 'premium' || user?.plan === 'elite') ? (
              <div className="h-[44px] md:h-[32px] mt-4 md:mt-1"></div>
            ) : (
              <button 
                onClick={() => handleUpgrade('free')}
                disabled={loading}
                className="relative z-10 w-full py-2.5 md:py-1.5 rounded-lg font-bold text-crimson-900 bg-crimson-900/10 hover:bg-crimson-900/20 transition-colors disabled:opacity-50 mt-4 md:mt-1 text-sm md:text-xs"
              >
                Select Free
              </button>
            )}
          </div>

          {/* PREMIUM PLAN - CHERRY RED BACKGROUND */}
          <div className="unique-card-gold bg-gradient-to-b from-[#b21c2c] to-[#7a0e19] p-6 md:py-3 md:px-4 flex flex-col hover:-translate-y-1 transition-all duration-300 md:h-[330px] justify-between relative pt-8 shadow-xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#d4af37] via-[#f5ef92] to-[#b28e28] px-5 py-1.5 rounded-md text-crimson-950 text-[10px] font-extrabold uppercase tracking-widest shadow-[0_8px_20px_rgba(0,0,0,0.22)] hover:scale-105 transition-transform duration-300 z-20">
              Popular
            </div>
            <div className="mb-2 md:mb-1">
              <h3 className="text-gold-300 font-extrabold uppercase tracking-widest text-sm md:text-[15px] drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)] mb-0.5">Premium</h3>
              <div className="flex items-end gap-1 text-white">
                <span className="text-2xl md:text-xl font-serif font-extrabold text-white">₹{prices.premium}</span>
                <span className="text-rose-200/70 text-[10px] md:text-[11px] mb-0.5">/ month</span>
              </div>
            </div>
            <DynamicFeatureList planKey="premiumPlanFeatures" theme="premium" />
            {user?.plan === 'premium' ? (
              <button 
                disabled
                className="relative z-10 w-full py-2.5 md:py-1.5 rounded-lg font-bold bg-gold-gradient text-crimson-950 transition-all disabled:opacity-60 mt-4 md:mt-1 text-sm md:text-xs"
              >
                Current Plan
              </button>
            ) : user?.plan === 'elite' ? (
              <div className="h-[44px] md:h-[32px] mt-4 md:mt-1"></div>
            ) : (
              <button 
                onClick={() => handleUpgrade('premium')}
                disabled={loading}
                className="relative z-10 w-full py-2.5 md:py-1.5 rounded-lg font-bold bg-gold-gradient text-crimson-950 hover:shadow-gold-500/20 hover:scale-[1.01] transition-all disabled:opacity-50 mt-4 md:mt-1 text-sm md:text-xs"
              >
                Upgrade Premium
              </button>
            )}
          </div>

          {/* ELITE PLAN - GOLD BACKGROUND */}
          <div className="unique-card-crimson bg-gradient-to-b from-[#faf7c3] via-[#d4af37] to-[#aa841c] p-6 md:py-3 md:px-4 flex flex-col hover:-translate-y-1 transition-all duration-300 md:h-[330px] justify-between relative pt-8 shadow-xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#4f080e] to-[#250305] px-5 py-1.5 rounded-md text-gold-300 text-[10px] font-extrabold uppercase tracking-widest shadow-[0_8px_20px_rgba(0,0,0,0.22)] flex items-center gap-1.5 hover:scale-105 transition-transform duration-300 z-20">
              <FaCrown className="text-[10px] text-gold-400 animate-pulse" /> Best Value
            </div>
            <div className="mb-2 md:mb-1">
              <h3 className="text-[#4f080e] font-extrabold uppercase tracking-widest text-sm md:text-[15px] mb-0.5 flex items-center gap-1.5">
                <FaCrown className="text-xs" /> Elite
              </h3>
              <div className="flex items-end gap-1 text-[#4f080e]">
                <span className="text-2xl md:text-xl font-serif font-extrabold text-[#4f080e]">₹{prices.elite}</span>
                <span className="text-[#4f080e]/70 text-[10px] md:text-[11px] mb-0.5">/ month</span>
              </div>
            </div>
            <DynamicFeatureList planKey="elitePlanFeatures" theme="elite" />
            {user?.plan === 'elite' ? (
              <button 
                disabled
                className="relative z-10 w-full py-2.5 md:py-1.5 rounded-lg font-bold bg-gradient-to-r from-[#4f080e] to-[#250305] text-white transition-all disabled:opacity-60 mt-4 md:mt-1 text-sm md:text-xs"
              >
                Current Plan
              </button>
            ) : (
              <button 
                onClick={() => handleUpgrade('elite')}
                disabled={loading}
                className="relative z-10 w-full py-2.5 md:py-1.5 rounded-lg font-bold bg-gradient-to-r from-[#4f080e] to-[#250305] text-white hover:shadow-[#4f080e]/20 hover:scale-[1.01] transition-all disabled:opacity-50 mt-4 md:mt-1 text-sm md:text-xs"
              >
                Get Elite Access
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

// ─── Dynamic Feature List Component ──────────────────────────────────────────
const DynamicFeatureList = ({ planKey, theme }) => {
  const [features, setFeatures] = useState(null);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.success && res.data.data) {
          setFeatures(res.data.data[planKey]);
        }
      } catch (err) {
        const defaults = {
          freePlanFeatures:    { viewFullBio: false, viewContactDetails: false, chat: false, shortlist: false, dailyViewLimit: 5 },
          premiumPlanFeatures: { viewFullBio: true,  viewContactDetails: true,  chat: true,  shortlist: true,  dailyViewLimit: 30 },
          elitePlanFeatures:   { viewFullBio: true,  viewContactDetails: true,  chat: true,  shortlist: true,  dailyViewLimit: 99999 },
        };
        setFeatures(defaults[planKey]);
      }
    };
    fetchFeatures();
  }, [planKey]);

  let textBase = 'text-slate-700';
  let dimText = 'text-slate-400';
  let subText = 'text-slate-500';
  let tickClass = 'text-crimson-700';
  let lockClass = 'text-slate-300';

  if (theme === 'premium') {
    textBase = 'text-white/90';
    dimText = 'text-rose-200/50';
    subText = 'text-rose-200/70';
    tickClass = 'text-gold-400';
    lockClass = 'text-rose-950/60';
  } else if (theme === 'elite') {
    textBase = 'text-[#4f080e] font-semibold';
    dimText = 'text-[#4f080e]/50';
    subText = 'text-[#4f080e]/75';
    tickClass = 'text-[#4f080e]';
    lockClass = 'text-amber-950/30';
  }

  const FeatureRow = ({ enabled, label, subLabel }) => (
    <li className={`flex items-start gap-2 text-xs md:text-[13.5px] ${textBase}`}>
      {enabled ? (
        <FaCheckCircle className={`${tickClass} text-sm md:text-[15.5px] mt-0.5 fill-current flex-shrink-0`} />
      ) : (
        <FaShieldAlt className={`${lockClass} text-sm md:text-[15.5px] mt-0.5 fill-current flex-shrink-0`} />
      )}
      <span className={!enabled ? dimText : ''}>
        {label}
        {subLabel && (
          <span className={`block text-[9px] md:text-[11px] mt-0.5 ${subText}`}>{subLabel}</span>
        )}
      </span>
    </li>
  );

  // Loading skeleton
  if (!features) {
    return (
      <ul className="flex-1 space-y-2.5 md:space-y-0.5 animate-pulse">
        {[1,2,3,4,5,6,7].map(i => (
          <li key={i} className="h-5 bg-slate-200/30 rounded" />
        ))}
      </ul>
    );
  }

  const viewLabel = features.dailyViewLimit >= 99999
    ? 'Unlimited profile views'
    : `View up to ${features.dailyViewLimit} profiles daily`;

  return (
    <ul className="flex-grow space-y-2 md:space-y-0.5">
      {/* Always-on base features */}
      <FeatureRow enabled label="Create profile & add photos" />
      <FeatureRow enabled label="Basic search & filters" />

      {/* Admin-controlled: Daily View Limit */}
      <FeatureRow
        enabled
        label={<strong>{viewLabel}</strong>}
      />

      {/* Admin-controlled: View Full Bio */}
      <FeatureRow
        enabled={features.viewFullBio}
        label={features.viewFullBio
          ? 'Full biodata visible'
          : 'Full biodata hidden'}
        subLabel={features.viewFullBio
          ? 'Education, profession, family'
          : 'Upgrade to unlock details'}
      />

      {/* Admin-controlled: Contact Details */}
      <FeatureRow
        enabled={features.viewContactDetails}
        label={features.viewContactDetails
          ? 'View contact details'
          : 'Contact details locked'}
      />

      {/* Admin-controlled: Halal Chat */}
      <FeatureRow
        enabled={features.chat}
        label={features.chat
          ? 'Halal Chat messaging'
          : 'Messaging not available'}
      />

      {/* Admin-controlled: Shortlist */}
      <FeatureRow
        enabled={features.shortlist}
        label={features.shortlist
          ? 'Shortlist & save profiles'
          : 'Cannot shortlist profiles'}
      />
    </ul>
  );
};

export default PlansPage;
