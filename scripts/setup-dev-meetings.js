#!/usr/bin/env node

/**
 * Development helper script to set up test meetings
 * This creates the specific meeting code mentioned in the error (0CGW1M)
 * and other test meetings for development purposes
 */

import { createMeeting } from '../backend/services/meetings.js';

async function createDevMeetings() {
  console.log('🚀 Setting up development meetings...\n');
  
  // Create the specific meeting mentioned in the error
  const debugMeeting = createMeeting('Debug Facilitator', 'Debug Meeting - 0CGW1M');
  debugMeeting.code = '0CGW1M'; // Override to match the error case
  
  // Update the meetings map
  const meetings = (await import('../backend/services/meetings.js')).meetings;
  meetings.set('0CGW1M', debugMeeting);
  
  console.log('✅ Created debug meeting:');
  console.log(`   Code: ${debugMeeting.code}`);
  console.log(`   Title: ${debugMeeting.title}`);
  console.log(`   Facilitator: ${debugMeeting.facilitator}\n`);
  
  // Create additional test meetings
  const testMeetings = [
    { name: 'Alice Johnson', title: 'Team Standup' },
    { name: 'Bob Smith', title: 'Project Review' },
    { name: 'Carol Davis', title: 'Client Meeting' }
  ];
  
  testMeetings.forEach(({ name, title }) => {
    const meeting = createMeeting(name, title);
    console.log(`✅ Created test meeting: ${meeting.code} - ${title}`);
  });
  
  console.log(`\n📊 Total meetings available: ${meetings.size}`);
  console.log('🎯 Available meeting codes:', Array.from(meetings.keys()).join(', '));
  console.log('\n💡 You can now test with meeting code: 0CGW1M');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createDevMeetings();
}

export { createDevMeetings };