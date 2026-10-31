import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    sourcemap: false,
    target: 'es2022',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
            return 'vendor-firebase';
          }
        },
      },
    },
  },
});
