import React from 'react';

const Toggle = ({ 
  checked, 
  onChange, 
  disabled = false,
  label
}) => {
  return (
    <label className={`flex items-center space-x-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <div className="relative">
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={disabled ? undefined : onChange}
          disabled={disabled}
          className="sr-only"
        />
        {/* Track: 44x24px */}
        <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-primary' : 'bg-border-custom'}`} />
        {/* Knob: white */}
        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${checked ? 'transform translate-x-5' : ''}`} />
      </div>
      {label && <span className="font-sans text-sm font-medium text-text-primary">{label}</span>}
    </label>
  );
};

export default Toggle;
