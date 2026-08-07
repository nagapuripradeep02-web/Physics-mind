/**
 * engine_bug_queue: WIDEN + CLOSE
 *   nlb_arrow_and_arc_labels_never_received_the_force_rig_label_legibility_floor
 *
 * The row was filed (Ch.6 concept #2 review chain, 2026-08-02) as a LABEL-only defect —
 * "port the force_rig ink helper and the text recede value". The founder's own review widened
 * it: "the friction arrow and the angle between the distance and friction arrow shown is not
 * properly visible. This is really light. Make it a little bit more darker to see." Measurement
 * then widened it again: the friction ARROW measured 1.00:1 at its stroke centre (it is exactly
 * as bright as the slab it is drawn on) and the arc's crossing of the slab was not faint but
 * ABSENT. The title / root_cause / prevention_rule / probe_logic below are rewritten to the
 * defect and the fix that actually shipped; the bug_class string is UNCHANGED, so this is an
 * upsert of the same row and not a duplicate.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_nlb_ink_legibility_floor.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-02_nlb_ink_legibility_floor_backdrop_relative';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:json_author'
  | 'peter_parker:renderer_primitives' | 'peter_parker:field3d_surgeon'
  | 'peter_parker:runtime_generation' | 'peter_parker:visual_validator' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'probe_definition' | 'directive';

interface Row {
  bug_class: string; title: string; severity: Severity; owner_cluster: Owner;
  root_cause: string; prevention_rule: string; probe_type: ProbeType; probe_logic: string;
  status: Status; concepts_affected: string[]; fixed_in_files: string[]; row_type: RowType;
}

const RENDERER = 'src/lib/renderers/field_3d_renderer.ts';

const rows: Row[] = [
  {
    bug_class: 'nlb_arrow_and_arc_labels_never_received_the_force_rig_label_legibility_floor',
    title:
      'newtons_laws_body draws arrow ink, arc stroke and labels in raw identity colour at 1 px weight over TWO backdrops six stops apart, so the friction arrow renders at 1.00:1 against the slab it sits on and the angle arc disappears where it crosses it',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'FIXED 2026-08-02 (founder review of positive_negative_zero_work). Three independent causes, all measured from real EYE frames (STATE_2 dense t=1000 ms), not inferred. (1) BACKDROP. newtons_laws_body draws its overlay over two backdrops at once: the lit slab, which renders at rgb(129,155,168) = relative luminance 0.309 on its top face and 0.211 on its front edge, and the page at rgb(10,10,26) = 0.0036. The friction arrow ink (#F06292, luminance 0.293) sits on the slab, so its shaft measured rgb(186,137,164) = 0.310 against a 0.309 backdrop: a contrast ratio of 1.00:1. The arrow was not dim, it was EXACTLY as bright as its backdrop. Its label measured 1.01:1. The sibling FIXED row force_rig_arrow_label_ink_too_dark_to_read_against_the_apparatus prescribes a hue-preserving LIFT to FR_INK_LUM_MIN=0.62, which is correct there because every force_rig backdrop is dark (brightest 0.047) and WRONG here: the ink ranges that clear 4.5:1 against the two backdrops are disjoint (>=0.191 over the page, <=0.030 over the slab), so a blanket lift would have fixed the theta label and pushed the friction arrow below 1:1. (2) STROKE WEIGHT. Every nlb arrow shaft was a THREE.Line, which WebGL renders at 1 px, and measured it did not fill even that: the friction shaft arrived as an exact 50/50 blend of ink and slab, and the angle arc, a curve, lost its diagonal runs to about a quarter coverage (rgb(35,32,37) where the pure ink is rgb(108,96,68)). At 50% coverage NO ink value clears 3:1 over the slab. force_rig had already solved this with frAddShaft; nlb never received it. (3) PEER RECEDE. GLOW_DIM_OPACITY=0.40 multiplies ink toward the backdrop, so a peer label measured 1.52:1 (STATE_1 F) and a peer stroke could not reach 3:1 at any ink value; the force_rig text carve-out (0.40 -> 0.85) had not been ported, and strokes needed one too.',
    prevention_rule:
      'The legibility floor is stated RELATIVE to the LOCAL backdrop, never as one global ink value: push the ink AWAY from what is behind it, upward over the dark page and DOWNWARD over the lit slab. Both directions preserve hue (a lift c + (255-c)t leaves the HSL hue fixed; a deepen c*(1-t) is a pure value scale and leaves HSV hue AND saturation fixed), so a label still matches its arrow by colour alone. The direction is decided per element from the GEOMETRY, by a camera raycast against the slab mesh at the element ink anchor (an arrow is anchored at its shaft midpoint) — never from a world-y band, because the slab depth projects roughly 16 px of screen height ABOVE its top face, which is exactly where the friction lane lives, and never authored per concept, because the camera is draggable. Rule 29 generalises with it: emphasis is still a luminance move and never a size move, but a focal over a light backdrop moves DEEPER, not brighter, since brightening toward a light backdrop destroys the contrast it is supposed to add. Three corollaries that are part of the floor, not optional: (a) ink needs real stroke WEIGHT before any colour rule can act — a 1 px hairline is half consumed by coverage, so arrows carry a mesh cylinder shaft and a curve is a tube; (b) the ONE stroke that crosses both backdrops in a single sweep (the angle arc) keeps ONE ink and takes a dark CASING instead, because recolouring the middle third of a continuous curve reads as a rendering fault, not as emphasis — this is the same construction the label sprites already bake in as an 8 px near-black stroke; (c) the peer recede must be a value the ink survives (labels 0.85, strokes 0.60 over the page and 0.85 over the slab) — Rule 32e is unaffected, the focal still goes to full opacity plus the contrast boost. When a scar is closed in one scenario region for Rule-40 reasons, the row must enumerate the sibling scenarios that share the defect: force_rig and newtons_laws_body now BOTH carry an ink floor, and any third scenario that draws overlay ink on a lit apparatus needs the backdrop-relative form, not the force_rig lift.',
    probe_type: 'js_eval',
    probe_logic:
      'Frame probe, run on the captured EYE frames (the mocked node driver cannot see any of this). For each arrow, arc, right-angle marker and label: take a tight ink box, gate to pixels within 22 degrees of the element authored hue with chroma >= 14, take the stroke centre as the mean of the 8 hue-gated pixels furthest from the backdrop, and take the LOCAL backdrop as the median luminance of a 4 px ring of non-ink pixels around the box — never a global constant, and reported per backdrop when a box straddles the slab top face (0.309) and its front edge (0.211). Assert (L_hi + 0.05)/(L_lo + 0.05) >= 4.5 for every text label and >= 3.0 for every graphical stroke, in every state, in BOTH the focal and the dimmed-peer case, and assert the measured hue is still within 5 degrees of the authored hue (the lens moves luminance only). Measured on positive_negative_zero_work after the fix: friction arrow 1.31 -> 6.30:1 (hue 339.0 vs authored 339.7), friction label 1.01 -> 4.6:1 against the slab front edge, arc over the page 3.17 -> 13.65:1, theta label 2.69 -> 11.76:1, d shaft 2.31 -> 12.50:1, d label 1.94 -> 9.72:1, STATE_1 F label 1.52 -> 4.67:1; on friction_force, focal friction over the slab 6.44:1 and peer mg over the page 5.41:1. KNOWN RESIDUAL, deliberately not chased: the arc CORE where it crosses the lit slab measures 2.82:1 against the slab, and is carried by its 2 px near-black casing (6.7:1 against the same slab) rather than by core luminance — no bright ink can clear 3:1 against a 0.309 backdrop, since that would require a rendered luminance above 1.0.',
    status: 'FIXED',
    concepts_affected: [
      'positive_negative_zero_work', 'work_done_by_constant_force', 'connected_bodies',
      'friction_force', 'block_on_incline', 'normal_force', 'tension_force',
      'newton_first_law', 'newton_second_law', 'newton_third_law',
      'free_body_diagram', 'rolling_friction',
    ],
    fixed_in_files: [RENDERER],
    row_type: 'incident',
  },
];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length === 0 ? `ARRAY[]::text[]` : `ARRAY[${a.map(sqlStr).join(', ')}]`; }
function sqlRow(r: Row): string {
  return `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(SESSION)}, ${sqlStr(r.row_type)})`;
}
function emitSql(all: Row[]): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type';
  return `-- 2026-08-02: the newtons_laws_body INK LEGIBILITY FLOOR (founder review).\n` +
    `-- Widens and CLOSES nlb_arrow_and_arc_labels_never_received_the_force_rig_label_legibility_floor\n` +
    `-- from a label-only row to arrow ink + arc stroke + labels, backdrop-relative.\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_nlb_ink_legibility_floor.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files,\n` +
    `  fixed_at = CASE WHEN EXCLUDED.status = 'FIXED' THEN now() ELSE engine_bug_queue.fixed_at END;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-02_seed_engine_bug_queue_nlb_ink_legibility_floor_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} row(s))`);

  const payload = rows.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ ${rows.length} row(s) upserted (status FIXED)`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
