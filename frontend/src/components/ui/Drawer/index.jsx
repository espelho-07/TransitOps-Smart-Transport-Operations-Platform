import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Reusable slide-out Drawer.
 * @param {Object} props
 * @param {boolean} props.isOpen - Display status
 * @param {function} props.onClose - Close action
 * @param {string} props.title - Drawer header title
 * @param {'right'|'left'|'bottom'} props.position - Slide source placement
 */
const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right', // right, left, bottom
  className = ''
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      const handleEscape = (e) => {
        if (e.key === 'Escape') onClose && onClose();
      };
      window.addEventListener('keydown', handleEscape);
      return () => {
        window.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  const slideTransitions = {
    right: { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } },
    left: { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } },
    bottom: { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } }
  };

  const positioning = {
    right: 'right-0 top-0 bottom-0 w-80 sm:w-96 border-l',
    left: 'left-0 top-0 bottom-0 w-80 sm:w-96 border-r',
    bottom: 'bottom-0 left-0 right-0 h-96 border-t'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-[1px]"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={slideTransitions[position].initial}
            animate={slideTransitions[position].animate}
            exit={slideTransitions[position].exit}
            transition={{ type: 'tween', duration: 0.22 }}
            className={`
              absolute bg-card border-border shadow-lg flex flex-col z-10 ${positioning[position]} ${className}
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-hover/5">
              <h3 className="text-sm font-bold text-text-main">
                {title || 'Information Drawer'}
              </h3>
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-text-main p-1 rounded-lg hover:bg-hover transition-all focus:outline-none"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 overflow-y-auto flex-1 custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Drawer;
export { Drawer };
