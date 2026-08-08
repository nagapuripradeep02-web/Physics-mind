/**
 * engine_bug_queue row for the NEW `vector_geometry_3d` scenario_type —
 * dispatch VG-A of the Phase-0 3D-geometry wave
 * (docs/MATHEMATICS_PHASE0_VECTORS_3D.md §0c), a Rule-40 platform dispatch.
 *
 * RECONCILES A PROVENANCE DEFECT, and that is half its job. A previous
 * session seeded `field3d_no_generic_two_vector_scenario` at status FIXED for
 * a scenario_type named `vector_products_in_space` that DOES NOT EXIST ON
 * MASTER — the queue asserting a fix the product does not have, which is the
 * one thing a scar list cannot afford to do. This script:
 *   1. RENAMES that row's bug_class to the dispatch's name (an UPDATE keyed
 *      on the old bug_class — the upsert key cannot rename itself, and a
 *      second row would leave two records of one delta);
 *   2. re-upserts it with the corrected scenario name, contract and status.
 *
 * STATUS IS **OPEN**, deliberately. The scenario is built, gated and green on
 * the desk `feat/field3d-vector-products-scenario`, but it is not on master,
 * no concept authors it, and VG-B/VG-C are still outstanding. A directive row
 * is FIXED when the product has the thing it describes.
 *
 * Idempotent: rename-if-present, then upsert onConflict 'bug_class'. Also
 * writes the archival SQL.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_vector_geometry_3d_scenario.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-08_vg_a_vector_geometry_3d_scenario_shell';
const OLD_BUG_CLASS = 'field3d_no_generic_two_vector_scenario';

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
const GATE = 'src/scripts/check_vector_geometry_3d.ts';

const rows: Row[] = [
  {
    bug_class: 'field3d_has_no_generic_two_vector_scenario_so_every_vector_claim_is_hardcoded_per_physics_scenario',
    title: 'NEW scenario_type vector_geometry_3d (mode: products | lines_planes) — one generic two-vector / 3D-geometry scenario serving BOTH vector_products_in_space and lines_and_planes_in_space, replacing the concept-id-in-a-scenario-slot name the previous round shipped',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      `Not a bug — an engine delta, plus a provenance correction. THE NAME: the previous round built scenario_type "vector_products_in_space", a CONCEPT ID in a SCENARIO SLOT. Left standing it forces lines_and_planes_in_space.json to declare that it renders as a different concept (the recorded mechanics_2d naming trap) or forces a second scenario and forfeits the amortisation the Phase-0 survey exists to capture. Renamed to vector_geometry_3d with a two-value vg.mode ("products" | "lines_planes"), modelled on the BS_CAMERAS[bs.mode] one-scenario-many-concepts pattern; helper prefix vp* -> vg* while it is still free (nothing on master, no JSON authors it). WHAT VG-A BUILT in ${RENDERER}: the scenario shell (buildScenario case + applyVectorGeometry3DState + updateVectorGeometry3DFrame + applyVectorGeometry3DGlow), pure THREE-free helpers (vgSub/vgAddVec/vgCrossVec/vgDotVec/vgLenVec/vgNormalize/vgRotateAbout/vgBuildVectors/vgParallelogramVerts/vgParallelepipedFaces/vgProjectPoint/vgPairwiseScreenSeparationDeg/vgAnimValue/vgAnimEndMs/vgCamScheduleAt/vgCamStepsEndMs/vgAutoFramePos) so the gate can brace-match them out of the template and run them headless, the F9 numeric readout panel (one DOM text node carrying symbol AND value, top:52px so it clears the review chrome), and a #vg_sliders panel gaining a b_tilt_deg row. THREE CORRECTIONS TO THE INHERITED GEOMETRY, each measured: (1) THE SYMMETRIC CONVENTION — a and b now straddle +x at +/- theta/2 in the xz-plane so a x b runs along +Y, which makes the two taught pairs a^(a x b) and b^(a x b) project EQUALLY instead of lopsided; the previous "a pinned along +x" convention is what put b and a x b on ONE SCREEN LINE at theta=35/az=35/el=30. (2) b_tilt_deg is a RODRIGUES ROTATION ABOUT a-hat, not a lift toward an axis: rotating about a-hat preserves theta and |b| to machine precision (measured worst error 0 over 2961 (theta, tilt) pairs), where the lift silently changed the taught angle by up to 41.98 degrees while the HUD, the angle arc and the formula surface all still reported the slider. (3) THE PAIRWISE SCREEN METRIC WAS MEASURING NDC ANGLES — vgProjectPoint divided x by the aspect ratio, so every screen direction was sheared by 1.78x at 16:9 and a true 90-degree pair at a GOOD pose scored 61.8 degrees. It now returns isotropic sx/sy alongside NDC x/y and the pairwise metric reads sx/sy. That single fix made four independently hand-derived camera numbers reproduce exactly (auto-frame min pairwise 18.914 vs 18.91 claimed, max arm 0.4364 vs 0.436, min arm 0.0412 vs 0.0412, entry pose az 0 / el 30 / R 12.99 vs 0 / 30 / 12.99) where before the fix they read 10.909 / 0.755 (OFF FRAME) and looked falsified. TWO PORTS, NOT INVENTIONS (Rule 40a run on the MECHANISM, not only on the scenario name — the recorded failure of this wave): F21 vg.animate[] is a port of the shipped param_ramp (nlbRunParamRamp) and idle_auto_sweep (nlbRunIdleSweep), differing deliberately in that vgAnimValue RESOLVES a knob as a pure function of state-local ms instead of WRITING through a slider path, so it needs no churn guard and carries no hidden state; F24 vg.camera_steps is os.camera_steps (osCamScheduleAt) adopted field-for-field, closed-form on state-local ms, bypassing the history-dependent lerpSpherical so a SET_TIME_FREEZE pin reproduces byte-identically. A third camera mode, auto_frame, places the camera at R * normalize(a-hat + b-hat + n-hat) with R = k * max(|a|,|b|,|a x b|) — the AUTO-FRAMED RADIUS being the actual requirement of the OPEN CRITICAL scar field3d_explore_camera_fixed_while_its_own_dials_span_two_orders_of_radius (measured: a fixed R=9 puts 182 of the sampled poses off frame at a max arm of 36.05 against a half-extent of 0.5774; the auto-framed radius puts ZERO of 529737 off frame). Rule 40a sweep, run this session across all branches: vector_geometry_3d, vgBuildVectors, vgAnimValue, vgAnimKnobs, vgCamScheduleAt, vgAutoFramePos, vgProjectPoint, vgPairwiseScreenSeparationDeg, vg_sliders, vg_readout, camera_mode, b_tilt_deg, lines_planes, PM_vgAMag, vgSc, vgReadoutText — every hit is DOCUMENTATION (the Phase-0 survey and the two skeletons), ZERO code hits on any branch. CONFIG CONTRACT for json_author: per-state field_3d_config.states.<id>.vg = { mode: 'products'|'lines_planes', a_mag, b_mag, theta_deg, b_tilt_deg, c_mag, c_theta_deg, c_phi_deg, show_c, show_cross_vector, show_angle_arc, show_parallelogram, show_parallelepiped, arc_reveal_frac, cross_reveal_frac, c_reveal_frac, flip_frac, reveal_ms, readouts[], animate[{knob,from,to,start_ms,duration_ms,easing}], camera_mode: 'authored'|'steps'|'auto_frame', camera_steps[{at_ms,az,el,dist,ease_ms}], auto_frame_k, controls[], static_readouts[] } — everything inside the vg block, NO new top-level per-state field (Phase-0 D8), plus the shared top-level camera_position on every 'authored' or 'steps' state. Closed enums: mode (2), easing (linear|smoothstep|ease_out_cubic, default smoothstep), camera_mode (3), readouts (a_mag|b_mag|theta_deg|a_dot_b|cross_mag|a_dot_cross|b_dot_cross|triple), animate knobs (a_mag|b_mag|theta_deg|b_tilt_deg|c_mag|c_theta_deg|c_phi_deg|arc_reveal_frac|cross_reveal_frac|c_reveal_frac|flip_frac — an unknown knob is ignored and published on window.PM_vgAnimUnknown, never silently written). STATUS OPEN: built, gated and green on the desk, NOT on master, no concept authors it, VG-B (the quad/solid meshes' own dispatch) and VG-C (lines/planes/distances + the scene_group selector) outstanding.`,
    prevention_rule:
      'A NEW field_3d scenario_type is named after WHAT IT RENDERS, never after the first concept that will use it — a concept id in a scenario slot forces the second concept to declare that it renders as a different concept (the mechanics_2d trap), and the rename window closes the moment the scenario reaches master. Rule 40a must be run on every MECHANISM the dispatch declares missing, not only on the scenario NAME: this wave was twice about to rebuild things the renderer already ships (param_ramp/idle_auto_sweep, os.camera_steps), and a name sweep cannot see either. A screen-separation metric must be computed in ISOTROPIC screen units (camX/camZ, camY/camZ), never in NDC — dividing x by the aspect ratio shears every measured direction by that ratio (1.78x at 16:9), so a correct camera pose is rejected and an incorrect one can be accepted, on the very quantity the metric exists to police. A tilt/rotation control on a taught vector must be a rotation about an axis that PRESERVES the taught quantity (about a-hat, here), or the readouts silently disagree with the sliders that drive them. An explore camera solves its RADIUS as well as its direction, and is scored at the worst case over the FULL cartesian product of every live slider — a solve that holds any axis fixed is a sample, not a measurement. A directive row is FIXED only when master carries the thing it describes; a row marked FIXED for code that exists only on a branch is the queue asserting a fix the product does not have.',
    probe_type: 'js_eval',
    probe_logic:
      'npm run check:vector-geometry-3d — 131 assertions and 15 negative controls, every negative control demonstrated to fail its target defect FIRST. Sections are numbered per the Phase-0 §0c gate table (1-5, 6-7, 11, 13; 8/9/10/12 are VG-C\'s and are absent until that dispatch lands). It asserts: the core vector ops against closed forms at 20 sampled (theta, phi) pairs to 1e-12; a.(a x b) = 0 and b.(a x b) = 0 at 140 (theta, tilt) samples; |a x b| and a.b across the whole range INCLUDING the obtuse regime; the symmetric convention and the Rodrigues tilt (worst theta error 0 over 2961 pairs); F21 ramps as closed forms with an explicit REWIND test; the deriveStateMeta pin landing past the LAST settled beat (grow-in, ramps AND camera steps, not merely reveal_ms); the parallelogram area and the parallelepiped closure; FLEET SAFETY (the emitted template body diffed against the last ancestor with no vector scenario, with the scenario region excised by span and every changed fleet line required to sit within 12 lines of one of 9 named dispatch sites); and THE CAMERA under the worst-case law — pairwise over every rendered pair, in perspective, at FOV 60 / 16:9, at the worst case over ALL FOUR live sliders (529737 poses at 1-degree theta resolution), with an EXEMPT-PAIR list (a x b vs b x a fold to 0.00 degrees and that is CORRECT) and a screen-LENGTH floor. The three camera negative controls are all required and all fire: a per-object foreshortening margin passes VACUOUSLY on the reproduced historical collinearity (min arm 0.1368 > threshold while the pairwise metric reads 0.356 degrees); the falsified az = (theta + 90) rule collapses to 0.000 degrees; and a gate with no exempt-pair list fails the state that is correct. Run it on every future edit to any vg* helper or to the applyState() camera_position block. Once a concept authors this scenario: npm run visual:eyes and confirm every guided state classifies reveal_hold and the explore state interactive, and that no #sliders panel bleeds through (the isVecGeom NOT-list entry).',
    status: 'OPEN',
    concepts_affected: ['vector_products_in_space', 'lines_and_planes_in_space'],
    fixed_in_files: [RENDERER, DERIVE, GATE],
    row_type: 'directive',
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
  return `-- 2026-08-08 VG-A: the NEW vector_geometry_3d scenario_type, and the provenance reconciliation.\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_vector_geometry_3d_scenario.ts — idempotent.\n\n` +
    `-- 1. RENAME the prior round's row rather than minting a second record of one delta.\n` +
    `UPDATE engine_bug_queue SET bug_class = ${sqlStr(all[0].bug_class)}\n` +
    ` WHERE bug_class = ${sqlStr(OLD_BUG_CLASS)};\n\n` +
    `-- 2. Upsert the corrected content (status OPEN — the scenario is not on master).\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-08-08_seed_engine_bug_queue_vector_geometry_3d_scenario_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} row(s))`);

  // 1. Rename the prior round's row, if it is still under the old key.
  const { data: old } = await supabaseAdmin.from('engine_bug_queue').select('bug_class').eq('bug_class', OLD_BUG_CLASS).maybeSingle();
  if (old) {
    const { error: renErr } = await supabaseAdmin.from('engine_bug_queue')
      .update({ bug_class: rows[0].bug_class }).eq('bug_class', OLD_BUG_CLASS);
    if (renErr) { console.error(`✗ rename failed: ${renErr.message}`); process.exit(1); }
    console.log(`✓ renamed ${OLD_BUG_CLASS} -> ${rows[0].bug_class}`);
  } else {
    console.log(`· no row under the old key ${OLD_BUG_CLASS} (already reconciled)`);
  }

  // 2. Upsert the corrected content.
  const payload = rows.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ upserted ${payload.length} engine_bug_queue row(s)`);
}

main();
