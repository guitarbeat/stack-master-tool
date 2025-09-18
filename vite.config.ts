import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Enable SPA fallback for development
    historyApiFallback: true,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@frontend": path.resolve(__dirname, "./src/frontend"),
    },
  },
  build: {
    // Ensure proper SPA routing in production
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  preview: {
    port: 4173,
    host: "::",
  },
}));


