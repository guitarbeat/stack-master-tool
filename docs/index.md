# 📚 Documentation Index

Welcome to the Stack Master Tool documentation! This directory contains all project documentation organized by purpose.

## 📖 Core Documentation

| Document                                               | Purpose                                           | Audience          |
| ------------------------------------------------------ | ------------------------------------------------- | ----------------- |
| **[README.md](README.md)**                             | Complete project overview, setup, and usage guide | All users         |
| **[AI_RULES.md](AI_RULES.md)**                         | Development guidelines and coding standards       | Developers        |
| **[PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)** | Production deployment checklist                   | DevOps/Deployers  |
| **[ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)**       | Environment configuration guide                   | Developers/DevOps |

## 🏗️ Infrastructure & Deployment

### [deployment/](deployment/) - Deployment Configurations

- `render.yaml` - Render static site deployment
- `vercel.json` - Vercel deployment configuration
- `netlify.toml` - Netlify deployment configuration
- `deploy/deploy.sh` - Generic deployment script

### [build/](build/) - Build Infrastructure

- `_headers` - Security headers for static hosting
- `nginx.conf` - Nginx configuration template
- `docker/` - Docker configurations
- `scripts/` - Build and deployment scripts

## 📋 Project Management

| Document         | Purpose                           |
| ---------------- | --------------------------------- |
| **CHANGELOG.md** | Version history and release notes |
| **LICENSE**      | MIT license terms                 |

## 🔄 Migration & History

| Document                  | Purpose                                              |
| ------------------------- | ---------------------------------------------------- |
| **MIGRATION_COMPLETE.md** | Complete migration documentation (Render → Supabase) |

## 📂 Directory Structure

```
docs/
├── 📄 index.md              # This file - documentation navigation
├── 📄 README.md             # Main project documentation
├── 📄 AI_RULES.md           # Development guidelines
├── 📄 PRODUCTION_CHECKLIST.md # Production deployment guide
├── 📄 ENVIRONMENT_SETUP.md # Environment configuration
├── 📄 CHANGELOG.md          # Release notes
├── 📄 LICENSE               # License information
├── 📄 MIGRATION_COMPLETE.md # Migration documentation
├── 📁 deployment/           # All deployment configurations
└── 📁 build/               # Build and infrastructure configs
```

## 🚀 Quick Start

1. **New to the project?** → Start with [README.md](README.md)
2. **Setting up development?** → Check [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)
3. **Deploying to production?** → Follow [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)
4. **Contributing code?** → Read [AI_RULES.md](AI_RULES.md)

## 📞 Support

- **Issues**: Check [README.md](README.md) troubleshooting section
- **Migration**: See [MIGRATION_COMPLETE.md](MIGRATION_COMPLETE.md)
- **Deployment**: Follow [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)

---

_Documentation last updated: October 8, 2025_
