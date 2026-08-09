// _scratch_wpr6_round3_pin_drag_probe.ts — throwaway probe for bug_class
// pcpl_guided_state_drag_evaporates_mid_choreography (quality_auditor
// round 3, 2026-08-09).
//
// Drives the REAL definite_integral_as_accumulated_area concept (read from
// the same scratchpad copy _scratch_wpr6_real_drag_instrument.ts uses —
// git-show'd read-only, never checked into this desk's tracked tree)
// inside a REAL <iframe> embedding, and performs a REAL mouse drag on
// STATE_5's bound_marker at two pins:
//   - pin 6000  — DURING STATE_5's own c-ramp (start_ms:2000, duration_ms:12000
//                 -> active 2000-14000ms)
//   - pin 16000 — AFTER that ramp has settled
// plus the STATE_8 explore control (drag survives regardless, unaffected by
// this fix either way).
//
// Uses SET_TIME_FREEZE {at_ms: pin} (Rule 36's own deterministic re-sim
// jump) to reach each pin instantly rather than waiting real wall-clock
// seconds, then releases the freeze so the choreography keeps advancing
// live before/through the drag — matching what a teacher watching the sim
// actually experiences.
//
// Run: npx tsx --env-file=.env.local src/scripts/_scratch_wpr6_round3_pin_drag_probe.ts
import '@/lib/loadEnvLocal';
import { readFileSync } from 'node:fs';
import { assembleParametricHtml } from '@/lib/renderers/parametric_renderer';
import { buildParametricConfig, type ParametricSourceJson } from './lib/buildParametricConfig';
import { launchBrowser } from '../lib/validators/visual/chromiumProvider';
import type { Page, Frame } from '@playwright/test';

const REAL_JSON_PATH =
  '/private/tmp/claude-501/-Users-karthikyerragadda-Desktop-Viditra-Physics-mind/611b52fb-e36c-4836-bc55-155a95a1d9b8/scratchpad/wpr6b/definite_integral_READONLY.json';

const COMPUTE_DIA_INJECT = [
  'var __compute_dia = function (vars) {',
  '  var b = (vars && typeof vars.b === "number" && isFinite(vars.b)) ? vars.b : 2.0;',
  '  var c = (vars && typeof vars.c === "number" && isFinite(vars.c)) ? vars.c : 0;',
  '  var beta = (vars && typeof vars.beta === "number" && isFinite(vars.beta)) ? vars.beta : 0;',
  '  var exact = Math.pow(b, 3) / 3 - c * b;',
  '  var aBeta = Math.pow(beta, 3) / 3 - c * beta;',
  '  var crossX = Math.min(b, Math.sqrt(c > 0 ? c : 0));',
  '  var areaBelowRaw = Math.pow(crossX, 3) / 3 - c * crossX;',
  '  var areaBelow = (Math.abs(areaBelowRaw) < 0.00005) ? 0 : areaBelowRaw;',
  '  var areaTotal = exact - 2 * areaBelow;',
  '  return {',
  '    concept_id: "definite_integral_as_accumulated_area",',
  '    variables: { b: b, c: c, beta: beta },',
  '    derived: { exact: exact, A_beta: aBeta, area_total: areaTotal, area_below: areaBelow },',
  '    forces: []',
  '  };',
  '};',
  'var __compute_orig = window.computePhysics;',
  'window.computePhysics = function (conceptId, vars) {',
  '  if (conceptId === "definite_integral_as_accumulated_area") return __compute_dia(vars);',
  '  return __compute_orig(conceptId, vars);',
  '};',
].join('\n');

async function dragBoundMarkerTo(page: Page, frame: Frame, simFrameLocatorCanvas: ReturnType<Page['frameLocator']>, targetB: number): Promise<void> {
  const markerPx = await frame.evaluate(() => {
    const w = window as unknown as {
      PM_config: { states: Record<string, { scene_composition: { id: string; type: string }[] }> };
      PM_currentState: string;
      PM_liveExprVars: () => Record<string, number>;
      PM_plotPointResolve: (spec: unknown, vars: unknown) => { x: number; y: number };
      PM_planeResolve: (spec: unknown, x: number, y: number) => { x: number; y: number } | null;
    };
    const scene = w.PM_config.states[w.PM_currentState].scene_composition;
    const spec = scene.find((p) => p.id === 'bound_marker');
    const vars = w.PM_liveExprVars();
    const resolved = spec ? w.PM_plotPointResolve(spec, vars) : null;
    return spec && resolved ? w.PM_planeResolve(spec, resolved.x, resolved.y) : null;
  });
  if (!markerPx) throw new Error('bound_marker not resolved for drag');

  const canvasBox = await simFrameLocatorCanvas.locator('canvas').first().boundingBox();
  if (!canvasBox) throw new Error('no canvas in iframe');

  // Data-space -> pixel-space, using the SAME plane geometry as the concept
  // (viewport x:70..730 over x_range -0.5..2.5, confirmed earlier).
  const dataToPx = (b: number) => {
    const viewport = { x: 70, w: 660 };
    const xRange = { min: -0.5, max: 2.5 };
    return viewport.x + (b - xRange.min) * (viewport.w / (xRange.max - xRange.min));
  };
  const startPage = { x: canvasBox.x + markerPx.x, y: canvasBox.y + markerPx.y };
  const targetPage = { x: canvasBox.x + dataToPx(targetB), y: startPage.y };

  await page.mouse.move(startPage.x, startPage.y);
  await page.waitForTimeout(80);
  await page.mouse.down();
  await page.waitForTimeout(80);
  const STEPS = 8;
  for (let i = 1; i <= STEPS; i++) {
    const t = i / STEPS;
    await page.mouse.move(startPage.x + (targetPage.x - startPage.x) * t, startPage.y);
    await page.waitForTimeout(50);
  }
  await page.mouse.up();
}

