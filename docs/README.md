# Documentation

Welcome to the Stack Facilitation App documentation.

## Contents

- **Three Meeting Views**: [HOST, JOIN, WATCH Specification](host-join-watch-spec.md)
- **Implementation Status**: [Three Views TODO](todo-three-views.md)
- Getting Started: [Quick Start](QUICK_START.md)
- Development Setup: [Development Environment](DEVELOPMENT.md)
- Environment Configuration: [Environment Setup](ENVIRONMENT_SETUP.md)
- Deployment: [Deployment](DEPLOYMENT.md)
- Facilitation Guide: [Facilitation Guide](FACILITATION_GUIDE.md)
- Moderation Guide: [Moderation Guide](MODERATION_GUIDE.md)
- Architecture / Rebuild Plan: [Rebuild Plan](REBUILD_PLAN.md)

## Three Meeting Views

The app now supports three distinct ways to interact with meetings:

1. **HOST** - Full facilitator controls and meeting management
2. **JOIN** - Participant view with queue interaction capabilities
3. **WATCH** - Public read-only observer view (no authentication required)

### URL Structure

- **`/meeting/ABC123?mode=host`** - Host view (facilitator controls)
- **`/meeting/ABC123?mode=join`** - Join view (participant actions) - _default_
- **`/watch/ABC123`** - Public watch view (read-only, no auth)

## Notes
