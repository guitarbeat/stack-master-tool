import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Vite configuration - https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: mode === 'development' ? {} : false,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "./src"),
      },
    ],
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  build: {
    target: 'es2020',
    outDir: './.build/dist',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', '@radix-ui/react-toast', '@radix-ui/react-tooltip', '@radix-ui/react-dialog'],
          state: ['@tanstack/react-query', '@supabase/supabase-js', 'zod'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    minify: 'esbuild',
    sourcemap: mode === 'development',
    chunkSizeWarningLimit: 600,
    reportCompressedSize: false,
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  optimizeDeps: {
    // NOTE: Exclude @supabase/supabase-js to avoid "invalid or unexpected token" preview failures.
    // Include postgrest-js so Vite converts its CJS exports to ESM (fixes "does not provide export named 'default'").
    exclude: ['@supabase/supabase-js'],
    include: ['react', 'react-dom', 'react-router-dom', 'yjs', 'y-webrtc', '@supabase/postgrest-js'],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
    },
  },
  preview: {
    port: 4173,
    host: "::",
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __GIT_COMMIT__: JSON.stringify('unknown'),
    __GIT_BRANCH__: JSON.stringify('main'),
    // Required for y-webrtc's simple-peer dependency
    'process.env': {},
    global: 'globalThis',
  },
}));
