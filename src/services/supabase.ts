import { AppError, ErrorCode } from "../utils/errorHandling";
import { logProduction } from "../utils/productionLogger";
// Use the single, validated client from integrations to avoid duplicate config
import { supabase } from "@/integrations/supabase/client";

// Types
export interface Participant {
  id: string;
  name: string;
  isFacilitator: boolean;
  hasRaisedHand: boolean;
  joinedAt: string;
  isActive: boolean;
}

export interface MeetingData {
  id: string;
  code: string;
  title: string;
  facilitator: string;
  facilitatorId: string | null;
  createdAt: string;
  isActive: boolean;
}

export interface QueueItem {
  id: string;
  participantId: string;
  participantName: string;
  queueType: string;
  position: number;
  joinedQueueAt: string;
  isSpeaking: boolean;
}

export interface MeetingWithParticipants extends MeetingData {
  participants: Participant[];
  speakingQueue: QueueItem[];
}

type SpeakingQueueRow = {
  id: string;
  participant_id: string;
  queue_type: string;
  position: number;
  joined_queue_at: string;
  is_speaking: boolean;
  participants?: { name: string };
};

// Meeting operations
export class SupabaseMeetingService {
  // Create a new meeting
  static async createMeeting(
    title: string,
    facilitatorName: string,
    facilitatorId?: string,
  ): Promise<MeetingData> {
    try {
      // Generate a proper 6-character meeting code using the database function
      // This ensures consistency with the database schema and validation
      let meetingCode: string;
      
      try {
        const { data: codeData, error: codeError } = await supabase
          .rpc('generate_meeting_code');
        
        if (codeError) {
          throw new Error(`Database function failed: ${codeError.message}`);
        }

        meetingCode = codeData;
      } catch (dbError) {
        // Fallback to client-side generation if database function fails
        logProduction('warn', {
          action: 'database_meeting_code_generation_failed',
          error: dbError instanceof Error ? dbError.message : String(dbError)
        });
        
        // Use the same character set as the database function
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        let codeExists = true;
        let attempts = 0;
        const maxAttempts = 10;
        
        while (codeExists && attempts < maxAttempts) {
          result = '';
          for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          
          // Check if code already exists
          const { data: existing } = await supabase
            .from("meetings")
            .select("meeting_code")
            .eq("meeting_code", result)
            .single();
          
          codeExists = !!existing;
          attempts++;
        }
        
        if (codeExists) {
          throw new AppError(
            ErrorCode.INTERNAL_SERVER_ERROR,
            undefined,
            "Unable to generate unique meeting code after multiple attempts"
          );
        }
        
        meetingCode = result;
      }
      const { data, error } = await supabase
        .from("meetings")
        .insert({
          title: title.trim(),
          facilitator_name: facilitatorName.trim(),
            facilitator_id: facilitatorId ?? null,
          meeting_code: meetingCode,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          error,
          "Failed to create meeting",
        );
      }

      return {
        id: data.id,
        code: data.meeting_code,
        title: data.title,
        facilitator: data.facilitator_name,
        facilitatorId: data.facilitator_id,
        createdAt: data.created_at,
        isActive: data.is_active,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error as Error,
        "Failed to create meeting",
      );
    }
  }

  // Get meeting by code
  static async getMeeting(
    code: string,
  ): Promise<MeetingWithParticipants | null> {
    try {
      // Validate meeting code format before making API call
      if (!code || typeof code !== "string") {
        throw new AppError(
          ErrorCode.INVALID_MEETING_CODE,
          undefined,
          "Meeting code is required"
        );
      }

      const normalizedCode = code.toUpperCase().trim();
      
      // Check if code is exactly 6 characters and contains only valid characters
      if (normalizedCode.length !== 6) {
        throw new AppError(
          ErrorCode.INVALID_MEETING_CODE,
          undefined,
          "Meeting code must be exactly 6 characters"
        );
      }

      if (!/^[A-Z0-9]{6}$/.test(normalizedCode)) {
        throw new AppError(
          ErrorCode.INVALID_MEETING_CODE,
          undefined,
          "Meeting code can only contain letters and numbers"
        );
      }

      const { data: meeting, error: meetingError } = await supabase
        .from("meetings")
        .select("*")
        .eq("meeting_code", normalizedCode)
        .eq("is_active", true)
        .single();

      if (meetingError || !meeting) {
        return null;
      }

      // Get participants
      const { data: participants, error: participantsError } = await supabase
        .from("participants")
        .select("*")
        .eq("meeting_id", meeting.id)
        .eq("is_active", true)
        .order("joined_at", { ascending: true });

      if (participantsError) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          participantsError,
          "Failed to fetch participants",
        );
      }

