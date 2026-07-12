import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show on root dashboard or if path is empty
  if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
    return (
      <nav className="flex text-[11px] font-semibold text-text-secondary uppercase tracking-wider items-center gap-1.5" aria-label="Breadcrumb">
        <div className="flex items-center gap-1 text-text-main">
          <Home size={13} />
          <span>TransitOps</span>
        </div>
        <ChevronRight size={12} className="text-text-secondary/45" />
        <span className="text-text-secondary font-medium">Dashboard</span>
      </nav>
    );
  }

  return (
    <nav className="flex text-[11px] font-semibold text-text-secondary uppercase tracking-wider items-center gap-1.5" aria-label="Breadcrumb">
      <Link to="/" className="hover:text-text-main flex items-center gap-1 transition-colors">
        <Home size={13} />
        <span>TransitOps</span>
      </Link>
      
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const formattedName = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

        return (
          <React.Fragment key={to}>
            <ChevronRight size={12} className="text-text-secondary/45 flex-shrink-0" />
            {isLast ? (
              <span className="text-text-main font-bold select-none">{formattedName}</span>
            ) : (
              <Link to={to} className="hover:text-text-main transition-colors">
                {formattedName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
