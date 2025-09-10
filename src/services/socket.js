import { io } from 'socket.io-client'
import apiService from './api.js'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.connecting = false
    this.listeners = new Map()
  }

  connect() {
    if (this.socket && this.isConnected) {
      return this.socket
    }

    if (this.connecting) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'))
        }, 10000)
        
        this.socket.once('connect', () => {
          clearTimeout(timeout)
          resolve(this.socket)
        })
        
        this.socket.once('error', (error) => {
          clearTimeout(timeout)
          reject(error)
        })
      })
    }

    this.connecting = true
    const socketUrl = apiService.getSocketUrl()
    console.log('Connecting to socket:', socketUrl)

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    })

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id)
      this.isConnected = true
      this.connecting = false
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      this.isConnected = false
      this.connecting = false
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
      this.connecting = false
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
  joinMeeting(meetingCode, participantName, isFacilitator = false) {
    if (!this.socket) {
      throw new Error('Socket not connected')
    }

    return new Promise((resolve, reject) => {
      let timeout: NodeJS.Timeout | null = null
      
      const cleanup = () => {
        if (timeout) {
          clearTimeout(timeout)
          timeout = null
        }
      }

      timeout = setTimeout(() => {
        cleanup()
        reject(new Error('Join meeting timeout'))
      }, 10000)

      this.socket.once('meeting-joined', (data) => {
        cleanup()
        resolve(data)
      })

      this.socket.once('error', (error) => {
        cleanup()
        reject(new Error(error.message || 'Failed to join meeting'))
      })

      this.socket.emit('join-meeting', {
        meetingCode: meetingCode.toUpperCase(),
        participantName,
        isFacilitator
      })
    })
  }

  // Queue operations
  joinQueue(type = 'speak') {
    if (!this.socket) {
      throw new Error('Socket not connected')
    }
    this.socket.emit('join-queue', { type })
  }

  leaveQueue() {
    if (!this.socket) {
      throw new Error('Socket not connected')
    }
    this.socket.emit('leave-queue')
  }

  // Facilitator operations
  nextSpeaker() {
    if (!this.socket) {
      throw new Error('Socket not connected')
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

