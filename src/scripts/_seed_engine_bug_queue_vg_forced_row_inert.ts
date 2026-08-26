/**
 * engine_bug_queue — the ⚙ FORCE-SHOWN SLIDER ROW that was not a control,
 * `field_3d_renderer.ts` (Rule-40 platform dispatch), 2026-08-26.
 *
 * What the round was: an interactive dispatch reported that the vector-geometry knob funnel
 * discards a teacher's slider drag on any state whose JSON omits `show_sliders`. Reproduced,
 * and found to be TWO clauses of one root cause plus a third of the same shape — the authored
 * per-state slider flags were treated as the authority on whether a control is live, so the
 * ⚙ panel (Rule 39f, fleet-wide and automatic) could put a row on screen that looked live,
 * tracked the teacher's finger, and drove nothing.
 *
 * ONE row, filed already FIXED — the class is recorded so the prevention rule and the negative
 * control survive the fix. Marker-gated; SQL emitted from the SAME structure the TS applies;
 * no write downgrades a protected status.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_vg_forced_row_inert.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-26_vg_forced_row_inert';
const FIXED_AT = '2026-08-26T16:00:00.000Z';
const R = 'src/lib/renderers/field_3d_renderer.ts';

interface Row {
  bug_class: string; title: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
  owner_cluster: string;
  root_cause: string; prevention_rule: string;
  probe_type: 'js_eval' | 'manual' | 'sql' | 'vision_model'; probe_logic: string;
  status: 'OPEN' | 'FIXED'; concepts_affected: string[]; fixed_in_files: string[];
  row_type: 'incident'; fixed_at: string | null; marker: string;
}

const ROWS: Row[] = [
  {
    bug_class: 'teacher_forced_slider_row_is_inert_because_the_authored_state_flag_still_owns_the_control',
    title: 'A ⚙ force-shown slider row appeared on screen, greyed and un-draggable, and even when driven the frame threw the value away — the authored per-state slider flags, not the teacher, owned whether a control was live (Rule 39b)',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'Rule 39f made the ⚙ teacher panel fleet-wide and AUTOMATIC: the generic widget engine (pmWgSweep, ' + R + ') declares every '
      + 'div[id$="_row"] inside a dynamically-created position:fixed panel WHETHER OR NOT the state currently shows it, so all twelve '
      + 'vector-geometry slider rows are offered to the teacher on every state of every vg concept. Rule 39b requires such a force-shown row '
      + 'to be LIVE. It was not, in THREE places, all the same mistake — an authored per-state flag left holding authority over a control the '
      + 'TEACHER had asked for. (1) THE KNOB FUNNEL: updateVectorGeometry3DFrame\'s knob() read '
      + '"if (stateDef.show_sliders && window[dragKey] && window[liveKey] != null)", so on any state whose JSON omits show_sliders the '
      + 'drag-seize branch was unreachable and every trusted drag was silently discarded. (2) THE ROW PASS: vgApplyControlRows set '
      + 'slEl.disabled = !(key in controls) for EVERY row, so on a state that authors no controls the force-shown slider was grey and could '
      + 'not emit the input event the entire drag-seize contract starts from — the teacher-facing symptom was reached BEFORE clause (1) even '
      + 'ran. (3) THE RAMPED-ROW WRITE-BACK: vgSyncRampedRows stepped aside for a dragged row only when show_sliders was set, so on those same '
      + 'states it would have overwritten the teacher\'s own number every frame. MEASURED on lines_and_planes_in_space, five of whose nine '
      + 'states (3, 4, 5, 7, 8) omit show_sliders, at a pinned clock so no ramp could explain the result: STATE_4, PM_vgTheta set to 110 with '
      + 'the seize flag set — window.PM_vgVectors.theta_deg, the value the frame BUILT THE MESHES FROM, stayed 60. Through the real UI '
      + '(SET_WIDGET_VIS {vg_theta_deg_row:"show"} then a real trusted mouse drag): the row and its panel both came on screen — the generic '
      + 'engine\'s shell pass already force-shows a hidden parent panel when a row is forced — but slider.disabled was true, opacity 0.55, '
      + 'and the drag moved nothing at all (PM_vgThetaDragged never even became true). STATE_6, which authors show_sliders, responded '
      + 'correctly at the same instants, so the ONLY difference between a working control and a dead one was a key in the JSON that the '
      + 'teacher cannot see and did not write. FIXED 2026-08-26: (1) a TRUSTED DRAG is the authority — the show_sliders clause is deleted from '
      + 'knob(); wire() sets a seize flag only from an ev.isTrusted input on that row and the apply pass clears every flag on state entry, so '
      + 'the flag can be true only if a real teacher really dragged that row during THIS state. That is deliberately NOT a visibility test: a '
      + 'visibility test is weaker (it can be true with no user action) and would add a defect of the same family, since hiding the row again '
      + 'mid-state would release the seize and snap the geometry back under the teacher\'s hand. (2) vgApplyControlRows promotes a row the '
      + 'state does not show at all to LIVE when the override says "show" — the clause the curated capacitance path (capApplyWidgetVis) has '
      + 'carried since the Rule-39 prototype; a row the state DOES show as a static_readout stays greyed, because that grey is authored intent. '
      + '(3) vgSyncRampedRows steps aside for any dragged row. The SET_WIDGET_VIS handler now re-runs the ROW PASS (display/disabled/opacity '
      + 'only — never the full apply, Rule 39c) so the promotion is instant rather than waiting for the next SET_STATE.',
    prevention_rule:
      'A CONTROL IS LIVE BECAUSE IT IS ON SCREEN FOR THE TEACHER, NOT BECAUSE THE JSON SAID SO. Since Rule 39f the ⚙ panel can surface ANY '
      + 'declared widget on ANY state, so no authored per-state display flag (show_sliders, controls[], a mode gate) may be re-used as the '
      + 'test for whether the control WORKS. Rule 39b in one sentence: if a teacher can see a control, dragging it must change the picture. '
      + 'THE DRAG-SEIZE FLAG IS THE AUTHORITY AND IT ALREADY CARRIES THE PROOF — it is written only from an ev.isTrusted input on that row and '
      + 'cleared on every state entry, which is strictly stronger than any visibility test and needs no second gate in front of it. '
      + 'AND A CONTROL HAS MORE THAN ONE OFF-SWITCH: enumerate ALL of them before calling a force-shown row live — the row\'s display, its '
      + 'PARENT panel\'s display, the input\'s disabled flag, the frame\'s value funnel, and any per-frame write-back that could overwrite the '
      + 'teacher\'s value. Here the visible half (display) was already right fleet-wide and the other three were wrong, which is exactly how '
      + 'the defect stayed invisible: the row appeared, so it looked handled. '
      + 'MEASURE THE RESOLVED VALUE, NEVER THE PIXELS: pin the clock and read the number the FRAME built the meshes from '
      + '(window.PM_vgVectors.theta_deg and its siblings). A pixel diff cannot carry this claim — a null control (two captures, no input) on '
      + 'this very scene moved 3,300–12,500 pixels by itself, more than the drag did. '
      + 'AND DRIVE IT WITH REAL TRUSTED INPUT (recorded sibling class '
      + 'vg_slider_drive_probe_using_synthetic_input_events_never_seizes_the_knob_and_reports_the_authored_static): a synthetic input event '
      + 'never seizes the knob, and — as measured here — a disabled slider silently swallows a real drag too, so a probe that only sets the '
      + 'globals proves the funnel and MISSES the two clauses in front of it.',
    probe_type: 'js_eval',
    probe_logic:
      'Headless, against the built sim.html of a vector_geometry_3d concept. For a state that authors show_sliders (control) and a state that '
      + 'does NOT (subject): SET_STATE, pin with SET_TIME_JUMP so no ramp can explain a change, then (a) set window.PM_vg<Knob> and '
      + 'PM_vg<Knob>Dragged directly and assert window.PM_vgVectors.theta_deg (the frame\'s own resolved value) becomes the dragged number on '
      + 'BOTH states; (b) post SET_WIDGET_VIS {<row_id>:"show"} and assert the row is on screen, its PARENT panel is on screen, and '
      + 'slider.disabled === false on BOTH states; (c) drive it with a REAL trusted Playwright mouse drag and assert the seize flag becomes '
      + 'true and the resolved value follows, on BOTH states. NEGATIVE CONTROL (must itself fail first): the pre-fix build answers (a) with the '
      + 'authored 60 on the no-show_sliders state, and (b) with disabled === true, while the show_sliders state passes both — the difference '
      + 'between them IS the defect. EYE-SAFETY CONTROL, asserted rather than assumed: grep visual_eyes.ts + validators/visual/** for '
      + 'SET_WIDGET_VIS / PM_widgetVis / a synthesized drag / any *Dragged write — zero hits means both changed branches are unreachable in a '
      + 'capture, so baselines cannot move. PARITY CONTROL: with no override and no drag, every state at several pins resolves identically '
      + 'before and after (44/45 snapshots byte-identical here; the one outlier reproduced on a RE-RUN OF THE SAME BUILD, i.e. harness float '
      + 'noise, not the change).',
    status: 'FIXED',
    concepts_affected: ['lines_and_planes_in_space', 'vector_products_in_space'],
    fixed_in_files: [R],
    row_type: 'incident',
    fixed_at: FIXED_AT,
    marker: 'a TRUSTED DRAG is the authority',
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
    `${sqlStr(r.row_type)}, ${r.fixed_at ? sqlStr(r.fixed_at) : 'NULL'})\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  root_cause = EXCLUDED.root_cause, prevention_rule = EXCLUDED.prevention_rule,\n` +
    `  probe_logic = EXCLUDED.probe_logic, status = EXCLUDED.status, fixed_at = EXCLUDED.fixed_at,\n` +
    `  fixed_in_files = EXCLUDED.fixed_in_files, concepts_affected = EXCLUDED.concepts_affected\n` +
    `WHERE engine_bug_queue.root_cause NOT LIKE ${sqlStr(`%${r.marker}%`)}\n` +
    `  AND engine_bug_queue.status NOT IN ('FIXED', 'FALSE_POSITIVE');\n`).join('\n');
  return `-- 2026-08-26 — the ⚙ FORCE-SHOWN SLIDER ROW that was not a control (Rule 39b).\n` +
    `-- ${ROWS.length} new row, filed already FIXED. A Rule-40 platform change to ${R},\n` +
    `-- landing on master in its own PR.\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_vg_forced_row_inert.ts from the SAME\n` +
    `-- structure the TS path applies. Idempotent, order-independent, never a downgrade.\n\n` + ins;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-26_seed_engine_bug_queue_vg_forced_row_inert_migration.sql');
  writeFileSync(sqlPath, emitSql(), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${ROWS.length} insert)`);

  for (const r of ROWS) {
    const { marker, ...row } = r;
    const { data: ex, error: rErr } = await supabaseAdmin
      .from('engine_bug_queue').select('bug_class,root_cause,status').eq('bug_class', row.bug_class).maybeSingle();
    if (rErr) { console.error(`✗ read ${row.bug_class}: ${rErr.message}`); process.exit(1); }
    if (ex?.root_cause?.includes(marker)) { console.log(`⏭  ${row.bug_class} — marker present`); continue; }
    if (ex && PROTECTED.includes(ex.status)) {
      console.log(`⏭  ${row.bug_class} — live status ${ex.status}; REFUSING to overwrite a protected row`); continue;
    }
    const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(row, { onConflict: 'bug_class' });
    if (error) { console.error(`✗ upsert ${row.bug_class}: ${error.message}`); process.exit(1); }
    console.log(`✓ filed ${row.bug_class} (${row.severity}/${row.status})`);
  }
}

main();
