const express = require('express');
const meetingsService = require('../services/meetings');

const router = express.Router();

// Error response helper
const sendErrorResponse = (res, statusCode, errorCode, message, details = {}) => {
  res.status(statusCode).json({
    error: message,
    code: errorCode,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Create a new meeting
router.post('/meetings', (req, res) => {
  try {
    const { facilitatorName, meetingTitle } = req.body;
    
    // Validate required fields
    if (!facilitatorName || typeof facilitatorName !== 'string' || facilitatorName.trim().length === 0) {
      return sendErrorResponse(res, 400, 'INVALID_PARTICIPANT_NAME', 'Facilitator name is required');
    }
    
    if (!meetingTitle || typeof meetingTitle !== 'string' || meetingTitle.trim().length === 0) {
      return sendErrorResponse(res, 400, 'MISSING_REQUIRED_FIELD', 'Meeting title is required');
    }
    
    // Validate length constraints
    if (facilitatorName.trim().length > 50) {
      return sendErrorResponse(res, 400, 'INVALID_PARTICIPANT_NAME', 'Facilitator name must be 50 characters or less');
    }
    
    if (meetingTitle.trim().length > 100) {
      return sendErrorResponse(res, 400, 'MISSING_REQUIRED_FIELD', 'Meeting title must be 100 characters or less');
    }
    
    const meeting = meetingsService.createMeeting(facilitatorName.trim(), meetingTitle.trim());
    
    res.json({
      meetingCode: meeting.code,
      meetingId: meeting.id,
      facilitatorToken: meeting.facilitatorToken,
      shareUrl: `${req.protocol}://${req.get('host')}/join/${meeting.code}`
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    
    if (error.message && error.message.includes('already exists')) {
      return sendErrorResponse(res, 409, 'CONFLICT', 'Meeting code already exists, please try again');
    }
    
    sendErrorResponse(res, 500, 'INTERNAL_SERVER_ERROR', 'Failed to create meeting');
  }
});

// Get meeting info
router.get('/meetings/:code', (req, res) => {
  try {
    const { code } = req.params;
    
    // Validate meeting code format
    if (!code || typeof code !== 'string' || code.length !== 6) {
      return sendErrorResponse(res, 400, 'INVALID_MEETING_CODE', 'Meeting code must be 6 characters');
    }
    
    const meetingInfo = meetingsService.getMeetingInfo(code.toUpperCase());
    
    if (!meetingInfo) {
      return sendErrorResponse(res, 404, 'MEETING_NOT_FOUND', 'Meeting not found');
    }
    
    res.json(meetingInfo);
  } catch (error) {
    console.error('Error getting meeting:', error);
    sendErrorResponse(res, 500, 'INTERNAL_SERVER_ERROR', 'Failed to get meeting');
  }
});

// Validate facilitator token
router.post('/meetings/:code/validate-facilitator', (req, res) => {
  try {
    const { code } = req.params;
    const { facilitatorName, facilitatorToken } = req.body;
    
    // Validate meeting code format
    if (!code || typeof code !== 'string' || code.length !== 6) {
      return sendErrorResponse(res, 400, 'INVALID_MEETING_CODE', 'Meeting code must be 6 characters');
    }
    
    // Validate required fields
    if (!facilitatorName || typeof facilitatorName !== 'string' || facilitatorName.trim().length === 0) {
      return sendErrorResponse(res, 400, 'INVALID_PARTICIPANT_NAME', 'Facilitator name is required');
    }
    
    if (!facilitatorToken || typeof facilitatorToken !== 'string' || facilitatorToken.trim().length === 0) {
      return sendErrorResponse(res, 400, 'MISSING_FACILITATOR_TOKEN', 'Facilitator token is required');
    }
    
    const isValid = meetingsService.isFacilitator(code.toUpperCase(), facilitatorName.trim(), facilitatorToken.trim());
    
    if (!isValid) {
      return sendErrorResponse(res, 403, 'UNAUTHORIZED_FACILITATOR', 'Invalid facilitator credentials');
    }
    
    res.json({
      valid: true,
      meetingCode: code.toUpperCase(),
      facilitatorName: facilitatorName.trim()
    });
  } catch (error) {
    console.error('Error validating facilitator:', error);
    sendErrorResponse(res, 500, 'INTERNAL_SERVER_ERROR', 'Failed to validate facilitator');
  }
});

module.exports = router;