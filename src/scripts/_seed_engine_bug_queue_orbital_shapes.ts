/**
 * Seed the defect classes found building the SECOND 3D chemistry surface
 * (`orbital_shapes` scenario + `atomic_orbitals_s_p_d`, 2026-07-28/29).
 *
 * Founder-approved for application ("apply the scar rows").
 *
 * Provenance: four rows were drafted by the engine build, three by the defect
 * round that followed it, and three more were found by the parent session while
 * verifying those drafts rather than trusting them. Two of the drafts described
 * the SAME class from opposite ends (the plump 90% p boundary, and the missing
 * silhouette cue) and are merged here into one accurate row — the enclosure lever
 * the first one prescribed was proven INSUFFICIENT by pixels, so shipping it as
 * standing advice would have taught the next author a fix that does not work.
 *
 * Most rows are `subject_neutral`, not `chemistry`: they are field_3d engine
 * classes that a physics concept on the same renderer can hit tomorrow. Filing
 * them under chemistry would hide them from exactly the person who needs them.
 *
 * The load-bearing entry is `concept_json_duplicate_key_silently_discards_authored_value`.
 * It is not a renderer bug at all — it is a class of authoring defect that NO gate
 * in this repo can currently see, and it cost this session a full verify cycle.
 *
 * IDEMPOTENT: any bug_class already present is skipped, so a re-run cannot duplicate.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_orbital_shapes.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'chemistry-p4-orbital-shapes-2026-07-28';
const CONCEPT = 'atomic_orbitals_s_p_d';
const RENDERER = 'src/lib/renderers/field_3d_renderer.ts';
const CONCEPT_JSON = 'src/data/concepts/chemistry/atomic_orbitals_s_p_d.json';

type Row = {
    bug_class: string;
    title: string;
    severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
    owner_cluster: string;
    status: 'OPEN' | 'FIXED';
    subject: 'physics' | 'chemistry' | 'subject_neutral';
    root_cause: string;
    prevention_rule: string;
    probe_type: 'js_eval' | 'manual';
    probe_logic: string;
    fixed_in_files: string[];
};

const ROWS: Row[] = [
    {
        bug_class: 'field3d_default_spin_axis_rotates_solved_camera_out_of_countable_view',
        title: 'A gallery step rendered 3d_xy as a d_z2 because the default spin axis had turned the clover out of its solved camera',
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:renderer_primitives',
        status: 'FIXED',
        subject: 'subject_neutral',
        root_cause:
            'Cameras are SOLVED per mode for countability (the clover face-on at az 90 / el 18). The scenario let spin_axis default to world +y, so a state authoring spin_rate 0.08 from t=0 with no axis had accumulated 78-110 degrees by the time its gallery reached the 3d_xy step. The four xy-plane lobes then projected in pairs into two fused axial masses and the second nodal-plane disc swung face-on, so the frame read as a d_z2 under a CORRECT 3d_xy caption and a CORRECT "0 radial, 2 angular" node count. The mesh dispatch was never at fault - the first hypothesis blamed it, and implementing that hypothesis would have been a no-op that left the bug shipped. Default is now the state OWN view axis, about which nothing can foreshorten.',
        prevention_rule:
            'A scenario with SOLVED per-mode cameras must default its spin axis to the STATE VIEW AXIS, never to a world axis. A spin about the view axis cannot rotate a solved camera out of its countable view; any other default silently destroys it after enough seconds. Gallery and cycle states are the worst case, because spin accumulates from t=0 while the late steps open at a large angle. Corollary: when a shape reads wrong, suspect the POSE before the geometry.',
        probe_type: 'js_eval',
        probe_logic:
            'For every state authoring a spin_rate but no spin_axis, compute the accumulated angle at the LAST gallery/populate step start and at state end. Assert it is ~0, or that the authored camera was solved at that angle. Then re-run the pairwise screen-separation probe AT that angle, not at the home pose. A projected lobe count lower than the count the caption or HUD implies means the spin has rotated the solved camera out of view.',
        fixed_in_files: [RENDERER],
    },
    {
        bug_class: 'field3d_linear_interp_of_a_nonlinear_visual_parameter_defers_all_change_to_one_frame',
        title: 'A cutaway slab ramped linearly across a cloud far smaller than its start width, so nothing changed for 82% of the ramp and 85% of the dots vanished in one frame',
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:renderer_primitives',
        status: 'FIXED',
        subject: 'subject_neutral',
        root_cause:
            'Three compounding causes. (1) A LINEAR ramp on a parameter whose visible effect is wildly nonlinear: a slab wider than the whole cloud excludes nothing, so the entire exclusion landed at the ramp end as a single-frame cliff (Rule 32d teleport). (2) A thin slice through a 3D sample keeps only a few percent of it, so the visible count HAD to collapse unless the slice draws deeper into the seeded pool. (3) The node-shell LABEL was gated on a bare ramp fraction reached while the slice was still hundreds of pm thick, so a label asserting an empty band sat over a full one for ~12 of the state 24 seconds - through the entire narration that claims it.',
        prevention_rule:
            'Never ramp a geometric parameter linearly when its visible effect is nonlinear in that parameter - interpolate GEOMETRICALLY between physically meaningful endpoints, and derive the endpoint from the feature being revealed. Any beat that removes elements must compensate its own sample so the visible count never steps. Gate a naming label on the PHYSICAL condition it asserts, never on a ramp fraction: a label is a claim, and a claim must be true the moment it is on screen.',
        probe_type: 'js_eval',
        probe_logic:
            'For any state with a cutaway/slice/thinning beat, compute changed-pixel percentage between adjacent dense frames: no pair may exceed ~2x its neighbours (this defect measured 12x). Separately, at every 1 s step where a label naming an empty region is visible, assert that region is actually empty.',
        fixed_in_files: [RENDERER, CONCEPT_JSON],
    },
    {
        bug_class: 'field3d_uniform_translucent_same_family_surfaces_fuse_with_no_silhouette_cue',
        title: 'Three 2p boundary surfaces composited into one rounded mass - only 3 of 6 tips countable - and neither camera solving nor a lower enclosure fixed it',
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:renderer_primitives',
        status: 'FIXED',
        subject: 'subject_neutral',
        root_cause:
            'Uniformly translucent same-family shells carry no edge, so N of them composite into a single mass. This row MERGES two earlier drafts, because the first prescribed a remedy that pixels later disproved. Fact worth keeping: the TRUE 90% boundary of a 2p orbital is plump (482 x 334 pm, L/W 1.44), not the slim textbook dumbbell, so three of them genuinely overlap. But the mitigation drafted from that fact - author at enclosure 0.5 with dots off - was applied IN FULL, together with the swept global-optimum camera, and the state still fused. The failure is shading, not framing and not size. Fixed with Fresnel-weighted alpha: near-transparent facing the viewer, near-solid at each lobe own silhouette, so every lobe carries an outline and every adjacent pair shows a concave neck. No vertex moved and no scale changed.',
        prevention_rule:
            'When N translucent surfaces of the same family overlap in one frame, countability requires a per-surface SILHOUETTE cue (Fresnel-weighted alpha, rim darkening, or an outline). It is NOT obtainable by solving the camera, NOT by lowering opacity or enclosure, and NEVER by shrinking the surfaces - which would lie about a magnitude the HUD is printing (Rule 29). Reach for the shading cue FIRST; a camera re-solve on a fused frame is wasted work.',
        probe_type: 'js_eval',
        probe_logic:
            'On any state showing more than one boundary surface of the same family at once, count the independently outlined tips in the frozen frame and compare with the count the caption or HUD implies. Equal passes; fewer means the surfaces have fused. Note that a pairwise screen-separation probe PASSES on this defect - the centres are separated, the silhouettes are not - so separation alone is not sufficient evidence of countability.',
        fixed_in_files: [RENDERER],
    },
    {
        bug_class: 'concept_json_duplicate_key_silently_discards_authored_value',
        title: 'An authored value was silently dropped by a duplicate JSON key while the file stayed valid and every gate passed',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        status: 'FIXED',
        subject: 'subject_neutral',
        root_cause:
            'A spin_rate was authored near the top of an orbital_shapes block that already carried spin_rate: 0 fifteen lines below it. Duplicate keys in a JSON object resolve LAST-WINS, so the authored 0.05 was discarded at parse time. Nothing anywhere reported it: the file remained valid JSON, tsc passed, validate:chemistry passed, and THE EYE passed 39/39 on frames that were byte-identical to the ones before the edit. It was caught only by dumping the SEEDED sim html and finding 9 spin_rate values where the source file had 10. The same trap applies to any repeated key in any concept JSON - it is not specific to this scenario, this renderer, or this subject.',
        prevention_rule:
            'A concept JSON is not schema-checked for duplicate keys and no existing gate can see one - Zod validates the PARSED object, by which point the duplicate is already gone. Two habits: (1) when adding a key to an existing block, search that block for the key first rather than inserting at the top; (2) after authoring a value that should change behaviour, verify it ARRIVED in the built artifact, not merely that the edit was written. An edit is not a delivery. A whole-file duplicate-key audit is a few lines of JSON parsing with an object_pairs_hook and belongs in validate:chemistry.',
        probe_type: 'js_eval',
        probe_logic:
            'Parse every concept JSON with a pairs hook that counts keys per object and fails on any count > 1. Cheap, exact, no browser. Recommended as a standing gate rather than a probe - this defect class is invisible to every other check in the repo.',
        fixed_in_files: [CONCEPT_JSON],
    },
    {
        bug_class: 'field3d_canonical_lobe_mesh_evaluates_angular_factor_in_world_axes',
        title: 'A canonical axis-aligned mesh built from a WORLD-frame shape function bulged along the wrong axis - a 2p_z rendered as a sphere',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        status: 'FIXED',
        subject: 'subject_neutral',
        root_cause:
            'The lobe geometry builder swept its vertices about local +y but called the orbital WORLD angular factor, which is written about the orbital world axis. The resulting 2p_z boundary surface rendered as a sphere with its bumps perpendicular to the lobe axis. Every deterministic gate passed on it - syntax, tsc, validators, determinism - because the mesh was self-consistent and reproducible, just wrong.',
        prevention_rule:
            'A mesh that will be aimed by a quaternion must be generated from a shape function expressed in its OWN local frame. If the shape is anisotropic, aim it with a full basis rotation (Z = X cross Y), never setFromUnitVectors, whose roll about the target axis is arbitrary and will silently scramble an anisotropic lobe.',
        probe_type: 'manual',
        probe_logic:
            'Render the scenario at its solved camera and read the frame: the surface bulge must lie along the axis the caption names. A shape function that is correct in world coordinates and a mesh that is correct in local coordinates produce identical, passing numbers and different pictures.',
        fixed_in_files: [RENDERER],
    },
    {
        bug_class: 'field3d_lobe_family_mesh_sweeps_past_its_own_nodal_boundary',
        title: 'Each d lobe mesh drew its own lobe plus half of each neighbour, double-covering the cloverleaf and fanning seams through every frame',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        status: 'FIXED',
        subject: 'chemistry',
        root_cause:
            'The lobe builder swept the polar angle to 90 degrees for every family. For a d_xy lobe the local angular factor vanishes at 45 degrees and RISES AGAIN toward the neighbouring lobe, so each of the four meshes drew its own lobe and half of each neighbour. The union silhouette was correct, which is why it survived a silhouette-level check; the interior was double-covered, which is what produced the fanned seams. Found while auditing a different defect, not reported by any gate or by the frame read that preceded it.',
        prevention_rule:
            'A lobe mesh must be swept only to its OWN nodal boundary, computed per azimuth from the angular factor zero, never to a fixed polar limit. A shape function that is non-negative past its own node will happily paint a neighbour lobe.',
        probe_type: 'manual',
        probe_logic:
            'Read the interior of a multi-lobe frame, not just its outline: radial seams or brightness banding across the middle indicate overlapping geometry. A silhouette or union check cannot see this, because the union is unchanged.',
        fixed_in_files: [RENDERER],
    },
    {
        bug_class: 'field3d_scene_composition_annotation_silent_noop',
        title: 'field_3d never paints scene_composition annotations, so per-beat teaching text authored on every state is dead JSON',
        severity: 'MAJOR',
        owner_cluster: 'ambiguous',
        status: 'OPEN',
        subject: 'subject_neutral',
        root_cause:
            'Generic scene_composition "annotation" entries are never rendered by field_3d; the renderer drives all on-canvas text from scenario-specific config instead. Every state of this concept authored 2-3 annotations carrying real per-beat narrative text, none of which ever appeared. Nothing is un-teachable, because caption, formula and HUD carry each claim - but the richer text is silently dead. FILED HERE BECAUSE IT WAS NOT IN THE TABLE: it had been described in session docs as an already-open scar and treated as known, while no row existed. Compounding tension: Rule 19 requires >=3 primitives per state, and on field_3d that quota is satisfiable entirely by primitives that render nothing.',
        prevention_rule:
            'Before authoring scene_composition annotations on any field_3d concept, confirm the target scenario consumes them; route per-beat narrative text through the scenario own config fields. Fleet decision still owed: either implement a generic field_3d annotation primitive, or stop counting non-rendering primitives toward Rule 19 - the current state lets a state satisfy a content gate with content that does not exist.',
        probe_type: 'js_eval',
        probe_logic:
            'For each field_3d state, collect authored scene_composition entries of type annotation and assert their text appears in the rendered DOM or canvas text layer. Any authored annotation with no on-screen counterpart is dead JSON.',
        fixed_in_files: [],
    },
    {
        bug_class: 'field3d_one_shot_lead_window_exceeds_the_event_spacing',
        title: 'A fixed 500 ms cause-lead kept five one-shot flashes in the air at once when events were 90 ms apart, so the beat read as a swarm of planets',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:renderer_primitives',
        status: 'FIXED',
        subject: 'subject_neutral',
        root_cause:
            'A measurement flash was authored to precede its settled dot by a fixed 500 ms in service of Rule 32a (cause before effect). With a per-dot period of 90 ms the pool of five flashes was permanently full, so instead of one measurement becoming one mark the state showed a persistent swarm of little spheres.',
        prevention_rule:
            'A cause-before-effect lead must be clamped to the spacing between events: lead = min(authored_lead, event_period). Rule 32a is about ORDER, not about a constant - a lead longer than the gap between causes stops reading as causation and starts reading as clutter.',
        probe_type: 'js_eval',
        probe_logic:
            'Pin a stipple or one-shot state mid-build and count in-flight cue sprites. More than one or two simultaneously means the lead window outruns the event spacing.',
        fixed_in_files: [RENDERER],
    },
    {
        bug_class: 'field3d_name_label_parked_on_its_own_axis_collides_with_the_axis_letter',
        title: 'A 3D name label placed along the axis it names landed on top of that axis letter sprite',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:renderer_primitives',
        status: 'FIXED',
        subject: 'subject_neutral',
        root_cause:
            'The orbital name was placed at a fixed world offset along the orbital axis - exactly where the axes-triad letter already sits - so "1s" rendered over "y" and "2p_z" over "z".',
        prevention_rule:
            'Any 3D text sprite whose neighbours are also text must go through a screen-space avoider: try several camera-space offsets, maximise the minimum projected distance to other labels, and reject the top chrome band. A fixed world offset is only safe where nothing else can be.',
        probe_type: 'js_eval',
        probe_logic:
            'Project every label sprite centre to screen space at the frozen pin and assert pairwise separation exceeds the sum of their half-extents. Cheaper than a frame read and catches the whole class.',
        fixed_in_files: [RENDERER],
    },
    {
        bug_class: 'field3d_populate_baseid_fallback_paints_another_orbitals_identity',
        title: 'A p_set state opened on a labelled 1s carrying 1s energy and radius, under a caption reading "Three axes, one energy"',
        severity: 'MODERATE',
        owner_cluster: 'alex:json_author',
        status: 'FIXED',
        subject: 'chemistry',
        root_cause:
            'The state authored populate_steps whose first entry fires at 700 ms and no base orbital, so the engine baseId fallback ("1s") supplied the scene for the opening window - not merely a stray sphere, but a NAME sprite reading 1s plus a HUD reading its energy and radius, under the wrong caption and formula. Reported upstream as a cosmetic 700 ms flash; it was four wrong surfaces at once. Fixed by authoring the base orbital to match populate_steps[0], the pattern a sibling state already used. Partial fixes do not work: hiding the surface leaves the sprite, the axes scale and the HUD all reading the fallback orbital.',
        prevention_rule:
            'When a state scripts its content through populate/gallery steps that begin after t=0, the authored base must equal the first step subject. Engine hardening also available and not yet done: when such steps exist and none has fired, suppress the base fallback AND its HUD, so a mis-authored base can never print another object identity.',
        probe_type: 'js_eval',
        probe_logic:
            'At t=0 of any state with populate/gallery steps, assert the rendered label, HUD identity line and formula all agree with the caption. Disagreement at t=0 is the defect even when the state is correct a second later.',
        fixed_in_files: [CONCEPT_JSON],
    },
];

async function main(): Promise<void> {
    const classes = ROWS.map((r) => r.bug_class);
    const { data: existing, error: exErr } = await supabaseAdmin
        .from('engine_bug_queue')
        .select('bug_class')
        .in('bug_class', classes);
    if (exErr) throw new Error(`pre-check failed: ${exErr.message}`);
    const present = new Set((existing ?? []).map((r) => r.bug_class as string));

    const toInsert = ROWS.filter((r) => !present.has(r.bug_class)).map((r) => ({
        ...r,
        row_type: 'incident',
        concepts_affected: [CONCEPT],
        discovered_in_session: SESSION,
    }));

    if (present.size > 0) {
        console.log(`↷ already present, skipping ${present.size}: ${[...present].join(', ')}`);
    }

    if (toInsert.length > 0) {
        const { data, error } = await supabaseAdmin
            .from('engine_bug_queue')
            .insert(toInsert)
            .select('bug_class,status,severity,owner_cluster,subject');
        if (error) throw new Error(`insert failed: ${error.message}`);
        console.log(`✅ inserted ${data?.length ?? 0} row(s):`);
        for (const r of data ?? []) {
            console.log(`   [${r.status}/${r.severity}] ${r.subject} · ${r.owner_cluster} — ${r.bug_class}`);
        }
    } else {
        console.log('Nothing new to insert.');
    }

    // ── RECURRENCE, not a new class: the ASCII-minus row already exists and is
    //    marked FIXED on bohr_model_energy_levels. This concept regressed it in a
    //    NEW scenario, and at a second call site the auditor did not report (the
    //    probe readout, which prints a sign far more often than the energy line).
    //    Append the concept and strengthen the rule rather than filing a duplicate.
    const ASCII = 'ascii_minus_in_oncanvas_math_from_tofixed';
    const { data: cur, error: curErr } = await supabaseAdmin
        .from('engine_bug_queue')
        .select('id,concepts_affected,fixed_in_files')
        .eq('bug_class', ASCII)
        .maybeSingle();
    if (curErr) throw new Error(`ascii row read failed: ${curErr.message}`);
    if (!cur) {
        console.log(`⚠ ${ASCII} not found — expected it to exist; skipping recurrence update.`);
        return;
    }
    const concepts: string[] = cur.concepts_affected ?? [];
    if (concepts.includes(CONCEPT)) {
        console.log(`↷ ${ASCII} already records ${CONCEPT}.`);
        return;
    }
    const files: string[] = cur.fixed_in_files ?? [];
    const { error: upErr } = await supabaseAdmin
        .from('engine_bug_queue')
        .update({
            concepts_affected: [...concepts, CONCEPT],
            fixed_in_files: files.includes(RENDERER) ? files : [...files, RENDERER],
            prevention_rule:
                'Any interpolated numeric that can be NEGATIVE must post-process its sign into a real Unicode minus (U+2212). A Unicode sweep of STATIC strings is not sufficient - it misses runtime-generated numbers, which is how this shipped twice. RECURRED 2026-07-28 in the orbital_shapes scenario at TWO call sites: the energy HUD (toFixed) and the probe-plane readout (String(Math.round(...))), the second of which an audit missed entirely and which prints a sign far more often, since the probe sits on the negative side of the nucleus for half of every sweep. When fixing this class, grep EVERY numeric-to-string conversion in the block, not the one that was reported.',
        })
        .eq('id', cur.id);
    if (upErr) throw new Error(`ascii row update failed: ${upErr.message}`);
    console.log(`✅ ${ASCII}: recorded recurrence on ${CONCEPT} + strengthened prevention_rule (2 call sites).`);
}

main().catch((e) => {
    console.error('❌', e instanceof Error ? e.message : e);
    process.exit(1);
});
