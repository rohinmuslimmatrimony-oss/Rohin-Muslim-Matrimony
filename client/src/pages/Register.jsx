import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  FaEnvelope, FaLock, FaUser, FaCity, FaCalendarAlt, FaVenusMars
} from 'react-icons/fa';
import logo3 from '../assets/logo3.png';

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
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-16 relative bg-cream-50 overflow-hidden">
      {/* Background Glows matching LandingPage */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-gold-500/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-gold-600/5 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden p-0.5 bg-gradient-to-r from-gold-500/40 via-gold-400/20 to-gold-500/40 border border-gold-500/30">
        <div className="bg-white rounded-[22px] overflow-hidden p-8 md:p-10 relative">
          
          {/* Top Arch Cherry Red Header Box */}
          <div className="bg-[#4f080e] rounded-2xl px-6 py-5 border border-gold-500/20 text-center mb-8 relative">
            {/* Corner Stars */}
            <div className="absolute top-2 left-2 text-gold-500/25 text-xs">✨</div>
            <div className="absolute top-2 right-2 text-gold-500/25 text-xs">✨</div>
            <div className="absolute bottom-2 left-2 text-gold-500/25 text-xs">✨</div>
            <div className="absolute bottom-2 right-2 text-gold-500/25 text-xs">✨</div>

            <img src={logo3} alt="Rohin Muslim Matrimony Logo" className="h-12 w-auto object-contain mx-auto mb-2" />
            <h2 className="text-white text-xl md:text-2xl font-serif font-extrabold">Create Free Account</h2>
            <p className="text-gold-400 text-[10px] md:text-xs font-bold tracking-widest uppercase mt-1">10-Second Fast Registration</p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-700 text-xs font-semibold p-3.5 rounded-xl border border-red-200 mb-6 animate-fadeIn">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Single-Step Form */}
          <form onSubmit={handleSubmit} className="space-y-4.5 text-left">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FaUser className="text-sm" /></span>
                <input 
                  type="text" 
                  required 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="e.g. Shaik Habib" 
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm font-semibold text-slate-800" 
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FaEnvelope className="text-sm" /></span>
                <input 
                  type="email" 
                  required 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="you@domain.com" 
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm font-semibold text-slate-800" 
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FaLock className="text-sm" /></span>
                <input 
                  type="password" 
                  required 
                  minLength={6} 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="Minimum 6 characters" 
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm font-semibold text-slate-800" 
                />
              </div>
            </div>

            {/* Gender and Age Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Gender</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FaVenusMars className="text-sm" /></span>
                  <select 
                    name="gender" 
                    value={formData.gender} 
                    onChange={handleChange} 
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm font-semibold text-slate-800 appearance-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Age</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FaCalendarAlt className="text-sm" /></span>
                  <input 
                    type="number" 
                    required 
                    min={18} 
                    max={70} 
                    name="age" 
                    value={formData.age} 
                    onChange={handleChange} 
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm font-semibold text-slate-800" 
                  />
                </div>
              </div>
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">City</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FaCity className="text-sm" /></span>
                <input 
                  type="text" 
                  required 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange} 
                  placeholder="e.g. Hyderabad, Vijayawada" 
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm font-semibold text-slate-800" 
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full bg-gold-gradient text-[#4f080e] font-extrabold py-3.5 rounded-2xl shadow-lg hover:shadow-gold-500/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-75 disabled:scale-100"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-[#4f080e] border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Create Free Profile'
                )}
              </button>
            </div>
          </form>

          {/* Redirect */}
          <p className="text-slate-500 text-xs font-semibold mt-8 text-center uppercase tracking-wide">
            Already registered?{' '}
            <Link to="/login" className="text-crimson-800 hover:text-crimson-600 transition-colors font-extrabold">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
