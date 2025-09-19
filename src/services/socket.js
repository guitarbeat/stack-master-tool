import { io } from 'socket.io-client'
import apiService from './api.js'
import { AppError, ErrorCode, logError } from '../utils/errorHandling.js'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.connecting = false
    this.listeners = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
  }

  connect() {
    if (this.socket && this.isConnected) {
      return this.socket
    }

    if (this.connecting) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new AppError(ErrorCode.SOCKET_TIMEOUT, undefined, 'Socket connection timeout'))
        }, 10000)
        
        this.socket.once('connect', () => {
          clearTimeout(timeout)
          resolve(this.socket)
        })
        
        this.socket.once('error', (error) => {
          clearTimeout(timeout)
          reject(new AppError(ErrorCode.CONNECTION_FAILED, error, 'Socket connection failed'))
        })
      })
    }

    this.connecting = true
    const socketUrl = apiService.getSocketUrl()
    console.log('Connecting to socket:', socketUrl)

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay
    })

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id)
      this.isConnected = true
      this.connecting = false
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      this.isConnected = false
      this.connecting = false
      
      // Handle different disconnect reasons
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect
        this.socket.disconnect()
      } else if (reason === 'io client disconnect') {
        // Client initiated disconnect, don't reconnect
        this.socket.disconnect()
      }
      // For other reasons (network issues), let socket.io handle reconnection
    })

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts')
      this.isConnected = true
      this.connecting = false
      this.reconnectAttempts = 0
    })

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket reconnection attempt', attemptNumber)
      this.reconnectAttempts = attemptNumber
    })

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error)
      logError(error, 'socketReconnect')
    })

    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed after', this.maxReconnectAttempts, 'attempts')
      this.isConnected = false
      this.connecting = false
      this.reconnectAttempts = 0
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
      this.connecting = false
      logError(error, 'socketError')
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.connecting = false
    }
  }

  // Meeting operations
  joinMeeting(meetingCode, participantName, isFacilitator = false, facilitatorToken = null) {
    if (!this.socket) {
      throw new AppError(ErrorCode.CONNECTION_FAILED, undefined, 'Socket not connected')
    }

    // Validate input
    if (!meetingCode || typeof meetingCode !== 'string' || meetingCode.length !== 6) {
      throw new AppError(ErrorCode.INVALID_MEETING_CODE, undefined, 'Meeting code must be 6 characters')
    }

    if (!participantName || typeof participantName !== 'string' || participantName.trim().length === 0) {
      throw new AppError(ErrorCode.INVALID_PARTICIPANT_NAME, undefined, 'Participant name is required')
    }

    if (participantName.trim().length > 50) {
      throw new AppError(ErrorCode.INVALID_PARTICIPANT_NAME, undefined, 'Participant name must be 50 characters or less')
    }

    return new Promise((resolve, reject) => {
      let timeout = null
      
      const cleanup = () => {
        if (timeout) {
          clearTimeout(timeout)
          timeout = null
        }
      }

      timeout = setTimeout(() => {
        cleanup()
        reject(new AppError(ErrorCode.JOIN_TIMEOUT, undefined, 'Join meeting timeout'))
      }, 10000)

      this.socket.once('meeting-joined', (data) => {
        cleanup()
        resolve(data)
      })

      this.socket.once('error', (error) => {
        cleanup()
        
        // Map server error messages to specific error codes
        let errorCode = ErrorCode.UNKNOWN
        if (error.message === 'Meeting not found') {
          errorCode = ErrorCode.MEETING_NOT_FOUND
        } else if (error.message === 'Only the meeting creator can join as facilitator') {
          errorCode = ErrorCode.UNAUTHORIZED_FACILITATOR
        } else if (error.message === 'Participant name is required') {
          errorCode = ErrorCode.INVALID_PARTICIPANT_NAME
        } else if (error.message === 'Meeting code is required') {
          errorCode = ErrorCode.INVALID_MEETING_CODE
        }
        
        reject(new AppError(errorCode, error, error.message || 'Failed to join meeting'))
      })

      this.socket.emit('join-meeting', {
        meetingCode: meetingCode.toUpperCase(),
        participantName: participantName.trim(),
        isFacilitator,
        facilitatorToken
      })
    })
  }

  // Queue operations
  joinQueue(type = 'speak') {
    if (!this.socket) {
      throw new AppError(ErrorCode.CONNECTION_FAILED, undefined, 'Socket not connected')
    }

    // Validate queue type
    const validTypes = ['speak', 'direct-response', 'point-of-info', 'clarification']
    if (!validTypes.includes(type)) {
      throw new AppError(ErrorCode.INVALID_QUEUE_TYPE, undefined, 'Invalid queue type')
    }

    this.socket.emit('join-queue', { type })
  }

  leaveQueue() {
    if (!this.socket) {
      throw new AppError(ErrorCode.CONNECTION_FAILED, undefined, 'Socket not connected')
    }
    this.socket.emit('leave-queue')
  }

  // Facilitator operations
  nextSpeaker() {
    if (!this.socket) {
      throw new AppError(ErrorCode.CONNECTION_FAILED, undefined, 'Socket not connected')
    }
    this.socket.emit('next-speaker')
  }

  // Event listeners
  onQueueUpdated(callback) {
    if (!this.socket) return
    this.socket.on('queue-updated', callback)
  }

  onParticipantsUpdated(callback) {
    if (!this.socket) return
    this.socket.on('participants-updated', callback)
  }

  onParticipantJoined(callback) {
    if (!this.socket) return
    this.socket.on('participant-joined', callback)
  }

  onParticipantLeft(callback) {
    if (!this.socket) return
    this.socket.on('participant-left', callback)
  }

  onNextSpeaker(callback) {
    if (!this.socket) return
    this.socket.on('next-speaker', callback)
  }

  onError(callback) {
    if (!this.socket) return
    this.socket.on('error', callback)
  }

  // Remove listeners
  off(event, callback) {
    if (!this.socket) return
    this.socket.off(event, callback)
  }

  removeAllListeners() {
    if (!this.socket) return
    this.socket.removeAllListeners()
  }
}

export default new SocketService()

