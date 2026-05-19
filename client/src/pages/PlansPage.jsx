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
      // Mock Payment Delay
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

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        
        {/* FREE PLAN */}
        <div className="glass-card rounded-3xl p-8 border border-crimson-900/10 flex flex-col hover:-translate-y-2 transition-transform duration-300">
          <div className="mb-6">
            <h3 className="text-slate-500 font-bold uppercase tracking-wider text-sm mb-2">Basic</h3>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-serif font-bold text-crimson-950">Free</span>
            </div>
          </div>
          <ul className="flex-1 space-y-4 mb-8">
            <li className="flex items-start gap-3 text-sm text-slate-700">
              <FaCheckCircle className="text-crimson-600 text-lg mt-0.5" />
              <span>Create profile & add photos</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-700">
              <FaCheckCircle className="text-crimson-600 text-lg mt-0.5" />
              <span>Basic grid search filters</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-700">
              <FaCheckCircle className="text-crimson-600 text-lg mt-0.5" />
              <span>View up to <strong>5 profiles daily</strong></span>
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-400">
              <FaShieldAlt className="text-slate-300 text-lg mt-0.5" />
              <span>Cannot view full biodata (Blurred)</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-400">
              <FaShieldAlt className="text-slate-300 text-lg mt-0.5" />
              <span>Cannot message directly</span>
            </li>
          </ul>
          <button 
            disabled={user?.plan === 'free'}
            className="w-full py-3.5 rounded-full font-bold text-crimson-900 bg-crimson-900/10 hover:bg-crimson-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {user?.plan === 'free' ? 'Current Plan' : 'Select Free'}
          </button>
        </div>

        {/* PREMIUM PLAN */}
        <div className="glass-card-dark rounded-3xl p-8 border border-crimson-700 flex flex-col transform scale-105 shadow-2xl relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gold-gradient px-4 py-1 rounded-full text-crimson-950 text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5">
            <FaStar /> Most Popular
          </div>
          <div className="mb-6">
            <h3 className="text-crimson-400 font-bold uppercase tracking-wider text-sm mb-2">Premium</h3>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-serif font-bold text-white">₹{prices.premium}</span>
              <span className="text-slate-400 text-sm mb-1">/ month</span>
            </div>
          </div>
          <ul className="flex-1 space-y-4 mb-8">
            <li className="flex items-start gap-3 text-sm text-slate-300">
              <FaCheckCircle className="text-crimson-400 text-lg mt-0.5" />
              <span className="text-white font-medium">View up to <strong>30 profiles daily</strong></span>
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-300">
              <FaCheckCircle className="text-crimson-400 text-lg mt-0.5" />
              <span>Unlock full biodata details</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-300">
              <FaCheckCircle className="text-crimson-400 text-lg mt-0.5" />
              <span>Real-time Chat with mutual connections</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-300">
              <FaCheckCircle className="text-crimson-400 text-lg mt-0.5" />
              <span>See connected users' phone numbers</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-300">
              <FaCheckCircle className="text-crimson-400 text-lg mt-0.5" />
              <span>Shortlist & Save Profiles</span>
            </li>
          </ul>
          <button 
            onClick={() => handleUpgrade('premium')}
            disabled={loading || user?.plan === 'premium' || user?.plan === 'elite'}
            className="w-full py-3.5 rounded-full font-bold bg-gold-gradient text-crimson-950 hover:shadow-gold-500/30 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {user?.plan === 'premium' ? 'Current Plan' : 'Upgrade to Premium'}
          </button>
        </div>

        {/* ELITE PLAN */}
        <div className="glass-card rounded-3xl p-8 border border-gold-500/30 flex flex-col hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-gold-500/10 rounded-full blur-2xl"></div>
          <div className="mb-6 relative z-10">
            <h3 className="text-gold-600 font-bold uppercase tracking-wider text-sm mb-2 flex items-center gap-1.5">
              <FaCrown /> Elite
            </h3>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-serif font-bold text-crimson-950">₹{prices.elite}</span>
              <span className="text-slate-500 text-sm mb-1">/ month</span>
            </div>
          </div>
          <ul className="flex-1 space-y-4 mb-8 relative z-10">
            <li className="flex items-start gap-3 text-sm text-slate-700">
              <FaCheckCircle className="text-gold-500 text-lg mt-0.5" />
              <span className="font-bold text-crimson-900">Unlimited profile views</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-700">
              <FaCheckCircle className="text-gold-500 text-lg mt-0.5" />
              <span>Priority placement in search results</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-700">
              <FaCheckCircle className="text-gold-500 text-lg mt-0.5" />
              <span>All Premium features included</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-700">
              <FaCheckCircle className="text-gold-500 text-lg mt-0.5" />
              <span>Dedicated Relationship Manager</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-700">
              <FaCheckCircle className="text-gold-500 text-lg mt-0.5" />
              <span>Advanced Admin Moderation bypass</span>
            </li>
          </ul>
          <button 
            onClick={() => handleUpgrade('elite')}
            disabled={loading || user?.plan === 'elite'}
            className="w-full py-3.5 rounded-full font-bold bg-crimson-950 text-gold-400 hover:bg-crimson-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative z-10 border border-crimson-800"
          >
            {user?.plan === 'elite' ? 'Current Plan' : 'Get Elite Access'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default PlansPage;
