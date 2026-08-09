// PROBE — cartesian_plane tick-label collision check (2026-08-08,
// eye_walker FIX 2 / FIX 3 on definite_integral_as_accumulated_area).
//
// The defect this catches: an authored HUD/label/chip column was verified
// clear of CURVE/REGION/BAR ink but nobody checked it against the plane's
// OWN auto-rendered axis TICK LABELS ("4.0", "3.0", ...) — a class of
// collision no other tool in the repo looks for. check-layout-overlap.mjs
// knows about label/annotation/formula_box/force_arrow boxes but has never
// heard of cartesian_plane and cannot see its tick text at all.
//
// This script mirrors drawCartesianPlane's tick-label draw pass
// (src/lib/renderers/parametric_renderer.ts) byte-for-byte in geometry terms
// (same viewport->pixel transform, same tickPx=5 / textSize(10) / anchor
// offsets, same PM_planeTickValues / PM_formatTickLabel logic) to compute
// each rendered tick label's screen rect, then checks TWO collision classes:
//
//   (1) chip-vs-tick  — every label/annotation/formula_box primitive in a
//       state (evaluated at EVERY authored position, including position_expr
//       primitives sampled across the full range of every variable that is
//       LIVE in that state — variable_choreography OR a drag/slider binding)
//       against every tick-label rect of every cartesian_plane drawn in the
//       same state. This is the FIX-2 collision class.
//
//   (2) tick-vs-tick (cross-plane) — when a state draws more than one
//       cartesian_plane (e.g. a host plane + an inset), each plane's tick
//       labels checked against every OTHER plane's tick labels in the same
//       state. This is the FIX-3 collision class (an inset's own axis labels
//       landing inside the host's tick-label lane).
//
// Deliberately does NOT check curve/region_fill/riemann_bars ink — that ink
// class already has its own review step (quality_auditor's visual gate); this
// probe exists specifically because tick-label ink had NO check anywhere.
//
// Usage:
//   node src/scripts/_probe_plane_tick_label_collision.mjs <path-or-concept-id>
//   node src/scripts/_probe_plane_tick_label_collision.mjs definite_integral_as_accumulated_area
//
// Text-width model matches check-layout-overlap.mjs (CHAR_W_RATIO=0.55,
// font_size * lineH-ratio) so the two tools never disagree about the same
// primitive's own footprint. Duplicated rather than imported: neither script
// exports anything (both are top-level CLI programs), and importing one from
// the other would execute its argv-driven main() as a side effect.
import fs from 'node:fs';
import path from 'node:path';

