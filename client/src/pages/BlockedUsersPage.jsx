import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBan, FaChevronLeft, FaShieldAlt, FaEyeSlash, FaInfoCircle } from 'react-icons/fa';

const BlockedUsersPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#faf8f5] pt-24 pb-20 px-4 md:px-8 relative overflow-hidden font-outfit">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-b from-crimson-900/5 to-transparent rounded-full blur-[120px] -z-10"></div>

      <div className="max-w-xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/edit-profile')} 
          className="mb-6 text-crimson-900 font-bold flex items-center gap-1.5 bg-white border border-slate-200/80 px-4 py-2 rounded-full shadow-sm hover:bg-slate-50 transition-all text-xs uppercase tracking-wider cursor-pointer"
        >
          <FaChevronLeft className="text-[10px]" /> Back to Profile
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-crimson-950 mb-1.5">Blocked Users</h1>
          <p className="text-sm text-slate-500">Manage members you have blocked. Blocked users cannot see your profile or send you messages.</p>
        </div>

        {/* Modern Empty State Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center shadow-sm mb-6 space-y-6 relative overflow-hidden">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100 shadow-inner">
            <FaBan className="text-slate-400 text-3xl" />
          </div>
          <div className="space-y-1.5 max-w-xs mx-auto">
            <h2 className="text-xl font-bold text-slate-800">Your block list is empty</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              You haven't blocked any members yet. All active matrimonial matching services are open.
            </p>
          </div>
        </div>

        {/* Informational Cards explaining safety mechanisms */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
            🛡️ Privacy & Safety Information
          </h3>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex items-start gap-4 hover:border-crimson-900/10 transition-colors">
            <div className="p-3 bg-crimson-900/5 text-crimson-900 rounded-2xl flex-shrink-0">
              <FaShieldAlt className="text-lg" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">How Blocking Protects You</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                When you block a user, they are completely restricted. They will no longer see your card in their search results, view your photo, or trace any history of your profile.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex items-start gap-4 hover:border-crimson-900/10 transition-colors">
            <div className="p-3 bg-crimson-900/5 text-crimson-900 rounded-2xl flex-shrink-0">
              <FaEyeSlash className="text-lg" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">Photo Privacy Settings</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                You can also secure your photos by setting them to private in the edit profile section. Private photos are only visible to members you've accepted interests from.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex items-start gap-4 hover:border-crimson-900/10 transition-colors">
            <div className="p-3 bg-crimson-900/5 text-crimson-900 rounded-2xl flex-shrink-0">
              <FaInfoCircle className="text-lg" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">Need help with a member?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                If you encounter any inappropriate behavior, spam profiles, or misrepresentation, please report the profile immediately or contact our support team.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BlockedUsersPage;
