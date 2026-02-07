import { memo, useState } from "react";
import { Trash2, User, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditableField } from "@/components/ui/editable-field";

interface ParticipantItemProps {
  id: string;
  name: string;
  isFacilitator: boolean;
  hasRaisedHand: boolean;
  onUpdate: (id: string, name: string) => void | Promise<void>;
  onRemove: (id: string) => void | Promise<void>;
  currentUserIsFacilitator: boolean;
}

export const ParticipantItem = memo(({
  id,
  name,
  isFacilitator,
  hasRaisedHand,
  onUpdate,
  onRemove,
  currentUserIsFacilitator,
}: ParticipantItemProps) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove(id);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div
      className="flex items-center justify-between p-3 sm:p-4 bg-card rounded-lg border border-border/50 hover:bg-muted/30 transition-colors min-h-[60px] sm:min-h-[56px]"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0">
          {isFacilitator ? (
            <Crown className="w-4 h-4 text-yellow-500" />
          ) : (
            <User className="w-4 h-4 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <EditableField
            value={name}
            onUpdate={(newName) => onUpdate(id, newName)}
            canEdit={currentUserIsFacilitator}
            className={`text-sm font-medium text-foreground truncate block ${
              currentUserIsFacilitator
                ? "cursor-pointer hover:underline decoration-dashed decoration-muted-foreground/50 underline-offset-4"
                : ""
            }`}
            inputClassName="h-7 text-sm"
          />

          {hasRaisedHand && (
            <div className="text-xs text-primary mt-1">
              ✋ Raised hand
            </div>
          )}
        </div>
      </div>

      {currentUserIsFacilitator && !isFacilitator && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            void handleRemove();
          }}
          disabled={isRemoving}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-10 w-10 sm:h-8 sm:w-8 p-0 min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px]"
          aria-label={`Remove ${name}`}
        >
          {isRemoving ? (
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </Button>
      )}
    </div>
  );
});
