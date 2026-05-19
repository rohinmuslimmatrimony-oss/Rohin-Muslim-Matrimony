import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaUserLock, FaLock, FaHeart } from 'react-icons/fa';

const ProfileCard = ({ profile, currentPlan, onSendInterest, isSent, isReceived }) => {
  const isFreePlan = currentPlan === 'free';

  return (
    <div className="glass-card hover:-translate-y-1.5 transition-all duration-300 rounded-2xl overflow-hidden shadow-md flex flex-col group border border-crimson-950/5">
      {/* Profile Image & Gold Gradient Trim */}
      <div className="relative h-60 w-full overflow-hidden bg-slate-900 flex items-center justify-center">
        {profile.profilePhoto && profile.profilePhoto !== '/uploads/default-avatar.png' ? (
          <img
            src={`http://localhost:5000${profile.profilePhoto}`}
            alt={profile.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-crimson-900/30 flex items-center justify-center border border-crimson-800/40">
              <span className="text-2xl font-serif text-gold-500 font-bold uppercase">{profile.name[0]}</span>
            </div>
            <span className="text-slate-400 text-xs font-medium uppercase tracking-widest">Matrimony Member</span>
          </div>
        )}

        {/* Sect Badge (Emerald) */}
        <span className="absolute top-3 left-3 bg-crimson-900/90 text-gold-400 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-md border border-crimson-700/50">
          {profile.sect || 'Sunni'}
        </span>

        {/* Locked Overlay for Free Users */}
        {isFreePlan && (
          <div className="absolute inset-0 bg-crimson-950/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="flex items-center gap-1.5 bg-gold-gradient text-crimson-950 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              <FaLock /> View Locked
            </span>
          </div>
        )}
      </div>

      {/* Profile Basic Info */}
      <div className="p-5 flex-1 flex flex-col gap-3.5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-slate-900 text-xl font-bold font-serif group-hover:text-crimson-850 transition-colors">
              {profile.name}, <span className="font-sans font-light text-lg text-slate-500">{profile.age}</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">{profile.religion || 'Islam'}</span>
          </div>
        </div>

        {/* Core Attributes */}
        <div className="space-y-2 text-sm text-slate-600 flex-1">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-crimson-700" />
            <span>{profile.city}</span>
          </div>

          {/* Masked Info if viewer is Free */}
          {isFreePlan ? (
            <div className="space-y-2 border-t border-slate-100 pt-2.5 mt-2.5">
              <div className="flex items-center gap-2 text-slate-400 italic text-xs">
                <FaUserLock className="text-gold-500" />
                <span>Profession locked (Premium)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 italic text-xs">
                <FaUserLock className="text-gold-500" />
                <span>Education details locked</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 border-t border-slate-100 pt-2.5 mt-2.5">
              <div className="flex items-center gap-2">
                <FaBriefcase className="text-crimson-700 text-[13px]" />
                <span className="truncate">{profile.profession}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaGraduationCap className="text-crimson-700 text-base" />
                <span className="truncate">{profile.education}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex gap-2.5 mt-2 pt-3.5 border-t border-slate-100">
          <Link
            to={`/profile/${profile.user?._id || profile.user}`}
            className="flex-1 text-center border border-crimson-900/10 text-crimson-900 hover:bg-crimson-900/5 font-semibold text-xs py-2.5 rounded-full transition-colors flex items-center justify-center gap-1.5"
          >
            {isFreePlan ? <FaLock className="text-[10px] text-gold-600" /> : null} View Details
          </Link>

          {onSendInterest && (
            <button
              onClick={() => onSendInterest(profile.user?._id || profile.user)}
              disabled={isSent || isReceived}
              className={`px-4.5 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 ${
                isSent
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                  : isReceived
                  ? 'bg-crimson-900/10 text-crimson-900 cursor-not-allowed shadow-none'
                  : 'bg-gold-gradient text-crimson-950 hover:shadow-gold-500/20 hover:scale-[1.02]'
              }`}
            >
              <FaHeart className="text-[10px]" />
              {isSent ? 'Sent' : isReceived ? 'Received' : 'Interest'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
