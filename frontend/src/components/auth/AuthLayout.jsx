import React from 'react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#0B0F19] text-[#E2E8F0] select-none font-sans overflow-hidden">
      
      {/* LEFT COLUMN: ERP Branding & Illustration (5 cols) */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#0e1320] border-r border-slate-900 p-12 flex-col justify-between relative overflow-hidden text-left">
        {/* Animated gradient backdrop */}
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06),transparent_60%)] filter blur-3xl animate-pulse duration-5000" />

        <Logo />

        <div className="space-y-6 max-w-sm relative z-10 my-auto">
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white leading-tight uppercase tracking-tight">
              Smart Transport <br />
              Operations Platform
            </h1>
            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
              The Next-Generation Enterprise Logistics Suite. Manage dispatch operations, optimize driver schedules, and automate financial audits.
            </p>
          </div>

          <div className="space-y-3 pt-2 text-[10.5px] font-bold text-slate-300">
            <div className="flex items-center gap-2.5">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>Real-Time Fleet Telematics & Registry</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>Automated Driver Scheduling & Logs</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>Fuel Cost & Maintenance Control Systems</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>Smart Role-Based Security Controls</span>
            </div>
          </div>
        </div>

        {/* Left Side Footer */}
        <div className="flex items-center justify-between text-slate-600 text-[9.5px] font-black uppercase tracking-widest relative z-10 border-t border-slate-900 pt-4">
          <span>v1.0.0 Stable</span>
          <span>Odoo Hackathon</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Auth Forms & Toggles (7 cols) */}
      <div className="lg:col-span-7 flex flex-col justify-center px-6 sm:px-16 py-10 relative overflow-y-auto max-h-screen custom-scrollbar">
        {/* Floating Theme Switch */}
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="max-w-md w-full mx-auto">
          {children}
        </div>
      </div>

    </div>
  );
};

export default AuthLayout;
