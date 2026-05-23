import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaTimes, FaComment, FaEye, FaRegClock, FaStar, FaRegStar, FaLock, FaUserClock, FaEnvelope, FaMapMarkerAlt, FaBriefcase } from 'react-icons/fa';
import api, { SOCKET_BASE_URL } from '../services/api';
import toast from 'react-hot-toast';

const MobileActivityPage = ({ receivedRequests = [], sentRequests = [], connections = [], handleAccept, handleReject, onCancelInterest, user }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [confirmCancelReqId, setConfirmCancelReqId] = useState(null);
  
  // Custom states for sub-tabs
  const [shortlistedProfiles, setShortlistedProfiles] = useState([]);
  const [shortlistLoading, setShortlistLoading] = useState(false);

  const [profileVisits, setProfileVisits] = useState([]);
  const [profileVisitsLoading, setProfileVisitsLoading] = useState(false);

  const [galleryRequests, setGalleryRequests] = useState({ received: [], sent: [] });
  const [galleryRequestsLoading, setGalleryRequestsLoading] = useState(false);

  const [contactsViewed, setContactsViewed] = useState([]);
  const [contactsViewedLoading, setContactsViewedLoading] = useState(false);

  const [allActivities, setAllActivities] = useState([]);
  const [allLoading, setAllLoading] = useState(false);
  
  const tabs = ['All', 'Interest', 'Visits', 'Gallery Requests', 'Contacts', 'Shortlisted'];

  useEffect(() => {
    if (activeTab === 'All') {
      fetchAllActivities();
    } else if (activeTab === 'Shortlisted') {
      fetchShortlisted();
    } else if (activeTab === 'Visits') {
      fetchProfileVisits();
    } else if (activeTab === 'Gallery Requests') {
      fetchGalleryRequests();
    } else if (activeTab === 'Contacts') {
      fetchContactsViewed();
    }
  }, [activeTab, receivedRequests, sentRequests]); // also reload All/Interest if props change

  const fetchAllActivities = async () => {
    setAllLoading(true);
    try {
      const [visitsRes, galleryRes, contactsRes] = await Promise.all([
        api.get('/profiles/visitors').catch(() => ({ data: { success: false } })),
        api.get('/gallery-requests').catch(() => ({ data: { success: false } })),
        api.get('/profiles/contact-viewers').catch(() => ({ data: { success: false } }))
      ]);

      const items = [];

      // 1. Add interests
      receivedRequests.forEach(req => {
        items.push({
          id: `interest-rx-${req._id}`,
          type: 'interest_received',
          profile: req.senderProfile,
          timestamp: req.createdAt,
          raw: req
        });
      });
      sentRequests.forEach(req => {
        items.push({
          id: `interest-tx-${req._id}`,
          type: 'interest_sent',
          profile: req.receiverProfile,
          timestamp: req.createdAt,
          raw: req
        });
      });

      // 2. Add profile visits
      if (visitsRes.data && visitsRes.data.success) {
        (visitsRes.data.data || []).forEach(prof => {
          items.push({
            id: `visit-${prof._id}`,
            type: 'profile_visit',
            profile: prof,
            timestamp: prof.updatedAt || prof.createdAt || new Date()
          });
        });
      }

      // 3. Add gallery requests
      if (galleryRes.data && galleryRes.data.success) {
        (galleryRes.data.received || []).forEach(req => {
          items.push({
            id: `gallery-rx-${req._id}`,
            type: 'gallery_request_received',
            profile: req.senderProfile,
            timestamp: req.createdAt,
            raw: req
          });
        });
        (galleryRes.data.sent || []).forEach(req => {
          items.push({
            id: `gallery-tx-${req._id}`,
            type: 'gallery_request_sent',
            profile: req.receiverProfile,
            timestamp: req.createdAt,
            raw: req
          });
        });
      }

      // 4. Add contacts viewed
      if (contactsRes.data && contactsRes.data.success) {
        (contactsRes.data.data || []).forEach(prof => {
          items.push({
            id: `contact-${prof._id}`,
            type: 'contact_viewed',
            profile: prof,
            timestamp: prof.updatedAt || prof.createdAt || new Date()
          });
        });
      }

      // Sort items by timestamp descending
      items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setAllActivities(items);
    } catch (err) {
      console.error('Failed to load all activities', err);
    } finally {
      setAllLoading(false);
    }
  };

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

  const fetchProfileVisits = async () => {
    setProfileVisitsLoading(true);
    try {
      const res = await api.get('/profiles/visitors');
      if (res.data.success) {
        setProfileVisits(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load profile visits');
    } finally {
      setProfileVisitsLoading(false);
    }
  };

  const fetchGalleryRequests = async () => {
    setGalleryRequestsLoading(true);
    try {
      const res = await api.get('/gallery-requests');
      if (res.data.success) {
        setGalleryRequests({
          received: res.data.received || [],
          sent: res.data.sent || []
        });
      }
    } catch (error) {
      toast.error('Failed to load photo requests');
    } finally {
      setGalleryRequestsLoading(false);
    }
  };

  const fetchContactsViewed = async () => {
    setContactsViewedLoading(true);
    try {
      const res = await api.get('/profiles/contact-viewers');
      if (res.data.success) {
        setContactsViewed(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load contact views');
    } finally {
      setContactsViewedLoading(false);
    }
  };

  const handleRemoveShortlist = async (targetUserId) => {
    try {
      const res = await api.post(`/profiles/shortlist/${targetUserId}`);
      if (res.data.success) {
        toast.success('Removed from shortlist');
        setShortlistedProfiles(prev => prev.filter(p => (p.user?._id || p.user) !== targetUserId));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove from shortlist');
    }
  };

  const handleAcceptGalleryRequest = async (reqId) => {
    try {
      const res = await api.put(`/gallery-requests/accept/${reqId}`);
      if (res.data.success) {
        toast.success('Photo access approved!');
        fetchGalleryRequests();
      }
    } catch (error) {
      toast.error('Failed to approve request');
    }
  };

  const handleRejectGalleryRequest = async (reqId) => {
    try {
      const res = await api.put(`/gallery-requests/reject/${reqId}`);
      if (res.data.success) {
        toast.success('Photo access declined');
        fetchGalleryRequests();
      }
    } catch (error) {
      toast.error('Failed to decline request');
    }
  };

  const renderEmptyState = (tabName) => {
    let title = "No activity yet";
    let desc = "No one's reached out yet. Keep exploring to get responses.";

    if (tabName === 'Interest' && receivedRequests.length === 0 && sentRequests.length === 0) {
      title = "No interest activity";
      desc = "You haven't received or sent any interests yet.";
    } else if (tabName === 'Visits') {
      title = "No profile visits yet";
      desc = "No one has visited your profile recently.";
    } else if (tabName === 'Gallery Requests') {
      title = "No photo requests";
      desc = "You don't have any pending photo access requests.";
    } else if (tabName === 'Contacts') {
      title = "No contact views";
      desc = "No one has viewed your contact details yet.";
    } else if (tabName === 'Shortlisted') {
      title = "No shortlisted profiles";
      desc = "View a profile and click ⭐ Shortlist. They will be saved here!";
    }

    return (
      <div className="flex-grow flex flex-col items-center justify-center px-8 text-center mt-20 py-10">
        <h2 className="text-lg font-bold text-[#1a1a1a] mb-2 font-serif">{title}</h2>
        <p className="text-sm font-medium text-gray-500 leading-relaxed max-w-[280px]">
          {desc}
        </p>
      </div>
    );
  };

  const renderProfileRow = (profile, label, badge, keyVal) => {
    if (!profile) return null;
    const profileId = profile.user?._id || profile.user;
    return (
      <div key={keyVal || profile._id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80 flex items-center justify-between gap-3 hover:border-crimson-100 transition-all">
        <Link to={`/profile/${profileId}`} className="flex items-center gap-3.5 flex-1 min-w-0">
          {profile.profilePhoto && profile.profilePhoto !== '/uploads/blurred-avatar.png' ? (
            <img src={profile.profilePhoto.startsWith('http') ? profile.profilePhoto : `${SOCKET_BASE_URL}${profile.profilePhoto}`} alt={profile.name} className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4f080e] to-[#7f181e] flex items-center justify-center font-bold text-white shadow-sm text-sm flex-shrink-0">
              {profile.name ? profile.name[0].toUpperCase() : 'M'}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-extrabold text-[14px] text-[#1a1a1a] truncate font-serif">{profile.name}</h3>
            <p className="text-xs text-slate-500 truncate mt-0.5">{profile.profession || 'Not Specified'} • {profile.city}</p>
            {label && <p className="text-[10px] text-crimson-700 font-extrabold mt-1 uppercase tracking-wider">{label}</p>}
          </div>
        </Link>
        {badge && <div className="flex-shrink-0">{badge}</div>}
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#faf8f5] flex flex-col font-sans pb-20">
      {/* Header */}
      <div className="pt-6 pb-3 px-5 bg-[#faf8f5]">
        <h1 className="text-[26px] font-bold text-[#1a1a1a] tracking-tight font-serif">Activity</h1>
        <p className="text-xs text-slate-500 font-medium">Keep track of interactions with other members</p>
      </div>

      {/* Tabs list with horizontal scroll */}
      <div className="flex px-3 border-b border-gray-200/80 bg-[#faf8f5] overflow-x-auto hide-scrollbar sticky top-0 z-10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 pb-3.5 px-3.5 text-sm font-semibold transition-all relative whitespace-nowrap ${
                isActive ? 'text-[#4f080e]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span>{tab}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-md bg-[#4f080e]"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 px-4 py-4 space-y-3 flex flex-col">
        
        {/* ALL TAB */}
        {activeTab === 'All' && (
          allLoading ? (
            <div className="flex-grow flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-crimson-200 border-t-crimson-800 rounded-full animate-spin"></div>
            </div>
          ) : allActivities.length === 0 ? renderEmptyState('All') : (
            <div className="space-y-3">
              {allActivities.map((act) => {
                const profile = act.profile;
                if (!profile) return null;

                // Format action text/badge based on type
                let actLabel = "";
                let actionBadge = null;

                if (act.type === 'interest_received') {
                  actLabel = "Expressed Interest In You";
                  actionBadge = (
                    <div className="flex gap-1.5">
                      <button onClick={() => handleAccept(act.raw._id)} className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg text-xs" title="Accept"><FaCheck /></button>
                      <button onClick={() => handleReject(act.raw._id)} className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg text-xs" title="Decline"><FaTimes /></button>
                    </div>
                  );
                } else if (act.type === 'interest_sent') {
                  actLabel = `Sent Interest (${act.raw.status})`;
                  actionBadge = <span className="text-[10px] bg-amber-50 text-amber-700 font-extrabold px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">{act.raw.status}</span>;
                } else if (act.type === 'profile_visit') {
                  actLabel = "Visited Your Profile";
                  actionBadge = <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Visit</span>;
                } else if (act.type === 'gallery_request_received') {
                  actLabel = "Requested photo access";
                  actionBadge = act.raw.status === 'pending' ? (
                    <div className="flex gap-1.5">
                      <button onClick={() => handleAcceptGalleryRequest(act.raw._id)} className="bg-[#4f080e] text-white px-2.5 py-1 rounded-lg text-[10px] font-bold" title="Approve">Approve</button>
                      <button onClick={() => handleRejectGalleryRequest(act.raw._id)} className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-[10px] font-bold" title="Decline">Decline</button>
                    </div>
                  ) : (
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{act.raw.status}</span>
                  );
                } else if (act.type === 'gallery_request_sent') {
                  actLabel = `Requested their photos (${act.raw.status})`;
                  actionBadge = <span className="text-[10px] bg-amber-50 text-amber-700 font-extrabold px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">{act.raw.status}</span>;
                } else if (act.type === 'contact_viewed') {
                  actLabel = "Viewed Your Contact Info";
                  actionBadge = <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">Contacts</span>;
                }

                return renderProfileRow(profile, actLabel, actionBadge, act.id);
              })}
            </div>
          )
        )}

        {/* INTEREST TAB */}
        {activeTab === 'Interest' && (
          receivedRequests.length === 0 && sentRequests.length === 0 ? renderEmptyState('Interest') : (
            <div className="space-y-3">
              {/* Show received requests first */}
              {receivedRequests.map((req) => {
                const profile = req.senderProfile;
                if (!profile) return null;
                const actionButtons = (
                  <div className="flex gap-1.5">
                    <button onClick={() => handleAccept(req._id)} className="bg-emerald-600 text-white p-1.5 rounded-lg text-xs hover:bg-emerald-700 transition-colors"><FaCheck /></button>
                    <button onClick={() => handleReject(req._id)} className="bg-red-500 text-white p-1.5 rounded-lg text-xs hover:bg-red-600 transition-colors"><FaTimes /></button>
                  </div>
                );
                return renderProfileRow(profile, "Received Interest Request", actionButtons, `req-rx-${req._id}`);
              })}
              
              {/* Sent Requests */}
              {sentRequests.map((req) => {
                const profile = req.receiverProfile;
                if (!profile) return null;
                const statusBadge = <span className="text-[10px] bg-amber-50 text-amber-700 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">{req.status}</span>;
                return renderProfileRow(profile, "Sent Interest Request", statusBadge, `req-tx-${req._id}`);
              })}
            </div>
          )
        )}

        {/* PROFILE VISITS TAB */}
        {activeTab === 'Visits' && (
          profileVisitsLoading ? (
            <div className="flex-grow flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-crimson-200 border-t-crimson-800 rounded-full animate-spin"></div>
            </div>
          ) : profileVisits.length === 0 ? renderEmptyState('Visits') : (
            <div className="space-y-3">
              {profileVisits.map((profile) => {
                return renderProfileRow(profile, "Visited your profile", null, `visit-${profile._id}`);
              })}
            </div>
          )
        )}

        {/* GALLERY REQUESTS TAB */}
        {activeTab === 'Gallery Requests' && (
          galleryRequestsLoading ? (
            <div className="flex-grow flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-crimson-200 border-t-crimson-800 rounded-full animate-spin"></div>
            </div>
          ) : galleryRequests.received.length === 0 && galleryRequests.sent.length === 0 ? renderEmptyState('Gallery Requests') : (
            <div className="space-y-3">
              {/* Received Gallery Requests */}
              {galleryRequests.received.map((req) => {
                const profile = req.senderProfile;
                if (!profile) return null;
                const actions = req.status === 'pending' ? (
                  <div className="flex gap-1.5">
                    <button onClick={() => handleAcceptGalleryRequest(req._id)} className="bg-[#4f080e] text-white px-2.5 py-1 rounded-lg text-[10px] font-bold">Approve</button>
                    <button onClick={() => handleRejectGalleryRequest(req._id)} className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-[10px] font-bold">Decline</button>
                  </div>
                ) : (
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{req.status}</span>
                );
                return renderProfileRow(profile, "Requested access to your photos", actions, `gallery-rx-${req._id}`);
              })}

              {/* Sent Gallery Requests */}
              {galleryRequests.sent.map((req) => {
                const profile = req.receiverProfile;
                if (!profile) return null;
                const statusBadge = <span className="text-[10px] bg-amber-50 text-amber-700 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">{req.status}</span>;
                return renderProfileRow(profile, "You requested photo access", statusBadge, `gallery-tx-${req._id}`);
              })}
            </div>
          )
        )}

        {/* CONTACTS TAB */}
        {activeTab === 'Contacts' && (
          contactsViewedLoading ? (
            <div className="flex-grow flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-crimson-200 border-t-crimson-800 rounded-full animate-spin"></div>
            </div>
          ) : contactsViewed.length === 0 ? renderEmptyState('Contacts') : (
            <div className="space-y-3">
              {contactsViewed.map((profile) => {
                return renderProfileRow(profile, "Viewed your contact details", null, `contact-${profile._id}`);
              })}
            </div>
          )
        )}

        {/* SHORTLISTED TAB */}
        {activeTab === 'Shortlisted' && (
          shortlistLoading ? (
            <div className="flex-grow flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
            </div>
          ) : shortlistedProfiles.length === 0 ? renderEmptyState('Shortlisted') : (
            <div className="space-y-3">
              {shortlistedProfiles.map((profile) => {
                const targetUserId = profile.user?._id || profile.user;
                const actionRemove = (
                  <button onClick={() => handleRemoveShortlist(targetUserId)} className="bg-amber-50 text-amber-700 p-1.5 rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors" title="Remove shortlist">
                    <FaStar className="text-xs" />
                  </button>
                );
                return renderProfileRow(profile, "Shortlisted Profile", actionRemove, `shortlist-${profile._id}`);
              })}
            </div>
          )
        )}

      </div>

      <style jsx="true">{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default MobileActivityPage;
