# Rebuild Plan

This document outlines the project's architecture and considerations for future development.

## Current architecture

- **backend/** – Express + Socket.io server that manages meetings and real‑time communication.
- **src/** – React frontend built with Vite and shadcn/ui components.
- The frontend communicates with the backend via REST endpoints and a Socket.io connection.

## Future improvements

- Document and version the API for easier client updates.
- Add automated tests for both backend and frontend.
- Consider deploying backend and frontend separately to simplify scaling.

These notes serve as a starting point for contributors who want to rebuild or extend the app.

