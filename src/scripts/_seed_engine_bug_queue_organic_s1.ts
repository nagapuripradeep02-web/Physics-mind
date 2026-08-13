/**
 * engine_bug_queue — organic dispatch S1 (`organic_structure_substrate`) scar harvest (2026-08-09).
 *
 * SIX rows from the field3d-surgeon S1 build. Unlike the thirteen Checkpoint-A
 * design rows, these are ENGINE scars found while building, and all six ship
 * FIXED with their prevention rule already asserted by
 * `npm run check:organic-structure` (115 assertions, 0 failures).
 *
 * The two CRITICAL rows are the ones that would have propagated across all 32
 * organic sims:
 *   - a DEFERRED enum split written per WAVE rather than per DISPATCH is
 *     vacuous, and lets an unimplemented member render a default scene;
 *   - `molecule` / `energy.curve` / `substituents[].group` are growable DATA
 *     TABLES, not vocabularies, and freezing them guarantees a reopen.
 *
 * Agent emits SQL text only; the session seeds it (AMENDMENT A20).
 * Idempotent: upsert onConflict 'bug_class'.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_organic_s1.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'organic_s1_substrate_2026-08-09';

type Owner = 'alex:architect' | 'alex:chemistry_author' | 'alex:json_author'
  | 'peter_parker:field3d_surgeon' | 'ambiguous';
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
const G = 'src/scripts/check_organic_structure.ts';

const rows: Row[] = [
  {
    bug_class: 'closed_enum_deferred_split_written_per_wave_not_per_dispatch_lets_an_unimplemented_member_render_a_default_scene',
    title: 'A DEFERRED enum list scoped to a future WAVE is vacuous: members owned by an unlanded dispatch in the same wave render silently',
    severity: 'CRITICAL', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      "P2-6 (deferred_enum_members_must_be_declared_not_merely_unimplemented) was drafted with DEFERRED meaning \"belongs to a later wave\". Under that reading organic_structure's pucker/mirror/compare/lift/rewire/block_twist are all \"implemented after A3\" and therefore not deferred at dispatch S1 — so a state authoring mode:pucker at S1 would pass every assertion and silently render a default scene, the exact failure the row exists to prevent. Deferral is a property of WHAT RUNS TODAY, not of a wave label. The same applies one level down at FIELD granularity: torsion.ramp_ms is A1's half of a block S1 implements statically, and accepting it silently is accepted-but-ignored.",
    prevention_rule:
      'IMPLEMENTED is what the current dispatch actually runs; DEFERRED is every other member of the frozen union, each carrying its owning dispatch id. The split moves as dispatches land, the union never does. Every DEFERRED member AND every deferred FIELD PATH must be rejected loudly at apply (console error + on-canvas banner naming the owner), never silently defaulted. The gate asserts the three P2-6 assertions over EVERY closed enum, not only the one the findings touched.',
    probe_type: 'js_eval',
    probe_logic:
      'For each closed enum: assert union(IMPLEMENTED, DEFERRED) equals the contract list transcribed from the DOCS (not from the renderer); assert the intersection is empty; assert every DEFERRED member names an owner. Then call the member gate on every deferred member and assert it returns false and pushes a reject, and on every implemented member and assert it returns true with zero rejects. Then scan the per-frame function source for a dispatch on any deferred member. npm run check:organic-structure sections 1 and 2.',
    status: 'FIXED', concepts_affected: ['cyclohexane_chair_flip', 'conformations_of_ethane'],
    fixed_in_files: [R, G], row_type: 'incident',
  },
  {
    bug_class: 'closed_enum_freeze_applied_to_a_growable_table_key_set_molecule_energy_curve_substituent_group',
    title: 'Freezing molecule / energy.curve / substituent group as CLOSED ENUMS guarantees a reopen: they are data tables, not vocabularies',
    severity: 'CRITICAL', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'The drafted organic_structure contract closed `molecule` over 8 members, `energy.curve` over 3 and `substituents[].group` over 8, having diffed them only against the seven Wave O-0 concepts. Walked against all 32: energy.curve ships alongside coordinate:reaction, which needs one curve per mechanism (12 in O-2 alone); molecule needs benzene/chlorobenzene/phenol/carboxylic acids/amines; group needs at minimum NO2, OMe, CN, phenyl, F, I, CHO, OR (#24 directing effects alone needs a meta director and an o/p director). A closed enum is a fixed VOCABULARY whose members bind rendering behaviour; a table key set is DATA whose rows carry a geometry or a literature value. Freezing the second as the first forces either an enum reopen across shipped concepts or a second code path for one idea.',
    prevention_rule:
      'Before freezing, classify each declared set: does a new member require NEW RENDERING BEHAVIOUR (vocabulary → closed enum, freeze over the whole served set) or only a NEW DATA ROW with a verified geometry/value (table key set → growable, never frozen)? The safety property for a key set is closure AGAINST THE TABLE, asserted by the gate: every authored key resolves to a registry row, every row produces a valid object, and a declared-but-unbuilt row is rejected loudly with its owning dispatch.',
    probe_type: 'js_eval',
    probe_logic:
      'Assert the molecule table has more rows than the drafted enum had members and that every row generates a non-empty geometry; assert every declared-but-unbuilt key carries an owner; assert no ORG_ENERGY_CURVES/ORG_CURVES constant exists in the renderer (the curve registry is a published-value table shipped by S2, not an enum frozen at S1). npm run check:organic-structure section 1, the FF-2 block.',
    status: 'FIXED',
    concepts_affected: ['cyclohexane_chair_flip', 'conformations_of_ethane', 'conformations_of_butane'],
    fixed_in_files: [R, G], row_type: 'incident',
  },
  {
    bug_class: 'orthographic_centre_only_camera_solve_does_not_survive_the_perspective_resolve_at_real_atom_disc_radii',
    title: 'A design-time countability solve in parallel projection on atom CENTRES passes while the shipped perspective camera at real disc radii fuses the atoms the narration counts',
    severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'The cyclohexane skeleton solved the HOME camera offline in an orthographic projection over atom CENTRES and reported a 0.570 A minimum pairwise separation at az 254, el 10-12, calling the window ~2 deg wide. Re-solved in the shipped perspective camera at the real drawn disc radii, that pose overlaps the closest pair by 0.145 scene units: two atoms the caption counts render as one blob. Three separate causes compounded — perspective magnification varies across the molecule, the VSEPR radius table is solved for a 5-atom centre and is too fat at 18 atoms, and a centre-separation metric ignores the radii entirely. A pure gap maximiser then over-corrects: elevation buys countability and spends projected-angle fidelity at ~0.20 deg per degree, so maximising the gap climbed to el 39 and broke the 4.0 deg angle criterion (6.55 deg error).',
    prevention_rule:
      'A design-time camera solve is an ESTIMATE until re-run in the shipped projection at the shipped disc radii, and the surgeon reports the achieved figures. The solve must optimise EVERY acceptance criterion jointly, not the one that is easiest to measure: take the LOWEST elevation clearing a countability FLOOR rather than the elevation maximising the gap. Where one authored pose cannot serve every molecule in the table, the HOME pose is SOLVED PER MOLECULE (memoised, pure, so a freeze pin reproduces it) rather than authored once. Measure in isotropic screen units (camX/camZ, camY/camZ), never in NDC.',
    probe_type: 'js_eval',
    probe_logic:
      'Sweep azimuth x elevation over all atoms of every molecule in the table, computing the minimum pairwise gap between projected atom DISCS (centre distance minus both perspective-scaled radii) in isotropic screen units; assert > 0 at each solved HOME. Negative controls: assert the shared authored default is NOT countable for at least one molecule (proving the per-molecule solve is load-bearing), and assert the un-scaled radius table FUSES the 18-atom skeleton at the same pose (proving the display scale is load-bearing). Assert at least one instance of the arc the state actually draws reads within 4.0 deg of its label. npm run check:organic-structure section 6.',
    status: 'FIXED', concepts_affected: ['cyclohexane_chair_flip', 'conformations_of_butane'],
    fixed_in_files: [R, G], row_type: 'incident',
  },
  {
    bug_class: 'waypoint_enum_member_resolving_to_one_coordinate_value_cannot_name_a_return_leg_on_an_out_and_back_path',
    title: 'A path waypoint enum with one member per SHAPE is unauthorable on an out-and-back walk: the return legs revisit the same shapes at different coordinates',
    severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      "pucker.waypoint was frozen as chair | half_chair | twist_boat | boat | chair_alt, one member per named conformer. The chair-flip path is out-and-back: it visits half-chair at u=0.22 AND u=0.78, and twist-boat at u=0.36 AND u=0.64. A waypoint that resolves to a single u therefore cannot name legs 5 and 6, so the skeleton's authored seven-leg S5 walk was unauthorable as drafted. Found only by walking the enum in the direction the audit had skipped (every AUTHORED beat must map to a member), not by the direction it ran (every member must have a consumer) — the primed shapes have consumers, they just have no members.",
    prevention_rule:
      'When an enum names positions on a path, walk it against the authored WALK, not against the list of distinct shapes: any path that revisits a shape needs a distinct member per visit (or an explicit coordinate, never a direction-inferred one, which is fragile). Run the enum audit in BOTH directions over the authored choreography of the deepest consumer, not only over its vocabulary.',
    probe_type: 'manual',
    probe_logic:
      "Read the deepest consumer's authored walk table leg by leg and assert every leg names a member that resolves to that leg's own coordinate. For organic_structure: skeleton section 5 row S5, seven legs, against ORG_WAYPOINTS.",
    status: 'FIXED', concepts_affected: ['cyclohexane_chair_flip'],
    fixed_in_files: [R, G], row_type: 'incident',
  },
  {
    bug_class: 'new_scenario_type_union_lives_outside_the_emitted_template_literal_so_a_source_scan_of_the_renderer_code_cannot_see_it',
    title: 'A registration probe that scans FIELD_3D_RENDERER_CODE silently passes a scenario that was never added to the scenario_type union',
    severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'field_3d_renderer.ts is two things: a TypeScript module with the Field3DConfig interface, and one giant template literal holding the emitted renderer body. The scenario_type union is a TS type in the FIRST half; every dispatch chain (buildScenario, applyState, animate, the #sliders NOT-list, the formula-hide chain, the legend suppression, the snap set) is in the SECOND. A gate script that imports FIELD_3D_RENDERER_CODE and greps it therefore verifies seven of the eight registration sites and reports the eighth as present when it is absent.',
    prevention_rule:
      'A registration probe must scan BOTH surfaces: FIELD_3D_RENDERER_CODE for the emitted dispatch chains and the renderer MODULE source (readFileSync of the .ts) for anything that is a TypeScript type. Include a negative control that a fabricated scenario name is absent from both, so the scan is proven able to fail.',
    probe_type: 'js_eval',
    probe_logic:
      'Assert the scenario_type union member matches against readFileSync of src/lib/renderers/field_3d_renderer.ts, and every dispatch chain against FIELD_3D_RENDERER_CODE; assert a fabricated scenario name matches neither. npm run check:organic-structure section 5.',
    status: 'FIXED', concepts_affected: ['cyclohexane_chair_flip'],
    fixed_in_files: [G], row_type: 'incident',
  },
  {
    bug_class: 'new_field3d_scenario_prefix_collides_with_a_shipped_sibling_abbreviation',
    title: 'The spec-document prefix OS_ for organic_structure was already 380 orbital_shapes identifiers in the same file',
    severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'Three planning documents specified organic_structure’s constants as OS_MOLECULES, OS_HUD_LINES, OS_MODES_IMPLEMENTED. field_3d_renderer.ts already carries 380 OS_ identifiers belonging to orbital_shapes (OS_ELEMENTS, OS_CAMERAS, OS_GLOW_ELS, ...). Declaring OS_MOLECULES would have shadowed or collided inside the shared IIFE scope, and the failure would have surfaced as orbital_shapes rendering wrongly on a concept that never mentions organic chemistry.',
    prevention_rule:
      "Before naming a new scenario's prefix, grep the renderer for the abbreviation in BOTH cases (var PREFIX_ and function prefixCamel) and count the hits. A non-zero count means pick another prefix and record the deviation from the spec document in the code header. The gate asserts the chosen prefix exists and the colliding one was not introduced.",
    probe_type: 'js_eval',
    probe_logic:
      'Assert the renderer contains no "var OS_MOLECULES" and does contain "var ORG_U_PER_A"; more generally, assert the new scenario’s constants share no identifier with any sibling prefix. npm run check:organic-structure section 5.',
    status: 'FIXED', concepts_affected: ['cyclohexane_chair_flip'],
    fixed_in_files: [R], row_type: 'incident',
  },
];

async function main() {
  const now = new Date().toISOString();
  const payload = rows.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? now : null,
  }));
  const { error } = await supabaseAdmin
    .from('engine_bug_queue')
    .upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ upserted ${payload.length} engine_bug_queue row(s)`);
  for (const r of rows) console.log(`  · [${r.severity}/${r.status}] ${r.bug_class}`);
}

main();
