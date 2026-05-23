import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaCheckCircle, FaChevronRight, FaPen, 
  FaCreditCard, FaCrown, FaBan, FaInfoCircle
} from 'react-icons/fa';
import { SOCKET_BASE_URL } from '../services/api';
import toast from 'react-hot-toast';

const MobileProfilePage = ({ onEditClick }) => {
  const { user, profile, getCompleteness } = useContext(AuthContext);
  const navigate = useNavigate();

  const completeness = getCompleteness ? getCompleteness().score : 70; // fallback to 70
  const photoUrl = profile?.profilePhoto && profile.profilePhoto !== '/uploads/default-avatar.png'
    ? `${SOCKET_BASE_URL}${profile.profilePhoto}`
    : ''; // We'll render initials if empty
    
  // Mock member ID for display
  const memberId = user?._id ? `B${user._id.substring(0, 11).toUpperCase()}` : 'B60542744118';

  const menuItems = [
    { icon: <FaPen className="text-slate-600 text-[15px]" />, label: 'Edit Profile', action: onEditClick },
    { icon: <FaCreditCard className="text-slate-600 text-[15px]" />, label: 'Payment Info', action: () => navigate('/payment-info') },
    { icon: <FaCrown className="text-slate-600 text-[15px]" />, label: 'Explore Plans', action: () => navigate('/plans') },
    { icon: <FaBan className="text-slate-600 text-[15px]" />, label: 'Blocked Users', action: () => navigate('/blocked-users') },
    { icon: <FaInfoCircle className="text-slate-600 text-[15px]" />, label: 'Help & Support', action: () => navigate('/support') }
  ];

  const premiumPlans = [
    { name: 'BASIC PLAN', price: '₹261', features: 'Unlimited Messaging', gradient: 'from-[#f8e9de] to-[#e8d2c0]', border: 'border-[#e3d1c5]', btnGradient: 'from-[#9b664d] to-[#80503a]' },
    { name: 'SILVER PLAN', price: '₹392', features: 'View 10 Contact Numbers', gradient: 'from-[#f3f4f6] to-[#e5e7eb]', border: 'border-[#d1d5db]', btnGradient: 'from-[#6b7280] to-[#4b5563]' },
    { name: 'GOLD PLAN', price: '₹458', features: 'View 15 Contact Numbers', gradient: 'from-[#fef3c7] to-[#fde68a]', border: 'border-[#fcd34d]', btnGradient: 'from-[#d97706] to-[#b45309]' }
  ];

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#faf8f5] flex flex-col font-outfit pb-32">
      
      {/* Top Bar */}
      <div className="flex justify-between items-center px-5 pt-8 pb-4 bg-[#faf8f5]">
        <h1 className="text-xl font-extrabold text-[#111111]">Profile</h1>
        <span className="text-[13px] font-medium text-slate-500">Member ID: {memberId}</span>
      </div>

      <div className="px-5">
        {/* Profile Section */}
        <div className="flex flex-col items-center mb-8">
          {/* Profile Image with Progress Ring */}
          <div className="relative w-28 h-28 mb-4">
            <svg className="w-full h-full transform -rotate-90 absolute top-0 left-0">
              <circle cx="56" cy="56" r="52" fill="none" stroke="#f1f5f9" strokeWidth="4" />
              <circle 
                cx="56" 
                cy="56" 
                r="52" 
                fill="none" 
                stroke={completeness === 100 ? '#10b981' : '#e61a52'} 
                strokeWidth="4" 
                strokeDasharray="326.72" 
                strokeDashoffset={326.72 - (326.72 * completeness) / 100}
                strokeLinecap="round"
              />
            </svg>
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className="w-full h-full rounded-full object-cover p-2 border-2 border-transparent" />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center p-2">
                <div className="w-full h-full rounded-full bg-crimson-100 flex items-center justify-center text-3xl font-bold text-crimson-800">
                  {profile?.name ? profile.name[0].toUpperCase() : 'M'}
                </div>
              </div>
            )}
            
            {/* Crown Overlay (Premium/Elite Plan) */}
            {(user?.plan === 'premium' || user?.plan === 'elite') && (
              <div className={`absolute top-1.5 left-1.5 p-1.5 rounded-full shadow-lg border text-white z-10 flex items-center justify-center ${
                user.plan === 'elite' 
                  ? 'bg-gradient-to-br from-[#d4af37] via-[#f3e3a3] to-[#b28e28] border-gold-400/40 text-[#4f080e]' 
                  : 'bg-gradient-to-br from-[#10b981] via-[#6ee7b7] to-[#047857] border-emerald-400/40'
              }`}>
                <FaCrown className="text-[11px]" />
              </div>
            )}

            {/* Verification Badge Overlay */}
            {user?.isManuallyVerified && (
              <div className="absolute top-1.5 right-1.5 bg-emerald-500 border-2 border-white p-1 rounded-full shadow-md text-white z-10 flex items-center justify-center">
                <FaCheckCircle className="text-[10px]" />
              </div>
            )}
            
            {/* Percentage Badge */}
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md whitespace-nowrap ${completeness === 100 ? 'bg-[#10b981]' : 'bg-[#e61a52]'}`}>
              {completeness}%
            </div>
          </div>

          {/* Profile Status Pill */}
          {completeness < 100 && (
            <div className="border border-red-200 bg-red-50 text-[#e61a52] text-[13px] font-semibold px-4 py-1.5 rounded-full mb-3 shadow-sm">
              Incomplete Profile
            </div>
          )}

          {/* Name and Badge */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap justify-center">
            <h2 className="text-[22px] font-extrabold text-[#111111] tracking-tight">{profile?.name || 'Member'}</h2>
            {user?.isManuallyVerified && (
              <span className="flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-sm">
                <FaCheckCircle className="text-[10px]" /> Verified
              </span>
            )}
          </div>

          {/* Plan Type Pill */}
          <div className="flex items-center justify-center mb-2">
            <span className={`text-[12px] font-extrabold px-3.5 py-1 rounded-full tracking-wide flex items-center gap-1 shadow-sm border ${
              user?.plan === 'elite' 
                ? 'bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-amber-500/10 text-amber-800 border-amber-300'
                : user?.plan === 'premium'
                ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-400/10 to-emerald-500/10 text-emerald-800 border-emerald-300'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {user?.plan === 'elite' && <FaCrown className="text-amber-600 text-[10px] animate-pulse" />}
              {user?.plan === 'premium' && <FaCrown className="text-emerald-600 text-[10px]" />}
              <span className="uppercase">{user?.plan || 'Free'} Member</span>
            </span>
          </div>

          {/* Complete Profile CTA */}
          {completeness < 100 && (
            <button onClick={onEditClick} className="w-full max-w-sm bg-[#e61a52] text-white font-bold py-3.5 px-6 rounded-2xl flex justify-between items-center mt-6 shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-transform">
              <span className="text-[15px]">Complete your profile</span>
              <FaChevronRight className="text-sm" />
            </button>
          )}
        </div>

        {/* Verification Card */}
        <Link to="/verify-identity" className="block mb-6">
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-5 flex items-center justify-between shadow-sm cursor-pointer hover:bg-indigo-50 transition-colors">
            <div className="flex items-start gap-3">
              <FaCheckCircle className="text-[#3b82f6] text-xl mt-1 flex-shrink-0" />
              <span className="text-[15px] font-bold text-slate-800 leading-snug pr-4">
                {user?.isManuallyVerified 
                  ? 'Your profile is identity-verified. Tap to view document details.' 
                  : 'Build trust on your profile with document verification'}
              </span>
            </div>
            <FaChevronRight className="text-slate-400 text-[11px] flex-shrink-0" />
          </div>
        </Link>

        {/* Premium Plans Section - Only show for free members */}
        {(!user?.plan || user.plan === 'free') && (
          <div className="mb-8">
            <h3 className="text-[15px] font-bold text-[#111111] mb-4">Premium Plans</h3>
          
          <div className="flex overflow-x-auto gap-4 snap-x hide-scrollbar pb-2 -mx-5 px-5">
            {premiumPlans.map((plan, idx) => (
              <div key={idx} className={`min-w-[280px] snap-center bg-gradient-to-br ${plan.gradient} rounded-3xl p-5 shadow-sm border ${plan.border}`}>
                <h4 className="text-[13px] font-bold text-slate-700 tracking-widest uppercase mb-1">{plan.name}</h4>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-3xl font-extrabold text-[#111111]">{plan.price}</span>
                  <span className="text-[13px] font-medium text-slate-600 mb-1">onwards</span>
                </div>

                <div className={`border-t border-black/10 pt-4 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-slate-700 text-[10px]" />
                    <span className="text-[13px] font-semibold text-slate-800">{plan.features}</span>
                  </div>
                  <Link to="/plans" className={`bg-gradient-to-r ${plan.btnGradient} text-white text-[11px] font-bold px-4 py-2 rounded-full shadow-md whitespace-nowrap`}>
                    Upgrade Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Settings Menu List */}
        <div className="bg-transparent border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm mb-6">
          {menuItems.map((item, index) => (
            <div 
              key={index}
              onClick={item.action}
              className={`flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                {item.icon}
                <span className="text-[15px] font-medium text-[#111111]">{item.label}</span>
              </div>
              <FaChevronRight className="text-slate-400 text-[11px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileProfilePage;
