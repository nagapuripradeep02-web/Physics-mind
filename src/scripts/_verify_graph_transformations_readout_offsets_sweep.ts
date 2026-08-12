/**
 * ONE-TIME dispatch verification — graph_transformations Checkpoint B
 * cycle-2 offset audit (2026-08-08), the "sweep, not samples" acceptance bar
 * the founder specified: for EVERY authored `readout.offset` in this
 * concept, drive BOTH variants — offset KEPT (current authored JSON) and
 * offset DELETED (falls through to the engine round's curve-tangent
 * default, PR #64) — through the SAME fixed Pass-0.3 draw order the live
 * renderer uses (function_plot pass in scene_composition array order, THEN
 * plot_point pass in array order), using the SAME pure functions pulled out
 * of PARAMETRIC_RENDERER_CODE by brace-matching (the identical technique
 * check_cartesian_plane.ts and
 * _verify_pcpl_resolver_candidate_set_sweep.ts use).
 *
 * "Foreign ink px" is measured literally, not via the resolver's own padded
 * obstacle-rect area: every function_plot / vector primitive's stroke is
 * rasterized at its REAL stroke_weight (no +3 safety pad) along 0.5px
 * sub-segments, and every touched integer pixel inside the readout's FINAL
 * (post-resolve, post-clamp) bbox is counted once. Gridline ink is NEVER
 * rasterized (explicitly out of scope per the founder's dispatch — a
 * vertical-gridline crossing is engine-owned and no placement, including
 * deleting the offset, can avoid it). The readout's own text is never
 * rasterized either (only curves/lines are), so "own text colour excluded"
 * is true by construction — nothing to subtract.
 *
 * Sweep grid per state: every 100ms from t=0 to the state's own duration*1000
 * (STATE_8's authored duration is 0 — an explore/free-run state — so it is
 * swept across one full ping_pong period, 8000ms, instead), PLUS the exact
 * eye_capture_ms pin for states that author one. STATE_1's two plot_points
 * (pen_point, P_point) are tested in all 4 keep/delete combinations since
 * they can be simultaneously visible (P_point appears at 13500ms); every
 * other state has exactly one plot_point readout, so 2 combinations.
 *
 * Run: npx tsx src/scripts/_verify_graph_transformations_readout_offsets_sweep.ts
 */
import { PARAMETRIC_RENDERER_CODE } from "../lib/renderers/parametric_renderer";
import concept from "../data/concepts/mathematics/graph_transformations.json";

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
  "PM_TANGENT_SEGMENT_HALF_WIDTH_FRAC", "PM_CANVAS_W",
  "PM_planeInkZones", "PM_planeGridInkZones", "PM_planeCurveExpr",
  "PM_GRID_OVERLAP_TIEBREAK_WEIGHT", "PM_TANGENT_PROBE_EPS", "PM_INK_SEGMENT_SUBDIVISIONS",
  "PM_simClockMs",
];
const FNS = [
  "PM_fmtNum", "PM_clamp", "PM_planeBuildTransform",
  "PM_buildEvalScope", "PM_safeEval", "PM_safeEvalPoint", "PM_functionPlotSample", "PM_plotPointResolve",
  "PM_readoutAuthoredOffset", "PM_upwardNormal", "PM_labelClearOffset", "PM_rectsOverlap",
  "PM_readoutBBox", "PM_readoutDangerZones", "PM_readoutOffCanvas", "PM_clampOffsetToCanvas",
  "PM_readoutCollides", "PM_readoutResolveOffset",
  "PM_registerInkZone", "PM_registerGridInkZone", "PM_registerLineInk",
  "PM_rectOverlapArea", "PM_readoutHardOverlapArea", "PM_readoutGridOverlapArea", "PM_readoutOverlapArea",
  "PM_plotPointCurveTangentPx",
  "PM_choreoBuildSegments", "PM_choreoSampleSegments", "PM_choreoValue",
  "PM_animationGate",
];
// Synthetic setter — PM_simClockMs is a primitive (number), so
// E.PM_simClockMs = t only rewrites the RETURNED snapshot object's property,
// never the closure variable PM_animationGate actually reads. A hand-written
// setter defined in the SAME `new Function` body mutates the real binding.
const CLOCK_SETTER = "function PM_dbgSetClock(v) { PM_simClockMs = v; }";
// eslint-disable-next-line @typescript-eslint/no-implied-eval
const E = new Function([
  ...VARS.map((v) => grabVar(v)),
  ...FNS.map((f) => grabFn(f)),
  CLOCK_SETTER,
  "return { " + [...VARS, ...FNS, "PM_dbgSetClock"].join(", ") + " };",
].join("\n"))() as any;

