/**
 * check:cartesian-plane — headless verification of the CP-A engine
 * (`cartesian_plane`, F1-F7 on `parametric_renderer.ts`).
 *
 * Same shape and reason as check:sigma-pi / check:bonding-scene: tsc, the
 * validators and THE EYE all pass on frames whose GEOMETRY is wrong, so this
 * does not check that the renderer compiles. It pulls the SHIPPED pure
 * functions out of PARAMETRIC_RENDERER_CODE by brace matching, runs them in
 * node, and asserts them against values solved INDEPENDENTLY of the renderer
 * (either hand-derived closed forms or a second, differently-written
 * implementation in this file).
 *
 * Sections implemented here (this dispatch's scope, per
 * docs/MATHEMATICS_PHASE0_CARTESIAN_PLANE.md 0c gate table): 1-4, 11, 15.
 * Sections 5-10, 12-14, 16 belong to CP-B/CP-C/CP-D and are NOT asserted
 * here — they exercise primitives (function_plot, plot_point, region_fill,
 * riemann_bars, secant_line, tangent_line) this dispatch does not build.
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
  // explicitly excludes teacher-draggable pan/zoom of the plane), so this
  // ink-avoidance result holds for "the full range of every control the
  // state exposes" by construction — a single evaluation covers it. A future
  // curve (CP-B/C) would need re-evaluation across the control's range; that
  // extension is out of CP-A's scope (see the dispatch report).
}

console.log(failures === 0
  ? "\nALL CARTESIAN-PLANE (CP-A) CHECKS PASS\n"
  : `\n*** ${failures} CARTESIAN-PLANE CHECK(S) FAILED ***\n`);
process.exit(failures === 0 ? 0 : 1);
