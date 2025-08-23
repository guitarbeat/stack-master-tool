import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock } from "lucide-react";
import { Participant } from "@/types";

interface NextSpeakerCardProps {
  currentSpeaker: Participant;
  nextSpeakers: Participant[];
  onNextSpeaker: () => void;
}

export const NextSpeakerCard = ({ currentSpeaker, nextSpeakers, onNextSpeaker }: NextSpeakerCardProps) => (
  <Card className="glass-card border-primary/30" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)/0.08), hsl(var(--accent)/0.05))' }}>
    <CardContent className="p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-primary animate-pulse"></div>
              <div className="absolute inset-0 w-4 h-4 rounded-full bg-primary animate-ping opacity-20"></div>
            </div>
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Currently Speaking</span>
          </div>
          <h3 className="text-3xl font-bold gradient-text">{currentSpeaker.name}</h3>
          
          {nextSpeakers.length > 0 && (
            <div className="flex items-center gap-3 mt-6">
              <div className="p-1.5 rounded-lg bg-accent/10">
                <Clock className="h-4 w-4 text-accent" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Up next:</span>
              <Badge variant="outline" className="font-semibold px-3 py-1 rounded-full border-accent/30 text-accent">{nextSpeakers[0].name}</Badge>
              {nextSpeakers.length > 1 && (
                <span className="text-sm text-muted-foreground/70 font-medium">+{nextSpeakers.length - 1} more</span>
              )}
            </div>
          )}
        </div>
        
        <Button size="lg" onClick={onNextSpeaker} className="floating-glow px-8 py-4 text-base font-semibold rounded-xl group">
          Next Speaker
          <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-2" />
        </Button>
      </div>
    </CardContent>
  </Card>
);
