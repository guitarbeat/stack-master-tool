import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { WatchView } from '../WatchView';

// Mock the hooks
const mockUsePublicWatch = {
  meetingData: {
    code: 'ABC123',
    title: 'Test Meeting',
    facilitator: 'Test Facilitator',
  },
  participants: [
    { id: '1', name: 'John Doe', isSpeaking: false, queuePosition: 1 },
    { id: '2', name: 'Jane Smith', isSpeaking: true, queuePosition: 0 },
  ],
  speakingQueue: [
    { id: '1', name: 'John Doe', position: 1 },
  ],
  currentSpeaker: { id: '2', name: 'Jane Smith', position: 0 },
  isConnected: true,
  error: null,
  isLoading: false,
};

const mockUseLocalWatch = {
  meetingData: {
    code: 'MANUAL',
    title: 'Local Meeting',
    facilitator: 'Local Facilitator',
  },
  participants: [
    { id: '1', name: 'Local User', isSpeaking: false, queuePosition: 1 },
  ],
  speakingQueue: [
    { id: '1', name: 'Local User', position: 1 },
  ],
  currentSpeaker: null,
  isConnected: true,
  error: null,
  isLoading: false,
};

const mockUseMeetingCode = vi.fn(() => 'ABC123');

vi.mock('../../hooks/usePublicWatch', () => ({
  usePublicWatch: () => mockUsePublicWatch,
}));

vi.mock('../../hooks/useLocalWatch', () => ({
  useLocalWatch: () => mockUseLocalWatch,
}));

vi.mock('../../hooks/useMeetingMode', () => ({
  useMeetingCode: () => mockUseMeetingCode(),
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
      Current Speaker: {currentSpeaker?.name || 'None'}
    </div>
  ),
}));

