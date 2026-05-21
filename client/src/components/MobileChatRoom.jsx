import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api, { SOCKET_BASE_URL } from '../services/api';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import { FaChevronLeft, FaPaperPlane, FaUser } from 'react-icons/fa';

const MobileChatRoom = () => {
  const { id } = useParams(); // Chat partner's User ID
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Suppress global message toasts for this user while in this room
  useEffect(() => {
    localStorage.setItem('activeChatPartnerId', id);
    return () => {
      localStorage.removeItem('activeChatPartnerId');
    };
  }, [id]);

  useEffect(() => {
    // 1. Fetch Partner's Profile Details
    const fetchPartnerProfile = async () => {
      try {
        const res = await api.get(`/profiles/${id}`);
        if (res.data.success) {
          setPartnerProfile(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch partner profile:', error);
        toast.error('Failed to load profile details.');
      }
    };

    // 2. Fetch Chat Messages History
    const fetchChatHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/messages/${id}`);
        if (res.data.success) {
          setMessages(res.data.data);
        }
      } catch (error) {
        console.error('Failed to load message history:', error);
        // Show specific error messages if plan feature locks chat
        if (error.response?.status === 403) {
          toast.error(error.response?.data?.message || 'Chat is not enabled on your plan.');
          navigate('/plans');
        } else {
          toast.error('Failed to load messages.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerProfile();
    fetchChatHistory();

    // 3. Initialize Socket.io Connection
    socketRef.current = io(SOCKET_BASE_URL);
    if (user?._id) {
      socketRef.current.emit('join_room', user._id);
    }

    // 4. Listen for Incoming Messages
    socketRef.current.on('receive_message', (msg) => {
      // Append if the message belongs to this specific chat session
      if (msg.sender === id || msg.receiver === id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    // Cleanup socket on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [id, user, navigate]);

  // Auto-scroll to the bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send Message Handler
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await api.post('/messages', { receiverId: id, content: newMessage });
      if (res.data.success) {
        const msgObj = res.data.data;
        setMessages((prev) => [...prev, msgObj]);
        
        // Emit via socket for real-time delivery
        if (socketRef.current) {
          socketRef.current.emit('send_message', { 
            receiverId: id, 
            messageObj: msgObj 
          });
        }
        
        setNewMessage('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message.');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#faf8f5] font-outfit">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-150 shadow-sm z-10 sticky top-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Back button */}
          <button onClick={() => navigate('/chat')} className="p-2 -ml-2 text-slate-800 active:scale-95 transition-transform">
            <FaChevronLeft className="text-base" />
          </button>
          
          {/* Avatar & Details */}
          <div className="flex items-center gap-3 min-w-0">
            {partnerProfile?.profilePhoto && partnerProfile.profilePhoto !== '/uploads/blurred-avatar.png' ? (
              <img 
                src={partnerProfile.profilePhoto} 
                alt={partnerProfile.name} 
                className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4f080e] to-[#7f181e] flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0 text-sm">
                {partnerProfile?.name ? partnerProfile.name[0].toUpperCase() : 'M'}
              </div>
            )}
            
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-extrabold text-[#4f080e] truncate font-serif leading-tight">
                {partnerProfile?.name || 'Loading...'}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 leading-none mt-0.5">
                {partnerProfile?.profession ? `${partnerProfile.profession} • ` : ''}{partnerProfile?.city || 'Connected Match'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Profile Link */}
        <Link 
          to={`/profile/${id}`}
          className="p-2.5 text-[#4f080e] hover:bg-slate-50 rounded-full border border-slate-100 active:scale-95 transition-transform flex items-center justify-center"
          title="View Profile"
        >
          <FaUser className="text-xs" />
        </Link>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#faf8f5]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 h-full">
            <div className="w-6 h-6 border-3 border-[#4f080e] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[11px] text-slate-400 font-semibold mt-3">Loading chat history...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 h-full text-center px-6">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
              <span>💬</span>
            </div>
            <h4 className="text-xs font-bold text-slate-700">No messages yet</h4>
            <p className="text-[11px] font-medium text-slate-400 max-w-[200px] mt-1 leading-relaxed">
              Start the conversation by typing your first message below.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, idx) => {
              const isMine = msg.sender === user?._id;
              return (
                <div key={msg._id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[78%] px-4 py-2.5 text-xs leading-relaxed shadow-sm font-medium ${
                      isMine 
                        ? 'bg-gradient-to-r from-[#4f080e] to-[#700c12] text-white rounded-[20px] rounded-br-sm' 
                        : 'bg-white border border-slate-150/60 text-slate-800 rounded-[20px] rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-slate-150/80 z-10 pb-5">
        <form onSubmit={handleSend} className="flex items-center gap-3 relative">
          <input 
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 bg-slate-100/80 rounded-full py-3 pl-4 pr-11 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4f080e]/40 focus:bg-white"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="absolute right-1.5 w-9 h-9 bg-gradient-to-r from-[#4f080e] to-[#700c12] rounded-full flex items-center justify-center text-white shadow-md active:scale-95 disabled:opacity-50 disabled:shadow-none transition-transform"
          >
            <FaPaperPlane className="ml-[-1px] text-xs" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MobileChatRoom;
