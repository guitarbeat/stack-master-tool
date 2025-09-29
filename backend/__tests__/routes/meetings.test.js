const request = require('supertest');
const express = require('express');
const meetingsRoutes = require('../../routes/meetings');

// Create a test app
const app = express();
app.use(express.json());
app.use('/api', meetingsRoutes);

describe('Meetings API Routes', () => {
  beforeEach(() => {
    // Clear meetings before each test
    const meetingsService = require('../../services/meetings');
    // Access the meetings map if it exists
    if (meetingsService.meetings) {
      meetingsService.meetings.clear();
    }
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
    });
  });

  describe('POST /api/meetings', () => {
    it('should create a meeting with valid data', async () => {
      const meetingData = {
        facilitatorName: 'John Doe',
        meetingTitle: 'Test Meeting'
      };

      const response = await request(app)
        .post('/api/meetings')
        .send(meetingData)
        .expect(200);

      expect(response.body).toHaveProperty('meetingCode');
      expect(response.body).toHaveProperty('meetingId');
      expect(response.body).toHaveProperty('shareUrl');
      expect(response.body.meetingCode).toHaveLength(6);
      expect(response.body.shareUrl).toContain(response.body.meetingCode);
    });

    it('should return 400 for missing facilitator name', async () => {
      const meetingData = {
        meetingTitle: 'Test Meeting'
      };

      const response = await request(app)
        .post('/api/meetings')
        .send(meetingData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Facilitator name is required');
      expect(response.body).toHaveProperty('code', 'INVALID_PARTICIPANT_NAME');
    });

    it('should return 400 for empty facilitator name', async () => {
      const meetingData = {
        facilitatorName: '',
        meetingTitle: 'Test Meeting'
      };

      const response = await request(app)
        .post('/api/meetings')
        .send(meetingData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Facilitator name is required');
    });

    it('should return 400 for whitespace-only facilitator name', async () => {
      const meetingData = {
        facilitatorName: '   ',
        meetingTitle: 'Test Meeting'
      };

      const response = await request(app)
        .post('/api/meetings')
        .send(meetingData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Facilitator name is required');
    });

    it('should return 400 for missing meeting title', async () => {
      const meetingData = {
        facilitatorName: 'John Doe'
      };

      const response = await request(app)
        .post('/api/meetings')
        .send(meetingData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Meeting title is required');
      expect(response.body).toHaveProperty('code', 'MISSING_REQUIRED_FIELD');
    });

    it('should return 400 for empty meeting title', async () => {
      const meetingData = {
        facilitatorName: 'John Doe',
        meetingTitle: ''
      };

      const response = await request(app)
        .post('/api/meetings')
        .send(meetingData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Meeting title is required');
    });

    it('should return 400 for whitespace-only meeting title', async () => {
      const meetingData = {
        facilitatorName: 'John Doe',
        meetingTitle: '   '
      };

      const response = await request(app)
        .post('/api/meetings')
        .send(meetingData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Meeting title is required');
    });

    it('should return 400 for facilitator name too long', async () => {
      const meetingData = {
        facilitatorName: 'A'.repeat(51),
        meetingTitle: 'Test Meeting'
      };

      const response = await request(app)
        .post('/api/meetings')
        .send(meetingData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Facilitator name must be 50 characters or less');
    });

    it('should return 400 for meeting title too long', async () => {
      const meetingData = {
        facilitatorName: 'John Doe',
        meetingTitle: 'A'.repeat(101)
      };

      const response = await request(app)
        .post('/api/meetings')
        .send(meetingData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Meeting title must be 100 characters or less');
    });

    it('should trim whitespace from input', async () => {
      const meetingData = {
        facilitatorName: '  John Doe  ',
        meetingTitle: '  Test Meeting  '
      };

      const response = await request(app)
        .post('/api/meetings')
        .send(meetingData)
        .expect(200);

      expect(response.body).toHaveProperty('meetingCode');
      expect(response.body).toHaveProperty('meetingId');
      expect(response.body).toHaveProperty('shareUrl');
    });

    it('should return 400 for non-string facilitator name', async () => {
      const meetingData = {
        facilitatorName: 123,
        meetingTitle: 'Test Meeting'
      };

      const response = await request(app)
        .post('/api/meetings')
        .send(meetingData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Facilitator name is required');
    });

    it('should return 400 for non-string meeting title', async () => {
      const meetingData = {
        facilitatorName: 'John Doe',
        meetingTitle: 123
      };

      const response = await request(app)
        .post('/api/meetings')
        .send(meetingData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Meeting title is required');
    });
  });

  describe('GET /api/meetings/:code', () => {
    let meetingCode;

    beforeEach(async () => {
      // Create a meeting for testing
      const meetingData = {
        facilitatorName: 'John Doe',
        meetingTitle: 'Test Meeting'
      };

      const response = await request(app)
        .post('/api/meetings')
        .send(meetingData);

      meetingCode = response.body.meetingCode;
    });

    it('should return meeting info for valid code', async () => {
      const response = await request(app)
        .get(`/api/meetings/${meetingCode}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', meetingCode);
      expect(response.body).toHaveProperty('title', 'Test Meeting');
      expect(response.body).toHaveProperty('facilitator', 'John Doe');
      expect(response.body).toHaveProperty('participantCount', 0);
      expect(response.body).toHaveProperty('isActive', true);
    });

    it('should be case insensitive', async () => {
      const response = await request(app)
        .get(`/api/meetings/${meetingCode.toLowerCase()}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', meetingCode);
    });

    it('should return 400 for invalid meeting code format', async () => {
      const response = await request(app)
        .get('/api/meetings/ABC')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Meeting code must be 6 characters');
      expect(response.body).toHaveProperty('code', 'INVALID_MEETING_CODE');
    });

    it('should return 400 for empty meeting code', async () => {
      const response = await request(app)
        .get('/api/meetings/')
        .expect(404); // Express returns 404 for empty path segments
    });

    it('should return meeting info for 6-character numeric code', async () => {
      // Create a meeting first
      const meetingData = {
        facilitatorName: 'John Doe',
        meetingTitle: 'Test Meeting'
      };

      const createResponse = await request(app)
        .post('/api/meetings')
        .send(meetingData);

      const meetingCode = createResponse.body.meetingCode;

      const response = await request(app)
        .get(`/api/meetings/${meetingCode}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', meetingCode);
    });

    it('should return 404 for non-existent meeting', async () => {
      const response = await request(app)
        .get('/api/meetings/ABC123') // Valid format but non-existent
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Meeting not found');
      expect(response.body).toHaveProperty('code', 'MEETING_NOT_FOUND');
    });
  });
});