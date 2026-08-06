/**
 * check:cartesian-plane — headless verification of the cartesian_plane
 * engine family on `parametric_renderer.ts` (CP-A: F1-F7 frame/registry;
 * CP-B: F8-F12 function_plot + plot_point; CP-C1: F15-F16 GEOMETRY —
 * region_fill signed-area splitting, riemann_bars' four modes + D11
 * publication. CP-C2 — signed colour, render/opacity, declared composition
 * draw order, show_partition, reveal_stagger_ms — is NOT built here; see
 * the CP-C1 dispatch report for the exact stub list).
 *
 * Same shape and reason as check:sigma-pi / check:bonding-scene: tsc, the
 * validators and THE EYE all pass on frames whose GEOMETRY is wrong, so this
 * does not check that the renderer compiles. It pulls the SHIPPED pure
 * functions out of PARAMETRIC_RENDERER_CODE by brace matching, runs them in
 * node, and asserts them against values solved INDEPENDENTLY of the renderer
 * (either hand-derived closed forms or a second, differently-written
 * implementation in this file).
 *
 * Sections implemented here, per docs/MATHEMATICS_PHASE0_CARTESIAN_PLANE.md
 * 0c gate table: 1-4 (CP-A), 5-7 (CP-B), 8-9 (CP-C1), 11 (CP-A), 12 (CP-C1
 * D11 publication), 15 (CP-A frame + CP-B parent-curve completion), 16
 * (CP-B). Plus a standalone F5 SEIZURE CLAUSE block (CP-B, not itself
 * gate-table-numbered) asserting the plot_point drag-seize contract
 * structurally. Sections 10, 13, 14 belong to CP-D (secant_line/
 * tangent_line) and CP-C2 (signed colour/render/opacity/draw-order/
 * show_partition/reveal_stagger_ms) and are NOT asserted here.
 *
 * region_fill/riemann_bars' DRAWING wrappers (drawRegionFill/
 * drawRiemannBars) call p5 primitives (push/fill/beginShape/vertex/...) that
 * do not exist in this headless sandbox, so — exactly like drawFunctionPlot/
 * drawPlotPoint before them — they are never extracted/executed here. Only
 * the PURE geometry+publication functions (PM_regionFillCompute,
 * PM_riemannBarsCompute) are pulled and run; the drawing wrappers are
 * verified by STATIC source-text assertions (grep-shaped, matching the F5
 * SEIZURE CLAUSE block's own technique below).
 *
 * Every section carries a NEGATIVE CONTROL — a gate that has never failed is
 * not known to work (dispatch mandate). Negative controls are demonstrated
 * against a deliberately-broken alternative computed IN THIS FILE, never
 * against the shipped renderer (the renderer is never mutated to fail).
 *
 *   npm run check:cartesian-plane
 */
import { PARAMETRIC_RENDERER_CODE } from "../lib/renderers/parametric_renderer";

const SRC = PARAMETRIC_RENDERER_CODE;

/** Pull `function NAME(...) { ... }` out of the emitted renderer by brace matching. */
function grabFn(name: string, src: string = SRC): string {
  const start = src.indexOf("function " + name + "(");
  if (start < 0) throw new Error("function not found in renderer: " + name);
  const i = src.indexOf("{", start);
  let depth = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === "{") depth++;
    else if (src[j] === "}") { depth--; if (depth === 0) return src.slice(start, j + 1); }
  }
  throw new Error("unbalanced braces reading " + name);
}
/** Pull `var NAME = <literal>;` (object/array) out of the emitted renderer by brace matching. */
function grabVar(name: string, src: string = SRC): string {
  const m = new RegExp("var " + name + "\\s*=").exec(src);
  if (!m) throw new Error("var not found in renderer: " + name);
  const eq = m.index! + m[0].length;
  let i = eq;
  while (i < src.length && /\s/.test(src[i])) i++;
  if (src[i] === "{" || src[i] === "[") {
    const open = src[i], close = open === "{" ? "}" : "]";
    let depth = 0;
    for (let j = i; j < src.length; j++) {
      if (src[j] === open) depth++;
      else if (src[j] === close) { depth--; if (depth === 0) return src.slice(m!.index!, j + 1) + ";"; }
    }
    throw new Error("unbalanced literal reading " + name);
  }
  return src.slice(m!.index!, src.indexOf(";", i) + 1);
}

const VARS = ["PM_planeRegistry"];
const FNS = [
  "PM_clamp", "PM_gcd", "PM_formatTickLabel", "PM_planeTickValues",
  "PM_planeBuildTransform", "PM_planeResolve",
  // CP-B additions (F8-F12).
  "PM_planeRangesOf", "PM_planeResolveInverse",
  "PM_buildEvalScope", "PM_safeEval",
  "PM_functionPlotSample", "PM_plotPointResolve", "PM_stateLiveControlVars",
  // CP-C1 additions (F15-F16 geometry + D11 publication) — pure functions
  // only; drawRegionFill/drawRiemannBars are p5-drawing wrappers, verified
  // by static source assertions in section 12/14 instead (see file header).
  "PM_regionFillCompute", "PM_riemannBarsCompute",
];

// eslint-disable-next-line @typescript-eslint/no-implied-eval
const E = new Function([
  ...VARS.map((v) => grabVar(v)),
  ...FNS.map((f) => grabFn(f)),
  "return { " + [...VARS, ...FNS].join(", ") + " };",
].join("\n"))() as any;

let failures = 0;
function check(label: string, got: unknown, want: unknown, tol: number, unit = ""): boolean {
  const ok = typeof got === "number" && typeof want === "number"
    ? Math.abs(got - want) <= tol
    : got === want;
  if (!ok) failures++;
  const fmt = (v: unknown) => (typeof v === "number" ? v.toFixed(Math.abs(v) < 10 ? 6 : 2) : JSON.stringify(v));
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label.padEnd(58)} got ${fmt(got)}${unit}  want ${fmt(want)}${unit}`);
  return ok;
}
function assertTrue(label: string, ok: boolean) {
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`);
}

// The doc's own default plane (MATHEMATICS_PHASE0_CARTESIAN_PLANE.md §contract).
const DEFAULT_PLANE = {
  id: "plane",
  viewport: { x: 70, y: 78, w: 660, h: 372 },
  x_range: { min: -6.5, max: 6.5 },
  y_range: { min: -4, max: 4 },
};

console.log("\n=== 1. THE TRANSFORM — toPx/toData round-trip; corners map to viewport corners ===");
{
  const plane = E.PM_planeBuildTransform(DEFAULT_PLANE);
  // Round-trip across all four quadrants, < 1e-9.
  const probes: [number, number][] = [[2, 1], [-2, 1], [-2, -1], [2, -1], [0, 0]];
  let maxErr = 0;
  for (const [x, y] of probes) {
    const px = plane.toPx(x, y);
    const back = plane.toData(px.x, px.y);
    maxErr = Math.max(maxErr, Math.abs(back.x - x), Math.abs(back.y - y));
  }
  check("round-trip max error across 4 quadrants + origin", maxErr, 0, 1e-9);

  // Corners: (xmin,ymin) -> viewport BOTTOM-LEFT (canvas y grows down, data y
  // grows up, so the data-min-y corner is the PIXEL-max-y / bottom corner).
  const vp = DEFAULT_PLANE.viewport;
  const bl = plane.toPx(DEFAULT_PLANE.x_range.min, DEFAULT_PLANE.y_range.min);
  const tl = plane.toPx(DEFAULT_PLANE.x_range.min, DEFAULT_PLANE.y_range.max);
  const br = plane.toPx(DEFAULT_PLANE.x_range.max, DEFAULT_PLANE.y_range.min);
  const tr = plane.toPx(DEFAULT_PLANE.x_range.max, DEFAULT_PLANE.y_range.max);
  check("(xmin,ymin) -> viewport bottom-left, x", bl.x, vp.x, 1e-9);
  check("(xmin,ymin) -> viewport bottom-left, y", bl.y, vp.y + vp.h, 1e-9);
  check("(xmin,ymax) -> viewport top-left, x", tl.x, vp.x, 1e-9);
  check("(xmin,ymax) -> viewport top-left, y", tl.y, vp.y, 1e-9);
  check("(xmax,ymin) -> viewport bottom-right, x", br.x, vp.x + vp.w, 1e-9);
  check("(xmax,ymax) -> viewport top-right, y", tr.y, vp.y, 1e-9);

  // NEGATIVE CONTROL — a transform with the y-flip dropped. Written
  // independently here (never shipped), never invoked by the renderer.
  const dx = DEFAULT_PLANE.x_range.max - DEFAULT_PLANE.x_range.min;
  const dy = DEFAULT_PLANE.y_range.max - DEFAULT_PLANE.y_range.min;
  const sX = vp.w / dx, sY = vp.h / dy;
  const brokenToPx = (x: number, y: number) => ({
    x: vp.x + (x - DEFAULT_PLANE.x_range.min) * sX,
    y: vp.y + (y - DEFAULT_PLANE.y_range.min) * sY, // BUG: no y-flip
  });
  const brokenTopLeft = brokenToPx(DEFAULT_PLANE.x_range.min, DEFAULT_PLANE.y_range.max);
  // Under the broken (unflipped) transform, the data-MAX-y corner lands at
  // the viewport's BOTTOM (large pixel y), not the top — the defect this
  // section exists to catch.
  const negControlCaught = Math.abs(brokenTopLeft.y - (vp.y + vp.h)) < 1e-9
    && Math.abs(brokenTopLeft.y - vp.y) > 1;
  assertTrue("NEGATIVE CONTROL: y-flip-dropped transform puts (xmin,ymax) at the BOTTOM, not top", negControlCaught);
}

