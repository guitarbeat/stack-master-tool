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