import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  addedAt: Date;
}

interface NextSpeakerCardProps {
  currentSpeaker: Participant;
  nextSpeakers: Participant[];
  onNextSpeaker: () => void;
}

export const NextSpeakerCard = ({ currentSpeaker, nextSpeakers, onNextSpeaker }: NextSpeakerCardProps) => {
  return (
    <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
              <span className="text-sm font-medium text-muted-foreground">Currently Speaking</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{currentSpeaker.name}</h3>
            
            {nextSpeakers.length > 0 && (
              <div className="flex items-center gap-2 mt-4">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Up next:</span>
                <Badge variant="outline" className="font-medium">
                  {nextSpeakers[0].name}
                </Badge>
                {nextSpeakers.length > 1 && (
                  <span className="text-xs text-muted-foreground">
                    +{nextSpeakers.length - 1} more
                  </span>
                )}
              </div>
            )}
          </div>
          
          <Button 
            size="lg" 
            onClick={onNextSpeaker}
            className="shadow-lg hover:shadow-xl transition-all duration-200 group"
          >
            Next Speaker
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};