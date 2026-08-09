// _verify_label_position_expr_probe.ts — throwaway functional probe for
// pcpl_drawlabel_has_no_position_expr_so_object_anchored_text_cannot_track
// (peter_parker:renderer_primitives).
//
// Assembles a minimal synthetic ParametricConfig with three `label`
// primitives sharing one driving variable (label_x) and drives PARAM_UPDATE
// to change it, asserting the RENDERED PIXEL CENTER of each label's text ink
// moves (or deliberately does not move) exactly as the fix's contract
// promises:
//
//   1. "TRACK" — position_expr on both x/y, no _solverPosition. Must move by
//      the same delta the driving variable moves.
//   2. "STAY"  — a syntactically malformed position_expr.x alongside a valid
//      authored spec.position. Must stay put (non-finite eval falls back to
//      the authored literal, exactly like drawBody's size_expr fallback).
//   3. "WIN"   — carries BOTH a hand-set _solverPosition AND a valid
//      position_expr. Must render at the position_expr's y (proving the
//      documented precedence: position_expr beats _solverPosition), never at
//      _solverPosition.y nor at the authored spec.position.y fallback.
//
// Standalone -- does not touch simulation_cache, does not register a real
// concept, does not import anything outside chromiumProvider + the renderer.
// Safe to delete after use.
//
// Run: npx tsx src/scripts/_verify_label_position_expr_probe.ts

import { assembleParametricHtml, type ParametricConfig } from '../lib/renderers/parametric_renderer';
import { launchBrowser } from '../lib/validators/visual/chromiumProvider';

const TRACK_RGB = [34, 197, 94] as const; // #22C55E
const STAY_RGB = [245, 158, 11] as const; // #F59E0B
const WIN_RGB = [236, 72, 153] as const; // #EC4899

// TRACK — no solver position, authored fallback + a live position_expr.
const TRACK_FALLBACK = { x: 300, y: 250 };

// STAY — malformed position_expr.x; authored fallback must survive untouched.
const STAY_FALLBACK = { x: 500, y: 250 };

// WIN — carries a hand-set _solverPosition (standing in for whatever the
// Phase-2 solver would have stamped) AND a different authored fallback AND a
// valid position_expr. All three disagree on purpose so the test can tell
// which one actually painted the pixels.
const WIN_SOLVER_POS = { x: 650, y: 300 };
const WIN_FALLBACK = { x: 650, y: 400 };
const WIN_EXPECTED_X = 650; // position_expr.x is the literal "650"

function buildConfig(): ParametricConfig {
  return {
    // A registered inline-dispatcher id (see computePhysics_scalar_vs_vector)
    // so PM_physics is never null -- the WP-F2 echo net carries our custom
    // `label_x` variable through into PM_physics.variables even though the
    // concept-specific function never named it, which is exactly the
    // merged-scope path PM_liveExprVars()/position_expr read.
    concept_id: 'scalar_vs_vector',
    scene_composition: [],
    default_variables: { label_x: 0 },
    states: {
      STATE_1: {
        scene_composition: [
          {
            type: 'slider',
            id: 'label_x_slider',
            variable: 'label_x',
            min: 0,
            max: 200,
            step: 1,
            default: 0,
            label: 'label x',
            unit: '',
            position: 'bottom',
          },
          {
            type: 'label',
            id: 'probe_track_label',
            text: 'TRACK',
            font_size: 24,
            color: '#22C55E',
            position: TRACK_FALLBACK,
            position_expr: { x: '300 + label_x', y: '250' },
          },
          {
            type: 'label',
            id: 'probe_stay_label',
            text: 'STAY',
            font_size: 24,
            color: '#F59E0B',
            position: STAY_FALLBACK,
            // Malformed on purpose -- PM_safeEval must throw internally and
            // return NaN, and isFinite() must reject the pair so pos falls
            // back to the authored literal STAY_FALLBACK.
            position_expr: { x: 'label_x +', y: '250' },
          },
          {
            type: 'label',
            id: 'probe_win_label',
            text: 'WIN',
            font_size: 24,
            color: '#EC4899',
            // Hand-set _solverPosition -- normally stamped server-side by
            // solveSubSimLayout() when SUB_SIM_SOLVER_ENABLED is on; set
            // directly here since that flag is off by default and this test
            // only needs a *disagreeing* solver slot to prove precedence.
            _solverPosition: WIN_SOLVER_POS,
            position: WIN_FALLBACK,
            position_expr: { x: '650', y: '160 + label_x' },
          },
        ],
      },
    },
  } as unknown as ParametricConfig;
}

interface ColorCenter {
  cx: number;
  cy: number;
}

