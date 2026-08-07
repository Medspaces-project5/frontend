import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Input from '../components/Input';
import Toast from '../components/Toast';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { Mail, Lock, ArrowRight, Activity } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      if (res.success) {
        const { token, user } = res.data;
        setAuth(token, user);
        
        setToastType('success');
        setToastMessage(`Welcome back, ${user.name || 'User'}!`);
        
        setTimeout(() => {
          if (user.role === 'admin') {
            navigate('/admin/staff');
          } else if (user.role === 'doctor') {
            navigate('/doctor/queue');
          } else if (user.role === 'frontdesk') {
            navigate('/frontdesk/queue');
          } else if (user.role === 'patient') {
            navigate('/patient/home');
          } else {
            navigate('/showcase');
          }
        }, 1000);
      }
    } catch (err) {
      setToastType('error');
      setToastMessage(err.error || 'Login verification failed.');
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
          <h2 className="text-2xl font-bold font-heading text-[#082F2D] text-center mb-1">Welcome Back</h2>
          <p className="font-sans text-sm text-[#3F5E5C] text-center mb-8">Login to access your patient account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="name@clinic.com"
              icon={Mail}
              error={errors.email}
              {...register('email')}
            />
            
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••"
              icon={Lock}
              error={errors.password}
              {...register('password')}
            />

            <div className="text-right -mt-2">
              <a 
                href="/forgot-password" 
                className="text-xs text-[#0D4846] font-medium hover:underline cursor-pointer transition-colors"
              >
                Forgot Password?
              </a>
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
                    Login <ArrowRight size={16} />
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Divider and Footer */}
          <div className="w-full flex items-center justify-between my-6">
            <div className="flex-1 border-t border-[#D8E7E5]"></div>
            <span className="px-3 text-xs text-[#8CA3A1] uppercase tracking-wider">or</span>
            <div className="flex-1 border-t border-[#D8E7E5]"></div>
          </div>

          <div className="text-center font-sans text-sm text-[#3F5E5C]">
            New to MedSpaces?{' '}
            <a 
              href="/signup" 
              className="text-[#0D4846] font-semibold hover:underline inline-flex items-center gap-0.5 hover:text-[#11615D] transition-colors"
            >
              Create Account <ArrowRight size={14} />
            </a>
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

export default Login;
