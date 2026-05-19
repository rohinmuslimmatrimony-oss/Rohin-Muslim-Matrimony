import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaLock, 
  FaUserLock, FaHeart, FaExclamationTriangle, FaStar, 
  FaPhoneAlt, FaEnvelope, FaMosque, FaUsers, FaRulerVertical, FaLanguage
} from 'react-icons/fa';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [profile, setProfile] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportText, setReportText] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, [id]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/profiles/${id}`);
      if (res.data.success) {
        setProfile(res.data.data);
        setIsConnected(res.data.isConnected);
      }
    } catch (error) {
      if (error.response?.data?.limitExceeded) {
        toast.error(error.response.data.message);
        navigate('/plans');
      } else {
        toast.error(error.response?.data?.message || 'Profile not found');
        navigate('/search');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportText.trim()) return;
    
    try {
      const res = await api.post('/reports', { reportedUserId: id, reason: reportText });
      if (res.data.success) {
        toast.success('Report submitted to admin successfully. Jazakallah.');
        setIsReportModalOpen(false);
        setReportText('');
      }
    } catch (error) {
      toast.error('Failed to submit report');
    }
  };

  const handleShortlist = async () => {
    try {
      const res = await api.post(`/profiles/shortlist/${id}`);
      if (res.data.success) {
        toast.success(res.data.message);
        // Refresh profile to update shortlist status locally
        fetchProfileData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 pt-24 pb-12 flex justify-center items-center">
        <span className="w-12 h-12 border-4 border-crimson-950 border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  if (!profile) return null;

  const isLocked = profile.locked;
  const isOwnProfile = user?._id === id;

  return (
    <div className="min-h-screen bg-cream-50 pt-24 pb-12 px-4 md:px-8 relative">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-crimson-900 font-semibold flex items-center gap-2 transition-colors">
            &larr; Back to Search
          </button>
          
          <div className="flex items-center gap-3">
            {!isOwnProfile && (
              <>
                <button onClick={() => setIsReportModalOpen(true)} className="text-xs text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors">
                  <FaExclamationTriangle /> Report User
                </button>
                <button onClick={handleShortlist} className="text-xs text-gold-600 bg-gold-50 hover:bg-gold-100 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors">
                  <FaStar /> {profile.shortlistedBy?.includes(user?._id) ? 'Shortlisted' : 'Shortlist'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Profile Card */}
        <div className="glass-card rounded-3xl border border-crimson-900/10 overflow-hidden shadow-sm">
          
          {/* Header Region */}
          <div className="h-40 md:h-56 bg-crimson-950 relative overflow-hidden">
            <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-gold-500/20 rounded-full blur-[60px]"></div>
          </div>

          {/* Profile Photo & Summary */}
          <div className="px-6 md:px-10 pb-10 relative">
            <div className="flex flex-col md:flex-row gap-6 relative -top-16">
              
              {/* Photo Area */}
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-cream-50 bg-slate-900 shadow-xl overflow-hidden relative flex-shrink-0 mx-auto md:mx-0">
                {profile.profilePhoto && profile.profilePhoto !== '/uploads/default-avatar.png' ? (
                  <img src={`http://localhost:5000${profile.profilePhoto}`} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-gold-500 font-serif font-bold uppercase bg-crimson-900">
                    {profile.name[0]}
                  </div>
                )}
                
                {profile.user?.isManuallyVerified && (
                  <div className="absolute bottom-2 right-2 bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white" title="Admin Verified">
                    ✓
                  </div>
                )}
              </div>

              {/* Title & Core Details */}
              <div className="pt-2 md:pt-16 flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-serif font-bold text-crimson-950 mb-1 flex items-center justify-center md:justify-start gap-2">
                      {profile.name} <span className="font-sans font-light text-xl text-slate-500">{profile.age}</span>
                    </h1>
                    <p className="text-slate-500 font-medium">{profile.profileCreatedBy === 'Self' ? 'Profile created by Self' : `Profile created by ${profile.profileCreatedBy}`}</p>
                  </div>
                  
                  {!isOwnProfile && (
                    <div className="flex flex-col gap-2">
                      {isConnected ? (
                        <span className="bg-crimson-100 text-crimson-800 px-4 py-2 rounded-full font-bold text-sm shadow-sm border border-crimson-200">
                          Mutual Connection ✓
                        </span>
                      ) : (
                        <button className="bg-gold-gradient text-crimson-950 px-6 py-2.5 rounded-full font-bold shadow-lg shadow-gold-500/20 hover:scale-105 transition-transform flex items-center gap-2">
                          <FaHeart /> Send Interest
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5 bg-crimson-50 px-3 py-1.5 rounded-lg border border-crimson-100">
                    <FaMapMarkerAlt className="text-crimson-700" /> {profile.city}
                  </span>
                  <span className="flex items-center gap-1.5 bg-crimson-50 px-3 py-1.5 rounded-lg border border-crimson-100">
                    <FaMosque className="text-crimson-700" /> {profile.sect}
                  </span>
                  <span className="flex items-center gap-1.5 bg-crimson-50 px-3 py-1.5 rounded-lg border border-crimson-100">
                    <FaUsers className="text-crimson-700" /> {profile.maritalStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Grid Information Layout */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: Basic Bio & Deen */}
              <div className="space-y-8">
                {/* About Me */}
                <div>
                  <h3 className="text-lg font-serif font-bold text-crimson-950 mb-3 border-b border-crimson-900/10 pb-2">About Me</h3>
                  {isLocked ? (
                    <div className="bg-slate-100 p-4 rounded-xl text-slate-500 italic text-sm border border-slate-200 flex items-start gap-3">
                      <FaUserLock className="text-gold-500 text-xl mt-0.5" />
                      <span>{profile.about}</span>
                    </div>
                  ) : (
                    <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap bg-white p-4 rounded-xl border border-crimson-900/5">
                      {profile.about}
                    </p>
                  )}
                </div>

                {/* Personal Attributes */}
                <div>
                  <h3 className="text-lg font-serif font-bold text-crimson-950 mb-3 border-b border-crimson-900/10 pb-2">Personal & Religious Attributes</h3>
                  <div className="bg-white p-4 rounded-xl border border-crimson-900/5 grid grid-cols-2 gap-y-4 text-sm">
                    <div>
                      <span className="block text-xs text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><FaRulerVertical /> Height</span>
                      <span className="font-semibold text-slate-700">{profile.height || "Not specified"}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><FaLanguage /> Mother Tongue</span>
                      <span className="font-semibold text-slate-700">{profile.motherTongue || "Not specified"}</span>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-slate-100">
                      <span className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Namaz Frequency</span>
                      <span className="font-semibold text-crimson-800 bg-crimson-50 px-2 py-1 rounded inline-block">{profile.namazFrequency || "Not specified"}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information (Asymmetric Unlock) */}
                <div>
                  <h3 className="text-lg font-serif font-bold text-crimson-950 mb-3 border-b border-crimson-900/10 pb-2">Contact Details</h3>
                  <div className="bg-crimson-950/5 p-4 rounded-xl border border-crimson-900/10 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-crimson-100 text-crimson-700 flex items-center justify-center"><FaPhoneAlt className="text-xs" /></div>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 uppercase tracking-wider">Phone / Wali Contact</span>
                        <span className={`text-sm font-bold ${profile.phoneNumber?.includes('🔒') ? 'text-slate-400 italic' : 'text-slate-800'}`}>
                          {profile.phoneNumber || profile.waliContact || 'Not provided'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-crimson-100 text-crimson-700 flex items-center justify-center"><FaEnvelope className="text-xs" /></div>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 uppercase tracking-wider">Email</span>
                        <span className={`text-sm font-bold ${profile.user?.email?.includes('🔒') ? 'text-slate-400 italic' : 'text-slate-800'}`}>
                          {profile.user?.email || 'Not available'}
                        </span>
                      </div>
                    </div>
                    
                    {profile.phoneNumber?.includes('🔒') && !isOwnProfile && (
                      <div className="mt-2 text-xs text-crimson-800 bg-crimson-100 p-2 rounded flex items-start gap-2">
                        <FaLock className="mt-0.5" /> 
                        To view contact details, you must send an interest and have it accepted by this user.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Work & Family */}
              <div className="space-y-8">
                
                {/* Professional Info */}
                <div>
                  <h3 className="text-lg font-serif font-bold text-crimson-950 mb-3 border-b border-crimson-900/10 pb-2">Education & Career</h3>
                  <div className="bg-white p-4 rounded-xl border border-crimson-900/5 space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <FaBriefcase className="text-crimson-700 mt-1 text-lg" />
                      <div>
                        <span className="block text-xs text-slate-400 uppercase tracking-wider">Profession</span>
                        <span className={`font-semibold ${isLocked ? 'text-slate-400 italic' : 'text-slate-700'}`}>{profile.profession}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaGraduationCap className="text-crimson-700 mt-1 text-lg" />
                      <div>
                        <span className="block text-xs text-slate-400 uppercase tracking-wider">Highest Education</span>
                        <span className={`font-semibold ${isLocked ? 'text-slate-400 italic' : 'text-slate-700'}`}>{profile.education}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Family Details */}
                <div>
                  <h3 className="text-lg font-serif font-bold text-crimson-950 mb-3 border-b border-crimson-900/10 pb-2">Family Background</h3>
                  <div className="bg-white p-4 rounded-xl border border-crimson-900/5 space-y-3 text-sm">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                      <span className="text-slate-500">Father's Occupation</span>
                      <span className={`font-semibold ${isLocked ? 'text-slate-400 italic' : 'text-slate-700'}`}>{profile.familyDetails?.fatherOccupation || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                      <span className="text-slate-500">Mother's Occupation</span>
                      <span className={`font-semibold ${isLocked ? 'text-slate-400 italic' : 'text-slate-700'}`}>{profile.familyDetails?.motherOccupation || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Siblings</span>
                      <span className={`font-semibold ${isLocked ? 'text-slate-400 italic' : 'text-slate-700'}`}>{isLocked ? '🔒 Locked' : `${profile.familyDetails?.siblingsCount || 0} brothers/sisters`}</span>
                    </div>
                  </div>
                </div>

                {/* Partner Preferences */}
                <div>
                  <h3 className="text-lg font-serif font-bold text-crimson-950 mb-3 border-b border-crimson-900/10 pb-2">Partner Preferences</h3>
                  <div className="bg-white p-4 rounded-xl border border-crimson-900/5 space-y-3 text-sm">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                      <span className="text-slate-500">Age Range</span>
                      <span className="font-semibold text-slate-700">{profile.partnerPreferences?.ageRange || 'Flexible'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                      <span className="text-slate-500">Sect Preference</span>
                      <span className="font-semibold text-slate-700">{profile.partnerPreferences?.sectPreference || 'No Preference'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Education</span>
                      <span className="font-semibold text-slate-700">{profile.partnerPreferences?.educationPreference || "Doesn't matter"}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-fadeIn">
            <h3 className="text-xl font-serif font-bold text-crimson-950 mb-2">Report Profile</h3>
            <p className="text-sm text-slate-500 mb-4">Are they using inappropriate language, fake photos, or violating our halal terms? Let our admins know.</p>
            <form onSubmit={handleReport}>
              <textarea 
                required
                rows={4}
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Describe the issue here..."
                className="w-full p-3 border border-slate-200 rounded-xl mb-4 focus:border-red-400 focus:outline-none resize-none text-sm"
              />
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setIsReportModalOpen(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserProfile;
