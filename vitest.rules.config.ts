import { defineConfig } from 'vitest/config';
// Firestore rules tests need the emulator: run via `pnpm test:rules` (firebase emulators:exec).
export default defineConfig({ test: { include: ['tests/firestore/**/*.test.ts'], testTimeout: 30_000, hookTimeout: 60_000, fileParallelism: false } });
