import React from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff, Clock, Shield, XCircle } from 'lucide-react';
import { AppError, getErrorDisplayInfo, ErrorType } from '../utils/errorHandling';

interface ErrorDisplayProps {
  error: AppError | Error;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
  showDetails?: boolean;
}

const getErrorIcon = (errorType: ErrorType) => {
  switch (errorType) {
    case ErrorType.NETWORK:
      return <WifiOff className="w-6 h-6" />;
    case ErrorType.TIMEOUT:
      return <Clock className="w-6 h-6" />;
    case ErrorType.AUTHENTICATION:
    case ErrorType.AUTHORIZATION:
      return <Shield className="w-6 h-6" />;
    case ErrorType.VALIDATION:
      return <XCircle className="w-6 h-6" />;
    default:
      return <AlertTriangle className="w-6 h-6" />;
  }
};

const getErrorColor = (errorType: ErrorType) => {
  switch (errorType) {
    case ErrorType.NETWORK:
      return 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-900/40';
    case ErrorType.TIMEOUT:
      return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-900/40';
    case ErrorType.AUTHENTICATION:
    case ErrorType.AUTHORIZATION:
      return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-900/40';
    case ErrorType.VALIDATION:
      return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-900/40';
    default:
      return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-900/40';
  }
};

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onGoHome,
  className = '',
  showDetails = false
}) => {
  const errorInfo = getErrorDisplayInfo(error);
  const errorType = error instanceof AppError ? error.details.type : ErrorType.UNKNOWN;
  const isRetryable = error instanceof AppError ? error.details.retryable : true;

  return (
    <div className={`rounded-lg border p-4 ${getErrorColor(errorType)} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {getErrorIcon(errorType)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium mb-1">
            {errorInfo.title}
          </h3>
          <p className="text-sm mb-3">
            {errorInfo.description}
          </p>
          
          {errorInfo.action && (
            <p className="text-xs opacity-90 mb-3">
              💡 {errorInfo.action}
            </p>
          )}

          {showDetails && error instanceof AppError && (
            <details className="text-xs opacity-75 mb-3">
              <summary className="cursor-pointer hover:opacity-100">
                Technical Details
              </summary>
              <div className="mt-2 space-y-1">
                <div><strong>Code:</strong> {error.details.code}</div>
                <div><strong>Type:</strong> {error.details.type}</div>
                <div><strong>Timestamp:</strong> {new Date(error.details.timestamp).toLocaleString()}</div>
                {error.details.originalError && (
                  <div><strong>Original Error:</strong> {error.details.originalError.message}</div>
                )}
              </div>
            </details>
          )}

          <div className="flex gap-2">
            {isRetryable && onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-white/50 hover:bg-white/70 transition-colors"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Try Again
              </button>
            )}
            {onGoHome && (
              <button
                onClick={onGoHome}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-white/50 hover:bg-white/70 transition-colors"
              >
                Go Home
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;