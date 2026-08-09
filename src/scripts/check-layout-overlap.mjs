// Layout-overlap check for a concept's states (Gate 9).
// Replicates the parametric renderer's coord + text-box math so an author can see
// real visual collisions before handoff (json_author / quality_auditor Gate 9).
// Does NOT replicate PM_resolveAnnotationOverlap's shifts (annotation<->annotation
// only) — we want the RAW authored collisions.
//
// Usage:  node src/scripts/check-layout-overlap.mjs <path-or-concept-id>
//   node src/scripts/check-layout-overlap.mjs src/data/concepts/current_not_vector.json
//   node src/scripts/check-layout-overlap.mjs bohr_model_energy_levels   # physics OR chemistry
//
// Box model mirrors src/lib/renderers/parametric_renderer.ts draw fns:
//   label       drawLabel      textAlign(CENTER,CENTER), font_size default 14, lineH = size*1.25 — CENTRE-anchored
//   annotation  drawAnnotation textAlign(LEFT,TOP),      font_size 12,         lineH = size*1.35 + pad — TOP-LEFT-anchored
//   formula_box                treated as annotation (top-left text block)
//   force_arrow drawForceArrow body-anchored or literal origin -> tip, + a tip label box
//
// States are ENUMERATED from the concept JSON (epic_l_path.states + every
// epic_c_branches[].states) — never a hardcoded list. 62 concepts on master have
// more than five states (up to 11) and every concept with EPIC-C branches carries
// more still, so a fixed STATE_1..STATE_5 array reported clean on states it had
// never looked at. A checker that silently skips states is worse than no checker:
// it converts an unchecked area into a green tick.
// (engine_bug_queue: layout_overlap_script_hardcodes_first_five_states, 2026-07-24)
//
// PLANE-TRANSFORM + TEMPORAL-WINDOW AWARENESS (founder_proxy Checkpoint B cycle 3,
// definite_integral_as_accumulated_area, 2026-08-09). Two false-positive causes,
// both verified live before this fix and both re-verified absent after it:
//
// (a) A label/annotation carrying `plane_id` lives inside a `cartesian_plane`
//     primitive's DATA-space coordinate system (x_range/y_range mapped onto a
//     pixel viewport — mirrors PM_planeBuildTransform in parametric_renderer.ts).
//     This script previously read `p.position.x/.y` as PIXEL coordinates
//     unconditionally, so a data-space position like {x:0.5, y:1.5} was reported
//     as a box near canvas pixel (0.5, 1.5) — hundreds of pixels from where the
//     label actually paints. `resolveAnchorEnvelope` below now resolves the
//     plane's transform (STATIC ranges only — a plane whose x_range/y_range
//     itself carries a *_expr live re-zoom, e.g. STATE_4's plane_inset magnifier,
//     is explicitly UNRESOLVABLE by this checker and SKIPPED with a named reason,
//     never guessed) and maps the label's data-space point(s) through it.
// (b) A `position_expr`-driven label (the anchor tracks a choreographed variable,
//     e.g. a reveal bound sweeping 0 -> 2 over several seconds) has no SINGLE
//     position — it has a whole swept RANGE of positions across the state's
//     runtime. This script now resolves every identifier in the expr against
//     the state's `variable_choreography` (a sweep range) or the concept's
//     declared `physics_engine_config.variables`/`formulas`/`computed_outputs`
//     (a fixed per-state value, recursively resolved), samples the swept
//     range, and unions the resulting pixel-space anchor points into one
//     envelope before building the text box — matching how a human reviewer
//     verified STATE_7's curve_label/accum_curve_label kept a minimum 76.5px
//     separation "across the whole beta ramp", not at one instant. An
//     expression referencing an identifier this script cannot resolve (not a
//     declared variable, formula, choreographed sweep, or Math builtin) is
//     SKIPPED with the exact identifier named — never silently treated as
//     pixel space (the original defect's own direction of error).
// (c) Two primitives whose authored `appear_at_ms`/`disappear_at_ms` windows
//     never overlap by more than one rendered frame (~16.7ms) are never
//     simultaneously on screen, so a spatial collision between them is not a
//     real collision — it is two different pictures the checker was comparing
//     as if they were one. `windowsOverlap` below gates every pair on this
//     before reporting a COLLISION.
// (engine_bug_queue: pcpl_layout_overlap_checker_measures_data_space_labels_
// against_pixel_space_boxes_and_ignores_temporal_disjointness, 2026-08-09)
import fs from 'node:fs';
import path from 'node:path';

