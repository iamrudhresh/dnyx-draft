import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    // Picks up unit, integration, and E2E-lite test files.
    // Benchmark files (.bench.ts) are run separately via `pnpm bench`.
    include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
    benchmark: {
      include: ['tests/**/*.bench.ts'],
    },
  },
  resolve: {
    alias: {
      // `@/` resolves to the web app root so test imports match source imports.
      '@': path.resolve(__dirname, 'apps/web'),
    },
  },
});
