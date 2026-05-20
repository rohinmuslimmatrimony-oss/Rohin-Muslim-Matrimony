import React from 'react';
import { FaHeart, FaShieldAlt, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import brandLogo from '../assets/brand-logo.png';

const Footer = () => {
  return (
    <footer className="bg-[#faf5ec] text-slate-800 py-8 md:py-16 px-4 md:px-8 border-t-2 border-gold-500/40 relative overflow-hidden">
      {/* Subtle gold overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12)_0%,transparent_60%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 relative z-10">
        {/* Brand Information */}
        <div className="col-span-2 md:col-span-1 flex flex-row items-center gap-3.5 md:flex-col md:items-start md:gap-4">
          <img src={brandLogo} alt="Rohin Muslim Matrimony Logo" className="h-12 w-auto object-contain shrink-0 md:h-12" />
          <p className="text-xs md:text-sm leading-relaxed text-slate-700 font-medium">
            <span className="md:hidden">Trusted halal matrimonial service designed for Muslims. Connecting verified profiles with respect and privacy.</span>
            <span className="hidden md:inline">A trusted, premium matrimony platform designed exclusively for Muslims. We facilitate meaningful, halal connections based on mutual values, respect, and compatibility.</span>
          </p>
        </div>

        {/* Contact Information */}
        <div className="col-span-1 md:col-span-1 flex flex-col gap-2 md:gap-3">
          <h4 className="text-[#4f080e] font-serif font-extrabold text-xs md:text-base border-b border-gold-500/20 pb-1 md:pb-2 mb-1 md:mb-2 uppercase tracking-wider">Contact Us</h4>
          <ul className="text-[10px] md:text-sm space-y-1.5 md:space-y-4">
            <li className="flex items-start gap-2.5">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-[#4f080e] border border-gold-500/10 flex items-center justify-center text-gold-400 text-[8px] md:text-xs shrink-0 md:w-7 md:h-7">
                <FaPhoneAlt />
              </div>
              <span className="text-slate-700">
                <strong className="text-slate-900 text-[11px] md:text-sm font-extrabold">Shaik Habib</strong><br/>
                <span className="text-slate-600 hover:text-[#4f080e] transition-colors font-medium font-sans">+91 73860 83446</span><br/>
                <span className="text-slate-600 hover:text-[#4f080e] transition-colors font-medium font-sans">+91 70759 00448</span>
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#4f080e] border border-gold-500/10 flex items-center justify-center text-gold-400 text-[8px] md:text-xs shrink-0 md:w-7 md:h-7">
                <FaEnvelope />
              </div>
              <a href="mailto:shaikhabeebiti@gmail.com" className="text-slate-700 hover:text-[#4f080e] transition-colors font-medium break-all font-sans">shaikhabeebiti@gmail.com</a>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-[#4f080e] border border-gold-500/10 flex items-center justify-center text-gold-400 text-[8px] md:text-xs shrink-0 md:w-7 md:h-7">
                <FaMapMarkerAlt />
              </div>
              <span className="text-slate-700 leading-relaxed text-[10px] md:text-sm font-medium">
                D.No. 12-13-86, Abdulkhader St,<br/>
                Islampet, Vijayawada-1
              </span>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="col-span-1 md:col-span-1 flex flex-col gap-2 md:gap-3">
          <h4 className="text-[#4f080e] font-serif font-extrabold text-xs md:text-base border-b border-gold-500/20 pb-1 md:pb-2 mb-1 md:mb-2 uppercase tracking-wider">Quick Links</h4>
          <ul className="text-[10px] md:text-sm space-y-1 md:space-y-3">
            <li><a href="/" className="text-slate-700 hover:text-[#4f080e] hover:translate-x-1 transition-all duration-300 inline-block font-semibold">Home Landing</a></li>
            <li><a href="/plans" className="text-slate-700 hover:text-[#4f080e] hover:translate-x-1 transition-all duration-300 inline-block font-semibold">Premium Plans</a></li>
            <li><a href="/login" className="text-slate-700 hover:text-[#4f080e] hover:translate-x-1 transition-all duration-300 inline-block font-semibold">Sign In Account</a></li>
            <li><a href="/register" className="text-slate-700 hover:text-[#4f080e] hover:translate-x-1 transition-all duration-300 inline-block font-semibold">Join Matrimony Free</a></li>
          </ul>
        </div>

        {/* Values & Integrity */}
        <div className="col-span-2 md:col-span-1 flex flex-col gap-2 md:gap-3">
          <h4 className="text-[#4f080e] font-serif font-extrabold text-xs md:text-base border-b border-gold-500/20 pb-1 md:pb-2 mb-1 md:mb-2 uppercase tracking-wider">Trust & Safety</h4>
          <p className="text-[10px] md:text-sm leading-relaxed text-slate-700 font-medium">
            Your privacy is our utmost priority. Contact details are kept strictly locked and concealed until you choose to connect. Experience full admin moderation to prevent spam.
          </p>
          <div className="flex items-center gap-1.5 mt-1 md:mt-3 text-[9px] md:text-xs text-slate-700 flex-wrap">
            <span className="flex items-center gap-1 bg-gold-100 border border-gold-300/40 px-2.5 py-0.5 rounded-full font-semibold text-[#4f080e]"><FaShieldAlt className="text-[#4f080e] text-[9px]" /> 100% Encrypted</span>
            <span className="flex items-center gap-1 bg-gold-100 border border-gold-300/40 px-2.5 py-0.5 rounded-full font-semibold text-[#4f080e]"><FaHeart className="text-red-600 text-[9px] animate-pulse" /> Halal Platform</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-gold-500/20 mt-6 md:mt-12 pt-4 md:pt-8 text-center text-[10px] md:text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Rohin Muslim Matrimony MVP. All Rights Reserved. Crafted with love and dedication.</p>
      </div>
    </footer>
  );
};

export default Footer;
