import { useEffect } from "react";
import { SupabaseMeetingService } from "@/services/supabase";
import { logProduction } from "@/utils/productionLogger";

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
          logProduction('warn', {
            action: 'mark_participant_inactive',
            participantId: currentParticipantId,
            error: error instanceof Error ? error.message : String(error)
          });
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
        void SupabaseMeetingService.leaveMeeting(currentParticipantId).catch(error => {
          logProduction('warn', {
            action: 'mark_participant_inactive_unmount',
            participantId: currentParticipantId,
            error: error instanceof Error ? error.message : String(error)
          });
        });
      }
    };
  }, [currentParticipantId, mode]);
}