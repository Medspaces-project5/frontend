import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Input from '../components/Input';
import Toast from '../components/Toast';
import api from '../services/api';
import { Lock, ShieldCheck, ArrowLeft, ArrowRight, Activity } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const otpCode = location.state?.otpCode || '';

  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect if no email/otp state
    if (!email || !otpCode) {
      navigate('/forgot-password');
    }
  }, [email, otpCode, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email,
        otpCode,
        password: data.password
      });
      if (res.success) {
        setToastType('success');
        setToastMessage('Password updated successfully.');
        setTimeout(() => {
          navigate('/password-reset-success');
        }, 1200);
      }
    } catch (err) {
      setToastType('error');
      setToastMessage(err.error || 'Failed to update password.');
    } finally {
      setIsLoading(false);
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
        <div className="bg-white rounded-[24px] border border-[#D8E7E5] shadow-[0_20px_60px_rgba(13,72,70,0.12)] p-8 md:p-10 w-full animate-float-card">
          
          {/* Card Header with Back Button */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#D8E7E5]/50">
            <button 
              type="button"
              onClick={() => navigate('/verify-reset-otp', { state: { email } })}
              className="text-[#0D4846] font-semibold text-sm hover:underline inline-flex items-center gap-1 bg-transparent border-0 cursor-pointer hover:text-[#11615D] transition-colors"
            >
              <ArrowLeft size={16} /> Back
            </button>
          </div>

          <h2 className="text-2xl font-bold font-heading text-[#082F2D] text-center mb-1">Create New Password</h2>
          <p className="font-sans text-sm text-[#3F5E5C] text-center mb-8">
            Your new password must be different from your previous password.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input 
              label="New Password" 
              type="password" 
              placeholder="••••••••"
              icon={Lock}
              error={errors.password}
              {...register('password')}
            />

            <Input 
              label="Confirm Password" 
              type="password" 
              placeholder="••••••••"
              icon={ShieldCheck}
              error={errors.confirmPassword}
              {...register('confirmPassword')}
            />

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="btn-shine w-full text-white font-sans font-semibold text-sm py-4 rounded-[14px] shadow-[0_12px_28px_rgba(13,72,70,0.25)] hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 transition-all duration-[250ms] ease-in-out flex items-center justify-center gap-1.5"
                style={{
                  background: 'linear-gradient(135deg, #0D4846, #11615D)'
                }}
              >
                {isLoading ? 'Updating...' : (
                  <span className="flex items-center justify-center gap-1.5">
                    Update Password <ShieldCheck size={16} />
                  </span>
                )}
              </button>
            </div>
          </form>
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

export default ResetPassword;
