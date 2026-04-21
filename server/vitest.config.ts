import { defineConfig } from 'vitest/config';

// Coverage governance (current policy — see docs/KNOWN_ISSUES.md KI-P14-002):
// Thresholds are intentionally set to 0 so the config file is the single
// source of truth and local runs behave identically to CI. Aspirational
// floors (60/60/50) have been removed rather than left dormant because
// silently unenforced thresholds are a false control. They will be
// re-introduced and ratcheted up once the Phase 17 assessment rules
// engine ships with the test density to back them up.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      include: ['src/api/**/*.service.ts', 'src/repositories/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      thresholds: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0,
      },
    },
  },
});
