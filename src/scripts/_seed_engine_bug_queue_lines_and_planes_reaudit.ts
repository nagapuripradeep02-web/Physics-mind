/**
 * engine_bug_queue — #9 `lines_and_planes_in_space` RE-AUDIT ROUND, 2026-08-10.
 * The closing writes: the four rows the merged engine mechanisms + their
 * authoring follow-ups discharged, the D5 false positive backed by measurement
 * rather than assertion, and the two defects the re-audit surfaced that BOTH
 * audits had previously missed.
 *
 * Same doctrine as its siblings: marker-gated (a row already carrying its note
 * is never touched), SQL generated from the SAME structures the TS applies, no
 * write downgrades a protected status, migration committed in the same change.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_lines_and_planes_reaudit.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const FIXED_AT = '2026-08-10T16:20:00.000Z';
const J = 'src/data/concepts/mathematics/lines_and_planes_in_space.json';
const SKEL = 'docs/skeletons/lines_and_planes_in_space_skeleton.md';
const R = 'src/lib/renderers/field_3d_renderer.ts';
const GATE = 'src/scripts/check_vector_geometry_3d.ts';

interface Update {
  bug_class: string; marker: string; note: string;
  status?: 'FIXED'; fixed_at?: string; fixed_in_files?: string[];
}

const UPDATES: Update[] = [
  {
    bug_class: 'vg_explore_animate_windows_are_finite_so_the_free_running_sandbox_freezes',
    marker: 'CLOSED 2026-08-10 — byte-identical',
    status: 'FIXED', fixed_at: FIXED_AT, fixed_in_files: [R, GATE, J, 'src/lib/validators/visual/deriveStateMeta.ts'],
    note: ' CLOSED 2026-08-10 — byte-identical proof, not an approximation. PR #113 shipped the mechanism (authored animate_loop_ms; the wrap lives inside vgAnimValue so reveal/ghost/camera chains structurally cannot loop; first-cycle pin + D7 refuses reveal_hold on a looping state) and STATE_9 then authored it: the eight hand-unrolled windows collapsed to ONE closed ping-pong cycle (0→9000 λ −3.5→3.5, 9000→18000 back) with animate_loop_ms 18000 = the last window end. quality_auditor measured the shipped capture: frame t=1000 vs t=19000 is BYTE-IDENTICAL (ImageChops bbox None) and the 21-frame dense series is a clean palindrome about t=9000, while every adjacent pair changes 525–667 px. The sandbox no longer expires at 72 s; it never expires.',
  },
  {
    bug_class: 'vg_explore_controls_are_not_group_aware_so_half_the_sliders_are_inert',
    marker: 'CLOSED 2026-08-10 — group A shows exactly',
    status: 'FIXED', fixed_at: FIXED_AT, fixed_in_files: [R, GATE, J],
    note: ' CLOSED 2026-08-10 — group A shows exactly its four live rows plus the view picker, pixel-verified. PR #114 shipped authored group_controls (flat controls as fallback, byte-identical for every shipped state; the row-visibility pass extracted and re-run on the picker path only, never the full apply, so drag-seize flags and per-state ranges survive; scene_group deliberately unpartitionable). STATE_9 then authored { A: [lambda, lambda_span, half_extent, q_height], B: [theta_deg, line2_offset] } — a total, non-overlapping partition derived from which objects each group actually holds. Gate §28(h) asserts both directions (no live knob omitted, no dead knob shown) and PASSES. The filed inertness counts were corrected in the same round: A = 2 inert, B = 4 — this row had them swapped.',
  },
  {
    bug_class: 'vg_lp_angle_arc_apex_rides_its_own_lines_offset_away_from_the_reference_it_measures_against',
    marker: 'SCOPE CORRECTED 2026-08-10',
    note: ' SCOPE CORRECTED 2026-08-10 — the STATE_6 half of this class is CLOSED BY CONSTRUCTION and should not be re-reported there. Measured through the shipped offset/rotate semantics at four instants across STATE_6\'s authored timeline (t = 1000 / 8000 / 13000 / 19000, i.e. through the whole θ ramp to its 115° endpoint): the perpendicular distance from the arc apex to BOTH arms is 0.000000 at every one. The reason is structural: each line\'s offset.along is PARALLEL to its own dir, so sliding an anchor never moves the line as a set; only a ROTATION WHILE DISPLACED detaches it, and the authored timeline now returns aux_a to 0 before the θ ramp begins. A reviewer reported the arc "clearly missing the crossing" at θ=115° from the same frames — that reads the arc\'s ENDPOINTS (which lie on the two arms at radius 0.9, and project to unequal screen lengths under perspective) as if they were its VERTEX. The row remains OPEN for its OTHER concept-state (STATE_7, where the apex is anchored to one arm whose anchor is free to move) and for the sibling residue tracked on vg_offset_animate_ends_off_zero_… (a teacher DRAG of θ during [0, 8000), where aux_a is still un-seizable).',
  },
  {
    bug_class: 'visual_eyes_d5_ink_relative_lens_is_diluted_by_static_chrome_on_explore_states',
    marker: 'MEASURED 2026-08-10',
    note: ' MEASURED 2026-08-10 — the false positive now carries numbers instead of an assertion, on a THIRD independent capture. D5\'s own evidence string reads "pixels never move: max adjacent diff 0.04% of canvas" for STATE_9, while a direct pixel diff of the same dense series measures 525–667 CHANGED PIXELS on EVERY adjacent pair, with bounding boxes spanning x ∈ [47, 746] — the λ marker crossing the canvas and the λ slider row tracking it. The ink denominator is dominated by the always-on slider panel, scene-group picker and HUD, exactly as this row describes. Three separate walks have now had to re-confirm this by hand; the fix (measure within the canvas viewport, or subtract the static regions) is what stops a correct state from failing a gate a fourth time.',
  },
];

/** The two defects the re-audit surfaced — both pre-existing, both missed by the previous audit. */
const NEW_ROWS = [
  {
    bug_class: 'concept_formula_surface_names_an_object_the_scene_never_labels',
    title: 'Every state\'s formula surface named the anchor point a, and no state labelled it — on the state whose whole idea is "one point plus one direction"',
    severity: 'MODERATE' as const,
    owner_cluster: 'alex:json_author' as const,
    root_cause: 'lines_and_planes_in_space STATE_1 renders the formula surface r = a + λd and teaches "a line is one point and one direction"; STATE_3 renders D = |n·(q−a)| ⁄ ‖n‖ and STATE_9 r = a + λd again. The point a was authored in NO state: a label inventory across all nine states returns d / d₁ / d₂ / n / q / d₁×d₂ / a₂−a₁ and never a, and STATE_1 authored no points[] at all — its only dot was the unlabelled λ marker. So the state that introduces the anchor showed a line, a direction label, and a formula naming a quantity that is nowhere on screen (Rule 25: no untaught term, explanation co-located with its visual). The concept skeleton\'s own Definition of Done listed the row "the point on a line | a | sprite label + HUD row" under the sentence "No claim in this concept rests on a sprite alone" — the DoD row was written and never satisfied, and TWO prior audits passed over it because every gate checks that authored objects RENDER, not that RENDERED SYMBOLS have objects. Fixed by authoring the anchor as a labelled point revealed at 1200 ms, before the line grows out of it at 2000 ms (Rule 32a, cause before effect). Deliberately NOT added to STATE_9, whose scene_composition is already at the concept\'s authored max_primitives_per_state of 6 and where the term is no longer new.',
    prevention_rule: 'EVERY SYMBOL ON A FORMULA SURFACE IS AN OBJECT ON SCREEN, OR IT IS AN UNTAUGHT TERM. Author the check in the direction gates do not: parse the state\'s rendered formula/caption strings, and for each symbol assert a labelled primitive, a HUD row, or a live control caption carries that name in the SAME state. The reverse direction (every authored object renders) is what existing gates check, and it is blind to this class — the symbol that names nothing is invisible to it. When a Definition-of-Done row names a surface ("sprite label + HUD row"), verify the surface EXISTS at audit time rather than the row being present in the document.',
    probe_type: 'js_eval' as const,
    probe_logic: 'For each state: tokenize formula_overlay + caption for single-letter and subscripted symbols (a, d, d₁, n, q, λ, D); resolve the shipped scene and collect every rendered label sprite, HUD token label and visible slider-row caption; assert every formula symbol appears in that set, allowing symbols introduced in an EARLIER non-hidden state under each preset. Negative control: the pre-fix STATE_1 must FAIL on a, while d and n pass.',
    status: 'FIXED' as const,
    concepts_affected: ['lines_and_planes_in_space'],
    fixed_in_files: [J],
    discovered_in_session: 'session_2026-08-10_lines_and_planes_reaudit',
    row_type: 'incident' as const,
    fixed_at: FIXED_AT,
    marker: 'a label inventory across all nine states returns',
  },
  {
    bug_class: 'ring_cut_leaves_a_terminal_state_promising_the_state_its_preset_hides',
    title: 'Both reduced presets ended on a sentence setting up a state that preset removes, and the skeleton\'s remedy was unauthorable',
    severity: 'MODERATE' as const,
    owner_cluster: 'alex:architect' as const,
    root_cause: 'Rule 38a requires that hiding a depth ring leave a COHERENT lesson. lines_and_planes_in_space passed the object/notation half of that check and failed the NARRATION half: under preset core_only (S7+S8 hidden) STATE_6 is terminal and its closing sentence read "That worked because each line has a direction. A plane has no single direction, only a normal." — a setup for the hidden S7; under no_advanced (S8 hidden) STATE_7 is terminal and its closing sentence read "A plane gives a normal. Skew lines give none, so the gap comes from two directions." — an explicit announcement of the hidden S8. The skeleton HAD anticipated this and authored per-preset "RING-CUT ALTERNATE" hand-off sentences for both states — but that remedy CANNOT SHIP: presets carry only hidden_states, and tts_sentences have no preset condition, so there is no authoring surface for a per-preset sentence. The design named the right problem and specified an unimplementable fix, which then reached the concept as no fix at all. Fixed by making the single authored closing sentence CUT-SAFE in both directions (each now summarises what its own state proved and promises nothing later); the unauthorable alternate design is recorded as superseded in the skeleton rather than deleted.',
    prevention_rule: 'THE RING-CUT CHECK IS RUN ON THE NARRATION, NOT ONLY ON THE OBJECTS. For every preset, read the LAST surviving state\'s final sentence and assert it neither names nor sets up anything the preset hides — a lesson that ends on a promise it will not keep is incoherent even when every rendered object is in-ring. And a remedy written into a design document is only real if an authoring surface can express it: before recording a per-preset behaviour as the fix, verify the schema can carry it, or the document ships a fix that exists nowhere.',
    probe_type: 'js_eval' as const,
    probe_logic: 'For each preset, compute the surviving state order, take the final state\'s last tts sentence, and assert it contains no term whose first introduction is in a hidden state (reuse the ring-coherence symbol map). Negative controls: the pre-fix s6_4 must FAIL under core_only and the pre-fix s7_5 under no_advanced. Separately, assert every remedy a skeleton records as authored maps to a real schema field.',
    status: 'FIXED' as const,
    concepts_affected: ['lines_and_planes_in_space'],
    fixed_in_files: [J, SKEL],
    discovered_in_session: 'session_2026-08-10_lines_and_planes_reaudit',
    row_type: 'incident' as const,
    fixed_at: FIXED_AT,
    marker: 'the skeleton HAD anticipated this and authored per-preset',
  },
];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length ? `ARRAY[${a.map(sqlStr).join(', ')}]::text[]` : `ARRAY[]::text[]`; }

