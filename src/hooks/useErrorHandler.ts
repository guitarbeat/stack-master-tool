import { useState, useCallback, useRef, useEffect } from 'react';
import { AppError, ErrorCode, logError, getErrorDisplayInfo } from '../utils/errorHandling';
import { errorMonitor } from '../utils/errorMonitoring';

interface ErrorHandlerOptions {
  context?: string;
  onError?: (error: AppError) => void;
  onRetry?: () => void;
  maxRetries?: number;
  retryDelay?: number;
  autoRetry?: boolean;
  showToast?: boolean;
}

interface ErrorState {
  hasError: boolean;
  error?: AppError;
  retryCount: number;
  isRetrying: boolean;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const {
    context = 'Unknown',
    onError,
    onRetry,
    maxRetries = 3,
    retryDelay = 2000,
    autoRetry = false,
    showToast = true
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    retryCount: 0,
    isRetrying: false
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryAttemptsRef = useRef(0);

  // Clear retry timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const handleError = useCallback((error: Error | AppError, customContext?: string) => {
    const appError = error instanceof AppError ? error : new AppError(ErrorCode.UNKNOWN, error);
    const errorContext = customContext || context;

    // Log the error
    logError(appError, errorContext);

    // Track the error
    errorMonitor.trackError(appError, errorContext);

    // Update error state
    setErrorState(prev => ({
      ...prev,
      hasError: true,
      error: appError,
      retryCount: retryAttemptsRef.current
    }));

    // Call custom error handler
    if (onError) {
      onError(appError);
    }

    // Auto-retry for certain error types
    if (autoRetry && appError.details.retryable && retryAttemptsRef.current < maxRetries) {
      scheduleRetry();
    }
  }, [context, onError, onRetry, maxRetries, retryDelay, autoRetry]);

  const scheduleRetry = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    retryTimeoutRef.current = setTimeout(() => {
      retryAttemptsRef.current++;
      setErrorState(prev => ({ ...prev, isRetrying: true }));

      if (onRetry) {
        try {
          onRetry();
        } catch (error) {
          handleError(error as Error, `${context}_retry_${retryAttemptsRef.current}`);
        }
      }
    }, retryDelay);
  }, [onRetry, retryDelay, context]);

  const retry = useCallback(() => {
    if (retryAttemptsRef.current >= maxRetries) {
      return;
    }

    retryAttemptsRef.current++;
    setErrorState(prev => ({ ...prev, isRetrying: true }));

    if (onRetry) {
      try {
        onRetry();
      } catch (error) {
        handleError(error as Error, `${context}_manual_retry_${retryAttemptsRef.current}`);
      }
    }
  }, [onRetry, maxRetries, context]);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      retryCount: 0,
      isRetrying: false
    });
    retryAttemptsRef.current = 0;

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearError();
  }, [clearError]);

  // Wrapper for async operations
  const withErrorHandling = useCallback(<T extends any[], R>(
    asyncFn: (...args: T) => Promise<R>
  ) => {
    return async (...args: T): Promise<R | undefined> => {
      try {
        clearError();
        const result = await asyncFn(...args);
        return result;
      } catch (error) {
        handleError(error as Error);
        return undefined;
      }
    };
  }, [handleError, clearError]);

  // Wrapper for sync operations
  const withSyncErrorHandling = useCallback(<T extends any[], R>(
    syncFn: (...args: T) => R
  ) => {
    return (...args: T): R | undefined => {
      try {
        clearError();
        const result = syncFn(...args);
        return result;
      } catch (error) {
        handleError(error as Error);
        return undefined;
      }
    };
  }, [handleError, clearError]);

  const getErrorInfo = useCallback(() => {
    if (!errorState.error) return null;
    return getErrorDisplayInfo(errorState.error);
  }, [errorState.error]);

  const canRetry = useCallback(() => {
    return errorState.error?.details.retryable && retryAttemptsRef.current < maxRetries;
  }, [errorState.error, maxRetries]);

  return {
    // Error state
    hasError: errorState.hasError,
    error: errorState.error,
    retryCount: errorState.retryCount,
    isRetrying: errorState.isRetrying,
    
    // Error info
    errorInfo: getErrorInfo(),
    canRetry: canRetry(),
    
    // Actions
    handleError,
    retry,
    clearError,
    reset,
    
    // Wrappers
    withErrorHandling,
    withSyncErrorHandling
  };
};

export default useErrorHandler;