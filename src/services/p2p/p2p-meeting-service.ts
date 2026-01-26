import type { IMeetingService, IMeetingRealtime, RealtimeCallbacks } from "../meeting-service";
import { SupabaseMeetingService } from "../supabase";
import { MeetingSync } from "./meeting-sync";
import { createP2PSession, SignalingManager } from "./signaling";
import type {
  MeetingData,
  MeetingWithParticipants,
  Participant,
  ParticipantSnapshot,
  QueueItem
} from "@/types/meeting";

class P2PService implements IMeetingService {
  private currentSync: MeetingSync | null = null;
  private currentSignaling: SignalingManager | null = null;
  private currentCode: string | null = null;
  private currentId: string | null = null;

  async createMeeting(
    title: string,
    facilitatorName: string,
    facilitatorId?: string,
  ): Promise<MeetingData> {
    // Hybrid: Reserve code in Supabase to prevent collisions and support discovery
    const meeting = await SupabaseMeetingService.createMeeting(title, facilitatorName, facilitatorId);

    // Initialize local P2P state
    this.cleanup();
    this.currentCode = meeting.code;
    this.currentId = meeting.id;
    this.currentSync = new MeetingSync(meeting.code);
    this.currentSync.initializeMeeting(title, facilitatorId || "", facilitatorName);

    // We don't connect signaling yet, it will happen on join

    return meeting;
  }

  async getMeeting(code: string): Promise<MeetingWithParticipants | null> {
    // Hybrid: Check Supabase for existence and metadata
    const meeting = await SupabaseMeetingService.getMeeting(code);
    if (!meeting) return null;

    // If we are already connected to this code, return current state
    if (this.currentSync && this.currentCode === code) {
       return {
         ...meeting,
         participants: this.currentSync.getParticipantsList(),
         speakingQueue: this.currentSync.getQueueList()
       };
    }

    // If not connected, return Supabase metadata but empty P2P lists
    // The lists will be populated via Realtime subscription once joined
    return {
      ...meeting,
      participants: [],
      speakingQueue: []
    };
  }

  async joinMeeting(
    code: string,
    name: string,
    isFacilitator?: boolean,
  ): Promise<Participant> {
    this.ensureSync(code);

    const participantId = crypto.randomUUID();
    const participant: Participant = {
      id: participantId,
      name,
      isFacilitator: isFacilitator || false,
      hasRaisedHand: false,
      joinedAt: new Date().toISOString(),
      isActive: true
    };

    this.currentSync!.upsertParticipant(participant);
    return participant;
  }

  async joinQueue(
    meetingId: string,
    participantId: string,
    queueType: string = "speak",
  ): Promise<QueueItem> {
    if (!this.checkMeeting(meetingId)) throw new Error("Meeting not active");

    const participant = this.currentSync!.getParticipant(participantId);
    if (!participant) throw new Error("Participant not found");

    const item: QueueItem = {
      id: crypto.randomUUID(),
      participantId,
      participantName: participant.name,
      type: queueType,
      position: this.currentSync!.getQueueList().length + 1,
      timestamp: Date.now(),
      isSpeaking: false,
      isFacilitator: participant.isFacilitator
    };

    this.currentSync!.addToQueue(item);
    return item;
  }

  async leaveQueue(meetingId: string, participantId: string): Promise<void> {
    if (!this.checkMeeting(meetingId)) return;
    this.currentSync!.removeFromQueue(participantId);
  }

  async nextSpeaker(meetingId: string): Promise<QueueItem | null> {
    if (!this.checkMeeting(meetingId)) return null;
    return this.currentSync!.nextSpeaker();
  }

  async updateMeetingTitle(meetingId: string, newTitle: string): Promise<void> {
    if (this.checkMeeting(meetingId)) {
      this.currentSync!.updateTitle(newTitle);
      // Also update Supabase for discovery
      await SupabaseMeetingService.updateMeetingTitle(meetingId, newTitle);
    }
  }

  async updateParticipantName(participantId: string, newName: string): Promise<void> {
    if (!this.currentSync) return;
    const p = this.currentSync.getParticipant(participantId);
    if (p) {
      this.currentSync.upsertParticipant({ ...p, name: newName });
    }
  }