      // Get speaking queue
      const { data: queue, error: queueError } = await supabase
        .from("speaking_queue")
        .select(
          `
          *,
          participants!inner(name)
        `,
        )
        .eq("meeting_id", meeting.id)
        .order("position", { ascending: true });

      if (queueError) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          queueError,
          "Failed to fetch speaking queue",
        );
      }

      const participantRows = (participants ?? []) as Array<{
        id: string;
        name: string;
        is_facilitator: boolean;
        joined_at: string;
        is_active: boolean;
      }>;

      const queueRows = (queue ?? []) as Array<SpeakingQueueRow & {
        participants: { name: string };
      }>;

      return {
        id: meeting.id,
        code: meeting.meeting_code,
        title: meeting.title,
        facilitator: meeting.facilitator_name,
        createdAt: meeting.created_at,
        isActive: meeting.is_active,
        participants: participantRows.map((p) => ({
          id: p.id,
          name: p.name,
          isFacilitator: p.is_facilitator,
          hasRaisedHand: false, // Not implemented yet
          joinedAt: p.joined_at,
          isActive: p.is_active,
        })),
        speakingQueue: queueRows.map((q) => ({
          id: q.id,
          participantId: q.participant_id,
          participantName: q.participants.name,
          queueType: q.queue_type,
          position: q.position,
          joinedQueueAt: q.joined_queue_at,
          isSpeaking: q.is_speaking,
        })),
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error as Error,
        "Failed to fetch meeting",
      );
    }
  }

  // Join meeting as participant
  static async joinMeeting(
    meetingCode: string,
    participantName: string,
    isFacilitator: boolean = false,
  ): Promise<Participant> {
    try {
      // Validate meeting code format before proceeding
      if (!meetingCode || typeof meetingCode !== "string") {
        throw new AppError(
          ErrorCode.INVALID_MEETING_CODE,
          undefined,
          "Meeting code is required"
        );
      }

      const normalizedCode = meetingCode.toUpperCase().trim();
      
      if (normalizedCode.length !== 6 || !/^[A-Z0-9]{6}$/.test(normalizedCode)) {
        throw new AppError(
          ErrorCode.INVALID_MEETING_CODE,
          undefined,
          "Meeting code must be exactly 6 characters and contain only letters and numbers"
        );
      }

      // First, get the meeting
      const meeting = await this.getMeeting(normalizedCode);
      if (!meeting) {
        throw new AppError(
          ErrorCode.MEETING_NOT_FOUND,
          undefined,
          "Meeting not found",
        );
      }

      // Check if facilitator authorization is required
      if (isFacilitator && meeting.facilitator !== participantName) {
        throw new AppError(
          ErrorCode.UNAUTHORIZED_FACILITATOR,
          undefined,
          "Only the meeting creator can join as facilitator",
        );
      }

      // Create participant
      const { data, error } = await supabase
        .from("participants")
        .insert({
          meeting_id: meeting.id,
          name: participantName.trim(),
          is_facilitator: isFacilitator,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          error,
          "Failed to join meeting",
        );
      }

      return {
        id: data.id,
        name: data.name,
        isFacilitator: data.is_facilitator,
        hasRaisedHand: false,
        joinedAt: data.joined_at,
        isActive: data.is_active,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error as Error,
        "Failed to join meeting",
      );
    }
  }

  // Join speaking queue
  static async joinQueue(
    meetingId: string,
    participantId: string,
    queueType: string = "speak",
  ): Promise<QueueItem> {
    try {
      // Get current queue to determine position
      const { data: currentQueue, error: queueError } = await supabase
        .from("speaking_queue")
        .select("position")
        .eq("meeting_id", meetingId)
        .order("position", { ascending: false })
        .limit(1);

      if (queueError) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          queueError,
          "Failed to fetch queue",
        );
      }

      const queuePositions = (currentQueue ?? []) as Array<Pick<SpeakingQueueRow, "position">>;
      const nextPosition =
        queuePositions.length > 0 ? queuePositions[0].position + 1 : 1;

      // Get participant name
      const { data: participant, error: participantError } = await supabase
        .from("participants")
        .select("name")
        .eq("id", participantId)
        .single();

      if (participantError || !participant) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          participantError,
          "Participant not found",
        );
      }

      // Add to queue
      const { data, error } = await supabase
        .from("speaking_queue")
        .insert({
          meeting_id: meetingId,
          participant_id: participantId,
          queue_type: queueType,
          position: nextPosition,
          is_speaking: false,
        })
        .select()
        .single();

      if (error) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          error,
          "Failed to join queue",
        );
      }

      return {
        id: data.id,
        participantId: data.participant_id,
        participantName: participant.name,
        queueType: data.queue_type,
        position: data.position,
        joinedQueueAt: data.joined_queue_at,
        isSpeaking: data.is_speaking,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error as Error,
        "Failed to join queue",
      );
    }
  }

  // Leave speaking queue
  static async leaveQueue(
    meetingId: string,
    participantId: string,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("speaking_queue")
        .delete()
        .eq("meeting_id", meetingId)
        .eq("participant_id", participantId);

      if (error) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          error,
          "Failed to leave queue",
        );
      }

      // Reorder remaining queue positions
      await this.reorderQueue(meetingId);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error as Error,
        "Failed to leave queue",
      );
    }
  }

  // Move to next speaker (facilitator only)
  static async nextSpeaker(meetingId: string): Promise<QueueItem | null> {
    try {
      // Get current queue
      const { data: queue, error: queueError } = await supabase
        .from("speaking_queue")
        .select(
          `
          *,
          participants!inner(name)
        `,
        )
        .eq("meeting_id", meetingId)
        .order("position", { ascending: true });

      if (queueError) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          queueError,
          "Failed to fetch queue",
        );
      }

      const queueItems = (queue ?? []) as Array<SpeakingQueueRow & {
        participants: { name: string };
      }>;

      if (queueItems.length === 0) {
        return null;
      }

      // Remove first speaker
      const [nextSpeaker] = queueItems;
      const { error: deleteError } = await supabase
        .from("speaking_queue")
        .delete()
        .eq("id", nextSpeaker.id);

      if (deleteError) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          deleteError,
          "Failed to remove speaker",
        );
      }

      // Reorder remaining queue
      await this.reorderQueue(meetingId);

      return {
        id: nextSpeaker.id,
        participantId: nextSpeaker.participant_id,
        participantName: nextSpeaker.participants.name,
        queueType: nextSpeaker.queue_type,
        position: nextSpeaker.position,
        joinedQueueAt: nextSpeaker.joined_queue_at,
        isSpeaking: nextSpeaker.is_speaking,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error as Error,
        "Failed to move to next speaker",
      );
    }
  }

  // Update meeting title (facilitator only)
  static async updateMeetingTitle(
    meetingId: string,
    newTitle: string,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("meetings")
        .update({ title: newTitle.trim() })
        .eq("id", meetingId);

      if (error) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          error,
          "Failed to update meeting title",
        );
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error as Error,
        "Failed to update meeting title",
      );
    }
  }

  static async updateMeetingCode(
    meetingId: string,
    newCode: string,
  ): Promise<void> {
    try {
      // Validate the new code format
      if (!/^[A-Z0-9]{6}$/.test(newCode)) {
        throw new AppError(
          ErrorCode.INVALID_MEETING_CODE,
          undefined,
          "Meeting code must be exactly 6 uppercase letters and numbers"
        );
      }

      // Check if the code is already in use by another meeting
      const { data: existing } = await supabase
        .from("meetings")
        .select("id")
        .eq("meeting_code", newCode)
        .neq("id", meetingId)
        .single();

      if (existing) {
        throw new AppError(
          ErrorCode.MEETING_CODE_EXISTS,
          undefined,
          "This meeting code is already in use. Please choose a different code."
        );
      }

      const { error } = await supabase
        .from("meetings")
        .update({ meeting_code: newCode })
        .eq("id", meetingId);

      if (error) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          error,
          "Failed to update meeting code",
        );
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error as Error,
        "Failed to update meeting code",
      );
    }
  }

  // Update participant name (facilitator only)
  static async updateParticipantName(
    participantId: string,
    newName: string,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("participants")
        .update({ name: newName.trim() })
        .eq("id", participantId);

      if (error) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          error,
          "Failed to update participant name",
        );
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error as Error,
        "Failed to update participant name",
      );
    }
  }

  // Reorder queue item to new position
  static async reorderQueueItem(
    meetingId: string,
    participantId: string,
    newPosition: number,
  ): Promise<void> {
    try {
      // Get current queue to determine how to shift positions
      const { data: currentQueue, error: queueError } = await supabase
        .from("speaking_queue")
        .select("id, position, participant_id")
        .eq("meeting_id", meetingId)
        .order("position", { ascending: true });

      if (queueError) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          queueError,
          "Failed to fetch queue for reordering",
        );
      }

      const queueItems = (currentQueue ?? []) as Array<Pick<SpeakingQueueRow, "id" | "position" | "participant_id">>;

      if (queueItems.length === 0) {
        return;
      }

      const currentItemIndex = queueItems.findIndex(item => item.position === newPosition);
      if (currentItemIndex === -1) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          undefined,
          "Invalid position for reordering",
        );
      }

      // Shift positions to make room for the new position
      const updates: Array<{ id: string; position: number }> = [];
      if (newPosition < queueItems[currentItemIndex].position) {
        // Moving up - shift items down
        for (let i = newPosition - 1; i < queueItems.length; i++) {
          if (queueItems[i].position >= newPosition) {
            updates.push({
              id: queueItems[i].id,
              position: queueItems[i].position + 1
            });
          }
        }
      } else {
        // Moving down - shift items up
        for (let i = 0; i < queueItems.length; i++) {
          if (queueItems[i].position > newPosition && queueItems[i].position <= queueItems[currentItemIndex].position) {
            updates.push({
              id: queueItems[i].id,
              position: queueItems[i].position - 1
            });
          }
        }
      }

      // Update the target item to new position
      const targetItem = queueItems.find(item => item.participant_id === participantId);
      if (!targetItem) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          undefined,
          "Participant not found in queue",
        );
      }

      updates.push({
        id: targetItem.id,
        position: newPosition
      });

      // Execute all updates
      for (const update of updates) {
        const { error } = await supabase
          .from("speaking_queue")
          .update({ position: update.position })
          .eq("id", update.id);

        if (error) {
          throw new AppError(
            ErrorCode.INTERNAL_SERVER_ERROR,
            error,
            "Failed to update queue position",
          );
        }
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error as Error,
        "Failed to reorder queue item",
      );
    }
  }

  // Helper: Reorder queue positions
  private static async reorderQueue(meetingId: string): Promise<void> {
    try {
      const { data: queue, error: queueError } = await supabase
        .from("speaking_queue")
        .select("id, position")
        .eq("meeting_id", meetingId)
        .order("position", { ascending: true });

      if (queueError) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          queueError,
          "Failed to fetch queue for reordering",
        );
      }

      // Update positions sequentially
      for (let i = 0; i < queue.length; i++) {
        const { error } = await supabase
          .from("speaking_queue")
          .update({ position: i + 1 })
          .eq("id", queue[i].id);

        if (error) {
          throw new AppError(
            ErrorCode.INTERNAL_SERVER_ERROR,
            error,
            "Failed to reorder queue",
          );
        }
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error as Error,
        "Failed to reorder queue",
      );
    }
  }

  // Remove participant from meeting (facilitator only)
  static async removeParticipant(participantId: string): Promise<void> {
    try {
      // First, remove from speaking queue if they're in it
      const { error: queueError } = await supabase
        .from("speaking_queue")
        .delete()
        .eq("participant_id", participantId);

      if (queueError) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          queueError,
          "Failed to remove participant from queue",
        );
      }

      // Then remove the participant
      const { error } = await supabase
        .from("participants")
        .delete()
        .eq("id", participantId);

      if (error) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          error,
          "Failed to remove participant",
        );
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error as Error,
        "Failed to remove participant",
      );
    }
  }

  // End meeting (mark as inactive and clean up)
  static async leaveMeeting(participantId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("participants")
        .update({ is_active: false })
        .eq("id", participantId);

      if (error) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          error,
          "Failed to leave meeting",
        );
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error as Error,
        "Failed to leave meeting",
      );
    }
  }

  static async endMeeting(meetingId: string): Promise<void> {
    try {
      // Mark meeting as inactive
      const { error: meetingError } = await supabase
        .from("meetings")
        .update({ is_active: false })
        .eq("id", meetingId);

      if (meetingError) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          meetingError,
          "Failed to end meeting",
        );
      }

      // Mark all participants as inactive
      const { error: participantsError } = await supabase
        .from("participants")
        .update({ is_active: false })
        .eq("meeting_id", meetingId);

      if (participantsError) {
        logProduction('warn', {
          action: 'failed_to_deactivate_participants',
          meetingId,
          error: participantsError.message
        });
        // Don't throw here as the meeting is already ended
      }

      // Clear speaking queue
      const { error: queueError } = await supabase
        .from("speaking_queue")
        .delete()
        .eq("meeting_id", meetingId);

      if (queueError) {
        logProduction('warn', {
          action: 'failed_to_clear_speaking_queue',
          meetingId,
          error: queueError.message
        });
        // Don't throw here as the meeting is already ended
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error as Error,
        "Failed to end meeting",
      );
    }
  }

  /**
   * * Get all active meetings for room browsing
   */
  static async getActiveMeetings(): Promise<MeetingData[]> {
    try {
      const { data, error } = await supabase
        .from("meetings")
        .select("id, meeting_code, title, facilitator_name, facilitator_id, created_at, is_active")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          error,
          "Failed to get active meetings",
        );
      }

      const meetingRows = (data ?? []) as Array<{
        id: string;
        meeting_code: string;
        title: string;
        facilitator_name: string;
        facilitator_id: string | null;
        created_at: string;
        is_active: boolean;
      }>;

      return meetingRows.map((row) => ({
        id: row.id,
        code: row.meeting_code,
        title: row.title,
        facilitator: row.facilitator_name,
        facilitatorId: row.facilitator_id,
        createdAt: row.created_at,
        isActive: row.is_active,
      }));
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error as Error,
        "Failed to get active meetings",
      );
    }
  }

  /**
   * * Get active participants count for a meeting
   */
  static async getParticipants(meetingId: string): Promise<Participant[]> {
    try {
      const { data, error } = await supabase
        .from("participants")
        .select("*")
        .eq("meeting_id", meetingId)
        .eq("is_active", true)
        .order("joined_at", { ascending: true });

      if (error) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          error,
          "Failed to get participants",
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error as Error,
        "Failed to get participants",
      );
    }
  }

  /**
   * * Get meetings created by a specific facilitator
   */
  static async getMeetingsByFacilitator(facilitatorId: string): Promise<MeetingData[]> {
    try {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("facilitator_id", facilitatorId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          error,
          "Failed to get facilitator meetings",
        );
      }

      return (data as MeetingData[]) || [];
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error as Error,
        "Failed to get facilitator meetings",
      );
    }
  }

  /**
   * * Delete empty rooms older than 1 hour
   */
  static async deleteEmptyOldRooms(): Promise<void> {
    try {
      // Get meetings that are:
      // 1. is_active = true
      // 2. created_at < NOW() - INTERVAL '1 hour'
      // 3. Have 0 active participants
      const { data: emptyOldMeetings, error: queryError } = await supabase
        .from("meetings")
        .select(`
          id,
          created_at,
          participants!inner(id)
        `)
        .eq("is_active", true)
        .lt("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .eq("participants.is_active", false);

      if (queryError) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          queryError,
          "Failed to query empty old meetings",
        );
      }

      if (!emptyOldMeetings || emptyOldMeetings.length === 0) {
        return; // No empty old meetings to delete
      }

      // Get meetings with 0 active participants
      const meetingsToDelete = [];
      for (const meeting of emptyOldMeetings) {
        const { data: activeParticipants, error: participantError } = await supabase
          .from("participants")
          .select("id")
          .eq("meeting_id", meeting.id)
          .eq("is_active", true);

        if (participantError) {
          logProduction("warn", {
            action: "check_participants_failed",
            meetingId: meeting.id,
            error: participantError.message
          });
          continue;
        }

        if (!activeParticipants || activeParticipants.length === 0) {
          meetingsToDelete.push(meeting.id);
        }
      }

      // Delete the empty old meetings
      if (meetingsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from("meetings")
          .delete()
          .in("id", meetingsToDelete);

        if (deleteError) {
          throw new AppError(
            ErrorCode.INTERNAL_SERVER_ERROR,
            deleteError,
            "Failed to delete empty old meetings",
          );
        }

        logProduction("info", {
          action: "deleted_empty_old_rooms",
          count: meetingsToDelete.length,
          meetingIds: meetingsToDelete
        });
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error as Error,
        "Failed to delete empty old rooms",
      );
    }
  }

  /**
   * * Delete a meeting (only by facilitator)
   */
  static async deleteMeeting(meetingId: string, facilitatorId: string): Promise<void> {
    try {
      // First check if the user is the facilitator
      const { data: meeting, error: checkError } = await supabase
        .from("meetings")
        .select("facilitator_id")
        .eq("id", meetingId)
        .single();

      if (checkError) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          checkError,
          "Failed to verify meeting ownership",
        );
      }

      if (meeting.facilitator_id !== facilitatorId) {
        throw new AppError(
          ErrorCode.INSUFFICIENT_PERMISSIONS,
          undefined,
          "Only the meeting facilitator can delete this room",
        );
      }

      // Delete the meeting (this will cascade to participants and speaking queue)
      const { error: deleteError } = await supabase
        .from("meetings")
        .delete()
        .eq("id", meetingId);

      if (deleteError) {
        throw new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          deleteError,
          "Failed to delete meeting",
        );
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error as Error,
        "Failed to delete meeting",
      );
    }
  }
}

