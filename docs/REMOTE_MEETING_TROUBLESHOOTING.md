# Remote Meeting Connection Troubleshooting

## Problem: "Not Found" and 404 Errors

If you're experiencing "not found" or 404 errors when trying to connect to remote meetings, this guide will help you diagnose and resolve the issue.

## Root Cause

The application currently uses a **hybrid architecture**:
- **Frontend**: React app running on Vite dev server (port 5173)
- **Backend**: Express.js + Socket.io server (port 3001)
- **Database**: Supabase (remote)

Remote meetings require the **backend server** to be running because:
1. Meeting creation and joining use the Express API (`/api/meetings`)
2. Real-time updates use Socket.io WebSocket connections
3. Meetings are stored **in-memory** on the backend server

## Common Issues

### Issue 1: Backend Server Not Running

**Symptoms:**
- "Failed to get meeting" errors
- 404 errors when joining meetings
- "Unable to connect to server" messages

**Solution:**
```bash
# Terminal 1: Start the backend server
cd backend
npm install
npm run dev

# You should see:
# > Server listening on port 3001
```

**Verification:**
- Backend should be accessible at `http://localhost:3001`
- Test with: `curl http://localhost:3001/api/meetings` (should return 404, not connection error)

### Issue 2: Backend Server Restarted

**Symptoms:**
- Meeting code worked before, but now shows "not found"
- Meeting was created, but can't be joined

**Root Cause:**
The backend uses **in-memory storage**, so all meetings are lost when the server restarts.

**Solution:**
1. Create a new meeting after restarting the backend
2. Use the new meeting code

**Temporary Workaround:**
```bash
# Create test meetings for development
npm run setup-dev
# This creates meeting code "0CGW1M" and others
```

### Issue 3: Port Conflicts

**Symptoms:**
- Backend won't start
- "EADDRINUSE" error

**Solution:**
```bash
# Check what's using port 3001
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill the process or change the port in backend/.env
PORT=3002  # backend/.env
```

### Issue 4: CORS Errors

**Symptoms:**
- "CORS policy" errors in browser console
- Frontend can't connect to backend

**Solution:**
The backend is configured for `http://localhost:5173`. If you're using a different port, update:

```javascript
// backend/server.js
const corsOptions = {
  origin: 'http://localhost:5173',  // Update this if needed
  // ...
};
```

## Checking Backend Status

### 1. Verify Backend is Running
```bash
# Should show backend process
ps aux | grep "node.*backend"
```

### 2. Test API Endpoint
```bash
# Should return JSON (not connection error)
curl http://localhost:3001/api/meetings/TEST12
```

### 3. Check Network Requests in Browser
1. Open DevTools (F12)
2. Go to Network tab
3. Try joining a meeting
4. Look for failed requests to `localhost:3001`

## Long-term Solution: Supabase Migration

The application is migrating to **Supabase Edge Functions** to eliminate the need for a separate backend server. This will:

✅ Provide persistent storage (meetings won't be lost on restart)
✅ Simplify deployment (single deployment target)
✅ Improve reliability (no separate server to manage)

**Migration Status:**
- ✅ HOST view: Migrated to Supabase
- ❌ JOIN view: Still uses Express/Socket.io
- ❌ WATCH view: Still uses Express/Socket.io

Until migration is complete, you must run the backend server for remote meetings.

## Quick Start Checklist

When starting development:

- [ ] Start backend server: `cd backend && npm run dev`
- [ ] Start frontend: `npm run dev`
- [ ] Verify backend accessible: `curl http://localhost:3001`
- [ ] Create a new meeting for testing
- [ ] Keep backend running while testing remote meetings

## Production Deployment

For production, you need to:

1. Deploy backend to a hosting service (Render, Heroku, etc.)
2. Update frontend API URL in `src/services/api.js`
3. Configure environment variables
4. Ensure backend is always running

**Recommended**: Complete Supabase migration before production deployment.

## Getting Help

If issues persist:

1. Check console logs in both frontend and backend
2. Verify meeting codes are valid (6 alphanumeric characters)
3. Test with a fresh meeting code
4. Clear browser cache and cookies
5. Restart both frontend and backend servers

## Related Documentation

- [Meeting Connection Error Fix](./MEETING_CONNECTION_ERROR_FIX.md)
- [Development Guide](./DEVELOPMENT.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [TODO List](../todo.md) - Migration status

---

_Last Updated: 2025-01-28_