// ── Resolve the concept path (same convention as check-layout-overlap.mjs) ──
const arg = process.argv[2];
if (!arg) {
  console.error('usage: node src/scripts/_probe_plane_tick_label_collision.mjs <path-or-concept-id>');
  process.exit(1);
}
function resolveConceptPath(a) {
  if (a.includes('/') || a.includes('\\') || a.endsWith('.json')) return a;
  const SUBJECT_DIRS = ['chemistry', 'mathematics'];
  const candidates = [
    path.join('src/data/concepts', `${a}.json`),
    ...SUBJECT_DIRS.map((s) => path.join('src/data/concepts', s, `${a}.json`)),
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return candidates[0];
}
const PATH = resolveConceptPath(arg);
const json = JSON.parse(fs.readFileSync(PATH, 'utf8'));

// ── Text-width model (mirrors check-layout-overlap.mjs) ────────────────────
const CHAR_W_RATIO = 0.55;

function renderedText(text) {
  return String(text ?? '').replace(/\{([^{}]+)\}/g, (_m, body) => {
    const fx = /\.toFixed\(\s*(\d)\s*\)/.exec(body);
    if (fx) return '0'.repeat(Number(fx[1]) + 3);
    return '0000';
  });
}
function textLines(text) {
  return renderedText(text).split(/\\n|\n/);
}
function hasPosition(p) {
  return !!(p && p.position && typeof p.position.x === 'number' && typeof p.position.y === 'number');
}
// label: CENTRE-anchored (drawLabel: textAlign(CENTER,CENTER)), font_size default 14.
function bboxLabelAt(pos, p) {
  const size = p.font_size || 14;
  const ls = textLines(p.text_expr ?? p.text);
  const maxLen = ls.reduce((m, l) => Math.max(m, l.length), 0);
  const w = Math.max(24, maxLen * size * CHAR_W_RATIO);
  const h = ls.length * (size * 1.25);
  return { x0: pos.x - w / 2, y0: pos.y - h / 2, x1: pos.x + w / 2, y1: pos.y + h / 2 };
}
// annotation / formula_box: TOP-LEFT-anchored (drawAnnotation), font_size 12, pad 8/6.
function bboxAnnotationAt(pos, p) {
  const size = p.font_size || 12;
  const ls = textLines(p.text ?? p.text_expr);
  const maxLen = ls.reduce((m, l) => Math.max(m, l.length), 0);
  const padX = 8, padY = 6;
  const w = maxLen * size * CHAR_W_RATIO + padX * 2;
  const h = ls.length * (size * 1.35) + padY * 2;
  return { x0: pos.x - padX, y0: pos.y - padY, x1: pos.x - padX + w, y1: pos.y - padY + h };
}

// ── cartesian_plane geometry (mirrors PM_planeBuildTransform / F3 tick pass) ─
function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }
function buildPlaneTransform(spec) {
  const viewport = spec.viewport || { x: 70, y: 78, w: 660, h: 372 };
  const xRange = spec.x_range || { min: -6.5, max: 6.5 };
  const yRange = spec.y_range || { min: -4, max: 4 };
  const dx = xRange.max - xRange.min, dy = yRange.max - yRange.min;
  if (!(dx > 0) || !(dy > 0)) return null;
  const equalScale = !!spec.equal_scale;
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
  function toPx(x, y) {
    return { x: originPxX + (x - xRange.min) * scaleX, y: originPxY + (yRange.max - y) * scaleY };
  }
  return { toPx, xRange, yRange };
}
function planeTickValues(rangeMin, rangeMax, tick) {
  const out = [];
  if (!(tick > 0)) return out;
  const EPS = 1e-9;
  const startIndex = Math.ceil((rangeMin / tick) - EPS);
  for (let i = startIndex; i * tick <= rangeMax + EPS; i++) out.push(i * tick);
  return out;
}
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = b; b = a % b; a = t; } return a || 1; }
function fmtNum(value, decimals) {
  const d = typeof decimals === 'number' && isFinite(decimals) ? decimals : 2;
  const eps = 0.5 * Math.pow(10, -d);
  const v = Math.abs(value) < eps ? 0 : value;
  return v.toFixed(d).replace('-', '−');
}
function formatTickLabel(value, mode, decimals) {
  if (mode === 'none') return '';
  if (mode === 'pi') {
    if (Math.abs(value) < 1e-9) return '0';
    const ratio = value / Math.PI;
    let bestN = null, bestD = 1;
    for (let D = 1; D <= 12; D++) {
      const n = Math.round(ratio * D);
      if (Math.abs(ratio * D - n) < 1e-6) { bestN = n; bestD = D; break; }
    }
    if (bestN === null) return fmtNum(ratio, 2) + 'π';
    const g = gcd(bestN, bestD);
    const num = bestN / g, den = bestD / g;
    const sign = num < 0 ? '−' : '';
    const absNum = Math.abs(num);
    const body = absNum === 1 ? 'π' : (absNum + 'π');
    return den === 1 ? (sign + body) : (sign + body + '/' + den);
  }
  return fmtNum(value, typeof decimals === 'number' ? decimals : 0);
}
// Tick-label rects for ONE plane spec, mirroring drawCartesianPlane's F3 pass
// exactly: x-tick text is CENTER,TOP anchored at (px, axisPxY+tickPx+2);
// y-tick text is RIGHT,CENTER anchored at (axisPxX-tickPx-3, py). Origin tick
// is skipped on both axes (the renderer draws no separate label there).
function tickRectsForPlane(spec, planeId) {
  const plane = buildPlaneTransform(spec);
  if (!plane) return [];
  const { toPx, xRange, yRange } = plane;
  const originDataX = clamp(0, xRange.min, xRange.max);
  const originDataY = clamp(0, yRange.min, yRange.max);
  const EPS = 1e-9;
  const tickDecimals = typeof spec.tick_decimals === 'number' ? spec.tick_decimals : 0;
  const xLabelMode = spec.x_tick_labels || 'number';
  const yLabelMode = spec.y_tick_labels || 'number';
  const tickPx = 5, fontSize = 10, lineH = fontSize * 1.25;
  const rects = [];
  if (xLabelMode !== 'none' && spec.x_tick > 0) {
    for (const txv of planeTickValues(xRange.min, xRange.max, spec.x_tick)) {
      if (Math.abs(txv - originDataX) < EPS) continue;
      const txt = formatTickLabel(txv, xLabelMode, tickDecimals);
      if (!txt) continue;
      const tpX = toPx(txv, originDataY);
      const w = Math.max(6, txt.length * fontSize * CHAR_W_RATIO);
      const anchorY = tpX.y + tickPx + 2;
      rects.push({ plane: planeId, axis: 'x', value: txv, label: txt,
        x0: tpX.x - w / 2, x1: tpX.x + w / 2, y0: anchorY, y1: anchorY + lineH });
    }
  }
  if (yLabelMode !== 'none' && spec.y_tick > 0) {
    for (const tyv of planeTickValues(yRange.min, yRange.max, spec.y_tick)) {
      if (Math.abs(tyv - originDataY) < EPS) continue;
      const txt = formatTickLabel(tyv, yLabelMode, tickDecimals);
      if (!txt) continue;
      const tpY = toPx(originDataX, tyv);
      const w = Math.max(6, txt.length * fontSize * CHAR_W_RATIO);
      const anchorX = tpY.x - tickPx - 3;
      rects.push({ plane: planeId, axis: 'y', value: tyv, label: txt,
        x0: anchorX - w, x1: anchorX, y0: tpY.y - lineH / 2, y1: tpY.y + lineH / 2 });
    }
  }
  return rects;
}

