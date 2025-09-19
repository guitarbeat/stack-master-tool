# Testing Guide

This project uses a comprehensive testing strategy with multiple testing frameworks and tools to ensure code quality and reliability.

## Testing Stack

### Frontend Testing
- **Vitest** - Fast unit testing framework
- **React Testing Library** - Component testing utilities
- **Jest DOM** - Custom matchers for DOM testing
- **Playwright** - End-to-end testing

### Backend Testing
- **Jest** - Unit and integration testing
- **Supertest** - HTTP assertion library for API testing

## Running Tests

### Frontend Tests
```bash
# Run all frontend tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage
```

### Backend Tests
```bash
# Run backend tests
npm run test:backend

# Run backend tests in watch mode
npm run test:backend:watch

# Run backend tests with coverage
npm run test:backend:coverage
```

### End-to-End Tests
```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed
```

### All Tests
```bash
# Run all tests (frontend + backend + E2E)
npm run test:full

# Run tests for CI (frontend + backend)
npm run test:ci

# Run all tests including E2E
npm run test:all
```

## Test Structure

### Frontend Tests
```
src/
├── components/
│   ├── __tests__/
│   │   └── ErrorDisplay.test.tsx
│   └── ErrorDisplay.tsx
├── services/
│   ├── __tests__/
│   │   └── api.test.ts
│   └── api.js
└── test/
    └── setup.ts
```

### Backend Tests
```
backend/
├── __tests__/
│   ├── setup.js
│   ├── services/
│   │   └── meetings.test.js
│   └── routes/
│       └── meetings.test.js
├── services/
│   └── meetings.js
└── routes/
    └── meetings.js
```

### E2E Tests
```
tests/
└── e2e/
    ├── homepage.spec.ts
    ├── meeting-creation.spec.ts
    └── meeting-joining.spec.ts
```

## Test Configuration

### Vitest Configuration (`vitest.config.ts`)
- Uses jsdom environment for React testing
- Configured with path aliases
- Coverage reporting with v8 provider
- Custom setup file for test utilities

### Jest Configuration (`backend/jest.config.js`)
- Node environment for backend testing
- Coverage collection from all JS files
- Custom setup file for global test configuration

### Playwright Configuration (`playwright.config.ts`)
- Multiple browser testing (Chrome, Firefox, Safari)
- Mobile viewport testing
- Parallel test execution
- Screenshot and video recording on failure

## Coverage Reports

Coverage reports are generated in multiple formats:
- **HTML**: `coverage/index.html` (frontend) and `backend/coverage/index.html` (backend)
- **LCOV**: `coverage/lcov.info` for CI integration
- **JSON**: `coverage/coverage-final.json` for programmatic access

### Coverage Thresholds
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## CI/CD Integration

### GitHub Actions Workflows

#### `ci.yml` - Continuous Integration
- Runs on push to main/develop branches
- Runs on pull requests
- Includes frontend tests, backend tests, E2E tests, and build verification
- Uploads coverage reports to Codecov

#### `pr-checks.yml` - Pull Request Checks
- Runs on pull request events
- Performs quality checks (linting, type checking, testing)
- Comments on PRs with test results

#### `deploy.yml` - Deployment
- Runs on push to main branch
- Deploys to production after successful tests
- Includes deployment status notifications

## Writing Tests

### Frontend Component Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Backend API Tests
```javascript
const request = require('supertest');
const express = require('express');
const app = express();

describe('API Routes', () => {
  it('should return 200 for valid request', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);
    
    expect(response.body).toHaveProperty('data');
  });
});
```

### E2E Tests
```typescript
import { test, expect } from '@playwright/test';

test('should navigate to page', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Expected Title/);
});
```

## Best Practices

1. **Test Naming**: Use descriptive test names that explain what is being tested
2. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
3. **Mocking**: Mock external dependencies and APIs appropriately
4. **Coverage**: Aim for high test coverage but focus on meaningful tests
5. **Isolation**: Tests should be independent and not rely on other tests
6. **Performance**: Keep tests fast and efficient
7. **Maintenance**: Keep tests up to date with code changes

## Debugging Tests

### Frontend Tests
- Use `npm run test:ui` for interactive test runner
- Add `console.log` statements for debugging
- Use browser dev tools when running in jsdom

### Backend Tests
- Use `npm run test:backend:watch` for continuous testing
- Add debugger statements and use Node.js debugger
- Check console output for detailed error messages

### E2E Tests
- Use `npm run test:e2e:headed` to see tests run in browser
- Use `npm run test:e2e:ui` for interactive debugging
- Check screenshots and videos in `test-results/` directory

## Troubleshooting

### Common Issues

1. **Tests timing out**: Increase timeout in configuration
2. **Mock not working**: Check mock setup and imports
3. **E2E tests failing**: Ensure both frontend and backend are running
4. **Coverage not updating**: Clear coverage directory and re-run tests

### Getting Help

- Check test output for specific error messages
- Review configuration files for proper setup
- Consult framework documentation (Vitest, Jest, Playwright)
- Check GitHub Actions logs for CI/CD issues