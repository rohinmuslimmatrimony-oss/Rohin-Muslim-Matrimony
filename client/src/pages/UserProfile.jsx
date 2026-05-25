import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api, { SOCKET_BASE_URL } from '../services/api';
import toast from 'react-hot-toast';
import { 
  FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaLock, 
  FaUserLock, FaHeart, FaExclamationTriangle, FaStar, 
  FaPhoneAlt, FaEnvelope, FaMosque, FaUsers, FaRulerVertical, FaLanguage,
  FaCheckCircle, FaCrown, FaMoneyBillWave
} from 'react-icons/fa';
import SimpleSpinner from '../components/SimpleSpinner';
import DefaultAvatar from '../components/DefaultAvatar';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getCompleteness } = useContext(AuthContext);
  
  const [profile, setProfile] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isReceived, setIsReceived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportText, setReportText] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [galleryRequestStatus, setGalleryRequestStatus] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, [id]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/profiles/${id}`);
      if (res.data.success) {
        const profData = res.data.data;
        setProfile(profData);
        setIsConnected(res.data.isConnected);
        setGalleryRequestStatus(res.data.galleryRequestStatus);

        // Fetch interest request status
        try {
          const reqRes = await api.get('/requests');
          if (reqRes.data.success) {
            const targetUserId = profData.user?._id || profData.user;
            
            const sent = (reqRes.data.sent || []).some(
              r => (r.receiver?._id || r.receiver) === targetUserId
            );
            setIsSent(sent);

            const received = (reqRes.data.received || []).some(
              r => (r.sender?._id || r.sender) === targetUserId
            );
            setIsReceived(received);
          }
        } catch (reqError) {
          console.error('Failed to fetch request status', reqError);
        }
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

  const handleSendInterest = async () => {
    if (user?.role !== 'admin') {
      const completeness = getCompleteness().score;
      if (completeness < 100) {
        toast.error('Please complete your profile details to 100% on the Dashboard before sending interest requests!', {
          duration: 5000,
          icon: '🔒',
        });
        return;
      }
    }

    try {
      const targetUserId = profile.user?._id || profile.user;
      const res = await api.post(`/requests/send/${targetUserId}`);
      if (res.data.success) {
        toast.success('Interest sent successfully!');
        setIsSent(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send interest');
    }
  };

  const handleCancelInterest = async () => {
    try {
      const targetUserId = profile.user?._id || profile.user;
      const res = await api.delete(`/requests/cancel/${targetUserId}`);
      if (res.data.success) {
        toast.success("Interest request withdrawn successfully.");
        setIsSent(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to withdraw interest');
    }
  };

  const handleRequestPhotoAccess = async () => {
    try {
      const res = await api.post(`/gallery-requests/send/${id}`);
      if (res.data.success) {
        toast.success('Photo access request sent successfully!');
        setGalleryRequestStatus('pending');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request photo access');
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
      if (error.response?.status === 403 && error.response?.data?.message?.includes('upgrade')) {
        toast.error(
          <div className="flex items-center justify-between gap-2.5">
            <span>{error.response.data.message}</span>
            <button 
              onClick={() => navigate('/plans')}
              className="bg-gold-gradient text-crimson-950 text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow hover:scale-105 transition-all whitespace-nowrap"
            >
              Upgrade
            </button>
          </div>,
          { duration: 6000 }
        );
      } else {
        toast.error(error.response?.data?.message || 'Action failed');
      }
    }
  };

  if (loading) {
    return <SimpleSpinner />;
  }

  if (!profile) return null;

  const isLocked = profile.locked;
  const isOwnProfile = user?._id === id;

  const getOrdinalSuffix = (num) => {
    const j = num % 10, k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  const getSiblingOrderedList = () => {
    if (!profile?.familyDetails?.siblingsList || profile.familyDetails.siblingsList.length === 0) {
      return null;
    }
    
    const list = profile.familyDetails.siblingsList;
    const elders = list.filter(s => s.relation.startsWith('Elder'));
    const youngers = list.filter(s => s.relation.startsWith('Younger'));
    
    const ordered = [];
    
    // 1. Add elders
    elders.forEach((s, idx) => {
      ordered.push({
        label: `${idx + 1}${getOrdinalSuffix(idx + 1)} Child`,
        name: s.relation,
        status: s.maritalStatus,
        occupation: s.occupation,
        isSelf: false
      });
    });
    
    // 2. Add Self
    const selfIndex = elders.length + 1;
    ordered.push({
      label: `${selfIndex}${getOrdinalSuffix(selfIndex)} Child`,
      name: `Self (${profile.name})`,
      status: profile.maritalStatus || 'Unmarried',
      occupation: profile.profession || 'Not Specified',
      isSelf: true
    });
    
    // 3. Add youngers
    youngers.forEach((s, idx) => {
      const childIndex = selfIndex + idx + 1;
      ordered.push({
        label: `${childIndex}${getOrdinalSuffix(childIndex)} Child`,
        name: s.relation,
        status: s.maritalStatus,
        occupation: s.occupation,
        isSelf: false
      });
    });
    
    return ordered;
  };

  return (
    <div className="min-h-screen bg-premium-dark-mesh text-slate-100 pt-8 pb-12 px-4 md:px-8 relative">
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
        <div className="glass-card-dark rounded-2xl border border-gold-500/20 overflow-hidden shadow-xl">
          
          {/* Header Region */}
          <div className="h-40 md:h-56 bg-crimson-950 relative overflow-hidden">
            <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-gold-500/20 rounded-full blur-[60px]"></div>
          </div>

          {/* Profile Photo & Summary */}
          <div className="px-6 md:px-10 pb-10 relative">
            <div className="flex flex-col md:flex-row gap-6 relative -top-16">
              
              {/* Photo Area */}
              <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 ${profile.user?.plan === 'elite' ? 'border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.4)] bg-slate-900' : profile.user?.plan === 'premium' ? 'border-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.4)] bg-slate-900' : 'border-cream-50 bg-slate-900 shadow-xl'} overflow-hidden relative flex-shrink-0 mx-auto md:mx-0 p-1`}>
                {profile.profilePhoto && profile.profilePhoto !== '/uploads/default-avatar.png' && profile.profilePhoto !== '/uploads/blurred-avatar.png' ? (
                  <img src={`${SOCKET_BASE_URL}${profile.profilePhoto}`} alt={profile.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full relative rounded-full overflow-hidden bg-[#e2e8f0]">
                    <DefaultAvatar gender={profile.gender} className={`w-full h-full object-contain bg-[#e2e8f0] rounded-full ${profile.profilePhoto === '/uploads/blurred-avatar.png' ? 'blur-md opacity-60' : ''}`} />
                    {profile.profilePhoto === '/uploads/blurred-avatar.png' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/10">
                        <div className="bg-black/40 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center shadow-lg border border-white/20">
                          <FaLock className="text-lg md:text-xl text-white drop-shadow-md" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Title & Core Details */}
              <div className="pt-2 md:pt-16 flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-serif font-bold text-white mb-1 flex items-center justify-center md:justify-start gap-2 flex-wrap">
                      <span>{profile.name}</span>
                      {profile.user?.isManuallyVerified && (
                        <FaCheckCircle className="text-[#3b82f6] text-[22px] drop-shadow-sm" title="Identity Verified" />
                      )}
                      <span className="font-sans font-light text-xl text-gold-300">, {profile.age}</span>
                    </h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1.5">
                      <p className="text-slate-400 text-sm font-medium">{profile.profileCreatedBy === 'Self' ? 'Profile created by Self' : `Profile created by ${profile.profileCreatedBy}`}</p>
                      <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full tracking-wide flex items-center gap-1.5 shadow-sm border ${
                        profile.user?.plan === 'elite' 
                          ? 'bg-gradient-to-r from-[#d4af37] via-[#f3e3a3] to-[#b28e28] text-[#4f080e] border-[#b28e28]/50'
                          : profile.user?.plan === 'premium'
                          ? 'bg-gradient-to-r from-[#10b981] via-[#6ee7b7] to-[#047857] text-white border-[#047857]/50'
                          : 'bg-slate-100 text-slate-700 border-slate-200 shadow-none'
                      }`}>
                        {profile.user?.plan === 'elite' && <FaCrown className="text-[#4f080e] text-[11px] animate-pulse" />}
                        {profile.user?.plan === 'premium' && <FaCrown className="text-white text-[11px]" />}
                        <span className="uppercase">{profile.user?.plan || 'Free'} Member</span>
                      </span>
                    </div>
                  </div>
                  
                  {!isOwnProfile && (
                    <div className="flex flex-col gap-2">
                      {isConnected ? (
                        <span className="bg-crimson-100 text-crimson-800 px-4 py-2 rounded-full font-bold text-sm shadow-sm border border-crimson-200 text-center">
                          Mutual Connection ✓
                        </span>
                      ) : showCancelConfirm ? (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1.5 shadow-sm transition-all duration-300">
                          <span className="text-xs font-bold text-red-700 px-1">Withdraw?</span>
                          <button
                            onClick={() => {
                              handleCancelInterest();
                              setShowCancelConfirm(false);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setShowCancelConfirm(false)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : isSent ? (
                        <button 
                          onClick={() => setShowCancelConfirm(true)}
                          onMouseEnter={() => setHovered(true)}
                          onMouseLeave={() => setHovered(false)}
                          className="bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-4 py-2.5 rounded-full font-bold text-sm border border-slate-300 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <FaHeart className={`text-[12px] text-red-500 ${hovered ? 'animate-pulse' : ''}`} /> 
                          {hovered ? 'Withdraw Interest' : 'Interest Sent'}
                        </button>
                      ) : isReceived ? (
                        <span className="bg-crimson-50 text-crimson-900 px-4 py-2 rounded-full font-bold text-sm border border-crimson-200 text-center">
                          Interest Received
                        </span>
                      ) : (
                        <button 
                          onClick={handleSendInterest}
                          className="bg-gold-gradient text-crimson-950 px-6 py-2.5 rounded-full font-bold shadow-lg shadow-gold-500/20 hover:scale-105 transition-transform flex items-center gap-2"
                        >
                          <FaHeart /> Send Interest
                        </button>
                      )}
                    </div>
                  )}
                  
                  {!isOwnProfile && profile.profilePhoto && profile.profilePhoto.includes('blurred-avatar.png') && (
                    <div className="flex flex-col gap-2 mt-2 md:mt-0">
                      {galleryRequestStatus === 'accepted' ? (
                        <span className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-bold text-xs shadow-sm border border-emerald-200 text-center">
                          Photo Access Approved ✓
                        </span>
                      ) : galleryRequestStatus === 'pending' ? (
                        <span className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full font-bold text-xs shadow-sm border border-amber-200 text-center">
                          Photo Access Requested 📷
                        </span>
                      ) : (
                        <button 
                          onClick={handleRequestPhotoAccess}
                          className="bg-[#4f080e] hover:bg-[#7f181e] text-white px-5 py-2.5 rounded-full font-bold shadow-md text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          Request Photo Access 📷
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6 text-sm text-slate-300">
                  <span className="flex items-center gap-1.5 bg-crimson-950/50 px-3 py-1.5 rounded-lg border border-gold-500/20 text-gold-300">
                    <FaMapMarkerAlt className="text-gold-400" /> {profile.city}
                  </span>
                  <span className="flex items-center gap-1.5 bg-crimson-950/50 px-3 py-1.5 rounded-lg border border-gold-500/20 text-gold-300">
                    <FaMosque className="text-gold-400" /> {profile.sect}
                  </span>
                  <span className="flex items-center gap-1.5 bg-crimson-950/50 px-3 py-1.5 rounded-lg border border-gold-500/20 text-gold-300">
                    <FaUsers className="text-gold-400" /> {profile.maritalStatus}
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
                  <h3 className="text-lg font-serif font-bold text-gold-400 mb-3 border-b border-gold-500/20 pb-2">About Me</h3>
                  {isLocked ? (
                    <div className="bg-slate-900/40 p-4 rounded-xl text-slate-400 italic text-sm border border-gold-500/10 flex items-start gap-3">
                      <FaUserLock className="text-gold-500 text-xl mt-0.5" />
                      <span>{profile.about}</span>
                    </div>
                  ) : (
                    <p className="text-slate-200 leading-relaxed text-sm whitespace-pre-wrap bg-white/5 p-4 rounded-xl border border-gold-500/10">
                      {profile.about}
                    </p>
                  )}
                </div>

                {/* Personal Attributes */}
                <div>
                  <h3 className="text-lg font-serif font-bold text-gold-400 mb-3 border-b border-gold-500/20 pb-2">Personal & Religious Attributes</h3>
                  <div className="bg-white/5 p-4 rounded-xl border border-gold-500/10 grid grid-cols-2 gap-y-4 text-sm">
                    <div>
                      <span className="block text-xs text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><FaRulerVertical className="text-gold-400" /> Height</span>
                      <span className="font-semibold text-white">{profile.height || "Not specified"}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><FaLanguage className="text-gold-400" /> Mother Tongue</span>
                      <span className="font-semibold text-white">{profile.motherTongue || "Not specified"}</span>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-white/10">
                      <span className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Namaz Frequency</span>
                      <span className="font-semibold text-gold-400 bg-gold-500/10 px-2 py-1 rounded inline-block border border-gold-500/20">{profile.namazFrequency || "Not specified"}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information (Asymmetric Unlock) */}
                <div>
                  <h3 className="text-lg font-serif font-bold text-gold-400 mb-3 border-b border-gold-500/20 pb-2">Contact Details</h3>
                  <div className="bg-white/5 p-4 rounded-xl border border-gold-500/10 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20 flex items-center justify-center"><FaPhoneAlt className="text-xs" /></div>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-400 uppercase tracking-wider">Candidate Contact</span>
                        <span className={`text-sm font-bold ${profile.phoneNumber?.includes('🔒') ? 'text-slate-500 italic' : 'text-white'}`}>
                          {profile.phoneNumber || 'Not provided'}
                        </span>
                      </div>
                    </div>
                    
                    {profile.waliContact && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20 flex items-center justify-center"><FaPhoneAlt className="text-xs" /></div>
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-400 uppercase tracking-wider">Chaperone / Wali Contact</span>
                          <span className={`text-sm font-bold ${profile.waliContact?.includes('🔒') ? 'text-slate-500 italic' : 'text-white'}`}>
                            {profile.waliContact}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20 flex items-center justify-center"><FaEnvelope className="text-xs" /></div>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-400 uppercase tracking-wider">Email</span>
                        <span className={`text-sm font-bold ${profile.user?.email?.includes('🔒') ? 'text-slate-500 italic' : 'text-white'}`}>
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
                  <h3 className="text-lg font-serif font-bold text-gold-400 mb-3 border-b border-gold-500/20 pb-2">Education & Career</h3>
                  <div className="bg-white/5 p-4 rounded-xl border border-gold-500/10 space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <FaBriefcase className="text-gold-400 mt-1 text-lg" />
                      <div>
                        <span className="block text-xs text-slate-400 uppercase tracking-wider">Profession</span>
                        <span className={`font-semibold ${isLocked ? 'text-slate-500 italic' : 'text-white'}`}>{profile.profession}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaMoneyBillWave className="text-gold-400 mt-1 text-lg" />
                      <div>
                        <span className="block text-xs text-slate-400 uppercase tracking-wider">Annual Income</span>
                        <span className={`font-semibold ${isLocked ? 'text-slate-500 italic' : 'text-white'}`}>{profile.annualIncome || 'Not Specified'}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaGraduationCap className="text-gold-400 mt-1 text-lg" />
                      <div>
                        <span className="block text-xs text-slate-400 uppercase tracking-wider">Highest Education</span>
                        <span className={`font-semibold ${isLocked ? 'text-slate-500 italic' : 'text-white'}`}>{profile.education}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Family Details */}
                <div>
                  <h3 className="text-lg font-serif font-bold text-gold-400 mb-3 border-b border-gold-500/20 pb-2">Family Background</h3>
                  <div className="bg-white/5 p-4 rounded-xl border border-gold-500/10 space-y-3 text-sm">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-slate-300">Father's Occupation</span>
                      <span className={`font-semibold ${isLocked ? 'text-slate-500 italic' : 'text-white'}`}>{profile.familyDetails?.fatherOccupation || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-slate-300">Mother's Occupation</span>
                      <span className={`font-semibold ${isLocked ? 'text-slate-500 italic' : 'text-white'}`}>{profile.familyDetails?.motherOccupation || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Siblings</span>
                      <span className={`font-semibold ${isLocked ? 'text-slate-500 italic' : 'text-white'}`}>{isLocked ? '🔒 Locked' : `${profile.familyDetails?.siblingsCount || 0} brothers/sisters`}</span>
                    </div>
                    {!isLocked && profile.familyDetails?.siblingsList && profile.familyDetails.siblingsList.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10 space-y-3 animate-fadeIn">
                        <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-gold-400/80">Children Birth Order</span>
                        <div className="space-y-2">
                          {getSiblingOrderedList()?.map((item, idx) => (
                            <div key={idx} className={`flex justify-between items-center p-2.5 rounded-xl text-xs ${item.isSelf ? 'bg-gold-500/20 border border-gold-400 font-bold text-white shadow-sm' : 'bg-white/5 text-slate-200 border border-gold-500/10'}`}>
                              <span className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${item.isSelf ? 'bg-gold-600' : 'bg-slate-400'}`}></span>
                                {item.label}: {item.name}
                              </span>
                              <span className="text-[10px] uppercase font-bold text-slate-500">{item.status}{item.occupation ? ` • ${item.occupation}` : ''}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Partner Preferences */}
                <div>
                  <h3 className="text-lg font-serif font-bold text-gold-400 mb-3 border-b border-gold-500/20 pb-2">Partner Preferences</h3>
                  <div className="bg-white/5 p-4 rounded-xl border border-gold-500/10 space-y-3 text-sm">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-slate-300">Age Range</span>
                      <span className="font-semibold text-white">{profile.partnerPreferences?.ageRange || 'Flexible'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-slate-300">Sect Preference</span>
                      <span className="font-semibold text-white">{profile.partnerPreferences?.sectPreference || 'No Preference'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Education</span>
                      <span className="font-semibold text-white">{profile.partnerPreferences?.educationPreference || "Doesn't matter"}</span>
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
