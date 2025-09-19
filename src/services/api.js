import { AppError, ErrorCode, ErrorType, logError } from '../utils/errorHandling.js'

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL
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

      const response = await fetch(`${this.baseUrl}/api/meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facilitatorName: facilitatorName.trim(),
          meetingTitle: meetingTitle.trim()
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        switch (response.status) {
          case 400:
            throw new AppError(ErrorCode.VALIDATION, undefined, errorData.error || 'Invalid request data')
          case 500:
            throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, undefined, 'Server error occurred')
          case 503:
            throw new AppError(ErrorCode.SERVICE_UNAVAILABLE, undefined, 'Service temporarily unavailable')
          default:
            throw new AppError(ErrorCode.SERVER, undefined, `Server error: ${response.status}`)
        }
      }

      const data = await response.json()
      return data
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new AppError(ErrorCode.CONNECTION_FAILED, error, 'Unable to connect to server')
      }
      
      // Handle timeout errors
      if (error.name === 'AbortError') {
        throw new AppError(ErrorCode.NETWORK_TIMEOUT, error, 'Request timed out')
      }
      
      logError(error, 'createMeeting')
      throw new AppError(ErrorCode.UNKNOWN, error, 'Failed to create meeting')
    }
  }

  async getMeeting(meetingCode) {
    try {
      // Validate meeting code
      if (!meetingCode || typeof meetingCode !== 'string' || meetingCode.length !== 6) {
        throw new AppError(ErrorCode.INVALID_MEETING_CODE, undefined, 'Meeting code must be 6 characters')
      }

      const response = await fetch(`${this.baseUrl}/api/meetings/${meetingCode.toUpperCase()}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        switch (response.status) {
          case 404:
            throw new AppError(ErrorCode.MEETING_NOT_FOUND, undefined, errorData.error || 'Meeting not found')
          case 400:
            throw new AppError(ErrorCode.INVALID_MEETING_CODE, undefined, 'Invalid meeting code format')
          case 500:
            throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, undefined, 'Server error occurred')
          case 503:
            throw new AppError(ErrorCode.SERVICE_UNAVAILABLE, undefined, 'Service temporarily unavailable')
          default:
            throw new AppError(ErrorCode.SERVER, undefined, `Server error: ${response.status}`)
        }
      }

      const data = await response.json()
      return data
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new AppError(ErrorCode.CONNECTION_FAILED, error, 'Unable to connect to server')
      }
      
      // Handle timeout errors
      if (error.name === 'AbortError') {
        throw new AppError(ErrorCode.NETWORK_TIMEOUT, error, 'Request timed out')
      }
      
      logError(error, 'getMeeting')
      throw new AppError(ErrorCode.UNKNOWN, error, 'Failed to get meeting')
    }
  }

  getJoinUrl(meetingCode) {
    return `${this.baseUrl}/join/${meetingCode}`
  }

  getSocketUrl() {
    return this.baseUrl
  }
}

export default new ApiService()

