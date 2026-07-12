import React from 'react';
import { AlertCircle, ShieldAlert, WifiOff, FileSearch } from 'lucide-react';
import Button from '../Button';

/**
 * Reusable full-viewport Error templates.
 * @param {Object} props
 * @param {'404'|'500'|'network'|'permission'} props.code - Diagnostic codes
 * @param {string} props.title - Title header overrides
 * @param {string} props.message - Descriptive log details
 * @param {function} props.onActionClick - Action callback (e.g. reload or home)
 */
const ErrorState = ({
  code = '404',
  title,
  message,
  actionText = 'Go Back Home',
  onActionClick,
  className = ''
}) => {
  const getMeta = () => {
    switch (code) {
      case '500':
        return {
          icon: AlertCircle,
          color: 'text-danger',
          title: title || '500 - Internal Server Error',
          message: message || 'The database or runtime encountered a serious crash. Please try again shortly.'
        };
      case 'network':
        return {
          icon: WifiOff,
          color: 'text-warning',
          title: title || 'Network Disconnection',
          message: message || 'Unable to establish connections with server gateway APIs. Check your local connections.'
        };
      case 'permission':
        return {
          icon: ShieldAlert,
          color: 'text-danger',
          title: title || 'Permission Denied',
          message: message || 'Your operator profile does not possess necessary credentials to read this directory.'
        };
      case '404':
      default:
        return {
          icon: FileSearch,
          color: 'text-info',
          title: title || '404 - Page Not Found',
          message: message || 'The route segment or document ID you look for does not exist in TransitOps database.'
        };
    }
  };

  const meta = getMeta();
  const Icon = meta.icon;

  return (
    <div className={`flex flex-col items-center justify-center text-center p-12 min-h-[60vh] ${className}`}>
      <div className={`p-5 bg-hover rounded-2xl mb-5 flex items-center justify-center ${meta.color}`}>
        <Icon size={40} strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-black text-text-main tracking-tight leading-tight">
        {meta.title}
      </h2>
      <p className="text-xs sm:text-sm text-text-secondary mt-2 max-w-sm leading-relaxed font-semibold">
        {meta.message}
      </p>
      {onActionClick && (
        <Button
          variant="outline"
          size="md"
          onClick={onActionClick}
          className="mt-6"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
export { ErrorState };