vi.mock('../SpeakingQueue', () => ({
  SpeakingQueue: ({ queue }: { queue: any[] }) => (
    <div data-testid="speaking-queue">
      Queue: {queue.length} participants
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
  ConnectionStatus: ({ isConnected }: { isConnected: boolean }) => (
    <div data-testid="connection-status">
      {isConnected ? 'Connected' : 'Disconnected'}
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

vi.mock('../StackKeeper/SpeakingDistribution', () => ({
  SpeakingDistribution: () => (
    <div data-testid="speaking-distribution">Speaking Distribution</div>
  ),
}));

describe('WatchView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWatchView = () => {
    return render(
      <BrowserRouter>
        <WatchView />
      </BrowserRouter>
    );
  };

  it('renders watch form initially', () => {
    mockUseMeetingCode.mockReturnValue('');
    renderWatchView();
    
    expect(screen.getByText('Watch Meeting')).toBeInTheDocument();
    expect(screen.getByLabelText('Meeting Code')).toBeInTheDocument();
    expect(screen.getByText('Watch Meeting')).toBeInTheDocument();
  });

  it('validates form input before watching', () => {
    mockUseMeetingCode.mockReturnValue('');
    renderWatchView();
    
    const watchBtn = screen.getByText('Watch Meeting');
    fireEvent.click(watchBtn);
    
    // Should not watch with empty input
    expect(screen.getByText('Please enter a meeting code')).toBeInTheDocument();
  });

  it('watches meeting with valid code', () => {
    mockUseMeetingCode.mockReturnValue('');
    renderWatchView();
    
    const meetingCodeInput = screen.getByLabelText('Meeting Code');
    const watchBtn = screen.getByText('Watch Meeting');
    
    fireEvent.change(meetingCodeInput, { target: { value: 'ABC123' } });
    fireEvent.click(watchBtn);
    
    expect(screen.getByTestId('meeting-header')).toBeInTheDocument();
  });

  it('uses URL meeting code when available', () => {
    mockUseMeetingCode.mockReturnValue('ABC123');
    renderWatchView();
    
    expect(screen.getByTestId('meeting-header')).toBeInTheDocument();
    expect(screen.getByText('Test Meeting - Test Facilitator')).toBeInTheDocument();
  });

  it('detects local meeting correctly', () => {
    mockUseMeetingCode.mockReturnValue('MANUAL');
    renderWatchView();
    
    expect(screen.getByText('Local Meeting - Local Facilitator')).toBeInTheDocument();
  });

  it('shows current speaker information for remote meetings', () => {
    mockUseMeetingCode.mockReturnValue('ABC123');
    renderWatchView();
    
    expect(screen.getByTestId('current-speaker-alert')).toBeInTheDocument();
    expect(screen.getByText('Current Speaker: Jane Smith')).toBeInTheDocument();
  });

  it('shows no current speaker for local meetings', () => {
    mockUseMeetingCode.mockReturnValue('MANUAL');
    renderWatchView();
    
    expect(screen.getByTestId('current-speaker-alert')).toBeInTheDocument();
    expect(screen.getByText('Current Speaker: None')).toBeInTheDocument();
  });

  it('displays speaking queue for remote meetings', () => {
    mockUseMeetingCode.mockReturnValue('ABC123');
    renderWatchView();
    
    expect(screen.getByTestId('speaking-queue')).toBeInTheDocument();
    expect(screen.getByText('Queue: 1 participants')).toBeInTheDocument();
  });

  it('displays speaking queue for local meetings', () => {
    mockUseMeetingCode.mockReturnValue('MANUAL');
    renderWatchView();
    
    expect(screen.getByTestId('speaking-queue')).toBeInTheDocument();
    expect(screen.getByText('Queue: 1 participants')).toBeInTheDocument();
  });

  it('shows connection status', () => {
    mockUseMeetingCode.mockReturnValue('ABC123');
    renderWatchView();
    
    expect(screen.getByTestId('connection-status')).toBeInTheDocument();
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('shows error state when there is an error', () => {
    const errorMock = {
      ...mockUsePublicWatch,
      error: 'Connection failed',
    };
    
    vi.mocked(require('../../hooks/usePublicWatch').usePublicWatch).mockReturnValue(errorMock);
    mockUseMeetingCode.mockReturnValue('ABC123');
    
    renderWatchView();
    
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Error: Connection failed')).toBeInTheDocument();
  });

  it('handles retry action in error state', () => {
    const errorMock = {
      ...mockUsePublicWatch,
      error: 'Connection failed',
    };
    
    vi.mocked(require('../../hooks/usePublicWatch').usePublicWatch).mockReturnValue(errorMock);
    mockUseMeetingCode.mockReturnValue('ABC123');
    
    renderWatchView();
    
    const retryBtn = screen.getByTestId('retry-btn');
    fireEvent.click(retryBtn);
    
    // Should trigger a re-render or retry logic
    expect(screen.getByTestId('enhanced-error-state')).toBeInTheDocument();
  });

  it('shows loading state when connecting', () => {
    const loadingMock = {
      ...mockUsePublicWatch,
      isConnected: false,
      error: null,
      isLoading: true,
    };
    
    vi.mocked(require('../../hooks/usePublicWatch').usePublicWatch).mockReturnValue(loadingMock);
    mockUseMeetingCode.mockReturnValue('ABC123');
    
    renderWatchView();
    
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('displays watch mode indicator', () => {
    mockUseMeetingCode.mockReturnValue('ABC123');
    renderWatchView();
    
    expect(screen.getByText('Watch Mode')).toBeInTheDocument();
    expect(screen.getByText('You are watching this meeting in read-only mode')).toBeInTheDocument();
  });

  it('shows different UI for local vs remote meetings', () => {
    mockUseMeetingCode.mockReturnValue('MANUAL');
    renderWatchView();
    
    expect(screen.getByText('Local Watch Mode')).toBeInTheDocument();
    expect(screen.getByText('You are watching a local meeting')).toBeInTheDocument();
  });

  it('displays speaking distribution for remote meetings', () => {
    mockUseMeetingCode.mockReturnValue('ABC123');
    renderWatchView();
    
    expect(screen.getByTestId('speaking-distribution')).toBeInTheDocument();
  });

  it('handles back navigation', () => {
    mockUseMeetingCode.mockReturnValue('ABC123');
    renderWatchView();
    
    const backBtn = screen.getByText('Back to Home');
    fireEvent.click(backBtn);
    
    // Should navigate back (this would be handled by the router)
    expect(backBtn).toBeInTheDocument();
  });

  it('shows meeting code in header', () => {
    mockUseMeetingCode.mockReturnValue('ABC123');
    renderWatchView();
    
    expect(screen.getByText('ABC123')).toBeInTheDocument();
  });

  it('handles empty meeting code gracefully', () => {
    mockUseMeetingCode.mockReturnValue('');
    renderWatchView();
    
    expect(screen.getByText('Watch Meeting')).toBeInTheDocument();
    expect(screen.getByLabelText('Meeting Code')).toBeInTheDocument();
  });

  it('updates meeting code input correctly', () => {
    mockUseMeetingCode.mockReturnValue('');
    renderWatchView();
    
    const meetingCodeInput = screen.getByLabelText('Meeting Code');
    fireEvent.change(meetingCodeInput, { target: { value: 'XYZ789' } });
    
    expect(meetingCodeInput).toHaveValue('XYZ789');
  });
});