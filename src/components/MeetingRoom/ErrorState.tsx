import { LogOut, RefreshCw, Wifi, Clock, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ErrorDisplay } from "../ErrorDisplay";
import { AppError, ErrorCode } from "../../utils/errorHandling";
import { useState, useCallback, useEffect } from "react";

interface ErrorStateProps {
  error: string | AppError;
  onRetry?: () => void;
  showHomeButton?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export const ErrorState = ({ 
  error, 
  onRetry, 
  showHomeButton = true, 
  maxRetries = 3, 
  retryDelay = 2000 
}: ErrorStateProps) => {
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [nextRetryIn, setNextRetryIn] = useState(0);

  const handleRetry = useCallback(async () => {
    if (onRetry) {
      setIsRetrying(true);
      setRetryCount(prev => prev + 1);
      try {
        await onRetry();
        setIsRetrying(false);
      } catch (err) {
        setIsRetrying(false);
        if (retryCount < maxRetries - 1) {
          setNextRetryIn(Math.min(retryDelay / 1000, 10));
        }
      }
    } else {
      navigate('/join');
    }
  }, [onRetry, navigate, retryCount, maxRetries, retryDelay]);

  const handleGoHome = () => {
    navigate('/');
  };

  // Convert string error to AppError if needed
  const appError = typeof error === 'string' 
    ? new AppError(ErrorCode.CONNECTION_FAILED, undefined, error)
    : error;

  const isRetryable = appError.details.retryable;
  const canRetry = isRetryable && retryCount < maxRetries;

  // Auto-retry countdown
  useEffect(() => {
    if (nextRetryIn > 0) {
      const timer = setTimeout(() => {
        setNextRetryIn(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (nextRetryIn === 0 && retryCount < maxRetries) {
      handleRetry();
    }
  }, [nextRetryIn, retryCount, maxRetries, handleRetry]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md mx-auto dark:bg-zinc-900 dark:border dark:border-zinc-800">
        <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
          <LogOut className="w-8 h-8 text-red-600 mx-auto" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 mb-4">Connection Error</h2>
        
        <div className="mb-6">
          <ErrorDisplay 
            error={appError}
            onRetry={canRetry ? handleRetry : undefined}
            onGoHome={showHomeButton ? handleGoHome : undefined}
            showDetails={false}
          />
        </div>

        {/* Enhanced recovery options */}
        {isRetryable && (
          <div className="space-y-4">
            {canRetry && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Retry ({retryCount}/{maxRetries})
                  </>
                )}
              </button>
            )}

            {nextRetryIn > 0 && (
              <p className="text-sm text-muted-foreground">
                Auto-retry in {nextRetryIn}s
              </p>
            )}

            {!canRetry && retryCount >= maxRetries && (
              <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Max retries reached. Please check your connection.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};