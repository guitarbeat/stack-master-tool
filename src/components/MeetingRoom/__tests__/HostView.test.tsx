import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { HostView } from '../HostView';

// Mock the useUnifiedFacilitator hook
const mockUseUnifiedFacilitator = {
  isRemoteEnabled: false,
  meetingCode: 'ABC123',
  meetingTitle: 'Test Meeting',
  isCreatingMeeting: false,
  enableRemoteMode: vi.fn(),
  disableRemoteMode: vi.fn(),
  participants: [
    { id: '1', name: 'John Doe', isSpeaking: false, queuePosition: 1, isFacilitator: false, hasRaisedHand: false },
    { id: '2', name: 'Jane Smith', isSpeaking: true, queuePosition: 0, isFacilitator: false, hasRaisedHand: false },
  ],
  speakingQueue: [
    { id: '1', name: 'John Doe', position: 1 },
  ],
  currentSpeaker: { id: '2', name: 'Jane Smith', position: 0 },
  nextSpeaker: { id: '1', name: 'John Doe', position: 1 },
  addToQueue: vi.fn(),
  removeFromQueue: vi.fn(),
  moveToNextSpeaker: vi.fn(),
  resetQueue: vi.fn(),
  endMeeting: vi.fn(),
  updateMeetingTitle: vi.fn(),
  addParticipant: vi.fn(),
  removeParticipant: vi.fn(),
  updateParticipantName: vi.fn(),
  isConnected: true,
  error: null,
  isLoading: false,
};

vi.mock('../../hooks/useUnifiedFacilitator', () => ({
  useUnifiedFacilitator: () => mockUseUnifiedFacilitator,
}));

// Mock other dependencies
vi.mock('../../hooks/useMeetingMode', () => ({
  useMeetingCode: () => 'ABC123',
}));

vi.mock('../Facilitator/RemoteModeToggle', () => ({
  RemoteModeToggle: ({ onToggle }: { onToggle: (enabled: boolean) => void }) => (
    <button onClick={() => onToggle(true)} data-testid="remote-mode-toggle">
      Toggle Remote Mode
    </button>
  ),
}));

vi.mock('../CurrentSpeakerCard', () => ({
  default: ({ speaker }: { speaker: any }) => (
    <div data-testid="current-speaker-card">
      Current Speaker: {speaker?.name || 'None'}
    </div>
  ),
}));

vi.mock('../ParticipantList', () => ({
  default: ({ participants }: { participants: any[] }) => (
    <div data-testid="participant-list">
      Participants: {participants.length}
    </div>
  ),
}));

vi.mock('../StackKeeper/SpeakingDistribution', () => ({
  SpeakingDistribution: () => (
    <div data-testid="speaking-distribution">Speaking Distribution</div>
  ),
}));

vi.mock('../StackKeeper/InterventionsPanel', () => ({
  InterventionsPanel: () => (
    <div data-testid="interventions-panel">Interventions Panel</div>
  ),
}));

vi.mock('../EditableMeetingTitle', () => ({
  EditableMeetingTitle: ({ title, onUpdate }: { title: string; onUpdate: (title: string) => void }) => (
    <input
      data-testid="meeting-title-input"
      value={title}
      onChange={(e) => onUpdate(e.target.value)}
    />
  ),
}));

