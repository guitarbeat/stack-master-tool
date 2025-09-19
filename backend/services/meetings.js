const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// In-memory storage for meetings
const meetings = new Map();

// Generate a random 6-character meeting code
function generateMeetingCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate a secure facilitator token
function generateFacilitatorToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Create a new meeting
function createMeeting(facilitatorName, meetingTitle) {
  if (!facilitatorName || !meetingTitle) {
    throw new Error('Facilitator name and meeting title are required');
  }

  const meetingCode = generateMeetingCode();
  const meetingId = uuidv4();
  const facilitatorToken = generateFacilitatorToken();
  
  const meeting = {
    id: meetingId,
    code: meetingCode,
    title: meetingTitle,
    facilitator: facilitatorName,
    facilitatorToken: facilitatorToken,
    participants: [],
    queue: [],
    createdAt: new Date().toISOString(),
    isActive: true
  };
  
  meetings.set(meetingCode, meeting);
  
  console.log(`Meeting created: ${meetingCode} - ${meetingTitle} by ${facilitatorName}`);
  
  return meeting;
}

// Get meeting by code
function getMeeting(code) {
  return meetings.get(code.toUpperCase());
}

// Get meeting info (public data only)
function getMeetingInfo(code) {
  const meeting = getMeeting(code);
  if (!meeting) return null;
  
  return {
    code: meeting.code,
    title: meeting.title,
    facilitator: meeting.facilitator,
    participantCount: meeting.participants.length,
    isActive: meeting.isActive
  };
}

// Add participant to meeting
function addParticipant(meetingCode, participant) {
  const meeting = getMeeting(meetingCode);
  if (!meeting) return null;
  
  // Check for existing participant with same name and role
  const existingIndex = meeting.participants.findIndex(p => 
    p.name === participant.name && p.isFacilitator === participant.isFacilitator
  );
  
  if (existingIndex !== -1) {
    // Update existing participant
    meeting.participants[existingIndex] = {
      ...meeting.participants[existingIndex],
      id: participant.id,
      joinedAt: participant.joinedAt
    };
    return meeting.participants[existingIndex];
  } else {
    // Add new participant
    meeting.participants.push(participant);
    return participant;
  }
}

// Remove participant from meeting
function removeParticipant(meetingCode, participantId) {
  const meeting = getMeeting(meetingCode);
  if (!meeting) return null;
  
  const participantIndex = meeting.participants.findIndex(p => p.id === participantId);
  if (participantIndex === -1) return null;
  
  const participant = meeting.participants[participantIndex];
  meeting.participants.splice(participantIndex, 1);
  
  // Clean up empty meetings
  if (meeting.participants.length === 0) {
    meetings.delete(meetingCode);
    console.log(`Meeting ${meetingCode} deleted (no participants)`);
  }
  
  return participant;
}

// Add to queue
function addToQueue(meetingCode, queueItem) {
  const meeting = getMeeting(meetingCode);
  if (!meeting) return null;
  
  // Check if already in queue
  const existingIndex = meeting.queue.findIndex(item => item.participantId === queueItem.participantId);
  if (existingIndex !== -1) return null;
  
  meeting.queue.push(queueItem);
  return queueItem;
}

// Remove from queue
function removeFromQueue(meetingCode, participantId) {
  const meeting = getMeeting(meetingCode);
  if (!meeting) return null;
  
  const queueIndex = meeting.queue.findIndex(item => item.participantId === participantId);
  if (queueIndex === -1) return null;
  
  const queueItem = meeting.queue[queueIndex];
  meeting.queue.splice(queueIndex, 1);
  
  // Update positions for remaining queue items
  meeting.queue.forEach((item, index) => {
    item.position = index + 1;
  });
  
  return queueItem;
}

// Get next speaker
function getNextSpeaker(meetingCode) {
  const meeting = getMeeting(meetingCode);
  if (!meeting || meeting.queue.length === 0) return null;
  
  const nextSpeaker = meeting.queue.shift();
  
  // Update positions for remaining queue items
  meeting.queue.forEach((item, index) => {
    item.position = index + 1;
  });
  
  return nextSpeaker;
}

// Update participant queue status
function updateParticipantQueueStatus(meetingCode, participantId, isInQueue, queuePosition) {
  const meeting = getMeeting(meetingCode);
  if (!meeting) return false;
  
  const participant = meeting.participants.find(p => p.id === participantId);
  if (!participant) return false;
  
  participant.isInQueue = isInQueue;
  participant.queuePosition = queuePosition;
  
  return true;
}

// Validate facilitator token
function validateFacilitatorToken(meetingCode, facilitatorToken) {
  const meeting = getMeeting(meetingCode);
  if (!meeting) return false;
  
  return meeting.facilitatorToken === facilitatorToken;
}

// Get facilitator token for a meeting (for API responses)
function getFacilitatorToken(meetingCode) {
  const meeting = getMeeting(meetingCode);
  if (!meeting) return null;
  
  return meeting.facilitatorToken;
}

// Check if user is facilitator (by name and token)
function isFacilitator(meetingCode, facilitatorName, facilitatorToken) {
  const meeting = getMeeting(meetingCode);
  if (!meeting) return false;
  
  return meeting.facilitator === facilitatorName && 
         meeting.facilitatorToken === facilitatorToken;
}

module.exports = {
  createMeeting,
  getMeeting,
  getMeetingInfo,
  addParticipant,
  removeParticipant,
  addToQueue,
  removeFromQueue,
  getNextSpeaker,
  updateParticipantQueueStatus,
  validateFacilitatorToken,
  getFacilitatorToken,
  isFacilitator
};