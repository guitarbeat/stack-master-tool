// Error monitoring and analytics utilities
import { AppError, ErrorType, ErrorCode } from './errorHandling';

interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Record<ErrorType, number>;
  errorsByCode: Record<ErrorCode, number>;
  errorsByContext: Record<string, number>;
  recentErrors: Array<{
    timestamp: string;
    type: ErrorType;
    code: ErrorCode;
    context?: string;
    message: string;
  }>;
}

class ErrorMonitor {
  private metrics: ErrorMetrics = {
    totalErrors: 0,
    errorsByType: {} as Record<ErrorType, number>,
    errorsByCode: {} as Record<ErrorCode, number>,
    errorsByContext: {},
    recentErrors: []
  };

  private maxRecentErrors = 50;

  // Track an error occurrence
  trackError(error: AppError | Error, context?: string) {
    this.metrics.totalErrors++;

    if (error instanceof AppError) {
      const { type, code } = error.details;
      
      // Track by type
      this.metrics.errorsByType[type] = (this.metrics.errorsByType[type] || 0) + 1;
      
      // Track by code
      this.metrics.errorsByCode[code] = (this.metrics.errorsByCode[code] || 0) + 1;
      
      // Track by context
      if (context) {
        this.metrics.errorsByContext[context] = (this.metrics.errorsByContext[context] || 0) + 1;
      }
      
      // Add to recent errors
      this.metrics.recentErrors.unshift({
        timestamp: error.details.timestamp,
        type,
        code,
        context,
        message: error.details.message
      });
    } else {
      // Track unknown errors
      this.metrics.errorsByType[ErrorType.UNKNOWN] = (this.metrics.errorsByType[ErrorType.UNKNOWN] || 0) + 1;
      
      if (context) {
        this.metrics.errorsByContext[context] = (this.metrics.errorsByContext[context] || 0) + 1;
      }
      
      this.metrics.recentErrors.unshift({
        timestamp: new Date().toISOString(),
        type: ErrorType.UNKNOWN,
        code: 'UNKNOWN' as ErrorCode,
        context,
        message: error.message
      });
    }

    // Keep only recent errors
    if (this.metrics.recentErrors.length > this.maxRecentErrors) {
      this.metrics.recentErrors = this.metrics.recentErrors.slice(0, this.maxRecentErrors);
    }

    // Send to external monitoring service in production
    this.sendToMonitoringService(error, context);
  }

  // Get current error metrics
  getMetrics(): ErrorMetrics {
    return { ...this.metrics };
  }

  // Get error rate (errors per minute)
  getErrorRate(): number {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    
    const recentCount = this.metrics.recentErrors.filter(
      error => new Date(error.timestamp) > oneMinuteAgo
    ).length;
    
    return recentCount;
  }

  // Get most common error types
  getTopErrorTypes(limit: number = 5): Array<{ type: ErrorType; count: number }> {
    return Object.entries(this.metrics.errorsByType)
      .map(([type, count]) => ({ type: type as ErrorType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // Get most common error codes
  getTopErrorCodes(limit: number = 5): Array<{ code: ErrorCode; count: number }> {
    return Object.entries(this.metrics.errorsByCode)
      .map(([code, count]) => ({ code: code as ErrorCode, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // Get most common error contexts
  getTopErrorContexts(limit: number = 5): Array<{ context: string; count: number }> {
    return Object.entries(this.metrics.errorsByContext)
      .map(([context, count]) => ({ context, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // Clear metrics (useful for testing)
  clearMetrics() {
    this.metrics = {
      totalErrors: 0,
      errorsByType: {} as Record<ErrorType, number>,
      errorsByCode: {} as Record<ErrorCode, number>,
      errorsByContext: {},
      recentErrors: []
    };
  }

  // Send error to external monitoring service
  private sendToMonitoringService(error: AppError | Error, context?: string) {
    // In production, integrate with services like Sentry, LogRocket, or DataDog
    if (process.env.NODE_ENV === 'production') {
      const errorData = {
        timestamp: new Date().toISOString(),
        context,
        userAgent: navigator.userAgent,
        url: window.location.href,
        error: error instanceof AppError ? {
          type: error.details.type,
          code: error.details.code,
          message: error.details.message,
          retryable: error.details.retryable
        } : {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      };

      // Example: Send to Sentry
      // Sentry.captureException(error, { extra: errorData });

      // Example: Send to custom analytics endpoint
      // fetch('/api/analytics/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData)
      // }).catch(console.error);
    }
  }

  // Generate error report for debugging
  generateErrorReport(): string {
    const metrics = this.getMetrics();
    const errorRate = this.getErrorRate();
    const topTypes = this.getTopErrorTypes(3);
    const topCodes = this.getTopErrorCodes(3);
    const topContexts = this.getTopErrorContexts(3);

    return `
Error Report - ${new Date().toLocaleString()}
==========================================

Total Errors: ${metrics.totalErrors}
Error Rate: ${errorRate.toFixed(2)} errors/minute

Top Error Types:
${topTypes.map(({ type, count }) => `  ${type}: ${count}`).join('\n')}

Top Error Codes:
${topCodes.map(({ code, count }) => `  ${code}: ${count}`).join('\n')}

Top Error Contexts:
${topContexts.map(({ context, count }) => `  ${context}: ${count}`).join('\n')}

Recent Errors:
${metrics.recentErrors.slice(0, 10).map(error => 
  `  [${error.timestamp}] ${error.type}/${error.code}: ${error.message}${error.context ? ` (${error.context})` : ''}`
).join('\n')}
    `.trim();
  }
}

// Create singleton instance
export const errorMonitor = new ErrorMonitor();

// Enhanced error logging function that also tracks metrics
export const trackAndLogError = (error: AppError | Error, context?: string) => {
  // Log to console
  console.error(`[${context || 'Unknown'}] Error:`, error);
  
  // Track in metrics
  errorMonitor.trackError(error, context);
  
  // Return error for re-throwing if needed
  return error;
};

// Performance monitoring for error-prone operations
export const withErrorTracking = <T extends any[], R>(
  fn: (...args: T) => R,
  context: string
) => {
  return (...args: T): R => {
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.catch((error) => {
          trackAndLogError(error, context);
          throw error;
        }) as R;
      }
      
      return result;
    } catch (error) {
      trackAndLogError(error as Error, context);
      throw error;
    }
  };
};