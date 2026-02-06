

# Fix All TypeScript Build Errors

## Overview

There are 5 categories of errors to fix across the codebase. All stem from type mismatches introduced during recent refactoring.

---

## Error Categories and Fixes

### 1. `src/services/supabase.ts` - withSupabase returns `unknown` (majority of errors)

**Root cause**: The `withSupabase` wrapper calls `executeSupabase` which expects `(client) => Promise<T>`, but Supabase query builders return `PostgrestBuilder` (thenable, not a real `Promise`). TypeScript can't infer `T` and falls back to `unknown`.

**Fix**: Change the `execute` method signatures in `connection-manager.ts` and `client.ts` to accept `PromiseLike<T>` instead of `Promise<T>`. This makes them compatible with Postgrest builders while preserving type inference.

Files changed:
- `src/integrations/supabase/connection-manager.ts` - Update `execute` and `runWithRetry` parameter types from `Promise<T>` to `PromiseLike<T>`
- `src/integrations/supabase/client.ts` - Update `executeSupabase` parameter type from `Promise<T>` to `PromiseLike<T>`

Also add `facilitatorId` to the return object in `getMeeting` (line ~320).

### 2. `src/App.test.tsx` and `button.test.tsx` - Missing `screen`/`fireEvent` exports

**Root cause**: `@testing-library/react` may not be resolving correctly, or the installed version doesn't match the expected exports.

**Fix**: Add explicit `import { render, screen, fireEvent } from '@testing-library/react'` at the top of each test file (they already have this - the issue is likely the package version). Verify `@testing-library/react` is properly installed. If the type declarations are missing, add `@types/testing-library__react` or ensure `@testing-library/react` version >= 14 which bundles types.

Files changed:
- `src/App.test.tsx` - Already imports correctly; no code change needed if package is correct
- `src/components/ui/__tests__/button.test.tsx` - Same

If the package version is the issue, ensure `package.json` has `@testing-library/react` >= 14.

### 3. `src/services/p2p/p2p-meeting-service.test.ts` - SignalingManager mock type mismatch

**Root cause**: The mock only has `connect` and `disconnect` but `SignalingManager` has many more properties. TypeScript rejects the `as SignalingManager` cast.

**Fix**: Cast through `unknown` first: `as unknown as SignalingManager`.

File changed:
- `src/services/p2p/p2p-meeting-service.test.ts` line 53-56

### 4. `src/services/p2p/p2p-meeting-service.ts` - Status comparison type error

**Root cause**: `P2PConnectionStatus` is `"connecting" | "disconnected" | "error"` but the code compares it to `"connected"`. The `MeetingSync.status` getter actually returns `P2PConnectionStatus` which includes `"connected"` in its definition in `types.ts`.

**Fix**: The issue is that `sync.status` type is being narrowed incorrectly. The `P2PConnectionStatus` type in `types.ts` already includes `"connected"`. The error says `'"connecting" | "disconnected" | "error"'` which suggests the type is being imported/resolved without `"connected"`. Check the actual `P2PConnectionStatus` type - it does include `"connected"`, so this may be a stale type cache issue. No code change needed if the type is correct. If the build still complains, add a type assertion.

### 5. `src/services/supabase-meeting-adapter.ts` - Spread adapter loses methods

**Root cause**: `{ ...adapter, realtime }` creates a plain object that loses the class methods because they're on the prototype, not own properties.

**Fix**: Use `Object.assign` or explicitly list all methods. Simplest fix: use `Object.assign(Object.create(Object.getPrototypeOf(adapter)), adapter, { realtime })` or restructure to return an object that delegates to the adapter.

File changed:
- `src/services/supabase-meeting-adapter.ts` lines 175-185

---

## Implementation Order

1. Fix `connection-manager.ts` and `client.ts` (`PromiseLike<T>`) -- fixes all ~30 supabase.ts errors at once
2. Fix `supabase.ts` missing `facilitatorId` in `getMeeting` return
3. Fix `supabase-meeting-adapter.ts` spread issue
4. Fix `p2p-meeting-service.test.ts` cast
5. Fix `p2p-meeting-service.ts` status comparison
6. Verify test file imports resolve correctly

---

## Technical Details

### connection-manager.ts changes (lines 151-153, 182-184)

```typescript
// Before
operation: (client: SupabaseClient<Database>) => Promise<T>
// After
operation: (client: SupabaseClient<Database>) => PromiseLike<T>
```

### supabase-meeting-adapter.ts fix (lines 178-185)

```typescript
// Before: spread loses prototype methods
return { ...adapter, realtime };

// After: properly combine
return Object.assign(adapter, { realtime }) as IMeetingServiceWithRealtime;
```

### p2p-meeting-service.test.ts fix (line 53)

```typescript
// Before
} as SignalingManager
// After  
} as unknown as SignalingManager
```

