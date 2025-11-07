import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { execSync } from "child_process";

// Note: @dyad-sh/react-vite-component-tagger is a development-only dependency
// It should be installed separately if needed for development collaboration

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Security headers for production
  server: {
    host: "::",
    port: 8080,
    // Only enable HMR in development
    hmr: mode === 'development' ? {} : false,
  },
  css: {
    postcss: './config/postcss.config.js',
  },
  plugins: [
    react(),
    // Only use component tagger in development
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src"),
      "@frontend": path.resolve(__dirname, "../src/frontend"),
    },
  },
  build: {
    // Target modern browsers for better performance
    target: 'es2020',
    // Output directory
    outDir: './.build/dist',
    // Optimize CSS
    cssCodeSplit: true,
    // Ensure proper SPA routing in production
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          vendor: ['react', 'react-dom'],
          // Routing
          router: ['react-router-dom'],
          // UI framework libraries
          ui: ['lucide-react', '@radix-ui/react-toast', '@radix-ui/react-tooltip', '@radix-ui/react-dialog'],
          // State management and utilities
          state: ['@tanstack/react-query', '@supabase/supabase-js', 'zod'],
        },
        // Optimize chunk naming for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Optimize build for better performance
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : [],
      },
      mangle: {
        safari10: true,
      },
    },
    // Enable source maps only in development
    sourcemap: mode === 'development',
    // Optimize chunk size limits
    chunkSizeWarningLimit: 600,
    // Enable build reports for analysis
    reportCompressedSize: false,
    // Optimize dependencies
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  preview: {
    port: 4173,
    host: "::",
    // Security headers for preview server
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@vite/client', '@vite/env'],
  },
  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __GIT_COMMIT__: JSON.stringify((() => {
      try {
        return execSync('git rev-parse --short HEAD').toString().trim();
      } catch {
        return 'unknown';
      }
    })()),
    __GIT_BRANCH__: JSON.stringify((() => {
      try {
        return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
      } catch {
        return 'main';
      }
    })()),
  },
}));


