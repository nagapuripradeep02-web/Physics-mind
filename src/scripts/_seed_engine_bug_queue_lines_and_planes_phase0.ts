/**
 * engine_bug_queue — the `lines_and_planes_in_space` (#9) authoring bring-up, 2026-08-09.
 *
 * SIX new rows + ONE update to an existing OPEN row. Found while verifying the
 * claim that #9 "needs ZERO renderer work" before authoring against it. The
 * claim held — every skeleton ENGINE DELTA shipped EXCEPT Δ7 — but the
 * verification surfaced six defects that existed only in agent reports and a
 * chat log, which is the exact failure mode this chapter has now named three
 * times (A20, the concept desk's uncommitted-work near-miss, and the handoff's
 * own stale §3).
 *
 * TWO THEMES, and they are the durable output:
 *
 *  (1) A SPEC DOCUMENT THAT DISCHARGES A SCAR AGAINST A MECHANISM NOBODY BUILT.
 *      Δ7 was requested, reviewed, marked DESIGN_OK, and never built — while
 *      three separate exemptions in the same document were recorded as
 *      discharged BY it. A discharge is only as real as the mechanism it names.
 *
 *  (2) A FIX APPLIED TO THE ROW THAT REPORTED IT, AND NEVER SWEPT. The catalog
 *      id divergence was fixed on 2026-08-08 on the row an architect happened to
 *      be reading, four rows from an identical instance that then orphaned
 *      another concept's only prerequisite edge. This is the same shape as the
 *      already-filed vg_state_1_hud_prints_magnitudes_before_either_vector_exists
 *      ("a gate fixed on the state that reported it and skipped elsewhere ships
 *      the same defect one state earlier") — now observed in a registry rather
 *      than a renderer, which is why it is filed as its own class.
 *
 * ⚠ ONE ROW IS DELIBERATELY *NOT* CREATED. The `n·d = 0.624` defect (a formula
 * surface stating an identity in a convention the HUD never prints) is a
 * RECURRENCE of the EXISTING OPEN row
 * `formula_surface_states_an_identity_in_a_unit_the_hud_never_renders`, so this
 * script EXTENDS that row's concepts_affected instead of minting a synonym
 * (Rule 40a: reuse the name, never mint a synonym). Two rows for one class is
 * how a scar list stops being queryable.
 *
 * ⚠ TWO bug_classes cited AS RECORDED LESSONS by the skeleton and by the
 * renderer's own comments were never actually filed:
 * `id_collision_check_scans_the_concept_directories_but_not_the_registry` and
 * `field3d_vg_value_readouts_type_union_omits_every_lines_planes_token_the_renderer_already_prints`.
 * Citing a bug_class does not create it. Both are covered by rows below.
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes archival SQL.
 *
 * ⚠ GUARD RETROFIT 2026-08-09 (scar_seed_script_upsert_downgrades_a_row_that_was_fixed_after_it_was_authored):
 * this script originally upserted full rows with NO predicate, so a replay after two of its OPEN rows
 * were FIXED (PRs #93/#94) would have reverted them and erased their fix records. Every write now
 * refuses to touch a row whose LIVE status is FIXED or FALSE_POSITIVE, in both the TS path and the
 * emitted SQL — the guard copied from _seed_engine_bug_queue_lines_and_planes_xhigh_review.ts, which
 * carried it from birth. The emitted SQL also now CONTAINS the RECUR update its own header always
 * advertised (scar_migration_header_advertises_an_update_the_file_does_not_contain), generated from
 * the same RECUR/RECUR_NOTE constants the TS path applies.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_lines_and_planes_phase0.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-09_lines_and_planes_bringup';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:json_author' | 'alex:mathematics_author'
  | 'peter_parker:field3d_surgeon' | 'peter_parker:renderer_primitives' | 'peter_parker:runtime_generation'
  | 'peter_parker:visual_validator' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'probe_definition' | 'directive';

interface Row {
  bug_class: string; title: string; severity: Severity; owner_cluster: Owner;
  root_cause: string; prevention_rule: string; probe_type: ProbeType; probe_logic: string;
  status: Status; concepts_affected: string[]; fixed_in_files: string[]; row_type: RowType;
}

const R = 'src/lib/renderers/field_3d_renderer.ts';
const GATE = 'src/scripts/check_vector_geometry_3d.ts';
const SKEL = 'docs/skeletons/lines_and_planes_in_space_skeleton.md';
const CAT = 'src/lib/mathematicsCatalog.ts';
const BOTH = ['lines_and_planes_in_space', 'vector_products_in_space'];
const C9 = ['lines_and_planes_in_space'];

const rows: Row[] = [
  {
    bug_class: 'skeleton_discharges_a_scar_against_an_engine_delta_that_was_never_built',
    title: 'Three camera exemptions were recorded as discharged by Δ7, which has zero hits in the renderer and the gate',
    severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'The #9 skeleton ENGINE DELTA 7 requested camera_gate.exempt_pairs (an authored per-state exemption list) and min_screen_length_frac (a per-taught-segment screen-length floor), and the SAME document then recorded three by-construction-parallel pairs as discharged BY that mechanism: S1 d-hat lying on its own line, S3 the perpendicular segment parallel to n, S8 d1 x d2 measuring 0.00 degrees against the common perpendicular. VG-A/B/C landed and the delta did not: both identifiers return ZERO hits in field_3d_renderer.ts AND in check_vector_geometry_3d.ts. The document reached Checkpoint A DESIGN_OK with the exemptions marked satisfied, so the gap is invisible to anyone reading the skeleton rather than the engine. The skeleton itself named the risk one line later — a pairwise gate with no exemption list either fails every state or gets switched off, and the second is how a gate stops being known to work.',
    prevention_rule:
      'A DISCHARGE IS ONLY AS REAL AS THE MECHANISM IT NAMES. A spec that discharges a scar against a REQUESTED engine delta must re-verify that delta EXISTS ON MASTER before the concept is authored against it — a partially-shipped delta silently falsifies every discharger that depends on it. Verify by symbol sweep of the shipped renderer AND its gate, never by the presence of the request in the design document. Corollary: when a multi-delta dispatch lands, diff the SHIPPED delta set against the REQUESTED set and publish the difference, rather than closing the dispatch on the deltas that did land.',
    probe_type: 'js_eval',
    probe_logic:
      'Before authoring any concept against a skeleton, extract every delta identifier the skeleton requests and grep the shipped renderer + gate for each; fail the pre-flight if any identifier the skeleton relies on for a DISCHARGE has zero hits. Negative control: assert the probe reports Δ7 absent while reporting Δ1/Δ2/Δ5/Δ6/Δ9/Δ10 present.',
    status: 'OPEN', concepts_affected: BOTH, fixed_in_files: [R, GATE], row_type: 'incident',
  },
  {
    bug_class: 'field3d_vg_type_omits_fields_the_scenario_body_reads_so_shipped_behaviour_is_undeclarable',
    title: 'Four fields the vg frame driver reads are absent from the vg TypeScript type — the second instance of a class the file itself documents',
    severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'The per-state vg block type (field_3d_renderer.ts ~:390-517) does not declare scene_group or scene_groups, though the frame driver reads d.scene_groups (:14319) and d.scene_group (:14323, :14333) to drive the Δ10 selector; camera_mode is typed "authored" | "steps" | "auto_frame" (:491) while the driver also dispatches "group" (:14525) reading d.group_cameras (:14532), neither declared. Zod is .passthrough() so a concept authoring them validates and runs — the defect is that the type, which is the authoring CONTRACT, denies the existence of shipped behaviour. This is the SECOND instance of a class this same file documents at :443-452, where the value_readouts union carried only the 11 products tokens while VG_READOUT_LABEL carried 24, making every lines_planes token unauthorable by its own type. That fix was applied to the union it was found in and not swept across the sibling fields in the same block. NOTE: the bug_class the renderer comment cites for the first instance (field3d_vg_value_readouts_type_union_omits_every_lines_planes_token_the_renderer_already_prints) WAS NEVER ACTUALLY FILED — citing a bug_class in a comment does not create it.',
    prevention_rule:
      'Every field the scenario body reads from its per-state block is DECLARED in that block type in the SAME change that reads it, and every enum member the body dispatches on is in the declared union. Passthrough validation is not a substitute for a contract: a field that runs but cannot be declared is a field the next author cannot discover. When a type-omission defect is fixed on one field, sweep the whole block — grep the body for d.<name> and for every literal compared against the enum, and diff that set against the declared type.',
    probe_type: 'js_eval',
    probe_logic:
      'Parse the vg block type; collect every d.<field> read inside the vg scenario body and every string literal compared against camera_mode; assert the read set is a SUBSET of the declared set and the dispatched enum members are a subset of the declared union. Negative control: assert the probe flags scene_groups and camera_mode "group" against the pre-fix type.',
    status: 'OPEN', concepts_affected: BOTH, fixed_in_files: [R], row_type: 'incident',
  },
  {
    bug_class: 'vg_lines_planes_segment_readouts_compute_regardless_of_reveal_state',
    title: 'A segment readout is computed every frame whether or not its segment has been revealed, so a number can print before its subject exists',
    severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'In vgResolveLinesPlanes the readout values for segments are computed unconditionally on every frame, independent of the reveal fraction that governs whether the segment is DRAWN. A state that reveals its segment late therefore has a live number available for its panel before the thing the number measures is on screen. This is the same family as the FIXED field3d_vg_a_value_surface_can_disagree_with_the_geometry_it_names (whose third sub-defect was exactly readouts rendering before their subject) and the OPEN vg_state_1_hud_prints_magnitudes_before_either_vector_exists — the reveal-gate was applied to the value_readouts panel and not to the resolver that feeds it. Found during #9 authoring while designing STATE_2 dot-product introduction beat, and worked around there with a verified two-segment recipe rather than relying on reveal ordering.',
    prevention_rule:
      'A derived readout is gated by the SAME reveal fraction as the geometry it measures, at the RESOLVER, not only at the panel that prints it. Gating the display surface while the resolver still publishes leaves the number one authoring mistake away from the screen. When a reveal-gate defect is fixed at a display site, apply it at the value SOURCE in the same pass.',
    probe_type: 'js_eval',
    probe_logic:
      'For every state, sample the resolver across the state timeline and assert no readout key is populated at any ms where its subject reveal fraction is below 1. Negative control: a segment authored with reveal_at_ms late must produce NO readout value before that ms.',
    status: 'OPEN', concepts_affected: C9, fixed_in_files: [R], row_type: 'incident',
  },
  {
    bug_class: 'registry_id_fix_applied_to_the_reported_row_and_never_swept_across_the_registry',
    title: 'A concept-id divergence was fixed on the row an architect reported and left standing four rows above, orphaning another concept prerequisite edge',
    severity: 'MODERATE', owner_cluster: 'alex:architect',
    root_cause:
      'mathematicsCatalog.ts:100 declared concept_id "definite_integral_as_area" while the SHIPPED, baseline-locked concept is "definite_integral_as_accumulated_area" (same concept_name, same chapter 8 section 8.1, same class 12, present in visual_baselines). Consequently solids_of_revolution at :144 declared prerequisites ["definite_integral_as_area"] — its ONLY inbound edge — pointing at an id no shipped concept carries. This is the IDENTICAL defect the founder fixed FOUR ROWS BELOW on 2026-08-08 (the vector_dot_and_cross_product divergence), whose own surviving code comment states the correct prevention rule: a concept-id check sweeps the catalog and the registries, not only the concept files. The rule was written and the SWEEP was never run — the fix was applied only to the row an architect happened to be reading for prerequisites. Same shape as the filed vg_state_1_hud_prints_magnitudes_before_either_vector_exists, observed in a registry rather than a renderer. Related OPEN class: call_site_enumeration_asserted_exhaustive_without_a_symbol_sweep. NOTE: the bug_class the skeleton cites as the recorded lesson for this (id_collision_check_scans_the_concept_directories_but_not_the_registry) WAS NEVER FILED.',
    prevention_rule:
      'A FIX TO ONE ROW OF A REGISTRY IS RE-RUN AGAINST EVERY ROW OF THAT REGISTRY BEFORE IT IS CLOSED. Writing the prevention rule into a comment beside the single fixed row is not the sweep. Enforce mechanically: every concept_id in a catalog resolves to a shipped concept or is explicitly marked reserved-and-unbuilt, and every prerequisite id resolves to a catalog concept_id — checked for the WHOLE file, not the edited row.',
    probe_type: 'js_eval',
    probe_logic:
      'Parse every concept_id and every prerequisites[] entry from mathematicsCatalog.ts; assert each prerequisite resolves to a catalog concept_id, assert no duplicate concept_id, and report every catalog id that is neither shipped nor marked reserved. Verified 2026-08-09 after the fix: 12 concept_ids, 7 prerequisite edges, 0 orphans, 0 duplicates.',
    status: 'FIXED', concepts_affected: ['solids_of_revolution', 'definite_integral_as_accumulated_area'],
    fixed_in_files: [CAT], row_type: 'incident',
  },
  {
    bug_class: 'skeleton_asserts_a_sibling_concepts_camera_pose_from_memory_instead_of_reading_its_shipped_json',
    title: 'A chapter-seam pose required to be identical was cited at R 9; the sibling shipped JSON says R 16',
    severity: 'MAJOR', owner_cluster: 'alex:architect',
    root_cause:
      'The #9 skeleton arc rule 5 requires STATE_1 to open on Act I STATE_5 final frame — "same pose, same colours, same objects present" — and sections 5/14 plus FLAG 6 assert that pose is az 90 / el 30 / R 9. Act I own shipped JSON has STATE_5.camera_position = [0.0, 8.0, 13.8564], which is R = 16.0000 exactly (az 90 / el 30 are correct). The apparatus-size half of the reasoning was right (a_mag 3.0, b_mag ramping 2.0 to 2.5 in that exact state) and the radius was inferred from it rather than read. Consequence: STATE_1 entry camera and the camera_steps ease DIRECTION were both wrong — the ease is a pull-IN 16 to 13, not a pull-back 9 to 13 — and every fill / min-pairwise-separation number in the S1 camera row was solved at the wrong radius. The document own FLAG 6 hedged "if the founder reads same pose as including R" — it does; R is part of a pose.',
    prevention_rule:
      'A HANDOFF OR CHAPTER-SEAM POSE IS READ FROM THE SIBLING SHIPPED JSON (the camera_position literal), never restated from a survey, a flag, or an earlier round. Matching az and el is NOT evidence that the radius matches — a pose is three numbers and a partial match is the most convincing way to ship the wrong one. Any skeleton claiming continuity with another concept quotes that concept file and line for every number it inherits.',
    probe_type: 'manual',
    probe_logic:
      'For any state declaring continuity with another concept frame, assert its authored camera_position equals that concept state camera_position componentwise, read from the sibling JSON at author time.',
    status: 'FIXED', concepts_affected: BOTH, fixed_in_files: [SKEL], row_type: 'incident',
  },
  {
    bug_class: 'skeleton_cites_two_contradictory_values_for_one_measured_event_in_the_same_document',
    title: 'One screen-crossing event is cited as t = 0.495 in two sections and t = 0.815 in two others, and re-derivation matches neither',
    severity: 'MODERATE', owner_cluster: 'alex:architect',
    root_cause:
      'The #9 skeleton states the two skew lines screen images cross at t = 0.495 along line 1 (section 3 control table and the section 14 probe output) and at t = 0.815 along line 1 (section 4 misconception table and section 14 narrative) — the SAME event, the SAME document, two values, neither flagged. Independent closed-form re-derivation at the state own authored pose (R 13 / az 146 / el 4) puts the crossing at s1 = -0.639 raw arc length, about 0.305 of line 1 own sphere-clipped drawn span, matching NEITHER citation under any normalisation tried. The QUALITATIVE claim survives and was re-verified — the two images genuinely do cross, two 3D points 2.805 apart projecting to one pixel — so the state design is sound and only its numbers were wrong. A concept authored from either citation would have placed the misconception marker at a pixel where the lines do not cross, on the state whose entire lesson is that the crossing is an illusion.',
    prevention_rule:
      'A measured value is written ONCE in a design document and referenced everywhere else; where it must be restated, the restatements are asserted equal. Two numbers for one event is not a typo class, it is an unverified-measurement class. Any authored marker for a projected coincidence derives from a RECOMPUTED 3D position, never from a cited screen parameter — the 3D point survives a camera change and the parameter does not.',
    probe_type: 'manual',
    probe_logic:
      'Extract every numeric claim that appears more than once in a skeleton keyed by the event it describes; assert all occurrences agree. Recompute any value an authored primitive position depends on.',
    status: 'FIXED', concepts_affected: C9, fixed_in_files: [SKEL], row_type: 'incident',
  },
  {
    bug_class: 'vg_intersection_is_a_single_target_so_a_state_teaching_BOTH_cases_can_render_only_one',
    title: 'Δ4 no_meeting_point cannot co-exist with an intersection marker, because d.intersection names one line',
    severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'ENGINE DELTA 4 exists so that the case with NO intersection carries a readout rather than teaching by omission (the recorded state_whose_payoff_is_absence_carries_its_lesson_only_in_on_canvas_prose shape). But d.intersection is a SINGLE OBJECT — var isec = d.intersection (field_3d_renderer.ts:13113) — naming one line and one plane for the whole state. STATE_4 teaches BOTH cases sequentially in one state: the parallel line Lpar (d·n = 0.000) glides past and never touches, then the cutting line Lcut (d·n = 0.574) punches through and the marker snaps on at lambda 2.600. Targeting Lcut makes meet.exists permanently true, so no_meeting_point is permanently false and the Δ4 row can NEVER render. Targeting Lpar renders the absence row but destroys the X marker the state second half requires. There is no authoring of the shipped surface that serves both, so the delta cannot do the job it was requested for on the only state that needs it. Δ4 was specified, reviewed and built against a ONE-LINE mental model of the state while the state design in the same document has two.',
    prevention_rule:
      'A readout delta requested to express an ABSENCE must be specified against the STATE that will consume it, including how many subjects that state has co-present. Where a state teaches a contrast between two objects, every per-state singleton in the config (intersection, perpendicular, projection) is checked for arity against that contrast BEFORE the delta is accepted — a singleton silently makes a two-object lesson unauthorable. Fix direction: accept a LIST (intersections[]) keyed by line id, so each line publishes its own d_dot_n / no_meeting_point pair.',
    probe_type: 'js_eval',
    probe_logic:
      'For every state authoring more than one line against the same plane, assert each line has an addressable meet result; assert no_meeting_point can be rendered true for one line while intersection_point renders for another in the same state. Negative control: the shipped singleton must FAIL this probe.',
    status: 'OPEN', concepts_affected: C9, fixed_in_files: [R], row_type: 'incident',
  },
  {
    bug_class: 'vg_lp_plane_ghost_multiplier_applies_to_the_quad_but_not_to_its_normal_arrow',
    title: 'A ghosted plane dims its patch and leaves its normal arrow at full brightness',
    severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'In vgWriteLinesPlanesFrame the plane quad receives the ghost factor — setOpacity(qm, 0.28 * P.ghost) (field_3d_renderer.ts ~:14095) — while the normal ArrowHelper pn[pi] immediately below is given position, direction, length, colour and visible = true with NO ghost term applied (~:14097-14106). A state authoring ghost_at_ms / ghost_opacity on a plane therefore dims the patch and leaves the green normal at full brightness. This directly breaks Rule 32e (exactly ONE glow focal at any instant) for #9 STATE_1, whose choreography is that BOTH the patch and the normal dim to ghosts while keeping their colours so the amber direction arrow becomes the single focal — the state that carries the chapter seam from Act I.',
    prevention_rule:
      'A ghost/dim factor applies to EVERY member of the object it names, not only the member that happens to own the opacity call. When an object is composed of a region plus its derived arrow plus their labels, the dim is applied at the group, or each member is enumerated and asserted by a probe — a per-member opacity write is where one member gets silently missed.',
    probe_type: 'js_eval',
    probe_logic:
      'Author a plane with ghost_opacity < 1 and show_normal true; assert the normal arrow material opacity equals the quad ghost factor, not 1.0. Extend to the normal label.',
    status: 'OPEN', concepts_affected: C9, fixed_in_files: [R], row_type: 'incident',
  },
  {
    bug_class: 'operating_manual_carveout_names_one_subject_namespace_and_omits_its_identical_sibling',
    title: 'CLAUDE.md exempted chemistry from the 8 registration sites and never mentioned mathematics, which has the same isolation contract',
    severity: 'MODERATE', owner_cluster: 'alex:architect',
    root_cause:
      'CLAUDE.md section 6 "Adding a new concept — EIGHT registration sites (miss one = silent pipeline failure)" carried a parenthetical exempting CHEMISTRY concepts from sites 2/3/4/7/8, and named no other subject. MATHEMATICS has the identical isolation contract (src/data/concepts/mathematics/README.md, docs/MATHEMATICS_ARCHITECTURE.md section 5): mathematics concepts register NOWHERE outside their own directory and are gated by validate:mathematics, which is why the shipped baseline-locked definite_integral_as_accumulated_area appears in ZERO of panelConfig.ts, aiSimulationGenerator.ts and intentClassifier.ts. The canonical operating manual — the file every session is told to read completely and to treat as overriding — therefore instructed an author to make five forbidden edits. The failure mode is inverted from the one the section warns about: not a missed registration, an ADDED one.',
    prevention_rule:
      'When a rule carves out one subject namespace, every sibling namespace with the same contract is named in the SAME edit, or the carve-out is written against the CONDITION (a concept outside the flat directory) rather than against one named subject. A rule that enumerates its exceptions by name goes stale the moment a third subject exists.',
    probe_type: 'manual',
    probe_logic:
      'For each subject namespace under src/data/concepts/, assert CLAUDE.md registration guidance names it explicitly; assert a shipped concept from each namespace appears in exactly the registration sites its contract permits.',
    status: 'FIXED', concepts_affected: [], fixed_in_files: ['CLAUDE.md'], row_type: 'incident',
  },
];

// ── the guard the xhigh sibling carried from birth (retrofit 2026-08-09) ────
const PROTECTED = ['FIXED', 'FALSE_POSITIVE'];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length ? `ARRAY[${a.map(sqlStr).join(', ')}]::text[]` : `ARRAY[]::text[]`; }
function sqlRow(r: Row): string {
  return `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(SESSION)}, ${sqlStr(r.row_type)})`;
}
function emitSql(all: Row[]): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type';
  return `-- 2026-08-09 — lines_and_planes_in_space (#9) authoring bring-up: ${all.length} rows.\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_lines_and_planes_phase0.ts — idempotent.\n` +
    `-- Plus an UPDATE (not a new row) extending formula_surface_states_an_identity_in_a_unit_the_hud_never_renders.\n` +
    `--\n` +
    `-- NOTE THE WHERE CLAUSE (guard retrofit 2026-08-09). Rows here are asserted at their ROUND-1\n` +
    `-- status, so the conflict path REFUSES to overwrite a row that has since been FIXED or retracted\n` +
    `-- as a FALSE_POSITIVE — replaying this file must never downgrade the queue's later truth\n` +
    `-- (scar_seed_script_upsert_downgrades_a_row_that_was_fixed_after_it_was_authored).\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files\n` +
    `WHERE engine_bug_queue.status NOT IN ('FIXED', 'FALSE_POSITIVE');\n\n` +
    `-- The UPDATE the header advertises — emitted from the SAME RECUR/RECUR_NOTE constants the TS\n` +
    `-- path applies (scar_migration_header_advertises_an_update_the_file_does_not_contain). Field-\n` +
    `-- level guards mirror the TS semantics exactly: the concept widen is a set union, the note\n` +
    `-- appends only when its marker is absent.\n` +
    `UPDATE engine_bug_queue SET\n` +
    `  concepts_affected = CASE WHEN 'lines_and_planes_in_space' = ANY(concepts_affected)\n` +
    `    THEN concepts_affected ELSE concepts_affected || 'lines_and_planes_in_space' END,\n` +
    `  root_cause = CASE WHEN root_cause LIKE '%RECURRENCE 2026-08-09%'\n` +
    `    THEN root_cause ELSE root_cause || ${sqlStr(RECUR_NOTE)} END\n` +
    `WHERE bug_class = ${sqlStr(RECUR)};\n`;
}

/**
 * The n·d recurrence. NOT a new row — extend the existing OPEN class so the
 * queue keeps ONE entry per defect class and the query stays honest.
 */
