import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Reusable dynamic Breadcrumb navigation.
 */
const Breadcrumb = ({ className = '' }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);

  const formatSegment = (str) => {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <nav className={`flex items-center space-x-1.5 text-[11px] font-bold text-text-secondary uppercase tracking-wider ${className}`} aria-label="Breadcrumb">
      <Link to="/" className="hover:text-text-main flex items-center gap-1 transition-colors">
        <Home size={12} className="text-text-secondary" />
        <span>TransitOps</span>
      </Link>

      <ChevronRight size={12} className="text-text-secondary/45" />

      {pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard') ? (
        <span className="text-text-main font-black select-none">Dashboard</span>
      ) : (
        <>
          <Link to="/dashboard" className="hover:text-text-main transition-colors">
            Dashboard
          </Link>
          {pathnames.map((value, index) => {
            if (value === 'dashboard') return null;
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            const label = formatSegment(value);

            return (
              <React.Fragment key={to}>
                <ChevronRight size={12} className="text-text-secondary/45 flex-shrink-0" />
                {isLast ? (
                  <span className="text-text-main font-black select-none">{label}</span>
                ) : (
                  <Link to={to} className="hover:text-text-main transition-colors">
                    {label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </>
      )}
    </nav>
  );
};

export default Breadcrumb;
export { Breadcrumb };
