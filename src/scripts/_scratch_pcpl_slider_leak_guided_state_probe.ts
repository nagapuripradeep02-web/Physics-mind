// _scratch_pcpl_slider_leak_guided_state_probe.ts — throwaway end-to-end
// probe for bug_class
// pcpl_teacher_set_live_control_value_leaks_from_explore_state_into_guided_
// state_on_state_change (founder_proxy Checkpoint B cycle 1, 2026-08-08).
//
// Drives a REAL mouse drag (page.mouse.move/down/move/up — actual DOM
// mousedown/mousemove events, not a PARAM_UPDATE postMessage shortcut) on a
// plot_point marker in a synthetic explore state (advance_mode:
// 'interaction_complete'), then SET_STATEs to a synthetic GUIDED state
// (advance_mode:'manual_click') that declares the SAME variable as a live
// control, and asserts the guided state opens on its own authored default —
// never the value the teacher just dragged elsewhere.
//
// Uses a SYNTHETIC ParametricConfig (concept_id:'unit_circle_to_sine_wave',
// which the renderer's client-side computePhysics dispatcher already
// recognises — echoing an unrecognised var like 'b' through unchanged via
// the WP-F2 safety net) rather than the real
// definite_integral_as_accumulated_area concept: that concept JSON is being
// authored on a PARALLEL desk right now and is deliberately untouched here
// (per this desk's own brief) — it does not exist in this desk's checkout
// and has no computePhysics_<id> registration yet regardless.
//
// Run: npx tsx --env-file=.env.local src/scripts/_scratch_pcpl_slider_leak_guided_state_probe.ts
import '@/lib/loadEnvLocal';
import { assembleParametricHtml, type ParametricConfig, type ParametricStateConfig } from '@/lib/renderers/parametric_renderer';
import { launchBrowser } from '../lib/validators/visual/chromiumProvider';

// ── The synthetic plane + drag geometry (hand-computed against
// PM_planeBuildTransform's OWN toPx formula, verified against the renderer
// source at src/lib/renderers/parametric_renderer.ts:2291-2299) ───────────
const VIEWPORT = { x: 70, y: 78, w: 660, h: 372 };
const X_RANGE = { min: 0, max: 2 };
const Y_RANGE = { min: -1, max: 1 };
const SCALE_X = VIEWPORT.w / (X_RANGE.max - X_RANGE.min); // 330
const SCALE_Y = VIEWPORT.h / (Y_RANGE.max - Y_RANGE.min); // 186
function toPx(dataX: number, dataY: number): { x: number; y: number } {
  return {
    x: VIEWPORT.x + (dataX - X_RANGE.min) * SCALE_X,
    y: VIEWPORT.y + (Y_RANGE.max - dataY) * SCALE_Y,
  };
}

const BOUND_MARKER_SCENE = (dragMin: number, dragMax: number) => [
  { id: 'plane', type: 'cartesian_plane', viewport: VIEWPORT, x_range: X_RANGE, y_range: Y_RANGE },
  {
    id: 'bound_marker', type: 'plot_point', plane_id: 'plane',
    x_expr: 'b', y_expr: '0', color: '#FBBF24', size: 12,
    drag: { bind_variable: 'b', axis: 'x', min: dragMin, max: dragMax },
  },
  { id: 'b_label', type: 'label', text_expr: 'b = {b.toFixed(3)}', position: { x: 400, y: 460 } },
];

const CONFIG: ParametricConfig = {
  concept_id: 'unit_circle_to_sine_wave',
  scene_composition: BOUND_MARKER_SCENE(0, 2),
  default_variables: { theta: 0, phi: 0, phi_r: 0, b: 2 },
  current_state: 'STATE_5',
  states: {
    // GUIDED — its own contract: opens on b=2 (the authored default),
    // no matter what a teacher last set anywhere else.
    STATE_5: {
      title: 'STATE_5 (guided)', advance_mode: 'manual_click',
      focal_primitive_id: 'bound_marker',
      scene_composition: BOUND_MARKER_SCENE(0, 2),
    } as ParametricStateConfig,
    // EXPLORE (the teacher sandbox) — the ONE state allowed to inherit a
    // previously-dragged PM_sliderValues value, on entry AND re-entry.
    STATE_8: {
      title: 'STATE_8 (explore)', advance_mode: 'interaction_complete',
      focal_primitive_id: 'bound_marker',
      scene_composition: BOUND_MARKER_SCENE(0, 2),
    } as ParametricStateConfig,
  },
};

