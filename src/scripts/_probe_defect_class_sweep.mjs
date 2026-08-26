// Defect-class sweep — Desk B doctrine (2026-08-06):
// "a register defect from one authoring habit appears in EVERY field that habit
//  touched; audit by DEFECT CLASS across all fields, not by the field the
//  finding happens to name."
//
// Proven when B-15's `label` rewrite left misconception_watch ("the instant the
// block RETIRES") and aha_moment.statement ("decides who WINS") untouched.
//
// Sweeps ALL string fields of both concepts against four classes at once.
import { readFileSync } from 'node:fs';

const WU = 0.92; // world units per metre — the world-unit-leak tell

// Fields whose values are ids/enums/config, not prose. Excluded to cut noise.
const SKIP_KEYS = new Set([
  'id', 'q_id', 'concept_id', 'shape', 'mode', 'glow_focal', 'body_id', 'type',
  'elementType', 'focal_primitive_id', 'motion_archetype', 'depth_ring',
  'advance_mode', 'curriculum', 'coverage', 'difficulty', 'teaches_state',
  'renderer_pair', 'panel_a', 'panel_b', 'color', 'unit', 'formula', 'derived',
  'state_id', 'start', 'end', 'schema_version', 'source_book', 'param',
  'syllabus_unit', 'verification_note', 'tested_idea', 'explorer_id',
]);

const CLASSES = [
  ['ENGINE-VERB', /\b(retires?|retiring|activates?|activating|halt-latch\w*|latched|re-?synchronis\w*|param[_ ]ramp|seizes?|re-?runs?\b|flips? (?:to|from)|stamps?\b)/i],
  ['INTERNAL-UNIT', /\b(wu|world units?|px)\b/i],
  ['MS-TIMING', /\b\d{3,5}\s*ms\b|\b\d+\s*-\s*\d+\s*ms\b/],
  ['PERSONIFY/IDIOM', /\b(wins?|winner|loses?|beats?|races? (?:to|against)|fights?|struggles?|wants?|knows?|likes?|prefers?|refuses?|tries to|eager|lazy|stubborn|happy|dictates?|decides who|fate|grip|budges?|lurch\w*|lets? go|gives? back|rides? on|all yours|sit(?:s)? equal|sit equal)\b/i],
];

const rows = [];
for (const id of ['pure_rolling', 'rolling_on_incline']) {
  const j = JSON.parse(readFileSync(`src/data/concepts/${id}.json`, 'utf8'));

  (function walk(o, path) {
    if (o == null) return;
    if (typeof o === 'string') {
      const key = path.split('.').pop().replace(/\[\d+\]$/, '');
      if (SKIP_KEYS.has(key)) return;
      if (o.length < 4) return;
      for (const [name, re] of CLASSES) {
        const m = o.match(re);
        if (m) rows.push({ id, path, cls: name, hit: m[0], text: o });
      }
      // world-unit leak: a number that is a clean physical value x 0.92
      for (const m of o.matchAll(/(\d+\.\d+)\s*(m\/s|N|J|m)\b/g)) {
        const v = parseFloat(m[1]);
        if (!isFinite(v) || v === 0) continue;
        const implied = v / WU;
        if (Math.abs(implied * 20 - Math.round(implied * 20)) < 1e-9 && Math.abs(v * 20 - Math.round(v * 20)) > 1e-9) {
          rows.push({ id, path, cls: 'WORLD-UNIT?', hit: `${m[0]} (=${implied.toFixed(2)}x0.92)`, text: o });
        }
      }
      return;
    }
    if (Array.isArray(o)) return o.forEach((v, i) => walk(v, `${path}[${i}]`));
    if (typeof o === 'object') return Object.entries(o).forEach(([k, v]) => walk(v, path ? `${path}.${k}` : k));
  })(j, '');
}

if (!rows.length) { console.log('SWEEP CLEAN — no hits in any class, either concept.'); process.exit(0); }
const short = (p) => p.replace(/^field_3d_config\./, 'f3d.').replace(/^epic_l_path\./, 'epic.').replace(/^assessment\./, 'assess.');
for (const c of ['ENGINE-VERB', 'INTERNAL-UNIT', 'MS-TIMING', 'PERSONIFY/IDIOM', 'WORLD-UNIT?']) {
  const sub = rows.filter((r) => r.cls === c);
  console.log(`\n=== ${c} — ${sub.length} hit(s)`);
  for (const r of sub) {
    console.log(`  [${r.id}] ${short(r.path)}`);
    console.log(`      hit: ${JSON.stringify(r.hit)}  in: ${JSON.stringify(r.text.slice(0, 130))}`);
  }
}
console.log(`\nTOTAL ${rows.length} hit(s)`);
