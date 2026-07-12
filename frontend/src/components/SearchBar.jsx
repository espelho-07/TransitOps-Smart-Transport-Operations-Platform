import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search...',
  className = '',
  ...props
}) => {
  return (
    <div className={`relative rounded-lg shadow-sm w-full max-w-md ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
        <Search size={16} />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          block w-full rounded-lg border text-sm transition-all focus:outline-none focus:ring-1 pl-10 pr-9 py-2
          bg-card text-text-main border-border
          focus:ring-info focus:border-info
          placeholder:text-text-secondary/50
        "
        {...props}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-main transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
