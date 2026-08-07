import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Toast from '../components/Toast';
import api from '../services/api';
import { ArrowLeft, ShieldCheck, Activity } from 'lucide-react';

const VerifyResetOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  useEffect(() => {
    // Redirect if no email state
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  // Countdown timer hook
  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (index, value) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs[index - 1].current.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    const data = e.clipboardData.getData('text').trim();
    if (data.length === 6 && !isNaN(Number(data))) {
      const newOtp = data.split('');
      setOtp(newOtp);
      inputRefs[5].current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setToastType('error');
      setToastMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/verify-reset-otp', { email, otpCode });
      if (res.success) {
        setToastType('success');
        setToastMessage('OTP code verified successfully.');
        setTimeout(() => {
          navigate('/reset-password', { state: { email, otpCode } });
        }, 1200);
      }
    } catch (err) {
      setToastType('error');
      setToastMessage(err.error || 'Invalid OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setToastType('info');
    setToastMessage('Resending code...');
    try {
      await api.post('/auth/forgot-password', { email });
      setResendTimer(30);
      setToastType('success');
      setToastMessage('A new verification code has been dispatched.');
    } catch (err) {
      setToastType('error');
      setToastMessage(err.error || 'Resend code failed.');
    }
  };

  return (
    <div 
      className="min-h-screen w-screen flex flex-col items-center justify-center p-6 relative overflow-hidden select-none"
      style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #E6F4F1 100%)' }}
    >
      {/* Blurred background glows */}
      <div className="absolute w-[450px] h-[450px] bg-[#0D4846]/5 rounded-full -top-20 -left-20 filter blur-[80px] pointer-events-none"></div>
      <div className="absolute w-[450px] h-[450px] bg-[#2F8F89]/5 rounded-full -bottom-20 -right-20 filter blur-[80px] pointer-events-none"></div>

      {/* Decorative floating grids/crosses */}
      <div className="absolute top-[10%] left-[10%] opacity-15 text-primary pointer-events-none animate-pulse">
        <Activity size={32} />
      </div>
      <div className="absolute bottom-[15%] right-[12%] opacity-15 text-primary pointer-events-none animate-bounce" style={{ animationDuration: '6s' }}>
        <Activity size={24} />
      </div>

      <div className="flex flex-col items-center w-full max-w-[480px] z-10">
        {/* Brand Logo */}
        <div className="mb-8 text-center">
          <span className="font-logo font-bold text-3xl text-[#0D4846] uppercase tracking-[0.08em]">MEDSPACES</span>
          <div className="w-1.5 h-1.5 bg-[#2F8F89] rounded-full mx-auto mt-2"></div>
        </div>

        {/* Floating Authentication Card */}
        <div className="bg-white rounded-[24px] border border-[#D8E7E5] shadow-[0_20px_60px_rgba(13,72,70,0.12)] p-8 md:p-10 w-full animate-float-card relative">
          
          {/* Card Header with Back Button */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#D8E7E5]/50">
            <button 
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-[#0D4846] font-semibold text-sm hover:underline inline-flex items-center gap-1 bg-transparent border-0 cursor-pointer hover:text-[#11615D] transition-colors"
            >
              <ArrowLeft size={16} /> Back
            </button>
          </div>

          <h2 className="text-2xl font-bold font-heading text-[#082F2D] text-center mb-1">Verify OTP</h2>
          <p className="font-sans text-sm text-[#3F5E5C] text-center mb-8">
            Enter the 6-digit verification code sent to your email.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 6 OTP Boxes */}
            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-14 rounded-xl border border-[#D8E7E5] bg-white font-sans font-bold text-lg text-[#082F2D] text-center focus:outline-none focus:border-[#0D4846] focus:ring-4 focus:ring-[rgba(13,72,70,0.08)] transition-all duration-200"
                />
              ))}
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="btn-shine w-full text-white font-sans font-semibold text-sm py-4 rounded-[14px] shadow-[0_12px_28px_rgba(13,72,70,0.25)] hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 transition-all duration-[250ms] ease-in-out flex items-center justify-center gap-1.5"
                style={{
                  background: 'linear-gradient(135deg, #0D4846, #11615D)'
                }}
              >
                {isLoading ? 'Verifying...' : (
                  <span className="flex items-center justify-center gap-1.5">
                    Verify OTP <ShieldCheck size={16} />
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Resend Section */}
          <div className="mt-8 pt-4 border-t border-[#D8E7E5]/50 text-center font-sans text-sm text-[#3F5E5C] space-y-1">
            <p>Didn't receive the code?</p>
            {resendTimer > 0 ? (
              <p className="text-[#6E8785] font-medium">Resend Code in {resendTimer}s</p>
            ) : (
              <button 
                type="button"
                onClick={handleResend}
                className="text-[#0D4846] font-bold hover:underline bg-transparent border-0 cursor-pointer hover:text-[#11615D] transition-colors"
              >
                Resend Code
              </button>
            )}
          </div>
        </div>
      </div>

      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setToastMessage(null)} 
        />
      )}
    </div>
  );
};

export default VerifyResetOtp;
