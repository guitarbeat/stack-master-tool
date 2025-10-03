# Stack Master Tool - TODO

This document tracks tasks and improvements for the Stack Master Tool, a democratic meeting facilitation application built with React, TypeScript, and Socket.io.

## 🏗️ Project Architecture

### Frontend (React + TypeScript + Vite)
```
src/
├── components/                 # React components
│   ├── ui/                   # Reusable UI components (shadcn/ui)
│   │   ├── button.tsx, card.tsx, dialog.tsx, etc.
│   │   └── sidebar/          # Sidebar component system
│   ├── layout/               # Layout components
│   │   └── AppLayout.tsx
│   ├── meeting/              # Meeting-related components
│   │   ├── CreateMeetingForm.tsx
│   │   ├── JoinMeetingForm.tsx
│   │   └── ModeToggle.tsx
│   ├── MeetingRoom/          # Meeting room components
│   │   ├── ActionsPanel.tsx
│   │   ├── CurrentSpeakerAlert.tsx
│   │   ├── HostView.tsx, JoinView.tsx, WatchView.tsx
│   │   └── SpeakingQueue.tsx
│   ├── StackKeeper/          # Stack management components
│   │   ├── CurrentSpeaker.tsx
│   │   ├── SpeakingQueue.tsx
│   │   └── InterventionsPanel.tsx
│   ├── Facilitator/          # Facilitator-specific components
│   │   └── RemoteModeToggle.tsx
│   └── [Other components]    # ActionCards, Hero, Features, etc.
├── pages/                    # Page components
│   ├── HomePage.tsx
│   ├── CreateMeeting.tsx
│   ├── JoinMeeting.tsx
│   ├── MeetingRoom.tsx
│   ├── FacilitatePage.tsx
│   ├── PublicWatch.tsx
│   └── [Other pages]
├── hooks/                    # Custom React hooks
│   ├── useMeetingSocket.ts
│   ├── useFacilitatorSocket.ts
│   ├── useStackManagement.ts
│   ├── useParticipantManagement.ts
│   └── [Other hooks]
├── services/                 # API and service layer
├── types/                    # TypeScript type definitions
├── utils/                    # Utility functions
├── integrations/             # External service integrations
│   └── supabase/            # Supabase client configuration
└── test/                     # Test utilities and setup
```

### Backend (Node.js + Express + Socket.io)
```
backend/
├── routes/                   # API route handlers
│   └── meetings.js
├── services/                 # Business logic services
│   ├── meetings.js
│   └── participants.js
├── handlers/                 # Socket.io event handlers
│   └── socketHandlers.js
├── config/                   # Configuration files
│   └── supabase.js
├── __tests__/               # Backend tests
│   ├── routes/
│   └── services/
└── server.js                # Main server entry point
```

### Database (Supabase)
```
supabase/
├── config.toml              # Supabase configuration
└── migrations/              # Database migration files
    └── [timestamp]_[hash].sql
```

### Documentation
```
docs/
├── DEVELOPMENT.md           # Development setup guide
├── DEPLOYMENT.md            # Deployment instructions
├── ENVIRONMENT_SETUP.md     # Environment configuration
├── FACILITATION_GUIDE.md    # User guide for facilitators
├── MODERATION_GUIDE.md      # Moderation guidelines
└── [Other documentation]
```

### Configuration & Build
```
├── package.json             # Frontend dependencies
├── backend/package.json     # Backend dependencies
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── eslint.config.js        # ESLint configuration
├── vitest.config.ts        # Vitest test configuration
├── playwright.config.ts    # E2E test configuration
└── components.json         # shadcn/ui configuration
```

### Testing
```
├── tests/e2e/              # End-to-end tests
├── src/test/               # Frontend test utilities
├── backend/__tests__/      # Backend unit tests
├── test.config.js          # Test configuration
└── coverage.config.js      # Coverage reporting
```

### Deployment & Infrastructure
```
├── deploy/                 # Deployment scripts
│   └── deploy.sh
├── docker/                 # Docker configuration
│   ├── nginx.conf
│   ├── start.sh
│   └── healthcheck.sh
└── scripts/                # Build and utility scripts
    ├── test-runner.js
    └── coverage-report.js
```