// ── Resolve the concept path ────────────────────────────────────────────────
const arg = process.argv[2];
if (!arg) {
  console.error('usage: node src/scripts/check-layout-overlap.mjs <path-or-concept-id>');
  process.exit(1);
}

function resolveConceptPath(a) {
  // A real path (has a separator or a .json suffix) is used verbatim.
  if (a.includes('/') || a.includes('\\') || a.endsWith('.json')) return a;
  // A bare concept id resolves against the flat physics dir first, then each
  // SUBJECT namespace. The mathematics entry was missing, so this script could
  // not scan a mathematics concept at all — it died on ENOENT against the flat
  // path. Same blindness class as validate:concepts' non-recursive scan, which
  // left chemistry with no CI coverage for five sessions: a subject subfolder
  // that no tool enumerates is a subject with no tooling. Enumerate the
  // namespaces here rather than adding them one incident at a time.
  const SUBJECT_DIRS = ['chemistry', 'mathematics'];
  const candidates = [
    path.join('src/data/concepts', `${a}.json`),
    ...SUBJECT_DIRS.map((s) => path.join('src/data/concepts', s, `${a}.json`)),
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return candidates[0]; // let the read fail with a clear ENOENT on the expected path
}

const PATH = resolveConceptPath(arg);
const json = JSON.parse(fs.readFileSync(PATH, 'utf8'));

// p5 textWidth is font-dependent; ~0.55*font_size per char estimates the sans
// font the renderer uses. The old flat CHAR_W=7/LINE_H=17 model assumed a ~29px
// annotation box for what is now a 12px label font, which both missed real
// collisions and manufactured false ones.
const CHAR_W_RATIO = 0.55;
const CHAR_W = 7;   // retained for the force_arrow tip-label estimate below

// ── Live-variable resolution (mirrors PM_buildEvalScope / PM_safeEval /
// PM_choreoValue's from/to range in parametric_renderer.ts, hand-ported —
// pure arithmetic, no p5/DOM dependency, safe to duplicate per that file's
// own "Box model mirrors..." convention already used throughout this script).
const MATH_SCOPE_KEYS = ['sqrt', 'atan2', 'atan', 'asin', 'acos', 'sin', 'cos', 'tan',
  'abs', 'min', 'max', 'pow', 'log', 'exp', 'PI', 'E', 'round', 'floor', 'ceil', 'sign'];

function declaredVariables() {
  return (json.physics_engine_config && json.physics_engine_config.variables) || {};
}

// formulas + computed_outputs carry the SAME strings (name -> expr vs name ->
// {formula: expr}) — merge them so either authoring convention resolves.
function declaredFormulas() {
  const cfg = json.physics_engine_config || {};
  const out = Object.assign({}, cfg.formulas || {});
  const co = cfg.computed_outputs;
  if (co && typeof co === 'object') {
    for (const name of Object.keys(co)) {
      if (!(name in out) && co[name] && typeof co[name].formula === 'string') out[name] = co[name].formula;
    }
  }
  return out;
}

function exprIdentifiers(expr) {
  return Array.from(new Set((String(expr).match(/[A-Za-z_]\w*/g) || [])));
}

// A variable choreographed in THIS state sweeps between from/to (every mode —
// once/loop/ping_pong — stays within [min(from,to), max(from,to)]), so the
// full swept RANGE, not a single instant, is what a static layout check needs.
function sweptRangesForState(state) {
  const out = new Map();
  const choreo = state && state.variable_choreography;
  if (Array.isArray(choreo)) {
    for (const c of choreo) {
      if (!c || typeof c.variable !== 'string') continue;
      const from = typeof c.from === 'number' ? c.from : 0;
      const to = typeof c.to === 'number' ? c.to : from;
      const lo = Math.min(from, to), hi = Math.max(from, to);
      const prev = out.get(c.variable);
      out.set(c.variable, prev ? { lo: Math.min(prev.lo, lo), hi: Math.max(prev.hi, hi) } : { lo, hi });
    }
  }
  return out;
}

// A variable NOT choreographed in this state is fixed for the whole state at
// its declared default, or this state's own variable_overrides value.
function fixedVarsForState(state) {
  const vars = declaredVariables();
  const out = {};
  for (const name of Object.keys(vars)) {
    const v = vars[name];
    out[name] = (v && typeof v.default === 'number') ? v.default : 0;
  }
  const overrides = state && state.variable_overrides;
  if (overrides && typeof overrides === 'object') {
    for (const k of Object.keys(overrides)) {
      if (typeof overrides[k] === 'number') out[k] = overrides[k];
    }
  }
  return out;
}

function safeEvalExpr(expr, scope) {
  try {
    const keys = Object.keys(scope);
    const vals = keys.map((k) => scope[k]);
    // eslint-disable-next-line no-new-func
    const fn = new Function(keys.join(','), 'return (' + expr + ');');
    const r = fn.apply(null, vals);
    return (typeof r === 'number' && Number.isFinite(r)) ? r : NaN;
  } catch (e) {
    return NaN;
  }
}

// Iteratively resolves declared formulas (which may reference OTHER formulas,
// e.g. area_total = exact - 2*area_below) into a fully-numeric scope, given a
// concrete sample assignment for whichever variable(s) are swept this pass.
function buildResolvedScope(fixedVars, sweptSample, formulas) {
  const scope = Object.assign({}, fixedVars, sweptSample);
  for (const k of MATH_SCOPE_KEYS) if (!(k in scope)) scope[k] = Math[k];
  const remaining = new Map(Object.entries(formulas));
  let guard = 0, progressed = true;
  while (remaining.size > 0 && progressed && guard < 20) {
    progressed = false; guard += 1;
    for (const [name, expr] of Array.from(remaining.entries())) {
      const unresolved = exprIdentifiers(expr).filter((id) => !(id in scope));
      if (unresolved.length > 0) continue;
      const val = safeEvalExpr(expr, scope);
      if (Number.isFinite(val)) { scope[name] = val; remaining.delete(name); progressed = true; }
    }
  }
  return scope;
}

// Resolves a primitive's position into one or more DATA-space (or, when no
// plane_id is authored, raw pixel-space — position_expr with no plane paints
// directly in pixels, same as a literal position) points: a single point for
// a literal position or a position_expr with no swept identifiers, or a
// SAMPLED ENVELOPE when the expr references a variable this state
// choreographs. Never silently guesses: an unresolvable identifier returns
// {skip: reason} instead of a fabricated point.
function resolveDataSpacePoints(p, state) {
  const pe = p.position_expr;
  if (!pe) {
    if (!hasPosition(p)) return { skip: 'no position/position_expr authored' };
    return { points: [{ x: p.position.x, y: p.position.y }] };
  }
  const exprX = typeof pe.x === 'string' ? pe.x : null;
  const exprY = typeof pe.y === 'string' ? pe.y : null;
  if (!exprX && !exprY) {
    if (!hasPosition(p)) return { skip: 'position_expr present but neither .x nor .y is a string, and no literal position fallback' };
    return { points: [{ x: p.position.x, y: p.position.y }] };
  }

  const allIds = Array.from(new Set([
    ...(exprX ? exprIdentifiers(exprX) : []),
    ...(exprY ? exprIdentifiers(exprY) : []),
  ]));

  const fixedVars = fixedVarsForState(state);
  const swept = sweptRangesForState(state);
  const formulas = declaredFormulas();
  const known = new Set([
    ...Object.keys(fixedVars), ...Array.from(swept.keys()), ...Object.keys(formulas), ...MATH_SCOPE_KEYS,
  ]);
  const unknown = allIds.filter((id) => !known.has(id));
  if (unknown.length > 0) {
    return { skip: `position_expr references unresolvable identifier(s): ${unknown.join(', ')} (not a declared variable, formula, choreographed sweep, or Math function)` };
  }

  // Sample density scales DOWN as the number of jointly-swept identifiers
  // grows, so the combined grid never explodes — every concept on the fleet
  // today sweeps at most one identifier per position_expr axis pair.
  const sweptNames = allIds.filter((id) => swept.has(id));
  const perVarSamples = sweptNames.length <= 1 ? 13 : (sweptNames.length === 2 ? 7 : 3);
  let combos = [{}];
  for (const name of sweptNames) {
    const r = swept.get(name);
    const n = perVarSamples;
    const values = [];
    for (let i = 0; i < n; i++) values.push(r.lo + (r.hi - r.lo) * (n === 1 ? 0 : i / (n - 1)));
    const next = [];
    for (const base of combos) for (const v of values) next.push(Object.assign({}, base, { [name]: v }));
    combos = next;
    if (combos.length > 400) break; // safety valve — should never trigger given the caps above
  }

  const points = [];
  for (const sample of combos) {
    const scope = buildResolvedScope(fixedVars, sample, formulas);
    const x = exprX ? safeEvalExpr(exprX, scope) : (hasPosition(p) ? p.position.x : NaN);
    const y = exprY ? safeEvalExpr(exprY, scope) : (hasPosition(p) ? p.position.y : NaN);
    if (Number.isFinite(x) && Number.isFinite(y)) points.push({ x, y });
  }
  if (points.length === 0) return { skip: 'position_expr never evaluated to a finite point across the sampled range' };
  return { points };
}

// Mirrors PM_planeResolveBound: a range bound may be authored as a numeric
// min/max OR a min_expr/max_expr string. This checker only ever calls it with
// scope={} (STATIC ranges) — a plane whose range carries an *_expr is
// intercepted earlier by planeHasDynamicRange and SKIPPED, never guessed.
function pmPlaneResolveBound(rangeObj, key) {
  return rangeObj ? rangeObj[key] : undefined;
}

// Mirrors PM_planeBuildTransform (parametric_renderer.ts D1) — the pure
// data<->pixel linear map a `cartesian_plane` primitive registers. No p5/DOM
// dependency, so it is safe to hand-port here exactly like the rest of this
// script's box model already mirrors drawLabel/drawAnnotation/drawForceArrow.
function pmPlaneBuildTransform(spec) {
  const viewport = (spec && spec.viewport) || { x: 70, y: 78, w: 660, h: 372 };
  const xRangeRaw = (spec && spec.x_range) || { min: -6.5, max: 6.5 };
  const yRangeRaw = (spec && spec.y_range) || { min: -4, max: 4 };
  const xRange = { min: pmPlaneResolveBound(xRangeRaw, 'min'), max: pmPlaneResolveBound(xRangeRaw, 'max') };
  const yRange = { min: pmPlaneResolveBound(yRangeRaw, 'min'), max: pmPlaneResolveBound(yRangeRaw, 'max') };
  const dx = xRange.max - xRange.min, dy = yRange.max - yRange.min;
  if (!(dx > 0) || !(dy > 0)) return null;
  const equalScale = !!(spec && spec.equal_scale);
  let scaleX, scaleY, originPxX, originPxY;
  if (equalScale) {
    const k = Math.min(viewport.w / dx, viewport.h / dy);
    const effW = dx * k, effH = dy * k;
    scaleX = k; scaleY = k;
    originPxX = viewport.x + (viewport.w - effW) / 2;
    originPxY = viewport.y + (viewport.h - effH) / 2;
  } else {
    scaleX = viewport.w / dx; scaleY = viewport.h / dy;
    originPxX = viewport.x; originPxY = viewport.y;
  }
  return {
    toPx(x, y) {
      return { x: originPxX + (x - xRange.min) * scaleX, y: originPxY + (yRange.max - y) * scaleY };
    },
  };
}

function planeHasDynamicRange(spec) {
  const rx = (spec && spec.x_range) || {};
  const ry = (spec && spec.y_range) || {};
  return ['min_expr', 'max_expr'].some((k) => typeof rx[k] === 'string' || typeof ry[k] === 'string');
}

// Build the map of cartesian_plane primitives registered in THIS state, keyed
// by their own `id` — the SAME name consuming primitives reference via
// `plane_id` (mirrors PM_planeRegistry, rebuilt fresh per state/frame).
function buildPlaneMap(scene) {
  const map = new Map();
  for (const p of scene || []) {
    if (p && p.type === 'cartesian_plane' && typeof p.id === 'string') map.set(p.id, p);
  }
  return map;
}

function envelopeOf(points) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const pt of points) {
    if (pt.x < x0) x0 = pt.x;
    if (pt.x > x1) x1 = pt.x;
    if (pt.y < y0) y0 = pt.y;
    if (pt.y > y1) y1 = pt.y;
  }
  return { x0, y0, x1, y1 };
}

