/**
 * engine_bug_queue — #9 `lines_and_planes_in_space` FIRST EYE WALK, 2026-08-09.
 *
 * TWO new rows + TWO updates to existing rows.
 *
 * THE HEADLINE RESULT, and it is a tooling result rather than a concept one:
 * the concept's first EYE run reported "39 deterministic checks · 39 passed ·
 * 0 failed". That was FALSE. NINE of the 39 were SKIPS — D5 on every one of the
 * 9 states ("motion expectation unknown") plus H2 — so the motion gate had never
 * executed once, on a concept nobody had ever rendered. After the one-line source
 * fix below the same run reads 38 passed / 1 FAILED, and the failure is real
 * (STATE_9 declares motion and no pixel moves).
 *
 * A gate fed the wrong source cannot be repaired by teaching it about a new
 * scenario. That is why registering `vg` in deriveMotionExpectations during the
 * #7 wave did not make D5 run: the registration was never reachable.
 *
 * ⚠ GUARD RETROFIT 2026-08-09 (scar_seed_script_upsert_downgrades_a_row_that_was_fixed_after_it_was_authored):
 * the unguarded upsert here would have RESURRECTED vg_object_group_membership_… — a row this same
 * session later retracted as FALSE_POSITIVE (see …eye_walk2.ts) — and dispatched a surgeon at a
 * defect proven not to exist. Every write now refuses to touch a row whose LIVE status is FIXED or
 * FALSE_POSITIVE, in both the TS path and the emitted SQL. The emitted SQL also now CONTAINS the two
 * UPDATEs its own header always advertised (scar_migration_header_advertises_an_update_the_file_does_not_contain),
 * generated from the same UPDATES array the TS path applies.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_lines_and_planes_eye_walk.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-09_lines_and_planes_eye_walk';

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

const EYES = 'src/scripts/visual_eyes.ts';
const R = 'src/lib/renderers/field_3d_renderer.ts';
const C9 = ['lines_and_planes_in_space'];

// ── the guard the xhigh sibling carried from birth (retrofit 2026-08-09) ────
const PROTECTED = ['FIXED', 'FALSE_POSITIVE'];

const rows: Row[] = [
  {
    bug_class: 'eye_motion_gate_read_the_cached_config_which_for_a_hand_seeded_concept_carries_no_states',
    title: 'D5 was fed cached.physics_config, which for every chemistry/mathematics concept contains only epic_l_path — so the motion gate silently never ran',
    severity: 'CRITICAL', owner_cluster: 'peter_parker:visual_validator',
    root_cause:
      'visual_eyes.ts computed expectsMotion = deriveMotionExpectations(cached.physics_config) while the sibling reveal and hold derivations two lines below read conceptJson ?? cached.physics_config. A SUBJECT-NAMESPACE concept (chemistry / mathematics) never runs the live generation pipeline — it registers at site #1 only, the isolation contract — so it is HAND-SEEDED into simulation_cache by _seed_subject_cache.ts, and the seeded physics_config carries ONLY epic_l_path: no field_3d_config, no states. resolveField3dStates() therefore returned null, deriveMotionExpectations returned an empty object, every state resolved to undefined, and pixelGate emitted D5 as PASSED with evidence "Skipped -- motion expectation unknown". visual_eyes aggregates skips into the headline count, so lines_and_planes_in_space first ever visual run reported "39 checks / 39 passed / 0 failed" with NINE skips inside it and zero motion coverage. THIS IS THE MECHANISM behind the #7 wave finding that adding a vg entry to deriveMotionExpectations did not make D5 run: the registration was correct and unreachable. Fixed by loading the concept JSON before the derivation and passing conceptJson ?? cached.physics_config, matching the established sibling convention. VERIFIED: the same concept re-run reports 38 passed / 1 FAILED with D5 executing on all 9 states, and the single failure is a genuine one.',
    prevention_rule:
      'EVERY derivation in a gate runner reads the SAME source, and that source is the concept JSON with the cache as fallback — never the cache alone. A hand-seeded cache row is a DIFFERENT SHAPE from a pipeline-generated one, so any gate reading it directly is correct for physics and silently inert for every other subject. When a gate is reported as not running, check WHAT IT IS FED before adding registrations to it: a registration cannot fire on a config that does not contain the key it registers against. Generally: a skip is not a pass, and a gate that skips 100 percent of states must be treated as a failed run, not a clean one.',
    probe_type: 'js_eval',
    probe_logic:
      'After any visual:eyes run, assert the count of D5 lines whose evidence contains "Skipped" is ZERO for any concept with a non-empty animate[] or declared motion; assert deriveMotionExpectations returns a non-empty map for one concept from EACH subject namespace (physics, chemistry, mathematics). Negative control: feed it a hand-seeded physics_config and assert it returns empty, proving the probe discriminates.',
    status: 'FIXED', concepts_affected: ['lines_and_planes_in_space', 'vector_products_in_space'],
    fixed_in_files: [EYES], row_type: 'incident',
  },
  {
    bug_class: 'vg_object_group_membership_authored_as_group_while_the_engine_reads_groups_so_the_selector_is_inert',
    title: 'The Δ10 scene_group selector does nothing, because objects declare "group" and vgInGroup reads "groups"',
    severity: 'MAJOR', owner_cluster: 'ambiguous',
    root_cause:
      'vgInGroup(o, group) tests o.groups (PLURAL, an array) and RETURNS TRUE for any object that does not declare it — an object with no groups is present in every group, which is the correct permissive default. The #9 concept JSON authors group (SINGULAR) on its lines, a key the engine never reads. Net effect: every object passes the membership test in every group, so selecting scene_group A or B changes nothing and all eight objects render simultaneously. That co-present scene is EXACTLY what Δ10 was specified to prevent: the explore camera solved over all eight objects and all six sliders returns a minimum pairwise screen separation of 1.35 degrees, which is why the state was split into two groups with their own poses (41.1 and 11.0 degrees). So the one measured design decision the explore state rests on is silently not in effect. Neither the schema nor the gate catches it, because an unknown key is legal under Zod passthrough and a permissive membership default cannot distinguish "no groups authored" from "groups authored under the wrong name".',
    prevention_rule:
      'A permissive default (absent membership means present everywhere) must not be reachable by a TYPO. Where a scenario ships a selector, the gate asserts the selector CHANGES the rendered object set between its declared options — a selector that resolves to the same scene for every option is a failed selector, not a passing one. Corollary for authoring: any key that governs visibility is verified by observing the picture change, never by its presence in the JSON. Add groups to the declared vg type so the singular form is a type error rather than silent data.',
    probe_type: 'js_eval',
    probe_logic:
      'For a state declaring scene_groups, resolve the scene once per group key and assert the resolved object id sets DIFFER; assert every authored object carries a groups array when more than one group is declared. Negative control: the shipped #9 STATE_9 must FAIL this probe today.',
    status: 'OPEN', concepts_affected: C9, fixed_in_files: [R], row_type: 'incident',
  },
];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length ? `ARRAY[${a.map(sqlStr).join(', ')}]::text[]` : `ARRAY[]::text[]`; }
function sqlRow(r: Row): string {
  return `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(SESSION)}, ${sqlStr(r.row_type)})`;
}

/**
 * Updates to EXISTING rows — reuse the class, never mint a synonym.
 * Each appends a dated note and widens concepts_affected; both are idempotent
 * (the note is only appended when its marker is absent).
 */
