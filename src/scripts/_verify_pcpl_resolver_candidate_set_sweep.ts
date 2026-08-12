/**
 * ONE-TIME dispatch verification — the founder's Checkpoint-B-cycle-2 sweep
 * mandate for the readout-resolver engine round (2026-08-07/08, branch
 * fix/pcpl-resolver-candidate-set). "The bar is a sweep, not samples": this
 * script drives `derivative_as_secant_limit` STATE_9 (a 680-pose x0*xq grid,
 * authored readout offsets DELETED so the curve-tangent default + ordered
 * candidate resolver are the ONLY thing placing P/Q) and STATE_3 (a 121-pose
 * time sweep at <=200ms resolution, authored offsets INTACT) and reports
 * every overlapping readout bbox pair found at every pose — reproducing
 * what window.__pmDebug.readouts would show in a live iframe, without
 * needing a browser: every function this script calls is the SAME pure
 * function the renderer ships (pulled out of PARAMETRIC_RENDERER_CODE by
 * brace-matching, the identical technique check_cartesian_plane.ts uses),
 * driven through the SAME fixed Pass-0.3 draw order (function_plot ->
 * secant_line -> tangent_line -> plot_point, plot_points in
 * scene_composition ARRAY order) and the SAME per-frame ink-registry reset
 * drawSecantLine/drawTangentLine/drawPlotPoint rely on. The only thing NOT
 * exercised is the p5 canvas draw calls themselves (stroke/fill/text/
 * ellipse) — geometry and collision state are byte-identical to what the
 * live renderer would compute for the same inputs; text width is measured
 * via check_cartesian_plane.ts's own
 *
 * RESULT (this round, commit at HEAD): NOT zero. STATE_9 128/680 poses
 * (18.8%) still show >=1 overlapping pair, STATE_3 77/121 (64%). Both are
 * REDUCTIONS from the reconstructed pre-round design run on the SAME poses
 * (STATE_9 312/680, STATE_3 89/121 — see
 * src/scripts/_close_engine_bug_queue_pcpl_resolver_candidate_set.ts for the
 * full comparison) and the ORIGINALLY-REPORTED defect windows (STATE_9's
 * G-1 symmetric-pose repro; STATE_3's 6500-8800ms window) are CONFIRMED
 * CLOSED. The residual is a NEW, distinct, LARGER structural limit — see
 * engine_bug_queue row
 * readout_resolver_candidate_set_cannot_separate_two_anchors_closer_than_
 * their_own_combined_label_half_widths (OPEN) — not the bug this round was
 * dispatched to fix. Re-run this script after any future change to
 * PM_readoutResolveOffset or its candidate set; do not hand-wave a "looks
 * better" claim without re-running it.
 * calibrated Helvetica model (accurate to <1% against a rendered frame, per
 * that file's own header comment), not p5's real textWidth() (unavailable
 * headlessly).
 *
 * Run: npx tsx src/scripts/_verify_pcpl_resolver_candidate_set_sweep.ts
 */
import { PARAMETRIC_RENDERER_CODE } from "../lib/renderers/parametric_renderer";
import derivConcept from "../data/concepts/mathematics/derivative_as_secant_limit.json";

const SRC = PARAMETRIC_RENDERER_CODE;

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
  "PM_planeInkZones", "PM_planeGridInkZones", "PM_planeCurveExpr",
  "PM_GRID_OVERLAP_TIEBREAK_WEIGHT", "PM_TANGENT_PROBE_EPS", "PM_INK_SEGMENT_SUBDIVISIONS",
];
const FNS = [
  "PM_fmtNum", "PM_clamp", "PM_planeBuildTransform", "PM_planeResolve", "PM_planeRangesOf",
  "PM_buildEvalScope", "PM_safeEval", "PM_functionPlotSample", "PM_plotPointResolve",
  "PM_lineClipToRect", "PM_extendLineToFrame", "PM_secantTangentReadout",
  "PM_secantLineCompute", "PM_tangentLineCompute",
  "PM_readoutAuthoredOffset", "PM_upwardNormal", "PM_labelClearOffset", "PM_rectsOverlap",
  "PM_readoutBBox", "PM_readoutDangerZones", "PM_readoutOffCanvas", "PM_clampOffsetToCanvas",
  "PM_readoutCollides", "PM_readoutResolveOffset",
  "PM_registerInkZone", "PM_registerGridInkZone", "PM_registerLineInk",
  "PM_rectOverlapArea", "PM_readoutHardOverlapArea", "PM_readoutGridOverlapArea", "PM_readoutOverlapArea",
  "PM_plotPointCurveTangentPx",
  "PM_choreoBuildSegments", "PM_choreoSampleSegments", "PM_choreoValue",
];
// eslint-disable-next-line @typescript-eslint/no-implied-eval
const E = new Function([
  ...VARS.map((v) => grabVar(v)),
  ...FNS.map((f) => grabFn(f)),
  "return { " + [...VARS, ...FNS].join(", ") + " };",
].join("\n"))() as any;

