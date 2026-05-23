import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaCrown, FaCheckCircle, FaChevronLeft, FaPhoneAlt, FaEye, FaRegCreditCard, FaLock } from 'react-icons/fa';
import api from '../services/api';

const PaymentInfoPage = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      try {
        await refreshUser();
        const res = await api.get('/settings');
        if (res.data.success) {
          setSettings(res.data.data);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 pt-24 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-crimson-200 border-t-crimson-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-cream-50 pt-24 px-4 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <p className="text-slate-600 mb-4">Please sign in to view your payment and plan info.</p>
          <button 
            onClick={() => navigate('/login')} 
            className="bg-crimson-950 text-white font-bold px-6 py-2.5 rounded-full hover:bg-crimson-900 transition-all text-sm"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Fallback defaults if settings api fails
  const defaults = {
    freePlanFeatures: { dailyViewLimit: 5, contactViewLimit: 0, chat: false, viewFullBio: false },
    premiumPlanFeatures: { dailyViewLimit: 30, contactViewLimit: 50, chat: true, viewFullBio: true },
    elitePlanFeatures: { dailyViewLimit: 99999, contactViewLimit: 99999, chat: true, viewFullBio: true }
  };

  const planKey = user.plan === 'elite' 
    ? 'elitePlanFeatures' 
    : user.plan === 'premium' 
    ? 'premiumPlanFeatures' 
    : 'freePlanFeatures';

  const features = settings ? settings[planKey] : defaults[planKey];

  const viewedCount = user.viewedProfiles?.length || 0;
  const viewLimit = user.viewLimit || features.dailyViewLimit || 5;

  const contactsCount = user.viewedContacts?.length || 0;
  const contactsLimit = features.contactViewLimit || 0;

  // Percentage calculations
  const viewProgressPercent = viewLimit > 9000 ? 0 : Math.min((viewedCount / viewLimit) * 100, 100);
  const contactProgressPercent = contactsLimit > 9000 ? 0 : contactsLimit === 0 ? 0 : Math.min((contactsCount / contactsLimit) * 100, 100);

  return (
    <div className="min-h-screen bg-[#faf8f5] pt-24 pb-20 px-4 md:px-8 relative overflow-hidden font-outfit">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-b from-crimson-900/5 to-transparent rounded-full blur-[120px] -z-10"></div>

      <div className="max-w-xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/edit-profile')} 
          className="mb-6 text-crimson-900 font-bold flex items-center gap-1.5 bg-white border border-slate-200/80 px-4 py-2 rounded-full shadow-sm hover:bg-slate-50 transition-all text-xs uppercase tracking-wider cursor-pointer"
        >
          <FaChevronLeft className="text-[10px]" /> Back to Profile
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-crimson-950 mb-1.5">Payment & Plan Info</h1>
          <p className="text-sm text-slate-500">Manage your subscription, view limits, and track usage.</p>
        </div>

        {/* Current Plan Display Card */}
        <div className={`rounded-3xl p-6 md:p-8 mb-6 border relative overflow-hidden shadow-md text-white ${
          user.plan === 'elite'
            ? 'bg-gradient-to-br from-[#4f080e] via-[#3d060b] to-[#1a0204] border-gold-500/30'
            : user.plan === 'premium'
            ? 'bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 border-emerald-500/20'
            : 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-slate-700/50'
        }`}>
          {/* Subtle gold decoration for Elite */}
          {user.plan === 'elite' && (
            <div className="absolute top-[-30%] right-[-15%] w-48 h-48 bg-gold-500/10 rounded-full blur-2xl"></div>
          )}

          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border shadow-sm ${
                user.plan === 'elite'
                  ? 'bg-gold-500/10 text-gold-400 border-gold-500/20'
                  : user.plan === 'premium'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-white/10 text-slate-300 border-white/10'
              }`}>
                {user.plan || 'Free'} Account
              </span>
              <h2 className="text-3xl font-serif font-bold mt-3 text-white tracking-tight capitalize">
                {user.plan || 'Free'} Plan
              </h2>
            </div>
            <div className={`p-4 rounded-2xl flex items-center justify-center shadow-lg ${
              user.plan === 'elite'
                ? 'bg-gradient-to-br from-gold-400 to-amber-600 text-crimson-950'
                : user.plan === 'premium'
                ? 'bg-emerald-500 text-white'
                : 'bg-white/10 text-slate-300'
            }`}>
              {user.plan === 'free' ? <FaRegCreditCard className="text-2xl" /> : <FaCrown className="text-2xl" />}
            </div>
          </div>

          <div className="border-t border-white/10 pt-5 flex items-center justify-between text-xs relative z-10">
            <div className="text-slate-300">
              Status: <span className="font-bold text-white">Active</span>
            </div>
            <div className="text-slate-300">
              Verified User: <span className="font-bold text-white">{user.isManuallyVerified ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Plan Limits Usage dashboard */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm mb-6 space-y-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
            📊 Usage & Active Limits
          </h3>

          {/* Profile Views Limit */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <FaEye className="text-slate-400" /> Daily Profile Views
              </span>
              <span className="font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                {viewLimit > 9000 ? 'Unlimited' : `${viewedCount} / ${viewLimit} views`}
              </span>
            </div>
            {viewLimit <= 9000 ? (
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-crimson-700 to-crimson-900 h-full rounded-full transition-all duration-500"
                  style={{ width: `${viewProgressPercent}%` }}
                ></div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 italic">No limits applied to your premium account. View as many profiles as you wish.</div>
            )}
          </div>

          {/* Contact Details Unlock Limit */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <FaPhoneAlt className="text-slate-400 text-[10px]" /> Contact Numbers Unlocked
              </span>
              <span className="font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                {contactsLimit > 9000 ? 'Unlimited' : `${contactsCount} / ${contactsLimit} contacts`}
              </span>
            </div>
            {contactsLimit <= 9000 ? (
              contactsLimit === 0 ? (
                <div className="p-3.5 bg-red-50/50 rounded-2xl border border-red-100 text-xs text-red-700 flex items-center gap-2">
                  <FaLock className="text-red-500" />
                  <span>Contact number views are locked on the Free Plan.</span>
                </div>
              ) : (
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${contactProgressPercent}%` }}
                  ></div>
                </div>
              )
            ) : (
              <div className="text-[11px] text-slate-400 italic">Unlimited contact unlocks available. Reach out to any accepted match instantly.</div>
            )}
          </div>
        </div>

        {/* Benefits/Limits Overview based on active plan */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm mb-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
            ✨ Included Features
          </h3>
          <ul className="text-xs text-slate-600 space-y-3">
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-emerald-500" />
              <span>Halal connection requests matching profiles</span>
            </li>
            <li className="flex items-center gap-2">
              {features.chat ? (
                <FaCheckCircle className="text-emerald-500" />
              ) : (
                <span className="text-slate-300">✕</span>
              )}
              <span className={features.chat ? '' : 'text-slate-400 line-through'}>Secure real-time chat with accepted matches</span>
            </li>
            <li className="flex items-center gap-2">
              {features.viewFullBio ? (
                <FaCheckCircle className="text-emerald-500" />
              ) : (
                <span className="text-slate-300">✕</span>
              )}
              <span className={features.viewFullBio ? '' : 'text-slate-400 line-through'}>View full biodata including family details</span>
            </li>
            <li className="flex items-center gap-2">
              {features.viewContactDetails ? (
                <FaCheckCircle className="text-emerald-500" />
              ) : (
                <span className="text-slate-300">✕</span>
              )}
              <span className={features.viewContactDetails ? '' : 'text-slate-400 line-through'}>View phone numbers of accepted matches</span>
            </li>
          </ul>
        </div>

        {/* CTA Banner if not on Elite */}
        {user.plan !== 'elite' && (
          <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-300/30 rounded-3xl p-6 text-center space-y-4 shadow-sm">
            <div className="flex justify-center text-amber-600">
              <FaCrown className="text-3xl animate-bounce" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-amber-900 text-lg">Need Unlimited Access?</h4>
              <p className="text-xs text-amber-700 mt-1 max-w-sm mx-auto leading-relaxed">
                Upgrade to our <strong>Elite Plan</strong> to unlock unlimited profile views, unlimited contact numbers, and get a dedicated relationship manager.
              </p>
            </div>
            <button 
              onClick={() => navigate('/plans')}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full shadow-md transition-all transform active:scale-95 cursor-pointer"
            >
              Upgrade Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentInfoPage;
