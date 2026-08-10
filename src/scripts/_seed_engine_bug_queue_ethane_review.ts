/**
 * engine_bug_queue — conformations_of_ethane review round (2026-08-10).
 *
 * ELEVEN rows: NINE from the eye_walker's frame walk (the first eyes ever on
 * `organic_structure`) and TWO from the quality_auditor.
 *
 * The two reviewers DISAGREED, and the disagreement is the point:
 *   quality_auditor  → PASS (every machine gate green; the Phase-0 zero-renderer-edit
 *                      doctrine independently verified against an empty engine diff)
 *   eye_walker       → 3 FAIL states, 3 CONCERN, 1 PASS
 * Both are right. The auditor explicitly deferred the visual walk, so its PASS is a
 * pass on everything EXCEPT the pixels — and the pixels are where the failures are.
 * This is the case the parallel dispatch exists to catch.
 *
 * The headline defect: at phi = 0 the eclipsed hydrogens are NOT COUNTABLE. The
 * camera solve optimised atom-disc vs atom-disc clearance; the actual occluder is
 * the front C-H BOND cylinder. A student watching STATE_3 sees six hydrogens become
 * three and is told "eclipsed" — the picture argues the opposite of the caption, and
 * inverts the conservation claim the concept exists to make.
 *
 * Idempotent: upsert onConflict 'bug_class'.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_ethane_review.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'eye_walk_ethane_2026-08-10';
const R = 'src/lib/renderers/field_3d_renderer.ts';
const G = 'src/scripts/check_organic_structure.ts';
const J = 'src/data/concepts/chemistry/conformations_of_ethane.json';
const ETH = ['conformations_of_ethane'];
const ORG = ['conformations_of_ethane', 'organic_structure'];
const ALL = ['conformations_of_ethane', 'conformations_of_butane', 'cyclohexane_chair_flip', 'organic_structure'];

interface Row {
  bug_class: string; title: string; severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
  owner_cluster: string; root_cause: string; prevention_rule: string;
  probe_type: 'sql' | 'js_eval' | 'manual' | 'vision_model'; probe_logic: string;
  status: 'OPEN' | 'FIXED'; concepts_affected: string[]; fixed_in_files: string[];
  row_type: 'incident' | 'probe_definition' | 'directive';
  subject?: string; state_id?: string;
}

const rows: Row[] = [
  {
    bug_class: 'newman_back_atom_disc_clears_the_front_atom_disc_and_is_swallowed_by_the_front_bond_cylinder',
    title: 'Eclipsed hydrogens are uncountable because the countability solve never put bonds in the obstacle set',
    severity: 'CRITICAL', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'ORG_HOME_GAP_FLOOR and the dist-8 camera solve measure clearance between drawn ATOM DISCS only. In a Newman projection at phi=0 the back hydrogen projects onto the same screen ray as the front C-H bond at intermediate radius: measured at 1x, a 19x22 px back-H disc sits at r=88 behind a 14 px opaque front-bond cylinder spanning r=52..128. About 30 percent of the disc survives as two 3 px slivers. The frame the concept exists to deliver shows three hydrogens, and the sweep to it reads as hydrogens vanishing, which inverts conservation.',
    prevention_rule:
      'A countability solve enumerates EVERY drawn primitive as an occluder, not only spheres: bonds, rims, arcs, measurement annotations and labels all enter the obstacle set with their rendered screen widths. Where an eclipsing pose is the taught content, ship an explicit legibility device (a small authored back-set offset with the true torsion still published to the HUD, a back-bond stroke narrower than the back-atom disc, or a distinguishing back-set colour/outline) rather than relying on camera distance. The acceptance criterion is the number of SEPARATELY VISIBLE atom regions at the worst-case pose, not a scalar gap.',
    probe_type: 'js_eval',
    probe_logic:
      "At the authored camera for every state that renders a Newman view, rasterise the depth-sorted scene at phi in {0,1,2,5,10} and count 4-connected components of unoccluded atom pixels whose area exceeds 60 percent of the atom's unoccluded disc area. Assert the count equals the atom count the HUD publishes. Negative control: at phi=60 the same probe returns the full count.",
    status: 'OPEN', concepts_affected: ALL, fixed_in_files: [R, G], row_type: 'incident',
    subject: 'chemistry', state_id: 'STATE_3',
  },
  {
    bug_class: 'newman_rim_convention_applies_at_state_apply_instead_of_when_the_sight_line_reaches_the_bond_axis',
    title: 'A camera-travel state opens on a molecule with one carbon deleted because the projection convention fires before the camera arrives',
    severity: 'CRITICAL', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'camera.newman is read once at apply, so the back carbon is withheld, its label dropped and its bonds re-rooted to a rim circle from t=0 while the camera is still at the authored side view (az 180 / el 6). STATE_2 therefore opens on ethane with one carbon missing and a circle floating where it should be, with three bond stubs at geometrically meaningless angles, and holds that picture for most of a 12.5 s flight whose whole purpose is teaching how the projection is formed.',
    prevention_rule:
      'The rim treatment is a CONTINUOUS function of the angle between the view direction and the torsion bond axis, not a boolean read at apply: full ball-and-stick outside a threshold, cross-faded to the rim inside it. A state whose camera travels to the axis therefore shows a real two-carbon molecule until the projection is actually the projection. A convention that is only true at one camera pose may never be rendered at any other.',
    probe_type: 'js_eval',
    probe_logic:
      'For every state declaring camera.newman with camera_steps, sample the flight at 10 percent intervals and assert: while the view-to-axis angle exceeds the threshold the back carbon mesh is visible and its label is present; inside the threshold the rim is drawn and the back sphere is withheld; and no frame renders a rim while the back carbon is more than one atom radius off the projected front-carbon centre.',
    status: 'OPEN', concepts_affected: ALL, fixed_in_files: [R], row_type: 'incident',
    subject: 'chemistry', state_id: 'STATE_2',
  },
  {
    bug_class: 'graph_overlay_annotation_is_painted_without_measuring_it_against_the_panel_clip_rect',
    title: 'The single payoff number of a state renders as barrier 12.0 kJ.mo and is cut at the panel border',
    severity: 'CRITICAL', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      "The barrier caption is drawn at a coordinate derived from the bracket position with no measureText check against the plot clip rect. Measured: the label's last yellow pixel is x=363 and the panel border is x=362..363. The state teaching that the barrier is 12 kJ.mol-1 renders the unit amputated. No deterministic check reads rendered text extents, so 32/32 passed with the payoff broken.",
    prevention_rule:
      'Every canvas-drawn overlay string is measured with measureText and placed inside the panel clip rect before it is painted; a string that cannot fit is re-anchored to the opposite side or wrapped deliberately, never allowed to run off. A gate asserts, for each state, that no drawn text bounding box intersects a panel boundary.',
    probe_type: 'js_eval',
    probe_logic:
      'Instrument the graph painter to record every fillText call as {text, x, y, width, height}. For every state assert box.x >= clip.x and box.x+box.width <= clip.x+clip.width, same for y. Negative control: a deliberately long unit string trips the assertion.',
    status: 'OPEN', concepts_affected: ORG, fixed_in_files: [R], row_type: 'incident',
    subject: 'chemistry', state_id: 'STATE_5',
  },
  {
    bug_class: 'barrier_bracket_anchored_to_a_registry_extremum_instead_of_the_extremum_the_pose_reaches',
    title: 'The barrier is measured at a peak the molecule never visits while the rider glows at a different peak',
    severity: 'MAJOR', owner_cluster: 'alex:chemistry_author',
    root_cause:
      'show_barrier draws the bracket at a fixed curve extremum (phi ~ 241) for the whole state while the authored sweep carries the rider from 0 to 120 and stops on the SECOND peak. Two yellow emphases sit at different x, and the causal link the state teaches - you just climbed this, and it cost 12 - is broken because the measurement is not made where the student is watching.',
    prevention_rule:
      'A bracket, arc or callout that measures a transformation is anchored to the extremum the authored sweep actually reaches, resolved from the sweep endpoint, not to a registry index. Where a state ends on an extremum, the instrument and the rider share one x. Rule 32e: one glow focal at a time.',
    probe_type: 'sql',
    probe_logic:
      'For every state with energy.show_barrier true, assert the bracket coordinate equals the extremum nearest torsion.phi_deg (the sweep endpoint), and that no two glow-emphasised overlays are painted at different coordinates in the same frame.',
    status: 'OPEN', concepts_affected: ETH, fixed_in_files: [J], row_type: 'incident',
    subject: 'chemistry', state_id: 'STATE_5',
  },
  {
    bug_class: 'unicode_superscript_minus_has_no_glyph_in_the_hud_and_serif_faces_so_one_authored_string_renders_three_ways',
    title: 'kJ.mol-1 renders correctly in the DOM caption, as a baseline hyphen in the HUD, and as a raised macron in the formula surface',
    severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'The authored strings are real Unicode (U+207B U+00B9) and Rule 34c is satisfied at the source. The rendered pixels are not: the monospace HUD face has no U+207B and falls back to a baseline hyphen, so the HUD reads kJ.mol-1; the serif formula and graph-axis face substitutes a cap-height macron, so the formula reads kJ.mol with an overbar and a 1. Only the sans DOM caption is right. A source-string sweep passes while two of three text paths render the wrong glyph.',
    prevention_rule:
      "The Unicode sweep is a RENDERED-GLYPH check, not a source-string check. For every font stack used by the renderer (DOM overlay, canvas monospace HUD, canvas serif formula, 3D sprite labels), assert every superscript, subscript and typographic character in the concept's rendered strings has a real glyph - measureText width and baseline offset must differ from the .notdef/fallback for that face - or restrict the character set per face and rasterise a two-glyph composite instead.",
    probe_type: 'js_eval',
    probe_logic:
      'For each renderer font stack, render each of U+207B U+00B9 U+00B2 U+2082 U+2086 U+00B0 U+00B7 U+03C6 in isolation and compare the ink bounding box to the same glyph in a face known to have it. Assert the vertical centroid of U+207B sits above the x-height midline. Negative control: U+0000 must fail the same probe.',
    status: 'OPEN', concepts_affected: ORG, fixed_in_files: [R], row_type: 'incident',
    subject: 'chemistry', state_id: 'ALL_STATES',
  },
  {
    bug_class: 'authored_camera_bypasses_the_engines_own_bond_angle_legibility_criterion_that_the_home_pose_must_pass',
    title: 'The opening frame of the first organic sim shows a tetrahedral carbon whose projected bond angles are 83, 87 and 177 degrees',
    severity: 'MAJOR', owner_cluster: 'alex:chemistry_author',
    root_cause:
      "ORG_HOME (az 254 / el 18) was solved against two joint criteria including at least one C-C-H arc within 4.0 degrees of its 109.5 label. STATE_1 authors its own pose (az 180 / el 6) chosen as the argmax of the disc-gap metric alone, and the angle criterion was never re-applied. Measured on the frozen frame, C1's three projected C-C-H arcs are 83.3, 87.1 and 177.4 degrees - the best is 22 degrees off 109.5, five times the engine's own tolerance - so the near methyl reads as a flat T. The underlying geometry is correct (STATE_2's Newman measures 120 degree spacing with an exact 60 degree stagger); it is the authored viewpoint that hides it.",
    prevention_rule:
      'Any state that authors camera instead of reaching the solver re-runs the SOLVER\'S FULL acceptance set at the authored pose and records the achieved figures beside the authored numbers, exactly as ORG_HOME does. A pose is not accepted on one metric. For a molecule\'s introducing state, "does a tetrahedral centre read as tetrahedral" is an acceptance criterion, not a preference.',
    probe_type: 'js_eval',
    probe_logic:
      'For every state authoring an explicit camera on organic_structure, compute all projected X-C-Y arcs at the pinned instant and assert at least one is within 4.0 degrees of its ideal, and that no arc at a taught centre falls below 95 degrees where the ideal is 109.5. Report achieved values in check:organic-structure.',
    status: 'OPEN', concepts_affected: ORG, fixed_in_files: [J, G], row_type: 'incident',
    subject: 'chemistry', state_id: 'STATE_1',
  },
  {
    bug_class: 'explore_control_labelled_turn_speed_reads_zero_while_an_independent_torsion_driver_turns_the_molecule',
    title: 'The teacher sandbox shows Turn speed 0 degrees per second for the entire state while phi advances at 24',
    severity: 'MAJOR', owner_cluster: 'alex:chemistry_author',
    root_cause:
      'STATE_7 authors torsion.continuous = 24 and a spin control defaulting to 0. Both are rendered: phi advances 48 degrees every 2 s across all 31 dense frames while the panel row reads Turn speed: 0 degrees per second with its handle pinned left. Whatever the two fields mean in the engine, the rendered control contradicts the rendered motion, and a teacher reaching for the control to stop the rotation finds it already at zero.',
    prevention_rule:
      'Every motion a sandbox renders is driven by exactly one authored source, and the control that names that motion is initialised FROM it. Two independent drivers for one visible motion are rejected at validate time. A control label must name the quantity its slider actually changes.',
    probe_type: 'sql',
    probe_logic:
      "For any state with mode explore, assert that no two fields drive the same visible degree of freedom, and that each rendered control's displayed value equals the driver's live value at t=0. Negative control: torsion.continuous non-zero with spin default 0 must fail.",
    status: 'OPEN', concepts_affected: ETH, fixed_in_files: [J], row_type: 'incident',
    subject: 'chemistry', state_id: 'STATE_7',
  },
  {
    bug_class: 'three_consecutive_states_pin_on_poses_a_molecular_symmetry_renders_identically',
    title: 'STATE_5 and STATE_6 freeze on molecule pixels that are byte-identical, and STATE_4 differs by 0.31 percent',
    severity: 'MAJOR', owner_cluster: 'alex:chemistry_author',
    root_cause:
      "The sweeps end at phi 358, 120 and 240. Ethane's three-fold symmetry with six identical hydrogens renders those three poses identically: diffed over the molecule region, STATE_5 vs STATE_6 is 0 changed pixels and STATE_4 vs STATE_5 is 426. For three consecutive states the taught object does not change at all and the entire delta is carried by overlay text. Rule 32d asks that at every click the only visible change IS the new thing; here there is no visible change in the thing itself.",
    prevention_rule:
      "When choosing sweep endpoints for a molecule with rotational symmetry of order n, enumerate the symmetry-equivalent poses first and assert that consecutive states' pinned poses are not in the same orbit. Where the physics forces the same pose, the state must carry a distinct visible marker (an origin-traced hydrogen kept visually distinct, a different camera framing) so the frozen frames differ in the apparatus, not only in the caption.",
    probe_type: 'js_eval',
    probe_logic:
      'For each adjacent state pair, diff the frozen frames over the apparatus bounding box excluding all overlays, and assert more than 1 percent of pixels changed. Report the symmetry order of the authored molecule alongside the pinned phi values.',
    status: 'OPEN', concepts_affected: ['conformations_of_ethane', 'conformations_of_butane', 'cyclohexane_chair_flip'],
    fixed_in_files: [J], row_type: 'incident',
    subject: 'chemistry', state_id: 'STATE_6',
  },
  {
    bug_class: 'engine_bug_queue_reader_indexes_only_the_physics_concept_directory_so_every_chemistry_probe_returns_a_false_all_clear',
    title: 'query_engine_bug_queue --field3d and --scenario cannot see src/data/concepts/chemistry and report no matching rows',
    severity: 'MAJOR', owner_cluster: 'peter_parker:runtime_generation',
    root_cause:
      'loadConceptIndex() reads src/data/concepts non-recursively, so the seventeen chemistry concepts in src/data/concepts/chemistry are absent from the derived fleet. --scenario organic_structure answers "no concept declares scenario_type organic_structure" for a live scenario with three concepts and thirty seeded rows, and --field3d silently omits every chemistry concept. This is the same class as the 2026-08-02 hand-maintained-array scar the derivation was built to end, and it produces a FALSE ALL-CLEAR on the exact pre-walk step the eye_walker and quality_auditor contracts mandate.',
    prevention_rule:
      'The concept index walks the concept tree RECURSIVELY and asserts a non-zero count per subject directory at startup, refusing to run rather than returning an empty result when a declared subject directory contributes zero concepts. Every probe that can return zero rows prints the query it ran, so a wrong probe is distinguishable from an empty table.',
    probe_type: 'sql',
    probe_logic:
      'Assert loadConceptIndex() returns at least one concept from each immediate subdirectory of src/data/concepts, and that --scenario resolves every scenario_type declared anywhere in the tree. Negative control: a fabricated scenario name still reports not-found.',
    status: 'OPEN', concepts_affected: ORG, fixed_in_files: ['src/scripts/query_engine_bug_queue.ts'],
    row_type: 'incident', subject: 'chemistry', state_id: 'ALL_STATES',
  },
  // ── quality_auditor ────────────────────────────────────────────────────────
  {
    bug_class: 'skeleton_retains_superseded_numbers_after_a_chemistry_block_disagreement_is_accepted_and_the_next_concept_clones_the_stale_table',
    title: 'The design of record kept pre-retime numbers at six places after the retime shipped',
    severity: 'MAJOR', owner_cluster: 'alex:architect',
    root_cause:
      'When a downstream author files a disagreement the founder ACCEPTS and json_author ships, the skeleton remains the design of record but is amended only where the disagreement quoted it. conformations_of_ethane shipped the retime (ease_ms 9500->12500, pin 11300->14300, words 26-29->35) while the skeleton kept the old numbers at lines 133, 179, 194, 336, 402 and 412. The block itself warned the arithmetic would otherwise propagate into conformations_of_butane, which will clone this table.',
    prevention_rule:
      'An accepted disagreement is applied to EVERY occurrence of the superseded value in the skeleton in the same change, not just the cell the disagreement quoted - including prose restatements. Same rule for the archetype catalog: archetypes coined in a skeleton are promoted into docs/patterns/chemistry.md before a sibling clones the control table, or the catalog silently stops being the audit surface it declares itself to be.',
    probe_type: 'manual',
    probe_logic:
      'For each accepted disagreement, grep the skeleton for every superseded literal (old ms values, old word budgets, prose restatements like "over 9.5 seconds") and assert zero hits. Separately assert every archetype named in a shipped skeleton control table appears in docs/patterns/chemistry.md marked [LIVE].',
    status: 'OPEN', concepts_affected: ALL,
    fixed_in_files: ['docs/concepts/chemistry/conformations_of_ethane_skeleton.md', 'docs/patterns/chemistry.md'],
    row_type: 'incident', subject: 'chemistry',
  },
  {
    bug_class: 'eye_manifest_counts_skipped_checks_as_passed_so_a_32_of_32_headline_hides_that_the_per_state_motion_assertion_never_ran',
    title: 'THE EYE reported 32/32 while 8 of the 32 were skips, including the motion check on every state',
    severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'A check that did not execute is not a pass. On conformations_of_ethane the headline read 32/32 while 8 checks were skips (D5 on all seven states - "motion expectation unknown" - plus H2 with no approved baseline), so the per-state motion assertion for a Rule-31 no-static-state concept never ran; the claim had to be reconstructed by hand from D6 frame-delta profiles. A new scenario_type that deriveStateMeta cannot classify should surface as an explicit UNCLASSIFIED warning, not a silent skip.',
    prevention_rule:
      "THE EYE's check_summary reports executed/skipped/failed as three separate counts, and a skip is never summed into passed. A scenario_type the motion classifier cannot resolve raises an explicit UNCLASSIFIED warning naming the scenario, so a new engine surface cannot silently opt out of the motion lens.",
    probe_type: 'js_eval',
    probe_logic:
      "Parse .visual_runs/<id>/<ts>/manifest.json: assert check_summary exposes an executed count distinct from passed, and assert count(checks where evidence LIKE 'Skipped%') equals summary.skipped. Then assert that for every state of a concept whose states declare motion, at least one EXECUTED (non-skipped) check asserts per-state motion.",
    status: 'OPEN', concepts_affected: ORG,
    fixed_in_files: ['src/scripts/visual_eyes.ts', 'src/lib/validators/visual/deriveStateMeta.ts'],
    row_type: 'incident', subject: 'chemistry',
  },
];

async function main() {
  const payload = rows.map((r) => ({ ...r, discovered_in_session: SESSION, fixed_at: null }));
  const { error } = await supabaseAdmin
    .from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ upserted ${payload.length} engine_bug_queue row(s)`);
  for (const r of rows) console.log(`  · [${r.severity}] ${r.bug_class.slice(0, 78)} (${r.owner_cluster})`);
}

main();
