// _scratch_cb2_probe.ts — throwaway probe for founder_proxy Checkpoint B cycle 2,
// derivative_as_secant_limit. Drives named poses across STATE_2/3/5/8/9 either via
// PARAM_UPDATE (true live-control vars: S6/S9's x0, S9's xq) or via a computed
// SET_TIME_FREEZE at_ms (choreography-only vars: S3's hlog, S5's hlog, S8's u —
// PARAM_UPDATE is a no-op for these, silently ignored by the renderer's own
// "only re-apply vars the state authors as live controls" guard). Reads
// window.__pmDebug.readouts for the RESOLVED placement (plot_point/secant_line/
// tangent_line only), measures textWidth for label-clearance math (G-5), and
// screenshots crops for visual confirmation.
//
// Run: npx tsx --env-file=.env.local src/scripts/_scratch_cb2_probe.ts
import '@/lib/loadEnvLocal';
import { assembleSimFromSource } from './lib/assembleSimFromSource';
import { launchBrowser } from '../lib/validators/visual/chromiumProvider';

const OUT_DIR =
  '/private/tmp/claude-501/-Users-karthikyerragadda-Desktop-Viditra-Physics-mind/beb94460-03d3-4aa2-bac9-e1f5081477a9/scratchpad/crops';

type Pose = {
  label: string;
  state: string;
  atMs: number; // SET_TIME_FREEZE at_ms — resolves choreography-only vars (hlog/u)
  params?: Record<string, number>; // PARAM_UPDATE — only effective for true live-control vars
};

const POSES: Pose[] = [
  // G-1: S2 is static (x0 default=1, no choreography) — one frame suffices.
  { label: 's2_default', state: 'STATE_2', atMs: 100 },
  // G-3: run_label appears at 7000ms + 600ms animate_in; sample after settle.
  { label: 's2_run_label', state: 'STATE_2', atMs: 9000 },
  { label: 's2_full', state: 'STATE_2', atMs: 16000 },
  // G-1: S3's hlog sweeps 0 -> -2 over [1500, 1500+19000=20500]ms (2 holds, 2000ms each).
  { label: 's3_start', state: 'STATE_3', atMs: 1600 },
  { label: 's3_mid', state: 'STATE_3', atMs: 10000 },
  { label: 's3_end_coincidence', state: 'STATE_3', atMs: 23000 },
  // G-1: S9 explore — x0/xq are true drag-bound live controls.
  { label: 's9_symmetric', state: 'STATE_9', atMs: 100, params: { x0: 1.0, xq: -1.0 } },
  { label: 's9_coincidence', state: 'STATE_9', atMs: 100, params: { x0: 1.0, xq: 1.02 } },
  { label: 's9_band_mid', state: 'STATE_9', atMs: 100, params: { x0: 1.0, xq: -0.97 } },
  { label: 's9_band_left_edge', state: 'STATE_9', atMs: 100, params: { x0: 1.0, xq: -1.22 } },
  { label: 's9_band_right_edge', state: 'STATE_9', atMs: 100, params: { x0: 1.0, xq: -0.72 } },
  { label: 's9_left_branch_far', state: 'STATE_9', atMs: 100, params: { x0: 1.0, xq: -1.9 } },
  { label: 's9_right_branch_far', state: 'STATE_9', atMs: 100, params: { x0: 1.0, xq: 2.0 } },
  // G-4: S5's hlog sweeps -0.398 -> -3 over [4000, 16000]ms, no holds.
  { label: 's5_start', state: 'STATE_5', atMs: 4500 },
  { label: 's5_mid', state: 'STATE_5', atMs: 9082 },
  { label: 's5_near_end', state: 'STATE_5', atMs: 15539 },
  { label: 's5_end', state: 'STATE_5', atMs: 22000 },
  // G-5: S8's u sweeps -1.6 -> 1.6 over [2500, 16500]ms, no holds.
  { label: 's8_sweep_start', state: 'STATE_8', atMs: 2700 },
  { label: 's8_u_zero', state: 'STATE_8', atMs: 9500 },
  { label: 's8_u_pre_zero', state: 'STATE_8', atMs: 9200 },
  { label: 's8_u_post_zero', state: 'STATE_8', atMs: 9800 },
  { label: 's8_frozen_pin', state: 'STATE_8', atMs: 18500 },
  // G-2 verify: S6 negative x0 (true drag/choreography-seizable live control).
  { label: 's6_negative', state: 'STATE_6', atMs: 100, params: { x0: -1.13 } },
];

async function main(): Promise<void> {
  const built = assembleSimFromSource('derivative_as_secant_limit');
  if (!built) throw new Error('assembleSimFromSource returned null');

  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 760, height: 500 }, deviceScaleFactor: 2 });
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

  const measurements = await page.evaluate(() => {
    const w = window as unknown as { textSize: (n: number) => void; textWidth: (s: string) => number };
    w.textSize(11);
    const heightSlope = w.textWidth('height = slope');
    const runLabel11 = w.textWidth('run = h = 1.000');
    const riseLabel11 = w.textWidth('rise = 1.500');
    const qReadout11 = w.textWidth('Q = (2.00, 2.00)');
    w.textSize(12);
    const qReadout12 = w.textWidth('Q = (2.00, 2.00)');
    w.textSize(13);
    const runLabel13 = w.textWidth('run = h = 1.000');
    return {
      heightSlope_fs11: heightSlope,
      runLabel_fs11: runLabel11,
      runLabel_fs13: runLabel13,
      riseLabel_fs11: riseLabel11,
      qReadout_fs11: qReadout11,
      qReadout_fs12: qReadout12,
    };
  });
  console.log('=== textWidth measurements ===');
  console.log(JSON.stringify(measurements, null, 2));

  for (const pose of POSES) {
    await page.evaluate((s) => {
      window.postMessage({ type: 'SET_STATE', state: s }, '*');
    }, pose.state);
    await page.waitForTimeout(500);
    await page.evaluate((atMs) => {
      window.postMessage({ type: 'SET_TIME_FREEZE', at_ms: atMs }, '*');
    }, pose.atMs);
    await page.waitForTimeout(250);
    for (const [key, value] of Object.entries(pose.params || {})) {
      await page.evaluate(
        ({ key, value }) => {
          window.postMessage({ type: 'PARAM_UPDATE', key, value }, '*');
        },
        { key, value },
      );
      await page.waitForTimeout(150);
    }
    await page.waitForTimeout(300);

    const dbg = await page.evaluate(() => {
      const w = window as unknown as { __pmDebug?: { readouts?: Record<string, unknown> } };
      return w.__pmDebug ? w.__pmDebug.readouts : null;
    });

    const outPath = `${OUT_DIR}/${pose.label}.png`;
    const canvas = page.locator('canvas').first();
    await canvas.screenshot({ path: outPath });
    console.log(`--- ${pose.label} (${pose.state}, at_ms=${pose.atMs}, ${JSON.stringify(pose.params || {})}) ---`);
    console.log(JSON.stringify(dbg, null, 2));
  }

  await browser.close();
  console.log('console/page errors captured:', consoleErrors.length ? consoleErrors : '(none)');
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
