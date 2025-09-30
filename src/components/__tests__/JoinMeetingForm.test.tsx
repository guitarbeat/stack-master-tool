import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { JoinMeetingForm } from '@/components/meeting/JoinMeetingForm';
import { vi } from 'vitest';

// Mock the API service
vi.mock('@/services/api', () => ({
  default: {
    getMeeting: vi.fn()
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

describe('JoinMeetingForm Component', () => {
  const mockOnSuccess = vi.fn();
  const mockApiService = vi.mocked(await import('@/services/api')).default;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(<JoinMeetingForm onSuccess={mockOnSuccess} />);

    expect(screen.getByLabelText(/meeting code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join/i })).toBeInTheDocument();
  });

  it('auto-fills meeting code from URL parameter', () => {
    // Mock URLSearchParams
    const mockSearchParams = new URLSearchParams('code=TEST12');
    Object.defineProperty(window, 'location', {
      value: { search: '?code=TEST12' },
      writable: true
    });

    // Mock URL constructor
    global.URL = vi.fn().mockImplementation(() => ({
      searchParams: mockSearchParams
    })) as any;

    render(<JoinMeetingForm onSuccess={mockOnSuccess} />);

    expect(screen.getByLabelText(/meeting code/i)).toHaveValue('TEST12');
  });

  it('validates required fields', async () => {
    render(<JoinMeetingForm onSuccess={mockOnSuccess} />);

    const submitButton = screen.getByRole('button', { name: /join/i });
    fireEvent.click(submitButton);

    // Check for HTML5 validation
    const meetingCodeInput = screen.getByLabelText(/meeting code/i);
    const participantNameInput = screen.getByLabelText(/your name/i);

    expect(meetingCodeInput).toBeRequired();
    expect(participantNameInput).toBeRequired();
  });

  it('validates meeting code format', async () => {
    render(<JoinMeetingForm onSuccess={mockOnSuccess} />);

    // Enter invalid meeting code
    fireEvent.change(screen.getByLabelText(/meeting code/i), {
      target: { value: 'ABC' }
    });
    fireEvent.change(screen.getByLabelText(/your name/i), {
      target: { value: 'Test Participant' }
    });

    const submitButton = screen.getByRole('button', { name: /join/i });
    fireEvent.click(submitButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/6 characters/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const mockMeetingData = {
      meetingId: 'test-id',
      meetingCode: 'TEST12',
      meetingTitle: 'Test Meeting',
      facilitatorName: 'Test Facilitator',
      createdAt: '2024-01-01T10:00:00Z'
    };

    mockApiService.getMeeting.mockResolvedValue(mockMeetingData);

    render(<JoinMeetingForm onSuccess={mockOnSuccess} />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/meeting code/i), {
      target: { value: 'TEST12' }
    });
    fireEvent.change(screen.getByLabelText(/your name/i), {
      target: { value: 'Test Participant' }
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /join/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockApiService.getMeeting).toHaveBeenCalledWith('TEST12');
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith({
        meetingCode: 'TEST12',
        participantName: 'Test Participant',
        meetingData: mockMeetingData
      });
    });
  });

  it('shows loading state during submission', async () => {
    mockApiService.getMeeting.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );

    render(<JoinMeetingForm onSuccess={mockOnSuccess} />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/meeting code/i), {
      target: { value: 'TEST12' }
    });
    fireEvent.change(screen.getByLabelText(/your name/i), {
      target: { value: 'Test Participant' }
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /join/i });
    fireEvent.click(submitButton);

    // Check for loading state
    expect(screen.getByText(/joining/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('handles API errors gracefully', async () => {
    const mockError = new Error('Meeting not found');
    mockApiService.getMeeting.mockRejectedValue(mockError);

    render(<JoinMeetingForm onSuccess={mockOnSuccess} />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/meeting code/i), {
      target: { value: 'TEST12' }
    });
    fireEvent.change(screen.getByLabelText(/your name/i), {
      target: { value: 'Test Participant' }
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /join/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('handles meeting not found error', async () => {
    const mockError = new Error('Meeting not found');
    mockApiService.getMeeting.mockRejectedValue(mockError);

    render(<JoinMeetingForm onSuccess={mockOnSuccess} />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/meeting code/i), {
      target: { value: 'NONEXISTENT' }
    });
    fireEvent.change(screen.getByLabelText(/your name/i), {
      target: { value: 'Test Participant' }
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /join/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/not found/i)).toBeInTheDocument();
    });
  });

  it('trims whitespace from input values', async () => {
    const mockMeetingData = {
      meetingId: 'test-id',
      meetingCode: 'TEST12',
      meetingTitle: 'Test Meeting',
      facilitatorName: 'Test Facilitator',
      createdAt: '2024-01-01T10:00:00Z'
    };

    mockApiService.getMeeting.mockResolvedValue(mockMeetingData);

    render(<JoinMeetingForm onSuccess={mockOnSuccess} />);

    // Fill in the form with extra whitespace
    fireEvent.change(screen.getByLabelText(/meeting code/i), {
      target: { value: '  TEST12  ' }
    });
    fireEvent.change(screen.getByLabelText(/your name/i), {
      target: { value: '  Test Participant  ' }
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /join/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockApiService.getMeeting).toHaveBeenCalledWith('TEST12');
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith({
        meetingCode: 'TEST12',
        participantName: 'Test Participant',
        meetingData: mockMeetingData
      });
    });
  });

  it('disables form during submission', async () => {
    mockApiService.getMeeting.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );

    render(<JoinMeetingForm onSuccess={mockOnSuccess} />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/meeting code/i), {
      target: { value: 'TEST12' }
    });
    fireEvent.change(screen.getByLabelText(/your name/i), {
      target: { value: 'Test Participant' }
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /join/i });
    fireEvent.click(submitButton);

    // Check that inputs are disabled
    expect(screen.getByLabelText(/meeting code/i)).toBeDisabled();
    expect(screen.getByLabelText(/your name/i)).toBeDisabled();
  });
});