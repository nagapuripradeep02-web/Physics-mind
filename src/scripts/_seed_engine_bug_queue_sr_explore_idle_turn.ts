/**
 * engine_bug_queue: solid_of_revolution — the Rule-37 sandbox, the tick container,
 * and two RECURRENCES of already-FIXED classes on a brand-new scenario.
 *
 * Filed from the field3d_surgeon dispatch on the first concept to author
 * solid_of_revolution (solids_of_revolution, PR #162), 2026-08-28.
 *
 * FOUR rows, and only TWO of them are new bug_classes. The other two are
 * upserts of existing rows whose text is READ BACK AND APPENDED TO, never
 * replaced: a recurrence reopens the class it belongs to, it does not mint a
 * near-duplicate of it. Both existing rows were already FIXED and stay FIXED —
 * what changes is that each now records that its prevention rule did not reach
 * the next scenario, and why.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_sr_explore_idle_turn.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-28_sr_checkpoint_b';

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
  /** House style for a recurrence: "<original session> | RECURRED <what> <when>",
   *  so an upsert of an existing row never erases who found it first. */
  session?: string;
}

const RENDERER = 'src/lib/renderers/field_3d_renderer.ts';
const GATE = 'src/scripts/check_solid_of_revolution.ts';
const CONCEPT = 'solids_of_revolution';

/** The two brand-new classes. */
const NEW_ROWS: Row[] = [
  {
    bug_class: 'field3d_rule37_idle_motion_inside_a_rotationally_symmetric_solid_is_invisible_and_scores_zero',
    title:
      'solid_of_revolution shipped an explore sandbox with no idle motion (0px/1s against a 60px floor), and the obvious fix — turning the solid about its own axis — is provably zero motion, while turning the region INSIDE it is real motion a perceptual diff still scores as zero',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'FIXED 2026-08-28 on the first concept to author the scenario (solids_of_revolution, PR #162). Three layers, and only the first is the one anybody writes down. (1) THE OMISSION: the skeleton S9 row asked for a solid that "turns slowly and continuously from t = 0", and the build shipped every other item in that row and not the turn, so the sandbox sat dead still until the teacher first dragged a slider — founder_drive measured 0 changed px over 1 s against its 60 px floor. (2) THE SYMMETRY TRAP, which is why the design line could not be executed literally: a solid of revolution is rotationally symmetric ABOUT ITS AXIS, so turning the swept skin maps the surface onto itself and changes essentially no pixels at all. Measured in the gate over 720 samples: the rotated surface sits 0.00 px from the original as a set. The motion that is both real and true to the concept is the flat GENERATING REGION still sweeping inside the closed solid. (3) THE ONE THAT COST THE CYCLE: that motion was implemented, verified live at exactly 30 deg/s (PM_srTurnDeg 264.0 -> 294.2 over one second), drawn last so it reads over the solid — and founder_drive STILL reported 0 px. Its pixelmatch threshold (0.1) is PERCEPTUAL, and the region (#4FC3F7) sweeps inside a disc stack (#B39DDB) of almost exactly its luminance (Y 166 vs 171): the same frame pair scores 9 034 changed px at threshold 0.05 and 0 at 0.1. Anything that moves INSIDE a closed solid of revolution stays inside its silhouette, and the silhouette is where the contrast against the background lives. The shipped fix is both motions: the region turn (the one that teaches) plus a slow sandbox ORBIT at the bonding_scene / orbital_shapes idle rate (0.14 rad/s), which moves the silhouette. Measured after: 4 369 px / 1 s, flag gone.',
    prevention_rule:
      'A Rule-37 idle motion is not done when it exists; it is done when it is MEASURED on the composited frame. (a) Pick the motion from the object geometry FIRST: on a rotationally symmetric object, rotation about the symmetry axis is a no-op, and the gate must own that as a negative control rather than a comment. (b) Prefer the object own motion (this concept vocabulary: the generator still sweeping) and add the camera orbit ONLY on evidence that the first cannot clear the floor — the evidence being a founder_drive number, not an opinion. (c) Any motion that lives INSIDE a closed translucent body must be checked for LUMINANCE contrast, not just for existence: a perceptual diff is entitled to call a chromatic-only change no change, and so is a teacher glancing at the screen. (d) Every angle stays a closed form on state-local ms and explore-only, so guided baselines and SET_TIME_FREEZE re-pins are untouched by construction. (e) The camera, if it drifts, is surrendered to the teacher on the first drag and taken back only on state entry (the organic_structure seize edge) — a clear that re-runs per frame kills orbiting after the first touch.',
    probe_type: 'js_eval',
    probe_logic:
      'founder_drive motionProbe on the explore state, SHOT BEFORE ANY DRAG, clipped to the sim: two frames 1 s apart, pixelmatch threshold 0.1, floor 60 px. Measured on solids_of_revolution: BEFORE 0 px (EXPLORE_FROZEN flagged); region turn alone 0 px at threshold 0.1 but 9 034 px at 0.05 (the chromatic-only signature); AFTER, with the sandbox orbit, 4 369 px (0.661%) and no flag. Gate-side (check:solid-of-revolution section 16, 8 negative controls): the idle angle returns 0 for every guided mode at 6 sample times; explore is exact, wrapped into [0,360) and identical on a 3000 -> 9000 -> 3000 re-pin; the closed skin rotated by one second of turn sits 0.00 px from itself as a 720-point set (the symmetry control); the region strip rasterised at 1280x720 changes at least 4 723 px of its own silhouette at every phase; and the wiring assertions pin the turn to the region mesh and keep the swept skin on its closed 360.',
    status: 'FIXED',
    concepts_affected: [CONCEPT],
    fixed_in_files: [RENDERER, GATE],
    row_type: 'incident',
  },
  {
    bug_class: 'field3d_full_viewport_overlay_container_has_no_ink_but_its_rect_collides_with_all_review_chrome',
    title:
      'The #sr_ticks tick-number container was a 100% x 100% position:fixed sheet, so a DOM collision probe scored a transparent container carrying no ink against every piece of review chrome — 27 collisions across 9 states',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'FIXED 2026-08-28. The DOM tick numbers are absolutely positioned children written per frame from nlbProjPx in VIEWPORT pixels, so their parent needs to be nothing but an origin. It was built as position:fixed;left:0;top:0;width:100%;height:100% — a full-screen transparent sheet with pointer-events:none. Nothing renders in it, but its BOUNDING RECT is the whole viewport, and a collision probe measures rects: founder_drive reported sr_ticks x #fsBtn, x #wgBtn and x #simPenBar on all nine states, 27 findings for an element that cannot overlap anything. The real ticks, which are what a probe should be measuring, went unmeasured behind it.',
    prevention_rule:
      'A container that carries no ink of its own gets an EMPTY rect: width:0;height:0;overflow:visible, keeping left:0;top:0 so viewport-positioned children land on the identical pixel. Then a DOM probe measures the glyphs, which can genuinely collide, instead of the sheet, which cannot. The general form: any position:fixed overlay parent sized in percentages is a probe hazard unless it paints; size the thing that paints.',
    probe_type: 'js_eval',
    probe_logic:
      'founder_drive probeChromeCollisions across every state: intersect each declared overlay rect with the review chrome rects (#fsBtn, #wgBtn, #simPenBar) and report overlaps wider and taller than 4 px. Measured on solids_of_revolution: BEFORE 27 collisions (3 chrome elements x 9 states, all sr_ticks), AFTER 0, with the tick glyphs rendering at the identical pixels. Gate-side: check:solid-of-revolution section 16 (v) asserts the shipped cssText is a 0x0 fixed box with overflow visible and no percentage, with the pre-fix string as the negative control.',
    status: 'FIXED',
    concepts_affected: [CONCEPT],
    fixed_in_files: [RENDERER, GATE],
    row_type: 'incident',
  },
];