// ── Variable ranging: which variables are LIVE in a given state, and over
// what authored range (variable_choreography from/to, OR any primitive's
// drag.min/max, OR a slider's min/max) ───────────────────────────────────
function liveVarRangesForState(state) {
  const ranges = {}; // name -> Set of sample values (endpoints)
  const add = (name, lo, hi) => {
    if (typeof lo !== 'number' || typeof hi !== 'number') return;
    if (!ranges[name]) ranges[name] = new Set();
    ranges[name].add(lo);
    ranges[name].add(hi);
  };
  for (const c of state.variable_choreography || []) {
    if (c && typeof c.variable === 'string') add(c.variable, Math.min(c.from, c.to), Math.max(c.from, c.to));
  }
  for (const p of state.scene_composition || []) {
    if (p && p.drag && typeof p.drag.bind_variable === 'string') {
      add(p.drag.bind_variable, p.drag.min, p.drag.max);
    }
    if (p && p.type === 'slider' && typeof p.variable === 'string') {
      add(p.variable, p.min, p.max);
    }
  }
  const out = {};
  for (const [k, set] of Object.entries(ranges)) out[k] = [...set];
  return out;
}

// ── Expression evaluation, mirroring PM_safeEval / PM_liveVarsWithDerived —
// full scope = every physics_engine_config.variable at its default, THEN the
// current combo's swept values, THEN computed_outputs evaluated (in authored
// key order, so a derived field that itself depends on an earlier derived
// field — area_total depends on exact/area_below in THIS concept — resolves
// correctly in one pass, exactly as JS object key order preserves it). ───────
const MATH_KEYS = ['sqrt', 'atan2', 'atan', 'asin', 'acos', 'sin', 'cos', 'tan',
  'abs', 'min', 'max', 'pow', 'log', 'exp', 'PI', 'E', 'round', 'floor', 'ceil', 'sign'];
function evalExprAt(expr, scope) {
  const keys = Object.keys(scope);
  const vals = keys.map((k) => scope[k]);
  for (const mk of MATH_KEYS) { if (!keys.includes(mk)) { keys.push(mk); vals.push(Math[mk]); } }
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(...keys, 'return (' + expr + ');');
    const r = fn(...vals);
    return (typeof r === 'number' && isFinite(r)) ? r : null;
  } catch (e) { return null; }
}
function buildFullScope(physicsVars, computedOutputs, combo) {
  const scope = {};
  for (const [name, def] of Object.entries(physicsVars || {})) {
    scope[name] = (def && typeof def.default === 'number') ? def.default : 0;
  }
  Object.assign(scope, combo);
  for (const [name, def] of Object.entries(computedOutputs || {})) {
    const formula = def && def.formula;
    if (typeof formula !== 'string') continue;
    const v = evalExprAt(formula, scope);
    if (v != null) scope[name] = v;
  }
  return scope;
}
function cartesianCombos(liveRanges) {
  let combos = [{}];
  for (const [name, vals] of Object.entries(liveRanges)) {
    const next = [];
    for (const c of combos) for (const v of vals) next.push({ ...c, [name]: v });
    combos = next;
  }
  return combos;
}

