/**
 * engine_bug_queue — #9 `lines_and_planes_in_space` PASS-3 AUDIT + PR #118, filed 2026-08-20.
 *
 * The rows the 2026-08-10 session shipped fixes for and never filed. Its own §2a
 * lesson was "a correction that exists only in a database is not in the record at
 * all"; a fix that exists only in a commit message is the same failure one rung
 * down, and it is the reason this file exists ten days late.
 *
 * Same doctrine as its siblings: marker-gated (a row already carrying its note is
 * never touched), SQL generated from the SAME structures the TS applies, and NO
 * write downgrades a protected status — the rows authored OPEN refuse to overwrite
 * a live FIXED/FALSE_POSITIVE, and the rows authored FIXED refuse to overwrite a
 * live FALSE_POSITIVE.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_lines_and_planes_pass3.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-10_lines_and_planes_pass3_audit';
const J = 'src/data/concepts/mathematics/lines_and_planes_in_space.json';
const SKEL = 'docs/skeletons/lines_and_planes_in_space_skeleton.md';
const R = 'src/lib/renderers/field_3d_renderer.ts';
const GATE = 'src/scripts/check_vector_geometry_3d.ts';
const PROTECTED = ['FIXED', 'FALSE_POSITIVE'];

interface Row {
  bug_class: string; title: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
  owner_cluster: string;
  root_cause: string; prevention_rule: string;
  probe_type: 'js_eval'; probe_logic: string;
  status: 'OPEN' | 'FIXED';
  concepts_affected: string[]; fixed_in_files: string[];
  row_type: 'incident'; fixed_at: string | null;
  /** distinctive substring of root_cause; a row already carrying it is never rewritten */
  marker: string;
}

