import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api, { SOCKET_BASE_URL } from '../services/api';
import toast from 'react-hot-toast';
import { FaSearch, FaBookmark, FaComment, FaHeart, FaCrown } from 'react-icons/fa';
import LogoLoader from './LogoLoader';
import { useNavigate } from 'react-router-dom';

const MobileMatchesFeed = () => {
  const { user, getCompleteness } = useContext(AuthContext);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Matches'); // 'Matches' or 'Online'
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [confirmCancelProfileId, setConfirmCancelProfileId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfiles();
    fetchMyRequests();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profiles', { params: { limit: 10, page: 1 } });
      if (res.data.success) {
        setProfiles(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const res = await api.get('/requests');
      if (res.data.success) {
        setSentRequests((res.data.sent || []).map(r => r.receiver?._id || r.receiver));
        setReceivedRequests((res.data.received || []).map(r => r.sender?._id || r.sender));
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  const handleAction = async (action, profileId) => {
    if (action === 'message') {
      navigate('/chat');
      return;
    }

    if (action === 'Interest') {
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
        const res = await api.post(`/requests/send/${profileId}`);
        if (res.data.success) {
          toast.success('Interest sent successfully!');
          setSentRequests(prev => [...prev, profileId]);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to send interest');
      }
      return;
    }

    if (action === 'Shortlist') {
      try {
        const res = await api.post(`/profiles/shortlist/${profileId}`);
        if (res.data.success) {
          toast.success(res.data.message);
          // Update the shortlisted status in the profiles list
          setProfiles(prevProfiles =>
            prevProfiles.map(p => {
              const pUserId = p.user?._id || p.user;
              if (pUserId === profileId) {
                const isShortlisted = p.shortlistedBy?.includes(user?._id);
                const updatedShortlistedBy = isShortlisted
                  ? p.shortlistedBy.filter(uid => uid !== user?._id)
                  : [...(p.shortlistedBy || []), user?._id];
                return { ...p, shortlistedBy: updatedShortlistedBy };
              }
              return p;
            })
          );
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
      return;
    }
  };

  const handleCancelInterest = async (profileId) => {
    try {
      const res = await api.delete(`/requests/cancel/${profileId}`);
      if (res.data.success) {
        toast.success('Interest request withdrawn successfully.');
        setSentRequests(prev => prev.filter(id => id !== profileId));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to withdraw interest');
    }
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-white pb-24">
      {/* Pills Navigation */}
      <div className="sticky top-[72px] z-40 bg-white flex items-center justify-center gap-3 py-4 px-2">
        <button onClick={() => navigate('/search')} className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors">
          <FaSearch /> Search
        </button>
        <button 
          onClick={() => setActiveTab('Matches')}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'Matches' ? 'bg-[#2a2a2a] text-white shadow-md' : 'bg-transparent text-slate-600 hover:bg-slate-50'
          }`}
        >
          Matches
        </button>
        <button 
          onClick={() => setActiveTab('Online')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'Online' ? 'bg-[#2a2a2a] text-white shadow-md' : 'bg-transparent text-slate-600 hover:bg-slate-50'
          }`}
        >
          Online
        </button>
      </div>

      {/* Profile Feed */}
      <div className="flex-1 px-4 space-y-6">
        {loading ? (
          <LogoLoader text="Finding matches..." />
        ) : profiles.length === 0 ? (
           <div className="text-center mt-10 text-slate-500 font-medium">No matches found.</div>
        ) : (
          profiles.map((p, idx) => {
            return (
              <div key={p._id} className="w-full h-[65vh] relative rounded-3xl overflow-hidden shadow-xl bg-slate-900">
                {/* Background Image/Placeholder */}
                <div className="absolute inset-0">
                  {p.profilePhoto && p.profilePhoto !== '/uploads/default-avatar.png' ? (
                    <img 
                      src={`${SOCKET_BASE_URL}${p.profilePhoto}`}
                      alt={p.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#111111] flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center text-5xl font-bold text-slate-500">
                        {p.name ? p.name[0].toUpperCase() : 'M'}
                      </div>
                    </div>
                  )}
                  {/* Dark Gradient Overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90"></div>
                </div>
                
                {/* Image Gallery Icon (top right) */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <span className="text-white text-xs">📸</span>
                </div>

                {/* High Match Chances Badge (Mock) */}
                {activeTab === 'Online' && (
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5">
                    <span className="text-white text-xs font-semibold tracking-wide flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                      High Match Chances
                    </span>
                  </div>
                )}

                {/* Profile Details */}
                <div className="absolute bottom-0 left-0 right-0 p-5 pt-12">
                  {activeTab === 'Online' && (
                     <div className="flex items-center gap-1.5 mb-1.5">
                       <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                       <span className="text-white font-bold text-[11px] uppercase tracking-wider">Online</span>
                     </div>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-white tracking-wide">{p.name}, {p.age}</h2>
                    <FaCrown className="text-gold-400 text-sm drop-shadow-md" />
                  </div>
                  
                  <p className="text-white/85 text-xs mb-5 font-medium leading-relaxed tracking-wide">
                    {p.profession || 'Student'} • {p.city} • {p.sect}
                  </p>

                  {/* Action Buttons */}
                  {(() => {
                    const targetUserId = p.user?._id || p.user;
                    const isShortlisted = p.shortlistedBy?.includes(user?._id);
                    const isSent = sentRequests.includes(targetUserId);
                    const isReceived = receivedRequests.includes(targetUserId);

                    return (
                      <div className="flex items-center justify-between px-3 gap-4 pb-2">
                        <div 
                          className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform" 
                          onClick={() => handleAction('Shortlist', targetUserId)}
                        >
                          <button className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg border border-white/5 transition-all ${
                            isShortlisted ? 'bg-amber-500 shadow-amber-500/30' : 'bg-[#111111]'
                          }`}>
                            <FaBookmark className="text-sm" />
                          </button>
                          <span className="text-white text-[10px] font-semibold tracking-wider">
                            {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                          </span>
                        </div>

                        <div 
                          className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform" 
                          onClick={() => handleAction('message', targetUserId)}
                        >
                          <button className="w-14 h-14 rounded-full bg-[#5c7cfa] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                            <FaComment className="text-xl" />
                          </button>
                          <span className="text-white text-[10px] font-semibold tracking-wider">Message</span>
                        </div>

                        {confirmCancelProfileId === targetUserId ? (
                          <div className="flex flex-col items-center gap-1.5 bg-[#111111]/80 backdrop-blur-sm border border-red-500/30 rounded-2xl p-1.5 shadow-lg transition-all duration-300">
                            <span className="text-white text-[9px] font-bold tracking-tight">Withdraw?</span>
                            <div className="flex gap-1">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelInterest(targetUserId);
                                  setConfirmCancelProfileId(null);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm cursor-pointer"
                              >
                                Yes
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmCancelProfileId(null);
                                }}
                                className="bg-slate-600 hover:bg-slate-700 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className={`flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform ${
                              isReceived ? 'opacity-80 pointer-events-none' : ''
                            }`} 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isSent) {
                                setConfirmCancelProfileId(targetUserId);
                              } else if (!isReceived) {
                                handleAction('Interest', targetUserId);
                              }
                            }}
                          >
                            <button className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
                              isSent 
                                ? 'bg-slate-500 hover:bg-red-600 shadow-none' 
                                : isReceived 
                                ? 'bg-emerald-600 shadow-emerald-500/30' 
                                : 'bg-[#fa5252] shadow-red-500/30'
                            }`}>
                              <FaHeart className="text-sm" />
                            </button>
                            <span className="text-white text-[10px] font-semibold tracking-wider">
                              {isSent ? 'Sent' : isReceived ? 'Received' : 'Interest'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MobileMatchesFeed;
