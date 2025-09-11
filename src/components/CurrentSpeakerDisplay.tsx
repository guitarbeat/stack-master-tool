import { Button } from "@/components/ui/button";
import { Timer, Play, Pause, RotateCcw, Clock, ArrowRight } from "lucide-react";
import { Participant, DirectResponseState } from "@/types";

interface SpeakerTimer {
  isActive: boolean;
  startTime: Date;
  pausedTime?: number;
}

interface CurrentSpeakerDisplayProps {
  currentSpeaker: Participant | null;
  speakerTimer: SpeakerTimer | null;
  elapsedTime: number;
  directResponse: DirectResponseState;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onNextSpeaker: () => void;
  formatTime: (ms: number) => string;
}

export const CurrentSpeakerDisplay = ({
  currentSpeaker,
  speakerTimer,
  elapsedTime,
  directResponse,
  onToggleTimer,
  onResetTimer,
  onNextSpeaker,
  formatTime
}: CurrentSpeakerDisplayProps) => {
  if (!currentSpeaker) return null;

  return (
    <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/30 shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-primary animate-pulse"></div>
              <div className="absolute inset-0 w-4 h-4 rounded-full bg-primary animate-ping opacity-20"></div>
            </div>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              {directResponse.isActive ? "Direct Response" : "Currently Speaking"}
            </span>
            {speakerTimer && (
              <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
                <Timer className="h-4 w-4 text-accent" />
                <span className="font-mono text-lg font-bold text-accent">
                  {formatTime(elapsedTime)}
                </span>
                <div className="flex gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleTimer}
                    className="h-7 w-7 p-0 hover:bg-accent/20"
                    title={speakerTimer.isActive ? "Pause timer" : "Resume timer"}
                  >
                    {speakerTimer.isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onResetTimer}
                    className="h-7 w-7 p-0 hover:bg-accent/20"
                    title="Reset timer"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          <h3 className="text-2xl lg:text-3xl font-bold text-primary">{currentSpeaker.name}</h3>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={onNextSpeaker}
            size="lg"
            className="px-6 py-3 floating-glow rounded-xl font-medium"
          >
            <ArrowRight className="h-5 w-5 mr-2" />
            Next Speaker
          </Button>
        </div>
      </div>
    </div>
  );
};