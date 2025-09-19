const {
  createMeeting,
  getMeeting,
  getMeetingInfo,
  addParticipant,
  removeParticipant,
  addToQueue,
  removeFromQueue,
  getNextSpeaker,
  updateParticipantQueueStatus
} = require('../../services/meetings');

describe('Meetings Service', () => {
  beforeEach(() => {
    // Clear meetings map before each test
    const meetings = require('../../services/meetings').meetings || new Map();
    meetings.clear();
  });

  describe('createMeeting', () => {
    it('should create a meeting with valid data', () => {
      const meeting = createMeeting('John Doe', 'Test Meeting');
      
      expect(meeting).toHaveProperty('id');
      expect(meeting).toHaveProperty('code');
      expect(meeting).toHaveProperty('title', 'Test Meeting');
      expect(meeting).toHaveProperty('facilitator', 'John Doe');
      expect(meeting).toHaveProperty('participants', []);
      expect(meeting).toHaveProperty('queue', []);
      expect(meeting).toHaveProperty('createdAt');
      expect(meeting).toHaveProperty('isActive', true);
      expect(meeting.code).toHaveLength(6);
    });

    it('should throw error for missing facilitator name', () => {
      expect(() => createMeeting('', 'Test Meeting')).toThrow('Facilitator name and meeting title are required');
      expect(() => createMeeting(null, 'Test Meeting')).toThrow('Facilitator name and meeting title are required');
      expect(() => createMeeting(undefined, 'Test Meeting')).toThrow('Facilitator name and meeting title are required');
    });

    it('should throw error for missing meeting title', () => {
      expect(() => createMeeting('John Doe', '')).toThrow('Facilitator name and meeting title are required');
      expect(() => createMeeting('John Doe', null)).toThrow('Facilitator name and meeting title are required');
      expect(() => createMeeting('John Doe', undefined)).toThrow('Facilitator name and meeting title are required');
    });

    it('should generate unique meeting codes', () => {
      const meeting1 = createMeeting('John Doe', 'Test Meeting 1');
      const meeting2 = createMeeting('Jane Doe', 'Test Meeting 2');
      
      expect(meeting1.code).not.toBe(meeting2.code);
    });
  });

  describe('getMeeting', () => {
    it('should return meeting by code', () => {
      const meeting = createMeeting('John Doe', 'Test Meeting');
      const retrieved = getMeeting(meeting.code);
      
      expect(retrieved).toEqual(meeting);
    });

    it('should return null for non-existent meeting', () => {
      const retrieved = getMeeting('NONEXISTENT');
      expect(retrieved).toBeNull();
    });

    it('should be case insensitive', () => {
      const meeting = createMeeting('John Doe', 'Test Meeting');
      const retrieved = getMeeting(meeting.code.toLowerCase());
      
      expect(retrieved).toEqual(meeting);
    });
  });

  describe('getMeetingInfo', () => {
    it('should return public meeting info', () => {
      const meeting = createMeeting('John Doe', 'Test Meeting');
      const info = getMeetingInfo(meeting.code);
      
      expect(info).toEqual({
        code: meeting.code,
        title: meeting.title,
        facilitator: meeting.facilitator,
        participantCount: 0,
        isActive: true
      });
    });

    it('should return null for non-existent meeting', () => {
      const info = getMeetingInfo('NONEXISTENT');
      expect(info).toBeNull();
    });
  });

  describe('addParticipant', () => {
    it('should add new participant to meeting', () => {
      const meeting = createMeeting('John Doe', 'Test Meeting');
      const participant = {
        id: 'participant-1',
        name: 'Jane Doe',
        isFacilitator: false,
        joinedAt: new Date().toISOString()
      };
      
      const result = addParticipant(meeting.code, participant);
      
      expect(result).toEqual(participant);
      expect(meeting.participants).toContain(participant);
    });

    it('should update existing participant with same name and role', () => {
      const meeting = createMeeting('John Doe', 'Test Meeting');
      const participant1 = {
        id: 'participant-1',
        name: 'Jane Doe',
        isFacilitator: false,
        joinedAt: new Date().toISOString()
      };
      
      const participant2 = {
        id: 'participant-2',
        name: 'Jane Doe',
        isFacilitator: false,
        joinedAt: new Date().toISOString()
      };
      
      addParticipant(meeting.code, participant1);
      const result = addParticipant(meeting.code, participant2);
      
      expect(result).toEqual(participant2);
      expect(meeting.participants).toHaveLength(1);
      expect(meeting.participants[0]).toEqual(participant2);
    });

    it('should return null for non-existent meeting', () => {
      const participant = {
        id: 'participant-1',
        name: 'Jane Doe',
        isFacilitator: false,
        joinedAt: new Date().toISOString()
      };
      
      const result = addParticipant('NONEXISTENT', participant);
      expect(result).toBeNull();
    });
  });

  describe('removeParticipant', () => {
    it('should remove participant from meeting', () => {
      const meeting = createMeeting('John Doe', 'Test Meeting');
      const participant = {
        id: 'participant-1',
        name: 'Jane Doe',
        isFacilitator: false,
        joinedAt: new Date().toISOString()
      };
      
      addParticipant(meeting.code, participant);
      const result = removeParticipant(meeting.code, 'participant-1');
      
      expect(result).toEqual(participant);
      expect(meeting.participants).not.toContain(participant);
    });

    it('should delete meeting when no participants remain', () => {
      const meeting = createMeeting('John Doe', 'Test Meeting');
      const participant = {
        id: 'participant-1',
        name: 'Jane Doe',
        isFacilitator: false,
        joinedAt: new Date().toISOString()
      };
      
      addParticipant(meeting.code, participant);
      removeParticipant(meeting.code, 'participant-1');
      
      const retrieved = getMeeting(meeting.code);
      expect(retrieved).toBeNull();
    });

    it('should return null for non-existent participant', () => {
      const meeting = createMeeting('John Doe', 'Test Meeting');
      const result = removeParticipant(meeting.code, 'non-existent');
      
      expect(result).toBeNull();
    });

    it('should return null for non-existent meeting', () => {
      const result = removeParticipant('NONEXISTENT', 'participant-1');
      expect(result).toBeNull();
    });
  });

  describe('addToQueue', () => {
    it('should add participant to queue', () => {
      const meeting = createMeeting('John Doe', 'Test Meeting');
      const queueItem = {
        participantId: 'participant-1',
        participantName: 'Jane Doe',
        position: 1
      };
      
      const result = addToQueue(meeting.code, queueItem);
      
      expect(result).toEqual(queueItem);
      expect(meeting.queue).toContain(queueItem);
    });

    it('should not add duplicate participant to queue', () => {
      const meeting = createMeeting('John Doe', 'Test Meeting');
      const queueItem = {
        participantId: 'participant-1',
        participantName: 'Jane Doe',
        position: 1
      };
      
      addToQueue(meeting.code, queueItem);
      const result = addToQueue(meeting.code, queueItem);
      
      expect(result).toBeNull();
      expect(meeting.queue).toHaveLength(1);
    });

    it('should return null for non-existent meeting', () => {
      const queueItem = {
        participantId: 'participant-1',
        participantName: 'Jane Doe',
        position: 1
      };
      
      const result = addToQueue('NONEXISTENT', queueItem);
      expect(result).toBeNull();
    });
  });

  describe('removeFromQueue', () => {
    it('should remove participant from queue', () => {
      const meeting = createMeeting('John Doe', 'Test Meeting');
      const queueItem = {
        participantId: 'participant-1',
        participantName: 'Jane Doe',
        position: 1
      };
      
      addToQueue(meeting.code, queueItem);
      const result = removeFromQueue(meeting.code, 'participant-1');
      
      expect(result).toEqual(queueItem);
      expect(meeting.queue).not.toContain(queueItem);
    });

    it('should update positions after removal', () => {
      const meeting = createMeeting('John Doe', 'Test Meeting');
      const queueItem1 = {
        participantId: 'participant-1',
        participantName: 'Jane Doe',
        position: 1
      };
      const queueItem2 = {
        participantId: 'participant-2',
        participantName: 'Bob Smith',
        position: 2
      };
      
      addToQueue(meeting.code, queueItem1);
      addToQueue(meeting.code, queueItem2);
      removeFromQueue(meeting.code, 'participant-1');
      
      expect(meeting.queue).toHaveLength(1);
      expect(meeting.queue[0].position).toBe(1);
    });

    it('should return null for non-existent participant', () => {
      const meeting = createMeeting('John Doe', 'Test Meeting');
      const result = removeFromQueue(meeting.code, 'non-existent');
      
      expect(result).toBeNull();
    });

    it('should return null for non-existent meeting', () => {
      const result = removeFromQueue('NONEXISTENT', 'participant-1');
      expect(result).toBeNull();
    });
  });

  describe('getNextSpeaker', () => {
    it('should return next speaker from queue', () => {
      const meeting = createMeeting('John Doe', 'Test Meeting');
      const queueItem = {
        participantId: 'participant-1',
        participantName: 'Jane Doe',
        position: 1
      };
      
      addToQueue(meeting.code, queueItem);
      const result = getNextSpeaker(meeting.code);
      
      expect(result).toEqual(queueItem);
      expect(meeting.queue).not.toContain(queueItem);
    });

    it('should update positions after getting next speaker', () => {
      const meeting = createMeeting('John Doe', 'Test Meeting');
      const queueItem1 = {
        participantId: 'participant-1',
        participantName: 'Jane Doe',
        position: 1
      };
      const queueItem2 = {
        participantId: 'participant-2',
        participantName: 'Bob Smith',
        position: 2
      };
      
      addToQueue(meeting.code, queueItem1);
      addToQueue(meeting.code, queueItem2);
      getNextSpeaker(meeting.code);
      
      expect(meeting.queue).toHaveLength(1);
      expect(meeting.queue[0].position).toBe(1);
    });

    it('should return null for empty queue', () => {
      const meeting = createMeeting('John Doe', 'Test Meeting');
      const result = getNextSpeaker(meeting.code);
      
      expect(result).toBeNull();
    });

    it('should return null for non-existent meeting', () => {
      const result = getNextSpeaker('NONEXISTENT');
      expect(result).toBeNull();
    });
  });

  describe('updateParticipantQueueStatus', () => {
    it('should update participant queue status', () => {
      const meeting = createMeeting('John Doe', 'Test Meeting');
      const participant = {
        id: 'participant-1',
        name: 'Jane Doe',
        isFacilitator: false,
        joinedAt: new Date().toISOString()
      };
      
      addParticipant(meeting.code, participant);
      const result = updateParticipantQueueStatus(meeting.code, 'participant-1', true, 1);
      
      expect(result).toBe(true);
      expect(participant.isInQueue).toBe(true);
      expect(participant.queuePosition).toBe(1);
    });

    it('should return false for non-existent participant', () => {
      const meeting = createMeeting('John Doe', 'Test Meeting');
      const result = updateParticipantQueueStatus(meeting.code, 'non-existent', true, 1);
      
      expect(result).toBe(false);
    });

    it('should return false for non-existent meeting', () => {
      const result = updateParticipantQueueStatus('NONEXISTENT', 'participant-1', true, 1);
      expect(result).toBe(false);
    });
  });
});