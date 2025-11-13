import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: mode === 'development' ? {} : false,
  },
  css: {
    postcss: './config/postcss.config.js',
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@frontend": path.resolve(__dirname, "./src/frontend"),
    },
  },
  build: {
    target: "es2020",
    outDir: "./.build/dist",
    cssCodeSplit: true,
    minify: "esbuild",
    sourcemap: mode === "development",
    chunkSizeWarningLimit: 600,
    reportCompressedSize: false,
    commonjsOptions: {
      include: [/node_modules/],
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
  },
}));
