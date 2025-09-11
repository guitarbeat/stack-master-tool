# Stack Master Tool

An open-source application for democratic meeting facilitation. It combines an automatic meeting-based speaking queue with a manual stack keeper so facilitators can manage turn-taking in both online and in-person gatherings.

## Features

- Create meetings with shareable join codes
- Real-time speaking queue powered by Socket.io
- Manual stack keeper for offline use
- Warm, earthy theme with soft felt texture
- React + TypeScript + Tailwind CSS frontend

## Getting Started

### Local Development

You need Node.js and npm—[install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <YOUR_GIT_URL>
cd stack-master-tool
npm install
npm run dev
```

### Build and Test

```bash
npm run build
npm test
```

### Online Development

You can also edit this application using [Lovable](https://lovable.dev/projects/4d5f4ee6-fcac-40c3-8f0c-62fe54a85e2c) or GitHub Codespaces.

## Architecture

This project combines two related tools for democratic meeting facilitation:

1. **Automatic Stack App** – A full-stack React/Socket.io application for creating meetings, letting participants join with a code, and managing the speaking queue in real time.
2. **Manual Stack Keeper** – A lightweight interface for facilitators to manually manage a speaking stack without networking.

Access the manual stack keeper at `/manual`, while the default route `/` leads to the meeting-based workflow.

### Tech Stack

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

## Deployment

### Lovable
Simply open [Lovable](https://lovable.dev/projects/4d5f4ee6-fcac-40c3-8f0c-62fe54a85e2c) and click on Share -> Publish.

### Render
Deploy as a Render Web Service:
- **Service name:** `stack-app-backend`
- **Region:** Oregon (US West)
- **Instance type:** Free (0.1 CPU, 512 MB)
- **Repository:** `https://github.com/guitarbeat/stack-facilitation-app` (branch `main`)
- **Root directory:** `backend`
- **Build command:** `npm install`
- **Start command:** `npm start`
- **Health check path:** `/healthz`
- **Auto-deploy:** On commit

## Documentation

- [Project documentation](docs/README.md)
- [Deployment guide](docs/DEPLOYMENT.md)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

