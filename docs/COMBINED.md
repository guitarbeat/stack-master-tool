# Documentation Compendium

This file consolidates all Markdown documents from the `docs` directory into a single navigable document.

## Table of Contents

- [Consolidation Plan](#consolidation-plan)
- [Deployment](#deployment)
- [Development Environment Setup](#development-environment-setup)
- [Environment Setup Guide](#environment-setup-guide)
- [Error Handling System](#error-handling-system)
- [Facilitation Guide for Stack-Based Meetings](#facilitation-guide-for-stack-based-meetings)
- [Moderation Guide for Stack Facilitation Meetings](#moderation-guide-for-stack-facilitation-meetings)
- [Quick Start](#quick-start)
- [Rebuild Plan](#rebuild-plan)
- [Three Meeting Views Implementation - COMPLETED ✅](#three-meeting-views-implementation---completed-)

---

## Consolidation Plan

L1:# Consolidation Plan
L2:
L3:## Current Structure Analysis
L4:
L5:The repository currently contains two distinct frontend applications:
L6:
L7:1.  **Root-level Frontend (`./src`)**: This application uses React with Vite, Shadcn UI, and TypeScript. It appears to be the more feature-rich and actively developed frontend, judging by the number of dependencies and components.
L8:2.  **`frontend/` Directory Frontend**: This is another React application, also using Vite, but with a simpler setup (less dependencies, no Shadcn UI). It seems to be an older or simpler version of the frontend, possibly for a specific 
L9:
L10:
L11:purpose (e.g., a simple facilitation app as indicated by its `package.json` name `stack-facilitation-simple`).
L12:
L13:There is also a `simple-backend` directory, which is a Node.js application using Express and Socket.io.
L14:
L15:## Redundancies and Opportunities
L16:
L17:-   **Duplicate Frontend Implementations**: The most significant redundancy is the presence of two separate frontend applications. The root-level frontend seems to be the primary one, and the `frontend/` directory likely contains an older or less complete version. Consolidating these into a single, unified frontend is crucial.
L18:-   **Shared UI Components**: Both frontends might have similar UI components or functionalities that can be abstracted into a shared library or a single component system.
L19:-   **Backend Integration**: The `simple-backend` serves as the API for the frontend. Its integration needs to be seamless with the consolidated frontend.
L20:
L21:## Proposed Consolidated Structure
L22:
L23:The goal is to have a single, unified frontend application and a clear separation between frontend and backend.
L24:
L25:```
L26:stack-master-tool/
L27:├── src/                 # Consolidated frontend application (React, Vite, TypeScript, Shadcn UI)
L28:│   ├── assets/
L29:│   ├── components/
L30:│   ├── hooks/
L31:│   ├── lib/
L32:│   ├── pages/
L33:│   ├── App.tsx
L34:│   ├── index.css
L35:│   └── main.tsx
L36:├── backend/             # Renamed simple-backend to backend (Node.js, Express, Socket.io)
L37:│   ├── server.js
L38:│   ├── package.json
L39:│   └── ...
L40:├── public/              # Static assets for the consolidated frontend
L41:├── docs/                # Documentation
L42:├── deploy/              # Deployment scripts
L43:├── docker/              # Docker related files
L44:├── package.json         # Root package.json for monorepo setup (if needed) or main frontend
L45:├── tsconfig.json
L46:├── vite.config.ts
L47:├── tailwind.config.ts
L48:├── postcss.config.js
L49:├── ...
L50:```
L51:
L52:## Consolidation Steps
L53:
L54:1.  **Migrate `frontend/` content**: Carefully review the `frontend/` directory. Identify any unique features, components, or logic that are not present in the root-level `src/` frontend. Migrate these necessary parts into the `src/` directory, adapting them to the existing structure and technologies (e.g., TypeScript, Shadcn UI).
L55:2.  **Remove `frontend/` directory**: Once all necessary components and logic are migrated, delete the `frontend/` directory.
L56:3.  **Rename `simple-backend`**: Rename the `simple-backend` directory to `backend` for clarity and consistency.
L57:4.  **Update References**: Ensure all internal references (imports, file paths) are updated to reflect the new consolidated structure.
L58:5.  **Review `package.json` files**: Consolidate dependencies where possible. The root `package.json` should contain all necessary dependencies for the unified frontend. The `backend/package.json` will remain for the backend dependencies.
L59:6.  **Testing**: Thoroughly test the application to ensure all functionalities are working as expected after consolidation.
L60:7.  **Documentation**: Update `README.md` and any other relevant documentation to reflect the new repository structure and architectural decisions.
L61:
L62:
---

## Deployment

L1:# Deployment
L2:
L3:This project uses a simple split architecture: a Node backend (`simple-backend/`) and a static React frontend (`frontend/`). We recommend deploying on Render, which supports both a Node Web Service and a static site on its generous free tier.
L4:
L5:- Backend: Express + Socket.io (real-time), binds to 0.0.0.0 and uses the `PORT` environment variable.
L6:- Frontend: Vite-built static site, configured via `VITE_API_URL`.
L7:- Legacy: Root `render.yaml`, `docker-compose.yml`, and `docker/` target an older stack and are not used for the current app.
L8:
L9:## Strategy
L10:
L11:- Deploy `simple-backend/` as a Node Web Service
L12:- Deploy `frontend/` as a Static Site
L13:- Set the frontend `VITE_API_URL` to your backend’s URL
L14:- Optionally set backend `FRONTEND_URL` so `/join/:code` redirects to your live frontend
L15:
L16:Note: Do not set a fixed `PORT` value on Render. Render automatically provides `PORT` to your service.
L17:
L18:## Deploy to Render
L19:
L20:### 1) Backend (Web Service)
L21:
L22:- New → Web Service → Connect repo
L23:- Settings:
L24:  - Name: `stack-facilitation-backend`
L25:  - Branch: `main`
L26:  - Root Directory: `simple-backend`
L27:  - Runtime: Node
L28:  - Build Command: `npm install`
L29:  - Start Command: `npm start`
L30:  - Plan: Free
L31:- Environment Variables:
L32:  - `NODE_ENV=production`
L33:  - `FRONTEND_URL=https://stack-facilitation-frontend.onrender.com` (optional)
L34:
L35:Once deployed, you’ll have a URL like:
L36:- `https://stack-facilitation-backend.onrender.com`
L37:
L38:### 2) Frontend (Static Site)
L39:
L40:- New → Static Site → Connect same repo
L41:- Settings:
L42:  - Name: `stack-facilitation-frontend`
L43:  - Branch: `main`
L44:  - Root Directory: `frontend`
L45:  - Build Command: `npm install && npm run build`
L46:  - Publish Directory: `dist`
L47:- Environment Variables:
L48:  - `VITE_API_URL=https://stack-facilitation-backend.onrender.com`
L49:
L50:Your frontend URL will look like:
L51:- `https://stack-facilitation-frontend.onrender.com`
L52:
L53:### 3) Verification
L54:
L55:- Visit your frontend URL
L56:- Create a meeting (should generate a real code)
L57:- Join the meeting from another device/tab and verify real-time updates
L58:
L59:### 4) Clean up old services (if applicable)
L60:
L61:- Delete any failed or legacy services (e.g., `stack-facilitation-backend` from an older attempt)
L62:- You can keep an old free database if you want it for later, or delete it if unused
L63:
L64:## Troubleshooting
L65:
L66:- Build failures: check service logs
L67:- CORS errors: ensure the frontend points to the correct backend `VITE_API_URL`
L68:- WebSocket issues: verify `VITE_API_URL` uses the backend origin (Socket.io shares the origin)
L69:- Connection order: deploy backend first, then set the frontend `VITE_API_URL` and redeploy
L70:
L71:## Legacy Notes
L72:
L73:- The root `render.yaml` and `docker-compose.yml` are for a legacy stack and not compatible with the current `simple-backend + frontend` architecture
L74:
L75:- The root `render.yaml` and `docker-compose.yml` files describe a legacy stack and are not compatible with the current `simple-backend` + `frontend` architecture.

---

## Development Environment Setup

L1:# Development Environment Setup
L2:
L3:This guide provides comprehensive instructions for setting up the Stack Master Tool development environment.
L4:
L5:## Prerequisites
L6:
L7:- **Node.js**: Version 18 or later (recommended: use nvm for version management)
L8:- **npm**: Version 8 or later (comes with Node.js)
L9:- **Git**: For version control
L10:- **Code Editor**: VS Code recommended (with TypeScript, ESLint, and Prettier extensions)
L11:
L12:## Quick Setup
L13:
L14:### 1. Clone the Repository
L15:
L16:```bash
L17:git clone <YOUR_GIT_URL>
L18:cd stack-master-tool
L19:```
L20:
L21:### 2. Install Dependencies
L22:
L23:```bash
L24:# Install frontend dependencies
L25:npm install
L26:
L27:# Install backend dependencies
L28:cd backend
L29:npm install
L30:cd ..
L31:```
L32:
L33:### 3. Environment Configuration
L34:
L35:Create environment files for both frontend and backend:
L36:
L37:**Frontend (.env.local):**
L38:```bash
L39:# API Configuration
L40:VITE_API_URL=http://localhost:3000
L41:VITE_SOCKET_URL=http://localhost:3000
L42:
L43:# Supabase Configuration (if using Supabase)
L44:VITE_SUPABASE_URL=your_supabase_url
L45:VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
L46:```
L47:
L48:**Backend (.env):**
L49:```bash
L50:# Server Configuration
L51:PORT=3000
L52:NODE_ENV=development
L53:
L54:# Supabase Configuration
L55:SUPABASE_URL=your_supabase_url
L56:SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
L57:```
L58:
L59:### 4. Start Development Servers
L60:
L61:**Terminal 1 - Backend:**
L62:```bash
L63:cd backend
L64:npm start
L65:# Server runs on http://localhost:3000
L66:```
L67:
L68:**Terminal 2 - Frontend:**
L69:```bash
L70:npm run dev
L71:# Frontend runs on http://localhost:5173
L72:```
L73:
L74:## Project Structure
L75:
L76:```
L77:stack-master-tool/
L78:├── src/                    # Frontend React application
L79:│   ├── components/         # Reusable UI components
L80:│   ├── pages/             # Page components
L81:│   ├── services/          # API service layer
L82:│   ├── hooks/             # Custom React hooks
L83:│   ├── types/             # TypeScript type definitions
L84:│   └── utils/             # Utility functions
L85:├── backend/               # Backend Express/Socket.io server
L86:│   ├── routes/            # API route handlers
L87:│   ├── services/          # Business logic services
L88:│   ├── handlers/          # Socket.io event handlers
L89:│   ├── config/            # Configuration files
L90:│   └── __tests__/         # Backend test files
L91:├── docs/                  # Documentation
L92:├── public/                # Static assets
L93:└── tests/                 # E2E tests
L94:```
L95:
L96:## Development Workflow
L97:
L98:### Running Tests
L99:
L100:**Backend Tests (Jest):**
L101:```bash
L102:cd backend
L103:npm test
L104:# Runs all backend tests (52 tests currently passing)
L105:```
L106:
L107:**Frontend Tests (Vitest):**
L108:```bash
L109:npm test
L110:# Runs frontend tests (2 passing, 3 skipped)
L111:```
L112:
L113:**E2E Tests (Playwright):**
L114:```bash
L115:npm run test:e2e
L116:# Runs end-to-end tests
L117:```
L118:
L119:### Code Quality
L120:
L121:**Linting:**
L122:```bash
L123:# Frontend linting
L124:npm run lint
L125:
L126:# Backend linting
L127:cd backend
L128:npm run lint
L129:```
L130:
L131:**Type Checking:**
L132:```bash
L133:# Frontend type checking
L134:npm run type-check
L135:
L136:# Backend type checking
L137:cd backend
L138:npm run type-check
L139:```
L140:
L141:### Building for Production
L142:
L143:**Frontend Build:**
L144:```bash
L145:npm run build
L146:# Outputs to dist/ directory
L147:```
L148:
L149:**Backend Build:**
L150:```bash
L151:cd backend
L152:npm run build
L153:# Compiles TypeScript to JavaScript
L154:```
L155:
L156:## Development Tools
L157:
L158:### Recommended VS Code Extensions
L159:
L160:- **TypeScript Importer**: Auto-import TypeScript modules
L161:- **ESLint**: JavaScript/TypeScript linting
L162:- **Prettier**: Code formatting
L163:- **Tailwind CSS IntelliSense**: Tailwind class autocomplete
L164:- **Thunder Client**: API testing (alternative to Postman)
L165:- **GitLens**: Enhanced Git capabilities
L166:
L167:### VS Code Settings
L168:
L169:Create `.vscode/settings.json`:
L170:
L171:```json
L172:{
L173:  "typescript.preferences.importModuleSpecifier": "relative",
L174:  "editor.formatOnSave": true,
L175:  "editor.codeActionsOnSave": {
L176:    "source.fixAll.eslint": true
L177:  },
L178:  "eslint.workingDirectories": [".", "backend"],
L179:  "tailwindCSS.includeLanguages": {
L180:    "typescript": "typescript",
L181:    "typescriptreact": "typescriptreact"
L182:  }
L183:}
L184:```
L185:
L186:## Database Setup
L187:
L188:### Supabase (Recommended)
L189:
L190:1. Create a new project at [supabase.com](https://supabase.com)
L191:2. Get your project URL and anon key from Settings > API
L192:3. Update environment variables with your Supabase credentials
L193:4. Run migrations (if any) from the `supabase/migrations/` directory
L194:
L195:### Local Development Database
L196:
L197:For local development, you can use SQLite or PostgreSQL:
L198:
L199:```bash
L200:# Using SQLite (simpler setup)
L201:npm install sqlite3
L202:# Update backend configuration to use SQLite
L203:
L204:# Using PostgreSQL (production-like)
L205:# Install PostgreSQL locally
L206:# Create a database and update connection string
L207:```
L208:
L209:## API Development
L210:
L211:### Backend API Endpoints
L212:
L213:- `GET /health` - Health check
L214:- `POST /api/meetings` - Create a new meeting
L215:- `GET /api/meetings/:code` - Get meeting details
L216:
L217:### Socket.io Events
L218:
L219:**Client to Server:**
L220:- `join-meeting` - Join a meeting room
L221:- `leave-meeting` - Leave a meeting room
L222:- `add-to-queue` - Add participant to speaking queue
L223:- `remove-from-queue` - Remove participant from queue
L224:- `speak` - Start speaking turn
L225:- `finish-speaking` - End speaking turn
L226:
L227:**Server to Client:**
L228:- `queue-updated` - Queue state changed
L229:- `participant-joined` - New participant joined
L230:- `participant-left` - Participant left
L231:- `speaking-started` - Someone started speaking
L232:- `speaking-finished` - Someone finished speaking
L233:
L234:## Troubleshooting
L235:
L236:### Common Issues
L237:
L238:**Port Already in Use:**
L239:```bash
L240:# Kill process using port 3000
L241:lsof -ti:3000 | xargs kill -9
L242:
L243:# Or use different port
L244:PORT=3001 npm start --prefix backend
L245:```
L246:
L247:**Dependencies Issues:**
L248:```bash
L249:# Clear npm cache
L250:npm cache clean --force
L251:
L252:# Delete node_modules and reinstall
L253:rm -rf node_modules package-lock.json
L254:npm install
L255:```
L256:
L257:**TypeScript Errors:**
L258:```bash
L259:# Check TypeScript configuration
L260:npx tsc --noEmit
L261:
L262:# Restart TypeScript server in VS Code
L263:# Cmd/Ctrl + Shift + P > "TypeScript: Restart TS Server"
L264:```
L265:
L266:**Socket.io Connection Issues:**
L267:- Verify backend is running on correct port
L268:- Check CORS configuration in backend
L269:- Ensure VITE_SOCKET_URL matches backend URL
L270:
L271:### Debug Mode
L272:
L273:**Frontend Debug:**
L274:```bash
L275:# Enable debug logging
L276:VITE_DEBUG=true npm run dev
L277:```
L278:
L279:**Backend Debug:**
L280:```bash
L281:# Enable debug logging
L282:DEBUG=* npm start --prefix backend
L283:```
L284:
L285:## Contributing
L286:
L287:### Git Workflow
L288:
L289:1. Create a feature branch: `git checkout -b feature/your-feature-name`
L290:2. Make your changes
L291:3. Run tests: `npm test && cd backend && npm test`
L292:4. Commit changes: `git commit -m "Add your feature"`
L293:5. Push branch: `git push origin feature/your-feature-name`
L294:6. Create a Pull Request
L295:
L296:### Code Style
L297:
L298:- Use TypeScript for all new code
L299:- Follow existing naming conventions
L300:- Add JSDoc comments for public functions
L301:- Write tests for new features
L302:- Update documentation as needed
L303:
L304:## Performance Tips
L305:
L306:### Frontend Optimization
L307:
L308:- Use React.memo() for expensive components
L309:- Implement lazy loading for routes
L310:- Optimize bundle size with dynamic imports
L311:- Use React DevTools Profiler to identify bottlenecks
L312:
L313:### Backend Optimization
L314:
L315:- Implement connection pooling for database
L316:- Use Redis for session storage in production
L317:- Add request rate limiting
L318:- Monitor memory usage and garbage collection
L319:
L320:## Security Considerations
L321:
L322:- Never commit environment files with secrets
L323:- Use environment variables for all sensitive data
L324:- Implement proper input validation
L325:- Add rate limiting to prevent abuse
L326:- Use HTTPS in production
L327:- Regularly update dependencies
L328:
L329:## Additional Resources
L330:
L331:- [React Documentation](https://react.dev/)
L332:- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
L333:- [Socket.io Documentation](https://socket.io/docs/)
L334:- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
L335:- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
L336:- [Vitest Testing Framework](https://vitest.dev/)
L337:
L338:---
L339:
L340:For more specific information, see:
L341:- [Quick Start Guide](QUICK_START.md)
L342:- [Deployment Guide](DEPLOYMENT.md)
L343:- [API Documentation](API.md) (coming soon)

---

## Environment Setup Guide

L1:# Environment Setup Guide
L2:
L3:This guide explains how to configure environment variables for the Stack Master Tool application.
L4:
L5:## Overview
L6:
L7:The application uses environment variables for configuration across different environments (development, staging, production). This ensures sensitive data is kept secure and configuration can be easily changed without modifying code.
L8:
L9:## Environment Files
L10:
L11:### Frontend (.env.local)
L12:
L13:Create a `.env.local` file in the root directory for frontend environment variables:
L14:
L15:```bash
L16:# Copy the example file
L17:cp .env.example .env.local
L18:```
L19:
L20:**Required Variables:**
L21:- `VITE_API_URL`: Backend API URL (default: http://localhost:3000)
L22:- `VITE_SOCKET_URL`: WebSocket server URL (default: http://localhost:3000)
L23:
L24:**Optional Variables:**
L25:- `VITE_SUPABASE_URL`: Supabase project URL (for production features)
L26:- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
L27:- `VITE_DEBUG`: Enable debug logging (default: false)
L28:- `VITE_LOG_LEVEL`: Logging level (default: info)
L29:- `VITE_ENABLE_ANALYTICS`: Enable analytics (default: false)
L30:- `VITE_ENABLE_ERROR_REPORTING`: Enable error reporting (default: true)
L31:
L32:### Backend (.env)
L33:
L34:Create a `.env` file in the `backend/` directory for backend environment variables:
L35:
L36:```bash
L37:# Copy the example file
L38:cd backend
L39:cp .env.example .env
L40:```
L41:
L42:**Required Variables:**
L43:- `PORT`: Server port (default: 3000)
L44:- `NODE_ENV`: Environment mode (development/production)
L45:
L46:**Optional Variables:**
L47:- `SUPABASE_URL`: Supabase project URL
L48:- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
L49:- `CORS_ORIGIN`: Allowed CORS origins (default: http://localhost:5173)
L50:- `LOG_LEVEL`: Logging level (default: info)
L51:- `ENABLE_REQUEST_LOGGING`: Enable request logging (default: true)
L52:- `JWT_SECRET`: JWT signing secret
L53:- `SESSION_SECRET`: Session secret
L54:- `DATABASE_URL`: Direct database connection URL
L55:- `REDIS_URL`: Redis connection URL
L56:
L57:## Environment-Specific Configuration
L58:
L59:### Development
L60:
L61:For local development, use the example files as templates:
L62:
L63:```bash
L64:# Frontend
L65:cp .env.example .env.local
L66:
L67:# Backend
L68:cd backend
L69:cp .env.example .env
L70:```
L71:
L72:### Staging
L73:
L74:Create environment-specific files:
L75:
L76:```bash
L77:# Frontend
L78:cp .env.example .env.staging
L79:
L80:# Backend
L81:cd backend
L82:cp .env.example .env.staging
L83:```
L84:
L85:### Production
L86:
L87:For production deployment, set environment variables through your hosting platform:
L88:
L89:**Render.com:**
L90:- Go to your service dashboard
L91:- Navigate to Environment tab
L92:- Add each variable with its production value
L93:
L94:**Vercel:**
L95:- Go to your project dashboard
L96:- Navigate to Settings > Environment Variables
L97:- Add each variable for Production environment
L98:
L99:**Railway:**
L100:- Go to your project dashboard
L101:- Navigate to Variables tab
L102:- Add each variable
L103:
L104:## Security Best Practices
L105:
L106:### 1. Never Commit Sensitive Data
L107:
L108:- Add `.env*` files to `.gitignore`
L109:- Use `.env.example` files for documentation
L110:- Store secrets in secure environment variable systems
L111:
L112:### 2. Use Different Secrets Per Environment
L113:
L114:- Generate unique secrets for each environment
L115:- Use strong, random secrets (32+ characters)
L116:- Rotate secrets regularly
L117:
L118:### 3. Validate Environment Variables
L119:
L120:The application validates required environment variables on startup:
L121:
L122:```typescript
L123:// Frontend validation
L124:const requiredEnvVars = ['VITE_API_URL', 'VITE_SOCKET_URL'];
L125:const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
L126:
L127:if (missingVars.length > 0) {
L128:  console.error('Missing required environment variables:', missingVars);
L129:}
L130:```
L131:
L132:### 4. Use Environment-Specific Values
L133:
L134:```typescript
L135:// Example configuration
L136:const config = {
L137:  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
L138:  debug: import.meta.env.VITE_DEBUG === 'true',
L139:  logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
L140:};
L141:```
L142:
L143:## Common Environment Setups
L144:
L145:### Local Development
L146:
L147:```bash
L148:# Frontend .env.local
L149:VITE_API_URL=http://localhost:3000
L150:VITE_SOCKET_URL=http://localhost:3000
L151:VITE_DEBUG=true
L152:VITE_LOG_LEVEL=debug
L153:
L154:# Backend .env
L155:PORT=3000
L156:NODE_ENV=development
L157:CORS_ORIGIN=http://localhost:5173
L158:LOG_LEVEL=debug
L159:ENABLE_REQUEST_LOGGING=true
L160:```
L161:
L162:### Production
L163:
L164:```bash
L165:# Frontend (set in hosting platform)
L166:VITE_API_URL=https://your-api-domain.com
L167:VITE_SOCKET_URL=https://your-api-domain.com
L168:VITE_DEBUG=false
L169:VITE_LOG_LEVEL=error
L170:VITE_ENABLE_ANALYTICS=true
L171:
L172:# Backend (set in hosting platform)
L173:PORT=3000
L174:NODE_ENV=production
L175:CORS_ORIGIN=https://your-frontend-domain.com
L176:LOG_LEVEL=warn
L177:ENABLE_REQUEST_LOGGING=false
L178:JWT_SECRET=your-production-jwt-secret
L179:SESSION_SECRET=your-production-session-secret
L180:```
L181:
L182:## Troubleshooting
L183:
L184:### Common Issues
L185:
L186:**1. Environment variables not loading:**
L187:- Ensure file is named correctly (`.env.local` for frontend, `.env` for backend)
L188:- Restart the development server after adding new variables
L189:- Check for typos in variable names
L190:
L191:**2. CORS errors:**
L192:- Verify `CORS_ORIGIN` matches your frontend URL
L193:- Check that `VITE_API_URL` and `VITE_SOCKET_URL` are correct
L194:
L195:**3. Supabase connection issues:**
L196:- Verify `SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
L197:- Check that your Supabase project is active
L198:- Ensure the service role key has proper permissions
L199:
L200:**4. Build failures:**
L201:- Ensure all required environment variables are set
L202:- Check that variable values don't contain special characters that need escaping
L203:- Verify that boolean values are strings ('true'/'false')
L204:
L205:### Debugging Environment Variables
L206:
L207:**Frontend:**
L208:```typescript
L209:// Add to your component for debugging
L210:console.log('Environment variables:', import.meta.env);
L211:```
L212:
L213:**Backend:**
L214:```javascript
L215:// Add to your server startup
L216:console.log('Environment variables:', process.env);
L217:```
L218:
L219:## Environment Variable Reference
L220:
L221:### Frontend Variables
L222:
L223:| Variable | Required | Default | Description |
L224:|----------|----------|---------|-------------|
L225:| `VITE_API_URL` | Yes | `http://localhost:3000` | Backend API URL |
L226:| `VITE_SOCKET_URL` | Yes | `http://localhost:3000` | WebSocket server URL |
L227:| `VITE_SUPABASE_URL` | No | - | Supabase project URL |
L228:| `VITE_SUPABASE_ANON_KEY` | No | - | Supabase anonymous key |
L229:| `VITE_DEBUG` | No | `false` | Enable debug logging |
L230:| `VITE_LOG_LEVEL` | No | `info` | Logging level |
L231:| `VITE_ENABLE_ANALYTICS` | No | `false` | Enable analytics |
L232:| `VITE_ENABLE_ERROR_REPORTING` | No | `true` | Enable error reporting |
L233:
L234:### Backend Variables
L235:
L236:| Variable | Required | Default | Description |
L237:|----------|----------|---------|-------------|
L238:| `PORT` | Yes | `3000` | Server port |
L239:| `NODE_ENV` | Yes | `development` | Environment mode |
L240:| `SUPABASE_URL` | No | - | Supabase project URL |
L241:| `SUPABASE_SERVICE_ROLE_KEY` | No | - | Supabase service role key |
L242:| `CORS_ORIGIN` | No | `http://localhost:5173` | Allowed CORS origins |
L243:| `LOG_LEVEL` | No | `info` | Logging level |
L244:| `ENABLE_REQUEST_LOGGING` | No | `true` | Enable request logging |
L245:| `JWT_SECRET` | No | - | JWT signing secret |
L246:| `SESSION_SECRET` | No | - | Session secret |
L247:| `DATABASE_URL` | No | - | Direct database URL |
L248:| `REDIS_URL` | No | - | Redis connection URL |
L249:
L250:## Next Steps
L251:
L252:1. Copy the example files to create your environment configuration
L253:2. Update the values with your specific configuration
L254:3. Test the application to ensure all variables are working correctly
L255:4. Deploy to your hosting platform with production environment variables
L256:
L257:For more information, see:
L258:- [Development Environment Setup](DEVELOPMENT.md)
L259:- [Deployment Guide](DEPLOYMENT.md)
L260:- [API Documentation](API.md) (coming soon)

---

## Error Handling System

L1:# Error Handling System
L2:
L3:This document describes the comprehensive error handling system implemented in the Stack Facilitation application.
L4:
L5:## Overview
L6:
L7:The error handling system provides:
L8:- Centralized error management with consistent error types and codes
L9:- User-friendly error messages with actionable guidance
L10:- Comprehensive error logging and monitoring
L11:- Automatic error recovery and retry mechanisms
L12:- Detailed error analytics and reporting
L13:
L14:## Architecture
L15:
L16:### Core Components
L17:
L18:1. **Error Types & Codes** (`src/utils/errorHandling.ts`)
L19:   - Standardized error classification system
L20:   - User-friendly error messages
L21:   - Retry logic indicators
L22:
L23:2. **Error Monitoring** (`src/utils/errorMonitoring.ts`)
L24:   - Error tracking and analytics
L25:   - Performance monitoring
L26:   - Production error reporting
L27:
L28:3. **Error Display Components** (`src/components/ErrorDisplay.tsx`)
L29:   - Consistent error UI across the application
L30:   - Contextual error information
L31:   - Action buttons for error recovery
L32:
L33:## Error Classification
L34:
L35:### Error Types
L36:
L37:- **NETWORK**: Connection issues, timeouts, offline states
L38:- **VALIDATION**: Input validation errors, format issues
L39:- **AUTHENTICATION**: Login/access permission errors
L40:- **AUTHORIZATION**: Insufficient permissions for actions
L41:- **NOT_FOUND**: Missing resources (meetings, participants)
L42:- **CONFLICT**: Duplicate entries, state conflicts
L43:- **SERVER**: Backend service errors
L44:- **TIMEOUT**: Operation timeouts
L45:- **UNKNOWN**: Unclassified errors
L46:
L47:### Error Codes
L48:
L49:Each error type has specific error codes for precise identification:
L50:
L51:```typescript
L52:// Network errors
L53:CONNECTION_FAILED, NETWORK_TIMEOUT, OFFLINE
L54:
L55:// Validation errors  
L56:INVALID_MEETING_CODE, INVALID_PARTICIPANT_NAME, INVALID_QUEUE_TYPE
L57:
L58:// Authentication errors
L59:UNAUTHORIZED_FACILITATOR, NOT_IN_MEETING, MEETING_ACCESS_DENIED
L60:
L61:// And more...
L62:```
L63:
L64:## Usage Examples
L65:
L66:### Creating Custom Errors
L67:
L68:```typescript
L69:import { AppError, ErrorCode } from '../utils/errorHandling';
L70:
L71>// Create a specific error
L72:throw new AppError(ErrorCode.MEETING_NOT_FOUND, originalError, 'Custom message');
L73:
L74>// Create with automatic error mapping
L75:throw new AppError(ErrorCode.INVALID_MEETING_CODE, undefined, 'Meeting code must be 6 characters');
L76:```
L77:
L78:### Handling Errors in Components
L79:
L80:```typescript
L81:import { getErrorDisplayInfo } from '../utils/errorHandling';
L82:
L83:try {
L84:  await apiService.getMeeting(code);
L85:} catch (error) {
L86:  const errorInfo = getErrorDisplayInfo(error);
L87:  setError(errorInfo.description);
L88:  notify('error', errorInfo.title, errorInfo.description);
L89:}
L90:```
L91:
L92:### Using Error Display Component
L93:
L94:```typescript
L95:import { ErrorDisplay } from '../components/ErrorDisplay';
L96:
L97:<ErrorDisplay 
L98:  error={error}
L99:  onRetry={() => retryOperation()}
L100:  onGoHome={() => navigate('/')}
L101:  showDetails={isDevelopment}
L102:/>
L103:```
L104:
L105:## Error Recovery
L106:
L107:### Automatic Retry
L108:
L109:Errors marked as `retryable: true` can be automatically retried:
L110:
L111:```typescript
L112:const error = new AppError(ErrorCode.CONNECTION_FAILED, originalError);
L113:if (error.details.retryable) {
L114:  // Show retry button or auto-retry
L115:}
L116:```
L117:
L118:### User Actions
L119:
L120:Error messages include actionable guidance:
L121:
L122:- **Network errors**: "Check your internet connection and refresh the page"
L123:- **Validation errors**: "Enter a valid meeting code (6 characters)"
L124:- **Permission errors**: "Contact the meeting facilitator for access"
L125:
L126:## Monitoring & Analytics
L127:
L128:### Error Tracking
L129:
L130:All errors are automatically tracked with:
L131:- Error frequency by type and code
L132:- Context information (component, operation)
L133:- User agent and URL data
L134:- Timestamp and stack traces
L135:
L136:### Metrics Available
L137:
L138:```typescript
L139:import { errorMonitor } from '../utils/errorMonitoring';
L140:
L141:// Get error statistics
L142:const metrics = errorMonitor.getMetrics();
L143:const errorRate = errorMonitor.getErrorRate();
L144:const topErrors = errorMonitor.getTopErrorTypes(5);
L145:
L146:// Generate error report
L147:const report = errorMonitor.generateErrorReport();
L148:```
L149:
L150:### Production Integration
L151:
L152:In production, errors are sent to external monitoring services:
L153:
L154:```typescript
L155:// Example Sentry integration
L156:Sentry.captureException(error, { 
L157:  extra: { context, userAgent, url } 
L158:});
L159:
L160:// Example custom analytics
L161:fetch('/api/analytics/errors', {
L162:  method: 'POST',
L163:  body: JSON.stringify(errorData)
L164:});
L165:```
L166:
L167:## Best Practices
L168:
L169:### 1. Use Specific Error Codes
L170:
L171:```typescript
L172:// Good
L173:throw new AppError(ErrorCode.INVALID_MEETING_CODE, undefined, 'Meeting code must be 6 characters');
L174:
L175:// Avoid
L176:throw new Error('Invalid input');
L177:```
L178:
L179:### 2. Provide Context
L180:
L181:```typescript
L182:// Good
L183:logError(error, 'joinMeeting');
L184:
L185:// Avoid
L186:logError(error);
L187:```
L188:
L189:### 3. Handle Errors Gracefully
L190:
L191:```typescript
L192:// Good
L193:try {
L194:  await operation();
L195:} catch (error) {
L196:  const errorInfo = getErrorDisplayInfo(error);
L197:  showUserFriendlyMessage(errorInfo);
L198:}
L199:
L200:// Avoid
L201:try {
L202:  await operation();
L203:} catch (error) {
L204:  alert('Something went wrong');
L205:}
L206:```
L207:
L208:### 4. Use Error Boundaries
L209:
L210:```typescript
L211:// Wrap components that might fail
L212:<ErrorBoundary>
L213:  <RiskyComponent />
L214:</ErrorBoundary>
L215:```
L216:
L217:## Testing Error Handling
L218:
L219:### Unit Tests
L220:
L221:```typescript
L222:import { AppError, ErrorCode } from '../utils/errorHandling';
L223:
L224:test('creates error with correct details', () => {
L225:  const error = new AppError(ErrorCode.MEETING_NOT_FOUND);
L226:  expect(error.details.code).toBe('MEETING_NOT_FOUND');
L227:  expect(error.details.retryable).toBe(false);
L228:});
L229:```
L230:
L231:### Integration Tests
L232:
L233:```typescript
L234:test('handles network error gracefully', async () => {
L235:  // Mock network failure
L236:  mockFetch.mockRejectedValue(new Error('Network error'));
L237:  
L238:  const { getByText } = render(<JoinMeeting />);
L239:  await userEvent.click(getByText('Join Meeting'));
L240:  
L241:  expect(getByText('Connection Failed')).toBeInTheDocument();
L242:  expect(getByText('Check your internet connection')).toBeInTheDocument();
L243:});
L244:```
L245:
L246:## Configuration
L247:
L248:### Environment Variables
L249:
L250:```bash
L251:# Enable detailed error logging
L252:REACT_APP_DEBUG_ERRORS=true
L253:
L254:# Error monitoring service endpoint
L255:REACT_APP_ERROR_REPORTING_URL=https://api.example.com/errors
L256:
L257:# Sentry DSN
L258:REACT_APP_SENTRY_DSN=https://your-sentry-dsn
L259:```
L260:
L261:### Error Message Customization
L262:
L263:Error messages can be customized in `src/utils/errorHandling.ts`:
L264:
L265:```typescript
L266:export const ERROR_MESSAGES: Record<ErrorCode, { title: string; description: string; action?: string }> = {
L267:  MEETING_NOT_FOUND: {
L268:    title: 'Meeting Not Found',
L269:    description: 'The meeting code you entered doesn't exist or the meeting has ended.',
L270:    action: 'Check the meeting code or ask the facilitator for a new one.'
L271:  },
L272:  // ... more messages
L273:};
L274:```
L275:
L276:## Troubleshooting
L277:
L278:### Common Issues
L279:
L280:1. **Error not displaying properly**
L281:   - Check if error is wrapped in `AppError`
L282:   - Verify error code exists in `ERROR_MESSAGES`
L283:
L284:2. **Monitoring not working**
L285:   - Ensure `errorMonitoring.ts` is imported
L286:   - Check browser console for import errors
L287:
L288:3. **Retry not working**
L289:   - Verify error is marked as `retryable: true`
L290:   - Check retry logic implementation
L291:
L292:### Debug Mode
L293:
L294:Enable debug mode for detailed error information:
L295:
L296:```typescript
L297:// In development
L298:if (process.env.NODE_ENV === 'development') {
L299:  window.errorMonitor = errorMonitor; // Access via console
L300:}
L301:```
L302:
L303:## Future Enhancements
L304:
L305:- [ ] Real-time error notifications
L306:- [ ] Error prediction based on patterns
L307:- [ ] Automatic error recovery strategies
L308:- [ ] User feedback collection on errors
L309:- [ ] A/B testing for error messages
L310:- [ ] Integration with more monitoring services

---

## Facilitation Guide for Stack-Based Meetings

L1:# Facilitation Guide for Stack-Based Meetings
L2:
L3:This guide provides comprehensive instructions for facilitating inclusive, democratic meetings using the Stack Facilitation App. It covers both the technical aspects of using the software and the interpersonal skills needed for effective facilitation.
L4:
L5:## Table of Contents
L6:
L7:1. [Introduction to Stack Facilitation](#introduction-to-stack-facilitation)
L8:2. [Pre-Meeting Preparation](#pre-meeting-preparation)
L9:3. [Meeting Setup](#meeting-setup)
L10:4. [Facilitating Discussion](#facilitating-discussion)
L11:5. [Managing the Speaking Queue](#managing-the-speaking-queue)
L12:6. [Progressive Stack Implementation](#progressive-stack-implementation)
L13:7. [Proposal and Decision Making](#proposal-and-decision-making)
L14:8. [Handling Difficult Situations](#handling-difficult-situations)
L15:9. [Post-Meeting Follow-up](#post-meeting-follow-up)
L16:10. [Advanced Facilitation Techniques](#advanced-facilitation-techniques)
L17:
L18:## Introduction to Stack Facilitation
...

---

## Moderation Guide for Stack Facilitation Meetings

L1:
L2:# Moderation Guide for Stack Facilitation Meetings
L3:
L4:This guide provides comprehensive instructions for moderating online meetings using the Stack Facilitation App. It covers both preventive measures to create a safe, inclusive environment and responsive actions to address problems when they arise.
L5:
L6:## Table of Contents
...

---

## Quick Start

L1:# Quick Start
L2:
L3:This guide helps you get the Stack Facilitation App running locally.
L4:
L5:## Prerequisites
L6:
L7:- Node.js 18 or later
L8:
L9:## Install dependencies
L10:
L11:```bash
L12:# install frontend deps
L13:npm install
L14:# install backend deps
L15:(cd backend && npm install)
L16:```
L17:
L18:## Run the app
L19:
L20:Start the backend in one terminal:
L21:
L22:```bash
L23:npm start --prefix backend
L24:```
L25:
L26:Start the frontend in another terminal:
L27:
L28:```bash
L29:npm run dev
L30:```
L31:
L32:The Vite dev server runs on [http://localhost:5173](http://localhost:5173) and connects to the backend at `http://localhost:3000` by default. Set `VITE_API_URL` if your backend uses a different address.
L33:

---

## Rebuild Plan

L1:# Rebuild Plan
L2:
L3:This document outlines the project's architecture and considerations for future development.
L4:
L5:## Current architecture
L6:
L7:- **backend/** – Express + Socket.io server that manages meetings and real‑time communication.
L8:- **src/** – React frontend built with Vite and shadcn/ui components.
L9:- The frontend communicates with the backend via REST endpoints and a Socket.io connection.
L10:
L11:## Future improvements
L12:
L13:- Document and version the API for easier client updates.
L14:- Add automated tests for both backend and frontend.
L15:- Consider deploying backend and frontend separately to simplify scaling.
L16:
L17:These notes serve as a starting point for contributors who want to rebuild or extend the app.
L18:
L19:

---

## Three Meeting Views Implementation - COMPLETED ✅

L1:# Three Meeting Views Implementation - COMPLETED ✅
L2:
L3:This document describes the three distinct meeting views implemented in the stack facilitation app, inspired by jparty.tv's approach.
L4:
L5:## Overview
L6:
L7:The app now supports three distinct ways to interact with meetings:
L8:
L9:1. **HOST** - Full facilitator controls and meeting management
L10:2. **JOIN** - Participant view with queue interaction capabilities
L11:3. **WATCH** - Public read-only observer view (no authentication required)
L12:
L13:## Implementation Status: COMPLETED ✅
L14:
L15:All three meeting views have been successfully implemented and are fully functional.
L16:
L17:## URL Structure
L18:
L19:- **`/meeting/ABC123?mode=host`** - Host view (facilitator controls)
L20:- **`/meeting/ABC123?mode=join`** - Join view (participant actions) - _default_
L21:- **`/watch/ABC123`** - Public watch view (read-only, no auth)
L22:
L23:## Current Implementation Status
...

