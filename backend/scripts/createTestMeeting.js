/**
 * Script to create a test meeting for development purposes
 * This helps test the meeting connection functionality
 */

const meetingsService = require('../services/meetings');

async function createTestMeeting() {
  try {
    console.log('Creating test meeting...');
    
    const meeting = meetingsService.createMeeting('Test Facilitator', 'Test Meeting for Development');
    
    console.log('Test meeting created successfully!');
    console.log('Meeting Code:', meeting.code);
    console.log('Meeting Title:', meeting.title);
    console.log('Facilitator:', meeting.facilitator);
    console.log('Meeting ID:', meeting.id);
    
    // Also create the specific meeting code mentioned in the error
    const specificMeeting = meetingsService.createMeeting('Debug Facilitator', 'Debug Meeting - 0CGW1M');
    // Override the code to match the error case
    specificMeeting.code = '0CGW1M';
    
    // Update the meetings map with the specific code
    const meetings = meetingsService.meetings;
    meetings.set('0CGW1M', specificMeeting);
    
    console.log('\nSpecific test meeting created:');
    console.log('Meeting Code: 0CGW1M');
    console.log('Meeting Title:', specificMeeting.title);
    console.log('Facilitator:', specificMeeting.facilitator);
    
    console.log('\nTotal meetings in memory:', meetings.size);
    console.log('Available meeting codes:', Array.from(meetings.keys()));
    
  } catch (error) {
    console.error('Error creating test meeting:', error);
  }
}

// Run the script
createTestMeeting();