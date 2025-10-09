import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { MeetingContext } from "@/components/MeetingRoom/MeetingContext";
import { MeetingHeader } from "@/components/MeetingRoom/MeetingHeader";
import { SpeakingQueue } from "@/components/MeetingRoom/SpeakingQueue";
import { ActionsPanel } from "@/components/MeetingRoom/ActionsPanel";
import { ErrorState } from "@/components/MeetingRoom/ErrorState";
import { AppError, ErrorCode } from "@/utils/errorHandling";
import { QueuePositionFeedback } from "@/components/MeetingRoom/QueuePositionFeedback";
import { DisplayLayout } from "@/components/WatchView/DisplayLayout";
import { SpeakingAnalytics } from "@/components/WatchView/SpeakingAnalytics";
import { QuickAddParticipant } from "@/components/features/meeting/QuickAddParticipant";
import { ParticipantList } from "@/components/features/meeting/ParticipantList";
import { LoadingState } from "@/components/shared/LoadingState";
import { useToast } from "@/components/shared/ToastProvider";
// import { EnhancedEditableParticipantName } from "@/components/features/meeting/EnhancedEditableParticipantName";
import { useAuth } from "@/hooks/useAuth";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useSpeakerTimer } from "@/hooks/useSpeakerTimer";
import { useSpeakingHistory } from "@/hooks/useSpeakingHistory";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import {
  SupabaseMeetingService,
  SupabaseRealtimeService,
  type MeetingWithParticipants,
  type Participant as SbParticipant,
  type QueueItem as SbQueueItem,
} from "@/services/supabase";
// import { validateMeetingCode, validateParticipantName } from "@/utils/meetingValidation";
import { logProduction } from "@/utils/productionLogger";
import QRCode from "qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type MeetingMode = "host" | "join" | "watch";

