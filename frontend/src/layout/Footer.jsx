import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-card border-t border-border py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wider select-none">
      <div>
        &copy; {new Date().getFullYear()} TransitOps. Smart Transport Operations.
      </div>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
        <span className="normal-case font-bold text-text-main text-[11px]">All systems operational</span>
      </div>
    </footer>
  );
};

export default Footer;
