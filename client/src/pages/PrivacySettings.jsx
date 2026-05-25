import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaMobileAlt, FaImage, FaSun, FaUserLock, FaLock, FaSave } from 'react-icons/fa';
import SimpleSpinner from '../components/SimpleSpinner';

const PrivacySettings = () => {
  const { profile, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('MOBILE'); // 'MOBILE', 'PHOTO', 'HOROSCOPE', 'PROFILE'
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form settings state
  const [settings, setSettings] = useState({
    mobile: 'all_paid',
    photo: 'all',
    horoscope: 'all',
    profile: 'all'
  });

  // Original settings to check if dirty
  const [originalSettings, setOriginalSettings] = useState({
    mobile: 'all_paid',
    photo: 'all',
    horoscope: 'all',
    profile: 'all'
  });

  useEffect(() => {
    if (profile) {
      const ps = profile.privacySettings || {};
      const initial = {
        mobile: ps.mobile || 'all_paid',
        photo: ps.photo || (profile.isPhotoPublic === false ? 'hidden' : 'all'),
        horoscope: ps.horoscope || 'all',
        profile: ps.profile || 'all'
      };
      setSettings(initial);
      setOriginalSettings(initial);
    }
  }, [profile]);

  const isDirty = 
    settings.mobile !== originalSettings.mobile ||
    settings.photo !== originalSettings.photo ||
    settings.horoscope !== originalSettings.horoscope ||
    settings.profile !== originalSettings.profile;

  const handleOptionChange = (category, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading('Saving privacy settings...');
    try {
      // Send privacySettings as part of the profile update
      const res = await api.put('/profiles/my-profile', {
        privacySettings: settings
      });

      if (res.data.success) {
        toast.success('Privacy settings updated successfully!', { id: toastId });
        setOriginalSettings(settings);
        await refreshUser();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update privacy settings', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setSettings(originalSettings);
    toast('Changes discarded');
  };

  if (!profile) {
    return <SimpleSpinner />;
  }

  // Tabs structure
  const tabs = [
    { id: 'MOBILE', label: 'MOBILE', icon: <FaMobileAlt className="text-xs" /> },
    { id: 'PHOTO', label: 'PHOTO', icon: <FaImage className="text-xs" /> },
    { id: 'PROFILE', label: 'PROFILE', icon: <FaUserLock className="text-xs" /> }
  ];

  return (
    <div className="min-h-screen bg-cream-50 text-slate-800 pt-6 pb-24 relative overflow-hidden font-outfit">
      {/* Background Decor */}
      <div className="absolute top-[0%] left-[0%] w-96 h-96 bg-crimson-900/5 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-[0%] right-[0%] w-96 h-96 bg-gold-500/5 rounded-full blur-[100px] -z-10"></div>

      <div className="max-w-2xl mx-auto px-4 relative z-10">
        
        {/* Header with back button */}
        <div className="flex items-center gap-4 py-4 mb-6">
          <button 
            onClick={() => navigate('/my-profile')}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-[#d4af37]/25 text-[#4f080e] hover:bg-crimson-50 transition-colors shadow-sm cursor-pointer"
          >
            <FaArrowLeft className="text-sm" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-extrabold text-[#4f080e]">Privacy Settings</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage who can see your contact, photo and profile details.</p>
          </div>
        </div>

        {/* Tab Selection Header */}
        <div className="bg-[#4f080e] text-white rounded-t-2xl shadow-md overflow-x-auto hide-scrollbar">
          <div className="flex border-b border-white/10 min-w-[360px]">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 text-center font-bold text-xs tracking-wider border-b-2 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isActive 
                      ? 'border-gold-400 text-white font-extrabold bg-white/5' 
                      : 'border-transparent text-slate-300 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Box */}
        <div className="bg-white border-x border-b border-[#d4af37]/20 rounded-b-2xl p-6 md:p-8 shadow-xl mb-8 min-h-[300px]">
          
          {/* MOBILE TAB */}
          {activeTab === 'MOBILE' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#4f080e] mb-1">Show mobile number only to:</h3>
                <p className="text-xs text-slate-500">Configure access level for your contact details, including Wali details.</p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    value: 'all_paid',
                    label: 'All paid members',
                    desc: 'Any Premium or Elite subscribed member can view your contact details.',
                    recommended: true
                  },
                  {
                    value: 'community_paid',
                    label: 'Paid members from my community',
                    desc: 'Only paid members of the same Islamic sect (e.g. Sunni, Shia) can view.',
                    recommended: false
                  },
                  {
                    value: 'contacted_paid',
                    label: 'Paid members whom I contacted/responded to',
                    desc: 'Only paid members with whom you have a mutual accepted connection.',
                    recommended: false
                  },
                  {
                    value: 'hidden',
                    label: "Don't show phone number (Hide contact details)",
                    desc: 'No members can see your phone number. They must request it directly.',
                    recommended: false
                  }
                ].map((option) => (
                  <label 
                    key={option.value}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:bg-slate-50 ${
                      settings.mobile === option.value 
                        ? 'border-orange-500 bg-orange-50/10' 
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="pt-0.5">
                      <input 
                        type="radio"
                        name="mobilePrivacy"
                        checked={settings.mobile === option.value}
                        onChange={() => handleOptionChange('mobile', option.value)}
                        className="w-4 h-4 accent-orange-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 text-sm">{option.label}</span>
                        {option.recommended && (
                          <span className="bg-emerald-50 text-emerald-700 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border border-emerald-200 tracking-wider">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* PHOTO TAB */}
          {activeTab === 'PHOTO' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#4f080e] mb-1">Show photo to:</h3>
                <p className="text-xs text-slate-500">Configure who can view your profile picture and gallery photos.</p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    value: 'all',
                    label: 'All members',
                    desc: 'All registered and approved members can see your photo clearly.',
                  },
                  {
                    value: 'premium_elite',
                    label: 'Only premium / elite members',
                    desc: 'Only paid subscribers can view. Free users will see it blurred.',
                  },
                  {
                    value: 'connections',
                    label: 'Only accepted connections',
                    desc: 'Only users with accepted interests can see your photo.',
                  },
                  {
                    value: 'hidden',
                    label: "Don't show photo (Blurred for all)",
                    desc: 'Blurred for everyone. Users must send a Photo Access request which you can approve.',
                  }
                ].map((option) => (
                  <label 
                    key={option.value}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:bg-slate-50 ${
                      settings.photo === option.value 
                        ? 'border-orange-500 bg-orange-50/10' 
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="pt-0.5">
                      <input 
                        type="radio"
                        name="photoPrivacy"
                        checked={settings.photo === option.value}
                        onChange={() => handleOptionChange('photo', option.value)}
                        className="w-4 h-4 accent-orange-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-sm">{option.label}</span>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}


          {/* PROFILE TAB */}
          {activeTab === 'PROFILE' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#4f080e] mb-1">Show profile only to:</h3>
                <p className="text-xs text-slate-500">Control your profile discoverability and search appearance.</p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    value: 'all',
                    label: 'All members',
                    desc: 'Your profile is active, searchable and public to everyone.',
                  },
                  {
                    value: 'connections',
                    label: 'Only accepted connections',
                    desc: 'Your profile will be hidden from search results, and viewable only to matches you connected with.',
                  },
                  {
                    value: 'hidden',
                    label: "Don't show to anyone (Hide profile)",
                    desc: 'Hide your profile completely. You will not show up in searches, and visitors will not be able to view details.',
                  }
                ].map((option) => (
                  <label 
                    key={option.value}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:bg-slate-50 ${
                      settings.profile === option.value 
                        ? 'border-orange-500 bg-orange-50/10' 
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="pt-0.5">
                      <input 
                        type="radio"
                        name="profilePrivacy"
                        checked={settings.profile === option.value}
                        onChange={() => handleOptionChange('profile', option.value)}
                        className="w-4 h-4 accent-orange-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-sm">{option.label}</span>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Floating Save/Discard Panel */}
      {isDirty && (
        <div className="fixed bottom-[76px] lg:bottom-6 left-4 right-4 z-50 flex justify-center animate-slideUp">
          <div className="w-full max-w-2xl bg-gradient-to-r from-[#4f080e] to-[#300508] border border-gold-500/30 rounded-2xl px-4 py-3 sm:py-4 flex justify-between items-center shadow-[0_10px_30px_rgba(79,8,14,0.35)] text-white">
            <span className="text-xs sm:text-sm font-extrabold text-gold-400 flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
              Unsaved Changes
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDiscard}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold text-[#faf8f5] bg-transparent border border-white/20 hover:bg-white/10 active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gold-gradient text-crimson-950 px-5 py-1.5 rounded-full font-bold shadow-md hover:scale-105 active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="w-4 h-4 border-2 border-crimson-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <FaSave />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacySettings;