async function readState(frame: Frame): Promise<{ b: number; touched: boolean; simClockMs: number }> {
  return frame.evaluate(() => ({
    b: (window as unknown as { PM_liveExprVars: () => Record<string, number> }).PM_liveExprVars().b,
    touched: !!(window as unknown as { PM_userTouched: Record<string, boolean> }).PM_userTouched.b,
    simClockMs: (window as unknown as { PM_simTimeMs?: number }).PM_simTimeMs ?? -1,
  }));
}

async function main(): Promise<void> {
  const json = JSON.parse(readFileSync(REAL_JSON_PATH, 'utf8')) as ParametricSourceJson;
  const config = buildParametricConfig('definite_integral_as_accumulated_area', json, { synthesizeFocalSequenceFromScript: false });
  const simHtml = assembleParametricHtml(config);
  const hostHtml = `<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0} iframe{width:760px;height:500px;border:0;display:block}</style></head><body>
<iframe id="sim" srcdoc="${simHtml.replace(/"/g, '&quot;')}"></iframe>
<script>
  var iframe = document.getElementById('sim');
  function post(msg) { if (iframe.contentWindow) iframe.contentWindow.postMessage(msg, '*'); }
  window.__hostPost = post;
</script>
</body></html>`;

  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 760, height: 500 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.log('[pageerror]', String(e)));

  await page.setContent(hostHtml, { waitUntil: 'load' });
  await page.waitForTimeout(300);
  const frameMaybe = page.frames().find((f) => f !== page.mainFrame());
  if (!frameMaybe) throw new Error('iframe not found');
  const frame: Frame = frameMaybe;
  await frame.waitForFunction(() => typeof (window as unknown as { PM_simTimeMs?: number }).PM_simTimeMs === 'number', undefined, { timeout: 20000 });
  await page.waitForTimeout(200);
  await frame.evaluate(COMPUTE_DIA_INJECT);
  const simFrame = page.frameLocator('#sim');

  const post = (msg: Record<string, unknown>) => page.evaluate((m) => (window as unknown as { __hostPost: (m: unknown) => void }).__hostPost(m), msg);

  async function runPinDrag(label: string, pinMs: number): Promise<void> {
    console.log(`\n[probe] ==== ${label} (pin ${pinMs}) ====`);
    // Bounce through a DIFFERENT state first so re-entering STATE_5 is a
    // genuine isNewState transition (PM_userTouched wiped fresh) — makes
    // each pin an independent visit, matching the auditor's own two
    // separate captures, rather than a same-state continuation carrying
    // the PRIOR pin's touched flag forward.
    await post({ type: 'SET_STATE', state: 'STATE_1' });
    await page.waitForTimeout(300);
    await post({ type: 'SET_STATE', state: 'STATE_5' });
    await page.waitForTimeout(400);
    await post({ type: 'SET_TIME_FREEZE', at_ms: pinMs });
    await page.waitForTimeout(400);
    await post({ type: 'SET_TIME_FREEZE', frozen: false }); // resume live from the pin
    await page.waitForTimeout(150);
    const before = await readState(frame);
    console.log(`[probe]   before drag: b=${before.b.toFixed(4)} touched=${before.touched} simClockMs=${before.simClockMs}`);

    await dragBoundMarkerTo(page, frame, simFrame, 1.2);
    const duringDrag = await readState(frame);
    console.log(`[probe]   during-drag b=${duringDrag.b.toFixed(4)} touched=${duringDrag.touched}`);

    // mouseup already happened inside dragBoundMarkerTo (page.mouse.up()).
    const afterMouseup = await readState(frame);
    console.log(`[probe]   after-mouseup b=${afterMouseup.b.toFixed(4)} touched=${afterMouseup.touched}`);

    await page.waitForTimeout(900);
    const plus09s = await readState(frame);
    console.log(`[probe]   +0.9s b=${plus09s.b.toFixed(4)} touched=${plus09s.touched}`);

    const pass = Math.abs(plus09s.b - 1.2) < 0.02 && plus09s.touched === true;
    console.log(`[probe]   RESULT: ${pass ? 'PASS — drag holds' : 'FAIL — drag evaporated'}`);
  }

  await runPinDrag('S5 drag DURING the c-ramp', 6000);
  await runPinDrag('S5 drag AFTER the c-ramp', 16000);

  console.log('\n[probe] ==== S8 explore control ====');
  await post({ type: 'SET_STATE', state: 'STATE_8' });
  await page.waitForTimeout(400);
  await dragBoundMarkerTo(page, frame, simFrame, 1.2);
  await page.waitForTimeout(900);
  const exploreState = await readState(frame);
  console.log(`[probe]   +0.9s b=${exploreState.b.toFixed(4)} touched=${exploreState.touched}`);
  console.log(`[probe]   RESULT: ${Math.abs(exploreState.b - 1.2) < 0.02 && exploreState.touched ? 'PASS — drag holds' : 'FAIL'}`);

  await browser.close();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
