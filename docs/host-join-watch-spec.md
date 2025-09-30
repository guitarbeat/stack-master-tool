## HOST, JOIN, WATCH — Product Spec

### Summary
Replace the existing "Create" button with "HOST" and introduce three primary call-to-action buttons: HOST, JOIN, and WATCH. These entry points map to creating/starting a new session (HOST), entering an existing session (JOIN), and viewing a session without participating (WATCH).

### Goals
- Make intent explicit and reduce ambiguity around session entry points.
- Support three distinct user intents: start, participate, observe.
- Keep flows lightweight with clear permissions and minimal friction.

### Primary Actions
- **HOST**: Starts a new session/room as the owner. Generates a shareable code/link.
- **JOIN**: Enters an existing session with full participant capabilities (unless restricted by host).
- **WATCH**: Enters an ongoing session in view-only mode with no interaction privileges.

### Button Label and Placement
- Replace all instances of the "Create" primary CTA with "HOST" where it previously started a new session.
- Top-level CTAs on landing/home: order: HOST (primary), JOIN (secondary), WATCH (tertiary).
- Mobile: stack vertically; Desktop: horizontal group with visual hierarchy.

### Flows
1. HOST Flow
   - Action: Click HOST
   - Steps: Optional preflight (title, privacy, permissions) → Create session → Land in host view
   - Output: Session ID, share link, participant code; copy affordance shown immediately
   - Permissions: Host is owner with full controls

2. JOIN Flow
   - Action: Click JOIN
   - Input: Session code or full link; support paste detection
   - Validation: Existence check, capacity, access controls, ban list
   - Result: Participant joins with standard permissions

3. WATCH Flow
   - Action: Click WATCH
   - Selection: Enter code/link, or browse/jump to featured/public sessions (if enabled)
   - Permissions: View-only, no write, no mic/cam unless explicitly allowed by host
   - Upgrade Path: Inline prompt/button to request JOIN or the host can promote

### Roles and Permissions
- Host: full controls (end session, kick/ban, mute all, toggle watch-only, promote watcher → participant)
- Participant: interact as allowed (speak/edit/react), cannot change global settings
- Watcher: view-only; can follow camera/cursor, see chat if allowed; reactions optional

### Session States
- Not Started → Starting → Live → Paused (optional) → Ended/Archived
- WATCH is only available when Live or when replay is enabled

### UI Behavior
- Disabled JOIN/WATCH if session does not exist or is not live (contextual messaging)
- Clear empty/error states: invalid code, session full, access denied
- Loading states on transitions (skeletons/spinners, 300–700ms min for clarity)

### Copy and Microcopy
- HOST: "Start a new session"
- JOIN: "Enter a code or paste a link"
- WATCH: "View a live session in read-only mode"
- Errors: "That code doesn’t look right", "This session is full", "Access denied"

### Routing
- HOST → `/host` → creates → redirect to `/s/{sessionId}` (host view)
- JOIN → `/join` → validate → redirect to `/s/{sessionId}` (participant view)
- WATCH → `/watch` → code/link → redirect to `/s/{sessionId}?mode=watch`

### API and Data
- POST `/api/sessions` { title?, privacy, allowWatch?: boolean }
- GET `/api/sessions/{id}` for validation and state
- POST `/api/sessions/{id}/join` → returns role: participant | watcher
- POST `/api/sessions/{id}/promote` (host-only)

### Telemetry
- Track impressions and clicks for HOST/JOIN/WATCH
- Funnel: HOST created → link copied → first participant joined
- JOIN failure reasons (invalid/denied/full)
- WATCH retention and upgrade-to-join requests

### Access Control
- Privacy: public | unlisted (code/link required) | invite-only
- Watch policy: enabled | disabled | host-approval
- Rate-limit join attempts per IP/user

### Accessibility
- Buttons: semantic `<button>` with role and labels
- Keyboard nav: TAB order HOST → JOIN → WATCH
- Color contrast AA+, focus-visible styles, screen reader hints for modes

### Edge Cases
- Host disconnects: auto-assign co-host? or freeze controls until return
- Session capacity reached: queue with notification or deny
- Code expiry/rotation: invalidate old links on end

### Migration Notes (Replace "Create" → "HOST")
- Replace visible labels where "Create" meant start session.
- Audit routes/components: `CreateSession*` → `HostSession*` (names optional but recommended for clarity).
- Update tests, i18n keys, and analytics events accordingly.

### Open Questions
- Should WATCH be allowed on private sessions with a direct link?
- Do watchers see chat by default, or only if toggled on by host?
- Max participants/watchers and default limits?

