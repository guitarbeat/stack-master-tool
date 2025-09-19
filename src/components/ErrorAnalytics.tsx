import React, { useState, useEffect } from 'react';
import { BarChart3, AlertTriangle, TrendingUp, Clock, Wifi, Shield, XCircle } from 'lucide-react';
import { errorMonitor } from '../utils/errorMonitoring';
import { ErrorType } from '../utils/errorHandling';

interface ErrorAnalyticsProps {
  className?: string;
  showDetails?: boolean;
}

export const ErrorAnalytics: React.FC<ErrorAnalyticsProps> = ({
  className = '',
  showDetails = false
}) => {
  const [metrics, setMetrics] = useState(errorMonitor.getMetrics());
  const [errorRate, setErrorRate] = useState(errorMonitor.getErrorRate());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(errorMonitor.getMetrics());
      setErrorRate(errorMonitor.getErrorRate());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getErrorTypeIcon = (type: ErrorType) => {
    switch (type) {
      case ErrorType.NETWORK:
        return <Wifi className="w-4 h-4" />;
      case ErrorType.VALIDATION:
        return <XCircle className="w-4 h-4" />;
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return <Shield className="w-4 h-4" />;
      case ErrorType.TIMEOUT:
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getErrorTypeColor = (type: ErrorType) => {
    switch (type) {
      case ErrorType.NETWORK:
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case ErrorType.VALIDATION:
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case ErrorType.TIMEOUT:
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case ErrorType.SERVER:
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case ErrorType.NOT_FOUND:
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      case ErrorType.CONFLICT:
        return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const topErrorTypes = errorMonitor.getTopErrorTypes(5);
  const topErrorCodes = errorMonitor.getTopErrorCodes(5);
  const topErrorContexts = errorMonitor.getTopErrorContexts(5);

  if (!showDetails && metrics.totalErrors === 0) {
    return null;
  }

  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
            Error Analytics
          </h3>
        </div>
        {showDetails && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
            {metrics.totalErrors}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Errors</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {errorRate.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Errors/min</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Object.keys(metrics.errorsByType).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Error Types</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Object.keys(metrics.errorsByContext).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Contexts</div>
        </div>
      </div>

      {/* Top Error Types */}
      {topErrorTypes.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Top Error Types
          </h4>
          <div className="space-y-2">
            {topErrorTypes.map(({ type, count }) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getErrorTypeIcon(type)}
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {type.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getErrorTypeColor(type).split(' ')[0].replace('text-', 'bg-')}`}
                      style={{ width: `${(count / metrics.totalErrors) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-zinc-100 w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && showDetails && (
        <div className="space-y-4">
          {/* Top Error Codes */}
          {topErrorCodes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Top Error Codes
              </h4>
              <div className="space-y-1">
                {topErrorCodes.map(({ code, count }) => (
                  <div key={code} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 font-mono">
                      {code}
                    </span>
                    <span className="text-gray-900 dark:text-zinc-100 font-medium">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Error Contexts */}
          {topErrorContexts.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Top Error Contexts
              </h4>
              <div className="space-y-1">
                {topErrorContexts.map(({ context, count }) => (
                  <div key={context} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {context || 'Unknown'}
                    </span>
                    <span className="text-gray-900 dark:text-zinc-100 font-medium">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Errors */}
          {metrics.recentErrors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recent Errors
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {metrics.recentErrors.slice(0, 10).map((error, index) => (
                  <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-mono">
                      {new Date(error.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="mx-2">•</span>
                    <span className="font-medium">{error.type}</span>
                    <span className="mx-1">•</span>
                    <span className="font-mono">{error.code}</span>
                    {error.context && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{error.context}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Report */}
          <div className="pt-4 border-t border-gray-200 dark:border-zinc-700">
            <button
              onClick={() => {
                const report = errorMonitor.generateErrorReport();
                navigator.clipboard.writeText(report);
                alert('Error report copied to clipboard');
              }}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Copy Error Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorAnalytics;