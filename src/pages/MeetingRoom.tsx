import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MeetingHeader } from "@/components/MeetingRoom/MeetingHeader";
import { SpeakingQueue } from "@/components/MeetingRoom/SpeakingQueue";
import { ActionsPanel } from "@/components/MeetingRoom/ActionsPanel";
import { ErrorState } from "@/components/MeetingRoom/ErrorState";
import { HostSettingsPanel } from "@/components/MeetingRoom/HostSettingsPanel";
import { AppError, ErrorCode } from "@/utils/errorHandling";
import { QueuePositionFeedback } from "@/components/MeetingRoom/QueuePositionFeedback";
import { DisplayLayout } from "@/components/WatchView/DisplayLayout";
import { SpeakingAnalytics } from "@/components/WatchView/SpeakingAnalytics";
import { LoadingState } from "@/components/shared/LoadingState";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

import { QrCodeScanner } from "@/components/ui/qr-code-scanner";
import { CodeInputForm } from "@/components/MeetingRoom/CodeInputForm";

// import { EnhancedEditableParticipantName } from "@/components/features/meeting/EnhancedEditableParticipantName";
import { useAuth } from "@/hooks/useAuth";
import { useMeetingState } from "@/hooks/useMeetingState";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useSpeakerTimer } from "@/hooks/useSpeakerTimer";
import { useSpeakingHistory } from "@/hooks/useSpeakingHistory";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { useMeetingActions } from "@/hooks/useMeetingActions";
import {
  SupabaseMeetingService,
  SupabaseRealtimeService,
  type MeetingWithParticipants,
} from "@/services/supabase";
import { validateMeetingCode } from "@/utils/schemas";
import { logProduction } from "@/utils/productionLogger";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function MeetingRoom() {
  const navigate = useNavigate();
  const { user, signInAnonymously } = useAuth();
  const { showToast, toast: pushToast } = useToast();

  // * Use the centralized meeting state hook
  const {
    meetingCode,
    setMeetingCode,
    meetingId,
    setMeetingId,
    mode,
    isLoading,
    setIsLoading,
    error,
    codeInput,
    setCodeInput,
    participantName,
    setParticipantName,
    setError,
    serverMeeting,
    setServerMeeting,
    serverParticipants,
    setServerParticipants,
    serverQueue,
    setServerQueue,
    currentParticipantId,
    isLiveMeeting,
    setIsLiveMeeting,
    showJohnDoe,
    setShowJohnDoe,
    lastSpeaker,
    setLastSpeaker,
    qrOpen,
    setQrOpen,
    qrUrl,
    setQrUrl,
    qrType,
    setQrType,
    scannerOpen,
    setScannerOpen,
    userRole,
  } = useMeetingState();

  // * Meeting actions hook for host functionality
  const { handleEndMeeting } = useMeetingActions({
    meetingId,
    currentParticipantId,
    serverQueue,
    setLastSpeaker,
    setShowJohnDoe,
  });

  const handleCreateRoom = async () => {
    if (!codeInput.trim()) return;

    try {
      setIsLoading(true);
      // Use participantName from state (loaded from localStorage) or fallback
      const facilitatorName = participantName.trim() || user?.email || "Anonymous Facilitator";
      const created = await SupabaseMeetingService.createMeeting(
        codeInput.trim(),
        facilitatorName,
        user?.id,
      );

      // Update the meeting state
      setMeetingId(created.id);
      setMeetingCode(created.code);

      // Load the full meeting data
      const full = await SupabaseMeetingService.getMeeting(created.code);
      if (full) {
        setServerMeeting(full);
        setServerParticipants(full.participants);
        setServerQueue(full.speakingQueue);
      }

      // Clear the input
      setCodeInput("");
      showToast({
        title: "Room Created!",
        description: `Room "${created.title}" is now live with code ${created.code}`,
      });
    } catch (error) {
      logProduction("error", {
        action: "create_room_failed",
        error: error instanceof Error ? error.message : String(error),
      });
      showToast({
        title: "Failed to create room",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQrScan = (scannedUrl: string) => {
    // For now, QR scanning is not fully implemented
    // This function provides the framework for when proper QR scanning is added
    // * Log QR scan for debugging in development
    if (import.meta.env.DEV) {
      logProduction('info', {
        action: 'qr_scan_attempted',
        scannedUrl
      });
    }
    setScannerOpen(false);
  };

  // Advanced features hooks

  const handleNextSpeaker = async () => {
    if (!meetingId) {
      return;
    }
    try {
      const removedSpeaker = await SupabaseMeetingService.nextSpeaker(meetingId);
      setLastSpeaker(removedSpeaker);
    } catch (error) {
      logProduction("error", {
        action: "next_speaker",
        meetingId,
        error: error instanceof Error ? error.message : String(error)
      });
      // TODO: Show user-friendly error toast
    }
  };

  const handleUndo = async () => {
    if (!meetingId || !lastSpeaker) {
      return;
    }
    try {
      await SupabaseMeetingService.joinQueue(
        meetingId,
        lastSpeaker.participantId,
      );
      setLastSpeaker(null); // Clear the last speaker after undoing
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

  const handleLeaveQueue = async () => {
    if (!meetingId || !currentParticipantId) {
      return;
    }
    try {
      await SupabaseMeetingService.leaveQueue(meetingId, currentParticipantId);
      showToast({
        type: 'success',
        title: 'Left Queue',
        message: 'You have been removed from the speaking queue.'
      });
    } catch (error) {
      logProduction('error', {
        action: 'leave_queue',
        meetingId,
        participantId: currentParticipantId,
        error: error instanceof Error ? error.message : String(error)
      });
      showToast({
        type: 'error',
        title: 'Failed to Leave Queue',
        message: 'There was an error removing you from the queue. Please try again.'
      });
    }
  };

  const { showKeyboardShortcuts: _showKeyboardShortcuts, toggleShortcuts: _toggleShortcuts } = useKeyboardShortcuts({
    onNextSpeaker: () => {
      void handleNextSpeaker();
    },
    onUndo: () => {
      void handleUndo();
    },
    onToggleShortcuts: () => setShowKeyboardShortcutsModal(prev => !prev)
  });

  const [showKeyboardShortcutsModal, setShowKeyboardShortcutsModal] = useState(false);

  const { speakerTimer: _speakerTimer, elapsedTime: _elapsedTime, startTimer: _startTimer, stopTimer: _stopTimer, formatTime: _formatTime } = useSpeakerTimer();
  const { speakingHistory, addSpeakingSegment: _addSpeakingSegment, getTotalSpeakingTime: _getTotalSpeakingTime, getSpeakingDistribution } = useSpeakingHistory();
  const { dragIndex: _dragIndex, handleDragStart: _handleDragStart, handleDrop: _handleDrop, isDragOver: _isDragOver } = useDragAndDrop({ isFacilitator: mode === 'host' });


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
      // Real-time subscription will update the UI
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

    const existingParticipant = serverParticipants.find(p => p.id === participantId);
    const originalIndex = serverParticipants.findIndex(p => p.id === participantId);

    try {
      const removedParticipant = await SupabaseMeetingService.removeParticipant(participantId);
      setServerParticipants(prev => prev.filter(p => p.id !== participantId));

      const toastHandle = pushToast({
        variant: 'warning',
        title: 'Participant Removed',
        description: `${removedParticipant.name} has been removed from the meeting`,
        duration: 7000,
        action: (
          <ToastAction
            altText="Undo removal"
            onClick={() => {
              void (async () => {
                try {
                  await SupabaseMeetingService.restoreParticipant(removedParticipant.id);
                  const baseParticipant = existingParticipant ?? {
                    id: removedParticipant.id,
                    name: removedParticipant.name,
                    isFacilitator: removedParticipant.isFacilitator,
                    hasRaisedHand: false,
                    joinedAt: removedParticipant.joinedAt,
                    isActive: true,
                  };

                  setServerParticipants(prev => {
                    const restoredParticipant = {
                      ...baseParticipant,
                      isActive: true,
                    };
                    const next = [...prev];
                    const insertIndex = originalIndex >= 0 ? Math.min(originalIndex, next.length) : next.length;
                    next.splice(insertIndex, 0, restoredParticipant);
                    return next;
                  });
                  showToast({
                    type: 'success',
                    title: 'Participant Restored',
                    message: `${removedParticipant.name} has been returned to the meeting`
                  });
                } catch (restoreError) {
                  logProduction('error', {
                    action: 'restore_participant',
                    participantId: removedParticipant.id,
                    error: restoreError instanceof Error ? restoreError.message : String(restoreError)
                  });
                  showToast({
                    type: 'error',
                    title: 'Failed to Restore Participant',
                    message: 'Please try again or check your connection'
                  });
                } finally {
                  toastHandle.dismiss();
                }
              })();
            }}
          >
            Undo
          </ToastAction>
        )
      });
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


  // Handler for AddParticipants component
  const handleAddParticipant = async (name: string) => {
    if (!meetingCode) {
      return Promise.resolve();
    }

    try {
      await SupabaseMeetingService.joinMeeting(meetingCode, name, false);
      showToast({
        type: 'success',
        title: 'Participant Added',
        message: `${name} has been added to the meeting`
      });
      // Real-time subscription will update the UI
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

  // Handler for EnhancedEditableParticipantName component
  const handleParticipantNameUpdate = async (participantId: string, newName: string) => {
    try {
      await SupabaseMeetingService.updateParticipantName(participantId, newName);
      // Real-time subscription will update the UI
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

  const handleMeetingCodeChange = async (newCode: string) => {
    if (!meetingId) return;

    try {
      await SupabaseMeetingService.updateMeetingCode(meetingId, newCode);
      // Update local state
      setMeetingCode(newCode);
      showToast({
        type: 'success',
        title: 'Meeting code updated',
        message: `New meeting code: ${newCode}`,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update meeting code',
      });
      throw error; // Re-throw to let the UI handle it
    }
  };

  // Meeting initialization is handled by useMeetingState hook

  // Realtime subscriptions
  useEffect(() => {
    if (!meetingId || !meetingCode) {
      return;
    }
    const unsubscribe = SupabaseRealtimeService.subscribeToMeeting(meetingId, meetingCode, {
      onParticipantsUpdated: (participants) => {
        setServerParticipants(participants);
        // * Hide John Doe when real participants join
        if (participants.length > 0) {
          setShowJohnDoe(false);
        }
      },
      onQueueUpdated: setServerQueue,
      onMeetingTitleUpdated: (title) =>
        setServerMeeting((m) =>
          m ? ({ ...m, title } as MeetingWithParticipants) : m,
        ),
      onParticipantJoined: () => void 0,
      onParticipantLeft: () => void 0,
      onNextSpeaker: () => void 0,
      onError: () => void 0,
    });
    return () => {
      unsubscribe?.();
    };
  }, [meetingId, meetingCode, setShowJohnDoe, setServerParticipants, setServerQueue, setServerMeeting]);

  // Cleanup: Mark participant as inactive when leaving
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (currentParticipantId && mode === "join") {
        try {
          await SupabaseMeetingService.leaveMeeting(currentParticipantId);
        } catch (error) {
          // * Log warning for debugging in development
          if (import.meta.env.DEV) {
            logProduction('warn', {
              action: 'mark_participant_inactive',
              participantId: currentParticipantId,
              error: error instanceof Error ? error.message : String(error)
            });
          }
        }
      }
    };

    const handleUnload = () => {
      void handleBeforeUnload();
    };

    window.addEventListener("beforeunload", () => void handleBeforeUnload());
    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", () => void handleBeforeUnload());
      window.removeEventListener("unload", handleUnload);
      // Mark as inactive when component unmounts (navigating away)
      if (currentParticipantId && mode === "join") {
        void SupabaseMeetingService.leaveMeeting(currentParticipantId).catch(error => {
          // * Log warning for debugging in development
          if (import.meta.env.DEV) {
            logProduction('warn', {
              action: 'mark_participant_inactive_unmount',
              participantId: currentParticipantId,
              error: error instanceof Error ? error.message : String(error)
            });
          }
        });
      }
    };
  }, [currentParticipantId, mode, setShowJohnDoe]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border-0 text-center">
          <LoadingState 
            message="Loading meeting..." 
            size="lg"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <ErrorState
          error={error}
          onRetry={() => {
            // For join/watch modes, clear error and go back to code entry
            if (mode === "join" || mode === "watch") {
              setError(null);
              setCodeInput("");
              window.history.replaceState(null, "", `/${window.location.pathname.split('/')[1]}?mode=${mode}`);
            } else {
              navigate("/");
            }
          }}
          showHomeButton={true}
        />
      </div>
    );
  }

  // Join flow with code and name entry UI when no code provided
  if (mode === "join" && !meetingCode) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-10 max-w-xl">
        <div className="bg-card text-card-foreground rounded-2xl p-6 sm:p-8 shadow-lg border">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Join a Meeting</h1>
          <p className="text-base sm:text-sm text-muted-foreground mb-6 sm:mb-8">
            Enter your name and the 6-character meeting code shared by the host.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const codeValidation = validateMeetingCode(codeInput);
              if (!codeValidation.isValid) {
                setError(new AppError(ErrorCode.INVALID_MEETING_CODE, undefined, codeValidation.error ?? "Invalid meeting code"));
                return;
              }
              if (!participantName.trim()) {
                setError(new AppError(ErrorCode.VALIDATION_ERROR, undefined, "Please enter your name"));
                return;
              }
              navigate(`/meeting?mode=join&code=${codeValidation.normalizedCode}&name=${encodeURIComponent(participantName.trim())}`);
            }}
            className="space-y-5 sm:space-y-6"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="participant-name" className="text-sm font-medium text-foreground">
                  Your Name
                </label>
                <input
                  id="participant-name"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-4 sm:py-3 rounded-lg bg-transparent border border-border focus-ring text-base sm:text-sm min-h-[48px]"
                  aria-label="Your name"
                  autoComplete="name"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="meeting-code" className="text-sm font-medium text-foreground">
                  Meeting Code
                </label>
                <div className="flex gap-2">
                  <input
                    id="meeting-code"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    placeholder="e.g. 54ANDG"
                    className="flex-1 px-4 py-4 sm:py-3 rounded-lg bg-transparent border border-border focus-ring text-base sm:text-sm min-h-[48px]"
                    aria-label="Meeting code"
                    autoComplete="off"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                  <button
                    type="button"
                    onClick={() => setCodeInput(Math.random().toString(36).substring(2, 8).toUpperCase())}
                    className="px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors min-h-[48px]"
                    title="Generate random code"
                    aria-label="Generate random meeting code"
                  >
                    🎲
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 sm:py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 active:bg-primary/80 min-h-[48px] text-base sm:text-sm transition-colors"
                disabled={!codeInput.trim() || !participantName.trim()}
              >
                Join Meeting
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const mockMeetingData = {
    title:
      serverMeeting?.title ??
      (mode === "host"
        ? "New Meeting"
        : meetingCode
          ? `Meeting ${meetingCode}`
          : "Meeting"),
    code: meetingCode,
    facilitator: serverMeeting?.facilitator ?? "Meeting Facilitator",
    createdAt: serverMeeting ? new Date(serverMeeting.createdAt) : new Date(),
  };

  const mockParticipants = serverParticipants.length
    ? serverParticipants
        .filter(p => p.isActive !== false) // Only include active participants (default to active if not specified)
        .map((p) => ({
          id: p.id,
          name: p.name,
          isFacilitator: p.isFacilitator,
          hasRaisedHand: false,
          joinedAt: new Date(p.joinedAt),
        }))
    : showJohnDoe ? [
        {
          id: "1",
          name: "John Doe",
          isFacilitator: mode === "host",
          hasRaisedHand: false,
          joinedAt: new Date(),
        },
      ] : [];

  // Determine current speaker from the actual queue (first person in queue)
  const currentSpeakerFromQueue = serverQueue.length > 0 ? {
    participantName: serverQueue[0].participantName,
    startedSpeakingAt: new Date(serverQueue[0].joinedQueueAt), // Use when they joined queue as approximation
  } : null;

  // Watch mode - show code input if no code provided
  if (mode === "watch" && !meetingCode) {
    return (
      <CodeInputForm
        mode="watch"
        onError={(formError) => {
          if (!formError) {
            setError(null);
            return;
          }

          if (formError instanceof AppError) {
            setError(formError);
            return;
          }

          setError(
            new AppError(
              ErrorCode.VALIDATION_ERROR,
              undefined,
              typeof formError === "string" ? formError : "Invalid meeting code",
            ),
          );
        }}
      />
    );
  }

  // Watch mode with meeting loaded
  if (mode === "watch") {
    // Use real speaking history data
    const speakingDistribution = getSpeakingDistribution();
    // Fallback to basic participant data if no speaking history
    const fallbackDistribution = serverParticipants.length > 0
      ? serverParticipants.map(p => ({
          name: p.name,
          value: 0 // No speaking time yet
        }))
      : [];

    return (
      <DisplayLayout
        meetingData={mockMeetingData}
        participants={mockParticipants}
        currentSpeaker={currentSpeakerFromQueue}
        speakingQueue={serverQueue}
        speakingDistribution={speakingDistribution.length > 0 ? speakingDistribution : fallbackDistribution}
        totalSpeakingTime={speakingHistory.reduce((sum, seg) => sum + seg.durationMs, 0) / 1000}
        averageSpeakingTime={
          speakingHistory.length > 0
            ? speakingHistory.reduce((sum, seg) => sum + seg.durationMs, 0) / speakingHistory.length / 1000
            : 0
        }
        meetingDuration={Math.floor((Date.now() - new Date(mockMeetingData.createdAt).getTime()) / 1000)}
        totalParticipants={mockParticipants.length}
        queueActivity={speakingHistory.length}
        directResponses={speakingHistory.filter(seg => seg.isDirectResponse).length}
      />
    );
  }

  // Show room creation interface for host mode when no meeting exists
  if (mode === "host" && !meetingId) {
    // If user is not authenticated, show inline name prompt first
    if (!user) {
      return (
        <div className="container mx-auto px-4 py-8 max-w-xl">
          <div className="bg-card text-card-foreground rounded-2xl p-6 sm:p-8 shadow-lg border">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Host a Meeting</h1>
            <p className="text-base sm:text-sm text-muted-foreground mb-6 sm:mb-8">
              To host a meeting, we need to save your name as the facilitator.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!participantName.trim()) {
                  setError(new AppError(ErrorCode.VALIDATION_ERROR, undefined, "Please enter your name"));
                  return;
                }
                if (!codeInput.trim()) {
                  setError(new AppError(ErrorCode.VALIDATION_ERROR, undefined, "Please enter a meeting name"));
                  return;
                }
                try {
                  setIsLoading(true);
                  const { data, error: authError } = await signInAnonymously(participantName.trim());
                  if (authError) {
                    setError(new AppError(ErrorCode.AUTH_ERROR, authError, "Failed to authenticate"));
                    return;
                  }
                  // Immediately create the meeting after successful sign in
                  await handleCreateRoom();
                } catch (error) {
                  setError(new AppError(
                    ErrorCode.UNKNOWN,
                    error instanceof Error ? error : undefined,
                    "An unexpected error occurred"
                  ));
                } finally {
                  setIsLoading(false);
                }
              }}
              className="space-y-5 sm:space-y-6"
            >
              <div className="space-y-2">
                <label htmlFor="facilitator-name" className="text-sm font-medium text-foreground">
                  Your Name (Facilitator)
                </label>
                <input
                  id="facilitator-name"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-4 sm:py-3 rounded-lg bg-transparent border border-border focus-ring text-base sm:text-sm min-h-[48px]"
                  aria-label="Your name as facilitator"
                  autoComplete="name"
                  autoFocus
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="meeting-name" className="text-sm font-medium text-foreground">
                  Meeting Name
                </label>
                <input
                  id="meeting-name"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="Enter meeting name"
                  className="w-full px-4 py-4 sm:py-3 rounded-lg bg-transparent border border-border focus-ring text-base sm:text-sm min-h-[48px]"
                  aria-label="Meeting name"
                  autoComplete="off"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 sm:py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 active:bg-primary/80 min-h-[48px] text-base sm:text-sm transition-colors disabled:opacity-50"
                disabled={!participantName.trim() || isLoading}
              >
                {isLoading ? 'Authenticating...' : 'Continue'}
              </button>
            </form>
          </div>
        </div>
      );
    }

    // User is authenticated, show room creation form
    return (
      <>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create a Meeting Room</h1>
            <p className="text-muted-foreground">
              Set up a new meeting room that anyone can discover and join
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-lg border">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Room Name</label>
                <input
                  type="text"
                  placeholder="e.g. Team Standup, Strategy Session, Open Forum"
                  className="w-full px-3 py-2 border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        void handleCreateRoom();
                      }
                    }}
                />
              </div>

                <button
                  onClick={() => {
                    void handleCreateRoom();
                  }}
                disabled={!codeInput.trim()}
                className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                🚀 Create Room
              </button>

              <div className="text-center pt-4 border-t">
                <button
                  onClick={() => navigate("/rooms")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to Rooms
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Host Management Panel */}
        {mode === "host" && meetingId && (
          <HostSettingsPanel
            isLiveMeeting={isLiveMeeting}
            setIsLiveMeeting={setIsLiveMeeting}
            meetingCode={meetingCode}
            onQrGenerate={(url, type) => {
              setQrUrl(url);
              setQrType(type);
              setQrOpen(true);
            }}
            onScannerOpen={() => setScannerOpen(true)}
              onMeetingCodeChange={handleMeetingCodeChange}
              onEndMeeting={() => {
                void handleEndMeeting();
              }}
            mockParticipants={mockParticipants}
            onAddParticipant={handleAddParticipant}
            onUpdateParticipant={handleUpdateParticipant}
            onRemoveParticipant={handleRemoveParticipant}
            userRole={userRole}
          />
        )}

        <MeetingHeader
          meetingData={mockMeetingData}
          participantCount={mockParticipants.length}
          onLeaveMeeting={() => navigate("/")}
        />

        {/* Main Content - Speaking Queue and Analytics Side by Side */}
        <div className={`grid gap-4 sm:gap-6 mb-6 ${mode === "host" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
          {/* Speaking Queue */}
          <div className={mode === "host" ? "md:col-span-1" : ""}>
            <SpeakingQueue
              speakingQueue={serverQueue.map((item, _index) => ({
                id: item.id,
                participantName: item.participantName,
                participantId: item.participantId,
                isFacilitator: item.isFacilitator,
                type: item.queueType,
                timestamp: new Date(item.joinedQueueAt).getTime(),
              }))}
              participantName={user?.email ?? "Current User"}
              onLeaveQueue={() => {
                void handleLeaveQueue();
              }}
              onUpdateParticipantName={(participantId, newName) => {
                void handleParticipantNameUpdate(participantId, newName);
              }}
              currentUserId={currentParticipantId}
            />
          </div>

          {/* Meeting Analytics - Only visible in host mode */}
          {mode === "host" && (
            <div>
              <SpeakingAnalytics
                speakingDistribution={getSpeakingDistribution()}
                totalSpeakingTime={speakingHistory.reduce((sum, seg) => sum + seg.durationMs, 0) / 1000}
                averageSpeakingTime={
                  speakingHistory.length > 0
                    ? speakingHistory.reduce((sum, seg) => sum + seg.durationMs, 0) / speakingHistory.length / 1000
                    : 0
                }
                meetingDuration={Math.floor((Date.now() - new Date(mockMeetingData.createdAt).getTime()) / 1000)}
                totalParticipants={mockParticipants.length}
                queueActivity={speakingHistory.length}
                directResponses={speakingHistory.filter(seg => seg.isDirectResponse).length}
                currentSpeaker={currentSpeakerFromQueue}
                isHostMode={mode === "host"}
              />
            </div>
          )}
        </div>

        {/* Queue Position Feedback for participants */}
        {mode === "join" && (
          /* Participant: Personal actions view */
          <>
            <QueuePositionFeedback
              queuePosition={1}
              joinedAt={new Date()}
              currentSpeaker={currentSpeakerFromQueue}
              queueHistory={[]}
            />
            <ActionsPanel
              isInQueue={false}
              onJoinQueue={() => {}}
              onLeaveQueue={() => {}}
              participantName="Current User"
            />
          </>
        )}

        {mode === "watch" && (
          /* Observer: Read-only queue view */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <SpeakingQueue
                speakingQueue={serverQueue.map((item, _index) => ({
                  id: item.id,
                  participantName: item.participantName,
                  participantId: item.participantId,
                  isFacilitator: item.isFacilitator,
                  type: item.queueType,
                  timestamp: new Date(item.joinedQueueAt).getTime(),
                }))}
                participantName={user?.email ?? "Observer"}
                onLeaveQueue={() => {}}
                onUpdateParticipantName={() => {}}
                currentUserId={null}
                isFacilitator={false}
                onReorderQueue={() => {}}
              />
            </div>
            <div>
              <SpeakingAnalytics
                speakingDistribution={getSpeakingDistribution()}
                totalSpeakingTime={speakingHistory.reduce((sum, seg) => sum + seg.durationMs, 0) / 1000}
                averageSpeakingTime={
                  speakingHistory.length > 0
                    ? speakingHistory.reduce((sum, seg) => sum + seg.durationMs, 0) / speakingHistory.length / 1000
                    : 0
                }
                meetingDuration={Math.floor((Date.now() - new Date(mockMeetingData.createdAt).getTime()) / 1000)}
                totalParticipants={mockParticipants.length}
                queueActivity={speakingHistory.length}
                directResponses={speakingHistory.filter(seg => seg.isDirectResponse).length}
                currentSpeaker={currentSpeakerFromQueue}
                isHostMode={false}
              />
            </div>
          </div>
        )}
      </div>

      <>
        {/* QR Code Scanner */}
      {scannerOpen && (
        <QrCodeScanner
          onScan={handleQrScan}
          onClose={() => setScannerOpen(false)}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcutsModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full mx-4 shadow-elegant border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Keyboard Shortcuts</h3>
              <button
                onClick={() => setShowKeyboardShortcutsModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {mode === "host" && (
                <>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-foreground">Next Speaker</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">Enter</kbd>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-foreground">Undo Last Action</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">Ctrl+Z</kbd>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-foreground">Show/Hide Shortcuts</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">?</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-md bg-card border border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {qrType === 'join' ? 'Join via QR code' : 'Watch via QR code'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {qrType === 'join'
                ? 'Scan this QR code with your phone to join the meeting as a participant.'
                : 'Scan this QR code with your phone to observe the meeting remotely.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            {qrUrl && (
              <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
                <img
                  src={qrUrl}
                  alt={`${qrType === 'join' ? 'Join' : 'Watch'} QR Code`}
                  className="w-48 h-48 sm:w-64 sm:h-64"
                />
              </div>
            )}
          </div>
          <div className="text-center text-sm text-muted-foreground">
            {qrType === 'join'
              ? 'Participants can scan this code to join the speaking queue.'
              : 'Observers can scan this code to watch the meeting remotely.'
            }
          </div>
        </DialogContent>
      </Dialog>
      </>
    </>
  );
}