const ROWS: Row[] = [
  {
    bug_class: 'field3d_pooled_geometry_bakes_a_dimension_the_placer_multiplies_again_so_the_shipped_size_is_that_dimension_squared',
    title: 'The vg tube pool baked its radius into the geometry AND scaled by it again at placement, so every line shipped at radius squared — a ~0.1px hairline at ~4% of intended ink',
    severity: 'CRITICAL',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause: 'The vg tube pool built its CylinderGeometry with the stroke radius baked in, and the placer then multiplied it again — mesh.scale.set(radius, len, radius) — so the effective world radius = radius squared: 0.035 became 0.001225, roughly 4% of the intended ink, and EVERY line and segment in both vg concepts rendered as a ~0.1px dotted hairline. It shipped inside VG-C\'s own build (93097fc) and lived under a fully green gate through 716 -> 1015 assertions, because nothing asserted that a drawn object is thick enough to see (filed separately). FIVE frame walks read it as a style choice — thinness reads as intent, which is why no human caught it either. The THIRD quality_auditor pass root-caused it 2026-08-10 from within-frame contrast, ink counts, the per-state radius-squared ordering and single-commit provenance, and it shipped as PR #118 (bb11bf4): pool geometry is now UNIT in radius and height, the placer owns every dimension, and the factory takes NO radius parameter, so the double application is unrepresentable rather than merely fixed. Widths single-sourced in VG_TUBE_R (0.035/0.045/0.05 — the authored intent, now reaching the screen at 28.6x/22.2x/1x). The :15329 projection site was already unit-pooled and correct, routed through the table for single-source only; point spheres verified same-class-correct; BufferGeometry and ArrowHelper paths untouched and asserted so. No shipped concept authors vector_geometry_3d, so zero master baselines change. THE STANDING CONSEQUENCE: every pre-fix pixel observation on the two branch consumers about line legibility, occlusion, or label-versus-line collision is UNTRUSTWORTHY — a 0.1px line cannot overlap anything — and as of this filing THE EYE has not been re-run since the fix merged. FILED 2026-08-20, ten days after the fix shipped: PR #118 carried the renderer and the gate and no queue row, so the defect existed only in a commit message.',
    prevention_rule: 'A DIMENSION IS APPLIED EXACTLY ONCE, AND THE SECOND APPLICATION IS MADE UNREPRESENTABLE RATHER THAN MERELY DELETED. Pooled geometry is UNIT in every dimension the placer sets; the placer owns size; the factory takes no size parameter, so no caller can pass one twice. Where a pool and a placer both touch one quantity, that is the defect shape — grep for the quantity at BOTH sites before trusting either. And when a size or scale defect is fixed, every pixel observation recorded before the fix is void by default: re-walk, do not re-read the old evidence.',
    probe_type: 'js_eval',
    probe_logic: 'check:vector-geometry-3d section 29 — 40 assertions / 3 negative controls: a region-wide structural scan asserting every pooled geometry in the vg region is constructed UNIT; a recording-stub runtime measurement of ctorR x scaleX (measured through the shipped path, not read from source); a >=2px projected-stroke floor at BOTH ends of the shipped camera band; and the pre-fix source reconstructed under four throw guards and RUN, measuring 0.001225 = 0.035 squared to 1e-15. Both guards were proven by deliberate drift before trust. Totals 1015 -> 1055 PASS, zero regressions.',
    status: 'FIXED',
    concepts_affected: ['lines_and_planes_in_space', 'vector_products_in_space'],
    fixed_in_files: [R, GATE],
    row_type: 'incident',
    fixed_at: '2026-08-10T16:03:00.000Z',
    marker: 'the effective world radius = radius squared',
  },
  {
    bug_class: 'no_gate_asserts_a_drawn_object_is_thick_enough_to_see_so_a_four_percent_ink_render_passes_every_check',
    title: 'Every gate checks THAT a stroke is drawn and none checks that it is wide enough to see, so a 4%-of-intended-ink render passed five walks and a green gate',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:visual_validator',
    root_cause: 'The radius-squared defect (sibling row, PR #118) survived 716 -> 1015 green gate assertions, THE EYE, and five separate frame walks, for one reason: no check in the fleet reads the projected WIDTH of a drawn primitive. THE EYE\'s D-series asks whether pixels CHANGE (D5 motion, with an ink-relative lens added for thin primitives) and H2 asks whether a frame REPRODUCES — and a hairline reproduces exactly as faithfully as a correct stroke, so an H2 baseline locked over one certifies it forever. The structural gates assert an object is present in visible_elements and that its geometry resolves; presence is not visibility. A human reviewer is not the backstop either: five walks read a 0.1px line as a deliberate style, because thinness reads as intent rather than as a bug. check:vector-geometry-3d section 29 now carries a >=2px projected-stroke floor at both ends of the shipped camera band, which closes the class FOR ONE SCENARIO. Nothing equivalent exists in THE EYE or in any other renderer\'s gate, so the fleet remains blind to the same defect anywhere else. Filed OPEN deliberately: the vg half is shipped, the general half is not.',
    prevention_rule: 'A GATE THAT ASSERTS AN OBJECT IS DRAWN ALSO ASSERTS IT IS VISIBLE. Measure the projected size of each drawn primitive at the shipped camera — stroke width in PIXELS for lines and tubes, projected area for surfaces — and assert a floor at both ends of any camera band the state can reach. Presence in visible_elements, a resolving geometry, a green pixel-diff and a reproducing baseline are all satisfiable by ink too thin to see. Corollary for reviewers: an unusually thin, faint or small element is a MEASUREMENT to take, never a style to accept.',
    probe_type: 'js_eval',
    probe_logic: 'At each state\'s frozen pin, for every drawn stroke primitive: project its cross-section at the shipped camera and at both ends of any authored camera band, and assert the on-screen width is >= 2px (and >= the authored intent within a stated tolerance, so a silently shrunken-but-visible stroke also fails). Negative control: reconstruct the pre-fix radius law (radius baked at construction AND multiplied at placement) and assert the probe FAILS on it — the vg section 29 implementation is the reference. Fleet extension: run the same measurement from THE EYE so it covers renderers with no scenario gate of their own.',
    status: 'OPEN',
    concepts_affected: ['lines_and_planes_in_space', 'vector_products_in_space'],
    fixed_in_files: [],
    row_type: 'incident',
    fixed_at: null,
    marker: 'which closes the class FOR ONE SCENARIO',
  },
  {
    bug_class: 'a_fix_round_closes_the_reported_instances_of_a_restated_value_and_never_sweeps_the_document_for_the_rest',
    title: 'Three rounds each corrected one cell restating the same figure, and two of them recorded the class closed without sweeping for the others',
    severity: 'MODERATE',
    owner_cluster: 'alex:architect',
    root_cause: 'STATE_6\'s rotation was re-authored to start at the pair\'s own inherited 69.3846 degrees instead of 25 degrees — a 25-degree start silently changed the angle STATE_5 hands over, on the state that teaches the angle. That figure is restated in several places: the JSON per-object note, the skeleton\'s M2 note, and the skeleton\'s pacing table. The auditor round of 2026-08-10 corrected the first; the re-audit round the same day corrected the second AND recorded the class closed; the pass-3 audit then found a THIRD, the pacing table, still reading 25 -> 115, having survived both. Each round fixed exactly what it was handed. The neighbouring row skeleton_cites_two_contradictory_values_for_one_measured_event_in_the_same_document is FIXED for ITS OWN figure and did not prevent this, which is the point: closing an instance is not closing a class, and a round that says "the class is closed" without a sweep is asserting something it never measured. Fixed in fab6235 with the catch history recorded in the amended cell. SWEEP VERIFIED 2026-08-20 (the discipline this row demands, applied to itself): grep of both figures across the concept JSON, the skeleton and the mathematics block returns 10 hits, every one a legitimate reference to the slider FLOOR or to the 25-115 degree interval the camera fidelity was solved over, and ZERO cells claiming the rotation STARTS at 25 degrees.',
    prevention_rule: 'WHEN A RESTATED VALUE IS FOUND STALE, SWEEP THE WHOLE DOCUMENT SET FOR BOTH THE OLD AND THE NEW FIGURE AND FIX EVERY HIT IN THE SAME COMMIT. A round may record the class closed only after showing the sweep returned zero, and the commit quotes the hit count and classifies every surviving hit as intentional. One stale cell found by hand is evidence that the others are still there, not that it was the last one. The durable form is the standing rule already on the sibling row — a measured value is written ONCE and referenced everywhere else — but until a document is restructured that way, the sweep is what stands in for it.',
    probe_type: 'js_eval',
    probe_logic: 'For every superseded numeric literal named in a fix commit, assert zero occurrences remain across the concept JSON, its skeleton and its mathematics block — with each intentional survivor listed by file and line in the assertion itself, so an unclassified hit fails. Negative control: the pre-fab6235 skeleton must FAIL on the pacing-table cell while the two already-corrected cells pass.',
    status: 'FIXED',
    concepts_affected: ['lines_and_planes_in_space'],
    fixed_in_files: [SKEL, J],
    row_type: 'incident',
    fixed_at: '2026-08-10T15:51:00.000Z',
    marker: 'SWEEP VERIFIED 2026-08-20',
  },
  {
    bug_class: 'label_separation_is_a_function_of_the_authored_camera_and_no_gate_recomputes_it_when_the_camera_moves',
    title: 'STATE_4\'s d and n labels projected 12-21px apart into one glyph cluster, and the remedy is a camera value with no gate behind it',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause: 'On lines_and_planes_in_space STATE_4 the d and n labels projected to within ~12-21px of each other and read as a single glyph cluster (Rule 34d). Both are correctly anchored to distinct 3D objects: the collision exists ONLY in the projection, so it is invisible in the JSON, invisible to every structural gate, and visible only in a frame. Fixed by authoring in fab6235 — camera nudged az -6 / el +3 at the same R=13, computed separation +65% (21 -> 35px in the projection model), with the side effect of de-aligning the view axis slightly from Lpar\'s direction, which marginally improves the known near-end-on stub; crossing-beat correctness is camera-independent because the marker is a literal 3D point. THIS ROW STAYS OPEN because the fix is not yet proven and is structurally fragile: (a) the +65% is COMPUTED in the projection model and was never pixel-verified — the plan was to ride the EYE re-run that PR #118 forces, and that re-run has not happened; and (b) a camera value is not a mechanism, so the collision re-appears silently the next time this state\'s camera is re-authored. The class already hit this concept one round earlier from the other direction: the missing d1 label turned out to be FRAMING, camera r=5.0 sitting outside VG_SCENE_RADIUS 4.5 with the label point 47.4 degrees off-axis. Another renderer solved the same class durably — see world_anchored_label_collides_needs_screen_space_placement, FIXED for vsepr by projecting candidate screen-space offsets and taking the one farthest from every other projected object. vg has no such pass.',
    prevention_rule: 'A LABEL COLLISION FIXED BY MOVING THE CAMERA IS PROVISIONAL UNTIL A GATE RECOMPUTES IT. Any edit to an authored camera re-runs a projected label-separation check for that state IN THE SAME CHANGE, because the separation is a function of the pose and nothing in the JSON records the dependency. The durable fix is screen-space placement — generate candidate offsets, project each, take the one farthest from every other projected object — and until a renderer has that pass, every camera value in it carries an unwritten label-separation constraint.',
    probe_type: 'js_eval',
    probe_logic: 'At each state\'s frozen pin, project every visible label sprite to screen space and assert every pairwise bounding-box gap is >= 12px, at the shipped camera and at both ends of any authored camera band. Negative control: STATE_4\'s pre-fix camera [-12.0240, 4.8699, -0.8408] must FAIL while the shipped [-11.603, 5.494, -2.0459] passes. The check re-runs on every camera edit, not only on a full walk.',
    status: 'OPEN',
    concepts_affected: ['lines_and_planes_in_space'],
    fixed_in_files: [],
    row_type: 'incident',
    fixed_at: null,
    marker: 'THIS ROW STAYS OPEN because the fix is not yet proven',
  },
];

