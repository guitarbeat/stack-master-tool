import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { AppError, getErrorDisplayInfo, logError, ErrorType } from '../utils/errorHandling';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
  className?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

class ErrorBoundaryWrapper extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  public override state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { 
      hasError: true, 
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    logError(error, 'ErrorBoundary');
    
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  public override componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetOnPropsChange && resetKeys) {
        this.resetErrorBoundary();
      }
    }
  }

  public override componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({ hasError: false });
  };

  private handleRetry = () => {
    this.resetErrorBoundary();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleReportBug = () => {
    const error = this.state.error;
    const errorInfo = this.state.errorInfo;
    
    if (error && errorInfo) {
      const bugReport = {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        },
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        errorId: this.state.errorId
      };

      // In a real app, you would send this to your error reporting service
      console.log('Bug Report:', bugReport);
      
      // For now, copy to clipboard
      navigator.clipboard.writeText(JSON.stringify(bugReport, null, 2));
      alert('Bug report copied to clipboard. Please send this to support.');
    }
  };

  public override render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const error = this.state.error || new Error('Unknown error');
      const errorInfo = getErrorDisplayInfo(error);
      const errorType = error instanceof AppError ? error.details.type : ErrorType.UNKNOWN;

      return (
        <div className={`min-h-screen flex items-center justify-center bg-background p-4 ${this.props.className || ''}`}>
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">{errorInfo.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                {errorInfo.description}
              </p>
              
              {errorInfo.action && (
                <p className="text-center text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  💡 {errorInfo.action}
                </p>
              )}

              {/* Error Details */}
              <details className="text-sm text-muted-foreground">
                <summary className="cursor-pointer hover:text-foreground">
                  Technical Details
                </summary>
                <div className="mt-2 space-y-2 bg-muted/30 p-3 rounded">
                  <div>
                    <strong>Error ID:</strong> {this.state.errorId}
                  </div>
                  <div>
                    <strong>Error Type:</strong> {errorType}
                  </div>
                  <div>
                    <strong>Timestamp:</strong> {new Date().toLocaleString()}
                  </div>
                  {error instanceof AppError && (
                    <>
                      <div>
                        <strong>Error Code:</strong> {error.details.code}
                      </div>
                      <div>
                        <strong>Severity:</strong> {error.details.severity || 'medium'}
                      </div>
                      <div>
                        <strong>Retryable:</strong> {error.details.retryable ? 'Yes' : 'No'}
                      </div>
                    </>
                  )}
                  <div>
                    <strong>Message:</strong> {error.message}
                  </div>
                  {error.stack && (
                    <div>
                      <strong>Stack Trace:</strong>
                      <pre className="mt-1 text-xs whitespace-pre-wrap break-words">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {errorInfo.retryable && (
                  <Button onClick={this.handleRetry} className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                )}
                
                <div className="flex gap-2">
                  <Button onClick={this.handleReload} variant="outline" className="flex-1">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reload Page
                  </Button>
                  <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                    <Home className="mr-2 h-4 w-4" />
                    Go Home
                  </Button>
                </div>

                <Button onClick={this.handleReportBug} variant="ghost" size="sm">
                  <Bug className="mr-2 h-4 w-4" />
                  Report Bug
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundaryWrapper;