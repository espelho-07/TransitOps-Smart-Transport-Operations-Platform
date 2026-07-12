import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Loader2 } from 'lucide-react';

/**
 * Reusable Enterprise Select Dropdown.
 * @param {Object} props
 * @param {string} props.label - Component title label
 * @param {Array<{value: string, label: string}>} props.options - Data options list
 * @param {string|Array<string>} props.value - Selected options value
 * @param {boolean} props.isMulti - Enables multi-option tag selection
 * @param {boolean} props.searchable - Enables text filtering lookup
 * @param {boolean} props.clearable - Displays X button to empty select
 * @param {boolean} props.isLoading - Displays loader icon
 */
const Select = forwardRef(({
  label,
  options = [],
  value,
  onChange,
  error,
  helperText,
  placeholder = 'Select an option',
  isMulti = false,
  searchable = false,
  clearable = false,
  isLoading = false,
  disabled = false,
  required = false,
  className = '',
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter options based on query
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine current active selection items
  const selectedValues = isMulti
    ? (Array.isArray(value) ? value : [])
    : (value !== undefined && value !== null ? [value] : []);

  const selectedOptions = options.filter(opt => selectedValues.includes(opt.value));

  const handleSelectOption = (optVal) => {
    if (isMulti) {
      const nextValues = selectedValues.includes(optVal)
        ? selectedValues.filter(v => v !== optVal)
        : [...selectedValues, optVal];
      onChange && onChange(nextValues);
    } else {
      onChange && onChange(optVal);
      setIsOpen(false);
    }
    setSearchQuery('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange && onChange(isMulti ? [] : '');
    setSearchQuery('');
  };

  const handleRemoveTag = (e, optVal) => {
    e.stopPropagation();
    onChange && onChange(selectedValues.filter(v => v !== optVal));
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      {/* Dropdown triggers */}
      <div className="relative">
        <div
          onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
          className={`
            min-h-[38px] flex items-center justify-between gap-2 px-3 py-1.5 w-full rounded-lg border text-sm transition-all cursor-pointer bg-card text-text-main
            ${isOpen ? 'ring-1 ring-info border-info' : 'border-border'}
            ${error ? 'border-danger ring-danger' : ''}
            ${disabled ? 'bg-hover cursor-not-allowed opacity-50' : ''}
          `}
          {...props}
        >
          {/* Selections box */}
          <div className="flex flex-wrap gap-1 items-center flex-1">
            {selectedOptions.length === 0 ? (
              <span className="text-text-secondary/40 select-none">{placeholder}</span>
            ) : isMulti ? (
              selectedOptions.map(opt => (
                <span
                  key={opt.value}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-hover border border-border rounded text-text-main"
                >
                  {opt.label}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveTag(e, opt.value)}
                    className="hover:text-danger focus:outline-none"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))
            ) : (
              <span>{selectedOptions[0].label}</span>
            )}
          </div>

          {/* Action indicator buttons */}
          <div className="flex items-center gap-1.5 text-text-secondary/50 flex-shrink-0">
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            {clearable && selectedOptions.length > 0 && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="hover:text-text-main p-0.5"
              >
                <X size={14} />
              </button>
            )}
            <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Dropdown panel */}
        {isOpen && (
          <div className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-card border border-border rounded-lg shadow-lg z-50 py-1.5 focus:outline-none">
            {searchable && (
              <div className="px-3 pb-2 pt-1 border-b border-border/40">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter options..."
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-xs bg-hover text-text-main border border-border rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-info focus:border-info"
                />
              </div>
            )}

            <div className="py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-2.5 text-xs text-text-secondary text-center">
                  No options found
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isChosen = selectedValues.includes(opt.value);
                  return (
                    <div
                      key={opt.value}
                      onClick={() => handleSelectOption(opt.value)}
                      className={`
                        px-4 py-2.5 text-xs font-semibold cursor-pointer transition-colors flex items-center justify-between
                        ${isChosen ? 'bg-info/10 text-info' : 'text-text-secondary hover:text-text-main hover:bg-hover'}
                      `}
                    >
                      <span>{opt.label}</span>
                      {isChosen && isMulti && (
                        <span className="text-[10px] font-bold text-info">✓</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-danger font-medium animate-fadeIn">{error}</p>
      )}
      {!error && helperText && (
        <p className="text-xs text-text-secondary">{helperText}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
export { Select };
