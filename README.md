# Stack Master Tool

Stack Master Tool is an open-source application for democratic meeting facilitation. It provides three distinct meeting views: **HOST** (facilitator controls), **JOIN** (participant actions), and **WATCH** (public observer).

## ⚠️ Project Status

This project is currently undergoing a major backend migration from Express/Socket.io to Supabase. The migration enables serverless deployment and eliminates the need for a separate backend server.

### Recent Changes

- ✅ **Supabase Database Schema Created** - Tables for meetings, participants, and speaking queues
- ✅ **Meeting Creation Migrated** - Now uses Supabase instead of Express API
- ✅ **Real-time Subscriptions** - Supabase Realtime replaces Socket.io for live updates
- ✅ **Unified Facilitator Hook** - Seamlessly switches between manual and remote modes

### Known Issues

- ⚠️ **Legacy Backend Code** - Old Express/Socket.io code in `/backend` directory remains for reference
- ⚠️ **Incomplete Migration** - Join and Watch views still use legacy Socket.io implementation
- ⚠️ **Hybrid Architecture** - Currently runs both Supabase (for facilitator) and Express backend (for participants)

### What's Left to Do

1. **Complete Migration** - Update Join and Watch views to use Supabase Realtime
2. **Remove Legacy Code** - Delete `/backend` directory and old API/Socket service files after migration
3. **Update Documentation** - Reflect Supabase architecture in all docs
4. **Test Full Flow** - Verify create → join → watch flow works end-to-end with Supabase
5. **Add RLS Policies** - Review and tighten Row Level Security policies for production
6. **Performance Testing** - Test with multiple concurrent meetings and participants

## Features

### Three Meeting Views

- **HOST** - Full facilitator controls with both manual and remote meeting management
- **JOIN** - Participant view with queue interaction capabilities
- **WATCH** - Public read-only observer view (no authentication required)

### Core Functionality

- Unified facilitator interface supporting manual and remote modes
- Create meetings with shareable codes for remote participation
- Real-time speaking queue powered by Socket.io
- Public watch URLs for easy sharing
- Role-based access control
- React + TypeScript + Tailwind CSS frontend

## URL Structure

- **`/meeting?mode=host`** - Host view (facilitator controls)
- **`/meeting?mode=join`** - Join view (participant actions)
- **`/watch/:code`** - Public watch view (read-only, no auth)

## Getting Started

Clone the repository, install dependencies, and start the development server:

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd stack-master-tool
npm install
npm run dev
```

Build the project and run the basic test script:

```bash
npm run build
npm test
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

This project provides a unified facilitation interface that supports both manual (offline) and remote (online) meeting management:

- **Host Mode** – Facilitators can start with manual stack management and enable remote participation with one click
- **Real-time Updates** – Supabase Realtime powers live queue updates when remote mode is enabled
- **Flexible Deployment** – Works offline for manual facilitation or online for distributed meetings

The project is built with:

**Frontend:**
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

**Backend (New):**
- Supabase (PostgreSQL database)
- Supabase Realtime (WebSocket subscriptions)
- Row Level Security (RLS) for data access control

**Backend (Legacy - To Be Removed):**
- Express.js
- Socket.io
- In-memory data storage

## Backend Setup

### Supabase Backend (Current)

The application now uses Supabase as its backend. The database schema includes:

**Tables:**
- `meetings` - Meeting metadata and codes
- `participants` - Users who have joined meetings
- `speaking_queue` - Real-time speaking queue with position tracking

**Features:**
- Real-time subscriptions for live updates
- Row Level Security (RLS) policies for data access
- Automatic meeting code generation
- PostgreSQL triggers and functions

**Configuration:**
- Supabase URL: `https://jectngcrpikxwnjdwana.supabase.co`
- Client configuration: `src/integrations/supabase/client.ts`
- Type definitions: `src/integrations/supabase/types.ts`

### Legacy Express Backend (Deprecated)

The old Express/Socket.io backend in `/backend` directory is deprecated and will be removed. Do not use for new development.

## Documentation

### Three Meeting Views

- **[Three Meeting Views Implementation](docs/three-meeting-views.md)** - Complete specification and implementation status

### Additional Documentation

- [Quick Start Guide](docs/QUICK_START.md)
- [Development Environment](docs/DEVELOPMENT.md)
- [Environment Setup](docs/ENVIRONMENT_SETUP.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Facilitation Guide](docs/FACILITATION_GUIDE.md)
- [Moderation Guide](docs/MODERATION_GUIDE.md)
- [Architecture / Rebuild Plan](docs/REBUILD_PLAN.md)

## Deployment

### Lovable Deployment

Simply open [Lovable](https://lovable.dev/projects/4d5f4ee6-fcac-40c3-8f0c-62fe54a85e2c) and click on Share -> Publish.

### Render Deployment

This project can also be deployed as a Render Web Service using the following configuration:

- **Service name:** `stack-app-backend`
- **Region:** Oregon (US West)
- **Instance type:** Free (0.1 CPU, 512 MB)
- **Repository:** `https://github.com/guitarbeat/stack-facilitation-app` (branch `main`)
- **Root directory:** `backend`
- **Build command:** `npm install`
- **Start command:** `npm start`
- **Health check path:** `/healthz`
- **Auto-deploy:** On commit

### Custom Domain

You can connect a custom domain to your Lovable project. Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
