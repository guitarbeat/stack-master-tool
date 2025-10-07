# Stack Master Tool - TODO

A democratic meeting facilitation application built with React, TypeScript, and Socket.io.

## 🚀 Quick Start

**Next Priority Items:**

1. Complete Supabase migration for Join and Watch views (replace useMeetingSocket and usePublicWatch)
2. Add test coverage for core components (currently 0% coverage)
3. Remove legacy backend code after migration completion
4. Add error boundaries to all major routes

---

## 🔥 Critical Issues (Fix First)

- [ ] **REMOTE MEETING CONNECTION FAILURES** - Backend server required for remote meetings
  - Backend uses in-memory storage - meetings lost on restart
  - Ensure backend server is running: `cd backend && npm run dev`
  - Backend should be accessible at `http://localhost:3001`
  - Supabase Edge Functions not yet implemented for remote meetings
- [ ] **ZERO TEST COVERAGE** - No tests exist, making production deployment risky
- [ ] Complete JOIN view migration to Supabase (replace useMeetingSocket)
- [ ] Complete WATCH view migration to Supabase (replace usePublicWatch)
- [ ] Fix race condition causing duplicate speakers in queue
- [ ] Resolve memory leak during websocket reconnection
- [ ] Address inconsistent UI state after removing speakers
- [ ] Handle server errors gracefully when creating meetings

---

## 📋 Project Overview

### 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Hybrid (Supabase + Legacy Express/Socket.io)
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime (HOST view) + Socket.io (JOIN/WATCH views)
- **Deployment**: Supabase (replacing Render)

### 📁 Key Directories

```
src/                    # Frontend React app
├── components/         # UI components (shadcn/ui + custom)
├── pages/             # Route components
├── hooks/             # Custom React hooks
├── services/          # API and socket services
└── types/             # TypeScript definitions

backend/               # Express + Socket.io server
├── routes/            # API endpoints
├── services/          # Business logic
├── handlers/          # Socket.io event handlers
└── config/            # Supabase configuration

supabase/              # Database
├── config.toml        # Project configuration
└── migrations/        # Database schema changes
```

### 📊 File Status Legend

- ✅ **Active** - Currently maintained
- ⚠️ **Legacy** - Outdated but kept for compatibility
- 🗑️ **Deprecated** - Marked for removal
- 🔄 **Refactoring** - Being updated

---

## 🎯 Task Categories

### 🧪 Testing & Quality

- ✅ **Fixed TypeScript compilation errors** - Resolved type mismatches with legacy `.js` modules
- [ ] **URGENT: Add test coverage** - Currently 0% coverage, no test files exist
- [ ] Implement E2E tests for meeting creation and joining workflow
- [ ] Set up test coverage reporting and thresholds (80% minimum)
- [ ] Add component testing for React UI components (HostView, JoinView, WatchView)
- [ ] Write tests for facilitator authentication and persistence

### 🏗️ Development Environment

- [ ] Add development database seeding scripts

### 🚀 Deployment & Infrastructure

- [ ] Configure deployment automation to Supabase
- [ ] Add health check endpoints for monitoring

### 🎨 UI/UX Improvements

- [ ] Improve mobile styling and responsive design
- [ ] Add loading states for all async operations
- [ ] Implement proper error boundaries
- [ ] Improve accessibility (ARIA labels, screen reader support)

### ⚡ Feature Enhancements

- [ ] Implement persistent facilitator session management (PR #128)
- [ ] Add facilitator token validation and authentication
- [ ] Create meeting history and analytics dashboard

### 🏛️ Architecture & Code Quality

- [ ] **Complete Supabase migration** - Replace useMeetingSocket and usePublicWatch with Supabase hooks
- [ ] Remove legacy backend code after migration completion
- [ ] Complete frontend consolidation (remove duplicate components)
- [ ] Implement proper error handling patterns throughout app
- [ ] Clean up redundant code and unused dependencies
- [ ] Implement proper logging and monitoring

### 📚 Documentation

- [ ] Update README with current deployment instructions
- [ ] Document socket.io events and data structures
- [ ] Create user manual for meeting facilitators

### 🔒 Security & Performance

- [ ] Implement rate limiting for API endpoints
- [ ] Add input validation and sanitization
- [ ] Optimize bundle size and lazy loading

### 🗄️ Database & Backend

- [ ] Add backup and recovery procedures
- [ ] Optimize queries and add indexing

### 🌟 Nice-to-Have Features

- [ ] Add social media meta tags and preview images (PR #67)
- [ ] Implement dark/light theme toggle

### 📊 Analytics & Monitoring

- [ ] Add error tracking and alerting

---

## 📋 File Reference

### Core Files

| File                                 | Purpose                     | Status    |
| ------------------------------------ | --------------------------- | --------- |
| `src/App.tsx`                        | Main React app with routing | ✅ Active |
| `src/main.tsx`                       | React entry point           | ✅ Active |
| `backend/server.js`                  | Express + Socket.io server  | ✅ Active |
| `backend/routes/meetings.js`         | Meeting API endpoints       | ✅ Active |
| `backend/services/meetings.js`       | Meeting business logic      | ✅ Active |
| `backend/handlers/socketHandlers.js` | Socket.io event handlers    | ✅ Active |

### Key Components

| Component                                              | Purpose                    | Status    |
| ------------------------------------------------------ | -------------------------- | --------- |
| `src/components/StackKeeper/StackKeeperRefactored.tsx` | Main facilitator interface | ✅ Active |
| `src/components/MeetingRoom/MeetingRoomWithModes.tsx`  | Meeting room mode switcher | ✅ Active |
| `src/components/ActionCards.tsx`                       | Landing page actions       | ✅ Active |
| `src/components/Hero.tsx`                              | Landing page hero          | ✅ Active |

### Custom Hooks

| Hook                                    | Purpose                         | Status    |
| --------------------------------------- | ------------------------------- | --------- |
| `src/hooks/useMeetingSocket.ts`         | Socket.io connection management | ✅ Active |
| `src/hooks/useStackManagement.ts`       | Stack state management          | ✅ Active |
| `src/hooks/useSpeakerTimer.ts`          | Speaker timing                  | ✅ Active |
| `src/hooks/useParticipantManagement.ts` | Participant state               | ✅ Active |

### Legacy Files

| File                 | Purpose                         | Status    |
| -------------------- | ------------------------------- | --------- |
| `render.yaml`        | Legacy Render deployment config | ⚠️ Legacy |
| `docker-compose.yml` | Legacy Docker Compose config    | ⚠️ Legacy |
| `frontend/`          | Legacy frontend directory       | ⚠️ Legacy |

---

## 🎯 Priority Levels

**Priority 1 (Immediate)**: Critical bug fixes, CI/CD failures
**Priority 2 (Short-term)**: Testing setup, development environment fixes
**Priority 3 (Medium-term)**: Architecture improvements, documentation, security
**Priority 4 (Long-term)**: Advanced features, analytics, nice-to-have improvements

---

---

## ✅ Recently Completed

- **TypeScript Error Resolution** (2025-01-27)
  - Fixed all TypeScript compilation errors
  - Added type declarations for legacy `.js` modules
  - Resolved strict type checking issues in shadcn components
  - Removed unused imports and variables

- **Supabase Migration Progress** (2025-01-27)
  - HOST view fully migrated to Supabase Realtime
  - Unified facilitator hook implemented
  - Meeting creation migrated to Supabase
  - Error handling components created

---

_Last updated: 2025-01-27_
