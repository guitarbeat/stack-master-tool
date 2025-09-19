import React, { useState, useEffect } from 'react';
import { RefreshCw, Wifi, WifiOff, Clock, AlertTriangle } from 'lucide-react';
import { AppError, ErrorType, ErrorCode } from '../utils/errorHandling';

interface ErrorRecoveryProps {
  error: AppError;
  onRetry: () => void;
  onGoHome?: () => void;
  maxRetries?: number;
  retryDelay?: number;
  className?: string;
}

export const ErrorRecovery: React.FC<ErrorRecoveryProps> = ({
  error,
  onRetry,
  onGoHome,
  maxRetries = 3,
  retryDelay = 2000,
  className = ''
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [nextRetryIn, setNextRetryIn] = useState(0);

  const isRetryable = error.details.retryable;
  const canRetry = isRetryable && retryCount < maxRetries;

  // Auto-retry for certain error types
  useEffect(() => {
    if (isRetryable && retryCount === 0) {
      const autoRetryErrors = [
        ErrorCode.CONNECTION_FAILED,
        ErrorCode.NETWORK_TIMEOUT,
        ErrorCode.WEBSOCKET_DISCONNECTED,
        ErrorCode.SERVER_UNREACHABLE
      ];

      if (autoRetryErrors.includes(error.details.code)) {
        const timer = setTimeout(() => {
          handleRetry();
        }, retryDelay);

        return () => clearTimeout(timer);
      }
    }
  }, [error.details.code, isRetryable, retryCount, retryDelay]);

  // Countdown timer for retry
  useEffect(() => {
    if (isRetrying && nextRetryIn > 0) {
      const timer = setTimeout(() => {
        setNextRetryIn(prev => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (isRetrying && nextRetryIn === 0) {
      handleRetry();
    }
  }, [isRetrying, nextRetryIn]);

  const handleRetry = async () => {
    if (!canRetry) return;

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      await onRetry();
      setIsRetrying(false);
    } catch (err) {
      setIsRetrying(false);
      
      // If retry failed and we have more attempts, schedule next retry
      if (retryCount < maxRetries - 1) {
        setNextRetryIn(Math.min(retryDelay / 1000, 10)); // Max 10 seconds
      }
    }
  };

  const getRetryIcon = () => {
    switch (error.details.type) {
      case ErrorType.NETWORK:
        return <Wifi className="w-4 h-4" />;
      case ErrorType.TIMEOUT:
        return <Clock className="w-4 h-4" />;
      default:
        return <RefreshCw className="w-4 h-4" />;
    }
  };

  const getRetryMessage = () => {
    if (isRetrying) {
      return nextRetryIn > 0 
        ? `Retrying in ${nextRetryIn} seconds...`
        : 'Retrying...';
    }

    if (retryCount >= maxRetries) {
      return `Failed after ${maxRetries} attempts. Please try again later.`;
    }

    if (retryCount > 0) {
      return `Retry ${retryCount}/${maxRetries}`;
    }

    return 'Try again';
  };

  if (!isRetryable) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getRetryIcon()}
          <span className="text-sm font-medium">
            {getRetryMessage()}
          </span>
        </div>
        
        {retryCount > 0 && (
          <div className="text-xs text-muted-foreground">
            Attempt {retryCount}/{maxRetries}
          </div>
        )}
      </div>

      {isRetrying && (
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
            style={{ 
              width: `${((retryDelay / 1000 - nextRetryIn) / (retryDelay / 1000)) * 100}%` 
            }}
          />
        </div>
      )}

      {canRetry && !isRetrying && (
        <div className="flex space-x-2">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
            {retryCount === 0 ? 'Try Again' : 'Retry'}
          </button>
          
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors"
            >
              Go Home
            </button>
          )}
        </div>
      )}

      {retryCount >= maxRetries && (
        <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
          <AlertTriangle className="w-4 h-4" />
          <span>Maximum retry attempts reached. Please check your connection or try again later.</span>
        </div>
      )}
    </div>
  );
};

export default ErrorRecovery;