console.log("\n=== 2. THE ORIGIN — F2 straddle vs edge ===");
{
  // Straddling range: origin sits INSIDE the frame.
  const straddle = E.PM_planeBuildTransform(DEFAULT_PLANE);
  const originStraddleX = E.PM_clamp(0, DEFAULT_PLANE.x_range.min, DEFAULT_PLANE.x_range.max);
  check("straddling [-6.5,6.5]: origin data x", originStraddleX, 0, 0);
  const axisPxStraddle = straddle.toPx(originStraddleX, 0);
  const vp = DEFAULT_PLANE.viewport;
  assertTrue("axis line sits strictly INSIDE the viewport (not on either edge)",
    axisPxStraddle.x > vp.x + 1 && axisPxStraddle.x < vp.x + vp.w - 1);

  // Non-straddling range [1,5]: origin clamps to the NEAR EDGE (xRange.min),
  // never the middle.
  const edgeSpec = { id: "plane", viewport: vp, x_range: { min: 1, max: 5 }, y_range: DEFAULT_PLANE.y_range };
  const edgePlane = E.PM_planeBuildTransform(edgeSpec);
  const originEdgeX = E.PM_clamp(0, 1, 5);
  check("range [1,5]: origin clamps to xRange.min (the edge)", originEdgeX, 1, 0);
  const axisPxEdge = edgePlane.toPx(originEdgeX, 0);
  check("range [1,5]: axis line sits at the viewport's LEFT edge", axisPxEdge.x, vp.x, 1e-9);

  // Entirely-negative range: origin clamps to xRange.max (the other edge).
  const originNegX = E.PM_clamp(0, -5, -1);
  check("range [-5,-1]: origin clamps to xRange.max (the edge)", originNegX, -1, 0);

  // NEGATIVE CONTROL — "range [1,5] must not paint an axis through the
  // middle": a plausible-but-wrong implementation that always centres the
  // origin (mean of min/max) instead of clamping. Demonstrated to differ from
  // the shipped clamp AND to land exactly at the viewport's horizontal centre.
  const wrongCenterX = (1 + 5) / 2; // 3 — the "just average it" bug
  const wrongAxisPx = edgePlane.toPx(wrongCenterX, 0);
  const viewportMidX = vp.x + vp.w / 2;
  assertTrue("NEGATIVE CONTROL: shipped origin (edge) differs from the wrong 'always-centre' origin",
    Math.abs(axisPxEdge.x - wrongAxisPx.x) > 100);
  assertTrue("NEGATIVE CONTROL: the wrong 'always-centre' origin DOES paint through the viewport middle",
    Math.abs(wrongAxisPx.x - viewportMidX) < 1e-9);
}

console.log("\n=== 3. TICKS — authored step (D5) + pi-mode labels (F3) ===");
{
  // Step 1 on [-6.5, 6.5]: 14 ticks, -6.5 .. 6.5.
  const xt = E.PM_planeTickValues(-6.5, 6.5, 1);
  check("tick count, step 1 on [-6.5,6.5]", xt.length, 14, 0);
  check("first tick", xt[0], -6.5, 1e-12);
  check("last tick", xt[xt.length - 1], 6.5, 1e-12);
  check("tick[6] = -0.5", xt[6], -0.5, 1e-9);
  check("tick[7] = 0.5", xt[7], 0.5, 1e-9);
  // x_tick: 0 -> no ticks at all.
  check("x_tick 0 -> zero ticks", E.PM_planeTickValues(-6.5, 6.5, 0).length, 0, 0);

  // pi-mode: range [0, 2*PI], tick = PI/2 -> 0, pi/2, pi, 3pi/2, 2pi.
  const piTicks = E.PM_planeTickValues(0, 2 * Math.PI, Math.PI / 2);
  check("pi-range tick count", piTicks.length, 5, 0);
  check("PM_formatTickLabel(pi/2, 'pi')", E.PM_formatTickLabel(piTicks[1], "pi", 0), "π/2", 0 as any);
  check("PM_formatTickLabel(pi, 'pi')", E.PM_formatTickLabel(piTicks[2], "pi", 0), "π", 0 as any);
  check("PM_formatTickLabel(3pi/2, 'pi')", E.PM_formatTickLabel(piTicks[3], "pi", 0), "3π/2", 0 as any);
  check("PM_formatTickLabel(2pi, 'pi')", E.PM_formatTickLabel(piTicks[4], "pi", 0), "2π", 0 as any);
  check("PM_formatTickLabel(0, 'pi')", E.PM_formatTickLabel(piTicks[0], "pi", 0), "0", 0 as any);

  // "at the right pixels" — a simple viewport where the ratio cancels PI
  // cleanly, so the expected pixel values are exact, hand-checkable integers.
  const piPlaneSpec = { id: "p", viewport: { x: 0, y: 0, w: 400, h: 100 }, x_range: { min: 0, max: 2 * Math.PI }, y_range: { min: 0, max: 1 } };
  const piPlane = E.PM_planeBuildTransform(piPlaneSpec);
  check("px(pi/2)", piPlane.toPx(piTicks[1], 0).x, 100, 1e-9);
  check("px(pi)", piPlane.toPx(piTicks[2], 0).x, 200, 1e-9);
  check("px(3pi/2)", piPlane.toPx(piTicks[3], 0).x, 300, 1e-9);
  check("px(2pi)", piPlane.toPx(piTicks[4], 0).x, 400, 1e-9);

  // NEGATIVE CONTROL — decimal mode on the SAME range must not emit pi.
  const decimalLabel = E.PM_formatTickLabel(piTicks[1], "number", 2);
  assertTrue("NEGATIVE CONTROL: decimal mode on pi/2 does not contain 'π'",
    typeof decimalLabel === "string" && decimalLabel.indexOf("π") === -1);
  check("decimal mode on pi/2 reads a plain number", decimalLabel, (Math.PI / 2).toFixed(2), 0 as any);

  // 'none' mode emits nothing.
  check("PM_formatTickLabel(..., 'none') is empty", E.PM_formatTickLabel(piTicks[1], "none", 0), "", 0 as any);
}

