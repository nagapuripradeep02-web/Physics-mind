/**
 * Seed the 9 defect classes found building the FIRST 3D chemistry surface
 * (`molecular_geometry` scenario + `vsepr_molecular_shapes`, 2026-07-28).
 *
 * Founder-approved for application ("apply all 9 to the table"). The drafted SQL
 * lives alongside at docs/concepts/chemistry/scar_candidates_vsepr_molecular_shapes.sql
 * with the provenance and the verification commands used.
 *
 * Why these matter more than a normal concept's batch: rows 2, 3, 4 and 7 are
 * failure modes that CANNOT occur on either 2D engine, and every future P4 concept
 * (hybridisation, sigma/pi, SN1/SN2, stereochemistry, orbitals) runs on this same
 * scenario. Row 1 is a RECURRENCE of an already-FIXED class, which is its own
 * lesson: the remedy existed and a new scenario still reached for the wrong helper.
 *
 * IDEMPOTENT: any bug_class already present is skipped, so a re-run cannot duplicate.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_vsepr_3d_surface.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'chemistry-p4-vsepr-3d-surface-2026-07-28';
const CONCEPT = 'vsepr_molecular_shapes';
const RENDERER = 'src/lib/renderers/field_3d_renderer.ts';
const CONCEPT_JSON = 'src/data/concepts/chemistry/vsepr_molecular_shapes.json';

type Row = {
    bug_class: string;
    title: string;
    severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
    owner_cluster: string;
    status: 'OPEN' | 'FIXED';
    root_cause: string;
    prevention_rule: string;
    fixed_in_files: string[];
};

const ROWS: Row[] = [
    {
        bug_class: 'field3d_live_text_sprite_must_be_created_autowidth',
        title: 'A label sprite whose text changes at runtime was built with createLabelSprite, so it clipped mid-word',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        status: 'FIXED',
        root_cause:
            'createLabelSprite() measures its canvas ONCE, from the seed string it is constructed with. The molecular_geometry angle label was seeded "109.5" and then driven through updateLabelSpriteText with "H-C-H = 109.5", which is far wider, so it rendered clipped as "-C-H = 109.". This is the same class as the already-FIXED label_sprite_wide_string_clipped (ac_generator, "each half tu") — the remedy pmCreateAutoLabel (which sets _pmAutoWidth so updateLabelSpriteText re-measures and re-fits the canvas) has existed for weeks, and a brand-new scenario still reached for the wrong helper because both are in scope and the names do not signal which one survives a text change.',
        prevention_rule:
            'If a sprite is EVER passed to updateLabelSpriteText, it MUST be created by pmCreateAutoLabel. Treat createLabelSprite as static-text-only. Cheap audit when adding any field_3d scenario: every sprite id passed to updateLabelSpriteText should trace back to a pmCreateAutoLabel call. A fixed scar that still bites means the prevention_rule never reached the point of use — prefer making the safe helper the obvious one over relying on recall.',
        fixed_in_files: [RENDERER],
    },
    {
        bug_class: 'field3d_counted_element_occluded_along_view_axis',
        title: 'Methane rendered with its fourth bond hidden behind the carbon, under a caption reading "Four bonds, one shape"',
        severity: 'CRITICAL',
        owner_cluster: 'alex:json_author',
        status: 'FIXED',
        root_cause:
            'In a projected 3D scene, an element aimed near the view axis foreshortens to nothing and hides BEHIND the object at the origin. The authored camera put one C-H bond almost exactly anti-parallel to the view direction, so methane showed three hydrogens while the caption said four and the HUD said "domains = 4". The physics was correct, both labels were correct, and the picture silently contradicted them. No deterministic gate can catch this: pixels changed, motion was present, zero console errors, H1/H3 clean — THE EYE returned 31/31 on four consecutive runs with this defect on screen.',
        prevention_rule:
            'For any field_3d concept whose narration, caption or HUD COUNTS objects, the authored camera must be verified so that every counted object is separately countable in the FROZEN frame. Make it an explicit Definition-of-Done line rather than an assumption. Related but distinct existing rows: field3d_position_vector_foreshortened_3q_camera (a vector reads short) and field3d_separation_axis_must_match_authored_edge_on_camera (a compare axis) — this one is the stronger case where the element disappears entirely.',
        fixed_in_files: [CONCEPT_JSON],
    },
    {
        bug_class: 'camera_metric_scored_foreshortening_not_pairwise_screen_separation',
        title: 'The camera solver written to prevent occlusion scored each object in isolation, so all three "solved" cameras still overlapped',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        status: 'FIXED',
        root_cause:
            'After the occlusion defect was found, cameras were re-solved numerically against a per-object metric: each object must project to at least X% of its own length. That metric is insufficient and gave false confidence, because it says nothing about whether a DIFFERENT object lands on top of it. Re-measuring the three "solved" cameras with a pairwise metric (centre-to-centre screen distance minus the two radii, plus each object against the central object) returned gaps of 0.05, -0.14 and -0.28 scene units — every one of them was overlapping. A second trap in the same solve: it constrained only ONE of the two angle families the concept displays (methane apex/leg) and left the other (water H-O-H) edge-on, so 104.5 degrees rendered as almost straight.',
        prevention_rule:
            'An occlusion metric must be PAIRWISE over every rendered pair, never per-object, and must include each object against the central object. Every angle the concept displays must be a constraint in the solve, not just the first one. General form: when a measurement is introduced to prevent a defect, check that the thing it measures is the thing that failed.',
        fixed_in_files: [CONCEPT_JSON],
    },
    {
        bug_class: 'camera_solved_for_home_pose_while_frozen_pin_lands_rotated',
        title: 'A continuously rotating scenario is pinned at rate x pin_time, not at the home pose its camera was solved for',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        status: 'FIXED',
        root_cause:
            'The camera was solved with the molecule at its home pose, but the state rotates continuously from t=0, so THE EYE pinned it 68 degrees round. Water had been solved to read clearly bent and was photographed almost straight — on the exact frame a teacher pauses on and the baseline locks. The safe window is narrow: for a tetrahedron at the shipped camera, atom discs begin overlapping about 20 degrees off home, so "it looks right at t=0" says nothing about t=8000.',
        prevention_rule:
            'Per rotating state, pick ONE and record which: (a) delay the spin until after the last reveal (spin_start_ms >= maxReveal) so the pin lands at the solved home pose — best where the pinned frame carries the teaching claim; or (b) keep the spin and solve the camera AT the pinned orientation (rate x pin_time is deterministic and therefore solvable) — best where an earlier phase would otherwise sit still. Never solve for the home pose and let a continuous rotation choose the pinned frame.',
        fixed_in_files: [CONCEPT_JSON],
    },
    {
        bug_class: 'scripted_change_desyncs_the_dom_control_that_shares_it',
        title: 'A scripted hide emptied the scene while the checkbox that also controls it stayed checked',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        status: 'FIXED',
        root_cause:
            'A scripted one-shot (hide_lone_at_ms) hid both lone pairs, but the "Show lone pairs" checkbox that also drives them was never written back, so the frozen frame showed a checked box with zero lobes on screen. The instrument contradicted the picture, and a teacher clicking that box would have seen nothing happen on the first click. This generalises the existing ghost_compare_cause_invisible_slider_frozen scar from sliders to every DOM control.',
        prevention_rule:
            'Whenever a scripted cue changes a variable that a DOM control also drives, write the control state back in lockstep — DOM-only, no dispatched input event, so the isTrusted drag-seize path is not tripped. Rule 32a\'s cause must be visible in the very control a teacher would use to cause it.',
        fixed_in_files: [RENDERER],
    },
    {
        bug_class: 'oncanvas_formula_asserts_a_value_the_renderer_cannot_show',
        title: 'A formula surface claimed an angle the single-arc renderer is structurally incapable of drawing',
        severity: 'MAJOR',
        owner_cluster: 'alex:architect',
        status: 'FIXED',
        root_cause:
            'STATE_6\'s formula surface read "5 -> 120 and 90" while the scenario draws exactly ONE angle arc, so the axial-equatorial 90 degrees for PCl5 was asserted on canvas and never rendered anywhere in the state. The molecule table even carried an arc_pair_b field for that second angle — defined, never read, pure dead code. This is the inverse of the familiar "narrated but not drawn" scar: here the CANVAS makes a numeric claim the engine cannot back.',
        prevention_rule:
            'Every number on a formula surface or HUD must be produced by something the renderer actually draws or computes for THAT state; if it cannot be, descope the text to what is shown. Carry it as an explicit Definition-of-Done line — "no claim without a rendered measurement" — since that line, added after the fact, is exactly what would have caught this before the build.',
        fixed_in_files: [CONCEPT_JSON, RENDERER],
    },
    {
        bug_class: 'orthographic_separation_metric_underpredicts_perspective_overlap',
        title: 'The occlusion solver projects orthographically while field_3d renders perspective, so it can only ever be optimistic',
        severity: 'MODERATE',
        owner_cluster: 'alex:json_author',
        status: 'OPEN',
        root_cause:
            'The camera solver that fixed the occlusion rows projects ORTHOGRAPHICALLY, but field_3d renders with a PERSPECTIVE camera. A nearer object is drawn larger and can therefore swallow a farther one even where the orthographic centre-to-centre gap is comfortably positive — observed on PCl5 mid-rotation, where the metric reported a positive gap and the frame showed two chlorines merged into one blob.',
        prevention_rule:
            'Treat the separation metric as a guide that can only be OPTIMISTIC, and always confirm the frozen frame by eye. Frozen frames are solved exactly; transient overlap during rotation is partly inherent to a turning 3D object. Fix would be to divide each projected radius by the object\'s camera-space depth before comparing gaps.',
        fixed_in_files: [],
    },
    {
        bug_class: 'validate_chemistry_choreography_measure_blind_to_field3d',
        title: 'A Rule-31a gate that reported 0 ms of choreography for every field_3d concept, so it could never be satisfied',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:runtime_generation',
        status: 'FIXED',
        root_cause:
            'validate-chemistry\'s "narration must not outrun choreography" check read scene_composition primitive timings only — the PCPL/parametric shape. On field_3d the choreography lives in field_3d_config.states[*].<scenario block>, and scene_composition is a silent no-op there, so the check reported "choreography settles ~0ms" for EVERY field_3d chemistry concept no matter how carefully its motion was timed. A warning that cannot be satisfied trains the author to ignore the gate.',
        prevention_rule:
            'Fixed by also consulting deriveMaxRevealTimeMs (the shared derivation THE EYE already pins frozen frames with), taking whichever signal lands later; the parametric path is unchanged. It immediately produced two real findings on the new concept AND cleared a false positive standing against the shipped bohr_model_energy_levels STATE_7. PATTERN TO WATCH: chemistry keeps inheriting physics tooling that hardcodes the parametric shape (three scripts in session C2, Gate 9 at convergence, this one). The next such fix should ask whether the tool can be made renderer-agnostic rather than taught one more special case.',
        fixed_in_files: ['src/scripts/validate-chemistry.ts'],
    },
    {
        bug_class: 'backtick_in_renderer_comment_terminates_emitted_template_literal',
        title: 'A backtick inside a renderer comment terminated the emitted template literal and errored hundreds of lines away',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:renderer_primitives',
        status: 'FIXED',
        root_cause:
            'The renderer bodies are emitted from a template literal, so a backtick anywhere inside them — including inside a // comment, e.g. writing an option name as `assemble` — terminates the literal and produces a syntax error hundreds of lines from the real cause. Hit TWICE while building the molecular_geometry scenario. The Rule-36c guard (npm run check:renderer-syntax) caught it both times and named the exact line, which is the guard doing precisely its job; tsc alone reported it at a misleading location.',
        prevention_rule:
            'Never use backticks in renderer comments — use "double quotes" for option names. Run npm run check:renderer-syntax after EVERY renderer edit, not just before commit, since it localises the failure and tsc does not. Recorded despite the guard existing because it cost two build cycles.',
        fixed_in_files: [RENDERER],
    },
];

// A scar is only worth its row if the next build can be CHECKED against it
// (CLAUDE.md §2 — every recurring defect class becomes a permanent automated
// check). `js_eval` probes are runnable inside the headless page THE EYE already
// drives; `manual` ones are a command or a judgement that still needs a reader.
const PROBES: Record<string, { probe_type: 'js_eval' | 'manual'; probe_logic: string }> = {
    field3d_live_text_sprite_must_be_created_autowidth: {
        probe_type: 'js_eval',
        probe_logic:
            'In-page: walk the scene for Sprite objects carrying _pmCanvas and assert every one whose text is driven at runtime also carries _pmAutoWidth === true. Static-text sprites are exempt. Any sprite id that appears as an argument to updateLabelSpriteText but lacks _pmAutoWidth is the defect.',
    },
    field3d_counted_element_occluded_along_view_axis: {
        probe_type: 'js_eval',
        probe_logic:
            'In-page, at the frozen pin: project every countable mesh centre with vec.project(camera) to NDC, take each screen radius, then assert the pairwise gap (|p_i - p_j| minus the two radii) is > 0 for EVERY pair, and that each object clears the central object. Fail = an object the caption counts is not separately countable. This is the deterministic form of the check that four green EYE runs missed.',
    },
    camera_metric_scored_foreshortening_not_pairwise_screen_separation: {
        probe_type: 'js_eval',
        probe_logic:
            'Same projection sweep as above, asserted PAIRWISE rather than per-object. Guard against the regression specifically: a per-object foreshortening score (|projected| / |true|) passing while any pairwise gap is <= 0 is exactly the false-confidence state that shipped three overlapping cameras.',
    },
    camera_solved_for_home_pose_while_frozen_pin_lands_rotated: {
        probe_type: 'js_eval',
        probe_logic:
            'Compute the state spin angle at the pin: (spin_rate * (pin_ms - spin_start_ms) / 1000) mod 2pi. Assert EITHER it is ~0 (spin delayed past the last reveal) OR the authored camera was solved at that angle. Then re-run the pairwise separation probe AT that angle, not at the home pose.',
    },
    scripted_change_desyncs_the_dom_control_that_shares_it: {
        probe_type: 'js_eval',
        probe_logic:
            'At the frozen pin, for every DOM control bound to a scripted variable: assert the control state matches the rendered state. Concretely here: document.getElementById("mg_lone_check").checked must equal (any mg_lone_* mesh visible). Generalises to sliders — a slider value must equal the variable actually driving the scene.',
    },
    oncanvas_formula_asserts_a_value_the_renderer_cannot_show: {
        probe_type: 'manual',
        probe_logic:
            'Read every number on the formula surface and HUD for the state, and name the rendered element that produces each one. Any number with no rendered source is the defect. Semantic, so it stays a reader task — but it is a Definition-of-Done line ("no claim without a rendered measurement"), which makes it checkable at design time rather than after build.',
    },
    orthographic_separation_metric_underpredicts_perspective_overlap: {
        probe_type: 'manual',
        probe_logic:
            'Until the solver divides projected radius by camera-space depth, treat every separation number it reports as an upper bound and confirm the frozen frame by eye. Cross-check: if the solver reports a positive gap and the frame shows a merged blob, this row is the explanation.',
    },
    validate_chemistry_choreography_measure_blind_to_field3d: {
        probe_type: 'manual',
        probe_logic:
            'npm run validate:chemistry on any field_3d chemistry concept must NOT report "choreography settles ~0ms". If it does, the measure has regressed to reading scene_composition only. Regression guard: bohr_model_energy_levels STATE_7 must stay warning-free.',
    },
    backtick_in_renderer_comment_terminates_emitted_template_literal: {
        probe_type: 'manual',
        probe_logic:
            'npm run check:renderer-syntax after every renderer edit (node --check on all three emitted bodies). Equivalent grep: any backtick between the opening RENDERER_CODE template literal and its terminator is the defect.',
    },
};

async function main(): Promise<void> {
    const classes = ROWS.map((r) => r.bug_class);
    const { data: existing, error: exErr } = await supabaseAdmin
        .from('engine_bug_queue')
        .select('bug_class')
        .in('bug_class', classes);
    if (exErr) throw new Error(`pre-check failed: ${exErr.message}`);
    const present = new Set((existing ?? []).map((r) => r.bug_class as string));

    const missingProbe = ROWS.filter((r) => !PROBES[r.bug_class]).map((r) => r.bug_class);
    if (missingProbe.length > 0) {
        throw new Error(`no probe defined for: ${missingProbe.join(', ')}`);
    }

    const toInsert = ROWS.filter((r) => !present.has(r.bug_class)).map((r) => ({
        ...r,
        ...PROBES[r.bug_class],
        subject: 'chemistry',
        row_type: 'incident',
        concepts_affected: [CONCEPT],
        discovered_in_session: SESSION,
    }));

    if (present.size > 0) {
        console.log(`↷ already present, skipping ${present.size}: ${[...present].join(', ')}`);
    }
    if (toInsert.length === 0) {
        console.log('Nothing to insert — all rows already recorded.');
        return;
    }

    const { data, error } = await supabaseAdmin
        .from('engine_bug_queue')
        .insert(toInsert)
        .select('bug_class,status,severity,owner_cluster');
    if (error) throw new Error(`insert failed: ${error.message}`);

    console.log(`✅ inserted ${data?.length ?? 0} row(s) into engine_bug_queue (subject=chemistry):`);
    for (const r of data ?? []) {
        console.log(`   [${r.status}/${r.severity}] ${r.owner_cluster} — ${r.bug_class}`);
    }
}

main().catch((e) => {
    console.error('❌', e instanceof Error ? e.message : e);
    process.exit(1);
});