/** Marker-gated annotation: the neighbouring class recurred on a different figure. */
const UPDATES = [
  {
    bug_class: 'skeleton_cites_two_contradictory_values_for_one_measured_event_in_the_same_document',
    marker: 'CLASS RECURRED 2026-08-10',
    note: ' CLASS RECURRED 2026-08-10 on a different figure, and the recurrence is tracked on its own row (a_fix_round_closes_the_reported_instances_of_a_restated_value_and_never_sweeps_the_document_for_the_rest). STATE_6\'s rotation start was restated in three cells across the JSON and the skeleton; three consecutive rounds each corrected one, and two of them recorded the class closed without sweeping. This row stays FIXED for its own event (the 0.495 / 0.815 screen-crossing pair) — the point of the annotation is that its prevention rule, "a measured value is written ONCE and referenced everywhere else", was never applied to the document as a whole, so the same class kept producing new instances under a closed row.',
  },
];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length ? `ARRAY[${a.map(sqlStr).join(', ')}]::text[]` : `ARRAY[]::text[]`; }
function sqlNull(s: string | null): string { return s === null ? 'NULL' : sqlStr(s); }

/**
 * The conflict predicate, per row and in BOTH paths:
 *   · never rewrite a row that already carries this note (order-independent replay)
 *   · a row authored OPEN never overwrites a live FIXED or FALSE_POSITIVE
 *   · a row authored FIXED never overwrites a live FALSE_POSITIVE
 */
