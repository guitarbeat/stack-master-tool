const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');

// Get meeting by code from Supabase
async function getMeeting(code) {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('meeting_code', code.toUpperCase())
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error getting meeting:', error);
      return null;
    }
    
    if (!data) return null;
    
    // Convert to expected format
    return {
      id: data.id,
      code: data.meeting_code,
      title: data.title,
      facilitator: data.facilitator_name,
      participants: [], // Will be populated by socket connections
      queue: [], // Will be populated by socket connections
      createdAt: data.created_at,
      isActive: data.is_active
    };
  } catch (err) {
    console.error('Error in getMeeting:', err);
    return null;
  }
}

// Get meeting info (public data only)
async function getMeetingInfo(code) {
  const meeting = await getMeeting(code);
  if (!meeting) return null;
  
  return {
    code: meeting.code,
    title: meeting.title,
    facilitator: meeting.facilitator,
    participantCount: meeting.participants.length,
    isActive: meeting.isActive
  };
}

// In-memory storage for active meeting sessions
const activeMeetings = new Map();

// Get or create active meeting session
async function getOrCreateActiveSession(meetingCode) {
  // Check if already in memory
  if (activeMeetings.has(meetingCode)) {
    return activeMeetings.get(meetingCode);
  }
  
  // Get from database
  const meeting = await getMeeting(meetingCode);
  if (!meeting) return null;
  
  // Create active session
  const activeSession = {
    ...meeting,
    participants: [],
    queue: []
  };
  
  activeMeetings.set(meetingCode, activeSession);
  return activeSession;
}

// Add participant to meeting
async function addParticipant(meetingCode, participant) {
  const meeting = await getOrCreateActiveSession(meetingCode);
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
async function removeParticipant(meetingCode, participantId) {
  const meeting = activeMeetings.get(meetingCode);
  if (!meeting) return null;
  
  const participantIndex = meeting.participants.findIndex(p => p.id === participantId);
  if (participantIndex === -1) return null;
  
  const participant = meeting.participants[participantIndex];
  meeting.participants.splice(participantIndex, 1);
  
  // Clean up empty meetings
  if (meeting.participants.length === 0) {
    activeMeetings.delete(meetingCode);
    console.log(`Meeting ${meetingCode} removed from active sessions (no participants)`);
  }
  
  return participant;
}

// Add to queue
async function addToQueue(meetingCode, queueItem) {
  const meeting = activeMeetings.get(meetingCode);
  if (!meeting) return null;
  
  // Check if already in queue
  const existingIndex = meeting.queue.findIndex(item => item.participantId === queueItem.participantId);
  if (existingIndex !== -1) return null;
  
  meeting.queue.push(queueItem);
  return queueItem;
}

// Remove from queue
async function removeFromQueue(meetingCode, participantId) {
  const meeting = activeMeetings.get(meetingCode);
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
async function getNextSpeaker(meetingCode) {
  const meeting = activeMeetings.get(meetingCode);
  if (!meeting || meeting.queue.length === 0) return null;
  
  const nextSpeaker = meeting.queue.shift();
  
  // Update positions for remaining queue items
  meeting.queue.forEach((item, index) => {
    item.position = index + 1;
  });
  
  return nextSpeaker;
}

// Update participant queue status
async function updateParticipantQueueStatus(meetingCode, participantId, isInQueue, queuePosition) {
  const meeting = activeMeetings.get(meetingCode);
  if (!meeting) return false;
  
  const participant = meeting.participants.find(p => p.id === participantId);
  if (!participant) return false;
  
  participant.isInQueue = isInQueue;
  participant.queuePosition = queuePosition;
  
  return true;
}

module.exports = {
  getMeeting,
  getMeetingInfo,
  addParticipant,
  removeParticipant,
  addToQueue,
  removeFromQueue,
  getNextSpeaker,
  updateParticipantQueueStatus
};