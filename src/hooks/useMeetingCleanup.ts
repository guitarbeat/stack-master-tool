import { useEffect } from "react";
import { SupabaseMeetingService } from "@/services/supabase";

interface UseMeetingCleanupProps {
  currentParticipantId: string;
  mode: string | null;
}

/**
 * * Custom hook for managing meeting cleanup
 * Handles participant cleanup when leaving the meeting
 */
export function useMeetingCleanup({ currentParticipantId, mode }: UseMeetingCleanupProps) {
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (currentParticipantId && mode === "join") {
        try {
          await SupabaseMeetingService.leaveMeeting(currentParticipantId);
        } catch (error) {
          // * Log warning for debugging in development
          if (process.env.NODE_ENV === 'development') {
            console.warn("Failed to mark participant as inactive:", error);
          }
        }
      }
    };

    const handleUnload = () => {
      void handleBeforeUnload();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
      // * Mark as inactive when component unmounts (navigating away)
      if (currentParticipantId && mode === "join") {
        SupabaseMeetingService.leaveMeeting(currentParticipantId).catch(error => {
          // * Log warning for debugging in development
          if (process.env.NODE_ENV === 'development') {
            console.warn("Failed to mark participant as inactive on unmount:", error);
          }
        });
      }
    };
  }, [currentParticipantId, mode]);
}