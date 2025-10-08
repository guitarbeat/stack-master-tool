import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/backend/**',
      '**/tests/e2e/**',
      '**/*.{config,spec}.js'
    ],
    // * Performance optimizations
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4,
      },
    },
    // * Test timeout configuration
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    // * Coverage configuration for performance
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'backend/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/dist/**',
        '**/build/**',
        '**/__tests__/**',
        '**/__mocks__/**',
      ],
      // * Performance-focused thresholds
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
      // * Skip coverage for performance
      skipFull: true,
    },
    // * Reporter configuration
    reporter: ['verbose', 'json'],
    outputFile: {
      json: './test-results/results.json',
    },
    // * Test file patterns for better performance
    includeSource: ['src/**/*.{js,ts,jsx,tsx}'],
    // * Environment variables for testing
    env: {
      NODE_ENV: 'test',
      VITEST: 'true',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@frontend': path.resolve(__dirname, './src/frontend'),
    },
  },
  // * Build optimizations
  build: {
    target: 'esnext',
    minify: false,
    sourcemap: false,
  },
  // * Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@testing-library/react',
      '@testing-library/jest-dom',
      'vitest',
    ],
  },
});