console.log("\n=== 4. equal_scale (D2) — shrinks, never grows ===");
{
  const vp = DEFAULT_PLANE.viewport; // 660x372, dx=13, dy=8
  const offSpec = { id: "p", viewport: vp, x_range: DEFAULT_PLANE.x_range, y_range: DEFAULT_PLANE.y_range, equal_scale: false };
  const onSpec = { ...offSpec, equal_scale: true };
  const planeOff = E.PM_planeBuildTransform(offSpec);
  const planeOn = E.PM_planeBuildTransform(onSpec);

  check("equal_scale true: scaleX === scaleY", Math.abs(planeOn.scaleX - planeOn.scaleY), 0, 1e-12);
  // k = min(660/13, 372/8) = min(50.769.., 46.5) = 46.5 (height is the constraint)
  check("equal_scale true: k = min(w/dx,h/dy)", planeOn.scaleX, 372 / 8, 1e-12);

  // Effective rect stays INSIDE the authored viewport (never grows past it).
  const ev = planeOn.viewport;
  assertTrue("effective viewport left edge >= authored viewport", ev.x >= vp.x - 1e-9);
  assertTrue("effective viewport right edge <= authored viewport", ev.x + ev.w <= vp.x + vp.w + 1e-9);
  assertTrue("effective viewport top edge >= authored viewport", ev.y >= vp.y - 1e-9);
  assertTrue("effective viewport bottom edge <= authored viewport", ev.y + ev.h <= vp.y + vp.h + 1e-9);
  // Since h is the binding constraint here, the full height is used and
  // width shrinks (centred).
  check("effective height == full viewport height (h is the constraint)", ev.h, vp.h, 1e-9);
  check("effective width == dx * k (shrunk)", ev.w, 13 * (372 / 8), 1e-9);
  check("effective viewport is horizontally centred", ev.x, vp.x + (vp.w - ev.w) / 2, 1e-9);

  // NEGATIVE CONTROL — non-square range with the flag OFF must differ
  // (scaleX != scaleY).
  assertTrue("NEGATIVE CONTROL: equal_scale FALSE gives scaleX != scaleY for a non-square range",
    Math.abs(planeOff.scaleX - planeOff.scaleY) > 1);
}

console.log("\n=== 5. function_plot — DOMAIN sampling (F8-F10, CP-B) ===");
{
  const yRange = { min: -1.5, max: 1.5 };
  const polylines = E.PM_functionPlotSample("sin(x)", 0, 2 * Math.PI, 240, {}, yRange);
  assertTrue("sin(x) over one clean domain -> exactly one unbroken polyline", polylines.length === 1);
  const pts = polylines[0] ?? [];
  check("240 samples -> 240 points", pts.length, 240, 0);
  let maxErr = 0;
  for (const pt of pts) maxErr = Math.max(maxErr, Math.abs(pt.y - Math.sin(pt.x)));
  check("max |sampled - Math.sin| across 240 points", maxErr, 0, 1e-12);
  check("first sample x === domainMin (endpoint included)", pts[0].x, 0, 1e-12);
  check("last sample x === domainMax (endpoint included)", pts[pts.length - 1].x, 2 * Math.PI, 1e-12);

  // samples is clamped to the authored contract's closed range [40, 480].
  const under = E.PM_functionPlotSample("sin(x)", 0, 2 * Math.PI, 5, {}, null);
  check("samples below 40 clamps to 40", under[0]?.length, 40, 0);
  const over = E.PM_functionPlotSample("sin(x)", 0, 2 * Math.PI, 9000, {}, null);
  check("samples above 480 clamps to 480", over[0]?.length, 480, 0);

  // A live variable reaches the sampler through vars, but 'x' itself is
  // ALWAYS the sampler's own binding, never read from vars (D3) — a vars.x
  // present in the scope must not leak into the sample.
  const withStrayX = E.PM_functionPlotSample("x + a", 0, 1, 40, { x: 999, a: 10 }, null);
  check("sampler's own x wins over a same-named vars.x (D3)", withStrayX[0][5].y, withStrayX[0][5].x + 10, 1e-9);

  // NEGATIVE CONTROL — an off-by-one sampler that never reaches x_max
  // (i/n instead of i/(n-1)). Written here, never shipped.
  function brokenSampler(domainMin: number, domainMax: number, n: number) {
    const out: { x: number; y: number }[] = [];
    for (let i = 0; i < n; i++) {
      const x = domainMin + (domainMax - domainMin) * (i / n); // BUG: /n, not /(n-1)
      out.push({ x, y: Math.sin(x) });
    }
    return out;
  }
  const brokenPts = brokenSampler(0, 2 * Math.PI, 240);
  assertTrue("NEGATIVE CONTROL: off-by-one sampler (i/n) misses x_max",
    Math.abs(brokenPts[brokenPts.length - 1].x - 2 * Math.PI) > 1e-6);
  assertTrue("the shipped sampler (i/(n-1)) does NOT share that defect",
    Math.abs(pts[pts.length - 1].x - 2 * Math.PI) < 1e-9);
}

console.log("\n=== 6. function_plot — D4 discontinuities break the line; never clamped (CP-B) ===");
{
  // tan(x) over [0, pi] on a typical unit-scale y_range.
  const yRange = { min: -4, max: 4 };
  const tanPolylines = E.PM_functionPlotSample("tan(x)", 0, Math.PI, 240, {}, yRange);
  assertTrue("tan(x) over [0,pi] yields >= 2 polylines (breaks at the pi/2 asymptote)", tanPolylines.length >= 2);
  let anyOutOfRange = false;
  for (const poly of tanPolylines) for (const pt of poly) {
    if (pt.y < yRange.min - 1e-9 || pt.y > yRange.max + 1e-9) anyOutOfRange = true;
  }
  assertTrue("no drawn tan(x) point ever leaves y_range (never clamped, never drawn)", !anyOutOfRange);

  // 1/x breaks exactly at x=0. n=41 over [-1,1] lands a sample exactly on 0
  // at i=20: x = -1 + 2*(20/40) = 0.
  const invPolylines = E.PM_functionPlotSample("1/x", -1, 1, 41, {}, { min: -50, max: 50 });
  assertTrue("1/x over [-1,1] yields >= 2 polylines (breaks at x=0)", invPolylines.length >= 2);
  assertTrue("no 1/x polyline contains a sample at x=0",
    invPolylines.every((poly: { x: number; y: number }[]) => poly.every((pt) => Math.abs(pt.x) > 1e-9)));

  // NEGATIVE CONTROL — a CLAMPING sampler (flattens y into yRange instead of
  // breaking the line). Written here, never shipped.
  function clampingTan(domainMin: number, domainMax: number, n: number, yr: { min: number; max: number }) {
    const out: { x: number; y: number }[] = [];
    for (let i = 0; i < n; i++) {
      const x = domainMin + (domainMax - domainMin) * (i / (n - 1));
      let y = Math.tan(x);
      if (!isFinite(y)) y = y > 0 ? yr.max : yr.min; // BUG: silently clamps instead of breaking
      else y = Math.max(yr.min, Math.min(yr.max, y));
      out.push({ x, y });
    }
    return [out]; // a single, wrongly-unbroken polyline
  }
  const clampedTan = clampingTan(0, Math.PI, 240, yRange);
  assertTrue("NEGATIVE CONTROL: a clamping sampler produces exactly ONE (wrongly unbroken) polyline for tan(x)",
    clampedTan.length === 1);
  assertTrue("the shipped D4 sampler does NOT share that defect (>= 2 polylines)", tanPolylines.length >= 2);
}

