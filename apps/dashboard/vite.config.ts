import { defineConfig } from 'vite';

// In development the API runs on :3000; the browser talks to it through this proxy (same origin, no CORS).
export default defineConfig({
  server: { proxy: { '/api': { target: process.env.VITE_DEV_API ?? 'http://localhost:3000', changeOrigin: false } } },
  preview: { proxy: { '/api': { target: process.env.VITE_DEV_API ?? 'http://localhost:3000', changeOrigin: false } } },
  build: { sourcemap: false, target: 'es2022' },
});
