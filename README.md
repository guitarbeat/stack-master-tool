# Stack Facilitation App

Stack Facilitation App is an open-source application for democratic meeting facilitation. It provides three distinct meeting views: **HOST** (facilitator controls), **JOIN** (participant actions), and **WATCH** (public observer).

## ✨ Recent Features

- ✅ **Speaking Distribution for Local Meetings** - Pie chart showing who has talked the most in local meetings
- ✅ **Real-time Speaking Analytics** - Track speaking time and generate distribution charts for both local and remote meetings
- ✅ **Enhanced Watch View** - Local meeting watch views now display speaking distribution data
- ✅ **Name Editing** - Hosts/facilitators can now change participant names and meeting titles in real-time
- ✅ **Real-time Updates** - All participants see name changes instantly via WebSocket events
- ✅ **Editable UI Components** - Inline editing with validation and error handling
- ✅ **Role-based Access** - Only facilitators can edit names, maintaining meeting security

## 🏗️ Project Status

This project uses a hybrid architecture with both Supabase (for data persistence) and Express/Socket.io (for real-time communication). The system is production-ready with comprehensive error handling and validation.

### Current Architecture

- ✅ **Supabase Database** - PostgreSQL with Row Level Security for data persistence
- ✅ **Express/Socket.io Backend** - Real-time WebSocket communication for live updates
- ✅ **React Frontend** - TypeScript + Tailwind CSS with shadcn/ui components
- ✅ **Comprehensive Testing** - Unit tests, integration tests, and E2E tests with Playwright
- ✅ **Error Handling** - Robust error boundaries and user-friendly error messages

## Features

### Three Meeting Views

- **HOST** - Full facilitator controls with both manual and remote meeting management
- **JOIN** - Participant view with queue interaction capabilities
- **WATCH** - Public read-only observer view (no authentication required)

### Core Functionality

- **Speaking Distribution Analytics** - Pie charts showing speaking time distribution for both local and remote meetings
- **Real-time Speaking Tracking** - Automatic tracking of speaking time with timer controls
- **Real-time Name Editing** - Facilitators can edit participant names and meeting titles
- **Unified Facilitator Interface** - Seamlessly switches between manual and remote modes
- **Speaking Queue Management** - Real-time queue with position tracking and interventions
- **Public Watch URLs** - Easy sharing with `/join/:code` redirects
- **Role-based Access Control** - Secure facilitator-only editing capabilities
- **Comprehensive Testing** - Unit, integration, and E2E test coverage
- **Error Handling** - Robust error boundaries and user feedback

### Speaking Distribution Features

- **Pie Chart Visualization** - Interactive pie chart showing speaking time distribution
- **Real-time Updates** - Chart updates automatically as participants speak
- **Local Meeting Support** - Works for both local (manual) and remote meetings
- **Watch View Integration** - Speaking distribution visible in watch views for local meetings
- **Direct Response Tracking** - Option to include or exclude direct responses in analytics
- **Timer Integration** - Automatic speaking time tracking with pause/resume functionality

### Name Editing Features

- **Inline Editing** - Click to edit participant names and meeting titles
- **Real-time Updates** - Changes broadcast instantly to all participants
- **Input Validation** - Character limits and format validation
- **Error Recovery** - Graceful handling of failed updates
- **Keyboard Shortcuts** - Enter to save, Escape to cancel

## URL Structure

- **`/meeting?mode=host`** - Host view (facilitator controls with name editing)
- **`/meeting?mode=join`** - Join view (participant actions)
- **`/meeting?mode=watch`** - Watch view (public observer)
- **`/join/:code`** - Direct join redirect (redirects to frontend)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for database)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd stack-facilitation-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Run all tests (unit + E2E)
npm run test:all

# Start backend server (for Socket.io)
cd backend && npm install && npm run dev
```

### Development Options

**Use Lovable**
Simply visit the [Lovable Project](https://lovable.dev/projects/4d5f4ee6-fcac-40c3-8f0c-62fe54a85e2c) and start prompting. Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**
If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

You only need Node.js and npm—[install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

**Use GitHub Codespaces**

- Navigate to the main page of your repository
- Click on the "Code" button (green button) near the top right
- Select the "Codespaces" tab
- Click on "New codespace" to launch a new Codespace environment
- Edit files directly within the Codespace and commit and push your changes once you're done

## Technology Stack

### Frontend

- **Vite** - Fast build tool and dev server
- **React 18** - UI framework with hooks and context
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Reusable component library
- **React Router** - Client-side routing
- **Socket.io Client** - Real-time communication

### Backend

- **Express.js** - Web server framework
- **Socket.io** - Real-time WebSocket communication
- **Node.js** - JavaScript runtime
- **CORS** - Cross-origin resource sharing

### Database

- **Supabase** - PostgreSQL database with real-time subscriptions
- **Row Level Security (RLS)** - Database-level access control
- **PostgreSQL** - Relational database

### Testing

- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing
- **Testing Library** - React component testing
- **Jest** - Backend testing

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **TypeScript** - Static type checking

## Project Structure

```
stack-facilitation-app/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── MeetingRoom/         # Meeting room views (Host, Join, Watch)
│   │   ├── StackKeeper/         # Speaking queue management
│   │   │   └── SpeakingDistribution.tsx # Speaking analytics pie chart
│   │   ├── Facilitator/         # Facilitator-specific components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── EditableParticipantName.tsx  # Name editing component
│   │   └── EditableMeetingTitle.tsx     # Title editing component
│   ├── hooks/                   # Custom React hooks
│   │   ├── useUnifiedFacilitator.ts     # Main facilitator hook
│   │   ├── useSpeakingHistory.ts        # Speaking time tracking
│   │   ├── useSpeakerTimer.ts           # Speaker timer functionality
│   │   ├── useFacilitatorSocket.ts     # Socket.io integration
│   │   └── useSupabaseFacilitator.ts   # Supabase integration
│   ├── services/                # API and socket services
│   │   ├── socket.js            # Socket.io client service
│   │   └── api.js               # REST API service
│   ├── types/                   # TypeScript type definitions
│   ├── utils/                   # Utility functions
│   └── integrations/            # External service integrations
│       └── supabase/            # Supabase client and types
├── backend/                     # Express.js backend server
│   ├── routes/                  # API routes
│   │   └── meetings.js          # Meeting management endpoints
│   ├── services/                # Business logic
│   │   ├── meetings.js          # Meeting operations
│   │   └── participants.js      # Participant management
│   ├── handlers/                # Socket.io event handlers
│   │   └── socketHandlers.js    # Real-time event handling
│   └── config/                  # Configuration files
│       └── supabase.js          # Supabase client config
├── tests/                       # Test files
│   └── e2e/                     # End-to-end tests
├── docs/                        # Documentation
├── public/                      # Static assets
└── supabase/                    # Database migrations
    └── migrations/              # SQL migration files
