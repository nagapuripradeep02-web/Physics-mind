// _scratch_derivative_checkpointb_probe.ts — throwaway probe for founder_proxy
// Checkpoint B, derivative_as_secant_limit, F-11's named WORST CASE: dragging
// Q toward P in the explore state (STATE_9). Assembles the sim HTML straight
// from the CURRENT (post-fix) concept JSON via assembleSimFromSource — the
// same helper _seed_subject_cache.ts uses — loads it directly (no iframe
// wrapper needed for a single-panel screenshot), drives SET_STATE + two
// PARAM_UPDATEs to park P at x0=1.00 and Q at xq=1.02 (the closest approach
// reachable under the drag quantum 1/80=0.0125), freezes the clock so the
// capture is deterministic, and screenshots the canvas.
//
// Run: npx tsx --env-file=.env.local src/scripts/_scratch_derivative_checkpointb_probe.ts
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { assembleSimFromSource } from './lib/assembleSimFromSource';
import { launchBrowser } from '../lib/validators/visual/chromiumProvider';

async function main(): Promise<void> {
  const built = assembleSimFromSource('derivative_as_secant_limit');
  if (!built) throw new Error('assembleSimFromSource returned null');

  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 760, height: 500 }, deviceScaleFactor: 1 });
  const consoleErrors: string[] = [];
  page.on('pageerror', (e) => consoleErrors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });

  await page.setContent(built.simHtml, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof (window as unknown as { PM_simTimeMs?: number }).PM_simTimeMs === 'number', undefined, {
    timeout: 20000,
  });
  await page.waitForTimeout(300);

  // Move to STATE_9 (the explore state).
  await page.evaluate(() => {
    window.postMessage({ type: 'SET_STATE', state: 'STATE_9' }, '*');
  });
  await page.waitForTimeout(600);

  // Freeze the clock for a deterministic capture (mirrors THE EYE's own
  // frozen-frame technique) BEFORE driving the drag, so the ping_pong
  // choreography on xq doesn't fight the PARAM_UPDATE we're about to send.
  await page.evaluate(() => {
    window.postMessage({ type: 'SET_TIME_FREEZE', at_ms: 100 }, '*');
  });
  await page.waitForTimeout(300);

  // Park P at the default x0=1.00 and drag Q to the closest reachable
  // approach under the drag quantum (1/80=0.0125) — xq=1.02 lands just past
  // that quantum, matching the report's own worst-case framing.
  await page.evaluate(() => {
    window.postMessage({ type: 'PARAM_UPDATE', key: 'x0', value: 1.0 }, '*');
  });
  await page.waitForTimeout(200);
  await page.evaluate(() => {
    window.postMessage({ type: 'PARAM_UPDATE', key: 'xq', value: 1.02 }, '*');
  });
  await page.waitForTimeout(400);

  const canvas = page.locator('canvas').first();
  const outPath =
    '/private/tmp/claude-501/-Users-karthikyerragadda-Desktop-Viditra-Physics-mind/beb94460-03d3-4aa2-bac9-e1f5081477a9/scratchpad/crops/s9_drag_near_p_probe.png';
  await canvas.screenshot({ path: outPath });

  await browser.close();

  console.log('console/page errors captured:', consoleErrors.length ? consoleErrors : '(none)');
  console.log('Screenshot saved to', outPath);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
