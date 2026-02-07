import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ParticipantList } from '../ParticipantList';
import type { Participant } from '@/types/meeting';

// Mock EditableField since it's a UI component
vi.mock('@/components/ui/editable-field', () => ({
  EditableField: ({ value, onUpdate, canEdit }: { value: string; onUpdate: (val: string) => void; canEdit: boolean }) => (
    <div data-testid="editable-field">
      <span>{value}</span>
      {canEdit && <button onClick={() => onUpdate('Updated Name')}>Edit</button>}
    </div>
  ),
}));

describe('ParticipantList', () => {
  const mockParticipants: Participant[] = [
    {
      id: '1',
      name: 'Alice',
      isFacilitator: false,
      hasRaisedHand: false,
      joinedAt: new Date().toISOString(),
      isActive: true,
    },
    {
      id: '2',
      name: 'Bob',
      isFacilitator: true, // Bob is facilitator
      hasRaisedHand: true,
      joinedAt: new Date().toISOString(),
      isActive: true,
    },
  ];

  const mockOnUpdate = vi.fn();
  const mockOnRemove = vi.fn();

  it('renders participant list correctly', () => {
    // render with facilitator role to see controls
    render(
      <ParticipantList
        participants={mockParticipants}
        onUpdateParticipant={mockOnUpdate}
        onRemoveParticipant={mockOnRemove}
        userRole="facilitator"
      />
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText(/Participants \(2\)/)).toBeInTheDocument();
  });

  it('calls onRemoveParticipant when remove button is clicked', () => {
    render(
      <ParticipantList
        participants={mockParticipants}
        onUpdateParticipant={mockOnUpdate}
        onRemoveParticipant={mockOnRemove}
        userRole="facilitator"
      />
    );

    // Alice is not facilitator, so she has a remove button if user is facilitator
    // ParticipantItem uses aria-label={`Remove ${participant.name}`}
    const removeButton = screen.getByLabelText('Remove Alice');
    fireEvent.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalledWith('1');
  });

  it('does not show remove button for facilitator (Bob)', () => {
    render(
      <ParticipantList
        participants={mockParticipants}
        onUpdateParticipant={mockOnUpdate}
        onRemoveParticipant={mockOnRemove}
        userRole="facilitator"
      />
    );

    // Bob is facilitator, should not have remove button
    const removeButtonBob = screen.queryByLabelText('Remove Bob');
    expect(removeButtonBob).not.toBeInTheDocument();
  });

  it('calls onUpdateParticipant when name is updated', () => {
    render(
      <ParticipantList
        participants={mockParticipants}
        onUpdateParticipant={mockOnUpdate}
        onRemoveParticipant={mockOnRemove}
        userRole="facilitator"
      />
    );

    // Find edit button (mocked) for Alice. Bob also has one.
    // Let's assume the mock implementation renders 'Edit' next to name.
    // In our mock: <span>{value}</span><button>Edit</button>
    // We can find by text 'Edit' which returns multiple.
    const editButtons = screen.getAllByText('Edit');
    // First one should be Alice (order depends on list order, mockParticipants has Alice first)
    fireEvent.click(editButtons[0]);

    expect(mockOnUpdate).toHaveBeenCalledWith('1', 'Updated Name');
  });
});
