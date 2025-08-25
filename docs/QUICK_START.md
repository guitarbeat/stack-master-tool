# Quick Start

This guide helps you get the Stack Facilitation App running locally.

## Prerequisites

- Node.js 18 or later

## Install dependencies

```bash
# install frontend deps
npm install
# install backend deps
(cd backend && npm install)
```

## Run the app

Start the backend in one terminal:

```bash
npm start --prefix backend
```

Start the frontend in another terminal:

```bash
npm run dev
```

The Vite dev server runs on [http://localhost:5173](http://localhost:5173) and connects to the backend at `http://localhost:3000` by default. Set `VITE_API_URL` if your backend uses a different address.

