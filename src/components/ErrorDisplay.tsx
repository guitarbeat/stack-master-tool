import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff, Clock, Shield, XCircle, AlertCircle, Info, AlertOctagon } from 'lucide-react';
import { AppError, getErrorDisplayInfo, ErrorType } from '../utils/errorHandling';

interface ErrorDisplayProps {
  error: AppError | Error;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
  showDetails?: boolean;
}

const getErrorIcon = (errorType: ErrorType, severity?: 'low' | 'medium' | 'high') => {
  const iconClass = "w-6 h-6";
  
  switch (errorType) {
    case ErrorType.NETWORK:
      return <WifiOff className={iconClass} />;
    case ErrorType.TIMEOUT:
      return <Clock className={iconClass} />;
    case ErrorType.AUTHENTICATION:
    case ErrorType.AUTHORIZATION:
      return <Shield className={iconClass} />;
    case ErrorType.VALIDATION:
      return <XCircle className={iconClass} />;
    case ErrorType.SERVER:
      return severity === 'high' ? <AlertOctagon className={iconClass} /> : <AlertCircle className={iconClass} />;
    default:
      return severity === 'high' ? <AlertOctagon className={iconClass} /> : <AlertTriangle className={iconClass} />;
  }
};

const getErrorColor = (errorType: ErrorType, severity?: 'low' | 'medium' | 'high') => {
  const baseColors = {
    [ErrorType.NETWORK]: 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-900/40',
    [ErrorType.TIMEOUT]: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-900/40',
    [ErrorType.AUTHENTICATION]: 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-900/40',
    [ErrorType.AUTHORIZATION]: 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-900/40',
    [ErrorType.VALIDATION]: 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-900/40',
    [ErrorType.SERVER]: 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-900/40',
    [ErrorType.NOT_FOUND]: 'text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-900/20 dark:border-purple-900/40',
    [ErrorType.CONFLICT]: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-900/40',
    [ErrorType.UNKNOWN]: 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-900/20 dark:border-gray-900/40'
  };

  let colorClass = baseColors[errorType] || baseColors[ErrorType.UNKNOWN];

  // Adjust intensity based on severity
  if (severity === 'high') {
    colorClass = colorClass.replace('50', '100').replace('200', '300');
  } else if (severity === 'low') {
    colorClass = colorClass.replace('50', '25').replace('200', '100');
  }

  return colorClass;
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
  const severity = error instanceof AppError ? error.details.severity : 'medium';

  return (
    <div className={`rounded-lg border p-4 ${getErrorColor(errorType, severity)} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {getErrorIcon(errorType, severity)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-medium">
              {errorInfo.title}
            </h3>
            {severity && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                severity === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                severity === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
              }`}>
                {severity.toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-sm mb-3">
            {errorInfo.description}
          </p>
          
          {errorInfo.action && (
            <div className="flex items-start space-x-2 mb-3">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-xs opacity-90">
                {errorInfo.action}
              </p>
            </div>
          )}

          {showDetails && error instanceof AppError && (
            <details className="text-xs opacity-75 mb-3">
              <summary className="cursor-pointer hover:opacity-100 flex items-center">
                <span>Technical Details</span>
                <span className="ml-1 text-xs">▼</span>
              </summary>
              <div className="mt-2 space-y-1 bg-black/5 dark:bg-white/5 p-2 rounded">
                <div><strong>Code:</strong> {error.details.code}</div>
                <div><strong>Type:</strong> {error.details.type}</div>
                <div><strong>Severity:</strong> {severity}</div>
                <div><strong>Retryable:</strong> {isRetryable ? 'Yes' : 'No'}</div>
                <div><strong>Timestamp:</strong> {new Date(error.details.timestamp).toLocaleString()}</div>
                {error.details.originalError && (
                  <div><strong>Original Error:</strong> {error.details.originalError.message}</div>
                )}
              </div>
            </details>
          )}

          <div className="flex gap-2 flex-wrap">
            {isRetryable && onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-white/50 hover:bg-white/70 transition-colors border border-white/20"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Try Again
              </button>
            )}
            {onGoHome && (
              <button
                onClick={onGoHome}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-white/50 hover:bg-white/70 transition-colors border border-white/20"
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