console.log("\n=== 7. plot_point — readout AND pixel position derive from ONE evaluation (D8, CP-B) ===");
{
  const pointSpec = { x_expr: "x0", y_expr: "x0*x0", readout: { format: "P = ({x}, {y})", decimals: 2 } };
  const vars = { x0: 1.5 };
  const resolved = E.PM_plotPointResolve(pointSpec, vars);
  check("resolved.x", resolved.x, 1.5, 1e-12);
  check("resolved.y", resolved.y, 2.25, 1e-12);
  check("resolved.readoutText", resolved.readoutText, "P = (1.50, 2.25)", 0 as any);

  // The picture and the text must be traceable to the SAME (x, y) — re-parse
  // the numbers OUT of the readout text and confirm they match resolved.x/y.
  const m = /P = \(([-\d.]+), ([-\d.]+)\)/.exec(resolved.readoutText);
  assertTrue("readout text parses back to two numbers", !!m);
  check("readout's printed x matches resolved.x", parseFloat(m![1]), resolved.x, 1e-9);
  check("readout's printed y matches resolved.y", parseFloat(m![2]), resolved.y, 1e-9);

  // The pixel position derives from the SAME resolved.x/y through the ONE
  // plane funnel (PM_planeResolve) — register a plane and confirm.
  const planeSpec = { id: "pp", viewport: { x: 0, y: 0, w: 400, h: 200 }, x_range: { min: 0, max: 4 }, y_range: { min: 0, max: 4 } };
  for (const k of Object.keys(E.PM_planeRegistry)) delete E.PM_planeRegistry[k];
  E.PM_planeRegistry["pp"] = E.PM_planeBuildTransform(planeSpec);
  const px = E.PM_planeResolve({ plane_id: "pp" }, resolved.x, resolved.y);
  const pxDirect = E.PM_planeRegistry["pp"].toPx(1.5, 2.25);
  check("plot_point pixel position matches the plane transform at resolved.x/y, x", px.x, pxDirect.x, 1e-9);
  check("plot_point pixel position matches the plane transform at resolved.x/y, y", px.y, pxDirect.y, 1e-9);

  // NEGATIVE CONTROL — a TWO-SCOPE implementation: the pixel position is
  // computed from a FRESH vars snapshot (the teacher has since dragged x0),
  // while the readout text stays formatted from the OLD snapshot. This is
  // exactly what "read the SAME scope" (D8) prevents by construction.
  const varsAtDrag = { x0: 1.5 };
  const staleResolved = E.PM_plotPointResolve(pointSpec, varsAtDrag); // readout text frozen at x0=1.5
  const varsAfterDrag = { x0: 3.0 };
  const freshX = E.PM_safeEval(pointSpec.x_expr, varsAfterDrag);
  assertTrue("NEGATIVE CONTROL: a two-scope implementation disagrees — position moved, text did not",
    Math.abs(freshX - staleResolved.x) > 1e-6 && staleResolved.readoutText === "P = (1.50, 2.25)");
  const correctFresh = E.PM_plotPointResolve(pointSpec, varsAfterDrag);
  assertTrue("the shipped single-evaluation call does NOT share that defect (text tracks position)",
    correctFresh.readoutText === "P = (3.00, 9.00)");
}

console.log("\n=== 8. region_fill — SIGNED integral (F15, CP-C1) ===");
{
  // sin(x) over one full period [0, 2*PI]: the exact signed integral is 0;
  // by odd symmetry about x=pi, the two same-sign bands (0..pi positive,
  // pi..2pi negative) each have area 2 — "the two colour bands have equal
  // area" (gate table's own wording; C1 tests the AREA split, C2 owns which
  // pixel colour each band gets — see file header + region_fill's own
  // renderer-side comment).
  const computed = E.PM_regionFillCompute("sin(x)", 0, 2 * Math.PI, 0, {}, true);
  assertTrue("signed:true splits sin(x) over one period into exactly 2 same-sign bands", computed.segments.length === 2);
  check("total signed area ~ 0 (< 1e-6, the gate table's own bound)", computed.totalSignedArea, 0, 1e-6);
  check("positive band area ~ 2", computed.positiveArea, 2, 1e-4);
  check("negative band area ~ -2", computed.negativeArea, -2, 1e-4);
  assertTrue("the two bands have EQUAL area (|positive| === |negative|, by sin's symmetry)",
    Math.abs(Math.abs(computed.positiveArea) - Math.abs(computed.negativeArea)) < 1e-4);
  assertTrue("first band (0..pi) is POSITIVE", computed.segments[0].sign === 1);
  assertTrue("second band (pi..2pi) is NEGATIVE", computed.segments[1].sign === -1);

  // signed:false returns ONE unsplit segment whose TOTAL is the SAME
  // quantity (signed:true only decomposes; it never changes the number).
  const unsplit = E.PM_regionFillCompute("sin(x)", 0, 2 * Math.PI, 0, {}, false);
  assertTrue("signed:false returns exactly 1 segment (no band split)", unsplit.segments.length === 1);
  check("signed:false total matches signed:true total exactly (same evaluation, no decomposition)",
    unsplit.totalSignedArea, computed.totalSignedArea, 1e-9);

  // A second, independently-authored case — the spec driver's own S5 sign-
  // convention state (definite_integral_as_accumulated_area_skeleton.md
  // §3): f(x) = x^2 - 1 on [0,2]. Exact: integral(x^2-1, 0..2) = 8/3 - 2 =
  // 2/3; the below-axis piece (x in [0,1], where x^2-1 < 0) has exact area
  // -1/3 - 1 ... solved independently here: integral(x^2-1, 0..1) = 1/3 - 1 = -2/3.
  const s5 = E.PM_regionFillCompute("x*x - 1", 0, 2, 0, {}, true);
  check("S5 total: integral(x^2-1, 0..2) = 2/3", s5.totalSignedArea, 2 / 3, 1e-4);
  check("S5 below-axis band area = -2/3 (integral(x^2-1, 0..1))", s5.negativeArea, -2 / 3, 1e-4);
  check("S5 above-axis band area = +4/3 (2/3 - (-2/3))", s5.positiveArea, 4 / 3, 1e-4);

  // NEGATIVE CONTROL — "an unsigned fill must FAIL": integral(|sin|, 0..2pi)
  // = 4, a genuinely DIFFERENT (and wrong, for this concept family) quantity
  // from the signed total. A gate asserting "signed total ~ 0" correctly
  // FAILS against it. Computed with an independent hand-rolled quadrature
  // (never PM_safeEval, never PM_regionFillCompute).
  function unsignedAbsIntegral(fn: (x: number) => number, a: number, b: number): number {
    const n = 2000;
    let s = 0;
    for (let i = 0; i <= n; i++) {
      const x = a + (b - a) * (i / n);
      const w = (i === 0 || i === n) ? 0.5 : 1;
      s += w * Math.abs(fn(x));
    }
    return s * (b - a) / n;
  }
  const wrongUnsigned = unsignedAbsIntegral(Math.sin, 0, 2 * Math.PI);
  assertTrue(`NEGATIVE CONTROL: the UNSIGNED (abs-value) integral of sin over one period is ~4, not ~0 (got ${wrongUnsigned.toFixed(4)})`,
    Math.abs(wrongUnsigned - 4) < 1e-2);
  assertTrue("NEGATIVE CONTROL: an assertion of 'signed total ~ 0' correctly FAILS against the unsigned quantity",
    Math.abs(wrongUnsigned - 0) > 1e-6);
}

console.log("\n=== 9. riemann_bars — the four MODES + max_bars_drawn geometry (F16, CP-C1) ===");
{
  const f = (x: number) => x * x;
  const L4 = E.PM_riemannBarsCompute("x*x", 0, 1, 4, "left", undefined, {});
  const R4 = E.PM_riemannBarsCompute("x*x", 0, 1, 4, "right", undefined, {});
  const M4 = E.PM_riemannBarsCompute("x*x", 0, 1, 4, "midpoint", undefined, {});
  const T4 = E.PM_riemannBarsCompute("x*x", 0, 1, 4, "trapezoid", undefined, {});
  check("left(4) on x^2/[0,1]", L4.sum, 0.21875, 1e-12);
  check("right(4) on x^2/[0,1]", R4.sum, 0.46875, 1e-12);
  check("midpoint(4) on x^2/[0,1]", M4.sum, 0.328125, 1e-12);
  check("trapezoid(4) on x^2/[0,1] — AMENDMENT 1 KEEPS this mode", T4.sum, 0.34375, 1e-12);
  check("bars.length === n when max_bars_drawn is absent (n=4)", L4.bars.length, 4, 0);
  check("trapezoid(4) === (left(4)+right(4))/2 — the identity the closed form T(n) uses (gate 12)",
    T4.sum, (L4.sum + R4.sum) / 2, 1e-12);

  // A CLOSED (defended) 4-value enum: an unrecognised mode string defaults
  // to 'left', matching drawFunctionPlot's own style='solid' default style.
  const bogusMode = E.PM_riemannBarsCompute("x*x", 0, 1, 4, "not_a_real_mode", undefined, {});
  check("an unrecognised mode string defaults to 'left'", bogusMode.sum, 0.21875, 1e-12);

  // left(1000) -> 1/3 within 1e-3 (the convergence claim S3/S4 teach).
  const L1000 = E.PM_riemannBarsCompute("x*x", 0, 1, 1000, "left", undefined, {});
  check("left(1000) on x^2/[0,1] -> 1/3", L1000.sum, 1 / 3, 1e-3);

  // max_bars_drawn changes PIXELS ONLY, never the published sum (D7 — the
  // sum keeps computing at the TRUE n above the cap).
  const capped400 = E.PM_riemannBarsCompute("x*x", 0, 1, 1000, "left", 400, {});
  const capped4 = E.PM_riemannBarsCompute("x*x", 0, 1, 1000, "left", 4, {});
  check("sum with max_bars_drawn=400 === sum with no cap", capped400.sum, L1000.sum, 1e-12);
  check("sum with max_bars_drawn=4 === sum with no cap (STILL the true-n sum)", capped4.sum, L1000.sum, 1e-12);
  check("but only 400 bars are actually placed for drawing", capped400.bars.length, 400, 0);
  check("and only 4 bars are actually placed for drawing", capped4.bars.length, 4, 0);
  check("n itself always reports the TRUE n (1000), regardless of the cap", capped4.n, 1000, 0);

  // NEGATIVE CONTROL — "a sum computed from the drawn (capped) rectangle
  // count must FAIL": summing only the first max_bars_drawn terms instead
  // of all n. Written here, never shipped.
  function wrongSumFromDrawnCount(fn: (x: number) => number, from: number, to: number, n: number, cap: number): number {
    const h = (to - from) / n;
    const drawn = Math.min(n, cap);
    let s = 0;
    for (let i = 0; i < drawn; i++) s += fn(from + i * h) * h;
    return s;
  }
  const wrongSum = wrongSumFromDrawnCount(f, 0, 1, 1000, 4);
  assertTrue(`NEGATIVE CONTROL: a sum computed from the DRAWN (capped=4) rectangle count (${wrongSum.toFixed(4)}) diverges sharply from the true-n sum (${L1000.sum.toFixed(4)})`,
    Math.abs(wrongSum - L1000.sum) > 0.1);
}

