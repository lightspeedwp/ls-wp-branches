import { defineConfig } from 'vitest/config';

// Tests live in a __tests__/ folder beside each script. Coverage covers this
// skill's own TypeScript tooling; the synced canonical validator (.cjs) is
// excluded because it is an unmodified copy from lightspeedwp/.github.
export default defineConfig({
  test: {
    include: ['scripts/**/__tests__/**/*.test.ts'],
    environment: 'node',
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['scripts/**/*.ts'],
      exclude: ['scripts/**/__tests__/**'],
      reporter: ['text', 'lcov'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
