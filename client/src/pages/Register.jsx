import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  FaEnvelope, FaLock, FaUser, FaCity, FaCalendarAlt, FaVenusMars, FaEye, FaEyeSlash
} from 'react-icons/fa';
import logo3 from '../assets/logo3.png';
import islamicBg from '../assets/islamic_bg_login.png';

const Register = () => {
  const { register, user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Form States (6 essential registration fields + default matching values)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    gender: 'male',
    age: 25,
    city: '',
    // Preset defaults for backend
    profileCreatedBy: 'Self',
    maritalStatus: 'Never Married',
    height: "5'6\"",
    motherTongue: 'Urdu',
    sect: 'Sunni',
    namazFrequency: 'Always Praying',
    waliContact: '',
    fatherOccupation: '',
    motherOccupation: '',
    siblingsCount: 0,
    profession: '',
    education: '',
    about: '',
    partnerAgeRange: '20-30',
    partnerSect: 'No Preference',
    partnerEducation: "Doesn't Matter"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    
    const res = await register(formData);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(res.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <>
      {/* ===================== MOBILE VIEW ===================== */}
      <div className="flex md:hidden flex-col items-center justify-start h-[100dvh] bg-[#FAF8F5] relative px-4 overflow-hidden font-sans z-0">
        
        {/* Bottom Decorative Section */}
        <div className="absolute bottom-0 left-0 w-full z-0 flex flex-col justify-end h-[16dvh] pointer-events-none overflow-hidden">
          {/* Custom SVG Faint Mosque Silhouettes */}
          <div className="absolute bottom-[3vh] left-0 w-full opacity-10 flex justify-center">
            <svg viewBox="0 0 1000 200" className="w-[120%] h-[9vh] text-[#C7A543]" fill="currentColor" preserveAspectRatio="none">
              <path d="M50,200 L50,120 L70,100 L70,80 L80,50 L90,80 L90,100 L110,120 L110,200 Z M250,200 L250,150 L270,130 L300,130 L320,150 L320,200 Z M450,200 L450,80 L470,60 L470,40 L480,10 L490,40 L490,60 L510,80 L510,200 Z M650,200 L650,120 L670,100 L670,80 L680,50 L690,80 L690,100 L710,120 L710,200 Z M850,200 L850,150 L870,130 L900,130 L920,150 L920,200 Z" />
            </svg>
          </div>
          
          {/* The Shallow Downward Curve SVG */}
          <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-[5.5vh] relative z-10 drop-shadow-md">
            <path fill="#C7A543" d="M0,100 L0,20 Q500,80 1000,20 L1000,100 Z" />
            <path fill="#911326" d="M0,100 L0,25 Q500,85 1000,25 L1000,100 Z" />
          </svg>
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full flex flex-col items-center max-w-[330px] mx-auto pt-4">
          
          {/* Logo */}
          <Link to="/" className="w-full flex justify-center mb-2">
            <img src={logo3} alt="Rohin Muslim Matrimony Logo" className="h-[45px] w-auto object-contain drop-shadow-sm" />
          </Link>

          {/* Heading */}
          <h2 className="text-[#A11B32] text-[16px] font-bold font-serif tracking-wide">Create Your Free Account</h2>
          
          {/* Decorative subtitle line */}
          <div className="flex items-center justify-center w-full max-w-[180px] mx-auto mt-1 mb-2 opacity-80">
            <div className="h-[1px] bg-[#D4AF37]/50 flex-1"></div>
            <span className="mx-2 text-[#C7A543] font-medium text-[8px] whitespace-nowrap">Quick • Easy • Trusted</span>
            <div className="h-[1px] bg-[#D4AF37]/50 flex-1"></div>
          </div>

          {/* Registration Card */}
          <div className="w-full bg-[#FCFBF7] border border-[#D4AF37]/40 rounded-[16px] px-3 py-2.5 pt-3.5 shadow-sm relative z-20">
            {/* Heart on top border decoration */}
            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 flex items-center bg-[#FAF8F5] px-2">
              <svg className="w-[14px] h-[14px] text-[#A11B32]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>

            {errorMsg && (
              <div className="text-[#A11B32] text-[9px] font-semibold text-center mb-1 bg-red-50 p-1 rounded">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-[5px]">
              {/* Full Name */}
              <div>
                <label className="text-[#5C4E4E] text-[9px] font-medium ml-0.5">Full Name</label>
                <div className="relative flex items-center bg-transparent border border-[#D4AF37]/50 rounded-[8px] overflow-hidden focus-within:border-[#D4AF37] h-[30px]">
                  <span className="absolute left-2.5 text-[#D4AF37]"><FaUser className="text-[11px]" /></span>
                  <input type="text" required name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Shaik Habib" className="w-full h-full pl-[26px] pr-2 bg-transparent text-[11px] text-[#5C4E4E] focus:outline-none placeholder-[#A39B9B]" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-[#5C4E4E] text-[9px] font-medium ml-0.5">Email Address</label>
                <div className="relative flex items-center bg-transparent border border-[#D4AF37]/50 rounded-[8px] overflow-hidden focus-within:border-[#D4AF37] h-[30px]">
                  <span className="absolute left-2.5 text-[#D4AF37]"><FaEnvelope className="text-[11px]" /></span>
                  <input type="email" required name="email" value={formData.email} onChange={handleChange} placeholder="you@domain.com" className="w-full h-full pl-[26px] pr-2 bg-transparent text-[11px] text-[#5C4E4E] focus:outline-none placeholder-[#A39B9B]" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-[#5C4E4E] text-[9px] font-medium ml-0.5">Password</label>
                <div className="relative flex items-center bg-transparent border border-[#D4AF37]/50 rounded-[8px] overflow-hidden focus-within:border-[#D4AF37] h-[30px]">
                  <span className="absolute left-2.5 text-[#D4AF37]"><FaLock className="text-[11px]" /></span>
                  <input type={showPassword ? 'text' : 'password'} required minLength={6} name="password" value={formData.password} onChange={handleChange} placeholder="Minimum 6 characters" className="w-full h-full pl-[26px] pr-7 bg-transparent text-[11px] text-[#5C4E4E] focus:outline-none placeholder-[#A39B9B]" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 text-[#D4AF37]">
                    {showPassword ? <FaEyeSlash className="text-[12px]" /> : <FaEye className="text-[12px]" />}
                  </button>
                </div>
              </div>

              {/* Gender and Age */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#5C4E4E] text-[9px] font-medium ml-0.5">Gender</label>
                  <div className="relative flex items-center bg-transparent border border-[#D4AF37]/50 rounded-[8px] overflow-hidden focus-within:border-[#D4AF37] h-[30px]">
                    <span className="absolute left-2.5 text-[#D4AF37]"><FaVenusMars className="text-[11px]" /></span>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full h-full pl-[26px] pr-1 bg-transparent text-[11px] font-bold text-[#5C4E4E] focus:outline-none appearance-none">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    <svg className="absolute right-1.5 w-2.5 h-2.5 text-[#D4AF37] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                <div>
                  <label className="text-[#5C4E4E] text-[9px] font-medium ml-0.5">Age</label>
                  <div className="relative flex items-center bg-transparent border border-[#D4AF37]/50 rounded-[8px] overflow-hidden focus-within:border-[#D4AF37] h-[30px]">
                    <span className="absolute left-2.5 text-[#D4AF37]"><FaCalendarAlt className="text-[11px]" /></span>
                    <input type="number" required min={18} max={70} name="age" value={formData.age} onChange={handleChange} className="w-full h-full pl-[26px] pr-1 bg-transparent text-[11px] font-bold text-[#5C4E4E] focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* City */}
              <div>
                <label className="text-[#5C4E4E] text-[9px] font-medium ml-0.5">City</label>
                <div className="relative flex items-center bg-transparent border border-[#D4AF37]/50 rounded-[8px] overflow-hidden focus-within:border-[#D4AF37] h-[30px]">
                  <span className="absolute left-2.5 text-[#D4AF37]"><FaCity className="text-[11px]" /></span>
                  <input type="text" required name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Hyderabad, Vijayawada" className="w-full h-full pl-[26px] pr-2 bg-transparent text-[11px] text-[#5C4E4E] focus:outline-none placeholder-[#A39B9B]" />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-1">
                <button type="submit" disabled={isSubmitting || loading} className="w-full bg-[#A11B32] hover:bg-[#8F172B] text-white font-semibold py-[8px] rounded-[10px] shadow-sm transition-all flex items-center justify-center text-[12px] tracking-wide">
                  {isSubmitting ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <>Create Free Profile <span className="ml-1 text-[12px] leading-none">→</span></>}
                </button>
              </div>
            </form>

            <p className="text-[#5C4E4E] text-[9px] font-medium text-center mt-1.5 mb-0">
              Already registered? <Link to="/login" className="text-[#A11B32] font-bold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>

      {/* ===================== DESKTOP VIEW ===================== */}
      <div 
        className="hidden md:flex h-[calc(100vh-85px)] items-center justify-center px-3 sm:px-4 relative bg-cover bg-center overflow-hidden"
        style={{ 
          backgroundImage: `linear-gradient(rgba(20, 1, 3, 0.4), rgba(20, 1, 3, 0.55)), url(${islamicBg})`,
          backgroundAttachment: 'scroll' 
        }}
      >
        {/* Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-gold-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-gold-600/10 rounded-full blur-[120px]"></div>

        {/* Register Glass Card */}
        <div className="w-full max-w-md bg-gradient-to-b from-[#850f1d]/95 to-[#240307]/98 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.9),_0_0_30px_rgba(212,175,55,0.25)] border-2 border-[#d4af37] p-4 sm:p-5 relative z-10">
          
          {/* Header Text */}
          <div className="text-center mb-2 sm:mb-2.5">
            <h2 className="text-[#ffd666] text-base sm:text-lg md:text-xl font-bold font-serif drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Create Free Account</h2>
            <p className="text-white/80 text-[7.5px] sm:text-[9px] font-bold tracking-widest uppercase mt-0.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">10-Second Fast Registration</p>
          </div>

          {errorMsg && (
            <div className="bg-red-950/65 text-red-200 text-xs font-semibold p-1.5 rounded-xl border border-red-500/30 mb-2 animate-fadeIn">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Single-Step Form */}
          <form onSubmit={handleSubmit} className="space-y-1.5 sm:space-y-2 text-left">
            
            {/* Full Name */}
            <div className="space-y-0.5">
              <label className="text-[#ffd666] text-[9px] sm:text-xs font-bold uppercase tracking-wider pl-1 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)]">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#ffd666]"><FaUser className="text-xs sm:text-sm" /></span>
                <input 
                  type="text" 
                  required 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="e.g. Shaik Habib" 
                  className="w-full pl-10 pr-4 py-1 sm:py-1.5 rounded-xl bg-black/35 border border-gold-500/35 hover:border-gold-500/60 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 focus:outline-none transition-all text-xs sm:text-sm text-white placeholder-white/40 font-bold shadow-inner focus:shadow-[0_0_10px_rgba(212,175,55,0.3)]" 
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-0.5">
              <label className="text-[#ffd666] text-[9px] sm:text-xs font-bold uppercase tracking-wider pl-1 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)]">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#ffd666]"><FaEnvelope className="text-xs sm:text-sm" /></span>
                <input 
                  type="email" 
                  required 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="you@domain.com" 
                  className="w-full pl-10 pr-4 py-1 sm:py-1.5 rounded-xl bg-black/35 border border-gold-500/35 hover:border-gold-500/60 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 focus:outline-none transition-all text-xs sm:text-sm text-white placeholder-white/40 font-bold shadow-inner focus:shadow-[0_0_10px_rgba(212,175,55,0.3)]" 
                />
              </div>
            </div>

            {/* Password with visibility toggle */}
            <div className="space-y-0.5">
              <label className="text-[#ffd666] text-[9px] sm:text-xs font-bold uppercase tracking-wider pl-1 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)]">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#ffd666]"><FaLock className="text-xs sm:text-sm" /></span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  minLength={6} 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="Minimum 6 characters" 
                  className="w-full pl-10 pr-10 py-1 sm:py-1.5 rounded-xl bg-black/35 border border-gold-500/35 hover:border-gold-500/60 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 focus:outline-none transition-all text-xs sm:text-sm text-white placeholder-white/40 font-bold shadow-inner focus:shadow-[0_0_10px_rgba(212,175,55,0.3)]" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#ffd666]/70 hover:text-[#ffd666] transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash className="text-xs sm:text-sm" /> : <FaEye className="text-xs sm:text-sm" />}
                </button>
              </div>
            </div>

            {/* Gender and Age Grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div className="space-y-0.5">
                <label className="text-[#ffd666] text-[9px] sm:text-xs font-bold uppercase tracking-wider pl-1 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)]">Gender</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#ffd666]"><FaVenusMars className="text-xs sm:text-sm" /></span>
                  <select 
                    name="gender" 
                    value={formData.gender} 
                    onChange={handleChange} 
                    className="w-full pl-10 pr-4 py-1 sm:py-1.5 rounded-xl bg-black/35 border border-gold-500/35 hover:border-gold-500/60 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 focus:outline-none transition-all text-xs sm:text-sm text-white placeholder-white/45 font-bold appearance-none shadow-inner focus:shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                  >
                    <option className="bg-[#1e0205] text-white font-bold" value="male">Male</option>
                    <option className="bg-[#1e0205] text-white font-bold" value="female">Female</option>
                  </select>
                </div>
              </div>
              <div className="space-y-0.5">
                <label className="text-[#ffd666] text-[9px] sm:text-xs font-bold uppercase tracking-wider pl-1 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)]">Age</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#ffd666]"><FaCalendarAlt className="text-xs sm:text-sm" /></span>
                  <input 
                    type="number" 
                    required 
                    min={18} 
                    max={70} 
                    name="age" 
                    value={formData.age} 
                    onChange={handleChange} 
                    className="w-full pl-10 pr-4 py-1 sm:py-1.5 rounded-xl bg-black/35 border border-gold-500/35 hover:border-gold-500/60 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 focus:outline-none transition-all text-xs sm:text-sm text-white placeholder-white/40 font-bold shadow-inner focus:shadow-[0_0_10px_rgba(212,175,55,0.3)]" 
                  />
                </div>
              </div>
            </div>

            {/* City */}
            <div className="space-y-0.5">
              <label className="text-[#ffd666] text-[9px] sm:text-xs font-bold uppercase tracking-wider pl-1 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)]">City</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#ffd666]"><FaCity className="text-xs sm:text-sm" /></span>
                <input 
                  type="text" 
                  required 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange} 
                  placeholder="e.g. Hyderabad, Vijayawada" 
                  className="w-full pl-10 pr-4 py-1 sm:py-1.5 rounded-xl bg-black/35 border border-gold-500/35 hover:border-gold-500/60 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 focus:outline-none transition-all text-xs sm:text-sm text-white placeholder-white/40 font-bold shadow-inner focus:shadow-[0_0_10px_rgba(212,175,55,0.3)]" 
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full bg-gold-gradient text-crimson-950 font-bold py-1.5 sm:py-2 rounded-xl shadow-lg hover:shadow-gold-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 mt-0.5 sm:mt-1 text-xs sm:text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-crimson-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Create Free Profile'
                )}
              </button>
            </div>
          </form>

          {/* Redirect */}
          <p className="text-white/85 text-[10px] sm:text-sm text-center mt-2 sm:mt-2.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            Already registered?{' '}
            <Link to="/login" className="text-[#ffd666] font-bold hover:underline hover:text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)]">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
