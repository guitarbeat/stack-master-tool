import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Participant {
  id: string;
  name: string;
  addedAt: Date;
}

interface InterventionDialogProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  participants: Participant[];
  onSubmit: (participantName: string) => void;
}

export const InterventionDialog = ({ 
  trigger, 
  title, 
  description, 
  participants,
  onSubmit 
}: InterventionDialogProps) => {
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>("");
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedParticipantId) {
      const participant = participants.find(p => p.id === selectedParticipantId);
      if (participant) {
        onSubmit(participant.name);
        setSelectedParticipantId("");
        setOpen(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="participant">Select Participant</Label>
            {participants.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                No participants in queue. Add participants first to record interventions.
              </div>
            ) : (
              <Select value={selectedParticipantId} onValueChange={setSelectedParticipantId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a participant from the queue" />
                </SelectTrigger>
                <SelectContent>
                  {participants.map((participant) => (
                    <SelectItem key={participant.id} value={participant.id}>
                      {participant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedParticipantId || participants.length === 0}>
              Add Intervention
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};