import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = React.forwardRef(({ 
  label, 
  error, 
  type = 'text',
  options, // for select
  className = '',
  icon: Icon,
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const inputStyles = `w-full ${Icon ? 'pl-12' : 'px-4'} ${isPassword ? 'pr-12' : 'pr-4'} py-3.5 h-[56px] rounded-[14px] border bg-white font-sans text-text-primary text-sm focus:outline-none focus:border-[#0D4846] focus:ring-4 focus:ring-[rgba(13,72,70,0.08)] transition-all duration-200 ${
    error ? 'border-danger' : 'border-border-custom'
  } ${className}`;

  return (
    <div className="w-full flex flex-col space-y-1.5 text-left">
      {label && <label className="font-sans text-sm font-medium text-text-primary">{label}</label>}
      <div className="relative w-full">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8CA3A1] pointer-events-none">
            <Icon size={20} />
          </div>
        )}
        
        {options ? (
          <select ref={ref} className={inputStyles} {...props}>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input ref={ref} type={inputType} className={inputStyles} {...props} />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8CA3A1] hover:text-[#0D4846] focus:outline-none transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && <span className="font-sans text-xs text-danger">{error.message || error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
