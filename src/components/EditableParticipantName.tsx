import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Check, X } from 'lucide-react';

interface EditableParticipantNameProps {
  participantId: string;
  currentName: string;
  isFacilitator: boolean;
  onNameUpdate: (participantId: string, newName: string) => void;
  disabled?: boolean;
}

export function EditableParticipantName({
  participantId,
  currentName,
  isFacilitator,
  onNameUpdate,
  disabled = false
}: EditableParticipantNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentName);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStartEdit = () => {
    setEditName(currentName);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditName(currentName);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (editName.trim() === currentName || editName.trim() === '') {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onNameUpdate(participantId, editName.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update participant name:', error);
      // Reset to original name on error
      setEditName(currentName);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  if (!isFacilitator || disabled) {
    return <span className="font-medium">{currentName}</span>;
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 text-sm"
          maxLength={50}
          autoFocus
          disabled={isUpdating}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSaveEdit}
          disabled={isUpdating || editName.trim() === ''}
          className="h-8 w-8 p-0"
        >
          <Check className="h-4 w-4 text-green-600" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancelEdit}
          disabled={isUpdating}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <span className="font-medium">{currentName}</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleStartEdit}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit2 className="h-3 w-3" />
      </Button>
    </div>
  );
}