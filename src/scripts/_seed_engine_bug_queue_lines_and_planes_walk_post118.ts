/**
 * engine_bug_queue — #9 `lines_and_planes_in_space`, the POST-#118 EYE WALK, 2026-08-20.
 *
 * The first walk taken over trustworthy pixels: every observation before PR #118
 * was made against ~0.1px hairlines and is void. THE EYE itself came back 39/40
 * (1 skip, 1 known false positive) — everything below is invisible to it, because
 * it proves that pixels MOVED and that frames REPRODUCE, and has no opinion on
 * whether the picture teaches.
 *
 * Same doctrine as its siblings: marker-gated, SQL generated from the SAME
 * structures the TS applies, and no write downgrades a protected status.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_lines_and_planes_walk_post118.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-20_lines_and_planes_post118_walk';
const J = 'src/data/concepts/mathematics/lines_and_planes_in_space.json';
const SKEL = 'docs/skeletons/lines_and_planes_in_space_skeleton.md';
const R = 'src/lib/renderers/field_3d_renderer.ts';

interface Row {
  bug_class: string; title: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
  owner_cluster: string;
  root_cause: string; prevention_rule: string;
  probe_type: 'js_eval'; probe_logic: string;
  status: 'OPEN'; concepts_affected: string[]; fixed_in_files: string[];
  row_type: 'incident'; fixed_at: null; marker: string;
}

const ROWS: Row[] = [
  {
    bug_class: 'construct_handoff_deletes_the_taught_object_and_its_number_at_the_very_beat_that_names_it',
    title: 'On the aha state, the segment and its readout both vanish for 600ms at the instant the narration says it locks in place',
    severity: 'MAJOR',
    owner_cluster: 'alex:json_author',
    root_cause: 'lines_and_planes_in_space STATE_3 is the concept\'s aha: "Of every segment from a point to a plane, the perpendicular one is shortest." Its sweeping segment cmp carries hide_at_ms 9000; its locked perpendicular perp carries reveal_at_ms 9000 with grow_ms 600. The two are handed off at the same instant, so the white segment is deleted at exactly the frame the green one begins growing FROM ZERO LENGTH. Measured on the post-#118 capture: t=8000 shows the white segment and reads "segment length = 2.339"; t=9000 shows NO SEGMENT AT ALL and an EMPTY HUD; t=10000 shows the green perpendicular and reads "distance = 2.198". The readout half is the same coupling: segment_length dies with cmp at 9000 while point_plane_distance is gated on perp ARRIVING (reveal + 0.9 x grow, about 9540ms), so for roughly half a second the state that exists to show a length falling to its minimum displays neither the thing nor its measure. The narration over that beat is "It bottoms out at the perpendicular, and locks in place" — the picture instead shows it disappear and regrow. Note this is NOT a geometric necessity: the sweep foot has already returned to s = 0 by 9000 (aux_a animates 1.6 -> 0 over 7000-9000), so at the hand-off instant the two segments are the SAME segment, and the honest picture is a recolour in place. The aha mechanic itself is intact and was verified in the same walk — the swept readout reads 2.628 -> 2.301 -> 2.200 at the minimum -> 2.353 rising — so this is a defect in the beat that NAMES the aha, not in the aha.',
    prevention_rule: 'AN OBJECT THAT PERSISTS THROUGH A BEAT IS RECOLOURED, NOT DELETED AND REGROWN. Where one construct hands off to another at the same world position, overlap their windows so the outgoing object survives until the incoming one has ARRIVED — never hide_at_ms equal to the successor\'s reveal_at_ms when the successor also grows. The same applies to the number: a readout that changes label across a hand-off must have its two windows overlap, or the state goes blank at its own climax. Rule 32d continuity is usually read as a cross-STATE rule; it binds just as hard across a beat inside one state.',
    probe_type: 'js_eval',
    probe_logic: 'For every pair (outgoing construct, incoming construct) sharing a world position, assert there is no instant at which neither is drawn: sample the state at 100ms resolution across [hide_at_ms - 200, reveal_at_ms + grow_ms + 200] and assert drawn-ink in the region is never zero, and that the readout panel is never empty on a state that declares value_readouts. Negative control: the shipped STATE_3 must FAIL at t=9000 (zero segment ink, zero readout rows) while an overlapped authoring passes.',
    status: 'OPEN', concepts_affected: ['lines_and_planes_in_space'], fixed_in_files: [],
    row_type: 'incident', fixed_at: null,
    marker: 't=9000 shows NO SEGMENT AT ALL and an EMPTY HUD',
  },
  {
    bug_class: 'readout_introduces_a_symbol_the_scene_never_labels_because_the_gate_treats_the_hud_only_as_a_place_a_symbol_is_satisfied',
    title: 'STATE_2 prints n·v and narrates "a vector", and v is labelled in no state of the concept',
    severity: 'MODERATE',
    owner_cluster: 'alex:json_author',
    root_cause: 'lines_and_planes_in_space STATE_2 renders the HUD row "n·v = 0.254" and narrates "A vector lying in the plane gives zero dot product with the normal." Its two test segments (test_v_inplane, test_v_offplane) carry NO label, and a label inventory across all nine states returns n, a, d, q, d1, d2, d1xd2, a2-a1 and NEVER v. So the symbol that the state\'s whole demonstration turns on is named by a number and by a sentence, and is attached to nothing on screen (Rule 25, no untaught term). This is the SECOND instance of a class already closed on this concept: concept_formula_surface_names_an_object_the_scene_never_labels was filed and FIXED for the anchor a on STATE_1, and the fix drew a, swept nothing else. The reason it survived the closure is worth recording, because it is a flaw in the prevention rule rather than in the fix: that row\'s probe tokenizes "formula_overlay + caption" for symbols and then accepts "a labelled primitive, a HUD row, or a live control caption" as SATISFYING them. It treats the HUD only as a place a symbol can be satisfied and never as a place a symbol can be INTRODUCED — so a symbol that appears ONLY in a readout is invisible to it in both directions. STATE_2\'s formula surface reads n·(r - a) = 0 and contains no v at all.',
    prevention_rule: 'EVERY SURFACE THAT CAN INTRODUCE A SYMBOL IS SCANNED AS A SOURCE, NOT ONLY AS A SINK. Tokenize symbols from the formula surface, the caption, the HUD readout rows AND the narration, then require each one to resolve to a labelled object in that state or an earlier non-hidden one. A readout is a teaching surface: if it is the only place a name appears, the name is untaught. When a symbol-coverage defect is fixed, re-run the inventory over EVERY state and EVERY surface before closing the row — this concept has now produced the same class twice, on two different surfaces, because the first fix swept one symbol on one state.',
    probe_type: 'js_eval',
    probe_logic: 'Build the symbol set per state from formula_overlay + caption + rendered HUD row labels + tts text, restricted to single letters and subscripted math tokens. Build the label set from rendered label sprites, normal_label, line/point labels and visible slider captions. Assert symbols is a subset of labels, allowing symbols first labelled in an earlier state that is visible under the same preset. Negative controls: the pre-fix STATE_1 must FAIL on a; the shipped STATE_2 must FAIL on v; STATE_8 (which labels d1, d2, d1xd2 and a2-a1) must PASS.',
    status: 'OPEN', concepts_affected: ['lines_and_planes_in_space'], fixed_in_files: [],
    row_type: 'incident', fixed_at: null,
    marker: 'and NEVER v',
  },
  {
    bug_class: 'two_angle_arcs_sharing_an_arm_are_drawn_at_one_radius_so_the_pair_reads_as_a_single_continuous_arc',
    title: 'STATE_7 draws its 55° and 35° arcs contiguously at the same apex and radius, so the picture shows one 90° curve and neither angle can be read',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause: 'lines_and_planes_in_space STATE_7 teaches "measure to the normal first, then subtract": the angle to the normal is 55.0 degrees, the angle to the plane is 35.0, and together they always make 90. Both arcs are authored — arc_normal (Lcut to P1.normal) at reveal 9000 grow 1200, arc_plane (Lcut to P1) at reveal 13000 grow 1500 — and both RENDER. The defect is that they are drawn at the SAME apex and the SAME radius and are geometrically adjacent, so they join into one unbroken curve: measured on the post-#118 capture, t=12000 shows a single arc and t=15000 shows THE SAME ARC SIMPLY EXTENDED FURTHER, with a 310px diff whose bbox covers the HUD row and the arc region only. A viewer sees one continuous ~90 degree sweep. The sum the state exists to teach is literally what is drawn, and nothing — no gap, no colour difference, no per-arc label — lets a reader separate the 55 part from the 35 part, so the only place the decomposition exists is the two HUD rows. Two secondary measurements from the same frames: the arc radius is about 208px while the drawn normal arrow is about 180px, so the arc terminates PAST the tip of the arm it measures to; and the arc is correctly centred on the vertex (both endpoints measured 205-212px from the point where line, normal and shadow meet), which corrects an in-flight reading during this walk that it had drifted off its apex — it has not. This supersedes the founder-taste note "STATE_7 two arcs visually indistinguishable at 55/35 degrees": they are not merely similar, they are contiguous and unseparated, which is a legibility defect rather than a taste call.',
    prevention_rule: 'TWO ARCS THAT SHARE AN ARM ARE DRAWN SO A READER CAN TELL THEM APART — distinct radii (a clear step, not a few pixels), distinct colours, or a visible break at the shared arm, and each carrying its own value where the state claims a decomposition. When a state asserts that two quantities SUM to a third, the picture must show the two parts separately; a single mark of the total size is the sum asserted, not shown. And an arc radius is bounded by the drawn length of the shortest arm it spans, so the arc terminates ON its arms rather than past them.',
    probe_type: 'js_eval',
    probe_logic: 'For any state with two or more angle_arcs sharing an arm, assert the drawn arcs are separable: radii differ by at least 15% of the larger, or the stroke colours differ by a measurable delta-E, or there is a visible gap at the shared arm. Additionally assert each arc radius is <= the projected drawn length of its shortest arm. Negative control: the shipped STATE_7 pair must FAIL both the separability and the radius-vs-arm assertions; a re-authored pair at stepped radii must pass.',
    status: 'OPEN', concepts_affected: ['lines_and_planes_in_space'], fixed_in_files: [],
    row_type: 'incident', fixed_at: null,
    marker: 'THE SAME ARC SIMPLY EXTENDED FURTHER',
  },
  {
    bug_class: 'skeleton_pacing_table_drifts_from_the_shipped_json_on_a_state_the_state_table_describes_correctly',
    title: 'The skeleton\'s S5 pacing row states two windows the shipped JSON contradicts, while the same document\'s state table has it right',
    severity: 'MODERATE',
    owner_cluster: 'alex:architect',
    root_cause: 'The skeleton\'s pacing table says of STATE_5: "3800-6000 green common perpendicular grows between the true feet; 6000-13000 camera_steps eases to the S8 pose". The shipped JSON authors common_perpendicular with reveal_at_ms 0 and grow_ms 1800 (fully drawn at 1800, arriving at about 1620 — which is exactly where the CRITICAL counter-timing fix needed the skew_distance number), and camera_steps at_ms 7500 with ease_ms 9000, i.e. 7500-16500. BOTH windows in that one cell are wrong, and the SAME document\'s state table describes the shipped behaviour correctly ("The shortest distance = 1.80 readout is LIVE from t = 0"). So the document contradicts itself and the build, in the direction that matters: a reader of the pacing table believes the rebuttal geometry is withheld until after the misconception marker is removed, when in fact it is fully drawn before the marker ever appears. Recorded alongside the reason the shipped timing is what it is, because it is not an authoring slip: since PR #93 a readout is gated on its subject having ARRIVED, so the only way to have the number live early is to reveal the geometry early. The two are coupled by the mechanism, and any future attempt to "restore" the pacing table\'s ordering would silently move the number back off the misconception beat and re-open the CRITICAL row that fix closed. This is the FOURTH instance of restated-value drift found in this document and the second distinct figure, after the 25-degree rotation cells.',
    prevention_rule: 'A PACING TABLE IS GENERATED FROM THE SHIPPED JSON OR IT IS CHECKED AGAINST IT — never maintained by hand alongside it. Where a design document restates a timing the build owns, the restatement is asserted equal to the authored value by a gate, and any hand edit to the build re-runs that assertion. And when a timing is set by a MECHANISM constraint rather than by taste (here: a readout cannot precede its subject\'s arrival), the document records the constraint next to the number, so the next reader cannot "correct" the build back into a closed defect.',
    probe_type: 'js_eval',
    probe_logic: 'Parse every reveal/hide/grow/camera window quoted in the skeleton pacing table and assert each equals the corresponding field in the shipped concept JSON. Negative controls: the shipped S5 row must FAIL on both the common-perpendicular window (doc 3800-6000 vs authored 0 + 1800) and the camera window (doc 6000-13000 vs authored 7500 + 9000); the S6 row, corrected in fab6235, must PASS.',
    status: 'OPEN', concepts_affected: ['lines_and_planes_in_space'], fixed_in_files: [],
    row_type: 'incident', fixed_at: null,
    marker: 'BOTH windows in that one cell are wrong',
  },
];

const UPDATES = [
  {
    bug_class: 'label_separation_is_a_function_of_the_authored_camera_and_no_gate_recomputes_it_when_the_camera_moves',
    marker: 'SECOND INSTANCE MEASURED 2026-08-20 on STATE_8',
    note: ' SECOND INSTANCE MEASURED 2026-08-20 on STATE_8, by the post-#118 walk, and it is exactly what this row predicted. STATE_4 was the reported state and was fixed by a camera nudge; nobody re-checked the others. Measured from the frozen frames by clustering near-white glyph columns (saturation < 40, luminance > 110, so a coloured line can never be counted as text): STATE_8 renders the label d1xd2 across x[606,631] and the label a2-a1 across x[639,666], on a SHARED BASELINE, a box gap of 8px — below the 12px floor this row\'s probe specifies and below the same floor the pre-existing VISUAL_TEXT_OVERLAP row states as its DO. The fixed STATE_4 pair measures 20px by the same method at the same threshold, so the method separates pass from fail. This does not change the row\'s status or its remedy — it widens the evidence: the defect is not one bad camera on one state, it is that label separation is unchecked everywhere, and a per-state camera fix leaves every unexamined state at whatever gap it happens to have.',
  },
  {
    bug_class: 'a_fix_round_closes_the_reported_instances_of_a_restated_value_and_never_sweeps_the_document_for_the_rest',
    marker: 'SCOPE NOTE 2026-08-20',
    note: ' SCOPE NOTE 2026-08-20 — this row\'s FIXED status covers the 25-degree rotation figure ONLY, and the sweep quoted in it was run for that figure alone. The post-#118 walk then found a DIFFERENT figure drifted in the same pacing table: the S5 row states a common-perpendicular window of 3800-6000 and a camera window of 6000-13000, while the shipped JSON authors 0 + 1800 and 7500 + 9000 respectively. Tracked separately as skeleton_pacing_table_drifts_from_the_shipped_json_on_a_state_the_state_table_describes_correctly. Recorded here rather than by reopening, because the distinction is the lesson this row exists to carry: a sweep bounded to one figure closes one figure, and quoting a hit count for that figure is not evidence about the document. The generalisation the new row proposes — generate or gate the pacing table against the build — is what actually closes the class.',
  },
];

const PROTECTED = ['FIXED', 'FALSE_POSITIVE'];
function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length ? `ARRAY[${a.map(sqlStr).join(', ')}]::text[]` : `ARRAY[]::text[]`; }

function emitSql(): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type, fixed_at';
  const ins = ROWS.map((r) =>
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n` +
    `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(SESSION)}, ` +
    `${sqlStr(r.row_type)}, NULL)\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  root_cause = EXCLUDED.root_cause, prevention_rule = EXCLUDED.prevention_rule,\n` +
    `  probe_logic = EXCLUDED.probe_logic, status = EXCLUDED.status,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected\n` +
    `WHERE engine_bug_queue.root_cause NOT LIKE ${sqlStr(`%${r.marker}%`)}\n` +
    `  AND engine_bug_queue.status NOT IN ('FIXED', 'FALSE_POSITIVE');\n`).join('\n');
  const upd = UPDATES.map((u) =>
    `UPDATE engine_bug_queue SET\n  root_cause = root_cause || ${sqlStr(u.note)}\n` +
    `WHERE bug_class = ${sqlStr(u.bug_class)}\n  AND root_cause NOT LIKE ${sqlStr(`%${u.marker}%`)};\n`).join('\n');
  return `-- 2026-08-20 — lines_and_planes_in_space, the POST-#118 EYE WALK: ${ROWS.length} new rows,\n` +
    `-- all OPEN and none fixed, + ${UPDATES.length} marker-gated annotations on existing rows.\n` +
    `-- The first walk taken over trustworthy pixels (every observation before PR #118 was made\n` +
    `-- against ~0.1px hairlines). THE EYE returned 39/40 on the same capture: none of these is\n` +
    `-- visible to it, because it proves pixels MOVED and frames REPRODUCE, not that the picture teaches.\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_lines_and_planes_walk_post118.ts from the SAME\n` +
    `-- structures the TS path applies. Idempotent, order-independent, never a downgrade.\n\n` + ins + '\n' + upd;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-20_seed_engine_bug_queue_lines_and_planes_walk_post118_migration.sql');
  writeFileSync(sqlPath, emitSql(), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${ROWS.length} inserts + ${UPDATES.length} updates)`);

  for (const r of ROWS) {
    const { marker, ...row } = r;
    const { data: ex, error: rErr } = await supabaseAdmin
      .from('engine_bug_queue').select('bug_class,root_cause,status').eq('bug_class', row.bug_class).maybeSingle();
    if (rErr) { console.error(`✗ read ${row.bug_class}: ${rErr.message}`); process.exit(1); }
    if (ex?.root_cause?.includes(marker)) { console.log(`⏭  ${row.bug_class} — marker present`); continue; }
    if (ex && PROTECTED.includes(ex.status)) {
      console.log(`⏭  ${row.bug_class} — live status ${ex.status}; REFUSING to downgrade to OPEN`); continue;
    }
    const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(row, { onConflict: 'bug_class' });
    if (error) { console.error(`✗ upsert ${row.bug_class}: ${error.message}`); process.exit(1); }
    console.log(`✓ filed ${row.bug_class} (${row.severity}/${row.status})`);
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
