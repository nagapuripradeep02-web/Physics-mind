/**
 * Ch.6 concept #7 — scar rows from the FOUNDER SCREEN RECORDING of 2026-08-10 15:51
 * (analysed 0:00-2:35). Rule: a founder recording is a bug report, so the rows are
 * filed FIRST and flipped as each lands. Everything below was fixed in the same
 * session (commits: content pass, tier-1 engine, tier-2 engine), so each row carries
 * its own status.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_apply_ch6_c7_founder_recording_scars.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const S = 'ch6-concept-7-founder-recording-2026-08-10';
const GPE = 'gravitational_potential_energy';
const RENDERER = ['src/lib/renderers/field_3d_renderer.ts'];
const JSONF = [`src/data/concepts/${GPE}.json`];
const BOTH = [...RENDERER, ...JSONF];
const NOW = new Date().toISOString();

type Row = {
    bug_class: string; title: string;
    severity: 'CRITICAL' | 'MAJOR' | 'MODERATE'; owner_cluster: string;
    root_cause: string; prevention_rule: string; probe_type: string; probe_logic: string;
    status: 'OPEN' | 'FIXED'; concepts_affected: string[]; fixed_in_files: string[];
    discovered_in_session: string; row_type: 'incident' | 'directive' | 'probe_definition';
    fixed_at?: string;
};

const rows: Row[] = [
    {
        bug_class: 'unsigned_energy_stack_caged_h_ref_below_the_body_so_a_reference_choice_state_could_not_move_its_own_line',
        title: 'The zero-line state could not move its zero line far enough to see, because the energy bar could not draw a negative U',
        severity: 'CRITICAL', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: "nlbUpdateEnergyPanel drew every bar on an UNSIGNED track and warned when U_grav went below zero, so energy_layer.h_ref_m could only ever be authored at or BELOW the tracked body's lowest point. On this concept's ramp that ceiling was 0.3 m, which moves the dashed line by a handful of pixels — so STATE_3, whose entire claim is that the zero line moved, was pixel-identical to STATE_1 apart from two small numerals on the right edge. Founder: 'the state one, state three looks same'. Fixed by energy_layer.signed: non-E_total bars draw on the half-track about a mid-height baseline that the SEAM M work ledgers already used, freeing h_ref_m to be authored (and dragged) anywhere.",
        prevention_rule: "A state whose delta cue claims a quantity MOVED must move it by a distance measurable on screen, not only in a numeral. If the engine's own rendering caps how far it can move, the cap is the bug.",
        probe_type: 'js_eval',
        probe_logic: "For any two states sharing a scenario and differing only in energy_layer.h_ref_m, assert the drawn y of marker_h_ref differs by more than 12 device px at each state's eye_capture_ms.",
        status: 'FIXED', concepts_affected: [GPE], fixed_in_files: BOTH,
        discovered_in_session: S, row_type: 'incident', fixed_at: NOW,
    },
    {
        bug_class: 'nlb_draws_d_prominently_and_never_draws_h_on_a_u_equals_mgh_concept',
        title: 'The engine drew the distance along the ramp as a labelled arrow and never drew the height at all',
        severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: "displacement_vector renders a solid, labelled, live-growing arrow on d — the distance along the incline, which does not appear in mgh — while height_markers offered only a dashed h = 0 LINE and no measurement to it. So on a U = mgh concept a teacher pausing any frame could read the one length that does not matter and could not read the one that does. Fixed by height_markers.show_h_leader (a dashed vertical drop to the reference carrying the live h) plus displacement_vector.dim to demote d where it is the distractor.",
        prevention_rule: 'Every factor of the taught formula that is a LENGTH must be drawn as a measured length in the frame, not merely named in a caption or a stamp.',
        probe_type: 'js_eval',
        probe_logic: "For a concept whose formula surface contains 'mgh', assert marker_h_leader is visible with a numeric label at each guided state's eye_capture_ms.",
        status: 'FIXED', concepts_affected: [GPE], fixed_in_files: BOTH,
        discovered_in_session: S, row_type: 'incident', fixed_at: NOW,
    },
    {
        bug_class: 'checkpoint_latches_a_transient_when_an_opening_animation_is_still_in_flight_at_the_crossing',
        title: 'A checkpoint stamped a meaningless mid-animation value and the first-capture rule kept it forever',
        severity: 'CRITICAL', owner_cluster: 'alex:json_author',
        root_cause: "height_markers.h_ref_slide_* was authored at 1500 ms while the cart crossed point A at 500 ms. The stamp latches on FIRST crossing, so A captured U measured from a reference that was still moving: 2.8 J instead of -29.4 J, held for the rest of the state. Nothing catches this — the numeral is internally consistent with the instant it was taken, every gate passes, and THE EYE reported 28/28. Fixed by shortening the slide to 380 ms so it completes before the first crossing.",
        prevention_rule: 'Any state-opening animation that moves a quantity a checkpoint CAPTURES must finish before the first crossing. Compute the crossing time from s0, v0 and the authored s_m; do not eyeball it.',
        probe_type: 'js_eval',
        probe_logic: 'For each checkpoint, compute t_cross from the seed kinematics and assert every authored opening animation that writes energy_h_ref_m has completed by t_cross.',
        status: 'FIXED', concepts_affected: [GPE], fixed_in_files: JSONF,
        discovered_in_session: S, row_type: 'incident', fixed_at: NOW,
    },
    {
        bug_class: 'activate_at_ms_on_a_force_balanced_body_renders_the_state_permanently_static_while_the_eye_passes',
        title: 'Holding a body with activate_at_ms froze it forever when its applied force balanced gravity, and all 28 gates still passed',
        severity: 'CRITICAL', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: "bodies[].activate_at_ms with visible_before_activation was used to hold a cart while an opening animation played. On a body whose applied_force exactly balances mg sin(theta) the acceleration is identically 0, and the activation path left v at 0 rather than restoring the authored initial_velocity_mps — so the cart never started and STATE_3 rendered completely static for its whole 24 s. THE EYE reported 28 of 28 checks passing: the documented all-green-hides-a-fully-static-state failure. Caught only by reading dense frames at t = 3000 and t = 5000 and seeing an identical picture. Worked around in content (the hold was removed); the activation re-seed itself is NOT yet fixed and remains OPEN for the engine.",
        prevention_rule: 'A body held by activate_at_ms must be re-seeded with its authored v0 at the activation instant. Until that is true, never combine activate_at_ms with a force-balanced (a = 0) body — it cannot start.',
        probe_type: 'js_eval',
        probe_logic: 'For any state authoring bodies[].activate_at_ms, assert the tracked body s at (activate_at_ms + 500) differs from s at activate_at_ms by more than 0.05 m.',
        status: 'OPEN', concepts_affected: [GPE], fixed_in_files: [],
        discovered_in_session: S, row_type: 'incident',
    },
    {
        bug_class: 'energy_panel_fit_ladder_runs_out_of_steps_and_leaves_the_panel_overflowing_into_the_parent_brand_mark',
        title: 'The work ledger ran off the bottom of the canvas and collided with the review chrome brand mark',
        severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: "nlbFitEnergyPanel returns on the first step that fits and otherwise falls out of its loop leaving the SMALLEST step applied and still overflowing. Three steps sufficed while only one section existed; the dU = -W state shows the energy group AND the work group together and exceeded all three. Compounding it, the floor was window.innerHeight - 12, but the review player paints 'powered by Viditra' over the bottom-left of the sim from the PARENT document, which nothing measurable inside the iframe can see. Fixed with a 4th ladder step and a named floor reserve.",
        prevention_rule: 'A measure-and-reflow ladder must either fit at its last step or say so. Reserve the parent chrome footprint explicitly — the renderer cannot measure the document that embeds it.',
        probe_type: 'js_eval',
        probe_logic: 'Assert #nlb_energy getBoundingClientRect().bottom <= window.innerHeight - 34 at every state eye_capture_ms, at viewport heights 551 and 720.',
        status: 'FIXED', concepts_affected: [GPE], fixed_in_files: RENDERER,
        discovered_in_session: S, row_type: 'incident', fixed_at: NOW,
    },
    {
        bug_class: 'idle_auto_sweep_animates_the_very_slider_handle_the_explore_caption_tells_the_teacher_to_drag',
        title: 'The explore state crawled its own theta slider before anyone touched it',
        severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: "Every member of the idle_auto_sweep param enum (F, theta, m) is ALSO a slider token, and nlbRunIdleSweep calls nlbSyncSliderRow after every write. So a sandbox idling on theta visibly moved the theta handle, and the caption 'change mass and angle yourself' pointed at a control already moving on its own. Fixed by adding an 's' param that sweeps the tracked body's POSITION, which is backed by no slider and is the honest motion for a U = mgh sandbox anyway.",
        prevention_rule: 'An explore state may idle, but never on a parameter it exposes as a control. The teacher must arrive at a still panel.',
        probe_type: 'js_eval',
        probe_logic: "For any state with mode 'sandbox' and idle_auto_sweep, assert sweep.param is not present in controls_visible.",
        status: 'FIXED', concepts_affected: [GPE], fixed_in_files: BOTH,
        discovered_in_session: S, row_type: 'incident', fixed_at: NOW,
    },
    {
        bug_class: 'path_independence_state_asserts_a_comparison_whose_other_half_is_not_on_screen',
        title: 'Shorter path, same U was drawn with only one ramp, so the comparison lived in the teacher memory',
        severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: "STATE_4 rendered the steep ramp alone and labelled its d, asking the teacher to remember the other d from a state two clicks earlier. Worse, the two climbs did not even start at the same height (0.30 m vs 0.45 m), so the numbers being compared were not one climb measured two ways. Fixed by a ghost_surface block that draws the other ramp dim and behind, with its own derived d span between the SAME two heights, and by moving S4's s0 to 0.4 m so both climbs cover an identical dh = 1.20 m.",
        prevention_rule: 'A state comparing two cases must render both in the same frame. If only one is drawn, the delta cue is a claim, not a picture.',
        probe_type: 'js_eval',
        probe_logic: "For a state whose delta_cue matches /same|equal|instead of/i and which authors ghost_surface, assert both the live and the ghost d labels are visible and carry DIFFERENT numerals at eye_capture_ms.",
        status: 'FIXED', concepts_affected: [GPE], fixed_in_files: BOTH,
        discovered_in_session: S, row_type: 'incident', fixed_at: NOW,
    },
    {
        bug_class: 'latched_checkpoint_stamp_and_the_live_readouts_disagree_at_the_paused_frame',
        title: 'The bar reads 44.4 J while the stamp beside it reads 44.1 J on the same paused frame',
        severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: 'A checkpoint stamps at the crossing instant, but the dwell that holds the scene begins a frame or two later, so the live U bar, the h leader and the d readout have all advanced slightly past the stamped values. Every number is individually honest and they still contradict each other on the frame a teacher pauses on and reads aloud. Observed as 14.8 vs 14.7 J, 44.4 vs 44.1 J, -8.9 vs -8.6 J and h = 1.51 vs 1.50 m.',
        prevention_rule: 'On a stamped crossing, snap the body to the checkpoint s_m before opening the dwell, so the live readouts and the latched stamp are the same numbers by construction.',
        probe_type: 'js_eval',
        probe_logic: 'At each dwell frame, assert |live U_grav - the latched stamp for that checkpoint| < 0.05 J.',
        status: 'OPEN', concepts_affected: [GPE], fixed_in_files: [],
        discovered_in_session: S, row_type: 'incident',
    },
    {
        bug_class: 'narration_describes_an_object_that_is_not_in_the_scene',
        title: 'The narration talked about a bag, a shelf, stairs, an elevator and a building while the canvas showed a cart on a ramp',
        severity: 'MAJOR', owner_cluster: 'alex:physics_author',
        root_cause: "The real_world_anchor was authored as a bag carried upstairs and the narration inherited it verbatim, but every state renders a cart on an incline. Rule 25 requires the explanation to be co-located with its visual; here the spoken half and the drawn half were different objects. Two lines also referenced OTHER concepts ('the concept before this', 'the last concept ... forty nine joules' — a number appearing nowhere on screen), which breaks a standalone sim and any reordered rail (Rule 25d). Fixed by rewriting the anchor to a loading ramp, which is universal under Rule 35 AND is what the sim draws.",
        prevention_rule: 'Every noun in the narration must name something visible in the same state, or be the anchor sentence that the state then draws. Never cite another concept by position.',
        probe_type: 'manual',
        probe_logic: "For each state, list the physical nouns in text_en and assert each is present in the rendered scene; flag any phrase matching /last concept|concept before|previous concept/i.",
        status: 'FIXED', concepts_affected: [GPE], fixed_in_files: JSONF,
        discovered_in_session: S, row_type: 'incident', fixed_at: NOW,
    },
    {
        bug_class: 'tts_spelled_out_numerals_render_verbatim_in_the_reader_facing_subtitle_strip',
        title: 'The subtitle read fourteen point seven joules while the canvas beside it read 14.7 J',
        severity: 'MODERATE', owner_cluster: 'alex:physics_author',
        root_cause: 'text_en is authored for Sarvam, so every numeral was spelled out in words. The SAME string is rendered in the subtitle strip under the canvas, where a teacher reads it — so the written half of the product carried a number format that matches nothing else on screen and is markedly harder to scan.',
        prevention_rule: 'Numerals in text_en are written as digits. bulbul v3 speaks digits natively; the subtitle strip has no other source.',
        probe_type: 'js_eval',
        probe_logic: "Assert no text_en sentence matches /\\b(one|two|three|four|five|six|seven|eight|nine|ten|twenty|thirty|forty|fifty) point (one|two|three|four|five|six|seven|eight|nine|zero)\\b/i.",
        status: 'FIXED', concepts_affected: [GPE], fixed_in_files: JSONF,
        discovered_in_session: S, row_type: 'incident', fixed_at: NOW,
    },
    {
        bug_class: 'camera_authored_at_double_the_distance_the_scene_needs_so_labels_are_unreadable_on_a_projector',
        title: 'The sim occupied a quarter of the canvas and its labels rendered at six to eight pixels',
        severity: 'MAJOR', owner_cluster: 'alex:json_author',
        root_cause: 'camera_position z was authored at 9.1 (and 10.6 on the explore) for a scene whose world extent needs roughly 4.5. The 3D content filled about 25 per cent of the canvas width with the rest empty, so every on-canvas label - m = 3 kg, theta, d - rendered too small to read at classroom distance. The explore state, the one a teacher manipulates, was the FARTHEST of all.',
        prevention_rule: 'Fit the camera to the scene extent and verify by reading a frame, not by cloning a z from a sibling concept with different geometry.',
        probe_type: 'js_eval',
        probe_logic: 'Assert the rendered bounding box of the scenario geometry spans at least 45 per cent of canvas width at every state eye_capture_ms.',
        status: 'FIXED', concepts_affected: [GPE], fixed_in_files: JSONF,
        discovered_in_session: S, row_type: 'incident', fixed_at: NOW,
    },
    {
        bug_class: 'mass_changes_silently_between_states_whose_claim_is_that_something_stayed_the_same',
        title: 'The cart changed mass four times across six states, including between two states claiming the same energy',
        severity: 'MAJOR', owner_cluster: 'alex:json_author',
        root_cause: 'mass_kg ran 3 / 2.5 / 3 / 3 / 2.5 / 2 across the six states with no state teaching mass. Rule 32b requires that only the taught variable changes; here the apparatus itself changed underneath an invariance argument.',
        prevention_rule: 'Pin every quantity the concept does not teach to one value across all guided states. A quantity that varies without being taught is a variable the student must silently discount.',
        probe_type: 'js_eval',
        probe_logic: 'Assert bodies[].mass_kg for a given body id is identical across all non-sandbox states unless some state declares mass as its taught variable.',
        status: 'FIXED', concepts_affected: [GPE], fixed_in_files: JSONF,
        discovered_in_session: S, row_type: 'incident', fixed_at: NOW,
    },
    {
        bug_class: 'reviewer_recorded_a_build_that_predated_four_landed_fix_commits',
        title: 'Two of the defects in the founder recording were already fixed and only needed a rebuild',
        severity: 'MODERATE', owner_cluster: 'alex:json_author',
        root_cause: 'The review site was built at 11:29 and four content commits landed between 11:42 and 12:55. The founder recorded at 15:51 against the stale build, so the session spent review attention on the bare point A / point B labels and the STATE_2 duplicate pass-2 caption, both of which were already fixed in the JSON. Confirmed by grepping the built sim.html for the new label strings and finding zero.',
        prevention_rule: 'Rebuild the review site as the LAST step of any commit that touches a concept JSON, and state the build time when handing a sim to a reviewer.',
        probe_type: 'js_eval',
        probe_logic: 'Assert mtime of review-site/<id>/sim.html is newer than the last commit touching src/data/concepts/<id>.json.',
        status: 'FIXED', concepts_affected: [GPE], fixed_in_files: [],
        discovered_in_session: S, row_type: 'incident', fixed_at: NOW,
    },
];

async function main(): Promise<void> {
    // Idempotent by (bug_class, session): the first run of this script died partway
    // through on a probe_type CHECK violation, so it has to be safe to finish.
    const existing = await supabaseAdmin.from('engine_bug_queue')
        .select('bug_class').eq('discovered_in_session', S);
    if (existing.error) throw new Error(`preflight read failed: ${existing.error.message}`);
    const have = new Set((existing.data || []).map((r) => r.bug_class as string));
    let filed = 0;
    for (const r of rows) {
        if (have.has(r.bug_class)) { console.log(`  skip  ${r.bug_class}`); continue; }
        const { error } = await supabaseAdmin.from('engine_bug_queue').insert(r);
        if (error) throw new Error(`insert failed for ${r.bug_class}: ${error.message}`);
        console.log(`  ${r.status.padEnd(5)} ${r.bug_class}`);
        filed++;
    }
    console.log(`\n✅ Filed ${filed} new scar rows (${rows.length} total) for session ${S}`);
}

main().catch((err) => {
    console.error('💥 scar filing failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
