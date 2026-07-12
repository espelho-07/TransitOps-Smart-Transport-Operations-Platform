import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';

/**
 * Reusable debounced Search Bar.
 * @param {Object} props
 * @param {string} props.value - Active lookup query
 * @param {function} props.onChange - Triggered after debounce delay
 * @param {number} props.debounceTime - Milliseconds wait (default 300ms)
 */
const Search = ({
  value = '',
  onChange,
  debounceTime = 300,
  placeholder = 'Search records...',
  className = ''
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Sync value if changed from outside
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Handle local changes and trigger parent onChange with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      onChange && onChange(localValue);
    }, debounceTime);

    return () => clearTimeout(handler);
  }, [localValue, debounceTime, onChange]);

  const handleClear = () => {
    setLocalValue('');
    onChange && onChange('');
  };

  return (
    <div className={`relative rounded-lg shadow-sm w-full max-w-xs ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary/50">
        <SearchIcon size={15} />
      </div>
      <input
        type="text"
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="
          block w-full rounded-lg border border-border text-sm transition-all focus:outline-none focus:ring-1 focus:ring-info focus:border-info pl-9 pr-9 py-1.5
          bg-card text-text-main placeholder:text-text-secondary/40
        "
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary/50 hover:text-text-main transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default Search;
export { Search };
