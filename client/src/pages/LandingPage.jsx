import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaHeart, FaShieldAlt, FaComments, FaCrown, FaUsers, FaArrowRight, FaMoon, FaLock, FaPhoneAlt, FaMosque } from 'react-icons/fa';
import logo3 from '../assets/logo3.png';
import bannerMatrimony from '../assets/banner_matrimony.png';
import premiumBanner from '../assets/transparent_banner.png';

const LandingPage = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="bg-cream-50 overflow-hidden">
      {/* Premium Hero Section */}
      <section
        className="relative py-3 md:py-4 px-4 md:px-8 border-b-2 border-gold-500/30 overflow-hidden flex flex-col items-center justify-center text-center lg:h-[calc(100vh-80px)] lg:max-h-[800px] min-h-[560px]"
        style={{ background: 'linear-gradient(135deg, #4f080e 50%, #d4af37 50%)' }}
      >
        <div className="max-w-[1550px] mx-auto w-full relative z-10">


          {/* Three-Column Banner Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center mt-2">

            {/* Left Column Features (Visible on Desktop) */}
            <div className="lg:col-span-3 hidden lg:flex flex-col gap-3 md:gap-4 text-right">
              {/* Feature 1 */}
              <div className="flex gap-3.5 items-center justify-end group">
                <div className="flex flex-col">
                  <h3 className="text-white text-sm md:text-base font-extrabold font-serif group-hover:text-gold-200 transition-colors">Verified Profiles</h3>
                  <p className="text-gold-100/90 text-[11px] md:text-xs leading-relaxed font-semibold">A secured database of authentic profiles.</p>
                </div>
                <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <div className="absolute inset-0 bg-[#d4af37] border border-gold-300 rounded-lg shadow-md transform rotate-0 transition-transform duration-500 group-hover:rotate-12"></div>
                  <div className="absolute inset-0 bg-[#d4af37] border border-gold-300 rounded-lg shadow-md transform rotate-45 transition-transform duration-500 group-hover:rotate-57"></div>
                  <div className="absolute w-9.5 h-9.5 rounded-full border border-gold-200/40 flex items-center justify-center z-10 bg-gradient-to-b from-[#ebd94e] to-[#d4af37]">
                    <FaShieldAlt className="text-[#4f080e] text-sm group-hover:text-crimson-950 drop-shadow-[0_0_4px_rgba(79,8,14,0.3)] z-20" />
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-3.5 items-center justify-end group">
                <div className="flex flex-col">
                  <h3 className="text-white text-sm md:text-base font-extrabold font-serif group-hover:text-gold-200 transition-colors">Personalized Matching</h3>
                  <p className="text-gold-100/90 text-[11px] md:text-xs leading-relaxed font-semibold">Matches filtered to fit your values.</p>
                </div>
                <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <div className="absolute inset-0 bg-[#d4af37] border border-gold-300 rounded-lg shadow-md transform rotate-0 transition-transform duration-500 group-hover:rotate-12"></div>
                  <div className="absolute inset-0 bg-[#d4af37] border border-gold-300 rounded-lg shadow-md transform rotate-45 transition-transform duration-500 group-hover:rotate-57"></div>
                  <div className="absolute w-9.5 h-9.5 rounded-full border border-gold-200/40 flex items-center justify-center z-10 bg-gradient-to-b from-[#ebd94e] to-[#d4af37]">
                    <FaHeart className="text-[#4f080e] text-sm group-hover:text-crimson-950 drop-shadow-[0_0_4px_rgba(79,8,14,0.3)] z-20 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-3.5 items-center justify-end group">
                <div className="flex flex-col">
                  <h3 className="text-white text-sm md:text-base font-extrabold font-serif group-hover:text-gold-200 transition-colors">100% Privacy Lock</h3>
                  <p className="text-gold-100/90 text-[11px] md:text-xs leading-relaxed font-semibold">Complete confidentiality for all users.</p>
                </div>
                <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <div className="absolute inset-0 bg-[#d4af37] border border-gold-300 rounded-lg shadow-md transform rotate-0 transition-transform duration-500 group-hover:rotate-12"></div>
                  <div className="absolute inset-0 bg-[#d4af37] border border-gold-300 rounded-lg shadow-md transform rotate-45 transition-transform duration-500 group-hover:rotate-57"></div>
                  <div className="absolute w-9.5 h-9.5 rounded-full border border-gold-200/40 flex items-center justify-center z-10 bg-gradient-to-b from-[#ebd94e] to-[#d4af37]">
                    <FaLock className="text-[#4f080e] text-sm group-hover:text-crimson-950 drop-shadow-[0_0_4px_rgba(79,8,14,0.3)] z-20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Center Column Banner Image styled as Mihrab Islamic Archway */}
            <div className="lg:col-span-6 flex justify-center items-center relative px-2 -mt-6 md:-mt-10 lg:-mt-14">
              {/* Starry Outer Aura Glow */}
              <div className="absolute inset-0 bg-gold-500/5 rounded-2xl blur-xl pointer-events-none"></div>

              <div className="relative max-w-[420px] md:max-w-[620px] w-full mx-auto filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.55)] transform hover:scale-[1.02] transition-transform duration-500">
                <img
                  src={bannerMatrimony}
                  alt="Muslim Marriage Consultancy Banner"
                  className="max-h-[380px] md:max-h-[580px] w-full h-auto object-contain block mx-auto"
                  style={{
                    clipPath: 'polygon(0% 100%, 0% 42%, 4% 35%, 8% 28%, 14% 22%, 20% 17%, 28% 13%, 37% 10%, 46% 8.5%, 50% 7.5%, 54% 8.5%, 63% 10%, 72% 13%, 80% 17%, 86% 22%, 92% 28%, 96% 35%, 100% 42%, 100% 100%)'
                  }}
                />
              </div>
            </div>

            {/* Right Column Features (Visible on Desktop) */}
            <div className="lg:col-span-3 hidden lg:flex flex-col gap-3 md:gap-4 text-left">
              {/* Feature 4 */}
              <div className="flex gap-3.5 items-center justify-start group">
                <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <div className="absolute inset-0 bg-[#4f080e] border border-gold-500/50 rounded-lg shadow-md transform rotate-0 transition-transform duration-500 group-hover:rotate-12"></div>
                  <div className="absolute inset-0 bg-[#4f080e] border border-gold-500/50 rounded-lg shadow-md transform rotate-45 transition-transform duration-500 group-hover:rotate-57"></div>
                  <div className="absolute w-9.5 h-9.5 rounded-full border border-gold-400/40 flex items-center justify-center z-10 bg-gradient-to-b from-[#4f080e] to-[#2a0407]">
                    <FaCrown className="text-gold-400 text-sm group-hover:text-gold-300 drop-shadow-[0_0_4px_rgba(250,204,21,0.5)] z-20 animate-pulse" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-crimson-950 text-sm md:text-base font-extrabold font-serif group-hover:text-crimson-800 transition-colors">Expert Advisors</h3>
                  <p className="text-[#4f080e]/80 text-[11px] md:text-xs leading-relaxed font-semibold">Assistance from experienced matchmakers.</p>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="flex gap-3.5 items-center justify-start group">
                <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <div className="absolute inset-0 bg-[#4f080e] border border-gold-500/50 rounded-lg shadow-md transform rotate-0 transition-transform duration-500 group-hover:rotate-12"></div>
                  <div className="absolute inset-0 bg-[#4f080e] border border-gold-500/50 rounded-lg shadow-md transform rotate-45 transition-transform duration-500 group-hover:rotate-57"></div>
                  <div className="absolute w-9.5 h-9.5 rounded-full border border-gold-400/40 flex items-center justify-center z-10 bg-gradient-to-b from-[#4f080e] to-[#2a0407]">
                    <FaUsers className="text-gold-400 text-sm group-hover:text-gold-300 drop-shadow-[0_0_4px_rgba(250,204,21,0.5)] z-20" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-crimson-950 text-sm md:text-base font-extrabold font-serif group-hover:text-crimson-800 transition-colors">Family Meetings</h3>
                  <p className="text-[#4f080e]/80 text-[11px] md:text-xs leading-relaxed font-semibold">Family interactions coordinated safely.</p>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="flex gap-3.5 items-center justify-start group">
                <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <div className="absolute inset-0 bg-[#4f080e] border border-gold-500/50 rounded-lg shadow-md transform rotate-0 transition-transform duration-500 group-hover:rotate-12"></div>
                  <div className="absolute inset-0 bg-[#4f080e] border border-gold-500/50 rounded-lg shadow-md transform rotate-45 transition-transform duration-500 group-hover:rotate-57"></div>
                  <div className="absolute w-9.5 h-9.5 rounded-full border border-gold-400/40 flex items-center justify-center z-10 bg-gradient-to-b from-[#4f080e] to-[#2a0407]">
                    <FaComments className="text-gold-400 text-sm group-hover:text-gold-300 drop-shadow-[0_0_4px_rgba(250,204,21,0.5)] z-20" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-crimson-950 text-sm md:text-base font-extrabold font-serif group-hover:text-crimson-800 transition-colors">End-to-End Support</h3>
                  <p className="text-[#4f080e]/80 text-[11px] md:text-xs leading-relaxed font-semibold">Guidance from sign-up to marriage.</p>
                </div>
              </div>
            </div>

          </div>



        </div>
      </section>

      {/* Feature Value Props */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-4 mb-16">
          {/* Heading Plaque Box */}
          <div className="p-0.5 rounded-2xl bg-gradient-to-r from-gold-500/40 via-gold-400/20 to-gold-500/40 border border-gold-500/30 shadow-2xl relative overflow-hidden">
            <div className="bg-[#4f080e] rounded-xl px-5 py-4 border border-gold-500/20 relative">
              {/* Corner Stars */}
              <div className="absolute top-2 left-2 text-gold-500/25 text-xs">✨</div>
              <div className="absolute top-2 right-2 text-gold-500/25 text-xs">✨</div>
              <div className="absolute bottom-2 left-2 text-gold-500/25 text-xs">✨</div>
              <div className="absolute bottom-2 right-2 text-gold-500/25 text-xs">✨</div>

              <span className="text-gold-400 text-[10px] md:text-xs font-bold tracking-widest uppercase mb-1 block">Our Core Principles</span>
              <h2 className="text-white text-xl md:text-3xl font-serif font-extrabold leading-tight">
                Designed for <span className="text-gold-400 text-gold-gradient font-extrabold font-serif">Meaningful, Halal</span> Connections
              </h2>
            </div>
          </div>
          <p className="text-slate-600 font-semibold max-w-xl mx-auto">
            We focus on values, morals, and mutual respect rather than mindless swiping. Explore premium features built to ensure your privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-gold-gradient p-8 rounded-2xl border border-gold-500/20 shadow-[0_4px_25px_rgba(212,175,55,0.15)] hover:shadow-[0_12px_35px_rgba(212,175,55,0.3)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-4 group">
            <div className="w-14 h-14 rounded-full bg-white border border-gold-500/10 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
              <FaShieldAlt className="text-[#4f080e] filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)]" />
            </div>
            <h3 className="text-crimson-950 text-xl font-bold font-serif">100% Privacy Lock</h3>
            <p className="text-crimson-950/80 text-sm font-semibold leading-relaxed">
              Your contact details (phone, email) are kept securely locked. They are only shared when you mutually accept connection requests.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-gold-gradient p-8 rounded-2xl border border-gold-500/20 shadow-[0_4px_25px_rgba(212,175,55,0.15)] hover:shadow-[0_12px_35px_rgba(212,175,55,0.3)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-4 group">
            <div className="w-14 h-14 rounded-full bg-white border border-gold-500/10 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
              <FaHeart className="text-[#4f080e] filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)] animate-pulse" />
            </div>
            <h3 className="text-crimson-950 text-xl font-bold font-serif">Halal Matchmaking</h3>
            <p className="text-crimson-950/80 text-sm font-semibold leading-relaxed">
              We structure our profiles around Islamic principles, allowing users to search by Sect, religious dedication, and moral criteria.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-gold-gradient p-8 rounded-2xl border border-gold-500/20 shadow-[0_4px_25px_rgba(212,175,55,0.15)] hover:shadow-[0_12px_35px_rgba(212,175,55,0.3)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-4 group">
            <div className="w-14 h-14 rounded-full bg-white border border-gold-500/10 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
              <FaCrown className="text-[#4f080e] filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)]" />
            </div>
            <h3 className="text-crimson-950 text-xl font-bold font-serif">Premium Tier Controls</h3>
            <p className="text-crimson-950/80 text-sm font-semibold leading-relaxed">
              Enforce customizable limit gates. Free tier profiles views are gated, while Premium/Elite tiers enjoy full details and messaging.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Step Stepper */}
      <section className="bg-crimson-900/5 py-20 px-4 md:px-8 border-y border-crimson-900/10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Heading Plaque Box */}
          <div className="max-w-2xl mx-auto mb-16 p-0.5 rounded-2xl bg-gradient-to-r from-gold-500/40 via-gold-400/20 to-gold-500/40 border border-gold-500/30 shadow-2xl relative overflow-hidden">
            <div className="bg-[#4f080e] rounded-xl px-5 py-4 border border-gold-500/20 relative">
              {/* Corner Stars */}
              <div className="absolute top-2 left-2 text-gold-500/25 text-xs">✨</div>
              <div className="absolute top-2 right-2 text-gold-500/25 text-xs">✨</div>
              <div className="absolute bottom-2 left-2 text-gold-500/25 text-xs">✨</div>
              <div className="absolute bottom-2 right-2 text-gold-500/25 text-xs">✨</div>

              <span className="text-gold-400 text-[10px] md:text-xs font-bold tracking-widest uppercase mb-1 block">Simple Process</span>
              <h2 className="text-white text-xl md:text-3xl font-serif font-extrabold leading-tight">
                How <span className="text-gold-400 text-gold-gradient font-extrabold font-serif">Rohin Muslim Matrimony</span> Works
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-[#4f080e] p-6 rounded-2xl border border-gold-500/20 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-4 relative z-10 group">
              <div className="w-12 h-12 rounded-full border-2 border-gold-500 bg-[#3d060a]/50 text-gold-400 font-extrabold flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform duration-300">
                1
              </div>
              <h3 className="font-serif font-bold text-gold-400 text-base group-hover:text-white transition-colors">Register Profile</h3>
              <p className="text-slate-200/90 text-xs leading-relaxed font-medium">Create a free profile and fill in your education, profession, sect, and expectations.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#4f080e] p-6 rounded-2xl border border-gold-500/20 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-4 relative z-10 group">
              <div className="w-12 h-12 rounded-full border-2 border-gold-500 bg-[#3d060a]/50 text-gold-400 font-extrabold flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform duration-300">
                2
              </div>
              <h3 className="font-serif font-bold text-gold-400 text-base group-hover:text-white transition-colors">Explore Tiers</h3>
              <p className="text-slate-200/90 text-xs leading-relaxed font-medium">Browse filtered matches by location, sect, and age range to find matching beliefs.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#4f080e] p-6 rounded-2xl border border-gold-500/20 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-4 relative z-10 group">
              <div className="w-12 h-12 rounded-full border-2 border-gold-500 bg-[#3d060a]/50 text-gold-400 font-extrabold flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform duration-300">
                3
              </div>
              <h3 className="font-serif font-bold text-gold-400 text-base group-hover:text-white transition-colors">Send Interest</h3>
              <p className="text-slate-200/90 text-xs leading-relaxed font-medium">Send an Interest Request. If they accept, your connection is mutually established!</p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#4f080e] p-6 rounded-2xl border border-gold-500/20 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-4 relative z-10 group">
              <div className="w-12 h-12 rounded-full border-2 border-gold-500 bg-[#3d060a]/50 text-gold-400 font-extrabold flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform duration-300">
                4
              </div>
              <h3 className="font-serif font-bold text-gold-400 text-base group-hover:text-white transition-colors">Unlock & Chat</h3>
              <p className="text-slate-200/90 text-xs leading-relaxed font-medium">Upgrade to Premium to unlock bidiographic details and chat with your connections.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Heading Plaque Box */}
        <div className="max-w-2xl mx-auto mb-16 p-0.5 rounded-2xl bg-gradient-to-r from-gold-500/40 via-gold-400/20 to-gold-500/40 border border-gold-500/30 shadow-2xl relative overflow-hidden">
          <div className="bg-[#4f080e] rounded-xl px-5 py-4 border border-gold-500/20 relative">
            {/* Corner Stars */}
            <div className="absolute top-2 left-2 text-gold-500/25 text-xs">✨</div>
            <div className="absolute top-2 right-2 text-gold-500/25 text-xs">✨</div>
            <div className="absolute bottom-2 left-2 text-gold-500/25 text-xs">✨</div>
            <div className="absolute bottom-2 right-2 text-gold-500/25 text-xs">✨</div>

            <span className="text-gold-400 text-[10px] md:text-xs font-bold tracking-widest uppercase mb-1 block">Alhamdulillah</span>
            <h2 className="text-white text-xl md:text-3xl font-serif font-extrabold leading-tight">
              Success Stories
            </h2>
            <p className="text-slate-200/90 text-xs md:text-sm mt-2 max-w-lg mx-auto">
              We have helped thousands of Muslims find their perfect matches. Read their heartwarming journeys.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Testimonial 1 */}
          <div className="relative bg-[#faf6ea] p-4 md:p-5 rounded-2xl border border-gold-200/30 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left group">
            {/* Decorative Quote Icon */}
            <div className="absolute -top-4 -left-2 w-8 h-8 rounded-full bg-gold-gradient border border-gold-400/60 flex items-center justify-center shadow-md">
              <span className="text-crimson-950 font-serif font-extrabold text-xl leading-none">“</span>
            </div>

            <p className="text-slate-700 italic leading-relaxed text-xs mb-4 relative z-10">
              "A blessing. I loved the privacy features. We connected on Premium, chatted with family involvement, and got married last Shawwal. Jazakallah Khair!"
            </p>
            <div className="border-t border-gold-500/10 pt-3 mt-auto">
              <h4 className="font-serif font-bold text-slate-900 text-sm group-hover:text-[#4f080e] transition-colors">Fariha & Imran</h4>
              <span className="text-[10px] text-[#4f080e] font-bold uppercase tracking-wider block mt-0.5">Connected in Hyd</span>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="relative bg-[#faf6ea] p-4 md:p-5 rounded-2xl border border-gold-200/30 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left group">
            {/* Decorative Quote Icon */}
            <div className="absolute -top-4 -left-2 w-8 h-8 rounded-full bg-gold-gradient border border-gold-400/60 flex items-center justify-center shadow-md">
              <span className="text-crimson-950 font-serif font-extrabold text-xl leading-none">“</span>
            </div>

            <p className="text-slate-700 italic leading-relaxed text-xs mb-4 relative z-10">
              "Using the advanced filters on the Elite plan allowed me to find highly educated, family-oriented Sunni profiles in Lucknow. Excellent platform!"
            </p>
            <div className="border-t border-gold-500/10 pt-3 mt-auto">
              <h4 className="font-serif font-bold text-slate-900 text-sm group-hover:text-[#4f080e] transition-colors">Dr. Khalid & Yasmin</h4>
              <span className="text-[10px] text-[#4f080e] font-bold uppercase tracking-wider block mt-0.5">Connected in Delhi</span>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="relative bg-[#faf6ea] p-4 md:p-5 rounded-2xl border border-gold-200/30 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left group">
            {/* Decorative Quote Icon */}
            <div className="absolute -top-4 -left-2 w-8 h-8 rounded-full bg-gold-gradient border border-gold-400/60 flex items-center justify-center shadow-md">
              <span className="text-crimson-950 font-serif font-extrabold text-xl leading-none">“</span>
            </div>

            <p className="text-slate-700 italic leading-relaxed text-xs mb-4 relative z-10">
              "Alhamdulillah, we found each other through the sectarian filters. Sameer's profile matched my expectations. Married after Eid!"
            </p>
            <div className="border-t border-gold-500/10 pt-3 mt-auto">
              <h4 className="font-serif font-bold text-slate-900 text-sm group-hover:text-[#4f080e] transition-colors">Aisha & Sameer</h4>
              <span className="text-[10px] text-[#4f080e] font-bold uppercase tracking-wider block mt-0.5">Connected in Mumbai</span>
            </div>
          </div>

          {/* Testimonial 4 */}
          <div className="relative bg-[#faf6ea] p-4 md:p-5 rounded-2xl border border-gold-200/30 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left group">
            {/* Decorative Quote Icon */}
            <div className="absolute -top-4 -left-2 w-8 h-8 rounded-full bg-gold-gradient border border-gold-400/60 flex items-center justify-center shadow-md">
              <span className="text-crimson-950 font-serif font-extrabold text-xl leading-none">“</span>
            </div>

            <p className="text-slate-700 italic leading-relaxed text-xs mb-4 relative z-10">
              "The secure chat framework kept everything completely respectful and halal. Highly recommended for practicing Muslims!"
            </p>
            <div className="border-t border-gold-500/10 pt-3 mt-auto">
              <h4 className="font-serif font-bold text-slate-900 text-sm group-hover:text-[#4f080e] transition-colors">Zara & Farhan</h4>
              <span className="text-[10px] text-[#4f080e] font-bold uppercase tracking-wider block mt-0.5">Connected in Blr</span>
            </div>
          </div>

          {/* Testimonial 5 */}
          <div className="relative bg-[#faf6ea] p-4 md:p-5 rounded-2xl border border-gold-200/30 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left group">
            {/* Decorative Quote Icon */}
            <div className="absolute -top-4 -left-2 w-8 h-8 rounded-full bg-gold-gradient border border-gold-400/60 flex items-center justify-center shadow-md">
              <span className="text-crimson-950 font-serif font-extrabold text-xl leading-none">“</span>
            </div>

            <p className="text-slate-700 italic leading-relaxed text-xs mb-4 relative z-10">
              "Finding someone with the same professional background and level of deen was simple. Families were involved from day one!"
            </p>
            <div className="border-t border-gold-500/10 pt-3 mt-auto">
              <h4 className="font-serif font-bold text-slate-900 text-sm group-hover:text-[#4f080e] transition-colors">Sana & Riaz</h4>
              <span className="text-[10px] text-[#4f080e] font-bold uppercase tracking-wider block mt-0.5">Connected in Chennai</span>
            </div>
          </div>

          {/* Testimonial 6 */}
          <div className="relative bg-[#faf6ea] p-4 md:p-5 rounded-2xl border border-gold-200/30 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left group">
            {/* Decorative Quote Icon */}
            <div className="absolute -top-4 -left-2 w-8 h-8 rounded-full bg-gold-gradient border border-gold-400/60 flex items-center justify-center shadow-md">
              <span className="text-crimson-950 font-serif font-extrabold text-xl leading-none">“</span>
            </div>

            <p className="text-slate-700 italic leading-relaxed text-xs mb-4 relative z-10">
              "We connected on the Elite tier. The match compatibility reports helped our families immensely. Alhamdulillah!"
            </p>
            <div className="border-t border-gold-500/10 pt-3 mt-auto">
              <h4 className="font-serif font-bold text-slate-900 text-sm group-hover:text-[#4f080e] transition-colors">Hina & Zayan</h4>
              <span className="text-[10px] text-[#4f080e] font-bold uppercase tracking-wider block mt-0.5">Connected in Lucknow</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Join Section */}
      <section className="bg-gradient-to-br from-[#4f080e] via-[#3d060a] to-[#2b0306] py-24 px-4 md:px-8 text-center border-t-2 border-gold-500/30 text-white relative overflow-hidden">
        {/* Decorative background glow / ornaments */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)] pointer-events-none"></div>

        {/* Floating Stars */}
        <div className="absolute top-8 left-8 text-gold-500/20 text-xl animate-pulse">✨</div>
        <div className="absolute bottom-8 right-8 text-gold-500/20 text-xl animate-pulse">✨</div>
        <div className="absolute top-12 right-12 text-gold-500/10 text-lg">✨</div>
        <div className="absolute bottom-12 left-12 text-gold-500/10 text-lg">✨</div>

        <div className="max-w-3xl mx-auto flex flex-col gap-6 relative z-10">
          <span className="text-gold-400 text-xs md:text-sm font-bold tracking-widest uppercase block">Masha Allah</span>
          <h2 className="text-4xl md:text-5xl font-serif font-extrabold leading-tight text-white drop-shadow-md">
            Begin Your <span className="text-gold-400 text-gold-gradient font-extrabold font-serif">Halal Journey</span> Today
          </h2>
          <p className="text-slate-200/90 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Register now to explore verified profiles and connect with practicing members matching your Islamic values.
          </p>
          <div className="mt-6">
            <Link
              to="/register"
              className="inline-flex bg-gold-gradient text-crimson-950 font-extrabold px-12 py-4 rounded-full shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40 hover:scale-105 transition-all text-base md:text-lg tracking-wide"
            >
              Get Started – Free Registration
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