const RECUR = 'formula_surface_states_an_identity_in_a_unit_the_hud_never_renders';
const RECUR_NOTE =
  ' RECURRENCE 2026-08-09 (lines_and_planes_in_space): the #9 skeleton printed n·d = 0.624 across its ' +
  'sections 3/10b/10h/12 while the shipped HUD renders 0.574 — vgLinePlaneMeet normalizes BOTH operands ' +
  '(field_3d_renderer.ts:12775) so the token is a cosine, cos 55 = sin 35 = 0.5736, which is what the ' +
  'skeleton own section 11 independently states. 0.624 is d-hat dotted with the UN-normalized normal ' +
  '(norm 1.0886). The two conventions coexisted in one document and the document own queue table claimed ' +
  'this exact class was discharged — "every surface identity evaluated against its own HUD numbers this ' +
  'session" — which was true for every token but this one. Author identities against the value the ENGINE ' +
  'computes, read from the resolver, not against a hand-derived quantity that shares the symbol.';

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-08-09_seed_engine_bug_queue_lines_and_planes_phase0_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} row(s))`);

  // Guard: never touch a row whose LIVE status is FIXED / FALSE_POSITIVE — this
  // script asserts the round-1 state and must not overwrite the queue's later truth.
  const { data: live, error: liveErr } = await supabaseAdmin
    .from('engine_bug_queue').select('bug_class,status')
    .in('bug_class', rows.map((r) => r.bug_class));
  if (liveErr) { console.error(`✗ read failed: ${liveErr.message}`); process.exit(1); }
  const liveStatus = new Map((live ?? []).map((r: { bug_class: string; status: string }) => [r.bug_class, r.status]));
  const writable = rows.filter((r) => !PROTECTED.includes(liveStatus.get(r.bug_class) ?? 'OPEN'));
  const skipped = rows.filter((r) => PROTECTED.includes(liveStatus.get(r.bug_class) ?? 'OPEN'));
  for (const s of skipped) {
    console.log(`⏭  ${s.bug_class} — live status ${liveStatus.get(s.bug_class)}; REFUSING to overwrite`);
  }
  if (writable.length) {
    const payload = writable.map((r) => ({
      ...r,
      discovered_in_session: SESSION,
      fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
    }));
    const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
    if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  }
  const open = writable.filter((r) => r.status === 'OPEN').length;
  console.log(`✓ upserted ${writable.length} row(s) (${skipped.length} protected, skipped) — ${writable.length - open} FIXED, ${open} OPEN`);

  // ── the recurrence: extend, never duplicate ──────────────────────────────
  const { data: existing, error: readErr } = await supabaseAdmin
    .from('engine_bug_queue')
    .select('bug_class,concepts_affected,root_cause')
    .eq('bug_class', RECUR)
    .maybeSingle();
  if (readErr) { console.error(`✗ read of ${RECUR} failed: ${readErr.message}`); process.exit(1); }
  if (!existing) {
    console.error(`✗ expected existing row ${RECUR} — NOT found. Refusing to create it here: if the class`);
    console.error(`  no longer exists it must be re-authored deliberately, not resurrected as a side effect.`);
    process.exit(1);
  }
  const affected = Array.from(new Set([...(existing.concepts_affected ?? []), 'lines_and_planes_in_space']));
  const alreadyNoted = (existing.root_cause ?? '').includes('RECURRENCE 2026-08-09');
  const { error: updErr } = await supabaseAdmin
    .from('engine_bug_queue')
    .update({
      concepts_affected: affected,
      root_cause: alreadyNoted ? existing.root_cause : (existing.root_cause ?? '') + RECUR_NOTE,
    })
    .eq('bug_class', RECUR);
  if (updErr) { console.error(`✗ update failed: ${updErr.message}`); process.exit(1); }
  console.log(`✓ extended ${RECUR} — concepts_affected now ${affected.length}${alreadyNoted ? ' (note already present, not duplicated)' : ', recurrence note appended'}`);
}

main();