// Real-time subscription helpers
export class SupabaseRealtimeService {
  // Subscribe to meeting changes
  static subscribeToMeeting(
    meetingId: string,
    meetingCode: string,
    callbacks: {
      onParticipantsUpdated: (participants: Participant[]) => void;
      onQueueUpdated: (queue: QueueItem[]) => void;
      onMeetingTitleUpdated: (title: string) => void;
      onParticipantJoined: (participant: Participant) => void;
      onParticipantLeft: (participantId: string) => void;
      onNextSpeaker: (speaker: QueueItem) => void;
      onError: (error: Error | unknown) => void;
    },
  ) {
    const participantsChannel = supabase
      .channel(`meeting-${meetingId}-participants`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "participants",
          filter: `meeting_id=eq.${meetingId}`,
        },
        (payload) => {
          void (async () => {
            try {
              const meeting = await SupabaseMeetingService.getMeeting(meetingCode);
              if (meeting && callbacks.onParticipantsUpdated) {
                callbacks.onParticipantsUpdated(meeting.participants);

                if (payload.eventType === "INSERT" && callbacks.onParticipantJoined) {
                  callbacks.onParticipantJoined(
                    meeting.participants[meeting.participants.length - 1],
                  );
                } else if (payload.eventType === "DELETE" && callbacks.onParticipantLeft) {
                  callbacks.onParticipantLeft(payload.old.id);
                }
              }
            } catch (error) {
              if (callbacks.onError) {
                callbacks.onError(error);
              }
            }
          })();
        },
      );

