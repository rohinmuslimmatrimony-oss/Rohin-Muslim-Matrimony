import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import brandLogo from '../assets/brand-logo.png';

const Section = ({ number, title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg md:text-xl font-bold text-gold-400 font-serif mb-3 flex items-center gap-3">
      <span className="text-gold-400 bg-[#4f080e] border-2 border-gold-500/50 rounded-full min-w-[2rem] min-h-[2rem] w-8 h-8 flex items-center justify-center text-sm font-extrabold shrink-0">
        {number}
      </span>
      {title}
    </h2>
    <div className="text-slate-300 text-sm md:text-base leading-relaxed pl-11">{children}</div>
  </div>
);

const PrivacyPolicyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Privacy Policy | Rohin Muslim Matrimony';
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
      <div className="bg-gradient-to-r from-[#4f080e]/40 via-[#7a0e19]/30 to-[#4f080e]/40 border-b border-gold-500/20 py-10 md:py-14 px-4 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-gold-400/10 border border-gold-500/30 flex items-center justify-center">
            <FaShieldAlt className="text-gold-400 text-2xl" />
          </div>
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold font-serif text-gold-400 mb-2">Privacy Policy</h1>
        <p className="text-slate-400 text-sm md:text-base">Effective Date: <span className="text-gold-300 font-semibold">August 31, 2026</span></p>
        <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
          Welcome to <strong className="text-white">Rohin Muslim Matrimony</strong>. We respect your privacy and are committed to protecting your personal information.
        </p>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-14">
        <div className="bg-white/5 border border-gold-500/15 rounded-2xl p-6 md:p-10 backdrop-blur-sm">

          <Section number="1" title="Information We Collect">
            <p className="mb-2">We may collect the following information when you register or use our services:</p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400">
              <li>Name and profile details</li>
              <li>Mobile number and email address</li>
              <li>Date of birth, age, gender, and location</li>
              <li>Education, occupation, family and personal details</li>
              <li>Marriage preferences and profile information</li>
              <li>Profile photographs and other images you choose to upload</li>
              <li>Login and account information</li>
              <li>Device, browser, IP address, and basic usage information</li>
              <li>Any information you voluntarily provide through our website or application</li>
            </ul>
          </Section>

          <Section number="2" title="How We Use Your Information">
            <p className="mb-2">We may use your information to:</p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400">
              <li>Create and manage your matrimonial profile</li>
              <li>Provide matrimonial and matchmaking services</li>
              <li>Help you find suitable profiles</li>
              <li>Allow other registered users to view relevant profile information</li>
              <li>Contact you regarding your account and services</li>
              <li>Provide customer support</li>
              <li>Improve our website, application, and services</li>
              <li>Maintain security and prevent fraudulent or unauthorized activity</li>
              <li>Comply with applicable laws and legal requirements</li>
            </ul>
          </Section>

          <Section number="3" title="Profile Information">
            <p>Rohin Muslim Matrimony is a matrimonial platform. Information you provide in your matrimonial profile may be visible to other registered users to help facilitate matchmaking.</p>
            <p className="mt-2 text-amber-400/80 font-medium">Please do not publish sensitive information that you do not wish to share with other users.</p>
          </Section>

          <Section number="4" title="Sharing of Information">
            <p className="font-semibold text-white mb-2">We do not sell or rent your personal information to third parties.</p>
            <p className="mb-2">We may share information when necessary with:</p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400">
              <li>Service providers who help us operate our website or application</li>
              <li>Payment or technology service providers, where applicable</li>
              <li>Government authorities or law enforcement agencies when legally required</li>
              <li>Other users, where information is intentionally included in your public or matrimonial profile</li>
            </ul>
          </Section>

          <Section number="5" title="Data Security">
            <p>We take reasonable technical and organizational measures to protect your personal information against unauthorized access, misuse, alteration, disclosure, or destruction.</p>
            <p className="mt-2">However, no internet-based service can guarantee complete security of information.</p>
          </Section>

          <Section number="6" title="Cookies and Similar Technologies">
            <p>Our website or application may use cookies and similar technologies to improve functionality, remember preferences, analyze usage, and provide a better user experience.</p>
            <p className="mt-2">You may control or disable cookies through your browser settings where applicable.</p>
          </Section>

          <Section number="7" title="Third-Party Services">
            <p>Our website or application may use third-party services for functions such as hosting, analytics, payments, notifications, maps, or other technical services. These providers may process information according to their own privacy policies.</p>
          </Section>

          <Section number="8" title="Children's Privacy">
            <p>Our services are intended for adults seeking matrimonial services. We do not knowingly collect personal information from children.</p>
            <p className="mt-2">If we become aware that information has been provided by a child, we will take reasonable steps to remove it.</p>
          </Section>

          <Section number="9" title="Your Data Deletion Rights">
            <p>You may request deletion of your account and personal information by{' '}
              <Link to="/data-deletion" className="text-gold-400 hover:text-gold-300 underline underline-offset-2">contacting us</Link>.
            </p>
            <p className="mt-2">Please provide your registered name, mobile number, and email address so that we can verify your request.</p>
            <p className="mt-2">Some information may need to be retained where required by applicable law, for security purposes, dispute resolution, fraud prevention, or other legitimate legal requirements.</p>
          </Section>

          <Section number="10" title="Changes to This Privacy Policy">
            <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with the updated effective date.</p>
          </Section>

          <Section number="11" title="Contact Us">
            <div className="bg-[#4f080e]/20 border border-gold-500/20 rounded-xl p-5 space-y-2">
              <p className="text-white font-bold text-base">Shaik Habib</p>
              <p>📞 <a href="tel:+917386083446" className="text-gold-400 hover:text-gold-300">+91 73860 83446</a></p>
              <p>📞 <a href="tel:+917075900448" className="text-gold-400 hover:text-gold-300">+91 70759 00448</a></p>
              <p>✉️ <a href="mailto:shaikhabeebiti@gmail.com" className="text-gold-400 hover:text-gold-300">shaikhabeebiti@gmail.com</a></p>
              <p className="text-slate-400">D.No. 12-13-86, Abdulkhader St, Islampet, Vijayawada-1, Andhra Pradesh, India.</p>
            </div>
          </Section>

        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-slate-500">
          <Link to="/terms" className="hover:text-gold-400 transition-colors">Terms & Conditions</Link>
          <span>•</span>
          <Link to="/data-deletion" className="hover:text-gold-400 transition-colors">Data Deletion Request</Link>
          <span>•</span>
          <Link to="/" className="hover:text-gold-400 transition-colors">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;

