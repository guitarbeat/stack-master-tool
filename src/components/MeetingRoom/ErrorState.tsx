import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ErrorStateProps {
  error: string;
}

export const ErrorState = ({ error }: ErrorStateProps) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md mx-auto dark:bg-zinc-900 dark:border dark:border-zinc-800">
        <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
          <LogOut className="w-8 h-8 text-red-600 mx-auto" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 mb-2">Connection Error</h2>
        <p className="text-gray-600 dark:text-zinc-400 mb-6">{error}</p>
        <button
          onClick={() => navigate('/join')}
          className="bg-red-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};