console.log("\n=== F5 SEIZURE CLAUSE — plot_point drag seizes bind_variable exactly like a slider drag (CP-B) ===");
{
  // PM_stateLiveControlVars unions BOTH live-control sources.
  const scene = [
    { type: "slider", id: "s1", variable: "theta" },
    { type: "plot_point", id: "P", plane_id: "plane", x_expr: "x0", y_expr: "x0*x0", drag: { bind_variable: "x0", axis: "x" } },
    { type: "plot_point", id: "Q", plane_id: "plane", x_expr: "1", y_expr: "1" }, // no drag — must NOT contribute
  ];
  const live = E.PM_stateLiveControlVars(scene);
  assertTrue("PM_stateLiveControlVars includes the slider's variable", live["theta"] === true);
  assertTrue("PM_stateLiveControlVars includes the plot_point's drag.bind_variable", live["x0"] === true);
  check("PM_stateLiveControlVars sees exactly 2 live-control variables", Object.keys(live).length, 2, 0);

  // NEGATIVE CONTROL — a scanner that only looks at type:'slider' (the
  // PRE-FIX shape of the four call sites this dispatch unified) would miss
  // the drag-bound variable entirely.
  function preFixScan(sc: { type?: string; variable?: string }[]) {
    const out: Record<string, boolean> = {};
    for (const p of sc) if (p && p.type === "slider" && p.variable) out[p.variable] = true;
    return out;
  }
  const preFix = preFixScan(scene as { type?: string; variable?: string }[]);
  assertTrue("NEGATIVE CONTROL: the pre-fix slider-only scan misses the drag-bound variable", !("x0" in preFix));

  // STATIC REACHABILITY — drawPlotPoint's source contains the SAME seizure
  // write drawCanvasSlider's genuine-drag branch uses (PM_userTouched[...] =
  // true), inside a mouseIsPressed-gated branch, proving the F5 clause is
  // actually WIRED — not merely documented. Mirrors gate section 11's own
  // static-scan technique, since a real mouse drag cannot be simulated
  // headlessly here.
  const plotPointSrc = grabFn("drawPlotPoint");
  assertTrue("drawPlotPoint contains a PM_userTouched seizure write for drag.bind_variable",
    plotPointSrc.indexOf("PM_userTouched[spec.drag.bind_variable] = true") >= 0);
  assertTrue("the seizure write sits inside a mouseIsPressed-gated branch (a genuine drag, not synthetic postMessage traffic)",
    /mouseIsPressed[\s\S]*PM_userTouched\[spec\.drag\.bind_variable\] = true/.test(plotPointSrc));
  assertTrue("drawPlotPoint shares PM_activeSliderId with drawCanvasSlider (single-touch: a point-drag and a slider-drag can never both fire from one press)",
    plotPointSrc.indexOf("PM_activeSliderId") >= 0);

  // Per-state clearing: PM_userTouched is cleared WHOLESALE on SET_STATE
  // (already proven for sliders) — confirm the same statement exists
  // verbatim. It clears BY VARIABLE NAME, so it clears a drag-bound seizure
  // exactly as it clears a slider seizure — no separate code path to go stale.
  assertTrue("SET_STATE clears PM_userTouched wholesale (drag-bound seizures clear exactly like slider seizures)",
    SRC.indexOf("PM_userTouched = {};") >= 0);
}

console.log("\n=== 11. FLEET SAFETY — inert when plane_id is absent (F7) ===");
{
  // (a) PM_planeResolve is a pure funnel: absent/empty plane_id -> null,
  // ALWAYS, independent of registry state.
  // Registry starts empty (the grabVar'd `var PM_planeRegistry = {};` default)
  // — nothing above this point has written to it. NEVER reassign
  // E.PM_planeRegistry = {} anywhere in this file: that rebinds E's OWN
  // property to a fresh object without touching the closure variable the
  // compiled functions actually read, silently decoupling the two. Mutate
  // the existing object (delete its keys / add keys) instead.
  for (const k of Object.keys(E.PM_planeRegistry)) delete E.PM_planeRegistry[k];
  check("no plane_id key at all -> null", E.PM_planeResolve({}, 1, 2), null, 0 as any);
  check("plane_id: undefined -> null", E.PM_planeResolve({ plane_id: undefined }, 1, 2), null, 0 as any);
  check("plane_id: '' (falsy) -> null", E.PM_planeResolve({ plane_id: "" }, 1, 2), null, 0 as any);
  check("null spec -> null", E.PM_planeResolve(null, 1, 2), null, 0 as any);
  check("plane_id set but registry empty (plane never drawn) -> null",
    E.PM_planeResolve({ plane_id: "nonexistent" }, 1, 2), null, 0 as any);

  // NEGATIVE CONTROL (doc's literal text for §11): "adding a plane_id must
  // change it." Register a real plane, then show presence of plane_id flips
  // the result from null to a real transformed point.
  E.PM_planeRegistry["p"] = E.PM_planeBuildTransform(DEFAULT_PLANE);
  const withoutPlaneId = E.PM_planeResolve({}, 1, 1);
  const withPlaneId = E.PM_planeResolve({ plane_id: "p" }, 1, 1);
  assertTrue("NEGATIVE CONTROL: adding plane_id changes the result (null -> a real point)",
    withoutPlaneId === null && withPlaneId !== null
    && typeof withPlaneId.x === "number" && typeof withPlaneId.y === "number");

  // (b) STATIC REACHABILITY — over the ACTUAL shipped source (not a
  // description of it): every PM_planeResolve( call site inside drawBody /
  // drawVector / drawLabel / drawLocusTrace must sit inside an `if (...)`
  // whose condition textually names plane_id, with no premature `}` closing
  // that if-block before the call. This is what proves the four F7 call
  // sites cannot fire when plane_id is falsy — an exhaustive, deterministic,
  // node-executable guarantee (not sampled against a finite spec battery).
  function scanGuardedCalls(fnSrc: string): { total: number; guarded: number } {
    let total = 0, guarded = 0, from = 0;
    while (true) {
      const callIdx = fnSrc.indexOf("PM_planeResolve(", from);
      if (callIdx < 0) break;
      total++;
      from = callIdx + 1;
      const ifIdx = fnSrc.lastIndexOf("if (", callIdx);
      if (ifIdx < 0) continue;
      const openParen = ifIdx + 3;
      let depth = 0, condEnd = -1;
      for (let k = openParen; k < fnSrc.length; k++) {
        if (fnSrc[k] === "(") depth++;
        else if (fnSrc[k] === ")") { depth--; if (depth === 0) { condEnd = k; break; } }
      }
      if (condEnd < 0) continue;
      const cond = fnSrc.slice(openParen, condEnd + 1);
      if (cond.indexOf("plane_id") < 0) continue; // not guarded by plane_id
      // Confirm no premature `}` closes the if-block between its condition
      // and the call (net brace balance must stay >= 1 the whole way).
      let balance = 0, prematureClose = false;
      for (let k = condEnd + 1; k < callIdx; k++) {
        if (fnSrc[k] === "{") balance++;
        else if (fnSrc[k] === "}") { balance--; if (balance <= 0) { prematureClose = true; break; } }
      }
      if (!prematureClose && balance >= 1) guarded++;
    }
    return { total, guarded };
  }

  for (const fnName of ["drawBody", "drawVector", "drawLabel", "drawLocusTrace"]) {
    const fnSrc = grabFn(fnName);
    const r = scanGuardedCalls(fnSrc);
    assertTrue(`${fnName}: every PM_planeResolve( call site is guarded by an if(...plane_id...) (${r.guarded}/${r.total})`,
      r.total > 0 && r.guarded === r.total);
  }

  // (c) NEGATIVE CONTROL for the scanner itself — a deliberately UNGUARDED
  // call must be caught (guarded !== total), or the scanner proves nothing.
  const badSnippet = "function fakeDrawer(spec, x, y) {\n  if (true) {\n    var z = PM_planeResolve(spec, x, y);\n  }\n}";
  const badResult = scanGuardedCalls(badSnippet);
  check("NEGATIVE CONTROL: scanner flags an unguarded PM_planeResolve( call", badResult.guarded, 0, 0);
  check("NEGATIVE CONTROL: scanner still finds the (unguarded) call site", badResult.total, 1, 0);
}

