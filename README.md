# Welcome to your Lovable project

This project features a warm, earthy theme with a soft felt texture for a cozy feel. Layered radial gradients in the page background create a subtle felt-like texture using natural tones.
## Project info

**URL**: https://lovable.dev/projects/4d5f4ee6-fcac-40c3-8f0c-62fe54a85e2c

## How can I edit this code?

You can edit this application in several ways.
**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/4d5f4ee6-fcac-40c3-8f0c-62fe54a85e2c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

You only need Node.js and npm—[install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev

# Step 5: Verify the project builds without errors.
npm test
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

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

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/4d5f4ee6-fcac-40c3-8f0c-62fe54a85e2c) and click on Share -> Publish.

## Render deployment

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

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
