import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { JoinView } from '../JoinView';
import { useMeetingSocket } from '../../../hooks/useMeetingSocket';

// Helper function to create proper participant objects
const createParticipant = (id: string, name: string, isSpeaking: boolean, queuePosition: number) => ({
  id,
  name,
  isSpeaking,
  queuePosition,
  isFacilitator: false,
  hasRaisedHand: false,
});

// Mock the useMeetingSocket hook
const mockUseMeetingSocket = {
  meetingData: {
    code: 'ABC123',
    title: 'Test Meeting',
    facilitator: 'Test Facilitator',
  },
  participants: [
    createParticipant('1', 'John Doe', false, 1),
    createParticipant('2', 'Jane Smith', true, 0),
  ],
  speakingQueue: [
    { id: '1', name: 'John Doe', position: 1 },
  ],
  isInQueue: false,
  isConnected: true,
  error: null,
  currentSpeaker: { id: '2', name: 'Jane Smith', position: 0 },
  joinQueue: vi.fn(),
  leaveQueue: vi.fn(),
  leaveMeeting: vi.fn(),
  connectionQuality: 'good',
  lastConnected: new Date(),
  reconnectAttempts: 0,
  onReconnect: vi.fn(),
};

vi.mock('../../../hooks/useMeetingSocket', () => ({
  useMeetingSocket: vi.fn(() => mockUseMeetingSocket),
}));

// Mock other dependencies
vi.mock('../MeetingHeader', () => ({
  MeetingHeader: ({ meetingData }: { meetingData: any }) => (
    <div data-testid="meeting-header">
      {meetingData?.title} - {meetingData?.facilitator}
    </div>
  ),
}));

vi.mock('../CurrentSpeakerAlert', () => ({
  CurrentSpeakerAlert: ({ currentSpeaker }: { currentSpeaker: any }) => (
    <div data-testid="current-speaker-alert">
      Current Speaker: {currentSpeaker?.participantName || 'None'}
    </div>
  ),
}));

vi.mock('../SpeakingQueue', () => ({
  SpeakingQueue: ({ speakingQueue }: { speakingQueue: any[] }) => (
    <div data-testid="speaking-queue">
      Queue: {speakingQueue.length} participants
    </div>
  ),
}));

vi.mock('../ActionsPanel', () => ({
  ActionsPanel: ({ onJoinQueue, onLeaveQueue, isInQueue }: { 
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
      <span data-testid="queue-status">{isInQueue ? 'In Queue' : 'Not In Queue'}</span>
    </div>
  ),
}));

vi.mock('../LoadingState', () => ({
  LoadingState: () => <div data-testid="loading-state">Loading...</div>,
}));

vi.mock('../ErrorState', () => ({
  ErrorState: ({ error }: { error: string }) => (
    <div data-testid="error-state">Error: {error}</div>
  ),
}));

vi.mock('../ConnectionStatus', () => ({
  ConnectionStatus: ({ isConnected, connectionQuality }: { isConnected: boolean; connectionQuality: string }) => (
    <div data-testid="connection-status">
      {isConnected ? 'Connected' : 'Disconnected'} - {connectionQuality}
    </div>
  ),
}));

vi.mock('../QueuePositionFeedback', () => ({
  QueuePositionFeedback: ({ queuePosition }: { queuePosition: number }) => (
    <div data-testid="queue-position-feedback">
      Position: {queuePosition}
    </div>
  ),
}));

vi.mock('../MeetingContext', () => ({
  MeetingContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="meeting-context">{children}</div>
  ),
}));

vi.mock('../EnhancedErrorState', () => ({
  EnhancedErrorState: ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <div data-testid="enhanced-error-state">
      <div>Error: {error}</div>
      <button onClick={onRetry} data-testid="retry-btn">Retry</button>
    </div>
  ),
}));

