import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

const PasswordInput = ({ value, onChange, placeholder = '••••••••', id, name, required = true }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
      <input
        type={showPassword ? 'text' : 'password'}
        id={id}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-10 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all font-sans"
      />
      <button
        type="button"
        onClick={() => setShowPassword(prev => !prev)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none focus:text-slate-300"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
    </div>
  );
};

export default PasswordInput;