/**
 * The two RECURRENCES. Each names an EXISTING bug_class; its shipped text is
 * read back and appended to, so no other session's evidence is overwritten.
 */
const RECURRENCES: Array<{ bug_class: string; note: string; prevention: string; probe: string;
  concept: string; originSession: string }> = [
  {
    bug_class: 'field3d_explore_sandbox_with_no_authored_spin_is_byte_static_and_fails_the_rule37_probe',
    note:
      ' || RECURRENCE 2026-08-28 (solid_of_revolution, the next NEW field_3d scenario after this row was closed): the sandbox shipped byte-static again and founder_drive flagged EXPLORE_FROZEN at 0 px / 1 s. The fix that closed this row is a bonding_scene-LOCAL fallback (spinRate = 0.14 when an explore state authors none), so it protects exactly one scenario and cannot reach a new one — a per-scenario fallback is not a fleet invariant however well it is written. The recurrence carried its own new knowledge and is filed separately as field3d_rule37_idle_motion_inside_a_rotationally_symmetric_solid_is_invisible_and_scores_zero; this row is updated rather than duplicated because the CLASS is the same one.',
    prevention:
      ' || AND IT MUST BE CHECKED AT BUILD TIME, NOT INHERITED: every NEW field_3d scenario declares its explore idle motion explicitly and proves it with a founder_drive motion number before Checkpoint B. Do not assume another scenario fallback covers you — none of them are fleet-wide.',
    probe:
      ' || 2026-08-28 recurrence measurement (solids_of_revolution): BEFORE 0 px / 1 s, AFTER 4 369 px / 1 s (floor 60).',
    concept: CONCEPT,
    // This row's own discovered_in_session was overwritten by the FIRST run of
    // this script before the house style was noticed, and the seed script that
    // filed it does not live in this repo, so the original string is not
    // recoverable here. Recorded as unknown rather than guessed.
    originSession: 'original session not recorded (overwritten 2026-08-28)',
  },
  {
    bug_class: 'f3d_widget_autolabel_contradicts_the_panel_header_it_toggles',
    note:
      ' || RECURRENCE 2026-08-28 (solid_of_revolution): the gear panel auto-derived "Axis of revolution slider" for #sr_axis_row, which is a two-BUTTON toggle (about x / about y) and not a slider at all — the same contradiction between the derived label and the thing it toggles, in the row-label half of the resolver this time. The scenario already curated data-wg-label on its three DOM panels and simply did not put one on the row, and nothing in the pipeline asks a new scenario whether it did. Fixed the same day by the one attribute (data-wg-label="Axis of revolution"), never by a special case in the shared engine.',
    prevention:
      ' || (e) A ROW WHOSE CONTROL IS NOT A SLIDER MUST SELF-DECLARE: the id fallback appends " slider" to the label text of a row, which is right for a range input and a lie for a button pair, a select or a checkbox. Every new scenario checks its own live WIDGET_DECLARE / SIM_READY.widgets payload against the controls it actually built, as part of the build, rather than waiting for a reviewer to read the gear panel.',
    probe:
      ' || 2026-08-28 recurrence, measured on the live built page (solids_of_revolution): the declared entry for sr_axis_row read "Axis of revolution slider" before and reads {"key":"sr_axis_row","label":"Axis of revolution"} after, with the five real slider rows unchanged ("Curve height a slider", "Far end b slider", "Radius r slider", "Discs n slider", "Cut at x slider").',
    concept: CONCEPT,
    originSession: 'session_2026-08-02_wg_autolabel_selfdeclare',
  },
];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length === 0 ? `ARRAY[]::text[]` : `ARRAY[${a.map(sqlStr).join(', ')}]`; }
function sqlRow(r: Row): string {
  return `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(r.session ?? SESSION)}, ${sqlStr(r.row_type)})`;
}
function emitSql(all: Row[]): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type';
  return `-- 2026-08-28: solid_of_revolution explore sandbox (Rule 37) + tick-container rect,\n` +
    `-- plus two RECURRENCE upserts of already-FIXED classes (text appended, never replaced).\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_sr_explore_idle_turn.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files,\n` +
    `  fixed_at = CASE WHEN EXCLUDED.status = 'FIXED' THEN now() ELSE engine_bug_queue.fixed_at END;\n`;
}

