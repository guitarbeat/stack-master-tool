import { Button } from "@/components/ui/button";
import { Clock, Play, Pause, RotateCcw, ArrowRight } from "lucide-react";
import { Participant } from "@/types";

interface CurrentSpeakerProps {
  currentSpeaker: Participant;
  stack: Participant[];
  showAllUpNext: boolean;
  onToggleShowAllUpNext: () => void;
  onNextSpeaker: () => void;
  speakerTimer?: {
    isActive: boolean;
    startTime: Date;
  };
  elapsedTime: number;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  formatTime: (ms: number) => string;
  isDirectResponse: boolean;
}

export const CurrentSpeaker = ({
  currentSpeaker,
  stack,
  showAllUpNext,
  onToggleShowAllUpNext,
  onNextSpeaker,
  speakerTimer,
  elapsedTime,
  onToggleTimer,
  onResetTimer,
  formatTime,
  isDirectResponse
}: CurrentSpeakerProps) => {
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
              {isDirectResponse ? "Direct Response" : "Currently Speaking"}
            </span>
            {speakerTimer && (
              <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
                <Clock className="h-4 w-4 text-accent" />
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
          {stack.length > 1 && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="p-1.5 rounded-lg bg-accent/10">
                <Clock className="h-4 w-4 text-accent" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Up next:</span>
              {!showAllUpNext ? (
                <>
                  <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold border-accent/30 text-accent">
                    {stack[1].name}
                  </span>
                  {stack.length > 2 && (
                    <>
                      <span className="text-sm text-muted-foreground font-medium">+{stack.length - 2} more</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={onToggleShowAllUpNext}
                      >
                        Show more
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <>
                  {stack.slice(1).map((p) => (
                    <span key={p.id} className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold border-accent/30 text-accent">
                      {p.name}
                    </span>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={onToggleShowAllUpNext}
                  >
                    Show less
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            size="lg" 
            onClick={onNextSpeaker} 
            className="floating-glow px-6 py-3 text-base font-semibold rounded-xl group whitespace-nowrap bg-primary hover:bg-primary/90"
          >
            Next Speaker
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};