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
  };  return (
    <div className="min-h-screen bg-cream-50 pt-20 pb-20 px-4 md:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[0%] left-[50%] -translate-x-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-b from-crimson-900/10 to-transparent rounded-full blur-[100px] -z-10"></div>

      <div className="max-w-6xl mx-auto text-center mb-16 relative z-10">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-crimson-950 mb-4">
          Choose Your Halal Journey
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
          Unlock premium features to find your life partner faster. Your privacy is guaranteed with our state-of-the-art security features.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 items-center">
        
        {/* FREE PLAN */}
        <div className="glass-card rounded-3xl p-8 border border-crimson-900/10 flex flex-col hover:-translate-y-1 transition-all duration-300">
          <div className="mb-6">
            <h3 className="text-slate-500 font-bold uppercase tracking-wider text-sm mb-2">Basic</h3>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-serif font-bold text-crimson-950">Free</span>
            </div>
          </div>
          <DynamicFeatureList planKey="freePlanFeatures" />
          {user?.plan === 'free' ? (
            <button 
              disabled
              className="w-full py-3.5 rounded-full font-bold text-crimson-900 bg-crimson-900/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              Current Plan
            </button>
          ) : (user?.plan === 'premium' || user?.plan === 'elite') ? (
            <div className="h-[52px] mt-8"></div>
          ) : (
            <button 
              onClick={() => handleUpgrade('free')}
              disabled={loading}
              className="w-full py-3.5 rounded-full font-bold text-crimson-900 bg-crimson-900/10 hover:bg-crimson-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              Select Free
            </button>
          )}
        </div>

        {/* PREMIUM PLAN */}
        <div className="glass-card-dark rounded-3xl p-8 border border-crimson-700 flex flex-col hover:-translate-y-1 transition-all duration-300 relative">
          <div className="mb-6">
            <h3 className="text-crimson-400 font-bold uppercase tracking-wider text-sm mb-2">Premium</h3>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-serif font-bold text-white">₹{prices.premium}</span>
              <span className="text-slate-400 text-sm mb-1">/ month</span>
            </div>
          </div>
          <DynamicFeatureList planKey="premiumPlanFeatures" dark />
          {user?.plan === 'premium' ? (
            <button 
              disabled
              className="w-full py-3.5 rounded-full font-bold bg-gold-gradient text-crimson-950 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed mt-8"
            >
              Current Plan
            </button>
          ) : user?.plan === 'elite' ? (
            <div className="h-[52px] mt-8"></div>
          ) : (
            <button 
              onClick={() => handleUpgrade('premium')}
              disabled={loading}
              className="w-full py-3.5 rounded-full font-bold bg-gold-gradient text-crimson-950 hover:shadow-gold-500/30 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed mt-8"
            >
              Upgrade to Premium
            </button>
          )}
        </div>

        {/* ELITE PLAN (Elevated & Highlighted) */}
        <div className="glass-card-elite rounded-3xl p-8 flex flex-col md:scale-105 shadow-2xl relative z-10 transition-all duration-300">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gold-gradient px-4 py-1 rounded-full text-crimson-950 text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5 z-20">
            <FaCrown /> Best Value
          </div>
          <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-gold-500/20 rounded-full blur-2xl"></div>
          <div className="mb-6 relative z-10">
            <h3 className="text-gold-500 font-bold uppercase tracking-wider text-sm mb-2 flex items-center gap-1.5">
              <FaCrown /> Elite
            </h3>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-serif font-bold text-white">₹{prices.elite}</span>
              <span className="text-slate-300 text-sm mb-1">/ month</span>
            </div>
          </div>
          <DynamicFeatureList planKey="elitePlanFeatures" dark gold />
          {user?.plan === 'elite' ? (
            <button 
              disabled
              className="w-full py-3.5 rounded-full font-bold bg-gold-gradient text-crimson-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative z-10 mt-8"
            >
              Current Plan
            </button>
          ) : (
            <button 
              onClick={() => handleUpgrade('elite')}
              disabled={loading}
              className="w-full py-3.5 rounded-full font-bold bg-gold-gradient text-crimson-950 hover:shadow-gold-500/30 hover:scale-105 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative z-10 mt-8"
            >
              Get Elite Access
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

// ─── Dynamic Feature List Component ──────────────────────────────────────────
const DynamicFeatureList = ({ planKey, dark = false, gold = false }) => {
  const [features, setFeatures] = useState(null);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.success && res.data.data) {
          setFeatures(res.data.data[planKey]);
        }
      } catch (err) {
        // Fallback defaults if API unreachable
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

  const tickClass = dark ? 'text-crimson-400' : gold ? 'text-gold-500' : 'text-crimson-600';
  const lockClass = dark ? 'text-slate-600'   : 'text-slate-300';
  const textBase  = dark ? 'text-slate-300'   : 'text-slate-700';
  const dimText   = dark ? 'text-slate-500'   : 'text-slate-400';
  const subText   = dark ? 'text-slate-500'   : 'text-slate-400';

  const FeatureRow = ({ enabled, label, subLabel }) => (
    <li className={`flex items-start gap-3 text-sm ${textBase}`}>
      {enabled ? (
        <FaCheckCircle className={`${tickClass} text-lg mt-0.5 flex-shrink-0`} />
      ) : (
        <FaShieldAlt className={`${lockClass} text-lg mt-0.5 flex-shrink-0`} />
      )}
      <span className={!enabled ? dimText : dark ? 'text-white font-medium' : ''}>
        {label}
        {subLabel && (
          <span className={`block text-xs mt-0.5 ${subText}`}>{subLabel}</span>
        )}
      </span>
    </li>
  );

  // Loading skeleton
  if (!features) {
    return (
      <ul className="flex-1 space-y-4">
        {[1,2,3,4,5,6,7].map(i => (
          <li key={i} className="h-5 bg-slate-200/40 rounded animate-pulse" />
        ))}
      </ul>
    );
  }

  const viewLabel = features.dailyViewLimit >= 99999
    ? 'Unlimited profile views'
    : `View up to ${features.dailyViewLimit} profiles daily`;

  return (
    <ul className="flex-1 space-y-4">

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
          ? 'Full biodata & all details visible'
          : 'Full biodata hidden (Blurred)'}
        subLabel={features.viewFullBio
          ? 'Education, profession, family details visible'
          : 'Upgrade to unlock complete profile'}
      />

      {/* Admin-controlled: Contact Details */}
      <FeatureRow
        enabled={features.viewContactDetails}
        label={features.viewContactDetails
          ? 'View phone & email on connection'
          : 'Contact details locked'}
        subLabel={features.viewContactDetails
          ? 'Visible after mutual interest accepted'
          : 'Cannot see phone number or email'}
      />

      {/* Admin-controlled: Halal Chat */}
      <FeatureRow
        enabled={features.chat}
        label={features.chat
          ? 'Halal Chat with mutual connections'
          : 'Messaging not available'}
        subLabel={features.chat ? 'Safe, monitored chat system' : null}
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
