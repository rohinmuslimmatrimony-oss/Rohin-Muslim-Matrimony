import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaHeart, FaShieldAlt, FaComments, FaCrown, FaUsers, FaArrowRight, FaMoon, FaLock, FaPhoneAlt, FaMosque, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import logo3 from '../assets/logo3.png';
import homeBanner from '../assets/home-banner.png';
import couple1 from '../assets/couple1.png';
import couple2 from '../assets/couple2.png';
import couple3 from '../assets/couple3.png';
import couple4 from '../assets/couple4.png';
import api, { SOCKET_BASE_URL } from '../services/api';

const LandingPage = () => {
  const { user } = useContext(AuthContext);
  const [successStories, setSuccessStories] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const staticTestimonials = [
    { 
      partnerOne: "Fariha", 
      partnerTwo: "Imran", 
      story: "Alhamdulillah! We found each other through Rohin Muslim Matrimony. The privacy settings allowed me to share my details only when comfortable. Our families connected, and we got married last Shawwal. Truly a blessed platform!", 
      location: "Hyderabad",
      localImage: couple1
    },
    { 
      partnerOne: "Dr. Khalid", 
      partnerTwo: "Yasmin", 
      story: "As a professional, finding someone with similar educational background and religious values was my priority. The elite filters made it simple to find Yasmin. We are happily married now, Jazakallah Khair!", 
      location: "Delhi",
      localImage: couple2
    },
    { 
      partnerOne: "Aisha", 
      partnerTwo: "Sameer", 
      story: "The platform's focus on halal matchmaking and family involvement from day one made our journey very smooth. We connected respectably and our parents met soon after. Highly recommended for practicing Muslims!", 
      location: "Mumbai",
      localImage: couple3
    },
    { 
      partnerOne: "Zara", 
      partnerTwo: "Farhan", 
      story: "Alhamdulillah, Rohin Muslim Matrimony was the answer to our prayers. The compatibility report and profile verification gave us absolute peace of mind. We tied the knot last Eid!", 
      location: "Bangalore",
      localImage: couple4
    }
  ];

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await api.get('/success-stories');
        if (res.data.success && res.data.data.length > 0) {
          setSuccessStories(res.data.data);
        } else {
          setSuccessStories(staticTestimonials);
        }
      } catch (err) {
        console.error('Failed to fetch success stories:', err);
        setSuccessStories(staticTestimonials);
      }
    };
    fetchStories();
  }, []);

  useEffect(() => {
    if (successStories.length === 0) return;
    const interval = setInterval(() => {
      setCurrentStoryIndex((prev) => (prev + 1) % successStories.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [currentStoryIndex, successStories]);

  const nextSlide = () => {
    if (successStories.length === 0) return;
    setCurrentStoryIndex((prev) => (prev + 1) % successStories.length);
  };

  const prevSlide = () => {
    if (successStories.length === 0) return;
    setCurrentStoryIndex((prev) => (prev - 1 + successStories.length) % successStories.length);
  };

  return (
    <div className="bg-cream-50 overflow-hidden">
      {/* Premium Hero Section */}
      <section
        className="relative py-4 md:py-6 px-4 md:px-8 border-b-2 border-gold-500/30 overflow-hidden flex flex-col items-center justify-center text-center lg:h-[calc(100vh-80px)] lg:max-h-[800px] min-h-[220px] md:min-h-[560px]"
        style={{ background: 'linear-gradient(135deg, #4f080e 50%, #d4af37 50%)' }}
      >
        <div className="max-w-[1550px] mx-auto w-full relative z-10">


          {/* Three-Column Banner Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center mt-1 md:mt-2">

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
            <div className="lg:col-span-6 flex flex-col justify-center items-center relative px-2 mt-3.5 md:-mt-10 lg:-mt-14">
              {/* Starry Outer Aura Glow */}
              <div className="absolute inset-0 bg-gold-500/5 rounded-2xl blur-xl pointer-events-none"></div>

              <div className="relative max-w-[310px] sm:max-w-[360px] md:max-w-[620px] w-full mx-auto filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.55)] transform hover:scale-[1.02] transition-transform duration-500">
                <img
                  src={homeBanner}
                  alt="Muslim Marriage Consultancy Banner"
                  className="max-h-[240px] sm:max-h-[280px] md:max-h-[580px] w-full h-auto object-contain block mx-auto"
                />
              </div>

              {/* Grand Mobile Auth Action Buttons */}
              {!user && (
                <div className="lg:hidden flex items-center justify-center gap-3 w-full max-w-[260px] sm:max-w-[310px] mt-3.5 z-20">
                  <Link
                    to="/login"
                    className="flex-1 text-center py-1.5 px-3.5 bg-gradient-to-r from-[#3b060a] via-[#5c0b11] to-[#3b060a] text-white font-extrabold rounded-full border border-[#d4af37]/45 shadow-[0_3px_12px_rgba(79,8,14,0.3)] text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 text-center py-1.5 px-3.5 bg-gradient-to-r from-[#e5c060] via-[#c59b27] to-[#e5c060] text-[#3b060a] font-extrabold rounded-full border border-[#ffd700]/30 shadow-[0_3px_12px_rgba(197,155,39,0.3)] text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                  >
                    Register
                  </Link>
                </div>
              )}
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
      <section className="relative overflow-hidden py-10 md:py-20 px-4 md:px-8 max-w-7xl mx-auto rounded-2xl bg-gradient-to-b from-[#fffefc] via-[#faf6ee] to-[#fffefc] border border-gold-500/20 shadow-md mt-4 z-10">
        
        {/* Top Hanging Ornaments Underlay */}
        <div className="absolute top-0 left-0 right-0 h-36 opacity-[0.95] pointer-events-none select-none z-0">
          <svg className="w-full h-full text-[#d4af37]" fill="currentColor" viewBox="0 0 1000 100" preserveAspectRatio="none">
            <path d="M 0 0 Q 125 70 250 0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeDasharray="4,4" />
            <path d="M 250 0 Q 375 70 500 0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeDasharray="4,4" />
            <path d="M 500 0 Q 625 70 750 0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeDasharray="4,4" />
            <path d="M 750 0 Q 875 70 1000 0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeDasharray="4,4" />

            <line x1="125" y1="35" x2="125" y2="70" stroke="currentColor" strokeWidth="2" />
            <polygon points="125,70 129,76 125,82 121,76" fill="#4f080e" className="text-[#4f080e]" />
            <line x1="375" y1="35" x2="375" y2="70" stroke="currentColor" strokeWidth="2" />
            <polygon points="375,70 379,76 375,82 371,76" fill="#4f080e" className="text-[#4f080e]" />
            <line x1="625" y1="35" x2="625" y2="70" stroke="currentColor" strokeWidth="2" />
            <polygon points="625,70 629,76 625,82 621,76" fill="#4f080e" className="text-[#4f080e]" />
            <line x1="875" y1="35" x2="875" y2="70" stroke="currentColor" strokeWidth="2" />
            <polygon points="875,70 879,76 875,82 871,76" fill="#4f080e" className="text-[#4f080e]" />

            <line x1="250" y1="0" x2="250" y2="55" stroke="currentColor" strokeWidth="2.5" />
            <path d="M 244 55 L 256 55 L 258 68 L 253 84 L 247 84 L 242 68 Z" fill="#4f080e" className="text-[#4f080e]" stroke="#d4af37" strokeWidth="1" />
            <circle cx="250" cy="52" r="3.5" fill="#d4af37" stroke="currentColor" strokeWidth="1" />

            <line x1="500" y1="0" x2="500" y2="55" stroke="currentColor" strokeWidth="2.5" />
            <path d="M 494 55 L 506 55 L 508 68 L 503 84 L 497 84 L 492 68 Z" fill="#4f080e" className="text-[#4f080e]" stroke="#d4af37" strokeWidth="1" />
            <circle cx="500" cy="52" r="3.5" fill="#d4af37" stroke="currentColor" strokeWidth="1" />

            <line x1="750" y1="0" x2="750" y2="55" stroke="currentColor" strokeWidth="2.5" />
            <path d="M 744 55 L 756 55 L 758 68 L 753 84 L 747 84 L 742 68 Z" fill="#4f080e" className="text-[#4f080e]" stroke="#d4af37" strokeWidth="1" />
            <circle cx="750" cy="52" r="3.5" fill="#d4af37" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>

        {/* Center Islamic Mandala Pattern Watermark */}
        <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[72%] max-w-[440px] aspect-square opacity-[0.35] pointer-events-none select-none z-0">
          <svg viewBox="0 0 200 200" fill="none" stroke="#d4af37" className="w-full h-full">
            <circle cx="100" cy="100" r="92" strokeDasharray="3,3" strokeWidth="1.2" />
            <circle cx="100" cy="100" r="78" strokeWidth="1.2" />
            <circle cx="100" cy="100" r="62" strokeWidth="1.2" />
            <path d="M100 8 L100 192 M8 100 L192 100 M35 35 L165 165 M35 165 L165 35" strokeWidth="0.8" strokeDasharray="2,2" stroke="#d4af37" />
            <path d="M100 22 L155 77 L178 100 L155 123 L100 178 L45 123 L22 100 L45 77 Z" strokeWidth="2.2" />
            <path d="M100 38 L144 100 L100 162 L56 100 Z" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="48" strokeWidth="1.5" strokeDasharray="4,2" />
            <path d="M100 52 C122 52 148 74 148 100 C148 126 122 148 100 148 C78 148 52 126 52 100 C52 74 78 52 100 52 Z" strokeWidth="1.2" />
            <path d="M100 52 C78 52 52 74 52 100 C52 126 78 148 100 148 C122 148 148 126 148 100 C148 74 122 52 100 52 Z" strokeWidth="1.2" />
          </svg>
        </div>

        {/* Bottom Left Mosque Silhouette Underlay */}
        <div className="absolute bottom-0 left-0 w-[24%] max-w-[190px] opacity-[0.55] pointer-events-none select-none z-0">
          <svg viewBox="0 0 100 120" fill="#4f080e" stroke="#d4af37" strokeWidth="1" className="w-full h-auto">
            <path d="M0 120 L0 60 Q10 50 12 60 L12 120 M12 120 L12 25 L15 10 L18 25 L18 120 M18 120 L18 70 Q30 55 42 70 L42 120 M42 120 L42 20 L45 5 L48 20 L48 120 M48 120 Q65 85 82 120 Z" />
          </svg>
        </div>

        {/* Bottom Right Mosque Silhouette Underlay */}
        <div className="absolute bottom-0 right-0 w-[24%] max-w-[190px] opacity-[0.55] pointer-events-none select-none z-0 scale-x-[-1]">
          <svg viewBox="0 0 100 120" fill="#4f080e" stroke="#d4af37" strokeWidth="1" className="w-full h-auto">
            <path d="M0 120 L0 60 Q10 50 12 60 L12 120 M12 120 L12 25 L15 10 L18 25 L18 120 M18 120 L18 70 Q30 55 42 70 L42 120 M42 120 L42 20 L45 5 L48 20 L48 120 M48 120 Q65 85 82 120 Z" />
          </svg>
        </div>

        {/* Content Container to sit on top of underlays */}
        <div className="relative z-10 w-full h-full">
          <div className="text-center max-w-2xl mx-auto flex flex-col gap-2 md:gap-4 mb-6 md:mb-16">
            {/* Heading Plaque Box */}
            <div className="p-0.5 rounded-xl md:rounded-2xl bg-gradient-to-r from-gold-500/40 via-gold-400/20 to-gold-500/40 border border-gold-500/30 shadow-xl relative overflow-hidden">
              <div className="bg-[#4f080e] rounded-lg md:rounded-xl px-3.5 py-2 md:px-5 md:py-4 border border-gold-500/20 relative">
                {/* Corner Stars */}
                <div className="absolute top-1.5 left-1.5 text-gold-500/25 text-[9px] md:text-[10px]">✨</div>
                <div className="absolute top-1.5 right-1.5 text-gold-500/25 text-[9px] md:text-[10px]">✨</div>

                <span className="text-gold-400 text-[9px] md:text-xs font-bold tracking-widest uppercase mb-0.5 block">Our Core Principles</span>
                <h2 className="text-white text-sm md:text-3xl font-serif font-extrabold leading-tight">
                  Designed for <span className="text-gold-400 text-gold-gradient font-extrabold font-serif">Meaningful, Halal</span> Connections
                </h2>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-8">
            {/* Card 1 */}
            <div className="bg-gold-gradient p-2.5 sm:p-4 md:p-8 rounded-xl md:rounded-2xl border border-gold-500/20 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-1.5 sm:gap-2 md:gap-4 group col-span-1">
              <div className="w-7 h-7 sm:w-10 sm:h-10 md:w-14 md:h-14 rounded-full bg-white border border-gold-500/10 flex items-center justify-center text-xs sm:text-lg md:text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                <FaShieldAlt className="text-[#4f080e] filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)]" />
              </div>
              <h3 className="text-crimson-950 text-[10px] sm:text-sm md:text-xl font-bold font-serif">100% Privacy Lock</h3>
              <p className="text-crimson-950/85 text-[8px] sm:text-[11px] md:text-sm font-semibold leading-normal">
                Your contact details (phone, email) are kept securely locked. They are only shared when you mutually accept connection requests.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-gold-gradient p-2.5 sm:p-4 md:p-8 rounded-xl md:rounded-2xl border border-gold-500/20 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-1.5 sm:gap-2 md:gap-4 group col-span-1">
              <div className="w-7 h-7 sm:w-10 sm:h-10 md:w-14 md:h-14 rounded-full bg-white border border-gold-500/10 flex items-center justify-center text-xs sm:text-lg md:text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                <FaHeart className="text-[#4f080e] filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)] animate-pulse" />
              </div>
              <h3 className="text-crimson-950 text-[10px] sm:text-sm md:text-xl font-bold font-serif">Halal Matchmaking</h3>
              <p className="text-crimson-950/85 text-[8px] sm:text-[11px] md:text-sm font-semibold leading-normal">
                We structure our profiles around Islamic principles, allowing users to search by Sect, religious dedication, and moral criteria.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-gold-gradient p-2.5 sm:p-4 md:p-8 rounded-xl md:rounded-2xl border border-gold-500/20 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-1.5 sm:gap-2 md:gap-4 group col-span-2 md:col-span-1">
              <div className="w-7 h-7 sm:w-10 sm:h-10 md:w-14 md:h-14 rounded-full bg-white border border-gold-500/10 flex items-center justify-center text-xs sm:text-lg md:text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                <FaCrown className="text-[#4f080e] filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)]" />
              </div>
              <h3 className="text-crimson-950 text-[10px] sm:text-sm md:text-xl font-bold font-serif">Premium Tier Controls</h3>
              <p className="text-crimson-950/85 text-[8px] sm:text-[11px] md:text-sm font-semibold leading-normal">
                Enforce customizable limit gates. Free tier profiles views are gated, while Premium/Elite tiers enjoy full details and messaging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Step Stepper */}
      <section className="bg-crimson-900/5 py-6 md:py-20 px-4 md:px-8 border-y border-crimson-900/10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Heading Plaque Box */}
          <div className="max-w-2xl mx-auto mb-6 md:mb-16 p-0.5 rounded-xl md:rounded-2xl bg-gradient-to-r from-gold-500/40 via-gold-400/20 to-gold-500/40 border border-gold-500/30 shadow-xl relative overflow-hidden">
            <div className="bg-[#4f080e] rounded-lg md:rounded-xl px-3.5 py-2 md:px-5 md:py-4 border border-gold-500/20 relative">
              {/* Corner Stars */}
              <div className="absolute top-1.5 left-1.5 text-gold-500/25 text-[9px] md:text-[10px]">✨</div>
              <div className="absolute top-1.5 right-1.5 text-gold-500/25 text-[9px] md:text-[10px]">✨</div>

              <span className="text-gold-400 text-[9px] md:text-xs font-bold tracking-widest uppercase mb-0.5 block">Simple Process</span>
              <h2 className="text-white text-sm md:text-3xl font-serif font-extrabold leading-tight">
                How <span className="text-gold-400 text-gold-gradient font-extrabold font-serif">Rohin Muslim Matrimony</span> Works
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6 relative">
            {/* Step 1 */}
            <div className="bg-[#4f080e] p-2.5 sm:p-4 md:p-6 rounded-xl md:rounded-2xl border border-gold-500/20 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-1.5 md:gap-4 relative z-10 group">
              <div className="w-6.5 h-6.5 md:w-12 md:h-12 rounded-full border border-gold-500 bg-[#3d060a]/50 text-gold-400 font-extrabold flex items-center justify-center text-[10px] md:text-lg shadow-inner group-hover:scale-110 transition-transform duration-300">
                1
              </div>
              <h3 className="font-serif font-bold text-gold-400 text-[10px] sm:text-xs md:text-base group-hover:text-white transition-colors">Register Profile</h3>
              <p className="text-slate-200/90 text-[8px] sm:text-[10px] md:text-xs leading-normal font-medium">Create a free profile and fill in your education, profession, sect, and expectations.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#4f080e] p-2.5 sm:p-4 md:p-6 rounded-xl md:rounded-2xl border border-gold-500/20 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-1.5 md:gap-4 relative z-10 group">
              <div className="w-6.5 h-6.5 md:w-12 md:h-12 rounded-full border border-gold-500 bg-[#3d060a]/50 text-gold-400 font-extrabold flex items-center justify-center text-[10px] md:text-lg shadow-inner group-hover:scale-110 transition-transform duration-300">
                2
              </div>
              <h3 className="font-serif font-bold text-gold-400 text-[10px] sm:text-xs md:text-base group-hover:text-white transition-colors">Explore Tiers</h3>
              <p className="text-slate-200/90 text-[8px] sm:text-[10px] md:text-xs leading-normal font-medium">Browse filtered matches by location, sect, and age range to find matching beliefs.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#4f080e] p-2.5 sm:p-4 md:p-6 rounded-xl md:rounded-2xl border border-gold-500/20 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-1.5 md:gap-4 relative z-10 group">
              <div className="w-6.5 h-6.5 md:w-12 md:h-12 rounded-full border border-gold-500 bg-[#3d060a]/50 text-gold-400 font-extrabold flex items-center justify-center text-[10px] md:text-lg shadow-inner group-hover:scale-110 transition-transform duration-300">
                3
              </div>
              <h3 className="font-serif font-bold text-gold-400 text-[10px] sm:text-xs md:text-base group-hover:text-white transition-colors">Send Interest</h3>
              <p className="text-slate-200/90 text-[8px] sm:text-[10px] md:text-xs leading-normal font-medium">Send an Interest Request. If they accept, your connection is mutually established!</p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#4f080e] p-2.5 sm:p-4 md:p-6 rounded-xl md:rounded-2xl border border-gold-500/20 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-1.5 md:gap-4 relative z-10 group">
              <div className="w-6.5 h-6.5 md:w-12 md:h-12 rounded-full border border-gold-500 bg-[#3d060a]/50 text-gold-400 font-extrabold flex items-center justify-center text-[10px] md:text-lg shadow-inner group-hover:scale-110 transition-transform duration-300">
                4
              </div>
              <h3 className="font-serif font-bold text-gold-400 text-[10px] sm:text-xs md:text-base group-hover:text-white transition-colors">Unlock & Chat</h3>
              <p className="text-slate-200/90 text-[8px] sm:text-[10px] md:text-xs leading-normal font-medium">Upgrade to Premium to unlock bidiographic details and chat with your connections.</p>
            </div>
          </div>
        </div>
      </section>
      {/* Testimonials / Success Stories */}
      <section className="w-full bg-gradient-to-br from-[#f8ebc4] via-[#eed182] to-[#dfb347] py-6 md:py-12 px-4 md:px-8 border-y border-[#d3aa3b]/60 relative overflow-visible shadow-inner">
        {/* Background decorative glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,8,14,0.03)_0%,transparent_70%)] pointer-events-none"></div>
        {/* Top Gold Swirls & Leaves Underlay */}
        <div className="absolute top-0 left-0 right-0 h-32 opacity-[0.8] pointer-events-none select-none z-0 overflow-hidden">
          <svg className="w-full h-full text-[#4f080e]" fill="currentColor" viewBox="0 0 1000 120" preserveAspectRatio="none">
            {/* Ornate Vines in Gold */}
            <path d="M 0 0 C 150 80, 200 -20, 350 40 C 450 70, 550 70, 650 40 C 800 -20, 850 80, 1000 0" fill="none" stroke="#d4af37" strokeWidth="2.5" />
            <path d="M 100 0 C 250 100, 300 20, 450 60" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeDasharray="4,4" />
            <path d="M 900 0 C 750 100, 700 20, 550 60" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeDasharray="4,4" />
            
            {/* Hanging Leaf clusters */}
            {/* Cluster 1 */}
            <path d="M 200 25 C 190 45, 170 45, 200 65 C 230 45, 210 45, 200 25 Z" fill="#d4af37" />
            <circle cx="200" cy="65" r="3" fill="#4f080e" />
            <path d="M 180 30 C 170 40, 160 30, 180 50 Z" fill="#d4af37" opacity="0.8" />
            <path d="M 220 30 C 230 40, 240 30, 220 50 Z" fill="#d4af37" opacity="0.8" />

            {/* Cluster 2 (Center-ish) */}
            <path d="M 500 45 C 490 65, 470 65, 500 85 C 530 65, 510 65, 500 45 Z" fill="#d4af37" />
            <circle cx="500" cy="85" r="4.5" fill="#4f080e" />
            <path d="M 475 50 C 465 60, 455 50, 475 70 Z" fill="#d4af37" opacity="0.8" />
            <path d="M 525 50 C 535 60, 545 50, 525 70 Z" fill="#d4af37" opacity="0.8" />

            {/* Cluster 3 */}
            <path d="M 800 25 C 790 45, 770 45, 800 65 C 830 45, 810 45, 800 25 Z" fill="#d4af37" />
            <circle cx="800" cy="65" r="3" fill="#4f080e" />
            <path d="M 780 30 C 770 40, 760 30, 780 50 Z" fill="#d4af37" opacity="0.8" />
            <path d="M 820 30 C 830 40, 840 30, 820 50 Z" fill="#d4af37" opacity="0.8" />
          </svg>
        </div>

        {/* Bottom Left Gold Floral Swirls Underlay */}
        <div className="absolute bottom-0 left-0 w-[95px] sm:w-[150px] h-[95px] sm:h-[150px] opacity-[0.8] pointer-events-none select-none z-0">
          <svg className="w-full h-full text-[#4f080e]" fill="currentColor" viewBox="0 0 100 100">
            <path d="M0 100 C 35 100, 55 70, 35 50 C 20 35, 15 40, 0 30" fill="none" stroke="#d4af37" strokeWidth="2.5" />
            {/* Flower 1 */}
            <circle cx="30" cy="65" r="10" fill="#d4af37" stroke="#4f080e" strokeWidth="1" />
            <circle cx="30" cy="65" r="3" fill="#4f080e" />
            {/* Leaves */}
            <path d="M 45 80 C 52 70, 65 77, 58 87 Z" fill="#d4af37" />
            <path d="M 18 48 C 10 38, 25 30, 32 40 Z" fill="#d4af37" />
          </svg>
        </div>

        {/* Holy Quran Book Underlay */}
        <div className="absolute bottom-1 right-2 w-[90px] sm:w-[130px] h-[80px] sm:h-[110px] opacity-[0.95] pointer-events-none select-none z-0">
          <svg className="w-full h-full text-[#4f080e]" fill="currentColor" viewBox="0 0 120 100">
            {/* Stand / Rehal base in maroon */}
            <polygon points="10,90 110,90 95,70 25,70" fill="#4f080e" stroke="#d4af37" strokeWidth="1" />
            <polygon points="25,70 95,70 105,40 15,40" fill="#3d060a" stroke="#d4af37" strokeWidth="1" />
            
            {/* Quran pages (thick white/cream pages with gold edges) */}
            {/* Left Page */}
            <path d="M17 40 Q 40 33 60 41 L 60 67 Q 40 59 17 66 Z" fill="#fffdf5" stroke="#d4af37" strokeWidth="1.5" />
            {/* Right Page */}
            <path d="M103 40 Q 80 33 60 41 L 60 67 Q 80 59 103 66 Z" fill="#fffdf5" stroke="#d4af37" strokeWidth="1.5" />
            
            {/* Page text lines */}
            <line x1="25" y1="46" x2="52" y2="48" stroke="#d4af37" strokeWidth="1" />
            <line x1="24" y1="51" x2="51" y2="53" stroke="#4f080e" strokeWidth="1" />
            <line x1="25" y1="56" x2="52" y2="58" stroke="#d4af37" strokeWidth="1" />

            <line x1="95" y1="46" x2="68" y2="48" stroke="#d4af37" strokeWidth="1" />
            <line x1="96" y1="51" x2="69" y2="53" stroke="#4f080e" strokeWidth="1" />
            <line x1="95" y1="56" x2="68" y2="58" stroke="#d4af37" strokeWidth="1" />
            
            {/* Gold Ribbon bookmark */}
            <path d="M 60 41 Q 63 68 55 82 Q 53 88 56 95" fill="none" stroke="#d4af37" strokeWidth="2.5" />
          </svg>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Heading Section */}
          <div className="text-center max-w-3xl mx-auto mb-4 md:mb-8 flex flex-col items-center gap-1.5">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#4f080e] border border-gold-400/40 text-gold-400 font-serif font-bold text-[10px] md:text-sm tracking-widest uppercase mb-0.5 shadow-[0_4px_15px_rgba(79,8,14,0.18)] animate-pulse-gold">
              ✦ Masha Allah ✦
            </div>
            
            <h2 className="text-base md:text-3xl lg:text-4xl font-serif font-extrabold text-[#4f080e] leading-tight">
              Stories of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4f080e] via-gold-700 to-[#4f080e] font-serif">Blessed Nikkah</span>
            </h2>
            
            {/* Classic gold separator line with diamond star ornament */}
            <div className="flex items-center justify-center gap-2 my-0.5">
              <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#4f080e]/40"></span>
              <span className="text-[#4f080e] text-[8px] md:text-xs rotate-45">♦</span>
              <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#4f080e]/40"></span>
            </div>

            <p className="text-[#4f080e]/85 font-semibold text-[10px] md:text-xs max-w-lg leading-relaxed px-2 hidden sm:block">
              Alhamdulillah, we have helped these blessed couples complete half of their Deen. Read their heartwarming journeys.
            </p>
          </div>

          {successStories.length > 0 && (
            <div className="relative max-w-4xl mx-auto px-2 md:px-12">
              {/* Carousel Card with Leaf/Arabesque Sweeping Contour Layout */}
              {successStories.map((storyItem, idx) => {
                if (idx !== currentStoryIndex) return null;
                
                // Get display image path
                const displayImage = storyItem.localImage 
                  ? storyItem.localImage 
                  : (storyItem.image 
                    ? `${SOCKET_BASE_URL}${storyItem.image}` 
                    : (storyItem.images && storyItem.images.length > 0 
                      ? `${SOCKET_BASE_URL}${storyItem.images[0]}` 
                      : null));

                return (
                  <div 
                    key={storyItem._id || idx} 
                    className="bg-[#fffdfa] border border-gold-400/30 md:border-2 shadow-[0_15px_45px_rgba(79,8,14,0.12)] flex flex-row items-stretch overflow-hidden max-w-4xl mx-auto min-h-[160px] sm:min-h-[180px] md:min-h-[280px] transition-all duration-700 animate-[fadeIn_0.5s_ease-in-out] relative card-leaf-shape"
                  >
                    {/* Inner luxury gold border frame */}
                    <div className="absolute inset-1.5 md:inset-2.5 border border-gold-300/20 pointer-events-none card-inner-leaf-shape"></div>
                    
                    {/* Gold corner stars */}
                    <div className="absolute top-3 right-8 md:top-5 md:right-12 text-gold-400/50 text-[10px] md:text-xs pointer-events-none select-none">✦</div>
                    <div className="absolute bottom-3 left-8 md:bottom-5 md:left-12 text-gold-400/50 text-[10px] md:text-xs pointer-events-none select-none">✦</div>

                    {/* Left Column: Text and Details (58% width on desktop) */}
                    <div className="w-[58%] md:w-[58%] p-2.5 pb-3.5 md:p-9 flex flex-col justify-between md:justify-center text-left relative z-10">
                      <h3 className="font-serif font-extrabold text-[#4f080e] text-[12px] sm:text-base md:text-xl mb-1 md:mb-3 flex items-center gap-1 md:gap-2">
                        <span className="text-gold-500 font-sans text-[8px] md:text-xs">⚜</span>
                        {storyItem.partnerOne} & {storyItem.partnerTwo}
                      </h3>
                      <p className="text-slate-700 font-sans text-[10px] sm:text-xs md:text-[13px] leading-relaxed mb-1 md:mb-4 font-medium italic pl-1.5 border-l border-gold-400/40 md:border-l-2">
                        "{storyItem.story}"
                      </p>
                      <div className="mt-auto pt-1 md:pt-2.5 border-t border-gold-500/10 flex items-center justify-between pl-4 sm:pl-0">
                        <span className="text-[8px] sm:text-[10px] text-gold-600 font-bold uppercase tracking-widest block">
                          Connected in {storyItem.location}
                        </span>
                        <span className="text-gold-500/30 text-lg md:text-3xl font-serif select-none pointer-events-none hidden sm:inline">”</span>
                      </div>
                    </div>

                    {/* Right Column: Mosque-Arch (Mehrab) Framed Image (42% width on desktop) */}
                    <div className="w-[42%] md:w-[42%] p-2 md:p-6 flex items-center justify-center flex-shrink-0 relative z-10 bg-gradient-to-br from-gold-50/20 to-transparent">
                      <div className="relative w-full h-[120px] sm:h-[135px] md:h-full overflow-hidden border border-gold-400/40 md:border-2 shadow-md transition-transform duration-500 image-arch-shape">
                        {/* Inner gold image border */}
                        <div className="absolute inset-0.5 md:inset-1 border border-gold-300/30 pointer-events-none z-10 image-inner-arch-shape"></div>
                        
                        {displayImage ? (
                          <img 
                            src={displayImage} 
                            alt={`${storyItem.partnerOne} & ${storyItem.partnerTwo}`} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                          />
                        ) : (
                          /* Elegant fallback couple graphic */
                          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#4f080e] to-[#2b0306] flex flex-col items-center justify-center">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.25)_0%,transparent_70%)]"></div>
                            <div className="flex flex-col items-center gap-1 z-10 text-gold-400">
                              <FaHeart className="text-2xl animate-pulse text-gold-300" />
                              <FaMosque className="text-xl text-gold-400" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Left Control Arrow */}
              <button 
                onClick={prevSlide}
                className="absolute -left-1 md:-left-6 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#4f080e] border border-gold-400/40 flex items-center justify-center text-gold-400 shadow-lg hover:bg-gold-500 hover:text-[#4f080e] hover:border-gold-500 transition-all duration-300 z-20 active:scale-95"
                aria-label="Previous story"
              >
                <FaChevronLeft className="text-xs md:text-base" />
              </button>
              
              {/* Right Control Arrow */}
              <button 
                onClick={nextSlide}
                className="absolute -right-1 md:-right-6 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#4f080e] border border-gold-400/40 flex items-center justify-center text-gold-400 shadow-lg hover:bg-gold-500 hover:text-[#4f080e] hover:border-gold-500 transition-all duration-300 z-20 active:scale-95"
                aria-label="Next story"
              >
                <FaChevronRight className="text-xs md:text-base" />
              </button>
            </div>
          )}

          {/* Carousel Pagination Dots */}
          {successStories.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-5">
              {successStories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStoryIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentStoryIndex === index 
                      ? 'w-5 bg-[#4f080e]' 
                      : 'w-2 bg-[#4f080e]/20 hover:bg-[#4f080e]/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>      {/* CTA Join Section */}
      <section className="bg-gradient-to-br from-[#4f080e] via-[#3d060a] to-[#2b0306] py-6 md:py-24 px-4 md:px-8 text-center border-t-2 border-gold-500/30 text-white relative overflow-hidden">
        {/* Decorative background glow / ornaments */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)] pointer-events-none"></div>

        {/* Floating Stars */}
        <div className="absolute top-4 left-4 md:top-8 md:left-8 text-gold-500/20 text-sm md:text-xl animate-pulse">✨</div>
        <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 text-gold-500/20 text-sm md:text-xl animate-pulse">✨</div>

        <div className="max-w-3xl mx-auto flex flex-col gap-2 md:gap-6 relative z-10">
          <span className="text-gold-400 text-[9px] md:text-sm font-bold tracking-widest uppercase block">Masha Allah</span>
          <h2 className="text-base md:text-5xl font-serif font-extrabold leading-tight text-white drop-shadow-md">
            Begin Your <span className="text-gold-400 text-gold-gradient font-extrabold font-serif">Halal Journey</span> Today
          </h2>
          <p className="text-slate-200/90 max-w-xl mx-auto text-[10px] md:text-base leading-relaxed px-2">
            Register now to explore verified profiles and connect with practicing members matching your Islamic values.
          </p>
          <div className="mt-2.5 md:mt-6">
            <Link
              to="/register"
              className="inline-flex bg-gold-gradient text-crimson-950 font-extrabold px-5 py-2 md:px-12 md:py-4 rounded-full shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40 hover:scale-105 transition-all text-[10px] md:text-lg tracking-wide"
            >
              <span className="md:hidden">Get Started</span>
              <span className="hidden md:inline">Get Started – Free Registration</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

