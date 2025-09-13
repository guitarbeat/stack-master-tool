// In-memory storage for participants
const participants = new Map();

// Add participant
function addParticipant(socketId, meetingCode, participant) {
  participants.set(socketId, { meetingCode: meetingCode.toUpperCase(), participant });
  return participant;
}

// Get participant by socket ID
function getParticipant(socketId) {
  return participants.get(socketId);
}

// Remove participant
function removeParticipant(socketId) {
  const participantData = participants.get(socketId);
  participants.delete(socketId);
  return participantData;
}

// Get all participants in a meeting
function getMeetingParticipants(meetingCode) {
  const meetingParticipants = [];
  for (const [socketId, data] of participants.entries()) {
    if (data.meetingCode === meetingCode.toUpperCase()) {
      meetingParticipants.push(data.participant);
    }
  }
  return meetingParticipants;
}

module.exports = {
  addParticipant,
  getParticipant,
  removeParticipant,
  getMeetingParticipants
};