const UPDATES: Array<{ bug_class: string; addConcepts: string[]; note: string; marker: string }> = [
  {
    bug_class: 'eye_gate_skipped_for_an_unregistered_scenario_is_counted_as_a_pass',
    addConcepts: ['lines_and_planes_in_space'],
    marker: 'MECHANISM IDENTIFIED 2026-08-09',
    note:
      ' MECHANISM IDENTIFIED 2026-08-09 and the SKIP HALF IS NOW FIXED. The reason the vg registration ' +
      '"did not take" was never the registration: visual_eyes fed deriveMotionExpectations ' +
      'cached.physics_config, and a hand-seeded subject-namespace cache row carries only epic_l_path — ' +
      'no field_3d_config, no states — so the resolver returned null and every expectation was undefined. ' +
      'Fixed by reading conceptJson ?? cached.physics_config, the same source the sibling reveal/hold ' +
      'derivations already used. Verified on lines_and_planes_in_space: 9 skips before, D5 executing on ' +
      'all 9 states after, and one GENUINE failure surfaced immediately (STATE_9 ANIMATION_NO_MOTION). ' +
      'See eye_motion_gate_read_the_cached_config_which_for_a_hand_seeded_concept_carries_no_states. ' +
      'THIS ROW STAYS OPEN for its SECOND half, which is untouched and is an explicit founder call: ' +
      'visual_eyes still aggregates skips into the headline pass count, so a run can still read ' +
      '"N passed" while gates were skipped. Fresh evidence for that decision: this concept first run ' +
      'headlined 39/39 with 9 skips inside it.',
  },
  {
    bug_class: 'vg_explore_state_is_a_still_picture_for_its_entire_captured_life',
    addConcepts: ['lines_and_planes_in_space'],
    marker: 'REPRODUCED 2026-08-09',
    note:
      ' REPRODUCED 2026-08-09 on a SECOND concept, lines_and_planes_in_space STATE_9 — and this time a ' +
      'gate CAUGHT it rather than a human noticing: D5 fails with ANIMATION_NO_MOTION, max adjacent diff ' +
      '0.04 percent of canvas across 20 pairs. Note the concept did NOT under-author: it works around the ' +
      'missing ping_pong mode with eight alternating lambda animate[] entries on disjoint windows ' +
      '(0 to 72000 ms) and show_lambda_marker true — so an authored, correct-looking continuous sweep ' +
      'still produced no moving pixels. That makes this row about the ENGINE or the framing rather than ' +
      'about lazy authoring, which is how it was originally read on vector_products_in_space. Root cause ' +
      'for #9 pending the eye walk; candidate contributor: the inert scene_group selector ' +
      '(vg_object_group_membership_authored_as_group_while_the_engine_reads_groups_so_the_selector_is_inert) ' +
      'leaves all eight objects co-present at a pose solved for two, so a sliding marker may be sub-pixel.',
  },
];

