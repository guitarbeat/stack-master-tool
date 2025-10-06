import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Check, X } from 'lucide-react';

interface EditableMeetingTitleProps {
  currentTitle: string;
  isFacilitator: boolean;
  onTitleUpdate: (newTitle: string) => void;
  disabled?: boolean;
  className?: string;
}

export function EditableMeetingTitle({
  currentTitle,
  isFacilitator,
  onTitleUpdate,
  disabled = false,
  className = ''
}: EditableMeetingTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(currentTitle);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStartEdit = () => {
    setEditTitle(currentTitle);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditTitle(currentTitle);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (editTitle.trim() === currentTitle || editTitle.trim() === '') {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onTitleUpdate(editTitle.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update meeting title:', error);
      // Reset to original title on error
      setEditTitle(currentTitle);
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
    return <span className={className}>{currentTitle}</span>;
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`h-8 text-sm ${className}`}
          maxLength={100}
          autoFocus
          disabled={isUpdating}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSaveEdit}
          disabled={isUpdating || editTitle.trim() === ''}
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
      <span className={className}>{currentTitle}</span>
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