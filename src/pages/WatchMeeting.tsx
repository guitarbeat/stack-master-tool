import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import apiService from "../services/api";
import { toast } from "@/hooks/use-toast";
import { playBeep } from "../utils/sound.js";
import { AppError, getErrorDisplayInfo } from "../utils/errorHandling";
import { useValidation, validationRules } from "../utils/validation";

interface FormData {
  meetingCode: string;
  watcherName: string;
}

function WatchMeeting(): JSX.Element {
  const navigate = useNavigate();
  const notify = (
    type: "success" | "error" | "info",
    title: string,
    description?: string
  ) => {
    toast({ title, description });
  };
  const [formData, setFormData] = useState<FormData>({
    meetingCode: "",
    watcherName: "",
  });
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [meetingInfo, setMeetingInfo] = useState<{
    title: string;
    code: string;
    facilitator: string;
  } | null>(null);

  // Real-time validation
  const meetingCodeValidation = useValidation(
    formData.meetingCode,
    [validationRules.meetingCode()],
    500
  );

  const watcherNameValidation = useValidation(
    formData.watcherName,
    [validationRules.participantName()],
    300
  );

  // Real-time validation for meeting code
  React.useEffect(() => {
    const validateMeetingCode = async () => {
      if (formData.meetingCode.length === 6 && meetingCodeValidation.isValid) {
        try {
          const meeting = await apiService.getMeeting(formData.meetingCode);
          setMeetingInfo(meeting);
          setError("");
        } catch (err) {
          setError("Meeting not found. Please check the code and try again.");
        }
      } else if (formData.meetingCode.length > 0) {
        setError("");
      } else {
        setError("");
      }
    };

    const timeoutId = setTimeout(validateMeetingCode, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.meetingCode, meetingCodeValidation.isValid]);

  const handleWatchMeeting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsJoining(true);
    setError("");

    // Validate form before submission
    if (!meetingCodeValidation.isValid || !watcherNameValidation.isValid) {
      setError("Please fix the validation errors before watching.");
      setIsJoining(false);
      return;
    }

    try {
      const meetingInfo = await apiService.getMeeting(formData.meetingCode);

      notify("success", "Joining meeting as watcher", meetingInfo.title);
      playBeep(1000, 120);

      navigate(`/meeting/${formData.meetingCode}?mode=watch`, {
        state: {
          watcherName: formData.watcherName,
          meetingInfo: meetingInfo,
        },
      });
    } catch (err) {
      console.error("Error joining meeting as watcher:", err);

      const errorInfo = getErrorDisplayInfo(err as AppError);
      setError(errorInfo.description);
      notify("error", errorInfo.title, errorInfo.description);
      playBeep(220, 200);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Go back to home page"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
          <div className="text-center mb-8">
            <div className="bg-primary/20 p-4 rounded-full w-16 h-16 mx-auto mb-4">
              <Eye className="w-8 h-8 text-primary mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100 mb-2">
              Watch Meeting
            </h1>
            <p className="text-gray-600 dark:text-zinc-400">
              Enter the meeting code to observe in read-only mode
            </p>
          </div>

          <form onSubmit={handleWatchMeeting} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-900/40">
                <p className="text-red-600 dark:text-red-300 text-sm">
                  {error}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                Meeting Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={isJoining}
                  value={formData.meetingCode}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      meetingCode: e.target.value.toUpperCase(),
                    }))
                  }
                  className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-center text-2xl font-bold tracking-wider disabled:bg-gray-100 dark:bg-zinc-950 dark:text-zinc-100 form-input ${
                    meetingCodeValidation.isValid &&
                    formData.meetingCode.length === 6
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : !meetingCodeValidation.isValid &&
                          formData.meetingCode.length > 0
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "border-gray-300 dark:border-zinc-800"
                  }`}
                  placeholder="ABC123"
                  maxLength={6}
                  aria-describedby="meeting-code-status"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {meetingCodeValidation.isValidating && (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  )}
                  {meetingCodeValidation.isValid &&
                    formData.meetingCode.length === 6 && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  {!meetingCodeValidation.isValid &&
                    formData.meetingCode.length > 0 && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                </div>
              </div>
              {meetingCodeValidation.isValid &&
                formData.meetingCode.length === 6 &&
                meetingInfo && (
                  <p
                    id="meeting-code-status"
                    className="mt-2 text-sm text-green-600 dark:text-green-400 break-words"
                  >
                    ✓ Meeting found: {meetingInfo.title}
                  </p>
                )}
              {!meetingCodeValidation.isValid &&
                formData.meetingCode.length > 0 && (
                  <p
                    id="meeting-code-status"
                    className="mt-2 text-sm text-red-600 dark:text-red-400"
                  >
                    ✗ {meetingCodeValidation.message}
                  </p>
                )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                Your Name (Observer)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={isJoining}
                  value={formData.watcherName}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      watcherName: e.target.value,
                    }))
                  }
                  className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 dark:bg-zinc-950 dark:text-zinc-100 form-input ${
                    watcherNameValidation.isValid &&
                    formData.watcherName.length > 0
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : !watcherNameValidation.isValid &&
                          formData.watcherName.length > 0
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "border-gray-300 dark:border-zinc-800"
                  }`}
                  placeholder="Enter your name"
                  aria-describedby="watcher-name-status"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {watcherNameValidation.isValid &&
                    formData.watcherName.length > 0 && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  {!watcherNameValidation.isValid &&
                    formData.watcherName.length > 0 && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                </div>
              </div>
              {watcherNameValidation.isValid &&
                formData.watcherName.length > 0 && (
                  <p
                    id="watcher-name-status"
                    className="mt-2 text-sm text-green-600 dark:text-green-400"
                  >
                    ✓ Name entered
                  </p>
                )}
              {!watcherNameValidation.isValid &&
                formData.watcherName.length > 0 && (
                  <p
                    id="watcher-name-status"
                    className="mt-2 text-sm text-red-600 dark:text-red-400"
                  >
                    ✗ {watcherNameValidation.message}
                  </p>
                )}
            </div>

            <button
              type="submit"
              disabled={
                isJoining ||
                !meetingCodeValidation.isValid ||
                !watcherNameValidation.isValid
              }
              className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:bg-primary/40 disabled:cursor-not-allowed flex items-center justify-center touch-target"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Joining as Watcher...
                </>
              ) : (
                "Watch Meeting"
              )}
            </button>

            {/* Validation status message */}
            {!isJoining &&
              (!meetingCodeValidation.isValid ||
                !watcherNameValidation.isValid) && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/20 dark:border-amber-900/40">
                  <div className="flex items-start sm:items-center">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mr-2 mt-0.5 sm:mt-0 flex-shrink-0" />
                    <p className="text-sm text-amber-600 dark:text-amber-400 break-words">
                      {!meetingCodeValidation.isValid &&
                      !watcherNameValidation.isValid
                        ? "Please enter a valid meeting code and your name to continue"
                        : !meetingCodeValidation.isValid
                          ? "Please enter a valid meeting code to continue"
                          : "Please enter your name to continue"}
                    </p>
                  </div>
                </div>
              )}
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Want to participate instead?{" "}
              <button
                onClick={() => navigate("/join")}
                className="text-primary hover:text-primary/90 font-medium"
              >
                Join as participant
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WatchMeeting;
