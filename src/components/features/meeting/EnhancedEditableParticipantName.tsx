import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logProduction } from '@/utils/productionLogger';

// TODO: Integrate this component into MeetingRoom for inline participant name editing

interface EnhancedEditableParticipantNameProps {
  participantId: string;
  currentName: string;
  isFacilitator: boolean;
  onNameUpdate: (participantId: string, newName: string) => void;
  disabled?: boolean;
  className?: string;
}

export function EnhancedEditableParticipantName({
  participantId,
  currentName,
  isFacilitator,
  onNameUpdate,
  disabled = false,
  className
}: EnhancedEditableParticipantNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentName);
  const [isUpdating, setIsUpdating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus and select text when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

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
      // * Handle both sync and async onNameUpdate functions
      const result = onNameUpdate(participantId, editName.trim());
      if (result && typeof result.then === 'function') {
        await result;
      }
      setIsEditing(false);
    } catch (error) {
      logProduction('error', {
        action: 'update_participant_name',
        participantId,
        newName: editName,
        error: error instanceof Error ? error.message : String(error)
      });
      // Reset to original name on error
      setEditName(currentName);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleDoubleClick = () => {
    if (isFacilitator && !disabled) {
      handleStartEdit();
    }
  };

  if (!isFacilitator || disabled) {
    return (
      <span 
        className={cn("font-medium cursor-default", className)}
        onDoubleClick={handleDoubleClick}
      >
        {currentName}
      </span>
    );
  }

  if (isEditing) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Input
          ref={inputRef}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 text-sm"
          maxLength={50}
          disabled={isUpdating}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSaveEdit}
          disabled={isUpdating || editName.trim() === ''}
          className="h-8 w-8 p-0 shrink-0"
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4 text-green-600" />
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancelEdit}
          disabled={isUpdating}
          className="h-8 w-8 p-0 shrink-0"
        >
          <X className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "flex items-center gap-2 group cursor-pointer",
        className
      )}
      onDoubleClick={handleDoubleClick}
    >
      <span className="font-medium">{currentName}</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleStartEdit}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        title="Click to edit name"
      >
        <Edit2 className="h-3 w-3" />
      </Button>
    </div>
  );
}