// The single entry point bboxLabel/bboxAnnotation call: resolves a
// label/annotation/formula_box primitive's anchor into a PIXEL-space envelope
// (a single point for a static literal position, a swept range for a
// choreographed position_expr), transforming through its plane_id's
// registered transform when one is authored. Returns {envelope} or {skip}.
function resolveAnchorEnvelope(p, state, planes) {
  const planeSpec = p.plane_id ? planes.get(p.plane_id) : null;
  if (p.plane_id && !planeSpec) {
    return { skip: `plane_id '${p.plane_id}' is not registered by any cartesian_plane primitive in this state` };
  }
  if (planeSpec && planeHasDynamicRange(planeSpec)) {
    return { skip: `plane '${p.plane_id}' has a live re-zoom range (x_range/y_range *_expr) — dynamic viewport not modeled by this checker; verify this label visually` };
  }

  const raw = resolveDataSpacePoints(p, state);
  if (raw.skip) return raw;

  if (!planeSpec) return { envelope: envelopeOf(raw.points) }; // no plane: raw points ARE pixel-space already

  const transform = pmPlaneBuildTransform(planeSpec);
  if (!transform) return { skip: `plane '${p.plane_id}' has a degenerate range (max<=min)` };
  const pixelPoints = raw.points.map((pt) => transform.toPx(pt.x, pt.y));
  return { envelope: envelopeOf(pixelPoints) };
}

