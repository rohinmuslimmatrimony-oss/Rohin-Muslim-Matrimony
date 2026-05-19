import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import { FaCheckCircle, FaTimesCircle, FaCommentDots, FaPaperPlane } from 'react-icons/fa';

const InterestsPage = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('received');
  
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  
  const [activeChat, setActiveChat] = useState(null); // The user object we are chatting with
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchRequests();
    fetchConnections();
    
    // Initialize Socket
    socketRef.current = io('http://localhost:5000');
    if (user?._id) {
      socketRef.current.emit('join_room', user._id);
    }

    // Listen for incoming messages
    socketRef.current.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user]);

  useEffect(() => {
    // Auto scroll to bottom of chat
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const openChat = async (partnerProfile) => {
    if (user.plan === 'free') {
      toast.error('You need a Premium or Elite plan to use Chat.');
      return;
    }
    setActiveChat(partnerProfile);
    try {
      const res = await api.get(`/messages/${partnerProfile.user._id}`);
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
        
        // Emit via socket for real-time delivery
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
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-crimson-100 flex items-center justify-center font-bold text-crimson-900">
                  {profile.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-crimson-950">{profile.name}</h4>
                  <p className="text-xs text-slate-500">{profile.profession} • {profile.city}</p>
                </div>
              </div>
              
              {isReceived ? (
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(req._id)} className="text-crimson-600 hover:text-crimson-700 p-2 border border-crimson-200 rounded-full hover:bg-crimson-50 transition-colors" title="Accept">
                    <FaCheckCircle className="text-xl" />
                  </button>
                  <button onClick={() => handleReject(req._id)} className="text-red-500 hover:text-red-600 p-2 border border-red-200 rounded-full hover:bg-red-50 transition-colors" title="Decline">
                    <FaTimesCircle className="text-xl" />
                  </button>
                </div>
              ) : (
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">Pending</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-cream-50 pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-crimson-950 mb-8 border-b border-crimson-900/10 pb-4">Connections & Interests</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar / Tabs */}
          <div className="lg:col-span-1">
            <div className="flex flex-row lg:flex-col gap-2 mb-6 overflow-x-auto">
              <button 
                onClick={() => { setActiveTab('received'); setActiveChat(null); }}
                className={`flex-1 lg:flex-none text-left px-6 py-3.5 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'received' ? 'bg-crimson-950 text-gold-400 shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
              >
                Received Requests <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">{receivedRequests.length}</span>
              </button>
              <button 
                onClick={() => { setActiveTab('sent'); setActiveChat(null); }}
                className={`flex-1 lg:flex-none text-left px-6 py-3.5 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'sent' ? 'bg-crimson-950 text-gold-400 shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
              >
                Sent Requests <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">{sentRequests.length}</span>
              </button>
              <button 
                onClick={() => { setActiveTab('matches'); setActiveChat(null); }}
                className={`flex-1 lg:flex-none text-left px-6 py-3.5 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'matches' ? 'bg-crimson-950 text-gold-400 shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
              >
                Mutual Matches (Chat) <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">{connections.length}</span>
              </button>
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
                <div className="bg-crimson-950 px-6 py-4 flex items-center gap-4 text-white">
                  <button onClick={() => setActiveChat(null)} className="text-gold-400 hover:text-white">&larr;</button>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">{activeChat.name[0]}</div>
                  <div>
                    <h3 className="font-bold font-serif">{activeChat.name}</h3>
                    <p className="text-[10px] text-crimson-300">Connected Match</p>
                  </div>
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
          </div>

        </div>
      </div>
    </div>
  );
};

export default InterestsPage;
