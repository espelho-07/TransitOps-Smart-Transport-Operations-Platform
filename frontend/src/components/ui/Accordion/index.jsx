import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

/**
 * Reusable Accordion Expand/Collapse Wrapper.
 * @param {Object} props
 * @param {Array<{title: string, content: React.ReactNode}>} props.items - Accordion items array
 * @param {boolean} props.allowMultiple - If true, permits expanding multiple panels concurrently
 */
const Accordion = ({
  items = [],
  allowMultiple = false,
  className = ''
}) => {
  const [openIndexes, setOpenIndexes] = useState([]);

  const handleToggle = (idx) => {
    if (allowMultiple) {
      setOpenIndexes(prev =>
        prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
      );
    } else {
      setOpenIndexes(prev =>
        prev.includes(idx) ? [] : [idx]
      );
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {items.map((item, idx) => {
        const isOpen = openIndexes.includes(idx);
        return (
          <div
            key={item.title + idx}
            className="border border-border rounded-xl bg-card overflow-hidden transition-colors hover:border-hover"
          >
            {/* Header trigger button */}
            <button
              type="button"
              onClick={() => handleToggle(idx)}
              className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-bold text-text-main focus:outline-none select-none bg-hover/5"
            >
              <span>{item.title}</span>
              <ChevronDown
                size={16}
                className={`text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Height expanding body */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeInOut' }}
                >
                  <div className="px-5 py-4 border-t border-border text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
export { Accordion };
