/**
 * engine_bug_queue — the 3D-geometry wave's scar harvest (2026-08-08/09).
 *
 * THIRTEEN rows drafted across five surgeon dispatches (VG-B, VG-C, the
 * value_readouts rename, SR-A, SR-B), each of which authored its SQL and
 * deliberately did NOT apply it: every dispatch carried "no DB writes".
 * They therefore existed only as text in agent reports — which is EXACTLY the
 * failure this wave recorded as AMENDMENT A20:
 *
 *     A scar row that is AUTHORED but never SEEDED is invisible to the very
 *     consultation designed to surface it.
 *
 * A20 was found by discovering a prior session's unrun seed script whose
 * prevention rule stated THE WORST-CASE LAW a day before this wave re-derived
 * it from five painful instances. The live engine_bug_queue query was run,
 * correctly, against 886 rows — and still could not see it. Fourteen more in
 * that state would repeat the trap at scale, so this script closes it.
 *
 * It ALSO flips VG-A's row OPEN -> FIXED. That row was deliberately left OPEN
 * on the doctrine "a row is FIXED only when master carries the thing it
 * describes". Master now does: PR #75 merged as 1de76ad and PR #77 as 3ae9047,
 * so vector_geometry_3d and solid_of_revolution are both live.
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes archival SQL.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_3d_geometry_wave.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-08_3d_geometry_wave_scar_harvest';

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

const R = 'src/lib/renderers/field_3d_renderer.ts';
const VG_GATE = 'src/scripts/check_vector_geometry_3d.ts';
const SR_GATE = 'src/scripts/check_solid_of_revolution.ts';

const VG = ['vector_products_in_space', 'lines_and_planes_in_space'];
const SR = ['solids_of_revolution'];

const rows: Row[] = [
  // ─────────────────────────── VG-B ───────────────────────────
  {
    bug_class: 'field3d_vector_geometry_parallelepiped_is_a_boolean_solid_so_the_volume_state_cannot_decompose',
    title: 'show_parallelepiped was a boolean, so the triple-product state could not decompose into base x height',
    severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'The parallelepiped was a single all-or-nothing visibility flag. A state whose declared motion archetype is decompose needs the solid to BUILD and then SEPARATE into the two factors the formula names; a boolean can only pop it into existence. Built as solid_build_frac (face-by-face, geometry untouched — all 6 faces written every frame, only setDrawRange moves, so the closure signature holds at every value by construction) and split_solid_frac, implemented as a VOLUME-EXACT SHEAR: a(f) = (1-f)a + f*s*h*n where n = norm(b x c), h = |a.(b x c)|/|b x c|. Then a(f).(b x c) = V for EVERY f, exact in real arithmetic rather than within a tolerance (verified independently over 200000 random triples x 5 fractions: max deviation 7.1e-15). At f = 1 the generator is perpendicular to the base, so the solid is a right prism and base x height is what the picture literally shows. The invariance IS the lesson (Cavalieri).',
    prevention_rule:
      'A solid a state must decompose is driven by 0..1 fractions ramped through the scenario closed-form evaluator, never by a visibility boolean. The decomposition is volume-exact BY CONSTRUCTION (shear the generator onto the base normal) rather than volume-preserving within a tolerance, and any piece extraction happens IN the base plane so it cannot corrupt the perpendicular measurement the picture claims — an exploded lift along the normal adds the gap to the on-screen height while the readout prints h, which is a picture measuring a different number from the one it claims.',
    probe_type: 'js_eval',
    probe_logic:
      'check:vector-geometry-3d sections 7b/7c/7d: base x height == |a.(b x c)| at every fraction to 1e-9; the base offset has zero component along norm(b x c) to 1e-12; the solid holds 12 shared-edge face pairs at every fraction; the knob -> pieces -> face-count chain replays backwards bit for bit.',
    status: 'FIXED', concepts_affected: VG, fixed_in_files: [R, VG_GATE], row_type: 'incident',
  },
  {
    bug_class: 'gate_unique_corner_count_passes_a_solid_whose_unbuilt_faces_collapsed_to_a_shared_corner',
    title: 'A unique-corner-count check is an identity check, not a validity check',
    severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'A staged solid build that collapses not-yet-built faces onto the origin still reduces to exactly 8 unique corner points, because the faces already built carry all 8 between them. A gate scoring corner count therefore passes a solid with three zero-area faces.',
    prevention_rule:
      'A geometry gate on a staged or partial solid scores PER-FACE AREA (and the shared-edge closure signature), never unique-corner count alone. Carry the weaker metric as an explicit assertion that the BROKEN fixture passes it, so it cannot be substituted back in as a simplification.',
    probe_type: 'js_eval',
    probe_logic:
      'check:vector-geometry-3d section 7b: min face area over the 6 faces > 1e-9 at every build fraction, plus an assertion that the collapse-built fixture yields exactly 8 unique corners.',
    status: 'FIXED', concepts_affected: VG, fixed_in_files: [VG_GATE], row_type: 'probe_definition',
  },

  // ─────────────────────────── VG-C ───────────────────────────
  {
    bug_class: 'parallel_direction_cross_product_is_1e17_not_zero_so_an_exact_zero_guard_ships_a_plausible_wrong_distance',
    title: 'A degeneracy guard tested with === 0 passes, because the degenerate cross product is 1e-17, not 0',
    severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'vgCommonPerp must detect parallel lines before dividing by ||d1 x d2||. Built with a 1e-9 epsilon; the gate negative control then showed WHY: d1 x (2.5 d1) evaluates to ~1e-16/1e-17 in IEEE arithmetic pointing in a numerically arbitrary direction, so the undivided-by-zero formula returns a FINITE, PLAUSIBLE distance against a materially different true parallel distance (independently reproduced: ||d1 x 2.5d1|| = 1.11e-16, formula returns 2.2000 against a true 1.9694). The gate table had predicted "division by zero / NaN". NaN is visible; a plausible number is not.',
    prevention_rule:
      'A degeneracy guard is an EPSILON, never an exact-zero test, and its negative control must assert the undetected form returns a WRONG NUMBER rather than NaN. If a control only proves NaN, it has not tested the case that actually ships.',
    probe_type: 'js_eval',
    probe_logic:
      'check:vector-geometry-3d section 9: assert 0 < ||d1 x 2.5*d1|| < 1e-9, then expectFail that |w.cr|/||cr|| agrees with the true parallel distance |w x d1_hat| to 1e-6.',
    status: 'FIXED', concepts_affected: VG, fixed_in_files: [R, VG_GATE], row_type: 'incident',
  },
  {
    bug_class: 'quad_winding_negative_control_scored_area_which_a_crossed_winding_preserves_exactly',
    title: 'The area check cannot discriminate a crossed quad winding — it tiles the same total',
    severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'Gate section 12 D2 negative control was written as an AREA comparison against a rival [corner, +U, +V, +U+V] builder. It PASSED — independently reproduced at 3.6021 vs 3.6021, bit-identical: swapping two corners re-partitions the same region rather than shrinking it. A set-of-points comparison is vacuous for the same reason. Only the ordered parallelogram identity q0+q2 == q1+q3 discriminates (0.0 vs 3.4525), and that is what a triangle strip actually consumes.',
    prevention_rule:
      'A geometry negative control must discriminate on the property the RENDERER consumes (vertex ORDER for an indexed quad), not on a rotation- or permutation-invariant summary of it (area, centroid, point set). Ship the vacuous tool alongside the working one, asserted vacuous, so it cannot be reintroduced as a simplification.',
    probe_type: 'js_eval',
    probe_logic:
      'check:vector-geometry-3d section 12(d): expectFail on the area check AND on the set-key check, then assert diag(shipped) == 0 and expectFail diag(rival) < 1e-9.',
    status: 'FIXED', concepts_affected: VG, fixed_in_files: [VG_GATE], row_type: 'incident',
  },
  {
    bug_class: 'glow_base_colour_cached_on_first_call_freezes_a_reassignable_mesh_pool_at_its_first_role',
    title: 'applyGlowEmphasis caches base colour/opacity once, which strands a per-state-reassigned mesh pool',
    severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      '_glowEachMat lazily caches _glowBaseCol/_glowBaseOp on its FIRST call and applyGlowEmphasis copies the cache back on every later frame. vector_geometry_3d lines/planes pool re-assigns each mesh to a different authored object (different role colour, different ghost opacity) as states change, so the cache would freeze the first state colour onto every later state and would undo the per-object ghost fade one frame after it applied.',
    prevention_rule:
      'A shared emphasis funnel that caches a "base" channel is only correct for meshes whose base never changes. A scenario driving colour or opacity live must REPUBLISH the base each frame, making the focal boost a multiplier on the live channel.',
    probe_type: 'js_eval',
    probe_logic:
      'Assert vgWriteLinesPlanesFrame writes m.userData._glowBaseCol/_glowBaseOp from the live material on every visible vg_lp_* member.',
    status: 'FIXED', concepts_affected: VG, fixed_in_files: [R], row_type: 'incident',
  },
  {
    bug_class: 'skeleton_geometry_block_quotes_rounded_values_the_engine_will_print_differently',
    title: 'A skeleton geometry block quotes hand-rounded values the sim will print differently',
    severity: 'MODERATE', owner_cluster: 'alex:architect',
    root_cause:
      'lines_and_planes_in_space section 11 quotes point-plane distance 2.200 and foot (1.23, -0.83, 0.00). The exact values from the authored plane and point are 2.19828 (independently verified: 2.393/sqrt(1.185)) and (1.22322, -0.82936, 0.00516). At the concept stated precision doctrine (distances 3 dp, coordinates 2 dp) the sim prints 2.198 and (1.22, -0.83, 0.01), so narration or a formula surface authored against the quoted figures contradicts the HUD beside it.',
    prevention_rule:
      'Every derived number in a skeleton geometry block is stated at the precision the SIM will print, computed from the authored inputs — never hand-rounded to a nicer value. The engine is the source of truth for a derived quantity; the authored text follows it, not the other way round.',
    probe_type: 'js_eval',
    probe_logic:
      'check:vector-geometry-3d section 8 asserts the exact closed form to 1e-12 and cross-checks the skeleton quoted figures at the measured drift.',
    status: 'OPEN', concepts_affected: ['lines_and_planes_in_space'], fixed_in_files: [], row_type: 'incident',
  },

  // ──────────────────── the value_readouts rename ────────────────────
  {
    bug_class: 'field3d_vector_geometry_authored_readouts_field_collides_with_the_fleet_static_readouts_convention',
    title: 'vg.readouts (the numeric VALUE panel) collided with vg.static_readouts (the fleet greyed SLIDER-ROW convention) — renamed to vg.value_readouts before master saw it',
    severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'Two authored per-state keys four characters apart with different meanings: vg.readouts held VALUE tokens (a.b = 5.64, Volume, point_plane_distance) while vg.static_readouts holds greyed/disabled SLIDER ROWS at the same position — 22 sites on master across ~8 scenarios, documented identically at each, authored by 7 shipped concepts (magnetic_flux, capacitance, displacement_current, ac_voltage_resistor/_capacitor/_inductor, vsepr_molecular_shapes). The established key could not move; the unshipped newcomer did. THE COLLISION WAS ALREADY COMMITTED TO PAPER: the Phase-0 survey authoring example instructed the author to write "static_readouts": ["a_dot_b"] — a VALUE token on the ROW field, which renders NOTHING because a_dot_b is not a rowIds key. A silent no-op, not an error, and a concept authored from that document would have shipped a blank readout panel and passed every gate. readouts is ALSO the authored field of three OTHER scenarios (newtons_laws_body, rigid_body_rotation, force_rig), so a blind find-and-replace was the real hazard.',
    prevention_rule:
      'A new scenario authored field name is checked against the FLEET before it ships, not only against its own block: if an established key differs from it by a few characters and means something else, the NEWCOMER is renamed to say what it contains, and the window to do it closes when the scenario reaches master. A rename inside a shared 75k-line renderer is scoped to the owning region by asserted anchors and proved by (a) a contamination grep of the diff for sibling prefixes and (b) the fleet byte-identity section — never by a file-wide replace. And a doc example is authoring input: an example carrying the defect ships the defect.',
    probe_type: 'js_eval',
    probe_logic:
      'check:vector-geometry-3d section 11b: the vg region reads d.value_readouts at exactly 3 consumers and d.readouts at 0; vg still reads d.static_readouts; nlb.readouts / rb.readouts / fr.readouts survive outside the region; value_readouts leaks 0 times outside it; static_readouts keeps >= 15 emitted sites. Controls: a simulated fleet-wide find-and-replace destroys the siblings, a plain string-presence check on "readouts" cannot discriminate, and the check FIRES on the reconstructed pre-rename source. Section 11c additionally asserts the authored union is a superset of VG_READOUT_LABEL keys (a reverse-only gate is green on the broken source and could not discriminate).',
    status: 'FIXED', concepts_affected: VG, fixed_in_files: [R, VG_GATE], row_type: 'incident',
  },

  // ─────────────────────────── SR-A ───────────────────────────
  {
    bug_class: 'field3d_cannot_draw_an_authored_curve_or_a_ticked_coordinate_frame_so_every_graph_claim_is_hardcoded_per_scenario',
    title: 'field_3d could draw no authored curve and no ticked coordinate frame, so every graph claim was hardcoded per scenario',
    severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'field_3d ships ZERO expression evaluation (no safeEval, no *_expr, no new Function — re-measured and asserted in the gate) and no reusable graph frame: the 161 fillText sites are inset graph PANES, not scene overlays, so a concept needing a curve over a ticked axis had to hardcode it. Built as SR-A of the solid_of_revolution purchase.',
    prevention_rule:
      'A curve is an authored member of a CLOSED profile enum whose every member has an analytic integral, so the gate asserts the shipped volume against a closed form to 1e-12; an unknown family THROWS rather than defaulting. The frame is flat 3D geometry (in a 3D scene math units ARE world units, so there is no data-to-pixel transform to build and it is NOT a cartesian_plane duplicate) and its tick NUMBERS are DOM nodes placed from nlbProjPx, not sprites — which dissolves all three sprite-legibility scars where a canvas-text hybrid dissolves only two.',
    probe_type: 'js_eval',
    probe_logic: 'npm run check:solid-of-revolution — sections 0/1/2/4a/8/9/10 with their negative controls.',
    status: 'FIXED', concepts_affected: SR, fixed_in_files: [R, 'src/lib/validators/visual/deriveStateMeta.ts', SR_GATE], row_type: 'incident',
  },
  {
    bug_class: 'ramp_threshold_asserted_on_the_unrounded_value_while_the_screen_shows_the_rounded_one',
    title: 'A ramp threshold measured on the un-rounded value is not the threshold the viewer sees',
    severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'The skeleton measured n=8 at 12.554% of progress (the crossing of 10^L = 8); srRampN ROUNDS, so the printed n first reads 8 at 11.385% (10^L = 7.5). One number, two spaces — the same class as the round-0 defect the skeleton itself fixed.',
    prevention_rule:
      'A gate on a quantised readout asserts BOTH the continuous crossing and the crossing of the value actually rendered, and the negative control must fail both.',
    probe_type: 'js_eval',
    probe_logic: 'check:solid-of-revolution section 8: both crossings asserted; the linear control fails both (0.402% / 0.351%).',
    status: 'OPEN', concepts_affected: SR, fixed_in_files: [SR_GATE], row_type: 'directive',
  },

  // ─────────────────────────── SR-B ───────────────────────────
  {
    bug_class: 'gate_negative_control_scores_a_permutation_invariant_count_of_the_thing_it_should_order',
    title: 'A negative control on an index ORDER scored the index COUNT and passed vacuously',
    severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'The theta-major reveal control asserted that a u-major index order exposes a different NUMBER of indices at a quarter reveal. On a 96x72 grid both orders expose 0.25*nth*nu*6 — the count is permutation-invariant, so the control passed on a build that would have revealed a growing ROD instead of a sweep. Same class as VG-C area-based control on a crossed quad winding, reproduced one dispatch later by a different agent that had been warned about it in its own prompt — the lesson does not transfer by being told, only by running the control and watching it fail.',
    prevention_rule:
      'A negative control must discriminate the property the renderer CONSUMES. Where the consumed property is an ORDER, score which elements the head of the buffer touches (extent per axis), never how many. Run every control and watch it fail before trusting it.',
    probe_type: 'js_eval',
    probe_logic:
      'Build both index orderings; take the first quarter of each buffer; assert the shipped order touches <= nth/4 rings and ALL nu samples while the broken order touches all nth rings and < nu samples, AND assert the two head lengths are EQUAL so the count-based control is shown to be blind.',
    status: 'FIXED', concepts_affected: SR, fixed_in_files: [SR_GATE], row_type: 'incident',
  },
  {
    bug_class: 'numeric_tolerance_justification_estimated_worst_case_instead_of_measuring_it',
    title: 'A summation-accuracy claim was written from a worst-case estimate and was wrong by three orders',
    severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'The compensated-summation comment and its negative control asserted naive accumulation drifts ~1.5e-10 at n = 20000, from an n*eps*sum bound. Measured: 1.2e-13, INSIDE the 1e-12 gate tolerance, so the control could never fire; the real crossing is at n ~ 2e7. The bound ignored that the slab width du scales the error down with n.',
    prevention_rule:
      'Any claim that a numerical technique is REQUIRED must be measured at the authored parameters before it is written, and the negative control must be run at parameters where the naive form genuinely fails. State the measured crossing point, not an asymptotic bound.',
    probe_type: 'js_eval',
    probe_logic:
      'For each compensated accumulator, run the naive twin at the authored n and at 10x/1000x it; assert the control stated failure threshold is one the naive twin actually crosses, and record the crossing n in the comment.',
    status: 'FIXED', concepts_affected: SR, fixed_in_files: [R, SR_GATE], row_type: 'incident',
  },
  {
    bug_class: 'camera_frame_fill_reported_in_isotropic_tangent_units_as_a_fraction_of_frame_height',
    title: 'A design frame-fill number was 2r/D in tangent units, presented as a percentage of frame height',
    severity: 'MAJOR', owner_cluster: 'alex:architect',
    root_cause:
      'The explore-camera solve reported the min-corner screen span as 17.7% of frame height. 2r/D = 1.6/9 = 17.8% is the ISOTROPIC TANGENT span; the frame fraction divides by tan(fov/2) and by the 2-NDC frame height, giving 15.4%. This is the same units confusion as the wave central defect (a projection helper returning NDC where an isotropic angle was needed, shearing every screen angle by 1.78x at 16:9) — but in the OPPOSITE direction: fill reported in angle units instead of NDC.',
    prevention_rule:
      'Angles and shape ratios are scored in isotropic tangent units; frame fill and containment are scored in NDC and nowhere else. Every camera claim states which of the two it is in, beside the FOV and the reference aspect — a camera number without those four beside it is not measured.',
    probe_type: 'js_eval',
    probe_logic:
      'For every authored camera claim of the form "spans X % of frame height", recompute as (ndcYmax - ndcYmin)/2 at the stated FOV and aspect and assert agreement to 0.5 points; a claim matching 2r/D instead is this bug.',
    status: 'OPEN', concepts_affected: SR, fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'glow_peer_dim_makes_a_translucent_volume_more_opaque_than_it_started',
    title: 'The generic glow pass rewrites opacity, so a ghost surface is DIMMED into being twice as solid',
    severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'applyGlowEmphasis sets a focal to opacity 1.0 and a peer to GLOW_DIM_OPACITY = 0.40. For a mesh you must see THROUGH, both invert the intent: a focal disc stack at 1.0 occludes the axis, region and curve inside it (the occlusion half of the OPEN row glow_focal_fr_ring_whiteouts_the_ring_and_occludes_it), and a 0.20 ghost skin is made 2x MORE opaque by being a PEER.',
    prevention_rule:
      'A scenario whose meshes are translucent by design passes brightenOnly for those meshes so the glow pass never rewrites opacity; the peer dim is carried by the opaque line objects. Emphasis on a volume is colour and emissive, never alpha.',
    probe_type: 'js_eval',
    probe_logic:
      'For every field_3d scenario with a material whose base opacity is below GLOW_DIM_OPACITY, assert its glow map entry passes brightenOnly = true; and at runtime assert no focal treatment raises a translucent mesh opacity above its authored base.',
    status: 'FIXED', concepts_affected: SR, fixed_in_files: [R], row_type: 'incident',
  },
];

// VG-A's row was deliberately left OPEN on the doctrine "a row is FIXED only
// when master carries the thing it describes". PR #75 (1de76ad) and PR #77
// (3ae9047) are merged, so it is now FIXED.
const FLIP_TO_FIXED = [
  'field3d_has_no_generic_two_vector_scenario_so_every_vector_claim_is_hardcoded_per_physics_scenario',
];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string {
  return a.length ? `ARRAY[${a.map(sqlStr).join(', ')}]::text[]` : `ARRAY[]::text[]`;
}
function sqlRow(r: Row): string {
  return `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(SESSION)}, ${sqlStr(r.row_type)})`;
}
function emitSql(all: Row[]): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type';
  return `-- 2026-08-08/09 — the 3D-geometry wave's scar harvest (13 rows drafted across VG-B, VG-C,\n` +
    `-- the value_readouts rename, SR-A and SR-B; every dispatch carried "no DB writes", so they\n` +
    `-- existed only as agent-report text — the AMENDMENT A20 failure mode at scale).\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_3d_geometry_wave.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files;\n\n` +
    `-- VG-A's row: master now carries the scenario (PR #75 1de76ad, PR #77 3ae9047).\n` +
    FLIP_TO_FIXED.map((b) => `UPDATE engine_bug_queue SET status = 'FIXED' WHERE bug_class = ${sqlStr(b)};`).join('\n') + '\n';
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-08-09_seed_engine_bug_queue_3d_geometry_wave_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} row(s))`);

  const payload = rows.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ upserted ${payload.length} engine_bug_queue row(s)`);

  for (const bug_class of FLIP_TO_FIXED) {
    const { data, error: e } = await supabaseAdmin.from('engine_bug_queue')
      .update({ status: 'FIXED', fixed_at: new Date().toISOString() })
      .eq('bug_class', bug_class).select('bug_class');
    if (e) { console.error(`✗ flip failed for ${bug_class}: ${e.message}`); process.exit(1); }
    console.log(data && data.length ? `✓ ${bug_class} -> FIXED` : `· not present: ${bug_class}`);
  }
}

main();
