import { Loader2 } from "lucide-react";

export const LoadingState = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl p-8 shadow-lg text-center dark:bg-zinc-900 dark:border dark:border-zinc-800">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 mb-2">Connecting to meeting...</h2>
        <p className="text-gray-600 dark:text-zinc-400">Please wait while we connect you to the meeting room.</p>
      </div>
    </div>
  );
};