// engine_bug_queue: pcpl_layout_overlap_checker_measures_data_space_labels_
// against_pixel_space_boxes_and_ignores_temporal_disjointness (cause c). Two
// primitives are never simultaneously on screen if their authored appear/
// disappear windows do not overlap by more than one rendered frame (~16.7ms
// at 60fps) — anything at or below that is not a visually perceptible
// simultaneous presence, only a same-instant authoring convention (e.g. one
// primitive's disappear_at_ms deliberately equal to the next one's
// appear_at_ms, a crossfade HANDOFF, not a collision).
const TEMPORAL_OVERLAP_TOLERANCE_MS = 1000 / 60;
function activeWindow(p) {
  const start = typeof p.appear_at_ms === 'number' ? p.appear_at_ms : 0;
  const end = typeof p.disappear_at_ms === 'number' ? p.disappear_at_ms : Infinity;
  return { start, end };
}
function windowsOverlap(a, b) {
  const start = Math.max(a.start, b.start);
  const end = Math.min(a.end, b.end);
  return (end - start) > TEMPORAL_OVERLAP_TOLERANCE_MS;
}

// engine_bug_queue: formula_surface_footprint_overlaps_an_authored_curve_end_label
// found this script measuring the RAW TEMPLATE. A HUD row authored as
//   "θ = {s.toFixed(2)} rad ({theta.toFixed(0)}°)"
// is 45 source characters but renders as "θ = 4.00 rad (229°)" — 19. The script
// therefore computed boxes up to 5x too wide and reported collisions that do not
// exist: 5 reported on unit_circle_to_sine_wave, 4 of them false, which is worse
// than reporting none because it trains authors to ignore the output. Collapse
// every {...} group to the width its VALUE renders at before measuring.
function renderedText(text) {
  return String(text ?? '').replace(/\{([^{}]+)\}/g, (_m, body) => {
    // {x.toFixed(2)} → "-0.00": sign + digit + point + n decimals ≈ n + 3.
    const fx = /\.toFixed\(\s*(\d)\s*\)/.exec(body);
    if (fx) return '0'.repeat(Number(fx[1]) + 3);
    // A bare {identifier} renders as a short number; 4 chars is a fair estimate
    // and errs slightly wide, which is the safe direction for an overlap check.
    return '0000';
  });
}

