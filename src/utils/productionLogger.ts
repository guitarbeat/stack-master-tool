// Production logging utility
// Provides structured logging for production environments

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
}

class ProductionLogger {
  private level: LogLevel = LogLevel.INFO;
  private isProduction = import.meta.env.PROD;
  private enableAnalytics = import.meta.env.VITE_ENABLE_ANALYTICS === "true";

  constructor() {
    // Set log level based on environment
    if (import.meta.env.DEV) {
      this.level = LogLevel.DEBUG;
    } else if (this.isProduction) {
      this.level = LogLevel.WARN; // Only warnings and errors in production
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    data?: any,
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    };
  }

  private getUserId(): string | undefined {
    // Get from Supabase auth or local storage
    try {
      const authData = localStorage.getItem("sb-auth-token");
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed?.user?.id;
      }
    } catch {
      // Ignore parsing errors
    }
    return undefined;
  }

  private getSessionId(): string | undefined {
    // Generate or retrieve session ID
    let sessionId = sessionStorage.getItem("session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("session_id", sessionId);
    }
    return sessionId;
  }

  private log(entry: LogEntry): void {
    // Console logging (will be stripped in production builds)
    const levelName = LogLevel[entry.level];
    const logMethod =
      entry.level >= LogLevel.ERROR
        ? "error"
        : entry.level >= LogLevel.WARN
          ? "warn"
          : "log";

    if (!this.isProduction) {
      console[logMethod](`[${levelName}] ${entry.message}`, entry.data || "");
    }

    // Send to analytics/monitoring service in production
    if (
      this.enableAnalytics &&
      this.isProduction &&
      entry.level >= LogLevel.WARN
    ) {
      this.sendToAnalytics(entry);
    }
  }

  private async sendToAnalytics(entry: LogEntry): Promise<void> {
    try {
      // Send to analytics service (e.g., Google Analytics, Sentry, etc.)
      // This is a placeholder - implement based on your analytics provider
      if (import.meta.env.VITE_SENTRY_DSN) {
        // Sentry integration
        console.warn("Analytics event:", entry);
      }

      // Could also send to custom endpoint
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry),
      // });
    } catch (error) {
      // Don't log analytics errors to avoid infinite loops
      console.error("Failed to send analytics:", error);
    }
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.log(this.formatMessage(LogLevel.DEBUG, message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.log(this.formatMessage(LogLevel.INFO, message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.log(this.formatMessage(LogLevel.WARN, message, data));
    }
  }

  error(message: string, error?: Error | any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry = this.formatMessage(LogLevel.ERROR, message, {
        error: error?.message || error,
        stack: error?.stack,
        ...error,
      });
      this.log(entry);
    }
  }

  // Performance monitoring
  performance(metric: string, value: number, data?: any): void {
    this.info(`Performance: ${metric}`, { value, ...data });
  }

  // User action tracking
  userAction(action: string, data?: any): void {
    this.info(`User Action: ${action}`, data);
  }

  // Error boundary logging
  errorBoundary(error: Error, errorInfo: any): void {
    this.error("Error Boundary Caught", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
    });
  }
}

// Export singleton instance
export const logger = new ProductionLogger();

// Convenience functions for common use cases
export const logError = logger.error.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logInfo = logger.info.bind(logger);
export const logDebug = logger.debug.bind(logger);
export const logPerformance = logger.performance.bind(logger);
export const logUserAction = logger.userAction.bind(logger);
