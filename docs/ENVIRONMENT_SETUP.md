# Environment Setup Guide

This guide explains how to configure environment variables for the Stack Master Tool application.

## Overview

The application uses environment variables for configuration across different environments (development, staging, production). This ensures sensitive data is kept secure and configuration can be easily changed without modifying code.

## Environment Files

### Frontend (.env.local)

Create a `.env.local` file in the root directory for frontend environment variables:

```bash
# Copy the example file
cp .env.example .env.local
```

**Required Variables:**
- `VITE_API_URL`: Backend API URL (default: http://localhost:3000)
- `VITE_SOCKET_URL`: WebSocket server URL (default: http://localhost:3000)

**Optional Variables:**
- `VITE_SUPABASE_URL`: Supabase project URL (for production features)
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_DEBUG`: Enable debug logging (default: false)
- `VITE_LOG_LEVEL`: Logging level (default: info)
- `VITE_ENABLE_ANALYTICS`: Enable analytics (default: false)
- `VITE_ENABLE_ERROR_REPORTING`: Enable error reporting (default: true)

### Backend (.env)

Create a `.env` file in the `backend/` directory for backend environment variables:

```bash
# Copy the example file
cd backend
cp .env.example .env
```

**Required Variables:**
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

**Optional Variables:**
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `CORS_ORIGIN`: Allowed CORS origins (default: http://localhost:5173)
- `LOG_LEVEL`: Logging level (default: info)
- `ENABLE_REQUEST_LOGGING`: Enable request logging (default: true)
- `JWT_SECRET`: JWT signing secret
- `SESSION_SECRET`: Session secret
- `DATABASE_URL`: Direct database connection URL
- `REDIS_URL`: Redis connection URL

## Environment-Specific Configuration

### Development

For local development, use the example files as templates:

```bash
# Frontend
cp .env.example .env.local

# Backend
cd backend
cp .env.example .env
```

### Staging

Create environment-specific files:

```bash
# Frontend
cp .env.example .env.staging

# Backend
cd backend
cp .env.example .env.staging
```

### Production

For production deployment, set environment variables through your hosting platform:

**Render.com:**
- Go to your service dashboard
- Navigate to Environment tab
- Add each variable with its production value

**Vercel:**
- Go to your project dashboard
- Navigate to Settings > Environment Variables
- Add each variable for Production environment

**Railway:**
- Go to your project dashboard
- Navigate to Variables tab
- Add each variable

## Security Best Practices

### 1. Never Commit Sensitive Data

- Add `.env*` files to `.gitignore`
- Use `.env.example` files for documentation
- Store secrets in secure environment variable systems

### 2. Use Different Secrets Per Environment

- Generate unique secrets for each environment
- Use strong, random secrets (32+ characters)
- Rotate secrets regularly

### 3. Validate Environment Variables

The application validates required environment variables on startup:

```typescript
// Frontend validation
const requiredEnvVars = ['VITE_API_URL', 'VITE_SOCKET_URL'];
const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
}
```

### 4. Use Environment-Specific Values

```typescript
// Example configuration
const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  debug: import.meta.env.VITE_DEBUG === 'true',
  logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
};
```

## Common Environment Setups

### Local Development

```bash
# Frontend .env.local
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
VITE_DEBUG=true
VITE_LOG_LEVEL=debug

# Backend .env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true
```

### Production

```bash
# Frontend (set in hosting platform)
VITE_API_URL=https://your-api-domain.com
VITE_SOCKET_URL=https://your-api-domain.com
VITE_DEBUG=false
VITE_LOG_LEVEL=error
VITE_ENABLE_ANALYTICS=true

# Backend (set in hosting platform)
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
LOG_LEVEL=warn
ENABLE_REQUEST_LOGGING=false
JWT_SECRET=your-production-jwt-secret
SESSION_SECRET=your-production-session-secret
```

## Troubleshooting

### Common Issues

**1. Environment variables not loading:**
- Ensure file is named correctly (`.env.local` for frontend, `.env` for backend)
- Restart the development server after adding new variables
- Check for typos in variable names

**2. CORS errors:**
- Verify `CORS_ORIGIN` matches your frontend URL
- Check that `VITE_API_URL` and `VITE_SOCKET_URL` are correct

**3. Supabase connection issues:**
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check that your Supabase project is active
- Ensure the service role key has proper permissions

**4. Build failures:**
- Ensure all required environment variables are set
- Check that variable values don't contain special characters that need escaping
- Verify that boolean values are strings ('true'/'false')

### Debugging Environment Variables

**Frontend:**
```typescript
// Add to your component for debugging
console.log('Environment variables:', import.meta.env);
```

**Backend:**
```javascript
// Add to your server startup
console.log('Environment variables:', process.env);
```

## Environment Variable Reference

### Frontend Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes | `http://localhost:3000` | Backend API URL |
| `VITE_SOCKET_URL` | Yes | `http://localhost:3000` | WebSocket server URL |
| `VITE_SUPABASE_URL` | No | - | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | No | - | Supabase anonymous key |
| `VITE_DEBUG` | No | `false` | Enable debug logging |
| `VITE_LOG_LEVEL` | No | `info` | Logging level |
| `VITE_ENABLE_ANALYTICS` | No | `false` | Enable analytics |
| `VITE_ENABLE_ERROR_REPORTING` | No | `true` | Enable error reporting |

### Backend Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | Yes | `3000` | Server port |
| `NODE_ENV` | Yes | `development` | Environment mode |
| `SUPABASE_URL` | No | - | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | No | - | Supabase service role key |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Allowed CORS origins |
| `LOG_LEVEL` | No | `info` | Logging level |
| `ENABLE_REQUEST_LOGGING` | No | `true` | Enable request logging |
| `JWT_SECRET` | No | - | JWT signing secret |
| `SESSION_SECRET` | No | - | Session secret |
| `DATABASE_URL` | No | - | Direct database URL |
| `REDIS_URL` | No | - | Redis connection URL |

## Next Steps

1. Copy the example files to create your environment configuration
2. Update the values with your specific configuration
3. Test the application to ensure all variables are working correctly
4. Deploy to your hosting platform with production environment variables

For more information, see:
- [Development Environment Setup](DEVELOPMENT.md)
- [Deployment Guide](DEPLOYMENT.md)
- [API Documentation](API.md) (coming soon)