import { describe, it, expect, vi } from 'vitest';
// @ts-expect-error - testing-library types not fully resolved in this environment
import { render, screen } from '@testing-library/react';
import { EditableField } from '../editable-field';
import userEvent from '@testing-library/user-event';

describe('EditableField', () => {
  it('should render default aria-labels when no ariaLabel prop is provided', async () => {
    const handleUpdate = vi.fn();
    const user = userEvent.setup();
    render(<EditableField value="Test Value" onUpdate={handleUpdate} canEdit={true} />);

    // Find edit button (initially hidden but accessible via keyboard/hover)
    // The edit button has aria-label="Edit" by default
    const editButton = screen.getByRole('button', { name: 'Edit' });
    expect(editButton).toBeInTheDocument();

    // Click edit to see save/cancel buttons
    await user.click(editButton);

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Edit value' })).toBeInTheDocument();
  });

  it('should render custom aria-labels when ariaLabel prop is provided', async () => {
    const handleUpdate = vi.fn();
    const user = userEvent.setup();
    render(<EditableField value="Test Value" onUpdate={handleUpdate} canEdit={true} ariaLabel="Context" />);

    // Edit button should have "Edit Context"
    const editButton = screen.getByRole('button', { name: 'Edit Context' });
    expect(editButton).toBeInTheDocument();

    // Click edit
    await user.click(editButton);

    expect(screen.getByRole('button', { name: 'Save Context' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel Context' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Edit Context' })).toBeInTheDocument();
  });
});
