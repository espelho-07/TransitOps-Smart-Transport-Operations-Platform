import React, { useState, useEffect } from 'react';
import { Truck } from 'lucide-react';

/**
 * High-fidelity fallback illustration for vehicles
 */
export const VehiclePlaceholder = ({ size = 40, className = '' }) => {
  return (
    <div
      className={`bg-hover/80 border border-border/80 flex items-center justify-center text-text-secondary/70 shadow-xs select-none flex-shrink-0 ${className}`}
      style={{ width: size, height: size, borderRadius: '8px' }}
    >
      <Truck size={Math.max(14, Math.round(size * 0.45))} strokeWidth={1.75} />
    </div>
  );
};

/**
 * Graceful vehicle image loader that handles error states
 */
export const VehicleImage = ({ src, alt = 'Vehicle', size = 40, className = '' }) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  if (src && !error) {
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setError(true)}
        className={`object-cover shadow-xs border border-border/80 hover:border-info/20 transition-all duration-200 select-none ${className}`}
        style={{ width: size, height: size, borderRadius: '8px' }}
        loading="lazy"
      />
    );
  }

  return <VehiclePlaceholder size={size} className={className} />;
};

/**
 * Graceful driver avatar circle with initials fallback
 */
export const DriverAvatar = ({ name = '?', avatarUrl, size = 36, className = '' }) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [avatarUrl]);

  // Extract Initials
  const initials = React.useMemo(() => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [name]);

  // Dynamic consistent style based on initials hash
  const styleClasses = React.useMemo(() => {
    const styles = [
      'bg-info/10 text-info border-info/30',
      'bg-success/10 text-success border-success/30',
      'bg-warning/10 text-warning border-warning/30',
      'bg-danger/10 text-danger border-danger/30',
      'bg-indigo-500/10 text-indigo-500 border-indigo-500/30',
      'bg-purple-500/10 text-purple-500 border-purple-500/30'
    ];
    let sum = 0;
    for (let i = 0; i < initials.length; i++) {
      sum += initials.charCodeAt(i);
    }
    return styles[sum % styles.length];
  }, [initials]);

  if (avatarUrl && !error) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        onError={() => setError(true)}
        className={`object-cover rounded-full border border-border/80 shadow-xs flex-shrink-0 select-none ${className}`}
        style={{ width: size, height: size }}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold tracking-tight select-none border text-center flex-shrink-0 ${styleClasses} ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(9, Math.round(size * 0.36))
      }}
    >
      {initials}
    </div>
  );
};
