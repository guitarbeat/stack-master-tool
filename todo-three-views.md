# Three Meeting Views Implementation - TODO

## Goal
Implement three distinct meeting interfaces: HOST (facilitator controls), JOIN (simplified participant), and WATCH (observer) - similar to jparty.tv's approach.

## Investigation Phase

### Architecture Analysis
- [x] Analyze current meeting room architecture - how Socket.io events flow, role management, and UI state handling
- [ ] Review how facilitator vs participant roles are currently determined and managed in the codebase
- [ ] Study current `/meeting/:code` participant view to understand queue interaction patterns

#### Current Architecture Findings:
**Socket.io Event Flow:**
- `join-meeting` event with `{meetingCode, participantName, isFacilitator}` 
- Role determined by `isFacilitator` boolean + name validation against meeting.facilitator
- Events: `meeting-joined`, `queue-updated`, `participants-updated`, `next-speaker`, `error`
- Room-based: `socket.join(meetingCode.toUpperCase())` for broadcasting

**Role Management:**
- Only original facilitator can join as facilitator (name must match meeting.facilitator)
- Participants join with `isFacilitator: false`
- Facilitator permissions checked in `handleNextSpeaker()` - requires `participant.isFacilitator`
- No watcher role exists yet

**UI State Handling:**
- `useMeetingSocket` hook manages participant state and Socket.io listeners
- `useSupabaseFacilitator` hook for facilitator-specific functionality
- Separate pages: `/meeting/:code` (participant), `/facilitate/:code` (facilitator), `/manual` (offline)

### UI Pattern Study
- [ ] Deep dive into `/manual` and `/facilitate` pages to understand facilitator control patterns and UI components
- [ ] Map out current component structure and identify reusable patterns
- [ ] Document current permission/role-based UI rendering

### Design Planning
- [ ] Design how `?mode=host|join|watch` parameter would control UI rendering and permissions
- [ ] Plan Socket.io event modifications needed to support watcher role and role-based UI updates
- [ ] Design how to refactor meeting room components to support three different view modes
- [ ] Plan permission system for what each role can see/do in the three views
- [ ] Evaluate routing options: single `/meeting/:code` with mode param vs separate `/host/:code`, `/join/:code`, `/watch/:code` routes
- [ ] Identify minimal backend changes needed to support watcher role and role-based data filtering

## Implementation Phase

### Backend Changes
- [ ] Add watcher role support to Socket.io handlers
- [ ] Implement role-based data filtering for Socket.io events
- [ ] Add watcher-specific API endpoints if needed
- [ ] Update meeting validation to support watcher access

### Frontend Architecture
- [ ] Create role-based component system (HostView, JoinView, WatchView)
- [ ] Implement mode parameter handling in meeting room
- [ ] Refactor existing meeting room components for role-based rendering
- [ ] Create simplified participant UI components
- [ ] Create read-only observer UI components

### UI Implementation
- [ ] Build HOST view (facilitator controls similar to `/manual`/`/facilitate`)
- [ ] Build JOIN view (simplified queue participation)
- [ ] Build WATCH view (read-only observer interface)
- [ ] Implement role-based navigation and access controls
- [ ] Add mode switching UI if needed

### Integration & Testing
- [ ] Integrate three views with existing Socket.io system
- [ ] Test role-based permissions and data filtering
- [ ] Update routing to support new view modes
- [ ] Add tests for three-view functionality
- [ ] Update existing tests for role-based changes

### Polish & Documentation
- [ ] Update documentation for three-view system
- [ ] Add user guidance for different meeting roles
- [ ] Performance optimization for role-based rendering
- [ ] Accessibility improvements for different views

## Current State
- Manual Stack (`/manual`) - offline facilitation tool ✅
- Create Meeting (`/create`) - creates meeting with code ✅  
- Join Meeting (`/join`) - join with code as participant ✅
- Facilitate Meeting (`/facilitate`) - facilitator controls ✅
- Meeting Room (`/meeting/:code`) - participant view ✅

## Target State
- HOST View - full facilitator controls (like current `/facilitate`)
- JOIN View - simplified participant interface (streamlined current participant view)
- WATCH View - read-only observer interface (new)

## Notes
- Keep existing routes and backend mostly unchanged
- Focus on UI/UX differentiation between the three views
- Maintain backward compatibility with current meeting system
- Consider jparty.tv's approach as inspiration for role-based interfaces