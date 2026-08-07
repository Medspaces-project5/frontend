import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleCheckBig, ArrowRight, Activity } from 'lucide-react';

const PasswordResetSuccess = () => {
  const navigate = useNavigate();

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
        <div className="bg-white rounded-[24px] border border-[#D8E7E5] shadow-[0_20px_60px_rgba(13,72,70,0.12)] p-8 md:p-10 w-full animate-float-card flex flex-col items-center text-center">
          
          {/* Large Success Icon */}
          <div className="w-20 h-20 bg-[#F3F7F6] text-[#2F8F89] rounded-full flex items-center justify-center mb-6 shadow-sm">
            <CircleCheckBig size={44} className="stroke-[2.5]" />
          </div>

          <h2 className="text-2xl font-bold font-heading text-[#082F2D] mb-2">Password Updated Successfully</h2>
          <p className="font-sans text-sm text-[#3F5E5C] mb-8 leading-relaxed">
            Your password has been updated successfully.<br />
            You can now login using your new password.
          </p>

          <button 
            onClick={() => navigate('/login')}
            className="btn-shine w-full text-white font-sans font-semibold text-sm py-4 rounded-[14px] shadow-[0_12px_28px_rgba(13,72,70,0.25)] hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 transition-all duration-[250ms] ease-in-out flex items-center justify-center gap-1.5"
            style={{
              background: 'linear-gradient(135deg, #0D4846, #11615D)'
            }}
          >
            Go to Login <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetSuccess;
