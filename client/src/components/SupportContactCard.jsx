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
      <div className="glass-card rounded-2xl p-5 border border-crimson-100 bg-gradient-to-br from-cream-50 to-white">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
            <FaEnvelope className="text-slate-400 text-sm" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-crimson-950 text-sm">Customer Support</h3>
            <p className="text-xs text-slate-500 mt-1">Upgrade to Premium or Elite to get direct support with phone & WhatsApp access.</p>
            <Link
              to="/plans"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-crimson-700 bg-crimson-50 hover:bg-crimson-100 px-4 py-2 rounded-full border border-crimson-200 transition-colors"
            >
              View Plans <FaArrowRight className="text-[10px]" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (plan === 'premium') {
    return (
      <div className="glass-card rounded-2xl p-5 border border-crimson-100 bg-gradient-to-br from-cream-50 to-white">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-crimson-100 flex items-center justify-center">
            <FaUser className="text-crimson-700 text-xs" />
          </div>
          <div>
            <h3 className="font-bold text-crimson-950 text-sm">Premium Support</h3>
            <p className="text-[10px] text-slate-400 font-medium">Priority assistance for Premium members</p>
          </div>
        </div>
        <div className="space-y-2.5">
          <a
            href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors"
          >
            <FaWhatsapp className="text-emerald-600 text-sm flex-shrink-0" />
            <span>WhatsApp: {phone}</span>
          </a>
          <a
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="flex items-center gap-3 w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors"
          >
            <FaPhone className="text-blue-600 text-sm flex-shrink-0" />
            <span>Call: {phone}</span>
          </a>
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-3 w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors"
          >
            <FaEnvelope className="text-slate-500 text-sm flex-shrink-0" />
            <span>{email}</span>
          </a>
        </div>
      </div>
    );
  }

  // Elite
  return (
    <div className="rounded-2xl p-5 border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-sm">
          <FaCrown className="text-white text-sm" />
        </div>
        <div>
          <h3 className="font-bold text-amber-900 text-sm">Dedicated Elite Support</h3>
          <p className="text-[10px] text-amber-600 font-bold">Your personal relationship manager</p>
        </div>
      </div>

      <div className="bg-white/70 rounded-xl p-3 mb-3 border border-amber-200">
        <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mb-0.5">Your Manager</p>
        <p className="font-extrabold text-amber-900 text-sm">{managerName}</p>
      </div>

      <div className="space-y-2">
        <a
          href={`https://wa.me/${managerPhone.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm"
        >
          <FaWhatsapp className="text-sm flex-shrink-0" />
          <span>WhatsApp Manager: {managerPhone}</span>
        </a>
        <a
          href={`tel:${managerPhone.replace(/\s/g, '')}`}
          className="flex items-center gap-3 w-full bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm"
        >
          <FaPhone className="text-sm flex-shrink-0" />
          <span>Direct Call: {managerPhone}</span>
        </a>
        <a
          href={`mailto:${email}?subject=Elite Support Request`}
          className="flex items-center gap-3 w-full bg-white hover:bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors"
        >
          <FaEnvelope className="text-amber-500 text-sm flex-shrink-0" />
          <span>{email}</span>
        </a>
      </div>
    </div>
  );
};

export default SupportContactCard;
