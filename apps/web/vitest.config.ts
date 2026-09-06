import path from 'node:path';
import { defineConfig } from 'vitest/config';

// Tests for the web app now live in <repo-root>/tests/.
// This config is kept so editors and tooling that resolve from apps/web/
// still find the correct alias and environment settings.
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: [],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
