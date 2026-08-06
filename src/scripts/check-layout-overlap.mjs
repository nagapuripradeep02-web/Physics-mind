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
function bboxLabel(p) {
  if (!hasPosition(p)) return null;
  const size = p.font_size || 14;
  const ls = textLines(p.text_expr ?? p.text);
  const maxLen = ls.reduce((m, l) => Math.max(m, l.length), 0);
  const w = Math.max(24, maxLen * size * CHAR_W_RATIO);
  const h = ls.length * (size * 1.25);
  return {
    x0: p.position.x - w / 2, y0: p.position.y - h / 2,
    x1: p.position.x + w / 2, y1: p.position.y + h / 2,
  };
}

// annotation / formula_box: TOP-LEFT-anchored, font_size 12, lineH = size*1.35,
// callout padding padX=8 / padY=6 (drawAnnotation).
function bboxAnnotation(p) {
  if (!hasPosition(p)) return null;
  const size = p.font_size || 12;
  const ls = textLines(p.text ?? p.text_expr);
  const maxLen = ls.reduce((m, l) => Math.max(m, l.length), 0);
  const padX = 8, padY = 6;
  const w = maxLen * size * CHAR_W_RATIO + padX * 2;
  const h = ls.length * (size * 1.35) + padY * 2;
  return {
    x0: p.position.x - padX, y0: p.position.y - padY,
    x1: p.position.x - padX + w, y1: p.position.y - padY + h,
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
    else if (p.type === 'label') box = bboxLabel(p);
    else if (p.type === 'annotation' || p.type === 'formula_box') box = bboxAnnotation(p);
    else continue;
    if (!box) continue;
    // id is optional on a primitive — never assume it is a string.
    box.id = p.id || '(no id)';
    box.type = p.type;
    boxes.push(box);
    console.log(`  ${String(box.id).padEnd(22)} [${String(p.type).padEnd(12)}] x=${Math.round(box.x0)}..${Math.round(box.x1)} y=${Math.round(box.y0)}..${Math.round(box.y1)}${box.tip ? ` tip=(${Math.round(box.tip.x)}, ${Math.round(box.tip.y)})` : ''}`);
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
      console.log(`  ⚠ COLLISION: ${a.type}#${a.id} <-> ${b.type}#${b.id} (penetration ${Math.round(pen)}px)`);
      collisions++;
    }
  }
  if (collisions === 0) console.log(`  ✓ no overlaps`);
  totalCollisions += collisions;
}

console.log(`\n${totalCollisions === 0 ? '✓' : '⚠'} ${totalCollisions} collision(s) across ${allStates.length} state(s).`);