vi.mock('../../utils/queue', () => ({
  getQueueTypeDisplay: () => 'Speaking Queue',
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(() => 'Test Facilitator'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('HostView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderHostView = () => {
    return render(
      <BrowserRouter>
        <HostView />
      </BrowserRouter>
    );
  };

  it('renders without crashing', () => {
    renderHostView();
    expect(screen.getByText('Test Meeting')).toBeInTheDocument();
  });

  it('displays meeting information correctly', () => {
    renderHostView();
    
    expect(screen.getByText('Test Meeting')).toBeInTheDocument();
    expect(screen.getByText('ABC123')).toBeInTheDocument();
    expect(screen.getByText('Test Facilitator')).toBeInTheDocument();
  });

  it('shows current speaker information', () => {
    renderHostView();
    
    expect(screen.getByTestId('current-speaker-card')).toBeInTheDocument();
    expect(screen.getByText('Current Speaker: Jane Smith')).toBeInTheDocument();
  });

  it('displays participant list', () => {
    renderHostView();
    
    expect(screen.getByTestId('participant-list')).toBeInTheDocument();
    expect(screen.getByText('Participants: 2')).toBeInTheDocument();
  });

  it('shows speaking queue information', () => {
    renderHostView();
    
    expect(screen.getByText('Speaking Queue')).toBeInTheDocument();
    expect(screen.getByText('Next: John Doe')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    renderHostView();
    
    expect(screen.getByText('Next Speaker')).toBeInTheDocument();
    expect(screen.getByText('Reset Queue')).toBeInTheDocument();
    expect(screen.getByText('End Meeting')).toBeInTheDocument();
  });

  it('handles next speaker action', () => {
    renderHostView();
    
    const nextSpeakerBtn = screen.getByText('Next Speaker');
    fireEvent.click(nextSpeakerBtn);
    
    expect(mockUseUnifiedFacilitator.moveToNextSpeaker).toHaveBeenCalled();
  });

  it('handles reset queue action', () => {
    renderHostView();
    
    const resetBtn = screen.getByText('Reset Queue');
    fireEvent.click(resetBtn);
    
    expect(mockUseUnifiedFacilitator.resetQueue).toHaveBeenCalled();
  });

  it('handles end meeting action', () => {
    renderHostView();
    
    const endMeetingBtn = screen.getByText('End Meeting');
    fireEvent.click(endMeetingBtn);
    
    expect(mockUseUnifiedFacilitator.endMeeting).toHaveBeenCalled();
  });

  it('shows remote mode toggle when not enabled', () => {
    renderHostView();
    
    expect(screen.getByTestId('remote-mode-toggle')).toBeInTheDocument();
  });

  it('displays watch view button', () => {
    renderHostView();
    
    expect(screen.getByText('Watch View')).toBeInTheDocument();
  });

  it('opens watch view in new tab when clicked', () => {
    const mockOpen = vi.fn();
    Object.defineProperty(window, 'open', {
      value: mockOpen,
      writable: true,
    });

    renderHostView();
    
    const watchViewBtn = screen.getByText('Watch View');
    fireEvent.click(watchViewBtn);
    
    expect(mockOpen).toHaveBeenCalledWith(
      '/meeting?mode=watch&code=ABC123',
      '_blank'
    );
  });

  it('shows loading state when creating meeting', () => {
    const loadingMock = {
      ...mockUseUnifiedFacilitator,
      isCreatingMeeting: true,
    };
    
    vi.mocked(require('../../hooks/useUnifiedFacilitator').useUnifiedFacilitator).mockReturnValue(loadingMock);
    
    renderHostView();
    
    expect(screen.getByText('Creating meeting...')).toBeInTheDocument();
  });

  it('shows error state when there is an error', () => {
    const errorMock = {
      ...mockUseUnifiedFacilitator,
      error: 'Connection failed',
    };
    
    vi.mocked(require('../../hooks/useUnifiedFacilitator').useUnifiedFacilitator).mockReturnValue(errorMock);
    
    renderHostView();
    
    expect(screen.getByText('Error: Connection failed')).toBeInTheDocument();
  });

  it('handles meeting title updates', () => {
    renderHostView();
    
    const titleInput = screen.getByTestId('meeting-title-input');
    fireEvent.change(titleInput, { target: { value: 'New Meeting Title' } });
    
    expect(mockUseUnifiedFacilitator.updateMeetingTitle).toHaveBeenCalledWith('New Meeting Title');
  });

  it('shows connection status', () => {
    renderHostView();
    
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('displays speaking distribution component', () => {
    renderHostView();
    
    expect(screen.getByTestId('speaking-distribution')).toBeInTheDocument();
  });

  it('displays interventions panel', () => {
    renderHostView();
    
    expect(screen.getByTestId('interventions-panel')).toBeInTheDocument();
  });
});