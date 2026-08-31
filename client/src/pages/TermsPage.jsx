import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaScroll } from 'react-icons/fa';
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

const TermsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Terms & Conditions | Rohin Muslim Matrimony';
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
            <FaScroll className="text-gold-400 text-2xl" />
          </div>
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold font-serif text-gold-400 mb-2">Terms & Conditions</h1>
        <p className="text-slate-400 text-sm md:text-base">Effective Date: <span className="text-gold-300 font-semibold">August 31, 2026</span></p>
        <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
          Welcome to <strong className="text-white">Rohin Muslim Matrimony</strong>. By accessing or using our services, you agree to comply with these Terms & Conditions.
        </p>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-14">
        <div className="bg-white/5 border border-gold-500/15 rounded-2xl p-6 md:p-10 backdrop-blur-sm">

          <Section number="1" title="Eligibility">
            <p>You must be legally eligible to use a matrimonial service and must provide accurate information while creating your account.</p>
            <p className="mt-2">By registering, you confirm that the information provided by you is true and belongs to you.</p>
          </Section>

          <Section number="2" title="Account Registration">
            <p>Users are responsible for providing accurate and updated information during registration.</p>
            <p className="mt-2">You are responsible for maintaining the confidentiality of your account and login information. You must immediately inform us if you believe your account has been accessed without authorization.</p>
          </Section>

          <Section number="3" title="Matrimonial Profiles">
            <p>Rohin Muslim Matrimony provides a platform for users to create matrimonial profiles and search for suitable matches.</p>
            <p className="mt-2">Users are responsible for the accuracy and authenticity of the information they provide.</p>
            <p className="mt-2">We do not guarantee that any profile, information, photograph, or personal detail provided by another user is accurate, genuine, or complete.</p>
          </Section>

          <Section number="4" title="User Conduct">
            <p className="mb-2">Users must not:</p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400">
              <li>Provide false, misleading, or fraudulent information.</li>
              <li>Create an account using another person's identity.</li>
              <li>Harass, threaten, abuse, or discriminate against other users.</li>
              <li>Use the platform for illegal or unauthorized activities.</li>
              <li>Upload offensive, inappropriate, or unlawful content.</li>
              <li>Attempt to obtain another user's private information without permission.</li>
              <li>Use the platform for commercial advertising, solicitation, or spam without authorization.</li>
              <li>Use automated systems or methods to collect information from the platform.</li>
              <li>Attempt to hack, damage, or interfere with the website or application.</li>
            </ul>
          </Section>

          <Section number="5" title="Communication Between Users">
            <p>Users may communicate with other registered users through available features.</p>
            <p className="mt-2">Rohin Muslim Matrimony does not control or guarantee communications, meetings, relationships, marriages, or other interactions between users.</p>
            <p className="mt-2">Users should exercise appropriate caution when communicating with or meeting another person.</p>
          </Section>

          <Section number="6" title="User Responsibility">
            <p>Users are solely responsible for verifying the identity, background, employment, family information, marital status, and other details of any person they communicate with or consider for marriage.</p>
            <p className="mt-2">We strongly recommend that users independently verify information before making any personal, financial, or matrimonial decisions.</p>
          </Section>

          <Section number="7" title="Content Uploaded by Users">
            <p>Users may upload photographs, descriptions, and other profile information.</p>
            <p className="mt-2">By uploading content, you confirm that you have the necessary rights and permission to use and share that content.</p>
            <p className="mt-2">You must not upload content that is unlawful, misleading, defamatory, abusive, or infringes the rights of another person.</p>
          </Section>

          <Section number="8" title="Privacy">
            <p>Your use of our services is also subject to our{' '}
              <Link to="/privacy-policy" className="text-gold-400 hover:text-gold-300 underline underline-offset-2">Privacy Policy</Link>,
              which explains how we collect and process personal information.
            </p>
          </Section>

          <Section number="9" title="Service Availability">
            <p>We try to keep our website and application available and functioning properly. However, we do not guarantee that the service will always be uninterrupted, error-free, or available at all times.</p>
            <p className="mt-2">We may temporarily suspend or modify services for maintenance, updates, security, or other operational reasons.</p>
          </Section>

          <Section number="10" title="Account Suspension or Termination">
            <p className="mb-2">We reserve the right to suspend, restrict, or terminate an account if a user:</p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400">
              <li>Violates these Terms & Conditions.</li>
              <li>Provides false or fraudulent information.</li>
              <li>Misuses the platform.</li>
              <li>Engages in abusive or illegal activities.</li>
              <li>Creates a risk to other users or the platform.</li>
            </ul>
            <p className="mt-2">Users may also request deletion of their account by{' '}
              <Link to="/data-deletion" className="text-gold-400 hover:text-gold-300 underline underline-offset-2">contacting us</Link>.
            </p>
          </Section>

          <Section number="11" title="Payments and Fees">
            <p>If any paid services, subscriptions, or other charges are offered through Rohin Muslim Matrimony, the applicable fees and payment terms will be displayed before purchase.</p>
            <p className="mt-2">Users are responsible for reviewing the applicable pricing and terms before making a payment.</p>
          </Section>

          <Section number="12" title="Limitation of Liability">
            <p>Rohin Muslim Matrimony acts as a platform to help users connect for matrimonial purposes.</p>
            <p className="mt-2 mb-2">We are not responsible for:</p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400">
              <li>The accuracy or authenticity of user profiles.</li>
              <li>Actions or behavior of other users.</li>
              <li>Personal meetings or relationships between users.</li>
              <li>Financial transactions between users.</li>
              <li>Any loss, damage, fraud, or dispute arising from interactions between users.</li>
            </ul>
            <p className="mt-2">Users use the platform and interact with other users at their own discretion and risk.</p>
          </Section>

          <Section number="13" title="Intellectual Property">
            <p>The website, application, logo, design, content, graphics, software, and other materials provided by Rohin Muslim Matrimony are protected by applicable intellectual property laws.</p>
            <p className="mt-2">Users may not copy, reproduce, modify, distribute, or commercially use our content without prior permission.</p>
          </Section>

          <Section number="14" title="Prohibited Activities">
            <p>Any attempt to misuse, reverse engineer, disrupt, damage, hack, scrape, or gain unauthorized access to our website, application, database, or services is prohibited.</p>
            <p className="mt-2">We may take appropriate legal or technical action against such activities.</p>
          </Section>

          <Section number="15" title="Changes to These Terms">
            <p>We may update or modify these Terms & Conditions from time to time. Updated terms will be published on this page along with the revised effective date.</p>
            <p className="mt-2">Continued use of our services after changes are published means that you accept the updated Terms & Conditions.</p>
          </Section>

          <Section number="16" title="Contact Us">
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

export default TermsPage;

