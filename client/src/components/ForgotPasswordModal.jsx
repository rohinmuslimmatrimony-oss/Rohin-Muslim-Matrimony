import React, { useState } from 'react';
import { FaTimes, FaEnvelope, FaKey, FaLock, FaCheckCircle, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

const ForgotPasswordModal = ({ show, onClose, onPasswordResetSuccess, defaultEmail = '' }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleClose = () => {
    setStep(1);
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      if (res.data.success) {
        toast.success(res.data.message || 'Verification code sent to your email!');
        setStep(2);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send verification code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length < 6) {
      toast.error('Please enter the 6-digit OTP code sent to your email');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/verify-reset-otp', { email: email.trim(), otp: otp.trim() });
      if (res.data.success) {
        toast.success('Code verified! Please choose a new password.');
        setStep(3);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP code');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Password reset successfully!');
        if (onPasswordResetSuccess) {
          onPasswordResetSuccess(email.trim());
        }
        setStep(4);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 transition-all duration-300 animate-fadeIn">
      {/* Modal Wrapper */}
      <div className="w-full max-w-md bg-gradient-to-b from-[#850f1d] to-[#240307] text-white rounded-3xl border-2 border-gold-500/40 shadow-2xl overflow-hidden relative animate-scaleUp p-6 sm:p-8">
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
        >
          <FaTimes className="text-base" />
        </button>

        {/* STEP 1: ENTER EMAIL */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center text-2xl mx-auto mb-3 shadow-inner">
                <FaKey />
              </div>
              <h3 className="text-2xl font-serif font-bold text-white">Forgot Password?</h3>
              <p className="text-xs text-white/80 leading-relaxed max-w-xs mx-auto">
                Enter your registered email address and we will send you a 6-digit verification code.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[#ffd666] text-[10px] sm:text-xs font-bold uppercase tracking-wider pl-1" htmlFor="forgot-email">
                  Registered Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#ffd666]">
                    <FaEnvelope className="text-xs sm:text-sm" />
                  </span>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-gold-500/40 focus:border-gold-400 focus:outline-none text-xs sm:text-sm text-white placeholder-white/40 font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold-gradient text-crimson-950 font-bold py-3 rounded-xl shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2 text-xs sm:text-sm uppercase tracking-wider disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-crimson-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>Send Reset Code <FaArrowRight /></>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: ENTER OTP */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center text-2xl mx-auto mb-3 shadow-inner">
                <FaEnvelope />
              </div>
              <h3 className="text-2xl font-serif font-bold text-white">Check Your Email</h3>
              <p className="text-xs text-white/80 leading-relaxed max-w-xs mx-auto">
                We sent a 6-digit code to <strong className="text-amber-300">{email}</strong>. Valid for 10 mins.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[#ffd666] text-[10px] sm:text-xs font-bold uppercase tracking-wider pl-1 text-center block" htmlFor="reset-otp">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  id="reset-otp"
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="------"
                  className="w-full text-center py-3 rounded-xl bg-black/40 border-2 border-gold-500/50 focus:border-gold-400 focus:outline-none text-2xl font-mono tracking-[10px] text-amber-300 font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full bg-gold-gradient text-crimson-950 font-bold py-3 rounded-xl shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2 text-xs sm:text-sm uppercase tracking-wider disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-crimson-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>Verify Code <FaArrowRight /></>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-xs text-amber-300/80 hover:text-amber-300 hover:underline font-semibold"
                >
                  Didn't receive code? Click to Resend
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: SET NEW PASSWORD */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center text-2xl mx-auto mb-3 shadow-inner">
                <FaLock />
              </div>
              <h3 className="text-2xl font-serif font-bold text-white">Create New Password</h3>
              <p className="text-xs text-white/80 leading-relaxed max-w-xs mx-auto">
                Set a strong, new password for your matrimony account.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-3.5 pt-2">
              <div className="space-y-1.5">
                <label className="text-[#ffd666] text-[10px] sm:text-xs font-bold uppercase tracking-wider pl-1" htmlFor="new-pass">
                  New Password (min 6 chars)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#ffd666]">
                    <FaLock className="text-xs sm:text-sm" />
                  </span>
                  <input
                    id="new-pass"
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/40 border border-gold-500/40 focus:border-gold-400 focus:outline-none text-xs sm:text-sm text-white placeholder-white/40 font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#ffd666]/70 hover:text-[#ffd666]"
                  >
                    {showPass ? <FaEyeSlash className="text-xs sm:text-sm" /> : <FaEye className="text-xs sm:text-sm" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#ffd666] text-[10px] sm:text-xs font-bold uppercase tracking-wider pl-1" htmlFor="confirm-pass">
                  Confirm New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#ffd666]">
                    <FaLock className="text-xs sm:text-sm" />
                  </span>
                  <input
                    id="confirm-pass"
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/40 border border-gold-500/40 focus:border-gold-400 focus:outline-none text-xs sm:text-sm text-white placeholder-white/40 font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
                className="w-full bg-gold-gradient text-crimson-950 font-bold py-3 rounded-xl shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2 text-xs sm:text-sm uppercase tracking-wider disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-crimson-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>Set New Password & Login <FaArrowRight /></>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 4 && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center text-3xl mx-auto shadow-inner">
              <FaCheckCircle />
            </div>
            <h3 className="text-2xl font-serif font-bold text-white">Password Reset Complete!</h3>
            <p className="text-xs text-white/80 leading-relaxed max-w-xs mx-auto">
              Your password has been successfully updated. You can now log in using your new credentials.
            </p>
            <button
              onClick={handleClose}
              className="bg-gold-gradient text-crimson-950 font-bold px-8 py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
            >
              Back to Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPasswordModal;
