import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  esbuild: {
    // Enable JSX in .js files
    loader: 'tsx',
    include: /\.(ts|tsx|js|jsx)$/,
  },
  // Use the app TypeScript config for path resolution
  // This ensures @/* aliases work in tests
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts', './src/components/__tests__/setup.ts'],
    css: true,
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'src/components/__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/backend/**', // Exclude backend tests (they use Jest)
      '**/tests/e2e/**', // Exclude E2E tests (they use Playwright)
      '**/.dev/**', // Exclude .dev directory
      '**/*.{config,spec}.js'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'backend/', // Exclude backend from coverage
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/dist/**',
        '**/build/**',
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
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
    },
  },
});