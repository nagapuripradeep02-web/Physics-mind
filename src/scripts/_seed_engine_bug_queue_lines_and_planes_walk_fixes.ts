/**
 * engine_bug_queue — #9 `lines_and_planes_in_space`, the WALK FIX ROUND, 2026-08-20.
 * Closes the four defects the post-#118 eye-walk found, all four fixed by AUTHORING
 * (no engine change, so no Rule-40 dispatch): the segment/arc/label surfaces the vg
 * scenario already exposes were sufficient in every case.
 *
 * Marker-gated, SQL generated from the SAME structures the TS applies, never a downgrade.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_lines_and_planes_walk_fixes.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const FIXED_AT = '2026-08-20T16:50:00.000Z';
const J = 'src/data/concepts/mathematics/lines_and_planes_in_space.json';
const SKEL = 'docs/skeletons/lines_and_planes_in_space_skeleton.md';

interface Update { bug_class: string; marker: string; note: string; status?: 'FIXED'; fixed_at?: string; fixed_in_files?: string[]; }

const UPDATES: Update[] = [
  {
    bug_class: 'construct_handoff_deletes_the_taught_object_and_its_number_at_the_very_beat_that_names_it',
    marker: 'CLOSED 2026-08-20 — the aha state recolours in place',
    status: 'FIXED', fixed_at: FIXED_AT, fixed_in_files: [J, SKEL],
    note: ' CLOSED 2026-08-20 — the aha state recolours in place. perp now reveals at 8950 with grow_ms 0, so it is FULL 50ms before cmp hides at 9000 and the two windows overlap instead of meeting at a point. Verified from a fresh capture, the same three frames that found it: t=8000 white segment + "segment length = 2.339"; t=9000 GREEN segment at full length WITH its right-angle mark + "distance = 2.198"; t=10000 unchanged. The blank frame and the empty HUD are both gone, and the swap now reads as the segment locking rather than vanishing and regrowing. grow_ms 0 is deliberate: vgRevealFrac short-circuits (if g <= 0 return 1), so the lock is instantaneous, which is what "locks in place" describes — a grow would have required the green to be drawn coincident with the white for its whole duration. THE SWEEP THIS ROW IMPLIES WAS RUN, and it is the reason to keep the row rather than treat it as one bad cell: 5 hide/reveal collisions exist across the 9 states, of which 2 were real hand-offs of ONE object (this one, and STATE_2 test_v_inplane -> test_v_offplane at 11200, fixed the same way at 11150 + grow_ms 0) and 3 were STATE_4 Lpar/arc_par/X_par -> Lcut at 9500, which are NOT instances: those are two different lines at different positions with a deliberately disjoint window, already recorded in the re-audit. A collision is only a defect when the same object is being handed over.',
  },
  {
    bug_class: 'readout_introduces_a_symbol_the_scene_never_labels_because_the_gate_treats_the_hud_only_as_a_place_a_symbol_is_satisfied',
    marker: 'CLOSED 2026-08-20 — v is drawn',
    status: 'FIXED', fixed_at: FIXED_AT, fixed_in_files: [J],
    note: ' CLOSED 2026-08-20 — v is drawn. Both STATE_2 test segments now author label "v" (the vg segment path already carried label: o.label || null, so this needed no engine change), and the label renders: verified on the fresh capture at t=13000, "v" sitting on the white test vector as it tips out of the plane. Labels on STATE_2 are now n, d, v = 3, inside the concept\'s authored max_labels_per_state of 4. Note the scene_composition primitive already carried a descriptive label ("test vector (tipped out)") — that is the primitive inventory, NOT a rendered sprite, and its presence is exactly why the gap read as covered: the symbol looked labelled in the JSON and was unlabelled on screen. The probe this row proposes should read the RENDERED label set, never the authored primitive list.',
  },
  {
    bug_class: 'two_angle_arcs_sharing_an_arm_are_drawn_at_one_radius_so_the_pair_reads_as_a_single_continuous_arc',
    marker: 'CLOSED 2026-08-20 — the radii are stepped',
    status: 'FIXED', fixed_at: FIXED_AT, fixed_in_files: [J, SKEL],
    note: ' CLOSED 2026-08-20 — the radii are stepped. arc_normal now authors radius 0.62 and arc_plane 0.95 (the vg arc path already read o.radius with a 0.9 default, so no engine change). The 53% step is well above the 15% this row\'s probe asks for, and 0.62 also puts the inner arc INSIDE the drawn normal arm, which the old shared 0.9 overran (~208px arc against a ~180px arm). Verified on the fresh capture at the authored pin (eye_capture_ms 16000): two clearly nested arcs with visible dark between them, where the pre-fix frame showed one unbroken curve — and at t=12000, before arc_plane reveals, only the inner arc is present, so the two are now separable in TIME as well as in radius. The state\'s claim that 55 and 35 make 90 is now shown in the picture rather than asserted by two HUD rows alone.',
  },
  {
    bug_class: 'skeleton_pacing_table_drifts_from_the_shipped_json_on_a_state_the_state_table_describes_correctly',
    marker: 'CLOSED 2026-08-20 — and the sweep found FIVE drifted rows, not one',
    status: 'FIXED', fixed_at: FIXED_AT, fixed_in_files: [SKEL],
    note: ' CLOSED 2026-08-20 — and the sweep found FIVE drifted rows, not one, which is the finding that matters. Every pacing cell was compared against the authored windows extracted from the shipped JSON, and S2, S3, S5, S7 and S8 all disagreed with the build; S1, S4, S6 and S9 were correct, and the CAPTURE column was correct on all nine (eye_capture_ms IS authored, in epic_l_path.states rather than in the vg block — an earlier extraction that looked only in vg wrongly read it as absent everywhere, corrected here so the next reader does not re-derive the same false alarm). Corrections applied: S2 described a breathing patch that is not authored and omitted the n·v demonstration entirely, which is the state\'s whole lesson; S3 now records the 8950 instant lock; S5 records the common perpendicular at 0 + 1800 and the camera at 7500 + 16500; S7 records 9000-10200 and 13000-14500 with the new stepped radii; S8 records the cross product building 2000-4000 rather than 2000-7000. The S5 cell also now carries the COUPLING as a standing warning, because that number is not a taste choice: since PR #93 a readout waits for its subject to ARRIVE, so skew_distance can only be live at ~1620 if the geometry reveals at 0, and anyone "restoring" the documented 3800-6000 ordering would silently move the number off the misconception beat and re-open the CRITICAL row that fix closed.',
  },
];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length ? `ARRAY[${a.map(sqlStr).join(', ')}]::text[]` : `ARRAY[]::text[]`; }
function emitSql(): string {
  return `-- 2026-08-20 — lines_and_planes_in_space WALK FIX ROUND: ${UPDATES.length} closes, all fixed by\n` +
    `-- AUTHORING (no engine change; the vg segment/arc surfaces already carried label and radius).\n` +
    `-- Marker-gated: a row already carrying its close note is never rewritten.\n\n` +
    UPDATES.map((u) => {
      const sets = [`status = ${sqlStr(u.status!)}`, `fixed_at = ${sqlStr(u.fixed_at!)}`,
        `fixed_in_files = ${sqlArr(u.fixed_in_files!)}`, `root_cause = root_cause || ${sqlStr(u.note)}`];
      return `UPDATE engine_bug_queue SET\n  ${sets.join(',\n  ')}\nWHERE bug_class = ${sqlStr(u.bug_class)}\n` +
             `  AND root_cause NOT LIKE ${sqlStr(`%${u.marker}%`)};\n`;
    }).join('\n');
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-20_seed_engine_bug_queue_lines_and_planes_walk_fixes_migration.sql');
  writeFileSync(sqlPath, emitSql(), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${UPDATES.length} closes)`);
  for (const u of UPDATES) {
    const { data: ex, error: rErr } = await supabaseAdmin
      .from('engine_bug_queue').select('bug_class,root_cause,status').eq('bug_class', u.bug_class).maybeSingle();
    if (rErr) { console.error(`✗ read ${u.bug_class}: ${rErr.message}`); process.exit(1); }
    if (!ex) { console.error(`✗ expected existing row ${u.bug_class} — refusing to create as a side effect.`); process.exit(1); }
    if ((ex.root_cause ?? '').includes(u.marker)) { console.log(`⏭  ${u.bug_class} — marker present`); continue; }
    const { error } = await supabaseAdmin.from('engine_bug_queue').update({
      status: u.status, fixed_at: u.fixed_at, fixed_in_files: u.fixed_in_files,
      root_cause: (ex.root_cause ?? '') + u.note,
    }).eq('bug_class', u.bug_class);
    if (error) { console.error(`✗ update ${u.bug_class}: ${error.message}`); process.exit(1); }
    console.log(`✓ ${u.bug_class} → FIXED`);
  }
  const { data: open } = await supabaseAdmin.from('engine_bug_queue')
    .select('bug_class').contains('concepts_affected', ['lines_and_planes_in_space']).in('status', ['OPEN', 'DEFERRED']);
  console.log(`\n· ${open?.length ?? 0} row(s) now OPEN/DEFERRED for this concept`);
}
main();