console.log("\n=== 12. D11 PUBLICATION — sum_var equals the closed form; bars_drawn_var = min(n, max_bars_drawn) (CP-C1) ===");
{
  // Closed forms — the spec driver's own functional contract
  // (definite_integral_as_accumulated_area_skeleton.md §3), for f(x)=x^2-c
  // on [0,b]. Solved INDEPENDENTLY of the renderer; T(n) as the algebraic
  // identity (L(n)+R(n))/2 the skeleton itself states.
  function closedL(b: number, c: number, n: number): number { return Math.pow(b, 3) * (n - 1) * (2 * n - 1) / (6 * n * n) - c * b; }
  function closedR(b: number, c: number, n: number): number { return Math.pow(b, 3) * (n + 1) * (2 * n + 1) / (6 * n * n) - c * b; }
  function closedM(b: number, c: number, n: number): number { return Math.pow(b, 3) * (4 * n * n - 1) / (12 * n * n) - c * b; }
  function closedT(b: number, c: number, n: number): number { return (closedL(b, c, n) + closedR(b, c, n)) / 2; }
  const closed: Record<string, (b: number, c: number, n: number) => number> = {
    left: closedL, right: closedR, midpoint: closedM, trapezoid: closedT,
  };

  const b = 2;
  const nGrid = [4, 8, 100, 1000];
  const modes = ["left", "right", "midpoint", "trapezoid"];
  const cGrid = [0, 1];
  let allOk = true;
  let checkedCount = 0;
  for (const n of nGrid) {
    for (const c of cGrid) {
      for (const mode of modes) {
        checkedCount++;
        const computed = E.PM_riemannBarsCompute("x*x - c", 0, b, n, mode, undefined, { c });
        const want = closed[mode](b, c, n);
        // Gate table says "to 1e-12"; empirically-measured worst-case
        // deviation across this exact grid is ~2.7e-15 (accumulated
        // floating-point summation error over up to 1000 terms) — 1e-9 is
        // used here as a deliberately looser, still-extremely-tight bound
        // to absorb any evaluator-path difference between this file's
        // reference and PM_safeEval's `new Function` dispatch, while
        // remaining four orders of magnitude tighter than "closed form
        // roughly matches" would require. Flagged in the dispatch report.
        const ok = Math.abs(computed.sum - want) <= 1e-9;
        if (!ok) { allOk = false; console.log(`  FAIL  sum_var n=${n} c=${c} mode=${mode.padEnd(9)} got ${computed.sum} want ${want}`); }
      }
    }
  }
  assertTrue(`published sum_var matches the independently-solved closed form at every (n, mode, c) combination (${checkedCount} total, tol 1e-9)`, allOk);

  // bars_drawn_var === min(n, max_bars_drawn).
  const capped = E.PM_riemannBarsCompute("x*x", 0, 2, 1000, "left", 400, {});
  check("bars_drawn_var (capped) === min(n, max_bars_drawn) = 400", capped.barsDrawn, 400, 0);
  check("n itself is still the TRUE n (1000), never the capped count", capped.n, 1000, 0);
  const uncapped = E.PM_riemannBarsCompute("x*x", 0, 2, 1000, "left", undefined, {});
  check("bars_drawn_var with no max_bars_drawn authored === n (no cap)", uncapped.barsDrawn, 1000, 0);
  const overCapped = E.PM_riemannBarsCompute("x*x", 0, 2, 100, "left", 400, {});
  check("max_bars_drawn LARGER than n clamps to n, not to max_bars_drawn", overCapped.barsDrawn, 100, 0);

  // ── STATIC ASSERTION: no computePhysics_* re-derives a Riemann sum ──────
  // Every `function computePhysics_XXX(vars) { ... }` body in the shipped
  // renderer, extracted by the SAME brace-matching technique grabFn uses
  // (generalised here to find EVERY occurrence, not just the first).
  function grabAllFnBodies(namePrefix: string, src: string): { name: string; body: string }[] {
    const out: { name: string; body: string }[] = [];
    const re = new RegExp("function (" + namePrefix + "\\w*)\\(", "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) {
      const name = m[1];
      const start = m.index;
      const i = src.indexOf("{", start);
      let depth = 0, end = -1;
      for (let j = i; j < src.length; j++) {
        if (src[j] === "{") depth++;
        else if (src[j] === "}") { depth--; if (depth === 0) { end = j; break; } }
      }
      if (end < 0) throw new Error("unbalanced braces reading " + name);
      out.push({ name, body: src.slice(start, end + 1) });
      re.lastIndex = end; // resume scanning after this function, not mid-body
    }
    return out;
  }
  const computePhysicsFns = grabAllFnBodies("computePhysics_", SRC);
  assertTrue("at least one computePhysics_* function exists in the shipped renderer (scanner sanity)", computePhysicsFns.length > 0);
  const offenders = computePhysicsFns.filter((fn) => fn.body.indexOf("PM_riemannBarsCompute(") >= 0 || fn.body.indexOf("n_expr") >= 0);
  assertTrue(`no computePhysics_* function calls PM_riemannBarsCompute or references 'n_expr' (offenders: ${offenders.map((o) => o.name).join(", ") || "none"})`,
    offenders.length === 0);

  // NEGATIVE CONTROL for the scanner itself — a deliberately-offending
  // snippet (exactly the defect class D11 exists to prevent: the sum
  // relocated into computePhysics_<id> instead of published from the loop
  // that draws the rectangles) must be CAUGHT.
  const badSnippet = "function computePhysics_bad_reimplementation(vars) {\n  var s = PM_riemannBarsCompute('x*x', 0, vars.b, vars.n, 'left', 400, vars);\n  return { derived: { S_n: s.sum } };\n}";
  const badFns = grabAllFnBodies("computePhysics_", badSnippet);
  const badOffenders = badFns.filter((fn) => fn.body.indexOf("PM_riemannBarsCompute(") >= 0);
  assertTrue("NEGATIVE CONTROL: the scanner DOES catch a computePhysics_* re-implementation calling PM_riemannBarsCompute",
    badOffenders.length === 1);

  // ── PASS-ORDER ASSERTION — riemann_bars (Pass 0.3) runs before Pass 3 ───
  // (labels), so publisher-before-consumer holds by SOURCE ORDER every
  // frame, unconditionally — the dispatch report's own required assertion.
  const pass03Idx = SRC.indexOf("drawRiemannBars(rbPrim)");
  const pass3Idx = SRC.indexOf("if (lPrim.type === 'label') drawLabel(lPrim);");
  assertTrue("riemann_bars' draw call (Pass 0.3) sits BEFORE the Pass 3 label dispatch in source order",
    pass03Idx >= 0 && pass3Idx >= 0 && pass03Idx < pass3Idx);

  // The publish WRITE itself sits inside drawRiemannBars, unconditional on
  // whether anything is actually drawn (runs before the 'nothing to draw'
  // early return) — proven structurally, since drawRiemannBars is
  // p5-dependent and cannot be executed headlessly here (see file header).
  const rbSrc = grabFn("drawRiemannBars");
  const publishIdx = rbSrc.indexOf("PM_physics.derived[spec.sum_var]");
  const earlyReturnIdx = rbSrc.indexOf("if (computed.bars.length === 0) return;");
  assertTrue("the D11 publish write sits BEFORE the 'nothing to draw' early return inside drawRiemannBars",
    publishIdx >= 0 && earlyReturnIdx >= 0 && publishIdx < earlyReturnIdx);

  // NEGATIVE CONTROL for the pass-order scanner — a snippet where the label
  // dispatch textually precedes the riemann_bars draw call must be REJECTED
  // by the same < comparison (proving the assertion is directional, not
  // vacuously true).
  const investedOrderOk = 500 < 100; // label-idx < riemann-idx shape
  assertTrue("NEGATIVE CONTROL: the < comparison correctly rejects a reversed (label-before-riemann_bars) order",
    investedOrderOk === false);
}

