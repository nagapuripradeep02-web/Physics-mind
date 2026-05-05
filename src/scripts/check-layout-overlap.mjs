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

function bboxArrow(p) {
  const rad = (p.direction_deg || 0) * Math.PI / 180;
  const scale = p.scale_pixels_per_unit || 5;
  const dx = Math.cos(rad) * p.magnitude * scale;
  const dy = -Math.sin(rad) * p.magnitude * scale; // physics-y-up flip
  const x1 = p.from.x + dx, y1 = p.from.y + dy;
  const labelW = (p.label || '').length * CHAR_W + 8;
  const labelH = 14;
  // Bounding box covers the arrow line + a 14px label near the tip.
  return {
    x0: Math.min(p.from.x, x1) - 4,
    y0: Math.min(p.from.y, y1) - 4,
    x1: Math.max(p.from.x, x1) + Math.max(labelW, 4),
    y1: Math.max(p.from.y, y1) + labelH,
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
  const boxes = [];
  for (const p of state.scene_composition || []) {
    let box;
    if (p.type === 'force_arrow') box = bboxArrow(p);
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
