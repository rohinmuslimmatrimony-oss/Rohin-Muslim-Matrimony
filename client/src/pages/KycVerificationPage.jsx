import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  FaShieldAlt, FaIdCard, FaCheckCircle, FaTimesCircle,
  FaHourglassHalf, FaUpload, FaLock, FaInfoCircle
} from 'react-icons/fa';

const ID_TYPES = [
  { value: 'aadhaar', label: 'Aadhaar Card' },
  { value: 'pan', label: 'PAN Card' },
  { value: 'passport', label: 'Passport' },
  { value: 'voter_id', label: "Voter ID" },
  { value: 'driving_license', label: 'Driving License' },
];

const KycVerificationPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [kycStatus, setKycStatus] = useState(null); // 'not_submitted' | 'pending' | 'approved' | 'rejected'
  const [kycData, setKycData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullNameOnId: '',
    idType: 'aadhaar',
    idNumber: '',
  });
  const [docFile, setDocFile] = useState(null);
  const [docPreview, setDocPreview] = useState(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/kyc/status');
      setKycStatus(res.data.status);
      setKycData(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch verification status');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }
    setDocFile(file);
    setDocPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!docFile) {
      toast.error('Please upload your ID document image');
      return;
    }
    if (!form.fullNameOnId.trim()) {
      toast.error('Please enter the full name as shown on the document');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('document', docFile);
      formData.append('fullNameOnId', form.fullNameOnId);
      formData.append('idType', form.idType);
      formData.append('idNumber', form.idNumber);

      const res = await api.post('/kyc/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success(res.data.message);
        fetchStatus();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const StatusBadge = ({ status }) => {
    const config = {
      approved: { icon: <FaCheckCircle />, label: 'Identity Verified', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      pending: { icon: <FaHourglassHalf />, label: 'Under Review', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
      rejected: { icon: <FaTimesCircle />, label: 'Not Approved', cls: 'bg-red-50 text-red-700 border-red-200' },
      not_submitted: { icon: <FaShieldAlt />, label: 'Not Verified', cls: 'bg-slate-50 text-slate-600 border-slate-200' },
    };
    const c = config[status] || config.not_submitted;
    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold ${c.cls}`}>
        {c.icon} {c.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 pt-24 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-crimson-200 border-t-crimson-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-crimson-800 to-crimson-950 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FaShieldAlt className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-crimson-950 mb-2">Identity Verification</h1>
          <p className="text-sm text-slate-500">Verify your identity to get a trusted ✅ badge on your profile</p>
          <div className="mt-3">
            <StatusBadge status={kycStatus} />
          </div>
        </div>

        {/* Why Verify Info Box */}
        <div className="glass-card rounded-2xl p-5 border border-blue-100 bg-blue-50/50 mb-6 flex gap-3">
          <FaInfoCircle className="text-blue-500 text-lg flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-blue-800 text-sm mb-1">Why get verified?</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>✅ Green "ID Verified" badge on your profile</li>
              <li>✅ Builds trust with other families & members</li>
              <li>✅ Increased interest responses</li>
              <li>🔒 Your document is private — only admin can view it</li>
            </ul>
          </div>
        </div>

        {/* APPROVED STATE */}
        {kycStatus === 'approved' && (
          <div className="glass-card rounded-2xl p-8 text-center border border-emerald-200 bg-emerald-50">
            <FaCheckCircle className="text-emerald-500 text-5xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-emerald-800 mb-2">Identity Verified!</h2>
            <p className="text-sm text-emerald-700">Your profile now shows a ✅ verified badge. Other members can trust your profile.</p>
            <p className="text-xs text-emerald-600 mt-2">Name on document: <strong>{kycData?.fullNameOnId}</strong></p>
          </div>
        )}

        {/* PENDING STATE */}
        {kycStatus === 'pending' && (
          <div className="glass-card rounded-2xl p-8 text-center border border-amber-200 bg-amber-50">
            <FaHourglassHalf className="text-amber-500 text-5xl mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-amber-800 mb-2">Under Review</h2>
            <p className="text-sm text-amber-700">Our admin team is reviewing your document. This usually takes within 24 hours.</p>
            <div className="mt-4 text-left bg-white rounded-xl p-4 border border-amber-100">
              <p className="text-xs font-bold text-slate-600 mb-1">Submitted Details:</p>
              <p className="text-sm text-slate-700">Name: <strong>{kycData?.fullNameOnId}</strong></p>
              <p className="text-sm text-slate-700">ID Type: <strong>{ID_TYPES.find(t => t.value === kycData?.idType)?.label || kycData?.idType}</strong></p>
              <p className="text-xs text-slate-400 mt-2">Submitted: {new Date(kycData?.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
        )}

        {/* REJECTED STATE — show form again */}
        {kycStatus === 'rejected' && (
          <div className="glass-card rounded-2xl p-5 border border-red-200 bg-red-50 mb-6">
            <div className="flex gap-3">
              <FaTimesCircle className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-800 text-sm mb-1">KYC Not Approved</h4>
                {kycData?.adminNote && (
                  <p className="text-xs text-red-700">Reason: <strong>{kycData.adminNote}</strong></p>
                )}
                <p className="text-xs text-red-600 mt-1">Please resubmit with a clearer document image.</p>
              </div>
            </div>
          </div>
        )}

        {/* SUBMISSION FORM — show if not_submitted or rejected */}
        {(kycStatus === 'not_submitted' || kycStatus === 'rejected') && (
          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 border border-crimson-900/10 space-y-5">
            <h3 className="font-serif font-bold text-crimson-950 text-lg">
              {kycStatus === 'rejected' ? 'Resubmit Identity Document' : 'Submit Identity Document'}
            </h3>

            {/* Full Name on ID */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Full Name (as on document) <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.fullNameOnId}
                onChange={e => setForm(f => ({ ...f, fullNameOnId: e.target.value }))}
                placeholder="e.g. Mohammed Ibrahim Khan"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-crimson-900/20"
                required
              />
            </div>

            {/* ID Type */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Document Type <span className="text-red-500">*</span></label>
              <select
                value={form.idType}
                onChange={e => setForm(f => ({ ...f, idType: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-crimson-900/20"
              >
                {ID_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* ID Number (optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Document Number <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={form.idNumber}
                onChange={e => setForm(f => ({ ...f, idNumber: e.target.value }))}
                placeholder="e.g. XXXX XXXX 1234"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-crimson-900/20"
              />
            </div>

            {/* Document Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Upload Document Image <span className="text-red-500">*</span></label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-crimson-300 transition-colors">
                {docPreview ? (
                  <div className="relative">
                    <img src={docPreview} alt="Document preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                    <button
                      type="button"
                      onClick={() => { setDocFile(null); setDocPreview(null); }}
                      className="mt-2 text-xs text-red-500 font-bold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <FaUpload className="text-slate-400 text-2xl mx-auto mb-2" />
                    <p className="text-sm text-slate-500 font-medium">Click to upload Aadhaar / ID photo</p>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP — Max 5MB</p>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Privacy Note */}
            <div className="flex items-start gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
              <FaLock className="text-slate-400 text-xs mt-0.5 flex-shrink-0" />
              <p className="text-xs text-slate-500">
                Your document is <strong>private and secure</strong>. It is only visible to our admin team for verification purposes and will never be shared with other members.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-crimson-950 hover:bg-crimson-800 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FaIdCard /> Submit for Verification
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default KycVerificationPage;
