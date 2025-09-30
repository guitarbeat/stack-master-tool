import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MeetingRoom } from '@/components/MeetingRoom/MeetingRoom';
import { vi } from 'vitest';

// Mock the socket service
vi.mock('@/services/socket', () => ({
  default: {
    isConnected: true,
    joinMeeting: vi.fn(),
    joinQueue: vi.fn(),
    leaveQueue: vi.fn(),
    disconnect: vi.fn(),
    onQueueUpdated: vi.fn(),
    onParticipantsUpdated: vi.fn(),
    onParticipantJoined: vi.fn(),
    onParticipantLeft: vi.fn(),
    onNextSpeaker: vi.fn(),
    onError: vi.fn(),
    off: vi.fn(),
    removeAllListeners: vi.fn()
  }
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

// Mock the sound utility
vi.mock('@/utils/sound.js', () => ({
  playBeep: vi.fn()
}));

// Mock the error handling utility
vi.mock('@/utils/errorHandling', () => ({
  getErrorDisplayInfo: vi.fn((error) => ({
    title: 'Error',
    description: error.message || 'An error occurred'
  }))
}));

describe('MeetingRoom Component', () => {
  const mockProps = {
    participantName: 'Test Participant',
    meetingInfo: {
      code: 'TEST12',
      title: 'Test Meeting',
      facilitator: 'Test Facilitator'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders meeting information correctly', () => {
    render(<MeetingRoom {...mockProps} />);

    expect(screen.getByText('Test Meeting')).toBeInTheDocument();
    expect(screen.getByText('Test Facilitator')).toBeInTheDocument();
    expect(screen.getByText('TEST12')).toBeInTheDocument();
  });

  it('shows participant name', () => {
    render(<MeetingRoom {...mockProps} />);

    expect(screen.getByText('Test Participant')).toBeInTheDocument();
  });

  it('renders join queue button', () => {
    render(<MeetingRoom {...mockProps} />);

    expect(screen.getByRole('button', { name: /join queue/i })).toBeInTheDocument();
  });

  it('handles join queue button click', async () => {
    const mockSocketService = vi.mocked(await import('@/services/socket')).default;
    
    render(<MeetingRoom {...mockProps} />);

    const joinButton = screen.getByRole('button', { name: /join queue/i });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(mockSocketService.joinQueue).toHaveBeenCalledWith('speak');
    });
  });

  it('shows leave queue button when in queue', async () => {
    const mockSocketService = vi.mocked(await import('@/services/socket')).default;
    
    // Mock queue updated callback
    let queueCallback: (queue: any[]) => void;
    mockSocketService.onQueueUpdated.mockImplementation((callback) => {
      queueCallback = callback;
    });

    render(<MeetingRoom {...mockProps} />);

    // Simulate being added to queue
    queueCallback!([{
      id: '1',
      participantName: 'Test Participant',
      type: 'speak',
      timestamp: Date.now()
    }]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /leave queue/i })).toBeInTheDocument();
    });
  });

  it('handles leave queue button click', async () => {
    const mockSocketService = vi.mocked(await import('@/services/socket')).default;
    
    // Mock queue updated callback
    let queueCallback: (queue: any[]) => void;
    mockSocketService.onQueueUpdated.mockImplementation((callback) => {
      queueCallback = callback;
    });

    render(<MeetingRoom {...mockProps} />);

    // Simulate being in queue
    queueCallback!([{
      id: '1',
      participantName: 'Test Participant',
      type: 'speak',
      timestamp: Date.now()
    }]);

    await waitFor(() => {
      const leaveButton = screen.getByRole('button', { name: /leave queue/i });
      fireEvent.click(leaveButton);
    });

    await waitFor(() => {
      expect(mockSocketService.leaveQueue).toHaveBeenCalled();
    });
  });

  it('displays speaking queue correctly', async () => {
    const mockSocketService = vi.mocked(await import('@/services/socket')).default;
    
    // Mock queue updated callback
    let queueCallback: (queue: any[]) => void;
    mockSocketService.onQueueUpdated.mockImplementation((callback) => {
      queueCallback = callback;
    });

    render(<MeetingRoom {...mockProps} />);

    const mockQueue = [
      {
        id: '1',
        participantName: 'Speaker 1',
        type: 'speak',
        timestamp: Date.now()
      },
      {
        id: '2',
        participantName: 'Speaker 2',
        type: 'direct-response',
        timestamp: Date.now()
      }
    ];

    queueCallback!(mockQueue);

    await waitFor(() => {
      expect(screen.getByText('Speaker 1')).toBeInTheDocument();
      expect(screen.getByText('Speaker 2')).toBeInTheDocument();
    });
  });

  it('shows current speaker notification', async () => {
    const mockSocketService = vi.mocked(await import('@/services/socket')).default;
    
    // Mock next speaker callback
    let nextSpeakerCallback: (speaker: any) => void;
    mockSocketService.onNextSpeaker.mockImplementation((callback) => {
      nextSpeakerCallback = callback;
    });

    render(<MeetingRoom {...mockProps} />);

    const mockSpeaker = {
      participantName: 'Current Speaker',
      type: 'speak'
    };

    nextSpeakerCallback!(mockSpeaker);

    await waitFor(() => {
      expect(screen.getByText('Current Speaker is up next')).toBeInTheDocument();
    });
  });

  it('handles participant joined notification', async () => {
    const mockSocketService = vi.mocked(await import('@/services/socket')).default;
    
    // Mock participant joined callback
    let participantJoinedCallback: (data: any) => void;
    mockSocketService.onParticipantJoined.mockImplementation((callback) => {
      participantJoinedCallback = callback;
    });

    render(<MeetingRoom {...mockProps} />);

    participantJoinedCallback!({
      participant: { name: 'New Participant' }
    });

    await waitFor(() => {
      expect(screen.getByText('New Participant joined')).toBeInTheDocument();
    });
  });

  it('handles participant left notification', async () => {
    const mockSocketService = vi.mocked(await import('@/services/socket')).default;
    
    // Mock participant left callback
    let participantLeftCallback: (data: any) => void;
    mockSocketService.onParticipantLeft.mockImplementation((callback) => {
      participantLeftCallback = callback;
    });

    render(<MeetingRoom {...mockProps} />);

    participantLeftCallback!({
      participantName: 'Leaving Participant'
    });

    await waitFor(() => {
      expect(screen.getByText('Leaving Participant left')).toBeInTheDocument();
    });
  });

  it('handles socket errors', async () => {
    const mockSocketService = vi.mocked(await import('@/services/socket')).default;
    
    // Mock error callback
    let errorCallback: (error: any) => void;
    mockSocketService.onError.mockImplementation((callback) => {
      errorCallback = callback;
    });

    render(<MeetingRoom {...mockProps} />);

    errorCallback!({
      message: 'Connection error',
      code: 'CONNECTION_FAILED'
    });

    await waitFor(() => {
      expect(screen.getByText('Connection error')).toBeInTheDocument();
    });
  });

  it('shows loading state when connecting', () => {
    const mockSocketService = vi.mocked(await import('@/services/socket')).default;
    mockSocketService.isConnected = false;

    render(<MeetingRoom {...mockProps} />);

    expect(screen.getByText(/connecting/i)).toBeInTheDocument();
  });

  it('handles leave meeting button click', () => {
    const mockSocketService = vi.mocked(await import('@/services/socket')).default;
    
    render(<MeetingRoom {...mockProps} />);

    const leaveButton = screen.getByRole('button', { name: /leave meeting/i });
    fireEvent.click(leaveButton);

    expect(mockSocketService.disconnect).toHaveBeenCalled();
  });

  it('shows empty queue message when no one is in queue', () => {
    render(<MeetingRoom {...mockProps} />);

    expect(screen.getByText(/no one in queue/i)).toBeInTheDocument();
  });

  it('shows different queue types correctly', async () => {
    const mockSocketService = vi.mocked(await import('@/services/socket')).default;
    
    // Mock queue updated callback
    let queueCallback: (queue: any[]) => void;
    mockSocketService.onQueueUpdated.mockImplementation((callback) => {
      queueCallback = callback;
    });

    render(<MeetingRoom {...mockProps} />);

    const mockQueue = [
      {
        id: '1',
        participantName: 'Speaker',
        type: 'speak',
        timestamp: Date.now()
      },
      {
        id: '2',
        participantName: 'Direct Response',
        type: 'direct-response',
        timestamp: Date.now()
      },
      {
        id: '3',
        participantName: 'Point of Info',
        type: 'point-of-info',
        timestamp: Date.now()
      },
      {
        id: '4',
        participantName: 'Clarification',
        type: 'clarification',
        timestamp: Date.now()
      }
    ];

    queueCallback!(mockQueue);

    await waitFor(() => {
      expect(screen.getByText('Speaker')).toBeInTheDocument();
      expect(screen.getByText('Direct Response')).toBeInTheDocument();
      expect(screen.getByText('Point of Info')).toBeInTheDocument();
      expect(screen.getByText('Clarification')).toBeInTheDocument();
    });
  });
});