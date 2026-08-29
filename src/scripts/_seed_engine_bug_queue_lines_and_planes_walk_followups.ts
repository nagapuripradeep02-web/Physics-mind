/**
 * engine_bug_queue — #9 `lines_and_planes_in_space`, WALK FOLLOW-UPS, 2026-08-20.
 * Four marker-gated annotations on rows that were NOT closed: what was measured,
 * what it rules out, and (for the two needing an engine delta) why authoring cannot
 * reach them. No status is downgraded and no row is closed on an assertion.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_lines_and_planes_walk_followups.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

interface Update { bug_class: string; marker: string; note: string; concepts_affected?: string[]; }

const UPDATES: Update[] = [
  {
    bug_class: 'label_separation_is_a_function_of_the_authored_camera_and_no_gate_recomputes_it_when_the_camera_moves',
    marker: 'S8 REMEDY ANALYSED 2026-08-20 — and the obvious one is wrong',
    note: ' S8 REMEDY ANALYSED 2026-08-20 — and the obvious one is wrong, which is why this stays OPEN rather than being nudged closed. The camera nudge that fixed STATE_4 CANNOT be applied to STATE_8: S8\'s pose IS the target of STATE_5\'s camera_steps (both are az -38 / el 56 / r 13 in the engine\'s atan2(z,x) convention), so moving S8 alone turns the S5 to S8 cut into a teleport and breaks Rule 32d home-pose continuity — the very thing that camera was chosen for. A projection model was built and VALIDATED against the shipped pixels before being trusted (it predicts the two labels at x = 621 and 653; clustering near-white glyph columns on the captured frame measures 618 and 652), then searched over a +/-14 degree azimuth by +/-12 degree elevation grid at fixed r = 13. Best achievable centre separation is 40.6px at az -24 / el 44, against 33.1px today — and since the two label boxes are about 25px and 28px wide and sit on ONE baseline (y = 444 vs 448), a 12px BOX gap needs roughly 38.5px of centre separation. So the entire nudge budget buys about 2px of margin while costing a 14-degree camera move on both S5 and S8 plus a re-derivation of the S5 camera-solve fidelity claims. The real remedies are therefore (a) move S5\'s target and S8\'s pose TOGETHER and re-derive those claims, or (b) an authorable per-label offset — the engine places a vector\'s label at tip + 0.3 * unit(tip - origin) with no authoring control (field_3d_renderer.ts, the vgLabelAt call in the vector pass), so (b) is a Rule-40 engine delta. Scaling the drawn cross vector to separate the tips was considered and REJECTED: its length is named on the HUD as ||d1xd2|| = 0.936, so stretching it would author the exact defect class field3d_vg_a_value_surface_can_disagree_with_the_geometry_it_names.',
  },
  {
    bug_class: 'vg_explore_state_is_a_still_picture_for_its_entire_captured_life',
    marker: 'SCOPE CORRECTED 2026-08-20 — discharged for lines_and_planes_in_space',
    concepts_affected: ['vector_products_in_space'],
    note: ' SCOPE CORRECTED 2026-08-20 — discharged for lines_and_planes_in_space and narrowed to vector_products_in_space, which still reproduces it. #9\'s STATE_9 now authors the closed two-window lambda ping-pong plus animate_loop_ms 18000 (PR #113 shipped the mechanism; the authoring landed in 6713e22), and the sandbox is MEASURED to move rather than asserted to: a direct pixelmatch over the 21 dense frames of the post-#118 capture reads 332-374 changed pixels on EVERY adjacent pair, with the changed-region bounding box marching x[482 -> 744] and back in a clean palindrome about t=9000, and t=1000->2000 byte-comparable to t=19000->20000 (the 18s loop closing). It is not static for a single sampled instant of its captured life. NOTE for whoever closes the vector_products half: THE EYE still reports D5 FAIL on this state, and that failure is the separate, already-filed false positive (visual_eyes_d5_ink_relative_lens_is_diluted_by_static_chrome_on_explore_states) — a red D5 on an explore state is NOT evidence for this row, and reading it as such is how this row would get wrongly re-opened.',
  },
  {
    bug_class: 'formula_surface_states_an_identity_in_a_unit_the_hud_never_renders',
    marker: 'CHECKED ON #9 2026-08-20',
    note: ' CHECKED ON #9 2026-08-20 — lines_and_planes_in_space does NOT reproduce the unit-falsification this row names, and the scope is left unchanged only because one adjacent weakness is real. All nine surfaces were read against their rendered HUD rows on the post-#118 capture. The one surface whose identity is fully verifiable on screen is STATE_8: it asserts D = |(a2-a1).(d1xd2)| / ||d1xd2|| and the HUD renders all three terms, 1.685 / 0.936 / 1.800, and 1.685 / 0.936 = 1.8002 — the identity evaluates TRUE on the rendered numbers to the declared precision, which is exactly what this row\'s probe demands. No surface on this concept is rendered in a unit its identity does not hold in: the two trigonometric surfaces (S6 cos theta, S7 sin theta) name angles whose HUD rows are degrees, and both identities hold with the angle in any unit, so there is no factor-of-57.3 analogue here. THE ADJACENT WEAKNESS, recorded rather than filed because it is this row\'s own DO one notch weaker: on S3 and S6 the verifying readouts are not rendered at all (S3 prints distance but never n.(q-a) or ||n||; S6 prints the angle but never the dot product or the two norms), so those identities are unfalsifiable on screen rather than false. If this row is ever generalised from "rendered in the wrong unit" to "not verifiable from what is rendered", #9 reproduces the generalised form on two states.',
  },
  {
    bug_class: 'skeleton_discharges_a_scar_against_an_engine_delta_that_was_never_built',
    marker: 'PROBE RUN 2026-08-20 — THREE deltas are absent, not one',
    note: ' PROBE RUN 2026-08-20 — THREE deltas are absent, not one, and this row\'s own negative control would FAIL today. Running exactly the sweep this row prescribes (grep the shipped renderer and its gate for every delta identifier the skeleton names) returns: D2 renderer 2 / gate 2, D4 6 / 8, D5 1 / 3, D6 2 / 9, D10 8 / 6 — all present — while D1 0 / 0, D7 0 / 0 and D9 0 / 0 are all ABSENT. The row names only D7, and its stated negative control asserts the probe should report "D7 absent while reporting D1/D2/D5/D6/D9/D10 present": D1 and D9 are in that asserted-present list and have zero hits, so the control as written cannot pass, and any future run of it would be read as the probe being broken rather than the evidence being stale. CAVEAT, stated because the method has a known limit: a zero hit count proves the IDENTIFIER is absent from renderer and gate, not that the mechanism is unimplemented under another name — the row\'s own DO prescribes this grep, so the result is reported on its own terms and a symbol-level confirmation for D1 and D9 is the next step, not a conclusion drawn here. Nothing in this is authorable: closing it needs the deltas built on master under Rule 40.',
  },
];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return `ARRAY[${a.map(sqlStr).join(', ')}]::text[]`; }
function emitSql(): string {
  return `-- 2026-08-20 — lines_and_planes_in_space WALK FOLLOW-UPS: ${UPDATES.length} marker-gated\n` +
    `-- annotations on rows that were NOT closed. No status changes, no closures on assertion.\n\n` +
    UPDATES.map((u) => {
      const sets = [`root_cause = root_cause || ${sqlStr(u.note)}`];
      if (u.concepts_affected) sets.push(`concepts_affected = ${sqlArr(u.concepts_affected)}`);
      return `UPDATE engine_bug_queue SET\n  ${sets.join(',\n  ')}\nWHERE bug_class = ${sqlStr(u.bug_class)}\n` +
             `  AND root_cause NOT LIKE ${sqlStr(`%${u.marker}%`)};\n`;
    }).join('\n');
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-20_seed_engine_bug_queue_lines_and_planes_walk_followups_migration.sql');
  writeFileSync(sqlPath, emitSql(), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${UPDATES.length} annotations)`);
  for (const u of UPDATES) {
    const { data: ex, error: rErr } = await supabaseAdmin
      .from('engine_bug_queue').select('bug_class,root_cause,status,concepts_affected').eq('bug_class', u.bug_class).maybeSingle();
    if (rErr) { console.error(`✗ read ${u.bug_class}: ${rErr.message}`); process.exit(1); }
    if (!ex) { console.error(`✗ expected existing row ${u.bug_class}`); process.exit(1); }
    if ((ex.root_cause ?? '').includes(u.marker)) { console.log(`⏭  ${u.bug_class} — marker present`); continue; }
    const patch: Record<string, unknown> = { root_cause: (ex.root_cause ?? '') + u.note };
    if (u.concepts_affected) patch.concepts_affected = u.concepts_affected;
    const { error } = await supabaseAdmin.from('engine_bug_queue').update(patch).eq('bug_class', u.bug_class);
    if (error) { console.error(`✗ update ${u.bug_class}: ${error.message}`); process.exit(1); }
    console.log(`✓ annotated ${u.bug_class} (status unchanged: ${ex.status}${u.concepts_affected ? ', scope narrowed' : ''})`);
  }
  const { data: open } = await supabaseAdmin.from('engine_bug_queue')
    .select('bug_class').contains('concepts_affected', ['lines_and_planes_in_space']).in('status', ['OPEN', 'DEFERRED']);
  console.log(`\n· ${open?.length ?? 0} row(s) now OPEN/DEFERRED for this concept`);
}
main();
