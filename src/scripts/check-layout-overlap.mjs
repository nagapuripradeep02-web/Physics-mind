// Quick layout-overlap check for current_not_vector states.
// Replicates the renderer's coord math:
//   force_arrow tip: (from.x + cos(deg)*mag*scale, from.y - sin(deg)*mag*scale)   (physics-y-up flipped)
//   annotation/formula_box: position is the BOX CENTER; bbox = w x h based on text wrapping
// Does NOT replicate the resolver shifts (annotation-annotation only) — we want raw collisions.
import fs from 'node:fs';
import path from 'node:path';

const PATH = process.argv[2] || 'C:/Tutor/physics-mind/src/data/concepts/current_not_vector.json';
const json = JSON.parse(fs.readFileSync(PATH, 'utf8'));

const CHAR_W = 7;
const LINE_H = 17;
const PAD_X = 16;
const PAD_Y = 12;

function bboxAnnotation(p) {
  const lines = String(p.text || '').split('\n');
  const maxLen = lines.reduce((m, l) => Math.max(m, l.length), 0);
  const w = Math.max(60, maxLen * CHAR_W + PAD_X);
  const h = lines.length * LINE_H + PAD_Y;
  return { x0: p.position.x - w / 2, y0: p.position.y - h / 2, x1: p.position.x + w / 2, y1: p.position.y + h / 2, w, h };
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
    tip: { x: x1, y: y1 }
  };
}

function rectsOverlap(a, b) {
  return !(a.x1 < b.x0 || b.x1 < a.x0 || a.y1 < b.y0 || b.y1 < a.y0);
}

const states = json.epic_l_path.states;
const STATES = ['STATE_1', 'STATE_2', 'STATE_3', 'STATE_4', 'STATE_5'];

for (const sid of STATES) {
  const state = states[sid];
  if (!state) continue;
  console.log(`\n=== ${sid} : ${state.title} ===`);
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
    else if (p.type === 'annotation' || p.type === 'formula_box' || p.type === 'label') box = bboxAnnotation(p);
    else continue;
    box.id = p.id;
    box.type = p.type;
    boxes.push(box);
    console.log(`  ${p.id.padEnd(22)} [${p.type.padEnd(12)}] x=${Math.round(box.x0)}..${Math.round(box.x1)} y=${Math.round(box.y0)}..${Math.round(box.y1)}${box.tip ? ` tip=(${Math.round(box.tip.x)}, ${Math.round(box.tip.y)})` : ''}`);
  }
  // Find collisions
  let collisions = 0;
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      if (rectsOverlap(boxes[i], boxes[j])) {
        const a = boxes[i], b = boxes[j];
        // Label-only annotations are < 80px wide; collision with arrow head is fine if it's the same vector's label
        console.log(`  ⚠ COLLISION: ${a.id} <-> ${b.id}`);
        collisions++;
      }
    }
  }
  if (collisions === 0) console.log(`  ✓ no overlaps`);
}
