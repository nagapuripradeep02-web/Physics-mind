/**
 * engine_bug_queue — the θ CONTROL ROW after the acute fold, `field_3d_renderer.ts`
 * (Rule-40 platform dispatch), 2026-08-21.
 *
 * What the round was: founder_proxy Checkpoint B cycle 1 on `lines_and_planes_in_space` returned
 * finding P1-A (BLOCKING) — the acute fold that landed one commit earlier (bug_class
 * formula_surface_carries_an_absolute_value_..., filed FIXED) made the theta_deg SLIDER ROW disagree
 * with the readout beside it by up to 50°. The row was labelled "θ (d₁, d₂)" and shows the KNOB;
 * the HUD shows the FOLDED angle. Same symbol pair, two numbers, on the state whose narration says
 * the angle is never above ninety.
 *
 * ONE row, filed already FIXED — the class is recorded so the prevention rule and the negative
 * control survive the fix. Marker-gated, SQL emitted from the SAME structure the TS applies, and no
 * write downgrades a protected status.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_vg_theta_row_control_label.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-21_vg_theta_row_control_label';
const FIXED_AT = '2026-08-21T15:10:00.000Z';
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
    bug_class: 'control_row_label_names_a_derived_quantity_the_knob_stops_equalling_once_a_convention_fold_lands',
    title: 'The theta_deg slider row read "θ (d₁, d₂): 92°" while the HUD one panel away read "angle = 87.8°" — a control label that named a PAIR ANGLE stayed behind when the acute fold landed at the value source, and the panel then confirmed the exact misconception the state exists to deny',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'vgThetaRowLabel (' + R + ', resolve by symbol) derives the theta_deg row label in mode "lines_planes" from the AUTHORED objects, '
      + 'because the panel is built once with the compile-time products label "θ (a, b)". Its first form named the PAIR — the reference line '
      + 'and the rotated line, "θ (d₁, d₂)" — which was true only by arithmetic coincidence: the line-line angle was published RAW over '
      + '[0, 180], and lines_and_planes_in_space authors a rotation axis perpendicular to both directions, so the knob and the pair angle '
      + 'happened to be one number at every value. The acute fold ended that coincidence in the very next commit: past 90° the readout comes '
      + 'back down (|cos|) while the knob keeps rising, and the two surfaces bearing the identical symbol pair diverge without limit. '
      + 'MEASURED on STATE_6, whose only control is this row and whose misconception_watch M4 is literally "The angle between two lines can be '
      + 'more than 90 degrees": frozen pin t=15000 — row "θ (d₁, d₂): 92°" vs HUD "angle = 87.8°"; dense probe t=19000 — row 112° vs HUD 67.5°; '
      + 'trusted drag to 104° — row 104° vs HUD 76.0°; the knob\'s authored maximum — row 115° vs HUD 65.0°, FIFTY DEGREES apart, on the state '
      + 'whose payoff sentence is that the angle is never above ninety. A student holding M4 got on-screen confirmation of it in the control '
      + 'panel at the moment the narration denied it. WORSE ON STATE_9 GROUP B (the skew pair, reachable only through the scene-group picker and '
      + 'therefore absent from every drive dump): that group publishes NO angle readout at all, so the row is the ONLY θ surface there and '
      + 'nothing on screen contradicts it — measured "θ (d₁, d₂): 69°" at the authored pose and "θ (d₁, d₂): 115°" dragged to max. '
      + 'THE CATEGORY ERROR: the knob does not MEASURE an angle. It turns ONE object about an authored axis (vgObjRotate), on a scale whose zero '
      + 'is authored too (rotate.zero), so no pair quantity is safe to print beside it — the agreement it had was a property of one concept\'s '
      + 'authored geometry, not of the control. WHY FOUR ROUNDS OF GATING MISSED IT: §30 clause (h) already read the θ row AS TEXT, but only in '
      + 'mode "products" (where the label IS correct and must stay); §25 asserted the lines_planes label against the objects it named, never '
      + 'against the readout beside it; THE EYE has no committed baseline for this concept (H2 skips) and its D-gates measure pixel motion, not '
      + 'meaning; and at the authored default pose the row and the readout still agree, which is where every spot check looks. '
      + 'FIXED 2026-08-21: in mode "lines_planes" the row names the OBJECT THE KNOB TURNS and nothing else — "turn d₂" — a claim about the '
      + 'CONTROL, true at every value of it and under any future convention change at the value source. The reference object is deliberately not '
      + 'named (naming two objects is what reads as a pair angle) and the symbol θ is deliberately not reused (θ belongs to the state\'s one '
      + 'formula surface, Rule 34b, where it is the acute angle the HUD prints). Un-derivable cases fall back to a bare "turn", which names no '
      + 'object, and NEVER to the products pair. SCOPE, asserted rather than assumed: mode "products" is untouched — the test is negative '
      + '("is lines_planes"), vector_products_in_space\'s "θ (a, b)" is the angle between two VECTORS which this same knob authors directly '
      + '(vgBuildVectors straddles a and b at ±θ/2), it equals the row\'s number at every value, and it must stay free to read past 90° because '
      + 'that concept teaches the SIGN of a·b. Verified in pixels: 261 of 261 comparable frames of vector_products_in_space byte-identical '
      + 'across the pre-fix and post-fix EYE runs, and the two builds render the same products row through the shipped apply pass.',
    prevention_rule:
      'A CONTROL LABEL NAMES WHAT THE KNOB DRIVES, NEVER A DERIVED QUANTITY THAT MERELY AGREES WITH IT AT THE DEFAULT POSE. A slider is a '
      + 'setting, not a measurement: label it with the object or property it acts on ("turn d₂"), and leave the measured quantity to the '
      + 'readout and the formula surface that own it. Never reuse the symbol a state\'s formula surface owns on a control row — one symbol, one '
      + 'meaning, one surface (Rule 34b). '
      + 'A REST-POSE CHECK IS STRUCTURALLY BLIND TO THIS CLASS, because the rest pose is exactly where the control and the quantity agree: drive '
      + 'the knob to BOTH bounds of control_ranges and to the end of every animate[] ramp, and read the control row and the readout TOGETHER, as '
      + 'text, at each. '
      + 'AND WHEN A CONVENTION FIX LANDS AT A VALUE SOURCE, ENUMERATE EVERY SURFACE CARRYING THAT SYMBOL BEFORE CLOSING IT — readout/HUD, formula '
      + 'overlay, sprite labels, arc geometry, slider rows, the ⚙ widget names derived from them, and the narration that names the same quantity. '
      + 'A fold that corrects three of five surfaces ships a self-contradiction, and the most dangerous survivor is the one on a surface with NO '
      + 'sibling to contradict it (STATE_9 group B: the row was the only θ surface in that group, so the disagreement was invisible by '
      + 'construction). Gate the enumeration in every MODE the surface can render in — a text assertion written for one mode is why this one '
      + 'survived four rounds.',
    probe_type: 'js_eval',
    probe_logic:
      'check:vector-geometry-3d §30 clause (i) (' + G + '), with §25 carrying the label-derivation half. Read the TWO SURFACES TOGETHER off one '
      + 'DOM: the label from the SHIPPED writer (vgWriteRowLabels, which the apply pass and the scene-group picker both call), the row\'s number '
      + 'and the HUD from the SHIPPED frame driver, at the state\'s OWN instants — STATE_6 at the frozen pin (t=15000), the dense probe '
      + '(t=19000), the ramp end (t=19500) and a trusted drag to 104°, plus STATE_9 group B at the authored pose and dragged to max through the '
      + 'picker\'s own re-write. Assert (1) the fixture reproduces the measured knob/HUD pairs (92/87.8, 112/67.5, 115/65.0, 104/76.0) BEFORE any '
      + 'claim, so nothing passes vacuously; (2) the row reads "turn d₂" at every one of them; (3) the row makes no PAIR CLAIM — it carries '
      + 'neither the symbol θ (owned by the formula surface) nor two of the scene\'s object labels at once, so there is no quantity for the '
      + 'readout to contradict; (4) group B publishes no angle readout at all, which is why a pair claim there is banned outright rather than '
      + 'merely reconciled; (5) group A, which turns nothing with this knob, falls back to a bare "turn". '
      + 'NEGATIVE CONTROL: run the SHIPPED writer over the PRE-FIX label body (carried verbatim in the gate file — the fix deleted the reference '
      + 'half, so there is no shipped text left to mutate; guarded three ways: it must differ from the shipped body, must still contain the pair '
      + 'concatenation, and must reproduce the exact strings founder-proxy read off the shipped build). It renders "θ (d₁, d₂): 92°" beside '
      + '"angle = 87.8°", "θ (d₁, d₂): 112°" beside 67.5°, "θ (d₁, d₂): 115°" beside 65.0° (50° apart) and "θ (d₁, d₂): 115°" in group B with no '
      + 'readout at all — and FAILS the pair-claim invariant at every one. '
      + 'SCOPE CONTROL: the products row is byte-identical across the pre-fix and fixed builds and is still the built label "θ (a, b)"; the '
      + 'shipped body is asserted to contain no pair concatenation and no refLab at all, so the defect cannot return quietly.',
    status: 'FIXED',
    concepts_affected: ['lines_and_planes_in_space', 'vector_products_in_space'],
    fixed_in_files: [R, G],
    row_type: 'incident',
    fixed_at: FIXED_AT,
    marker: 'the row reads "turn d₂" at every one of them',
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
  return `-- 2026-08-21 — the θ CONTROL ROW after the acute fold (founder_proxy Checkpoint B cycle 1,\n` +
    `-- finding P1-A on lines_and_planes_in_space). ${ROWS.length} new row, filed already FIXED.\n` +
    `-- A Rule-40 platform change to ${R}, landing on master on the same branch as the fold it follows.\n` +
    `-- Gate: check:vector-geometry-3d §30 clause (i) + §25 (ALL SECTIONS PASSED, negative controls fire).\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_vg_theta_row_control_label.ts from the SAME\n` +
    `-- structure the TS path applies. Idempotent, order-independent, never a downgrade.\n\n` + ins;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-21_seed_engine_bug_queue_vg_theta_row_control_label_migration.sql');
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
