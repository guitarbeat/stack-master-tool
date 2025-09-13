const { v4: uuidv4 } = require('uuid');
const meetingsService = require('../services/meetings');
const participantsService = require('../services/participants');

// Join a meeting
function handleJoinMeeting(socket, data) {
  const { meetingCode, participantName, isFacilitator = false } = data;
  
  // Validate input data
  if (!meetingCode || typeof meetingCode !== 'string') {
    socket.emit('error', { message: 'Meeting code is required' });
    return;
  }
  
  if (!participantName || typeof participantName !== 'string' || participantName.trim().length === 0) {
    socket.emit('error', { message: 'Participant name is required' });
    return;
  }
  
  // Sanitize participant name
  const sanitizedName = participantName.trim().substring(0, 50); // Limit length
  
  const meeting = meetingsService.getMeeting(meetingCode);
  
  if (!meeting) {
    socket.emit('error', { message: 'Meeting not found' });
    return;
  }
  
  // Verify facilitator access - only the original facilitator can join as facilitator
  if (isFacilitator && sanitizedName !== meeting.facilitator) {
    console.log(`Unauthorized facilitator attempt: ${sanitizedName} tried to join meeting ${meetingCode} as facilitator (actual facilitator: ${meeting.facilitator})`);
    socket.emit('error', { message: 'Only the meeting creator can join as facilitator' });
    return;
  }
  
  // Prevent duplicate joins from the same socket
  const existingParticipant = participantsService.getParticipant(socket.id);
  if (existingParticipant) {
    const existingMeeting = meetingsService.getMeeting(existingParticipant.meetingCode);
    if (existingMeeting) {
      // Already joined; just re-emit joined event for idempotency
      socket.emit('meeting-joined', {
        meeting: {
          code: existingMeeting.code,
          title: existingMeeting.title,
          facilitator: existingMeeting.facilitator
        },
        participant: existingParticipant.participant,
        queue: existingMeeting.queue,
        participants: existingMeeting.participants
      });
      return;
    }
  }

  const participant = {
    id: socket.id,
    name: sanitizedName,
    isFacilitator,
    joinedAt: new Date().toISOString(),
    isInQueue: false,
    queuePosition: null
  };

  const addedParticipant = meetingsService.addParticipant(meetingCode, participant);
  participantsService.addParticipant(socket.id, meetingCode, addedParticipant);
  
  // Join the meeting room
  socket.join(meetingCode.toUpperCase());
  
  console.log(`${sanitizedName} joined meeting ${meetingCode} as ${isFacilitator ? 'facilitator' : 'participant'}`);
  
  // Send meeting info to the participant
  socket.emit('meeting-joined', {
    meeting: {
      code: meeting.code,
      title: meeting.title,
      facilitator: meeting.facilitator
    },
    participant: addedParticipant,
    queue: meeting.queue,
    participants: meeting.participants
  });
  
  return { meeting, participant: addedParticipant };
}

// Join speaking queue
function handleJoinQueue(socket, data) {
  const { type = 'speak' } = data; // 'speak', 'direct-response', 'point-of-info', 'clarification'
  const participantData = participantsService.getParticipant(socket.id);
  
  if (!participantData) {
    socket.emit('error', { message: 'Not in a meeting' });
    return;
  }
  
  // Validate queue type
  const validTypes = ['speak', 'direct-response', 'point-of-info', 'clarification'];
  if (!validTypes.includes(type)) {
    socket.emit('error', { message: 'Invalid queue type' });
    return;
  }
  
  const { meetingCode, participant } = participantData;
  const meeting = meetingsService.getMeeting(meetingCode);
  
  if (!meeting) {
    socket.emit('error', { message: 'Meeting not found' });
    return;
  }
  
  const queueItem = {
    id: uuidv4(),
    participantId: socket.id,
    participantName: participant.name,
    type,
    timestamp: new Date().toISOString(),
    position: meeting.queue.length + 1
  };
  
  const addedQueueItem = meetingsService.addToQueue(meetingCode, queueItem);
  if (!addedQueueItem) {
    socket.emit('error', { message: 'Already in queue' });
    return;
  }
  
  meetingsService.updateParticipantQueueStatus(meetingCode, socket.id, true, meeting.queue.length);
  
  console.log(`${participant.name} joined queue for ${type} in meeting ${meetingCode}`);
  
  return { meeting, queueItem: addedQueueItem };
}

// Leave speaking queue
function handleLeaveQueue(socket) {
  const participantData = participantsService.getParticipant(socket.id);
  
  if (!participantData) {
    socket.emit('error', { message: 'Not in a meeting' });
    return;
  }
  
  const { meetingCode, participant } = participantData;
  const meeting = meetingsService.getMeeting(meetingCode);
  
  if (!meeting) {
    socket.emit('error', { message: 'Meeting not found' });
    return;
  }
  
  const removedQueueItem = meetingsService.removeFromQueue(meetingCode, socket.id);
  if (removedQueueItem) {
    meetingsService.updateParticipantQueueStatus(meetingCode, socket.id, false, null);
    console.log(`${participant.name} left queue in meeting ${meetingCode}`);
  }
  
  return { meeting, removedQueueItem };
}

// Next speaker (facilitator only)
function handleNextSpeaker(socket) {
  const participantData = participantsService.getParticipant(socket.id);
  
  if (!participantData) {
    socket.emit('error', { message: 'Not in a meeting' });
    return;
  }
  
  const { meetingCode, participant } = participantData;
  const meeting = meetingsService.getMeeting(meetingCode);
  
  if (!meeting || !participant.isFacilitator) {
    socket.emit('error', { message: 'Not authorized' });
    return;
  }
  
  const nextSpeaker = meetingsService.getNextSpeaker(meetingCode);
  if (!nextSpeaker) {
    socket.emit('error', { message: 'Queue is empty' });
    return;
  }
  
  // Update participant status
  meetingsService.updateParticipantQueueStatus(meetingCode, nextSpeaker.participantId, false, null);
  
  console.log(`Next speaker: ${nextSpeaker.participantName} in meeting ${meetingCode}`);
  
  return { meeting, nextSpeaker };
}

// Handle disconnection
function handleDisconnect(socket) {
  console.log('User disconnected:', socket.id);
  
  const participantData = participantsService.getParticipant(socket.id);
  if (participantData) {
    const { meetingCode, participant } = participantData;
    const meeting = meetingsService.getMeeting(meetingCode);
    
    if (meeting) {
      // Remove from participants
      meetingsService.removeParticipant(meetingCode, socket.id);
      
      // Remove from queue if present
      meetingsService.removeFromQueue(meetingCode, socket.id);
      
      console.log(`${participant.name} left meeting ${meetingCode}`);
      
      return { meeting, participant };
    }
    
    participantsService.removeParticipant(socket.id);
  }
  
  return null;
}

module.exports = {
  handleJoinMeeting,
  handleJoinQueue,
  handleLeaveQueue,
  handleNextSpeaker,
  handleDisconnect
};