import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaTimes, FaComment, FaEye, FaHeart, FaStar, FaRegStar } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

const MobileActivityPage = ({ receivedRequests = [], sentRequests = [], connections = [], handleAccept, handleReject, onCancelInterest, user }) => {
  const [activeTab, setActiveTab] = useState('Received');
  const [confirmCancelReqId, setConfirmCancelReqId] = useState(null);
  const [shortlistedProfiles, setShortlistedProfiles] = useState([]);
  const [shortlistLoading, setShortlistLoading] = useState(false);
  
  const tabs = ['Received', 'Sent', 'Connections', 'Shortlisted'];

  useEffect(() => {
    if (activeTab === 'Shortlisted') {
      fetchShortlisted();
    }
  }, [activeTab]);

  const fetchShortlisted = async () => {
    setShortlistLoading(true);
    try {
      const res = await api.get('/profiles?shortlisted=true');
      if (res.data.success) {
        setShortlistedProfiles(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load shortlisted profiles');
    } finally {
      setShortlistLoading(false);
    }
  };

  const handleRemoveShortlist = async (targetUserId) => {
    try {
      const res = await api.post(`/profiles/shortlist/${targetUserId}`);
      if (res.data.success) {
        toast.success('Removed from shortlist');
        setShortlistedProfiles(prev => prev.filter(p => {
          const id = p.user?._id || p.user;
          return id !== targetUserId;
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove from shortlist');
    }
  };

  const renderEmptyState = (tabName) => {
    let title = "No activity yet";
    let desc = "Keep exploring to get responses.";
    let icon = <FaHeart className="text-2xl text-[#4f080e]/40 animate-pulse" />;

    if (tabName === 'Received') {
      title = "No received interests";
      desc = "Evaru inka interest pampaledu. Me profile ni active ga unchandi!";
    } else if (tabName === 'Sent') {
      title = "No sent interests";
      desc = "Meeru inka evariki interest pampaledu. Start browsing profiles!";
    } else if (tabName === 'Connections') {
      title = "No connections yet";
      desc = "Once interest request accept aithe, ikkada kanipisthayi.";
    } else if (tabName === 'Shortlisted') {
      title = "No shortlisted profiles";
      desc = "Profiles chusi ⭐ Shortlist click cheyyandi. Ikkada save avutayi!";
      icon = <FaRegStar className="text-2xl text-amber-400 animate-pulse" />;
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center mt-12 py-10">
        <div className="w-16 h-16 rounded-full bg-crimson-50 flex items-center justify-center mb-4 border border-crimson-900/10 text-crimson-900">
          {icon}
        </div>
        <h2 className="text-lg font-bold text-[#111111] mb-2">{title}</h2>
        <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-[280px]">
          {desc}
        </p>
        {tabName === 'Shortlisted' && (
          <Link 
            to="/search"
            className="mt-5 text-xs font-bold bg-[#4f080e] text-white px-5 py-2.5 rounded-full"
          >
            Browse Profiles
          </Link>
        )}
      </div>
    );
  };

  const renderProfileDetails = (profile) => (
    <div className="flex flex-wrap gap-1.5 mt-2.5">
      {profile.age && (
        <span className="text-[10px] font-bold bg-[#4f080e]/5 text-[#4f080e] px-2.5 py-0.5 rounded-full">
          {profile.age} yrs
        </span>
      )}
      {profile.height && (
        <span className="text-[10px] font-bold bg-[#4f080e]/5 text-[#4f080e] px-2.5 py-0.5 rounded-full">
          {profile.height}
        </span>
      )}
      {profile.sect && (
        <span className="text-[10px] font-bold bg-[#4f080e]/5 text-[#4f080e] px-2.5 py-0.5 rounded-full">
          {profile.sect}
        </span>
      )}
      {profile.motherTongue && (
        <span className="text-[10px] font-bold bg-[#4f080e]/5 text-[#4f080e] px-2.5 py-0.5 rounded-full">
          {profile.motherTongue}
        </span>
      )}
      {profile.namazFrequency && (
        <span className="text-[10px] font-bold bg-[#4f080e]/5 text-[#4f080e] px-2.5 py-0.5 rounded-full">
          {profile.namazFrequency}
        </span>
      )}
    </div>
  );

  const getCount = (tab) => {
    if (tab === 'Received') return receivedRequests.length;
    if (tab === 'Sent') return sentRequests.length;
    if (tab === 'Connections') return connections.length;
    if (tab === 'Shortlisted') return shortlistedProfiles.length;
    return 0;
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#faf8f5] flex flex-col font-outfit pb-20">
      {/* Header */}
      <div className="pt-6 pb-4 px-6 bg-[#faf8f5]">
        <h1 className="text-[26px] font-extrabold text-[#111111] tracking-tight font-serif">Activity Center</h1>
        <p className="text-xs text-slate-500 font-medium">Manage your match requests & connections</p>
      </div>

      {/* Tabs */}
      <div className="flex px-4 border-b border-slate-200 bg-[#faf8f5] overflow-x-auto">
        {tabs.map((tab) => {
          const count = getCount(tab);
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 pb-3 px-3 text-sm font-bold transition-all relative ${
                activeTab === tab 
                  ? tab === 'Shortlisted' ? 'text-amber-600' : 'text-[#4f080e]'
                  : 'text-slate-400'
              }`}
            >
              <span className="inline-flex items-center gap-1.5 justify-center w-full">
                {tab === 'Shortlisted' && <FaStar className="text-[10px] text-amber-500" />}
                {tab}
                {count > 0 && (
                  <span className={`text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                    tab === 'Shortlisted' ? 'bg-amber-500' : 'bg-[#4f080e]'
                  }`}>
                    {count}
                  </span>
                )}
              </span>
              {activeTab === tab && (
                <span className={`absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full ${
                  tab === 'Shortlisted' ? 'bg-amber-500' : 'bg-[#4f080e]'
                }`}></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 px-4 py-4 space-y-4">
        {activeTab === 'Received' && (
          receivedRequests.length === 0 ? renderEmptyState('Received') : (
            <div className="space-y-4">
              {receivedRequests.map((req) => {
                const profile = req.senderProfile;
                if (!profile) return null;
                const profileId = profile.user?._id || profile.user;
                return (
                  <div key={req._id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div className="flex gap-4">
                      <Link to={`/profile/${profileId}`} className="flex-shrink-0">
                        {profile.profilePhoto && profile.profilePhoto !== '/uploads/blurred-avatar.png' ? (
                          <img src={profile.profilePhoto} alt={profile.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm" />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4f080e] to-[#7f181e] flex items-center justify-center font-bold text-white shadow-sm text-lg">
                            {profile.name ? profile.name[0].toUpperCase() : 'M'}
                          </div>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/profile/${profileId}`} className="block">
                          <h3 className="font-extrabold text-[15px] text-[#4f080e] hover:underline truncate">{profile.name}</h3>
                        </Link>
                        <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                          {profile.profession || 'Not Specified'} • {profile.city}
                        </p>
                        {renderProfileDetails(profile)}
                      </div>
                    </div>
                    <div className="flex gap-2.5 mt-4 pt-3 border-t border-slate-50">
                      <button onClick={() => handleAccept(req._id)} className="flex-1 bg-gradient-to-r from-[#4f080e] to-[#700c12] text-white py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform">
                        <FaCheck className="text-[10px]" /> Accept
                      </button>
                      <button onClick={() => handleReject(req._id)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
                        <FaTimes className="text-[10px]" /> Decline
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {activeTab === 'Sent' && (
          sentRequests.length === 0 ? renderEmptyState('Sent') : (
            <div className="space-y-4">
              {sentRequests.map((req) => {
                const profile = req.receiverProfile;
                if (!profile) return null;
                const profileId = profile.user?._id || profile.user;
                return (
                  <div key={req._id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <div className="flex gap-4">
                      <Link to={`/profile/${profileId}`} className="flex-shrink-0">
                        {profile.profilePhoto && profile.profilePhoto !== '/uploads/blurred-avatar.png' ? (
                          <img src={profile.profilePhoto} alt={profile.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm" />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4f080e] to-[#7f181e] flex items-center justify-center font-bold text-white shadow-sm text-lg">
                            {profile.name ? profile.name[0].toUpperCase() : 'M'}
                          </div>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <Link to={`/profile/${profileId}`} className="block truncate">
                            <h3 className="font-extrabold text-[15px] text-[#4f080e] hover:underline truncate">{profile.name}</h3>
                          </Link>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                            req.status === 'accepted' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : req.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {req.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                          {profile.profession || 'Not Specified'} • {profile.city}
                        </p>
                        {renderProfileDetails(profile)}
                      </div>
                    </div>
                    {req.status === 'pending' && (
                      <div className="flex gap-2.5 mt-4 pt-3 border-t border-slate-50">
                        {confirmCancelReqId === req._id ? (
                          <div className="flex-1 flex items-center justify-between bg-red-50 border border-red-200 rounded-xl p-2.5">
                            <span className="text-xs font-bold text-red-700 pl-1">Withdraw Interest?</span>
                            <div className="flex gap-2">
                              <button onClick={() => { onCancelInterest && onCancelInterest(profileId); setConfirmCancelReqId(null); }} className="bg-red-600 hover:bg-red-700 text-white py-1.5 px-4 rounded-full font-bold text-xs cursor-pointer">Yes</button>
                              <button onClick={() => setConfirmCancelReqId(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-1.5 px-4 rounded-full font-bold text-xs cursor-pointer">No</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmCancelReqId(req._id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer">
                            <FaTimes className="text-[10px]" /> Withdraw Interest
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}

        {activeTab === 'Connections' && (
          connections.length === 0 ? renderEmptyState('Connections') : (
            <div className="space-y-4">
              {connections.map((conn) => {
                const partnerId = conn.user?._id || conn.user;
                return (
                  <div key={conn._id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div className="flex gap-4">
                      <Link to={`/profile/${partnerId}`} className="flex-shrink-0">
                        {conn.profilePhoto && conn.profilePhoto !== '/uploads/blurred-avatar.png' ? (
                          <img src={conn.profilePhoto} alt={conn.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm" />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4f080e] to-[#7f181e] flex items-center justify-center font-bold text-white shadow-sm text-lg">
                            {conn.name ? conn.name[0].toUpperCase() : 'M'}
                          </div>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/profile/${partnerId}`} className="block">
                          <h3 className="font-extrabold text-[15px] text-[#4f080e] hover:underline truncate">{conn.name}</h3>
                        </Link>
                        <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                          {conn.profession || 'Not Specified'} • {conn.city}
                        </p>
                        {renderProfileDetails(conn)}
                      </div>
                    </div>
                    <div className="flex gap-2.5 mt-4 pt-3 border-t border-slate-50">
                      <Link to={`/chat/${partnerId}`} className="flex-1 bg-gradient-to-r from-[#4f080e] to-[#700c12] text-white py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform">
                        <FaComment className="text-[10px]" /> Chat Now
                      </Link>
                      <Link to={`/profile/${partnerId}`} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
                        <FaEye className="text-[10px]" /> View Profile
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {activeTab === 'Shortlisted' && (
          shortlistLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
            </div>
          ) : shortlistedProfiles.length === 0 ? renderEmptyState('Shortlisted') : (
            <div className="space-y-4">
              {shortlistedProfiles.map((profile) => {
                const targetUserId = profile.user?._id || profile.user;
                return (
                  <div key={profile._id} className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100">
                    <div className="flex gap-4">
                      <Link to={`/profile/${targetUserId}`} className="flex-shrink-0">
                        {profile.profilePhoto && profile.profilePhoto !== '/uploads/blurred-avatar.png' ? (
                          <img src={profile.profilePhoto} alt={profile.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-200 shadow-sm" />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-white shadow-sm text-lg">
                            {profile.name ? profile.name[0].toUpperCase() : 'M'}
                          </div>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/profile/${targetUserId}`} className="block">
                          <h3 className="font-extrabold text-[15px] text-amber-700 hover:underline truncate flex items-center gap-1">
                            <FaStar className="text-amber-500 text-[10px] flex-shrink-0" />
                            {profile.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                          {profile.profession || 'Not Specified'} • {profile.city}
                        </p>
                        {renderProfileDetails(profile)}
                      </div>
                    </div>
                    <div className="flex gap-2.5 mt-4 pt-3 border-t border-amber-50">
                      <Link to={`/profile/${targetUserId}`} className="flex-1 bg-gradient-to-r from-[#4f080e] to-[#700c12] text-white py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform">
                        <FaEye className="text-[10px]" /> View Profile
                      </Link>
                      <button onClick={() => handleRemoveShortlist(targetUserId)} className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-700 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform border border-amber-200">
                        <FaStar className="text-[10px]" /> Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MobileActivityPage;