// Same calibrated Helvetica model check_cartesian_plane.ts uses (<1% error
// against a rendered frame — see that file's own header comment).
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
const textW13 = (s: string) => textW12(s) * (13 / 12); // label primitives on this concept use font_size 13

type Vec = { x: number; y: number };
type BBox = { x0: number; y0: number; x1: number; y1: number };

function resetFrame(planeId: string) {
  E.PM_planeInkZones[planeId] = [];
  E.PM_planeGridInkZones[planeId] = [];
  E.PM_planeCurveExpr[planeId] = undefined;
}

/** Mirrors drawFunctionPlot's own registration exactly (ink + curve-expr tracking). */
function drawFunctionPlotSim(spec: any, plane: any, planeId: string, vars: Record<string, number>) {
  if (spec.style !== "ghost" || !E.PM_planeCurveExpr[planeId]) E.PM_planeCurveExpr[planeId] = spec.y_expr;
  const domainSpec = spec.x_domain || {};
  const domainMin = typeof domainSpec.min === "number" ? domainSpec.min
    : typeof domainSpec.min_expr === "string" ? E.PM_safeEval(domainSpec.min_expr, vars) : plane.xRange.min;
  const domainMax = typeof domainSpec.max === "number" ? domainSpec.max
    : typeof domainSpec.max_expr === "string" ? E.PM_safeEval(domainSpec.max_expr, vars) : plane.xRange.max;
  const polylines = E.PM_functionPlotSample(spec.y_expr, domainMin, domainMax, spec.samples, vars, plane.yRange);
  const sw = typeof spec.stroke_weight === "number" ? spec.stroke_weight : 3;
  const inkPad = Math.max(sw, 1) + 3;
  for (const poly of polylines) {
    let prevPx: Vec | null = null;
    for (const pt of poly) {
      const px = plane.toPx(pt.x, pt.y);
      if (prevPx) {
        E.PM_registerInkZone(planeId, {
          x0: Math.min(prevPx.x, px.x) - inkPad, y0: Math.min(prevPx.y, px.y) - inkPad,
          x1: Math.max(prevPx.x, px.x) + inkPad, y1: Math.max(prevPx.y, px.y) + inkPad,
        });
      }
      prevPx = px;
    }
  }
}

/** Mirrors drawSecantLine's own registration + readout resolution exactly. */
function drawSecantLineSim(spec: any, plane: any, planeId: string, vars: Record<string, number>): { id: string; bbox: BBox } | null {
  const ranges = { xRange: plane.xRange, yRange: plane.yRange };
  const computed = E.PM_secantLineCompute(spec, vars, ranges);
  if (!computed.valid) return null;
  const p0 = plane.toPx(computed.drawFrom.x, computed.drawFrom.y);
  const p1 = plane.toPx(computed.drawTo.x, computed.drawTo.y);
  E.PM_registerLineInk(planeId, p0, p1, 5);
  if (!computed.readoutText) return null;
  const rFrom = plane.toPx(computed.from.x, computed.from.y);
  const rTo = plane.toPx(computed.to.x, computed.to.y);
  const secAnchor = { x: (rFrom.x + rTo.x) / 2, y: (rFrom.y + rTo.y) / 2 };
  const secTW = textW12(computed.readoutText);
  let secOff = E.PM_readoutAuthoredOffset(spec) || E.PM_labelClearOffset(p0, p1, secTW, 14, 6);
  secOff = E.PM_readoutResolveOffset(secAnchor, secOff, secTW, 14, plane, planeId, { p0, p1 });
  secOff = E.PM_clampOffsetToCanvas(secAnchor, secOff, secTW, 14);
  const bbox = E.PM_readoutBBox(secAnchor, secOff, secTW, 14);
  E.PM_registerInkZone(planeId, bbox);
  return { id: spec.id, bbox };
}

