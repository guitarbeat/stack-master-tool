const { v4: uuidv4 } = require('uuid');

// In-memory storage for testing
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

// Create a new meeting (synchronous version for testing)
function createMeeting(facilitatorName, meetingTitle) {
  if (!facilitatorName || !meetingTitle || facilitatorName.trim() === '' || meetingTitle.trim() === '') {
    throw new Error('Facilitator name and meeting title are required');
  }

  const meetingCode = generateMeetingCode();
  const meetingId = uuidv4();
  
  const meeting = {
    id: meetingId,
    code: meetingCode,
    title: meetingTitle.trim(),
    facilitator: facilitatorName.trim(),
    participants: [],
    queue: [],
    createdAt: new Date().toISOString(),
    isActive: true
  };

  meetings.set(meetingCode, meeting);
  return meeting;
}

// Create a new meeting (async version for production with Supabase)
async function createMeetingAsync(facilitatorName, meetingTitle) {
  if (!facilitatorName || !meetingTitle) {
    throw new Error('Facilitator name and meeting title are required');
  }

  const meetingCode = generateMeetingCode();
  const meetingId = uuidv4();
  
  try {
    // In test environment, use in-memory storage
    if (process.env.NODE_ENV === 'test') {
      return createMeeting(facilitatorName, meetingTitle);
    }

    // For now, use in-memory storage even in production due to Supabase key issues
    // TODO: Fix Supabase configuration
    console.log('Using in-memory storage due to Supabase configuration issues');
    return createMeeting(facilitatorName, meetingTitle);
  } catch (err) {
    console.error('Error in createMeetingAsync:', err);
    throw err;
  }
}

