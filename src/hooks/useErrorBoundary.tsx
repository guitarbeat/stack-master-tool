import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useErrorBoundary = () => {
  const location = useLocation();

  useEffect(() => {
    // Clear any potential errors when route changes
    if (window.location.pathname !== location.pathname) {
      // Force a clean navigation
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location.pathname]);
};