function guardSql(r: Row): string {
  const statusGuard = r.status === 'OPEN'
    ? `engine_bug_queue.status NOT IN ('FIXED', 'FALSE_POSITIVE')`
    : `engine_bug_queue.status <> 'FALSE_POSITIVE'`;
  return `WHERE engine_bug_queue.root_cause NOT LIKE ${sqlStr(`%${r.marker}%`)}\n  AND ${statusGuard};`;
}

function emitSql(): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type, fixed_at';
  const ins = ROWS.map((r) =>
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n` +
    `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(SESSION)}, ` +
    `${sqlStr(r.row_type)}, ${sqlNull(r.fixed_at)})\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  root_cause = EXCLUDED.root_cause, prevention_rule = EXCLUDED.prevention_rule,\n` +
    `  probe_logic = EXCLUDED.probe_logic, status = EXCLUDED.status,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files,\n` +
    `  fixed_at = EXCLUDED.fixed_at\n` +
    guardSql(r) + '\n').join('\n');
  const upd = UPDATES.map((u) =>
    `UPDATE engine_bug_queue SET\n  root_cause = root_cause || ${sqlStr(u.note)}\n` +
    `WHERE bug_class = ${sqlStr(u.bug_class)}\n  AND root_cause NOT LIKE ${sqlStr(`%${u.marker}%`)};\n`).join('\n');
  return `-- 2026-08-20 — lines_and_planes_in_space PASS-3 AUDIT + PR #118: ${ROWS.length} rows\n` +
    `-- (2 FIXED, 2 OPEN) + ${UPDATES.length} marker-gated annotation. These are the rows the\n` +
    `-- 2026-08-10 session shipped fixes for and never filed; the fixes are ancestors of the\n` +
    `-- branch HEAD, the two OPEN rows are open on purpose (see their root_cause).\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_lines_and_planes_pass3.ts from the SAME\n` +
    `-- structures the TS path applies. Idempotent, order-independent, never a downgrade:\n` +
    `-- each conflict path refuses a row already carrying its marker, refuses to overwrite a\n` +
    `-- FALSE_POSITIVE, and (for the OPEN rows) refuses to overwrite a FIXED.\n\n` +
    ins + '\n' + upd;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-20_seed_engine_bug_queue_lines_and_planes_pass3_migration.sql');
  writeFileSync(sqlPath, emitSql(), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${ROWS.length} inserts + ${UPDATES.length} update)`);

  for (const r of ROWS) {
    const { marker, ...row } = r;
    const { data: ex, error: rErr } = await supabaseAdmin
      .from('engine_bug_queue').select('bug_class,root_cause,status').eq('bug_class', row.bug_class).maybeSingle();
    if (rErr) { console.error(`✗ read ${row.bug_class}: ${rErr.message}`); process.exit(1); }
    if (ex?.root_cause?.includes(marker)) { console.log(`⏭  ${row.bug_class} — marker present`); continue; }
    const live = ex?.status ?? null;
    if (live === 'FALSE_POSITIVE' || (row.status === 'OPEN' && live === 'FIXED')) {
      console.log(`⏭  ${row.bug_class} — live status ${live}; REFUSING to downgrade to ${row.status}`);
      continue;
    }
    const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(row, { onConflict: 'bug_class' });
    if (error) { console.error(`✗ upsert ${row.bug_class}: ${error.message}`); process.exit(1); }
    console.log(`✓ filed ${row.bug_class} (${row.status})`);
  }

  for (const u of UPDATES) {
    const { data: ex, error: rErr } = await supabaseAdmin
      .from('engine_bug_queue').select('bug_class,root_cause,status').eq('bug_class', u.bug_class).maybeSingle();
    if (rErr) { console.error(`✗ read ${u.bug_class}: ${rErr.message}`); process.exit(1); }
    if (!ex) { console.error(`✗ expected existing row ${u.bug_class} — refusing to create as a side effect.`); process.exit(1); }
    if ((ex.root_cause ?? '').includes(u.marker)) { console.log(`⏭  ${u.bug_class} — marker present`); continue; }
    const { error } = await supabaseAdmin.from('engine_bug_queue')
      .update({ root_cause: (ex.root_cause ?? '') + u.note }).eq('bug_class', u.bug_class);
    if (error) { console.error(`✗ update ${u.bug_class}: ${error.message}`); process.exit(1); }
    console.log(`✓ annotated ${u.bug_class} (status unchanged: ${ex.status})`);
  }

  const { data: open } = await supabaseAdmin.from('engine_bug_queue')
    .select('bug_class').contains('concepts_affected', ['lines_and_planes_in_space']).in('status', ['OPEN', 'DEFERRED']);
  console.log(`\n· ${open?.length ?? 0} row(s) now OPEN/DEFERRED for this concept`);
}

main();
