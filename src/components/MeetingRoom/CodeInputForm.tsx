import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppError, ErrorCode } from "@/utils/errorHandling";
import { validateMeetingCode } from "@/utils/meetingValidation";

interface CodeInputFormProps {
  mode: "join" | "watch";
  onError: (error: AppError | string | null) => void;
}

/**
 * * Component for entering meeting codes in join/watch modes
 * Provides a clean interface for users to enter meeting codes
 */
export function CodeInputForm({ mode, onError }: CodeInputFormProps) {
  const [codeInput, setCodeInput] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateMeetingCode(codeInput);
    if (!validation.isValid) {
      onError(new AppError(ErrorCode.INVALID_MEETING_CODE, undefined, validation.error || "Invalid meeting code"));
      return;
    }
    navigate(`/meeting?mode=${mode}&code=${validation.normalizedCode}`);
  };

  const isJoinMode = mode === "join";
  const title = isJoinMode ? "Join a Meeting" : "Watch a Meeting";
  const description = isJoinMode 
    ? "Enter the 6-character meeting code shared by the host."
    : "Enter the 6-character meeting code to observe the discussion.";
  const buttonText = isJoinMode ? "Join Meeting" : "Watch Meeting";
  const placeholder = "e.g. 54ANDG";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl border-0">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-slate-100">{title}</h1>
            <p className="text-base sm:text-sm text-slate-600 dark:text-slate-400">
              {description}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div className="space-y-3">
              <input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-4 sm:py-3 rounded-lg bg-transparent border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary text-base sm:text-sm min-h-[48px] text-slate-900 dark:text-slate-100"
                aria-label="Meeting code"
                autoComplete="off"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck="false"
              />
              <button
                type="submit"
                className="w-full py-4 sm:py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 active:bg-primary/80 min-h-[48px] text-base sm:text-sm transition-colors"
                disabled={!codeInput.trim()}
              >
                {buttonText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}