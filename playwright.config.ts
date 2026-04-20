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
  timeout: 30_000,
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