// Same calibrated Helvetica model check_cartesian_plane.ts /
// _verify_pcpl_resolver_candidate_set_sweep.ts use (<1% error against a
// rendered frame). Readout text is drawn at textSize(12) always (drawPlotPoint
// hardcodes it), textH is always 14 (also hardcoded at every call site).
const HELV_W: Record<string, number> = (() => {
  const m: Record<string, number> = { " ": 278, "(": 333, ")": 333, ",": 278, "-": 333, ".": 278, "/": 278, "=": 584, "+": 584, "'": 180, "′": 180, "−": 584 };
  for (const d of "0123456789") m[d] = 556;
  const up = "667 667 722 722 667 611 778 722 278 500 667 556 833 722 778 667 778 722 667 611 722 667 944 667 667 611".split(" ").map(Number);
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((c, i) => { m[c] = up[i]; });
  const lo = "556 556 500 556 556 278 556 556 222 222 500 222 833 556 556 556 556 333 500 278 556 500 722 500 500 500".split(" ").map(Number);
  "abcdefghijklmnopqrstuvwxyz".split("").forEach((c, i) => { m[c] = lo[i]; });
  return m;
})();
const textW12 = (s: string) => [...s].reduce((a, c) => a + (HELV_W[c] ?? 556), 0) / 1000 * 12;

type Vec = { x: number; y: number };
type BBox = { x0: number; y0: number; x1: number; y1: number };
type RawSeg = { p0: Vec; p1: Vec; sw: number };

function resetFrame(planeId: string) {
  E.PM_planeInkZones[planeId] = [];
  E.PM_planeGridInkZones[planeId] = [];
  E.PM_planeCurveExpr[planeId] = undefined;
}

/** Mirrors drawFunctionPlot's gating + curveExpr tracking + ink registration
 * exactly, AND returns the raw (unpadded, real stroke_weight) segments for
 * MY OWN literal foreign-ink rasterization below. */
function stepFunctionPlot(spec: any, plane: any, planeId: string, vars: Record<string, number>): RawSeg[] {
  const gate = E.PM_animationGate(spec);
  if (!gate.visible) return [];
  if (spec.style !== "ghost" || !E.PM_planeCurveExpr[planeId]) E.PM_planeCurveExpr[planeId] = spec.y_expr;
  const domainSpec = spec.x_domain || {};
  const domainMin = typeof domainSpec.min === "number" ? domainSpec.min
    : typeof domainSpec.min_expr === "string" ? E.PM_safeEval(domainSpec.min_expr, vars) : plane.xRange.min;
  const domainMax = typeof domainSpec.max === "number" ? domainSpec.max
    : typeof domainSpec.max_expr === "string" ? E.PM_safeEval(domainSpec.max_expr, vars) : plane.xRange.max;
  const polylines = E.PM_functionPlotSample(spec.y_expr, domainMin, domainMax, spec.samples, vars, plane.yRange);
  const sw = typeof spec.stroke_weight === "number" ? spec.stroke_weight : 3;
  const inkPad = Math.max(sw, 1) + 3;
  const raw: RawSeg[] = [];
  for (const poly of polylines) {
    let prevPx: Vec | null = null;
    for (const pt of poly) {
      const px = plane.toPx(pt.x, pt.y);
      if (prevPx) {
        E.PM_registerInkZone(planeId, {
          x0: Math.min(prevPx.x, px.x) - inkPad, y0: Math.min(prevPx.y, px.y) - inkPad,
          x1: Math.max(prevPx.x, px.x) + inkPad, y1: Math.max(prevPx.y, px.y) + inkPad,
        });
        raw.push({ p0: prevPx, p1: px, sw });
      }
      prevPx = px;
    }
  }
  return raw;
}

/** Mirrors drawVector's endpoint resolution for a plane-anchored line vector
 * (bracket_vector, STATE_5) — from_expr/to_expr only (this concept never
 * authors an anchor-string or magnitude/direction vector). Vectors are NOT
 * registered into the resolver's own obstacle set (drawVector never calls
 * PM_registerInkZone — verified in source), so this contributes ONLY to my
 * literal foreign-ink rasterization, never to PM_readoutResolveOffset's
 * placement decision (matching the live renderer exactly). */
function stepVectorLine(spec: any, plane: any, vars: Record<string, number>): RawSeg[] {
  const gate = E.PM_animationGate(spec);
  if (!gate.visible) return [];
  const from = typeof spec.from_expr === "string" ? E.PM_safeEvalPoint(spec.from_expr, vars) : spec.from;
  const to = typeof spec.to_expr === "string" ? E.PM_safeEvalPoint(spec.to_expr, vars) : spec.to;
  if (!from || !to) return [];
  const p0 = plane.toPx(from.x, from.y);
  const p1 = plane.toPx(to.x, to.y);
  if (!p0 || !p1) return [];
  return [{ p0, p1, sw: 2 }]; // drawVector hardcodes strokeWeight(2)
}

