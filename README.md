# 🎯 Stack Master Tool

**Meeting Facilitation Made Simple**

A modern React TypeScript application for democratic meeting facilitation with real-time speaking queues and analytics.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build:prod
```

## 📊 Version Information

The application includes automated version tracking powered by Aaron's Love ❤️

**Current Version:**
```bash
# Check current version info
node scripts/update-version.js
```

**Version Display:**
- **Footer**: Shows fun, randomized "Powered by Aaron's Love" messages
- **Dev Mode**: Click "Dev Build" for detailed version information
- **Production**: Clean, professional version display

**Build-time Information:**
- Package version from `package.json`
- Git commit hash and branch
- Build timestamp
- Environment detection

**Version Management:**
```bash
# Bump version (updates package.json, creates git commit and tag)
npm version 1.1.0

# Or use the custom script
node scripts/update-version.js 1.1.0
```

## 📁 Project Structure

```
📦 Stack Master Tool
├── 📂 src/                 # Application source code
├── 📂 config/              # Configuration files
├── 📂 docs/                # Documentation
│   ├── 📄 README.md        # Full documentation
│   └── 📂 development/     # Development guides
├── 📂 android/             # Android mobile app
├── 📂 ios/                 # iOS mobile app
└── 📄 package.json         # Dependencies and scripts
```

## 📚 Documentation

- **[📖 Documentation Index](docs/index.md)** - Complete documentation guide
- **[🚀 Full Documentation](docs/README.md)** - Setup and usage guide
- **[⚙️ Production Setup](docs/ENVIRONMENT_SETUP.md)** - Environment configuration
- **[📋 Deployment](docs/PRODUCTION_CHECKLIST.md)** - Production deployment checklist

## 🛠️ Development

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# Testing
pnpm test

# Mobile development
pnpm cap:sync          # Sync mobile platforms
pnpm cap:build:android # Build Android app
pnpm cap:build:ios     # Build iOS app
```

## 🌟 Key Features

- ✅ **Three-Mode Architecture** - HOST (facilitate), JOIN (participate), WATCH (observe) - inspired by jparty.tv
- ✅ **Real-time Speaking Queues** - Live queue management
- ✅ **Meeting Analytics** - Speaking time distribution charts
- ✅ **Display-Optimized Watch Mode** - Perfect for projection screens and observers
- ✅ **Cross-platform** - Web + Mobile (iOS/Android)
- ✅ **Type-safe** - Full TypeScript coverage
- ✅ **Production-ready** - Optimized builds and security

---

**Need help?** Check the [full documentation](docs/README.md) for detailed guides.
