import { supabase } from '@/integrations/supabase/client'
import { AppError, ErrorCode, logError } from '../utils/errorHandling'

class MeetingService {
  constructor() {
    this.currentMeetingId = null
    this.currentParticipantId = null
    this.channels = new Map()
  }

  // Join a meeting and set up real-time subscriptions
  async joinMeeting(meetingCode, participantName, isFacilitator = false) {
    try {
      // Validate input
      if (!meetingCode || typeof meetingCode !== 'string' || meetingCode.length !== 6) {
        throw new AppError(ErrorCode.INVALID_MEETING_CODE, undefined, 'Meeting code must be 6 characters')
      }

      if (!participantName || typeof participantName !== 'string' || participantName.trim().length === 0) {
        throw new AppError(ErrorCode.INVALID_PARTICIPANT_NAME, undefined, 'Participant name is required')
      }

      // Get meeting
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .select('*')
        .eq('meeting_code', meetingCode.toUpperCase())
        .eq('is_active', true)
        .single()

      if (meetingError) {
        if (meetingError.code === 'PGRST116') {
          throw new AppError(ErrorCode.MEETING_NOT_FOUND, meetingError, 'Meeting not found')
        }
        throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, meetingError, 'Failed to find meeting')
      }

      // Check if participant already exists in this meeting
      const { data: existingParticipant } = await supabase
        .from('participants')
        .select('*')
        .eq('meeting_id', meeting.id)
        .eq('name', participantName.trim())
        .eq('is_active', true)
        .single()

      let participantId
      if (existingParticipant) {
        participantId = existingParticipant.id
      } else {
        // Add participant to meeting
        const { data: participant, error: participantError } = await supabase
          .from('participants')
          .insert({
            meeting_id: meeting.id,
            name: participantName.trim(),
            is_facilitator: isFacilitator,
            user_id: null // No auth yet
          })
          .select()
          .single()

        if (participantError) {
          throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, participantError, 'Failed to join meeting')
        }
        participantId = participant.id
      }

      this.currentMeetingId = meeting.id
      this.currentParticipantId = participantId

