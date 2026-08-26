import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for PhysicsMind smoke harness.
 *
 * Scope (today): validate renderer postMessage contract against cached sims
 * in Supabase `simulation_cache`. No live LLM pipeline, no dev server.
 *
 * Run: npm run smoke
 * First-time setup: npm run smoke:install (one-time chromium download)
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  // 30s flaked once per full answer-book run on a cold page.goto once the
  // physics+maths merge took dist to ~4 MB (2026-08-23; always passed in
  // isolation). Raised per the recorded protocol — the fleet sweeps set their
  // own longer test.setTimeout and are unaffected by this default.
  timeout: 60_000,
  expect: { timeout: 5_000 },
  use: {
    trace: 'on-first-retry',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