const MARK = 'RECURRENCE 2026-08-28';

async function main(): Promise<void> {
  const rows: Row[] = [...NEW_ROWS];

  // ── The recurrences: read the shipped row, append, and only then upsert. ──
  for (const rec of RECURRENCES) {
    const { data, error } = await supabaseAdmin.from('engine_bug_queue')
      .select('*').eq('bug_class', rec.bug_class).limit(1);
    if (error) { console.error(`✗ read failed for ${rec.bug_class}: ${error.message}`); process.exit(1); }
    const cur = data?.[0] as Record<string, any> | undefined;
    if (!cur) { console.error(`✗ ${rec.bug_class} is not in the queue — refusing to invent it`); process.exit(1); }
    const already = String(cur.root_cause).includes(MARK);
    if (already) console.log(`= ${rec.bug_class}: recurrence text already present — re-upserting fields only`);
    const concepts: string[] = Array.isArray(cur.concepts_affected) ? cur.concepts_affected.slice() : [];
    if (!concepts.includes(rec.concept)) concepts.push(rec.concept);
    const files: string[] = Array.isArray(cur.fixed_in_files) ? cur.fixed_in_files.slice() : [];
    for (const f of [RENDERER, GATE]) if (!files.includes(f)) files.push(f);
    rows.push({
      bug_class: cur.bug_class,
      title: cur.title,
      severity: cur.severity,
      owner_cluster: cur.owner_cluster,
      root_cause: String(cur.root_cause) + (already ? '' : rec.note),
      prevention_rule: String(cur.prevention_rule) + (already ? '' : rec.prevention),
      probe_type: cur.probe_type,
      probe_logic: String(cur.probe_logic) + (already ? '' : rec.probe),
      status: 'FIXED',
      concepts_affected: concepts,
      fixed_in_files: files,
      row_type: cur.row_type,
      session: `${rec.originSession} | RECURRED solid_of_revolution 2026-08-28 (${SESSION})`,
    });
  }

  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-28_seed_engine_bug_queue_sr_explore_idle_turn_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} row(s))`);

  const payload = rows.map(({ session, ...r }) => ({
    ...r,
    discovered_in_session: session ?? SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }

  // ── READ BACK, by exact bug_class. A capped scan is not verification. ──
  for (const r of rows) {
    const { data, error: rbErr } = await supabaseAdmin.from('engine_bug_queue')
      .select('bug_class,status,owner_cluster,severity,concepts_affected,fixed_in_files,discovered_in_session,root_cause')
      .eq('bug_class', r.bug_class).limit(1);
    if (rbErr || !data?.[0]) { console.error(`✗ read-back failed for ${r.bug_class}`); process.exit(1); }
    const row = data[0] as Record<string, any>;
    console.log(`✓ ${row.status.padEnd(5)} ${row.owner_cluster} ${row.bug_class}`);
    console.log(`      concepts=${JSON.stringify(row.concepts_affected)} files=${JSON.stringify(row.fixed_in_files)}`);
    console.log(`      session=${row.discovered_in_session} recurrence_recorded=${String(row.root_cause).includes(MARK)}`);
  }
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
