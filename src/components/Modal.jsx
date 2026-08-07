import React from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footerActions 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white rounded-xl border border-border-custom shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] w-full max-w-lg overflow-hidden animate-fade-in p-6">
        {/* Header */}
        {title && (
          <div className="mb-4">
            <h3 className="font-heading font-semibold text-lg text-text-primary">{title}</h3>
          </div>
        )}

        {/* Content */}
        <div className="mb-6 font-sans text-sm text-text-secondary leading-relaxed">
          {children}
        </div>

        {/* Footer */}
        {footerActions && (
          <div className="flex justify-end space-x-3">
            {footerActions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
