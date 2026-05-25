import React, { useEffect, useState } from 'react';
import { FaWhatsapp, FaPhone, FaEnvelope, FaUser, FaCrown, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../services/api';

const SupportContactCard = ({ plan }) => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/settings').then(res => {
      if (res.data?.data) setSettings(res.data.data);
    }).catch(() => {});
  }, []);

  const phone = settings?.supportPhone || '+91 99999 99999';
  const whatsapp = settings?.supportWhatsApp || '+919999999999';
  const email = settings?.supportEmail || 'support@rohinmatrimony.com';
  const managerName = settings?.eliteManagerName || 'Rohin Support Team';
  const managerPhone = settings?.eliteManagerPhone || phone;

  if (plan === 'free') {
    return (
      <div className="unique-card-hybrid p-5 md:h-[200px] flex items-center">
        <div className="flex items-start gap-3 w-full">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
            <FaEnvelope className="text-slate-400 text-base" />
          </div>
          <div className="flex-1">
            <h3 className="font-serif font-bold text-[#4f080e] text-base md:text-lg mb-1">Customer Support</h3>
            <p className="text-sm text-slate-500 mt-1 leading-normal">Upgrade to Premium or Elite to get direct support with phone &amp; WhatsApp access.</p>
            <Link
              to="/plans"
              className="relative z-10 mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-crimson-700 bg-crimson-50 hover:bg-crimson-100 px-4 py-2 rounded-lg border border-crimson-200 transition-colors"
            >
              View Plans <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (plan === 'premium') {
    return (
      <div className="unique-card-crimson p-5 md:h-[200px] flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-crimson-100 flex items-center justify-center flex-shrink-0">
            <FaUser className="text-crimson-700 text-base" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-[#4f080e] text-base md:text-lg">Premium Support</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Priority assistance for Premium members</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <a
            href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 flex items-center justify-center gap-1.5 w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 py-2 rounded-lg text-xs font-bold transition-colors text-center"
          >
            <FaWhatsapp className="text-emerald-600 text-sm flex-shrink-0" />
            <span>WhatsApp</span>
          </a>
          <a
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="relative z-10 flex items-center justify-center gap-1.5 w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 py-2 rounded-lg text-xs font-bold transition-colors text-center"
          >
            <FaPhone className="text-blue-600 text-sm flex-shrink-0" />
            <span>Call Support</span>
          </a>
          <a
            href={`mailto:${email}`}
            className="relative z-10 flex items-center justify-center gap-1.5 w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-2 rounded-lg text-xs font-bold transition-colors text-center overflow-hidden text-ellipsis whitespace-nowrap"
            title={email}
          >
            <FaEnvelope className="text-slate-500 text-sm flex-shrink-0" />
            <span>Email</span>
          </a>
        </div>
      </div>
    );
  }

  // Elite
  return (
    <div className="unique-card-gold p-5 md:h-[200px] flex flex-col justify-between !bg-gradient-to-br !from-amber-50/50 !to-yellow-50/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-sm flex-shrink-0">
            <FaCrown className="text-white text-base" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-[#4f080e] text-base md:text-lg">Dedicated Elite Support</h3>
            <p className="text-xs text-amber-600 font-bold leading-none mt-1">Your personal relationship manager</p>
          </div>
        </div>
        <div className="relative z-10 bg-white/85 rounded-lg py-1 px-3 border border-amber-200/60 flex items-center gap-1.5">
          <span className="text-[10px] text-[#4f080e] font-bold uppercase tracking-wider">Manager:</span>
          <span className="font-extrabold text-[#4f080e] text-sm">{managerName}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <a
          href={`https://wa.me/${managerPhone.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 flex items-center justify-center gap-1.5 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-xs font-bold transition-colors shadow-sm text-center"
        >
          <FaWhatsapp className="text-sm flex-shrink-0" />
          <span>WhatsApp</span>
        </a>
        <a
          href={`tel:${managerPhone.replace(/\s/g, '')}`}
          className="relative z-10 flex items-center justify-center gap-1.5 w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg text-xs font-bold transition-colors shadow-sm text-center"
        >
          <FaPhone className="text-sm flex-shrink-0" />
          <span>Call Manager</span>
        </a>
        <a
          href={`mailto:${email}?subject=Elite Support Request`}
          className="relative z-10 flex items-center justify-center gap-1.5 w-full bg-white hover:bg-amber-50 border border-amber-200 text-amber-800 py-2 rounded-lg text-xs font-bold transition-colors text-center"
        >
          <FaEnvelope className="text-amber-500 text-sm flex-shrink-0" />
          <span>Email Support</span>
        </a>
      </div>
    </div>
  );
};

export default SupportContactCard;
