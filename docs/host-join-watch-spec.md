## HOST, JOIN, WATCH — App-Specific Spec (Stack Facilitation)

This app facilitates democratic meetings with a real-time speaking queue. Today it supports creating meetings (facilitator), joining by code (participant), and live facilitation; there is no watch-only role yet.

### Scope of this change
- Replace the user-facing label "Create" with "HOST" wherever it starts a meeting.
- Keep current routes and backend as-is; this is a copy/UX change only.
- Document an optional future WATCH concept without implying it exists now.

### Current flows (as implemented)
- HOST (currently labeled "Create")
  - Route: `/create`
  - Page/components: `src/pages/CreateMeeting.tsx`, `src/components/meeting/MeetingCreationForm.tsx`
  - Backend: `POST /api/meetings` returns `{ meetingCode, meetingId, shareUrl }` via `backend/routes/meetings.js`
  - After creation, facilitator can navigate to `/facilitate/{code}` to run the meeting.
- JOIN
  - Route: `/join`
  - Page: `src/pages/JoinMeeting.tsx`
  - Validates 6-char meeting code, then navigates to `/meeting/{code}` as a participant.
- Facilitate existing meeting
  - Card links to `/facilitate` (entry to facilitation tools) and `/facilitate/{code}` when starting a created meeting.

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

### Acceptance criteria for this doc’s scope
- All visible user-facing "Create" labels that start a meeting are updated to "Host".
- Home cards reflect "Host Meeting" and JOIN remains unchanged.
- No behavior, routes, or API changes required.
- WATCH is mentioned only as future work, not implied to exist now.


