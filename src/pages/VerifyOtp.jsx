import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Input from '../components/Input';
import Button from '../components/Button';
import Toast from '../components/Toast';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const otpSchema = z.object({
  otpCode: z.string().length(6, 'Verification code must be exactly 6 digits')
});

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');
  const [isLoading, setIsLoading] = useState(false);

  // Expiry Timer: 5 minutes (300 seconds)
  const [expiryTime, setExpiryTime] = useState(300);
  // Resend Timer: 30 seconds
  const [resendTimer, setResendTimer] = useState(30);

  const signUpData = location.state || {};

  // Countdown timer hooks
  useEffect(() => {
    const timer = setInterval(() => {
      setExpiryTime((prev) => (prev > 0 ? prev - 1 : 0));
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(otpSchema)
  });

  const onSubmit = async (data) => {
    if (expiryTime <= 0) {
      setToastType('error');
      setToastMessage('OTP Expired. Please request a new code.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        email: signUpData.email,
        name: signUpData.name,
        password: signUpData.password,
        phone: signUpData.phone,
        otpCode: data.otpCode,
        facilityId: signUpData.facilityId || '00000000-0000-0000-0000-000000000000'
      };

      const res = await api.post('/auth/patient/verify-otp', payload);
      if (res.success) {
        setAuth(res.data.token, res.data.user);
        setToastType('success');
        setToastMessage('Account verified successfully!');
        
        setTimeout(() => {
          navigate('/patient/home');
        }, 1200);
      }
    } catch (err) {
      setToastType('error');
      setToastMessage(err.error || 'Verification code check failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!signUpData.email || resendTimer > 0) return;
    setToastType('info');
    setToastMessage('Resending code...');
    try {
      await api.post('/auth/patient/signup', {
        email: signUpData.email,
        name: signUpData.name,
        phone: signUpData.phone,
        password: signUpData.password
      });
      
      // Reset timers on resend success
      setExpiryTime(300);
      setResendTimer(30);

      setToastType('success');
      setToastMessage('A new verification code has been dispatched.');
    } catch (err) {
      setToastType('error');
      setToastMessage(err.error || 'Resend code failed.');
    }
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-6">
      <div className="bg-white rounded-xl border border-border-custom shadow-md p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold font-heading text-secondary mb-2">Verify Your Email</h2>
        <p className="font-sans text-sm text-text-secondary mb-4">
          We sent a 6-digit confirmation code to <strong>{signUpData.email || 'your email'}</strong>
        </p>

        {/* Live Countdown Display */}
        <div className="mb-6 font-sans text-sm">
          {expiryTime > 0 ? (
            <p className="text-text-secondary">
              Code expires in: <span className="font-bold text-primary">{formatCountdown(expiryTime)}</span>
            </p>
          ) : (
            <p className="text-danger font-bold uppercase tracking-wide">OTP Expired</p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label="Verification Code" 
            type="text" 
            placeholder="123456"
            maxLength={6}
            disabled={expiryTime <= 0}
            error={errors.otpCode}
            {...register('otpCode')}
          />

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full mt-4" 
            disabled={isLoading || expiryTime <= 0}
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button>
        </form>

        <div className="mt-6 text-sm font-sans flex items-center justify-center gap-2">
          {resendTimer > 0 ? (
            <span className="text-text-secondary">Resend code in {resendTimer}s</span>
          ) : (
            <button 
              type="button"
              onClick={handleResend}
              className="text-primary font-semibold hover:underline bg-transparent border-0 cursor-pointer"
            >
              Resend code
            </button>
          )}
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

export default VerifyOtp;
