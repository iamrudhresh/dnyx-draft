import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'apps/web/vitest.config.ts',
  {
    test: {
      name: 'root',
      include: ['tests/**/*.test.ts'],
      environment: 'node',
    },
  },
]);
