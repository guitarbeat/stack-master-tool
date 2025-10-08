import { createClient } from '@supabase/supabase-js';
import { AppError, ErrorCode } from '../utils/errorHandling';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

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

// Meeting operations
export class SupabaseMeetingService {
  // Create a new meeting
  static async createMeeting(title: string, facilitatorName: string): Promise<MeetingData> {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .insert({
          title: title.trim(),
          facilitator_name: facilitatorName.trim(),
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error, 'Failed to create meeting');
      }

      return {
        id: data.id,
        code: data.meeting_code,
        title: data.title,
        facilitator: data.facilitator_name,
        createdAt: data.created_at,
        isActive: data.is_active,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error as Error, 'Failed to create meeting');
    }
  }

  // Get meeting by code
  static async getMeeting(code: string): Promise<MeetingWithParticipants | null> {
    try {
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .select('*')
        .eq('meeting_code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (meetingError || !meeting) {
        return null;
      }

      // Get participants
      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .eq('meeting_id', meeting.id)
        .eq('is_active', true)
        .order('joined_at', { ascending: true });

      if (participantsError) {
        throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, participantsError, 'Failed to fetch participants');
      }

      // Get speaking queue
      const { data: queue, error: queueError } = await supabase
        .from('speaking_queue')
        .select(`
          *,
          participants!inner(name)
        `)
        .eq('meeting_id', meeting.id)
        .order('position', { ascending: true });

      if (queueError) {
        throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, queueError, 'Failed to fetch speaking queue');
      }

      return {
        id: meeting.id,
        code: meeting.meeting_code,
        title: meeting.title,
        facilitator: meeting.facilitator_name,
        createdAt: meeting.created_at,
        isActive: meeting.is_active,
        participants: participants.map(p => ({
          id: p.id,
          name: p.name,
          isFacilitator: p.is_facilitator,
          hasRaisedHand: false, // Not implemented yet
          joinedAt: p.joined_at,
          isActive: p.is_active,
        })),
        speakingQueue: queue.map(q => ({
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
      throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error as Error, 'Failed to fetch meeting');
    }
  }

  // Join meeting as participant
  static async joinMeeting(meetingCode: string, participantName: string, isFacilitator: boolean = false): Promise<Participant> {
    try {
      // First, get the meeting
      const meeting = await this.getMeeting(meetingCode);
      if (!meeting) {
        throw new AppError(ErrorCode.MEETING_NOT_FOUND, undefined, 'Meeting not found');
      }

      // Check if facilitator authorization is required
      if (isFacilitator && meeting.facilitator !== participantName) {
        throw new AppError(ErrorCode.UNAUTHORIZED_FACILITATOR, undefined, 'Only the meeting creator can join as facilitator');
      }

      // Create participant
      const { data, error } = await supabase
        .from('participants')
        .insert({
          meeting_id: meeting.id,
          name: participantName.trim(),
          is_facilitator: isFacilitator,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error, 'Failed to join meeting');
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
      throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error as Error, 'Failed to join meeting');
    }
  }

  // Join speaking queue
  static async joinQueue(meetingId: string, participantId: string, queueType: string = 'speak'): Promise<QueueItem> {
    try {
      // Get current queue to determine position
      const { data: currentQueue, error: queueError } = await supabase
        .from('speaking_queue')
        .select('position')
        .eq('meeting_id', meetingId)
        .order('position', { ascending: false })
        .limit(1);

      if (queueError) {
        throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, queueError, 'Failed to fetch queue');
      }

      const nextPosition = currentQueue.length > 0 ? currentQueue[0].position + 1 : 1;

      // Get participant name
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .select('name')
        .eq('id', participantId)
        .single();

      if (participantError || !participant) {
        throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, participantError, 'Participant not found');
      }

      // Add to queue
      const { data, error } = await supabase
        .from('speaking_queue')
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
        throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error, 'Failed to join queue');
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
      throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error as Error, 'Failed to join queue');
    }
  }

  // Leave speaking queue
  static async leaveQueue(meetingId: string, participantId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('speaking_queue')
        .delete()
        .eq('meeting_id', meetingId)
        .eq('participant_id', participantId);

      if (error) {
        throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error, 'Failed to leave queue');
      }

      // Reorder remaining queue positions
      await this.reorderQueue(meetingId);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error as Error, 'Failed to leave queue');
    }
  }

  // Move to next speaker (facilitator only)
  static async nextSpeaker(meetingId: string): Promise<QueueItem | null> {
    try {
      // Get current queue
      const { data: queue, error: queueError } = await supabase
        .from('speaking_queue')
        .select(`
          *,
          participants!inner(name)
        `)
        .eq('meeting_id', meetingId)
        .order('position', { ascending: true });

      if (queueError) {
        throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, queueError, 'Failed to fetch queue');
      }

      if (queue.length === 0) {
        return null;
      }

      // Remove first speaker
      const nextSpeaker = queue[0];
      const { error: deleteError } = await supabase
        .from('speaking_queue')
        .delete()
        .eq('id', nextSpeaker.id);

      if (deleteError) {
        throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, deleteError, 'Failed to remove speaker');
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
      throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error as Error, 'Failed to move to next speaker');
    }
  }

  // Update meeting title (facilitator only)
  static async updateMeetingTitle(meetingId: string, newTitle: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('meetings')
        .update({ title: newTitle.trim() })
        .eq('id', meetingId);

      if (error) {
        throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error, 'Failed to update meeting title');
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error as Error, 'Failed to update meeting title');
    }
  }

  // Update participant name (facilitator only)
  static async updateParticipantName(participantId: string, newName: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('participants')
        .update({ name: newName.trim() })
        .eq('id', participantId);

      if (error) {
        throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error, 'Failed to update participant name');
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error as Error, 'Failed to update participant name');
    }
  }

  // Helper: Reorder queue positions
  private static async reorderQueue(meetingId: string): Promise<void> {
    try {
      const { data: queue, error: queueError } = await supabase
        .from('speaking_queue')
        .select('id, position')
        .eq('meeting_id', meetingId)
        .order('position', { ascending: true });

      if (queueError) {
        throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, queueError, 'Failed to fetch queue for reordering');
      }

      // Update positions sequentially
      for (let i = 0; i < queue.length; i++) {
        const { error } = await supabase
          .from('speaking_queue')
          .update({ position: i + 1 })
          .eq('id', queue[i].id);

        if (error) {
          throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error, 'Failed to reorder queue');
        }
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error as Error, 'Failed to reorder queue');
    }
  }
}

