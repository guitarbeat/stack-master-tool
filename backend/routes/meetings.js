const express = require('express');
const meetingsService = require('../services/meetings');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create a new meeting
router.post('/meetings', (req, res) => {
  try {
    const { facilitatorName, meetingTitle } = req.body;
    const meeting = meetingsService.createMeeting(facilitatorName, meetingTitle);
    
    res.json({
      meetingCode: meeting.code,
      meetingId: meeting.id,
      shareUrl: `${req.protocol}://${req.get('host')}/join/${meeting.code}`
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get meeting info
router.get('/meetings/:code', (req, res) => {
  const { code } = req.params;
  const meetingInfo = meetingsService.getMeetingInfo(code);
  
  if (!meetingInfo) {
    return res.status(404).json({ error: 'Meeting not found' });
  }
  
  res.json(meetingInfo);
});

module.exports = router;