// ── Candidate pixel positions for a label/annotation/formula_box primitive,
// swept across every combo of this state's live variables. ─────────────────
function candidatePositions(p, liveRanges, physicsVars, computedOutputs, planes) {
  const hasExpr = p.position_expr && (p.position_expr.x != null || p.position_expr.y != null);
  const literalPos = p.position;
  const throughPlane = (pos) => (p.plane_id && planes[p.plane_id]) ? planes[p.plane_id].toPx(pos.x, pos.y) : pos;
  if (!hasExpr) {
    if (!literalPos) return [];
    return [throughPlane({ x: literalPos.x, y: literalPos.y })];
  }
  const combos = cartesianCombos(liveRanges);
  const positions = [];
  for (const combo of combos) {
    const scope = buildFullScope(physicsVars, computedOutputs, combo);
    const exprX = p.position_expr.x != null ? String(p.position_expr.x) : null;
    const exprY = p.position_expr.y != null ? String(p.position_expr.y) : null;
    const xv = exprX != null ? evalExprAt(exprX, scope) : (literalPos ? literalPos.x : null);
    const yv = exprY != null ? evalExprAt(exprY, scope) : (literalPos ? literalPos.y : null);
    if (xv == null || yv == null) continue;
    positions.push(throughPlane({ x: xv, y: yv }));
  }
  if (positions.length === 0 && literalPos) positions.push(throughPlane({ x: literalPos.x, y: literalPos.y }));
  return positions;
}

// ── Overlap test (mirrors check-layout-overlap.mjs's MIN_PEN=3 penetration
// model — a graze of a couple px at intentional stagger is not a collision) ─
const MIN_PEN = 3;
function overlapDepth(a, b) {
  const ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
  const oy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
  if (ox <= 0 || oy <= 0) return 0;
  return Math.min(ox, oy);
}
// Nearest-edge screen distance between two rects (0 when they overlap). A
// FIX-3-class defect (host/inset tick labels close enough to be MISREAD as
// one axis) does not always trip a literal pixel overlap — the two label
// texts can be individually legible while sitting ~10-15px apart, which is
// still too close for a teacher glancing at the screen to tell them apart.
// NEAR_GAP is the minimum clear space this probe requires even absent a true
// collision; chosen as roughly one tick-label's own line-height (12.5px) —
// less than that and two short number labels visually fuse.
const NEAR_GAP = 15;
function rectDistance(a, b) {
  const dx = Math.max(a.x0 - b.x1, b.x0 - a.x1, 0);
  const dy = Math.max(a.y0 - b.y1, b.y0 - a.y1, 0);
  return Math.sqrt(dx * dx + dy * dy);
}

// ── Enumerate every state (EPIC-L + EPIC-C branches, same as check-layout-
// overlap.mjs — never a hardcoded STATE_1..STATE_N list). ──────────────────
function collectStates() {
  const out = [];
  const l = json.epic_l_path && json.epic_l_path.states;
  if (l && typeof l === 'object') for (const sid of Object.keys(l)) out.push({ label: sid, state: l[sid] });
  const branches = json.epic_c_branches;
  if (Array.isArray(branches)) {
    branches.forEach((br, i) => {
      const bs = br && br.states;
      if (bs && typeof bs === 'object') for (const sid of Object.keys(bs)) out.push({ label: `epic_c[${i}].${sid}`, state: bs[sid] });
    });
  }
  return out;
}

const physicsVars = (json.physics_engine_config && json.physics_engine_config.variables) || {};
const computedOutputs = (json.physics_engine_config && json.physics_engine_config.computed_outputs) || {};
const allStates = collectStates();
if (allStates.length === 0) {
  console.log(`${PATH}: no states — nothing to check.`);
  process.exit(0);
}

console.log(`Concept: ${json.concept_id || path.basename(PATH)}  —  ${allStates.length} state(s)`);
let totalChipVsTick = 0;
let totalTickVsTick = 0;
let totalNear = 0; // advisory only — does not affect exit code

