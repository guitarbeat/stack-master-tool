import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { MeetingContext } from "@/components/MeetingRoom/MeetingContext";
import { MeetingHeader } from "@/components/MeetingRoom/MeetingHeader";
import { SpeakingQueue } from "@/components/MeetingRoom/SpeakingQueue";
import { ActionsPanel } from "@/components/MeetingRoom/ActionsPanel";
import { ErrorState } from "@/components/MeetingRoom/ErrorState";
import { QueuePositionFeedback } from "@/components/MeetingRoom/QueuePositionFeedback";
import { DisplayLayout } from "@/components/WatchView/DisplayLayout";
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
      console.error("Error advancing to next speaker:", error);
      // Optionally, show an error toast to the user
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
      console.error("Error undoing next speaker:", error);
      // Optionally, show an error toast to the user
    }
  };

  const { showKeyboardShortcuts, toggleShortcuts } = useKeyboardShortcuts({
    onNextSpeaker: handleNextSpeaker,
    onUndo: handleUndo,
    onToggleShortcuts: toggleShortcuts
  });

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
      console.error("Failed to join queue:", error);
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
      console.error("Failed to leave queue:", error);
    }
  };

  const handleReorderQueue = async (dragIndex: number, targetIndex: number) => {
    // This would need to be implemented in the Supabase service
    console.log(`Reorder queue: ${dragIndex} -> ${targetIndex}`);
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

      // For join/watch modes, we prefer a meeting code; if missing in join mode, we'll show a form
      if (modeParam === "watch" && !codeParam) {
        setError("Meeting code is required to watch a meeting.");
        setIsLoading(false);
        return;
      }
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
                console.error("Failed to join meeting as participant:", joinError);
                setError("Failed to join meeting. Please try again.");
                return;
              }
            }
          } catch (fetchError) {
            console.error("Error fetching meeting:", fetchError);
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
        <div className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800 text-center">
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
        <div className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
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

  // Watch mode optimized layout
  if (mode === "watch") {
    // Mock speaking distribution data for demonstration
    const mockSpeakingDistribution = [
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
        speakingDistribution={mockSpeakingDistribution}
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
      onUpdateParticipant={() => {}}
      onEndMeeting={() => navigate("/")}
    >
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Host remote controls & share links */}
        {mode === "host" && (
          <div className="bg-white rounded-2xl p-6 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
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
              speakingQueue={[]}
              participantName="Current User"
              onLeaveQueue={() => {}}
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
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
              <button
                onClick={toggleShortcuts}
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
