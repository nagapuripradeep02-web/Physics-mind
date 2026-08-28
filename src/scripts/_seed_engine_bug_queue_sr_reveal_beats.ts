/**
 * engine_bug_queue rows for the SR-C3 dispatch — solid_of_revolution's missing
 * reveal beats, plus the srCamBase azimuth inversion that rode along with it.
 *
 * THREE WRITES, and the third is deliberately NOT a new row:
 *   1. NEW, FIXED — sr_stack_and_readouts_render_a_states_answer_before_the_beat_
 *      that_earns_it. The picture half and the number half of the Rule-32a
 *      violation Checkpoint B measured on STATE_7.
 *   2. NEW, FIXED — field3d_camera_position_to_azimuth_conversion_inverts_atan2_
 *      arguments_so_a_derived_pose_is_rotated. Its own defect, not a recurrence:
 *      a coordinate-conversion error, latent until a new consumer read it.
 *   3. RECURRENCE APPENDED to the OPEN row
 *      vg_formula_overlay_has_no_timed_reveal_so_the_formula_is_on_screen_before_
 *      the_beat_that_derives_it. The formula half of this dispatch IS that class,
 *      on a second scenario, so it is documented there rather than minted as a
 *      near-duplicate under an sr_ prefix. THAT ROW STAYS OPEN: vg's Δ11 port is
 *      still not done, and a row is FIXED only when the product has the thing it
 *      describes.
 *
 * Idempotent: an exact-bug_class read-back before and after, never a capped
 * select; the recurrence note is MARKER-GATED so re-running appends nothing.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_sr_reveal_beats.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-28_sr_checkpoint_b';
const VG_ROW = 'vg_formula_overlay_has_no_timed_reveal_so_the_formula_is_on_screen_before_the_beat_that_derives_it';
const MARKER = '[RECURRENCE 2026-08-28 / solid_of_revolution]';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:json_author'
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

const RENDERER = 'src/lib/renderers/field_3d_renderer.ts';
const DERIVE = 'src/lib/validators/visual/deriveStateMeta.ts';
const GATE = 'src/scripts/check_solid_of_revolution.ts';

const rows: Row[] = [
  {
    bug_class: 'sr_stack_and_readouts_render_a_states_answer_before_the_beat_that_earns_it',
    title: 'solid_of_revolution had reveal timing for only the curve and the region, so STATE_7 drew the whole 120-ring bowl AND printed "about y: 80.4248" at t = 0 — three seconds before the sweep that makes it starts',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      `srRevealWin(sr, key, ...) honoured exactly two keys, "curve" and "region" — a grep of the whole SR region for srRevealWin call sites returned those two and nothing else. Everything the scenario draws or prints outside them was therefore unconditional: the disc/ring pools were placed on any frame where (summing && nLive > 0) in updateSolidOfRevolutionFrame, the DOM formula surface was written once in applySolidOfRevolutionState (fml.textContent = stateDef.formula_overlay), and srWriteHud rendered every key in sr.readouts on every frame. MEASURED at Checkpoint B on solids_of_revolution (PR #162), on the frames: STATE_7 at t = 0 shows theta = 0 degrees with its theta_ramp.start_ms still 3000 ms away, the ENTIRE 120-ring bowl already drawn, and the HUD already reading "about y: 80.4248" — the state whose whole lesson is "the same region about a DIFFERENT axis makes a different solid with a different volume" was showing the answer before the region had turned one degree. Rule 32a (the cause moves visibly first, the effect answers after a readable beat) broken by the ENGINE, not by the author: there was no field the author could have written. THE FIX extends the EXISTING contract rather than adding a second mechanism — same sr.reveal block, same srRevealWin window, same cueTriggerMs namespace: (1) reveal.stack_at_ms, with an optional stack_ms fade applied to the three pools' shared materials (all three are brightenOnly under applyGlowEmphasis, so the glow pass never writes their opacity and there is no second writer); before it the pools are hidden and SR_PUB.n_drawn is republished as 0, so the SR-D5 cap line reads "discs drawn: 0 of 1000" instead of claiming discs nobody drew. THE ONE SUMMATION STILL RUNS — the total is a NUMBER and the beat is about a PICTURE, so SR-D3 is untouched and the gate asserts srDiscSum still has exactly one call site, before the gate. (2) reveal.formula_at_ms — the formula surface is display:none until it, written on the same style.display channel the apply path already uses, so Rule 39f's !important .pmWgHide/.pmWgShow classes still beat it. THAT HALF IS A RECURRENCE of the OPEN row ${VG_ROW} on a second scenario, documented there. (3) sr.readout_at_ms { <SR_READOUTS key>: ms } — a per-key HUD gate, validated against the CLOSED enum independently of sr.readouts, so a typo THROWS (SR-D8) instead of silently never gating, which is the one miss nothing on screen would show. THE PROPERTY THE DESIGN IS BUILT ON: an ABSENT field is the previous behaviour byte for byte. There is no default reveal time, because a default would silently re-time every already-measured state of every concept that ships this scenario; srRevealHas makes "authored" and "not authored" two code PATHS rather than two values of one number. deriveStateMeta co-edits in the SAME commit (stack_at_ms + stack_ms + 600, formula_at_ms + 600, max readout_at_ms + 600) — without it a state whose stack arrives at 18 s pins at DEFAULT_REVEAL_MS = 1500 and THE EYE photographs the pre-reveal half of the state and mints it as the baseline. RIDE-ALONG in the same commit, its own row: the srCamBase azimuth inversion.`,
    prevention_rule:
      'EVERY SURFACE A STATE CAN SHOW — mesh pool, formula surface, and each individual HUD readout — needs a timed reveal field of its own, or the state has no way to put its cause before its effect and Rule 32a is unauthorable rather than unauthored. Add them as KEYS ON THE EXISTING reveal contract (same window helper, same cue namespace), never as a second timing mechanism beside it. And gate on the PRESENCE of the authored field, never on a default time: a default silently re-times every already-measured state of every concept that ships the scenario, which is the same blast radius as a new mechanism. The absent-field identity is the assertion to write FIRST — run the shipped region both ways and compare what it rendered, not what the code looks like. A timing map keyed by name is validated against its CLOSED enum independently of the list it filters: a typo that merely fails to gate is invisible on screen, so it must throw. When a reveal gate hides a picture whose COUNT is published, republish the count as 0 in the same pass — a drawn count with no pixels behind it is the provenance split the cap line exists against, in reverse. Every new timed key is registered in deriveStateMeta in the SAME COMMIT.',
    probe_type: 'js_eval',
    probe_logic:
      `npm run check:solid-of-revolution — section 17 (35 assertions, 5 negative controls) plus the new section 9 pin assertions and the tightened section 5 n_drawn claim; 60 negative controls fire across the file. Section 17 asserts, through the SHIPPED bodies: the absent-field identity at seven times for four shapes of missing reveal block (including reveal:false), and EXECUTED — with the new fields deleted, STATE_7 at t = 0 is the pre-fix frame again (full ring stack, "about y: 80.4248", "discs drawn: 120 of 1000"); the beat boundary (hidden at 0/10000/17999, placed at 18000 exactly and after); the linear fade and its clamp; a re-pin returning the identical fade (SR-D2); cue-bindability proved by MOVING the beat through the shared cue table, not by matching text; the per-key HUD gate over three readouts with a cue override on one of them; the CLOSED-enum throw with an empty readouts list; and EXECUTED through section 15's live harness under a memoising THREE stub — 0 visible pool meshes and 0 material opacity at t = 0 against 239 meshes at 0.55/0.60/0.60 at t = 19000, "discs drawn: 0 of 1000" vs "120 of 1000", and STATE_6's formula surface display:none beside "wrong = 1.6755" at t = 5000 vs block beside "Vn = 8.3776" at t = 21000. Section 9 asserts the three windows move the pin (19400 / 11600 / 18600) with a control that all three fall to 1500 when absent, and that the authored shapes (18700, 20700) land inside the authored eye_capture_ms windows (19000, 21000). LIVE CONFIRMATION, review player on the built page, SET_TIME_JUMP at fixed state-local ms: STATE_7 HUD reads [theta = 0 deg | about x: 25.1327 | discs drawn: 0 of 1000] at t = 0 and [theta = 168 deg | about x: 25.1327 | discs drawn: 0 of 1000] at t = 10000, then [theta = 360 deg | about x: 25.1327 | about y: 80.4248 | discs drawn: 120 of 1000] at t = 19000; STATE_6 formula display none at t = 5000 beside "wrong = 1.6755" and block at t = 21000 beside "Vn = 8.3776". pixelmatch across the beat boundary: 17999 vs 17999 = 0 px (the re-pin is byte-identical), 17999 vs 18001 = 8466 px (the stack arrives), 18001 vs 18200 = 0 px.`,
    status: 'FIXED',
    concepts_affected: ['solids_of_revolution'],
    fixed_in_files: [RENDERER, DERIVE, GATE],
    row_type: 'incident',
  },
  {
    bug_class: 'field3d_camera_position_to_azimuth_conversion_inverts_atan2_arguments_so_a_derived_pose_is_rotated',
    title: 'srCamBase converted an authored camera_position with atan2(x, z) where the renderer places the camera from atan2(z, x) — a face-on [0, 0, 5.2] mapped to azimuth 0, which is straight down the axis of revolution',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      `srCamBase (${RENDERER}, the SR region) derives (az, el, dist) from a state's authored camera_position when the state does not author sr.camera_base. It read az = atan2(cp[0], cp[2]). updateCameraFromSpherical places the camera at x = r sin(phi) cos(theta), z = r sin(phi) sin(theta), so azimuth is measured FROM +x TOWARD +z and the inverse is atan2(z, x) — which is what the sibling conversion in this same file has always used. srCamBase was the odd one out. It was LATENT because the only consumer was SR14's camera schedule, which fires only on a state that authors camera_base explicitly; the sandbox orbit added one dispatch earlier (srIdleCamAzDeg) derives its STARTING azimuth through srCamBase on the explore state, which authors camera_position only — so the orbit began 8.8 degrees off the authored pose (atan2(x, z) = 40.61 for [5.42, 3.43, 6.32] where the correct value is 49.38) and the state entry jumped. NOT A RECURRENCE of the SR reveal row filed in the same commit: that one is a missing feature, this is a coordinate conversion that was wrong from the day it was written and became observable when a second consumer appeared. Fixed by swapping the two arguments — one line, the sibling's form.`,
    prevention_rule:
      'A CONVERSION IS VERIFIED BY ITS ROUND TRIP THROUGH THE FORWARD FORMULA THE ENGINE ACTUALLY USES, never by inspection: derive (az, el, dist) from a position, feed it back through the renderer\'s own placement expression, and assert the position comes back to 1e-9. A face-on axis case is the cheapest discriminator (x = 0 forces the two argument orders apart by exactly 90 degrees) and belongs in the gate. When a scenario writes its own copy of a conversion the file already carries, diff it against the sibling in the same commit — a private clone of shared arithmetic is where an inverted argument survives, because nothing that reads only one of them can see the disagreement. And a helper whose only consumer is a rarely-authored path is UNTESTED, not correct: the first new consumer is where it surfaces, and by then it is attributed to the new code.',
    probe_type: 'js_eval',
    probe_logic:
      'npm run check:solid-of-revolution section 16 (vii): srCamBase({camera_position:[0,0,5.2]}) must give az 90 (looking along +z at the revolution plane, NOT down the axis); [5.42, 3.43, 6.32] must give az 49.4 / el 22.4 / dist 9.0; and the round trip through the renderer\'s own placement formula (x = d sin(phi) cos(th), y = d cos(phi), z = d sin(phi) sin(th)) must reproduce three authored positions to 1e-9, including a two-negative-component pose. A negative control reconstructs the pre-fix atan2(x, z) and shows it reads 0.0 and 40.6 degrees, failing both assertions, plus a source assertion that the shipped body uses atan2(cp[2], cp[0]) like its sibling.',
    status: 'FIXED',
    concepts_affected: ['solids_of_revolution'],
    fixed_in_files: [RENDERER, GATE],
    row_type: 'incident',
  },
];

const RECURRENCE =
  `\n\n${MARKER} The SAME CLASS on a second scenario, and it is now FIXED THERE while this row stays OPEN. ` +
  `solid_of_revolution had the identical shape: applySolidOfRevolutionState wrote the DOM formula surface in one ` +
  `pass at state entry (fml.textContent = stateDef.formula_overlay) with no at_ms anywhere, so STATE_6 of ` +
  `solids_of_revolution held the CORRECT ring formula "V = Sigma pi (R^2 - r^2) dx" beside the WRONG solid and its ` +
  `reading "wrong = 1.6755" for the whole 1500-11000 ms misconception window — a formula and a number on one screen ` +
  `that contradict each other, on the state built to confront that exact misconception. Fixed 2026-08-28 by ` +
  `reveal.formula_at_ms on the sr block, and the SHAPE OF THAT FIX is the reference for the Delta-11 vg port this ` +
  `row still calls for, in two respects. FIRST, it rides the scenario's EXISTING reveal contract (the same ` +
  `srRevealWin window and the same cueTriggerMs namespace the curve and region beats already use) rather than ` +
  `porting formula_lines[{text, at_ms}], because SR needs one surface timed and not a sequence of them — port the ` +
  `mechanism the state actually needs, not the largest one on master. SECOND, and this is the part worth copying ` +
  `verbatim: the gate is PRESENCE-KEYED, not default-keyed. A state with no formula_at_ms takes a different code ` +
  `path (srRevealHas) rather than a default time, so an unauthored concept renders byte-for-byte what it rendered ` +
  `before — which is what makes the change landable on a scenario whose baselines are already locked. A vg port ` +
  `that gives #formula_overlay a default reveal window instead would move the frozen frame of every vg state that ` +
  `never asked for one. See sr_stack_and_readouts_render_a_states_answer_before_the_beat_that_earns_it (FIXED, ` +
  `same commit) — its stack and readout halves are the picture and number siblings of this defect. THIS ROW ` +
  `REMAINS OPEN: nothing in the vg apply path changed, lines_and_planes_in_space STATE_3 and STATE_8 still show ` +
  `their formula from frame 0, and a row is FIXED only when the product has the thing it describes.`;

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length === 0 ? `ARRAY[]::text[]` : `ARRAY[${a.map(sqlStr).join(', ')}]`; }
function sqlRow(r: Row): string {
  return `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(SESSION)}, ${sqlStr(r.row_type)})`;
}
function emitSql(all: Row[]): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type';
  return `-- 2026-08-28 SR-C3: solid_of_revolution reveal beats + the srCamBase azimuth inversion.\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_sr_reveal_beats.ts — idempotent (marker-gated recurrence).\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files;\n\n` +
    `-- The formula half is a RECURRENCE of an OPEN vg row, appended there rather than\n` +
    `-- minted as a near-duplicate. The row stays OPEN — the vg port is still not done.\n` +
    `UPDATE engine_bug_queue SET root_cause = root_cause || ${sqlStr(RECURRENCE)}\n` +
    ` WHERE bug_class = ${sqlStr(VG_ROW)} AND position(${sqlStr(MARKER)} in root_cause) = 0;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-28_seed_engine_bug_queue_sr_reveal_beats.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} row(s) + 1 recurrence)`);

  // 1. Upsert the two new rows on the bug_class key.
  const payload = rows.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ upserted ${payload.length} engine_bug_queue row(s)`);

  // 2. MARKER-GATED recurrence append on the OPEN vg row. Re-running is a no-op.
  const { data: vg, error: readErr } = await supabaseAdmin.from('engine_bug_queue')
    .select('bug_class,status,root_cause').eq('bug_class', VG_ROW).maybeSingle();
  if (readErr) { console.error(`✗ vg read failed: ${readErr.message}`); process.exit(1); }
  if (!vg) {
    console.error(`✗ the vg row this recurrence belongs to is GONE: ${VG_ROW}`);
    process.exit(1);
  } else if (String(vg.root_cause).includes(MARKER)) {
    console.log(`· recurrence already recorded on ${VG_ROW} (marker present) — no append`);
  } else {
    const { error: updErr } = await supabaseAdmin.from('engine_bug_queue')
      .update({ root_cause: String(vg.root_cause) + RECURRENCE })
      .eq('bug_class', VG_ROW);
    if (updErr) { console.error(`✗ recurrence append failed: ${updErr.message}`); process.exit(1); }
    console.log(`✓ appended the recurrence note to ${VG_ROW} (status left ${vg.status})`);
  }

  // 3. READ-BACK, by exact bug_class, one query per row — never a capped select.
  for (const r of [...rows.map((x) => x.bug_class), VG_ROW]) {
    const { data, error: rbErr } = await supabaseAdmin.from('engine_bug_queue')
      .select('bug_class,status,owner_cluster,row_type,severity,concepts_affected,root_cause')
      .eq('bug_class', r).maybeSingle();
    if (rbErr || !data) { console.error(`✗ read-back failed for ${r}: ${rbErr?.message ?? 'no row'}`); process.exit(1); }
    const mark = r === VG_ROW ? (String(data.root_cause).includes(MARKER) ? ' [recurrence present]' : ' [MARKER MISSING]') : '';
    console.log(`✓ read-back ${data.status.padEnd(5)} ${data.owner_cluster}/${data.row_type}/${data.severity} ` +
      `${JSON.stringify(data.concepts_affected)} ${r}${mark}`);
  }
}

main();
