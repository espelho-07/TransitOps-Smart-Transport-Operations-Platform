import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Reusable Tooltip Helper.
 * @param {Object} props
 * @param {string} props.text - Tooltip overlay text
 * @param {'top'|'bottom'|'left'|'right'} props.position - Directional alignments
 */
const Tooltip = ({
  text,
  position = 'top',
  children,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2 origin-top',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2 origin-right',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2 origin-left'
  };

  const arrowStyles = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-card border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-card border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-card border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-card border-y-transparent border-l-transparent'
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && text && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.08 }}
            className={`
              absolute z-50 px-2 py-1 text-[11px] font-bold text-text-main bg-card border border-border rounded shadow-md pointer-events-none select-none
              ${positionStyles[position]}
            `}
          >
            {text}
            <div className={`absolute border-4 ${arrowStyles[position]}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
export { Tooltip };
