import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';

interface UnifiedToastProviderProps {
  children: React.ReactNode;
}

export function UnifiedToastProvider({ children }: UnifiedToastProviderProps) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}

export default UnifiedToastProvider;