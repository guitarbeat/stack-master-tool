import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { QuickJoinModal } from "./QuickJoinModal";
import { Users, Eye, Clock, MessageSquare } from "lucide-react";

interface Room {
  id: string;
  code: string;
  title: string;
  facilitator: string;
  createdAt: string;
  participantCount: number;
}

export function InlineRoomBrowser() {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [joinMode, setJoinMode] = useState<"join" | "watch">("join");
  const [showModal, setShowModal] = useState(false);

  const loadActiveRooms = useCallback(async () => {
    try {
      const { data: meetings, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;

      if (!meetings || meetings.length === 0) {
        setRooms([]);
        return;
      }

      // Get participant counts
      const roomsWithCounts = await Promise.all(
        meetings.map(async (meeting) => {
          const { count } = await supabase
            .from("participants")
            .select("*", { count: "exact", head: true })
            .eq("meeting_id", meeting.id)
            .eq("is_active", true);

          return {
            id: meeting.id,
            code: meeting.meeting_code,
            title: meeting.title,
            facilitator: meeting.facilitator_name,
            createdAt: meeting.created_at,
            participantCount: count || 0,
          };
        })
      );

      setRooms(roomsWithCounts);
    } catch (error) {
      console.error("Failed to load rooms:", error);
      toast({
        title: "Error",
        description: "Failed to load active rooms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadActiveRooms();

    // Subscribe to realtime changes
    const meetingsChannel = supabase
      .channel("inline-rooms-meetings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "meetings" },
        () => loadActiveRooms()
      )
      .subscribe();

    const participantsChannel = supabase
      .channel("inline-rooms-participants")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "participants" },
        () => loadActiveRooms()
      )
      .subscribe();

    return () => {
      meetingsChannel.unsubscribe();
      participantsChannel.unsubscribe();
    };
  }, [loadActiveRooms]);

  const handleQuickJoin = (room: Room, mode: "join" | "watch") => {
    setSelectedRoom(room);
    setJoinMode(mode);
    setShowModal(true);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Active Rooms
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Active Rooms
          </h3>
        </div>
        <EmptyState
          illustration="rooms"
          title="No active rooms"
          description="Be the first to host a meeting! Create one using the form above."
          className="py-8"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Active Rooms
          <span className="text-sm font-normal text-muted-foreground">
            ({rooms.length} live)
          </span>
        </h3>
        {/* Show count badge when there are many rooms */}
        {rooms.length >= 6 && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            Showing first 6
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {rooms.map((room) => (
          <Card
            key={room.id}
            className="group hover:border-primary/50 transition-all duration-200 hover:shadow-md"
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {room.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    by {room.facilitator}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {room.participantCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTimeAgo(room.createdAt)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleQuickJoin(room, "join")}
                    className="flex-1"
                  >
                    <Users className="h-3.5 w-3.5 mr-1.5" />
                    Join
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickJoin(room, "watch")}
                    className="flex-1"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    Watch
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedRoom && (
        <QuickJoinModal
          open={showModal}
          onOpenChange={setShowModal}
          roomCode={selectedRoom.code}
          roomTitle={selectedRoom.title}
          mode={joinMode}
        />
      )}
    </div>
  );
}