async function main(): Promise<void> {
  const config = buildConfig();
  const html = assembleParametricHtml(config);

  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 760, height: 500 }, deviceScaleFactor: 1 });
  const consoleErrors: string[] = [];
  page.on('pageerror', (e) => consoleErrors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });

  await page.setContent(html, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof (window as unknown as { PM_simTimeMs?: number }).PM_simTimeMs === 'number', undefined, {
    timeout: 20000,
  });
  await page.waitForTimeout(400); // let a few draw() frames run

  const centerForColor = async (rgb: readonly [number, number, number]): Promise<ColorCenter | null> =>
    page.evaluate(([r, g, b]) => {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return null;
      const { width: w, height: h } = canvas;
      const data = ctx.getImageData(0, 0, w, h).data;
      let minX = w;
      let minY = h;
      let maxX = -1;
      let maxY = -1;
      const tol = 20; // text anti-aliases against the dark background
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const a = data[idx + 3];
          if (a < 40) continue;
          if (Math.abs(data[idx] - r) <= tol && Math.abs(data[idx + 1] - g) <= tol && Math.abs(data[idx + 2] - b) <= tol) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX < minX) return null;
      return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
    }, rgb as unknown as [number, number, number]);

  // --- Baseline (label_x = 0 -- the authored default) ---
  const trackBefore = await centerForColor(TRACK_RGB);
  const stayBefore = await centerForColor(STAY_RGB);
  const winBefore = await centerForColor(WIN_RGB);

  // --- Drive PARAM_UPDATE: label_x 0 -> 150 ---
  await page.evaluate(() => {
    window.postMessage({ type: 'PARAM_UPDATE', key: 'label_x', value: 150 }, '*');
  });
  await page.waitForTimeout(400);

  const trackAfter = await centerForColor(TRACK_RGB);
  const stayAfter = await centerForColor(STAY_RGB);
  const winAfter = await centerForColor(WIN_RGB);
  const livePhysicsLabelX = await page.evaluate(
    () => (window as unknown as { PM_physics?: { variables?: Record<string, number> } }).PM_physics?.variables?.label_x ?? null,
  );

  await browser.close();

  console.log('=== label position_expr functional probe ===');
  console.log('console/page errors captured:', consoleErrors.length ? consoleErrors : '(none)');
  console.log('');
  console.log('TRACK center before (label_x=0,   expect ~300,250):', trackBefore);
  console.log('TRACK center after  (label_x=150, expect ~450,250):', trackAfter);
  console.log('');
  console.log('STAY  center before (fallback,     expect ~500,250):', stayBefore);
  console.log('STAY  center after  (must be UNCHANGED):', stayAfter);
  console.log('');
  console.log('WIN   center before (label_x=0,   expect ~650,160 -- NOT solver 650,300, NOT fallback 650,400):', winBefore);
  console.log('WIN   center after  (label_x=150, expect ~650,310):', winAfter);
  console.log('');
  console.log('live PM_physics.variables.label_x after PARAM_UPDATE:', livePhysicsLabelX, '(expect 150)');

  const TOL = 10;
  const closeTo = (v: number | undefined, target: number, tol = TOL) => v != null && Math.abs(v - target) <= tol;

  const trackOk =
    !!trackBefore &&
    !!trackAfter &&
    closeTo(trackBefore.cx, TRACK_FALLBACK.x) &&
    closeTo(trackBefore.cy, TRACK_FALLBACK.y) &&
    closeTo(trackAfter.cx, TRACK_FALLBACK.x + 150) &&
    closeTo(trackAfter.cy, TRACK_FALLBACK.y);

  const stayOk =
    !!stayBefore &&
    !!stayAfter &&
    closeTo(stayBefore.cx, STAY_FALLBACK.x) &&
    closeTo(stayBefore.cy, STAY_FALLBACK.y) &&
    closeTo(stayAfter.cx, STAY_FALLBACK.x) &&
    closeTo(stayAfter.cy, STAY_FALLBACK.y);

  const winOk =
    !!winBefore &&
    !!winAfter &&
    closeTo(winBefore.cx, WIN_EXPECTED_X) &&
    closeTo(winBefore.cy, 160) &&
    !closeTo(winBefore.cy, WIN_SOLVER_POS.y) &&
    !closeTo(winBefore.cy, WIN_FALLBACK.y) &&
    closeTo(winAfter.cx, WIN_EXPECTED_X) &&
    closeTo(winAfter.cy, 310);

  const pass = trackOk && stayOk && winOk;

  console.log('');
  console.log('trackOk:', trackOk, ' stayOk:', stayOk, ' winOk:', winOk);
  console.log(
    pass
      ? 'PASS — label position_expr drives live pixels; malformed expr falls back cleanly; position_expr beats _solverPosition.'
      : 'FAIL — see measurements above.',
  );
  process.exit(pass ? 0 : 1);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
