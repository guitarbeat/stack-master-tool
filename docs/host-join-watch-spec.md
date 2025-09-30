## HOST, JOIN, WATCH — App-Specific Spec (Stack Facilitation)

This app facilitates democratic meetings with a real-time speaking queue. Today it supports creating meetings (facilitator), joining by code (participant), and live facilitation; there is no watch-only role yet.

### Scope of this change
- Replace the user-facing label "Create" with "HOST" wherever it starts a meeting.
- Keep current routes and backend as-is; this is a copy/UX change only.
- Document an optional future WATCH concept without implying it exists now.

### Current flows (as implemented)
1. **Manual Stack** (`/manual`)
   - Offline facilitation tool
   - No meeting creation or codes needed
   - Direct stack management without networking
   - Perfect for in-person meetings

2. **HOST (currently labeled "Create")** (`/create`)
   - Page/components: `src/pages/CreateMeeting.tsx`, `src/components/meeting/MeetingCreationForm.tsx`
   - Backend: `POST /api/meetings` returns `{ meetingCode, meetingId, shareUrl }` via `backend/routes/meetings.js`
   - After creation, facilitator can navigate to `/facilitate/{code}` to run the meeting.

3. **JOIN** (`/join`)
   - Page: `src/pages/JoinMeeting.tsx`
   - Validates 6-char meeting code, then navigates to `/meeting/{code}` as a participant.

4. **Facilitate Meeting** (`/facilitate` or `/facilitate/{code}`)
   - Facilitator controls for an active meeting
   - Real-time queue management via Socket.io
   - Participant management and meeting controls

5. **Meeting Room** (`/meeting/{code}`)
   - Participant view in an active meeting
   - Can join speaking queue, make responses
   - Real-time updates via Socket.io

### What to rename (UI copy only)
- Buttons and headings:
  - "Create Meeting" → "Host Meeting"
  - "Creating Meeting..." → "Hosting Meeting..."
  - Any CTA like "Start Creating" → "Host Now"
- Navigation/links:
  - On join page footer: "Create a meeting" → "Host a meeting"
- Cards on home (`src/components/ActionCards.tsx`):
  - Title: "Create Meeting" → "Host Meeting"
  - CTA: "Start Creating" → "Host Now"
  - Keep destination `to: "/create"` for now. Optionally add `/host` as an alias later.

### Labels we will NOT change in this pass
- Routes remain `/create`, `/join`, `/meeting/:code`, `/facilitate`, `/facilitate/:code`.
- API names and backend responses remain unchanged.
- Tests may continue targeting "Create Meeting" until code changes are made; after UI copy update, tests referencing that text must be updated accordingly.

### WATCH (not implemented today)
- Not present in UI or API. If added later:
  - UI: Add a tertiary action on home: "Watch" that opens a simple form to enter a code.
  - Route: `/watch` → redirect to `/meeting/{code}?mode=watch`.
  - Behavior: read-only view; no queue interactions. Requires frontend permission checks and server support (none today).

### Three Meeting Views (future concept)
1. **HOST View** (Facilitator Controls)
   - Similar to current `/manual` or `/facilitate` pages
   - Full facilitator dashboard with all controls
   - Speaking queue management, participant management, meeting settings
   - All the power tools facilitators need

2. **JOIN View** (Participant Actions)  
   - Simplified interface focused on queue participation
   - Just essential buttons: "Join Speaking Queue", "Make Direct Response", "Point of Information", "Clarification Request"
   - Queue view showing current speaker, your position, who's ahead/behind
   - Clean, minimal UI - no facilitator clutter

3. **WATCH View** (Observer)
   - Read-only queue view
   - See current speaker and full queue
   - Participant list (names only)
   - Meeting info and progress
   - No interaction buttons
   - Stream-like interface for observers

### Acceptance criteria for this doc’s scope
- All visible user-facing "Create" labels that start a meeting are updated to "Host".
- Home cards reflect "Host Meeting" and JOIN remains unchanged.
- No behavior, routes, or API changes required.
- WATCH is mentioned only as future work, not implied to exist now.


