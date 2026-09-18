import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaChild, FaShieldAlt, FaExclamationTriangle, FaEnvelope, FaHandshake, FaBan } from 'react-icons/fa';
import brandLogo from '../assets/brand-logo.png';

const Section = ({ icon: Icon, title, children, highlight }) => (
  <div className={`mb-6 rounded-xl p-4 md:p-8 border ${highlight ? 'bg-red-900/20 border-red-500/30' : 'bg-white/5 border-gold-500/10'}`}>
    <h2 className={`text-base md:text-xl font-bold font-serif mb-4 flex items-start gap-3 flex-wrap ${highlight ? 'text-red-400' : 'text-gold-400'}`}>
      {Icon && (
        <span className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-sm shrink-0 border-2 mt-0.5 ${highlight ? 'bg-red-900/40 border-red-500/50 text-red-400' : 'bg-[#4f080e] border-gold-500/50 text-gold-400'}`}>
          <Icon />
        </span>
      )}
      <span className="flex-1">{title}</span>
    </h2>
    <div className="text-slate-300 text-sm md:text-base leading-relaxed">{children}</div>
  </div>
);

const ChildSafetyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Child Safety Standards | Rohin Muslim Matrimony';
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
      <div className="bg-gradient-to-r from-[#4f080e]/40 via-[#7a0e19]/30 to-[#4f080e]/40 border-b border-gold-500/20 py-10 md:py-16 px-4 text-center">
        <div className="flex justify-center mb-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gold-400/10 border border-gold-500/30 flex items-center justify-center">
              <FaChild className="text-gold-400 text-3xl" />
            </div>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 border-2 border-[#1a0408] flex items-center justify-center">
              <FaShieldAlt className="text-white text-[8px]" />
            </span>
          </div>
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold font-serif text-gold-400 mb-2">Child Safety Standards</h1>
        <p className="text-slate-400 text-sm md:text-base">
          Effective Date: <span className="text-gold-300 font-semibold">September 18, 2026</span>
        </p>
        <p className="text-slate-300 text-sm mt-3 max-w-2xl mx-auto leading-relaxed">
          <strong className="text-white">Rohin Muslim Matrimony</strong>, operated by{' '}
          <strong className="text-gold-400">WebnApp Studio</strong>, is committed to maintaining a safe
          environment and strictly prohibits any form of Child Sexual Abuse and Exploitation (CSAE).
        </p>

        {/* Zero Tolerance Badge */}
        <div className="inline-flex items-center gap-2 mt-5 bg-red-900/40 border border-red-500/40 rounded-full px-5 py-2 text-red-300 text-sm font-bold">
          <FaBan className="text-red-400" />
          ZERO TOLERANCE POLICY
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-14 space-y-6">

        {/* Zero Tolerance Section */}
        <Section icon={FaBan} title="Zero-Tolerance Policy" highlight>
          <p className="mb-4 text-slate-200 font-semibold">
            Rohin Muslim Matrimony strictly prohibits:
          </p>
          <ul className="space-y-2 text-slate-300">
            {[
              'Child Sexual Abuse and Exploitation (CSAE)',
              'Child sexual abuse material (CSAM)',
              'Sexual content involving minors',
              'Grooming or sexual solicitation of minors',
              'Sexual exploitation or trafficking of children',
              'Any attempt to arrange or facilitate sexual contact with a minor',
              'Sharing, requesting, uploading, storing, or distributing CSAM',
              'Any other activity that sexually exploits or endangers children',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1 w-4 h-4 rounded-full bg-red-600/30 border border-red-500/50 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 block" />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-red-300 font-semibold border-l-2 border-red-500 pl-4">
            We do not permit users to use Rohin Muslim Matrimony to create, share, request, distribute,
            or promote content involving the sexual exploitation or abuse of children.
          </p>
        </Section>

        {/* Age & Child Safety */}
        <Section icon={FaShieldAlt} title="Age and Child Safety">
          <p className="mb-3">
            Rohin Muslim Matrimony is intended for <strong className="text-white">adults seeking matrimonial relationships</strong>.
            Users must meet the minimum age requirement applicable to the service.
          </p>
          <p>
            We take reports involving child safety seriously and may take appropriate action, including:
          </p>
          <ul className="mt-3 space-y-2 text-slate-400">
            {[
              'Removing content that violates our standards',
              'Restricting or terminating accounts involved in violations',
              'Preserving relevant information where legally permitted',
              'Reporting suspected CSAE or CSAM to appropriate authorities or organizations when required',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold-400 shrink-0 block" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        {/* Reporting */}
        <Section icon={FaExclamationTriangle} title="Reporting Child Safety Concerns">
          <p className="mb-4">
            If you become aware of suspected CSAE, CSAM, grooming, exploitation, or any other child-safety
            concern involving Rohin Muslim Matrimony, please report it to our child safety team immediately.
          </p>
          <div className="bg-[#4f080e]/30 border border-gold-500/25 rounded-xl p-5 space-y-3">
            <p className="text-gold-400 font-bold text-base flex items-center gap-2">
              <FaEnvelope className="text-gold-400" />
              Child Safety Contact
            </p>
            <p className="text-slate-200 font-semibold">Rohin Muslim Matrimony Child Safety Team</p>
            <p>
              ✉️{' '}
              <a
                href="mailto:rohinmuslimmatrimony@gmail.com"
                className="text-gold-400 hover:text-gold-300 transition-colors underline underline-offset-2"
              >
                rohinmuslimmatrimony@gmail.com
              </a>
            </p>
          </div>
          <p className="mt-4 text-slate-400 italic">
            When reporting an issue, please provide the relevant profile, content, or other information
            that can help us investigate the concern.{' '}
            <strong className="text-red-400 not-italic">Do not send or redistribute suspected CSAM.</strong>
          </p>
        </Section>

        {/* Enforcement */}
        <Section icon={FaShieldAlt} title="Enforcement">
          <p className="mb-4">
            We investigate reports involving child safety and may take action against accounts or content
            that violate these standards.
          </p>
          <p className="mb-3 text-slate-200 font-semibold">Depending on the circumstances, enforcement may include:</p>
          <ul className="space-y-2 text-slate-400">
            {[
              'Removal of violating content',
              'Suspension or termination of user accounts',
              'Restriction of platform access',
              'Reporting to relevant authorities or organizations where appropriate or legally required',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold-400 shrink-0 block" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        {/* Cooperation with Authorities */}
        <Section icon={FaHandshake} title="Cooperation With Authorities">
          <p>
            Rohin Muslim Matrimony will cooperate with appropriate law-enforcement and child-safety
            authorities regarding suspected child sexual abuse and exploitation, subject to applicable
            laws and legal requirements.
          </p>
        </Section>

        {/* Contact */}
        <Section icon={FaEnvelope} title="Contact">
          <p className="mb-4">
            For child safety concerns or questions regarding these standards, contact:
          </p>
          <div className="bg-[#4f080e]/20 border border-gold-500/20 rounded-xl p-5 space-y-2">
            <p className="text-white font-bold text-base">Rohin Muslim Matrimony Child Safety Team</p>
            <p>
              ✉️{' '}
              <a
                href="mailto:rohinmuslimmatrimony@gmail.com"
                className="text-gold-400 hover:text-gold-300 transition-colors"
              >
                rohinmuslimmatrimony@gmail.com
              </a>
            </p>
          </div>
          <p className="mt-4 text-slate-500 text-sm italic">
            These Child Safety Standards are publicly available and apply to users of Rohin Muslim
            Matrimony globally.
          </p>
        </Section>

      </div>

      {/* Footer Links */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 pb-12">
        <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
          <Link to="/terms" className="hover:text-gold-400 transition-colors">Terms &amp; Conditions</Link>
          <span>•</span>
          <Link to="/privacy-policy" className="hover:text-gold-400 transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link to="/data-deletion" className="hover:text-gold-400 transition-colors">Data Deletion Request</Link>
          <span>•</span>
          <Link to="/" className="hover:text-gold-400 transition-colors">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default ChildSafetyPage;