function textLines(text) {
  // The renderer splits on a literal "\n" (authored as "\\n" inside JSON strings).
  return renderedText(text).split(/\\n|\n/);
}

// A text primitive can legitimately carry no literal `position` (anchor-resolved
// or from/to-driven). The renderer skips those in its own draw guard
// (`if (!spec || !(spec._solverPosition || spec.position)) return`), so we skip
// them too rather than throwing — reading p.position.x unguarded is what made
// this script die outright on 21 concepts, none of which any version could scan.
function hasPosition(p) {
  return !!(p && p.position && typeof p.position.x === 'number' && typeof p.position.y === 'number');
}

// label: CENTRE-anchored, font_size default 14, lineH = size*1.25 (drawLabel).
// `anchorEnv` is the PIXEL-space envelope already resolved by
// resolveAnchorEnvelope — a single point for a static label, a swept range
// for a plane_id/position_expr-driven one. The text box is a fixed size that
// slides with the anchor, so the box's own union across the sweep is the
// anchor envelope expanded by the half-extent on every side.
function bboxLabel(p, anchorEnv) {
  const size = p.font_size || 14;
  const ls = textLines(p.text_expr ?? p.text);
  const maxLen = ls.reduce((m, l) => Math.max(m, l.length), 0);
  const w = Math.max(24, maxLen * size * CHAR_W_RATIO);
  const h = ls.length * (size * 1.25);
  return {
    x0: anchorEnv.x0 - w / 2, y0: anchorEnv.y0 - h / 2,
    x1: anchorEnv.x1 + w / 2, y1: anchorEnv.y1 + h / 2,
  };
}

