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
- [x] Deep dive into `/manual` and `/facilitate` pages to understand facilitator control patterns and UI components
- [ ] Map out current component structure and identify reusable patterns
- [ ] Document current permission/role-based UI rendering

#### Facilitator UI Patterns (Manual & Facilitate):
**Manual Stack (`/manual`):**
- `CombinedNavbar`: Add participants, undo, keyboard shortcuts, stack count
- `CurrentSpeaker`: Timer controls, next speaker button, up-next display
- `SpeakingQueue`: Drag/drop reordering, search, interventions, clear all
- `InterventionsPanel`: Track special interventions
- `SpeakingDistribution`: Analytics and speaking time tracking

**Facilitate View (`/facilitate/:code`):**
- `FacilitatorHeader`: Meeting info, participant count, leave meeting
- `CurrentSpeakerCard`: Timer, finish speaking, speaker controls
- `SpeakingQueue`: Full queue management with interventions
- `ParticipantList`: All participants with queue status
- `SpeakingDistribution`: Analytics with direct response tracking
- `InterventionsPanel`: Track and manage interventions

**Key Facilitator Controls:**
- Add/remove participants from queue
- Reorder queue via drag/drop
- Next speaker management
- Timer controls (start/pause/reset)
- Intervention tracking (direct response, clarifying questions)
- Speaking analytics and distribution
- Undo functionality
- Clear all participants

#### Participant UI Patterns (`/meeting/:code`):
**MeetingRoom Structure:**
- `MeetingHeader`: Meeting info, participant count, leave meeting
- `CurrentSpeakerAlert`: Shows who's currently speaking
- `SpeakingQueue`: Read-only queue view with position indicators
- `ActionsPanel`: Join queue, direct response options

**Participant Actions:**
- "Raise Hand to Speak" (main action)
- Direct Response dropdown (direct-response, point-of-info, clarification)
- Leave queue (when in queue)
- View queue position and status

**Key Participant Features:**
- Simple queue interaction (join/leave)
- Multiple queue types (speak, direct-response, point-of-info, clarification)
- Visual queue position and status
- Self-highlighting in queue

### Design Planning
- [x] Design how `?mode=host|join|watch` parameter would control UI rendering and permissions
- [ ] Plan Socket.io event modifications needed to support watcher role and role-based UI updates
- [ ] Design how to refactor meeting room components to support three different view modes

#### Mode Parameter System Design:
**URL Structure:**
- `/meeting/:code?mode=host` - Facilitator controls (like current `/facilitate/:code`)
- `/meeting/:code?mode=join` - Participant actions (like current `/meeting/:code`)
- `/meeting/:code?mode=watch` - Observer view (new)
- Default: `?mode=join` if no mode specified

**Mode Detection:**
```typescript
const useMeetingMode = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'join';
  return mode as 'host' | 'join' | 'watch';
};
```

**Role Mapping:**
- `mode=host` → `isFacilitator: true` (requires name validation)
- `mode=join` → `isFacilitator: false` (participant)
- `mode=watch` → `isWatcher: true` (new role, read-only)

**Component Rendering Strategy:**
```typescript
const MeetingRoom = () => {
  const mode = useMeetingMode();
  
  switch(mode) {
    case 'host':
      return <HostView />; // Full facilitator controls
    case 'join':
      return <JoinView />; // Simplified participant actions
    case 'watch':
      return <WatchView />; // Read-only observer
  }
};
```

#### Three View Architecture:
**HOST View (Facilitator Controls):**
- Reuse existing facilitator components from `/facilitate/:code`
- `FacilitatorHeader`, `CurrentSpeakerCard`, `SpeakingQueue` (full controls)
- `ParticipantList`, `SpeakingDistribution`, `InterventionsPanel`
- All management and control capabilities

**JOIN View (Simplified Participant):**
- Streamlined version of current `/meeting/:code`
- `MeetingHeader` (simplified), `CurrentSpeakerAlert`
- `SpeakingQueue` (read-only with position indicators)
- `ActionsPanel` (join/leave queue, direct responses only)
- Remove facilitator-specific UI elements

**WATCH View (Observer):**
- Read-only versions of existing components
- `MeetingHeader` (minimal), `CurrentSpeakerAlert`
- `SpeakingQueue` (read-only, no interactions)
- `ParticipantList` (names only, no controls)
- No action buttons, no queue interactions

#### Socket.io Event Extensions:
**Extended join-meeting event:**
```typescript
// Current
{ meetingCode, participantName, isFacilitator }

// Extended
{ meetingCode, participantName, isFacilitator, isWatcher }
```

**Role-based event filtering:**
- **Facilitator**: Receives all events (current behavior)
- **Participant**: Receives queue updates, participant changes, speaker changes
- **Watcher**: Receives queue updates, participant changes, speaker changes (no control events)

#### Permission System Design:
**HOST (Facilitator) Permissions:**
- ✅ All queue management (add, remove, reorder)
- ✅ Next speaker control, timer management
- ✅ Participant management, intervention tracking
- ✅ Speaking analytics, meeting controls

**JOIN (Participant) Permissions:**
- ✅ Join/leave speaking queue, view queue position
- ✅ Make direct responses
- ❌ Queue management, speaker control, participant management

**WATCH (Observer) Permissions:**
- ✅ View current speaker, speaking queue (read-only)
- ✅ View participant list, meeting info
- ❌ All queue interactions, control functions

#### Routing Strategy Decision:
**Recommended: Single route with mode parameter**
- `/meeting/:code?mode=host|join|watch`
- **Pros:** Simpler routing, easier to maintain, consistent URL structure
- **Cons:** Slightly more complex component logic

#### Backend Changes Required:
**Minimal changes needed:**
1. **Socket.io handlers:** Add `isWatcher` support to `handleJoinMeeting`
2. **Role validation:** Add watcher role validation (no name matching required)
3. **Event filtering:** Filter control events for watchers
4. **No database changes:** Use existing meeting/participant tables
5. **No API changes:** Reuse existing endpoints

- [x] Plan permission system for what each role can see/do in the three views
- [x] Evaluate routing options: single `/meeting/:code` with mode param vs separate `/host/:code`, `/join/:code`, `/watch/:code` routes
- [x] Identify minimal backend changes needed to support watcher role and role-based data filtering

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