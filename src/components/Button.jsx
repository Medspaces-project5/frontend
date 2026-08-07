import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  disabled = false, 
  type = 'button',
  className = '' 
}) => {
  const baseStyles = 'font-sans font-semibold text-base py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none flex items-center justify-center';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover active:scale-[1.02] hover:scale-[1.02] shadow-sm',
    secondary: 'bg-transparent border-1.5 border-primary text-primary hover:bg-[#F0FDFA] active:scale-[1.02] hover:scale-[1.02]',
    danger: 'bg-danger text-white hover:opacity-90 active:scale-[1.02] hover:scale-[1.02] shadow-sm',
    disabled: 'bg-border-custom text-[#94A3B8] cursor-not-allowed'
  };

  const selectedVariant = disabled ? variants.disabled : variants[variant];

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${baseStyles} ${selectedVariant} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
