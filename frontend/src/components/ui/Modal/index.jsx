import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Reusable Enterprise Modal Dialog.
 * @param {Object} props
 * @param {boolean} props.isOpen - Display toggle status
 * @param {function} props.onClose - Close action handler
 * @param {string} props.title - Modal header title
 * @param {'sm'|'md'|'lg'|'full'} props.size - Dimension scales
 * @param {boolean} props.closeOnOverlayClick - Closes when backdrop clicked (default true)
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true
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

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    full: 'max-w-full h-full rounded-none m-0'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnOverlayClick ? onClose : undefined}
            className="fixed inset-0 bg-black/60 backdrop-blur-[1px]"
          />

          {/* Modal box */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 350 }}
            className={`relative w-full bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden flex flex-col ${sizes[size]}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-hover/5">
              <h3 className="text-sm font-bold text-text-main">
                {title || 'Modal Box'}
              </h3>
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-text-main p-1 rounded-lg hover:bg-hover transition-all focus:outline-none"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 overflow-y-auto max-h-[70vh] flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
export { Modal };
