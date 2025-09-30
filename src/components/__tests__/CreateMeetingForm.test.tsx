import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateMeetingForm } from '@/components/meeting/CreateMeetingForm';
import { vi } from 'vitest';

// Mock the API service
vi.mock('@/services/api', () => ({
  default: {
    createMeeting: vi.fn()
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

describe('CreateMeetingForm Component', () => {
  const mockOnSuccess = vi.fn();
  const mockApiService = vi.mocked(await import('@/services/api')).default;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(<CreateMeetingForm onSuccess={mockOnSuccess} />);

    expect(screen.getByLabelText(/meeting name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create meeting/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<CreateMeetingForm onSuccess={mockOnSuccess} />);

    const submitButton = screen.getByRole('button', { name: /create meeting/i });
    fireEvent.click(submitButton);

    // Check for HTML5 validation
    const meetingNameInput = screen.getByLabelText(/meeting name/i);
    const facilitatorNameInput = screen.getByLabelText(/your name/i);

    expect(meetingNameInput).toBeRequired();
    expect(facilitatorNameInput).toBeRequired();
  });

  it('submits form with valid data', async () => {
    const mockMeetingData = {
      meetingId: 'test-id',
      meetingCode: 'TEST12',
      meetingTitle: 'Test Meeting',
      facilitatorName: 'Test Facilitator'
    };

    mockApiService.createMeeting.mockResolvedValue(mockMeetingData);

    render(<CreateMeetingForm onSuccess={mockOnSuccess} />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/meeting name/i), {
      target: { value: 'Test Meeting' }
    });
    fireEvent.change(screen.getByLabelText(/your name/i), {
      target: { value: 'Test Facilitator' }
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create meeting/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockApiService.createMeeting).toHaveBeenCalledWith(
        'Test Facilitator',
        'Test Meeting'
      );
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(mockMeetingData);
    });
  });

  it('shows loading state during submission', async () => {
    mockApiService.createMeeting.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );

    render(<CreateMeetingForm onSuccess={mockOnSuccess} />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/meeting name/i), {
      target: { value: 'Test Meeting' }
    });
    fireEvent.change(screen.getByLabelText(/your name/i), {
      target: { value: 'Test Facilitator' }
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create meeting/i });
    fireEvent.click(submitButton);

    // Check for loading state
    expect(screen.getByText(/creating/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('handles API errors gracefully', async () => {
    const mockError = new Error('API Error');
    mockApiService.createMeeting.mockRejectedValue(mockError);

    render(<CreateMeetingForm onSuccess={mockOnSuccess} />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/meeting name/i), {
      target: { value: 'Test Meeting' }
    });
    fireEvent.change(screen.getByLabelText(/your name/i), {
      target: { value: 'Test Facilitator' }
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create meeting/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('trims whitespace from input values', async () => {
    const mockMeetingData = {
      meetingId: 'test-id',
      meetingCode: 'TEST12',
      meetingTitle: 'Test Meeting',
      facilitatorName: 'Test Facilitator'
    };

    mockApiService.createMeeting.mockResolvedValue(mockMeetingData);

    render(<CreateMeetingForm onSuccess={mockOnSuccess} />);

    // Fill in the form with extra whitespace
    fireEvent.change(screen.getByLabelText(/meeting name/i), {
      target: { value: '  Test Meeting  ' }
    });
    fireEvent.change(screen.getByLabelText(/your name/i), {
      target: { value: '  Test Facilitator  ' }
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create meeting/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockApiService.createMeeting).toHaveBeenCalledWith(
        'Test Facilitator',
        'Test Meeting'
      );
    });
  });

  it('disables form during submission', async () => {
    mockApiService.createMeeting.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );

    render(<CreateMeetingForm onSuccess={mockOnSuccess} />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/meeting name/i), {
      target: { value: 'Test Meeting' }
    });
    fireEvent.change(screen.getByLabelText(/your name/i), {
      target: { value: 'Test Facilitator' }
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create meeting/i });
    fireEvent.click(submitButton);

    // Check that inputs are disabled
    expect(screen.getByLabelText(/meeting name/i)).toBeDisabled();
    expect(screen.getByLabelText(/your name/i)).toBeDisabled();
  });
});