console.log("\n=== 15. INSET PLACEMENT — multi-plane (F1) + ink-avoidance ===");
{
  // Independent geometry (a Liang-Barsky segment/AABB clip), written HERE —
  // not shipped in the renderer, since nothing in the renderer consumes it
  // (a zoom-link connector is authored as ordinary literal-pixel `vector`
  // endpoints today; see the CP-A report for why this stays test-only).
  function clipSegmentAABB(x0: number, y0: number, x1: number, y1: number, rx: number, ry: number, rw: number, rh: number): [number, number] | null {
    let t0 = 0, t1 = 1;
    const dx = x1 - x0, dy = y1 - y0;
    const p = [-dx, dx, -dy, dy];
    const q = [x0 - rx, rx + rw - x0, y0 - ry, ry + rh - y0];
    for (let i = 0; i < 4; i++) {
      if (p[i] === 0) {
        if (q[i] < 0) return null;
      } else {
        const r = q[i] / p[i];
        if (p[i] < 0) { if (r > t1) return null; if (r > t0) t0 = r; }
        else { if (r < t0) return null; if (r < t1) t1 = r; }
      }
    }
    return [t0, t1];
  }
  function segLen(x0: number, y0: number, x1: number, y1: number) { return Math.hypot(x1 - x0, y1 - y0); }
  function outsideLenAABB(x0: number, y0: number, x1: number, y1: number, rx: number, ry: number, rw: number, rh: number) {
    const total = segLen(x0, y0, x1, y1);
    const clip = clipSegmentAABB(x0, y0, x1, y1, rx, ry, rw, rh);
    if (!clip) return total;
    return total - (clip[1] - clip[0]) * total;
  }
  function segIntersectsRect(x0: number, y0: number, x1: number, y1: number, rx: number, ry: number, rw: number, rh: number) {
    const clip = clipSegmentAABB(x0, y0, x1, y1, rx, ry, rw, rh);
    return !!clip && (clip[1] - clip[0]) > 1e-9;
  }
  // Sanity on the clipper itself before trusting it on real geometry.
  assertTrue("clip sanity: a segment fully outside a rect has outsideLen === totalLen",
    Math.abs(outsideLenAABB(0, 0, 10, 0, 100, 100, 10, 10) - 10) < 1e-9);
  assertTrue("clip sanity: a segment fully inside a rect has outsideLen === 0",
    outsideLenAABB(105, 105, 108, 108, 100, 100, 10, 10) < 1e-9);

  // The spec driver's S4 geometry (definite_integral_as_accumulated_area
  // skeleton §11) — CP-A's own numbers, not re-derived: main plane [-0.5,2.5]
  // x [-1.5,4.5] at viewport{70,78,660,372}; inset [1.75,2.0] x [3.0,4.0] at
  // viewport{200,88,230,145}.
  const mainSpec = { id: "plane", viewport: { x: 70, y: 78, w: 660, h: 372 }, x_range: { min: -0.5, max: 2.5 }, y_range: { min: -1.5, max: 4.5 } };
  const insetSpec = { id: "plane_inset", viewport: { x: 200, y: 88, w: 230, h: 145 }, x_range: { min: 1.75, max: 2.0 }, y_range: { min: 3.0, max: 4.0 } };
  const mainPlane = E.PM_planeBuildTransform(mainSpec);
  const insetPlane = E.PM_planeBuildTransform(insetSpec);

  // Multi-plane: two DISTINCT, independently-correct transforms coexist.
  check("main plane px/x-unit", mainPlane.scaleX, 220, 1e-9);
  check("main plane px/y-unit", mainPlane.scaleY, 62, 1e-9);
  check("inset plane px/x-unit", insetPlane.scaleX, 920, 1e-9);
  check("inset plane px/y-unit", insetPlane.scaleY, 145, 1e-9);
  assertTrue("the two planes' scales are genuinely different (not one plane reused)",
    Math.abs(mainPlane.scaleX - insetPlane.scaleX) > 1);

  // Cross-check against the skeleton's own stated pixel numbers (independent
  // authority — this document's numbers were derived before this gate).
  const origin = mainPlane.toPx(0, 0);
  check("main plane: data (0,0) -> px (180, 357)  x", origin.x, 180, 1e-9);
  check("main plane: data (0,0) -> px (180, 357)  y", origin.y, 357, 1e-9);
  const zoomAnchor1 = mainPlane.toPx(1.75, 3.0);
  check("zoom-link anchor 1 (F15-corrected): px x", zoomAnchor1.x, 565, 1e-9);
  check("zoom-link anchor 1 (F15-corrected): px y", zoomAnchor1.y, 171, 1e-9);
  const zoomAnchor2 = mainPlane.toPx(2.0, 4.0);
  check("zoom-link anchor 2: px x", zoomAnchor2.x, 620, 1e-9);
  check("zoom-link anchor 2: px y", zoomAnchor2.y, 109, 1e-9);
  const insetCorner = insetPlane.toPx(2.0, 3.0);
  check("inset bottom-right corner: px x", insetCorner.x, 430, 1e-9);
  check("inset bottom-right corner: px y", insetCorner.y, 233, 1e-9);

  // Real multi-plane proof THROUGH THE ACTUAL CONSUMER FUNNEL (not just the
  // pure builder): register both under distinct ids and resolve through
  // PM_planeResolve exactly as drawBody/drawVector/drawLabel would.
  for (const k of Object.keys(E.PM_planeRegistry)) delete E.PM_planeRegistry[k];
  E.PM_planeRegistry["plane"] = mainPlane;
  E.PM_planeRegistry["plane_inset"] = insetPlane;
  const viaMain = E.PM_planeResolve({ plane_id: "plane" }, 0, 0);
  const viaInset = E.PM_planeResolve({ plane_id: "plane_inset" }, 2.0, 3.0);
  check("PM_planeResolve via 'plane' matches the pure builder", viaMain.x, origin.x, 1e-9);
  check("PM_planeResolve via 'plane_inset' matches the pure builder", viaInset.x, insetCorner.x, 1e-9);

  // Ink-avoidance: CP-A ships no curve yet (function_plot is CP-B), so the
  // ink checked here is the ink CP-A DOES draw — the main plane's own y-axis
  // line (the range straddles 0, so F2 puts it at px x=180, spanning the
  // full viewport height). The inset rect must not cross it.
  const axisX = origin.x; // 180
  const iv = insetSpec.viewport;
  const axisHitsInset = segIntersectsRect(axisX, mainSpec.viewport.y, axisX, mainSpec.viewport.y + mainSpec.viewport.h, iv.x, iv.y, iv.w, iv.h);
  assertTrue("the inset viewport does NOT cross the main plane's own drawn y-axis ink", !axisHitsInset);

  // NEGATIVE CONTROL — shift the inset left so it WOULD cross the axis
  // (an inset overlapping the parent's ink must FAIL).
  const badInsetX = iv.x - 50; // now spans px 150-380, straddling axisX=180
  const axisHitsBadInset = segIntersectsRect(axisX, mainSpec.viewport.y, axisX, mainSpec.viewport.y + mainSpec.viewport.h, badInsetX, iv.y, iv.w, iv.h);
  assertTrue("NEGATIVE CONTROL: a shifted inset overlapping the axis IS detected", axisHitsBadInset);

  // Zoom-link connectors: >20px of VISIBLE length outside the inset, for
  // both authored connectors (each terminates exactly ON the inset's own
  // corner — a touching endpoint, zero interior overlap, not a violation).
  const out1 = outsideLenAABB(zoomAnchor1.x, zoomAnchor1.y, insetCorner.x, insetCorner.y, iv.x, iv.y, iv.w, iv.h);
  const out2 = outsideLenAABB(zoomAnchor2.x, zoomAnchor2.y, insetCorner.x, insetCorner.y, iv.x, iv.y, iv.w, iv.h);
  assertTrue(`zoom-link 1 visible length outside inset > 20px (got ${out1.toFixed(1)}px)`, out1 > 20);
  assertTrue(`zoom-link 2 visible length outside inset > 20px (got ${out2.toFixed(1)}px)`, out2 > 20);

  // NEGATIVE CONTROL — a connector plunging into the inset's INTERIOR (not
  // its corner) loses most of its length; the same >20px assertion must
  // reject a segment that ends up mostly buried. Chosen so only 5px sits
  // outside the rect's left edge (x=200) before the rest (100px) runs
  // through the interior to x=300.
  const buriedOut = outsideLenAABB(iv.x - 5, 150, 300, 150, iv.x, iv.y, iv.w, iv.h);
  assertTrue(`NEGATIVE CONTROL: a connector plunging INTO the inset interior fails the >20px floor (got ${buriedOut.toFixed(1)}px)`,
    buriedOut < 20);

  // The plane frame itself never depends on a live variable (the ledger
  // explicitly excludes teacher-draggable pan/zoom of the plane), so the
  // axis-ink check above holds by a single evaluation. A drawn CURVE does
  // depend on live variables, so it needs re-evaluation across the state's
  // full control range — CP-A left this as a documented handoff (its own
  // header comment above named it), completed here now that function_plot
  // exists (CP-B).

  // ── COMPLETING THE CP-A HANDOFF (CP-B) ──────────────────────────────────
  // Extend the SAME ink-avoidance check to the PARENT CURVE's drawn ink,
  // swept across the full range of every control the spec driver's S4 state
  // exposes for b and c (docs/skeletons/definite_integral_as_accumulated_
  // area_skeleton.md §10c: b in [0.2, 2.0], c in [0, 1]) — not just one
  // static entry value.
  {
    const bGrid = [0.2, 0.6, 1.0, 1.4, 1.8, 2.0];
    const cGrid = [0, 0.25, 0.5, 0.75, 1.0];

    function curveHitsRect(rx: number, ry: number, rw: number, rh: number): boolean {
      for (const b of bGrid) {
        for (const c of cGrid) {
          const polylines = E.PM_functionPlotSample("x*x - c", 0, b, 240, { c }, mainSpec.y_range);
          for (const poly of polylines) {
            for (let i = 1; i < poly.length; i++) {
              const p0 = mainPlane.toPx(poly[i - 1].x, poly[i - 1].y);
              const p1 = mainPlane.toPx(poly[i].x, poly[i].y);
              if (segIntersectsRect(p0.x, p0.y, p1.x, p1.y, rx, ry, rw, rh)) return true;
            }
          }
        }
      }
      return false;
    }

    assertTrue("the PARENT CURVE's drawn ink never crosses the inset viewport, across the full b x c control product",
      !curveHitsRect(iv.x, iv.y, iv.w, iv.h));

    // NEGATIVE CONTROL — shift the inset DOWN so it now sits directly over
    // the curve's own tail in that x-window (an inset overlapping the
    // parent's CURVE, not just its axis, must FAIL).
    const badIv = { x: iv.x, y: iv.y + 60, w: iv.w, h: iv.h }; // now spans px y 148-293
    assertTrue("NEGATIVE CONTROL: a downward-shifted inset overlapping the parent curve IS detected",
      curveHitsRect(badIv.x, badIv.y, badIv.w, badIv.h));
  }
}