    const queueChannel = supabase
      .channel(`meeting-${meetingId}-queue`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "speaking_queue",
          filter: `meeting_id=eq.${meetingId}`,
        },
        (_payload) => {
          void (async () => {
            try {
              const meeting = await SupabaseMeetingService.getMeeting(meetingId);
              if (meeting && callbacks.onQueueUpdated) {
                callbacks.onQueueUpdated(meeting.speakingQueue);
              }
            } catch (error) {
              if (callbacks.onError) {
                callbacks.onError(error);
              }
            }
          })();
        },
      );

    const meetingChannel = supabase
      .channel(`meeting-${meetingId}-meeting`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "meetings",
          filter: `id=eq.${meetingId}`,
        },
        (payload) => {
          void (async () => {
            try {
              if (payload.new.title !== payload.old.title && callbacks.onMeetingTitleUpdated) {
                callbacks.onMeetingTitleUpdated(payload.new.title);
              }
            } catch (error) {
              if (callbacks.onError) {
                callbacks.onError(error);
              }
            }
          })();
        },
      );

    // Subscribe to all channels
    void participantsChannel.subscribe();
    void queueChannel.subscribe();
    void meetingChannel.subscribe();

    // Return unsubscribe function
    return () => {
      void participantsChannel.unsubscribe();
      void queueChannel.unsubscribe();
      void meetingChannel.unsubscribe();
    };
  }
}

export default supabase;
