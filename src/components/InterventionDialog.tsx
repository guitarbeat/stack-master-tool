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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InterventionDialogProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  onSubmit: (participantName: string) => void;
}

export const InterventionDialog = ({ 
  trigger, 
  title, 
  description, 
  onSubmit 
}: InterventionDialogProps) => {
  const [participantName, setParticipantName] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (participantName.trim()) {
      onSubmit(participantName.trim());
      setParticipantName("");
      setOpen(false);
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
            <Label htmlFor="participant">Participant Name</Label>
            <Input
              id="participant"
              placeholder="Enter participant name"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!participantName.trim()}>
              Add Intervention
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};