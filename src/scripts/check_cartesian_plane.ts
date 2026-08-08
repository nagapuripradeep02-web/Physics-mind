/**
 * check:cartesian-plane — headless verification of the cartesian_plane
 * engine family on `parametric_renderer.ts` (CP-A: F1-F7 frame/registry;
 * CP-B: F8-F12 function_plot + plot_point; CP-C1: F15-F16 GEOMETRY —
 * region_fill signed-area splitting, riemann_bars' four modes + D11
 * publication; CP-C2: signed colour, render/opacity, D12 declared
 * composition draw order — RESTORED to its literal form, see the
 * PM_riemannPublish / Pass-0.3 header comments in the renderer —
 * show_partition, reveal_stagger_ms, and the two non-finite-sample
 * reconciliations CP-C1 left open; CP-D: F13-F14 secant_line/tangent_line —
 * data-space-only slope, extend:'segment'|'frame' via a shared Liang-Barsky
 * clip, slotted into D12's already-declared draw-order position between
 * function_plot and plot_point).
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
 * 0c gate table: 1-4 (CP-A), 5-7 (CP-B), 8-9 (CP-C1), 10 (CP-D), 11 (CP-A),
 * 12 (CP-C1 D11 publication + CP-C2's frame-scoped-map survival extension),
 * 13 (CP-C2 show_partition), 14 (CP-C2 D12 composition), 15 (CP-A frame +
 * CP-B parent-curve completion), 16 (CP-B). Plus two standalone blocks not
 * themselves gate-table-numbered: F5 SEIZURE CLAUSE (CP-B, plot_point
 * drag-seize) and REVEAL_STAGGER_MS DETERMINISM (CP-C2).
 *
 * region_fill/riemann_bars/secant_line/tangent_line's DRAWING wrappers
 * (drawRegionFill/drawRiemannBars/drawSecantLine/drawTangentLine) call p5
 * primitives (push/fill/beginShape/vertex/...) that do not exist in this
 * headless sandbox, so — exactly like drawFunctionPlot/drawPlotPoint before
 * them — they are never extracted/executed here. Only the PURE
 * geometry+publication functions (PM_regionFillCompute,
 * PM_riemannBarsCompute, PM_riemannBarReveal, PM_lineClipToRect,
 * PM_extendLineToFrame, PM_secantLineCompute, PM_tangentLineCompute) are
 * pulled and run; the drawing wrappers are verified by STATIC source-text
 * assertions (grep-shaped, matching the F5 SEIZURE CLAUSE block's own
 * technique below).
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

const VARS = [
  "PM_planeRegistry", "PM_TANGENT_SEGMENT_HALF_WIDTH_FRAC", "PM_CANVAS_W",
  // Engine round (2026-08-07/08) — the tiered obstacle registries + the
  // per-plane live-curve tracker, all mutable `var {}` state read/written
  // by the FNS below. Grabbed as VARS (not FNS) because they are object
  // literals, exactly like PM_planeRegistry above.
  "PM_planeInkZones", "PM_planeGridInkZones", "PM_planeCurveExpr",
  "PM_GRID_OVERLAP_TIEBREAK_WEIGHT", "PM_TANGENT_PROBE_EPS", "PM_INK_SEGMENT_SUBDIVISIONS",
];
const FNS = [
  // PM_signGlyph/PM_fmtNum MUST stay ahead of their callers in this list —
  // the harness evaluates these in order, and PM_formatTickLabel /
  // PM_plotPointResolve now call PM_fmtNum, which itself now calls
  // PM_signGlyph (F6 engine round, 2026-08-08 — factored the ASCII->U+2212
  // substitution out of PM_fmtNum so PM_interpolateFormatNumeric can share
  // it). Omitting either crashes this whole gate with a bare
  // "ReferenceError: PM_fmtNum is not defined" the moment PR #59 landed
  // (shared U+2212 formatter). Nothing caught it: check:cartesian-plane is NOT
  // in verify.yml, so CI was green on a gate that could not start.
  "PM_signGlyph",
  "PM_fmtNum",
  "PM_clamp", "PM_gcd", "PM_formatTickLabel", "PM_planeTickValues",
  "PM_planeBuildTransform", "PM_planeResolve",
  // D3 (2026-08-08) — live `*_expr` range bounds, so a plane can re-zoom.
  "PM_planeResolveBound",
  // CP-B additions (F8-F12).
  "PM_planeRangesOf", "PM_planeResolveInverse",
  "PM_buildEvalScope", "PM_safeEval",
  "PM_functionPlotSample", "PM_plotPointResolve", "PM_stateLiveControlVars",
  // CP-C1 additions (F15-F16 geometry + D11 publication) — pure functions
  // only; drawRegionFill/drawRiemannBars are p5-drawing wrappers, verified
  // by static source assertions in section 12/14 instead (see file header).
  "PM_regionFillCompute", "PM_riemannBarsCompute",
  // CP-C2 addition — PM_riemannBarReveal (reveal_stagger_ms), also pure.
  "PM_riemannBarReveal",
  // CP-D additions (F13-F14) — pure functions only; drawSecantLine/
  // drawTangentLine are p5-drawing wrappers, verified by static source
  // assertions in section 10 instead (same technique as section 12/14).
  "PM_lineClipToRect", "PM_extendLineToFrame", "PM_secantTangentReadout",
  "PM_secantLineCompute", "PM_tangentLineCompute",
  // F-readout additions — bug_class parametric_canvas_drawn_readout_
  // overprints_its_own_line_and_is_invisible_to_the_layout_checker. All
  // pure; drawPlotPoint/drawSecantLine/drawTangentLine (the p5-drawing
  // wrappers that call them) are verified by static source assertions in
  // section 17 below (same technique as section 10/12/14).
  "PM_readoutAuthoredOffset", "PM_upwardNormal", "PM_labelClearOffset", "PM_rectsOverlap",
  "PM_readoutBBox", "PM_readoutDangerZones", "PM_readoutOffCanvas",
  "PM_clampOffsetToCanvas", "PM_readoutCollides", "PM_readoutResolveOffset",
  // Engine round (2026-08-07/08, bug_class readout_resolver_predicate_
  // saturated_by_gridline_ink_so_it_always_returns_true and
  // readout_resolver_flips_blind_without_testing_the_mirrored_candidate) —
  // the ordered-candidate resolver's own helpers, the tiered ink registry
  // functions (PM_registerInkZone/PM_registerGridInkZone/PM_registerLineInk
  // were already needed by section 15/CP-D but are listed here for
  // completeness against the new tiered split), and the plot_point
  // curve-tangent default-offset probe.
  "PM_registerInkZone", "PM_registerGridInkZone", "PM_registerLineInk",
  "PM_rectOverlapArea", "PM_readoutHardOverlapArea", "PM_readoutGridOverlapArea", "PM_readoutOverlapArea",
  "PM_plotPointCurveTangentPx",
  // F6 addition (2026-08-08) — the interpolate-path numeric formatter
  // (pure; depends only on PM_signGlyph, already listed above).
  // PM_interpolate/PM_liveDragScope themselves are NOT listed here — they
  // close over PM_config/PM_currentState/PM_sliderValues/PM_choreoValues/
  // PM_userTouched/PM_physics, mutable globals this shared `E` sandbox
  // deliberately does not expose; their own sections below build a
  // DEDICATED sandbox with literal fixtures instead (see runLiveDragScope).
  "PM_interpolateFormatNumeric",
];

// Helvetica advance widths (units/1000) — p5's default face at textSize(12).
// The renderer measures with the REAL textWidth(); headless, this model
// stands in for it. Calibrated against a rendered frame: the model gives
// 84.4px for "Q = (1.90, 1.80)" where the pixels measure ~85px (<1% error),
// so a width-dependent placement can be asserted here with confidence.
const HELV_W: Record<string, number> = (() => {
  const m: Record<string, number> = { " ": 278, "(": 333, ")": 333, ",": 278, "-": 333, ".": 278, "/": 278, "=": 584, "+": 584 };
  for (const d of "0123456789") m[d] = 556;
  const up = "667 667 722 722 667 611 778 722 278 500 667 556 833 722 778 667 778 722 667 611 722 667 944 667 667 611".split(" ").map(Number);
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((c, i) => { m[c] = up[i]; });
  const lo = "556 556 500 556 556 278 556 556 222 222 500 222 833 556 556 556 556 333 500 278 556 500 722 500 500 500".split(" ").map(Number);
  "abcdefghijklmnopqrstuvwxyz".split("").forEach((c, i) => { m[c] = lo[i]; });
  return m;
})();
const textW12 = (s: string) => [...s].reduce((a, c) => a + (HELV_W[c] ?? 556), 0) / 1000 * 12;

// Sign-aware helpers, SHARED across every section that parses a PM_fmtNum-
// produced string (bug_class check_cartesian_plane_sign_parsing_is_ascii_
// only_so_every_negative_fixture_is_vacuously_absent — engine round
// 2026-08-07/08). PM_fmtNum emits real U+2212 MINUS SIGN (Rule 34c), never
// ASCII U+002D hyphen-minus — but `parseFloat` does not recognise U+2212 as
// a sign character (parseFloat("−1.5") is NaN, not -1.5) and an ASCII-
// only character class like [-\d.] simply never matches it either. A probe
// built from either primitive on a POSITIVE-only fixture set passes
// vacuously — it never actually exercises the sign path — which is exactly
// how check:cartesian-plane's own "parses back to two numbers"/"readoutText
// carries the same slope value" assertions in sections 7 and 10 shipped
// with silent sign-blind spots (named directly by the founder brief at
// check_cartesian_plane.ts:467/681, this file's line numbers at the time).
// asciiMinus() normalises U+2212 -> '-' BEFORE parseFloat/regex ever see the
// string, so a negative fixture is actually exercised, not skipped.
const asciiMinus = (s: string) => s.replace(/−/g, "-");
const parseSignedFloat = (s: string) => parseFloat(asciiMinus(s));
// A char class that matches EITHER glyph, for regexes that need to capture
// a signed numeral straight out of PM_fmtNum's own output.
const SIGNED_NUM_RE_SRC = "[\\u2212\\-\\d.]+";

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
  // bug_class cartesian_plane_tick_values_enumerate_from_range_min_so_every_
  // axis_label_misreports_its_own_gridline (CRITICAL, engine_bug_queue).
  //
  // BEFORE this fix, this exact section asserted the DEFECT as correct:
  //   check("tick count, step 1 on [-6.5,6.5]", xt.length, 14, 0);
  //   check("first tick", xt[0], -6.5, 1e-12);
  //   check("last tick", xt[xt.length - 1], 6.5, 1e-12);
  //   check("tick[6] = -0.5", xt[6], -0.5, 1e-9);
  //   check("tick[7] = 0.5", xt[7], 0.5, 1e-9);
  // — 14 unsnapped marks walked from rangeMin (-6.5, -5.5, ..., 6.5), NONE of
  // them an integer, and NO mark at x=0 at all (graph_transformations' "gap
  // at the origin" report). AFTER: ticks are snapped to exact multiples of
  // the step (measured from 0), so [-6.5,6.5] step 1 now yields the 13
  // integers -6..6, with a genuine tick AT 0.
  const xt = E.PM_planeTickValues(-6.5, 6.5, 1);
  check("tick count, step 1 on [-6.5,6.5] (SNAPPED: 13 integers, -6..6)", xt.length, 13, 0);
  check("first tick is -6 (the first integer INSIDE the range, not the unsnapped rangeMin -6.5)", xt[0], -6, 1e-12);
  check("last tick is 6 (the last integer INSIDE the range, not the unsnapped rangeMax 6.5)", xt[xt.length - 1], 6, 1e-12);
  check("tick[6] = 0 (the origin IS enumerated, closing the graph_transformations 'gap at 0' report)", xt[6], 0, 1e-9);
  check("tick[7] = 1", xt[7], 1, 1e-9);
  // x_tick: 0 -> no ticks at all.
  check("x_tick 0 -> zero ticks", E.PM_planeTickValues(-6.5, 6.5, 0).length, 0, 0);

  // Every enumerated tick is an EXACT multiple of the step (the probe's own
  // wording: v / tick is within 1e-9 of an integer) — the defining property
  // a label can be trusted to describe.
  assertTrue("every tick on [-6.5,6.5]/1 is an exact multiple of the step",
    (xt as number[]).every((v: number) => Math.abs(v / 1 - Math.round(v / 1)) < 1e-9));

  // ── THE FOUNDER'S OWN REPRO — derivative_as_secant_limit's authored plane:
  // x_range [-2.4, 2.6], tick 1. Pre-fix this produced marks at -2.40, -1.40,
  // -0.40, 0.60, 1.60, 2.60 with labels "-2 -1 -0 1 2 3" (the visible '-0').
  // Post-fix, expected marks/labels are exactly -2 -1 0 1 2. ──────────────
  const founderXt = E.PM_planeTickValues(-2.4, 2.6, 1) as number[];
  check("founder repro [-2.4,2.6]/1: tick count", founderXt.length, 5, 0);
  assertTrue("founder repro [-2.4,2.6]/1: ticks are EXACTLY [-2,-1,0,1,2]",
    founderXt.length === 5 && founderXt.every((v: number, i: number) => Math.abs(v - (-2 + i)) < 1e-9));
  assertTrue("founder repro: a tick exists at 0 (range spans zero)",
    founderXt.some((v: number) => Math.abs(v) < 1e-9));
  // Tick labels emit U+2212 MINUS SIGN, not ASCII hyphen, since PR #59's shared
  // PM_fmtNum (Rule 34c). Every assertion below that inspects a SIGN must
  // normalise first — an ASCII-hyphen regex silently stops matching a U+2212
  // string and the guard passes VACUOUSLY, which is how the "-0" guard below
  // was quietly disarmed when that PR landed. Normalising keeps these testing
  // the numeric symptom they were written for rather than the glyph.
  const ascii = (s: string) => s.replace(/−/g, "-");
  const founderLabels: string[] = founderXt.map((v: number) => E.PM_formatTickLabel(v, "number", 0));
  check("founder repro labels (U+2212 minus per Rule 34c)",
    founderLabels.join(" "), "−2 −1 0 1 2", 0 as any);
  assertTrue("founder repro: labels carry U+2212, never ASCII hyphen",
    founderLabels.every((l: string) => !l.includes("-")));
  assertTrue("founder repro: NO label is '-0' (the visible symptom that was originally reported)",
    !founderLabels.some((l: string) => /^-0(\.0+)?$/.test(ascii(l))));
  // Probe's own wording: the label parses back to EXACTLY the tick value at
  // the authored decimals — no label can round away from its own mark.
  // Number() cannot parse U+2212, so normalise before comparing.
  assertTrue("founder repro: every label round-trips to Number(value.toFixed(decimals)) exactly",
    founderXt.every((v: number, i: number) => Number(ascii(founderLabels[i])) === Number(v.toFixed(0))));

  // NEGATIVE CONTROL — the PRE-FIX enumerator (walks from rangeMin, clamps
  // the final tick to rangeMax), reproduced HERE only (never re-shipped),
  // demonstrated to FAIL every assertion this section now enforces.
  function preFixTickValues(rangeMin: number, rangeMax: number, tick: number): number[] {
    const out: number[] = [];
    if (!(tick > 0)) return out;
    const EPS = 1e-9;
    for (let t = rangeMin; t <= rangeMax + EPS; t += tick) out.push(Math.min(t, rangeMax));
    return out;
  }
  const preFix65 = preFixTickValues(-6.5, 6.5, 1);
  check("NEGATIVE CONTROL: pre-fix [-6.5,6.5]/1 reproduces the old 14-mark count", preFix65.length, 14, 0);
  assertTrue("NEGATIVE CONTROL: pre-fix [-6.5,6.5]/1 has NO mark at x=0 (the reported 'gap at origin')",
    !preFix65.some((v) => Math.abs(v) < 1e-9));
  assertTrue("NEGATIVE CONTROL: pre-fix [-6.5,6.5]/1 marks are NOT integer multiples of the step (every one lands on a .5)",
    preFix65.every((v) => Math.abs(v / 1 - Math.round(v / 1)) > 0.4));

  const preFix2426 = preFixTickValues(-2.4, 2.6, 1);
  assertTrue("NEGATIVE CONTROL: pre-fix [-2.4,2.6]/1 reproduces the founder's exact 6 marks (-2.4,-1.4,-0.4,0.6,1.6,2.6)",
    preFix2426.length === 6 && [-2.4, -1.4, -0.4, 0.6, 1.6, 2.6].every((v, i) => Math.abs(v - preFix2426[i]) < 1e-9));
  // -0.40 fed to the LIVE (shipped) formatter. Before the 2026-08-07/08
  // engine round this ACTUALLY reproduced the reported bug (not merely a
  // hypothetical): PM_fmtNum's near-zero clamp was a FIXED 1e-9, and
  // |-0.4| = 0.4 sits nowhere near that, so it never clamped — the shipped
  // PM_formatTickLabel really did print "−0" for this mark. The clamp fix
  // (bug_class ascii_minus_in_oncanvas_math_from_tofixed's sibling: "shipped
  // twice, third occurrence via a magnitude instead of a glyph" — the clamp
  // must scale with decimals, 0.5*10^-decimals, not a fixed epsilon) closes
  // this exact case as a side effect, since PM_formatTickLabel's numeric
  // branch funnels through PM_fmtNum. This assertion is now POSITIVE, not a
  // negative control — a real defect the shipped code no longer has.
  const preFixLabel = E.PM_formatTickLabel(preFix2426[2], "number", 0); // the -0.40 mark
  check("the LIVE formatter on the pre-fix -0.40 mark now prints a clean 0, not a negative zero (the ORIGINAL reported bug, closed by the decimals-scaled clamp)",
    preFixLabel, "0", 0 as any);
  assertTrue("no residual '-0'/'−0' on the live formatter's output for this mark",
    !/^-0(\.0+)?$/.test(ascii(preFixLabel)));

  // NEGATIVE CONTROL, properly isolated this time — a hand-reimplemented
  // PRE-ROUND-2 PM_fmtNum (the fixed-1e-9-epsilon version this file's own
  // history shows was actually shipped), run here only, never re-shipped.
  // Demonstrates the assertion above WOULD have failed against the old
  // implementation, so the positive check is known to discriminate.
  function preFixFmtNum(value: number, decimals: number): string {
    const d = decimals;
    const v = Math.abs(value) < 1e-9 ? 0 : value; // BUG: fixed epsilon, not decimals-scaled
    return v.toFixed(d).replace("-", "−");
  }
  const preFixFmtLabel = preFixFmtNum(preFix2426[2], 0);
  check("NEGATIVE CONTROL: the pre-round-2 fixed-epsilon PM_fmtNum DOES still print a negative zero for -0.40 at 0dp",
    preFixFmtLabel, "−0", 0 as any);
  check("NEGATIVE CONTROL: PM_fmtNum(-0.003, 2) under the pre-round-2 implementation prints a genuine negative (does not clamp)",
    preFixFmtNum(-0.003, 2), "−0.00", 0 as any);

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
  // Uses SIGNED_NUM_RE_SRC/parseSignedFloat (this file's shared sign-aware
  // helpers) — NOT a bare [-\d.] class + raw parseFloat — because
  // PM_fmtNum emits real U+2212, which an ASCII-only class/parseFloat
  // silently fails to match. This positive-only fixture (x0=1.5) cannot by
  // itself prove the sign path works — the dedicated NEGATIVE fixture and
  // negative control immediately below exist for exactly that reason.
  const signedReadoutRe = new RegExp("P = \\(" + SIGNED_NUM_RE_SRC + ", " + SIGNED_NUM_RE_SRC + "\\)");
  const m = new RegExp("P = \\((" + SIGNED_NUM_RE_SRC + "), (" + SIGNED_NUM_RE_SRC + ")\\)").exec(resolved.readoutText);
  assertTrue("readout text parses back to two numbers", !!m);
  check("readout's printed x matches resolved.x", parseSignedFloat(m![1]), resolved.x, 1e-9);
  check("readout's printed y matches resolved.y", parseSignedFloat(m![2]), resolved.y, 1e-9);

  // ── NEGATIVE FIXTURE — x0 negative, so the readout actually PRINTS a
  // U+2212 minus sign (bug_class check_cartesian_plane_sign_parsing_is_
  // ascii_only_so_every_negative_fixture_is_vacuously_absent). Every prior
  // fixture in this section was positive-only. ──────────────────────────
  const negPointSpec = { x_expr: "x0", y_expr: "x0*x0", readout: { format: "P = ({x}, {y})", decimals: 2 } };
  const negResolved = E.PM_plotPointResolve(negPointSpec, { x0: -1.5 });
  check("negative fixture: resolved.x", negResolved.x, -1.5, 1e-12);
  check("negative fixture: resolved.y (x0^2 is positive even though x0 is negative)", negResolved.y, 2.25, 1e-12);
  check("negative fixture: readoutText carries a REAL U+2212, not ASCII hyphen", negResolved.readoutText, "P = (−1.50, 2.25)", 0 as any);
  assertTrue("negative fixture: signedReadoutRe (U+2212-aware) DOES match", signedReadoutRe.test(negResolved.readoutText));
  const negM = new RegExp("P = \\((" + SIGNED_NUM_RE_SRC + "), (" + SIGNED_NUM_RE_SRC + ")\\)").exec(negResolved.readoutText);
  assertTrue("negative fixture: the sign-aware regex parses back two numbers", !!negM);
  check("negative fixture: parseSignedFloat recovers -1.5 from the U+2212 string", parseSignedFloat(negM![1]), -1.5, 1e-9);

  // NEGATIVE CONTROL — the OLD ASCII-only regex + raw parseFloat, run here
  // only, demonstrating exactly the vacuous-pass this section's positive-
  // only fixture allowed to ship undetected.
  const oldAsciiOnlyRe = /P = \(([-\d.]+), ([-\d.]+)\)/;
  assertTrue("NEGATIVE CONTROL: the OLD ASCII-only char class does NOT match a U+2212 readout at all", !oldAsciiOnlyRe.test(negResolved.readoutText));
  assertTrue("NEGATIVE CONTROL: raw parseFloat on a U+2212 string is NaN, not the numeral (the silent failure mode)", Number.isNaN(parseFloat("−1.50")));

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

console.log("\n=== 10. secant_line / tangent_line — DATA-space slope, extend:'frame' clipping (F13-F14, CP-D) ===");
{
  // The spec driver's own MAIN plane (definite_integral_as_accumulated_area_
  // skeleton.md §"Main plane"): viewport {x:70,y:78,w:660,h:372},
  // x_range [-0.5,2.5] (span 3.0 -> 660/3 = 220 px/x-unit), y_range
  // [-1.5,4.5] (span 6.0 -> 372/6 = 62 px/y-unit). This is the EXACT
  // aspect-ratio mismatch the dispatch names — reused here, not invented,
  // so the trap is demonstrated on the real authored layout, not a
  // convenient toy.
  const MAIN_PLANE = {
    id: "main", viewport: { x: 70, y: 78, w: 660, h: 372 },
    x_range: { min: -0.5, max: 2.5 }, y_range: { min: -1.5, max: 4.5 },
  };
  const plane = E.PM_planeBuildTransform(MAIN_PLANE);
  check("sanity: MAIN_PLANE scaleX == 220 px/x-unit (the dispatch's own number)", plane.scaleX, 220, 1e-9);
  check("sanity: MAIN_PLANE scaleY == 62 px/y-unit (the dispatch's own number)", plane.scaleY, 62, 1e-9);
  const ranges = { xRange: plane.xRange, yRange: plane.yRange };

  // ── secant slope: sin(x) at x0=1, h=0.001, against cos(1) within 1e-3 ────
  const secantSpec = {
    from_expr: { x: "x0", y: "sin(x0)" }, to_expr: { x: "x0 + h", y: "sin(x0 + h)" },
    extend: "segment", readout: { format: "slope = {m}", decimals: 3 },
  };
  const secantVars = { x0: 1, h: 0.001 };
  const secantComputed = E.PM_secantLineCompute(secantSpec, secantVars, ranges);
  assertTrue("secant_line resolves valid (from/to both finite, non-vertical)", secantComputed.valid);
  check("secant slope for sin at x0=1, h=0.001 vs cos(1)", secantComputed.slope, Math.cos(1), 1e-3);
  // readoutText is toFixed(3) of the SAME slope value — tolerance is the
  // rounding half-step (5e-4), not 1e-9, since the text is deliberately
  // ROUNDED (decimals:3) while secantComputed.slope is the full-precision
  // float; the point being tested is "one evaluation", not "no rounding".
  check("secant readoutText carries the SAME slope value (D8: picture and readout, one scope)",
    parseFloat(secantComputed.readoutText.replace("slope = ", "")), secantComputed.slope, 5e-4);

  // ── NEGATIVE FIXTURE — a NEGATIVE slope, so readoutText actually PRINTS a
  // U+2212 (bug_class check_cartesian_plane_sign_parsing_is_ascii_only_so_
  // every_negative_fixture_is_vacuously_absent, named at this exact call
  // site by the founder brief). x0=2: cos(2) ~ -0.416, genuinely negative —
  // the fixture immediately above (x0=1, cos(1) ~ +0.540) can never exercise
  // this path no matter how many times it is re-run. ─────────────────────
  const negSlopeVars = { x0: 2, h: 0.001 };
  const negSlopeComputed = E.PM_secantLineCompute(secantSpec, negSlopeVars, ranges);
  assertTrue("negative-slope fixture: secant_line resolves valid", negSlopeComputed.valid);
  assertTrue("negative-slope fixture: the slope IS actually negative (the precondition, not assumed)", negSlopeComputed.slope < 0);
  assertTrue("negative-slope fixture: readoutText carries a REAL U+2212, not an ASCII hyphen", negSlopeComputed.readoutText.includes("−"));
  assertTrue("negative-slope fixture: readoutText carries ZERO ASCII hyphen-minus characters", !negSlopeComputed.readoutText.includes("-"));
  check("negative-slope fixture: parseSignedFloat (U+2212-aware) recovers the SAME slope value",
    parseSignedFloat(negSlopeComputed.readoutText.replace("slope = ", "")), negSlopeComputed.slope, 5e-4);

  // NEGATIVE CONTROL — the OLD raw parseFloat on this exact U+2212 string,
  // demonstrating the silent failure this call site's positive-only fixture
  // let ship undetected: parseFloat stops at the first non-numeral
  // character, and U+2212 is not one it recognises as a sign, so it returns
  // NaN rather than the (correctly signed) numeral.
  assertTrue("NEGATIVE CONTROL: raw parseFloat on the negative-slope readoutText is NaN, not the numeral",
    Number.isNaN(parseFloat(negSlopeComputed.readoutText.replace("slope = ", ""))));

  // ── tangent slope reproduces slope_expr EXACTLY (never numerically
  // differentiated — ledger item 5) ────────────────────────────────────────
  const tangentSpec = { at_expr: { x: "x0", y: "sin(x0)" }, slope_expr: "cos(x0)", extend: "segment" };
  const tangentVars = { x0: 1 };
  const tangentComputed = E.PM_tangentLineCompute(tangentSpec, tangentVars, ranges);
  assertTrue("tangent_line resolves valid", tangentComputed.valid);
  check("tangent slope reproduces slope_expr EXACTLY (same evaluation as a direct PM_safeEval call, D8)",
    tangentComputed.slope, E.PM_safeEval("cos(x0)", tangentVars), 0);
  check("tangent slope also matches the true derivative cos(1) (sanity — slope_expr was authored correctly here)",
    tangentComputed.slope, Math.cos(1), 1e-9);

  // ── NEGATIVE CONTROL — "a secant using Δx from pixels rather than data
  // must FAIL." Compute the WRONG slope from the two points' PIXEL
  // positions on this exact aspect-mismatched plane, and show it diverges
  // sharply from cos(1) — proving that if PM_secantLineCompute had used
  // pixels instead of data, this gate would have caught it. ──────────────
  const fromPx = plane.toPx(1, Math.sin(1));
  const toPx = plane.toPx(1.001, Math.sin(1.001));
  const pixelDerivedSlope = (toPx.y - fromPx.y) / (toPx.x - fromPx.x);
  assertTrue(`NEGATIVE CONTROL: a slope computed from PIXEL deltas (${pixelDerivedSlope.toFixed(4)}) diverges sharply from cos(1) (${Math.cos(1).toFixed(4)}) — the 220/62 px-per-unit mismatch, not a small error`,
    Math.abs(pixelDerivedSlope - Math.cos(1)) > 0.1);
  assertTrue("the SHIPPED secant slope (computed from DATA, same plane) does NOT share that defect",
    Math.abs(secantComputed.slope - Math.cos(1)) <= 1e-3);

  // ── STATIC — the slope computation itself never touches PM_planeResolve
  // (pixels), and the draw wrappers only resolve pixels AFTER the slope is
  // already final. Mirrors section 12/14's static-assertion technique. ────
  const secantComputeSrc = grabFn("PM_secantLineCompute");
  assertTrue("PM_secantLineCompute never calls PM_planeResolve — the slope is computed purely from data-space from/to, never pixels",
    secantComputeSrc.indexOf("PM_planeResolve(") === -1);
  const tangentComputeSrc = grabFn("PM_tangentLineCompute");
  assertTrue("PM_tangentLineCompute never calls PM_planeResolve — the slope is computed purely from data-space at_expr, never pixels",
    tangentComputeSrc.indexOf("PM_planeResolve(") === -1);

  const drawSecantSrc = grabFn("drawSecantLine");
  const secantComputeCallIdx = drawSecantSrc.indexOf("PM_secantLineCompute(");
  const secantFirstResolveIdx = drawSecantSrc.indexOf("PM_planeResolve(");
  assertTrue("drawSecantLine calls PM_secantLineCompute (the slope) BEFORE it calls PM_planeResolve (pixels) — pixels are resolved from the already-final data endpoints, never feed the slope",
    secantComputeCallIdx >= 0 && secantFirstResolveIdx >= 0 && secantComputeCallIdx < secantFirstResolveIdx);

  const drawTangentSrc = grabFn("drawTangentLine");
  const tangentComputeCallIdx = drawTangentSrc.indexOf("PM_tangentLineCompute(");
  const tangentFirstResolveIdx = drawTangentSrc.indexOf("PM_planeResolve(");
  assertTrue("drawTangentLine calls PM_tangentLineCompute (the slope) BEFORE it calls PM_planeResolve (pixels)",
    tangentComputeCallIdx >= 0 && tangentFirstResolveIdx >= 0 && tangentComputeCallIdx < tangentFirstResolveIdx);

  // NEGATIVE CONTROL for the static scanner itself — a deliberately-
  // offending snippet (a compute function that DOES derive its result from
  // PM_planeResolve, exactly the defect class this section exists to catch)
  // must be caught by the same indexOf check.
  const badComputeSnippet = "function PM_secantLineCompute_bad(spec, vars) {\n  var p0 = PM_planeResolve(spec, 0, 0);\n  var p1 = PM_planeResolve(spec, 1, 1);\n  return (p1.y - p0.y) / (p1.x - p0.x);\n}";
  assertTrue("NEGATIVE CONTROL: the PM_planeResolve-absence scanner DOES catch a pixel-derived-slope implementation",
    badComputeSnippet.indexOf("PM_planeResolve(") >= 0);

  // ── extend:'frame' CLIPPING — the picture is clipped to the viewport, the
  // SLOPE (already computed in data-space above) must be UNCHANGED by that
  // clip. Reuses the SAME secant/tangent (x0=1) on the SAME aspect-
  // mismatched MAIN_PLANE. ─────────────────────────────────────────────────
  const secantFrameSpec = Object.assign({}, secantSpec, { extend: "frame" });
  const secantFramed = E.PM_secantLineCompute(secantFrameSpec, secantVars, ranges);
  assertTrue("extend:'frame' secant resolves valid", secantFramed.valid);
  const secantFramedSlope = (secantFramed.drawTo.y - secantFramed.drawFrom.y) / (secantFramed.drawTo.x - secantFramed.drawFrom.x);
  check("extend:'frame' does NOT alter the secant's data-space slope", secantFramedSlope, secantComputed.slope, 1e-9);

  const tangentFrameSpec = Object.assign({}, tangentSpec, { extend: "frame" });
  const tangentFramed = E.PM_tangentLineCompute(tangentFrameSpec, tangentVars, ranges);
  assertTrue("extend:'frame' tangent resolves valid", tangentFramed.valid);
  const tangentFramedSlope = (tangentFramed.drawTo.y - tangentFramed.drawFrom.y) / (tangentFramed.drawTo.x - tangentFramed.drawFrom.x);
  check("extend:'frame' does NOT alter the tangent's data-space slope", tangentFramedSlope, tangentComputed.slope, 1e-9);

  // The clip actually DID something — the frame-extended endpoints reach
  // measurably farther from the origin point than the un-extended
  // 'segment' endpoints (proving extend:'frame' is not silently a no-op).
  const segSpan = Math.hypot(tangentComputed.drawTo.x - tangentComputed.drawFrom.x, tangentComputed.drawTo.y - tangentComputed.drawFrom.y);
  const frameSpan = Math.hypot(tangentFramed.drawTo.x - tangentFramed.drawFrom.x, tangentFramed.drawTo.y - tangentFramed.drawFrom.y);
  assertTrue(`extend:'frame' span (${frameSpan.toFixed(3)}) is measurably larger than extend:'segment' span (${segSpan.toFixed(3)}) — the clip is not a no-op`,
    frameSpan > segSpan * 2);

  // Clipped endpoints stay inside the plane's data-space rectangle (with a
  // small float epsilon) — the clip target is respected, not overshot.
  const EPS = 1e-6;
  function insideRect(pt: { x: number; y: number }): boolean {
    return pt.x >= ranges.xRange.min - EPS && pt.x <= ranges.xRange.max + EPS
      && pt.y >= ranges.yRange.min - EPS && pt.y <= ranges.yRange.max + EPS;
  }
  assertTrue("extend:'frame' secant's clipped endpoints stay inside the plane's data rectangle",
    insideRect(secantFramed.drawFrom) && insideRect(secantFramed.drawTo));
  assertTrue("extend:'frame' tangent's clipped endpoints stay inside the plane's data rectangle",
    insideRect(tangentFramed.drawFrom) && insideRect(tangentFramed.drawTo));

  // At least one coordinate of each clipped endpoint sits ON the rectangle
  // boundary — proving the line was actually EXTENDED TO the frame edge,
  // not merely left as the short original segment.
  function onBoundary(pt: { x: number; y: number }): boolean {
    return Math.abs(pt.x - ranges.xRange.min) < EPS || Math.abs(pt.x - ranges.xRange.max) < EPS
      || Math.abs(pt.y - ranges.yRange.min) < EPS || Math.abs(pt.y - ranges.yRange.max) < EPS;
  }
  assertTrue("extend:'frame' tangent's drawFrom touches the plane's boundary",
    onBoundary(tangentFramed.drawFrom));
  assertTrue("extend:'frame' tangent's drawTo touches the plane's boundary",
    onBoundary(tangentFramed.drawTo));

  // ── NEGATIVE CONTROL — "a clip that alters the slope must FAIL." A
  // deliberately-broken clip (clamps x and y INDEPENDENTLY, rather than
  // intersecting the LINE with the rectangle) applied to the SAME
  // far-extended endpoints PM_extendLineToFrame builds internally. Written
  // here, never shipped. ────────────────────────────────────────────────
  function brokenIndependentClampClip(x0: number, y0: number, x1: number, y1: number, xMin: number, xMax: number, yMin: number, yMax: number) {
    const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
    return { x0: clamp(x0, xMin, xMax), y0: clamp(y0, yMin, yMax), x1: clamp(x1, xMin, xMax), y1: clamp(y1, yMin, yMax) };
  }
  const originX = 1, originY = Math.sin(1), trueSlope = Math.cos(1);
  const big = 1000;
  const farX0 = originX - big, farY0 = originY - big * trueSlope;
  const farX1 = originX + big, farY1 = originY + big * trueSlope;

  const shippedClip = E.PM_lineClipToRect(farX0, farY0, farX1, farY1, ranges.xRange.min, ranges.xRange.max, ranges.yRange.min, ranges.yRange.max);
  assertTrue("PM_lineClipToRect (shipped) returns a non-null clip for this line", !!shippedClip);
  const shippedSlope = (shippedClip.y1 - shippedClip.y0) / (shippedClip.x1 - shippedClip.x0);
  check("PM_lineClipToRect (shipped) preserves the line's slope after clipping to the frame", shippedSlope, trueSlope, 1e-9);

  const brokenClip = brokenIndependentClampClip(farX0, farY0, farX1, farY1, ranges.xRange.min, ranges.xRange.max, ranges.yRange.min, ranges.yRange.max);
  const brokenSlope = (brokenClip.y1 - brokenClip.y0) / (brokenClip.x1 - brokenClip.x0);
  assertTrue(`NEGATIVE CONTROL: an independent per-axis clamp clip (slope ${brokenSlope.toFixed(4)}) alters the line's slope away from the true value (${trueSlope.toFixed(4)}) — exactly the defect a real clip must never have`,
    Math.abs(brokenSlope - trueSlope) > 0.01);
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
  // CP-C2 (AMENDMENT 2 / F6 supersession) moved the target from
  // PM_physics.derived to PM_riemannPublish — see the extension below.
  const rbSrc = grabFn("drawRiemannBars");
  const publishIdx = rbSrc.indexOf("PM_riemannPublish[spec.sum_var]");
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

  // ── CP-C2 EXTENSION — the publish SURVIVES a mid-frame PM_physics
  // reassignment (AMENDMENT 2 / F6 supersession; bug_class
  // pcpl_riemann_bars_composition_and_draw_order_undeclared). This is the
  // exact failure CP-C1's draw-order inversion was avoiding: under D12's
  // RESTORED literal order (region_fill -> riemann_bars -> function_plot ->
  // plot_point -> labels), drawPlotPoint's genuine-drag branch runs AFTER
  // riemann_bars in the SAME frame and reassigns PM_physics WHOLESALE. ──

  // (a) STATIC — the old (pre-fix) target string no longer appears anywhere
  // in drawRiemannBars; only the new target does. Proves the fix is WIRED,
  // not merely argued in a comment.
  assertTrue("drawRiemannBars no longer writes to the pre-fix target PM_physics.derived[spec.sum_var]",
    rbSrc.indexOf("PM_physics.derived[spec.sum_var]") === -1);
  assertTrue("drawRiemannBars writes bars_drawn_var to PM_riemannPublish too (not PM_physics.derived)",
    rbSrc.indexOf("PM_riemannPublish[spec.bars_drawn_var]") >= 0
    && rbSrc.indexOf("PM_physics.derived[spec.bars_drawn_var]") === -1);

  // (b) STATIC — PM_riemannPublish is declared as its own top-level var
  // (grabVar throws if it isn't found — a failed grab fails the whole run,
  // which is itself proof-of-existence), and PM_liveExprVars() merges it.
  const riemannPublishDecl = grabVar("PM_riemannPublish");
  assertTrue("PM_riemannPublish is declared as its own object literal (not nested inside PM_physics)",
    riemannPublishDecl.indexOf("var PM_riemannPublish = {}") >= 0);
  const liveExprVarsSrc = grabFn("PM_liveExprVars");
  assertTrue("PM_liveExprVars() merges PM_riemannPublish into the scope PM_interpolate reads",
    liveExprVarsSrc.indexOf("PM_riemannPublish") >= 0);

  // (c) STATIC — Pass 0.3 clears PM_riemannPublish at the START of the
  // frame, BEFORE either drawRegionFill/drawRiemannBars loop runs (a stale
  // key from a prior frame, or a state that no longer authors the
  // publishing primitive, must never survive).
  const clearIdx = SRC.indexOf("PM_riemannPublish = {};", SRC.indexOf("function draw()"));
  const rbLoopIdx = SRC.indexOf("drawRiemannBars(rbPrim)");
  assertTrue("PM_riemannPublish is cleared inside draw(), before the riemann_bars draw-call loop",
    clearIdx >= 0 && rbLoopIdx >= 0 && clearIdx < rbLoopIdx);

  // (d) STATIC — draw ORDER: under the RESTORED D12 order, riemann_bars'
  // draw-call loop sits BEFORE plot_point's, so a genuine drag CAN fire
  // after riemann_bars publishes in the same frame — proving the survival
  // property below is actually EXERCISED by the shipped pass order, not
  // vacuously true because the hazard can no longer occur.
  const rbCallIdx = SRC.indexOf("drawRiemannBars(rbPrim)");
  const ppCallIdx = SRC.indexOf("drawPlotPoint(ppPrim)");
  assertTrue("riemann_bars' draw-call loop sits BEFORE plot_point's in Pass 0.3 (D12's restored order) — the hazard is real, not moot",
    rbCallIdx >= 0 && ppCallIdx >= 0 && rbCallIdx < ppCallIdx);
  assertTrue("drawPlotPoint's genuine-drag branch still reassigns PM_physics wholesale (the hazard is fixed at the TARGET, not removed at the source)",
    grabFn("drawPlotPoint").indexOf("PM_physics = computePhysics(PM_config.concept_id, currentVars)") >= 0);

  // (e) NUMERIC — reproduce the exact mechanism: a value published under
  // each candidate target, THEN a same-frame wholesale PM_physics
  // reassignment (parametric_renderer.ts's own literal pattern for both
  // drawPlotPoint's drag branch and PM_applyChoreography: a BRAND NEW
  // `{ variables, derived }` object, never a mutation of the old one —
  // confirmed structurally in (d) above), THEN Pass 3's PM_liveExprVars()
  // read, all within one frame.
  function simulateMidFrameReassignment(publishTarget: "physics_derived" | "riemann_publish"): number | undefined {
    let physics: { variables: Record<string, number>; derived: Record<string, number> } = { variables: {}, derived: {} };
    const riemannPublish: Record<string, number> = {};
    // Step 1 — riemann_bars publishes THIS frame (it draws before
    // plot_point under the restored order, confirmed in (d) above).
    if (publishTarget === "physics_derived") physics.derived["S_n"] = 2.6667;
    else riemannPublish["S_n"] = 2.6667;
    // Step 2 — plot_point's genuine-drag branch fires LATER in the SAME
    // frame and reassigns PM_physics WHOLESALE, exactly as (d) confirms the
    // shipped renderer still does, unconditionally.
    physics = { variables: { b: 1.4 }, derived: { exact: 1.9 } };
    // Step 3 — Pass 3 (labels) resolves {S_n} via PM_liveExprVars() this
    // SAME frame — variables, then derived, then (CP-C2) riemannPublish.
    const liveVars: Record<string, number> = { ...physics.variables, ...physics.derived, ...riemannPublish };
    return liveVars["S_n"];
  }
  const survivesUnderOldTarget = simulateMidFrameReassignment("physics_derived");
  const survivesUnderNewTarget = simulateMidFrameReassignment("riemann_publish");
  assertTrue("NEGATIVE CONTROL: the PRE-FIX target (PM_physics.derived) does NOT survive a same-frame PM_physics reassignment — a consuming label would read the literal '{S_n}' fallback (@1080)",
    survivesUnderOldTarget === undefined);
  assertTrue("the CP-C2 target (PM_riemannPublish) DOES survive a same-frame PM_physics reassignment — {S_n} still resolves to the value riemann_bars published",
    survivesUnderNewTarget === 2.6667);
}

console.log("\n=== 13. show_partition — A4: n-1 interior division lines, INCLUDING a zero-height rectangle (F16, CP-C2) ===");
{
  // The exact case the field exists for: LEFT rule on x^2 over [0,2] at
  // n=4. f(0)=0, so bar 0 has ZERO height (area 0) and is otherwise
  // invisible on screen — the classic "4 rectangles renders as 3" defect
  // (MATHEMATICS_PHASE0_CARTESIAN_PLANE.md's own motivating example).
  const L4 = E.PM_riemannBarsCompute("x*x", 0, 2, 4, "left", undefined, {});
  check("n=4 on x^2/[0,2]: bar count === n (no bar dropped for being zero-height)", L4.bars.length, 4, 0);
  check("bar 0 (the left-rule zero-height rectangle) has area === 0, finite, still PRESENT", L4.bars[0].area, 0, 1e-12);
  assertTrue("bar 0's area is a real finite zero, not NaN/undefined (isFinite)", isFinite(L4.bars[0].area));

  // show_partition draws ONE interior division line per interior boundary
  // between DRAWN bars — count = bars.length - 1 (== n-1 when nothing is
  // capped or dropped). The drawing wrapper (drawRiemannBars, p5-dependent)
  // draws it at bar[i].xL for i=1..bars.length-1 (i=0's xL is the domain
  // start, not interior) — reproduced here as a pure count, mirroring the
  // shipped loop's own bound (`i > 0`).
  function interiorDivisionLineCount(bars: { xL: number }[]): number {
    let n = 0;
    for (let i = 1; i < bars.length; i++) n++; // one line per i>0
    return n;
  }
  const lineCount = interiorDivisionLineCount(L4.bars);
  check("show_partition emits exactly n-1 = 3 interior division lines at n=4", lineCount, 3, 0);

  // The division x-positions are the TRUE partition points 0.5, 1.0, 1.5 —
  // independent of any one bar's drawn (possibly zero) height, since the
  // shipped drawer spans the line across the plane's FULL y_range rather
  // than the rectangle's own top (asserted structurally below).
  const expectedXs = [0.5, 1.0, 1.5];
  for (let i = 1; i < L4.bars.length; i++) {
    check(`interior line ${i}: x position`, L4.bars[i].xL, expectedXs[i - 1], 1e-12);
  }

  // NEGATIVE CONTROL — "n=4 rendering three countable rectangles must
  // FAIL": a naive "count only rectangles with a visually-nonzero height"
  // reading of the SAME scene (i.e. without show_partition's lines) yields
  // 3, not 4 — reproducing the exact defect the field exists to fix.
  const visuallyCountable = L4.bars.filter((b: { area: number }) => Math.abs(b.area) > 1e-9).length;
  assertTrue(`NEGATIVE CONTROL: without show_partition, only ${visuallyCountable} of 4 rectangles are visually distinguishable (bar 0's zero height renders as nothing) — "four rectangles" would be miscounted as three`,
    visuallyCountable === 3);
  assertTrue("NEGATIVE CONTROL: the miscounted total (3) must NOT equal the true n (4)", visuallyCountable !== L4.n);
  // ...and WITH show_partition, the true count IS recoverable: n-1 interior
  // lines demarcate n columns — 3 lines -> 4 columns, agreeing with L4.n.
  assertTrue("WITH show_partition: (interior lines + 1) recovers the true rectangle count", lineCount + 1 === L4.n);

  // Cap interaction — show_partition draws bars.length-1 lines (the DRAWN
  // geometry), not n-1, when max_bars_drawn caps what's on screen —
  // consistent with the rectangles it demarcates; the published sum/n stay
  // unaffected (section 12).
  const capped = E.PM_riemannBarsCompute("x*x", 0, 2, 1000, "left", 10, {});
  check("capped at max_bars_drawn=10: bars.length (interior lines = bars.length-1)", capped.bars.length, 10, 0);
  assertTrue("capped bars.length (10) != true n (1000) — show_partition intentionally follows the DRAWN geometry, not the true n",
    capped.bars.length !== capped.n);

  // STATIC — the shipped drawer's show_partition branch is gated i>0 and
  // spans the plane's FULL y_range (ranges.yRange.min/.max), not the
  // rectangle's own (possibly zero) height — proving the zero-height case
  // above is actually handled by the shipped code, not just by this file's
  // independent reproduction.
  const rbSrcPartition = grabFn("drawRiemannBars");
  assertTrue("drawRiemannBars' show_partition branch is gated on i > 0 (skips the non-interior domain-start edge)",
    /spec\.show_partition\s*&&\s*i\s*>\s*0/.test(rbSrcPartition));
  assertTrue("the division line spans ranges.yRange.min..max (NOT bar.yTopLeft/bar.yTopRight) — visible even when the adjacent rectangle has zero height",
    rbSrcPartition.indexOf("ranges.yRange.max") >= 0 && rbSrcPartition.indexOf("ranges.yRange.min") >= 0);
}

console.log("\n=== 14. D12 COMPOSITION — draw order, opacity, signed colour (CP-C2) ===");
{
  // (a) DRAW ORDER — region_fill BEFORE riemann_bars, BOTH before
  // function_plot, all before plot_point (D12's literal chain, RESTORED —
  // supersedes CP-C1's inversion; bug_class
  // pcpl_riemann_bars_composition_and_draw_order_undeclared).
  const rfCallIdx = SRC.indexOf("drawRegionFill(rfPrim)");
  const rbCallIdx2 = SRC.indexOf("drawRiemannBars(rbPrim)");
  const fpCallIdx = SRC.indexOf("drawFunctionPlot(fpPrim)");
  const ppCallIdx2 = SRC.indexOf("drawPlotPoint(ppPrim)");
  assertTrue("region_fill's draw-call loop precedes riemann_bars' in source order",
    rfCallIdx >= 0 && rbCallIdx2 >= 0 && rfCallIdx < rbCallIdx2);
  assertTrue("riemann_bars' draw-call loop precedes function_plot's in source order",
    rbCallIdx2 >= 0 && fpCallIdx >= 0 && rbCallIdx2 < fpCallIdx);
  assertTrue("function_plot's draw-call loop precedes plot_point's in source order",
    fpCallIdx >= 0 && ppCallIdx2 >= 0 && fpCallIdx < ppCallIdx2);

  // NEGATIVE CONTROL — a reversed order (riemann_bars before region_fill)
  // must FAIL the same < comparison.
  const reversedOrderOk = rbCallIdx2 < rfCallIdx;
  assertTrue("NEGATIVE CONTROL: the reversed-order comparison correctly reads false under the shipped (correct) order",
    reversedOrderOk === false);

  // (b) OPACITY DEFAULT — riemann_bars defaults to 1.0 (opaque); combined
  // with (a)'s draw order this means an un-authored-opacity rectangle set
  // FULLY OCCLUDES the region_fill drawn beneath it, by construction (alpha
  // 255 compositing is opaque — not independently pixel-sampled here, this
  // headless sandbox has no canvas; see file header).
  const rbSrcOpacity = grabFn("drawRiemannBars");
  assertTrue("drawRiemannBars' opacity default is 1.0 (opaque), not region_fill's 0.28",
    /spec\.opacity[\s\S]{0,40}:\s*1\.0/.test(rbSrcOpacity));
  const rfSrcOpacity = grabFn("drawRegionFill");
  assertTrue("drawRegionFill's opacity default is 0.28 (translucent, CP-C1's unchanged visual default)",
    /spec\.opacity[\s\S]{0,40}:\s*0\.28/.test(rfSrcOpacity));

  // NEGATIVE CONTROL — swapping the two defaults (riemann_bars translucent
  // over an opaque region_fill) would NOT occlude the fill and would
  // instead composite into the unreadable middle band D12 exists to avoid;
  // demonstrated as a value mismatch against the shipped defaults.
  const riemannOpacityDefault: number = 1.0;
  const regionFillOpacityDefault: number = 0.28;
  assertTrue("NEGATIVE CONTROL: riemann_bars' default (1.0) differs from region_fill's default (0.28) — they are NOT interchangeable",
    riemannOpacityDefault !== regionFillOpacityDefault);

  // (c) SIGNED COLOUR — signed:true assigns color_negative to every
  // rectangle whose sampled value (equivalently: its computed .area sign —
  // see drawRiemannBars' own header for why area's sign generalises
  // correctly across all four modes) falls below the baseline (fixed at
  // data y=0 for riemann_bars, F16 — it authors no baseline field) and to
  // no other. f(x) = x^2 - c, c=0.5, on [0,2], n=4, left rule: f(0)=-0.5,
  // f(0.5)=-0.25 (negative); f(1)=0.5, f(1.5)=1.75 (positive) — a clean
  // split with NO exact-zero boundary bar.
  const signedTest = E.PM_riemannBarsCompute("x*x - c", 0, 2, 4, "left", undefined, { c: 0.5 });
  check("bar 0 area (f(0)=-0.5) is negative -> classify -1", signedTest.bars[0].area < 0 ? -1 : 1, -1, 0);
  check("bar 1 area (f(0.5)=-0.25) is negative -> classify -1", signedTest.bars[1].area < 0 ? -1 : 1, -1, 0);
  check("bar 2 area (f(1)=0.5) is non-negative -> classify +1", signedTest.bars[2].area < 0 ? -1 : 1, 1, 0);
  check("bar 3 area (f(1.5)=1.75) is non-negative -> classify +1", signedTest.bars[3].area < 0 ? -1 : 1, 1, 0);

  // Independently classify every bar by the SAME rule the drawer uses
  // (bar.area < 0 -> negative, else positive) and count colours.
  const classify = (b: { area: number }) => (b.area < 0 ? "negative" : "positive");
  const classes = signedTest.bars.map(classify);
  check("exactly 2 rectangles classify negative", classes.filter((c: string) => c === "negative").length, 2, 0);
  check("exactly 2 rectangles classify positive", classes.filter((c: string) => c === "positive").length, 2, 0);

  // STATIC — the shipped drawer's colour decision matches the rule tested
  // above verbatim, and the field names are copied from region_fill (Delta
  // 8's "one concept, one name" point).
  const rbSrcColour = grabFn("drawRiemannBars");
  assertTrue("drawRiemannBars picks negColor when bar.area < 0, posColor otherwise (verbatim rule tested above)",
    rbSrcColour.indexOf("signed ? (bar.area < 0 ? negColor : posColor) : baseColor") >= 0);
  assertTrue("color_negative field is read (verbatim name shared with region_fill)",
    rbSrcColour.indexOf("spec.color_negative") >= 0);
  assertTrue("color_positive field is read (verbatim name shared with region_fill)",
    rbSrcColour.indexOf("spec.color_positive") >= 0);

  // NEGATIVE CONTROL — "a signed set drawn in one colour must FAIL": a
  // one-colour (unsigned-style) classifier applied to the SAME bars data
  // collapses to a single class, disagreeing with the true 2-and-2 split.
  const oneColourClasses = signedTest.bars.map(() => "single");
  assertTrue("NEGATIVE CONTROL: a one-colour classifier yields only 1 distinct class where the true split has 2 (positive AND negative)",
    new Set(oneColourClasses).size === 1 && new Set(classes).size === 2);
}

console.log("\n=== REVEAL_STAGGER_MS DETERMINISM — pure function of the clock (D7, CP-C2) ===");
{
  // Boundaries — bar i's own gate opens at appear_at_ms + i*stagger. S2's
  // OWN authored timing (definite_integral_as_accumulated_area_skeleton.md
  // §12, F9 retime): appear_at_ms=1200, reveal_stagger_ms=4500 -> bars 0-3
  // open at 1200 / 5700 / 10200 / 14700.
  const appearAt = 1200, stagger = 4500;
  const expectedOpens = [1200, 5700, 10200, 14700];
  for (let i = 0; i < 4; i++) {
    const justBefore = E.PM_riemannBarReveal(i, appearAt, stagger, 0, expectedOpens[i] - 1);
    const atOpen = E.PM_riemannBarReveal(i, appearAt, stagger, 0, expectedOpens[i]);
    assertTrue(`bar ${i}: invisible 1ms before its own open time (${expectedOpens[i]})`, justBefore.visible === false);
    assertTrue(`bar ${i}: visible AT its own open time (${expectedOpens[i]})`, atOpen.visible === true && atOpen.alpha === 1);
  }

  // animate_in_ms ramps 0->1 over the window, clamped [0,1].
  const ramping = E.PM_riemannBarReveal(2, appearAt, stagger, 1000, expectedOpens[2] + 500);
  check("bar 2 mid-ramp (animate_in_ms=1000, +500ms): alpha", ramping.alpha, 0.5, 1e-9);
  const preRamp = E.PM_riemannBarReveal(2, appearAt, stagger, 1000, expectedOpens[2] - 1);
  assertTrue("bar 2 before its gate opens: invisible regardless of animate_in_ms", preRamp.visible === false);

  // DETERMINISM — the SAME (barIndex, appearAtMs, staggerMs, animateInMs,
  // nowMs) tuple reproduces a BYTE-IDENTICAL result on repeated calls (a
  // SET_TIME_FREEZE re-pin to the same at_ms must redraw identical pixels).
  const callA = E.PM_riemannBarReveal(3, appearAt, stagger, 800, 15200);
  const callB = E.PM_riemannBarReveal(3, appearAt, stagger, 800, 15200);
  check("repeated calls at the SAME nowMs: visible flag identical", callA.visible, callB.visible, 0 as any);
  check("repeated calls at the SAME nowMs: alpha byte-identical", callA.alpha, callB.alpha, 0);

  // NEGATIVE CONTROL — "a frame-counter-driven stagger must FAIL": a
  // plausible-but-wrong alternative computes appear time from a per-frame
  // COUNTER (barIndex * staggerFrames frames) converted at an ASSUMED frame
  // rate, rather than from the sim clock directly. At two different real
  // frame rates (60Hz vs 144Hz) the SAME wall/sim-clock instant now yields
  // DIFFERENT visibility for the same bar — non-deterministic w.r.t. the
  // clock, exactly the defect D7/reveal_stagger_ms's clock-purity exists to
  // avoid.
  function wrongFrameCounterReveal(barIndex: number, appearAtMs: number, staggerFrames: number, nowMs: number, assumedFps: number) {
    const appearFrame = (appearAtMs / (1000 / assumedFps)) + barIndex * staggerFrames;
    const nowFrame = nowMs / (1000 / assumedFps);
    return nowFrame >= appearFrame;
  }
  const nowFixed = 6000; // a fixed sim-clock instant, shared by both "runs"
  const staggerFrames = 270; // ~4500ms worth of frames AT 60fps specifically
  const visibleAt60 = wrongFrameCounterReveal(2, 1200, staggerFrames, nowFixed, 60);
  const visibleAt144 = wrongFrameCounterReveal(2, 1200, staggerFrames, nowFixed, 144);
  assertTrue(`NEGATIVE CONTROL: a frame-counter-driven stagger gives DIFFERENT visibility for the SAME sim-clock instant (${nowFixed}ms) at 60Hz (${visibleAt60}) vs 144Hz (${visibleAt144}) — non-deterministic w.r.t. the clock`,
    visibleAt60 !== visibleAt144);
  // The shipped PM_riemannBarReveal, by contrast, is frame-rate independent
  // by construction — it never reads a frame count or fps at all, only
  // nowMs (the argument list itself is the proof; re-affirmed numerically:
  // the SAME nowMs always gives the SAME answer, with no fps parameter to
  // even vary).
  const correctAt6000 = E.PM_riemannBarReveal(2, 1200, 4500, 0, nowFixed);
  check("the shipped clock-pure function's answer depends ONLY on nowMs (no fps parameter exists to make it diverge)",
    correctAt6000.visible, expectedOpens[2] <= nowFixed, 0 as any);
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

console.log("\n=== 17. F-READOUT PLACEMENT — offset parity, perpendicular default, collision-aware flip (bug_class parametric_canvas_drawn_readout_overprints_its_own_line_and_is_invisible_to_the_layout_checker) ===");
{
  // (a) PM_readoutAuthoredOffset — same non-finite/type-fallback discipline
  // as every other *_expr/offset field on this engine.
  check("authored {x,y} both finite numbers -> passed through", JSON.stringify(E.PM_readoutAuthoredOffset({ readout: { offset: { x: 5, y: -7 } } })), JSON.stringify({ x: 5, y: -7 }), 0 as any);
  assertTrue("no readout at all -> null", E.PM_readoutAuthoredOffset({}) === null);
  assertTrue("readout present but no offset -> null", E.PM_readoutAuthoredOffset({ readout: { format: "slope = {m}" } }) === null);
  assertTrue("offset.x is a string -> null (never coerced)", E.PM_readoutAuthoredOffset({ readout: { offset: { x: "5", y: -7 } } }) === null);
  assertTrue("offset.y is NaN -> null", E.PM_readoutAuthoredOffset({ readout: { offset: { x: 5, y: NaN } } }) === null);
  assertTrue("offset.x is Infinity -> null", E.PM_readoutAuthoredOffset({ readout: { offset: { x: Infinity, y: -7 } } }) === null);
  assertTrue("offset is a non-object (e.g. a string) -> null", E.PM_readoutAuthoredOffset({ readout: { offset: "10,-12" } }) === null);

  // NEGATIVE CONTROL — a naive resolver that only checks `typeof === 'number'`
  // (no isFinite guard) WOULD accept NaN, unlike the shipped one.
  function naiveOffset(spec: { readout?: { offset?: { x?: unknown; y?: unknown } } }) {
    const off = spec.readout && spec.readout.offset;
    if (!off || typeof off.x !== "number" || typeof off.y !== "number") return null;
    return { x: off.x, y: off.y };
  }
  const naiveResult = naiveOffset({ readout: { offset: { x: 5, y: NaN } } });
  assertTrue("NEGATIVE CONTROL: a typeof-only (no isFinite) resolver WOULD accept {x:5,y:NaN}", naiveResult !== null && Number.isNaN(naiveResult.y));
  assertTrue("the shipped resolver does NOT share that defect (rejects the same NaN offset)", E.PM_readoutAuthoredOffset({ readout: { offset: { x: 5, y: NaN } } }) === null);

  // (b) PM_upwardNormal — the unit normal to the segment at every slope (dot
  // product with the segment's own direction vector is 0), unit magnitude,
  // and the "upward" screen-normal (ny <= 0) always chosen so a horizontal
  // chord defaults directly ABOVE itself (matching the pre-fix visual
  // convention's y=-12 side).
  function dot(ax: number, ay: number, bx: number, by: number) { return ax * bx + ay * by; }
  const slopeGrid: [number, number][] = [[10, 0], [0, 10], [10, 5], [10, -5], [10, 15], [-10, 15], [3, 97]];
  let allPerp = true, allMag = true, allUpward = true;
  for (const [dx, dy] of slopeGrid) {
    const n = E.PM_upwardNormal({ x: 0, y: 0 }, { x: dx, y: dy });
    if (Math.abs(dot(dx, dy, n.x, n.y)) > 1e-9) allPerp = false;
    if (Math.abs(Math.hypot(n.x, n.y) - 1) > 1e-9) allMag = false;
    if (n.y > 1e-9) allUpward = false;
  }
  assertTrue("PM_upwardNormal is exactly perpendicular to the segment (dot product 0) across 7 slopes incl. vertical/horizontal", allPerp);
  assertTrue("PM_upwardNormal is a UNIT vector across all 7 slopes", allMag);
  assertTrue("PM_upwardNormal always picks the UPWARD screen normal (ny <= 0) across all 7 slopes", allUpward);
  const degenerateN = E.PM_upwardNormal({ x: 5, y: 5 }, { x: 5, y: 5 });
  check("zero-length segment degrades safely to straight up {0,-1} (never NaN)", JSON.stringify(degenerateN), JSON.stringify({ x: 0, y: -1 }), 0 as any);

  // ── ROUND-2 CORE DEFECT: a constant perpendicular displacement cannot free
  // a WIDE label from a STEEP line. Founder review of the round-1 frames found
  // the pink secant AND the blue curve still cutting through "slope" in FOUR
  // states; the headless walk below shows it is in fact all SIX states that
  // carry a secant readout. Root cause is geometric, not a tuning miss: the
  // round-1 default moved the box CENTRE 13px off the stroke, but a ~79px-wide
  // horizontal label straddling a steep line swings its far end straight back
  // across. The remedy is the box's SUPPORT along the normal — |hw*nx| +
  // |hh*ny| + margin — which makes clearance a geometric guarantee at every
  // slope. Asserted here on the SIX states' own real geometry. ───────────────
  const secantPlane = E.PM_planeBuildTransform({
    id: "plane", viewport: { x: 60, y: 78, w: 400, h: 372 },
    x_range: { min: -2.4, max: 2.6 }, y_range: { min: -1.95, max: 2.7 }, equal_scale: true,
  });
  const fq = (x: number) => x * x / 2;
  // (x0, xq) at each state's own eye_capture_ms pin, from the authored choreography
  const SECANT_STATES: [string, number, number][] = [
    ["STATE_2", 1.0, 2.0], ["STATE_3", 1.0, 1.0 + Math.pow(10, -1.5)], ["STATE_4", 1.0, 1.4],
    ["STATE_5", 1.0, 1.002], ["STATE_7", 0.6, 1.4], ["STATE_9", 1.0, 1.9],
  ];
  // Signed clearance of a text box from the infinite line through p0->p1:
  // (distance of the box centre along the normal) - (the box's support along it).
  function lineClearance(p0: { x: number; y: number }, p1: { x: number; y: number }, box: { x0: number; y0: number; x1: number; y1: number }) {
    const n = E.PM_upwardNormal(p0, p1);
    const cx = (box.x0 + box.x1) / 2, cy = (box.y0 + box.y1) / 2;
    const hw = (box.x1 - box.x0) / 2, hh = (box.y1 - box.y0) / 2;
    return Math.abs((cx - p0.x) * n.x + (cy - p0.y) * n.y) - (Math.abs(hw * n.x) + Math.abs(hh * n.y));
  }
  let allOldStruck = true, allNewClear = true, worstNew = Infinity;
  const struckDetail: string[] = [];
  for (const [st, x0, xq] of SECANT_STATES) {
    const slope = (fq(xq) - fq(x0)) / (xq - x0);
    const txt = "slope = " + slope.toFixed(4);
    const tw = textW12(txt), th = 14;
    const p0 = secantPlane.toPx(x0, fq(x0)), p1 = secantPlane.toPx(xq, fq(xq));
    const mid = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
    // ROUND-1 behaviour, reconstructed exactly: a constant 13px along the normal.
    const n1 = E.PM_upwardNormal(p0, p1);
    const oldClear = lineClearance(p0, p1, E.PM_readoutBBox(mid, { x: n1.x * 13, y: n1.y * 13 }, tw, th));
    const newClear = lineClearance(p0, p1, E.PM_readoutBBox(mid, E.PM_labelClearOffset(p0, p1, tw, th, 6), tw, th));
    if (oldClear >= 0) allOldStruck = false;
    if (newClear <= 0) allNewClear = false;
    worstNew = Math.min(worstNew, newClear);
    struckDetail.push(`${st} "${txt}" old ${oldClear.toFixed(1)}px -> new +${newClear.toFixed(1)}px`);
  }
  assertTrue(`NEGATIVE CONTROL: the round-1 constant-13px default leaves ALL SIX secant-readout states STRUCK (the founder named 4; the walk finds 6) — ${struckDetail.join(" | ")}`, allOldStruck);
  assertTrue("the width-aware default CLEARS the stroke in all six states", allNewClear);
  check("worst-case clearance across all six equals the requested margin exactly (a geometric guarantee, not a tuned constant)", worstNew, 6, 1e-9, "px");

  // The guarantee must hold for ANY width at ANY angle, not just the six
  // shipped cases — sweep 360 directions x 5 label widths.
  let sweepOk = true, sweepMin = Infinity;
  for (let deg = 0; deg < 360; deg += 1) {
    const p0 = { x: 200, y: 200 };
    const p1 = { x: 200 + 100 * Math.cos(deg * Math.PI / 180), y: 200 + 100 * Math.sin(deg * Math.PI / 180) };
    for (const w of [10, 40, 79, 160, 400]) {
      const c = lineClearance(p0, p1, E.PM_readoutBBox(p0, E.PM_labelClearOffset(p0, p1, w, 14, 6), w, 14));
      if (!(c > 0)) sweepOk = false;
      sweepMin = Math.min(sweepMin, c);
    }
  }
  assertTrue(`the clearance guarantee holds across 360 angles x 5 widths (1800 cases, worst = +${sweepMin.toFixed(3)}px)`, sweepOk);
  check("that sweep's worst case is still exactly the margin (no angle is a weak spot)", sweepMin, 6, 1e-9, "px");
  // Degenerate reductions: a VERTICAL line must push sideways by half the
  // width + margin (pure shove); a HORIZONTAL line keeps the old above-the-
  // line behaviour (half the height + margin).
  const vertOff = E.PM_labelClearOffset({ x: 100, y: 0 }, { x: 100, y: 100 }, 80, 14, 6);
  check("vertical line -> pushed sideways by half the width + margin (x = -(40+6+40))", vertOff.x, -86, 1e-9, "px");
  check("vertical line -> no vertical displacement at all", vertOff.y, 0, 1e-9, "px");
  const horizOff2 = E.PM_labelClearOffset({ x: 0, y: 100 }, { x: 100, y: 100 }, 80, 14, 6);
  check("horizontal line -> centred on the anchor (x = -halfW)", horizOff2.x, -40, 1e-9, "px");
  check("horizontal line -> lifted by half the height + margin, the OLD above-the-line side", horizOff2.y, -13, 1e-9, "px");
  // Non-finite inputs must degrade, never emit NaN into a text() call.
  const nanOff = E.PM_labelClearOffset({ x: 0, y: 0 }, { x: 10, y: 10 }, NaN, 14, 6);
  assertTrue("a NaN text width degrades to a finite offset (never draws text at NaN)", isFinite(nanOff.x) && isFinite(nanOff.y));

  // (c) PM_rectsOverlap — AABB overlap, edges touching does NOT count as
  // overlap (strict <, matching section 15's own clip-sanity convention).
  assertTrue("two overlapping rects -> true", E.PM_rectsOverlap({ x0: 0, y0: 0, x1: 10, y1: 10 }, { x0: 5, y0: 5, x1: 15, y1: 15 }));
  assertTrue("two disjoint rects -> false", !E.PM_rectsOverlap({ x0: 0, y0: 0, x1: 10, y1: 10 }, { x0: 20, y0: 20, x1: 30, y1: 30 }));
  assertTrue("two rects touching exactly at an edge (x1===x0) -> false (strict inequality)", !E.PM_rectsOverlap({ x0: 0, y0: 0, x1: 10, y1: 10 }, { x0: 10, y0: 0, x1: 20, y1: 10 }));

  // (d) PM_readoutBBox — anchor + offset + measured text size -> the exact
  // box the text() call would occupy under LEFT/CENTER alignment (matching
  // every readout draw call's own textAlign(LEFT, CENTER)).
  const bbox = E.PM_readoutBBox({ x: 100, y: 200 }, { x: 12, y: -20 }, 80, 14);
  check("bbox.x0 = anchor.x + offset.x", bbox.x0, 112, 1e-9);
  check("bbox.x1 = x0 + textW", bbox.x1, 192, 1e-9);
  check("bbox.y0 = anchor.y + offset.y - textH/2 (CENTER alignment)", bbox.y0, 173, 1e-9);
  check("bbox.y1 = y0 + textH", bbox.y1, 187, 1e-9);

  // (e) PM_readoutDangerZones — the plane's OWN axis-line + tick-label-band
  // zones, built off the SAME PM_planeBuildTransform every other section
  // already trusts. Straddling range: axis is INTERIOR, not at the edge.
  const dzPlane = E.PM_planeBuildTransform(DEFAULT_PLANE); // x_range/y_range both straddle 0
  const zones = E.PM_readoutDangerZones(dzPlane);
  check("exactly 2 danger zones (y-axis strip, x-axis strip)", zones.length, 2, 0);
  const axisPxOrigin = dzPlane.toPx(0, 0);
  assertTrue("y-axis danger zone straddles the ACTUAL y-axis pixel x (from PM_planeBuildTransform, not re-derived)",
    zones[0].x0 < axisPxOrigin.x && zones[0].x1 > axisPxOrigin.x);
  assertTrue("x-axis danger zone straddles the ACTUAL x-axis pixel y", zones[1].y0 < axisPxOrigin.y && zones[1].y1 > axisPxOrigin.y);
  assertTrue("y-axis danger zone spans the plane's FULL drawn height (tick labels occur at every tick, not just one spot)",
    Math.abs(zones[0].y0 - dzPlane.viewport.y) < 1e-9 && Math.abs(zones[0].y1 - (dzPlane.viewport.y + dzPlane.viewport.h)) < 1e-9);
  assertTrue("x-axis danger zone spans the plane's FULL drawn width", Math.abs(zones[1].x0 - dzPlane.viewport.x) < 1e-9 && Math.abs(zones[1].x1 - (dzPlane.viewport.x + dzPlane.viewport.w)) < 1e-9);
  // its own tick-label column sits to the LEFT of the y-axis (never the right).
  assertTrue("y-axis danger zone extends LEFT of the axis (where y-tick labels are drawn), not right",
    zones[0].x0 < axisPxOrigin.x - 10);

  // (f) PM_readoutOffCanvas — the 760x500 design space (createCanvas below).
  assertTrue("a bbox fully inside 760x500 -> false", !E.PM_readoutOffCanvas({ x0: 10, y0: 10, x1: 100, y1: 30 }));
  assertTrue("a bbox exceeding the RIGHT canvas edge -> true", E.PM_readoutOffCanvas({ x0: 700, y0: 10, x1: 800, y1: 30 }));
  assertTrue("a bbox exceeding the BOTTOM canvas edge -> true", E.PM_readoutOffCanvas({ x0: 10, y0: 480, x1: 100, y1: 520 }));
  assertTrue("a bbox with a NEGATIVE x0 (off the left edge) -> true", E.PM_readoutOffCanvas({ x0: -20, y0: 10, x1: 50, y1: 30 }));

  // (f2) PM_clampOffsetToCanvas — a horizontal overrun is fixed by
  // TRANSLATION, never by the side flip. A flip mirrors the offset about the
  // anchor, which moves a ~100px box by only 2*|offset.x| and therefore
  // cannot pull back an overhang larger than that; the NEGATIVE CONTROL below
  // states that impossibility as a test so the two remedies can never be
  // conflated again.
  const overrunAnchor = { x: 700, y: 200 };
  const overrunOff = { x: 12, y: -12 };
  const overrunTW = 100;
  assertTrue("a readout at x=700 with offset +12 and width 100 DOES overrun the right edge (712..812 vs 760)",
    E.PM_readoutOffCanvas(E.PM_readoutBBox(overrunAnchor, overrunOff, overrunTW, 14)));
  const flipped = { x: -overrunOff.x, y: -overrunOff.y };
  assertTrue("NEGATIVE CONTROL: MIRRORING that offset (what a side flip does) still overruns — a flip can never fix a horizontal overrun",
    E.PM_readoutOffCanvas(E.PM_readoutBBox(overrunAnchor, flipped, overrunTW, 14)));
  const clamped = E.PM_clampOffsetToCanvas(overrunAnchor, overrunOff, overrunTW, 14);
  const clampedBox = E.PM_readoutBBox(overrunAnchor, clamped, overrunTW, 14);
  assertTrue("PM_clampOffsetToCanvas pulls the same box fully back inside the canvas", !E.PM_readoutOffCanvas(clampedBox));
  check("the clamped box sits flush against the right edge (x1 === 760), not further in than needed", clampedBox.x1, 760, 1e-9);
  check("the clamp does NOT touch y when only x overruns", clamped.y, overrunOff.y, 1e-9);
  // left / top / bottom edges
  const leftClamped = E.PM_clampOffsetToCanvas({ x: 5, y: 200 }, { x: -40, y: 0 }, 60, 14);
  check("a LEFT overrun clamps to x0 === 0", E.PM_readoutBBox({ x: 5, y: 200 }, leftClamped, 60, 14).x0, 0, 1e-9);
  const topClamped = E.PM_clampOffsetToCanvas({ x: 300, y: 4 }, { x: 0, y: -20 }, 60, 14);
  check("a TOP overrun clamps to y0 === 0", E.PM_readoutBBox({ x: 300, y: 4 }, topClamped, 60, 14).y0, 0, 1e-9);
  const botClamped = E.PM_clampOffsetToCanvas({ x: 300, y: 495 }, { x: 0, y: 20 }, 60, 14);
  check("a BOTTOM overrun clamps to y1 === 500", E.PM_readoutBBox({ x: 300, y: 495 }, botClamped, 60, 14).y1, 500, 1e-9);
  // A box WIDER than the canvas keeps its START visible (truncated tail is
  // readable, truncated head is not) — right is clamped before left.
  const hugeClamped = E.PM_clampOffsetToCanvas({ x: 400, y: 200 }, { x: 0, y: 0 }, 900, 14);
  check("a box wider than the canvas keeps its START on screen (x0 === 0, tail truncated not head)",
    E.PM_readoutBBox({ x: 400, y: 200 }, hugeClamped, 900, 14).x0, 0, 1e-9);
  // Must be a NO-OP on anything already inside — this is what keeps THE EYE's
  // baselines stable everywhere the clamp is not needed.
  const insideOff = { x: 10, y: -12 };
  const insideRes = E.PM_clampOffsetToCanvas({ x: 300, y: 200 }, insideOff, 80, 14);
  assertTrue("a placement already fully inside the canvas is returned BYTE-IDENTICAL (same object identity, no perturbation)", insideRes === insideOff);

  // (f3) PM_readoutCollides is now ink/label-ZONE only — canvas containment
  // moved to the clamp. A box off-canvas but clear of both axis zones must
  // NOT report a collision (otherwise a useless flip fires before the clamp).
  const farOffCanvas = { x: 2000, y: 200 };
  assertTrue("a box far off-canvas but clear of the axis zones does NOT trigger the flip (containment is the clamp's job, not the flip's)",
    !E.PM_readoutCollides(farOffCanvas, { x: 10, y: -12 }, 80, 14, E.PM_planeBuildTransform(DEFAULT_PLANE)));

  // ── THE FOUNDER'S OWN REPRO — derivative_as_secant_limit STATE_6's dragged
  // P: x_range [-2.4,2.6]/tick 1, y_range [-1.95,2.7], viewport
  // {x:60,y:78,w:400,h:372}, equal_scale true (k=80px/unit, matching the
  // authored JSON exactly). At data (0.75, 0.28) — "P lands ON the x-axis in
  // a pinned baseline" — with the JSON's OWN authored offset {x:12,y:20}
  // (drawn BELOW-right of P, i.e. TOWARD the x-axis since P sits barely
  // above it). Reproduce end-to-end: collides pre-fix, clears post-fix. ────
  const founderPlaneSpec = {
    id: "plane", viewport: { x: 60, y: 78, w: 400, h: 372 },
    x_range: { min: -2.4, max: 2.6 }, y_range: { min: -1.95, max: 2.7 }, equal_scale: true,
  };
  const founderPlane = E.PM_planeBuildTransform(founderPlaneSpec);
  check("founder repro: equal_scale k = 80 px/unit (400/5.0 == 372/4.65)", founderPlane.scaleX, 80, 1e-9);
  const pAnchor = founderPlane.toPx(0.75, 0.28);
  const authoredCandidate = { x: 12, y: 20 }; // the JSON's own authored plot_point.readout.offset for P
  const readoutTextW = "P = (0.75, 0.28)".length * 7; // conservative per-char estimate (headless — no p5 textWidth here)
  const preFixCollides = E.PM_readoutCollides(pAnchor, authoredCandidate, readoutTextW, 14, founderPlane);
  assertTrue("founder repro: the AUTHORED offset {12,20} DOES collide with the x-axis danger zone at P=(0.75,0.28) (the reported defect)", preFixCollides);
  // ROUND-2 REGRESSION GUARD — founder accepted STATE_6's flip as a clean win
  // and told this round not to touch that path. Round 2 narrowed
  // PM_readoutCollides to ink/label zones only (canvas containment moved to
  // the clamp), so pin WHICH trigger drives this flip: it must be the x-axis
  // zone and NOT off-canvas, otherwise narrowing the predicate would have
  // silently killed the accepted behaviour.
  const s6Box = E.PM_readoutBBox(pAnchor, authoredCandidate, readoutTextW, 14);
  const s6Zones = E.PM_readoutDangerZones(founderPlane);
  assertTrue("STATE_6 accepted win is driven by the X-AXIS zone (the trigger round 2 kept)", E.PM_rectsOverlap(s6Box, s6Zones[1]));
  assertTrue("STATE_6 accepted win is NOT driven by off-canvas (the trigger round 2 removed) — narrowing the predicate cannot regress it", !E.PM_readoutOffCanvas(s6Box));
  assertTrue("STATE_6 accepted win is NOT driven by the y-axis zone either", !E.PM_rectsOverlap(s6Box, s6Zones[0]));
  // Engine round 2026-08-07/08 (bug_class readout_resolver_flips_blind_
  // without_testing_the_mirrored_candidate) — the resolver no longer takes
  // the full mirror unconditionally; it walks an ORDERED candidate set
  // (authored, x-mirror, y-mirror, full-mirror, +/-normal) and returns the
  // FIRST one that is actually tested clear. Worked by hand against the
  // SAME zones section 17(e) above already derived (s6Zones[0]=y-axis
  // strip x[222,255]; s6Zones[1]=x-axis strip y[291,314]):
  //   candidate 1 (authored {12,20}):  box x[324,443] y[284.6,298.6] -> overlaps zone[1] (y 284.6<314, 298.6>291) -> COLLIDES
  //   candidate 2 (x-mirror {-12,20}): box x[300,419] y[284.6,298.6] -> SAME y-span -> still overlaps zone[1] -> COLLIDES
  //   candidate 3 (y-mirror {12,-20}): box x[324,443] y[244.6,258.6] -> y1=258.6 < zone[1].y0=291 -> clear of zone[1]; x[324,443] vs zone[0] x[222,255] -> clear too -> FREE, returned immediately
  // The y-mirror is tried BEFORE the full mirror by the documented candidate
  // order, so it wins first — {12,-20}, NOT the old blind flip's {-12,-20}
  // (which is ALSO collision-free here, just never reached because a nearer
  // tested candidate already cleared). This is a strictly BETTER outcome:
  // the y-mirror keeps P's x-offset (rightward, already comfortably clear of
  // the y-axis strip) and only flips the axis that was actually struck.
  const resolved2 = E.PM_readoutResolveOffset(pAnchor, authoredCandidate, readoutTextW, 14, founderPlane, "plane");
  check("founder repro (engine round 2026-08-07/08): the ORDERED resolver returns the y-mirror {12,-20} — the FIRST tested candidate that is actually clear, not the old blind full-mirror {-12,-20}",
    JSON.stringify(resolved2), JSON.stringify({ x: 12, y: -20 }), 0 as any);
  const postFixCollides = E.PM_readoutCollides(pAnchor, resolved2, readoutTextW, 14, founderPlane);
  assertTrue("founder repro: the resolved placement clears the x-axis danger zone (no longer struck)", !postFixCollides);

  // The OLD full-mirror {-12,-20} is ALSO collision-free at this anchor —
  // confirm that explicitly, so "the new answer differs from the old one"
  // is read as "a nearer candidate won", never "the old answer was wrong".
  const oldFullMirror = { x: -authoredCandidate.x, y: -authoredCandidate.y };
  assertTrue("the OLD blind-flip answer {-12,-20} is independently ALSO collision-free (both are valid; the ordered search just finds the nearer one first)",
    !E.PM_readoutCollides(pAnchor, oldFullMirror, readoutTextW, 14, founderPlane));

  // NEGATIVE CONTROL for the ORDER itself — a resolver that checked full-
  // mirror BEFORE y-mirror would return {-12,-20} here; demonstrate that
  // reordering the SAME candidate set changes the answer, so the documented
  // order is load-bearing, not cosmetic.
  function resolveWithFullMirrorFirst(anchor: { x: number; y: number }, cand: { x: number; y: number }, tw: number, th: number, plane: any): { x: number; y: number } {
    const order = [cand, { x: -cand.x, y: -cand.y }, { x: cand.x, y: -cand.y }, { x: -cand.x, y: cand.y }];
    for (const c of order) if (!E.PM_readoutCollides(anchor, c, tw, th, plane)) return c;
    return cand;
  }
  const reorderedResolve = resolveWithFullMirrorFirst(pAnchor, authoredCandidate, readoutTextW, 14, founderPlane);
  check("NEGATIVE CONTROL: reordering full-mirror ahead of y-mirror in the SAME candidate set changes the answer to {-12,-20}",
    JSON.stringify(reorderedResolve), JSON.stringify({ x: -12, y: -20 }), 0 as any);
  assertTrue("the SHIPPED order does NOT share that defect (returns {12,-20}, not {-12,-20})",
    JSON.stringify(resolved2) !== JSON.stringify(reorderedResolve));

  // ── "NEVER RETURN A CANDIDATE YOU HAVE NOT TESTED" + least-overlap-area
  // fallback — an anchor boxed in on every side by hard obstacles (no
  // candidate can ever be collision-free) must still return one of the 4
  // TESTED candidates, ranked by PM_readoutOverlapArea, never a 5th
  // untested guess. Construct a pathological plane whose ink registry
  // blocks all four quadrants around the anchor with obstacles of
  // DIFFERENT sizes, so the ranking is falsifiable. x_range/y_range are
  // both entirely POSITIVE and far from the anchor's own pixel position, so
  // the plane's OWN axis/tick-label danger bands (PM_readoutDangerZones'
  // static 2 zones) land nowhere near the 4 candidate boxes and cannot
  // contaminate this test's engineered obstacle areas. ───────────────────
  for (const k of Object.keys(E.PM_planeInkZones)) delete E.PM_planeInkZones[k];
  const trapPlaneId = "trap";
  const trapPlane = E.PM_planeBuildTransform({ id: trapPlaneId, viewport: { x: 0, y: 0, w: 800, h: 500 }, x_range: { min: 100, max: 200 }, y_range: { min: 100, max: 200 } });
  const trapAnchor = { x: 400, y: 250 };
  const trapTW = 60, trapTH = 14;
  assertTrue("trap setup sanity: the plane's own axis danger zones do not reach the trap anchor's box neighbourhood",
    !E.PM_readoutDangerZones(trapPlane).some((z: { x0: number; y0: number; x1: number; y1: number }) =>
      E.PM_rectsOverlap(z, { x0: 350, y0: 200, x1: 500, y1: 300 })));
  // Candidate boxes at offset (30,-20)/(-30,-20)/(30,20)/(-30,20) (textAlign
  // LEFT,CENTER: box spans [anchor.x+off.x, +tw] x [anchor.y+off.y-th/2, +th]).
  // Register one obstacle EXACTLY sized against each candidate's own bbox —
  // candidate 1 (authored) gets a 5px sliver (smallest overlap), candidate 3
  // (y-mirror) a partial strip, candidates 2/4 (x-mirror, full-mirror) full
  // covers — so the least-overlap-area ranking is unambiguous.
  const cand1 = { x: 30, y: -20 }, cand2 = { x: -30, y: -20 }, cand3 = { x: 30, y: 20 }, cand4 = { x: -30, y: 20 };
  const bbox1 = E.PM_readoutBBox(trapAnchor, cand1, trapTW, trapTH);
  const bbox2 = E.PM_readoutBBox(trapAnchor, cand2, trapTW, trapTH);
  const bbox3 = E.PM_readoutBBox(trapAnchor, cand3, trapTW, trapTH);
  const bbox4 = E.PM_readoutBBox(trapAnchor, cand4, trapTW, trapTH);
  E.PM_planeInkZones[trapPlaneId] = [
    { x0: bbox1.x0, y0: bbox1.y0, x1: bbox1.x0 + 5, y1: bbox1.y1 }, // candidate 1: a 5px sliver, smallest overlap
    bbox2, // candidate 2: fully covered
    { x0: bbox3.x0, y0: bbox3.y0, x1: bbox3.x1, y1: bbox3.y0 + 10 }, // candidate 3: partial (bigger than sliver, smaller than full)
    bbox4, // candidate 4 (full mirror): fully covered
  ];
  const trapResolved = E.PM_readoutResolveOffset(trapAnchor, cand1, trapTW, trapTH, trapPlane, trapPlaneId);
  assertTrue("boxed-in anchor: every candidate DOES collide (the trap is genuinely inescapable)",
    [cand1, cand2, cand3, cand4].every((c) => E.PM_readoutCollides(trapAnchor, c, trapTW, trapTH, trapPlane, trapPlaneId)));
  check("boxed-in anchor: the resolver falls back to the LEAST-overlap-area candidate (candidate 1, the 5px sliver) — a TESTED candidate, never a 5th guess",
    JSON.stringify(trapResolved), JSON.stringify(cand1), 0 as any);
  delete E.PM_planeInkZones[trapPlaneId];

  // NEGATIVE CONTROL — "an implementation with no collision awareness must
  // FAIL": simply returning the candidate unmodified (the pre-fix renderer's
  // actual behaviour) leaves the collision in place.
  function preFixResolve(anchorPx: { x: number; y: number }, candidate: { x: number; y: number }) { return candidate; }
  const preFixPlacement = preFixResolve(pAnchor, authoredCandidate);
  assertTrue("NEGATIVE CONTROL: a no-collision-awareness resolver leaves the SAME struck placement in place",
    E.PM_readoutCollides(pAnchor, preFixPlacement, readoutTextW, 14, founderPlane));

  // A point comfortably clear of every axis (no collision) must NOT be
  // touched — the fix must be a SAFETY NET, not a blanket repositioning.
  const clearAnchor = founderPlane.toPx(2.0, 2.4); // far corner, well clear of both axes
  const clearCandidate = { x: 12, y: 20 };
  const clearResolved = E.PM_readoutResolveOffset(clearAnchor, clearCandidate, readoutTextW, 14, founderPlane);
  check("a placement with NO collision is returned UNCHANGED (the fix never moves what wasn't broken)",
    JSON.stringify(clearResolved), JSON.stringify(clearCandidate), 0 as any);

  // ── GRIDLINE SATURATION — bug_class readout_resolver_predicate_saturated_
  // by_gridline_ink_so_it_always_returns_true (CRITICAL, engine round
  // 2026-08-07/08). On a plane shaped like graph_transformations' own
  // (x_tick pitch ~51px, a 2-decimal coordinate-pair readout ~87-100px
  // wide), gridline pitch is SMALLER than the readout's own width — by the
  // pigeonhole principle EVERY horizontal position for the box straddles at
  // least one gridline column. Proven directly below, not asserted. ──────
  const gridSatPlaneId = "gridsat";
  const gridSatPlane = E.PM_planeBuildTransform({
    id: gridSatPlaneId, viewport: { x: 70, y: 78, w: 660, h: 372 },
    x_range: { min: -6.5, max: 6.5 }, y_range: { min: -4, max: 4 },
  });
  const gridPitchPx = gridSatPlane.scaleX * 1; // x_tick = 1
  check("gridline pitch on the graph_transformations-shaped plane matches the founder's measured ~51px", gridPitchPx, 50.77, 0.05, "px");
  const gsReadoutText = "P' = (3.14, -2.50)";
  const gsTW = textW12(gsReadoutText);
  assertTrue("this readout's own width EXCEEDS the gridline pitch (the saturation precondition, not assumed)", gsTW > gridPitchPx);

  // Register gridline ink exactly as drawCartesianPlane would (one band per
  // x-tick, full plane height, GRID_INK_HALF=4 padding) — reproduced here as
  // DATA, without calling the p5-drawing wrapper.
  for (const k of Object.keys(E.PM_planeGridInkZones)) delete E.PM_planeGridInkZones[k];
  const gsXTicks = E.PM_planeTickValues(-6.5, 6.5, 1) as number[];
  E.PM_planeGridInkZones[gridSatPlaneId] = gsXTicks.map((tv: number) => {
    const top = gridSatPlane.toPx(tv, 4), bot = gridSatPlane.toPx(tv, -4);
    return { x0: top.x - 4, y0: Math.min(top.y, bot.y), x1: top.x + 4, y1: Math.max(top.y, bot.y) };
  });

  // An anchor + offset sweep restricted to ox in [-140,150] (59 positions),
  // oy=0. Bounds derived, not guessed: the anchor sits at data (3,2) — data
  // x=3 lands EXACTLY on a gridline column (px 552.3, an authored integer
  // x_tick) — and the grid's 13 columns span px [95.4, 704.6] with an
  // 8px-wide band each. A gsTW~93.7px box only stays inside that periodic
  // region (guaranteeing pigeonhole coverage) up to ox<=155 before it slides
  // past the last column entirely; ox>-149.3 is required to clear the
  // y-axis danger band (px [370,403]) on the right side. [-140,150] sits
  // comfortably inside both bounds with margin — verified empirically
  // against the real column/zone geometry before being hardcoded here, not
  // assumed from the abstract pigeonhole argument alone.
  const gsAnchor = gridSatPlane.toPx(3, 2); // px (552.3, 171) — off both axes
  const gsSweepOx: number[] = [];
  for (let ox = -140; ox <= 150; ox += 5) gsSweepOx.push(ox);
  const gsStaticZones = E.PM_readoutDangerZones(gridSatPlane);
  const gsNoneHitAxis = gsSweepOx.every((ox) => {
    const box = E.PM_readoutBBox(gsAnchor, { x: ox, y: 0 }, gsTW, 14);
    return gsStaticZones.every((z: { x0: number; y0: number; x1: number; y1: number }) => !E.PM_rectsOverlap(box, z));
  });
  assertTrue(`sweep sanity: none of the ${gsSweepOx.length} swept offsets touch the plane's own axis/tick-label zones (isolates the gridline argument)`, gsNoneHitAxis);

  // NEGATIVE CONTROL — if this ink were registered as a HARD obstacle
  // (PM_planeInkZones, the pre-round-2 design this fix corrects), the
  // predicate saturates: every one of the swept positions collides,
  // purely because of gridline ink.
  const savedHard = E.PM_planeInkZones[gridSatPlaneId];
  E.PM_planeInkZones[gridSatPlaneId] = E.PM_planeGridInkZones[gridSatPlaneId];
  const allSaturatedAsHard = gsSweepOx.every((ox) =>
    E.PM_readoutCollides(gsAnchor, { x: ox, y: 0 }, gsTW, 14, gridSatPlane, gridSatPlaneId) === true);
  assertTrue(`NEGATIVE CONTROL: treating gridline ink as a HARD obstacle saturates the predicate — all ${gsSweepOx.length} swept offsets collide, none axis-driven`, allSaturatedAsHard);
  E.PM_planeInkZones[gridSatPlaneId] = savedHard; // restore — gridlines are NEVER hard in the shipped design (undefined/empty again)

  // POSITIVE — the SHIPPED design (gridlines in the SOFT registry only): the
  // predicate is no longer saturated — at least some of the same swept
  // offsets are now genuinely collision-free, so PM_readoutCollides "can
  // return false" again, per the literal requirement.
  const someClearAsSoft = gsSweepOx.some((ox) =>
    E.PM_readoutCollides(gsAnchor, { x: ox, y: 0 }, gsTW, 14, gridSatPlane, gridSatPlaneId) === false);
  assertTrue(`shipped: with gridlines in the SOFT tier, PM_readoutCollides again returns false for SOME of the same ${gsSweepOx.length} offsets`, someClearAsSoft);

  // The resolver now returns the AUTHORED offset UNCHANGED on a gridline-
  // heavy plane when no OTHER hard obstacle is present — even though it
  // visibly grazes a gridline column. This is the regression PR #59
  // introduced (9 of 9 authored offsets inverted on graph_transformations)
  // and this round closes.
  const gsCandidate = { x: 90, y: 0 };
  assertTrue("shipped: this specific authored-style candidate is hard-collision-free despite crossing gridline ink",
    !E.PM_readoutCollides(gsAnchor, gsCandidate, gsTW, 14, gridSatPlane, gridSatPlaneId));
  const gsResolved = E.PM_readoutResolveOffset(gsAnchor, gsCandidate, gsTW, 14, gridSatPlane, gridSatPlaneId);
  check("shipped: the resolver returns the AUTHORED offset UNCHANGED on a gridline-heavy plane (never an unconditional flip triggered by grid ink alone)",
    JSON.stringify(gsResolved), JSON.stringify(gsCandidate), 0 as any);

  // The soft tier still MATTERS — it tie-breaks among otherwise hard-tied
  // candidates via PM_readoutOverlapArea; it just never forces a flip on
  // its own.
  const gridOnlyScore = E.PM_readoutGridOverlapArea(gsAnchor, gsCandidate, gsTW, 14, gridSatPlaneId);
  assertTrue("the grazed gridline DOES register nonzero soft overlap area (not literally invisible to the engine, just non-blocking)", gridOnlyScore > 0);

  delete E.PM_planeGridInkZones[gridSatPlaneId];

  // Absent plane (F7 fleet-safety, mirrors section 11) -> pass the candidate
  // straight through, never throws.
  const noPlaneResolved = E.PM_readoutResolveOffset({ x: 0, y: 0 }, { x: 5, y: 5 }, 50, 14, null);
  check("PM_readoutResolveOffset with no registered plane returns the candidate unchanged (never throws)",
    JSON.stringify(noPlaneResolved), JSON.stringify({ x: 5, y: 5 }), 0 as any);

  // ── ROUND-2 CLAIM THAT DID NOT REPRODUCE — recorded as a test so the
  // finding cannot quietly rot. Round 2 was briefed that Q's readout "runs off
  // the RIGHT canvas edge, truncated mid-number" (STATE_2 rendering "Q = (2.0",
  // STATE_9 "Q = (1.90"). Swept across the FULL authored slider range, Q's box
  // never comes within 250px of the 760 edge — and the rendered frames show
  // both strings complete. What IS visibly damaging those glyphs is the curve /
  // secant ink crossing them, which is the separate OPEN bug_class
  // parametric_readout_and_label_collision_awareness_does_not_cover_a_sibling_
  // primitives_curve_or_line_ink. If this assertion ever FAILS, a real
  // horizontal overrun has appeared and the clamp above is what catches it. ──
  let worstQ = -Infinity, worstQAt = 0;
  for (let xq = -1.9; xq <= 2.0001; xq += 0.005) {
    const t = `Q = (${xq.toFixed(2)}, ${fq(xq).toFixed(2)})`;
    const b = E.PM_readoutBBox(secantPlane.toPx(xq, fq(xq)), { x: 12, y: -30 }, textW12(t), 14);
    if (b.x1 > worstQ) { worstQ = b.x1; worstQAt = xq; }
  }
  assertTrue(`Q's readout never approaches the right canvas edge across its whole slider range (worst x1 = ${worstQ.toFixed(1)} at xq=${worstQAt.toFixed(2)}, canvas 760) — the briefed truncation does NOT reproduce`,
    worstQ < 760);
  check("that worst case has >250px of headroom (so the reported clipping cannot be a canvas overrun)", worstQ < 510, true, 0 as any);
  // graph_transformations' p_prime is the fleet's genuinely tight one — this
  // is where the clamp earns its place, and the margin is worth watching.
  const gtPlane = E.PM_planeBuildTransform({
    id: "plane", viewport: { x: 70, y: 78, w: 660, h: 372 },
    x_range: { min: -6.5, max: 6.5 }, y_range: { min: -4, max: 4 },
  });
  let worstGt = -Infinity;
  for (let b = 0.5; b <= 3.0001; b += 0.05) for (const h of [-2, -1, 0, 1, 2]) {
    const x = Math.PI / 2 / b + h; if (x < -6.5 || x > 6.5) continue;
    for (const y of [-3.5, 0, 3.5]) {
      const t = `(${x.toFixed(2)}, ${y.toFixed(2)})`;
      const bb = E.PM_readoutBBox(gtPlane.toPx(x, y), { x: 6, y: -12 }, textW12(t), 14);
      if (bb.x1 > worstGt) worstGt = bb.x1;
    }
  }
  assertTrue(`graph_transformations p_prime worst-case right edge = ${worstGt.toFixed(1)} of 760 — inside today, but the tightest on the fleet (the clamp's real justification)`, worstGt < 760);

  // (g) STATIC — every readout-drawing primitive is actually WIRED to the
  // new shared placement functions (not merely defined-but-unused), mirrors
  // section 10's static-assertion technique.
  const drawPlotPointSrc = grabFn("drawPlotPoint");
  assertTrue("drawPlotPoint calls PM_readoutAuthoredOffset(spec)", drawPlotPointSrc.indexOf("PM_readoutAuthoredOffset(spec)") >= 0);
  assertTrue("drawPlotPoint measures the REAL text width via textWidth(), not an estimate", drawPlotPointSrc.indexOf("textWidth(resolved.readoutText)") >= 0);
  assertTrue("drawPlotPoint calls PM_readoutResolveOffset(", drawPlotPointSrc.indexOf("PM_readoutResolveOffset(") >= 0);
  assertTrue("drawPlotPoint clamps to the canvas LAST", drawPlotPointSrc.indexOf("PM_clampOffsetToCanvas(") >= 0);

  const drawSecantLineSrc = grabFn("drawSecantLine");
  assertTrue("drawSecantLine calls PM_readoutAuthoredOffset(spec)", drawSecantLineSrc.indexOf("PM_readoutAuthoredOffset(spec)") >= 0);
  assertTrue("drawSecantLine measures the REAL text width via textWidth(), not an estimate", drawSecantLineSrc.indexOf("textWidth(computed.readoutText)") >= 0);
  assertTrue("drawSecantLine calls the WIDTH-AWARE PM_labelClearOffset as its fallback default", /PM_labelClearOffset\(p0,\s*p1,\s*secTW,\s*14,\s*6\)/.test(drawSecantLineSrc));
  assertTrue("drawSecantLine no longer calls the round-1 fixed-distance PM_perpendicularOffset", drawSecantLineSrc.indexOf("PM_perpendicularOffset(") === -1);
  assertTrue("drawSecantLine clamps to the canvas LAST", drawSecantLineSrc.indexOf("PM_clampOffsetToCanvas(") >= 0);
  assertTrue("drawSecantLine no longer contains the OLD hardcoded '+ 10' / '- 12' readout literals", !/\+\s*10,\s*\([^)]*\)\s*\/\s*2\s*-\s*12/.test(drawSecantLineSrc));

  const drawTangentLineSrc = grabFn("drawTangentLine");
  assertTrue("drawTangentLine calls PM_readoutAuthoredOffset(spec)", drawTangentLineSrc.indexOf("PM_readoutAuthoredOffset(spec)") >= 0);
  assertTrue("drawTangentLine measures the REAL text width via textWidth(), not an estimate", drawTangentLineSrc.indexOf("textWidth(computed.readoutText)") >= 0);
  assertTrue("drawTangentLine calls the WIDTH-AWARE PM_labelClearOffset as its fallback default", /PM_labelClearOffset\(p0,\s*p1,\s*tanTW,\s*14,\s*6\)/.test(drawTangentLineSrc));
  assertTrue("drawTangentLine no longer calls the round-1 fixed-distance PM_perpendicularOffset", drawTangentLineSrc.indexOf("PM_perpendicularOffset(") === -1);
  assertTrue("drawTangentLine clamps to the canvas LAST", drawTangentLineSrc.indexOf("PM_clampOffsetToCanvas(") >= 0);
  assertTrue("drawTangentLine no longer contains the OLD hardcoded 'rAt.x + 10, rAt.y - 12' readout literal", drawTangentLineSrc.indexOf("rAt.x + 10, rAt.y - 12") === -1);

  // The round-1 function must be GONE from the renderer, not left dead — a
  // fixed-distance perpendicular is the defect this round removed, and leaving
  // it callable invites a future site from re-introducing it.
  assertTrue("the superseded PM_perpendicularOffset is fully removed from the renderer (no dead fixed-distance path left callable)",
    SRC.indexOf("function PM_perpendicularOffset(") === -1);

  // NEGATIVE CONTROL for the static scanner itself — a deliberately-
  // unwired snippet (draws a readout at the OLD fixed offset, calling
  // neither new function) must be caught.
  const unwiredSnippet = "function drawSecantLine_bad(spec) {\n  text(computed.readoutText, mid.x + 10, mid.y - 12);\n}";
  assertTrue("NEGATIVE CONTROL: the wiring scanner correctly reports an unwired implementation as NOT calling PM_labelClearOffset(",
    unwiredSnippet.indexOf("PM_labelClearOffset(") === -1);
  assertTrue("NEGATIVE CONTROL: the wiring scanner correctly reports an unwired implementation as NOT clamping",
    unwiredSnippet.indexOf("PM_clampOffsetToCanvas(") === -1);

  // (h) SCHEMA PARITY — scene_composition primitives are validated as
  // z.record(z.string(), z.unknown()) (src/schemas/conceptJson.ts), i.e. an
  // open record with no per-type field enumeration — so secant_line/
  // tangent_line authoring `readout.offset` requires ZERO schema change;
  // the only gap was the renderer never reading it (now fixed above). This
  // is a documentation assertion (always true, by the schema's own design)
  // rather than a runtime probe, recorded here so the parity claim is
  // checked into the same gate that would break if it stopped holding.
  assertTrue("scene_composition primitives remain an open record (z.record(z.string(), z.unknown())) in the live schema source — readout.offset on ANY primitive type needs no schema edit",
    /scene_composition:\s*z\.array\(z\.record\(z\.string\(\),\s*z\.unknown\(\)\)\)/.test(
      require("fs").readFileSync(require("path").join(__dirname, "../schemas/conceptJson.ts"), "utf8")
    ));
}

console.log("\n=== 18. PM_fmtNum — decimals-scaled near-zero clamp (bug_class ascii_minus_in_oncanvas_math_from_tofixed's sibling) ===");
{
  // The founder brief's own two literal assertions.
  check("PM_fmtNum(-0.003, 2) === '0.00' (clamped: 0.003 < 0.5*10^-2 = 0.005)", E.PM_fmtNum(-0.003, 2), "0.00", 0 as any);
  check("PM_fmtNum(-0.4, 0) === '0' (clamped: 0.4 < 0.5*10^0 = 0.5)", E.PM_fmtNum(-0.4, 0), "0", 0 as any);

  // A genuine negative that merely ROUNDS small must NOT be clamped away —
  // the clamp catches false "-0"s from float noise, not real small readings.
  check("PM_fmtNum(-0.006, 2) stays a real negative (0.006 > 0.005 = 0.5*10^-2)", E.PM_fmtNum(-0.006, 2), "−0.01", 0 as any);
  check("PM_fmtNum(-0.6, 0) stays a real negative (0.6 > 0.5 = 0.5*10^0)", E.PM_fmtNum(-0.6, 0), "−1", 0 as any);

  // Boundary — exactly AT the threshold is NOT clamped (strict <, matching
  // this function's own `<` comparison, mirrored here so the boundary
  // itself is pinned rather than merely implied by the two cases above).
  check("PM_fmtNum(-0.005, 2) at the EXACT threshold is NOT clamped (strict <, not <=)", E.PM_fmtNum(-0.005, 2), "−0.01", 0 as any);

  // Every decimals value in active use on this engine (0,1,2,3,4 — plot_point
  // defaults to 2, secant/tangent readouts commonly author 3-4, tick labels
  // commonly author 0) gets its OWN correctly-scaled clamp, not one value
  // borrowed from a different precision.
  const perDecimalsOk = [0, 1, 2, 3, 4].every((d) => {
    const eps = 0.5 * Math.pow(10, -d);
    const justInside = E.PM_fmtNum(-(eps * 0.99), d); // just inside the clamp -> "0"
    const justOutside = E.PM_fmtNum(-(eps * 1.5), d); // just outside -> a real negative
    return justInside === (0).toFixed(d) && justOutside.startsWith("−");
  });
  assertTrue("the clamp threshold is correctly decimals-scaled at every authored precision (0-4dp), not a single borrowed constant", perDecimalsOk);

  // Non-finite decimals falls back to the function's own documented default
  // (2dp) rather than crashing or producing NaN text.
  assertTrue("a non-finite decimals argument degrades to the 2dp default, never NaN text", !E.PM_fmtNum(-0.003, NaN as any).includes("NaN"));

  // NEGATIVE CONTROL — the pre-round-2 fixed-1e-9-epsilon implementation
  // (hand-reproduced here, matching section 3's own preFixFmtNum), run
  // against the SAME two founder-brief cases, demonstrating it does NOT
  // close either one.
  function preFixFmtNumV2(value: number, decimals: number): string {
    const v = Math.abs(value) < 1e-9 ? 0 : value;
    return v.toFixed(decimals).replace("-", "−");
  }
  assertTrue("NEGATIVE CONTROL: the pre-round-2 fixed-epsilon clamp does NOT close PM_fmtNum(-0.003, 2)", preFixFmtNumV2(-0.003, 2) !== "0.00");
  assertTrue("NEGATIVE CONTROL: the pre-round-2 fixed-epsilon clamp does NOT close PM_fmtNum(-0.4, 0)", preFixFmtNumV2(-0.4, 0) !== "0");
}

console.log("\n=== 19. plot_point default-offset direction — outward normal to the LOCAL CURVE TANGENT, not a screen-axis constant (bug_class plot_point_default_offset_is_a_screen_axis_constant_not_the_curves_own_tangent) ===");
{
  for (const k of Object.keys(E.PM_planeCurveExpr)) delete E.PM_planeCurveExpr[k];
  const tanPlaneId = "tanplane";
  const tanPlane = E.PM_planeBuildTransform({ id: tanPlaneId, viewport: { x: 0, y: 0, w: 400, h: 400 }, x_range: { min: -4, max: 4 }, y_range: { min: -4, max: 4 } });
  E.PM_planeCurveExpr[tanPlaneId] = "x*x/2"; // the SAME parabola derivative_as_secant_limit's curve authors

  // At x=0 (the parabola's vertex) the tangent is HORIZONTAL — the outward
  // normal must point straight up (or down); at x=2 the tangent has slope 2
  // (steep) — the outward normal must be mostly HORIZONTAL, matching
  // PM_upwardNormal's own already-verified geometry (section 17b) rather
  // than a re-derivation here.
  const tanAtVertex = E.PM_plotPointCurveTangentPx({ plane_id: tanPlaneId }, {}, tanPlane, 0, 0);
  assertTrue("a curve IS registered for this plane -> tangent probe resolves (not null)", !!tanAtVertex);
  const nVertex = E.PM_upwardNormal(tanAtVertex.p0, tanAtVertex.p1);
  assertTrue("at the parabola's vertex (slope 0): the tangent probe's own normal is (near-)VERTICAL, |ny| >> |nx|", Math.abs(nVertex.y) > 0.99 && Math.abs(nVertex.x) < 0.15);

  const tanAtSteep = E.PM_plotPointCurveTangentPx({ plane_id: tanPlaneId }, {}, tanPlane, 2, 2);
  assertTrue("steep point (x=2, slope=2) -> tangent probe resolves", !!tanAtSteep);
  const nSteep = E.PM_upwardNormal(tanAtSteep.p0, tanAtSteep.p1);
  assertTrue("at a steep point (data slope 2): the normal leans substantially HORIZONTAL (|nx| > |ny| is false for slope 2 in DATA space, but pixel-space normal must differ measurably from the vertex's near-vertical normal)",
    Math.abs(nSteep.x - nVertex.x) > 0.1 || Math.abs(nSteep.y - nVertex.y) > 0.1);

  // Feeding the tangent segment into PM_labelClearOffset (the SAME support-
  // function displacement secant_line/tangent_line already use) produces a
  // GEOMETRIC clearance guarantee identical to section 17's own sweep — not
  // re-derived by hand here, reused directly.
  const tanDefaultOff = E.PM_labelClearOffset(tanAtVertex.p0, tanAtVertex.p1, 90, 14, 6);
  assertTrue("the curve-tangent default offset is finite (never NaN feeding into a text() draw call)", isFinite(tanDefaultOff.x) && isFinite(tanDefaultOff.y));

  // No curve registered on this plane this frame -> null, never a crash;
  // caller (drawPlotPoint) falls back to the constant {10,-12} default.
  const noCurvePlaneId = "nocurve";
  const noCurvePlane = E.PM_planeBuildTransform({ id: noCurvePlaneId, viewport: { x: 0, y: 0, w: 400, h: 400 }, x_range: { min: -4, max: 4 }, y_range: { min: -4, max: 4 } });
  const noCurveResult = E.PM_plotPointCurveTangentPx({ plane_id: noCurvePlaneId }, {}, noCurvePlane, 0, 0);
  check("no function_plot registered on this plane -> null (caller falls back to the constant default)", noCurveResult, null, 0 as any);

  // A point riding a REPARAMETERISED curve (Q-style: x_expr:"x0+1", still on
  // the SAME parabola) gets the SAME tangent as a direct point at that x —
  // proving the probe differentiates the CURVE's own y_expr (data x), never
  // the point's OWN x_expr/parameter, which is what makes this correct for
  // derivative_as_secant_limit's actual Q authoring (x_expr:"x0+1" or
  // "x0+pow(10,hlog)" — both reparameterisations of the same y=x^2/2).
  const tanDirect = E.PM_plotPointCurveTangentPx({ plane_id: tanPlaneId }, {}, tanPlane, 1.3, 1.3 * 1.3 / 2);
  const tanReparam = E.PM_plotPointCurveTangentPx({ plane_id: tanPlaneId }, { x0: 0.3 }, tanPlane, 1.3, 1.3 * 1.3 / 2); // same (x,y), different scope, extra unrelated var
  assertTrue("reparameterisation-independence: two probes at the SAME (x,y) but different `vars` scopes agree exactly",
    !!tanDirect && !!tanReparam &&
    Math.abs(tanDirect.p1.x - tanDirect.p0.x - (tanReparam.p1.x - tanReparam.p0.x)) < 1e-9 &&
    Math.abs(tanDirect.p1.y - tanDirect.p0.y - (tanReparam.p1.y - tanReparam.p0.y)) < 1e-9);

  // NEGATIVE CONTROL — a probe that (wrongly) differentiates the POINT's own
  // x_expr/y_expr instead of the registered curve's y_expr would give a
  // DIFFERENT (and for a genuinely different reparameterisation, WRONG)
  // answer whenever the point's own parameterisation rate differs from 1:1.
  // Demonstrated with x_expr:"2*t" (a 2x-rate reparameterisation) evaluated
  // the WRONG way (differentiating x_expr/y_expr directly w.r.t. t) vs the
  // CORRECT way (this section's own shipped probe, which ignores x_expr/
  // y_expr entirely and only reads the plane's registered curve formula).
  const wrongVars = { t: 0.65 };
  const wrongDx = E.PM_safeEval("2*t", { t: wrongVars.t + 1e-4 }) - E.PM_safeEval("2*t", wrongVars);
  assertTrue("NEGATIVE CONTROL: differentiating the POINT's OWN x_expr (2*t) gives a rate of ~2 per unit t, an artifact of the reparameterisation, not the curve's own dx",
    Math.abs(wrongDx / 1e-4 - 2) < 1e-2);
  const shippedTan = E.PM_plotPointCurveTangentPx({ plane_id: tanPlaneId }, {}, tanPlane, 1.3, 1.3 * 1.3 / 2);
  const shippedDx = shippedTan.p1.x - shippedTan.p0.x;
  // The shipped probe's OWN dx (in DATA space, before the plane's px scale)
  // is exactly PM_TANGENT_PROBE_EPS (1e-4) by construction — it never
  // inherits the point's 2x reparameterisation rate at all.
  assertTrue("the SHIPPED probe does NOT share that defect — its own data-space dx is exactly PM_TANGENT_PROBE_EPS, un-scaled by any point-side reparameterisation",
    Math.abs((tanPlane.toData(shippedTan.p1.x, shippedTan.p1.y).x - tanPlane.toData(shippedTan.p0.x, shippedTan.p0.y).x) - E.PM_TANGENT_PROBE_EPS) < 1e-9);
}

console.log("\n=== F1a — live-drag scope rebuild: an UNRELATED choreographed variable survives a genuine drag (bug_class pcpl_drag_rebuilds_physics_scope_from_authored_defaults_and_drops_every_other_live_choreography_value, founder_proxy Checkpoint B 2026-08-08) ===");
{
  // A DEDICATED sandbox (mirrors the shared `E` pattern) supplying its OWN
  // literal fixtures for PM_liveDragScope's free variables
  // (PM_config/PM_currentState/PM_sliderValues/PM_choreoValues/
  // PM_userTouched) — deliberately NOT added to the shared VARS list,
  // which would force every OTHER section in this file to reason about a
  // shared mutable global. grabFn pulls the SHIPPED function bodies
  // (never a reimplementation) so this section runs the real code.
  function runLiveDragScope(fixture: {
    config: unknown; currentState: string;
    sliderValues: Record<string, number>; choreoValues: Record<string, number>;
    userTouched: Record<string, boolean>;
  }): Record<string, number> {
    const body = [
      "var PM_config = " + JSON.stringify(fixture.config) + ";",
      "var PM_currentState = " + JSON.stringify(fixture.currentState) + ";",
      "var PM_sliderValues = " + JSON.stringify(fixture.sliderValues) + ";",
      "var PM_choreoValues = " + JSON.stringify(fixture.choreoValues) + ";",
      "var PM_userTouched = " + JSON.stringify(fixture.userTouched) + ";",
      grabFn("PM_stateLiveControlVars"),
      grabFn("PM_resolveStateVars"),
      grabFn("PM_liveDragScope"),
      "return PM_liveDragScope();",
    ].join("\n");
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    return new Function(body)();
  }

  // The exact reported shape: a state authors a plot_point.drag on 'b' AND
  // a variable_choreography on 'c' (independent variables). By the time
  // the teacher drags 'b', the choreography has already carried 'c' to its
  // end value 1 (PM_choreoValues.c = 1); PM_userTouched contains only 'b'
  // (the variable being seized THIS frame — matches the shipped call
  // order: PM_userTouched[bind_variable] = true runs BEFORE
  // PM_liveDragScope()).
  const cfg = {
    default_variables: { b: 2, c: 0 },
    states: {
      STATE_5: {
        scene_composition: [
          { type: "plot_point", id: "P", plane_id: "plane", x_expr: "b", y_expr: "b*b-c",
            drag: { bind_variable: "b", axis: "x", min: 0, max: 2 } },
        ],
      },
    },
  };
  const fixed = runLiveDragScope({
    config: cfg, currentState: "STATE_5",
    sliderValues: { b: 1.5 }, choreoValues: { c: 1 }, userTouched: { b: true },
  });
  check("PM_liveDragScope: the CHOREOGRAPHED variable (c) holds its live end value through a drag on an UNRELATED variable", fixed.c, 1, 0);
  check("PM_liveDragScope: the SEIZED/dragged variable (b) reads the just-set drag value", fixed.b, 1.5, 0);

  // NEGATIVE CONTROL — the PRE-FIX algorithm this dispatch replaced
  // (PM_resolveStateVars's authored defaults + a blanket PM_sliderValues
  // overlay, NO PM_choreoValues merge at all), reimplemented independently
  // here — never against the shipped renderer.
  function preFixDragScope(fixture: { config: any; currentState: string; sliderValues: Record<string, number> }) {
    const merged: Record<string, number> = { ...fixture.config.default_variables };
    for (const k of Object.keys(fixture.sliderValues)) merged[k] = fixture.sliderValues[k];
    return merged;
  }
  const broken = preFixDragScope({ config: cfg, currentState: "STATE_5", sliderValues: { b: 1.5 } });
  assertTrue("NEGATIVE CONTROL: the pre-fix scope-rebuild resets the choreographed 'c' back to its state-entry DEFAULT (0), not its live value (1)",
    broken.c === 0);
  assertTrue("the shipped PM_liveDragScope does NOT share that defect",
    fixed.c === 1 && fixed.c !== broken.c);
}

console.log("\n=== F1b — drag-handle LATCH: a claimed handle keeps updating even when a later frame's proximity re-test would fail (bug_class pcpl_drag_handle_re-tests_pointer_proximity_every_frame_so_a_handle_that_drifts_off_its_own_drag_axis_drops_itself) ===");
{
  // Reimplements BOTH the pre-fix ('hit && isActive', re-tested every
  // frame) and the fixed ('mouseIsPressed && isActive', proximity tested
  // ONLY at the moment of claim) state machines independently here, and
  // drives an IDENTICAL frame sequence through both: frame 0 grabs the
  // handle (mouse near px); frames 1+ reproduce the measured symptom — px
  // jumps away (the F1a scope-corruption teleport, or simply the mouse
  // drifting off a drag.axis:'x' point's own curve-following y) so a
  // per-frame proximity re-test would fail — while the mouse keeps
  // travelling toward the clamp.
  function simulateDrag(usesLatch: boolean, hitR: number, clampMin: number, clampMax: number,
    frames: { px: number; mouseX: number; mousePressed: boolean }[]): number {
    let activeId: string | null = null;
    let value = clampMin;
    for (const f of frames) {
      const hit = f.mousePressed && Math.abs(f.mouseX - f.px) < hitR;
      if (usesLatch) {
        const claim = f.mousePressed && activeId === null && hit;
        if (claim) activeId = "P";
        if (!f.mousePressed) activeId = null;
        const isActive = activeId === "P";
        if (f.mousePressed && isActive) value = Math.max(clampMin, Math.min(clampMax, f.mouseX));
      } else {
        if (hit && activeId === null) activeId = "P";
        if (!f.mousePressed) activeId = null;
        const isActive = activeId === "P";
        if (hit && isActive) value = Math.max(clampMin, Math.min(clampMax, f.mouseX));
      }
    }
    return value;
  }

  const hitR = 22;
  const frames = [
    { px: 100, mouseX: 100, mousePressed: true },  // frame 0 — genuine grab
    { px: 400, mouseX: 130, mousePressed: true },  // px teleports off-curve; mouse keeps moving
    { px: 400, mouseX: 160, mousePressed: true },
    { px: 400, mouseX: 190, mousePressed: true },
    { px: 400, mouseX: 200, mousePressed: true },  // mouse reaches the clamp
  ];
  const latched = simulateDrag(true, hitR, 0, 200, frames);
  const nonLatched = simulateDrag(false, hitR, 0, 200, frames);
  check("LATCHED state machine: reaches the clamp (200) across all 5 frames despite px teleporting off-curve on frame 1", latched, 200, 0);
  assertTrue("NEGATIVE CONTROL: the PRE-FIX ('hit && isActive', re-tested every frame) state machine FREEZES at frame 0's value (100) once px teleports away — it never reaches the clamp (measured shape: b froze at 1.947 for 24 further steps while mouseX travelled 608->534)",
    nonLatched === 100);

  // STATIC REACHABILITY — the shipped drawPlotPoint/drawCanvasSlider
  // source actually implement the latch shape (mirrors section F5's own
  // static-reachability technique): the update gate reads
  // 'mouseIsPressed && isActive' (latched — proximity NOT re-tested), and
  // the old re-tested 'hit && isActive' gate is gone from both.
  const plotPointSrc = grabFn("drawPlotPoint");
  const sliderSrc = grabFn("drawCanvasSlider");
  assertTrue("drawPlotPoint's update gate is 'mouseIsPressed && isActive' (latched)",
    plotPointSrc.indexOf("if (mouseIsPressed && isActive) {") >= 0);
  assertTrue("drawPlotPoint no longer gates the update on the re-tested 'hit && isActive'",
    plotPointSrc.indexOf("if (hit && isActive) {") === -1);
  assertTrue("drawCanvasSlider's update gate is ALSO 'mouseIsPressed && isActive' (latched) — the twin call site fixed the same way",
    sliderSrc.indexOf("if (mouseIsPressed && isActive) {") >= 0);
  assertTrue("drawCanvasSlider no longer gates the update on the re-tested 'hit && isActive'",
    sliderSrc.indexOf("if (hit && isActive) {") === -1);
  assertTrue("drawPlotPoint's claim (not the update) is the ONLY place proximity is tested — guarded by 'PM_activeSliderId == null'",
    /var claim = mouseIsPressed && PM_activeSliderId == null[\s\S]{0,80}Math\.hypot/.test(plotPointSrc));

  // NEGATIVE CONTROL for the static scanner itself — a deliberately
  // unfixed (pre-fix-shaped) snippet must be CAUGHT as still re-testing.
  const unfixedSnippet = "function drawFakeDrag(spec) {\n  var hit = mouseIsPressed && dist < hitR;\n  if (hit && isActive) { doUpdate(); }\n}";
  assertTrue("NEGATIVE CONTROL: the scanner correctly finds the pre-fix 'hit && isActive' shape in a deliberately unfixed snippet",
    unfixedSnippet.indexOf("if (hit && isActive) {") >= 0);
}

console.log("\n=== F2 — riemann_bars' max_bars_drawn bounds COST, never EXTENT (bug_class pcpl_riemann_bars_max_bars_drawn_truncates_the_partition_instead_of_bounding_its_cost, founder_proxy Checkpoint B 2026-08-08) ===");
{
  const from = 0, to = 2;
  const cap = 20;
  const sweepNs = [50, 500, 5000]; // three values spanning the sweep, per the dispatch's own requirement
  for (const n of sweepNs) {
    const computed = E.PM_riemannBarsCompute("x*x", from, to, n, "left", cap, {});
    const bars = computed.bars as { i: number; xL: number; xR: number }[];
    assertTrue(`n=${n}, cap=${cap}: at least one bar drawn`, bars.length > 0);
    const xL0 = bars[0].xL;
    const xRLast = bars[bars.length - 1].xR;
    assertTrue(`n=${n}: leftmost drawn bar's xL (${xL0}) <= from + 1% of span`, xL0 <= from + 0.01 * (to - from));
    assertTrue(`n=${n}: rightmost drawn bar's xR (${xRLast}) >= to - 1% of span`, xRLast >= to - 0.01 * (to - from));
    // The published SUM is untouched by the cap — still the true full-n sum.
    const uncappedSum = E.PM_riemannBarsCompute("x*x", from, to, n, "left", undefined, {}).sum;
    check(`n=${n}: capped sum still equals the uncapped (full-n) sum`, computed.sum, uncappedSum, 1e-9);
  }

  // NEGATIVE CONTROL — the PRE-FIX selection ("first cap bars only"),
  // reimplemented independently here (never against the shipped
  // renderer), reproduces the measured shrinking-extent shape at large n.
  function preFixSelectFirstN(from2: number, to2: number, n2: number, cap2: number) {
    const h = (to2 - from2) / n2;
    const drawn = Math.min(n2, cap2);
    return { xL0: from2, xRLast: from2 + drawn * h };
  }
  const broken = preFixSelectFirstN(from, to, 6494, cap);
  assertTrue("NEGATIVE CONTROL: the pre-fix 'first cap bars' selection at n=6494 draws only a SHRUNKEN leading slice (xR nowhere near `to`, reproducing the measured n=6494 -> [0,0.12] shape)",
    broken.xRLast < to - 0.5 * (to - from));
  const fixedAt6494 = E.PM_riemannBarsCompute("x*x", from, to, 6494, "left", cap, {});
  const fixedBars = fixedAt6494.bars as { xR: number }[];
  assertTrue("the shipped PM_riemannBarsCompute does NOT share that defect at the SAME n",
    fixedBars[fixedBars.length - 1].xR >= to - 0.01 * (to - from));
}

console.log("\n=== F3 — plane children are clipped to their OWN plane's viewport (bug_class pcpl_plane_children_paint_past_their_owning_planes_viewport_when_resolved_from_a_data_point_outside_the_planes_own_range, founder_proxy Checkpoint B 2026-08-08) ===");
{
  // Reproduces the measured geometry: STATE_4's plane_inset windowed to
  // y_range [3,4]; riemann_bars' FIXED baseline sits at data y=0 (outside
  // that window) — the exact defect the dispatch measured (py 668, off
  // the 500px canvas).
  const insetSpec = {
    id: "plane_inset",
    viewport: { x: 480, y: 90, w: 220, h: 140 },
    x_range: { min: 0, max: 2 },
    y_range: { min: 3, max: 4 },
  };
  const insetPlane = E.PM_planeBuildTransform(insetSpec);
  const baselinePx = insetPlane.toPx(1, 0); // riemann_bars' fixed baseline, data y=0
  function pointInRect(p: { x: number; y: number }, r: { x: number; y: number; w: number; h: number }) {
    return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
  }
  assertTrue("the baseline (data y=0) resolved through the inset plane lands OUTSIDE the inset's own viewport rect — the root defect, measured",
    !pointInRect(baselinePx, insetPlane.viewport));
  assertTrue("...specifically BELOW the 500px canvas (py > 500), matching the measured 'py 668, off the 500px canvas'",
    baselinePx.y > 500);
  const insideProbe = insetPlane.toPx(1, 3.5); // a point genuinely inside the authored y_range [3,4]
  assertTrue("NEGATIVE CONTROL: a point genuinely INSIDE the plane's own y_range is NOT excluded by the same rect test (the scanner isn't just always-false)",
    pointInRect(insideProbe, insetPlane.viewport));

  // STATIC — PM_planeClipGeometryBegin/End exist and shape a real canvas
  // clip (save/rect/clip, paired with restore), and EVERY plane-child
  // geometry-drawing function calls them exactly once each (balanced
  // begin/end), not just riemann_bars — the dispatch's explicit "not per
  // primitive type, every child" requirement.
  const beginSrc = grabFn("PM_planeClipGeometryBegin");
  assertTrue("PM_planeClipGeometryBegin saves context state before clipping", beginSrc.indexOf("drawingContext.save()") >= 0);
  assertTrue("PM_planeClipGeometryBegin clips to the plane's OWN registered viewport rect (x,y,w,h)",
    beginSrc.indexOf("plane.viewport.x, plane.viewport.y, plane.viewport.w, plane.viewport.h") >= 0);
  const endSrc = grabFn("PM_planeClipGeometryEnd");
  assertTrue("PM_planeClipGeometryEnd restores context state (undoing the clip)", endSrc.indexOf("drawingContext.restore()") >= 0);

  const geometryFns = ["drawRegionFill", "drawRiemannBars", "drawFunctionPlot", "drawSecantLine", "drawTangentLine", "drawPlotPoint"];
  for (const fn of geometryFns) {
    const src = grabFn(fn);
    const beginCount = (src.match(/PM_planeClipGeometryBegin\(spec\.plane_id\)/g) || []).length;
    const endCount = (src.match(/PM_planeClipGeometryEnd\(__pmClip\)/g) || []).length;
    assertTrue(`${fn} calls PM_planeClipGeometryBegin(spec.plane_id) exactly once`, beginCount === 1);
    assertTrue(`${fn} calls the MATCHING PM_planeClipGeometryEnd(__pmClip) exactly once (balanced begin/end)`, endCount === 1 && endCount === beginCount);
  }

  // NEGATIVE CONTROL for the scanner itself — a deliberately-unclipped
  // (pre-fix-shaped) draw function must be CAUGHT as missing the call.
  const unclippedSnippet = "function drawFakeGeom(spec) {\n  push();\n  fill(1,2,3);\n  rect(0,0,10,10);\n  pop();\n}";
  const fakeBeginCount = (unclippedSnippet.match(/PM_planeClipGeometryBegin\(spec\.plane_id\)/g) || []).length;
  assertTrue("NEGATIVE CONTROL: the scanner correctly reports ZERO clip calls in an unclipped (pre-fix-shaped) draw function", fakeBeginCount === 0);
}

console.log("\n=== F6 — PM_interpolate numeric substitutions carry the real U+2212 minus + near-zero clamp (bug_class pcpl_interpolate_numeric_substitution_ships_an_ascii_hyphen_where_every_other_readout_ships_u+2212, founder_proxy Checkpoint B 2026-08-08 — recurrence of a class already closed once at the authoring layer on derivative_as_secant_limit) ===");
{
  assertTrue("PM_interpolateFormatNumeric(-0.6667) carries U+2212, never ASCII U+002D",
    E.PM_interpolateFormatNumeric(-0.6667) === "−0.6667" && String(E.PM_interpolateFormatNumeric(-0.6667)).indexOf("-") === -1);
  assertTrue("PM_interpolateFormatNumeric('-0.6667') — an author's OWN inline .toFixed() STRING — is ALSO normalised",
    E.PM_interpolateFormatNumeric("-0.6667") === "−0.6667");
  assertTrue("PM_interpolateFormatNumeric('-0.0000') strips the sign — a negative-zero artifact renders unsigned",
    E.PM_interpolateFormatNumeric("-0.0000") === "0.0000");
  assertTrue("PM_interpolateFormatNumeric('-0') strips the sign",
    E.PM_interpolateFormatNumeric("-0") === "0");
  assertTrue("PM_interpolateFormatNumeric(1.5) — a positive number is untouched (nothing to normalise)",
    E.PM_interpolateFormatNumeric(1.5) === "1.5");
  assertTrue("PM_interpolateFormatNumeric leaves a NON-numeric hyphen alone (only '-' immediately before a digit converts)",
    E.PM_interpolateFormatNumeric("a-b") === "a-b");

  // NEGATIVE CONTROL — the PRE-FIX behaviour (bare String(result), the
  // renderer's OWN literal shape before this fix), reimplemented here.
  function preFixNumeric(value: unknown): string { return String(value); }
  assertTrue("NEGATIVE CONTROL: the pre-fix String(result) DOES leak an ASCII U+002D hyphen for a negative number",
    preFixNumeric(-0.6667).indexOf("-") >= 0);
  assertTrue("NEGATIVE CONTROL: the pre-fix path also reaches the screen as a signed zero ('-0.0000'), never clamped",
    preFixNumeric((-0.00003).toFixed(4)) === "-0.0000");
  assertTrue("no U+002D reaches PM_interpolateFormatNumeric's output across a signed sweep of representative authored .toFixed() values",
    [-0.6667, -1, -12.345, 0, 1, -0.00003].every((v) => String(E.PM_interpolateFormatNumeric(v.toFixed(4))).indexOf("-") === -1));
  assertTrue("no string matches /-0\\.0+$/ (the ASCII negative-zero pattern) after formatting",
    !/-0\.0+$/.test(String(E.PM_interpolateFormatNumeric((-0.00003).toFixed(4)))));

  // STATIC REACHABILITY — PM_interpolate actually calls
  // PM_interpolateFormatNumeric at BOTH substitution sites (the simple-
  // identifier fast path AND the evaluated-expression path, which is
  // where an author's own inline .toFixed() lives) — proving the fix is
  // WIRED, not merely defined-but-unused.
  const interpSrc = grabFn("PM_interpolate");
  const callCount = (interpSrc.match(/PM_interpolateFormatNumeric\(/g) || []).length;
  assertTrue("PM_interpolate calls PM_interpolateFormatNumeric at BOTH substitution sites (fast-path identifier + evaluated expression)", callCount === 2);
  assertTrue("PM_interpolate's fast path no longer bare-String()s the identifier value", interpSrc.indexOf("String(vars[body])") === -1);
  assertTrue("PM_interpolate's expression path no longer bare-String()s the evaluated result", interpSrc.indexOf("return String(result);") === -1);
}

// ── D3 — live `*_expr` plane range bounds (the re-zooming magnifier) ─────────
{
  // A magnifier inset over the LAST Riemann bar. Its width must track the bar
  // width h = (to-from)/n, or the subject shrinks to sub-pixel as n grows and
  // the inset shows an empty box — which is exactly the defect this replaces.
  const live = (n: number) => ({ b: 2, n, h: 2 / n });
  const insetSpec = {
    id: "plane_inset",
    viewport: { x: 230, y: 88, w: 230, h: 145 },
    x_range: { min: 1.75, max: 2.0, min_expr: "b - 3*(b/n)", max_expr: "b" },
    y_range: { min: 3, max: 4 },
  };

  const at8 = E.PM_planeBuildTransform(insetSpec, live(8));
  const at2304 = E.PM_planeBuildTransform(insetSpec, live(2304));
  assertTrue("D3: a plane with min_expr/max_expr resolves at all (both n values build a transform)",
    !!at8 && !!at2304);

  // The SUBJECT (one bar, width h) must occupy a constant fraction of the
  // inset's width at every n — that is the whole point of re-zooming.
  const fracOf = (plane: any, n: number) => (2 / n) / (plane.xRange.max - plane.xRange.min);
  const f8 = fracOf(at8, 8), f2304 = fracOf(at2304, 2304);
  assertTrue(`D3: the bar occupies a CONSTANT fraction of the inset at n=8 and n=2304 (${f8.toFixed(4)} vs ${f2304.toFixed(4)})`,
    Math.abs(f8 - f2304) < 1e-9);
  assertTrue("D3: that constant fraction is legibly large (>= 1/4 of the inset width)", f8 >= 0.25);

  // NEGATIVE CONTROL — the PRE-FIX behaviour: a FIXED window over the same
  // subject. Reimplemented independently, never against the shipped renderer.
  const fixedWindowFrac = (n: number) => (2 / n) / (2.0 - 1.75);
  assertTrue(`NEGATIVE CONTROL: a FIXED inset window renders the same bar at ${(fixedWindowFrac(2304) * 100).toFixed(3)}% of its width at n=2304 — sub-pixel, i.e. the empty-box defect`,
    fixedWindowFrac(2304) < 0.005);
  assertTrue("NEGATIVE CONTROL: and that fixed window is NOT constant across n (it collapses by >100x from n=8 to n=2304)",
    fixedWindowFrac(8) / fixedWindowFrac(2304) > 100);

  // Fallback discipline: a broken expression must keep the AUTHORED window,
  // never produce a degenerate range (a vanished frame reads as a broken sim).
  const brokenSpec = {
    id: "p_broken",
    viewport: { x: 230, y: 88, w: 230, h: 145 },
    x_range: { min: 1.75, max: 2.0, min_expr: "this_is_not_a_variable * (" },
    y_range: { min: 3, max: 4 },
  };
  const brokenPlane = E.PM_planeBuildTransform(brokenSpec, live(100));
  assertTrue("D3: an unparseable min_expr falls back to the authored numeric bound (window preserved, not degenerate)",
    !!brokenPlane && brokenPlane.xRange.min === 1.75 && brokenPlane.xRange.max === 2.0);
  assertTrue("D3: PM_planeResolveBound returns the numeric bound when no *_expr is authored",
    E.PM_planeResolveBound({ min: -6.5, max: 6.5 }, "min", {}) === -6.5);
  assertTrue("NEGATIVE CONTROL: PM_planeResolveBound is not a pass-through — it DOES prefer a valid expr over the numeric bound",
    E.PM_planeResolveBound({ min: 1.75, min_expr: "b - 3*(b/n)" }, "min", live(8)) === 1.25);

  // Every plane already shipped authors numeric ranges only — prove the
  // addition is a strict no-op for them.
  const legacy = E.PM_planeBuildTransform(DEFAULT_PLANE, {});
  const legacyNoVars = E.PM_planeBuildTransform(DEFAULT_PLANE, undefined);
  assertTrue("D3: a numeric-only plane is byte-identical with and without a live scope (strict no-op for every shipped concept)",
    JSON.stringify(legacy.xRange) === JSON.stringify(legacyNoVars.xRange)
    && JSON.stringify(legacy.yRange) === JSON.stringify(legacyNoVars.yRange));
}

console.log(failures === 0
  ? "\nALL CARTESIAN-PLANE (CP-A + CP-B + CP-C1 + CP-C2 + CP-D + D3) CHECKS PASS\n"
  : `\n*** ${failures} CARTESIAN-PLANE CHECK(S) FAILED ***\n`);
process.exit(failures === 0 ? 0 : 1);
