import React, { useState, useEffect } from "react";
import { FiX, FiLock, FiRefreshCw } from "react-icons/fi";

const OTPVerificationModal = ({ isOpen, onClose, onVerify, onResend, loading = false }) => {
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Reset OTP input when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtp("");
      setResendCooldown(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      return;
    }
    onVerify(otp);
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only digits
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const handleResendClick = async () => {
    if (resendCooldown > 0 || !onResend) return;

    try {
      setIsResending(true);
      await onResend();
      setResendCooldown(60); // Set 60 second cooldown
      setOtp(""); // Clear OTP input after resend
    } catch (error) {
      // Error handling is done by parent component
      console.error("Resend OTP error:", error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center overflow-y-auto py-4 px-4 sm:py-8 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-[#325946] px-6 py-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2.5 rounded-lg backdrop-blur-sm">
                <FiLock size={24} />
              </div>
              <h2 className="text-xl font-bold">Security Verification</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
              disabled={loading}
            >
              <FiX size={22} />
            </button>
          </div>
          <p className="text-white/80 text-sm ml-[52px]">Enter the code sent to your email</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Info Message */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-5">
            <p className="text-sm text-emerald-900">
              A 6-digit verification code has been sent to your email. Please enter it below to proceed.
            </p>
          </div>

          {/* OTP Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={handleOtpChange}
              placeholder="000000"
              className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center text-2xl tracking-[0.5em] font-bold text-gray-800 transition-all"
              maxLength={6}
              autoFocus
              disabled={loading || isResending}
              required
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                {otp.length}/6 digits
              </p>
              <p className="text-xs text-gray-400">Expires in 10 minutes</p>
            </div>
          </div>

          {/* Resend OTP Button */}
          <div className="mb-6 flex justify-center">
            <button
              type="button"
              onClick={handleResendClick}
              disabled={resendCooldown > 0 || loading || isResending}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-emerald-200"
            >
              <FiRefreshCw
                size={16}
                className={isResending ? "animate-spin" : ""}
              />
              {isResending ? (
                "Sending..."
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                "Resend OTP"
              )}
            </button>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              disabled={loading || isResending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={otp.length !== 6 || loading || isResending}
              className="flex-1 px-4 py-2.5 bg-[#325946] text-white rounded-lg hover:bg-[#4a7a5d] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Verifying...
                </span>
              ) : (
                "Verify & Enable"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OTPVerificationModal;
