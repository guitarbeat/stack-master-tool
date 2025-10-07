import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { JoinView } from "../JoinView";
import { useSupabaseParticipant } from "../../../hooks/useSupabaseParticipant";

// Mock the useSupabaseParticipant hook
const mockUseSupabaseParticipant = {
  meetingData: {
    code: "ABC123",
    title: "Test Meeting",
    facilitator: "Test Facilitator",
  },
  participants: [
<<<<<<< HEAD
    { id: "1", name: "John Doe", isSpeaking: false, queuePosition: 1 },
    { id: "2", name: "Jane Smith", isSpeaking: true, queuePosition: 0 },
=======
    { id: '1', name: 'John Doe', isSpeaking: false, queuePosition: 1, isFacilitator: false, hasRaisedHand: false },
    { id: '2', name: 'Jane Smith', isSpeaking: true, queuePosition: 0, isFacilitator: false, hasRaisedHand: false },
  ],
  speakingQueue: [
    { id: '1', participantName: 'John Doe', type: 'speak', timestamp: Date.now() },
>>>>>>> origin/main
  ],
  speakingQueue: [{ id: "1", name: "John Doe", position: 1 }],
  isInQueue: false,
  isConnected: true,
<<<<<<< HEAD
  error: null,
  currentSpeaker: { id: "2", name: "Jane Smith", position: 0 },
  joinQueue: vi.fn(),
  leaveQueue: vi.fn(),
  leaveMeeting: vi.fn(),
  connectionQuality: "good",
=======
  error: '',
  currentSpeaker: { id: '2', participantName: 'Jane Smith', type: 'speak', timestamp: Date.now() },
  joinQueue: vi.fn(),
  leaveQueue: vi.fn(),
  leaveMeeting: vi.fn(),
  connectionQuality: 'good' as const,
>>>>>>> origin/main
  lastConnected: new Date(),
  reconnectAttempts: 0,
  onReconnect: vi.fn(),
};

vi.mock("../../../hooks/useSupabaseParticipant", () => ({
  useSupabaseParticipant: vi.fn(() => mockUseSupabaseParticipant),
}));

// Mock other dependencies
vi.mock("../MeetingHeader", () => ({
  MeetingHeader: ({ meetingData }: { meetingData: any }) => (
    <div data-testid="meeting-header">
      {meetingData?.title} - {meetingData?.facilitator}
    </div>
  ),
}));

vi.mock("../CurrentSpeakerAlert", () => ({
  CurrentSpeakerAlert: ({ currentSpeaker }: { currentSpeaker: any }) => (
    <div data-testid="current-speaker-alert">
      Current Speaker: {currentSpeaker?.participantName || "None"}
    </div>
  ),
}));

