import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { MeetingContext } from "@/components/MeetingRoom/MeetingContext";
import { MeetingHeader } from "@/components/MeetingRoom/MeetingHeader";
import { SpeakingQueue } from "@/components/MeetingRoom/SpeakingQueue";
import { ActionsPanel } from "@/components/MeetingRoom/ActionsPanel";
import { ErrorState } from "@/components/MeetingRoom/ErrorState";
import { QueuePositionFeedback } from "@/components/MeetingRoom/QueuePositionFeedback";
import { DisplayLayout } from "@/components/WatchView/DisplayLayout";
import { QuickAddParticipant } from "@/components/features/meeting/QuickAddParticipant";
import { EnhancedEditableParticipantName } from "@/components/features/meeting/EnhancedEditableParticipantName";
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
import { validateMeetingCode, validateParticipantName } from "@/utils/meetingValidation";
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
  const [error, setError] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState<string>("");
  const [remoteEnabled, setRemoteEnabled] = useState<boolean>(true);
  const [currentParticipantId, setCurrentParticipantId] = useState<string>("");
  const { user } = useAuth();

  const [serverMeeting, setServerMeeting] =
    useState<MeetingWithParticipants | null>(null);
  const [serverParticipants, setServerParticipants] = useState<SbParticipant[]>(
    [],
  );
  const [serverQueue, setServerQueue] = useState<SbQueueItem[]>([]);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>("");

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

  const { showKeyboardShortcuts, toggleShortcuts } = useKeyboardShortcuts({
    onNextSpeaker: handleNextSpeaker,
    onUndo: handleUndo,
    onToggleShortcuts: () => setShowKeyboardShortcutsModal(prev => !prev)
  });

  const [showKeyboardShortcutsModal, setShowKeyboardShortcutsModal] = useState(false);

  const { speakerTimer, elapsedTime, startTimer, stopTimer, formatTime } = useSpeakerTimer();
  const { speakingHistory, addSpeakingSegment, getTotalSpeakingTime, getSpeakingDistribution } = useSpeakingHistory();
  const { dragIndex, handleDragStart, handleDrop, isDragOver } = useDragAndDrop();

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
      // Real-time subscription will update the UI
    } catch (error) {
      logProduction("error", {
        action: "update_participant",
        participantId,
        updates,
        error: error instanceof Error ? error.message : String(error)
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
      // Real-time subscription will update the UI
    } catch (error) {
      logProduction("error", {
        action: "quick_add_participant",
        meetingId,
        participantName: name,
        error: error instanceof Error ? error.message : String(error)
      });
      // TODO: Show user-friendly error toast
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
      const codeParam = searchParams.get("code");

      if (!modeParam || !["host", "join", "watch"].includes(modeParam)) {
        setError("Invalid meeting mode. Please use host, join, or watch.");
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
              setError(`Meeting "${currentCode}" not found or inactive. Please check the code and try again.`);
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
                setError("Failed to join meeting. Please try again.");
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
            setError("Unable to connect to meeting. Please check your internet connection and try again.");
            return;
          }
        }
      } catch (e) {
        setError("Failed to connect to meeting.");
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, [searchParams]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="bg-card text-card-foreground rounded-2xl p-6 shadow-lg border text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading meeting...</p>
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
      <div className="container mx-auto px-4 py-10 max-w-xl">
        <div className="bg-card text-card-foreground rounded-2xl p-6 shadow-lg border">
          <h1 className="text-2xl font-bold mb-2">Join a Meeting</h1>
          <p className="text-sm text-muted-foreground mb-6">
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
            className="space-y-4"
          >
            <input
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="e.g. 54ANDG"
              className="w-full px-4 py-3 rounded-lg bg-transparent border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Meeting code"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:opacity-90"
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
    ? serverParticipants.map((p) => ({
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

  const mockCurrentSpeaker = {
    id: "2",
    name: "Jane Smith",
    startedSpeakingAt: new Date(Date.now() - 120000), // 2 minutes ago
  };

  // Watch mode - show code input if no code provided
  if (mode === "watch" && !meetingCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="w-full max-w-md mx-4">
          <div className="bg-card text-card-foreground rounded-2xl p-8 shadow-lg border">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-2">Watch a Meeting</h1>
              <p className="text-sm text-muted-foreground">
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
              className="space-y-4"
            >
              <input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="e.g. 54ANDG"
                className="w-full px-4 py-3 rounded-lg bg-transparent border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Meeting code"
              />
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:opacity-90"
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
    // Use real data if available, otherwise fallback to mock data
    const speakingDistribution = serverParticipants.length > 0
      ? serverParticipants.map(p => ({
          name: p.name,
          value: Math.floor(Math.random() * 300) + 60 // Mock speaking time in seconds
        }))
      : [
          { name: "Jane Smith", value: 180 }, // 3 minutes
          { name: "John Doe", value: 120 },   // 2 minutes
          { name: "Alice Johnson", value: 90 }, // 1.5 minutes
          { name: "Bob Wilson", value: 60 },  // 1 minute
        ];

    return (
      <DisplayLayout
        meetingData={mockMeetingData}
        participants={mockParticipants}
        currentSpeaker={mockCurrentSpeaker}
        speakingQueue={serverQueue}
        speakingDistribution={speakingDistribution}
      />
    );
  }

  return (
    <MeetingContext
      meetingData={mockMeetingData}
      participants={mockParticipants}
      currentSpeaker={mockCurrentSpeaker}
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
      onEndMeeting={handleEndMeeting}
    >
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Host remote controls & share links */}
        {mode === "host" && (
          <div className="bg-card text-card-foreground rounded-2xl p-6 shadow-lg border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Remote Access</h2>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={remoteEnabled}
                  onChange={(e) => setRemoteEnabled(e.target.checked)}
                />
                Enable remote joining
              </label>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Join link</span>
              <button
                className="px-3 py-1.5 rounded bg-gray-100 dark:bg-zinc-800"
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
              <code className="block break-all p-2 rounded bg-muted/30">{`${window.location.origin}/meeting?mode=join&code=${meetingCode}`}</code>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Watch link</span>
                <button
                  className="px-3 py-1.5 rounded bg-gray-100 dark:bg-zinc-800"
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
              <code className="block break-all p-2 rounded bg-muted/30">{`${window.location.origin}/meeting?mode=watch&code=${meetingCode}`}</code>
              <div className="pt-3">
              <button
                className="w-full py-2 rounded-lg bg-primary text-white font-semibold hover:opacity-90 disabled:opacity-50"
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
                    setQrOpen(true);
                  }}
                >
                  Show QR for Join Link
                </button>
              </div>
            </div>

            {/* Quick Add Participant Component - HOST mode only */}
            <div className="bg-card text-card-foreground rounded-2xl p-6 shadow-lg border">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Add Participants</h2>
                <p className="text-sm text-muted-foreground">
                  Quickly add multiple participants to the meeting
                </p>
              </div>
              <QuickAddParticipant
                onAddParticipant={handleQuickAddParticipant}
                placeholder="Enter participant names (comma or newline separated)"
                className="w-full"
              />
            </div>
          </div>
        )}

        <MeetingHeader
          meetingData={mockMeetingData}
          participantCount={mockParticipants.length}
          onLeaveMeeting={() => navigate("/")}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SpeakingQueue
              speakingQueue={serverQueue.map((item, index) => ({
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
                currentSpeaker={mockCurrentSpeaker}
                queueHistory={[]}
              />
            )}
          </div>

          <div className="space-y-6">
            <ActionsPanel
              isInQueue={false}
              onJoinQueue={() => {}}
              onLeaveQueue={() => {}}
              participantName="Current User"
            />
          </div>
        </div>
      </div>
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Join via QR code</DialogTitle>
            <DialogDescription>
              Scan to open the join link on a phone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            {qrUrl && <img src={qrUrl} alt="Join QR" className="w-64 h-64" />}
          </div>
        </DialogContent>
      </Dialog>


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
    </MeetingContext>
  );
}
