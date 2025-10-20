import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, MessageCircle, Clock, User, Trash2 } from "lucide-react";
import { SupabaseMeetingService } from "@/services/supabase";
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

  useEffect(() => {
    loadActiveRooms();
  }, []);

  const loadActiveRooms = async () => {
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
  };

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading active rooms...</p>
        </div>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Active Rooms</h2>
          <p className="text-muted-foreground mb-6">
            There are currently no active meeting rooms. Anyone can create a new room to get started!
          </p>
          <Button onClick={() => navigate("/meeting?mode=host")} size="lg">
            🚀 Create Your First Room
          </Button>
        </div>
      </div>
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
                    👁️ Watch
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
                            onClick={() => handleDeleteRoom(room.id, room.title)}
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
