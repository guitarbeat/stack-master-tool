# Development Environment Setup

This guide provides comprehensive instructions for setting up the Stack Master Tool development environment.

## Prerequisites

- **Node.js**: Version 18 or later (recommended: use nvm for version management)
- **npm**: Version 8 or later (comes with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code recommended (with TypeScript, ESLint, and Prettier extensions)

## Quick Setup

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd stack-master-tool
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Configuration

Create environment files for both frontend and backend:

**Frontend (.env.local):**
```bash
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000

# Supabase Configuration (if using Supabase)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend (.env):**
```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Server runs on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

## Project Structure

```
stack-master-tool/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── services/          # API service layer
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── backend/               # Backend Express/Socket.io server
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic services
│   ├── handlers/          # Socket.io event handlers
│   ├── config/            # Configuration files
│   └── __tests__/         # Backend test files
├── docs/                  # Documentation
├── public/                # Static assets
└── tests/                 # E2E tests
```

## Development Workflow

### Running Tests

**Backend Tests (Jest):**
```bash
cd backend
npm test
# Runs all backend tests (52 tests currently passing)
```

**Frontend Tests (Vitest):**
```bash
npm test
# Runs frontend tests (2 passing, 3 skipped)
```

**E2E Tests (Playwright):**
```bash
npm run test:e2e
# Runs end-to-end tests
```

### Code Quality

**Linting:**
```bash
# Frontend linting
npm run lint

# Backend linting
cd backend
npm run lint
```

**Type Checking:**
```bash
# Frontend type checking
npm run type-check

# Backend type checking
cd backend
npm run type-check
```

### Building for Production

**Frontend Build:**
```bash
npm run build
# Outputs to dist/ directory
```

**Backend Build:**
```bash
cd backend
npm run build
# Compiles TypeScript to JavaScript
```

## Development Tools

### Recommended VS Code Extensions

- **TypeScript Importer**: Auto-import TypeScript modules
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Tailwind CSS IntelliSense**: Tailwind class autocomplete
- **Thunder Client**: API testing (alternative to Postman)
- **GitLens**: Enhanced Git capabilities

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.workingDirectories": [".", "backend"],
  "tailwindCSS.includeLanguages": {
    "typescript": "typescript",
    "typescriptreact": "typescriptreact"
  }
}
```

## Database Setup

### Supabase (Recommended)

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Update environment variables with your Supabase credentials
4. Run migrations (if any) from the `supabase/migrations/` directory

### Local Development Database

For local development, you can use SQLite or PostgreSQL:

```bash
# Using SQLite (simpler setup)
npm install sqlite3
# Update backend configuration to use SQLite

# Using PostgreSQL (production-like)
# Install PostgreSQL locally
# Create a database and update connection string
```

## API Development

### Backend API Endpoints

- `GET /health` - Health check
- `POST /api/meetings` - Create a new meeting
- `GET /api/meetings/:code` - Get meeting details

### Socket.io Events

**Client to Server:**
- `join-meeting` - Join a meeting room
- `leave-meeting` - Leave a meeting room
- `add-to-queue` - Add participant to speaking queue
- `remove-from-queue` - Remove participant from queue
- `speak` - Start speaking turn
- `finish-speaking` - End speaking turn

**Server to Client:**
- `queue-updated` - Queue state changed
- `participant-joined` - New participant joined
- `participant-left` - Participant left
- `speaking-started` - Someone started speaking
- `speaking-finished` - Someone finished speaking

## Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm start --prefix backend
```

**Dependencies Issues:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript Errors:**
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P > "TypeScript: Restart TS Server"
```

**Socket.io Connection Issues:**
- Verify backend is running on correct port
- Check CORS configuration in backend
- Ensure VITE_SOCKET_URL matches backend URL

### Debug Mode

**Frontend Debug:**
```bash
# Enable debug logging
VITE_DEBUG=true npm run dev
```

**Backend Debug:**
```bash
# Enable debug logging
DEBUG=* npm start --prefix backend
```

## Contributing

### Git Workflow

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Run tests: `npm test && cd backend && npm test`
4. Commit changes: `git commit -m "Add your feature"`
5. Push branch: `git push origin feature/your-feature-name`
6. Create a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for public functions
- Write tests for new features
- Update documentation as needed

## Performance Tips

### Frontend Optimization

- Use React.memo() for expensive components
- Implement lazy loading for routes
- Optimize bundle size with dynamic imports
- Use React DevTools Profiler to identify bottlenecks

### Backend Optimization

- Implement connection pooling for database
- Use Redis for session storage in production
- Add request rate limiting
- Monitor memory usage and garbage collection

## Security Considerations

- Never commit environment files with secrets
- Use environment variables for all sensitive data
- Implement proper input validation
- Add rate limiting to prevent abuse
- Use HTTPS in production
- Regularly update dependencies

## Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Socket.io Documentation](https://socket.io/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Vitest Testing Framework](https://vitest.dev/)

---

For more specific information, see:
- [Quick Start Guide](QUICK_START.md)
- [Deployment Guide](DEPLOYMENT.md)
- [API Documentation](API.md) (coming soon)