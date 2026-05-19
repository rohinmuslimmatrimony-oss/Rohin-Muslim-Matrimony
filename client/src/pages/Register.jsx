import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  FaMoon, FaEnvelope, FaLock, FaUser, FaCompass, 
  FaChevronRight, FaChevronLeft, FaPhoneAlt, FaBriefcase, FaGraduationCap
} from 'react-icons/fa';
import logo3 from '../assets/logo3.png';

const Register = () => {
  const { register, user, loading } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Form States (Detailed E2E Data)
  const [formData, setFormData] = useState({
    // Step 1: Account
    email: '',
    password: '',
    profileCreatedBy: 'Self',
    // Step 2: Personal
    name: '',
    age: 25,
    gender: 'male',
    maritalStatus: 'Never Married',
    height: "5'6\"",
    motherTongue: 'Urdu',
    // Step 3: Religious & Family
    sect: 'Sunni',
    namazFrequency: 'Always Praying',
    waliContact: '',
    fatherOccupation: '',
    motherOccupation: '',
    siblingsCount: 0,
    // Step 4: Professional & Preferences
    profession: '',
    education: '',
    city: '',
    about: '',
    partnerAgeRange: '20-30',
    partnerSect: 'No Preference',
    partnerEducation: "Doesn't Matter"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 4) {
      nextStep();
      return;
    }

    setIsSubmitting(true);
    // Submit all 4 steps of data
    const res = await register(formData);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 relative bg-cream-50 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[10%] left-[10%] w-80 h-80 bg-crimson-900/5 rounded-full blur-[80px]"></div>
      <div className="absolute bottom-[10%] right-[10%] w-80 h-80 bg-gold-500/5 rounded-full blur-[80px]"></div>

      <div className="w-full max-w-2xl glass-card rounded-3xl shadow-xl border border-crimson-950/5 overflow-hidden p-8 md:p-10 relative z-10">
        {/* Stepper Progress Bar */}
        <div className="flex justify-between items-center mb-8 max-w-sm mx-auto relative">
          {/* Progress Line Background */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -z-10 -translate-y-1/2 rounded-full"></div>
          {/* Active Progress Line */}
          <div 
            className="absolute top-1/2 left-0 h-1 bg-crimson-800 -z-10 -translate-y-1/2 rounded-full transition-all duration-300"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          ></div>
          
          {[1, 2, 3, 4].map((stepNum) => (
            <div
              key={stepNum}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                step >= stepNum
                  ? 'bg-crimson-950 text-gold-400 border-crimson-900 shadow-md shadow-crimson-900/20'
                  : 'bg-white text-slate-400 border-slate-200'
              }`}
            >
              {stepNum}
            </div>
          ))}
        </div>

        {/* Headings */}
        <div className="flex flex-col items-center gap-2 mb-6 text-center">
          <img src={logo3} alt="Rohin Muslim Matrimony Logo" className="h-16 w-auto object-contain" />
          <h2 className="text-slate-900 text-3xl font-bold font-serif mt-2">Create Free Profile</h2>
          <p className="text-slate-500 text-sm font-medium">
            {step === 1 && 'Step 1: Account Setup'}
            {step === 2 && 'Step 2: Personal Details'}
            {step === 3 && 'Step 3: Religious & Family Background'}
            {step === 4 && 'Step 4: Professional & Preferences'}
          </p>
        </div>

        {/* Stepper Form */}
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          
          {/* STEP 1: ACCOUNT SETUP */}
          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-1.5">
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FaEnvelope /></span>
                  <input type="email" required name="email" value={formData.email} onChange={handleChange} placeholder="you@domain.com" className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FaLock /></span>
                  <input type="password" required minLength={6} name="password" value={formData.password} onChange={handleChange} placeholder="Minimum 6 characters" className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Profile Created By</label>
                <select name="profileCreatedBy" value={formData.profileCreatedBy} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm">
                  <option value="Self">Self</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: PERSONAL BIO */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-1.5">
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FaUser /></span>
                  <input type="text" required name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Age</label>
                  <input type="number" required min={18} max={70} name="age" value={formData.age} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5 col-span-1">
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Height</label>
                  <select name="height" value={formData.height} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm">
                    <option value="5'0&quot;">5'0"</option>
                    <option value="5'2&quot;">5'2"</option>
                    <option value="5'4&quot;">5'4"</option>
                    <option value="5'6&quot;">5'6"</option>
                    <option value="5'8&quot;">5'8"</option>
                    <option value="5'10&quot;">5'10"</option>
                    <option value="6'0&quot;">6'0"</option>
                    <option value="6'2&quot;">6'2"+</option>
                  </select>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Marital Status</label>
                  <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm">
                    <option value="Never Married">Never Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Awaiting Divorce">Awaiting Divorce</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Mother Tongue</label>
                <input type="text" required name="motherTongue" value={formData.motherTongue} onChange={handleChange} placeholder="e.g. Urdu, Hindi, English" className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
              </div>
            </div>
          )}

          {/* STEP 3: RELIGION & FAMILY */}
          {step === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Sect</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FaCompass /></span>
                    <select name="sect" value={formData.sect} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm">
                      <option value="Sunni">Sunni</option>
                      <option value="Shia">Shia</option>
                      <option value="Sufi">Sufi</option>
                      <option value="Other">Other</option>
                      <option value="No Preference">No Preference</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Namaz Frequency</label>
                  <select name="namazFrequency" value={formData.namazFrequency} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm">
                    <option value="Always Praying">Always Praying</option>
                    <option value="Usually Praying">Usually Praying</option>
                    <option value="Sometimes Praying">Sometimes Praying</option>
                    <option value="Only Eid/Jumma">Only Eid/Jumma</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Father's Occ.</label>
                  <input type="text" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} placeholder="e.g. Business" className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Mother's Occ.</label>
                  <input type="text" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} placeholder="e.g. Homemaker" className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Siblings Count</label>
                  <input type="number" min={0} name="siblingsCount" value={formData.siblingsCount} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Wali (Chaperone) No.</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FaPhoneAlt className="text-xs" /></span>
                    <input type="text" name="waliContact" value={formData.waliContact} onChange={handleChange} placeholder="Optional Chaperone Contact" className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: WORK & PREFERENCES */}
          {step === 4 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Profession</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FaBriefcase /></span>
                    <input type="text" required name="profession" value={formData.profession} onChange={handleChange} placeholder="e.g. Doctor" className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">Education</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FaGraduationCap /></span>
                    <input type="text" required name="education" value={formData.education} onChange={handleChange} placeholder="e.g. MBBS" className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">City</label>
                <input type="text" required name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Hyderabad" className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm" />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-0.5">About You & Preferences</label>
                <textarea required rows={3} name="about" value={formData.about} onChange={handleChange} placeholder="Describe yourself and what you look for in a partner..." className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-slate-200 focus:border-gold-500 focus:outline-none transition-all text-sm resize-none" />
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex gap-4 pt-6 mt-4 border-t border-crimson-900/10">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 border-2 border-crimson-900 text-crimson-950 font-bold py-3.5 rounded-2xl hover:bg-crimson-50 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <FaChevronLeft className="text-xs" /> Back
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="flex-[2] bg-gold-gradient text-crimson-950 font-bold py-3.5 rounded-2xl shadow-lg hover:shadow-gold-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:scale-100"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-crimson-950 border-t-transparent rounded-full animate-spin"></span>
              ) : step === 4 ? (
                'Create Profile (Free)'
              ) : (
                <>Next Step <FaChevronRight className="text-xs" /></>
              )}
            </button>
          </div>
        </form>

        {/* Redirect */}
        <p className="text-slate-500 text-sm mt-8 text-center">
          Already registered?{' '}
          <Link to="/login" className="text-crimson-800 font-bold hover:text-crimson-600 transition-colors">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
