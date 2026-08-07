import React, { useEffect } from 'react';

const Toast = ({ 
  message, 
  type = 'info', 
  onClose 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Auto-dismiss after 4s per Section 4.3

    return () => clearTimeout(timer);
  }, [onClose]);

  const typeStyles = {
    success: 'border-l-4 border-success bg-white',
    error: 'border-l-4 border-danger bg-white',
    info: 'border-l-4 border-primary bg-white'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-md border border-border-custom max-w-sm w-full transition-all duration-300 animate-slide-in ${typeStyles[type]}`}>
      <span className="font-sans text-sm font-medium text-text-primary flex-1">{message}</span>
      <button 
        onClick={onClose} 
        className="ml-3 text-text-secondary hover:text-text-primary text-sm focus:outline-none"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