/** Mirrors drawTangentLine's own registration + readout resolution exactly. */
function drawTangentLineSim(spec: any, plane: any, planeId: string, vars: Record<string, number>): { id: string; bbox: BBox } | null {
  const ranges = { xRange: plane.xRange, yRange: plane.yRange };
  const computed = E.PM_tangentLineCompute(spec, vars, ranges);
  if (!computed.valid) return null;
  const p0 = plane.toPx(computed.drawFrom.x, computed.drawFrom.y);
  const p1 = plane.toPx(computed.drawTo.x, computed.drawTo.y);
  E.PM_registerLineInk(planeId, p0, p1, 5);
  if (!computed.readoutText) return null;
  const rAt = plane.toPx(computed.at.x, computed.at.y);
  const tanTW = textW12(computed.readoutText);
  let tanOff = E.PM_readoutAuthoredOffset(spec) || E.PM_labelClearOffset(p0, p1, tanTW, 14, 6);
  tanOff = E.PM_readoutResolveOffset(rAt, tanOff, tanTW, 14, plane, planeId, { p0, p1 });
  tanOff = E.PM_clampOffsetToCanvas(rAt, tanOff, tanTW, 14);
  const bbox = E.PM_readoutBBox(rAt, tanOff, tanTW, 14);
  E.PM_registerInkZone(planeId, bbox);
  return { id: spec.id, bbox };
}

/** Mirrors drawPlotPoint's own registration + readout resolution exactly. */
function drawPlotPointSim(spec: any, plane: any, planeId: string, vars: Record<string, number>, opts: { stripAuthoredOffset?: boolean } = {}): { id: string; bbox: BBox } | null {
  const resolved = E.PM_plotPointResolve(spec, vars);
  const px = plane.toPx(resolved.x, resolved.y);
  const size = typeof spec.size === "number" ? spec.size : 12;
  if (!resolved.readoutText) {
    E.PM_registerInkZone(planeId, { x0: px.x - size / 2 - 3, y0: px.y - size / 2 - 3, x1: px.x + size / 2 + 3, y1: px.y + size / 2 + 3 });
    return null;
  }
  const readoutTW = textW12(resolved.readoutText);
  const tangentPx = E.PM_plotPointCurveTangentPx(spec, vars, plane, resolved.x, resolved.y);
  const defaultOff = tangentPx ? E.PM_labelClearOffset(tangentPx.p0, tangentPx.p1, readoutTW, 14, size / 2 + 8) : { x: 10, y: -12 };
  const authored = opts.stripAuthoredOffset ? null : E.PM_readoutAuthoredOffset(spec);
  const candidateOff = authored || defaultOff;
  let finalOff = E.PM_readoutResolveOffset(px, candidateOff, readoutTW, 14, plane, planeId, tangentPx);
  finalOff = E.PM_clampOffsetToCanvas(px, finalOff, readoutTW, 14);
  const bbox = E.PM_readoutBBox(px, finalOff, readoutTW, 14);
  E.PM_registerInkZone(planeId, bbox);
  E.PM_registerInkZone(planeId, { x0: px.x - size / 2 - 3, y0: px.y - size / 2 - 3, x1: px.x + size / 2 + 3, y1: px.y + size / 2 + 3 });
  return { id: spec.id, bbox };
}

function checkNoOverlaps(readouts: { id: string; bbox: BBox }[]): string[] {
  const violations: string[] = [];
  for (let i = 0; i < readouts.length; i++) {
    for (let j = i + 1; j < readouts.length; j++) {
      if (E.PM_rectsOverlap(readouts[i].bbox, readouts[j].bbox)) {
        violations.push(`${readouts[i].id} x ${readouts[j].id}`);
      }
    }
  }
  return violations;
}

// ── Locate STATE_9 / STATE_3 scene_composition + plane spec straight out of
// the committed JSON, so this sweep drives the REAL authored content, never
// a hand-copied approximation. ──────────────────────────────────────────
const states = (derivConcept as any).epic_l_path.states;
const state9 = states.STATE_9;
const state3 = states.STATE_3;

function findPrim(scene: any[], type: string, id?: string): any {
  return scene.find((p) => p.type === type && (id === undefined || p.id === id));
}

