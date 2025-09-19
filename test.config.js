module.exports = {
  // Test configuration for the entire project
  projects: [
    {
      displayName: 'Frontend Tests',
      testMatch: ['<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@frontend/(.*)$': '<rootDir>/src/frontend/$1',
      },
      collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/test/**',
        '!src/**/*.test.*',
        '!src/**/*.spec.*',
      ],
    },
    {
      displayName: 'Backend Tests',
      testMatch: ['<rootDir>/backend/**/*.{test,spec}.js'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/backend/__tests__/setup.js'],
      collectCoverageFrom: [
        'backend/**/*.js',
        '!backend/**/*.test.js',
        '!backend/**/*.spec.js',
        '!backend/__tests__/**',
        '!backend/node_modules/**',
      ],
    },
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 10000,
  verbose: true,
};