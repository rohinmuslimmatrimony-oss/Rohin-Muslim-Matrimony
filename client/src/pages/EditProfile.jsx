import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api, { SOCKET_BASE_URL } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FaCamera, FaSave, FaUserShield, FaRegImage, FaLock, FaGlobe } from 'react-icons/fa';
import MobileProfilePage from '../components/MobileProfilePage';

const EditProfile = () => {
  const { user, profile, refreshUser, getCompleteness } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [showMobileForm, setShowMobileForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    sect: '',
    profession: '',
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
      'name', 'age', 'gender', 'sect', 'profession', 'education', 
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
        setShowMobileForm(false); // Go back to profile view on mobile
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) return null;

  return (
    <>
      {/* MOBILE VIEW DASHBOARD */}
      {!showMobileForm && (
        <div className="block lg:hidden">
          <MobileProfilePage onEditClick={() => setShowMobileForm(true)} />
        </div>
      )}

      {/* DESKTOP VIEW & MOBILE FORM VIEW */}
      <div className={`${!showMobileForm ? 'hidden lg:block' : 'block'} min-h-screen bg-cream-50 pt-24 pb-12 px-4 md:px-8`}>
        <div className="max-w-4xl mx-auto">
          {showMobileForm && (
            <button 
              onClick={() => setShowMobileForm(false)} 
              className="lg:hidden mb-6 text-crimson-600 font-bold flex items-center gap-2 bg-crimson-50 px-4 py-2 rounded-full border border-crimson-100"
            >
              ← Back to Profile
            </button>
          )}
          <h1 className="text-3xl font-serif font-bold text-crimson-950 mb-2">Edit Your Profile</h1>
          <p className="text-slate-600 mb-6">Update your biodata, preferences, and privacy settings.</p>

          {/* Real-time Completeness Progress Header */}
          <div className="bg-gradient-to-r from-crimson-900 to-crimson-950 text-white rounded-3xl p-6 md:p-8 mb-8 border border-gold-500/20 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-[80px]"></div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div>
                <h2 className="text-xl font-serif font-bold text-gold-400">Profile Completeness: {score}%</h2>
                <p className="text-xs text-slate-300 mt-1">
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

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Photo & Privacy */}
            <div className="glass-card p-6 md:p-8 rounded-3xl border border-crimson-900/10 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-crimson-900/5 rounded-full blur-[80px]"></div>
               
               <h2 className="text-xl font-serif font-bold text-crimson-950 mb-6 flex items-center gap-2 relative z-10">
                  <FaUserShield className="text-gold-500" /> Photo & Privacy
               </h2>
               
               <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                 <div className="flex flex-col items-center gap-4">
                   <div className="w-40 h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-200 relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
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
                   <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-bold text-crimson-800 bg-crimson-50 px-4 py-2 rounded-full hover:bg-crimson-100 transition-colors border border-crimson-200">
                     Change Photo
                   </button>
                 </div>
                 
                 <div className="flex-1 space-y-4">
                   <div className={`p-4 rounded-xl border transition-colors ${formData.isPhotoPublic ? 'bg-crimson-50 border-crimson-200' : 'bg-slate-100 border-slate-300'}`}>
                     <label className="flex items-start gap-3 cursor-pointer">
                       <div className="mt-0.5">
                         <input 
                           type="checkbox" 
                           name="isPhotoPublic" 
                           checked={formData.isPhotoPublic} 
                           onChange={handleChange} 
                           className="w-5 h-5 accent-crimson-600 rounded cursor-pointer"
                         />
                       </div>
                       <div>
                         <span className="font-bold text-slate-800 block mb-1 flex items-center gap-2">
                           {formData.isPhotoPublic ? <><FaGlobe className="text-crimson-600"/> Public Photo</> : <><FaLock className="text-slate-500"/> Private Photo (Blurred)</>}
                         </span>
                         <p className="text-xs text-slate-500 leading-relaxed">
                           {formData.isPhotoPublic 
                             ? 'Your photo is visible to all registered members on the platform. This increases your chances of finding a match.' 
                             : 'Your photo is blurred for everyone except Premium users who you have accepted an interest request from.'}
                         </p>
                       </div>
                     </label>
                   </div>
                   
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">Your Contact Number</label>
                         <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
                         <p className="text-[10px] text-slate-400 pl-1">This is securely hidden. Only connected premium users can see this.</p>
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">Chaperone / Wali Contact Number</label>
                         <input type="text" name="waliContact" value={formData.waliContact} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
                         <p className="text-[10px] text-slate-400 pl-1">Optional (Wali details are not required to reach 100% completeness).</p>
                      </div>
                     </div>
                  </div>
                </div>
            </div>

            {/* Identity Verification Section */}
            <div className="glass-card p-6 md:p-8 rounded-3xl border border-crimson-900/10 shadow-sm relative overflow-hidden bg-gradient-to-r from-cream-50 to-white">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/5 rounded-full blur-[60px]"></div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <div>
                  <h2 className="text-xl font-serif font-bold text-crimson-950 mb-2 flex items-center gap-2">
                    🛡️ Profile Verification Status
                  </h2>
                  <p className="text-sm text-slate-600 max-w-xl">
                    Get the green verified badge ✅ on your profile by uploading government ID proof (Aadhaar, Passport, driving license). This will build instant trust with other users and get you more matches.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/verify-identity')}
                  className={`px-6 py-3 rounded-full font-bold shadow-md hover:scale-105 transition-all text-xs uppercase tracking-wider ${
                    user?.isManuallyVerified
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 cursor-default shadow-none hover:scale-100'
                      : 'bg-crimson-950 hover:bg-crimson-900 text-gold-400'
                  }`}
                  disabled={user?.isManuallyVerified}
                >
                  {user?.isManuallyVerified ? '✓ Verified Member' : 'Manage Verification'}
                </button>
              </div>
            </div>

            {/* Section 2: Core Biodata */}
            <div className="glass-card p-6 md:p-8 rounded-3xl border border-crimson-900/10 shadow-sm relative overflow-hidden">
              <h2 className="text-xl font-serif font-bold text-crimson-950 mb-6">Core Biodata</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">Height</label>
                  <select name="height" value={formData.height} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm">
                    <option value="5'0&quot;">5'0"</option>
                    <option value="5'2&quot;">5'2"</option>
                    <option value="5'4&quot;">5'4"</option>
                    <option value="5'6&quot;">5'6"</option>
                    <option value="5'8&quot;">5'8"</option>
                    <option value="5'10&quot;">5'10"</option>
                    <option value="6'0&quot;">6'0"</option>
                    <option value="6'2&quot;">6'2"+</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">Marital Status</label>
                  <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm">
                    <option value="Never Married">Never Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Awaiting Divorce">Awaiting Divorce</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">Sect</label>
                  <select name="sect" value={formData.sect} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm">
                    <option value="Sunni">Sunni</option>
                    <option value="Shia">Shia</option>
                    <option value="Sufi">Sufi</option>
                    <option value="Other">Other</option>
                    <option value="No Preference">No Preference</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">Namaz Frequency</label>
                  <select name="namazFrequency" value={formData.namazFrequency} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm">
                    <option value="Always Praying">Always Praying</option>
                    <option value="Usually Praying">Usually Praying</option>
                    <option value="Sometimes Praying">Sometimes Praying</option>
                    <option value="Only Eid/Jumma">Only Eid/Jumma</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">Mother Tongue</label>
                  <input type="text" name="motherTongue" value={formData.motherTongue} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
                </div>
                
                <div className="space-y-1.5 col-span-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">About Me</label>
                  <textarea name="about" value={formData.about} onChange={handleChange} rows="4" className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm resize-none"></textarea>
                </div>
              </div>
            </div>

            {/* Section 3: Professional & Family */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card p-6 rounded-3xl border border-crimson-900/10 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-serif font-bold text-crimson-950">Education & Career</h2>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    isCareerComplete 
                      ? 'bg-green-500/10 text-green-600 border-green-200' 
                      : 'bg-amber-500/10 text-amber-600 border-amber-200 animate-pulse'
                  }`}>
                    {isCareerComplete ? '✓ Complete' : 'Required +40%'}
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">Profession</label>
                    <input 
                      type="text" 
                      name="profession" 
                      value={formData.profession} 
                      onChange={handleChange} 
                      className={`w-full px-4 py-3 rounded-xl bg-white/70 border focus:border-gold-500 focus:outline-none transition-all text-sm ${
                        isProfessionEmpty ? 'border-amber-500/40 shadow-sm shadow-amber-500/5' : 'border-slate-200'
                      }`} 
                    />
                    {isProfessionEmpty && (
                      <p className="text-[10px] text-amber-600 font-semibold pl-1 mt-1">* Specify your profession (do not use 'Not Specified').</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">Highest Education</label>
                    <input 
                      type="text" 
                      name="education" 
                      value={formData.education} 
                      onChange={handleChange} 
                      className={`w-full px-4 py-3 rounded-xl bg-white/70 border focus:border-gold-500 focus:outline-none transition-all text-sm ${
                        isEducationEmpty ? 'border-amber-500/40 shadow-sm shadow-amber-500/5' : 'border-slate-200'
                      }`} 
                    />
                    {isEducationEmpty && (
                      <p className="text-[10px] text-amber-600 font-semibold pl-1 mt-1">* Specify highest education (do not use 'Not Specified').</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-3xl border border-crimson-900/10 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-serif font-bold text-crimson-950">Family Background</h2>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    isFamilyComplete 
                      ? 'bg-green-500/10 text-green-600 border-green-200' 
                      : 'bg-amber-500/10 text-amber-600 border-amber-200 animate-pulse'
                  }`}>
                    {isFamilyComplete ? '✓ Complete' : 'Required +40%'}
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">Father's Occupation</label>
                    <input 
                      type="text" 
                      name="fatherOccupation" 
                      value={formData.fatherOccupation} 
                      onChange={handleChange} 
                      className={`w-full px-4 py-3 rounded-xl bg-white/70 border focus:border-gold-500 focus:outline-none transition-all text-sm ${
                        isFatherOccupationEmpty ? 'border-amber-500/40 shadow-sm shadow-amber-500/5' : 'border-slate-200'
                      }`} 
                    />
                    {isFatherOccupationEmpty && (
                      <p className="text-[10px] text-amber-600 font-semibold pl-1 mt-1">* Father's Occupation is required to complete Family details.</p>
                    )}
                  </div>
                   <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">Mother's Occupation</label>
                    <input type="text" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-slate-100 col-span-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">Siblings Details</label>
                      <button 
                        type="button" 
                        onClick={handleAddSibling}
                        className="text-xs font-bold text-crimson-800 bg-crimson-50 hover:bg-crimson-100 px-3 py-1.5 rounded-lg border border-crimson-200 transition-colors"
                      >
                        + Add Sibling
                      </button>
                    </div>
                    
                    {formData.siblingsList && formData.siblingsList.map((sib, index) => (
                      <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative">
                        <button 
                          type="button" 
                          onClick={() => handleRemoveSibling(index)}
                          className="absolute top-2 right-2 text-xs text-red-500 hover:text-red-700 font-bold"
                        >
                          Remove
                        </button>
                        <div className="text-[10px] font-bold text-slate-400">Sibling #{index + 1}</div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500">Relation</label>
                            <select 
                              value={sib.relation} 
                              onChange={(e) => handleSiblingFieldChange(index, 'relation', e.target.value)}
                              className="w-full px-2 py-1 rounded bg-white border border-slate-200 text-xs focus:outline-none"
                            >
                              <option value="Elder Brother">Elder Brother</option>
                              <option value="Younger Brother">Younger Brother</option>
                              <option value="Elder Sister">Elder Sister</option>
                              <option value="Younger Sister">Younger Sister</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500">Marital Status</label>
                            <select 
                              value={sib.maritalStatus} 
                              onChange={(e) => handleSiblingFieldChange(index, 'maritalStatus', e.target.value)}
                              className="w-full px-2 py-1 rounded bg-white border border-slate-200 text-xs focus:outline-none"
                            >
                              <option value="Unmarried">Unmarried</option>
                              <option value="Married">Married</option>
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
                            className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                    
                    {(!formData.siblingsList || formData.siblingsList.length === 0) && (
                      <p className="text-xs text-slate-400 italic text-center py-2">No siblings added yet. Click "+ Add Sibling" to list them in order of birth.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Partner Preferences */}
            <div className="glass-card p-6 md:p-8 rounded-3xl border border-crimson-900/10 shadow-sm">
              <h2 className="text-xl font-serif font-bold text-crimson-950 mb-6">Partner Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">Preferred Age Range</label>
                  <input type="text" name="partnerAgeRange" value={formData.partnerAgeRange} onChange={handleChange} placeholder="e.g. 20-25" className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">Preferred Sect</label>
                  <select name="partnerSect" value={formData.partnerSect} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm">
                    <option value="No Preference">No Preference</option>
                    <option value="Sunni">Sunni</option>
                    <option value="Shia">Shia</option>
                    <option value="Sufi">Sufi</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">Preferred Education</label>
                  <input type="text" name="partnerEducation" value={formData.partnerEducation} onChange={handleChange} placeholder="e.g. Graduate" className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
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
