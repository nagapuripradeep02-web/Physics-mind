/**
 * engine_bug_queue — the ACUTE LINE-ANGLE fold, `field_3d_renderer.ts` (Rule-40 platform dispatch),
 * 2026-08-21.
 *
 * What the round was: founder_proxy Checkpoint B on `lines_and_planes_in_space` returned finding F1 —
 * STATE_6 prints the formula surface cos θ = |d₁·d₂| ⁄ (‖d₁‖‖d₂‖) and then ends its own authored sweep
 * printing "angle = 115.0°", which that equation forbids (|cos 115°| = 0.4226 → 65.0°). The founder chose
 * the ENGINE route over an authoring cap on the sweep. One line in the Δ5 line-line arc branch of
 * vgResolveLinesPlanes now folds the value (and the arc's leg) onto the acute side.
 *
 * ONE row, filed already FIXED — the class is recorded so the prevention rule and the negative control
 * survive the fix. Marker-gated, SQL emitted from the SAME structure the TS applies, and no write
 * downgrades a protected status.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_vg_acute_line_angle.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-21_vg_acute_line_angle';
const FIXED_AT = '2026-08-21T03:20:00.000Z';
const R = 'src/lib/renderers/field_3d_renderer.ts';
const G = 'src/scripts/check_vector_geometry_3d.ts';

interface Row {
  bug_class: string; title: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
  owner_cluster: string;
  root_cause: string; prevention_rule: string;
  probe_type: 'js_eval'; probe_logic: string;
  status: 'OPEN' | 'FIXED'; concepts_affected: string[]; fixed_in_files: string[];
  row_type: 'incident'; fixed_at: string | null; marker: string;
}

const ROWS: Row[] = [
  {
    bug_class: 'formula_surface_carries_an_absolute_value_the_readout_never_applies_so_a_state_prints_an_angle_its_own_equation_forbids',
    title: 'STATE_6 printed "angle = 115.0°" directly beneath cos θ = |d₁·d₂| ⁄ (‖d₁‖‖d₂‖), which gives 65.0° — the Δ5 line-line arc branch published the raw [0,180] vector angle and never applied the modulus its own formula surface displays',
    severity: 'CRITICAL',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'The angle-arcs pass of vgResolveLinesPlanes (' + R + ', the Δ5 block, resolve by symbol) has three subject branches. '
      + 'The "<planeId>.normal" and "<planeId>" branches take their value from vgLinePlaneAngles, which folds inside itself with Math.abs '
      + 'and returns both of its angles in [0, 90], and each then folds its second leg onto the acute side with an explicit '
      + '"if (vgDotVec(u0, u1) < 0) u1 = vgScaleVec(u1, -1);" under the comment "The arc is drawn on the acute side, which is the angle named." '
      + 'The third branch, ctx.lines[mB] — line versus line, the one subject for which the acute convention IS the definition — did neither: '
      + 'it read val = vgAngleDeg(u0, u1), the general undirected direction angle over the full [0, 180]. '
      + 'The helper\'s own header argued for that, on the ground that a readout must track a continuous rotation past 90 or it would '
      + '"disagree with the motion beside it" — reasoning that mistakes continuity of the number for a physics constraint. '
      + 'A line has no direction: d and -d name the same line, so the angle between two lines is the acute one by definition '
      + '(NCERT Cl.12 §11.4; the same in IB HL and A-level FM), which is exactly what the modulus in the printed formula says. '
      + 'MEASURED on lines_and_planes_in_space STATE_6, whose formula_overlay is cos θ = |d₁·d₂| ⁄ (‖d₁‖‖d₂‖) and whose animate[] ramps '
      + 'theta_deg 69.3846 → 115 over 10500-19500 ms with control_ranges [25, 115]: the readout ended the state at "angle = 115.0°" '
      + '(the equation gives 65.0°) and the frozen frame, pinned mid-rotation, read 92.2° where the equation gives 87.8°. '
      + 'A Class-12 student who copies the readout into a CBSE paper is marked wrong, and the sim contradicts itself on one screen. '
      + 'WHY EVERY WEAKER SAMPLING WAS GREEN: at the authored default (69.3846°) the fold is a no-op; the arithmetic of the raw angle was '
      + 'always right; the Δ2b/Δ2c reveal gating was right (the number waited correctly for its arc, then said a forbidden thing); '
      + 'THE EYE pins one frozen frame with no equation to compare it against, and D5/D6/D7 measure pixel motion, not meaning. '
      + 'The discriminating quantity is the readout at the FAR END of the state\'s own knob range, evaluated against the equation on screen. '
      + 'FIXED 2026-08-21: the line-line branch folds u1 first and then takes val, so one decision corrects all three surfaces that read val — '
      + 'the inline publish, the generic o.readout publish after the arc push, and the arc\'s own value_deg — and the drawn wedge comes down '
      + 'with the number instead of opening past it. vgAngleDeg stays the raw [0, 180] helper: the fold belongs to the SUBJECT, and only that '
      + 'branch knows the subject is two lines. BLAST RADIUS MEASURED on the real concept, all nine states, pre-fix build versus shipped build '
      + 'over each state\'s whole authored ms span and its whole theta slider range: STATE_6 alone changes (75/221 authored frames, 51/181 slider '
      + 'positions, all of them past 90°); STATE_1-5 and STATE_7-9 are bit-identical, and below 90° STATE_6 itself is bit-identical at all 65 '
      + 'sampled knob values. Mode "products" cannot be reached: vgResolveLinesPlanes has ONE call site, behind d.mode === "lines_planes", '
      + 'and vector_products_in_space\'s θ (a, b) is between VECTORS, legitimately obtuse, printed from its own theta_deg KNOB — verified in '
      + 'pixels at θ = 130° ("θ = 130°", "a·b = -3.86", obtuse arc) on run 20260821-025346. '
      + 'RESIDUAL, newly revealed by this fix and NOT dispatched (founder call): the theta_deg SLIDER ROW label is composed by vgThetaRowLabel '
      + 'as "θ (d₁, d₂)" from the labels of the reference and rotated lines, so past 90° that row reads "θ (d₁, d₂): 115°" while the readout '
      + 'two inches away reads "angle = 65.0°". The row label was correct before this fix and is a rotation-KNOB name, not a measured angle; '
      + 'the remedy is either an engine relabel of a knob that is no longer the angle it turns between, or an authoring relabel of that control. '
      + 'That layer has never been content-reviewed.',
    prevention_rule:
      'A FORMULA SURFACE AND THE READOUT THAT WOULD VERIFY IT MUST AGREE OVER THE WHOLE RANGE THE STATE CAN REACH, NOT ONLY AT THE AUTHORED '
      + 'DEFAULT. Where a surface prints |·|, a modulus, a norm, a max/min or any other range-restricting operator, drive the state\'s own knob '
      + 'to BOTH bounds of its control_ranges and to the end of every animate[] ramp, and evaluate the printed equation at each — a spot check at '
      + 'the rest pose is structurally blind to this class, because the rest pose is where the two agree. '
      + 'Engine side: an angle token whose NAME says "lines" is folded to acute AT THE VALUE SOURCE, so the readout, the generic o.readout publish '
      + 'and the arc\'s own value_deg cannot diverge; the arc\'s second leg is folded in the same statement so the picture cannot contradict the '
      + 'number. The fold belongs to the SUBJECT, never to the shared direction-angle helper — vgAngleDeg stays [0, 180] for any future '
      + 'direction-versus-direction claim, and a caller that folds at the bottom would destroy information no caller could get back. '
      + 'Do not reason that a readout must be CONTINUOUS through a convention boundary: continuity of the number is not a physics constraint, '
      + 'agreement with the equation on screen is, and the arc turning around with it is what makes the picture honest.',
    probe_type: 'js_eval',
    probe_logic:
      'check:vector-geometry-3d §30 (' + G + '). Build the shipped vgResolveLinesPlanes and run STATE_6\'s verbatim vg block over '
      + 'θ ∈ [25, 115] (the state\'s own control_ranges) at 1° steps, and over its 9 s theta ramp through the shipped vgAnimValue. Assert (1) the '
      + 'fixture actually crosses 90 (the raw angle reaches 115) so the claim cannot pass vacuously; (2) angle_lines_deg never exceeds 90; '
      + '(3) at every sample it EQUALS acos(|d₁·d₂| / (‖d₁‖‖d₂‖)) evaluated by a second implementation written in the gate file — not a clamp, '
      + 'which would also satisfy (2) and be wrong everywhere past 90; (4) the arc\'s value_deg equals the readout and its drawn legs satisfy '
      + 'u0·u1 ≥ 0 at every sample; (5) products mode is untouched, driven through the shipped frame driver at θ = 115 and 150 with the θ row '
      + 'read as TEXT off the panel and a·b asserted still negative. '
      + 'NEGATIVE CONTROL: rebuild the SHIPPED resolver body with the one fold statement deleted (guarded — a lost anchor throws rather than '
      + 'silently planting nothing) and watch it FAIL every claim: it reaches 115.0°, disagrees with the formula by 50°, renders the panel text '
      + '"angle = 115.0°", reads 92.2° at the frozen pin instead of 87.8°, and draws the wedge at u0·u1 = -0.4226. '
      + 'BLAST-RADIUS CONTROL: with no line-line arc authored, and below 90° with one authored, the two builds must agree BIT FOR BIT; at θ = 90 '
      + 'exactly they differ by 3.8e-5° because the authored 6-dp rotation axis overshoots the crossing, and both render "angle = 90.0°".',
    status: 'FIXED',
    concepts_affected: ['lines_and_planes_in_space'],
    fixed_in_files: [R],
    row_type: 'incident',
    fixed_at: FIXED_AT,
    marker: 'the frozen frame, pinned mid-rotation, read 92.2° where the equation gives 87.8°',
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
  return `-- 2026-08-21 — the ACUTE LINE-ANGLE fold (founder_proxy Checkpoint B finding F1 on\n` +
    `-- lines_and_planes_in_space, engine half E2). ${ROWS.length} new row, filed already FIXED.\n` +
    `-- A Rule-40 platform change to ${R}, landing on master on its own branch.\n` +
    `-- Gate: check:vector-geometry-3d §30 (ALL SECTIONS PASSED, negative control fires).\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_vg_acute_line_angle.ts from the SAME structure\n` +
    `-- the TS path applies. Idempotent, order-independent, never a downgrade.\n\n` + ins;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-21_seed_engine_bug_queue_vg_acute_line_angle_migration.sql');
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

  const { data: open } = await supabaseAdmin.from('engine_bug_queue')
    .select('bug_class').contains('concepts_affected', ['lines_and_planes_in_space']).in('status', ['OPEN', 'DEFERRED']);
  console.log(`\n· ${open?.length ?? 0} row(s) now OPEN/DEFERRED for this concept`);
}

main();
