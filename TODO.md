# Code Quality Improvements TODO

This document outlines the code quality issues identified by ESLint that need to be addressed to improve code maintainability, performance, and type safety.

## Priority 1: Critical Issues (Fix First)

### TypeScript Type Safety
- [ ] Replace `any` types with specific types in:
  - `src/components/MeetingRoom/HostSettingsPanel.tsx:13` - user parameter
  - `src/hooks/useMeetingActions.ts:13` - function parameters
  - `src/services/supabase.ts:819` - error handling
  - `src/test/setup.ts:89` - mock setup
  - `src/utils/errorMonitoring.ts:287` - error logging
  - `src/utils/productionLogger.ts` - multiple locations (lines 15, 42, 131, 137, 143, 149, 161, 166, 171, 192)

### Promise Handling Issues
- [ ] Fix floating promises (missing await/catch):
  - `src/components/MeetingRoom/HostSettingsPanel.tsx:39` - QR generation
  - `src/components/MeetingRoom/MeetingHeader.tsx:16` - meeting actions
  - `src/components/ui/editable-field.tsx:67` - form updates
  - `src/utils/errorHandling.ts:549, 554` - error logging
  - `src/utils/productionLogger.ts:100` - logging calls

- [ ] Fix misused promises (void return expected):
  - `src/components/MeetingRoom/ErrorState.tsx:84, 95` - error handlers
  - `src/components/MeetingRoom/HostSettingsPanel.tsx:109, 117` - participant actions
  - `src/pages/Auth.tsx:122, 154` - auth handlers
  - `src/pages/MeetingRoom.tsx:501, 505` - cleanup handlers
  - `src/hooks/useMeetingCleanup.ts:32, 36` - cleanup functions

## Priority 2: Code Quality Improvements

### Nullish Coalescing Operator
Replace `||` with `??` for safer null/undefined checks:
- [ ] `src/components/MeetingRoom/CodeInputForm.tsx:23`
- [ ] `src/components/shared/ErrorBoundary.tsx:43`
- [ ] `src/components/ui/progress.tsx:20`
- [ ] `src/hooks/useMeetingState.ts:125, 246`
- [ ] `src/hooks/useSpeakerTimer.ts:47, 77, 82`
- [ ] `src/hooks/useSpeakingHistory.ts:46`
- [ ] `src/integrations/supabase/client.ts:7, 10`
- [ ] `src/pages/MeetingRoom.tsx:361, 382, 558, 653`
- [ ] `src/utils/errorHandling.ts:397, 407, 409`
- [ ] `src/utils/errorMonitoring.ts:80, 82, 101, 276`
- [ ] `src/utils/productionLogger.ts:91, 152, 195, 198, 201, 204`

### Remove Unused Imports/Variables
- [ ] Clean up MeetingRoom.tsx unused imports:
  - `MeetingContext` (line 3)
  - `SbParticipant, SbQueueItem` (lines 29-30)
  - `validateParticipantName` (line 32)
  - `QRCode` (line 34)

- [ ] Remove unused variables:
  - `src/components/MeetingRoom/ErrorState.tsx:38` - `err` parameter
  - `src/components/ui/qr-code-scanner.tsx:37` - `_err` parameter
  - `src/hooks/useMeetingActions.ts:47, 50` - unused parameters
  - `src/pages/HomePage.tsx:6` - `MEETING_MODES`
  - `src/pages/MeetingRoom.tsx:444` - `_e` parameter
  - `src/vitest-globals.d.ts:6` - `MockInstance`

### Remove Console Statements
Replace development console.log statements with proper logging:
- [ ] `src/components/features/meeting/AddParticipants.tsx:61`
- [ ] `src/components/features/meeting/EnhancedEditableParticipantName.tsx:66`
- [ ] `src/components/shared/ErrorBoundary.tsx:28`
- [ ] `src/components/ui/editable-field.tsx:56`
- [ ] `src/hooks/useMeetingActions.ts:329`
- [ ] `src/hooks/useMeetingCleanup.ts:22, 43`
- [ ] `src/pages/MeetingRoom.tsx:87, 491, 512`
- [ ] `src/pages/NotFound.tsx:14`
- [ ] `src/services/supabase.ts:62, 782, 793`
- [ ] `src/utils/errorHandling.ts:542`
- [ ] `src/utils/errorMonitoring.ts:207, 276`
- [ ] `src/utils/productionLogger.ts:91, 112, 126`

## Priority 3: React Best Practices

### React Hooks Dependencies
- [ ] Fix missing dependencies in useEffect:
  - `src/hooks/useMeetingState.ts:151` - add `user` dependency
  - `src/pages/MeetingRoom.tsx:452` - add `params.code`, `setCurrentParticipantId`, `setError`
  - `src/pages/MeetingRoom.tsx:480` - add `setShowJohnDoe`

### Component Architecture
- [ ] Fix fast refresh issue:
  - `src/components/shared/ToastProvider.tsx:47` - Move non-component exports to separate file

## Priority 4: Code Cleanup

### Remove Unnecessary Code
- [ ] Remove useless return statements:
  - `src/hooks/useMeetingState.ts:289, 306`
  - `src/pages/MeetingRoom.tsx:424, 441`

- [ ] Remove unused function assignments:
  - `src/pages/MeetingRoom.tsx:145` - `handleJoinQueue`
  - `src/pages/MeetingRoom.tsx:179` - `handleReorderQueue`
  - `src/pages/MeetingRoom.tsx:265` - `handleEndMeeting`

### Async/Await Issues
- [ ] Fix incorrect await usage:
  - `src/components/features/meeting/AddParticipants.tsx:53`
  - `src/components/features/meeting/EnhancedEditableParticipantName.tsx:60`
  - `src/components/features/meeting/ParticipantList.tsx:34`

## Implementation Guidelines

### For Each Issue:
1. **Understand the context** - Read surrounding code to understand intended behavior
2. **Test changes** - Ensure functionality still works after modifications
3. **Follow TypeScript best practices** - Use specific types over `any`
4. **Maintain code readability** - Changes should improve, not obfuscate code

### Testing Strategy:
- Run `npm run build` after each change to ensure no compilation errors
- Run `npm run lint` to verify issues are resolved
- Test affected components manually to ensure functionality works
- Consider adding unit tests for critical changes

### Priority Strategy:
- Start with Priority 1 (critical issues) as they affect type safety and runtime behavior
- Move to Priority 2 for code quality improvements
- Address Priority 3 and 4 when time permits for polish

---

*Generated from ESLint analysis - 110 warnings identified across the codebase*</contents>
</xai:function_call">Read the TODO.md file to see the organized code quality improvements needed. This prioritizes issues by severity and provides actionable tasks for improving code quality, type safety, and maintainability.
