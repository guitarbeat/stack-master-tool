import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { ParticipantList } from './ParticipantList';
import type { Participant } from '@/types/meeting';

// Mock EditableField to verify it's used correctly
vi.mock('@/components/ui/editable-field', () => ({
  EditableField: ({ value, onUpdate, canEdit }: any) => (
    <div data-testid="editable-field">
      <span data-testid="field-value">{value}</span>
      {canEdit ? (
        <button
          data-testid="mock-edit-btn"
          onClick={() => onUpdate('Edited Name')}
        >
          Mock Edit
        </button>
      ) : (
        <span data-testid="no-edit">ReadOnly</span>
      )}
    </div>
  ),
}));

const mockParticipants: Participant[] = [
  {
    id: '1',
    name: 'Alice',
    isFacilitator: true,
    hasRaisedHand: false,
    joinedAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: '2',
    name: 'Bob',
    isFacilitator: false,
    hasRaisedHand: true,
    joinedAt: new Date().toISOString(),
    isActive: true,
  },
];

describe('ParticipantList', () => {
  it('renders participants correctly', () => {
    render(
      <ParticipantList
        participants={mockParticipants}
        onUpdateParticipant={vi.fn()}
        onRemoveParticipant={vi.fn()}
        userRole="participant"
      />
    );

    // Check if EditableFields are rendered
    const fields = screen.getAllByTestId('editable-field');
    expect(fields).toHaveLength(2);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('passes canEdit=true to EditableField when user is facilitator', () => {
    render(
      <ParticipantList
        participants={mockParticipants}
        onUpdateParticipant={vi.fn()}
        onRemoveParticipant={vi.fn()}
        userRole="facilitator"
      />
    );

    const editButtons = screen.getAllByTestId('mock-edit-btn');
    expect(editButtons).toHaveLength(2);
  });

  it('passes canEdit=false to EditableField when user is participant', () => {
    render(
      <ParticipantList
        participants={mockParticipants}
        onUpdateParticipant={vi.fn()}
        onRemoveParticipant={vi.fn()}
        userRole="participant"
      />
    );

    const editButtons = screen.queryAllByTestId('mock-edit-btn');
    expect(editButtons).toHaveLength(0);
    expect(screen.getAllByTestId('no-edit')).toHaveLength(2);
  });

  it('calls onUpdateParticipant when edited', () => {
    const handleUpdate = vi.fn();
    render(
      <ParticipantList
        participants={[mockParticipants[1]]} // Just Bob
        onUpdateParticipant={handleUpdate}
        onRemoveParticipant={vi.fn()}
        userRole="facilitator"
      />
    );

    const editButton = screen.getByTestId('mock-edit-btn');
    fireEvent.click(editButton);

    expect(handleUpdate).toHaveBeenCalledWith('2', 'Edited Name');
  });
});
