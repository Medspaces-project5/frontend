import React from 'react';

const Skeleton = ({ 
  variant = 'text', // 'text', 'avatar', 'rect'
  width = '100%', 
  height 
}) => {
  const baseStyles = 'bg-slate-200 animate-pulse rounded';
  
  const variantStyles = {
    text: 'h-4 w-full',
    avatar: 'h-12 w-12 rounded-full',
    rect: 'w-full'
  };

  const customStyle = {};
  if (width) customStyle.width = width;
  if (height) customStyle.height = height;

  return (
    <div 
      className={`${baseStyles} ${variantStyles[variant]}`} 
      style={customStyle}
    />
  );
};

export default Skeleton;
