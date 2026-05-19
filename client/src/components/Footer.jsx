import React from 'react';
import { FaHeart, FaShieldAlt, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import logo3 from '../assets/logo3.png';

const Footer = () => {
  return (
    <footer className="bg-[#1a0204] text-slate-300 py-16 px-4 md:px-8 border-t-2 border-gold-500/30 relative overflow-hidden">
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.03)_0%,transparent_50%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 relative z-10">
        {/* Brand Information */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <img src={logo3} alt="Rohin Muslim Matrimony Logo" className="h-12 w-auto object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            A trusted, premium matrimony platform designed exclusively for Muslims. We facilitate meaningful, halal connections based on mutual values, respect, and compatibility.
          </p>
        </div>

        {/* Contact Information */}
        <div className="flex flex-col gap-3">
          <h4 className="text-gold-400 font-serif font-extrabold text-base border-b border-gold-500/20 pb-2 mb-2 uppercase tracking-wider">Contact Us</h4>
          <ul className="text-sm space-y-4">
            <li className="flex items-start gap-3">
              <div className="mt-1 w-7 h-7 rounded-full bg-[#2b0306] border border-gold-500/20 flex items-center justify-center text-gold-400 text-xs shrink-0">
                <FaPhoneAlt />
              </div>
              <span className="text-slate-300">
                <strong className="text-white">Shaik Habib</strong><br/>
                <span className="text-slate-400 hover:text-gold-400 transition-colors">+91 73860 83446</span><br/>
                <span className="text-slate-400 hover:text-gold-400 transition-colors">+91 70759 00448</span>
              </span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#2b0306] border border-gold-500/20 flex items-center justify-center text-gold-400 text-xs shrink-0">
                <FaEnvelope />
              </div>
              <a href="mailto:shaikhabeebiti@gmail.com" className="text-slate-300 hover:text-gold-400 transition-colors break-all">shaikhabeebiti@gmail.com</a>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 w-7 h-7 rounded-full bg-[#2b0306] border border-gold-500/20 flex items-center justify-center text-gold-400 text-xs shrink-0">
                <FaMapMarkerAlt />
              </div>
              <span className="text-slate-300 leading-relaxed">
                D.No. 12-13-86, Abdulkhader St,<br/>
                Islampet, Vijayawada-1
              </span>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-3">
          <h4 className="text-gold-400 font-serif font-extrabold text-base border-b border-gold-500/20 pb-2 mb-2 uppercase tracking-wider">Quick Navigation</h4>
          <ul className="text-sm space-y-3">
            <li><a href="/" className="text-slate-300 hover:text-gold-400 hover:translate-x-1 transition-all duration-300 inline-block">Home Landing</a></li>
            <li><a href="/plans" className="text-slate-300 hover:text-gold-400 hover:translate-x-1 transition-all duration-300 inline-block">Premium Plans</a></li>
            <li><a href="/login" className="text-slate-300 hover:text-gold-400 hover:translate-x-1 transition-all duration-300 inline-block">Sign In Account</a></li>
            <li><a href="/register" className="text-slate-300 hover:text-gold-400 hover:translate-x-1 transition-all duration-300 inline-block">Join Matrimony Free</a></li>
          </ul>
        </div>

        {/* Values & Integrity */}
        <div className="flex flex-col gap-3">
          <h4 className="text-gold-400 font-serif font-extrabold text-base border-b border-gold-500/20 pb-2 mb-2 uppercase tracking-wider">Trust & Safety</h4>
          <p className="text-sm leading-relaxed text-slate-400">
            Your privacy is our utmost priority. Contact details are kept strictly locked and concealed until you choose to connect. Experience full admin moderation to prevent spam.
          </p>
          <div className="flex items-center gap-3 mt-3 text-xs text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5 bg-[#2b0306]/60 border border-gold-500/20 px-3 py-1 rounded-full"><FaShieldAlt className="text-gold-500 text-xs" /> 100% Encrypted</span>
            <span className="flex items-center gap-1.5 bg-[#2b0306]/60 border border-gold-500/20 px-3 py-1 rounded-full"><FaHeart className="text-red-500 text-xs animate-pulse" /> Halal Platform</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-gold-500/10 mt-12 pt-8 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Rohin Muslim Matrimony MVP. All Rights Reserved. Crafted with love and dedication.</p>
      </div>
    </footer>
  );
};

export default Footer;