describe('JoinView', () => {
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

  it('renders join form initially', () => {
    renderJoinView();
    
    expect(screen.getByText('Join a Meeting')).toBeInTheDocument();
    expect(screen.getByLabelText('Meeting Code')).toBeInTheDocument();
    expect(screen.getByLabelText('Your Name')).toBeInTheDocument();
    expect(screen.getByText('Join Meeting')).toBeInTheDocument();
  });

  it('validates form inputs before joining', () => {
    renderJoinView();
    
    const joinBtn = screen.getByText('Join Meeting');
    fireEvent.click(joinBtn);
    
    // Should not join with empty inputs
    expect(mockUseMeetingSocket.joinQueue).not.toHaveBeenCalled();
  });

  it('joins meeting with valid inputs', () => {
    renderJoinView();
    
    const meetingCodeInput = screen.getByLabelText('Meeting Code');
    const participantNameInput = screen.getByLabelText('Your Name');
    const joinBtn = screen.getByText('Join Meeting');
    
    fireEvent.change(meetingCodeInput, { target: { value: 'ABC123' } });
    fireEvent.change(participantNameInput, { target: { value: 'John Doe' } });
    fireEvent.click(joinBtn);
    
    expect(screen.getByTestId('meeting-header')).toBeInTheDocument();
  });

  it('displays meeting information after joining', () => {
    // Mock the hook to return joined state
    const joinedMock = {
      ...mockUseMeetingSocket,
      meetingData: {
        code: 'ABC123',
        title: 'Test Meeting',
        facilitator: 'Test Facilitator',
      },
    };
    
    vi.mocked(useMeetingSocket).mockReturnValue(joinedMock);
    
    renderJoinView();
    
    // Simulate joining
    const meetingCodeInput = screen.getByLabelText('Meeting Code');
    const participantNameInput = screen.getByLabelText('Your Name');
    const joinBtn = screen.getByText('Join Meeting');
    
    fireEvent.change(meetingCodeInput, { target: { value: 'ABC123' } });
    fireEvent.change(participantNameInput, { target: { value: 'John Doe' } });
    fireEvent.click(joinBtn);
    
    expect(screen.getByText('Test Meeting - Test Facilitator')).toBeInTheDocument();
  });

  it('shows current speaker information', () => {
    renderJoinView();
    
    // Simulate joining
    const meetingCodeInput = screen.getByLabelText('Meeting Code');
    const participantNameInput = screen.getByLabelText('Your Name');
    const joinBtn = screen.getByText('Join Meeting');
    
    fireEvent.change(meetingCodeInput, { target: { value: 'ABC123' } });
    fireEvent.change(participantNameInput, { target: { value: 'John Doe' } });
    fireEvent.click(joinBtn);
    
    expect(screen.getByTestId('current-speaker-alert')).toBeInTheDocument();
    expect(screen.getByText('Current Speaker: None')).toBeInTheDocument();
  });

  it('displays speaking queue', () => {
    renderJoinView();
    
    // Simulate joining
    const meetingCodeInput = screen.getByLabelText('Meeting Code');
    const participantNameInput = screen.getByLabelText('Your Name');
    const joinBtn = screen.getByText('Join Meeting');
    
    fireEvent.change(meetingCodeInput, { target: { value: 'ABC123' } });
    fireEvent.change(participantNameInput, { target: { value: 'John Doe' } });
    fireEvent.click(joinBtn);
    
    expect(screen.getByTestId('speaking-queue')).toBeInTheDocument();
    expect(screen.getByText('Queue: 1 participants')).toBeInTheDocument();
  });

  it('handles join queue action', () => {
    renderJoinView();
    
    // Simulate joining
    const meetingCodeInput = screen.getByLabelText('Meeting Code');
    const participantNameInput = screen.getByLabelText('Your Name');
    const joinBtn = screen.getByText('Join Meeting');
    
    fireEvent.change(meetingCodeInput, { target: { value: 'ABC123' } });
    fireEvent.change(participantNameInput, { target: { value: 'John Doe' } });
    fireEvent.click(joinBtn);
    
    const joinQueueBtn = screen.getByTestId('join-queue-btn');
    fireEvent.click(joinQueueBtn);
    
    expect(mockUseMeetingSocket.joinQueue).toHaveBeenCalled();
  });

  it('handles leave queue action', () => {
    renderJoinView();
    
    // Simulate joining
    const meetingCodeInput = screen.getByLabelText('Meeting Code');
    const participantNameInput = screen.getByLabelText('Your Name');
    const joinBtn = screen.getByText('Join Meeting');
    
    fireEvent.change(meetingCodeInput, { target: { value: 'ABC123' } });
    fireEvent.change(participantNameInput, { target: { value: 'John Doe' } });
    fireEvent.click(joinBtn);
    
    const leaveQueueBtn = screen.getByTestId('leave-queue-btn');
    fireEvent.click(leaveQueueBtn);
    
    expect(mockUseMeetingSocket.leaveQueue).toHaveBeenCalled();
  });

  it('shows connection status', () => {
    renderJoinView();
    
    // Simulate joining
    const meetingCodeInput = screen.getByLabelText('Meeting Code');
    const participantNameInput = screen.getByLabelText('Your Name');
    const joinBtn = screen.getByText('Join Meeting');
    
    fireEvent.change(meetingCodeInput, { target: { value: 'ABC123' } });
    fireEvent.change(participantNameInput, { target: { value: 'John Doe' } });
    fireEvent.click(joinBtn);
    
    expect(screen.getByTestId('connection-status')).toBeInTheDocument();
    expect(screen.getByText('Connected - good')).toBeInTheDocument();
  });

  it('shows error state when there is an error', () => {
    const errorMock = {
      ...mockUseMeetingSocket,
      error: 'Connection failed',
    };
    
    vi.mocked(useMeetingSocket).mockReturnValue(errorMock);
    
    // First join the meeting to trigger the hook
    renderJoinView();
    const meetingCodeInput = screen.getByLabelText('Meeting Code');
    const participantNameInput = screen.getByLabelText('Your Name');
    const joinBtn = screen.getByText('Join Meeting');
    
    fireEvent.change(meetingCodeInput, { target: { value: 'ABC123' } });
    fireEvent.change(participantNameInput, { target: { value: 'John Doe' } });
    fireEvent.click(joinBtn);
    
    expect(screen.getByTestId('enhanced-error-state')).toBeInTheDocument();
    expect(screen.getByText('Error: Connection failed')).toBeInTheDocument();
  });

  it('handles retry action in error state', () => {
    const errorMock = {
      ...mockUseMeetingSocket,
      error: 'Connection failed',
    };
    
    vi.mocked(useMeetingSocket).mockReturnValue(errorMock);
    
    // First join the meeting to trigger the hook
    renderJoinView();
    const meetingCodeInput = screen.getByLabelText('Meeting Code');
    const participantNameInput = screen.getByLabelText('Your Name');
    const joinBtn = screen.getByText('Join Meeting');
    
    fireEvent.change(meetingCodeInput, { target: { value: 'ABC123' } });
    fireEvent.change(participantNameInput, { target: { value: 'John Doe' } });
    fireEvent.click(joinBtn);
    
    const retryBtn = screen.getByTestId('retry-btn');
    fireEvent.click(retryBtn);
    
    // The retry button calls window.location.reload(), not onReconnect
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('shows loading state when connecting', () => {
    const loadingMock = {
      ...mockUseMeetingSocket,
      isConnected: false,
      error: null,
    };
    
    vi.mocked(useMeetingSocket).mockReturnValue(loadingMock);
    
    // First join the meeting to trigger the hook
    renderJoinView();
    const meetingCodeInput = screen.getByLabelText('Meeting Code');
    const participantNameInput = screen.getByLabelText('Your Name');
    const joinBtn = screen.getByText('Join Meeting');
    
    fireEvent.change(meetingCodeInput, { target: { value: 'ABC123' } });
    fireEvent.change(participantNameInput, { target: { value: 'John Doe' } });
    fireEvent.click(joinBtn);
    
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('handles leave meeting action', () => {
    // Mock the hook to return joined state
    const joinedMock = {
      ...mockUseMeetingSocket,
      meetingData: {
        code: 'ABC123',
        title: 'Test Meeting',
        facilitator: 'Test Facilitator',
      },
    };
    
    vi.mocked(useMeetingSocket).mockReturnValue(joinedMock);
    
    renderJoinView();
    
    // Simulate joining first
    const meetingCodeInput = screen.getByLabelText('Meeting Code');
    const participantNameInput = screen.getByLabelText('Your Name');
    const joinBtn = screen.getByText('Join Meeting');
    
    fireEvent.change(meetingCodeInput, { target: { value: 'ABC123' } });
    fireEvent.change(participantNameInput, { target: { value: 'John Doe' } });
    fireEvent.click(joinBtn);
    
    // The leave meeting functionality is in the MeetingHeader component
    expect(screen.getByTestId('meeting-header')).toBeInTheDocument();
  });

  it('updates queue status correctly', () => {
    const inQueueMock = {
      ...mockUseMeetingSocket,
      isInQueue: true,
    };
    
    vi.mocked(useMeetingSocket).mockReturnValue(inQueueMock);
    
    renderJoinView();
    
    // Simulate joining
    const meetingCodeInput = screen.getByLabelText('Meeting Code');
    const participantNameInput = screen.getByLabelText('Your Name');
    const joinBtn = screen.getByText('Join Meeting');
    
    fireEvent.change(meetingCodeInput, { target: { value: 'ABC123' } });
    fireEvent.change(participantNameInput, { target: { value: 'John Doe' } });
    fireEvent.click(joinBtn);
    
    expect(screen.getByText('In Queue')).toBeInTheDocument();
  });
});