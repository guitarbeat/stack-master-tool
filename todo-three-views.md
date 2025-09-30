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

#### Backend Implementation Details:
**1. Socket.io Handler Updates (`backend/handlers/socketHandlers.js`):**
```javascript
// Extend handleJoinMeeting to support isWatcher
async function handleJoinMeeting(socket, data) {
  const { meetingCode, participantName, isFacilitator = false, isWatcher = false } = data;
  
  // Validate role exclusivity
  if (isFacilitator && isWatcher) {
    sendSocketError(socket, 'INVALID_ROLE', 'Cannot be both facilitator and watcher');
    return;
  }
  
  // Watcher role validation (no name matching required)
  if (isWatcher) {
    // Watchers can join with any name, no facilitator validation needed
  }
  
  // ... rest of existing logic
}
```

**2. Event Filtering by Role:**
```javascript
// Add role-based event filtering
function emitToRole(socket, event, data, role) {
  if (role === 'watcher' && ['next-speaker', 'queue-managed'].includes(event)) {
    return; // Don't send control events to watchers
  }
  socket.emit(event, data);
}
```

**3. No Database Changes Required:**
- Reuse existing `meetings` and `participants` tables
- Add `isWatcher` field to participant objects in memory
- No migration needed

### Frontend Architecture
- [ ] Create role-based component system (HostView, JoinView, WatchView)
- [ ] Implement mode parameter handling in meeting room
- [ ] Refactor existing meeting room components for role-based rendering
- [ ] Create simplified participant UI components
- [ ] Create read-only observer UI components

#### Frontend Implementation Details:
**1. Mode Detection Hook:**
```typescript
// src/hooks/useMeetingMode.ts
export const useMeetingMode = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'join';
  return mode as 'host' | 'join' | 'watch';
};
```

**2. Role-Based Socket Connection:**
```typescript
// src/hooks/useMeetingSocket.ts - extend existing hook
const joinMeeting = async (meetingCode, participantName, mode) => {
  const isFacilitator = mode === 'host';
  const isWatcher = mode === 'watch';
  
  return socketService.joinMeeting(meetingCode, participantName, isFacilitator, isWatcher);
};
```

**3. Component Architecture:**
```typescript
// src/components/MeetingRoom/MeetingRoomWithModes.tsx
export const MeetingRoomWithModes = () => {
  const mode = useMeetingMode();
  
  switch(mode) {
    case 'host':
      return <HostView />;
    case 'join':
      return <JoinView />;
    case 'watch':
      return <WatchView />;
    default:
      return <JoinView />;
  }
};
```

### UI Implementation
- [ ] Build HOST view (facilitator controls similar to `/manual`/`/facilitate`)
- [ ] Build JOIN view (simplified queue participation)
- [ ] Build WATCH view (read-only observer interface)
- [ ] Implement role-based navigation and access controls
- [ ] Add mode switching UI if needed

#### UI Implementation Details:
**1. HOST View Components:**
- Reuse: `FacilitatorHeader`, `CurrentSpeakerCard`, `SpeakingQueue` (full controls)
- Reuse: `ParticipantList`, `SpeakingDistribution`, `InterventionsPanel`
- New: `HostView` wrapper component

**2. JOIN View Components:**
- Reuse: `MeetingHeader` (simplified), `CurrentSpeakerAlert`
- Reuse: `SpeakingQueue` (read-only with position indicators)
- Reuse: `ActionsPanel` (join/leave queue, direct responses)
- New: `JoinView` wrapper component

**3. WATCH View Components:**
- New: `WatchHeader` (minimal meeting info)
- New: `WatchSpeakingQueue` (read-only, no interactions)
- New: `WatchParticipantList` (names only, no controls)
- New: `WatchView` wrapper component

**4. Shared Components:**
- `CurrentSpeakerAlert` (reusable across all views)
- `MeetingInfo` (basic meeting details)
- `QueueDisplay` (base component for different queue views)

