import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaChevronLeft, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, 
  FaWhatsapp, FaPaperPlane, FaQuestionCircle 
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const SupportPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    category: 'general',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error('Please fill in all the fields.');
      return;
    }

    setSubmitting(true);
    // Simulate submission delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    setSubmitting(false);
    toast.success('Support ticket submitted successfully! We will contact you soon.');
    setForm({
      category: 'general',
      subject: '',
      message: ''
    });
  };

  const handleWhatsAppClick = () => {
    // Official support numbers: +91 73860 83446 or +91 70759 00448
    window.open('https://wa.me/917386083446?text=Assalamu%20Alaikum,%20I%20need%20support%20with%20Rohin%20Matrimony%20app.', '_blank');
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] pt-24 pb-20 px-4 md:px-8 relative overflow-hidden font-outfit">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-b from-crimson-900/5 to-transparent rounded-full blur-[120px] -z-10"></div>

      <div className="max-w-xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/edit-profile')} 
          className="mb-6 text-crimson-900 font-bold flex items-center gap-1.5 bg-white border border-slate-200/80 px-4 py-2 rounded-full shadow-sm hover:bg-slate-50 transition-all text-xs uppercase tracking-wider cursor-pointer"
        >
          <FaChevronLeft className="text-[10px]" /> Back to Profile
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-crimson-950 mb-1.5">Help & Support</h1>
          <p className="text-sm text-slate-500">Contact our relationship manager team. We are here to help your partner search.</p>
        </div>

        {/* Support Contact Info Cards */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm mb-6 space-y-5">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
            📞 Official Contact Details
          </h3>

          <div className="space-y-4">
            {/* Phone */}
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-crimson-50 text-crimson-900 rounded-xl mt-0.5">
                <FaPhoneAlt className="text-sm" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Call Support</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">+91 73860 83446</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">+91 70759 00448</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-crimson-50 text-crimson-900 rounded-xl mt-0.5">
                <FaEnvelope className="text-sm" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Email Us</p>
                <a href="mailto:shaikhabeebiti@gmail.com" className="text-sm font-bold text-crimson-800 mt-0.5 hover:underline block">
                  shaikhabeebiti@gmail.com
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-crimson-50 text-crimson-900 rounded-xl mt-0.5">
                <FaMapMarkerAlt className="text-sm" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Head Office Address</p>
                <p className="text-sm font-medium text-slate-700 mt-0.5 leading-relaxed">
                  D.No.12-13-86, Abdulkhader Street,<br />
                  Islampet, Vijayawada - 520001
                </p>
              </div>
            </div>
          </div>

          {/* Direct WhatsApp Trigger CTA */}
          <button
            onClick={handleWhatsAppClick}
            className="w-full bg-[#25d366] hover:bg-[#20ba5a] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer mt-2 text-sm uppercase tracking-wide"
          >
            <FaWhatsapp className="text-lg" /> Chat on WhatsApp
          </button>
        </div>

        {/* Mock Support Ticket Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
            ✉️ Submit a Support Ticket
          </h3>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Query Category</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-900/10 focus:border-crimson-900"
            >
              <option value="general">General Query</option>
              <option value="billing">Payment & Subscriptions</option>
              <option value="profile">Profile & Photo Verification</option>
              <option value="safety">Safety & Reporting Abuse</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Subject</label>
            <input
              type="text"
              value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
              placeholder="e.g. Issues with photo uploading"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-900/10 focus:border-crimson-900"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Message Details</label>
            <textarea
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              rows="4"
              placeholder="Write detailed queries or issues here..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-900/10 focus:border-crimson-900 resize-none"
              required
            ></textarea>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-crimson-950 hover:bg-crimson-900 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-60 text-sm uppercase tracking-wide cursor-pointer"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              <>
                <FaPaperPlane className="text-xs" /> Submit Ticket
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupportPage;
