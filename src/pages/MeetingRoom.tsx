import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MeetingContext } from "@/components/MeetingRoom/MeetingContext";
import { MeetingHeader } from "@/components/MeetingRoom/MeetingHeader";
import { SpeakingQueue } from "@/components/MeetingRoom/SpeakingQueue";
import { ActionsPanel } from "@/components/MeetingRoom/ActionsPanel";
import { ErrorState } from "@/components/MeetingRoom/ErrorState";
import { QueuePositionFeedback } from "@/components/MeetingRoom/QueuePositionFeedback";

type MeetingMode = "host" | "join" | "watch";

export default function MeetingRoom() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState<string>("");
  const [mode, setMode] = useState<MeetingMode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState<string>("");
  const [remoteEnabled, setRemoteEnabled] = useState<boolean>(true);

  useEffect(() => {
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

    // Generate a meeting code for host mode
    if (modeParam === "host") {
      const generatedCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      setMeetingCode(generatedCode);
    } else if (codeParam) {
      setMeetingCode(codeParam.toUpperCase());
    }

    setIsLoading(false);
  }, [searchParams]);

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
              if (normalized.length < 4) return; // simple guard
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

  // Mock data for now - in a real app this would come from Supabase
  const mockMeetingData = {
    title: mode === "host" ? "New Meeting" : `Meeting ${meetingCode}`,
    code: meetingCode,
    facilitator: "Meeting Facilitator",
    createdAt: new Date(),
  };

  const mockParticipants = [
    {
      id: "1",
      name: "John Doe",
      isFacilitator: mode === "host",
      hasRaisedHand: false,
      joinedAt: new Date(),
    },
    {
      id: "2",
      name: "Jane Smith",
      isFacilitator: false,
      hasRaisedHand: true,
      joinedAt: new Date(Date.now() - 300000), // 5 minutes ago
    },
  ];

  const mockCurrentSpeaker = {
    id: "2",
    name: "Jane Smith",
    startedSpeakingAt: new Date(Date.now() - 120000), // 2 minutes ago
  };

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
      onAddToQueue={() => {}}
      onRemoveFromQueue={() => {}}
      onReorderQueue={() => {}}
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
    </MeetingContext>
  );
}