      return {
        meetingId: meeting.id,
        meetingCode: meeting.meeting_code,
        meetingTitle: meeting.title,
        facilitatorName: meeting.facilitator_name,
        participantId,
        isFacilitator
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      
      logError(error, 'joinMeeting')
      throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error, 'Failed to join meeting')
    }
  }

  // Subscribe to real-time updates for a meeting
  subscribeToMeetingUpdates(meetingId, callbacks = {}) {
    const channelName = `meeting_${meetingId}`
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)
    }

    const channel = supabase.channel(channelName)

    // Subscribe to participants changes
    if (callbacks.onParticipantsUpdated) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `meeting_id=eq.${meetingId}`
        },
        (payload) => {
          this.handleParticipantsChange(payload, callbacks.onParticipantsUpdated)
        }
      )
    }

    // Subscribe to queue changes
    if (callbacks.onQueueUpdated) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'speaking_queue',
          filter: `meeting_id=eq.${meetingId}`
        },
        (payload) => {
          this.handleQueueChange(payload, callbacks.onQueueUpdated)
        }
      )
    }

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed to meeting updates:', meetingId)
      }
    })

    this.channels.set(channelName, channel)
    return channel
  }

  async handleParticipantsChange(payload, callback) {
    try {
      // Get updated participants list
      const { data: participants, error } = await supabase
        .from('participants')
        .select('*')
        .eq('meeting_id', this.currentMeetingId)
        .eq('is_active', true)
        .order('joined_at')

      if (!error && participants) {
        callback(participants)
      }
    } catch (error) {
      logError(error, 'handleParticipantsChange')
    }
  }

  async handleQueueChange(payload, callback) {
    try {
      // Get updated queue
      const { data: queue, error } = await supabase
        .from('speaking_queue')
        .select(`
          *,
          participants!inner(name, is_facilitator)
        `)
        .eq('meeting_id', this.currentMeetingId)
        .order('position')

      if (!error && queue) {
        callback(queue)
      }
    } catch (error) {
      logError(error, 'handleQueueChange')
    }
  }

  // Queue operations
  async joinQueue(type = 'speak') {
    if (!this.currentMeetingId || !this.currentParticipantId) {
      throw new AppError(ErrorCode.NOT_IN_MEETING, undefined, 'Not in a meeting')
    }

    try {
      // Check if already in queue
      const { data: existing } = await supabase
        .from('speaking_queue')
        .select('*')
        .eq('meeting_id', this.currentMeetingId)
        .eq('participant_id', this.currentParticipantId)
        .single()

      if (existing) {
        throw new AppError(ErrorCode.ALREADY_IN_QUEUE, undefined, 'Already in queue')
      }

      // Get next position
      const { data: maxPos } = await supabase
        .from('speaking_queue')
        .select('position')
        .eq('meeting_id', this.currentMeetingId)
        .order('position', { ascending: false })
        .limit(1)
        .single()

      const nextPosition = maxPos ? maxPos.position + 1 : 1

      // Add to queue
      const { error } = await supabase
        .from('speaking_queue')
        .insert({
          meeting_id: this.currentMeetingId,
          participant_id: this.currentParticipantId,
          queue_type: type,
          position: nextPosition
        })

      if (error) {
        throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error, 'Failed to join queue')
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      
      logError(error, 'joinQueue')
      throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error, 'Failed to join queue')
    }
  }

  async leaveQueue() {
    if (!this.currentMeetingId || !this.currentParticipantId) {
      throw new AppError(ErrorCode.NOT_IN_MEETING, undefined, 'Not in a meeting')
    }

    try {
      const { error } = await supabase
        .from('speaking_queue')
        .delete()
        .eq('meeting_id', this.currentMeetingId)
        .eq('participant_id', this.currentParticipantId)

      if (error) {
        throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error, 'Failed to leave queue')
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      
      logError(error, 'leaveQueue')
      throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error, 'Failed to leave queue')
    }
  }

  // Facilitator operations
  async nextSpeaker() {
    if (!this.currentMeetingId) {
      throw new AppError(ErrorCode.NOT_IN_MEETING, undefined, 'Not in a meeting')
    }

    try {
      // Get current speaker and mark as not speaking
      await supabase
        .from('speaking_queue')
        .update({ is_speaking: false })
        .eq('meeting_id', this.currentMeetingId)
        .eq('is_speaking', true)

      // Get next person in queue
      const { data: nextSpeaker, error } = await supabase
        .from('speaking_queue')
        .select('*')
        .eq('meeting_id', this.currentMeetingId)
        .order('position')
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error, 'Failed to get next speaker')
      }

      if (nextSpeaker) {
        // Mark as speaking and remove from queue
        await supabase
          .from('speaking_queue')
          .update({ is_speaking: true })
          .eq('id', nextSpeaker.id)

        // Remove from queue after a short delay to allow UI updates
        setTimeout(async () => {
          await supabase
            .from('speaking_queue')
            .delete()
            .eq('id', nextSpeaker.id)
        }, 1000)
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      
      logError(error, 'nextSpeaker')
      throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error, 'Failed to advance to next speaker')
    }
  }

  // Get current state
  async getParticipants() {
    if (!this.currentMeetingId) {
      return []
    }

    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('meeting_id', this.currentMeetingId)
      .eq('is_active', true)
      .order('joined_at')

    return error ? [] : data
  }

  async getQueue() {
    if (!this.currentMeetingId) {
      return []
    }

    const { data, error } = await supabase
      .from('speaking_queue')
      .select(`
        *,
        participants!inner(name, is_facilitator)
      `)
      .eq('meeting_id', this.currentMeetingId)
      .order('position')

    return error ? [] : data
  }

  // Cleanup
  unsubscribeAll() {
    this.channels.forEach((channel, channelName) => {
      supabase.removeChannel(channel)
    })
    this.channels.clear()
    this.currentMeetingId = null
    this.currentParticipantId = null
  }
}

export default new MeetingService()