import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaCamera, FaSave, FaUserShield, FaRegImage, FaLock, FaGlobe } from 'react-icons/fa';

const EditProfile = () => {
  const { user, profile, refreshUser } = useContext(AuthContext);
  
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
    height: '',
    maritalStatus: '',
    motherTongue: '',
    namazFrequency: '',
    isPhotoPublic: true,
    fatherOccupation: '',
    motherOccupation: '',
    siblingsCount: 0,
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
        phoneNumber: profile.phoneNumber || profile.waliContact || '',
        height: profile.height || '',
        maritalStatus: profile.maritalStatus || '',
        motherTongue: profile.motherTongue || '',
        namazFrequency: profile.namazFrequency || '',
        isPhotoPublic: profile.isPhotoPublic !== undefined ? profile.isPhotoPublic : true,
        fatherOccupation: profile.familyDetails?.fatherOccupation || '',
        motherOccupation: profile.familyDetails?.motherOccupation || '',
        siblingsCount: profile.familyDetails?.siblingsCount || 0,
        partnerAgeRange: profile.partnerPreferences?.ageRange || '',
        partnerSect: profile.partnerPreferences?.sectPreference || '',
        partnerEducation: profile.partnerPreferences?.educationPreference || ''
      });
      
      if (profile.profilePhoto && profile.profilePhoto !== '/uploads/default-avatar.png') {
        setPhotoPreview(`http://localhost:5000${profile.profilePhoto}`);
      }
    }
  }, [profile]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      if (photoFile) {
        data.append('profilePhoto', photoFile);
      }

      const res = await api.put('/profiles/my-profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Profile updated successfully!');
        await refreshUser(); // Refresh global context
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-cream-50 pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-crimson-950 mb-2">Edit Your Profile</h1>
        <p className="text-slate-600 mb-8">Update your biodata, preferences, and privacy settings.</p>

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
                 
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">Contact Number / Wali Phone</label>
                    <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
                    <p className="text-[10px] text-slate-400 pl-1">This is securely hidden. Only connected premium users can see this.</p>
                 </div>
               </div>
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
              <h2 className="text-lg font-serif font-bold text-crimson-950 mb-4">Education & Career</h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">Profession</label>
                  <input type="text" name="profession" value={formData.profession} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">Highest Education</label>
                  <input type="text" name="education" value={formData.education} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-crimson-900/10 shadow-sm">
              <h2 className="text-lg font-serif font-bold text-crimson-950 mb-4">Family Background</h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">Father's Occupation</label>
                  <input type="text" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">Mother's Occupation</label>
                  <input type="text" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-0.5">Number of Siblings</label>
                  <input type="number" name="siblingsCount" min="0" value={formData.siblingsCount} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
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

          {/* Action Bar */}
          <div className="flex justify-end pt-4 border-t border-crimson-900/10">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gold-gradient text-crimson-950 px-10 py-4 rounded-full font-bold shadow-lg shadow-gold-500/20 hover:scale-105 transition-transform text-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100"
            >
              {isSubmitting ? (
                <span className="w-6 h-6 border-2 border-crimson-950 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <><FaSave /> Save Profile Changes</>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditProfile;
