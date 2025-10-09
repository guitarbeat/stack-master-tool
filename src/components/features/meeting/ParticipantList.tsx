import React, { useState } from 'react';
import { Trash2, User, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EnhancedEditableParticipantName } from './EnhancedEditableParticipantName';

interface Participant {
  id: string;
  name: string;
  isFacilitator: boolean;
  hasRaisedHand: boolean;
  joinedAt?: Date;
}

interface ParticipantListProps {
  participants: Participant[];
  onUpdateParticipant: (participantId: string, updates: { name?: string }) => void;
  onRemoveParticipant: (participantId: string) => void;
  userRole?: string;
  className?: string;
}

export function ParticipantList({
  participants,
  onUpdateParticipant,
  onRemoveParticipant,
  userRole = 'participant',
  className = ''
}: ParticipantListProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (participantId: string) => {
    setRemovingId(participantId);
    try {
      await onRemoveParticipant(participantId);
    } finally {
      setRemovingId(null);
    }
  };

  const canRemove = userRole === 'facilitator';

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-sm font-medium text-foreground mb-3">
        Participants ({participants.length})
      </h3>
      
      {participants.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-4">
          No participants yet
        </div>
      ) : (
        <div className="space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-3 sm:p-4 bg-card rounded-lg border border-border/50 hover:bg-muted/30 transition-colors min-h-[60px] sm:min-h-[56px]"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {participant.isFacilitator ? (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <User className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <EnhancedEditableParticipantName
                    participantId={participant.id}
                    currentName={participant.name}
                    isFacilitator={userRole === 'facilitator'}
                    onNameUpdate={onUpdateParticipant}
                    disabled={removingId === participant.id}
                    className="text-sm font-medium"
                  />
                  
                  {participant.hasRaisedHand && (
                    <div className="text-xs text-primary mt-1">
                      ✋ Raised hand
                    </div>
                  )}
                </div>
              </div>

              {canRemove && !participant.isFacilitator && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(participant.id)}
                  disabled={removingId === participant.id}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-10 w-10 sm:h-8 sm:w-8 p-0 min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px]"
                  aria-label={`Remove ${participant.name}`}
                >
                  {removingId === participant.id ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ParticipantList;
