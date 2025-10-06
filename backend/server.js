const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

// Import services and handlers
const meetingsRoutes = require('./routes/meetings');
const socketHandlers = require('./handlers/socketHandlers');
const meetingsService = require('./services/meetings');
const participantsService = require('./services/participants');

const app = express();
const server = http.createServer(app);

// Configure CORS for both Express and Socket.io
const corsOptions = {
  origin: "*", // Allow all origins for development
  methods: ["GET", "POST"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve static assets from the built frontend dist directory
app.use(
  express.static(path.join(__dirname, '..', 'dist'), {
    maxAge: '7d',
    index: false,
  })
);

// API Routes
app.use('/api', meetingsRoutes);

const io = socketIo(server, {
  cors: corsOptions
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a meeting
  socket.on('join-meeting', async (data) => {
    const result = await socketHandlers.handleJoinMeeting(socket, data);
    if (result) {
      const { meeting, participant } = result;
      
      // Notify all other participants about the new/updated participant
      socket.to(meeting.code).emit('participant-joined', {
        participant,
        participantCount: meeting.participants.length
      });
      
      // Send updated participant list
      io.to(meeting.code).emit('participants-updated', meeting.participants);
    }
  });

  // Join speaking queue
  socket.on('join-queue', async (data) => {
    const result = await socketHandlers.handleJoinQueue(socket, data);
    if (result) {
      const { meeting, queueItem } = result;
      
      // Notify all participants about queue update
      io.to(meeting.code).emit('queue-updated', meeting.queue);
      io.to(meeting.code).emit('participants-updated', meeting.participants);
    }
  });

  // Leave speaking queue
  socket.on('leave-queue', () => {
    const result = socketHandlers.handleLeaveQueue(socket);
    if (result) {
      const { meeting, removedQueueItem } = result;
      
      // Notify all participants about queue update
      io.to(meeting.code).emit('queue-updated', meeting.queue);
      io.to(meeting.code).emit('participants-updated', meeting.participants);
      
      // Notify about the specific removal for UI state consistency
      if (removedQueueItem) {
        io.to(meeting.code).emit('participant-left-queue', {
          participantId: removedQueueItem.participantId,
          participantName: removedQueueItem.participantName,
          queueLength: meeting.queue.length
        });
      }
    }
  });

  // Facilitator: Next speaker
  socket.on('next-speaker', () => {
    const result = socketHandlers.handleNextSpeaker(socket);
    if (result) {
      const { meeting, nextSpeaker } = result;
      
      // Notify all participants
      io.to(meeting.code).emit('next-speaker', nextSpeaker);
      io.to(meeting.code).emit('queue-updated', meeting.queue);
      io.to(meeting.code).emit('participants-updated', meeting.participants);
      
      // Notify about speaker change for UI state consistency
      io.to(meeting.code).emit('speaker-changed', {
        previousSpeaker: nextSpeaker,
        currentQueue: meeting.queue,
        queueLength: meeting.queue.length
      });
    }
  });

  // Facilitator: Update meeting title
  socket.on('update-meeting-title', async (data) => {
    const result = await socketHandlers.handleUpdateMeetingTitle(socket, data);
    if (result) {
      const { meeting, newTitle } = result;
      
      // Notify all participants about title change
      io.to(meeting.code).emit('meeting-title-updated', {
        newTitle,
        meeting: {
          code: meeting.code,
          title: meeting.title,
          facilitator: meeting.facilitator
        }
      });
    }
  });

  // Facilitator: Update participant name
  socket.on('update-participant-name', async (data) => {
    const result = await socketHandlers.handleUpdateParticipantName(socket, data);
    if (result) {
      const { participant, participantId, newName } = result;
      const participantData = participantsService.getParticipant(socket.id);
      
      if (participantData) {
        const { meetingCode } = participantData;
        
        // Notify all participants about name change
        io.to(meetingCode).emit('participant-name-updated', {
          participantId,
          newName,
          participant
        });
        
        // Send updated participant list
        const meeting = await meetingsService.getOrCreateActiveSession(meetingCode);
        if (meeting) {
          io.to(meetingCode).emit('participants-updated', meeting.participants);
          io.to(meetingCode).emit('queue-updated', meeting.queue);
        }
      }
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const result = socketHandlers.handleDisconnect(socket);
    if (result) {
      const { meeting, participant } = result;
      
      // Notify remaining participants
      socket.to(meeting.code).emit('participant-left', {
        participantId: socket.id,
        participantName: participant.name,
        participantCount: meeting.participants.length
      });
      
      socket.to(meeting.code).emit('queue-updated', meeting.queue);
      socket.to(meeting.code).emit('participants-updated', meeting.participants);
    }
  });
});

// Serve static files for QR code joining
app.get('/join/:code', async (req, res) => {
  const { code } = req.params;
  const meeting = await meetingsService.getMeeting(code);
  
  if (!meeting) {
    return res.status(404).send(`
      <html>
        <head><title>Meeting Not Found</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>Meeting Not Found</h1>
          <p>The meeting code "${code}" is not valid or the meeting has ended.</p>
        </body>
      </html>
    `);
  }
  
  // Redirect to frontend with meeting code
  const frontendUrl = process.env.FRONTEND_URL || 'https://stack-facilitation-app.onrender.com';
  res.redirect(`${frontendUrl}/join?code=${code.toUpperCase()}`);
});

// Serve the React app for all other routes (client-side routing)
// This must be the last route to catch all non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Serve the React app for all other routes
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Stack Facilitation Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Join meetings: http://localhost:${PORT}/join/MEETINGCODE`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});