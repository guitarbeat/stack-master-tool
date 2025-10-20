import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { SupabaseMeetingService, type QueueItem as SbQueueItem } from "@/services/supabase";
import { logProduction } from "@/utils/productionLogger";

interface UseMeetingActionsProps {
  meetingId: string;
  currentParticipantId: string;
  serverQueue: SbQueueItem[];
  setLastSpeaker: (speaker: SbQueueItem | null) => void;
  setShowJohnDoe: (show: boolean) => void;
}

interface UseMeetingActionsReturn {
  // * Speaker management
  handleNextSpeaker: () => Promise<void>;
  handleUndo: () => Promise<void>;
  lastSpeaker: SbQueueItem | null;
  
  // * Queue management
  handleJoinQueue: () => Promise<void>;
  handleLeaveQueue: () => Promise<void>;
  handleReorderQueue: (dragIndex: number, targetIndex: number) => Promise<void>;
  
  // * Participant management
  handleUpdateParticipant: (participantId: string, newName: string) => Promise<void>;
  handleRemoveParticipant: (participantId: string) => Promise<void>;
  handleAddParticipant: (name: string) => Promise<void>;
  handleParticipantNameUpdate: (participantId: string, newName: string) => Promise<void>;
  
  // * Meeting management
  handleEndMeeting: () => Promise<void>;
  
  // * QR handling
  handleQrScan: (scannedUrl: string) => void;
}

/**
 * * Custom hook for managing meeting actions
 * Centralizes all meeting-related actions and handlers
 */