console.log("========================================================================");
console.log("SWEEP 1 — derivative_as_secant_limit STATE_9, authored offsets DELETED");
console.log("x0 in [-1.6,1.6] step 0.2 x xq in [-1.9,2.0] step 0.1 (680 poses)");
console.log("========================================================================");
{
  const scene9 = state9.scene_composition;
  const planeSpec = findPrim(scene9, "cartesian_plane", "plane");
  const curveSpec = findPrim(scene9, "function_plot", "curve");
  const qSpec = { ...findPrim(scene9, "plot_point", "Q") };
  const pSpec = { ...findPrim(scene9, "plot_point", "P") };
  const secSpec = findPrim(scene9, "secant_line", "sec");
  const tanSpec = findPrim(scene9, "tangent_line", "tan");
  delete qSpec.readout.offset; // "with all authored readout offsets deleted"
  delete pSpec.readout.offset;
  const planeId = planeSpec.id;
  const plane = E.PM_planeBuildTransform(planeSpec);

  const x0Vals: number[] = [];
  for (let x0 = -1.6; x0 <= 1.6 + 1e-9; x0 += 0.2) x0Vals.push(Math.round(x0 * 1e6) / 1e6);
  const xqVals: number[] = [];
  for (let xq = -1.9; xq <= 2.0 + 1e-9; xq += 0.1) xqVals.push(Math.round(xq * 1e6) / 1e6);
  console.log(`x0 samples: ${x0Vals.length} (expect 17) | xq samples: ${xqVals.length} (expect 40) | total poses: ${x0Vals.length * xqVals.length} (expect 680)`);

  let posesChecked = 0;
  let posesWithOverlap = 0;
  let posesWithOverlapNearAnchor = 0; // |xq - x0| < 0.35 (P/Q dots themselves close together)
  const allViolations: string[] = [];
  for (const x0 of x0Vals) {
    for (const xq of xqVals) {
      resetFrame(planeId);
      const vars = { x0, xq };
      drawFunctionPlotSim(curveSpec, plane, planeId, vars);
      const readouts: { id: string; bbox: BBox }[] = [];
      const secR = drawSecantLineSim(secSpec, plane, planeId, vars);
      if (secR) readouts.push(secR);
      const tanR = drawTangentLineSim(tanSpec, plane, planeId, vars);
      if (tanR) readouts.push(tanR);
      // Draw order within plot_point pass = SCENE ARRAY ORDER: Q is authored
      // before P in STATE_9 (Q registers first; P sees Q's ink).
      const qR = drawPlotPointSim(qSpec, plane, planeId, vars, { stripAuthoredOffset: true });
      if (qR) readouts.push(qR);
      const pR = drawPlotPointSim(pSpec, plane, planeId, vars, { stripAuthoredOffset: true });
      if (pR) readouts.push(pR);

      posesChecked++;
      const violations = checkNoOverlaps(readouts);
      if (violations.length > 0) {
        posesWithOverlap++;
        if (Math.abs(xq - x0) < 0.35) posesWithOverlapNearAnchor++;
        allViolations.push(`x0=${x0.toFixed(2)}, xq=${xq.toFixed(2)} (|xq-x0|=${Math.abs(xq - x0).toFixed(2)}): ${violations.join(", ")}`);
      }
    }
  }
  console.log(`Poses checked: ${posesChecked}`);
  console.log(`Poses with >=1 overlapping readout-bbox pair: ${posesWithOverlap}`);
  console.log(`  ...of which |xq-x0| < 0.35 (P/Q anchors themselves within ~28px, a fraction of an ~85px-wide box): ${posesWithOverlapNearAnchor}`);
  console.log(`  ...of which |xq-x0| >= 0.35 (anchors NOT close — a genuine placement miss, not anchor convergence): ${posesWithOverlap - posesWithOverlapNearAnchor}`);
  if (allViolations.length > 0) {
    console.log(`First 20 of ${allViolations.length} violations:`);
    for (const v of allViolations.slice(0, 20)) console.log("  " + v);
  }
  // The founder report's OWN named reproduction: x0=1.00, xq=-1.00 (the
  // exactly-symmetric pose, chord slope 0.0000, G-1's worked example).
  const g1Hit = allViolations.some((v) => v.startsWith("x0=1.00, xq=-1.00"));
  console.log(`G-1's own named reproduction (x0=1.00, xq=-1.00): ${g1Hit ? "STILL OVERLAPS" : "CLEAN — no longer overlaps"}`);
  console.log(posesWithOverlap === 0 ? "RESULT: PASS — zero overlapping readout bboxes across all 680 poses" : `RESULT: FAIL — ${posesWithOverlap}/${posesChecked} poses overlap`);
}