// Get meeting by code from in-memory storage or Supabase
async function getMeeting(code) {
  // In test environment, use in-memory storage
  if (process.env.NODE_ENV === 'test') {
    return meetings.get(code.toUpperCase()) || null;
  }

  try {
    // For now, use in-memory storage even in production due to Supabase key issues
    // TODO: Fix Supabase configuration
    console.log('Using in-memory storage due to Supabase configuration issues');
    return meetings.get(code.toUpperCase()) || null;
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
  // In test environment, use in-memory storage
  if (process.env.NODE_ENV === 'test') {
    const meeting = meetings.get(meetingCode.toUpperCase());
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

  // Production code with Supabase
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
  // In test environment, use in-memory storage
  if (process.env.NODE_ENV === 'test') {
    const meeting = meetings.get(meetingCode.toUpperCase());
    if (!meeting) return null;
    
    const participantIndex = meeting.participants.findIndex(p => p.id === participantId);
    if (participantIndex === -1) return null;
    
    const participant = meeting.participants[participantIndex];
    meeting.participants.splice(participantIndex, 1);
    
    // Clean up empty meetings
    if (meeting.participants.length === 0) {
      meetings.delete(meetingCode.toUpperCase());
      console.log(`Meeting ${meetingCode} removed from active sessions (no participants)`);
    }
    
    return participant;
  }

  // Production code
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

// Add to queue with race condition protection
async function addToQueue(meetingCode, queueItem) {
  // In test environment, use in-memory storage
  if (process.env.NODE_ENV === 'test') {
    const meeting = meetings.get(meetingCode.toUpperCase());
    if (!meeting) return null;
    
    // Use atomic check-and-add to prevent race conditions
    const existingIndex = meeting.queue.findIndex(item => item.participantId === queueItem.participantId);
    if (existingIndex !== -1) {
      console.log(`Participant ${queueItem.participantName} already in queue for meeting ${meetingCode}`);
      return null; // Already in queue
    }
    
    // Add to queue and update position atomically
    meeting.queue.push(queueItem);
    queueItem.position = meeting.queue.length;
    
    console.log(`Added ${queueItem.participantName} to queue for meeting ${meetingCode} at position ${queueItem.position}`);
    return queueItem;
  }

  // Production code
  const meeting = activeMeetings.get(meetingCode);
  if (!meeting) return null;
  
  // Use atomic check-and-add to prevent race conditions
  const existingIndex = meeting.queue.findIndex(item => item.participantId === queueItem.participantId);
  if (existingIndex !== -1) {
    console.log(`Participant ${queueItem.participantName} already in queue for meeting ${meetingCode}`);
    return null; // Already in queue
  }
  
  // Add to queue and update position atomically
  meeting.queue.push(queueItem);
  queueItem.position = meeting.queue.length;
  
  console.log(`Added ${queueItem.participantName} to queue for meeting ${meetingCode} at position ${queueItem.position}`);
  return queueItem;
}

// Remove from queue
async function removeFromQueue(meetingCode, participantId) {
  // In test environment, use in-memory storage
  if (process.env.NODE_ENV === 'test') {
    const meeting = meetings.get(meetingCode.toUpperCase());
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

  // Production code
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
  // In test environment, use in-memory storage
  if (process.env.NODE_ENV === 'test') {
    const meeting = meetings.get(meetingCode.toUpperCase());
    if (!meeting || meeting.queue.length === 0) return null;
    
    const nextSpeaker = meeting.queue.shift();
    
    // Update positions for remaining queue items
    meeting.queue.forEach((item, index) => {
      item.position = index + 1;
    });
    
    return nextSpeaker;
  }

  // Production code
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
  // In test environment, use in-memory storage
  if (process.env.NODE_ENV === 'test') {
    const meeting = meetings.get(meetingCode.toUpperCase());
    if (!meeting) return false;
    
    const participant = meeting.participants.find(p => p.id === participantId);
    if (!participant) return false;
    
    participant.isInQueue = isInQueue;
    participant.queuePosition = queuePosition;
    
    return true;
  }

  // Production code
  const meeting = activeMeetings.get(meetingCode);
  if (!meeting) return false;
  
  const participant = meeting.participants.find(p => p.id === participantId);
  if (!participant) return false;
  
  participant.isInQueue = isInQueue;
  participant.queuePosition = queuePosition;
  
  return true;
}

// Synchronous wrappers for testing
const getMeetingSync = (code) => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Sync functions only available in test mode');
  }
  return meetings.get(code.toUpperCase()) || null;
};

const getMeetingInfoSync = (code) => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Sync functions only available in test mode');
  }
  const meeting = getMeetingSync(code);
  if (!meeting) return null;
  
  return {
    code: meeting.code,
    title: meeting.title,
    facilitator: meeting.facilitator,
    participantCount: meeting.participants.length,
    isActive: meeting.isActive
  };
};

const addParticipantSync = (meetingCode, participant) => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Sync functions only available in test mode');
  }
  const meeting = meetings.get(meetingCode.toUpperCase());
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
};

const removeParticipantSync = (meetingCode, participantId) => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Sync functions only available in test mode');
  }
  const meeting = meetings.get(meetingCode.toUpperCase());
  if (!meeting) return null;
  
  const participantIndex = meeting.participants.findIndex(p => p.id === participantId);
  if (participantIndex === -1) return null;
  
  const participant = meeting.participants[participantIndex];
  meeting.participants.splice(participantIndex, 1);
  
  // Clean up empty meetings
  if (meeting.participants.length === 0) {
    meetings.delete(meetingCode.toUpperCase());
    console.log(`Meeting ${meetingCode} removed from active sessions (no participants)`);
  }
  
  return participant;
};

const addToQueueSync = (meetingCode, queueItem) => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Sync functions only available in test mode');
  }
  const meeting = meetings.get(meetingCode.toUpperCase());
  if (!meeting) return null;
  
  // Use atomic check-and-add to prevent race conditions
  const existingIndex = meeting.queue.findIndex(item => item.participantId === queueItem.participantId);
  if (existingIndex !== -1) {
    console.log(`Participant ${queueItem.participantName} already in queue for meeting ${meetingCode}`);
    return null; // Already in queue
  }
  
  // Add to queue and update position atomically
  meeting.queue.push(queueItem);
  queueItem.position = meeting.queue.length;
  
  console.log(`Added ${queueItem.participantName} to queue for meeting ${meetingCode} at position ${queueItem.position}`);
  return queueItem;
};

