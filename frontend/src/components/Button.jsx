import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // primary, secondary, danger, outline, ghost
  size = 'md', // sm, md, lg
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-info disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-info hover:bg-opacity-90 text-white border border-transparent focus:ring-offset-background",
    secondary: "bg-hover hover:bg-opacity-80 text-text-main border border-border",
    danger: "bg-danger hover:bg-opacity-90 text-white border border-transparent focus:ring-danger",
    outline: "bg-transparent hover:bg-hover text-text-main border border-border",
    ghost: "bg-transparent hover:bg-hover text-text-main border border-transparent"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5"
  };

  return (
    <motion.button
      whileTap={!disabled && !isLoading ? { scale: 0.97 } : {}}
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : null}
      {children}
    </motion.button>
  );
};

export default Button;