## 📋 File Usage Reference

**Status Legend:**
- ✅ **Active** - Currently in use and maintained
- ⚠️ **Legacy** - Outdated but kept for backward compatibility
- 🗑️ **Deprecated** - Marked for removal, not recommended for new development
- 🔄 **Refactoring** - Being updated or consolidated

| File | Purpose | Key Features | Dependencies | Status |
|------|---------|--------------|--------------|--------|
| **Frontend Core** |
| `src/App.tsx` | Main React app component with routing | React Router setup, QueryClient, Toast providers | React, React Router, TanStack Query | ✅ Active |
| `src/main.tsx` | React app entry point | Error boundary, theme provider, router setup | React, React Router, Theme Provider | ✅ Active |
| `src/index.css` | Global CSS styles | Tailwind CSS imports, custom CSS variables | Tailwind CSS | ✅ Active |
| **Pages** |
| `src/pages/HomePage.tsx` | Landing page | Hero section, action cards for meeting modes | Hero, ActionCards components | ✅ Active |
| `src/pages/MeetingRoom.tsx` | Meeting room wrapper | Delegates to MeetingRoomWithModes component | MeetingRoomWithModes | ✅ Active |
| `src/pages/CreateMeeting.tsx` | Meeting creation page | Form for creating new meetings | Meeting creation form components | ✅ Active |
| `src/pages/JoinMeeting.tsx` | Meeting joining page | Form for entering meeting codes | Join meeting form components | ✅ Active |
| `src/pages/FacilitatePage.tsx` | Facilitator interface | Stack management tools for facilitators | StackKeeper components | ✅ Active |
| `src/pages/PublicWatch.tsx` | Read-only meeting view | Observer mode for meetings | Watch-only components | ✅ Active |
| **Core Components** |
| `src/components/Hero.tsx` | Landing page hero section | Main headline and description | Basic styling | ✅ Active |
| `src/components/ActionCards.tsx` | Landing page action cards | Three main actions (Host, Join, Watch) | React Router, Lucide icons | ✅ Active |
| `src/components/MeetingRoom/MeetingRoomWithModes.tsx` | Meeting room mode switcher | Routes to HostView, JoinView, or WatchView | useMeetingMode hook | ✅ Active |
| `src/components/StackKeeper/StackKeeperRefactored.tsx` | Main facilitator interface | Complete stack management with timer, interventions | Multiple custom hooks | ✅ Active |
| `src/components/StackKeeper/CurrentSpeaker.tsx` | Current speaker display | Shows who's speaking, timer controls | Speaker timer hook | ✅ Active |
| `src/components/StackKeeper/SpeakingQueue.tsx` | Speaking queue management | Add/remove participants, reorder queue | Drag and drop, search | ✅ Active |
| `src/components/StackKeeper/InterventionsPanel.tsx` | Interventions tracking | Records special interventions | Intervention types | ✅ Active |
| `src/components/StackKeeper/SpeakingDistribution.tsx` | Speaking time analytics | Charts showing speaking time distribution | Recharts library | ✅ Active |
| **Custom Hooks** |
| `src/hooks/useMeetingSocket.ts` | Meeting socket management | Socket.io connection, queue management | Socket service | ✅ Active |
| `src/hooks/useStackManagement.ts` | Stack state management | Add/remove participants, undo functionality | Local state management | ✅ Active |
| `src/hooks/useSpeakerTimer.ts` | Speaker timing | Start/stop/pause timer for current speaker | Timer state management | ✅ Active |
| `src/hooks/useParticipantManagement.ts` | Participant state | Recent participants, existing participant handling | Local storage | ✅ Active |
| `src/hooks/useDirectResponse.ts` | Direct response handling | Special speaking priority for responses | Stack management integration | ✅ Active |
| `src/hooks/useSpeakingHistory.ts` | Speaking time tracking | Records and analyzes speaking segments | Time tracking | ✅ Active |
| `src/hooks/useKeyboardShortcuts.ts` | Keyboard shortcuts | Global keyboard shortcuts for facilitator | Keyboard event handling | ✅ Active |
| `src/hooks/useMeetingMode.ts` | Meeting mode detection | Determines if user is host/join/watch | URL parameter parsing | ✅ Active |
| **Services** |
| `src/services/socket.js` | Socket.io client service | Connection management, event handling | Socket.io-client | ✅ Active |
| `src/services/api.js` | API service | HTTP requests to backend | Fetch API | ✅ Active |
| **Backend Core** |
| `backend/server.js` | Main Express server | Socket.io server, static file serving, API routes | Express, Socket.io | ✅ Active |
| `backend/routes/meetings.js` | Meeting API routes | Create/get meeting endpoints | Express router | ✅ Active |
| `backend/services/meetings.js` | Meeting business logic | Meeting CRUD operations, Supabase integration | Supabase client | ✅ Active |
| `backend/services/participants.js` | Participant management | In-memory participant tracking | Local state | ✅ Active |
| `backend/handlers/socketHandlers.js` | Socket event handlers | Real-time meeting operations | Socket.io events | ✅ Active |
| `backend/config/supabase.js` | Supabase configuration | Database client setup | Supabase client | ✅ Active |
| **Database** |
| `supabase/config.toml` | Supabase project config | Project settings and configuration | Supabase CLI | ✅ Active |
| `supabase/migrations/*.sql` | Database migrations | Schema changes and initial setup | SQL | ✅ Active |
| **Configuration** |
| `package.json` | Frontend dependencies | React, Vite, testing, UI libraries | npm | ✅ Active |
| `backend/package.json` | Backend dependencies | Express, Socket.io, Supabase | npm | ✅ Active |
| `vite.config.ts` | Vite build configuration | Build optimization, aliases, plugins | Vite | ✅ Active |
| `tailwind.config.ts` | Tailwind CSS configuration | Custom colors, themes, animations | Tailwind CSS | ✅ Active |
| `tsconfig.json` | TypeScript configuration | Compiler options, path mapping | TypeScript | ✅ Active |
| `eslint.config.js` | ESLint configuration | Code quality rules and formatting | ESLint | ✅ Active |
| `vitest.config.ts` | Vitest test configuration | Frontend testing setup | Vitest | ✅ Active |
| `playwright.config.ts` | E2E test configuration | End-to-end testing setup | Playwright | ✅ Active |
| **Testing** |
| `backend/__tests__/` | Backend unit tests | Jest tests for API and services | Jest | ✅ Active |
| `src/test/` | Frontend test utilities | Test setup and helpers | Testing Library | ✅ Active |
| `tests/e2e/` | End-to-end tests | Playwright tests for user flows | Playwright | ✅ Active |
| **Documentation** |
| `docs/DEVELOPMENT.md` | Development setup guide | Local development instructions | Markdown | ✅ Active |
| `docs/DEPLOYMENT.md` | Deployment instructions | Production deployment guide | Markdown | ✅ Active |
| `docs/FACILITATION_GUIDE.md` | User guide for facilitators | How to use the tool | Markdown | ✅ Active |
| `docs/MODERATION_GUIDE.md` | Moderation guidelines | Best practices for moderation | Markdown | ✅ Active |
| **Deployment** |
| `deploy/deploy.sh` | Deployment script | Automated deployment commands | Shell script | ✅ Active |
| `docker/` | Docker configuration | Container setup for production | Docker | ✅ Active |
| `scripts/` | Build and utility scripts | Test runners, coverage reports | Node.js | ✅ Active |
| **Legacy Files** |
| `render.yaml` | Legacy Render deployment config | Old deployment configuration | Render | ⚠️ Legacy |
| `docker-compose.yml` | Legacy Docker Compose config | Old container orchestration | Docker Compose | ⚠️ Legacy |
| `frontend/` | Legacy frontend directory | Older React app version | React, Vite | ⚠️ Legacy |

