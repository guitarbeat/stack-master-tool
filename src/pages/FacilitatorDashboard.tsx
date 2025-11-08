import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { SupabaseMeetingService } from '@/services/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { LoadingState } from '@/components/shared/LoadingState';
import { Plus, ExternalLink, Trash2, ArrowLeft } from 'lucide-react';
import { logProduction } from '@/utils/productionLogger';

interface MeetingSummary {
  id: string;
  code: string;
  title: string;
  facilitator: string;
  createdAt: string;
  isActive: boolean;
}

export default function FacilitatorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { showToast } = useToast();
  
  const [meetings, setMeetings] = useState<MeetingSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('');

  useEffect(() => {
    loadMeetings();
  }, [user]);

  const loadMeetings = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const fetchedMeetings = await SupabaseMeetingService.getMeetingsByFacilitator(user.id);
      setMeetings(fetchedMeetings);
    } catch (error) {
      logProduction('error', {
        action: 'load_facilitator_meetings',
        error: error instanceof Error ? error.message : String(error)
      });
      showToast({
        type: 'error',
        title: 'Failed to load meetings',
        message: 'Could not fetch your meetings'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomTitle.trim()) {
      showToast({
        type: 'error',
        title: 'Title Required',
        message: 'Please enter a meeting title'
      });
      return;
    }

    setIsCreating(true);
    try {
      const facilitatorName = profile?.display_name ?? user?.email ?? 'Anonymous Facilitator';
      const created = await SupabaseMeetingService.createMeeting(
        newRoomTitle.trim(),
        facilitatorName,
        user?.id
      );

      showToast({
        type: 'success',
        title: 'Room Created!',
        message: `Meeting "${created.title}" created with code ${created.code}`
      });

      setNewRoomTitle('');
      navigate(`/meeting?mode=host&code=${created.code}`);
    } catch (error) {
      logProduction('error', {
        action: 'create_room_dashboard',
        error: error instanceof Error ? error.message : String(error)
      });
      showToast({
        type: 'error',
        title: 'Failed to create room',
        message: 'Please try again'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteMeeting = async (meetingId: string, meetingTitle: string) => {
    if (!user?.id) {
      showToast({
        type: 'error',
        title: 'Authentication Required',
        message: 'You must be logged in to delete meetings'
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete "${meetingTitle}"?`)) {
      return;
    }

    try {
      await SupabaseMeetingService.deleteMeeting(meetingId, user.id);
      showToast({
        type: 'success',
        title: 'Meeting Deleted',
        message: `"${meetingTitle}" has been deleted`
      });
      await loadMeetings();
    } catch (error) {
      logProduction('error', {
        action: 'delete_meeting_dashboard',
        meetingId,
        error: error instanceof Error ? error.message : String(error)
      });
      showToast({
        type: 'error',
        title: 'Failed to delete meeting',
        message: 'Please try again'
      });
    }
  };

  const handleOpenMeeting = (code: string) => {
    navigate(`/meeting?mode=host&code=${code}`);
  };

  if (!user) {
    navigate('/meeting?mode=host');
    return null;
  }

  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-6 w-96" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome, {profile?.display_name || 'Facilitator'}
          </h1>
          <p className="text-muted-foreground">
            Manage your meetings and create new discussion rooms
          </p>
        </div>

        {/* Create New Meeting */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Meeting
            </CardTitle>
            <CardDescription>
              Start a new discussion room with a unique code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Enter meeting title..."
                value={newRoomTitle}
                onChange={(e) => setNewRoomTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    void handleCreateRoom();
                  }
                }}
                disabled={isCreating}
              />
              <Button
                onClick={() => void handleCreateRoom()}
                disabled={isCreating || !newRoomTitle.trim()}
              >
                {isCreating ? 'Creating...' : 'Create Room'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Meetings */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Your Meetings
          </h2>
          {meetings.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>No meetings yet. Create your first one above!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {meetings.map((meeting) => (
                <Card
                  key={meeting.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleOpenMeeting(meeting.code)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">
                          {meeting.title}
                        </CardTitle>
                        <CardDescription className="font-mono text-sm">
                          Code: {meeting.code}
                        </CardDescription>
                      </div>
                      <Badge variant={meeting.isActive ? 'default' : 'secondary'}>
                        {meeting.isActive ? 'Active' : 'Ended'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-4">
                      Created: {new Date(meeting.createdAt).toLocaleString()}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenMeeting(meeting.code);
                        }}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleDeleteMeeting(meeting.id, meeting.title);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
