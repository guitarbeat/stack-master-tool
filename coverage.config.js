module.exports = {
  // Frontend coverage configuration
  frontend: {
    provider: 'v8',
    reporter: ['text', 'json', 'html', 'lcov'],
    exclude: [
      'node_modules/',
      'backend/',
      'src/test/',
      '**/*.d.ts',
      '**/*.config.*',
      '**/coverage/**',
      '**/dist/**',
      '**/build/**',
      '**/tests/**',
      '**/__tests__/**',
    ],
    thresholds: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
  
  // Backend coverage configuration
  backend: {
    collectCoverageFrom: [
      '**/*.js',
      '!**/node_modules/**',
      '!**/coverage/**',
      '!jest.config.js',
      '!**/__tests__/**',
      '!**/*.test.js',
      '!**/*.spec.js',
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
  },
  
  // Combined coverage thresholds
  combined: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  }
};