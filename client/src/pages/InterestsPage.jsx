import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api, { SOCKET_BASE_URL } from '../services/api';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import { FaCheckCircle, FaTimesCircle, FaCommentDots, FaPaperPlane, FaStar, FaRegStar, FaHeart } from 'react-icons/fa';
import MobileActivityPage from '../components/MobileActivityPage';

const InterestsPage = () => {
  const { user, markNotificationsReadFromSender, fetchNotifications } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('received');
  
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [shortlistedProfiles, setShortlistedProfiles] = useState([]);
  const [shortlistLoading, setShortlistLoading] = useState(false);
  const [confirmCancelReqId, setConfirmCancelReqId] = useState(null);
  
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const activeChatRef = useRef(null);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    const handleInterestsUpdate = () => {
      fetchRequests();
      fetchConnections();
    };
    window.addEventListener('interests_updated', handleInterestsUpdate);
    return () => {
      window.removeEventListener('interests_updated', handleInterestsUpdate);
    };
  }, []);

  useEffect(() => {
    fetchRequests();
    fetchConnections();
    
    socketRef.current = io(SOCKET_BASE_URL);
    if (user?._id) {
      socketRef.current.emit('join_room', user._id);
    }

    socketRef.current.on('receive_message', (msg) => {
      const activePartnerId = activeChatRef.current?.user?._id || activeChatRef.current?.user;
      if (activePartnerId && (msg.sender === activePartnerId || msg.receiver === activePartnerId)) {
        setMessages((prev) => {
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        api.put(`/notifications/mark-read-sender/${activePartnerId}`).catch(() => {});
      }
      fetchNotifications();
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (activeChat) {
      localStorage.setItem('activeChatPartnerId', activeChat.user?._id || activeChat.user);
    } else {
      localStorage.removeItem('activeChatPartnerId');
    }
    return () => {
      localStorage.removeItem('activeChatPartnerId');
    };
  }, [activeChat]);

  // Fetch shortlisted profiles when tab becomes active
  useEffect(() => {
    if (activeTab === 'shortlisted') {
      fetchShortlisted();
    }
  }, [activeTab]);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests');
      if (res.data.success) {
        setReceivedRequests(res.data.received);
        setSentRequests(res.data.sent);
      }
    } catch (error) {
      toast.error('Failed to load requests');
    }
  };

  const fetchConnections = async () => {
    try {
      const res = await api.get('/requests/connections');
      if (res.data.success) {
        setConnections(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load connections');
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

  const handleRemoveShortlist = async (targetUserId) => {
    try {
      const res = await api.post(`/profiles/shortlist/${targetUserId}`);
      if (res.data.success) {
        toast.success('Removed from shortlist');
        // Immediately remove from local state
        setShortlistedProfiles(prev => prev.filter(p => p.user?._id !== targetUserId && p.user !== targetUserId));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove from shortlist');
    }
  };

  const handleAccept = async (id) => {
    try {
      const res = await api.put(`/requests/accept/${id}`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchRequests();
        fetchConnections();
      }
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await api.put(`/requests/reject/${id}`);
      if (res.data.success) {
        toast.success('Request declined');
        fetchRequests();
      }
    } catch (error) {
      toast.error('Failed to decline request');
    }
  };

  const handleCancelSentRequest = async (receiverUserId) => {
    try {
      const res = await api.delete(`/requests/cancel/${receiverUserId}`);
      if (res.data.success) {
        toast.success("Interest request withdrawn successfully.");
        fetchRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to withdraw interest');
    }
  };

  const openChat = async (partnerProfile) => {
    if (user.plan === 'free') {
      toast.error('You need a Premium or Elite plan to use Chat.');
      return;
    }
    setActiveChat(partnerProfile);
    const partnerId = partnerProfile.user?._id || partnerProfile.user;
    markNotificationsReadFromSender(partnerId);
    try {
      const res = await api.get(`/messages/${partnerId}`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load messages');
      setActiveChat(null);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const res = await api.post('/messages', { receiverId: activeChat.user._id, content: newMessage });
      if (res.data.success) {
        const msgObj = res.data.data;
        setMessages((prev) => [...prev, msgObj]);
        socketRef.current.emit('send_message', { 
          receiverId: activeChat.user._id, 
          messageObj: msgObj 
        });
        setNewMessage('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  };

  const renderRequests = (list, isReceived) => {
    if (list.length === 0) return <p className="text-slate-500 text-center py-10 italic">No pending requests found.</p>;
    
    return (
      <div className="space-y-4">
        {list.map((req) => {
          const profile = isReceived ? req.senderProfile : req.receiverProfile;
          if (!profile) return null;

          return (
            <div key={req._id} className="glass-card p-4 rounded-2xl flex justify-between items-center border border-crimson-900/10">
              <Link to={`/profile/${profile.user}`} className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-crimson-100 flex items-center justify-center font-bold text-crimson-900">
                  {profile.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-crimson-950 hover:underline">{profile.name}</h4>
                  <p className="text-xs text-slate-500">{profile.profession} • {profile.city}</p>
                </div>
              </Link>
              
              {isReceived ? (
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(req._id)} className="text-crimson-600 hover:text-crimson-700 p-2 border border-crimson-200 rounded-full hover:bg-crimson-50 transition-colors" title="Accept">
                    <FaCheckCircle className="text-xl" />
                  </button>
                  <button onClick={() => handleReject(req._id)} className="text-red-500 hover:text-red-600 p-2 border border-red-200 rounded-full hover:bg-red-50 transition-colors" title="Decline">
                    <FaTimesCircle className="text-xl" />
                  </button>
                </div>
              ) : confirmCancelReqId === req._id ? (
                <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-full px-2.5 py-1 shadow-sm transition-all duration-300">
                  <span className="text-[10px] font-bold text-red-700 px-1">Withdraw?</span>
                  <button
                    onClick={() => {
                      handleCancelSentRequest(profile.user);
                      setConfirmCancelReqId(null);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmCancelReqId(null)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full cursor-pointer"
                  >
                    No
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">Pending</span>
                  <button 
                    onClick={() => setConfirmCancelReqId(req._id)} 
                    className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full border border-red-200 hover:border-red-300 transition-all cursor-pointer"
                    title="Withdraw Interest"
                  >
                    Withdraw
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderShortlisted = () => {
    if (shortlistLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-crimson-200 border-t-crimson-900 rounded-full animate-spin"></div>
        </div>
      );
    }

    if (shortlistedProfiles.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
            <FaRegStar className="text-2xl text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-crimson-950 mb-2">No Shortlisted Profiles</h3>
          <p className="text-sm text-slate-500 max-w-xs">
            You haven't saved any profiles yet. Visit a profile and click "Shortlist" to bookmark it here.
          </p>
          <Link 
            to="/search" 
            className="mt-5 text-xs font-bold bg-crimson-950 text-white px-5 py-2.5 rounded-full hover:bg-crimson-800 transition-colors"
          >
            Browse Profiles
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {shortlistedProfiles.map((profile) => {
          const targetUserId = profile.user?._id || profile.user;
          return (
            <div
              key={profile._id}
              className="glass-card p-4 rounded-2xl flex justify-between items-center border border-amber-100 hover:border-amber-200 transition-all"
            >
              <Link to={`/profile/${targetUserId}`} className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity">
                {profile.profilePhoto && profile.profilePhoto !== '/uploads/blurred-avatar.png' ? (
                  <img
                    src={profile.profilePhoto}
                    alt={profile.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-200 shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-white shadow-sm text-lg">
                    {profile.name?.[0]?.toUpperCase() || 'M'}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-crimson-950 hover:underline flex items-center gap-1.5">
                    <FaStar className="text-amber-500 text-xs" />
                    {profile.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {profile.age ? `${profile.age} yrs` : ''}{profile.age && profile.profession ? ' • ' : ''}{profile.profession || ''}{(profile.age || profile.profession) && profile.city ? ' • ' : ''}{profile.city}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <Link
                  to={`/profile/${targetUserId}`}
                  className="text-xs font-bold text-crimson-700 bg-crimson-50 hover:bg-crimson-100 px-4 py-1.5 rounded-full border border-crimson-200 transition-colors"
                >
                  View
                </Link>
                <button
                  onClick={() => handleRemoveShortlist(targetUserId)}
                  className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-4 py-1.5 rounded-full border border-amber-200 hover:border-amber-300 transition-all flex items-center gap-1"
                  title="Remove from shortlist"
                >
                  <FaStar className="text-amber-500 text-[10px]" /> Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const tabs = [
    { id: 'received', label: 'Received Requests', count: receivedRequests.length },
    { id: 'sent', label: 'Sent Requests', count: sentRequests.length },
    { id: 'matches', label: 'Mutual Matches (Chat)', count: connections.length },
    { id: 'shortlisted', label: '⭐ Shortlisted', count: shortlistedProfiles.length },
  ];

  return (
    <>
      {/* MOBILE VIEW */}
      <div className="block lg:hidden">
        <MobileActivityPage 
          receivedRequests={receivedRequests}
          sentRequests={sentRequests}
          connections={connections}
          handleAccept={handleAccept}
          handleReject={handleReject}
          onCancelInterest={handleCancelSentRequest}
          user={user}
        />
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden lg:block min-h-screen bg-cream-50 pt-24 pb-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-serif font-bold text-crimson-950 mb-8 border-b border-crimson-900/10 pb-4">Connections & Interests</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar / Tabs */}
          <div className="lg:col-span-1">
            <div className="flex flex-row lg:flex-col gap-2 mb-6 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setActiveChat(null); }}
                  className={`flex-1 lg:flex-none text-left px-6 py-3.5 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                      ? tab.id === 'shortlisted' 
                        ? 'bg-amber-500 text-white shadow-md' 
                        : 'bg-crimson-950 text-gold-400 shadow-md'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                  {(tab.count > 0 || tab.id === 'shortlisted') && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {activeTab === 'received' && (
              <div className="animate-fadeIn">
                <h3 className="text-xl font-serif text-crimson-950 mb-4">Profiles interested in you</h3>
                {renderRequests(receivedRequests, true)}
              </div>
            )}

            {activeTab === 'sent' && (
              <div className="animate-fadeIn">
                <h3 className="text-xl font-serif text-crimson-950 mb-4">Interests you sent</h3>
                {renderRequests(sentRequests, false)}
              </div>
            )}

            {activeTab === 'matches' && !activeChat && (
              <div className="animate-fadeIn">
                <h3 className="text-xl font-serif text-crimson-950 mb-4 flex items-center gap-2">Your Connections <FaCommentDots className="text-crimson-700" /></h3>
                {connections.length === 0 ? (
                  <p className="text-slate-500 text-center py-10 italic">No mutual connections yet. Start sending interests!</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {connections.map(conn => (
                      <div key={conn._id} onClick={() => openChat(conn)} className="glass-card p-4 rounded-2xl flex items-center gap-4 border border-crimson-900/10 cursor-pointer hover:bg-crimson-50 hover:border-crimson-200 transition-all">
                        <div className="w-12 h-12 rounded-full bg-crimson-100 flex items-center justify-center font-bold text-crimson-900 flex-shrink-0">
                          {conn.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-crimson-950 truncate">{conn.name}</h4>
                          <p className="text-xs text-slate-500 truncate">Tap to chat</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Chat Interface */}
            {activeTab === 'matches' && activeChat && (
              <div className="flex flex-col h-[600px] glass-card rounded-3xl border border-crimson-900/10 overflow-hidden shadow-lg animate-fadeIn">
                {/* Chat Header */}
                <div className="bg-crimson-950 px-6 py-4 flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setActiveChat(null)} className="text-gold-400 hover:text-white">&larr;</button>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">{activeChat.name[0]}</div>
                    <div>
                      <h3 className="font-bold font-serif">{activeChat.name}</h3>
                      <p className="text-[10px] text-crimson-300">Connected Match</p>
                    </div>
                  </div>
                  <Link 
                    to={`/profile/${activeChat.user?._id || activeChat.user}`} 
                    className="text-xs font-bold bg-gold-gradient text-crimson-950 px-3.5 py-1.5 rounded-full hover:scale-105 transition-transform"
                  >
                    View Profile
                  </Link>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 p-6 overflow-y-auto bg-slate-50 flex flex-col gap-3">
                  {messages.map((msg, idx) => {
                    const isMine = msg.sender === user._id;
                    return (
                      <div key={idx} className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMine ? 'bg-crimson-800 text-white self-end rounded-br-sm' : 'bg-white border border-slate-200 text-slate-700 self-start rounded-bl-sm shadow-sm'}`}>
                        {msg.content}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-200 flex gap-2 items-center">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-slate-100 px-4 py-3 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-crimson-900/20"
                  />
                  <button type="submit" disabled={!newMessage.trim()} className="w-12 h-12 bg-gold-gradient rounded-full flex items-center justify-center text-crimson-950 hover:scale-105 transition-transform disabled:opacity-50">
                    <FaPaperPlane className="ml-[-2px]" />
                  </button>
                </form>
              </div>
            )}

            {/* Shortlisted Profiles Tab */}
            {activeTab === 'shortlisted' && (
              <div className="animate-fadeIn">
                <h3 className="text-xl font-serif text-crimson-950 mb-4 flex items-center gap-2">
                  <FaStar className="text-amber-500" /> Your Shortlisted Profiles
                </h3>
                {renderShortlisted()}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
    </>
  );
};

export default InterestsPage;
