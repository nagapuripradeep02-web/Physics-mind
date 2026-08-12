/**
 * engine_bug_queue — organic dispatch S2 (`organic_structure_energy`) scar harvest (2026-08-09).
 *
 * FOUR rows from the field3d-surgeon S2 build (the generalised energy instrument).
 * All ship FIXED with prevention rules already asserted by
 * `npm run check:organic-structure` (204 assertions, 0 failures).
 *
 * The CRITICAL row is the one an energy instrument exists to prevent: the rider
 * and the pose silently stop being the same number. It was real here — the
 * torsion sign is MEASURED (rotating the far side by +delta DECREASES the IUPAC
 * dihedral), so a rider fed the authored field would have sat on the mirror
 * image of the pose for every non-symmetric conformer.
 *
 * The interpolation row is the subtle one: a linear interpolation reproduces
 * every published VALUE exactly and still draws every named minimum as a corner
 * rather than a well — and a central-difference derivative test cannot catch it,
 * because the two one-sided slopes cancel exactly at a symmetric corner.
 *
 * Agent emits SQL text only; the session seeds it (AMENDMENT A20).
 * Idempotent: upsert onConflict 'bug_class'.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_organic_s2.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'organic_s2_energy_2026-08-09';

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
const ALL3 = ['conformations_of_ethane', 'conformations_of_butane', 'cyclohexane_chair_flip'];

const rows: Row[] = [
  {
    bug_class: 'energy_instrument_rider_reads_the_authored_coordinate_while_the_pose_reads_the_built_geometry',
    title: 'A curve rider fed the authored coordinate drifts from the molecule it claims to describe',
    severity: 'CRITICAL', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      "An E(coordinate) instrument has exactly one failure mode: the point on the curve and the pose on stage stop being the same number. It happens silently, because both are individually plausible — the authored field says 60 and the geometry, after a pose snap or a sign correction, is at 300. organic_structure's torsion sign was MEASURED (rotating the far side by +delta DECREASES the IUPAC dihedral), so a rider reading torsion.phi_deg would have sat on the mirror image of the pose for every non-symmetric conformer.",
    prevention_rule:
      "The rider's coordinate is MEASURED on the built coordinates by the same function that publishes the pose's coordinate, computed ONCE per frame into ONE object that feeds the graph, the HUD and the marker. The graph painter re-derives nothing: it may not reference the measuring function, the published global, or the dihedral primitive. Gate asserts the identity over a swept set of poses AND that exactly one call site exists.",
    probe_type: 'js_eval',
    probe_logic:
      "For a sweep of authored torsions, assert orgEnergyState(...).x === orgMeasuredPhi(geom, mol) EXACTLY (not within a tolerance) and that .e === orgEnergyAt(row, that x); assert the measured value equals the authored one to 1e-9; negative control: a rider fed the molecule's default pose is >20 deg off at phi=37. Source: FRAME_FN contains exactly one orgEnergyState( call; GRAPH_FN contains no orgMeasuredPhi / PM_orgPhi / orgDihedral. npm run check:organic-structure section 9.",
    status: 'FIXED', concepts_affected: ALL3, fixed_in_files: [R, G], row_type: 'incident',
  },
  {
    bug_class: 'published_value_interpolated_between_knots_makes_every_named_point_a_corner_not_a_stationary_point',
    title: 'A linear interpolation between published energies draws kinks where the chemistry names minima and maxima',
    severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'Decision 1 forbids computing energies, so the curve must interpolate between literature points. The obvious linear interpolation reproduces every published VALUE exactly and still teaches a falsehood: at a "minimum" the drawn curve has a corner with two non-zero one-sided slopes, so the picture says the conformer is a cusp rather than a well. A central-difference derivative test does not catch it — the two slopes cancel exactly at a symmetric corner and the check passes.',
    prevention_rule:
      'Interpolate with a NAMED, documented form whose derivative vanishes AT each knot (raised cosine), and verify it against the standard closed form where one exists — on evenly spaced alternating knots the raised cosine IS (V/2)(1+cos n.phi). Test stationarity with a ONE-SIDED, scale-free ratio (halving the step must quarter the departure, ratio ~4), never a central difference, and ship a linear interpolation as the negative control at ratio ~2.',
    probe_type: 'js_eval',
    probe_logic:
      'For every registry row and every interior knot, on BOTH sides: q = |E(x+h)-E(x)| / |E(x+h/2)-E(x)| must exceed 3.5. Negative control: the same knots under linear interpolation give q < 2.5. Separately assert ethane E(phi) equals 6*(1+cos 3phi) to 1e-9 over 3601 samples, and that no sample leaves the published lo/hi band. npm run check:organic-structure section 8.',
    status: 'FIXED', concepts_affected: ALL3, fixed_in_files: [R, G], row_type: 'incident',
  },
  {
    bug_class: 'memoised_camera_solve_keyed_on_molecule_but_filled_from_the_live_pose_makes_the_camera_path_dependent',
    title: 'A HOME camera memoised on (molecule, distance) but solved from whichever pose applied first walks when a rider sweeps',
    severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      "organic_structure solves its HOME camera per molecule for countability and memoises on (molecule, distance). The solve was handed the LIVE geometry, so the cached pose was whichever state happened to apply first in a session: state 2 at phi=0 inherited state 1's phi=60 solve, and the same state rendered differently depending on the path the teacher took through the rail. With an energy rider the defect sharpens — a coordinate sweep would re-key and walk the camera while the taught variable moves, breaking Rule 32b.",
    prevention_rule:
      'A memoised solve must be a pure function of its OWN key. If the key is (molecule, distance), the solver builds its own reference-pose geometry from the molecule key and never reads the live pose. A state that needs different framing authors camera / camera_steps and does not reach the solver.',
    probe_type: 'js_eval',
    probe_logic:
      'Solve HOME through orgSolveCamera for the same molecule at five different authored coordinates and assert the returned (az, el, dist) is identical every time; assert the solver source builds orgBuildGeometry(key, orgResolvePhi(mol, null)) rather than using the geometry passed in. npm run check:organic-structure section 11.',
    status: 'FIXED', concepts_affected: ALL3, fixed_in_files: [R, G], row_type: 'incident',
  },
  {
    bug_class: 'unlabelled_measurement_instrument_prints_the_same_symbol_as_a_hud_line_measuring_a_different_quantity',
    title: "A torsion instrument defaulting to a bare phi collides with the HUD's reference-dihedral phi on the same screen",
    severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      "The measure family lets a state draw a torsion on ANY four atoms, while the HUD's phi line publishes the molecule's REFERENCE dihedral. Both defaulted to the glyph phi, so a state measuring a non-reference torsion painted two different numbers under one symbol. Caught only by executing the frame pass and reading the painted HUD — every pure-function and source assertion passed.",
    prevention_rule:
      "An instrument's DEFAULT label must be self-identifying from the atoms it measures: a torsion names its central bond, an angle names its three atoms, a distance names its two. A default that borrows a symbol another surface already owns is unauthorable-around, because the author cannot see the collision in the JSON.",
    probe_type: 'js_eval',
    probe_logic:
      'Execute updateOrganicStructureFrame against a three.js/DOM stub with a torsion measure and hud_lines including phi; assert at most one painted line begins with a bare phi and that the measure line names its bond. npm run check:organic-structure section 12.',
    status: 'FIXED', concepts_affected: ['conformations_of_ethane', 'cyclohexane_chair_flip'],
    fixed_in_files: [R, G], row_type: 'incident',
  },
];

async function main() {
  const now = new Date().toISOString();
  const payload = rows.map((r) => ({
    ...r, discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? now : null,
  }));
  const { error } = await supabaseAdmin
    .from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ upserted ${payload.length} engine_bug_queue row(s)`);
  for (const r of rows) console.log(`  · [${r.severity}/${r.status}] ${r.bug_class}`);
}

main();
