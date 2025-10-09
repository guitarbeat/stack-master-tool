import React from 'react';

interface FocusVisibleProps {
  children: React.ReactNode;
  className?: string;
}

export function FocusVisible({ children, className = '' }: FocusVisibleProps) {
  return (
    <div className={`focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none ${className}`}>
      {children}
    </div>
  );
}

export default FocusVisible;