/** Emit one UPDATE mirroring the TS semantics exactly: concept widen = set union, note appends only when its marker is absent. */
function sqlUpdate(u: { bug_class: string; addConcepts: string[]; note: string; marker: string }): string {
  const widen = u.addConcepts.reduce(
    (expr, c) => `CASE WHEN ${sqlStr(c)} = ANY(${expr === 'concepts_affected' ? expr : `(${expr})`}) THEN ${expr} ELSE ${expr} || ${sqlStr(c)} END`,
    'concepts_affected',
  );
  return `UPDATE engine_bug_queue SET\n` +
    `  concepts_affected = ${widen},\n` +
    `  root_cause = CASE WHEN root_cause LIKE ${sqlStr(`%${u.marker}%`)}\n` +
    `    THEN root_cause ELSE root_cause || ${sqlStr(u.note)} END\n` +
    `WHERE bug_class = ${sqlStr(u.bug_class)};\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-08-09_seed_engine_bug_queue_lines_and_planes_eye_walk_migration.sql');
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type';
  writeFileSync(sqlPath,
    `-- 2026-08-09 — lines_and_planes_in_space FIRST EYE WALK: ${rows.length} new rows + ${UPDATES.length} updates.\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_lines_and_planes_eye_walk.ts — idempotent.\n` +
    `--\n` +
    `-- NOTE THE WHERE CLAUSE (guard retrofit 2026-08-09). Rows here are asserted at their ROUND-1\n` +
    `-- status; one of them was later retracted as FALSE_POSITIVE, so the conflict path REFUSES to\n` +
    `-- overwrite a row that has since been FIXED or retracted — a replay must never resurrect it\n` +
    `-- (scar_seed_script_upsert_downgrades_a_row_that_was_fixed_after_it_was_authored).\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${rows.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files\n` +
    `WHERE engine_bug_queue.status NOT IN ('FIXED', 'FALSE_POSITIVE');\n\n` +
    `-- The two UPDATEs the header advertises — emitted from the SAME UPDATES array the TS path\n` +
    `-- applies (scar_migration_header_advertises_an_update_the_file_does_not_contain).\n` +
    UPDATES.map(sqlUpdate).join('\n'), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath}`);

  // Guard: never touch a row whose LIVE status is FIXED / FALSE_POSITIVE.
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
      ...r, discovered_in_session: SESSION,
      fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
    }));
    const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
    if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  }
  console.log(`✓ upserted ${writable.length} new row(s) (${skipped.length} protected, skipped)`);

  for (const u of UPDATES) {
    const { data: ex, error: rErr } = await supabaseAdmin
      .from('engine_bug_queue').select('bug_class,concepts_affected,root_cause')
      .eq('bug_class', u.bug_class).maybeSingle();
    if (rErr) { console.error(`✗ read ${u.bug_class}: ${rErr.message}`); process.exit(1); }
    if (!ex) {
      console.error(`✗ expected existing row ${u.bug_class} — NOT found.`);
      console.error(`  Refusing to create it here: a class that has gone missing is re-authored deliberately,`);
      console.error(`  never resurrected as a side effect of an update.`);
      process.exit(1);
    }
    const already = (ex.root_cause ?? '').includes(u.marker);
    const affected = Array.from(new Set([...(ex.concepts_affected ?? []), ...u.addConcepts]));
    const { error: uErr } = await supabaseAdmin.from('engine_bug_queue')
      .update({ concepts_affected: affected, root_cause: already ? ex.root_cause : (ex.root_cause ?? '') + u.note })
      .eq('bug_class', u.bug_class);
    if (uErr) { console.error(`✗ update ${u.bug_class}: ${uErr.message}`); process.exit(1); }
    console.log(`✓ ${u.bug_class} — concepts ${affected.length}${already ? ' (note already present)' : ', note appended'}`);
  }
}

main();
