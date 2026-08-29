/**
 * engine_bug_queue — the xhigh workflow code review of PR #96 (2026-08-09).
 *
 * 60 agents, one finder per correctness angle plus an independent verifier for
 * every candidate location. 50 verified findings collapsing to 15 distinct
 * defects, ALL CONFIRMED, none fixed. This script files them.
 *
 * TWO CLUSTERS, and the second one is about this session's own bookkeeping:
 *
 *  (1) THE CONCEPT JSON. The two EYE walks caught what was ON screen and wrong.
 *      This review caught what is MISSING or TIME-SHIFTED: readout tokens no
 *      authored construct ever publishes, sliders authored but never shown, an
 *      answer on the HUD 11 s before the beat that derives it, and a
 *      misconception state whose rebuttal number and false picture are never
 *      co-present. Several findings falsify the concept's OWN misconception_watch
 *      and the skeleton's own Definition of Done — the text-disagrees-with-its-
 *      own-record pattern, one level up from the pixels.
 *
 *  (2) THE SEED SCRIPTS I WROTE EARLIER TODAY. The round-2 corrections (a
 *      FALSE_POSITIVE retraction, a CRITICAL escalation, six PR-fix annotations)
 *      exist ONLY in the live DB, while the committed scripts and migrations
 *      still assert the round-1 state through unguarded full-row upserts. A
 *      replay reverts FIXED rows to OPEN and resurrects a row this same session
 *      proved false. That is the exact failure mode I corrected the #7 handoff
 *      for this morning, reproduced by me, in the same session.
 *
 * ⚠ THIS SCRIPT CARRIES THE GUARD THE OTHERS LACK. Every write refuses to
 * DOWNGRADE a row that is already FIXED or FALSE_POSITIVE, and the emitted SQL
 * carries the same predicate rather than a bare DO UPDATE. A seed script is
 * idempotent against its own authoring; that is not the same as being safe
 * against the queue's later truth, and the difference is what corrupts a queue.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_lines_and_planes_xhigh_review.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-09_lines_and_planes_xhigh_review';
const J = 'src/data/concepts/mathematics/lines_and_planes_in_space.json';
const R = 'src/lib/renderers/field_3d_renderer.ts';
const C9 = ['lines_and_planes_in_space'];

type Owner = 'alex:architect' | 'alex:json_author' | 'alex:mathematics_author'
  | 'peter_parker:field3d_surgeon' | 'peter_parker:visual_validator' | 'ambiguous';
interface Row {
  bug_class: string; title: string; severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
  owner_cluster: Owner; root_cause: string; prevention_rule: string;
  probe_type: 'js_eval' | 'manual'; probe_logic: string;
  status: 'OPEN'; concepts_affected: string[]; fixed_in_files: string[];
  row_type: 'incident';
}
const row = (
  bug_class: string, title: string, severity: Row['severity'], owner_cluster: Owner,
  root_cause: string, prevention_rule: string, probe_logic: string,
  fixed_in_files: string[] = [J],
): Row => ({
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type: 'js_eval', probe_logic, status: 'OPEN', concepts_affected: C9,
  fixed_in_files, row_type: 'incident',
});

const rows: Row[] = [
  row('vg_state_authors_controls_without_show_sliders_so_the_row_is_unreachable',
    'Three states author a per-state slider that the renderer never displays',
    'MAJOR', 'alex:json_author',
    'field_3d_renderer.ts:14552 gates the panel on (stateDef.show_sliders && anyRow), and knob() at :14576 honours a teacher drag ONLY when show_sliders is truthy. Only STATE_9 authors it. STATE_1 (controls ["lambda"]), STATE_2 (["half_extent"]) and STATE_6 (["theta_deg"]) therefore render with NO slider panel at all — a teacher on STATE_6, whose narration says "Now turn one direction, and the angle tracks it", has nothing to turn. The control_ranges authored on STATE_1 and STATE_6 are dead config for the same reason. Rule 31 requires each state to expose the slider(s) relevant to what it teaches, and the concept mathematics block explicitly describes a teacher dragging STATE_1 live lambda row.',
    'controls[] is not a display flag. Any state authoring vg.controls also authors show_sliders: true, and the validator asserts the pair — an authored control that cannot be reached is indistinguishable, in the JSON, from one that works.',
    'For every state with a non-empty vg.controls, assert show_sliders === true; and drive the shipped apply pass to assert the panel element is display:block with the expected row count. Negative control: the shipped STATE_6 must FAIL today.'),

  row('vg_offset_animate_ends_off_zero_so_a_rotated_line_leaves_its_shared_arc_apex',
    'STATE_6 rotates one direction about an apex the other line no longer passes through',
    'MAJOR', 'alex:json_author',
    'vgObjOffset translates the anchor by the literal offset.along while vgObjRotate rotates only dir — the offset is NEVER rotated. STATE_6 second aux_a animate ends at -1.5 (not 0) at t=8000, so for the whole 8000-19000 ms theta_deg ramp M2 anchor is -1.5*d2hat(original) while its direction rotates. Re-derived: the perpendicular distance from the origin to M2 is 0.000 at theta=69.3846 deg but 1.049 at 25 deg and 1.072 at 115 deg. The arc is authored apex_at_origin and M1 still passes through the origin, so at camera R=5 the second arm visibly detaches from the vertex by about one world unit for most of the state — while the narration says both directions are drawn from one shared point. The teacher theta_deg slider reproduces it live on every drag.',
    'A knob that MOVES an object must return to its neutral value before a second knob starts, unless the design states the compound pose. Where an arc is pinned to a shared apex, assert both arms actually pass through that apex across the FULL sweep of every live knob — not only at the authored default, which is exactly where this one is correct.',
    'For any angle arc with apex_at_origin, sweep every live knob and assert the perpendicular distance from the apex to BOTH arms stays below a tolerance at every sampled value. Negative control: the shipped STATE_6 fails at theta=25 and theta=115.'),

  row('vg_readout_token_authored_on_a_state_whose_constructs_never_publish_it',
    'The chapter-opening state declares a lambda readout that the engine can never emit, so its HUD never appears',
    'MAJOR', 'alex:json_author',
    'out.readouts.lambda is assigned at exactly ONE site (field_3d_renderer.ts:13240), inside the F14 intersection block and only when arrivedMeets.length === 1 && mt.exists. STATE_1 authors no intersection/intersections, so vals.lambda is undefined, vgReadoutLine returns null for a missing value, html stays empty and the panel is set display:none. The state whose entire lesson is "one number lambda names every point on this line", with the lambda marker sweeping -3.5 to 3.5 for 13 s, shows NO readout panel at all — and its own scene_composition declares a readout primitive lambda_hud that does not exist on screen. STATE_9 authors the same token and loses the same row. NOTE the token IS in the legal enum, so the closed enum cannot catch it: legality and reachability are different questions.',
    'A value_readouts token is a CLAIM that some authored construct in that state publishes it. Validate the token set against the constructs actually authored in the SAME state, not against the global enum — a token that is legal but unpublishable renders nothing, which is the silent-missing-row failure the closed enum was introduced to prevent.',
    'For each state, resolve the shipped resolver and assert every authored value_readouts token appears in out.readouts at some sampled ms. Negative control: STATE_1 lambda must FAIL today.'),

  row('vg_segment_length_readout_borrows_the_point_plane_distance_label',
    'A sweeping comparison segment prints under the label "distance", asserting the misconception its own state exists to break',
    'CRITICAL', 'ambiguous',
    'field_3d_renderer.ts:13122 maps a segment readout:"length" onto out.readouts.point_plane_distance, whose VG_READOUT_LABEL is the string "distance". STATE_3 declares only point_plane_distance, and cmp (q to the sweeping foot) is revealed at 0 and hidden at 9000 ms — so from the first frame to 9 s the panel reads distance = 3.11, distance = 2.72, ... for segments that are NOT perpendicular. The state misconception_watch belief is "any segment down to it will do" and assessment q3 distractor C is "believes any segment reaching the plane measures the distance". The HUD endorses the misconception for the entire confront beat, and only at 9.6 s does the same label finally name the right thing. Ambiguous ownership: the engine reuses one token for two different quantities, and the concept authored the reuse.',
    'A generic geometric readout (a segment length) does not borrow the token of a SPECIFIC named quantity (the point-to-plane distance). One label, one meaning, for the life of the concept — and on a misconception state, check what the label ASSERTS during the wrong-picture beat, not only at the end.',
    'Assert no state maps a generic segment readout onto a token whose label names a different quantity; separately, for every misconception state, assert no on-screen label states the watched belief as fact at any sampled ms.'),

  row('vg_misconception_counter_number_arrives_after_the_false_picture_is_gone',
    'The skew rebuttal reading appears 2.3 s after the crossing marker it is meant to contradict is removed',
    'CRITICAL', 'alex:json_author',
    'skew_distance publishes only under vgArrived(cfrac), which requires frac >= VG_SUBJECT_SHOWN_MIN = 0.999. With the common perpendicular authored reveal_at_ms 3800 / grow_ms 2200 and the ease-out-cubic in vgRevealFrac, 0.999 is first reached at about 5780 ms. crossing_mark is authored reveal_at_ms 2000 / hide_at_ms 3500. The two are therefore NEVER co-present: the student sees the pulsing crossing marker with nothing contradicting it, and the 1.80 reading arrives 2.3 s after the marker is gone. This falsifies the state own misconception_watch.visual_counter ("the live reading already says the lines are 1.80 apart, before the marker ever appears") and the skeleton requirement that the contradicting number is on screen for every frame of the false picture. STATE_5 carries M3, the supporting aha.',
    'On a state that performs a wrong picture, the CONTRADICTING NUMBER is on screen for every frame the wrong picture is, and that overlap is asserted in ms — not inferred from authoring order. Reveal timings must be computed against the ARRIVAL threshold (0.999 through the easing), never against reveal_at_ms, which is when the grow STARTS.',
    'For every state with a misconception_watch declaring a visual_counter, compute the arrival ms of the counter and the visible window of the false element and assert the counter arrives FIRST and overlaps fully. Negative control: STATE_5 fails by 2.3 s.'),

  row('vg_projection_publishes_both_angle_tokens_before_either_arc_is_drawn',
    'The answer a state builds to is on the HUD eleven seconds before the beat that derives it',
    'MAJOR', 'ambiguous',
    'STATE_7 authors projection reveal_at_ms 2000 / grow_ms 1500; vgRevealFrac crosses the vgArrived threshold at about 3350 ms, and the resolver sets BOTH out.readouts.angle_line_normal_deg AND angle_line_plane_deg in that single gate. The arcs are staged much later — arc_normal arrives about 10080 ms, arc_plane about 14350 ms — precisely so the plane angle is DERIVED from the normal angle by subtraction. So for about 11 s the panel reads angle = 55.0 deg and angle to plane = 35.0 deg with neither arc drawn, and the narration beat "measure to the normal, then subtract" lands on a subtraction whose result has been on screen since second three. Same class as the FIXED vg_lines_planes_segment_readouts_compute_regardless_of_reveal_state, one construct over: gating by the SOURCE construct is not the same as gating by the SUBJECT each token names.',
    'A readout is gated by the reveal of the thing IT NAMES, not by the reveal of the construct that happens to compute it. Where one construct yields several tokens with different teaching beats, each token carries its own gate — otherwise the state cannot stage a derivation at all.',
    'For every state authoring two angle tokens with separately staged arcs, assert each token first appears no earlier than its own arc arrival. Negative control: STATE_7 publishes both about 6.7 s and 11 s early.'),

  row('vg_plane_reveal_fraction_scales_its_normal_so_a_carried_normal_is_deleted_and_regrown',
    'A normal the previous state hands over is deleted at the state boundary and regrown from a nub',
    'MAJOR', 'ambiguous',
    'field_3d_renderer.ts:14218 hides the plane AND its normal when P.frac <= 0, and :14230 sets the arrow length as P.normal_len * P.frac — so the normal is scaled by the PLANE reveal fraction and has no reveal of its own. STATE_2 authors the plane reveal_at_ms 0 / grow_ms 4000, and vgRevealFrac returns 0 at stateMs 0. STATE_1 ends with the plane ghosted but the green normal at FULL length; a teacher clicking to STATE_2 sees plane and normal vanish completely, then the normal grow back from a nub over four seconds, while STATE_2 narration treats the normal as the thing already there. The skeleton forbids this by name: "the green arrow is never deleted and no violet normal is ever grown" — the ROUND-0 seam defect, reintroduced through a coupling the author could not see from the JSON.',
    'An object carried across a state boundary keeps its pose and brightness through the cut (Rule 32d home-pose continuity). A derived child (the normal) must be able to declare its own reveal independently of its parent, or a state that regrows the parent silently regrows the child.',
    'For each pair of consecutive states, assert every object present at the end of state N with frac 1 is present at ms 0 of state N+1 with frac 1. Negative control: the STATE_1 to STATE_2 normal fails.'),

  row('vg_explore_controls_are_not_group_aware_so_half_the_sliders_are_inert',
    'The explore sandbox offers six sliders in each scene group and about half do nothing',
    'MAJOR', 'alex:json_author',
    'Every STATE_9 object declares groups: L1/P1/q/perp in A, M1/M2/common_perp/cross_vec in B, and vgInGroup skips out-of-group objects entirely. But controls lists all six knobs unconditionally for BOTH groups. In the default "line + plane" view a teacher drags theta_deg or line2_offset and nothing moves and no readout changes; after switching to "skew pair", lambda, lambda_span, half_extent and q_height are likewise inert — including lambda, the state headline control and the driver of its 72 s sweep. A dead control in a teacher sandbox reads as a broken product, not as a scoping decision.',
    'Where a state partitions its scene into groups, the control set is partitioned with it. A control is authored in a group only if some object in THAT group consumes it — and the gate asserts every visible row moves something in the currently selected group.',
    'For each scene group, resolve twice per knob (min and max) and assert every control declared visible in that group changes at least one resolved object or readout. Negative control: 4 of 6 rows are inert in group A today.'),

  row('vg_explore_animate_windows_are_finite_so_the_free_running_sandbox_freezes',
    'The explore state fakes a perpetual sweep with eight finite windows and stops dead at 72 seconds',
    'MAJOR', 'alex:json_author',
    'Rule 37 makes the interaction_complete clock free-run forever (the player skips SET_TIME_FREEZE for it). STATE_9 authors eight alternating lambda windows ending at 72000 ms — a manual ping-pong, because the shipped animate[] has no ping_pong mode. But vgAnimValue (field_3d_renderer.ts:12333) evaluates u = min(1, ...) on the last matching entry and CLAMPS rather than wrapping, so beyond 72 s lambda returns -3.5 permanently. A teacher who leaves the sandbox open past 72 s — an ordinary classroom duration — sees the marker stop dead at one end of the line with no on-screen indication and no way to restart it except leaving the state and returning. Reproduces the symptom of the OPEN vg_explore_state_is_a_still_picture_for_its_entire_captured_life on a second concept, by a different mechanism: there the state authored no motion, here it authors motion that expires.',
    'A Rule-37 free-running state cannot be made continuous by enumerating windows — the clock has no end, so any finite list expires. Either the engine gains a wrapping/ping_pong mode, or the explore state declares an idle sweep the renderer loops. An authored loop that is merely LONG is a bug with a delay on it.',
    'Assert the explore state resolves a CHANGING value at ms well beyond its last authored window (e.g. 2x the final end_ms). Negative control: STATE_9 returns a constant -3.5 at 80000 ms.'),

  row('vg_explore_state_surfaces_advanced_ring_content_under_a_reduced_preset',
    'Selecting "Core only" still reaches cross-product notation, through the explore state that no preset hides',
    'MAJOR', 'alex:architect',
    'cross_norm and numerator_triple_product are introduced only in STATE_8, the sole depth_ring "advanced" state, and STATE_9 group-B also authors a cross_vec labelled d1 x d2. presets.no_advanced hides STATE_8 and presets.core_only hides STATE_7 and STATE_8 — but STATE_9 is depth_ring "core" and is never hidden. A teacher who selects "Core only" and reaches the sandbox, then switches the view dropdown to "skew pair", gets a violet arrow labelled d1 x d2 plus HUD rows reading the cross norm and the triple product: notation no surviving state ever introduced. This is exactly the Rule 38a coherent-when-cut check AND Rule 38b (the explore state surfaces CORE-ring content only) — both of which the skeleton claims to have discharged, in a section written before the explore state had two groups.',
    'Rule 38b is checked against the explore state RESOLVED CONTENT, per group and per preset, not against its depth_ring tag. A sandbox that inherits objects from a hidden ring is incoherent under the preset that hides it, and tagging the state core does not make its contents core.',
    'For each preset, resolve every explore-state group and assert no rendered label, formula or readout token is introduced only by a hidden state. Negative control: core_only + group B fails on three surfaces.'),

  row('vg_one_symbol_carries_two_meanings_across_states_of_one_concept',
    'd is taught as the direction for four states and then reused as the distance in a formula that also contains d1 and d2',
    'MODERATE', 'alex:mathematics_author',
    'STATE_1 teaches r = a + lambda*d with the amber line labelled d; STATE_4 labels BOTH lines d; STATE_7 renders sin theta = |d.n| / (||d|| ||n||) with d the direction. STATE_8 formula surface then reads d = |(a2-a1).(d1 x d2)| / ||d1 x d2||, where the left-hand d is the shortest DISTANCE while d1 and d2 in the same expression are directions. STATE_3 surface d = |n.(q-a)| / ||n|| invites the same reading. Rule 34b permits exactly ONE formula surface per state, so there is no second surface available to disambiguate, and Rule 25 forbids an untaught term — which a silently redefined term is a sharper case of.',
    'One symbol, one meaning, for the life of a concept. Where a standard notation collides with a symbol the concept has already taught on canvas, rename the NEW one (e.g. the distance as a lowercase letter the concept has not used) and state the choice in the notation ladder — a redefinition is more expensive than an unfamiliar letter.',
    'Build the symbol table across all states from the rendered label and formula strings; assert no symbol is bound to two different quantities. Negative control: d resolves to both a direction and a distance today.'),

  row('scar_seed_script_upsert_downgrades_a_row_that_was_fixed_after_it_was_authored',
    'Replaying a committed seed script reverts FIXED rows to OPEN and erases their fix records',
    'CRITICAL', 'ambiguous',
    'The seed scripts written earlier in this session upsert full rows with ON CONFLICT DO UPDATE SET status, root_cause, prevention_rule, probe_logic — with no predicate. Two bug_classes are authored OPEN in _seed_engine_bug_queue_lines_and_planes_phase0.ts whose fixes are ALREADY ancestors of the branch HEAD (vg_lines_planes_segment_readouts_compute_regardless_of_reveal_state fixed by 86eb919, vg_intersection_is_a_single_target... fixed by 8049ebf). Re-running the script, or replaying its migration, flips both back to OPEN and overwrites the appended fix records. Worse, _seed_engine_bug_queue_lines_and_planes_eye_walk.ts stores the scene_group row as OPEN while eye_walk2.ts later retracted it to FALSE_POSITIVE — in the LIVE DB ONLY, with no committed migration — so a replay resurrects a row the same session proved does not exist and dispatches a surgeon at it. The scripts describe themselves as idempotent: they are idempotent against their OWN authoring, which is not the same as safe against the queue later truth.',
    'A scar-queue write NEVER DOWNGRADES. An upsert whose row was authored OPEN must carry a predicate refusing to overwrite a row already FIXED or FALSE_POSITIVE, in BOTH the script and the emitted SQL (ON CONFLICT ... DO UPDATE ... WHERE engine_bug_queue.status NOT IN (FIXED, FALSE_POSITIVE)). And any correction applied to the live DB is committed as its own migration in the SAME change — a correction that exists only in the database is not in the record at all.',
    'Replay every committed migration against a copy of the queue and assert no row moves from FIXED or FALSE_POSITIVE to OPEN, and that no retraction note is lost. Negative control: the two 2026-08-09 migrations must FAIL this today.',
    ['src/scripts/_seed_engine_bug_queue_lines_and_planes_phase0.ts', 'src/scripts/_seed_engine_bug_queue_lines_and_planes_eye_walk.ts', 'src/scripts/_seed_engine_bug_queue_lines_and_planes_eye_walk2.ts', 'supabase_migrations/supabase_2026-08-09_seed_engine_bug_queue_lines_and_planes_phase0_migration.sql', 'supabase_migrations/supabase_2026-08-09_seed_engine_bug_queue_lines_and_planes_eye_walk_migration.sql']),

  row('scar_migration_header_advertises_an_update_the_file_does_not_contain',
    'An archival migration states it applied a recurrence extension that lives only in the TypeScript path',
    'MAJOR', 'ambiguous',
    'emitSql() in _seed_engine_bug_queue_lines_and_planes_phase0.ts prints the header line "Plus an UPDATE (not a new row) extending formula_surface_states_an_identity_in_a_unit_the_hud_never_renders", but only ever concatenates the INSERT — the UPDATE exists solely in the TypeScript RECUR/RECUR_NOTE path. Anyone rebuilding or auditing the queue from supabase_migrations/ gets a file that STATES it applied the recurrence and did not: the third recorded recurrence of the n.d = 0.624 vs 0.574 unit-mismatch class is absent, and concepts_affected never gains lines_and_planes_in_space, so the next author querying that class sees two occurrences instead of three and reads a live class as closed history.',
    'An emitted migration contains every write its own header claims, or the header does not claim it. Generate the SQL from the SAME data structure that performs the writes — a hand-written comment describing a code path is a second source of truth and will drift on the first edit.',
    'Diff the set of bug_classes written by each seed script against the set written by its emitted SQL and assert equality, including UPDATE-only targets. Negative control: phase0 differs by one today.',
    ['src/scripts/_seed_engine_bug_queue_lines_and_planes_phase0.ts', 'supabase_migrations/supabase_2026-08-09_seed_engine_bug_queue_lines_and_planes_phase0_migration.sql']),
];

// ── the guard the other scripts lack ────────────────────────────────────────
const PROTECTED = ['FIXED', 'FALSE_POSITIVE'];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length ? `ARRAY[${a.map(sqlStr).join(', ')}]::text[]` : `ARRAY[]::text[]`; }
function emitSql(all: Row[]): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type';
  const vals = all.map((r) => `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(SESSION)}, ${sqlStr(r.row_type)})`).join(',\n');
  return `-- 2026-08-09 — xhigh workflow review of PR #96: ${all.length} rows, all OPEN, none fixed.\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_lines_and_planes_xhigh_review.ts.\n` +
    `--\n` +
    `-- NOTE THE WHERE CLAUSE. These rows are authored OPEN, so the conflict path REFUSES to\n` +
    `-- overwrite a row that has since been FIXED or retracted as a FALSE_POSITIVE. The two\n` +
    `-- sibling migrations from earlier the same day lack this predicate, which is itself one\n` +
    `-- of the findings below (scar_seed_script_upsert_downgrades_a_row_that_was_fixed_after_it_was_authored).\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${vals}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  root_cause = EXCLUDED.root_cause, prevention_rule = EXCLUDED.prevention_rule,\n` +
    `  probe_logic = EXCLUDED.probe_logic, concepts_affected = EXCLUDED.concepts_affected,\n` +
    `  fixed_in_files = EXCLUDED.fixed_in_files, status = EXCLUDED.status\n` +
    `WHERE engine_bug_queue.status NOT IN ('FIXED', 'FALSE_POSITIVE');\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-09_seed_engine_bug_queue_lines_and_planes_xhigh_review_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} rows)`);

  const { data: live, error: readErr } = await supabaseAdmin
    .from('engine_bug_queue').select('bug_class,status')
    .in('bug_class', rows.map((r) => r.bug_class));
  if (readErr) { console.error(`✗ read failed: ${readErr.message}`); process.exit(1); }
  const status = new Map((live ?? []).map((r: { bug_class: string; status: string }) => [r.bug_class, r.status]));

  const writable = rows.filter((r) => !PROTECTED.includes(status.get(r.bug_class) ?? 'OPEN'));
  const skipped = rows.filter((r) => PROTECTED.includes(status.get(r.bug_class) ?? 'OPEN'));
  for (const s of skipped) {
    console.log(`⏭  ${s.bug_class} — live status ${status.get(s.bug_class)}; REFUSING to downgrade to OPEN`);
  }
  if (writable.length) {
    const payload = writable.map((r) => ({ ...r, discovered_in_session: SESSION, fixed_at: null }));
    const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
    if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  }
  console.log(`✓ upserted ${writable.length} row(s), skipped ${skipped.length} protected — all OPEN, none fixed`);
}

main();
