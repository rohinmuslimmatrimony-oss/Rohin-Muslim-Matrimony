import React from 'react';
import { FaMoon, FaHeart, FaShieldAlt, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-emerald-950 text-slate-400 py-12 px-4 md:px-8 border-t border-emerald-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Information */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-gold-500 font-serif text-2xl font-bold tracking-wide">
            <FaMoon className="text-gold-400" />
            <span className="text-white">Rohin Muslim</span>
            <span className="text-gold-500 font-sans font-light">Matrimony</span>
          </div>
          <p className="text-sm leading-relaxed">
            A trusted, premium matrimony platform designed exclusively for Muslims. We facilitate meaningful, halal connections based on mutual values, respect, and compatibility.
          </p>
        </div>

        {/* Contact Information */}
        <div className="flex flex-col gap-3">
          <h4 className="text-white font-semibold text-lg border-b border-emerald-900 pb-2">Contact Us</h4>
          <ul className="text-sm space-y-3 mt-1">
            <li className="flex items-start gap-2">
              <FaPhoneAlt className="mt-1 text-gold-400" />
              <span>
                <strong>Shaik Habib</strong><br/>
                +91 73860 83446<br/>
                +91 70759 00448
              </span>
            </li>
            <li className="flex items-center gap-2">
              <FaEnvelope className="text-gold-400" />
              <a href="mailto:shaikhabeebiti@gmail.com" className="hover:text-gold-400 transition-colors">shaikhabeebiti@gmail.com</a>
            </li>
            <li className="flex items-start gap-2">
              <FaMapMarkerAlt className="mt-1 text-gold-400" />
              <span>
                D.No. 12-13-86, Abdulkhader St,<br/>
                Islampet, Vijayawada-1
              </span>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-3">
          <h4 className="text-white font-semibold text-lg border-b border-emerald-900 pb-2">Quick Navigation</h4>
          <ul className="text-sm space-y-2.5">
            <li><a href="/" className="hover:text-gold-400 transition-colors">Home Landing</a></li>
            <li><a href="/plans" className="hover:text-gold-400 transition-colors">Premium Plans</a></li>
            <li><a href="/login" className="hover:text-gold-400 transition-colors">Sign In Account</a></li>
            <li><a href="/register" className="hover:text-gold-400 transition-colors">Join Matrimony Free</a></li>
          </ul>
        </div>

        {/* Values & Integrity */}
        <div className="flex flex-col gap-3">
          <h4 className="text-white font-semibold text-lg border-b border-emerald-900 pb-2">Trust & Safety</h4>
          <p className="text-sm leading-relaxed">
            Your privacy is our utmost priority. Contact details are kept strictly locked and concealed until you choose to connect. Experience full admin moderation to prevent spam.
          </p>
          <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-500">
            <span className="flex items-center gap-1"><FaShieldAlt className="text-gold-500 text-sm" /> 100% Encrypted</span>
            <span className="flex items-center gap-1"><FaHeart className="text-red-500 text-sm" /> Halal Platform</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-emerald-900/60 mt-10 pt-6 text-center text-xs">
        <p>© {new Date().getFullYear()} Rohin Muslim Matrimony MVP. All Rights Reserved. Crafted with love and dedication.</p>
      </div>
    </footer>
  );
};

export default Footer;