<<<<<<< HEAD
vi.mock("../SpeakingQueue", () => ({
  SpeakingQueue: ({
    speakingQueue,
    participantName,
  }: {
    speakingQueue: any[];
    participantName: string;
  }) => (
=======
vi.mock('../SpeakingQueue', () => ({
  SpeakingQueue: ({ speakingQueue }: { speakingQueue: any[] }) => (
>>>>>>> origin/main
    <div data-testid="speaking-queue">
      Queue: {speakingQueue.length} participants
    </div>
  ),
}));

vi.mock("../ActionsPanel", () => ({
  ActionsPanel: ({
    onJoinQueue,
    onLeaveQueue,
    isInQueue,
  }: {
    onJoinQueue: () => void;
    onLeaveQueue: () => void;
    isInQueue: boolean;
  }) => (
    <div data-testid="actions-panel">
      <button onClick={onJoinQueue} data-testid="join-queue-btn">
        Join Queue
      </button>
      <button onClick={onLeaveQueue} data-testid="leave-queue-btn">
        Leave Queue
      </button>
      <span data-testid="queue-status">
        {isInQueue ? "In Queue" : "Not In Queue"}
      </span>
    </div>
  ),
}));

vi.mock("../LoadingState", () => ({
  LoadingState: () => <div data-testid="loading-state">Loading...</div>,
}));

vi.mock("../ErrorState", () => ({
  ErrorState: ({ error }: { error: string }) => (
    <div data-testid="error-state">Error: {error}</div>
  ),
}));

vi.mock("../ConnectionStatus", () => ({
  ConnectionStatus: ({
    isConnected,
    connectionQuality,
  }: {
    isConnected: boolean;
    connectionQuality: string;
  }) => (
    <div data-testid="connection-status">
      {isConnected ? "Connected" : "Disconnected"} - {connectionQuality}
    </div>
  ),
}));

vi.mock("../QueuePositionFeedback", () => ({
  QueuePositionFeedback: ({ queuePosition }: { queuePosition: number }) => (
    <div data-testid="queue-position-feedback">Position: {queuePosition}</div>
  ),
}));

vi.mock("../MeetingContext", () => ({
  MeetingContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="meeting-context">{children}</div>
  ),
}));

vi.mock("../EnhancedErrorState", () => ({
  EnhancedErrorState: ({
    error,
    onRetry,
  }: {
    error: string;
    onRetry: () => void;
  }) => (
    <div data-testid="enhanced-error-state">
      <div>Error: {error}</div>
      <button onClick={onRetry} data-testid="retry-btn">
        Retry
      </button>
    </div>
  ),
}));

describe("JoinView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderJoinView = () => {
    return render(
      <BrowserRouter>
        <JoinView />
      </BrowserRouter>
    );
  };

  it("renders join form initially", () => {
    renderJoinView();

    expect(screen.getByText("Join a Meeting")).toBeInTheDocument();
    expect(screen.getByLabelText("Meeting Code")).toBeInTheDocument();
    expect(screen.getByLabelText("Your Name")).toBeInTheDocument();
    expect(screen.getByText("Join Meeting")).toBeInTheDocument();
  });

  it("validates form inputs before joining", () => {
    renderJoinView();

    const joinBtn = screen.getByText("Join Meeting");
    fireEvent.click(joinBtn);

    // Should not join with empty inputs
    expect(mockUseSupabaseParticipant.joinQueue).not.toHaveBeenCalled();
  });

  it("joins meeting with valid inputs", () => {
    renderJoinView();

    const meetingCodeInput = screen.getByLabelText("Meeting Code");
    const participantNameInput = screen.getByLabelText("Your Name");
    const joinBtn = screen.getByText("Join Meeting");

    fireEvent.change(meetingCodeInput, { target: { value: "ABC123" } });
    fireEvent.change(participantNameInput, { target: { value: "John Doe" } });
    fireEvent.click(joinBtn);

    expect(screen.getByTestId("meeting-header")).toBeInTheDocument();
  });

  it("displays meeting information after joining", () => {
    // Mock the hook to return joined state
    const joinedMock = {
      ...mockUseSupabaseParticipant,
      meetingData: {
        code: "ABC123",
        title: "Test Meeting",
        facilitator: "Test Facilitator",
      },
    };

    vi.mocked(useSupabaseParticipant).mockReturnValue(joinedMock);

    renderJoinView();

    // Simulate joining
    const meetingCodeInput = screen.getByLabelText("Meeting Code");
    const participantNameInput = screen.getByLabelText("Your Name");
    const joinBtn = screen.getByText("Join Meeting");

    fireEvent.change(meetingCodeInput, { target: { value: "ABC123" } });
    fireEvent.change(participantNameInput, { target: { value: "John Doe" } });
    fireEvent.click(joinBtn);

    expect(
      screen.getByText("Test Meeting - Test Facilitator")
    ).toBeInTheDocument();
  });

  it("shows current speaker information", () => {
    renderJoinView();

    // Simulate joining
    const meetingCodeInput = screen.getByLabelText("Meeting Code");
    const participantNameInput = screen.getByLabelText("Your Name");
    const joinBtn = screen.getByText("Join Meeting");

    fireEvent.change(meetingCodeInput, { target: { value: "ABC123" } });
    fireEvent.change(participantNameInput, { target: { value: "John Doe" } });
    fireEvent.click(joinBtn);

    expect(screen.getByTestId("current-speaker-alert")).toBeInTheDocument();
    expect(screen.getByText("Current Speaker: None")).toBeInTheDocument();
  });

  it("displays speaking queue", () => {
    renderJoinView();

    // Simulate joining
    const meetingCodeInput = screen.getByLabelText("Meeting Code");
    const participantNameInput = screen.getByLabelText("Your Name");
    const joinBtn = screen.getByText("Join Meeting");

    fireEvent.change(meetingCodeInput, { target: { value: "ABC123" } });
    fireEvent.change(participantNameInput, { target: { value: "John Doe" } });
    fireEvent.click(joinBtn);

    expect(screen.getByTestId("speaking-queue")).toBeInTheDocument();
    expect(screen.getByText("Queue: 1 participants")).toBeInTheDocument();
  });

  it("handles join queue action", () => {
    renderJoinView();

    // Simulate joining
    const meetingCodeInput = screen.getByLabelText("Meeting Code");
    const participantNameInput = screen.getByLabelText("Your Name");
    const joinBtn = screen.getByText("Join Meeting");

    fireEvent.change(meetingCodeInput, { target: { value: "ABC123" } });
    fireEvent.change(participantNameInput, { target: { value: "John Doe" } });
    fireEvent.click(joinBtn);

    const joinQueueBtn = screen.getByTestId("join-queue-btn");
    fireEvent.click(joinQueueBtn);

    expect(mockUseSupabaseParticipant.joinQueue).toHaveBeenCalled();
  });

  it("handles leave queue action", () => {
    renderJoinView();

    // Simulate joining
    const meetingCodeInput = screen.getByLabelText("Meeting Code");
    const participantNameInput = screen.getByLabelText("Your Name");
    const joinBtn = screen.getByText("Join Meeting");

    fireEvent.change(meetingCodeInput, { target: { value: "ABC123" } });
    fireEvent.change(participantNameInput, { target: { value: "John Doe" } });
    fireEvent.click(joinBtn);

    const leaveQueueBtn = screen.getByTestId("leave-queue-btn");
    fireEvent.click(leaveQueueBtn);

    expect(mockUseSupabaseParticipant.leaveQueue).toHaveBeenCalled();
  });

  it("shows connection status", () => {
    renderJoinView();

    // Simulate joining
    const meetingCodeInput = screen.getByLabelText("Meeting Code");
    const participantNameInput = screen.getByLabelText("Your Name");
    const joinBtn = screen.getByText("Join Meeting");

    fireEvent.change(meetingCodeInput, { target: { value: "ABC123" } });
    fireEvent.change(participantNameInput, { target: { value: "John Doe" } });
    fireEvent.click(joinBtn);

    expect(screen.getByTestId("connection-status")).toBeInTheDocument();
    expect(screen.getByText("Connected - good")).toBeInTheDocument();
  });

  it("shows error state when there is an error", () => {
    const errorMock = {
<<<<<<< HEAD
      ...mockUseSupabaseParticipant,
      error: "Connection failed",
=======
      ...mockUseMeetingSocket,
      error: 'Connection failed',
      currentSpeaker: { id: '2', participantName: 'Jane Smith', type: 'speak', timestamp: Date.now() },
>>>>>>> origin/main
    };

    vi.mocked(useSupabaseParticipant).mockReturnValue(errorMock);

    // First join the meeting to trigger the hook
    renderJoinView();
    const meetingCodeInput = screen.getByLabelText("Meeting Code");
    const participantNameInput = screen.getByLabelText("Your Name");
    const joinBtn = screen.getByText("Join Meeting");

    fireEvent.change(meetingCodeInput, { target: { value: "ABC123" } });
    fireEvent.change(participantNameInput, { target: { value: "John Doe" } });
    fireEvent.click(joinBtn);

    expect(screen.getByTestId("enhanced-error-state")).toBeInTheDocument();
    expect(screen.getByText("Error: Connection failed")).toBeInTheDocument();
  });

  it("handles retry action in error state", () => {
    const errorMock = {
<<<<<<< HEAD
      ...mockUseSupabaseParticipant,
      error: "Connection failed",
=======
      ...mockUseMeetingSocket,
      error: 'Connection failed',
      currentSpeaker: { id: '2', participantName: 'Jane Smith', type: 'speak', timestamp: Date.now() },
>>>>>>> origin/main
    };

    vi.mocked(useSupabaseParticipant).mockReturnValue(errorMock);

    // First join the meeting to trigger the hook
    renderJoinView();
    const meetingCodeInput = screen.getByLabelText("Meeting Code");
    const participantNameInput = screen.getByLabelText("Your Name");
    const joinBtn = screen.getByText("Join Meeting");

    fireEvent.change(meetingCodeInput, { target: { value: "ABC123" } });
    fireEvent.change(participantNameInput, { target: { value: "John Doe" } });
    fireEvent.click(joinBtn);

    const retryBtn = screen.getByTestId("retry-btn");
    fireEvent.click(retryBtn);

    // The retry button calls window.location.reload(), not onReconnect
    expect(window.location.reload).toHaveBeenCalled();
  });

  it("shows loading state when connecting", () => {
    const loadingMock = {
      ...mockUseSupabaseParticipant,
      isConnected: false,
      error: '',
    };

    vi.mocked(useSupabaseParticipant).mockReturnValue(loadingMock);

    // First join the meeting to trigger the hook
    renderJoinView();
    const meetingCodeInput = screen.getByLabelText("Meeting Code");
    const participantNameInput = screen.getByLabelText("Your Name");
    const joinBtn = screen.getByText("Join Meeting");

    fireEvent.change(meetingCodeInput, { target: { value: "ABC123" } });
    fireEvent.change(participantNameInput, { target: { value: "John Doe" } });
    fireEvent.click(joinBtn);

    expect(screen.getByTestId("loading-state")).toBeInTheDocument();
  });

  it("handles leave meeting action", () => {
    // Mock the hook to return joined state
    const joinedMock = {
      ...mockUseSupabaseParticipant,
      meetingData: {
        code: "ABC123",
        title: "Test Meeting",
        facilitator: "Test Facilitator",
      },
    };

    vi.mocked(useSupabaseParticipant).mockReturnValue(joinedMock);

    renderJoinView();

    // Simulate joining first
    const meetingCodeInput = screen.getByLabelText("Meeting Code");
    const participantNameInput = screen.getByLabelText("Your Name");
    const joinBtn = screen.getByText("Join Meeting");

    fireEvent.change(meetingCodeInput, { target: { value: "ABC123" } });
    fireEvent.change(participantNameInput, { target: { value: "John Doe" } });
    fireEvent.click(joinBtn);

    // The leave meeting functionality is in the MeetingHeader component
    expect(screen.getByTestId("meeting-header")).toBeInTheDocument();
  });

  it("updates queue status correctly", () => {
    const inQueueMock = {
      ...mockUseSupabaseParticipant,
      isInQueue: true,
    };

    vi.mocked(useSupabaseParticipant).mockReturnValue(inQueueMock);

    renderJoinView();

    // Simulate joining
    const meetingCodeInput = screen.getByLabelText("Meeting Code");
    const participantNameInput = screen.getByLabelText("Your Name");
    const joinBtn = screen.getByText("Join Meeting");

    fireEvent.change(meetingCodeInput, { target: { value: "ABC123" } });
    fireEvent.change(participantNameInput, { target: { value: "John Doe" } });
    fireEvent.click(joinBtn);

    expect(screen.getByText("In Queue")).toBeInTheDocument();
  });
});