## 🔥 Critical Bug Fixes
- [ ] Fix race condition causing duplicate speakers in queue
- [ ] Resolve memory leak during websocket reconnection
- [ ] Address inconsistent UI state after removing speakers
- [ ] Handle server errors gracefully when creating meetings
- [ ] Fix CI workflow failures (all recent builds failing)
- [ ] Write integration tests for manual stack keeper

## 🧪 Testing & Quality Assurance
- [ ] Implement E2E tests for meeting creation and joining workflow
- [ ] Set up test coverage reporting and thresholds
- [ ] Add component testing for React UI components
- [ ] Write tests for facilitator authentication and persistence

## 🏗️ Development Environment & Tooling
- [ ] Add development database seeding scripts
- [ ] Configure hot reload for both frontend and backend

## 🚀 CI/CD & Deployment
- [ ] Configure deployment automation to Supabase
- [ ] Add health check endpoints for monitoring
- [ ] Set up staging environment deployment
- [ ] Implement blue-green deployment strategy
- [ ] Add rollback procedures for failed deployments

## 🎨 UI/UX Improvements
- [ ] Remove redundant home button from navbar (PR #99)
- [ ] Improve mobile styling and responsive design
- [ ] Enhance color scheme and visual hierarchy
- [ ] Add loading states for all async operations
- [ ] Implement proper error boundaries
- [ ] Add keyboard navigation support
- [ ] Improve accessibility (ARIA labels, screen reader support)

## ⚡ Feature Enhancements
- [ ] Implement persistent facilitator session management (PR #128)
- [ ] Add "Facilitate" button to navbar for meeting creators (PR #123) 
- [ ] Implement meeting creator localStorage persistence
- [ ] Add facilitator token validation and authentication
- [ ] Create meeting history and analytics dashboard
- [ ] Add meeting recording and transcript features
- [ ] Implement user authentication and profiles
- [ ] Add meeting templates and customization options

## 🏛️ Architecture & Code Quality
- [ ] Complete frontend consolidation (remove duplicate components)
- [ ] Refactor socket.io connection management
- [ ] Implement proper error handling patterns throughout app
- [ ] Add TypeScript strict mode compliance
- [ ] Consolidate duplicate meeting creation/joining functionality (PR #73)
- [ ] Clean up redundant code and unused dependencies
- [ ] Implement proper logging and monitoring
- [ ] Add API versioning and documentation

## 📚 Documentation
- [ ] Update README with current deployment instructions
- [ ] Create comprehensive API documentation
- [ ] Add contributing guidelines for developers  
- [ ] Document socket.io events and data structures
- [ ] Create user manual for meeting facilitators
- [ ] Add troubleshooting guide for common issues
- [ ] Document environment setup and requirements

## 🔒 Security & Performance
- [ ] Implement rate limiting for API endpoints
- [ ] Add CORS configuration for production
- [ ] Implement proper session management
- [ ] Add input validation and sanitization
- [ ] Optimize bundle size and lazy loading
- [ ] Implement proper error logging without exposing sensitive data
- [ ] Add security headers and CSP policies

## 🗄️ Database & Backend
- [ ] Add database migrations system
- [ ] Implement proper connection pooling
- [ ] Add backup and recovery procedures
- [ ] Optimize queries and add indexing
- [ ] Implement data retention policies
- [ ] Add monitoring and alerting for backend services

## 🌟 Nice-to-Have Features
- [ ] Add social media meta tags and preview images (PR #67)
- [ ] Implement dark/light theme toggle
- [ ] Add meeting invitation links with QR codes
- [ ] Create mobile app versions
- [ ] Add integration with calendar applications
- [ ] Implement real-time collaboration features
- [ ] Add multi-language support (i18n)

## 📊 Analytics & Monitoring
- [ ] Set up application performance monitoring (APM)
- [ ] Implement user analytics and usage tracking
- [ ] Add error tracking and alerting
- [ ] Create dashboards for meeting metrics
- [ ] Monitor resource usage and scaling needs

---

## Task Prioritization

**Priority 1 (Immediate)**: Critical bug fixes, CI/CD failures, missing dependencies
**Priority 2 (Short-term)**: Testing setup, development environment fixes, open PR merges
**Priority 3 (Medium-term)**: Architecture improvements, documentation, security
**Priority 4 (Long-term)**: Advanced features, analytics, nice-to-have improvements

Last updated: 2025-01-27

## 📋 Next Priority Items
1. Add development database seeding scripts
2. Configure hot reload for both frontend and backend
3. Set up test coverage reporting and thresholds
4. Add component testing for React UI components
5. Configure deployment automation to Supabase