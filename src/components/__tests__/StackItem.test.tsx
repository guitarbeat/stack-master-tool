import { render, screen, fireEvent } from '@testing-library/react';
import { StackItem } from '@/components/StackItem';
import { Participant } from '@/types';

const mockParticipant: Participant = {
  id: '1',
  name: 'John Doe',
  addedAt: new Date('2024-01-01T10:00:00Z')
};

const mockOnRemove = vi.fn();
const mockOnIntervention = vi.fn();
const mockOnFinishDirectResponse = vi.fn();

describe('StackItem Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders participant information correctly', () => {
    render(
      <StackItem
        participant={mockParticipant}
        index={0}
        isCurrentSpeaker={false}
        isDirectResponse={false}
        onRemove={mockOnRemove}
        onIntervention={mockOnIntervention}
        onFinishDirectResponse={mockOnFinishDirectResponse}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  it('shows current speaker styling when isCurrentSpeaker is true', () => {
    render(
      <StackItem
        participant={mockParticipant}
        index={0}
        isCurrentSpeaker={true}
        isDirectResponse={false}
        onRemove={mockOnRemove}
        onIntervention={mockOnIntervention}
        onFinishDirectResponse={mockOnFinishDirectResponse}
      />
    );

    const container = screen.getByText('John Doe').closest('div');
    expect(container).toHaveClass('current-speaker');
  });

  it('shows direct response styling when isDirectResponse is true', () => {
    render(
      <StackItem
        participant={mockParticipant}
        index={0}
        isCurrentSpeaker={false}
        isDirectResponse={true}
        onRemove={mockOnRemove}
        onIntervention={mockOnIntervention}
        onFinishDirectResponse={mockOnFinishDirectResponse}
      />
    );

    const container = screen.getByText('John Doe').closest('div');
    expect(container).toHaveClass('direct-response');
  });

  it('calls onRemove when remove button is clicked', () => {
    render(
      <StackItem
        participant={mockParticipant}
        index={0}
        isCurrentSpeaker={false}
        isDirectResponse={false}
        onRemove={mockOnRemove}
        onIntervention={mockOnIntervention}
        onFinishDirectResponse={mockOnFinishDirectResponse}
      />
    );

    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);
    
    expect(mockOnRemove).toHaveBeenCalledWith('1');
  });

  it('calls onIntervention when intervention button is clicked', () => {
    render(
      <StackItem
        participant={mockParticipant}
        index={0}
        isCurrentSpeaker={false}
        isDirectResponse={false}
        onRemove={mockOnRemove}
        onIntervention={mockOnIntervention}
        onFinishDirectResponse={mockOnFinishDirectResponse}
      />
    );

    const interventionButton = screen.getByRole('button', { name: /intervention/i });
    fireEvent.click(interventionButton);
    
    expect(mockOnIntervention).toHaveBeenCalledWith('John Doe', 'intervention');
  });

  it('calls onFinishDirectResponse when finish button is clicked for direct response', () => {
    render(
      <StackItem
        participant={mockParticipant}
        index={0}
        isCurrentSpeaker={false}
        isDirectResponse={true}
        onRemove={mockOnRemove}
        onIntervention={mockOnIntervention}
        onFinishDirectResponse={mockOnFinishDirectResponse}
      />
    );

    const finishButton = screen.getByRole('button', { name: /finish/i });
    fireEvent.click(finishButton);
    
    expect(mockOnFinishDirectResponse).toHaveBeenCalledTimes(1);
  });

  it('shows correct position number', () => {
    render(
      <StackItem
        participant={mockParticipant}
        index={2}
        isCurrentSpeaker={false}
        isDirectResponse={false}
        onRemove={mockOnRemove}
        onIntervention={mockOnIntervention}
        onFinishDirectResponse={mockOnFinishDirectResponse}
      />
    );

    expect(screen.getByText('#3')).toBeInTheDocument();
  });

  it('applies correct CSS classes based on props', () => {
    const { rerender } = render(
      <StackItem
        participant={mockParticipant}
        index={0}
        isCurrentSpeaker={true}
        isDirectResponse={false}
        onRemove={mockOnRemove}
        onIntervention={mockOnIntervention}
        onFinishDirectResponse={mockOnFinishDirectResponse}
      />
    );

    let container = screen.getByText('John Doe').closest('div');
    expect(container).toHaveClass('current-speaker');
    expect(container).not.toHaveClass('direct-response');

    rerender(
      <StackItem
        participant={mockParticipant}
        index={0}
        isCurrentSpeaker={false}
        isDirectResponse={true}
        onRemove={mockOnRemove}
        onIntervention={mockOnIntervention}
        onFinishDirectResponse={mockOnFinishDirectResponse}
      />
    );

    container = screen.getByText('John Doe').closest('div');
    expect(container).toHaveClass('direct-response');
    expect(container).not.toHaveClass('current-speaker');
  });
});