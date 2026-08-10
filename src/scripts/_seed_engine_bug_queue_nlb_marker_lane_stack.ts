/**
 * engine_bug_queue: CLOSE
 *   checkpoint_marker_labels_collide_when_two_checkpoints_sit_near_in_world_space
 *
 * Filed OPEN by eye-walker on the Ch.6 concept #5 review chain (2026-08-07), re-confirmed
 * twice on the same build, routed BLOCKING by founder-proxy Checkpoint B. The row was
 * originally owned alex:json_author; the root cause is entirely engine-side (a missing
 * obstacle-set pass on the marker lane), so this upsert re-owns it to
 * peter_parker:field3d_surgeon. The bug_class string is UNCHANGED — upsert, not a duplicate.
 *
 * The engine-side sibling candidate
 *   nlb_two_close_checkpoint_labels_overprint_because_sprites_are_not_in_each_others_obstacle_set
 * is the SAME defect filed from the other side and exists nowhere in engine_bug_queue.
 * It is deliberately NOT minted: this row is the survivor and now carries the engine
 * root cause in its own body.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_nlb_marker_lane_stack.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'ch6-concept-5 field3d_surgeon marker-lane stack 2026-08-07';

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
    bug_class: 'checkpoint_marker_labels_collide_when_two_checkpoints_sit_near_in_world_space',
    title:
      'Two checkpoint captions 0.2 m apart rendered ~90% overprinted at the same height ("back at the flag start"), both unreadable, baked into the frozen frame of the PRIMARY aha state while THE EYE scored 23/23',
    severity: 'CRITICAL',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'FIXED 2026-08-07 in the newtons_laws_body engine. Marker captions (the 3 checkpoint flags + the predicted-stop and ghost markers) were placed by ONE funnel, nlbMkPlace, at a single hardcoded surface-local height NLB_MK_H + 0.30, with x = the authored metre. They were in NO obstacle set: nlbDodgeBodyLabels/nlbStackBodyLabels iterate nlb.bodies only, so a marker caption was never tested against a body billboard and — the defect — never against ANOTHER MARKER CAPTION. Two checkpoints 0.2 m apart put their posts 0.10 world units apart (NLB_WORLD_PER_M = 0.5) while the two auto-width sprites measured roughly 1.4 and 0.9 world units of ink, i.e. about 90% overlap, and BOTH strings became unreadable. The authored spacing is not negotiable: on conservative_vs_nonconservative_forces STATE_2 the near flag is the whole teaching beat of that state (same spot, friction -2.5 J outbound vs -24.8 J on the return, 9.9x), so moving it is a content regression, not a fix. The state that read cleanly (STATE_4, flags 0.6 m apart) was doing so INCIDENTALLY, not via any resolution pass: its surface is tilted 30 deg, so the longer along-track spacing alone lifted the upper caption about 0.15 world units. Flatten the ramp or shorten the spacing and STATE_4 collides identically — measured, its ink rects were already overlapping about 15 px horizontally with only about 10 px of vertical offset against an ~11 px ink height, i.e. inside the clearance band. THE EYE could not see any of it: it scored the defective frame 23/23, because every deterministic gate asks whether an element EXISTS, is VISIBLE and has the right TEXT, and both captions passed all three while sitting on top of each other.',
    prevention_rule:
      'Every caption that shares a placement lane is in the obstacle set of EVERY other lane member, and the lane owns a resolution pass. Concretely, for the marker lane (nlbStackMarkerLabels): (a) sideways is not available — a caption that leaves its post stops naming it — so a colliding caption is LIFTED along the surface normal, straight up its own post, by the amount the MEASURED ink rects actually need (never a hardcoded offset; auto-width sprites change width with their text); (b) the clearance test runs in CAMERA axes (right/up), not raw world x/y, because these captions live in a ROTATED surface frame — at theta = 30 deg a raw x test reads 0.87 of the separation the labels actually have on screen and at steep theta it under-reports the overlap and leaves the collision half-fixed; (c) the lift is divided by how much of the lift direction points at camera-up, so the ACHIEVED screen separation is the ink height that was asked for on a flat track and a steep one alike; (d) home lane reset FIRST, every frame, so no lift can accumulate (Rule 36) and a frozen pin is byte-stable; (e) the lift eases out over NLB_LABEL_EASE of extra separation so a caption riding a live prediction marker never jumps as it separates (Rule 32b). A lane member placed on a DIFFERENT lane (marker_h_ref, parked at the height of the level line itself out at the track end) is explicitly excluded from the reset, or the pass moves a caption that is not colliding. Corollary observed while fixing and NOT covered by this row: marker captions are still absent from the obstacle set of the BODY captions (nlbDodgeBodyLabels walks nlb.bodies), so a flag caption and a block billboard can still meet — on STATE_2 they are now adjacent-but-clear, which is luck, not a guarantee.',
    probe_type: 'js_eval',
    probe_logic:
      'THE EYE is structurally blind here (23/23 on the defect) because presence + visibility + text all pass while two strings overprint. The gate has to assert a SCREEN-RECT fact, and it cannot derive it from the concept JSON: sprite width is a live function of the caption text, the captions sit in a rotated frame, and the sprites live inside a renderer closure. So the engine now PUBLISHES it: window.PM_nlbMarkers.label_rects is, for every VISIBLE marker caption, its projected ink rect in px {id, text, x0, x1, y0, y1} (nlbMarkerLabelRects, same nlbProjPx/nlbSpriteRectPx machinery the body-label dodge uses). ASSERT, on every state of every newtons_laws_body concept, at the frozen pin: for each unordered pair (A, B) in label_rects, the intersection area of A and B is 0 — no tolerance, these are text rects on a dark canvas. Measured on conservative_vs_nonconservative_forces 2026-08-07: STATE_2 before = 2 rects overlapping about 90% of the narrower one ("at the flag" inside "back at the start"), after = 0 pairs intersecting, both strings independently legible; STATE_4 before = 1 intersecting pair (about 15 px of horizontal overlap against only about 10 px of vertical offset, read off the 1280x720 frozen frame), after = 0 (published rects: flag A y 246.4-262.0, flag B y 226.9-242.5, i.e. 3.9 px of clear air, while they still overlap 17 px horizontally). Extend the same assertion to the body billboards once they join the lane. Determinism co-check: two independent visual:eyes runs produced byte-identical STATE_2__frozen.png and STATE_4__frozen.png (md5 e59770ad6bc9 / 7cff0abd77ce), so the camera-dependent placement does not break the frozen-pin contract.',
    status: 'FIXED',
    concepts_affected: ['conservative_vs_nonconservative_forces'],
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
  return `-- 2026-08-07: newtons_laws_body marker-lane separation (nlbStackMarkerLabels)\n` +
    `-- + the published screen rects the gate needs (PM_nlbMarkers.label_rects).\n` +
    `-- CLOSES checkpoint_marker_labels_collide_when_two_checkpoints_sit_near_in_world_space\n` +
    `-- (and its engine-side sibling candidate, which is deliberately not minted).\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_nlb_marker_lane_stack.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files,\n` +
    `  fixed_at = CASE WHEN EXCLUDED.status = 'FIXED' THEN now() ELSE engine_bug_queue.fixed_at END;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-07_seed_engine_bug_queue_nlb_marker_lane_stack_migration.sql');
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