// annotation / formula_box: TOP-LEFT-anchored, font_size 12, lineH = size*1.35,
// callout padding padX=8 / padY=6 (drawAnnotation). formula_box's own text
// field is authored as `equation` (verified: 76/76 formula_box primitives on
// the fleet use `equation`, ZERO use `text`/`text_expr`) — reading only
// `text`/`text_expr` measured every formula_box as a near-empty ~16x28px box
// regardless of its real equation string, silently under-measuring (a missed
// TRUE collision, the opposite direction of error from the plane-transform
// bug this function was already being fixed for).
function bboxAnnotation(p, anchorEnv) {
  const size = p.font_size || 12;
  const ls = textLines(p.text ?? p.text_expr ?? p.equation);
  const maxLen = ls.reduce((m, l) => Math.max(m, l.length), 0);
  const padX = 8, padY = 6;
  const w = maxLen * size * CHAR_W_RATIO + padX * 2;
  const h = ls.length * (size * 1.35) + padY * 2;
  return {
    x0: anchorEnv.x0 - padX, y0: anchorEnv.y0 - padY,
    x1: anchorEnv.x1 - padX + w, y1: anchorEnv.y1 - padY + h,
  };
}

// Body position map — a force_arrow authored with origin_body_id/body_id (the
// current PCPL convention; every modern concept uses this, not literal `from`)
// has no static from.x/from.y to read. Prescan the state's own scene_composition
// for type:'body' primitives (bodies are re-registered fresh per state by the
// renderer's PM_bodyRegistry, so this map is built per-state, not concept-wide)
// and resolve arrows against it, mirroring PM_resolveForceOrigin
// (parametric_renderer.ts ~2413-2471).
function buildBodyMap(scene) {
  const map = new Map();
  for (const p of scene || []) {
    if (!p || p.type !== 'body' || typeof p.id !== 'string') continue;
    const pos = p.position;
    if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') continue;

    // Mirrors drawBody()'s bw/bh resolution per shape (parametric_renderer.ts
    // ~949-961). Unknown/unhandled shapes fall back to the renderer's own
    // 60x60 default.
    const shape = p.shape;
    const size = p.size;
    let w = 60, h = 60;
    if (shape === 'circle' && typeof size === 'number') { w = size; h = size; }
    else if (shape === 'pulley' && typeof size === 'number') { w = size; h = size; }
    else if (shape === 'stickman' && typeof size === 'number') { w = size * 0.5; h = size; }
    else if ((shape === 'rect' || shape === 'tree' || shape === 'door') && size && typeof size === 'object') {
      if (typeof size.w === 'number' && typeof size.h === 'number') { w = size.w; h = size.h; }
    }

    // Mirrors drawBody()'s center resolution (~1020-1025): rect/tree/door are
    // top-left anchored (position → center = position + half-extent);
    // circle/stickman/pulley are already center-anchored. Approximation only
    // (not pixel-perfect) — good enough for an overlap-warning bbox.
    const isBoxed = shape === 'rect' || shape === 'tree' || shape === 'door';
    const cx = isBoxed ? pos.x + w / 2 : pos.x;
    const cy = isBoxed ? pos.y + h / 2 : pos.y;
    const rotationDeg = typeof p.rotation_deg === 'number' ? p.rotation_deg : 0;
    map.set(p.id, { cx, cy, w, h, rotationDeg });
  }
  return map;
}