### Integration & Testing
- [ ] Integrate three views with existing Socket.io system
- [ ] Test role-based permissions and data filtering
- [ ] Update routing to support new view modes
- [ ] Add tests for three-view functionality
- [ ] Update existing tests for role-based changes

#### Testing Strategy:
**1. Unit Tests:**
- Test mode detection hook
- Test role-based socket connection
- Test component rendering for each mode

**2. Integration Tests:**
- Test Socket.io event filtering by role
- Test meeting room navigation between modes
- Test permission enforcement

**3. E2E Tests:**
- Test complete user flows for each role
- Test mode switching scenarios
- Test watcher access to meetings

### Polish & Documentation
- [ ] Update documentation for three-view system
- [ ] Add user guidance for different meeting roles
- [ ] Performance optimization for role-based rendering
- [ ] Accessibility improvements for different views

#### Documentation Updates:
**1. User Documentation:**
- Update main README with three-view explanation
- Add role-specific user guides
- Document URL structure and mode parameters

**2. Developer Documentation:**
- Document component architecture
- Document Socket.io event filtering
- Document permission system

**3. API Documentation:**
- Document extended join-meeting event
- Document role-based event filtering
- Document new watcher role behavior

## Implementation Roadmap

### Phase 1: Backend Foundation (Week 1)
- [ ] **Day 1-2:** Extend Socket.io handlers for watcher role
- [ ] **Day 3:** Implement role-based event filtering
- [ ] **Day 4:** Add watcher validation logic
- [ ] **Day 5:** Test backend changes with existing functionality

### Phase 2: Frontend Architecture (Week 2)
- [ ] **Day 1-2:** Create mode detection hook and role-based socket connection
- [ ] **Day 3-4:** Build HostView, JoinView, WatchView wrapper components
- [ ] **Day 5:** Implement shared components and base queue display

### Phase 3: UI Implementation (Week 3)
- [ ] **Day 1-2:** Build HOST view (reuse facilitator components)
- [ ] **Day 3:** Build JOIN view (streamlined participant interface)
- [ ] **Day 4-5:** Build WATCH view (read-only observer interface)

### Phase 4: Integration & Testing (Week 4)
- [ ] **Day 1-2:** Integrate three views with Socket.io system
- [ ] **Day 3:** Add comprehensive tests for all roles
- [ ] **Day 4:** Update routing and navigation
- [ ] **Day 5:** Polish and bug fixes

### Phase 5: Documentation & Polish (Week 5)
- [ ] **Day 1-2:** Update user and developer documentation
- [ ] **Day 3:** Add accessibility improvements
- [ ] **Day 4:** Performance optimization
- [ ] **Day 5:** Final testing and deployment

## Migration Strategy

### Backward Compatibility
- **Existing URLs continue to work:**
  - `/meeting/:code` → `/meeting/:code?mode=join` (default)
  - `/facilitate/:code` → `/meeting/:code?mode=host`
- **No breaking changes to existing functionality**
- **Gradual rollout:** Start with new URLs, migrate existing ones later

### URL Migration Plan
1. **Phase 1:** Add new mode-based URLs alongside existing ones
2. **Phase 2:** Update internal links to use mode parameters
3. **Phase 3:** Add redirects from old URLs to new ones
4. **Phase 4:** Deprecate old URLs (optional)

### Component Migration
1. **Extract shared components** from existing facilitator/participant views
2. **Create mode-specific wrappers** that use shared components
3. **Add role-based props** to existing components
4. **Maintain existing component APIs** for backward compatibility

## Current State
- Manual Stack (`/manual`) - offline facilitation tool ✅
- Create Meeting (`/create`) - creates meeting with code ✅  
- Join Meeting (`/join`) - join with code as participant ✅
- Facilitate Meeting (`/facilitate`) - facilitator controls ✅
- Meeting Room (`/meeting/:code`) - participant view ✅

## Target State
- **HOST View** (`/meeting/:code?mode=host`) - full facilitator controls
- **JOIN View** (`/meeting/:code?mode=join`) - simplified participant interface  
- **WATCH View** (`/meeting/:code?mode=watch`) - read-only observer interface
- **Backward compatibility** with existing URLs maintained

