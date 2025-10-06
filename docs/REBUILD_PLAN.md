# Architecture Overview

This document outlines the project's current architecture and migration status.

## Current Architecture (Hybrid State)

- **Supabase Backend** (Primary) – PostgreSQL database with Realtime subscriptions
  - Tables: `meetings`, `participants`, `speaking_queue`
  - Real-time updates via Supabase Realtime
  - Row Level Security (RLS) for data access control
- **Legacy Backend** (Deprecated) – Express + Socket.io server in `/backend` directory
  - Still used by JOIN and WATCH views
  - Will be removed after complete migration
- **Frontend** – React + TypeScript + Vite + shadcn/ui components
  - HOST view: Fully migrated to Supabase
  - JOIN view: Still uses legacy Socket.io (needs migration)
  - WATCH view: Still uses legacy Socket.io (needs migration)

## Migration Status

### ✅ Completed

- Database schema and Supabase setup
- Meeting creation flow
- HOST view (facilitator controls)
- Unified facilitator hook

### 🔄 In Progress

- JOIN view migration to Supabase
- WATCH view migration to Supabase

### 📋 Next Steps

1. Complete JOIN and WATCH view migrations
2. Remove legacy backend code
3. Add comprehensive testing
4. Deploy to production

## Future Improvements

- API versioning for easier client updates
- Comprehensive test coverage (currently 0%)
- Separate deployment of frontend and backend for scaling
- Performance optimization and monitoring

_Note: This document will be updated as the migration progresses. See `plan.md` for detailed development roadmap._
