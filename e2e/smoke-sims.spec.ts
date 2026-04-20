/**
 * Smoke harness — verifies that cached simulation HTML honors the renderer
 * postMessage contract:
 *
 *   1. On load, sim posts { type: 'SIM_READY' }
 *   2. When parent sends { type: 'SET_STATE', state: 'STATE_1' },
 *      sim posts { type: 'STATE_REACHED', state: 'STATE_1' } within a few seconds
 *
 * Source of truth for sim HTML is Supabase `simulation_cache`. No live LLM
 * pipeline, no dev server required — just credentials to read the cache.
 *
 * If `simulation_cache` is empty OR env vars are missing, the test skips with
 * a clear message rather than failing. That way the harness is safe to run
 * on a fresh checkout.
 */

import { test, expect, Page } from '@playwright/test';
import { config as loadEnv } from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local from the repo root (Playwright doesn't auto-load like Next.js)
loadEnv({ path: path.resolve(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MAX_SIMS = Number(process.env.SMOKE_MAX_SIMS ?? '5');

interface CachedSim {
  concept_id: string;
  sim_html: string;
  renderer_type: string | null;
}

async function fetchCachedSims(limit: number): Promise<CachedSim[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  const client = createClient(SUPABASE_URL, SUPABASE_KEY);
  // Skip rows where concept_id is NULL — those are pipeline-fallback rows
  // (v5 generator writes a "Simulation temporarily unavailable" template on
  // soft failure) whose sim_html can crash the chromium worker during load.
  // Real concepts always populate concept_id.
  const { data, error } = await client
    .from('simulation_cache')
    .select('concept_id, sim_html, renderer_type')
    .not('sim_html', 'is', null)
    .not('concept_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.log(`[smoke] Supabase query failed: ${error.message}`);
    return [];
  }
  return (data ?? []) as CachedSim[];
}

async function waitForSimReady(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const messages = (window as unknown as { __simMessages?: unknown[] }).__simMessages;
      return Array.isArray(messages) && messages.some((m) => {
        return m !== null && typeof m === 'object' && (m as { type?: unknown }).type === 'SIM_READY';
      });
    },
    { timeout: 10_000 },
  );
}

async function waitForStateReached(page: Page, state: string): Promise<void> {
  await page.waitForFunction(
    (target: string) => {
      const messages = (window as unknown as { __simMessages?: unknown[] }).__simMessages;
      return Array.isArray(messages) && messages.some((m) => {
        if (m === null || typeof m !== 'object') return false;
        const msg = m as { type?: unknown; state?: unknown };
        return msg.type === 'STATE_REACHED' && msg.state === target;
      });
    },
    state,
    { timeout: 10_000 },
  );
}

test.describe('Sim postMessage contract', () => {
  /**
   * Self-test: proves the harness's contract-detection logic works against a
   * minimal hand-crafted fixture. If this fails, the harness is broken — not
   * any real renderer.
   */
  test('fixture honors SIM_READY + STATE_REACHED (self-test)', async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __simMessages: unknown[] }).__simMessages = [];
      window.addEventListener('message', (e) => {
        (window as unknown as { __simMessages: unknown[] }).__simMessages.push(e.data);
      });
    });

    const fixturePath = path.resolve(__dirname, 'fixtures', 'minimal-contract.html');
    const fixtureUrl = `file://${fixturePath.replace(/\\/g, '/')}`;
    await page.goto(fixtureUrl);

    await waitForSimReady(page);
    await page.evaluate(() => {
      window.postMessage({ type: 'SET_STATE', state: 'STATE_1' }, '*');
    });
    await waitForStateReached(page, 'STATE_1');

    expect(true).toBe(true);
  });

  test('cached sims honor SIM_READY + STATE_REACHED', async ({ browser }) => {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.log('[smoke] NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — skipping');
      test.skip();
      return;
    }

    const cached = await fetchCachedSims(MAX_SIMS);

    if (cached.length === 0) {
      console.log('[smoke] simulation_cache is empty. Trigger some sims via the app first, then re-run.');
      test.skip();
      return;
    }

    // Each sim gets its own page inside a single shared context. Per-sim
    // isolation prevents a hung p5 sketch from leaking into the next sim's
    // run, but we reuse one context so we don't pay the chromium startup cost
    // N times. The explicit setContent/wait timeouts (8s/10s) bound every
    // step so a pathological sim can't eat the test budget.
    test.setTimeout(cached.length * 25_000 + 15_000);

    const context = await browser.newContext();
    const failures: Array<{ concept: string; step: string; error: string }> = [];

    try {
      for (const sim of cached) {
        const label = `${sim.concept_id} [${sim.renderer_type ?? 'unknown'}]`;
        console.log(`[smoke] ${label}`);

        const page = await context.newPage();
        await page.addInitScript(() => {
          (window as unknown as { __simMessages: unknown[] }).__simMessages = [];
          window.addEventListener('message', (e) => {
            (window as unknown as { __simMessages: unknown[] }).__simMessages.push(e.data);
          });
        });

        try {
          try {
            await page.setContent(sim.sim_html, { waitUntil: 'load', timeout: 8_000 });
          } catch (e) {
            failures.push({
              concept: sim.concept_id,
              step: 'page.setContent',
              error: (e as Error).message,
            });
            continue;
          }

          try {
            await waitForSimReady(page);
          } catch {
            failures.push({ concept: sim.concept_id, step: 'SIM_READY timeout (10s)', error: '' });
            continue;
          }

          try {
            await page.evaluate(() => {
              window.postMessage({ type: 'SET_STATE', state: 'STATE_1' }, '*');
            });
            await waitForStateReached(page, 'STATE_1');
          } catch {
            failures.push({
              concept: sim.concept_id,
              step: 'STATE_REACHED timeout after SET_STATE:STATE_1 (10s)',
              error: '',
            });
            continue;
          }
        } finally {
          await page.close().catch(() => undefined);
        }
      }
    } finally {
      await context.close().catch(() => undefined);
    }

    console.log(`[smoke] Checked ${cached.length} cached sim(s). ${failures.length} failure(s).`);

    if (failures.length > 0) {
      const report = failures
        .map((f) => `  ${f.concept} — ${f.step}${f.error ? `: ${f.error}` : ''}`)
        .join('\n');
      throw new Error(`Smoke harness failures:\n${report}`);
    }

    expect(failures.length).toBe(0);
  });
});