// Real-time subscription helpers
export class SupabaseRealtimeService {
  // Subscribe to meeting changes
  static subscribeToMeeting(meetingId: string, callbacks: {
    onParticipantsUpdated: (participants: Participant[]) => void;
    onQueueUpdated: (queue: QueueItem[]) => void;
    onMeetingTitleUpdated: (title: string) => void;
    onParticipantJoined: (participant: Participant) => void;
    onParticipantLeft: (participantId: string) => void;
    onNextSpeaker: (speaker: QueueItem) => void;
    onError: (error: any) => void;
  }) {
    const participantsChannel = supabase
      .channel(`meeting-${meetingId}-participants`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `meeting_id=eq.${meetingId}`,
        },
        async (payload) => {
          try {
            const meeting = await SupabaseMeetingService.getMeeting(meetingId);
            if (meeting) {
              callbacks.onParticipantsUpdated(meeting.participants);
              
              if (payload.eventType === 'INSERT') {
                callbacks.onParticipantJoined(meeting.participants[meeting.participants.length - 1]);
              } else if (payload.eventType === 'DELETE') {
                callbacks.onParticipantLeft(payload.old.id);
              }
            }
          } catch (error) {
            callbacks.onError(error);
          }
        }
      );

    const queueChannel = supabase
      .channel(`meeting-${meetingId}-queue`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'speaking_queue',
          filter: `meeting_id=eq.${meetingId}`,
        },
        async (_payload) => {
          try {
            const meeting = await SupabaseMeetingService.getMeeting(meetingId);
            if (meeting) {
              callbacks.onQueueUpdated(meeting.speakingQueue);
            }
          } catch (error) {
            callbacks.onError(error);
          }
        }
      );

    const meetingChannel = supabase
      .channel(`meeting-${meetingId}-meeting`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'meetings',
          filter: `id=eq.${meetingId}`,
        },
        async (payload) => {
          try {
            if (payload.new.title !== payload.old.title) {
              callbacks.onMeetingTitleUpdated(payload.new.title);
            }
          } catch (error) {
            callbacks.onError(error);
          }
        }
      );

    // Subscribe to all channels
    participantsChannel.subscribe();
    queueChannel.subscribe();
    meetingChannel.subscribe();

    // Return unsubscribe function
    return () => {
      participantsChannel.unsubscribe();
      queueChannel.unsubscribe();
      meetingChannel.unsubscribe();
    };
  }
}

export default supabase;