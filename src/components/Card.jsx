import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded-xl border border-border-custom shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="font-heading font-semibold text-lg text-text-primary mb-1">{title}</h3>}
          {subtitle && <p className="font-sans text-sm text-text-secondary">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
