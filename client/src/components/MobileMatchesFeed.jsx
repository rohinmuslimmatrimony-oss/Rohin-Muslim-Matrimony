import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api, { SOCKET_BASE_URL } from '../services/api';
import toast from 'react-hot-toast';
import { FaSearch, FaBookmark, FaComment, FaHeart, FaCrown } from 'react-icons/fa';
import LogoLoader from './LogoLoader';
import { useNavigate } from 'react-router-dom';

const MobileMatchesFeed = () => {
  const { user } = useContext(AuthContext);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Matches'); // 'Matches' or 'Online'
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfiles();
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

  const handleAction = (action, profileId) => {
    if (action === 'message') {
      navigate('/chat');
    } else {
      toast.success(`${action} triggered for this profile!`);
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
                  <div className="flex items-center justify-between px-3 gap-4 pb-2">
                    <div className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform" onClick={() => handleAction('Shortlist', p._id)}>
                      <button className="w-12 h-12 rounded-full bg-[#111111] flex items-center justify-center text-white shadow-lg border border-white/5">
                        <FaBookmark className="text-sm" />
                      </button>
                      <span className="text-white text-[10px] font-semibold tracking-wider">Shortlist</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform" onClick={() => handleAction('message', p._id)}>
                      <button className="w-14 h-14 rounded-full bg-[#5c7cfa] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                        <FaComment className="text-xl" />
                      </button>
                      <span className="text-white text-[10px] font-semibold tracking-wider">Message</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform" onClick={() => handleAction('Interest', p._id)}>
                      <button className="w-12 h-12 rounded-full bg-[#fa5252] flex items-center justify-center text-white shadow-lg shadow-red-500/30">
                        <FaHeart className="text-sm" />
                      </button>
                      <span className="text-white text-[10px] font-semibold tracking-wider">Interest</span>
                    </div>
                  </div>
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