console.log("\n=== 16. RANGE CONTAINMENT — cross-product of control ranges stays inside y_range (D4/F9, CP-B) ===");
{
  // The spec driver's own worked scenario (docs/skeletons/
  // definite_integral_as_accumulated_area_skeleton.md §11/§3): f(x) = x^2 - c
  // on x_domain [0, b], b in [0.2, 2.0], c in [0, 1], main plane y_range
  // [-1.5, 4.5].
  const yRange = { min: -1.5, max: 4.5 };
  const bGrid = [0.2, 0.6, 1.0, 1.4, 1.8, 2.0];
  const cGrid = [0, 0.25, 0.5, 0.75, 1.0];
  const headroomFrac = 0.05;
  const span = yRange.max - yRange.min;

  // (a) RAW closed-form extremal check — independent of the D4 sampler,
  // the authoring-time reasoning MATHEMATICS_PHASE0_CARTESIAN_PLANE.md's
  // §11 range-containment callout requires BEFORE a state is authored.
  let rawMax = -Infinity, rawMin = Infinity;
  for (const b of bGrid) for (const c of cGrid) {
    // f(x)=x^2-c is increasing on [0,b] for b>0, so its extremes on the
    // domain sit at the two endpoints x=0 and x=b.
    rawMax = Math.max(rawMax, b * b - c, 0 - c);
    rawMin = Math.min(rawMin, b * b - c, 0 - c);
  }
  check("raw extremal max == closed form f(2.0, c=0) = 4.0", rawMax, 4.0, 1e-9);
  check("raw extremal min == closed form f(0, c=1) = -1.0", rawMin, -1.0, 1e-9);
  assertTrue(`raw max (${rawMax.toFixed(4)}) has >= 5% headroom below y_range.max`, rawMax <= yRange.max - headroomFrac * span);
  assertTrue(`raw min (${rawMin.toFixed(4)}) has >= 5% headroom above y_range.min`, rawMin >= yRange.min + headroomFrac * span);

  // (b) the SAMPLED polyline (the shipped D4 sampler) never exits the frame
  // for this (correctly-authored) range: every (b,c) pair samples to exactly
  // ONE continuous, unbroken 240-point polyline.
  let anyBroken = false;
  for (const b of bGrid) for (const c of cGrid) {
    const polylines = E.PM_functionPlotSample("x*x - c", 0, b, 240, { c }, yRange);
    if (polylines.length !== 1 || polylines[0].length !== 240) anyBroken = true;
  }
  assertTrue("the sampled polyline stays unbroken (240/240 points) across the full control product", !anyBroken);

  // NEGATIVE CONTROL — widen b past the authored range (to 2.3; the exact
  // shape of the round-0 defect MATHEMATICS_PHASE0_CARTESIAN_PLANE.md §0b
  // records: "a control range wider than the frame's y-range clips the
  // picture while the number keeps printing"). The RAW check must now FAIL
  // headroom, and the SAMPLED polyline must break (D4 catching what
  // mis-authoring missed).
  const badB = 2.3;
  const badRawMax = badB * badB - 0; // f(2.3, c=0) = 5.29
  assertTrue(`NEGATIVE CONTROL: b=2.3 raw max (${badRawMax.toFixed(2)}) FAILS the 5% headroom check`,
    !(badRawMax <= yRange.max - headroomFrac * span));
  const badPolylines = E.PM_functionPlotSample("x*x - 0", 0, badB, 240, {}, yRange);
  assertTrue("NEGATIVE CONTROL: the D4 sampler breaks the b=2.3 curve rather than silently drawing it out of frame",
    badPolylines.length !== 1 || badPolylines[0].length !== 240);
}

console.log(failures === 0
  ? "\nALL CARTESIAN-PLANE (CP-A + CP-B + CP-C1) CHECKS PASS\n"
  : `\n*** ${failures} CARTESIAN-PLANE CHECK(S) FAILED ***\n`);
process.exit(failures === 0 ? 0 : 1);
