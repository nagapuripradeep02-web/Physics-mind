/**
 * engine_bug_queue — #9 eye walk, ROUND 2: the findings, and TWO CORRECTIONS TO
 * MY OWN ROWS. 2026-08-09.
 *
 * ⚠ TWO ROWS SEEDED EARLIER TODAY WERE WRONG AND ARE CORRECTED HERE. Both were
 * filed from a source read that did not discriminate, and the eye walk refuted
 * them from pixels. An incorrect OPEN row is worse than a missing one: it
 * dispatches a surgeon at a defect that does not exist, and it launders a bad
 * inference into the permanent record.
 *
 *  (1) vg_object_group_membership_authored_as_group_..._selector_is_inert
 *      → FALSE_POSITIVE. I checked each object for a SINGULAR `group` key, got
 *      null, and concluded membership was unauthored. The JSON authors `groups`
 *      (PLURAL) — ['A'] / ['B'] — which is exactly what vgInGroup reads. My check
 *      could not distinguish "no membership" from "membership under the key I
 *      did not test", i.e. it was invariant under the error I was making. The
 *      Δ10 selector WORKS: only group-A objects render in STATE_9 and the
 *      dropdown reads "line + plane".
 *
 *  (2) vg_explore_state_is_a_still_picture_for_its_entire_captured_life
 *      → my "REPRODUCED on #9" note is WITHDRAWN. STATE_9's λ marker genuinely
 *      traverses the full line (slider readout −3.50 → −0.39 → 3.50, matching
 *      the closed form exactly). D5's failure there is a FALSE POSITIVE, filed
 *      separately below.
 *
 * The lesson, and it is the same one this chapter has now paid for three times:
 * AN EXACT MATCH ON A QUANTITY THAT IS INVARIANT UNDER YOUR LIKELY ERROR IS NOT
 * EVIDENCE. Pick the quantity that discriminates — here, grep the key the ENGINE
 * reads, not the key you expected the author to write.
 *
 * ⚠ GUARD RETROFIT 2026-08-09 (scar_seed_script_upsert_downgrades_a_row_that_was_fixed_after_it_was_authored):
 * the unguarded upsert here asserted the a/b row OPEN, which PR #91 then fixed — a replay would have
 * reverted it and erased the 6-site vgShowAB fix record. Every write now refuses to touch a row whose
 * LIVE status is FIXED or FALSE_POSITIVE. This script also originally emitted NO archival SQL at all,
 * so the retraction and the CRITICAL escalation it applies existed only in the live DB
 * (scar_migration_header_advertises_an_update_the_file_does_not_contain, one notch worse: no file to
 * even disagree with its header) — it now writes …_eye_walk2_migration.sql from the same rows/UPDATES
 * structures the TS path applies.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_lines_and_planes_eye_walk2.ts
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

interface Row {
  bug_class: string; title: string; severity: Severity; owner_cluster: Owner;
  root_cause: string; prevention_rule: string; probe_type: 'sql' | 'js_eval' | 'manual' | 'vision_model';
  probe_logic: string; status: Status; concepts_affected: string[]; fixed_in_files: string[];
  row_type: 'incident' | 'probe_definition' | 'directive';
}

const R = 'src/lib/renderers/field_3d_renderer.ts';
const EYES = 'src/scripts/visual_eyes.ts';
const C9 = ['lines_and_planes_in_space'];

const rows: Row[] = [
  {
    bug_class: 'vg_lines_planes_mode_never_hides_the_dot_cross_scaffolding_vectors_a_b',
    title: "Act I's a and b vectors render on EVERY lines_planes state, colliding with the taught content",
    severity: 'CRITICAL', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'In applyVectorGeometry3DState (field_3d_renderer.ts:14264) the visibility pass reads: if (elementType === "vg_vector_a" || elementType === "vg_vector_b") want = true — UNCONDITIONALLY. Every sibling on that same switch is gated (vg_vector_c by d.show_c, vg_cross_vector by d.show_cross_vector, vg_angle_arc by d.show_angle_arc, vg_parallelogram, vg_parallelepiped), and the lines_planes elements are skipped entirely one line above (elementType.indexOf("vg_lp_") === 0 continue). So the two products-mode explorer vectors are the ONLY elements with no gate, and they render at their default magnitudes on all NINE states of a lines_planes concept that never mentions them. Confirmed in frames on every state. It is not passive clutter: on STATE_6 the bold labelled "a" sits exactly where d1 own label belongs and d1 is never legibly labelled, on the state whose formula NAMES d1; on STATE_5 "a" runs nearly parallel to d1 on screen, diluting the single coincidence illusion the state exists to create; on STATE_8 a and b cross through d1, d2, d1xd2 and (a2-a1) on the derivation state; on STATE_7 "b" label crowds "n". It also breaks Rule 32e (one glow focal) on every state by construction, since 3-5 co-equal full-brightness elements compete. Invisible to every deterministic gate: H1 does not check for EXTRANEOUS content, D5/D6/D7 only check motion, and H2 had no baseline.',
    prevention_rule:
      'A shared scenario with MODES hides every element belonging to the other mode by default, and the visibility pass has NO ungated element — each entry is gated by a flag or by the mode. A gate list where one element is want = true is a list nobody re-read after the second mode was added. Corollary for gates: a visual gate that only asks "is the declared content present" cannot see content that should be ABSENT; a scenario with modes needs an EXTRANEOUS-ELEMENT assertion (the rendered element set equals the declared set, both directions).',
    probe_type: 'js_eval',
    probe_logic:
      'For a lines_planes state, resolve the visible element set and assert it contains NO vg_vector_a / vg_vector_b / their labels. Both directions: assert the rendered set equals the authored set exactly. Negative control: the shipped build must FAIL this today on all 9 states.',
    status: 'OPEN', concepts_affected: C9, fixed_in_files: [R], row_type: 'incident',
  },
  {
    bug_class: 'visual_eyes_d5_ink_relative_lens_is_diluted_by_static_chrome_on_explore_states',
    title: 'D5 failed a state whose marker visibly traverses the whole line, because static slider chrome dominates the ink denominator',
    severity: 'MAJOR', owner_cluster: 'ambiguous',
    root_cause:
      'D5 ink-relative rescue lens (built so thin primitives on a large canvas are not dismissed as motionless) computes the ink delta against TOTAL non-background ink — which on an interaction_complete explore state includes the always-on multi-row slider panel, the scene-group dropdown and the HUD box. On lines_and_planes_in_space STATE_9 the lambda marker traverses the FULL length of L1 (slider readout -3.50 at t=0, -0.39 at t=4000, 3.50 at t=9000, matching the authored closed form exactly, with the marker visibly at opposite ends of the line in the two frames), yet the per-step ink delta of roughly 0.23-0.28 percent never clears the 0.5-percent-of-ink floor, so D5 reported ANIMATION_NO_MOTION. A gate that fails correct content trains its readers to ignore it, which is the same end state as a gate that passes everything.',
    prevention_rule:
      'A motion metric measures the region where motion is claimed — the 3D canvas viewport — never the whole frame including static control chrome. Where a denominator can be dominated by content that CANNOT move, the metric is computed on the movable region or the static region is subtracted. And a first FALSE POSITIVE on a new gate is recorded immediately, before it becomes a known-noisy check people wave through.',
    probe_type: 'js_eval',
    probe_logic:
      'Exclude the static control-panel/HUD DOM regions from the ink denominator (or measure within the canvas viewport only) and assert STATE_9 of lines_and_planes_in_space PASSES D5 while a genuinely static state still fails it — the negative control is what makes the fix trustworthy.',
    status: 'OPEN', concepts_affected: C9, fixed_in_files: [EYES], row_type: 'incident',
  },
  {
    bug_class: 'vg_lp_angle_arc_apex_rides_its_own_lines_offset_away_from_the_reference_it_measures_against',
    title: 'An angle arc drifts free of both the plane and the normal it is measuring between',
    severity: 'MODERATE', owner_cluster: 'ambiguous',
    root_cause:
      'The angle arc apex is anchored to the first named line own anchor (field_3d_renderer.ts:13191, arcApex = lnA.anchor). On lines_and_planes_in_space STATE_4 that line (Lpar) carries an animated offset of magnitude about 5 units, so between 2000 and 8000 ms the arc travels with it and ends as a small isolated curve floating above-left of the plane-and-normal cluster, touching neither. The state renders a 90.0 degree reading for an angle whose picture no longer shows what the two arms are. Two contributing causes, hence ambiguous ownership: the authored offset magnitude is a design choice, and anchoring the apex to one arm own anchor rather than a shared reference is an engine choice.',
    prevention_rule:
      'An angle arc is drawn at the point where its two arms actually meet, or at a shared reference both arms are anchored to — never at one arm own anchor when that anchor is free to move. If an arm translates, the arc follows the MEASUREMENT, not the object.',
    probe_type: 'js_eval',
    probe_logic:
      'Project the arc apex and both referenced objects; assert the apex lies within a bounded screen distance of BOTH arms at every sampled ms of the state, not only at t=0.',
    status: 'OPEN', concepts_affected: C9, fixed_in_files: [R], row_type: 'incident',
  },
];

/** Corrections + sharpenings to existing rows. Idempotent via marker strings. */
const UPDATES: Array<{
  bug_class: string; note: string; marker: string;
  status?: Status; severity?: Severity; addConcepts?: string[];
}> = [
  {
    bug_class: 'vg_object_group_membership_authored_as_group_while_the_engine_reads_groups_so_the_selector_is_inert',
    marker: 'RETRACTED 2026-08-09',
    status: 'FALSE_POSITIVE',
    note:
      ' RETRACTED 2026-08-09 — THIS ROW WAS WRONG AND THE DEFECT DOES NOT EXIST. The concept authors ' +
      'groups (PLURAL) as ["A"] / ["B"] on every object, which is exactly the key vgInGroup reads. The ' +
      'row was filed after checking each object for a SINGULAR `group` key, finding null, and inferring ' +
      'that membership was unauthored — a check INVARIANT under the actual situation, so it could not ' +
      'discriminate "no membership" from "membership under the key I did not test". Refuted from pixels ' +
      'by the eye walk: STATE_9 renders ONLY the group-A object set (plane P1, normal n, line L1 + lambda ' +
      'marker, point q, foot bracket), zero group-B objects, and the on-screen dropdown reads ' +
      '"view: line + plane". The Δ10 selector works as designed. Kept as FALSE_POSITIVE rather than ' +
      'deleted, because the inference error is the durable lesson: an exact match on a quantity that is ' +
      'invariant under your likely error is not evidence — grep the key the ENGINE reads.',
  },
  {
    bug_class: 'vg_explore_state_is_a_still_picture_for_its_entire_captured_life',
    marker: 'NOTE WITHDRAWN 2026-08-09',
    note:
      ' NOTE WITHDRAWN 2026-08-09 — the "REPRODUCED on lines_and_planes_in_space" claim added earlier the ' +
      'same day is RETRACTED. #9 STATE_9 is NOT static: the lambda marker traverses the full length of L1 ' +
      '(slider readout -3.50 / -0.39 / 3.50 at t = 0 / 4000 / 9000, matching the authored closed form), ' +
      'confirmed on frames. The D5 failure there is a GATE false positive caused by static slider chrome ' +
      'dominating the ink denominator — see ' +
      'visual_eyes_d5_ink_relative_lens_is_diluted_by_static_chrome_on_explore_states. This row remains ' +
      'OPEN on its ORIGINAL concept (vector_products_in_space), where the state genuinely was byte-identical ' +
      'across all captured frames.',
  },
  {
    bug_class: 'vg_lines_planes_segment_readouts_compute_regardless_of_reveal_state',
    marker: 'SHARPENED 2026-08-09',
    severity: 'CRITICAL',
    addConcepts: ['lines_and_planes_in_space'],
    note:
      ' SHARPENED 2026-08-09 by the #9 eye walk, and RAISED TO CRITICAL — the original wording undersold ' +
      'both the scope and the consequence. It is not only SEGMENT readouts: the whole intersection block ' +
      '(field_3d_renderer.ts:13117-13138) publishes d_dot_n, lambda, intersection_point and ' +
      'no_meeting_point as soon as ctx.lines[isec.line] and ctx.planes[isec.plane] resolve, ignoring BOTH ' +
      'the named line own reveal_at_ms AND the intersection reveal_at_ms (which gates only the DRAWN ' +
      'marker). Measured on STATE_4: for the first 9.5 seconds the HUD reads n·d = 0.574, λ = 2.600 and a ' +
      'meeting point — all describing Lcut — while the only line on screen is Lpar, the PARALLEL line ' +
      'whose entire lesson is that n·d = 0 and that no meeting point exists. Both lines carry the same ' +
      'generic label "d", so a viewer has every reason to read the numbers as describing what they see. ' +
      'This lands on the state built to break misconception M2 (the normal confused for the plane), and it ' +
      'is the chapter signature failure shape: a text surface contradicting the picture beside it.',
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
/** Emit one UPDATE mirroring the TS patch semantics: status/severity set as declared, concept widen = set union, note appends only when its marker is absent. */
function sqlUpdate(u: (typeof UPDATES)[number]): string {
  const sets: string[] = [];
  if (u.status) sets.push(`status = ${sqlStr(u.status)}`);
  if (u.severity) sets.push(`severity = ${sqlStr(u.severity)}`);
  for (const c of u.addConcepts ?? []) {
    sets.push(`concepts_affected = CASE WHEN ${sqlStr(c)} = ANY(concepts_affected) THEN concepts_affected ELSE concepts_affected || ${sqlStr(c)} END`);
  }
  sets.push(`root_cause = CASE WHEN root_cause LIKE ${sqlStr(`%${u.marker}%`)}\n    THEN root_cause ELSE root_cause || ${sqlStr(u.note)} END`);
  return `UPDATE engine_bug_queue SET\n  ${sets.join(',\n  ')}\nWHERE bug_class = ${sqlStr(u.bug_class)};\n`;
}
function emitSql(): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type';
  return `-- 2026-08-09 — lines_and_planes_in_space eye walk ROUND 2: ${rows.length} new rows + ${UPDATES.length} corrections\n` +
    `-- (a FALSE_POSITIVE retraction, a withdrawn REPRODUCED note, a CRITICAL escalation).\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_lines_and_planes_eye_walk2.ts — idempotent.\n` +
    `-- This file did not exist until 2026-08-09's guard retrofit: the corrections it records lived\n` +
    `-- only in the live DB, which is the exact failure the retraction itself documents.\n` +
    `--\n` +
    `-- NOTE THE WHERE CLAUSE. Rows are asserted at their round-2 status (all OPEN); the conflict\n` +
    `-- path refuses to overwrite a row that has since been FIXED or retracted\n` +
    `-- (scar_seed_script_upsert_downgrades_a_row_that_was_fixed_after_it_was_authored).\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${rows.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files\n` +
    `WHERE engine_bug_queue.status NOT IN ('FIXED', 'FALSE_POSITIVE');\n\n` +
    `-- The corrections — emitted from the SAME UPDATES array the TS path applies.\n` +
    UPDATES.map(sqlUpdate).join('\n');
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-09_seed_engine_bug_queue_lines_and_planes_eye_walk2_migration.sql');
  writeFileSync(sqlPath, emitSql(), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath}`);

  // Guard: never touch a row whose LIVE status is FIXED / FALSE_POSITIVE.
  const { data: live, error: liveErr } = await supabaseAdmin
    .from('engine_bug_queue').select('bug_class,status')
    .in('bug_class', rows.map((r) => r.bug_class));
  if (liveErr) { console.error(`✗ read failed: ${liveErr.message}`); process.exit(1); }
  const liveStatus = new Map((live ?? []).map((r: { bug_class: string; status: string }) => [r.bug_class, r.status]));
  const writable = rows.filter((r) => !PROTECTED.includes(liveStatus.get(r.bug_class) ?? 'OPEN'));
  const skippedRows = rows.filter((r) => PROTECTED.includes(liveStatus.get(r.bug_class) ?? 'OPEN'));
  for (const s of skippedRows) {
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
  console.log(`✓ upserted ${writable.length} new row(s) (${skippedRows.length} protected, skipped)`);

  for (const u of UPDATES) {
    const { data: ex, error: rErr } = await supabaseAdmin
      .from('engine_bug_queue').select('bug_class,concepts_affected,root_cause,status,severity')
      .eq('bug_class', u.bug_class).maybeSingle();
    if (rErr) { console.error(`✗ read ${u.bug_class}: ${rErr.message}`); process.exit(1); }
    if (!ex) { console.error(`✗ expected existing row ${u.bug_class} — NOT found; refusing to create it here.`); process.exit(1); }
    const already = (ex.root_cause ?? '').includes(u.marker);
    const patch: Record<string, unknown> = {
      root_cause: already ? ex.root_cause : (ex.root_cause ?? '') + u.note,
    };
    if (u.status) patch.status = u.status;
    if (u.severity) patch.severity = u.severity;
    if (u.addConcepts) patch.concepts_affected = Array.from(new Set([...(ex.concepts_affected ?? []), ...u.addConcepts]));
    const { error: uErr } = await supabaseAdmin.from('engine_bug_queue').update(patch).eq('bug_class', u.bug_class);
    if (uErr) { console.error(`✗ update ${u.bug_class}: ${uErr.message}`); process.exit(1); }
    console.log(`✓ ${u.bug_class} → ${u.status ?? ex.status}${u.severity ? '/' + u.severity : ''}${already ? ' (note present)' : ', note appended'}`);
  }
}

main();