for (const { label: sid, state } of allStates) {
  const scene = state.scene_composition || [];
  const planeSpecs = scene.filter((p) => p && p.type === 'cartesian_plane' && typeof p.id === 'string');
  if (planeSpecs.length === 0) continue; // nothing for this probe to check

  console.log(`\n=== ${sid}${state.title ? ` : ${state.title}` : ''} ===`);
  const stateStartChip = totalChipVsTick, stateStartTick = totalTickVsTick;

  const planes = {};
  const tickRectsByPlane = {};
  for (const ps of planeSpecs) {
    const t = buildPlaneTransform(ps);
    if (t) planes[ps.id] = t;
    tickRectsByPlane[ps.id] = tickRectsForPlane(ps, ps.id);
  }
  const allTickRects = Object.values(tickRectsByPlane).flat();
  for (const r of allTickRects) {
    console.log(`  [tick] ${r.plane}.${r.axis}=${r.value}  "${r.label}"  x=${Math.round(r.x0)}..${Math.round(r.x1)} y=${Math.round(r.y0)}..${Math.round(r.y1)}`);
  }

  // (2) cross-plane tick-vs-tick — FIX-3 class. A true overlap is a hard
  // COLLISION; a disjoint-but-close pair (< NEAR_GAP) is a softer NEAR warn —
  // individually legible but easily misread as one axis, the exact FIX-3
  // description ("close enough that... render within ~15-20px").
  for (let i = 0; i < planeSpecs.length; i++) {
    for (let j = i + 1; j < planeSpecs.length; j++) {
      const rA = tickRectsByPlane[planeSpecs[i].id], rB = tickRectsByPlane[planeSpecs[j].id];
      for (const a of rA) for (const b of rB) {
        const pen = overlapDepth(a, b);
        if (pen > MIN_PEN) {
          console.log(`  ⚠ TICK-VS-TICK COLLISION: ${a.plane}.${a.axis}="${a.label}" <-> ${b.plane}.${b.axis}="${b.label}" (penetration ${Math.round(pen)}px)`);
          totalTickVsTick++;
          continue;
        }
        const dist = rectDistance(a, b);
        if (dist < NEAR_GAP) {
          console.log(`  · TICK-VS-TICK NEAR: ${a.plane}.${a.axis}="${a.label}" <-> ${b.plane}.${b.axis}="${b.label}" (gap ${dist.toFixed(1)}px < ${NEAR_GAP}px)`);
          totalNear++;
        }
      }
    }
  }

  // (1) chip-vs-tick — FIX-2 class.
  const liveRanges = liveVarRangesForState(state);
  const texts = scene.filter((p) => p && (p.type === 'label' || p.type === 'annotation' || p.type === 'formula_box'));
  for (const p of texts) {
    const positions = candidatePositions(p, liveRanges, physicsVars, computedOutputs, planes);
    const seen = new Set();
    for (const pos of positions) {
      const box = p.type === 'label' ? bboxLabelAt(pos, p) : bboxAnnotationAt(pos, p);
      let worstPen = 0, worstPenTick = null;
      let closestDist = Infinity, closestTick = null;
      for (const tr of allTickRects) {
        const pen = overlapDepth(box, tr);
        if (pen > worstPen) { worstPen = pen; worstPenTick = tr; }
        if (pen === 0) {
          const dist = rectDistance(box, tr);
          if (dist < closestDist) { closestDist = dist; closestTick = tr; }
        }
      }
      const key = `${p.id}@${Math.round(pos.x)},${Math.round(pos.y)}`;
      if (worstPen > MIN_PEN) {
        if (!seen.has(key)) {
          seen.add(key);
          console.log(`  ⚠ CHIP-VS-TICK COLLISION: ${p.type}#${p.id} at (${Math.round(pos.x)},${Math.round(pos.y)}) box x=${Math.round(box.x0)}..${Math.round(box.x1)} y=${Math.round(box.y0)}..${Math.round(box.y1)} <-> ${worstPenTick.plane}.${worstPenTick.axis}="${worstPenTick.label}" (penetration ${Math.round(worstPen)}px)`);
          totalChipVsTick++;
        }
      } else if (closestTick && closestDist < NEAR_GAP) {
        if (!seen.has(key)) {
          seen.add(key);
          console.log(`  · CHIP-VS-TICK NEAR: ${p.type}#${p.id} at (${Math.round(pos.x)},${Math.round(pos.y)}) <-> ${closestTick.plane}.${closestTick.axis}="${closestTick.label}" (gap ${closestDist.toFixed(1)}px < ${NEAR_GAP}px)`);
          totalNear++;
        }
      }
    }
  }
  if (totalChipVsTick === stateStartChip && totalTickVsTick === stateStartTick) console.log('  (no hard collisions in this state)');
}

console.log(`\n${(totalChipVsTick + totalTickVsTick) === 0 ? '✓' : '⚠'} ${totalChipVsTick} chip-vs-tick collision(s), ${totalTickVsTick} tick-vs-tick collision(s), ${totalNear} near-miss(es) (< ${NEAR_GAP}px, advisory) across ${allStates.length} state(s).`);
// Exit code reflects hard COLLISIONs only — NEAR is advisory (read the log).
process.exit((totalChipVsTick + totalTickVsTick) === 0 ? 0 : 1);
