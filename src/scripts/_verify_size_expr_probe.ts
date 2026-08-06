// _verify_size_expr_probe.ts — throwaway functional probe for
// pcpl_no_primitive_draws_a_circle_or_arc_at_a_live_radius (peter_parker:renderer_primitives).
//
// Assembles a minimal synthetic ParametricConfig with a circle `body` bound
// via size_expr and an `angle_arc` bound via radius_expr, drives PARAM_UPDATE
// to change the backing variable, and asserts the RENDERED PIXEL EXTENT of
// each primitive changes with it -- proving the fix all the way to pixels,
// not just internal bookkeeping. Also proves the opt-in fallback: a body
// with a syntactically malformed size_expr keeps its literal spec.size
// unchanged.
//
// Standalone -- does not touch simulation_cache, does not register a real
// concept, does not import anything outside chromiumProvider + the renderer.
// Safe to delete after use.
//
// Run: npx tsx src/scripts/_verify_size_expr_probe.ts

import { assembleParametricHtml, type ParametricConfig } from '../lib/renderers/parametric_renderer';
import { launchBrowser } from '../lib/validators/visual/chromiumProvider';

const CIRCLE_RGB = [34, 197, 94] as const; // #22C55E
const ARC_RGB = [245, 158, 11] as const; // #F59E0B
const FALLBACK_RGB = [96, 165, 250] as const; // #60A5FA -- malformed-expr control circle

const CIRCLE_POS = { x: 220, y: 250 };
const ARC_CENTER = { x: 460, y: 250 };
const FALLBACK_POS = { x: 640, y: 250 };
const FALLBACK_LITERAL_SIZE = 55;

function buildConfig(): ParametricConfig {
  return {
    // A registered inline-dispatcher id (see computePhysics_scalar_vs_vector,
    // ~L410) so PM_physics is never null -- the WP-F2 echo net then carries
    // our custom `probe_r` variable through into PM_physics.variables even
    // though the concept-specific function never named it, which is exactly
    // the merged-scope path PM_liveExprVars()/size_expr/radius_expr read.
    concept_id: 'scalar_vs_vector',
    scene_composition: [],
    default_variables: { probe_r: 40 },
    states: {
      STATE_1: {
        scene_composition: [
          {
            type: 'slider',
            id: 'probe_r_slider',
            variable: 'probe_r',
            min: 10,
            max: 100,
            step: 1,
            default: 40,
            label: 'probe r',
            unit: '',
            position: 'bottom',
          },
          {
            type: 'body',
            id: 'probe_circle',
            shape: 'circle',
            size: 40,
            size_expr: 'probe_r',
            position: CIRCLE_POS,
            fill_color: '#22C55E',
          },
          {
            type: 'angle_arc',
            id: 'probe_arc',
            center: ARC_CENTER,
            radius: 40,
            radius_expr: 'probe_r * 1.5',
            from_deg: 0,
            to_deg: 90,
            color: '#F59E0B',
          },
          {
            type: 'body',
            id: 'probe_fallback_circle',
            shape: 'circle',
            size: FALLBACK_LITERAL_SIZE,
            size_expr: 'probe_r +', // syntactically malformed -- PM_safeEval must catch + return NaN
            position: FALLBACK_POS,
            fill_color: '#60A5FA',
          },
        ],
      },
    },
  };
}

