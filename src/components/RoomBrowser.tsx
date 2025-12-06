import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, Clock, User, Trash2, Eye, Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { SupabaseMeetingService } from "@/services/supabase";
import { supabase } from "@/integrations/supabase/client";
import { logProduction } from "@/utils/productionLogger";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Room {
  id: string;
  code: string;
  title: string;
  facilitatorName: string;
  facilitatorId: string | null;
  createdAt: string;
  participantCount: number;
}

export function RoomBrowser() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActiveRooms = useCallback(async () => {
    try {
      // Clean up empty old rooms first
      await SupabaseMeetingService.deleteEmptyOldRooms();

      // Get active meetings
      const meetings = await SupabaseMeetingService.getActiveMeetings();

      // Get participant counts for each meeting
      const roomsWithCounts = await Promise.all(
        meetings.map(async (meeting) => {
          const participants = await SupabaseMeetingService.getParticipants(meeting.id);
          return {
            id: meeting.id,
            code: meeting.code,
            title: meeting.title,
            facilitatorName: meeting.facilitator,
            facilitatorId: meeting.facilitatorId,
            createdAt: meeting.createdAt,
            participantCount: participants.length,
          };
        })
      );

      setRooms(roomsWithCounts);
    } catch (error) {
      logProduction("error", {
        action: "load_active_rooms",
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    void loadActiveRooms();
  }, [loadActiveRooms]);

  // Real-time subscriptions for meetings and participants
  useEffect(() => {
    const meetingsChannel = supabase
      .channel('rooms-meetings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meetings'
        },
        () => {
          // Reload rooms when any meeting changes
          void loadActiveRooms();
        }
      )
      .subscribe();

    const participantsChannel = supabase
      .channel('rooms-participants-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants'
        },
        () => {
          // Reload rooms when participant count changes
          void loadActiveRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(meetingsChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [loadActiveRooms]);

  const handleJoinRoom = (meetingCode: string) => {
    navigate(`/meeting?mode=join&code=${meetingCode}`);
  };

  const handleWatchRoom = (meetingCode: string) => {
    navigate(`/meeting?mode=watch&code=${meetingCode}`);
  };

  const handleDeleteRoom = async (roomId: string, roomTitle: string) => {
    if (!user?.id) {
      showToast({
        title: "Authentication Required",
        message: "You must be logged in to delete rooms",
        type: "error",
      });
      return;
    }

    try {
      await SupabaseMeetingService.deleteMeeting(roomId, user.id);
      
      showToast({
        title: "Room Deleted",
        message: `Room "${roomTitle}" has been deleted`,
        type: "success",
      });

      // Refresh the room list
      await loadActiveRooms();
    } catch (error) {
      logProduction("error", {
        action: "delete_room",
        roomId,
        error: error instanceof Error ? error.message : String(error),
      });

      showToast({
        title: "Failed to Delete Room",
        message: error instanceof Error ? error.message : "Please try again",
        type: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Skeleton className="h-9 w-64 mx-auto mb-2" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <EmptyState
        illustration="rooms"
        title="No Active Rooms"
        description="There are currently no active meeting rooms. Be the first to create one and start a discussion!"
        action={{
          label: "Create Your First Room",
          onClick: () => navigate("/facilitator"),
          icon: Plus,
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Active Meeting Rooms</h1>
        <p className="text-muted-foreground">
          Join an ongoing discussion or start your own meeting room
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <Card key={room.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl">{room.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <User className="h-3 w-3" />
                    Facilitated by {room.facilitatorName}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="ml-2">
                  {room.code}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{room.participantCount} participants</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Active now</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleJoinRoom(room.code)}
                    className="flex-1"
                    size="sm"
                  >
                    Join Discussion
                  </Button>
                  <Button
                    onClick={() => handleWatchRoom(room.code)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Watch
                  </Button>
                  {user?.id === room.facilitatorId && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          aria-label="Delete room"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Room?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the room "{room.title}" and all its data. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              void handleDeleteRoom(room.id, room.title);
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Room
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center pt-6 border-t">
        <p className="text-sm text-muted-foreground mb-4">
          Know a meeting code? You can still join directly.
        </p>
        <Button variant="outline" onClick={() => navigate("/meeting?mode=join")}>
          Join with Code
        </Button>
      </div>
    </div>
  );
}
