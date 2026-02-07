import { Users } from "lucide-react";
import type { Participant } from "@/types/meeting";
import { ParticipantItem } from "./ParticipantItem";

interface ParticipantListProps {
  participants: Participant[];
  onUpdateParticipant: (
    participantId: string,
    newName: string,
  ) => void | Promise<void>;
  onRemoveParticipant: (participantId: string) => void | Promise<void>;
  userRole?: string;
  className?: string;
}

export function ParticipantList({
  participants,
  onUpdateParticipant,
  onRemoveParticipant,
  userRole = "participant",
  className = "",
}: ParticipantListProps) {
  const isFacilitator = userRole === "facilitator";

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-sm font-medium text-foreground mb-3">
        Participants ({participants.length})
      </h3>

      {participants.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-sm text-muted-foreground py-8 border border-dashed rounded-lg bg-muted/20">
          <Users className="w-8 h-8 mb-2 opacity-40" />
          <p>No participants yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {participants.map((participant) => (
            <ParticipantItem
              key={participant.id}
              id={participant.id}
              name={participant.name}
              isFacilitator={participant.isFacilitator}
              hasRaisedHand={participant.hasRaisedHand}
              onUpdate={onUpdateParticipant}
              onRemove={onRemoveParticipant}
              currentUserIsFacilitator={isFacilitator}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ParticipantList;