interface ColorBBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
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

  const bboxForColor = async (rgb: readonly [number, number, number]): Promise<ColorBBox | null> =>
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
      const tol = 12;
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
      return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
    }, rgb as unknown as [number, number, number]);

  const maxRadiusForColor = async (cx: number, cy: number, rgb: readonly [number, number, number]): Promise<number | null> =>
    page.evaluate(
      ([cxp, cyp, r, g, b]) => {
        const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return null;
        const { width: w, height: h } = canvas;
        const data = ctx.getImageData(0, 0, w, h).data;
        let maxDist = -1;
        // Arc strokes render at alpha 220/255 (drawAngleArc's base stroke alpha)
        // over a (15,15,26) background, so the composited pixel is a ~86/14
        // blend toward the background — wider tolerance than the fully-opaque
        // body fill scan above needs. Scoped to a local window around the
        // arc's own known center (well clear of the bottom slider row, whose
        // amber knob fill antialiases into this same tolerance band) so a
        // stray far-away match can't be mistaken for the arc's own radius.
        const tol = 50;
        const win = 160;
        const yMin = Math.max(0, Math.floor(cyp - win));
        const yMax = Math.min(h - 1, Math.ceil(cyp + win));
        const xMin = Math.max(0, Math.floor(cxp - win));
        const xMax = Math.min(w - 1, Math.ceil(cxp + win));
        for (let y = yMin; y <= yMax; y++) {
          for (let x = xMin; x <= xMax; x++) {
            const idx = (y * w + x) * 4;
            const a = data[idx + 3];
            if (a < 40) continue;
            if (Math.abs(data[idx] - r) <= tol && Math.abs(data[idx + 1] - g) <= tol && Math.abs(data[idx + 2] - b) <= tol) {
              const dist = Math.hypot(x - cxp, y - cyp);
              if (dist > maxDist) maxDist = dist;
            }
          }
        }
        return maxDist >= 0 ? maxDist : null;
      },
      [cx, cy, ...rgb] as unknown as [number, number, number, number, number],
    );

  // --- Baseline (probe_r = 40 -- the authored default) ---
  const circleBefore = await bboxForColor(CIRCLE_RGB);
  const arcRadiusBefore = await maxRadiusForColor(ARC_CENTER.x, ARC_CENTER.y, ARC_RGB);
  const fallbackBefore = await bboxForColor(FALLBACK_RGB);
  const bodyRegistryBefore = await page.evaluate(
    () => (window as unknown as { PM_bodyRegistry?: Record<string, { w: number; h: number }> }).PM_bodyRegistry?.probe_circle ?? null,
  );

  // --- Drive PARAM_UPDATE: probe_r 40 -> 90 ---
  await page.evaluate(() => {
    window.postMessage({ type: 'PARAM_UPDATE', key: 'probe_r', value: 90 }, '*');
  });
  await page.waitForTimeout(400);

  const circleAfter = await bboxForColor(CIRCLE_RGB);
  const arcRadiusAfter = await maxRadiusForColor(ARC_CENTER.x, ARC_CENTER.y, ARC_RGB);
  const fallbackAfter = await bboxForColor(FALLBACK_RGB);
  const bodyRegistryAfter = await page.evaluate(
    () => (window as unknown as { PM_bodyRegistry?: Record<string, { w: number; h: number }> }).PM_bodyRegistry?.probe_circle ?? null,
  );
  const livePhysicsProbeR = await page.evaluate(
    () => (window as unknown as { PM_physics?: { variables?: Record<string, number> } }).PM_physics?.variables?.probe_r ?? null,
  );

  await browser.close();

  console.log('=== size_expr / radius_expr functional probe ===');
  console.log('console/page errors captured:', consoleErrors.length ? consoleErrors : '(none)');
  console.log('');
  console.log('circle diameter  before (probe_r=40):', circleBefore?.width, 'x', circleBefore?.height);
  console.log('circle diameter  after  (probe_r=90):', circleAfter?.width, 'x', circleAfter?.height);
  console.log('bodyRegistry.probe_circle.w  before -> after:', bodyRegistryBefore?.w, '->', bodyRegistryAfter?.w);
  console.log('');
  console.log('arc radius       before (probe_r=40, expect ~60):', arcRadiusBefore);
  console.log('arc radius       after  (probe_r=90, expect ~135):', arcRadiusAfter);
  console.log('');
  console.log('fallback (malformed expr) circle diameter before:', fallbackBefore?.width, 'x', fallbackBefore?.height);
  console.log('fallback (malformed expr) circle diameter after: ', fallbackAfter?.width, 'x', fallbackAfter?.height);
  console.log('(expect UNCHANGED, both ~', FALLBACK_LITERAL_SIZE, ')');
  console.log('');
  console.log('live PM_physics.variables.probe_r after PARAM_UPDATE:', livePhysicsProbeR, '(expect 90)');

  const pass =
    !!circleBefore &&
    !!circleAfter &&
    Math.abs(circleBefore.width - 40) <= 6 &&
    Math.abs(circleAfter.width - 90) <= 8 &&
    circleAfter.width > circleBefore.width + 20 &&
    !!arcRadiusBefore &&
    !!arcRadiusAfter &&
    arcRadiusAfter > arcRadiusBefore + 30 &&
    !!fallbackBefore &&
    !!fallbackAfter &&
    Math.abs(fallbackBefore.width - fallbackAfter.width) <= 3;

  console.log('');
  console.log(
    pass
      ? 'PASS — size_expr and radius_expr both drive live pixels; malformed expr falls back cleanly.'
      : 'FAIL — see measurements above.',
  );
  process.exit(pass ? 0 : 1);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