export function useMeetingActions({
  meetingId,
  currentParticipantId,
  serverQueue,
  setLastSpeaker,
  setShowJohnDoe,
}: UseMeetingActionsProps): UseMeetingActionsReturn {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [lastSpeaker, setLastSpeakerState] = useState<SbQueueItem | null>(null);

  // * Update the external lastSpeaker state when internal state changes
  const updateLastSpeaker = (speaker: SbQueueItem | null) => {
    setLastSpeakerState(speaker);
    setLastSpeaker(speaker);
  };

  /**
   * * Handles moving to the next speaker in the queue
   */
  const handleNextSpeaker = async () => {
    if (!meetingId) {
      return;
    }
    try {
      const removedSpeaker = await SupabaseMeetingService.nextSpeaker(meetingId);
      updateLastSpeaker(removedSpeaker);
    } catch (error) {
      logProduction("error", {
        action: "next_speaker",
        meetingId,
        error: error instanceof Error ? error.message : String(error)
      });
      // TODO: Show user-friendly error toast
    }
  };

  /**
   * * Handles undoing the last speaker action
   */
  const handleUndo = async () => {
    if (!meetingId || !lastSpeaker) {
      return;
    }
    try {
      await SupabaseMeetingService.joinQueue(
        meetingId,
        lastSpeaker.participantId,
      );
      updateLastSpeaker(null); // Clear the last speaker after undoing
    } catch (error) {
      logProduction("error", {
        action: "undo_speaker",
        meetingId,
        lastSpeaker: lastSpeaker?.participantId,
        error: error instanceof Error ? error.message : String(error)
      });
      // TODO: Show user-friendly error toast
    }
  };

  /**
   * * Handles joining the speaking queue
   */
  const handleJoinQueue = async () => {
    if (!meetingId || !currentParticipantId) {
      return;
    }
    try {
      await SupabaseMeetingService.joinQueue(meetingId, currentParticipantId);
      // * The real-time subscription will update the UI
    } catch (error) {
      logProduction("error", {
        action: "join_queue",
        meetingId,
        participantId: currentParticipantId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };

  /**
   * * Handles leaving the speaking queue
   */
  const handleLeaveQueue = async () => {
    if (!meetingId || !currentParticipantId) {
      return;
    }
    try {
      await SupabaseMeetingService.leaveQueue(meetingId, currentParticipantId);
      // * The real-time subscription will update the UI
    } catch (error) {
      logProduction("error", {
        action: "leave_queue",
        meetingId,
        participantId: currentParticipantId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };

  /**
   * * Handles reordering items in the speaking queue
   */
  const handleReorderQueue = async (dragIndex: number, targetIndex: number) => {
    if (!meetingId || serverQueue.length === 0) {
      return;
    }

    try {
      const itemToMove = serverQueue[dragIndex];
      if (!itemToMove?.id) {
        logProduction("warn", {
          action: "reorder_queue_no_item",
          meetingId,
          dragIndex,
          targetIndex
        });
        return;
      }

      // Calculate new position based on target index
      const newPosition = targetIndex + 1; // positions are 1-based in DB

      await SupabaseMeetingService.reorderQueueItem(
        meetingId,
        itemToMove.participantId,
        newPosition
      );

      logProduction("info", {
        action: "reorder_queue_success",
        meetingId,
        dragIndex,
        targetIndex,
        participantId: itemToMove.participantId,
        newPosition
      });
    } catch (error) {
      logProduction("error", {
        action: "reorder_queue",
        meetingId,
        dragIndex,
        targetIndex,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };

  /**
   * * Handles updating participant information
   */
  const handleUpdateParticipant = async (participantId: string, newName: string) => {
    if (!participantId || !newName.trim()) {
      return;
    }

    try {
      const normalizedName = newName.trim();
      await SupabaseMeetingService.updateParticipantName(participantId, normalizedName);
      showToast({
        type: 'success',
        title: 'Name Updated',
        message: `Participant name updated to ${normalizedName}`
      });
      // * Real-time subscription will update the UI
    } catch (error) {
      logProduction("error", {
        action: "update_participant",
        participantId,
        newName,
        error: error instanceof Error ? error.message : String(error)
      });
      showToast({
        type: 'error',
        title: 'Failed to Update Name',
        message: 'Please try again or check your connection'
      });
    }
  };

  /**
   * * Handles removing a participant from the meeting
   */
  const handleRemoveParticipant = async (participantId: string) => {
    if (!participantId) {
      return;
    }

    // * Handle fake John Doe participant (ID "1")
    if (participantId === "1") {
      setShowJohnDoe(false);
      showToast({
        type: 'success',
        title: 'Participant Removed',
        message: 'John Doe has been removed from the meeting'
      });
      return;
    }

    try {
      await SupabaseMeetingService.removeParticipant(participantId);
      showToast({
        type: 'success',
        title: 'Participant Removed',
        message: 'Participant has been removed from the meeting'
      });
      // * Real-time subscription will update the UI
    } catch (error) {
      logProduction("error", {
        action: "remove_participant",
        participantId,
        error: error instanceof Error ? error.message : String(error)
      });
      showToast({
        type: 'error',
        title: 'Failed to Remove Participant',
        message: 'Please try again or check your connection'
      });
    }
  };

  /**
   * * Handles adding a new participant to the meeting
   */
  const handleAddParticipant = async (name: string) => {
    if (!meetingId) {
      return Promise.resolve();
    }

    try {
      await SupabaseMeetingService.joinMeeting(meetingId, name, false);
      showToast({
        type: 'success',
        title: 'Participant Added',
        message: `${name} has been added to the meeting`
      });
      // * Real-time subscription will update the UI
      return Promise.resolve();
    } catch (error) {
      logProduction("error", {
        action: "add_participant",
        meetingId,
        participantName: name,
        error: error instanceof Error ? error.message : String(error)
      });
      showToast({
        type: 'error',
        title: 'Failed to Add Participant',
        message: 'Please try again or check your connection'
      });
      return Promise.reject(error);
    }
  };

  /**
   * * Handles updating participant name (alternative handler)
   */
  const handleParticipantNameUpdate = async (participantId: string, newName: string) => {
    try {
      await SupabaseMeetingService.updateParticipantName(participantId, newName);
      // * Real-time subscription will update the UI
    } catch (error) {
      logProduction("error", {
        action: "update_participant_name",
        participantId,
        newName,
        error: error instanceof Error ? error.message : String(error)
      });
      // TODO: Show user-friendly error toast
    }
  };

  /**
   * * Handles ending the meeting
   */
  const handleEndMeeting = async () => {
    if (!meetingId) {
      return;
    }

    try {
      await SupabaseMeetingService.endMeeting(meetingId);
      // * Navigate back to home after ending meeting
      navigate("/");
    } catch (error) {
      logProduction("error", {
        action: "end_meeting",
        meetingId,
        error: error instanceof Error ? error.message : String(error)
      });
      // * Still navigate home even if cleanup fails
      navigate("/");
    }
  };

  /**
   * * Handles QR code scanning
   */
  const handleQrScan = (scannedUrl: string) => {
    // * For now, QR scanning is not fully implemented
    // * This function provides the framework for when proper QR scanning is added
    logProduction('info', {
      action: 'qr_scan_attempted',
      scannedUrl
    });
  };

  return {
    // * Speaker management
    handleNextSpeaker,
    handleUndo,
    lastSpeaker,
    
    // * Queue management
    handleJoinQueue,
    handleLeaveQueue,
    handleReorderQueue,
    
    // * Participant management
    handleUpdateParticipant,
    handleRemoveParticipant,
    handleAddParticipant,
    handleParticipantNameUpdate,
    
    // * Meeting management
    handleEndMeeting,
    
    // * QR handling
    handleQrScan,
  };
}