```

## Backend Setup

### Database (Supabase)

The application uses Supabase for data persistence:

**Tables:**

- `meetings` - Meeting metadata and codes
- `participants` - Users who have joined meetings
- `speaking_queue` - Real-time speaking queue with position tracking

**Features:**

- Row Level Security (RLS) policies
- Real-time subscriptions
- Automatic meeting code generation

### Backend Server (Express.js)

The Express.js server handles:

- REST API endpoints for meeting management
- Socket.io WebSocket connections for real-time updates
- Name editing functionality via API and socket events

**Key Endpoints:**

- `POST /api/meetings` - Create meeting
- `GET /api/meetings/:code` - Get meeting info
- `PATCH /api/meetings/:code/title` - Update meeting title
- `PATCH /api/meetings/:code/participants/:id/name` - Update participant name

**Socket Events:**

- `update-meeting-title` - Real-time title updates
- `update-participant-name` - Real-time name updates
- `meeting-title-updated` - Broadcast title changes
- `participant-name-updated` - Broadcast name changes

## Documentation

### Core Documentation

- **[Three Meeting Views Implementation](docs/three-meeting-views.md)** - Complete specification and implementation status
- **[Quick Start Guide](docs/QUICK_START.md)** - Get up and running quickly
- **[Development Environment](docs/DEVELOPMENT.md)** - Local development setup
- **[Environment Setup](docs/ENVIRONMENT_SETUP.md)** - Environment configuration

### User Guides

- **[Facilitation Guide](docs/FACILITATION_GUIDE.md)** - How to facilitate meetings
- **[Speaking Distribution Guide](docs/SPEAKING_DISTRIBUTION.md)** - Using speaking analytics and distribution charts
- **[Moderation Guide](docs/MODERATION_GUIDE.md)** - Meeting moderation best practices

### Technical Documentation

- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Architecture / Rebuild Plan](docs/REBUILD_PLAN.md)** - System architecture overview
- **[Error Handling](docs/ERROR_HANDLING.md)** - Error handling patterns and recovery

## Deployment

### Frontend Deployment (Lovable)

The frontend is deployed via Lovable:

1. Open [Lovable Project](https://lovable.dev/projects/4d5f4ee6-fcac-40c3-8f0c-62fe54a85e2c)
2. Click Share → Publish
3. Configure custom domain (optional)

### Backend Deployment (Render)

The backend server is deployed on Render:

**Configuration:**

- **Service name:** `stack-app-backend`
- **Region:** Oregon (US West)
- **Instance type:** Free (0.1 CPU, 512 MB)
- **Repository:** `https://github.com/guitarbeat/stack-facilitation-app`
- **Root directory:** `backend`
- **Build command:** `npm install`
- **Start command:** `npm start`
- **Health check path:** `/api/health`
- **Auto-deploy:** On commit

### Environment Variables

**Frontend (.env.local):**

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=your_backend_url
```

**Backend (.env):**

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NODE_ENV=production
PORT=3000
```

### Custom Domain

Connect a custom domain to your Lovable project: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Name Editing Feature

### How It Works

The name editing feature allows facilitators to update participant names and meeting titles in real-time:

1. **Participant Names**: Click the edit icon next to any participant name in the participant list
2. **Meeting Title**: Click the edit icon next to the meeting title in the header
3. **Real-time Updates**: Changes are broadcast instantly to all participants via WebSocket
4. **Validation**: Input is validated for length and character restrictions
5. **Error Handling**: Failed updates are handled gracefully with user feedback

### Technical Implementation

- **Frontend**: Inline editing components with validation
- **Backend**: REST API endpoints and Socket.io events
- **Database**: Updates stored in Supabase with real-time subscriptions
- **Security**: Only facilitators can edit names (role-based access control)

### API Endpoints

```bash
# Update meeting title
PATCH /api/meetings/:code/title
{
  "newTitle": "Updated Meeting Title",
  "facilitatorName": "Facilitator Name"
}

# Update participant name
PATCH /api/meetings/:code/participants/:participantId/name
{
  "newName": "Updated Name",
  "facilitatorName": "Facilitator Name"
}
```

### Socket Events

```javascript
// Emit events
socket.emit("update-meeting-title", { newTitle: "New Title" });
socket.emit("update-participant-name", {
  participantId: "id",
  newName: "New Name",
});

// Listen for updates
socket.on("meeting-title-updated", data => {
  /* handle update */
});
socket.on("participant-name-updated", data => {
  /* handle update */
});
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
