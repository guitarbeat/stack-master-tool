import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MeetingHeader } from "@/components/MeetingRoom/MeetingHeader";
import { SpeakingQueue } from "@/components/MeetingRoom/SpeakingQueue";
import { ActionsPanel } from "@/components/MeetingRoom/ActionsPanel";
import { ErrorState } from "@/components/MeetingRoom/ErrorState";
import { HostSettingsPanel } from "@/components/MeetingRoom/HostSettingsPanel";
import { KeyboardShortcutsModal } from "@/components/MeetingRoom/KeyboardShortcutsModal";
import { AppError, ErrorCode } from "@/utils/errorHandling";
import { QueuePositionFeedback } from "@/components/MeetingRoom/QueuePositionFeedback";
import { DisplayLayout } from "@/components/WatchView/DisplayLayout";
import { SpeakingAnalytics } from "@/components/WatchView/SpeakingAnalytics";
import { LoadingState } from "@/components/shared/LoadingState";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

import { QrCodeScanner } from "@/components/ui/qr-code-scanner";
import { CodeInputForm } from "@/components/MeetingRoom/CodeInputForm";
import { useAuth } from "@/hooks/useAuth";
import { useMeetingState } from "@/hooks/useMeetingState";
import { useMeetingRealtime } from "@/hooks/useMeetingRealtime";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useSpeakerTimer } from "@/hooks/useSpeakerTimer";
import { useSpeakingHistory } from "@/hooks/useSpeakingHistory";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { useMeetingActions } from "@/hooks/useMeetingActions";
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
    backend,
    setBackend,
    meetingService,
    realtimeService,
  } = useMeetingState();

  // * Meeting actions hook for host functionality
  const {
    handleEndMeeting,
    handleReorderQueue,
    handleNextSpeaker,
    handleUndo,
    handleJoinQueue,
    handleLeaveQueue,
    handleUpdateParticipant,
    handleRemoveParticipant,
    handleAddParticipant,
    handleQrScan
  } = useMeetingActions({
    meetingId,
    meetingCode,
    meetingService,
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
      const created = await meetingService.createMeeting(
        codeInput.trim(),
        facilitatorName,
        user?.id,
      );

      // Update the meeting state
      setMeetingId(created.id);
      setMeetingCode(created.code);

      // Load the full meeting data
      const full = await meetingService.getMeeting(created.code);
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

  const handleMeetingCodeChange = async (newCode: string) => {
    if (!meetingId) return;

    try {
      await meetingService.updateMeetingCode(meetingId, newCode);
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
  useMeetingRealtime({
    meetingId,
    meetingCode,
    realtimeService,
    setServerParticipants,
    setServerQueue,
    setServerMeeting,
    setShowJohnDoe,
  });

  // Cleanup: Mark participant as inactive when leaving
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (currentParticipantId && mode === "join") {
        try {
          await meetingService.leaveMeeting(currentParticipantId);
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
        void meetingService.leaveMeeting(currentParticipantId).catch(error => {
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
  }, [currentParticipantId, mode, meetingService]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="bg-card rounded-2xl p-6 shadow-xl border border-border text-center">
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
    startedSpeakingAt: new Date(serverQueue[0].joinedQueueAt || Date.now()), // Handle missing timestamp in QueueItem if undefined (QueueItem defines timestamp as number, but logic might use joinedQueueAt string in some places?)
    // Note: QueueItem interface has timestamp: number. But speaking_queue DB has joined_queue_at string.
    // SupabaseService maps it.
    // P2PService maps it.
    // DisplayLayout expects Date.
    // QueueItem has timestamp (number).
    // I should convert timestamp to Date.
  } : null;
  // Correction: QueueItem interface in src/types/meeting.ts has timestamp: number.
  // In `serverQueue`, items are QueueItem.
  // So serverQueue[0].timestamp should be used.
  // But wait, existing code used `serverQueue[0].joinedQueueAt`.
  // Does QueueItem have `joinedQueueAt`?
  // In `src/types/meeting.ts`:
  // export interface QueueItem { ... timestamp: number; ... }
  // There is NO `joinedQueueAt` in interface.
  // But `SupabaseService.getMeeting` returns items with `timestamp: new Date(q.joined_queue_at).getTime()`.
  // So `serverQueue` items have `timestamp`.
  // The existing code I read earlier had:
  // startedSpeakingAt: new Date(serverQueue[0].joinedQueueAt),
  // This implies `QueueItem` might have had `joinedQueueAt` or TS was loose?
  // Or I misread.
  // Let's use `serverQueue[0].timestamp`.
  // Wait, `SupabaseService` mapping:
  /*
        speakingQueue: queueRows.map((q) => ({
          // ...
          timestamp: new Date(q.joined_queue_at).getTime(),
          // ...
        })),
  */
  // So the object has `timestamp`.
  // I will correct `currentSpeakerFromQueue` logic.

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
        currentSpeaker={currentSpeakerFromQueue ? {
            participantName: currentSpeakerFromQueue.participantName,
            startedSpeakingAt: new Date(serverQueue[0].timestamp) // Corrected
        } : null}
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
            backend={backend}
            setBackend={setBackend}
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
              speakingQueue={serverQueue}
              participantName={user?.email ?? "Current User"}
              onLeaveQueue={() => {
                void handleLeaveQueue();
              }}
              currentUserId={currentParticipantId}
              isFacilitator={mode === "host"}
              onReorderQueue={handleReorderQueue}
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
                currentSpeaker={currentSpeakerFromQueue ? {
                    participantName: currentSpeakerFromQueue.participantName,
                    startedSpeakingAt: new Date(serverQueue[0].timestamp)
                } : null}
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
              currentSpeaker={currentSpeakerFromQueue ? {
                  participantName: currentSpeakerFromQueue.participantName,
                  startedSpeakingAt: new Date(serverQueue[0].timestamp)
              } : null}
              queueHistory={[]}
            />
            <ActionsPanel
              isInQueue={serverQueue.some(q => q.participantId === currentParticipantId)} // Corrected: Check queue
              onJoinQueue={() => void handleJoinQueue()}
              onLeaveQueue={() => void handleLeaveQueue()}
              participantName={participantName || "Current User"}
            />
          </>
        )}

        {mode === "watch" && (
          /* Observer: Read-only queue view */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <SpeakingQueue
                speakingQueue={serverQueue}
                participantName={user?.email ?? "Observer"}
                onLeaveQueue={() => {}}
                currentUserId={undefined}
                isFacilitator={false}
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
                currentSpeaker={currentSpeakerFromQueue ? {
                    participantName: currentSpeakerFromQueue.participantName,
                    startedSpeakingAt: new Date(serverQueue[0].timestamp)
                } : null}
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
      <KeyboardShortcutsModal
        isOpen={showKeyboardShortcutsModal}
        onClose={() => setShowKeyboardShortcutsModal(false)}
        isHost={mode === "host"}
      />

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
