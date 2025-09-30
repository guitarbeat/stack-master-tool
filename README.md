# Stack Master Tool

Stack Master Tool is an open-source application for democratic meeting facilitation. It provides three distinct meeting views: **HOST** (facilitator controls), **JOIN** (participant actions), and **WATCH** (public observer) - similar to jparty.tv's approach.

## Features

### Three Meeting Views

- **HOST** - Full facilitator controls and meeting management
- **JOIN** - Participant view with queue interaction capabilities
- **WATCH** - Public read-only observer view (no authentication required)

### Core Functionality

- Create meetings with shareable codes
- Real-time speaking queue powered by Socket.io
- Manual stack keeper for offline use
- Public watch URLs for easy sharing
- Role-based access control
- React + TypeScript + Tailwind CSS frontend

## URL Structure

- **`/meeting/ABC123?mode=host`** - Host view (facilitator controls)
- **`/meeting/ABC123?mode=join`** - Join view (participant actions) - _default_
- **`/watch/ABC123`** - Public watch view (read-only, no auth)

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

This project combines two related tools for democratic meeting facilitation:

1. **Automatic Stack App** – A full-stack React/Socket.io application for creating meetings, letting participants join with a code, and managing the speaking queue in real time.
2. **Manual Stack Keeper** – A lightweight interface for facilitators to manually manage a speaking stack without networking.

You can access the manual stack keeper at `/manual`, while the default route `/` leads to the meeting-based workflow.

The project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Backend Setup

The backend provides an Express and Socket.io server that manages meetings and real-time speaking queues.
It exposes a few REST endpoints:

- `GET /health` – basic health check
- `POST /api/meetings` – create a new meeting
- `GET /api/meetings/:code` – fetch meeting details

To run the backend locally:

```sh
cd backend
npm install
npm start # or node server.js
```

## Documentation

### Three Meeting Views

- **[HOST, JOIN, WATCH Specification](docs/host-join-watch-spec.md)** - Complete specification of the three meeting views
- **[Implementation Status](docs/todo-three-views.md)** - Detailed implementation status and technical details

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
