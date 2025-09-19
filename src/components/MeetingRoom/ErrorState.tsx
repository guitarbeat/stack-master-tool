import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ErrorDisplay } from "../ErrorDisplay";
import { AppError } from "../../utils/errorHandling";

interface ErrorStateProps {
  error: string | AppError;
}

export const ErrorState = ({ error }: ErrorStateProps) => {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate('/join');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  // Convert string error to AppError if needed
  const appError = typeof error === 'string' 
    ? new AppError('CONNECTION_FAILED', undefined, error)
    : error;

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
            onRetry={handleRetry}
            onGoHome={handleGoHome}
            showDetails={false}
          />
        </div>
      </div>
    </div>
  );
};