import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Check, X } from "lucide-react";

interface EditableFieldProps<T = string> {
  value: T;
  onUpdate: (newValue: T) => Promise<void> | void;
  canEdit: boolean;
  disabled?: boolean;
  className?: string;
  maxLength?: number;
  placeholder?: string;
  displayValue?: (value: T) => React.ReactNode;
  inputClassName?: string;
}

export function EditableField<T extends string = string>({
  value,
  onUpdate,
  canEdit,
  disabled = false,
  className = "",
  maxLength = 100,
  placeholder,
  displayValue,
  inputClassName = "h-8 text-sm",
}: EditableFieldProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStartEdit = () => {
    setEditValue(value);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (editValue.trim() === value || editValue.trim() === "") {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(editValue.trim() as T);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update value:", error);
      // Reset to original value on error
      setEditValue(value);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  if (!canEdit || disabled) {
    return (
      <span className={className}>
        {displayValue ? displayValue(value) : value}
      </span>
    );
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={editValue}
          onChange={e => setEditValue(e.target.value as T)}
          onKeyDown={handleKeyDown}
          className={inputClassName}
          maxLength={maxLength}
          placeholder={placeholder}
          autoFocus
          disabled={isUpdating}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSaveEdit}
          disabled={isUpdating || editValue.trim() === ""}
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
      <span className={className}>
        {displayValue ? displayValue(value) : value}
      </span>
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