/** Mirrors drawPlotPoint's own readout resolution exactly (gate, resolve,
 * default-offset-via-curve-tangent, ordered candidate resolve, canvas
 * clamp, __pmDebug-equivalent record, own-box + own-dot ink registration). */
function stepPlotPoint(
  spec: any, plane: any, planeId: string, vars: Record<string, number>,
  opts: { stripAuthoredOffset: boolean },
): { id: string; bbox: BBox; anchor: Vec; offset: Vec; text: string } | null {
  const gate = E.PM_animationGate(spec);
  if (!gate.visible) return null;
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
  return { id: spec.id, bbox, anchor: px, offset: finalOff, text: resolved.readoutText };
}

/** Literal foreign-ink pixel count: rasterizes every raw segment at its
 * real stroke width along 0.5px sub-steps, and counts unique integer pixels
 * that land inside bbox. No padding, no gridlines, no text — curve/vector
 * ink only, exactly what a real screenshot's non-background pixels inside
 * the readout box would show. */
function foreignInkPx(segments: RawSeg[], bbox: BBox): number {
  const covered = new Set<number>();
  const KEY_W = 4096;
  for (const seg of segments) {
    const halfW = seg.sw / 2;
    const segMinX = Math.min(seg.p0.x, seg.p1.x) - halfW, segMaxX = Math.max(seg.p0.x, seg.p1.x) + halfW;
    const segMinY = Math.min(seg.p0.y, seg.p1.y) - halfW, segMaxY = Math.max(seg.p0.y, seg.p1.y) + halfW;
    if (segMaxX < bbox.x0 || segMinX > bbox.x1 || segMaxY < bbox.y0 || segMinY > bbox.y1) continue;
    const len = Math.hypot(seg.p1.x - seg.p0.x, seg.p1.y - seg.p0.y);
    const steps = Math.max(1, Math.ceil(len / 0.5));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const cx = seg.p0.x + (seg.p1.x - seg.p0.x) * t;
      const cy = seg.p0.y + (seg.p1.y - seg.p0.y) * t;
      const xMin = Math.max(Math.floor(bbox.x0), Math.floor(cx - halfW));
      const xMax = Math.min(Math.ceil(bbox.x1) - 1, Math.ceil(cx + halfW) - 1);
      const yMin = Math.max(Math.floor(bbox.y0), Math.floor(cy - halfW));
      const yMax = Math.min(Math.ceil(bbox.y1) - 1, Math.ceil(cy + halfW) - 1);
      for (let px = xMin; px <= xMax; px++) {
        for (let py = yMin; py <= yMax; py++) covered.add(px * KEY_W + py);
      }
    }
  }
  return covered.size;
}

// ── Concept-wide defaults (physics_engine_config.variables[*].default) ────
const DEFAULTS: Record<string, number> = {};
for (const [k, v] of Object.entries((concept as any).physics_engine_config.variables)) {
  DEFAULTS[k] = (v as any).default;
}

function resolveVarsAtTime(state: any, tMs: number): Record<string, number> {
  const vars: Record<string, number> = { ...DEFAULTS };
  for (const spec of state.variable_choreography || []) {
    vars[spec.variable] = E.PM_choreoValue(spec, tMs);
  }
  return vars;
}

function findAll(scene: any[], type: string): any[] {
  return scene.filter((p) => p.type === type);
}

interface ReadoutResult {
  stateId: string; readoutId: string; variantLabel: string;
  atCapturePx: number | null; maxMidSweepPx: number; maxMidSweepAtMs: number;
  sampleCount: number;
}

const states = (concept as any).epic_l_path.states;
const STATE_IDS = Object.keys(states);
const results: ReadoutResult[] = [];

