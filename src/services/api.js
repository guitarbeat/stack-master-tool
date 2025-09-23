import { AppError, ErrorCode, ErrorType, logError } from '../utils/errorHandling'
import { supabase } from '@/integrations/supabase/client'

class ApiService {
  constructor() {
    // No longer needed - using Supabase
  }

  async createMeeting(facilitatorName, meetingTitle) {
    try {
      // Validate input
      if (!facilitatorName || typeof facilitatorName !== 'string' || facilitatorName.trim().length === 0) {
        throw new AppError(ErrorCode.INVALID_PARTICIPANT_NAME, undefined, 'Facilitator name is required')
      }
      
      if (!meetingTitle || typeof meetingTitle !== 'string' || meetingTitle.trim().length === 0) {
        throw new AppError(ErrorCode.MISSING_REQUIRED_FIELD, undefined, 'Meeting title is required')
      }

      // Generate meeting code
      const { data: codeData, error: codeError } = await supabase.rpc('generate_meeting_code')
      
      if (codeError) {
        logError(codeError, 'generateMeetingCode')
        throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, codeError, 'Failed to generate meeting code')
      }

      // Create meeting in Supabase
      const { data, error } = await supabase
        .from('meetings')
        .insert({
          meeting_code: codeData,
          title: meetingTitle.trim(),
          facilitator_name: facilitatorName.trim(),
          facilitator_id: null // No auth yet
        })
        .select()
        .single()

      if (error) {
        logError(error, 'createMeeting')
        
        // Handle specific Supabase errors
        if (error.code === '23505') { // Unique constraint violation
          throw new AppError(ErrorCode.MEETING_CODE_EXISTS, error, 'Meeting code already exists')
        }
        
        throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error, 'Failed to create meeting')
      }

      return {
        meetingId: data.id,
        meetingCode: data.meeting_code,
        meetingTitle: data.title,
        facilitatorName: data.facilitator_name
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      
      logError(error, 'createMeeting')
      throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error, 'Failed to create meeting')
    }
  }

  async getMeeting(meetingCode) {
    try {
      // Validate meeting code
      if (!meetingCode || typeof meetingCode !== 'string' || meetingCode.length !== 6) {
        throw new AppError(ErrorCode.INVALID_MEETING_CODE, undefined, 'Meeting code must be 6 characters')
      }

      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('meeting_code', meetingCode.toUpperCase())
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          throw new AppError(ErrorCode.MEETING_NOT_FOUND, error, 'Meeting not found')
        }
        
        logError(error, 'getMeeting')
        throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error, 'Failed to get meeting')
      }

      return {
        meetingId: data.id,
        meetingCode: data.meeting_code,
        meetingTitle: data.title,
        facilitatorName: data.facilitator_name,
        createdAt: data.created_at
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      
      logError(error, 'getMeeting')
      throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error, 'Failed to get meeting')
    }
  }

  getJoinUrl(meetingCode) {
    return `${window.location.origin}/join?code=${meetingCode}`
  }

  getSocketUrl() {
    // Return the backend WebSocket URL based on environment
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:3000'
    }
    // For production, use the current origin (assuming backend is served from same domain)
    return window.location.origin
  }
}

export default new ApiService()

