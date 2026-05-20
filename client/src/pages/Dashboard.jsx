import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  FaBriefcase, FaPhoneAlt, FaUserFriends, FaCheckCircle, 
  FaTimes, FaGraduationCap, FaSave, FaUserShield 
} from 'react-icons/fa';
import LogoLoader from '../components/LogoLoader';

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

  useEffect(() => {
    if (!user) {
      navigate('/login');
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

  if (!user || !profile) return <LogoLoader fullScreen text="Loading Dashboard..." />;

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
    <div className="min-h-screen bg-cream-50 pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[0%] left-[0%] w-96 h-96 bg-crimson-900/5 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-[0%] right-[0%] w-96 h-96 bg-gold-500/5 rounded-full blur-[100px] -z-10"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-crimson-950 mb-1">Assalamu Alaikum, {profile.name}</h1>
            <p className="text-slate-600 font-medium">Welcome to your Rohin Muslim Matrimony dashboard.</p>
          </div>
          {user.plan === 'free' && (
            <button onClick={() => navigate('/plans')} className="bg-gold-gradient text-crimson-950 px-6 py-2.5 rounded-full font-bold shadow-lg shadow-gold-500/20 hover:scale-105 transition-all">
              Upgrade Plan
            </button>
          )}
        </div>

        {/* PROFILE COMPLETION BANNER */}
        {completeness < 100 && (
          <div 
            onClick={() => navigate('/edit-profile')}
            className="w-full mb-8 rounded-3xl p-0.5 bg-gradient-to-r from-gold-500/40 via-gold-400/20 to-gold-500/40 border border-gold-500/30 shadow-xl overflow-hidden cursor-pointer hover:scale-[1.01] hover:shadow-gold-500/20 transition-all duration-300"
          >
            <div className="bg-[#4f080e] rounded-[22px] p-6 md:p-8 text-white relative">
              <div className="absolute top-2 right-2 text-gold-500/20 text-xl">✨</div>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="text-center md:text-left space-y-2">
                  <span className="bg-gold-500/20 text-gold-400 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-gold-500/35">
                    Profile Status
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold">Complete your biodata to unlock better matches</h2>
                  <p className="text-slate-300 text-xs md:text-sm max-w-xl font-medium">
                    Detailed profiles get up to 5x more responses and faster mutual connections! Click here to update your profile.
                  </p>
                </div>
  
                <div className="w-full md:w-64 flex flex-col items-center md:items-end gap-2 flex-shrink-0">
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
                    <span className="text-emerald-400 text-xs font-extrabold flex items-center gap-1.5 mt-1">
                      <FaCheckCircle /> 100% Completed
                    </span>
                  ) : (
                    <span className="text-gold-400/80 text-xs font-semibold mt-1">
                      Complete all steps to get verified badge.
                    </span>
                  )}
                </div>
              </div>
              
              {missingFields && missingFields.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gold-500/20 text-left relative z-10">
                  <p className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-3">Remaining tasks to reach 100%:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {missingFields.map((field) => {
                      const isRequired = field.percentage > 0;
                      return (
                        <div 
                          key={field.name} 
                          className={`flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-300 ${
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
          <div className="mb-10">
            <h2 className="text-lg font-serif font-bold text-crimson-950 mb-4 flex items-center gap-2">
              💡 Quick Setup Tasks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Wali Details */}
              {(!profile.waliContact || profile.waliContact.trim() === '') && (
                <div className="glass-card p-6 rounded-3xl shadow-sm border border-crimson-900/10 flex flex-col justify-between hover:border-gold-500/40 transition-colors group">
                  <div>
                    <div className="w-10 h-10 rounded-2xl bg-crimson-50 text-crimson-800 flex items-center justify-center mb-4 group-hover:bg-[#4f080e] group-hover:text-gold-400 transition-colors">
                      <FaPhoneAlt className="text-sm" />
                    </div>
                    <h3 className="text-slate-900 font-extrabold text-sm mb-1.5">Add Chaperone / Wali Contact</h3>
                    <span className="inline-block bg-slate-100 text-slate-600 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider mb-2">Optional</span>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold mb-4">
                      Build trust by adding your family chaperone contact. This is optional but highly recommended.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowWaliModal(true)} 
                    className="bg-crimson-950 text-gold-400 px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md hover:bg-crimson-900 transition-all w-full uppercase tracking-wider"
                  >
                    Add Wali Details
                  </button>
                </div>
              )}

              {/* Card 2: Family Details */}
              {(!profile.familyDetails?.fatherOccupation || profile.familyDetails?.fatherOccupation.trim() === '') && (
                <div className="glass-card p-6 rounded-3xl shadow-sm border border-crimson-900/10 flex flex-col justify-between hover:border-gold-500/40 transition-colors group">
                  <div>
                    <div className="w-10 h-10 rounded-2xl bg-crimson-50 text-crimson-800 flex items-center justify-center mb-4 group-hover:bg-[#4f080e] group-hover:text-gold-400 transition-colors">
                      <FaUserFriends className="text-sm" />
                    </div>
                    <h3 className="text-slate-900 font-extrabold text-sm mb-1.5">Add Family Background</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold mb-4">
                      Share details about your parents' occupation and siblings to help matches learn about your household.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowFamilyModal(true)} 
                    className="bg-crimson-950 text-gold-400 px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md hover:bg-crimson-900 transition-all w-full uppercase tracking-wider"
                  >
                    Add Family details (+40%)
                  </button>
                </div>
              )}

              {/* Card 3: Career Details */}
              {(!profile.profession || profile.profession === 'Not Specified' ||
                !profile.education || profile.education === 'Not Specified') && (
                <div className="glass-card p-6 rounded-3xl shadow-sm border border-crimson-900/10 flex flex-col justify-between hover:border-gold-500/40 transition-colors group">
                  <div>
                    <div className="w-10 h-10 rounded-2xl bg-crimson-50 text-crimson-800 flex items-center justify-center mb-4 group-hover:bg-[#4f080e] group-hover:text-gold-400 transition-colors">
                      <FaBriefcase className="text-sm" />
                    </div>
                    <h3 className="text-slate-900 font-extrabold text-sm mb-1.5">Update Career & Education</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold mb-4">
                      Matches value transparency! Change the default placeholders to your actual education and job.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowCareerModal(true)} 
                    className="bg-crimson-950 text-gold-400 px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md hover:bg-crimson-900 transition-all w-full uppercase tracking-wider"
                  >
                    Update Career (+40%)
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Existing System Cards (Plan, Views, Privacy) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Plan Status Card */}
          <div className="glass-card p-6 rounded-3xl shadow-sm border border-crimson-900/10 flex flex-col justify-between">
            <div>
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Current Membership</h3>
              <div className="flex items-end gap-3 mb-2">
                <span className={`text-3xl font-serif font-bold capitalize ${user.plan === 'elite' ? 'text-gold-600' : user.plan === 'premium' ? 'text-crimson-600' : 'text-crimson-950'}`}>
                  {user.plan}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                {user.plan === 'free' ? 'Upgrade to connect with matches directly.' : 'Enjoying premium matchmaking benefits.'}
              </p>
            </div>
            {user.plan !== 'elite' && (
               <button onClick={() => navigate('/plans')} className="text-sm font-semibold text-crimson-800 hover:text-gold-600 transition-colors w-max">
                 View Upgrade Options &rarr;
               </button>
            )}
          </div>

          {/* View Limit Card */}
          <div className="glass-card p-6 rounded-3xl shadow-sm border border-crimson-900/10">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Daily Profile Views</h3>
            <div className="flex items-end justify-between mb-3">
              <span className="text-3xl font-bold text-crimson-950">
                {user.viewLimit > 9000 ? 'Unlimited' : `${user.viewedCount || 0} / ${user.viewLimit}`}
              </span>
            </div>
            {user.viewLimit < 9000 ? (
               <>
                 <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2 overflow-hidden shadow-inner">
                   <div 
                     className="bg-gradient-to-r from-crimson-600 to-gold-400 h-2.5 rounded-full" 
                     style={{ width: `${Math.min(((user.viewedCount || 0) / user.viewLimit) * 100, 100)}%` }}
                   ></div>
                 </div>
                 <p className="text-xs text-slate-500">Limits reset at midnight.</p>
               </>
            ) : (
               <p className="text-sm font-medium text-crimson-700 bg-crimson-50 px-3 py-1.5 rounded-lg inline-block border border-crimson-200">
                 You have unrestricted browsing access.
               </p>
            )}
          </div>
          
          {/* Profile Status Card */}
          <div className="glass-card p-6 rounded-3xl shadow-sm border border-crimson-900/10">
             <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">Privacy & Status</h3>
             <div className="flex flex-col gap-3">
               <div className="flex items-center gap-3 bg-white/60 p-3 rounded-xl border border-slate-100">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${profile.isPhotoPublic ? 'bg-crimson-100 text-crimson-600' : 'bg-slate-200 text-slate-500'}`}>
                   {profile.isPhotoPublic ? '👁️' : '🔒'}
                 </div>
                 <div className="flex flex-col">
                   <span className="text-sm font-bold text-slate-800">Photo Visibility</span>
                   <span className="text-xs text-slate-500">{profile.isPhotoPublic ? 'Visible to public' : 'Blurred / Private'}</span>
                 </div>
               </div>
               
               <button onClick={() => navigate('/edit-profile')} className="w-full py-2 border-2 border-crimson-900 text-crimson-950 rounded-xl text-sm font-bold hover:bg-crimson-50 transition-colors mt-1">
                 Update Profile & Privacy
               </button>
             </div>
          </div>
        </div>
        
        {/* Call to Action Row */}
        <div className="bg-crimson-950 rounded-3xl p-8 md:p-12 shadow-xl border border-gold-500/20 text-center relative overflow-hidden">
            <div className="absolute top-[-50%] left-[-10%] w-64 h-64 bg-gold-500/20 rounded-full blur-[80px]"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-serif text-white mb-3">Begin Your Search</h2>
              <p className="text-slate-300 mb-8 max-w-xl mx-auto">Browse verified profiles matching your religious, professional, and personal preferences in our trusted network.</p>
              <button onClick={() => navigate('/search')} className="bg-gold-gradient text-crimson-950 px-10 py-4 rounded-full font-bold shadow-lg shadow-gold-500/20 hover:scale-105 transition-transform text-lg flex items-center justify-center gap-2 mx-auto">
                Discover Matches &rarr;
              </button>
            </div>
        </div>

        {/* MODAL 1: WALI CONTACT */}
        {showWaliModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-3xl border border-gold-500/20 shadow-2xl p-6 relative animate-scaleUp">
              <button onClick={() => setShowWaliModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                <FaTimes />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-crimson-50 rounded-2xl flex items-center justify-center text-crimson-900 mx-auto mb-3">
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
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-gold-500 focus:outline-none text-sm font-semibold text-slate-800" 
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gold-gradient text-crimson-950 font-extrabold py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-70"
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
            <div className="w-full max-w-md bg-white rounded-3xl border border-gold-500/20 shadow-2xl p-6 relative animate-scaleUp">
              <button onClick={() => setShowFamilyModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                <FaTimes />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-crimson-50 rounded-2xl flex items-center justify-center text-crimson-900 mx-auto mb-3">
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
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-gold-500 focus:outline-none text-sm font-semibold text-slate-800" 
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
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-gold-500 focus:outline-none text-sm font-semibold text-slate-800" 
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
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-gold-500 focus:outline-none text-sm font-semibold text-slate-800" 
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gold-gradient text-crimson-950 font-extrabold py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-70"
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
            <div className="w-full max-w-md bg-white rounded-3xl border border-gold-500/20 shadow-2xl p-6 relative animate-scaleUp">
              <button onClick={() => setShowCareerModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                <FaTimes />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-crimson-50 rounded-2xl flex items-center justify-center text-crimson-900 mx-auto mb-3">
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
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-gold-500 focus:outline-none text-sm font-semibold text-slate-800" 
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
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-gold-500 focus:outline-none text-sm font-semibold text-slate-800" 
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gold-gradient text-crimson-950 font-extrabold py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-70"
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

      </div>
    </div>
  );
};

export default Dashboard;
