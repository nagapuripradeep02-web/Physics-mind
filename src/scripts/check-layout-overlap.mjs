// Layout-overlap check for a concept's states.
// Replicates the parametric renderer's coord + text-box math so an author can
// eyeball real visual collisions before handoff (json_author / quality_auditor
// Gate 9). Does NOT replicate PM_resolveAnnotationOverlap's shifts (annotation↔
// annotation only) — we want to see the RAW authored collisions.
//
// Usage:  node src/scripts/check-layout-overlap.mjs <path-or-concept-id>
//   node src/scripts/check-layout-overlap.mjs src/data/concepts/current_not_vector.json
//   node src/scripts/check-layout-overlap.mjs bohr_model_energy_levels   # resolves physics OR chemistry
//
// Box model (mirrors src/lib/renderers/parametric_renderer.ts draw fns):
//   label       drawLabel      textAlign(CENTER, CENTER), font_size default 14, lineH = size*1.25 — CENTRE-anchored
//   annotation  drawAnnotation textAlign(LEFT, TOP),      font_size 12,         lineH = size*1.35 + padding — TOP-LEFT-anchored
//   formula_box                treated like annotation (top-left text block)
//   force_arrow drawForceArrow line from `from` to tip (magnitude*scale, physics-y-up flipped) + a label box near the tip
//
// The state list is ENUMERATED from the concept JSON (epic_l_path.states +
// epic_c_branches) — never a hardcoded STATE_1..STATE_N array. A checker that
// silently skips states is worse than no checker (engine_bug_queue:
// layout_overlap_script_hardcodes_first_five_states, 2026-07-24).
import fs from 'node:fs';
import path from 'node:path';

// ── Resolve the concept path ────────────────────────────────────────────────
const arg = process.argv[2];
if (!arg) {
  console.error('usage: node src/scripts/check-layout-overlap.mjs <path-or-concept-id>');
  process.exit(1);
}

