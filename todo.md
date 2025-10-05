# Stack Master Tool - TODO

A democratic meeting facilitation application built with React, TypeScript, and Socket.io.

## 🚀 Quick Start

**Next Priority Items:**
1. Complete Supabase migration for Join and Watch views
2. Add development database seeding scripts
3. Set up test coverage reporting and thresholds
4. Add component testing for React UI components

---

## 🔥 Critical Issues (Fix First)

- [ ] Fix race condition causing duplicate speakers in queue
- [ ] Resolve memory leak during websocket reconnection
- [ ] Address inconsistent UI state after removing speakers
- [ ] Handle server errors gracefully when creating meetings
- [ ] Write integration tests for manual stack keeper

---

## 📋 Project Overview

### 🏗️ Architecture
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Socket.io
- **Database**: Supabase (PostgreSQL)
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
- [ ] Implement E2E tests for meeting creation and joining workflow
- [ ] Set up test coverage reporting and thresholds
- [ ] Add component testing for React UI components
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
| File | Purpose | Status |
|------|---------|--------|
| `src/App.tsx` | Main React app with routing | ✅ Active |
| `src/main.tsx` | React entry point | ✅ Active |
| `backend/server.js` | Express + Socket.io server | ✅ Active |
| `backend/routes/meetings.js` | Meeting API endpoints | ✅ Active |
| `backend/services/meetings.js` | Meeting business logic | ✅ Active |
| `backend/handlers/socketHandlers.js` | Socket.io event handlers | ✅ Active |

### Key Components
| Component | Purpose | Status |
|-----------|---------|--------|
| `src/components/StackKeeper/StackKeeperRefactored.tsx` | Main facilitator interface | ✅ Active |
| `src/components/MeetingRoom/MeetingRoomWithModes.tsx` | Meeting room mode switcher | ✅ Active |
| `src/components/ActionCards.tsx` | Landing page actions | ✅ Active |
| `src/components/Hero.tsx` | Landing page hero | ✅ Active |

### Custom Hooks
| Hook | Purpose | Status |
|------|---------|--------|
| `src/hooks/useMeetingSocket.ts` | Socket.io connection management | ✅ Active |
| `src/hooks/useStackManagement.ts` | Stack state management | ✅ Active |
| `src/hooks/useSpeakerTimer.ts` | Speaker timing | ✅ Active |
| `src/hooks/useParticipantManagement.ts` | Participant state | ✅ Active |

### Legacy Files
| File | Purpose | Status |
|------|---------|--------|
| `render.yaml` | Legacy Render deployment config | ⚠️ Legacy |
| `docker-compose.yml` | Legacy Docker Compose config | ⚠️ Legacy |
| `frontend/` | Legacy frontend directory | ⚠️ Legacy |

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

---

*Last updated: 2025-01-27*