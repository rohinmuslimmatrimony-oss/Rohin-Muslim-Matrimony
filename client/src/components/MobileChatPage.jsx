import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaSearch, FaCommentSlash, FaArrowRight, FaLock } from 'react-icons/fa';

const MobileChatPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [connections, setConnections] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const res = await api.get('/requests/connections');
      if (res.data.success) {
        setConnections(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load connections:', error);
      toast.error('Failed to load active matches.');
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (partnerId) => {
    if (user?.plan === 'free') {
      toast.error('You need a Premium or Elite plan to use Chat.');
      navigate('/plans');
      return;
    }
    navigate(`/chat/${partnerId}`);
  };

  // Filter connections by name search query
  const filteredConnections = connections.filter(conn => 
    conn.name && conn.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#faf8f5] flex flex-col font-outfit pb-20">
      {/* Header */}
      <div className="pt-6 pb-4 px-6 bg-[#faf8f5]">
        <h1 className="text-[26px] font-extrabold text-[#111111] tracking-tight font-serif">Messages</h1>
        <p className="text-xs text-slate-500 font-medium">Chat with your matched connections</p>
      </div>

      {/* Free Plan Premium Upgrade Banner */}
      {user?.plan === 'free' && (
        <div className="mx-6 mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <FaLock className="text-xs text-white" />
            <span className="font-extrabold text-sm">Upgrade to Premium to Chat!</span>
          </div>
          <p className="text-[11px] opacity-90 leading-relaxed font-medium">
            Free plan users cannot message connections. Upgrade your package now to start chatting.
          </p>
          <Link 
            to="/plans" 
            className="self-start text-[10px] uppercase tracking-wider font-extrabold bg-[#4f080e] text-white px-4 py-2 rounded-xl hover:scale-105 transition-transform mt-1 shadow-sm"
          >
            Upgrade Now
          </Link>
        </div>
      )}

      {/* Search Box */}
      {connections.length > 0 && (
        <div className="px-6 mb-5">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations by name..."
              className="w-full bg-white border border-slate-200/80 rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4f080e]/40 focus:border-[#4f080e]"
            />
            <FaSearch className="absolute left-4 top-3.5 text-slate-400 text-sm" />
          </div>
        </div>
      )}

      {/* Chat List */}
      <div className="flex-1 px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#4f080e] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 font-semibold mt-4">Loading active chats...</p>
          </div>
        ) : filteredConnections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
              <FaCommentSlash className="text-2xl" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">No chats available</h3>
            <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-[240px]">
              {searchQuery 
                ? "No matching connections found for your search query."
                : "Once you connect with a profile under the Activity tab, you can start messaging here."}
            </p>
            {!searchQuery && (
              <Link 
                to="/activity" 
                className="mt-4 bg-gradient-to-r from-[#4f080e] to-[#700c12] text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 active:scale-95 transition-transform shadow-md shadow-crimson-900/10"
              >
                Go to Activity Center <FaArrowRight className="text-[9px]" />
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConnections.map((conn) => {
              const partnerId = conn.user?._id || conn.user;

              return (
                <div 
                  key={conn._id}
                  onClick={() => handleChatClick(partnerId)}
                  className="flex items-center gap-4 p-3.5 rounded-2xl bg-white border border-slate-100/50 hover:bg-slate-50 transition-all cursor-pointer shadow-sm mb-3 active:scale-[0.99] duration-150"
                >
                  {/* Avatar */}
                  <div className="relative">
                    {conn.profilePhoto && conn.profilePhoto !== '/uploads/blurred-avatar.png' ? (
                      <img 
                        src={conn.profilePhoto} 
                        alt={conn.name} 
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4f080e] to-[#7f181e] flex items-center justify-center font-bold text-white shadow-sm text-lg">
                        {conn.name ? conn.name[0].toUpperCase() : 'M'}
                      </div>
                    )}
                    
                    {/* Active Status Ring (Green dot) */}
                    <div className="absolute bottom-[-2px] right-[-2px] w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  
                  {/* Message Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-[14px] font-bold text-slate-800 truncate font-serif">{conn.name}</h3>
                      <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2">Chat Now</span>
                    </div>
                    <p className="text-[12px] font-medium text-slate-500 truncate">
                      {conn.profession || 'Not Specified'} • {conn.city}
                    </p>
                  </div>
                  
                  {/* Arrow Indicator */}
                  <div className="text-slate-300 pl-1">
                    <FaArrowRight className="text-xs" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileChatPage;
