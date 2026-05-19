import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProfileCard from '../components/ProfileCard';

const Dashboard = () => {
  const { user, profile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user || !profile) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-cream-50 pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[0%] left-[0%] w-96 h-96 bg-crimson-900/5 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-[0%] right-[0%] w-96 h-96 bg-gold-500/5 rounded-full blur-[100px] -z-10"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-crimson-950 mb-1">Assalamu Alaikum, {profile.name}</h1>
            <p className="text-slate-600 font-medium">Welcome to your Rohin Muslim Matrimony dashboard.</p>
          </div>
          {user.plan === 'free' && (
            <button onClick={() => navigate('/plans')} className="bg-gold-gradient text-crimson-950 px-6 py-2.5 rounded-full font-bold shadow-lg shadow-gold-500/20 hover:scale-105 transition-all">
              Upgrade Plan
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Plan Status Card */}
          <div className="glass-card p-6 rounded-3xl shadow-sm border border-crimson-900/10 flex flex-col justify-between">
            <div>
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Current Membership</h3>
              <div className="flex items-end gap-3 mb-2">
                <span className={`text-3xl font-serif font-bold capitalize ${user.plan === 'elite' ? 'text-gold-600' : user.plan === 'premium' ? 'text-crimson-600' : 'text-crimson-950'}`}>
                  {user.plan}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                {user.plan === 'free' ? 'Upgrade to connect with matches directly.' : 'Enjoying premium matchmaking benefits.'}
              </p>
            </div>
            {user.plan !== 'elite' && (
               <button onClick={() => navigate('/plans')} className="text-sm font-semibold text-crimson-800 hover:text-gold-600 transition-colors w-max">
                 View Upgrade Options &rarr;
               </button>
            )}
          </div>

          {/* View Limit Card */}
          <div className="glass-card p-6 rounded-3xl shadow-sm border border-crimson-900/10">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Daily Profile Views</h3>
            <div className="flex items-end justify-between mb-3">
              <span className="text-3xl font-bold text-crimson-950">
                {user.viewLimit > 9000 ? 'Unlimited' : `${user.viewedCount || 0} / ${user.viewLimit}`}
              </span>
            </div>
            {user.viewLimit < 9000 ? (
              <>
                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2 overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-crimson-600 to-gold-400 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(((user.viewedCount || 0) / user.viewLimit) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500">Limits reset at midnight.</p>
              </>
            ) : (
              <p className="text-sm font-medium text-crimson-700 bg-crimson-50 px-3 py-1.5 rounded-lg inline-block border border-crimson-200">
                You have unrestricted browsing access.
              </p>
            )}
          </div>
          
          {/* Profile Status Card */}
          <div className="glass-card p-6 rounded-3xl shadow-sm border border-crimson-900/10">
             <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">Privacy & Status</h3>
             <div className="flex flex-col gap-3">
               <div className="flex items-center gap-3 bg-white/60 p-3 rounded-xl border border-slate-100">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${profile.isPhotoPublic ? 'bg-crimson-100 text-crimson-600' : 'bg-slate-200 text-slate-500'}`}>
                   {profile.isPhotoPublic ? '👁️' : '🔒'}
                 </div>
                 <div className="flex flex-col">
                   <span className="text-sm font-bold text-slate-800">Photo Visibility</span>
                   <span className="text-xs text-slate-500">{profile.isPhotoPublic ? 'Visible to public' : 'Blurred / Private'}</span>
                 </div>
               </div>
               
               <button onClick={() => navigate('/edit-profile')} className="w-full py-2 border-2 border-crimson-900 text-crimson-950 rounded-xl text-sm font-bold hover:bg-crimson-50 transition-colors mt-1">
                 Update Profile & Privacy
               </button>
             </div>
          </div>
        </div>
        
        {/* Call to Action Row */}
        <div className="bg-crimson-950 rounded-3xl p-8 md:p-12 shadow-xl border border-gold-500/20 text-center relative overflow-hidden">
            <div className="absolute top-[-50%] left-[-10%] w-64 h-64 bg-gold-500/20 rounded-full blur-[80px]"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-serif text-white mb-3">Begin Your Search</h2>
              <p className="text-slate-300 mb-8 max-w-xl mx-auto">Browse verified profiles matching your religious, professional, and personal preferences in our trusted network.</p>
              <button onClick={() => navigate('/search')} className="bg-gold-gradient text-crimson-950 px-10 py-4 rounded-full font-bold shadow-lg shadow-gold-500/20 hover:scale-105 transition-transform text-lg flex items-center justify-center gap-2 mx-auto">
                Discover Matches &rarr;
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
