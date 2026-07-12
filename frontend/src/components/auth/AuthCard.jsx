import React from 'react';

const AuthCard = ({ children, title, subtitle }) => {
  return (
    <div className="w-full p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl shadow-2xl space-y-6">
      <div className="space-y-1.5 text-left">
        {title && <h2 className="text-xl font-black text-white uppercase tracking-tight">{title}</h2>}
        {subtitle && <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
};

export default AuthCard;