  async reorderQueueItem(
    meetingId: string,
    participantId: string,
    newPosition: number,
  ): Promise<void> {
    if (!this.checkMeeting(meetingId)) return;
    this.currentSync!.reorderQueue(participantId, newPosition);
  }

  async removeParticipant(participantId: string): Promise<ParticipantSnapshot> {
    if (!this.currentSync) throw new Error("No active meeting");

    const p = this.currentSync.getParticipant(participantId);
    if (!p) throw new Error("Participant not found");

    // Use soft delete (deactivate) to support undo/restore, matching Supabase behavior
    this.currentSync.deactivateParticipant(participantId);
    this.currentSync.removeFromQueue(participantId);

    return {
      id: p.id,
      meetingId: this.currentId || "",
      name: p.name,
      isFacilitator: p.isFacilitator,
      joinedAt: p.joinedAt
    };
  }

  async restoreParticipant(participantId: string): Promise<void> {
    if (this.currentSync) {
        const p = this.currentSync.getParticipant(participantId);
        if (p) {
            this.currentSync.upsertParticipant({ ...p, isActive: true });
        }
    }
  }

  async leaveMeeting(participantId: string): Promise<void> {
    if (this.currentSync) {
       this.currentSync.deactivateParticipant(participantId);
       this.currentSync.removeFromQueue(participantId);
    }
  }

  async endMeeting(meetingId: string): Promise<void> {
    if (this.checkMeeting(meetingId)) {
      this.currentSync!.endMeeting();
      await SupabaseMeetingService.endMeeting(meetingId);
      this.cleanup();
    }
  }

  async updateMeetingCode(meetingId: string, newCode: string): Promise<void> {
    // Complex in P2P as it changes the room.
    // For now, we update Supabase, but P2P clients would need to reconnect to new room.
    // This is hard to sync. We might disable this for P2P mode or just update Supabase.
    await SupabaseMeetingService.updateMeetingCode(meetingId, newCode);
    if (this.checkMeeting(meetingId)) {
       // We would need to migrate everyone.
       // For now, let's just update the title/metadata if needed, but code change is tricky.
       // We'll leave it as is, but it might disconnect peers.
    }
  }

  async canRejoinAsFacilitator(meetingCode: string, participantName: string): Promise<boolean> {
     // Check Supabase
     return SupabaseMeetingService.canRejoinAsFacilitator(meetingCode, participantName);
  }

  // Helpers

  cleanup() {
    this.currentSignaling?.destroy();
    this.currentSync?.destroy();
    this.currentSignaling = null;
    this.currentSync = null;
    this.currentCode = null;
    this.currentId = null;
  }

  ensureSync(code: string): MeetingSync {
     if (!this.currentSync || this.currentCode !== code) {
       this.cleanup();
       this.currentCode = code;
       this.currentSync = new MeetingSync(code);
       // Also try to get ID from Supabase if possible, or just proceed without ID check
     }
     if (!this.currentSignaling) {
        this.currentSignaling = createP2PSession(this.currentSync, { roomCode: code });
     }
     return this.currentSync;
  }

  private checkMeeting(meetingId: string): boolean {
    if (!this.currentSync) return false;
    // If we have an ID, check it. If not (e.g. joined via code only and didn't store ID yet),
    // we might skip check or fetch it.
    // For simplicity, if we have currentSync, we assume it's the right one.
    // Ideally we match IDs.
    if (this.currentId && this.currentId !== meetingId) return false;
    return true;
  }
}

export const P2PMeetingService = new P2PService();

export const P2PRealtimeService: IMeetingRealtime = {
  subscribeToMeeting(
    meetingId: string,
    meetingCode: string,
    callbacks: RealtimeCallbacks
  ) {
     const sync = P2PMeetingService.ensureSync(meetingCode);

     sync.setCallbacks({
        onParticipantsUpdated: callbacks.onParticipantsUpdated,
        onQueueUpdated: callbacks.onQueueUpdated,
        onTitleUpdated: callbacks.onMeetingTitleUpdated,
        onError: (err) => callbacks.onError?.(err)
     });

     return () => {
       sync.setCallbacks({});
     };
  }
};
