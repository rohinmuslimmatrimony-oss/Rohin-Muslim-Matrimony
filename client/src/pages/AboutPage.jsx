import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaHeart, FaShieldAlt, FaUsers, FaCrown, FaMosque, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';
import brandLogo from '../assets/brand-logo.png';

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'About Us | Rohin Muslim Matrimony';
  }, []);

  const values = [
    { icon: <FaShieldAlt />, title: 'Privacy First', desc: 'Contact details are locked until mutual acceptance. Your personal info is always safe.' },
    { icon: <FaHeart />, title: 'Halal Matchmaking', desc: 'Built on Islamic values — respectful, transparent, and focused on righteous connections.' },
    { icon: <FaUsers />, title: 'Admin Verified', desc: 'Every profile is manually reviewed by our team to ensure authenticity and safety.' },
    { icon: <FaCrown />, title: 'Premium Support', desc: 'Elite members get a dedicated relationship manager to guide them through their journey.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0205] via-[#1a0408] to-[#0d0205] text-white">

      {/* Header */}
      <div className="bg-[#1a0408]/80 border-b border-gold-500/20 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3">
          <img src={brandLogo} alt="Rohin Muslim Matrimony" className="h-9 w-auto object-contain" />
          <span className="hidden md:block text-gold-400 font-serif font-bold text-base">Rohin Muslim Matrimony</span>
        </Link>
        <Link to="/" className="flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors text-sm font-semibold">
          <FaArrowLeft className="text-xs" />
          Back to Home
        </Link>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#4f080e]/40 via-[#7a0e19]/30 to-[#4f080e]/40 border-b border-gold-500/20 py-12 md:py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="flex justify-center mb-5">
          <div className="w-20 h-20 rounded-full bg-gold-400/10 border-2 border-gold-500/30 flex items-center justify-center">
            <FaMosque className="text-gold-400 text-4xl" />
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold font-serif text-gold-400 mb-3">About Us</h1>
        <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          <strong className="text-white">Rohin Muslim Matrimony</strong> is a trusted, premium matrimonial platform designed exclusively for Muslims — facilitating meaningful, halal connections based on mutual values, respect, and compatibility.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16 space-y-10">

        {/* Our Mission */}
        <div className="bg-white/5 border border-gold-500/15 rounded-2xl p-6 md:p-10 backdrop-blur-sm">
          <h2 className="text-xl md:text-2xl font-bold text-gold-400 font-serif mb-4 flex items-center gap-2">
            <span className="w-1.5 h-7 bg-gold-400 rounded-full inline-block shrink-0" />
            Our Mission
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Our mission is simple — to help Muslims across India find their life partners through a safe, halal, and respectful platform. We believe that every Muslim deserves a companion who shares their values and vision. We strive to make that journey as smooth, dignified, and blessed as possible — <strong className="text-gold-300">Insha Allah.</strong>
          </p>
        </div>

        {/* Our Values */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gold-400 font-serif mb-6 flex items-center gap-2">
            <span className="w-1.5 h-7 bg-gold-400 rounded-full inline-block shrink-0" />
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {values.map((v, i) => (
              <div key={i} className="bg-white/5 border border-gold-500/15 rounded-xl p-5 flex items-start gap-4 hover:border-gold-500/30 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#4f080e] border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0 text-base">
                  {v.icon}
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm md:text-base mb-1">{v.title}</h3>
                  <p className="text-slate-400 text-xs md:text-sm leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Who We Are */}
        <div className="bg-white/5 border border-gold-500/15 rounded-2xl p-6 md:p-10 backdrop-blur-sm">
          <h2 className="text-xl md:text-2xl font-bold text-gold-400 font-serif mb-4 flex items-center gap-2">
            <span className="w-1.5 h-7 bg-gold-400 rounded-full inline-block shrink-0" />
            Who We Are
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Started in <strong className="text-gold-300">2020</strong>, Rohin Muslim Matrimony was founded with the belief that matrimonial services for Muslims should reflect the values of Islam — honesty, trust, and dignity. Based in <strong className="text-white">Vijayawada, Andhra Pradesh</strong>, our office has been dedicated to serving Muslim families across India, helping them connect verified, practicing Muslim profiles in a fully admin-moderated environment.
          </p>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed mt-3">
            All profiles are reviewed by our team before going live. Contact details are never shared without mutual agreement — ensuring every interaction is safe, respectful, and purposeful.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-white/5 border border-gold-500/15 rounded-2xl p-6 md:p-10 backdrop-blur-sm">
          <h2 className="text-xl md:text-2xl font-bold text-gold-400 font-serif mb-6 flex items-center gap-2">
            <span className="w-1.5 h-7 bg-gold-400 rounded-full inline-block shrink-0" />
            Contact Us
          </h2>
          <p className="text-white font-bold text-base mb-4">Shaik Habib</p>
          <div className="space-y-3">
            <a href="tel:+917386083446" className="flex items-center gap-3 text-slate-300 hover:text-gold-400 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-[#4f080e] border border-gold-500/20 flex items-center justify-center text-gold-400 shrink-0">
                <FaPhoneAlt className="text-sm" />
              </div>
              <span className="text-sm md:text-base font-medium">+91 73860 83446</span>
            </a>
            <a href="tel:+917075900448" className="flex items-center gap-3 text-slate-300 hover:text-gold-400 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-[#4f080e] border border-gold-500/20 flex items-center justify-center text-gold-400 shrink-0">
                <FaPhoneAlt className="text-sm" />
              </div>
              <span className="text-sm md:text-base font-medium">+91 70759 00448</span>
            </a>
            <a href="https://wa.me/917386083446" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-green-400 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-green-700/30 border border-green-500/30 flex items-center justify-center text-green-400 shrink-0">
                <FaWhatsapp className="text-base" />
              </div>
              <span className="text-sm md:text-base font-medium">WhatsApp: +91 73860 83446</span>
            </a>
            <a href="mailto:shaikhabeebiti@gmail.com" className="flex items-center gap-3 text-slate-300 hover:text-gold-400 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-[#4f080e] border border-gold-500/20 flex items-center justify-center text-gold-400 shrink-0">
                <FaEnvelope className="text-sm" />
              </div>
              <span className="text-sm md:text-base font-medium break-all">shaikhabeebiti@gmail.com</span>
            </a>
            <div className="flex items-start gap-3 text-slate-300">
              <div className="w-10 h-10 rounded-full bg-[#4f080e] border border-gold-500/20 flex items-center justify-center text-gold-400 shrink-0 mt-0.5">
                <FaMapMarkerAlt className="text-sm" />
              </div>
              <span className="text-sm md:text-base font-medium leading-relaxed">
                D.No. 12-13-86, Abdulkhader St,<br />
                Islampet, Vijayawada-1,<br />
                Andhra Pradesh, India.
              </span>
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="flex flex-wrap justify-center gap-4 pt-2 text-sm text-slate-500">
          <Link to="/terms" className="hover:text-gold-400 transition-colors">Terms & Conditions</Link>
          <span>•</span>
          <Link to="/privacy-policy" className="hover:text-gold-400 transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link to="/data-deletion" className="hover:text-gold-400 transition-colors">Data Deletion</Link>
          <span>•</span>
          <Link to="/" className="hover:text-gold-400 transition-colors">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