export default function MeetingRoom() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const params = useParams();
  const [meetingCode, setMeetingCode] = useState<string>("");
  const [meetingId, setMeetingId] = useState<string>("");
  const [mode, setMode] = useState<MeetingMode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | string | null>(null);
  const [codeInput, setCodeInput] = useState<string>("");
  const [remoteEnabled, setRemoteEnabled] = useState<boolean>(true);
  const [isLiveMeeting, setIsLiveMeeting] = useState<boolean>(false);
  const [currentParticipantId, setCurrentParticipantId] = useState<string>("");
  const { user } = useAuth();
  const { showToast } = useToast();

  const [serverMeeting, setServerMeeting] =
    useState<MeetingWithParticipants | null>(null);
  const [serverParticipants, setServerParticipants] = useState<SbParticipant[]>(
    [],
  );
  const [serverQueue, setServerQueue] = useState<SbQueueItem[]>([]);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [qrType, setQrType] = useState<'join' | 'watch'>('join');
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleQrScan = (scannedUrl: string) => {
    // For now, QR scanning is not fully implemented
    // This function provides the framework for when proper QR scanning is added
    // * Log QR scan for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('QR scan attempted with URL:', scannedUrl);
    }
    setScannerOpen(false);
  };

  // Advanced features hooks
  const [lastSpeaker, setLastSpeaker] = useState<SbQueueItem | null>(null);

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

  const { showKeyboardShortcuts: _showKeyboardShortcuts, toggleShortcuts: _toggleShortcuts } = useKeyboardShortcuts({
    onNextSpeaker: handleNextSpeaker,
    onUndo: handleUndo,
    onToggleShortcuts: () => setShowKeyboardShortcutsModal(prev => !prev)
  });

  const [showKeyboardShortcutsModal, setShowKeyboardShortcutsModal] = useState(false);

  const { speakerTimer: _speakerTimer, elapsedTime: _elapsedTime, startTimer: _startTimer, stopTimer: _stopTimer, formatTime: _formatTime } = useSpeakerTimer();
  const { speakingHistory, addSpeakingSegment: _addSpeakingSegment, getTotalSpeakingTime: _getTotalSpeakingTime, getSpeakingDistribution } = useSpeakingHistory();
  const { dragIndex: _dragIndex, handleDragStart: _handleDragStart, handleDrop: _handleDrop, isDragOver: _isDragOver } = useDragAndDrop();

  // Queue management functions
  const handleJoinQueue = async () => {
    if (!meetingId || !currentParticipantId) {
      return;
    }
    try {
      await SupabaseMeetingService.joinQueue(meetingId, currentParticipantId);
      // The real-time subscription will update the UI
    } catch (error) {
      logProduction("error", {
        action: "join_queue",
        meetingId,
        participantId: currentParticipantId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };

  const handleLeaveQueue = async () => {
    if (!meetingId || !currentParticipantId) {
      return;
    }
    try {
      await SupabaseMeetingService.leaveQueue(meetingId, currentParticipantId);
      // The real-time subscription will update the UI
    } catch (error) {
      logProduction("error", {
        action: "leave_queue",
        meetingId,
        participantId: currentParticipantId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };

  const handleReorderQueue = async (dragIndex: number, targetIndex: number) => {
    if (!meetingId || !serverQueue[dragIndex]) {
      return;
    }

    try {
      const { participantId } = serverQueue[dragIndex];
      await SupabaseMeetingService.reorderQueueItem(meetingId, participantId, targetIndex + 1);
      // Real-time subscription will update the UI
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

  const handleUpdateParticipant = async (participantId: string, updates: { name?: string }) => {
    if (!participantId || !updates.name?.trim()) {
      return;
    }

    try {
      await SupabaseMeetingService.updateParticipantName(participantId, updates.name.trim());
      showToast({
        type: 'success',
        title: 'Name Updated',
        message: `Participant name updated to ${updates.name.trim()}`
      });
      // Real-time subscription will update the UI
    } catch (error) {
      logProduction("error", {
        action: "update_participant",
        participantId,
        updates,
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

    try {
      await SupabaseMeetingService.removeParticipant(participantId);
      showToast({
        type: 'success',
        title: 'Participant Removed',
        message: 'Participant has been removed from the meeting'
      });
      // Real-time subscription will update the UI
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

  const handleEndMeeting = async () => {
    if (!meetingId) {
      return;
    }

    try {
      await SupabaseMeetingService.endMeeting(meetingId);
      // Navigate back to home after ending meeting
      navigate("/");
    } catch (error) {
      logProduction("error", {
        action: "end_meeting",
        meetingId,
        error: error instanceof Error ? error.message : String(error)
      });
      // Still navigate home even if cleanup fails
      navigate("/");
    }
  };

  // Handler for QuickAddParticipant component
  const handleQuickAddParticipant = async (name: string) => {
    if (!meetingId) {
      return;
    }

    try {
      await SupabaseMeetingService.joinMeeting(meetingId, name, false);
      showToast({
        type: 'success',
        title: 'Participant Added',
        message: `${name} has been added to the meeting`
      });
      // Real-time subscription will update the UI
    } catch (error) {
      logProduction("error", {
        action: "quick_add_participant",
        meetingId,
        participantName: name,
        error: error instanceof Error ? error.message : String(error)
      });
      showToast({
        type: 'error',
        title: 'Failed to Add Participant',
        message: 'Please try again or check your connection'
      });
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

  useEffect(() => {
    // Handle /watch/:code route
    if (params.code) {
      setMode("watch");
      setMeetingCode(params.code);
    } else {
      const modeParam = searchParams.get("mode") as MeetingMode;
      const _codeParam = searchParams.get("code");

      if (!modeParam || !["host", "join", "watch"].includes(modeParam)) {
        setError(new AppError(ErrorCode.INVALID_OPERATION, undefined, "Invalid meeting mode. Please use host, join, or watch."));
        setIsLoading(false);
        return;
      }

      setMode(modeParam);

      // For join/watch modes, we prefer a meeting code; if missing, we'll show a form
    }

    // Host: create meeting on Supabase, else: fetch by code
    const bootstrap = async () => {
      try {
        const currentMode = params.code ? "watch" : (searchParams.get("mode") as MeetingMode);
        const currentCode = params.code || searchParams.get("code");
        
        if (currentMode === "host") {
          const facilitatorName = user?.email ?? "Facilitator";
          const created = await SupabaseMeetingService.createMeeting(
            "New Meeting",
            facilitatorName,
          );
          setMeetingId(created.id);
          setMeetingCode(created.code);
          const full = await SupabaseMeetingService.getMeeting(created.code);
          if (full) {
            setServerMeeting(full);
            setServerParticipants(full.participants);
            setServerQueue(full.speakingQueue);
          }
        } else if (currentCode) {
          try {
            const full = await SupabaseMeetingService.getMeeting(currentCode);
            if (!full) {
              setError(new AppError(ErrorCode.MEETING_NOT_FOUND, undefined, `Meeting "${currentCode}" not found or inactive. Please check the code and try again.`));
              return;
            }
            setMeetingId(full.id);
            setMeetingCode(full.code);
            setServerMeeting(full);
            setServerParticipants(full.participants);
            setServerQueue(full.speakingQueue);

            // For JOIN mode, create participant if meeting exists
            if (currentMode === "join") {
              try {
                const participantName = user?.email ?? `Participant-${Date.now()}`;
                const participant = await SupabaseMeetingService.joinMeeting(
                  currentCode,
                  participantName,
                  false // not facilitator
                );
                // Store the current participant ID for queue operations
                setCurrentParticipantId(participant.id);
                // Add the new participant to the list
                setServerParticipants(prev => [...prev, participant]);
              } catch (joinError) {
                logProduction("error", {
                  action: "join_meeting_participant",
                  meetingCode: currentCode,
                  participantName: user?.email ?? `Participant-${Date.now()}`,
                  error: joinError instanceof Error ? joinError.message : String(joinError)
                });
                setError(new AppError(ErrorCode.MEETING_ACCESS_DENIED, undefined, "Failed to join meeting. Please try again."));
                return;
              }
            }
          } catch (fetchError) {
            logProduction("error", {
              action: "fetch_meeting",
              meetingCode: currentCode,
              mode: currentMode,
              error: fetchError instanceof Error ? fetchError.message : String(fetchError)
            });
            setError(new AppError(ErrorCode.CONNECTION_FAILED, undefined, "Unable to connect to meeting. Please check your internet connection and try again."));
            return;
          }
        }
      } catch (_e) {
        setError(new AppError(ErrorCode.CONNECTION_FAILED, undefined, "Failed to connect to meeting."));
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, [searchParams, user?.email, currentMode]);

  // Realtime subscriptions
  useEffect(() => {
    if (!meetingId) {
      return;
    }
    const unsubscribe = SupabaseRealtimeService.subscribeToMeeting(meetingId, {
      onParticipantsUpdated: setServerParticipants,
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
  }, [meetingId]);

  // Cleanup: Mark participant as inactive when leaving
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
      // Mark as inactive when component unmounts (navigating away)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="bg-card text-card-foreground rounded-2xl p-6 shadow-lg border text-center">
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
          onRetry={() => navigate("/")}
          showHomeButton={true}
        />
      </div>
    );
  }

  // Join flow with code entry UI when no code provided
  if (mode === "join" && !meetingCode) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-10 max-w-xl">
        <div className="bg-card text-card-foreground rounded-2xl p-6 sm:p-8 shadow-lg border">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Join a Meeting</h1>
          <p className="text-base sm:text-sm text-muted-foreground mb-6 sm:mb-8">
            Enter the 6-character meeting code shared by the host.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const normalized = codeInput.trim().toUpperCase();
              if (normalized.length < 4) {
                return; // simple guard
              }
              navigate(`/meeting?mode=join&code=${normalized}`);
            }}
            className="space-y-5 sm:space-y-6"
          >
            <div className="space-y-3">
              <input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="e.g. 54ANDG"
                className="w-full px-4 py-4 sm:py-3 rounded-lg bg-transparent border border-border focus:outline-none focus:ring-2 focus:ring-primary text-base sm:text-sm min-h-[48px]"
                aria-label="Meeting code"
                autoComplete="off"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck="false"
              />
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="w-full py-3 sm:py-2.5 px-4 rounded-lg bg-secondary text-secondary-foreground font-medium hover:opacity-90 active:opacity-80 min-h-[44px] text-sm sm:text-sm transition-colors flex items-center justify-center gap-2"
              >
                📱 Scan QR Code
              </button>
            </div>
            <button
              type="submit"
              className="w-full py-4 sm:py-3 rounded-lg bg-primary text-white font-semibold hover:opacity-90 active:opacity-80 min-h-[48px] text-base sm:text-sm transition-colors"
              disabled={!codeInput.trim()}
            >
              Join Meeting
            </button>
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
    : [
        {
          id: "1",
          name: "John Doe",
          isFacilitator: mode === "host",
          hasRaisedHand: false,
          joinedAt: new Date(),
        },
      ];

  // Determine current speaker from the actual queue (first person in queue)
  const currentSpeakerFromQueue = serverQueue.length > 0 ? {
    participantName: serverQueue[0].participantName,
    startedSpeakingAt: new Date(serverQueue[0].joinedQueueAt), // Use when they joined queue as approximation
  } : null;

  // Watch mode - show code input if no code provided
  if (mode === "watch" && !meetingCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-card text-card-foreground rounded-2xl p-6 sm:p-8 shadow-lg border">
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Watch a Meeting</h1>
              <p className="text-base sm:text-sm text-muted-foreground">
                Enter the 6-character meeting code to observe the discussion.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const normalized = codeInput.trim().toUpperCase();
                if (normalized.length < 4) {
                  return; // simple guard
                }
                navigate(`/meeting?mode=watch&code=${normalized}`);
              }}
              className="space-y-5 sm:space-y-6"
            >
              <div className="space-y-3">
                <input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="e.g. 54ANDG"
                  className="w-full px-4 py-4 sm:py-3 rounded-lg bg-transparent border border-border focus:outline-none focus:ring-2 focus:ring-primary text-base sm:text-sm min-h-[48px]"
                  aria-label="Meeting code"
                  autoComplete="off"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck="false"
                />
                <button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  className="w-full py-3 sm:py-2.5 px-4 rounded-lg bg-secondary text-secondary-foreground font-medium hover:opacity-90 active:opacity-80 min-h-[44px] text-sm sm:text-sm transition-colors flex items-center justify-center gap-2"
                >
                  📱 Scan QR Code
                </button>
              </div>
              <button
                type="submit"
                className="w-full py-4 sm:py-3 rounded-lg bg-primary text-white font-semibold hover:opacity-90 active:opacity-80 min-h-[48px] text-base sm:text-sm transition-colors"
                disabled={!codeInput.trim()}
              >
                Watch Meeting
              </button>
            </form>
          </div>
        </div>
      </div>
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

  return (
    <MeetingContext
      meetingData={mockMeetingData}
      participants={mockParticipants}
      currentSpeaker={currentSpeakerFromQueue}
      speakingQueue={[]}
      userRole={
        mode === "host"
          ? "facilitator"
          : mode === "watch"
            ? "observer"
            : "participant"
      }
      onAddToQueue={handleJoinQueue}
      onRemoveFromQueue={handleLeaveQueue}
      onReorderQueue={handleReorderQueue}
      onUpdateParticipant={handleUpdateParticipant}
      onRemoveParticipant={handleRemoveParticipant}
      onEndMeeting={handleEndMeeting}
    >
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Host remote controls & share links */}
        {mode === "host" && (
          <div className="bg-muted/30 text-muted-foreground rounded-lg p-4 border border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-3">
              <h3 className="text-sm font-medium text-foreground">Meeting Settings</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <label className="inline-flex items-center gap-2 text-xs min-h-[44px] sm:min-h-auto">
                  <input
                    type="checkbox"
                    checked={isLiveMeeting}
                    onChange={(e) => setIsLiveMeeting(e.target.checked)}
                    className="w-4 h-4 sm:w-3 sm:h-3"
                  />
                  Live Meeting
                </label>
                <label className="inline-flex items-center gap-2 text-xs min-h-[44px] sm:min-h-auto">
                  <input
                    type="checkbox"
                    checked={remoteEnabled}
                    onChange={(e) => setRemoteEnabled(e.target.checked)}
                    className="w-4 h-4 sm:w-3 sm:h-3"
                  />
                  Enable remote joining
                </label>
              </div>
            </div>
            <div className="mb-3 text-xs text-muted-foreground">
              <p><strong>Live Meeting:</strong> Meeting is active and participants can join remotely</p>
              <p><strong>Local/Manual:</strong> Meeting is for in-person facilitation only</p>
            </div>
            {isLiveMeeting && remoteEnabled && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Join link</span>
                <button
                  className="px-2 py-1 rounded text-xs bg-muted hover:bg-muted/80"
                  aria-label="Copy join link to clipboard"
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `${window.location.origin}/meeting?mode=join&code=${meetingCode}`,
                    )
                  }
                >
                  Copy
                </button>
                </div>
                <code className="block break-all p-2 rounded bg-muted/20 text-xs">{`${window.location.origin}/meeting?mode=join&code=${meetingCode}`}</code>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Watch link</span>
                  <button
                    className="px-2 py-1 rounded text-xs bg-muted hover:bg-muted/80"
                    aria-label="Copy watch link to clipboard"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `${window.location.origin}/meeting?mode=watch&code=${meetingCode}`,
                      )
                    }
                  >
                    Copy
                  </button>
                </div>
                <code className="block break-all p-2 rounded bg-muted/20 text-xs">{`${window.location.origin}/meeting?mode=watch&code=${meetingCode}`}</code>
              <div className="pt-2 space-y-2">
                <div className="flex gap-2">
                  <button
                    className="flex-1 py-1.5 px-2 rounded bg-muted hover:bg-muted/80 text-xs font-medium transition-colors"
                    disabled={!meetingCode}
                    aria-label="Generate QR code for joining this meeting"
                    onClick={async () => {
                        if (!meetingCode) {
                          return;
                        }
                        const link = `${window.location.origin}/meeting?mode=join&code=${meetingCode}`;
                        const dataUrl = await QRCode.toDataURL(link, {
                          width: 256,
                          margin: 2,
                        });
                        setQrUrl(dataUrl);
                        setQrType('join');
                        setQrOpen(true);
                      }}
                    >
                      📱 Join QR
                    </button>
                  <button
                    className="flex-1 py-1.5 px-2 rounded bg-muted hover:bg-muted/80 text-xs font-medium transition-colors"
                    disabled={!meetingCode}
                    aria-label="Generate QR code for watching this meeting"
                    onClick={async () => {
                        if (!meetingCode) {
                          return;
                        }
                        const link = `${window.location.origin}/meeting?mode=watch&code=${meetingCode}`;
                        const dataUrl = await QRCode.toDataURL(link, {
                          width: 256,
                          margin: 2,
                        });
                        setQrUrl(dataUrl);
                        setQrType('watch');
                        setQrOpen(true);
                      }}
                    >
                      👁️ Watch QR
                    </button>
                </div>
              </div>
            )}
            {!isLiveMeeting && (
              <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded">
                <p><strong>Local Meeting Mode:</strong> This meeting is set to local/manual mode. Enable "Live Meeting" to allow remote participants to join.</p>
              </div>
            )}

            {/* Participant Management - HOST mode only */}
            <div className="bg-card text-card-foreground rounded-2xl p-6 shadow-lg border">
              <div className="mb-6">
                <h2 className="text-lg font-semibold">Participant Management</h2>
                <p className="text-sm text-muted-foreground">
                  Add, edit, and manage meeting participants
                </p>
              </div>
              
              <div className="space-y-6">
                {/* Add Participants */}
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">Add Participants</h3>
                  <QuickAddParticipant
                    onAddParticipant={handleQuickAddParticipant}
                    placeholder="Enter participant names (comma or newline separated)"
                    className="w-full"
                  />
                </div>

                {/* Participant List */}
                <ParticipantList
                  participants={mockParticipants}
                  onUpdateParticipant={handleUpdateParticipant}
                  onRemoveParticipant={handleRemoveParticipant}
                  userRole={userRole}
                />
              </div>
            </div>
          </div>
        )}

        <MeetingHeader
          meetingData={mockMeetingData}
          participantCount={mockParticipants.length}
          onLeaveMeeting={() => navigate("/")}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
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
              onLeaveQueue={handleLeaveQueue}
              onUpdateParticipantName={handleParticipantNameUpdate}
              currentUserId={currentParticipantId}
            />
            {mode === "join" && (
              <QueuePositionFeedback
                queuePosition={1}
                joinedAt={new Date()}
                currentSpeaker={currentSpeakerFromQueue}
                queueHistory={[]}
              />
            )}
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Actions Panel - only for participants (join mode), not hosts or observers */}
            {mode === "join" && (
              <ActionsPanel
                isInQueue={false}
                onJoinQueue={() => {}}
                onLeaveQueue={() => {}}
                participantName="Current User"
              />
            )}

            {/* Analytics for HOST mode */}
            {mode === "host" && (
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
                isHostMode={true}
              />
            )}
          </div>
        </div>
      </div>
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {qrType === 'join' ? 'Join via QR code' : 'Watch via QR code'}
            </DialogTitle>
            <DialogDescription>
              {qrType === 'join'
                ? 'Scan this QR code with your phone to join the meeting as a participant.'
                : 'Scan this QR code with your phone to observe the meeting remotely.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            {qrUrl && (
              <div className="bg-white p-4 rounded-lg shadow-sm">
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

      {/* QR Code Scanner */}
      {scannerOpen && (
        <QrCodeScanner
          onScan={handleQrScan}
          onClose={() => setScannerOpen(false)}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcutsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card text-card-foreground rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
              <button
                onClick={() => setShowKeyboardShortcutsModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {mode === "host" && (
                <>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm">Next Speaker</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded text-xs">Enter</kbd>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm">Undo Last Action</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded text-xs">Ctrl+Z</kbd>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm">Show/Hide Shortcuts</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded text-xs">?</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </MeetingContext>
  );
}
