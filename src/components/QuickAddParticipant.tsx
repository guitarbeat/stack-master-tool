import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAddParticipantProps {
  onAddParticipant: (name: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function QuickAddParticipant({
  onAddParticipant,
  disabled = false,
  placeholder = "Add participant...",
  className
}: QuickAddParticipantProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleAdd = async () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || isAdding) return;

    // Support multiple names separated by comma or newline
    const names = trimmedValue
      .split(/[,\n]/)
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (names.length === 0) return;

    setIsAdding(true);
    try {
      // Add each name
      for (const name of names) {
        await onAddParticipant(name);
      }
      setInputValue('');
      setIsExpanded(false);
    } catch (error) {
      console.error('Error adding participants:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    } else if (e.key === 'Escape') {
      setInputValue('');
      setIsExpanded(false);
    }
  };

  const handleCancel = () => {
    setInputValue('');
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <Button
        onClick={() => setIsExpanded(true)}
        disabled={disabled}
        variant="outline"
        size="sm"
        className={cn(
          "transition-all duration-200 hover:scale-105",
          className
        )}
        data-quick-add-trigger
      >
        <Plus className="w-4 h-4 mr-2" />
        Quick Add
      </Button>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex-1">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isAdding}
          className="pr-10"
        />
        {isAdding && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      <Button
        onClick={handleAdd}
        disabled={!inputValue.trim() || isAdding}
        size="sm"
        className="shrink-0"
      >
        Add
      </Button>
      <Button
        onClick={handleCancel}
        disabled={isAdding}
        variant="ghost"
        size="sm"
        className="shrink-0"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}