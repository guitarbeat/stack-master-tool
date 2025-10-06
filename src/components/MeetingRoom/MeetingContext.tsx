import { useState, useEffect } from "react";
import { 
  Users, 
  Clock, 
  MessageCircle, 
  Activity,
  TrendingUp,
  Calendar,
  MapPin,
  Eye,
  Mic,
  MicOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface MeetingContextProps {
  meetingData: {
    title: string;
    code: string;
    facilitator: string;
    createdAt?: Date;
  };
  participants: Array<{
    id: string;
    name: string;
    isFacilitator: boolean;
    hasRaisedHand: boolean;
    joinedAt?: Date;
  }>;
  speakingQueue: Array<{
    id: string;
    participantName: string;
    type: string;
    timestamp: number;
  }>;
  currentSpeaker?: {
    participantName: string;
    startedSpeakingAt?: Date;
  };
  totalSpeakingTime?: number; // in seconds
  isWatching?: boolean;
}

export const MeetingContext = ({
  meetingData,
  participants,
  speakingQueue,
  currentSpeaker,
  totalSpeakingTime = 0,
  isWatching = false
}: MeetingContextProps) => {
  const [meetingDuration, setMeetingDuration] = useState<string>('');
  const [currentSpeakerDuration, setCurrentSpeakerDuration] = useState<string>('');
  const [recentActivity, setRecentActivity] = useState<Array<{
    type: 'joined' | 'left' | 'speaking' | 'queue';
    participant: string;
    timestamp: Date;
    details?: string;
  }>>([]);

  // Update meeting duration
  useEffect(() => {
    if (!meetingData.createdAt) return;

    const updateDuration = () => {
      const now = new Date();
      const diff = now.getTime() - meetingData.createdAt!.getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      
      if (hours > 0) {
        setMeetingDuration(`${hours}h ${minutes}m`);
      } else {
        setMeetingDuration(`${minutes}m`);
      }
    };

    updateDuration();
    const interval = setInterval(updateDuration, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [meetingData.createdAt]);

  // Update current speaker duration
  useEffect(() => {
    if (!currentSpeaker?.startedSpeakingAt) {
      setCurrentSpeakerDuration('');
      return;
    }

    const updateSpeakerTime = () => {
      const now = new Date();
      const diff = now.getTime() - currentSpeaker.startedSpeakingAt!.getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      if (minutes > 0) {
        setCurrentSpeakerDuration(`${minutes}m ${seconds}s`);
      } else {
        setCurrentSpeakerDuration(`${seconds}s`);
      }
    };

    updateSpeakerTime();
    const interval = setInterval(updateSpeakerTime, 1000);
    return () => clearInterval(interval);
  }, [currentSpeaker?.startedSpeakingAt]);

  // Simulate recent activity (in a real app, this would come from the backend)
  useEffect(() => {
    const activities: Array<{
      type: 'joined' | 'left' | 'speaking' | 'queue';
      participant: string;
      timestamp: Date;
      details?: string;
    }> = [];

    // Add some mock recent activities
    const now = new Date();
    if (speakingQueue.length > 0) {
      activities.push({
        type: 'queue',
        participant: speakingQueue[0].participantName,
        timestamp: new Date(now.getTime() - 30000),
        details: 'joined the speaking queue'
      });
    }

    if (participants.length > 1) {
      activities.push({
        type: 'joined',
        participant: participants[1].name,
        timestamp: new Date(now.getTime() - 120000),
        details: 'joined the meeting'
      });
    }

    setRecentActivity(activities.slice(0, 5)); // Show last 5 activities
  }, [speakingQueue, participants]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'joined': return <Users className="w-3 h-3 text-green-500" />;
      case 'left': return <Users className="w-3 h-3 text-red-500" />;
      case 'speaking': return <Mic className="w-3 h-3 text-blue-500" />;
      case 'queue': return <MessageCircle className="w-3 h-3 text-yellow-500" />;
      default: return <Activity className="w-3 h-3 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const activeParticipants = participants.filter(p => !p.isFacilitator).length;
  const queueLength = speakingQueue.length;
  const participationRate = participants.length > 0 ? (queueLength / participants.length) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Meeting Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Meeting Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">
            <div className="font-medium text-muted-foreground">Title</div>
            <div className="truncate">{meetingData.title}</div>
          </div>
          <div className="text-sm">
            <div className="font-medium text-muted-foreground">Facilitator</div>
            <div>{meetingData.facilitator}</div>
          </div>
          <div className="text-sm">
            <div className="font-medium text-muted-foreground">Code</div>
            <div className="font-mono">{meetingData.code}</div>
          </div>
          {meetingDuration && (
            <div className="text-sm">
              <div className="font-medium text-muted-foreground">Duration</div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {meetingDuration}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Participation Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Participation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Active participants</span>
            <Badge variant="secondary">
              <Users className="w-3 h-3 mr-1" />
              {activeParticipants}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">In speaking queue</span>
            <Badge variant="outline">
              <MessageCircle className="w-3 h-3 mr-1" />
              {queueLength}
            </Badge>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Participation rate</span>
              <span>{Math.round(participationRate)}%</span>
            </div>
            <Progress value={participationRate} className="h-1" />
          </div>

          {isWatching && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Eye className="w-3 h-3" />
              Watching in read-only mode
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Current Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentSpeaker ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm font-medium">Speaking now</span>
              </div>
              <div className="text-sm">
                <div className="font-medium">{currentSpeaker.participantName}</div>
                {currentSpeakerDuration && (
                  <div className="text-muted-foreground text-xs">
                    {currentSpeakerDuration}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              <MicOff className="w-4 h-4 inline mr-1" />
              No one speaking
            </div>
          )}

          {recentActivity.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Recent activity</div>
              <div className="space-y-1">
                {recentActivity.slice(0, 3).map((activity, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    {getActivityIcon(activity.type)}
                    <span className="truncate">
                      {activity.participant} {activity.details}
                    </span>
                    <span className="text-muted-foreground ml-auto">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};