async function main(): Promise<void> {
  const simHtml = assembleParametricHtml(CONFIG);

  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 760, height: 500 }, deviceScaleFactor: 1 });
  const consoleErrors: string[] = [];
  page.on('pageerror', (e) => consoleErrors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });

  await page.setContent(simHtml, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof (window as unknown as { PM_simTimeMs?: number }).PM_simTimeMs === 'number', undefined, { timeout: 20000 });
  await page.waitForTimeout(300);

  // ── Step 1: enter STATE_8 (explore), fresh — b resolves to its authored
  // default (2) via PM_resolveStateVars, since PM_sliderValues is empty.
  await page.evaluate(() => window.postMessage({ type: 'SET_STATE', state: 'STATE_8' }, '*'));
  await page.waitForTimeout(400);

  const bAtExploreEntry = await page.evaluate(() => (window as unknown as { PM_liveExprVars: () => Record<string, number> }).PM_liveExprVars().b);
  console.log('[probe] STATE_8 fresh entry, b =', bAtExploreEntry, '(expect 2, authored default)');

  // ── Step 2: a REAL mouse drag on the bound_marker — actual DOM
  // mousedown/mousemove/mouseup dispatched by Playwright, exercising
  // drawPlotPoint's genuine-drag branch exactly as a teacher's cursor would.
  const canvasBox = await page.locator('canvas').first().boundingBox();
  if (!canvasBox) throw new Error('canvas not found');
  const startPx = toPx(2, 0); // marker's current position, b=2
  const targetDataB = 0.3;
  const targetPx = toPx(targetDataB, 0);

  const toPage = (p: { x: number; y: number }) => ({ x: canvasBox.x + p.x, y: canvasBox.y + p.y });
  const startPage = toPage(startPx);
  const targetPage = toPage(targetPx);

  // NOTE — a waitForTimeout is REQUIRED between move and down (and between
  // every subsequent move) for p5's own mousedown handler to have already
  // observed the just-dispatched mousemove's mouseX/mouseY before it reads
  // them to decide the drag-claim hit-test; without it the claim's hit-test
  // race-loses against p5's own event/draw-loop timing and the drag never
  // claims at all (measured empirically driving this exact probe).
  await page.mouse.move(startPage.x, startPage.y);
  await page.waitForTimeout(60);
  await page.mouse.down();
  await page.waitForTimeout(60);
  // Multiple intermediate steps — a real drag gesture, not a single teleport.
  const STEPS = 8;
  for (let i = 1; i <= STEPS; i++) {
    const t = i / STEPS;
    await page.mouse.move(
      startPage.x + (targetPage.x - startPage.x) * t,
      startPage.y + (targetPage.y - startPage.y) * t,
    );
    await page.waitForTimeout(60);
  }
  await page.mouse.up();
  await page.waitForTimeout(300);

  const bAfterRealDrag = await page.evaluate(() => (window as unknown as { PM_sliderValues: Record<string, number> }).PM_sliderValues.b);
  console.log('[probe] after REAL mouse drag toward b=' + targetDataB + ', PM_sliderValues.b =', bAfterRealDrag);
  const dragWorked = typeof bAfterRealDrag === 'number' && Math.abs(bAfterRealDrag - targetDataB) < 0.05;
  console.log(dragWorked ? '[probe] PASS: the real drag actually moved PM_sliderValues.b' : '[probe] FAIL: the real drag did not move PM_sliderValues.b — probe is invalid, fix the drag geometry');

  // ── Step 3: jump to STATE_5 (GUIDED, manual_click) via the state rail —
  // exactly Rule 25d's reorderable/jumpable navigation, exactly the
  // reported repro's own click.
  await page.evaluate(() => window.postMessage({ type: 'SET_STATE', state: 'STATE_5' }, '*'));
  await page.waitForTimeout(400);

  const bOnGuidedEntry = await page.evaluate(() => (window as unknown as { PM_liveExprVars: () => Record<string, number> }).PM_liveExprVars().b);
  console.log('[probe] STATE_5 (guided) entered from STATE_8 after a real drag, PM_liveExprVars().b =', bOnGuidedEntry, '(want 2 — the fix; pre-fix measured ~0.28-0.3, the leaked explore value)');

  // ── Step 4 (negative control / requirement 2): jump BACK to STATE_8 —
  // the explore state must STILL inherit the teacher-set value, on
  // re-entry, unchanged by this fix.
  await page.evaluate(() => window.postMessage({ type: 'SET_STATE', state: 'STATE_8' }, '*'));
  await page.waitForTimeout(400);
  const bOnExploreReentry = await page.evaluate(() => (window as unknown as { PM_liveExprVars: () => Record<string, number> }).PM_liveExprVars().b);
  console.log('[probe] STATE_8 (explore) RE-entered, PM_liveExprVars().b =', bOnExploreReentry, '(want ~' + targetDataB + ' — explore state still inherits on re-entry, requirement 2)');

  await browser.close();

  console.log('\n=== RESULT ===');
  const pass1 = dragWorked;
  const pass2 = typeof bOnGuidedEntry === 'number' && Math.abs(bOnGuidedEntry - 2) < 1e-9;
  const pass3 = typeof bOnExploreReentry === 'number' && Math.abs(bOnExploreReentry - targetDataB) < 0.05;
  console.log('1. real drag moved PM_sliderValues.b:                 ', pass1 ? 'PASS' : 'FAIL');
  console.log('2. GUIDED state STATE_5 opened on its OWN default b=2 (no leak):', pass2 ? 'PASS' : 'FAIL', '(got ' + bOnGuidedEntry + ')');
  console.log('3. EXPLORE state STATE_8 still inherits on re-entry:  ', pass3 ? 'PASS' : 'FAIL', '(got ' + bOnExploreReentry + ')');
  console.log('console/page errors captured:', consoleErrors.length ? consoleErrors : '(none)');

  if (!pass1 || !pass2 || !pass3) process.exit(1);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
