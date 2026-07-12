import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable Floating Action Button (FAB).
 * @param {Object} props
 * @param {React.ComponentType} props.icon - Lucide icon component to draw inside FAB
 */
const FloatingActionButton = ({
  onClick,
  icon: Icon,
  disabled = false,
  className = '',
  'aria-label': ariaLabel = 'Quick action',
  ...props
}) => {
  return (
    <motion.button
      whileTap={!disabled ? { scale: 0.94 } : {}}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full bg-info hover:bg-opacity-90 text-white shadow-lg flex items-center justify-center border border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-info disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon size={20} strokeWidth={2.5} />}
    </motion.button>
  );
};

export default FloatingActionButton;
export { FloatingActionButton };
