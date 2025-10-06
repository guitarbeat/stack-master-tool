# Changelog

## 2025-01-27 - Speaking Distribution for Local Meetings

### Summary

Added speaking distribution analytics feature for local meetings, providing pie chart visualization of speaking time distribution among participants. This feature was previously only available for remote meetings and is now available for both local and remote meeting types.

### Key Features

- **Speaking Distribution Charts**: Interactive pie charts showing speaking time distribution
- **Local Meeting Support**: Full speaking time tracking for manual/local meetings
- **Real-time Updates**: Charts update automatically as participants speak
- **Watch View Integration**: Speaking distribution visible in local meeting watch views
- **Timer Integration**: Automatic speaking time tracking with pause/resume functionality
- **Direct Response Tracking**: Option to include or exclude direct responses in analytics

### Technical Changes

- **Enhanced useUnifiedFacilitator**: Added speaking history and timer functionality for local meetings
- **Updated useLocalWatch**: Added speaking distribution data to local meeting watch views
- **Enhanced WatchView**: Added speaking distribution chart display for local meetings
- **Updated UnifiedFacilitator**: Speaking distribution now shows for both local and remote meetings
- **Speaking Time Tracking**: Automatic tracking of speaking segments with proper timer management

### Documentation Updates

- **New Speaking Distribution Guide**: Comprehensive guide for using speaking analytics
- **Updated Facilitation Guide**: Added section on using speaking distribution for facilitation
- **Updated Three Meeting Views**: Added speaking distribution to watch view features
- **Updated README**: Added speaking distribution features to core functionality

### Impact

- **Improved Facilitation**: Facilitators can now monitor participation balance in local meetings
- **Enhanced Analytics**: Consistent speaking analytics across all meeting types
- **Better Watch Experience**: Observers can see participation patterns in local meetings
- **Inclusive Meetings**: Data helps ensure balanced participation and inclusive discussions

## 2025-08-22 - Frontend Consolidation

### Summary

This update consolidates the previously separate `frontend` application into the main `src` directory of the `stack-master-tool` repository. This streamlines the codebase by removing redundancy and improving overall organization. The `simple-backend` remains a separate entity but is now integrated with the consolidated frontend.

### Key Changes

- **Frontend Integration**: The `frontend` directory's contents (specifically `src`) have been moved into `src/frontend` within the main repository.
- **Dependency Management**: Dependencies from the old `frontend/package.json` have been merged into the root `package.json`.
- **Configuration Updates**: `vite.config.ts` and `tsconfig.json` have been updated to reflect the new file structure and ensure proper path resolution.
- **Route Merging**: The routes defined in the old `frontend/App.jsx` have been integrated into the main `src/App.tsx` file.
- **CSS Fix**: A circular dependency issue in `src/index.css` related to the `.fade-in` utility has been resolved.

### Impact

- **Streamlined Development**: A single frontend codebase simplifies development, maintenance, and deployment.
- **Reduced Redundancy**: Eliminates duplicate configurations and dependencies.
- **Improved Organization**: All frontend-related code is now under a single, logical structure.

### Future Considerations

- Further refactoring of components and services within `src/frontend` to align with the main application's architecture.
- Potential migration of `simple-backend` into a monorepo structure if further consolidation is desired.
