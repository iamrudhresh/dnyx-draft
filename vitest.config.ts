import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    // Picks up unit and integration test files. `tests/e2e/**` uses the
    // Playwright test runner (`pnpm test:e2e`), not Vitest.
    // Benchmark files (.bench.ts) are run separately via `pnpm bench`.
    include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
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
