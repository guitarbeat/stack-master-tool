import { EditableField } from "@/components/ui/editable-field";

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
  disabled = false,
}: EditableParticipantNameProps) {
  const handleNameUpdate = async (newName: string) => {
    await onNameUpdate(participantId, newName);
  };

  return (
    <EditableField
      value={currentName}
      onUpdate={handleNameUpdate}
      canEdit={isFacilitator}
      disabled={disabled}
      className="font-medium"
      maxLength={50}
    />
  );
}