// Mirrors PM_resolveForceOrigin's body-anchor resolution (parametric_renderer.ts
// ~2442-2470): pick the anchor keyword (origin_anchor, falling back to
// draw_from, default 'body_center'), offset by the body's half-extent, rotate
// by the body's rotation_deg. Deliberately does NOT replicate the renderer's
// "no body found → fall back to the first registered body" quirk — that's an
// arbitrary render-order artifact, not a real resolution, so an unmatched body
// id here falls through to literal `from` / skip instead (see bboxArrow).
// Also does not parse legacy compound-string `from` (e.g. "block_top_center")
// — out of this fix's scope; those already resolve to null/NaN as before.
function resolveBodyAnchoredOrigin(p, bodies) {
  const bodyId = p.origin_body_id ?? p.body_id;
  if (typeof bodyId !== 'string') return null;
  const b = bodies.get(bodyId);
  if (!b) return null;

  const drawFrom = (typeof p.origin_anchor === 'string' && p.origin_anchor)
    || (typeof p.draw_from === 'string' && p.draw_from)
    || 'body_center';
  let dx = 0, dy = 0;
  if (drawFrom === 'body_bottom') dy = b.h / 2;
  else if (drawFrom === 'body_top') dy = -b.h / 2;
  else if (drawFrom === 'body_left') dx = -b.w / 2;
  else if (drawFrom === 'body_right') dx = b.w / 2;
  // else body_center (or unrecognized) → (0, 0)

  if (b.rotationDeg) {
    const r = (b.rotationDeg * Math.PI) / 180;
    const rx = dx * Math.cos(r) - dy * Math.sin(r);
    const ry = dx * Math.sin(r) + dy * Math.cos(r);
    dx = rx; dy = ry;
  }
  return { x: b.cx + dx, y: b.cy + dy };
}

function literalArrowFrom(p) {
  const from = p.from;
  if (from && typeof from.x === 'number' && typeof from.y === 'number') return { x: from.x, y: from.y };
  return null;
}

function bboxArrow(p, bodies) {
  // Resolution precedence (matches the renderer's post-WP-R4 fallback order):
  // authored body id wins, then a literal `from: {x,y}` object, then skip.
  const from = resolveBodyAnchoredOrigin(p, bodies) ?? literalArrowFrom(p);
  if (!from) return null;
  const rad = (p.direction_deg || 0) * Math.PI / 180;
  const scale = p.scale_pixels_per_unit || 5;
  const mag = typeof p.magnitude === 'number' ? p.magnitude : 1;
  const dx = Math.cos(rad) * mag * scale;
  const dy = -Math.sin(rad) * mag * scale; // physics-y-up flip
  const x1 = from.x + dx, y1 = from.y + dy;
  const labelW = (p.label || '').length * CHAR_W + 8;
  const labelH = 14;
  // Bounding box covers the arrow line + a 14px label near the tip.
  return {
    x0: Math.min(from.x, x1) - 4,
    y0: Math.min(from.y, y1) - 4,
    x1: Math.max(from.x, x1) + Math.max(labelW, 4),
    y1: Math.max(from.y, y1) + labelH,
    w: 0, h: 0,
    tail: { x: from.x, y: from.y },   // shared-origin test for the junction filter
    tip: { x: x1, y: y1 }
  };
}

// Penetration-based overlap. A collision counts only when the boxes interpenetrate
// by more than MIN_PEN on their shallower axis. Line-height boxes otherwise graze
// by ~1px when labels sit at the intentional ~14px stagger the engine_bug_queue
// treats as clean, so a strict rect test manufactures false positives on every
// deliberately stacked label group.
const MIN_PEN = 3;
function overlapDepth(a, b) {
  const ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
  const oy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
  if (ox <= 0 || oy <= 0) return 0; // disjoint on some axis
  return Math.min(ox, oy);
}

// ── Enumerate every state from the JSON (EPIC-L + all EPIC-C branches) ───────
function collectStates() {
  const out = [];
  const l = json.epic_l_path && json.epic_l_path.states;
  if (l && typeof l === 'object') {
    for (const sid of Object.keys(l)) out.push({ label: sid, state: l[sid] });
  }
  const branches = json.epic_c_branches;
  if (Array.isArray(branches)) {
    branches.forEach((br, i) => {
      const bs = br && br.states;
      if (bs && typeof bs === 'object') {
        for (const sid of Object.keys(bs)) out.push({ label: `epic_c[${i}].${sid}`, state: bs[sid] });
      }
    });
  }
  return out;
}

