import { EditableField } from "@/components/ui/editable-field";

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
  className = "",
}: EditableMeetingTitleProps) {
  return (
    <EditableField
      value={currentTitle}
      onUpdate={onTitleUpdate}
      canEdit={isFacilitator}
      disabled={disabled}
      className={className}
      maxLength={100}
      inputClassName={`h-8 text-sm ${className}`}
    />
  );
}