const removeFromQueueSync = (meetingCode, participantId) => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Sync functions only available in test mode');
  }
  const meeting = meetings.get(meetingCode.toUpperCase());
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
};

const getNextSpeakerSync = (meetingCode) => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Sync functions only available in test mode');
  }
  const meeting = meetings.get(meetingCode.toUpperCase());
  if (!meeting || meeting.queue.length === 0) return null;
  
  const nextSpeaker = meeting.queue.shift();
  
  // Update positions for remaining queue items
  meeting.queue.forEach((item, index) => {
    item.position = index + 1;
  });
  
  return nextSpeaker;
};

const updateParticipantQueueStatusSync = (meetingCode, participantId, isInQueue, queuePosition) => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Sync functions only available in test mode');
  }
  const meeting = meetings.get(meetingCode.toUpperCase());
  if (!meeting) return false;
  
  const participant = meeting.participants.find(p => p.id === participantId);
  if (!participant) return false;
  
  participant.isInQueue = isInQueue;
  participant.queuePosition = queuePosition;
  
  return true;
};

// Update meeting title (facilitator only)
async function updateMeetingTitle(meetingCode, newTitle, facilitatorName) {
  try {
    const meeting = await getOrCreateActiveSession(meetingCode);
    if (!meeting) return null;
    
    // Verify facilitator authorization
    if (meeting.facilitator !== facilitatorName) {
      return { error: 'UNAUTHORIZED', message: 'Only the meeting facilitator can update the title' };
    }
    
    // Update title in memory
    meeting.title = newTitle;
    
    // Update in database if not in test mode
    if (process.env.NODE_ENV !== 'test') {
      const supabase = require('../config/supabase');
      
      const { error } = await supabase
        .from('meetings')
        .update({ title: newTitle })
        .eq('meeting_code', meetingCode)
        .eq('is_active', true);
      
      if (error) {
        console.error('Error updating meeting title in Supabase:', error);
        return { error: 'DATABASE_ERROR', message: 'Failed to update meeting title' };
      }
    }
    
    return { meeting };
  } catch (err) {
    console.error('Error in updateMeetingTitle:', err);
    return { error: 'INTERNAL_ERROR', message: 'Failed to update meeting title' };
  }
}

// Update participant name (facilitator only)
async function updateParticipantName(meetingCode, participantId, newName, facilitatorName) {
  try {
    const meeting = await getOrCreateActiveSession(meetingCode);
    if (!meeting) return null;
    
    // Verify facilitator authorization
    if (meeting.facilitator !== facilitatorName) {
      return { error: 'UNAUTHORIZED', message: 'Only the meeting facilitator can update participant names' };
    }
    
    // Find participant
    const participant = meeting.participants.find(p => p.id === participantId);
    if (!participant) {
      return { error: 'PARTICIPANT_NOT_FOUND', message: 'Participant not found' };
    }
    
    // Update participant name in memory
    const oldName = participant.name;
    participant.name = newName;
    
    // Update name in queue if participant is in queue
    const queueItem = meeting.queue.find(item => item.participantId === participantId);
    if (queueItem) {
      queueItem.participantName = newName;
    }
    
    console.log(`Updated participant name from "${oldName}" to "${newName}" in meeting ${meetingCode}`);
    
    return { participant };
  } catch (err) {
    console.error('Error in updateParticipantName:', err);
    return { error: 'INTERNAL_ERROR', message: 'Failed to update participant name' };
  }
}

module.exports = {
  createMeeting,
  createMeetingAsync,
  getMeeting,
  getMeetingInfo,
  addParticipant,
  removeParticipant,
  addToQueue,
  removeFromQueue,
  getNextSpeaker,
  updateParticipantQueueStatus,
  updateMeetingTitle,
  updateParticipantName,
  // Sync versions for testing
  getMeetingSync,
  getMeetingInfoSync,
  addParticipantSync,
  removeParticipantSync,
  addToQueueSync,
  removeFromQueueSync,
  getNextSpeakerSync,
  updateParticipantQueueStatusSync,
  meetings // Export for testing
};