function resolveConceptPath(a) {
  // A real path (has a slash or ends .json) is used verbatim.
  if (a.includes('/') || a.includes('\\') || a.endsWith('.json')) return a;
  // A bare concept id resolves against the flat physics dir first, then chemistry.
  const candidates = [
    path.join('src/data/concepts', `${a}.json`),
    path.join('src/data/concepts/chemistry', `${a}.json`),
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return candidates[0]; // let the read fail with a clear ENOENT on the expected path
}

const PATH = resolveConceptPath(arg);
const json = JSON.parse(fs.readFileSync(PATH, 'utf8'));

// ── Text-box geometry (per-primitive, matching the renderer) ────────────────
// p5 textWidth is font-dependent; ~0.55·font_size per char is a good estimate
// for the sans font the renderer uses.
const CHAR_W_RATIO = 0.55;

function lines(text) {
  // The renderer splits on a literal "\n" (authored as "\\n" in JSON strings).
  return String(text ?? '').split(/\\n|\n/);
}

// label: CENTRE-anchored, font_size default 14, lineH = size*1.25.
function bboxLabel(p) {
  const size = p.font_size || 14;
  const ls = lines(p.text_expr ?? p.text);
  const maxLen = ls.reduce((m, l) => Math.max(m, l.length), 0);
  const w = Math.max(24, maxLen * size * CHAR_W_RATIO);
  const lineH = size * 1.25;
  const h = ls.length * lineH;
  return {
    x0: p.position.x - w / 2, y0: p.position.y - h / 2,
    x1: p.position.x + w / 2, y1: p.position.y + h / 2,
  };
}

// annotation / formula_box: TOP-LEFT-anchored, font_size 12, lineH = size*1.35,
// callout padding padX=8, padY=6 (drawAnnotation).
function bboxAnnotation(p) {
  const size = p.font_size || 12;
  const ls = lines(p.text ?? p.text_expr);
  const maxLen = ls.reduce((m, l) => Math.max(m, l.length), 0);
  const padX = 8, padY = 6;
  const w = maxLen * size * CHAR_W_RATIO + padX * 2;
  const lineH = size * 1.35;
  const h = ls.length * lineH + padY * 2;
  return {
    x0: p.position.x - padX, y0: p.position.y - padY,
    x1: p.position.x - padX + w, y1: p.position.y - padY + h,
  };
}

// force_arrow: line from `from` to tip + a small label box near the tip.
function bboxArrow(p) {
  const rad = (p.direction_deg || 0) * Math.PI / 180;
  const scale = p.scale_pixels_per_unit || 5;
  const mag = typeof p.magnitude === 'number' ? p.magnitude : 1;
  const dx = Math.cos(rad) * mag * scale;
  const dy = -Math.sin(rad) * mag * scale; // physics-y-up flip
  const x1 = p.from.x + dx, y1 = p.from.y + dy;
  const labelW = String(p.label ?? '').length * 12 * CHAR_W_RATIO + 8;
  const labelH = 14;
  return {
    x0: Math.min(p.from.x, x1) - 4,
    y0: Math.min(p.from.y, y1) - 4,
    x1: Math.max(p.from.x, x1) + Math.max(labelW, 4),
    y1: Math.max(p.from.y, y1) + labelH,
    tail: { x: p.from.x, y: p.from.y },
    tip: { x: x1, y: y1 },
  };
}

function boxFor(p) {
  if (p.type === 'force_arrow') return bboxArrow(p);
  if (p.type === 'annotation' || p.type === 'formula_box') return bboxAnnotation(p);
  if (p.type === 'label') return bboxLabel(p);
  return null;
}

// Penetration-based overlap. A collision counts only when the boxes interpenetrate
// by more than MIN_PEN on their shallower axis. Line-height boxes (font·1.25)
// otherwise graze by ~1px when labels sit at the intentional 14px stagger the
// queue treats as clean — MIN_PEN suppresses those false positives while still
// catching boxes that genuinely sit on top of each other.
const MIN_PEN = 3;
function overlapDepth(a, b) {
  const ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
  const oy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
  if (ox <= 0 || oy <= 0) return 0; // disjoint on some axis
  return Math.min(ox, oy);
}

// ── Enumerate states from the JSON (physics epic_l_path + any epic_c branches) ─
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
  console.error(`No states found in ${PATH} (looked in epic_l_path.states + epic_c_branches).`);
  process.exit(1);
}

console.log(`Concept: ${json.concept_id || path.basename(PATH)}  —  ${allStates.length} states`);
let totalCollisions = 0;

for (const { label, state } of allStates) {
  const title = state && state.title ? ` : ${state.title}` : '';
  console.log(`\n=== ${label}${title} ===`);
  const boxes = [];
  for (const p of (state && state.scene_composition) || []) {
    const box = boxFor(p);
    if (!box) continue;
    box.id = p.id || '(no id)';
    box.type = p.type;
    boxes.push(box);
    console.log(`  ${String(box.id).padEnd(24)} [${String(box.type).padEnd(11)}] x=${Math.round(box.x0)}..${Math.round(box.x1)} y=${Math.round(box.y0)}..${Math.round(box.y1)}${box.tip ? ` tip=(${Math.round(box.tip.x)}, ${Math.round(box.tip.y)})` : ''}`);
  }
  let collisions = 0;
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      const pen = overlapDepth(a, b);
      if (pen <= MIN_PEN) continue;
      // Intentional junction-style overlap: two force_arrows whose tails share
      // an origin (within 4px) — wires converging, pressure on every wall, etc.
      if (a.tail && b.tail && Math.hypot(a.tail.x - b.tail.x, a.tail.y - b.tail.y) < 4) continue;
      console.log(`  ⚠ COLLISION: ${a.type}#${a.id} <-> ${b.type}#${b.id} (penetration ${Math.round(pen)}px)`);
      collisions++;
    }
  }
  if (collisions === 0) console.log(`  ✓ no overlaps`);
  totalCollisions += collisions;
}

console.log(`\n${totalCollisions === 0 ? '✓' : '⚠'} ${totalCollisions} collision(s) across ${allStates.length} states.`);