function emitSql(): string {
  const upd = UPDATES.map((u) => {
    const sets: string[] = [];
    if (u.status) sets.push(`status = ${sqlStr(u.status)}`);
    if (u.fixed_at) sets.push(`fixed_at = ${sqlStr(u.fixed_at)}`);
    if (u.fixed_in_files) sets.push(`fixed_in_files = ${sqlArr(u.fixed_in_files)}`);
    sets.push(`root_cause = root_cause || ${sqlStr(u.note)}`);
    return `UPDATE engine_bug_queue SET\n  ${sets.join(',\n  ')}\nWHERE bug_class = ${sqlStr(u.bug_class)}\n  AND root_cause NOT LIKE ${sqlStr(`%${u.marker}%`)};\n`;
  }).join('\n');
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type, fixed_at';
  const ins = NEW_ROWS.map((n) =>
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n` +
    `(${sqlStr(n.bug_class)}, ${sqlStr(n.title)}, ${sqlStr(n.severity)}, ${sqlStr(n.owner_cluster)}, ` +
    `${sqlStr(n.root_cause)}, ${sqlStr(n.prevention_rule)}, ${sqlStr(n.probe_type)}, ${sqlStr(n.probe_logic)}, ` +
    `${sqlStr(n.status)}, ${sqlArr(n.concepts_affected)}, ${sqlArr(n.fixed_in_files)}, ${sqlStr(n.discovered_in_session)}, ` +
    `${sqlStr(n.row_type)}, ${sqlStr(n.fixed_at)})\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  root_cause = EXCLUDED.root_cause, prevention_rule = EXCLUDED.prevention_rule,\n` +
    `  probe_logic = EXCLUDED.probe_logic, status = EXCLUDED.status,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files,\n` +
    `  fixed_at = EXCLUDED.fixed_at\n` +
    `WHERE engine_bug_queue.root_cause NOT LIKE ${sqlStr(`%${n.marker}%`)};\n`).join('\n');
  return `-- 2026-08-10 — lines_and_planes_in_space RE-AUDIT ROUND: ${UPDATES.length} marker-gated updates\n` +
    `-- (2 closes, 2 scope/measurement annotations) + ${NEW_ROWS.length} new rows, both FIXED in the same session.\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_lines_and_planes_reaudit.ts from the SAME\n` +
    `-- structures the TS path applies. Idempotent, order-independent, never a downgrade.\n\n` +
    upd + '\n' + ins;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-10_seed_engine_bug_queue_lines_and_planes_reaudit_migration.sql');
  writeFileSync(sqlPath, emitSql(), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${UPDATES.length} updates + ${NEW_ROWS.length} inserts)`);

  for (const u of UPDATES) {
    const { data: ex, error: rErr } = await supabaseAdmin
      .from('engine_bug_queue').select('bug_class,root_cause,status')
      .eq('bug_class', u.bug_class).maybeSingle();
    if (rErr) { console.error(`✗ read ${u.bug_class}: ${rErr.message}`); process.exit(1); }
    if (!ex) { console.error(`✗ expected existing row ${u.bug_class} — refusing to create as a side effect.`); process.exit(1); }
    if ((ex.root_cause ?? '').includes(u.marker)) { console.log(`⏭  ${u.bug_class} — marker present`); continue; }
    const patch: Record<string, unknown> = { root_cause: (ex.root_cause ?? '') + u.note };
    if (u.status) patch.status = u.status;
    if (u.fixed_at) patch.fixed_at = u.fixed_at;
    if (u.fixed_in_files) patch.fixed_in_files = u.fixed_in_files;
    const { error } = await supabaseAdmin.from('engine_bug_queue').update(patch).eq('bug_class', u.bug_class);
    if (error) { console.error(`✗ update ${u.bug_class}: ${error.message}`); process.exit(1); }
    console.log(`✓ ${u.bug_class} → ${u.status ?? ex.status}`);
  }

  for (const n of NEW_ROWS) {
    const { marker, ...row } = n;
    const { data: ex, error: rErr } = await supabaseAdmin
      .from('engine_bug_queue').select('bug_class,root_cause').eq('bug_class', row.bug_class).maybeSingle();
    if (rErr) { console.error(`✗ read ${row.bug_class}: ${rErr.message}`); process.exit(1); }
    if (ex?.root_cause?.includes(marker)) { console.log(`⏭  ${row.bug_class} — marker present`); continue; }
    const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(row, { onConflict: 'bug_class' });
    if (error) { console.error(`✗ upsert ${row.bug_class}: ${error.message}`); process.exit(1); }
    console.log(`✓ filed ${row.bug_class} (${row.status})`);
  }

  const { data: open } = await supabaseAdmin.from('engine_bug_queue')
    .select('bug_class').contains('concepts_affected', ['lines_and_planes_in_space']).in('status', ['OPEN', 'DEFERRED']);
  console.log(`\n· ${open?.length ?? 0} row(s) still OPEN/DEFERRED for this concept`);
}

main();
