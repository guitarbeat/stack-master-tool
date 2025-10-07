# Remote Meeting Troubleshooting Guide

## Common Issues & Solutions

### Issue: "Meeting Not Found" Error

**Symptoms:**
- Participants get "Meeting Not Found" when trying to join
- Meeting code appears valid but connection fails
- Error occurs even with correct meeting code

**Root Cause:**
The Express backend uses in-memory storage. When Render restarts the backend server (which happens periodically), all meeting data is lost.

**Immediate Solutions:**
1. **Recreate the meeting** - Have the facilitator create a new meeting
2. **Check meeting status** - Verify the meeting is still active in the facilitator view
3. **Try a different meeting code** - Create a fresh meeting

**Permanent Solutions:**
- Complete Supabase migration (recommended)
- Add PostgreSQL to Express backend

### Issue: Connection Timeouts

**Symptoms:**
- Long loading times when joining meetings
- "Connection timeout" errors
- Participants stuck on loading screen

**Root Cause:**
Socket.io connections to the Express backend are unstable or the backend is overloaded.

**Immediate Solutions:**
1. **Refresh the page** - Often resolves temporary connection issues
2. **Check internet connection** - Ensure stable network connectivity
3. **Try a different browser** - Some browsers handle WebSocket connections better
4. **Disable VPN** - VPNs can interfere with WebSocket connections

**Permanent Solutions:**
- Migrate to Supabase (more reliable real-time connections)
- Optimize Express backend performance

### Issue: "Failed to Get Meeting" Error

**Symptoms:**
- Error message: "Failed to get meeting data"
- Participants can't see meeting details
- Meeting appears to exist but data is missing

**Root Cause:**
The meeting exists in the database but the backend can't retrieve it due to:
- Database connection issues
- Corrupted meeting data
- Backend server problems

**Immediate Solutions:**
1. **Recreate the meeting** - Start fresh with a new meeting
2. **Check facilitator view** - Ensure the meeting is properly created
3. **Wait and retry** - Sometimes temporary backend issues resolve themselves

**Permanent Solutions:**
- Complete Supabase migration (better error handling)
- Add proper error logging and monitoring

### Issue: Real-time Updates Not Working

**Symptoms:**
- Participants don't see queue updates in real-time
- Speaking order changes aren't reflected immediately
- Need to refresh to see changes

**Root Cause:**
Socket.io connections are dropping or not properly established.

**Immediate Solutions:**
1. **Refresh the page** - Re-establishes the connection
2. **Check browser console** - Look for WebSocket errors
3. **Disable browser extensions** - Some extensions block WebSocket connections

**Permanent Solutions:**
- Migrate to Supabase (more reliable real-time subscriptions)
- Implement connection retry logic

## Diagnostic Steps

### For Facilitators

1. **Check Meeting Status**
   - Go to your facilitator view
   - Verify the meeting is still active
   - Check if participants are showing up

2. **Test Local vs Remote**
   - Try creating a local meeting (code: "MANUAL")
   - If local works but remote doesn't, it's a backend issue

3. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for error messages in the Console tab
   - Check the Network tab for failed requests

### For Participants

1. **Verify Meeting Code**
   - Double-check the 6-digit code
   - Ensure no extra spaces or characters
   - Try typing it manually instead of copy-paste

2. **Test Connection**
   - Try joining from a different device
   - Test with a different internet connection
   - Try a different browser

3. **Check Error Messages**
   - Note the exact error message
   - Check if it's a network, timeout, or meeting-specific error

## Quick Fixes

### Temporary Workarounds

1. **Use Local Meetings**
   - For small groups, use meeting code "MANUAL"
   - This bypasses the backend entirely
   - Works reliably but only for local participants

2. **Frequent Meeting Recreation**
   - Create new meetings every 30-60 minutes
   - This reduces the chance of hitting restart issues
   - Not ideal but works as a temporary solution

3. **Refresh Strategy**
   - Refresh the page if you notice issues
   - This re-establishes connections
   - Quick fix for temporary connection problems

## Long-term Solutions

### Option 1: Complete Supabase Migration (Recommended)
- **Timeline:** 2-3 development sessions
- **Benefits:** Eliminates backend issues entirely
- **Cost:** Reduces hosting costs

### Option 2: Add Database to Express Backend
- **Timeline:** 1 development session
- **Benefits:** Quick fix, keeps existing architecture
- **Cost:** Adds database hosting costs

### Option 3: Switch to Different Backend Service
- **Timeline:** 2-4 development sessions
- **Benefits:** More reliable than current setup
- **Cost:** Depends on chosen service

## Support Information

### When to Contact Support
- Multiple participants experiencing the same issue
- Error persists after trying all troubleshooting steps
- Meeting data appears corrupted or lost

### Information to Provide
- Meeting code (if applicable)
- Error messages (exact text)
- Browser and version
- Steps to reproduce the issue
- Screenshots of error screens

### Emergency Workarounds
- Use local meetings for critical sessions
- Have participants refresh their browsers
- Recreate meetings if data is lost
- Use alternative communication methods as backup