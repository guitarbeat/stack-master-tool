
# Hybrid P2P Architecture Migration Plan

## Phase 0: Fix Build Error (Immediate)

The current build is broken due to a stale type reference in `src/hooks/useMeetingRealtime.ts`.

### File: src/hooks/useMeetingRealtime.ts
**Line 30**: Replace `SbParticipant[]` with `Participant[]`

```typescript
// Before
onParticipantsUpdated: (participants: SbParticipant[]) => {

// After
onParticipantsUpdated: (participants: Participant[]) => {
```

---

## Phase 1: Add P2P Dependencies

Install the required libraries for CRDT-based state synchronization:

```bash
npm install yjs y-webrtc
npm install -D @types/yjs
```

| Library | Purpose |
|---------|---------|
| **yjs** | CRDT library for conflict-free distributed state |
| **y-webrtc** | WebRTC provider for Yjs - handles peer discovery via signaling |

---

## Phase 2: Create P2P Sync Layer

### New File: src/services/p2p/types.ts
Define P2P-specific types for the meeting state:

```typescript
export interface P2PMeetingState {
  participants: Map<string, Participant>;
  queue: QueueItem[];
  title: string;
  facilitatorId: string;
}

export interface P2PConfig {
  roomCode: string;
  signalingServers?: string[];
  password?: string;
}
```

### New File: src/services/p2p/meeting-sync.ts
Core CRDT document manager using Yjs:

- Initialize a `Y.Doc` for each meeting room
- Create shared types: `Y.Map` for participants, `Y.Array` for queue
- Handle local mutations that automatically sync to peers
- Observe remote changes and emit callbacks

### New File: src/services/p2p/signaling.ts
Wrapper around y-webrtc with fallback signaling servers:

- Use public WebRTC signaling servers initially
- Option to configure custom signaling server
- Handle peer connection lifecycle

---

## Phase 3: Create Unified Meeting Service Interface

### New File: src/services/meeting-service.ts
Abstract interface that both Supabase and P2P backends implement:

```typescript
export interface IMeetingService {
  createMeeting(title: string, facilitatorName: string): Promise<MeetingData>;
  getMeeting(code: string): Promise<MeetingWithParticipants | null>;
  joinMeeting(code: string, name: string): Promise<Participant>;
  joinQueue(meetingId: string, participantId: string): Promise<QueueItem>;
  leaveQueue(meetingId: string, participantId: string): Promise<void>;
  nextSpeaker(meetingId: string): Promise<QueueItem | null>;
  // ... other methods
}

export interface IMeetingRealtime {
  subscribe(meetingId: string, callbacks: RealtimeCallbacks): () => void;
}
```

### Refactor: src/services/supabase.ts
Implement `IMeetingService` interface (no behavior changes, just conformance).

### New File: src/services/p2p/p2p-meeting-service.ts
P2P implementation of `IMeetingService`:

- `createMeeting`: Generate room code, initialize Yjs document
- `getMeeting`: Sync Yjs state and return current snapshot
- `joinMeeting`: Add participant to Y.Map
- Queue operations: Manipulate Y.Array with CRDT guarantees

---

## Phase 4: Minimal Backend for Discovery (Hybrid Approach)

The fully P2P approach requires a minimal signaling/discovery layer. Options:

### Option A: Keep Supabase for Discovery Only
- Use existing `meetings` table just for room code lookup
- Store only: `id`, `meeting_code`, `peer_id`, `created_at`
- All live state (participants, queue) syncs via P2P

### Option B: Use Public Signaling Server
- y-webrtc includes default public signaling servers
- Room code becomes the signaling room name
- No custom backend needed (but less reliable)

**Recommended**: Option A for reliability with minimal Supabase usage.

---

## Phase 5: Update Hooks to Use Unified Service

### Refactor: src/hooks/useMeetingState.ts
Add service provider selection:

```typescript
const [backend, setBackend] = useState<'supabase' | 'p2p'>('supabase');
const meetingService = backend === 'p2p' 
  ? P2PMeetingService 
  : SupabaseMeetingService;
```

### Refactor: src/hooks/useMeetingRealtime.ts
Use the unified realtime interface that works with either backend.

---

## Phase 6: UI Toggle for P2P Mode

### Update: src/components/MeetingRoom/HostSettingsPanel.tsx
Add toggle switch for "P2P Mode (Experimental)":

- Saves preference to localStorage
- Shows warning about public signaling limitations
- Allows facilitator to choose sync method when creating room

---

## Architecture Diagram

```text
+------------------+      +-------------------+
|   React UI       |      |   React UI        |
| (MeetingRoom.tsx)|      | (InlineRoomBrowser)|
+--------+---------+      +---------+---------+
         |                          |
         v                          v
+------------------------------------------+
|         Unified Meeting Service          |
|    (IMeetingService interface)           |
+--------+-----------------+---------------+
         |                 |
   +-----+-----+     +-----+-----+
   | Supabase  |     |    P2P    |
   |  Service  |     |  Service  |
   +-----------+     +-----+-----+
         |                 |
         v                 v
+-------------+    +---------------+
| PostgreSQL  |    | Yjs + WebRTC  |
| (meetings,  |    | (CRDT sync)   |
| participants|    +-------+-------+
| queue)      |            |
+-------------+    +-------v-------+
                   | Signaling Svr |
                   | (y-webrtc)    |
                   +---------------+
```

---

## Migration Summary

| Step | Files Changed | Effort |
|------|---------------|--------|
| 0. Fix build error | `useMeetingRealtime.ts` | 5 min |
| 1. Add dependencies | `package.json` | 5 min |
| 2. P2P sync layer | New files in `src/services/p2p/` | 2-3 hrs |
| 3. Unified interface | `meeting-service.ts` + refactors | 1-2 hrs |
| 4. Discovery backend | Supabase migration or signaling | 1 hr |
| 5. Hook refactors | `useMeetingState.ts`, `useMeetingRealtime.ts` | 1-2 hrs |
| 6. UI toggle | `HostSettingsPanel.tsx` | 30 min |

---

## Tradeoffs

| Aspect | Current (Supabase) | Hybrid P2P |
|--------|-------------------|------------|
| **Latency** | ~50-100ms (server round-trip) | ~10-50ms (direct peer) |
| **Reliability** | High (managed infra) | Medium (depends on peers) |
| **Offline** | No | Partial (local CRDT state) |
| **Room Discovery** | Database query | Still needs server |
| **Cost** | Supabase usage fees | Minimal (signaling only) |
| **Complexity** | Lower | Higher |
| **Max Participants** | Unlimited | ~10-20 (WebRTC mesh limit) |

---

## Recommendation

Start with **Phase 0-2** to fix the build and create the P2P foundation. This allows experimentation without breaking existing functionality. The hybrid approach (Option A) is best because:

1. Room codes still work via Supabase lookup
2. InlineRoomBrowser remains functional
3. Users can opt-in to P2P per-room
4. Fallback to Supabase if P2P fails
