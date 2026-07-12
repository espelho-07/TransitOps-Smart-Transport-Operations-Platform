import React from 'react';

const Skeleton = ({
  variant = 'text', // text, circle, rectangle
  width,
  height,
  className = ''
}) => {
  const baseStyle = 'animate-pulse bg-border rounded-md';
  
  const variants = {
    text: 'h-4 w-3/4',
    circle: 'rounded-full',
    rectangle: 'h-24 w-full'
  };

  const style = {
    width: width || undefined,
    height: height || undefined
  };

  return (
    <div
      className={`${baseStyle} ${variants[variant]} ${className}`}
      style={style}
    />
  );
};

export default Skeleton;
