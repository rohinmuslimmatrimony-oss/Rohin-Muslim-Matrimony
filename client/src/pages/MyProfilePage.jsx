import React, { useContext, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaCheckCircle, FaChevronRight, FaPen, 
  FaCreditCard, FaCrown, FaBan, FaInfoCircle, FaSignOutAlt, FaLock, FaShieldAlt, FaCamera
} from 'react-icons/fa';
import { SOCKET_BASE_URL } from '../services/api';
import DefaultAvatar from '../components/DefaultAvatar';
import api from '../services/api';
import toast from 'react-hot-toast';

const MyProfilePage = () => {
  const { user, profile, getCompleteness, logout, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const toastId = toast.loading('Uploading profile photo...');
    setPhotoUploading(true);
    try {
      const data = new FormData();
      data.append('profilePhoto', file);

      const res = await api.put('/profiles/my-profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Profile photo updated successfully!', { id: toastId });
        await refreshUser();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update photo', { id: toastId });
    } finally {
      setPhotoUploading(false);
    }
  };

  const completeness = getCompleteness ? getCompleteness().score : 70;
  const photoUrl = profile?.profilePhoto && profile.profilePhoto !== '/uploads/default-avatar.png'
    ? `${SOCKET_BASE_URL}${profile.profilePhoto}`
    : '';
    
  const memberId = user?._id ? `B${user._id.substring(0, 11).toUpperCase()}` : 'B60542744118';
  const isAdmin = user?.role === 'admin';

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters!');
      return;
    }
    setPwLoading(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      if (res.data.success) {
        toast.success('Password changed successfully!');
        setShowPasswordModal(false);
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const allMenuItems = [
    { icon: <FaPen className="text-[15px]" />, label: 'Edit Profile', action: () => navigate('/edit-profile'), adminOnly: false },
    { icon: <FaCreditCard className="text-[15px]" />, label: 'Payment & Invoices', action: () => navigate('/payment-info'), adminOnly: false, hideForAdmin: true },
    { icon: <FaCrown className="text-[15px]" />, label: 'Explore Plans', action: () => navigate('/plans'), adminOnly: false, hideForAdmin: true },
    { icon: <FaShieldAlt className="text-[15px]" />, label: 'Admin Dashboard', action: () => navigate('/admin'), adminOnly: true },
    { icon: <FaBan className="text-[15px]" />, label: 'Blocked Users', action: () => navigate('/blocked-users'), adminOnly: false, hideForAdmin: true },
    { icon: <FaLock className="text-[15px]" />, label: 'Change Password', action: () => setShowPasswordModal(true), adminOnly: false },
    { icon: <FaSignOutAlt className="text-red-500 text-[15px]" />, label: 'Logout', action: () => { logout(); navigate('/'); }, danger: true }
  ];

  const menuItems = allMenuItems.filter(item => {
    if (isAdmin) {
      return item.label === 'Admin Dashboard' || item.label === 'Change Password';
    }
    if (item.adminOnly) return false;
    return true;
  });

  const premiumPlans = [
    { name: 'BASIC PLAN', price: '₹261', features: 'Unlimited Messaging', gradient: 'from-[#f8e9de] to-[#e8d2c0]', border: 'border-[#e3d1c5]', btnGradient: 'from-[#9b664d] to-[#80503a]' },
    { name: 'SILVER PLAN', price: '₹392', features: 'View 10 Contact Numbers', gradient: 'from-[#f3f4f6] to-[#e5e7eb]', border: 'border-[#d1d5db]', btnGradient: 'from-[#6b7280] to-[#4b5563]' },
    { name: 'GOLD PLAN', price: '₹458', features: 'View 15 Contact Numbers', gradient: 'from-[#fef3c7] to-[#fde68a]', border: 'border-[#fcd34d]', btnGradient: 'from-[#d97706] to-[#b45309]' }
  ];

  return (
    <div className="min-h-screen flex flex-col font-outfit pt-6 lg:pt-8 pb-32 relative overflow-hidden bg-cream-50 text-slate-800">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-crimson-900/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] bg-crimson-800/2 rounded-full blur-[100px] transform -translate-x-1/2"></div>
      </div>
      <div className={`relative z-10 ${isAdmin ? 'max-w-6xl' : 'max-w-2xl'} mx-auto w-full px-5`}>
        
        {/* Top Bar */}
        <div className="flex justify-between items-center pt-8 pb-4">
          <h1 className="text-2xl font-serif font-extrabold tracking-tight text-[#4f080e] drop-shadow-sm">{isAdmin ? 'Admin Settings' : 'My Profile'}</h1>
          {!isAdmin && <span className="text-[13px] font-bold text-crimson-900 bg-white px-3 py-1.5 rounded-full border border-[#d4af37]/30 shadow-sm">ID: {memberId}</span>}
        </div>

        {/* Content Area */}
        <div className={isAdmin ? "flex flex-col lg:flex-row gap-12 lg:gap-24" : ""}>
          {/* Left Column: Profile Section */}
          <div className={isAdmin ? "lg:w-[40%] flex-shrink-0" : ""}>
            <div className={`flex flex-col items-center p-10 rounded-2xl border border-[#d4af37]/25 glass-card shadow-xl relative overflow-hidden ${isAdmin ? 'h-full justify-center' : 'mb-8'}`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-gold-400/5 to-transparent rounded-full blur-[60px]"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-crimson-400/5 to-transparent rounded-full blur-[60px]"></div>
 
              {/* Profile Image with Progress Ring */}
              <div 
                className={`relative w-44 h-44 mb-6 z-10 ${isAdmin ? 'cursor-pointer group' : ''}`}
                onClick={() => isAdmin && fileInputRef.current?.click()}
              >
                {!isAdmin && (
                  <svg viewBox="0 0 128 128" className="w-full h-full transform -rotate-90 absolute top-0 left-0">
                    <circle cx="64" cy="64" r="60" fill="none" stroke="rgba(79, 8, 14, 0.05)" strokeWidth="4" />
                    <circle 
                      cx="64" 
                      cy="64" 
                      r="60" 
                      fill="none" 
                      stroke={completeness === 100 ? '#10b981' : '#e61a52'} 
                      strokeWidth="4" 
                      strokeDasharray="376.99" 
                      strokeDashoffset={376.99 - (376.99 * completeness) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" className={`w-full h-full rounded-full object-cover p-2 border-2 ${isAdmin ? 'border-gold-500 shadow-[0_0_15px_rgba(212,175,55,0.15)] bg-white group-hover:scale-105 transition-transform duration-300' : user?.plan === 'elite' ? 'border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.15)] bg-white' : user?.plan === 'premium' ? 'border-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.15)] bg-white' : 'border-transparent bg-white'}`} />
                ) : (
                  <div className={`w-full h-full rounded-full flex items-center justify-center p-2 border-2 ${isAdmin ? 'bg-white border-gold-500 shadow-[0_0_15px_rgba(212,175,55,0.15)] group-hover:scale-105 transition-transform duration-300' : 'bg-[#e2e8f0] ' + (user?.plan === 'elite' ? 'border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.15)]' : user?.plan === 'premium' ? 'border-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'border-transparent')}`}>
                    <DefaultAvatar gender={profile?.gender} className={`w-full h-full rounded-full object-contain bg-[#e2e8f0] ${isAdmin ? 'brightness-0 invert opacity-90' : ''}`} />
                  </div>
                )}
                
                {isAdmin && (
                  <div className="absolute inset-2 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <FaCamera className="text-white text-2xl mb-1.5" />
                    <span className="text-[10px] text-gold-300 font-bold uppercase tracking-wider">Change Photo</span>
                  </div>
                )}
 
                {/* Percentage Badge */}
                {!isAdmin && (
                  <div className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-white text-[12px] font-bold px-3 py-1 rounded-full shadow-md whitespace-nowrap border-2 border-[#fffdfa] ${completeness === 100 ? 'bg-emerald-600' : 'bg-crimson-600'}`}>
                    {completeness}%
                  </div>
                )}
              </div>
              {isAdmin && (
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              )}

              {/* Name and Badge */}
              <div className="flex items-center gap-2 mb-2 flex-wrap justify-center z-10">
                <h2 className="text-3xl font-serif font-bold text-crimson-950 tracking-tight">{isAdmin ? 'Administrator' : (profile?.name || 'Member')}</h2>
                {!isAdmin && user?.isManuallyVerified && (
                  <FaCheckCircle className="text-[#3b82f6] text-[22px] drop-shadow-sm" title="Verified" />
                )}
              </div>

              {/* Plan Type Pill */}
              {!isAdmin && (
                <div className="flex items-center justify-center mb-5 z-10">
                  <span className={`text-[12px] font-extrabold px-5 py-2 rounded-full tracking-wider flex items-center gap-1.5 shadow-md border ${
                    user?.plan === 'elite' 
                      ? 'bg-gradient-to-r from-[#d4af37] via-[#f3e3a3] to-[#b28e28] text-[#4f080e] border-[#b28e28]/50'
                      : user?.plan === 'premium'
                      ? 'bg-gradient-to-r from-[#10b981] via-[#6ee7b7] to-[#047857] text-white border-[#047857]/50'
                      : 'bg-white text-slate-600 border-slate-200 shadow-sm'
                  }`}>
                    {user?.plan === 'elite' && <FaCrown className="text-[#4f080e] text-[12px] animate-pulse" />}
                    {user?.plan === 'premium' && <FaCrown className="text-white text-[12px]" />}
                    <span className="uppercase">{user?.plan || 'Free'} Member</span>
                  </span>
                </div>
              )}

              {/* Admin Role Pill */}
              {isAdmin && (
                <div className="flex items-center justify-center mt-3 z-10">
                  <span className="bg-gradient-to-r from-[#4f080e] to-[#7f181e] text-white text-[12px] font-extrabold px-6 py-2.5 rounded-full tracking-widest flex items-center gap-2 shadow-md border border-[#d4af37]/35">
                    <FaShieldAlt className="text-gold-400 text-sm" />
                    SYSTEM ADMIN
                  </span>
                </div>
              )}

              {/* Complete Profile CTA */}
              {!isAdmin && completeness < 100 && (
                <button onClick={() => navigate('/edit-profile')} className="w-full max-w-xs bg-gradient-to-r from-crimson-600 to-crimson-800 text-white font-bold py-3 px-6 rounded-full flex justify-between items-center shadow-lg hover:shadow-crimson-600/30 hover:-translate-y-0.5 transition-all z-10 mt-5 cursor-pointer">
                  <span className="text-sm">Complete your profile</span>
                  <FaChevronRight className="text-xs" />
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Menus & Other Info */}
          <div className={isAdmin ? "lg:w-[65%] flex-col flex" : "w-full"}>
            {/* Verification Card */}
            {!isAdmin && (
              <Link to="/verify-identity" className="block mb-6 hover:-translate-y-0.5 transition-transform">
                <div className="glass-card border border-[#d4af37]/25 rounded-2xl p-5 md:p-6 flex items-center justify-between shadow-lg cursor-pointer hover:bg-white transition-colors">
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="text-[#3b82f6] text-xl md:text-2xl mt-0.5 flex-shrink-0" />
                    <span className="text-[15px] md:text-base font-bold text-crimson-950 leading-snug pr-4">
                      {user?.isManuallyVerified 
                        ? 'Your profile is identity-verified. Tap to view document details.' 
                        : 'Build trust on your profile with document verification'}
                    </span>
                  </div>
                  <div className="bg-[#fffdfa] p-2 rounded-full shadow-sm border border-[#d4af37]/25">
                    <FaChevronRight className="text-gold-600 text-xs flex-shrink-0" />
                  </div>
                </div>
              </Link>
            )}

            {/* Premium Plans Section - Only show for free members */}
            {(!user?.plan || user.plan === 'free') && (
              <div className="mb-8">
                <h3 className="text-lg font-serif font-bold text-crimson-950 mb-4">Recommended Plans</h3>
              
              <div className="flex overflow-x-auto gap-4 snap-x hide-scrollbar pb-4 -mx-5 px-5 md:mx-0 md:px-0">
                {premiumPlans.map((plan, idx) => (
                  <div key={idx} className={`min-w-[280px] snap-center bg-gradient-to-br ${plan.gradient} rounded-2xl p-6 shadow-xl border ${plan.border} hover:-translate-y-1 transition-transform`}>
                    <h4 className="text-[13px] font-bold text-slate-800 tracking-widest uppercase mb-1">{plan.name}</h4>
                    <div className="flex items-end gap-1 mb-6">
                      <span className="text-3xl font-extrabold text-slate-950">{plan.price}</span>
                      <span className="text-[13px] font-medium text-slate-700 mb-1">onwards</span>
                    </div>

                    <div className={`border-t border-black/10 pt-4 flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="text-slate-800 text-[10px]" />
                        <span className="text-[13px] font-semibold text-slate-900">{plan.features}</span>
                      </div>
                      <Link to="/plans" className={`bg-gradient-to-r ${plan.btnGradient} text-white text-[11px] font-bold px-4 py-2 rounded-full shadow-md whitespace-nowrap hover:scale-105 transition-transform`}>
                        Upgrade Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Settings Menu List */}
            <div className={isAdmin ? "flex flex-col gap-6 w-full justify-center h-full" : "glass-card border border-[#d4af37]/25 rounded-2xl overflow-hidden shadow-lg mb-6"}>
              {menuItems.map((item, index) => (
                <div 
                  key={index}
                  onClick={item.action}
                  className={`flex items-center justify-between p-6 cursor-pointer transition-all ${
                    isAdmin 
                      ? `bg-white/40 backdrop-blur-xl border border-[#d4af37]/20 rounded-2xl shadow-lg hover:-translate-y-1 py-9 px-8 h-full group ${item.danger ? 'border-red-500/30 hover:border-red-400 hover:bg-red-500/20' : 'hover:border-gold-400/50 hover:bg-white/50'}` 
                      : (index !== menuItems.length - 1 ? 'border-b border-[#d4af37]/15 hover:bg-crimson-50/20' : 'hover:bg-crimson-50/20')
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
                      item.danger 
                        ? 'bg-red-50 text-red-600 border border-red-200 group-hover:bg-red-600 group-hover:text-white transition-all' 
                        : 'bg-[#4f080e]/5 text-[#4f080e] border border-[#4f080e]/10 group-hover:bg-[#4f080e] group-hover:text-white transition-all'
                    }`}>
                      {React.cloneElement(item.icon, { className: "text-lg text-current" })}
                    </div>
                    <span className={`text-[16px] font-extrabold tracking-wide ${item.danger ? 'text-red-600 group-hover:text-white' : 'text-[#4f080e] group-hover:text-[#8f172b] transition-colors'}`}>{item.label}</span>
                  </div>
                  <FaChevronRight className={`text-sm transition-transform ${isAdmin ? 'text-slate-500 group-hover:text-[#4f080e] group-hover:translate-x-1' : 'text-slate-400 group-hover:text-[#4f080e]'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="glass-card border border-[#d4af37]/35 rounded-2xl shadow-2xl w-full max-w-md p-8 relative text-slate-850">
            <h2 className="text-2xl font-serif font-bold text-crimson-950 mb-1">Change Password</h2>
            <p className="text-sm text-slate-500 mb-6">Enter your current password and a new one below.</p>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4f080e]/80 uppercase tracking-wider mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={pwForm.currentPassword}
                  onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-[#d4af37] bg-slate-50/50"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#4f080e]/80 uppercase tracking-wider mb-1.5">New Password</label>
                <input
                  type="password"
                  value={pwForm.newPassword}
                  onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-[#d4af37] bg-slate-50/50"
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#4f080e]/80 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={pwForm.confirmPassword}
                  onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-[#d4af37] bg-slate-50/50"
                  placeholder="Repeat new password"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowPasswordModal(false); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="flex-1 py-3 rounded-xl bg-gold-gradient hover:scale-[1.02] text-crimson-950 font-bold text-sm transition-all disabled:opacity-60 cursor-pointer"
                >
                  {pwLoading ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfilePage;