## Success Metrics
- [ ] All three views render correctly for the same meeting
- [ ] Role-based permissions enforced (watchers can't control, participants can't manage)
- [ ] Socket.io events filtered appropriately by role
- [ ] Existing functionality unchanged
- [ ] Performance impact < 5% on existing features
- [ ] Accessibility maintained across all views

## Risk Mitigation
- **Risk:** Breaking existing functionality
  - **Mitigation:** Comprehensive testing, gradual rollout, backward compatibility
- **Risk:** Performance impact from role-based rendering
  - **Mitigation:** Lazy loading, component memoization, minimal re-renders
- **Risk:** Complex state management with multiple views
  - **Mitigation:** Clear separation of concerns, shared state management patterns
- **Risk:** User confusion with new interface
  - **Mitigation:** Clear documentation, intuitive mode switching, user guidance

## Technical Specifications

### API Changes
**Socket.io Events:**
```typescript
// Extended join-meeting event
interface JoinMeetingData {
  meetingCode: string;
  participantName: string;
  isFacilitator?: boolean;
  isWatcher?: boolean; // NEW
}

// Role-based participant object
interface Participant {
  id: string;
  name: string;
  isFacilitator: boolean;
  isWatcher: boolean; // NEW
  joinedAt: string;
  isInQueue: boolean;
  queuePosition: number | null;
}
```

**Event Filtering Rules:**
```typescript
const EVENT_FILTERS = {
  facilitator: [], // Receives all events
  participant: ['next-speaker', 'queue-managed', 'intervention-added'],
  watcher: ['next-speaker', 'queue-managed', 'intervention-added', 'participant-management']
};
```

### Component Specifications
**HostView Props:**
```typescript
interface HostViewProps {
  meetingCode: string;
  facilitatorName: string;
  meetingData: MeetingData;
  // All facilitator controls enabled
}
```

**JoinView Props:**
```typescript
interface JoinViewProps {
  meetingCode: string;
  participantName: string;
  meetingData: MeetingData;
  // Queue participation only
}
```

**WatchView Props:**
```typescript
interface WatchViewProps {
  meetingCode: string;
  watcherName: string;
  meetingData: MeetingData;
  // Read-only viewing only
}
```

### URL Structure
```
/meeting/:code?mode=host&name=FacilitatorName
/meeting/:code?mode=join&name=ParticipantName  
/meeting/:code?mode=watch&name=WatcherName
```

### State Management
**Meeting State:**
```typescript
interface MeetingState {
  meetingData: MeetingData;
  participants: Participant[];
  speakingQueue: QueueItem[];
  currentSpeaker: QueueItem | null;
  role: 'host' | 'join' | 'watch';
  permissions: PermissionSet;
}
```

**Permission Sets:**
```typescript
interface PermissionSet {
  canManageQueue: boolean;
  canControlSpeaker: boolean;
  canManageParticipants: boolean;
  canViewAnalytics: boolean;
  canJoinQueue: boolean;
  canMakeDirectResponse: boolean;
}
```

### Performance Considerations
- **Lazy Loading:** Load view-specific components only when needed
- **Memoization:** Use React.memo for expensive components
- **Event Throttling:** Throttle high-frequency Socket.io events
- **Bundle Splitting:** Separate bundles for each view mode

### Accessibility Requirements
- **ARIA Labels:** Clear role indicators for screen readers
- **Keyboard Navigation:** Full keyboard support for all views
- **Focus Management:** Proper focus handling when switching modes
- **Color Contrast:** Maintain WCAG AA compliance across all views

## Notes
- Keep existing routes and backend mostly unchanged
- Focus on UI/UX differentiation between the three views
- Maintain backward compatibility with current meeting system
- Consider jparty.tv's approach as inspiration for role-based interfaces
- Prioritize user experience and clear role separation
- Follow existing code patterns and component structure
- Ensure mobile responsiveness across all three views