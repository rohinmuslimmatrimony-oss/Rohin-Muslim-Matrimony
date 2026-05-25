import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api, { SOCKET_BASE_URL } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FaCamera, FaSave, FaUserShield, FaRegImage, FaLock, FaGlobe, FaHeart } from 'react-icons/fa';
import SimpleSpinner from '../components/SimpleSpinner';

const EditProfile = () => {
  const { user, profile, refreshUser, getCompleteness } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    sect: '',
    profession: '',
    annualIncome: 'Not Specified',
    education: '',
    city: '',
    about: '',
    phoneNumber: '',
    waliContact: '',
    height: '',
    maritalStatus: '',
    motherTongue: '',
    namazFrequency: '',
    isPhotoPublic: true,
    fatherOccupation: '',
    motherOccupation: '',
    siblingsCount: 0,
    siblingsList: [],
    partnerAgeRange: '',
    partnerSect: '',
    partnerEducation: ''
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        age: profile.age || '',
        gender: profile.gender || '',
        sect: profile.sect || '',
        profession: profile.profession || '',
        annualIncome: profile.annualIncome || 'Not Specified',
        education: profile.education || '',
        city: profile.city || '',
        about: profile.about || '',
        phoneNumber: profile.phoneNumber || '',
        waliContact: profile.waliContact || '',
        height: profile.height || '',
        maritalStatus: profile.maritalStatus || '',
        motherTongue: profile.motherTongue || '',
        namazFrequency: profile.namazFrequency || '',
        isPhotoPublic: profile.isPhotoPublic !== undefined ? profile.isPhotoPublic : true,
        fatherOccupation: profile.familyDetails?.fatherOccupation || '',
        motherOccupation: profile.familyDetails?.motherOccupation || '',
        siblingsCount: profile.familyDetails?.siblingsCount || 0,
        siblingsList: profile.familyDetails?.siblingsList || [],
        partnerAgeRange: profile.partnerPreferences?.ageRange || '',
        partnerSect: profile.partnerPreferences?.sectPreference || '',
        partnerEducation: profile.partnerPreferences?.educationPreference || ''
      });
      
      if (profile.profilePhoto && profile.profilePhoto !== '/uploads/default-avatar.png') {
        setPhotoPreview(`${SOCKET_BASE_URL}${profile.profilePhoto}`);
      }
    }
  }, [profile]);

  const getDynamicCompleteness = () => {
    if (!profile) return { score: 0, missingFields: [] };
    const tempProfile = {
      ...profile,
      profession: formData.profession,
      education: formData.education,
      phoneNumber: formData.phoneNumber,
      waliContact: formData.waliContact,
      familyDetails: {
        ...profile.familyDetails,
        fatherOccupation: formData.fatherOccupation,
        motherOccupation: formData.motherOccupation,
        siblingsCount: formData.siblingsCount
      }
    };
    return getCompleteness(tempProfile);
  };

  const { score } = getDynamicCompleteness();

  const checkIfDirty = () => {
    if (!profile) return false;
    if (photoFile !== null) return true;
    
    // Compare basic fields
    const basicFields = [
      'name', 'age', 'gender', 'sect', 'profession', 'annualIncome', 'education', 
      'city', 'about', 'phoneNumber', 'waliContact', 'height', 
      'maritalStatus', 'motherTongue', 'namazFrequency'
    ];
    for (const field of basicFields) {
      const formVal = formData[field] !== undefined && formData[field] !== null ? String(formData[field]) : '';
      const profVal = profile[field] !== undefined && profile[field] !== null ? String(profile[field]) : '';
      if (formVal !== profVal) return true;
    }
    
    // Compare isPhotoPublic
    const formPhotoPublic = formData.isPhotoPublic;
    const profPhotoPublic = profile.isPhotoPublic !== undefined ? profile.isPhotoPublic : true;
    if (formPhotoPublic !== profPhotoPublic) return true;
    
    // Compare family fields
    if ((formData.fatherOccupation || '') !== (profile.familyDetails?.fatherOccupation || '')) return true;
    if ((formData.motherOccupation || '') !== (profile.familyDetails?.motherOccupation || '')) return true;
    if (Number(formData.siblingsCount || 0) !== Number(profile.familyDetails?.siblingsCount || 0)) return true;
    
    // Compare partner preferences
    if ((formData.partnerAgeRange || '') !== (profile.partnerPreferences?.ageRange || '')) return true;
    if ((formData.partnerSect || '') !== (profile.partnerPreferences?.sectPreference || '')) return true;
    if ((formData.partnerEducation || '') !== (profile.partnerPreferences?.educationPreference || '')) return true;
    
    // Compare siblingsList length or elements
    const formSibLength = formData.siblingsList?.length || 0;
    const profSibLength = profile.familyDetails?.siblingsList?.length || 0;
    if (formSibLength !== profSibLength) return true;
    
    if (formSibLength > 0) {
      for (let i = 0; i < formSibLength; i++) {
        const fs = formData.siblingsList[i];
        const ps = profile.familyDetails.siblingsList[i];
        if (!ps) return true;
        if (fs.relation !== ps.relation || fs.maritalStatus !== ps.maritalStatus || fs.occupation !== ps.occupation) {
          return true;
        }
      }
    }

    return false;
  };
  
  const isFormDirty = checkIfDirty();

  const isCareerComplete = formData.profession && 
    formData.profession.trim() !== '' && 
    formData.profession !== 'Not Specified' && 
    formData.education && 
    formData.education.trim() !== '' && 
    formData.education !== 'Not Specified';

  const isFamilyComplete = !!(formData.fatherOccupation && formData.fatherOccupation.trim() !== '');

  const isProfessionEmpty = !formData.profession || formData.profession.trim() === '' || formData.profession === 'Not Specified';
  const isEducationEmpty = !formData.education || formData.education.trim() === '' || formData.education === 'Not Specified';
  const isFatherOccupationEmpty = !formData.fatherOccupation || formData.fatherOccupation.trim() === '';

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleAddSibling = () => {
    const newSibling = {
      gender: 'male',
      relation: 'Elder Brother',
      maritalStatus: 'Unmarried',
      occupation: ''
    };
    const updatedList = [...(formData.siblingsList || []), newSibling];
    setFormData({
      ...formData,
      siblingsList: updatedList,
      siblingsCount: updatedList.length
    });
  };

  const handleSiblingFieldChange = (index, field, value) => {
    const updatedList = [...formData.siblingsList];
    updatedList[index][field] = value;
    
    // Automatically set gender based on relation
    if (field === 'relation') {
      if (value.endsWith('Sister')) {
        updatedList[index].gender = 'female';
      } else {
        updatedList[index].gender = 'male';
      }
    }
    
    setFormData({
      ...formData,
      siblingsList: updatedList
    });
  };

  const handleRemoveSibling = (index) => {
    const updatedList = formData.siblingsList.filter((_, idx) => idx !== index);
    setFormData({
      ...formData,
      siblingsList: updatedList,
      siblingsCount: updatedList.length
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'siblingsList') {
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      });
      
      if (photoFile) {
        data.append('profilePhoto', photoFile);
      }

      const res = await api.put('/profiles/my-profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Profile updated successfully!');
        setPhotoFile(null); // Clear selected file state
        await refreshUser(); // Refresh global context
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) {
    return <SimpleSpinner />;
  }

  return (
    <>
      <div className="min-h-screen bg-cream-50 text-slate-800 pt-6 lg:pt-8 pb-40 lg:pb-24 px-4 md:px-8 relative overflow-hidden font-outfit">
        {/* Background Decor */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-crimson-900/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] bg-crimson-800/2 rounded-full blur-[100px] transform -translate-x-1/2"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <button 
            onClick={() => navigate('/my-profile')} 
            className="mb-6 text-[#4f080e] hover:text-[#7f181e] font-bold flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#d4af37]/25 w-max transition-all shadow-sm cursor-pointer hover:-translate-y-0.5 active:scale-95"
          >
            ← Back to Profile
          </button>
          <h1 className="text-3xl font-serif font-bold text-[#4f080e] mb-2">Edit Your Profile</h1>
          <p className="text-slate-500 mb-6 font-medium">Update your biodata, preferences, and privacy settings.</p>

          {/* Real-time Completeness Progress Header */}
          {user?.role !== 'admin' && (
            <div className="bg-gradient-to-r from-crimson-900 to-crimson-950 text-white rounded-3xl p-6 md:p-8 mb-8 border border-[#d4af37]/25 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-[80px]"></div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <div>
                  <h2 className="text-xl font-serif font-bold text-gold-300">Profile Completeness: {score}%</h2>
                  <p className="text-xs text-slate-350 mt-1 font-medium">
                    {score === 100 
                      ? '🎉 Mashallah! Your profile is 100% complete.' 
                      : 'Complete the highlighted fields below to reach 100% completeness.'}
                  </p>
                </div>
                <div className="w-full md:w-64 bg-crimson-950/60 rounded-full h-3.5 border border-gold-500/20 p-0.5 overflow-hidden">
                  <div 
                    className="bg-gold-gradient h-full rounded-full transition-all duration-500" 
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Photo & Privacy */}
            <div className="glass-card p-6 md:p-8 rounded-2xl border border-[#d4af37]/25 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/5 rounded-full blur-[80px]"></div>
               
               <h2 className="text-xl font-serif font-bold text-[#4f080e] mb-6 flex items-center gap-2 relative z-10">
                  <FaUserShield className="text-gold-600" /> Photo & Privacy
               </h2>
               
               <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                 <div className="flex flex-col items-center gap-4">
                    <div 
                      className="w-40 h-40 rounded-full border-4 border-[#d4af37]/35 shadow-lg overflow-hidden bg-white relative group cursor-pointer" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {photoPreview ? (
                        <img src={photoPreview} alt="Profile Preview" className={`w-full h-full object-cover transition-all ${!formData.isPhotoPublic && 'blur-md'}`} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100"><FaRegImage className="text-4xl" /></div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaCamera className="text-white text-2xl" />
                      </div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()} 
                      className="text-sm font-bold text-[#4f080e] bg-white px-4 py-2 rounded-full hover:bg-crimson-50 transition-colors border border-[#d4af37]/25 shadow-sm cursor-pointer"
                    >
                      Change Photo
                    </button>
                 </div>
                 
                 <div className="flex-1 space-y-4 w-full">
                    <div className={`p-4 rounded-xl border transition-all ${formData.isPhotoPublic ? 'bg-[#4f080e]/5 border-[#4f080e]/15' : 'bg-white/40 border-slate-200'}`}>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <div className="mt-0.5">
                          <input 
                            type="checkbox" 
                            name="isPhotoPublic" 
                            checked={formData.isPhotoPublic} 
                            onChange={handleChange} 
                            className="w-5 h-5 accent-gold-600 rounded cursor-pointer"
                          />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block mb-1 flex items-center gap-2">
                            {formData.isPhotoPublic ? <><FaGlobe className="text-gold-600"/> Public Photo</> : <><FaLock className="text-slate-500"/> Private Photo (Blurred)</>}
                          </span>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            {formData.isPhotoPublic 
                              ? 'Your photo is visible to all registered members on the platform. This increases your chances of finding a match.' 
                              : 'Your photo is blurred for everyone except Premium users who you have accepted an interest request from.'}
                          </p>
                        </div>
                      </label>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                          <label className="text-xs font-bold text-[#4f080e]/80 uppercase tracking-wider pl-0.5">Your Contact Number</label>
                          <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-[#fffdfa]/60 border border-[#d4af37]/25 text-slate-800 focus:border-[#d4af37] focus:bg-white focus:outline-none transition-all text-sm font-semibold shadow-sm" />
                          <p className="text-[10px] text-slate-500 pl-1 font-semibold">This is securely hidden. Only connected premium users can see this.</p>
                      </div>
                      <div className="space-y-1.5">
                          <label className="text-xs font-bold text-[#4f080e]/80 uppercase tracking-wider pl-0.5">Chaperone / Wali Contact Number</label>
                          <input type="text" name="waliContact" value={formData.waliContact} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-[#fffdfa]/60 border border-[#d4af37]/25 text-slate-800 focus:border-[#d4af37] focus:bg-white focus:outline-none transition-all text-sm font-semibold shadow-sm" />
                          <p className="text-[10px] text-slate-500 pl-1 font-semibold">Optional (Wali details are not required to reach 100% completeness).</p>
                      </div>
                    </div>
                 </div>
               </div>
            </div>

            {/* Identity Verification Section */}
            {user?.role !== 'admin' && (
              <div className="glass-card p-6 md:p-8 rounded-2xl border border-[#d4af37]/25 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gold-400/5 rounded-full blur-[60px]"></div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-[#4f080e] mb-2 flex items-center gap-2">
                      🛡️ Profile Verification Status
                    </h2>
                    <p className="text-sm text-slate-500 max-w-xl font-medium leading-relaxed">
                      Get the green verified badge ✅ on your profile by uploading government ID proof (Aadhaar, Passport, driving license). This will build instant trust with other users and get you more matches.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/verify-identity')}
                    className={`px-6 py-3 rounded-full font-bold shadow-md hover:scale-105 transition-all text-xs uppercase tracking-wider cursor-pointer ${
                      user?.isManuallyVerified
                        ? 'bg-emerald-50 border border-emerald-250 text-emerald-800 cursor-default shadow-none hover:scale-100'
                        : 'bg-gradient-to-r from-gold-400 to-gold-600 text-crimson-950 hover:from-gold-300 hover:to-gold-500 border border-gold-300'
                    }`}
                    disabled={user?.isManuallyVerified}
                  >
                    {user?.isManuallyVerified ? '✓ Verified Member' : 'Manage Verification'}
                  </button>
                </div>
              </div>
            )}

            {/* Section 2: Core Biodata */}
            {user?.role !== 'admin' && (
              <div className="glass-card p-6 md:p-8 rounded-2xl border border-[#d4af37]/25 shadow-xl relative overflow-hidden">
                <h2 className="text-xl font-serif font-bold text-[#4f080e] mb-6">Core Biodata</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4f080e]/80 uppercase tracking-wider pl-0.5">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-[#fffdfa]/60 border border-[#d4af37]/25 text-slate-800 focus:border-[#d4af37] focus:bg-white focus:outline-none transition-all text-sm font-semibold shadow-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4f080e]/80 uppercase tracking-wider pl-0.5">Age</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-[#fffdfa]/60 border border-[#d4af37]/25 text-slate-800 focus:border-[#d4af37] focus:bg-white focus:outline-none transition-all text-sm font-semibold shadow-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4f080e]/80 uppercase tracking-wider pl-0.5">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-[#fffdfa]/60 border border-[#d4af37]/25 text-slate-800 focus:border-[#d4af37] focus:bg-white focus:outline-none transition-all text-sm font-semibold shadow-sm">
                      <option value="male" className="bg-white text-slate-800">Male</option>
                      <option value="female" className="bg-white text-slate-800">Female</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4f080e]/80 uppercase tracking-wider pl-0.5">Height</label>
                    <select name="height" value={formData.height} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-[#fffdfa]/60 border border-[#d4af37]/25 text-slate-800 focus:border-[#d4af37] focus:bg-white focus:outline-none transition-all text-sm font-semibold shadow-sm">
                      <option value="5'0&quot;" className="bg-white text-slate-800">5'0"</option>
                      <option value="5'2&quot;" className="bg-white text-slate-800">5'2"</option>
                      <option value="5'4&quot;" className="bg-white text-slate-800">5'4"</option>
                      <option value="5'6&quot;" className="bg-white text-slate-800">5'6"</option>
                      <option value="5'8&quot;" className="bg-white text-slate-800">5'8"</option>
                      <option value="5'10&quot;" className="bg-white text-slate-800">5'10"</option>
                      <option value="6'0&quot;" className="bg-white text-slate-800">6'0"</option>
                      <option value="6'2&quot;" className="bg-white text-slate-800">6'2"+</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4f080e]/80 uppercase tracking-wider pl-0.5">Marital Status</label>
                    <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-[#fffdfa]/60 border border-[#d4af37]/25 text-slate-800 focus:border-[#d4af37] focus:bg-white focus:outline-none transition-all text-sm font-semibold shadow-sm">
                      <option value="Never Married" className="bg-white text-slate-800">Never Married</option>
                      <option value="Divorced" className="bg-white text-slate-800">Divorced</option>
                      <option value="Widowed" className="bg-white text-slate-800">Widowed</option>
                      <option value="Awaiting Divorce" className="bg-white text-slate-800">Awaiting Divorce</option>
                    </select>
                  </div>
   
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4f080e]/80 uppercase tracking-wider pl-0.5">Sect</label>
                    <select name="sect" value={formData.sect} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-[#fffdfa]/60 border border-[#d4af37]/25 text-slate-800 focus:border-[#d4af37] focus:bg-white focus:outline-none transition-all text-sm font-semibold shadow-sm">
                      <option value="Sunni" className="bg-white text-slate-800">Sunni</option>
                      <option value="Shia" className="bg-white text-slate-800">Shia</option>
                      <option value="Sufi" className="bg-white text-slate-800">Sufi</option>
                      <option value="Other" className="bg-white text-slate-800">Other</option>
                      <option value="No Preference" className="bg-white text-slate-800">No Preference</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4f080e]/80 uppercase tracking-wider pl-0.5">Namaz Frequency</label>
                    <select name="namazFrequency" value={formData.namazFrequency} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-[#fffdfa]/60 border border-[#d4af37]/25 text-slate-800 focus:border-[#d4af37] focus:bg-white focus:outline-none transition-all text-sm font-semibold shadow-sm">
                      <option value="Always Praying" className="bg-white text-slate-800">Always Praying</option>
                      <option value="Usually Praying" className="bg-white text-slate-800">Usually Praying</option>
                      <option value="Sometimes Praying" className="bg-white text-slate-800">Sometimes Praying</option>
                      <option value="Only Jummah" className="bg-white text-slate-800">Only Jummah</option>
                      <option value="Eid Only" className="bg-white text-slate-800">Eid Only</option>
                    </select>
                  </div>
   
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4f080e]/80 uppercase tracking-wider pl-0.5">Mother Tongue</label>
                    <input type="text" name="motherTongue" value={formData.motherTongue} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-[#fffdfa]/60 border border-[#d4af37]/25 text-slate-800 focus:border-[#d4af37] focus:bg-white focus:outline-none transition-all text-sm font-semibold shadow-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4f080e]/80 uppercase tracking-wider pl-0.5">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-[#fffdfa]/60 border border-[#d4af37]/25 text-slate-800 focus:border-[#d4af37] focus:bg-white focus:outline-none transition-all text-sm font-semibold shadow-sm" />
                  </div>
                  
                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="text-xs font-bold text-[#4f080e]/80 uppercase tracking-wider pl-0.5">About Me</label>
                    <textarea name="about" value={formData.about} onChange={handleChange} rows="4" className="w-full px-4 py-3 rounded-xl bg-[#fffdfa]/60 border border-[#d4af37]/25 text-slate-800 focus:border-[#d4af37] focus:bg-white focus:outline-none transition-all text-sm resize-none font-semibold shadow-sm"></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Professional & Family */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card p-6 rounded-2xl border border-[#d4af37]/25 shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-serif font-bold text-[#4f080e]">Education & Career</h2>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    isCareerComplete 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-250 animate-pulse'
                  }`}>
                    {isCareerComplete ? '✓ Complete' : 'Required +40%'}
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4f080e]/80 uppercase tracking-wider pl-0.5">Profession</label>
                    <input 
                      type="text" 
                      name="profession" 
                      value={formData.profession} 
                      onChange={handleChange} 
                      className={`w-full px-4 py-3 rounded-xl bg-[#fffdfa]/60 text-slate-800 border focus:border-[#d4af37] focus:bg-white focus:outline-none transition-all text-sm font-semibold shadow-sm ${
                        isProfessionEmpty ? 'border-amber-500/50 shadow-sm shadow-amber-500/10' : 'border-[#d4af37]/25'
                      }`} 
                    />
                    {isProfessionEmpty && (
                      <p className="text-[10px] text-amber-600 font-semibold pl-1 mt-1">* Specify your profession (do not use 'Not Specified').</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4f080e]/80 uppercase tracking-wider pl-0.5">Annual Income</label>
                    <select 
                      name="annualIncome" 
                      value={formData.annualIncome} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 rounded-xl bg-[#fffdfa]/60 border border-[#d4af37]/25 text-slate-800 focus:border-[#d4af37] focus:bg-white focus:outline-none transition-all text-sm font-semibold shadow-sm"
                    >
                      <option value="Not Specified" className="bg-white text-slate-800">Not Specified</option>
                      <option value="Under 1 Lakh" className="bg-white text-slate-800">Under 1 Lakh</option>
                      <option value="1 - 3 Lakhs" className="bg-white text-slate-800">1 - 3 Lakhs</option>
                      <option value="3 - 5 Lakhs" className="bg-white text-slate-800">3 - 5 Lakhs</option>
                      <option value="5 - 7 Lakhs" className="bg-white text-slate-800">5 - 7 Lakhs</option>
                      <option value="7 - 10 Lakhs" className="bg-white text-slate-800">7 - 10 Lakhs</option>
                      <option value="10 - 15 Lakhs" className="bg-white text-slate-800">10 - 15 Lakhs</option>
                      <option value="15+ Lakhs" className="bg-white text-slate-800">15+ Lakhs</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4f080e]/80 uppercase tracking-wider pl-0.5">Highest Education</label>
                    <input 
                      type="text" 
                      name="education" 
                      value={formData.education} 
                      onChange={handleChange} 
                      className={`w-full px-4 py-3 rounded-xl bg-[#fffdfa]/60 text-slate-800 border focus:border-[#d4af37] focus:bg-white focus:outline-none transition-all text-sm font-semibold shadow-sm ${
                        isEducationEmpty ? 'border-amber-500/50 shadow-sm shadow-amber-500/10' : 'border-[#d4af37]/25'
                      }`} 
                    />
                    {isEducationEmpty && (
                      <p className="text-[10px] text-amber-600 font-semibold pl-1 mt-1">* Specify highest education (do not use 'Not Specified').</p>
                    )}
                  </div>
                </div>
              </div>
 
              <div className="glass-card p-6 rounded-2xl border border-[#d4af37]/25 shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-serif font-bold text-[#4f080e]">Family Background</h2>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    isFamilyComplete 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-250 animate-pulse'
                  }`}>
                    {isFamilyComplete ? '✓ Complete' : 'Required +40%'}
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4f080e]/80 uppercase tracking-wider pl-0.5">Father's Occupation</label>
                    <input 
                      type="text" 
                      name="fatherOccupation" 
                      value={formData.fatherOccupation} 
                      onChange={handleChange} 
                      className={`w-full px-4 py-3 rounded-xl bg-[#fffdfa]/60 text-slate-800 border focus:border-[#d4af37] focus:bg-white focus:outline-none transition-all text-sm font-semibold shadow-sm ${
                        isFatherOccupationEmpty ? 'border-amber-500/50 shadow-sm shadow-amber-500/10' : 'border-[#d4af37]/25'
                      }`} 
                    />
                    {isFatherOccupationEmpty && (
                      <p className="text-[10px] text-amber-600 font-semibold pl-1 mt-1">* Father's Occupation is required to complete Family details.</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4f080e]/80 uppercase tracking-wider pl-0.5">Mother's Occupation</label>
                    <input type="text" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-[#fffdfa]/60 border border-[#d4af37]/25 text-slate-800 focus:border-[#d4af37] focus:bg-white focus:outline-none transition-all text-sm font-semibold shadow-sm" />
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-slate-200/50 col-span-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-[#4f080e]/80 uppercase tracking-wider pl-0.5">Siblings Details</label>
                      <button 
                        type="button" 
                        onClick={handleAddSibling}
                        className="text-xs font-bold text-crimson-900 bg-white hover:bg-crimson-50 px-3 py-1.5 rounded-lg border border-[#d4af37]/25 shadow-sm transition-all cursor-pointer hover:-translate-y-0.5"
                      >
                        + Add Sibling
                      </button>
                    </div>
                    
                    {formData.siblingsList && formData.siblingsList.map((sib, index) => (
                      <div key={index} className="p-3.5 bg-white/50 rounded-xl border border-[#d4af37]/20 space-y-3 relative shadow-sm">
                        <button 
                          type="button" 
                          onClick={() => handleRemoveSibling(index)}
                          className="absolute top-2.5 right-2.5 text-xs text-red-500 hover:text-red-600 font-bold cursor-pointer transition-colors"
                        >
                          Remove
                        </button>
                        <div className="text-[10px] font-bold text-[#4f080e]/80">Sibling #{index + 1}</div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500">Relation</label>
                            <select 
                              value={sib.relation} 
                              onChange={(e) => handleSiblingFieldChange(index, 'relation', e.target.value)}
                              className="w-full px-2 py-1 rounded bg-white border border-[#d4af37]/25 text-slate-800 text-xs font-semibold focus:outline-none focus:border-[#d4af37]"
                            >
                              <option value="Elder Brother" className="bg-white text-slate-800">Elder Brother</option>
                              <option value="Younger Brother" className="bg-white text-slate-800">Younger Brother</option>
                              <option value="Elder Sister" className="bg-white text-slate-800">Elder Sister</option>
                              <option value="Younger Sister" className="bg-white text-slate-800">Younger Sister</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500">Marital Status</label>
                            <select 
                              value={sib.maritalStatus} 
                              onChange={(e) => handleSiblingFieldChange(index, 'maritalStatus', e.target.value)}
                              className="w-full px-2 py-1 rounded bg-white border border-[#d4af37]/25 text-slate-800 text-xs font-semibold focus:outline-none focus:border-[#d4af37]"
                            >
                              <option value="Unmarried" className="bg-white text-slate-800">Unmarried</option>
                              <option value="Married" className="bg-white text-slate-800">Married</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Occupation (optional)</label>
                          <input 
                            type="text" 
                            value={sib.occupation || ''} 
                            onChange={(e) => handleSiblingFieldChange(index, 'occupation', e.target.value)}
                            placeholder="e.g. Student, Software Engineer" 
                            className="w-full px-2 py-1.5 rounded bg-white border border-[#d4af37]/25 text-slate-800 text-xs font-semibold focus:outline-none focus:border-[#d4af37]"
                          />
                        </div>
                      </div>
                    ))}
                    
                    {(!formData.siblingsList || formData.siblingsList.length === 0) && (
                      <p className="text-xs text-slate-500 italic text-center py-2 font-medium">No siblings added yet. Click "+ Add Sibling" to list them in order of birth.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
 
            {/* Section 4: Partner Preferences */}
            <div className="p-6 md:p-8 rounded-2xl border border-[#d4af37]/40 shadow-2xl relative overflow-hidden bg-gradient-to-br from-[#4f080e] via-[#3a060a] to-[#220305] transform transition-all duration-300 hover:scale-[1.01]">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#d4af37]/10 rounded-full blur-[60px] pointer-events-none"></div>
              
              <div className="mb-6 relative z-10 border-b border-[#d4af37]/20 pb-4">
                <h2 className="text-2xl font-serif font-bold text-[#d4af37] flex items-center gap-3">
                  <FaHeart className="text-[#d4af37] animate-pulse" /> Partner Preferences
                </h2>
                <p className="text-sm text-[#fcdbb4]/70 mt-1.5 font-medium">Set your preferences to help us find the most compatible matches for you.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
                <div className="space-y-1.5 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                  <label className="text-xs font-bold text-[#d4af37] uppercase tracking-wider pl-0.5">Preferred Age Range</label>
                  <input type="text" name="partnerAgeRange" value={formData.partnerAgeRange} onChange={handleChange} placeholder="e.g. 20-25" className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/30 focus:border-[#d4af37] focus:bg-black/40 focus:outline-none transition-all text-sm font-semibold shadow-inner" />
                </div>
                <div className="space-y-1.5 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                  <label className="text-xs font-bold text-[#d4af37] uppercase tracking-wider pl-0.5">Preferred Sect</label>
                  <select name="partnerSect" value={formData.partnerSect} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:border-[#d4af37] focus:bg-black/40 focus:outline-none transition-all text-sm font-semibold shadow-inner">
                    <option value="No Preference" className="bg-[#4f080e] text-white">No Preference</option>
                    <option value="Sunni" className="bg-[#4f080e] text-white">Sunni</option>
                    <option value="Shia" className="bg-[#4f080e] text-white">Shia</option>
                    <option value="Sufi" className="bg-[#4f080e] text-white">Sufi</option>
                  </select>
                </div>
                <div className="space-y-1.5 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                  <label className="text-xs font-bold text-[#d4af37] uppercase tracking-wider pl-0.5">Preferred Education</label>
                  <input type="text" name="partnerEducation" value={formData.partnerEducation} onChange={handleChange} placeholder="e.g. Graduate" className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/30 focus:border-[#d4af37] focus:bg-black/40 focus:outline-none transition-all text-sm font-semibold shadow-inner" />
                </div>
              </div>
            </div>

          </form>
        </div>
      </div>

      {/* Floating Sticky Save Bar (only visible when form is modified/dirty) */}
      {isFormDirty && (
        <div className="fixed bottom-[76px] lg:bottom-6 left-4 right-4 z-50 flex justify-center animate-slideUp">
          <div className="w-full max-w-4xl bg-gradient-to-r from-[#4f080e] to-[#300508] border border-gold-500/30 rounded-2xl px-4 py-3 sm:py-4 flex justify-between items-center shadow-[0_10px_30px_rgba(79,8,14,0.35)] text-white">
            <span className="text-xs sm:text-sm font-extrabold text-gold-400 flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
              Unsaved Changes
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (profile) {
                    setFormData({
                      name: profile.name || '',
                      age: profile.age || '',
                      gender: profile.gender || '',
                      sect: profile.sect || '',
                      profession: profile.profession || '',
                      annualIncome: profile.annualIncome || 'Not Specified',
                      education: profile.education || '',
                      city: profile.city || '',
                      about: profile.about || '',
                      phoneNumber: profile.phoneNumber || '',
                      waliContact: profile.waliContact || '',
                      height: profile.height || '',
                      maritalStatus: profile.maritalStatus || '',
                      motherTongue: profile.motherTongue || '',
                      namazFrequency: profile.namazFrequency || '',
                      isPhotoPublic: profile.isPhotoPublic !== undefined ? profile.isPhotoPublic : true,
                      fatherOccupation: profile.familyDetails?.fatherOccupation || '',
                      motherOccupation: profile.familyDetails?.motherOccupation || '',
                      siblingsCount: profile.familyDetails?.siblingsCount || 0,
                      siblingsList: profile.familyDetails?.siblingsList || [],
                      partnerAgeRange: profile.partnerPreferences?.ageRange || '',
                      partnerSect: profile.partnerPreferences?.sectPreference || '',
                      partnerEducation: profile.partnerPreferences?.educationPreference || ''
                    });
                    setPhotoFile(null);
                    setPhotoPreview(profile.profilePhoto && profile.profilePhoto !== '/uploads/default-avatar.png' ? `${SOCKET_BASE_URL}${profile.profilePhoto}` : '');
                    toast('Changes discarded');
                  }
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold text-[#faf8f5] bg-transparent border border-white/20 hover:bg-white/10 active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gold-gradient text-crimson-950 px-5 py-1.5 rounded-full font-bold shadow-md hover:scale-105 active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-crimson-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>Save Changes</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfile;