const allStates = collectStates();
if (allStates.length === 0) {
  // A legitimately state-less file (e.g. a parent/bundle concept) is nothing to
  // check, NOT a failure — exit 0 so a fleet sweep doesn't read it as an error.
  // A bad path already fails loudly at readFileSync above.
  console.log(`${PATH}: no states (epic_l_path.states + epic_c_branches empty) — nothing to check.`);
  process.exit(0);
}

console.log(`Concept: ${json.concept_id || path.basename(PATH)}  —  ${allStates.length} state(s)`);
let totalCollisions = 0;

for (const { label: sid, state } of allStates) {
  console.log(`\n=== ${sid}${state && state.title ? ` : ${state.title}` : ''} ===`);
  const scene = state.scene_composition || [];
  const bodies = buildBodyMap(scene);
  const planes = buildPlaneMap(scene);
  const boxes = [];
  for (const p of scene) {
    let box;
    if (p.type === 'force_arrow') {
      box = bboxArrow(p, bodies);
      if (!box) {
        console.log(`  ⚠ SKIP ${String(p.id).padEnd(22)} [force_arrow  ] unresolvable origin (no origin_body_id/body_id match, no literal from)`);
        continue;
      }
    }
    // label is CENTRE-anchored at its own font_size; annotation/formula_box are
    // TOP-LEFT-anchored text blocks. Using one model for both was what made the
    // old checker both miss real collisions and invent phantom ones.
    else if (p.type === 'label' || p.type === 'annotation' || p.type === 'formula_box') {
      const resolved = resolveAnchorEnvelope(p, state, planes);
      if (resolved.skip) {
        console.log(`  ⚠ SKIP ${String(p.id).padEnd(22)} [${String(p.type).padEnd(12)}] ${resolved.skip}`);
        continue;
      }
      box = (p.type === 'label') ? bboxLabel(p, resolved.envelope) : bboxAnnotation(p, resolved.envelope);
      box.swept = (resolved.envelope.x1 - resolved.envelope.x0 > 0.01) || (resolved.envelope.y1 - resolved.envelope.y0 > 0.01);
    }
    else continue;
    if (!box) continue;
    // id is optional on a primitive — never assume it is a string.
    box.id = p.id || '(no id)';
    box.type = p.type;
    box.window = activeWindow(p);
    boxes.push(box);
    console.log(`  ${String(box.id).padEnd(22)} [${String(p.type).padEnd(12)}] x=${Math.round(box.x0)}..${Math.round(box.x1)} y=${Math.round(box.y0)}..${Math.round(box.y1)}${box.tip ? ` tip=(${Math.round(box.tip.x)}, ${Math.round(box.tip.y)})` : ''}${box.swept ? ' [swept: plane_id/position_expr anchor range, not a single point]' : ''}`);
  }
  // Find collisions
  let collisions = 0;
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      const pen = overlapDepth(a, b);
      if (pen <= MIN_PEN) continue;
      // Intentional junction-style overlap: two force_arrows sharing an origin
      // (within 4px) — wires converging at a node, pressure on every wall, an FBD
      // whose forces all act on one body.
      if (a.tail && b.tail && Math.hypot(a.tail.x - b.tail.x, a.tail.y - b.tail.y) < 4) continue;
      // Temporally disjoint (cause c): the two never share the screen for more
      // than one rendered frame, so a spatial overlap between them is not a
      // real collision — see the TEMPORAL_OVERLAP_TOLERANCE_MS header comment.
      if (!windowsOverlap(a.window, b.window)) continue;
      console.log(`  ⚠ COLLISION: ${a.type}#${a.id} <-> ${b.type}#${b.id} (penetration ${Math.round(pen)}px)`);
      collisions++;
    }
  }
  if (collisions === 0) console.log(`  ✓ no overlaps`);
  totalCollisions += collisions;
}

console.log(`\n${totalCollisions === 0 ? '✓' : '⚠'} ${totalCollisions} collision(s) across ${allStates.length} state(s).`);
