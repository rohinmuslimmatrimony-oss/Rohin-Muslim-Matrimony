import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaHeart, FaShieldAlt, FaComments, FaCrown, FaUsers, FaArrowRight, FaMoon } from 'react-icons/fa';

const LandingPage = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="bg-cream-50 overflow-hidden">
      {/* Premium Hero Section */}
      <section className="relative bg-emerald-950 py-20 md:py-32 px-4 md:px-8 border-b border-emerald-900 overflow-hidden flex items-center justify-center">
        {/* Abstract Gold Background Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-gold-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-gold-600/10 rounded-full blur-[120px]"></div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            {/* Glowing Tag */}
            <div className="inline-flex items-center gap-1.5 self-start bg-emerald-900/50 border border-emerald-700/50 text-gold-400 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md">
              <FaCrown className="text-[10px] animate-pulse-gold" /> Premium Muslim Matchmaking
            </div>

            <h1 className="text-white text-4xl md:text-6xl font-serif font-bold leading-tight">
              Find Your Perfect <br />
              <span className="text-gold-500 text-gold-gradient">Halal Life Partner</span>
            </h1>

            <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-lg">
              Welcome to the premier Islamic matrimony platform. We facilitate meaningful, respectful, and halal connections designed to bring families together in the shade of faith.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-gold-gradient text-emerald-950 font-bold text-center px-8 py-3.5 rounded-full shadow-lg shadow-gold-500/15 hover:shadow-gold-500/35 hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  Go to Dashboard <FaArrowRight />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-gold-gradient text-emerald-950 font-bold text-center px-8 py-3.5 rounded-full shadow-lg shadow-gold-500/15 hover:shadow-gold-500/35 hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    Register Free Account <FaArrowRight />
                  </Link>
                  <Link
                    to="/plans"
                    className="border border-slate-400 text-slate-100 hover:bg-emerald-900/20 hover:text-white font-semibold text-center px-8 py-3.5 rounded-full transition-all"
                  >
                    View Premium Tiers
                  </Link>
                </>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 border-t border-emerald-900/60 pt-8 mt-4 text-slate-400 text-xs tracking-wider uppercase font-semibold">
              <div>
                <span className="block text-2xl font-serif text-white font-bold">10,000+</span>
                <span>Active Users</span>
              </div>
              <div>
                <span className="block text-2xl font-serif text-white font-bold">98%</span>
                <span>Verified Matches</span>
              </div>
              <div>
                <span className="block text-2xl font-serif text-white font-bold">4.9 ★</span>
                <span>Trust Rating</span>
              </div>
            </div>
          </div>

          {/* Decorative Card Illustration */}
          <div className="lg:col-span-5 hidden lg:flex justify-center relative">
            {/* Background glowing frame */}
            <div className="w-80 h-[420px] rounded-3xl border border-gold-500/20 bg-emerald-900/20 absolute rotate-6 translate-x-4 translate-y-4 scale-95 opacity-55"></div>
            
            {/* Front card visual */}
            <div className="w-80 h-[420px] rounded-3xl glass-card-dark p-6 flex flex-col justify-between shadow-2xl relative border border-gold-500/30 animate-float">
              <div className="flex justify-between items-start">
                <FaMoon className="text-gold-400 text-2xl" />
                <span className="bg-gold-gradient text-emerald-950 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Elite Member</span>
              </div>

              <div className="flex flex-col gap-4 text-left">
                {/* Decorative User Circle */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-gold-500 to-yellow-300 p-0.5 shadow-xl shadow-gold-500/10">
                  <div className="w-full h-full rounded-full bg-emerald-950 flex items-center justify-center font-serif text-white font-bold text-xl">
                    S
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-white text-2xl font-serif font-bold">Sara Ahmed, <span className="font-sans font-light text-lg text-slate-300">28</span></h3>
                  <p className="text-gold-400 text-xs uppercase tracking-wider font-semibold">Chartered Accountant (CA)</p>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed italic border-l-2 border-gold-500 pl-3">
                  "Assalamu Alaikum. Looking for an ambitious, religious and respectful life partner who shares CA and Islamic morals..."
                </p>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <FaShieldAlt className="text-gold-500 text-sm" /> <span>Profiles mutually connected are 100% unlocked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Value Props */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-4 mb-16">
          <h2 className="text-slate-900 text-3xl md:text-4xl font-serif font-bold">
            Designed for Meaningful, Halal Connections
          </h2>
          <p className="text-slate-600">
            We focus on values, morals, and mutual respect rather than mindless swiping. Explore premium features built to ensure your privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-card p-8 rounded-2xl border border-emerald-950/5 flex flex-col items-center text-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-emerald-900/10 text-emerald-900 flex items-center justify-center text-2xl">
              <FaShieldAlt />
            </div>
            <h3 className="text-slate-900 text-xl font-bold font-serif">100% Privacy Lock</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Your contact details (phone, email) are kept securely locked. They are only shared when you mutually accept connection requests.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-8 rounded-2xl border border-emerald-950/5 flex flex-col items-center text-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-emerald-900/10 text-emerald-900 flex items-center justify-center text-2xl">
              <FaHeart />
            </div>
            <h3 className="text-slate-900 text-xl font-bold font-serif">Halal Matchmaking</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              We structure our profiles around Islamic principles, allowing users to search by Sect, religious dedication, and moral criteria.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-8 rounded-2xl border border-emerald-950/5 flex flex-col items-center text-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-emerald-900/10 text-emerald-900 flex items-center justify-center text-2xl">
              <FaCrown className="text-gold-500" />
            </div>
            <h3 className="text-slate-900 text-xl font-bold font-serif">Premium Tier Controls</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Enforce customizable limit gates. Free tier profiles views are gated, while Premium/Elite tiers enjoy full details and messaging.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Step Stepper */}
      <section className="bg-emerald-900/5 py-20 px-4 md:px-8 border-y border-emerald-900/10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-slate-900 text-3xl font-serif font-bold mb-16">How Rohin Muslim Matrimony Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-full bg-emerald-900 text-gold-400 font-bold flex items-center justify-center text-lg shadow-md border border-emerald-800">
                1
              </div>
              <h3 className="font-serif font-bold text-slate-900">Register Profile</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Create a free profile and fill in your education, profession, sect, and expectations.</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-full bg-emerald-900 text-gold-400 font-bold flex items-center justify-center text-lg shadow-md border border-emerald-800">
                2
              </div>
              <h3 className="font-serif font-bold text-slate-900">Explore Tiers</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Browse filtered matches by location, sect, and age range to find matching beliefs.</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-full bg-emerald-900 text-gold-400 font-bold flex items-center justify-center text-lg shadow-md border border-emerald-800">
                3
              </div>
              <h3 className="font-serif font-bold text-slate-900">Send Interest</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Send an Interest Request. If they accept, your connection is mutually established!</p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-full bg-gold-gradient text-emerald-950 font-bold flex items-center justify-center text-lg shadow-md border border-gold-400">
                4
              </div>
              <h3 className="font-serif font-bold text-slate-900">Unlock & Chat</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Upgrade to Premium to unlock bidiographic details and chat with your connections.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-4 mb-16">
          <h2 className="text-slate-900 text-3xl font-serif font-bold">Success Stories</h2>
          <p className="text-slate-600">Alhamdulillah, we have helped thousands of Muslims find their perfect matches. Read their heartwarming journeys.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-8 rounded-2xl text-left border border-emerald-950/5 flex flex-col justify-between">
            <p className="text-slate-700 italic leading-relaxed text-sm mb-6">
              "Rohin Muslim Matrimony was a blessing. I loved the privacy features. Not showing my phone number or full details to everyone gave me peace of mind. We connected on Premium, chatted for three weeks with family involvement, and got married last Shawwal. Jazakallah Khair!"
            </p>
            <div>
              <h4 className="font-serif font-bold text-slate-900">Fariha & Imran</h4>
              <span className="text-xs text-slate-400 uppercase tracking-widest">Connected in Hyderabad</span>
            </div>
          </div>

          <div className="glass-card p-8 rounded-2xl text-left border border-emerald-950/5 flex flex-col justify-between">
            <p className="text-slate-700 italic leading-relaxed text-sm mb-6">
              "As a doctor, my schedule is extremely busy. Using the advanced filters on the Elite plan allowed me to find highly educated, family-oriented Sunni profiles in Lucknow. The platform's values align completely with Islamic etiquette."
            </p>
            <div>
              <h4 className="font-serif font-bold text-slate-900">Dr. Khalid & Dr. Yasmin</h4>
              <span className="text-xs text-slate-400 uppercase tracking-widest">Connected in Delhi</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Join Section */}
      <section className="bg-emerald-950 py-20 px-4 md:px-8 text-center border-t border-emerald-900 text-white relative">
        <div className="max-w-3xl mx-auto flex flex-col gap-6 relative z-10">
          <h2 className="text-4xl font-serif font-bold">Begin Your Journey Today</h2>
          <p className="text-slate-300 max-w-lg mx-auto text-sm leading-relaxed">
            Register now to explore verified profiles and connect with premium practicing members matching your Islamic values.
          </p>
          <div className="mt-4">
            <Link
              to="/register"
              className="inline-flex bg-gold-gradient text-emerald-950 font-bold px-10 py-4 rounded-full shadow-lg shadow-gold-500/10 hover:shadow-gold-500/30 hover:scale-105 transition-all text-base"
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