console.log("\n========================================================================");
console.log("SWEEP 2 — derivative_as_secant_limit STATE_3, authored offsets INTACT");
console.log("t in [0,24000] step 200ms (121 poses)");
console.log("========================================================================");
{
  const scene3 = state3.scene_composition;
  const planeSpec = findPrim(scene3, "cartesian_plane", "plane");
  const curveSpec = findPrim(scene3, "function_plot", "curve");
  const pSpec = findPrim(scene3, "plot_point", "P");
  const qSpec = findPrim(scene3, "plot_point", "Q");
  const secSpec = findPrim(scene3, "secant_line", "sec");
  const planeId = planeSpec.id;
  const plane = E.PM_planeBuildTransform(planeSpec);
  const choreo = state3.variable_choreography[0]; // hlog
  const x0 = 1; // physics_engine_config.variables.x0.default; no variable_overrides in STATE_3

  const tVals: number[] = [];
  for (let t = 0; t <= 24000; t += 200) tVals.push(t);
  console.log(`t samples: ${tVals.length} (expect 121)`);

  let posesChecked = 0;
  let posesWithOverlap = 0;
  const violationLog: string[] = [];
  let minGapMs = Infinity, minGapAt = 0;
  for (const t of tVals) {
    const hlog = E.PM_choreoValue(choreo, t);
    resetFrame(planeId);
    const vars = { x0, hlog };
    drawFunctionPlotSim(curveSpec, plane, planeId, vars);
    const readouts: { id: string; bbox: BBox }[] = [];
    // FIXED PASS ORDER (function_plot -> secant_line -> tangent_line ->
    // plot_point, CP-C2/D12) — secant_line draws and registers its OWN ink
    // + readout box BEFORE either plot_point, regardless of its LATER
    // position in this state's scene_composition array (author-order only
    // controls order WITHIN one primitive type's own pass). Within the
    // plot_point pass: array order is P then Q in STATE_3 (opposite of
    // STATE_9) — P registers first, Q sees P's ink.
    const secR = drawSecantLineSim(secSpec, plane, planeId, vars);
    if (secR) readouts.push(secR);
    const pR = drawPlotPointSim(pSpec, plane, planeId, vars);
    if (pR) readouts.push(pR);
    const qR = drawPlotPointSim(qSpec, plane, planeId, vars);
    if (qR) readouts.push(qR);

    posesChecked++;
    const violations = checkNoOverlaps(readouts);
    if (violations.length > 0) {
      posesWithOverlap++;
      violationLog.push(`t=${t}ms (hlog=${hlog.toFixed(4)}): ${violations.join(", ")}`);
    }
    // Track worst-case (smallest) clearance between P and Q boxes even when
    // not overlapping, so a near-miss right at the reported 6500-8800ms
    // window is visible in the report even if it does not cross to a FAIL.
    if (pR && qR) {
      const gap = Math.max(
        pR.bbox.x0 - qR.bbox.x1, qR.bbox.x0 - pR.bbox.x1,
        pR.bbox.y0 - qR.bbox.y1, qR.bbox.y0 - pR.bbox.y1
      );
      if (gap < minGapMs) { minGapMs = gap; minGapAt = t; }
    }
  }
  console.log(`Poses checked: ${posesChecked}`);
  console.log(`Poses with >=1 overlapping readout-bbox pair: ${posesWithOverlap}`);
  console.log(`Worst-case (smallest) P-vs-Q separation-axis gap: ${minGapMs.toFixed(1)}px at t=${minGapAt}ms (negative = overlap)`);
  if (violationLog.length > 0) {
    console.log("Violations:");
    for (const v of violationLog) console.log("  " + v);
  }
  console.log(posesWithOverlap === 0 ? "RESULT: PASS — zero overlapping readout bboxes across all 121 time samples" : `RESULT: FAIL — ${posesWithOverlap}/${posesChecked} poses overlap`);

  // ── The ORIGINALLY-REPORTED defect window, re-checked at 25ms resolution
  // (the founder's own complaint: "the known defect is 6500-8800ms and fell
  // between three prior samples" at 200ms spacing) — confirms that specific
  // window is now genuinely clean, independent of the 200ms-grid result
  // above. ────────────────────────────────────────────────────────────────
  let fineViolations = 0;
  const fineChecked: number[] = [];
  for (let t = 6500; t <= 8800; t += 25) {
    fineChecked.push(t);
    const hlog = E.PM_choreoValue(choreo, t);
    resetFrame(planeId);
    const vars = { x0, hlog };
    drawFunctionPlotSim(curveSpec, plane, planeId, vars);
    const readouts: { id: string; bbox: BBox }[] = [];
    const secR = drawSecantLineSim(secSpec, plane, planeId, vars);
    if (secR) readouts.push(secR);
    const pR = drawPlotPointSim(pSpec, plane, planeId, vars);
    if (pR) readouts.push(pR);
    const qR = drawPlotPointSim(qSpec, plane, planeId, vars);
    if (qR) readouts.push(qR);
    if (checkNoOverlaps(readouts).length > 0) fineViolations++;
  }
  console.log(`\nOriginally-reported window (6500-8800ms) re-swept at 25ms resolution: ${fineChecked.length} samples, ${fineViolations} violations — ${fineViolations === 0 ? "CONFIRMED CLOSED" : "STILL PRESENT"}`);
}
