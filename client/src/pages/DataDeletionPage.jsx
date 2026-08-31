import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaTrashAlt, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import brandLogo from '../assets/brand-logo.png';

const DataDeletionPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'User Data Deletion Request | Rohin Muslim Matrimony';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0205] via-[#1a0408] to-[#0d0205] text-white">

      {/* Header */}
      <div className="bg-[#1a0408]/80 border-b border-gold-500/20 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3">
          <img src={brandLogo} alt="Rohin Muslim Matrimony" className="h-9 w-auto object-contain" />
          <span className="hidden md:block text-gold-400 font-serif font-bold text-base">Rohin Muslim Matrimony</span>
        </Link>
        <Link
          to="/"
          className="flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors text-sm font-semibold"
        >
          <FaArrowLeft className="text-xs" />
          Back to Home
        </Link>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#4f080e]/40 via-[#7a0e19]/30 to-[#4f080e]/40 border-b border-gold-500/20 py-10 md:py-14 px-4 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-gold-400/10 border border-gold-500/30 flex items-center justify-center">
            <FaTrashAlt className="text-gold-400 text-2xl" />
          </div>
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold font-serif text-gold-400 mb-2">User Data Deletion Request</h1>
        <p className="text-slate-400 text-sm md:text-base mt-2 max-w-xl mx-auto">
          <strong className="text-white">Rohin Muslim Matrimony</strong> — If you would like to request the deletion of your account and personal data, please contact us using the details below.
        </p>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-14 space-y-8">

        {/* How to request */}
        <div className="bg-white/5 border border-gold-500/15 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
          <h2 className="text-lg md:text-xl font-bold text-gold-400 font-serif mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-gold-400 rounded-full inline-block shrink-0" />
            How to Request Data Deletion
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Send us a request with your <strong className="text-white">registered name</strong>, <strong className="text-white">mobile number</strong>, and <strong className="text-white">email address</strong>. Our team will verify the request and process the deletion of your account and associated personal data, subject to applicable legal and regulatory requirements.
          </p>
        </div>

        {/* Contact Us */}
        <div className="bg-white/5 border border-gold-500/15 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
          <h2 className="text-lg md:text-xl font-bold text-gold-400 font-serif mb-5 flex items-center gap-2">
            <span className="w-2 h-6 bg-gold-400 rounded-full inline-block shrink-0" />
            Contact Us
          </h2>
          <p className="text-white font-bold text-base mb-4">Shaik Habib</p>
          <div className="space-y-3">
            <a href="tel:+917386083446" className="flex items-center gap-3 text-slate-300 hover:text-gold-400 transition-colors group">
              <div className="w-9 h-9 rounded-full bg-[#4f080e] border border-gold-500/20 flex items-center justify-center text-gold-400 shrink-0 group-hover:border-gold-500/50 transition-colors">
                <FaPhoneAlt className="text-xs" />
              </div>
              <span className="text-sm md:text-base font-medium">+91 73860 83446</span>
            </a>
            <a href="tel:+917075900448" className="flex items-center gap-3 text-slate-300 hover:text-gold-400 transition-colors group">
              <div className="w-9 h-9 rounded-full bg-[#4f080e] border border-gold-500/20 flex items-center justify-center text-gold-400 shrink-0 group-hover:border-gold-500/50 transition-colors">
                <FaPhoneAlt className="text-xs" />
              </div>
              <span className="text-sm md:text-base font-medium">+91 70759 00448</span>
            </a>
            <a href="mailto:shaikhabeebiti@gmail.com" className="flex items-center gap-3 text-slate-300 hover:text-gold-400 transition-colors group">
              <div className="w-9 h-9 rounded-full bg-[#4f080e] border border-gold-500/20 flex items-center justify-center text-gold-400 shrink-0 group-hover:border-gold-500/50 transition-colors">
                <FaEnvelope className="text-xs" />
              </div>
              <span className="text-sm md:text-base font-medium break-all">shaikhabeebiti@gmail.com</span>
            </a>
            <div className="flex items-start gap-3 text-slate-300">
              <div className="w-9 h-9 rounded-full bg-[#4f080e] border border-gold-500/20 flex items-center justify-center text-gold-400 shrink-0 mt-0.5">
                <FaMapMarkerAlt className="text-xs" />
              </div>
              <span className="text-sm md:text-base font-medium leading-relaxed">
                D.No. 12-13-86, Abdulkhader St,<br />
                Islampet, Vijayawada-1,<br />
                Andhra Pradesh, India.
              </span>
            </div>
          </div>
        </div>

        {/* Data Deletion Process */}
        <div className="bg-white/5 border border-gold-500/15 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
          <h2 className="text-lg md:text-xl font-bold text-gold-400 font-serif mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-gold-400 rounded-full inline-block shrink-0" />
            Data Deletion Request Process
          </h2>
          <div className="space-y-3 text-slate-300 text-sm md:text-base leading-relaxed">
            <p>
              To submit a data deletion request, please contact us through the above phone numbers or email address.
            </p>
            <div className="bg-[#4f080e]/20 border border-gold-500/20 rounded-xl p-4">
              <p className="text-gold-300 font-semibold text-sm">📧 Email Subject Line:</p>
              <p className="text-white font-mono text-sm mt-1">"User Data Deletion Request – Rohin Muslim Matrimony"</p>
            </div>
            <p>
              Once your request is received and verified, we will take the necessary steps to delete your account and personal information, <strong className="text-white">except where certain information is required</strong> to be retained to comply with applicable laws, prevent fraud, resolve disputes, or meet other legitimate legal obligations.
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap justify-center gap-4 pt-2 text-sm text-slate-500">
          <Link to="/terms" className="hover:text-gold-400 transition-colors">Terms & Conditions</Link>
          <span>•</span>
          <Link to="/privacy-policy" className="hover:text-gold-400 transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link to="/" className="hover:text-gold-400 transition-colors">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default DataDeletionPage;