for (const stateId of STATE_IDS) {
  const state = states[stateId];
  const scene: any[] = state.scene_composition;
  const planeSpec = scene.find((p) => p.type === "cartesian_plane");
  const planeId = planeSpec.id;
  const plane = E.PM_planeBuildTransform(planeSpec);
  const functionPlots = findAll(scene, "function_plot");
  const vectors = findAll(scene, "vector");
  const plotPoints = findAll(scene, "plot_point").filter((p) => p.readout);
  const eyeCaptureMs: number | undefined = state.eye_capture_ms;
  const durationMs = (typeof state.duration === "number" && state.duration > 0) ? state.duration * 1000 : 8000; // STATE_8 explore: one ping_pong period

  const tSamples: number[] = [];
  for (let t = 0; t <= durationMs; t += 100) tSamples.push(t);
  if (eyeCaptureMs != null && !tSamples.includes(eyeCaptureMs)) tSamples.push(eyeCaptureMs);
  tSamples.sort((a, b) => a - b);

  const nPoints = plotPoints.length;
  const combos = 1 << nPoints; // bit i set => readout i offset DELETED

  for (let combo = 0; combo < combos; combo++) {
    const variantLabel = plotPoints.map((p, i) => `${p.id}=${(combo & (1 << i)) ? "DEL" : "KEEP"}`).join(",");
    const perReadout: Record<string, { atCapturePx: number | null; maxMidSweepPx: number; maxMidSweepAtMs: number; samples: number }> = {};
    for (const p of plotPoints) perReadout[p.id] = { atCapturePx: null, maxMidSweepPx: 0, maxMidSweepAtMs: -1, samples: 0 };

    for (const t of tSamples) {
      E.PM_dbgSetClock(t);
      resetFrame(planeId);
      const vars = resolveVarsAtTime(state, t);
      const rawInk: RawSeg[] = [];
      for (const fp of functionPlots) rawInk.push(...stepFunctionPlot(fp, plane, planeId, vars));
      for (const v of vectors) rawInk.push(...stepVectorLine(v, plane, vars));
      for (let i = 0; i < plotPoints.length; i++) {
        const p = plotPoints[i];
        const strip = !!(combo & (1 << i));
        const r = stepPlotPoint(p, plane, planeId, vars, { stripAuthoredOffset: strip });
        if (!r) continue;
        const px = foreignInkPx(rawInk, r.bbox);
        const rec = perReadout[p.id];
        rec.samples++;
        if (t === eyeCaptureMs) rec.atCapturePx = px;
        if (px > rec.maxMidSweepPx) { rec.maxMidSweepPx = px; rec.maxMidSweepAtMs = t; }
      }
    }

    for (const p of plotPoints) {
      const rec = perReadout[p.id];
      results.push({
        stateId, readoutId: p.id, variantLabel,
        atCapturePx: rec.atCapturePx, maxMidSweepPx: rec.maxMidSweepPx, maxMidSweepAtMs: rec.maxMidSweepAtMs,
        sampleCount: rec.samples,
      });
    }
  }
}

// ── Report ──────────────────────────────────────────────────────────────
console.log("========================================================================");
console.log("graph_transformations — readout.offset KEEP-vs-DELETE sweep");
console.log("Foreign ink = curve/vector line ink only (gridlines + own text excluded)");
console.log("Acceptance bar: 0 px at eye_capture_ms, <20 px anywhere mid-sweep");
console.log("========================================================================\n");

for (const stateId of STATE_IDS) {
  const rows = results.filter((r) => r.stateId === stateId);
  if (rows.length === 0) continue;
  console.log(`-- ${stateId} (${states[stateId].title}) --`);
  for (const r of rows) {
    const capStr = r.atCapturePx == null ? "n/a" : `${r.atCapturePx}px`;
    const pass = (r.atCapturePx == null || r.atCapturePx === 0) && r.maxMidSweepPx < 20 ? "PASS" : "FAIL";
    console.log(
      `  [${r.variantLabel}] ${r.readoutId}: at_capture=${capStr} | max_mid_sweep=${r.maxMidSweepPx}px @ t=${r.maxMidSweepAtMs}ms | n=${r.sampleCount} | ${pass}`,
    );
  }
}

console.log("\n========================================================================");
console.log("PER-READOUT DECISION (all-kept-in-state baseline vs all-deleted-in-state)");
console.log("========================================================================");
for (const stateId of STATE_IDS) {
  const state = states[stateId];
  const plotPoints = findAll(state.scene_composition, "plot_point").filter((p: any) => p.readout);
  if (plotPoints.length === 0) continue;
  const nPoints = plotPoints.length;
  const allKeptLabel = plotPoints.map((p: any) => `${p.id}=KEEP`).join(",");
  const allDeletedLabel = plotPoints.map((p: any) => `${p.id}=DEL`).join(",");
  for (const p of plotPoints) {
    const kept = results.find((r) => r.stateId === stateId && r.readoutId === p.id && r.variantLabel === allKeptLabel)!;
    const deleted = results.find((r) => r.stateId === stateId && r.readoutId === p.id && r.variantLabel === allDeletedLabel)!;
    const keptScore = (kept.atCapturePx ?? 0) * 1000 + kept.maxMidSweepPx;
    const delScore = (deleted.atCapturePx ?? 0) * 1000 + deleted.maxMidSweepPx;
    const verdict = delScore <= keptScore ? "DELETE (equal or better)" : "KEEP (deletion measurably worse)";
    console.log(
      `${stateId}.${p.id}: KEPT[cap=${kept.atCapturePx ?? "n/a"}px, mid<=${kept.maxMidSweepPx}px] `
      + `vs DELETED[cap=${deleted.atCapturePx ?? "n/a"}px, mid<=${deleted.maxMidSweepPx}px] -> ${verdict}`,
    );
  }
}
