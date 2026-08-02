/**
 * Apply the Ch.6 scar candidates to engine_bug_queue.
 *
 * Founder-approved 2026-08-02: "apply them all, FIXED as fixed, rest OPEN".
 *
 * Upsert key is bug_class — a recurrence UPDATES its row, never a duplicate INSERT.
 * Run: npx tsx --env-file=.env.local src/scripts/_apply_ch6_scars.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Row = {
    bug_class: string;
    title: string;
    severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
    owner_cluster: string;
    root_cause: string;
    prevention_rule: string;
    probe_type: string;
    probe_logic: string;
    status: 'OPEN' | 'FIXED';
    concepts_affected: string[];
    fixed_in_files: string[];
    discovered_in_session: string;
    row_type: 'incident' | 'directive' | 'probe_definition';
};

const S0C = 'ch6 Phase-0 stage 0c 2026-08-01';
const SCA = 'ch6-0d-checkpointA-work_done_by_constant_force';
const SCB1 = 'ch6-0d-checkpointB-cycle1-work_done_by_constant_force';
const SCB2 = 'ch6-founder_proxy-checkpointB-cycle2-work_done_by_constant_force';
const RENDERER = ['src/lib/renderers/field_3d_renderer.ts'];

const rows: Row[] = [
    // ── SEAM K ─────────────────────────────────────────────────────────────
    {
        bug_class: 'nlb_spring_is_scripted_not_physical',
        title: 'The newtons_laws_body spring was a scripted choreography with no force law, so no honest energy quantity could be derived from it',
        severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: 'spring_action (2026-07-30) made the coil LOOK real by scripting its length from a closed form of the wall phase and holding the pair in a latch until release. The picture was honest; the physics was not. There was no k, no F = -kx and no compression state anywhere in the engine, so an energy layer could not compute Us = 0.5*k*x^2 because neither k nor x existed. Founder ruling 2026-08-01: build the real spring and slow the PLAYBACK over it.',
        prevention_rule: 'When a concept teaches a QUANTITY that a piece of apparatus stores, that apparatus needs a real constitutive law in the integrator, not a choreography that resembles one. The legibility problem a script was solving (the event is too fast) is a PLAYBACK problem, solved by scaling the integrator dt inside a detected window with a visible slow-motion badge — never by replacing the dynamics.',
        probe_type: 'js_eval',
        probe_logic: 'With spring.k_N_per_m authored, assert PM_nlbSpringK > 0, PM_nlbSpringX > 0 for at least one frame of a contact, and PM_nlbSpringForceN === PM_nlbSpringK * PM_nlbSpringX to 1e-9 on every frame.',
        status: 'FIXED',
        concepts_affected: ['conservation_of_mechanical_energy', 'elastic_potential_energy_spring', 'newton_third_law'],
        fixed_in_files: RENDERER, discovered_in_session: S0C, row_type: 'incident',
    },
    {
        bug_class: 'contact_detected_slow_window_arms_one_frame_late_and_buries_the_body_at_full_dt',
        title: 'A contact-detected slow window armed on the CURRENT overlap runs its first contact frame at full dt, burying the body in the spring',
        severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: 'Arming the slow window on the frame where overlap is first observed means that frame has already advanced at full dt with zero spring force, so the body lands up to v*dt inside the coil and gains 0.5*k*(v*dt)^2 that no work produced. Measured 0.1156 J vs 0.0016 J on the flat case — over the acceptance bar.',
        prevention_rule: 'A window that scales dt must arm on a ONE-STEP LOOKAHEAD of the condition, not on the condition itself; by the time the condition is observable the un-scaled step has already been taken.',
        probe_type: 'js_eval',
        probe_logic: 'At the first frame where PM_nlbSpringContact is true, assert PM_nlbSpringX < v*dtPhysics*0.1 — i.e. the body entered the coil under the scaled step, not the full one.',
        status: 'FIXED', concepts_affected: ['conservation_of_mechanical_energy'],
        fixed_in_files: RENDERER, discovered_in_session: S0C, row_type: 'directive',
    },
    {
        bug_class: 'derived_energy_sum_pairs_prestep_position_with_poststep_velocity',
        title: 'An energy sum built from a pre-step position and a post-step velocity is not a state function and carries an O(dt) hole',
        severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: 'The publish pass reused the integrator pre-step x alongside the post-step v. K + U is only a state function when every term is read at the SAME instant; mixing them leaves an O(dt) residual that reads as a breathing total.',
        prevention_rule: 'Re-derive every term of a conserved sum from post-step state in one pass. Never reuse a value the integrator computed before its own update.',
        probe_type: 'js_eval',
        probe_logic: 'Assert PM_nlbEnergy.K, .U_grav and .U_spring are all consistent with the SAME published s and v in the same frame snapshot.',
        status: 'FIXED', concepts_affected: ['conservation_of_mechanical_energy'],
        fixed_in_files: RENDERER, discovered_in_session: S0C, row_type: 'directive',
    },
    {
        bug_class: 'geometric_track_clamp_rendered_as_an_energy_change',
        title: 'nlbBoundsM zeroes v at a track bound — a GEOMETRIC clamp that must never be presented as an energy change',
        severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: 'The integrator clamps s at the track bound and zeroes v. With an energy layer live, K collapses to zero and the total column drops — presenting a rendering constraint as physics.',
        prevention_rule: 'A velocity zeroed by a geometric clamp must never render as an energy change: HOLD the last pre-clamp bar values and warn loudly with a unique console prefix so a mis-authored state fails at THE EYE rather than silently.',
        probe_type: 'js_eval',
        probe_logic: 'Assert zero console occurrences of [PM_NLB_ENERGY_CLAMP] across the EYE run for any state authoring an energy layer.',
        status: 'FIXED', concepts_affected: ['conservation_of_mechanical_energy', 'work_done_by_constant_force'],
        fixed_in_files: RENDERER, discovered_in_session: S0C, row_type: 'probe_definition',
    },
    // ── SEAM M ─────────────────────────────────────────────────────────────
    {
        bug_class: 'field3d_measured_overlay_fit_runs_once_against_a_sibling_blanked_on_entry',
        title: 'A measure-and-reflow overlay fitted at state entry measures a sibling panel that entry just blanked',
        severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: 'nlb blanks the slow-motion badge on every state entry (correct — no state may inherit the previous badge for the frame a frozen pin can catch). The energy panel fitted its top against that badge in the SAME entry pass, measured display:none, and anchored at the minimum. The badge then opened at spring contact, mid-state, and rendered underneath the panel.',
        prevention_rule: 'An overlay whose position depends on a sibling that can appear MID-STATE must re-measure per frame (churn-guarded, rounded to whole pixels), not once at entry. Entry-time fit is only valid against siblings whose visibility is decided by the STATE, not by the PHYSICS.',
        probe_type: 'manual',
        probe_logic: 'Drive the scenario headlessly to a frame where the dependent sibling is VISIBLE and assert the two getBoundingClientRect boxes do not intersect. A code read cannot see this; an entry-time screenshot cannot either.',
        status: 'FIXED', concepts_affected: ['conservation_of_mechanical_energy'],
        fixed_in_files: RENDERER, discovered_in_session: S0C, row_type: 'directive',
    },
    {
        bug_class: 'field3d_two_authoring_faults_share_one_warn_once_latch',
        title: 'Two distinct authoring faults sharing one warn-once latch means the second never reports',
        severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: 'A single _warned flag guarded two independent guards, so whichever fired first silenced the other for the rest of the state. Found because only one of two deliberately mis-authored negative controls fired.',
        prevention_rule: 'Every guard owns its OWN warn-once latch, keyed by the guard, never by the subsystem. A shared latch converts a second real defect into silence.',
        probe_type: 'js_eval',
        probe_logic: 'Deliberately trip two guards in the same state and assert BOTH console prefixes appear.',
        status: 'FIXED', concepts_affected: ['conservation_of_mechanical_energy'],
        fixed_in_files: RENDERER, discovered_in_session: S0C, row_type: 'incident',
    },
    {
        bug_class: 'field3d_pinned_rewind_reproduces_the_instant_but_not_the_last_float_bit',
        title: 'A pinned rewind reproduces the drawn instant exactly but raw float mirrors differ in the last bits',
        severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: 'RESET -> pin(t) -> RESET -> pin(t) produces a byte-identical DOM snapshot, but the raw PM_* float mirrors differ at the 15th significant digit, inherited from the integrator crawl-to-pin rather than from any drawn state.',
        prevention_rule: 'Round every DERIVED style value before writing it, so frozen-frame byte-identity is a property of the code rather than of CSSOM number normalisation. Raw float mirrors are diagnostics, never gate inputs.',
        probe_type: 'js_eval',
        probe_logic: 'Pin the same instant twice via two different rewind paths and assert the full DOM snapshot (styles, transforms, value strings) is identical.',
        status: 'FIXED', concepts_affected: ['conservation_of_mechanical_energy'],
        fixed_in_files: RENDERER, discovered_in_session: S0C, row_type: 'directive',
    },
    {
        bug_class: 'field3d_path_integral_accumulator_bills_a_teleport_as_displacement',
        title: 'A path-integral accumulator bills a teleport (sandbox wrap, loop reset, clamp remap) as real displacement',
        severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: 'The work accumulator sums F*ds per step. A wrap, a loop reset or a bound clamp moves s discontinuously; without a guard the ledger bills that jump as work no force produced.',
        prevention_rule: 'A teleport is not a displacement and must never be paid for: discard any single-step |ds| larger than half the track span, independently of the reset funnel, because a wrap and its reset happen in the same frame.',
        probe_type: 'js_eval',
        probe_logic: 'Force a wrap and assert the ledger increment across that frame is zero.',
        status: 'FIXED', concepts_affected: ['conservation_of_mechanical_energy', 'work_done_by_constant_force'],
        fixed_in_files: RENDERER, discovered_in_session: S0C, row_type: 'incident',
    },
    // ── Checkpoint A (both cycles) ─────────────────────────────────────────
    {
        bug_class: 'nlb_checkpoint_s_m_authored_as_displacement_not_track_coordinate',
        title: 'checkpoints.s_m is an absolute track coordinate; authoring it as displacement stamps the wrong joules',
        severity: 'CRITICAL', owner_cluster: 'alex:architect',
        root_cause: 'nlbRunCheckpoints compares b.s (seeded from initial_position_m, on a track spanning -length_m..+length_m, default half-length 6 m) against cp.s_m. A skeleton writing s_m: 2.0 meaning "2 metres of displacement" fires the stamp at 2.0 m of TRACK, so the stamped W = F*d*cos(theta) disagrees with the formula surface unless initial_position_m = 0. No gate cross-checks a stamp against a formula.',
        prevention_rule: 'Author every checkpoint as arithmetic on the home pose (s_m = initial_position_m + d_target), never as a bare displacement literal; state initial_position_m explicitly in the skeleton home-pose paragraph.',
        probe_type: 'js_eval',
        probe_logic: 'For each state authoring newtons_laws_body.checkpoints: read initial_position_m of the tracked body, compute d = s_m - initial_position_m, and assert the concept claimed stamp value equals F_along * d for the authored applied_force.',
        status: 'OPEN',
        concepts_affected: ['work_done_by_constant_force', 'positive_negative_zero_work', 'work_energy_theorem', 'conservative_vs_nonconservative_forces', 'average_power'],
        fixed_in_files: [], discovered_in_session: SCA, row_type: 'directive',
    },
    {
        bug_class: 'nlb_loop_reset_clears_checkpoint_stamp_and_frozen_pin_can_photograph_an_empty_formula',
        title: 'loop_reset_ms wipes every checkpoint stamp each cycle; the 60%-phase frozen pin can land before the re-crossing',
        severity: 'MAJOR', owner_cluster: 'alex:architect',
        root_cause: 'nlbRunLoopReset routes through nlbResetTrajectory -> nlbSpringPhysReset, which clears cp.text, cp._side and cp._count and re-renders formula_base with no stamp. SEAM M pins the frozen frame at cycle*R + clamp(0.60R,150,R-150). A flag crossed after 60% of R therefore never appears in the canonical reviewer frame or the H2 baseline, and blinks off periodically for a live teacher.',
        prevention_rule: 'A state combining loop_reset_ms with checkpoints must author the crossing to occur before 55% of loop_reset_ms, computed against the authored acceleration; the skeleton states this invariant beside the bounding discipline.',
        probe_type: 'js_eval',
        probe_logic: 'For each state authoring both loop_reset_ms (R) and checkpoints: integrate the authored acceleration from initial_position_m and assert time-to-cross(s_m) < 0.55*R. Independently, pin at the contracted instant and assert #nlb_formula contains the stamp label.',
        status: 'OPEN',
        concepts_affected: ['work_done_by_constant_force', 'positive_negative_zero_work', 'work_energy_theorem', 'conservative_vs_nonconservative_forces'],
        fixed_in_files: [], discovered_in_session: SCA, row_type: 'directive',
    },
    {
        bug_class: 'nlb_sandbox_wrap_remaps_s_but_not_s0_so_the_d_arrow_contradicts_the_rezeroed_work_ledger',
        title: 'On a sandbox wrap the displacement origin is not re-anchored, so the d readout and the work meter count down and disagree',
        severity: 'CRITICAL', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: 'The sandbox wrap does s1 -= span and calls nlbEnergyOnWrap -> nlbSpringPhysReset, which correctly zeroes every W ledger. The displacement origin was NOT re-anchored, so the arrow measured from a stale pre-wrap origin. Measured live on work_done_by_constant_force STATE_6 at DEFAULT settings with no teacher input: at 2864 ms the canvas read d = 8.95 m and 89.5 J (exact); at 8896 ms it read d = 3.98 m and 45.3 J where 20*3.98*cos60 = 39.8 J, off by 13.8 percent, with BOTH readouts DECREASING under a constant forward force. First wrap at defaults 3.4 s; at F=60/theta=0 it is 1.36 s. NOTE: the originally prescribed remedy (remap b.s0 by the span) is WRONG — b.s0 is the kinematic seed that nlbResetTrajectory restores, and a span remap would render d = 11.61 m beside a 0 J meter, 21x worse. The correct fix is a dedicated displacement anchor re-anchored (not translated) at the wrap.',
        prevention_rule: 'When a reset path re-zeroes a displayed accumulator, every other surface measuring the same interval must RE-ANCHOR in the same statement — not translate, and not reuse the kinematic seed. The authoring mitigation "seed initial_position_m at the wrap-receiving bound" is WITHDRAWN: it trips the false-clamp scar.',
        probe_type: 'js_eval',
        probe_logic: 'Drive a sandbox state 15 s at defaults and again at the slider extremes; at every 250 ms sample assert |W_rendered - F*d_rendered*cos(theta)| <= 0.5*10^-dp*F*cos(theta), and that d and W drop in the SAME sample at every lap boundary (unpaired drops = 0).',
        status: 'FIXED',
        concepts_affected: ['work_done_by_constant_force', 'positive_negative_zero_work'],
        fixed_in_files: RENDERER, discovered_in_session: SCA, row_type: 'incident',
    },
    {
        bug_class: 'architect_declares_an_engine_limit_without_checking_the_per_concept_override_path',
        title: 'A skeleton designed around an engine "fixed range" that is only a default overridable via slider_controls',
        severity: 'MODERATE', owner_cluster: 'alex:architect',
        root_cause: 'The skeleton withheld a slider from the state that teaches its own variable, and instructed that no surgeon dispatch be opened, on the stated ground that the F_ang range is engine-fixed at -90..180. NLB_SLIDER_SPEC holds DEFAULTS; nlbSc(token) merges config.slider_controls[token] over them for min/max/step/default/label, keyed by the same token controls_visible uses. A seam report names the default; the config type and the reader name the contract.',
        prevention_rule: 'Before declaring any engine value fixed, read BOTH the config type declaration and the reader function in the renderer, not the seam report alone; a seam report states what was built, the reader states what is authorable. Quote both line numbers in the skeleton.',
        probe_type: 'manual',
        probe_logic: 'For every ENGINE FIT CHECK row asserting a limit or an absent mechanism, grep the renderer for the config-type field and its reader function and quote both line numbers. An asserted non-existence with no grep behind it is this bug.',
        status: 'OPEN', concepts_affected: ['work_done_by_constant_force'],
        fixed_in_files: [], discovered_in_session: SCA, row_type: 'directive',
    },
    {
        bug_class: 'nlb_static_state_authored_on_the_track_bound_fires_a_false_clamp_alarm',
        title: 'A body authored at initial_position_m = -length_m trips the energy clamp guard every frame it does not move',
        severity: 'MAJOR', owner_cluster: 'alex:architect',
        root_cause: 'nlbBoundsM returns lo = -length_m and the integrator treats any s1 within 1e-9 of a bound as a clamp, calling nlbEnergyClampGuard whenever energy_active is true — which work_accumulators alone make true, no energy_layer required. A state whose body deliberately does NOT move and is seeded exactly on the bound emits [PM_NLB_ENERGY_CLAMP] on every entry, on a correctly-authored state. Separately the slab is drawn to exactly +/-length_m while a cart half-width is 0.55 m, so a body centred on the bound overhangs the floor by half its own width in every opening frame.',
        prevention_rule: 'Never author a home pose exactly on a track bound. Inset it by at least the body half-width (0.6 m for a cart) in every state.',
        probe_type: 'js_eval',
        probe_logic: 'For every state authoring newtons_laws_body: assert Math.abs(body.initial_position_m) < surface.length_m - 0.55. Independently, drive 2 s and assert zero console messages beginning [PM_NLB_ENERGY_CLAMP].',
        status: 'OPEN',
        concepts_affected: ['work_done_by_constant_force', 'positive_negative_zero_work', 'work_energy_theorem', 'conservative_vs_nonconservative_forces', 'mechanical_energy_loss_with_friction'],
        fixed_in_files: [], discovered_in_session: SCA, row_type: 'directive',
    },
    {
        bug_class: 'nlb_work_bar_glow_ids_never_light_behind_the_energy_prefix_gate',
        title: 'SEAM M declares work_bar_* glow ids but nlbEnergyApplyGlow gates on energy_* prefixes, so the focal lights nothing and dims everything',
        severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: 'nlbEnergyApplyGlow computes isEn from four literal tests — energy_panel, energy_bar_*, energy_seg_*, energy_col_E. work_bar_applied|gravity|friction|normal|net match none, so every slot is written opacity 1 / boxShadow none and the intended focal is never lit, despite NLB_WK_GLOW setting the correct data-en. Worse than a no-op: nlbApplyGlow still sees a truthy focal matching no mesh, so every arrow and label takes the dim branch at GLOW_DIM_OPACITY — the state renders with its whole force diagram at 40 percent and nothing highlighted.',
        prevention_rule: 'A glow id declared in a seam contract ships with a probe that lights it and asserts a pixel-level difference; a declared-but-unreachable id is worse than an absent one because the unmatched focal dims the entire scene.',
        probe_type: 'js_eval',
        probe_logic: 'For each id in the seam contract glow list, SET_GLOW to it on a state that renders the element and assert the element opacity is 1.0 AND at least one declared peer sits at GLOW_DIM_OPACITY. An id where every element stays at 1.0 is this bug.',
        status: 'OPEN',
        concepts_affected: ['work_done_by_constant_force', 'positive_negative_zero_work', 'work_energy_theorem', 'mechanical_energy_loss_with_friction'],
        fixed_in_files: [], discovered_in_session: SCA, row_type: 'incident',
    },
    {
        bug_class: 'nlb_seized_slider_run_overruns_a_loop_sized_work_scale',
        title: 'A state with a slider abandons loop_reset_ms on the first trusted input, so its reachable work peak is the whole track, not the loop',
        severity: 'MAJOR', owner_cluster: 'alex:json_author',
        root_cause: 'A trusted slider input latches PM_nlbSweepSeized and nlbRunLoopReset returns early for the rest of the state visit. A work_scale_J sized to the authored loop peak is then exceeded by the seized traverse at the slider extreme, so the bar clamps at full deflection and [PM_NLB_ENERGY_SCALE] fires — in exactly the state whose taught quantity is the bar. A mode:sandbox state has no loop at all and traverses a full lap by construction. Measured on work_done_by_constant_force STATE_6: ledger 532.3 J at +1.2 s and 634.9 J at +6.0 s against an authored 240 J. THE EYE cannot fire trusted events, so every structural gate passed.',
        prevention_rule: 'work_scale_J on ANY state with a non-empty controls_visible is sized to 1.1x the peak reachable at the slider clamp extremes over the full remaining track — and for mode:sandbox over a full post-wrap lap (2*length_m), since a sandbox has no loop to bound it.',
        probe_type: 'js_eval',
        probe_logic: 'For each state with controls_visible non-empty and work_accumulators authored: span = (mode === sandbox) ? 2*length_m : (length_m - initial_position_m); assert work_scale_J >= 1.1 * max_over_slider_range(|F_along|) * span.',
        status: 'FIXED',
        concepts_affected: ['work_done_by_constant_force', 'positive_negative_zero_work', 'work_energy_theorem', 'average_power'],
        fixed_in_files: [], discovered_in_session: SCA, row_type: 'directive',
    },
    {
        bug_class: 'nlb_checkpoint_capture_overshoots_exact_crossing_value',
        title: 'The checkpoint captures at the first frame PAST the crossing, so an exact-agreement stamp prints a non-round number',
        severity: 'CRITICAL', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: 'nlbRunCheckpoints detects the crossing by a POST-STEP sign change and nlbCpStampText then reads W, K, U, E, v and s at that post-step position, with no interpolation back to the crossing coordinate. The overshoot is F_along*(b.s - cp.s_m), bounded by F_along*v_cross*h. On work_done_by_constant_force STATE_4 the stamp read 40.6 J under a formula predicting 40.0 J — in the state whose entire claim is that prediction equals measurement. The ledger itself was exact everywhere; only the capture was quantized. SEAM N verified the ledger; nobody verified the capture.',
        prevention_rule: 'Interpolate every captured quantity back to the exact crossing using the step fraction. Quantities linear in the step (s, W) rewind exactly; quadratic ones (K, U_spring) are rebuilt from an interpolated v or x, never lerped directly. No authoring fix exists: the relative error h*sqrt(2a/d) is independent of F.',
        probe_type: 'js_eval',
        probe_logic: 'Author a checkpoint whose claimed stamp is a round number; sweep the sub-step phase the loop can land the crossing on and assert the stamped value is identical at every phase.',
        status: 'FIXED',
        concepts_affected: ['work_done_by_constant_force', 'positive_negative_zero_work', 'work_energy_theorem', 'conservative_vs_nonconservative_forces', 'average_power'],
        fixed_in_files: RENDERER, discovered_in_session: SCA, row_type: 'incident',
    },
    // ── Checkpoint B cycle 1 (were ONLY in the agent report) ───────────────
    {
        bug_class: 'nlb_multibody_lane_gap_is_along_z_so_a_head_on_camera_stacks_the_compared_bodies',
        title: 'A side-by-side compare authored with a head-on camera draws the two bodies on top of each other',
        severity: 'CRITICAL', owner_cluster: 'alex:architect',
        root_cause: 'nlbBodyLaneZ separates independent bodies by NLB_LANE_GAP = 0.85 along z. z is a DEPTH axis, so under a camera_position with x = 0 the lane projects to a fraction of a body width and the near body simply occludes the far one. Two bodies sharing initial_position_m are at identical screen-x by construction. Measured on work_done_by_constant_force STATE_5 at camera [0,2.0,10]: 39 px of x-overlap on a 52 px body at t=0, 49 percent of one crate hidden, persisting for the first ~1200 ms of every 2000 ms loop. Camera-alone disjointness needs tan(phi) > 1.833, i.e. azimuth > 61 degrees, at which the along-track race projects at cos61 = 0.48 and is halved — so the camera is necessary but NOT sufficient; a release stagger is also required.',
        prevention_rule: 'A state placing two or more independent bodies in lanes MUST author an off-axis camera AND a release stagger chosen so the projected screen-x extents are disjoint at t=0; the skeleton states the projected screen separation, not merely the world lane gap.',
        probe_type: 'js_eval',
        probe_logic: 'For each state whose bodies length > 1: project each body mesh through the state camera and assert the screen-x extents are disjoint at t=0 and at every 100 ms sample through one loop period.',
        status: 'OPEN',
        concepts_affected: ['work_done_by_constant_force', 'positive_negative_zero_work', 'work_energy_theorem', 'conservation_of_mechanical_energy'],
        fixed_in_files: [], discovered_in_session: SCB1, row_type: 'directive',
    },
    {
        bug_class: 'nlb_angle_arc_radius_overruns_the_neighbouring_lane_body',
        title: 'The angle arc is anchored correctly but its world-unit radius lands the arc and its label on the next body',
        severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: 'angle_arc.radius is authored in WORLD units and drawn from the owning body outward along the direction of motion. At the default 0.85 (about 58-80 screen px) the arc sweeps past any neighbouring lane body closer than that on screen. On work_done_by_constant_force STATE_5 the arc was anchored to crate_b per JSON but terminated inside crate_a, which carries a 0-degree force, so the rendered "theta = 60 deg" marker read as belonging to the flat pull.',
        prevention_rule: 'Clamp the arc radius at draw time to the screen distance to the nearest other body, or draw the arc behind bodies with an explicit leader to its owner. An arc overlapping a body it does not belong to is this bug.',
        probe_type: 'js_eval',
        probe_logic: 'For each state authoring angle_arc alongside more than one body: project the arc sampled points and every body bbox; assert no arc sample and no arc label rect falls inside the screen bbox of a body other than angle_arc.body_id.',
        status: 'OPEN', concepts_affected: ['work_done_by_constant_force', 'positive_negative_zero_work'],
        fixed_in_files: [], discovered_in_session: SCB1, row_type: 'incident',
    },
    {
        bug_class: 'nlb_body_label_is_brighten_only_so_static_text_outranks_the_state_focal',
        title: 'Body labels sit in the solidApparatus brighten-only set, so static mass text is the brightest thing on canvas',
        severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: 'field_3d_renderer includes elementType nlb_body_label in the solidApparatus set passed to applyGlowEmphasis as brightenOnly, which skips ALL opacity writes. That set exists so SOLID apparatus never ghosts out under Rule 29 — a text label is not solid apparatus. Consequence: in every nlb state the body label renders full-bright while the state focal arrow renders as a dimmed peer at about 40 percent.',
        prevention_rule: 'brightenOnly protects OBJECTS, never text. Any *_label elementType is a normal emphasis peer and must dim.',
        probe_type: 'js_eval',
        probe_logic: 'In any nlb state with a glow_focal, assert the material opacity of every nlb_body_label is strictly less than the opacity of the focal element whenever glow is active.',
        status: 'OPEN',
        concepts_affected: ['work_done_by_constant_force', 'newton_third_law', 'connected_bodies', 'friction_force', 'normal_force'],
        fixed_in_files: [], discovered_in_session: SCB1, row_type: 'incident',
    },
    {
        bug_class: 'nlb_work_probe_globals_disagree_on_multibody_states',
        title: 'PM_nlbWork reports one body while PM_nlbWorkApplied reports the sum, so a numeric gate reads a value on no bar',
        severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: 'On a state with more than one work_accumulator, PM_nlbWork.applied carries only the LAST body written while PM_nlbWorkApplied carries the SUM across bodies. Measured on work_done_by_constant_force STATE_5: 13.271 (one crate) against 66.355 (the sum). Neither global corresponds to a single rendered bar, so THE CALCULATOR and any js_eval probe silently compare against a quantity the screen never shows.',
        prevention_rule: 'Every probe global on a multi-body scenario must be keyed by body_id; a scalar global on a per-body quantity is this bug.',
        probe_type: 'js_eval',
        probe_logic: 'For each state with work_accumulators length > 1: assert a per-body probe surface exists and each entry equals its rendered bar value; assert no scalar global silently aliases one body or a cross-body sum.',
        status: 'OPEN',
        concepts_affected: ['work_done_by_constant_force', 'positive_negative_zero_work', 'work_energy_theorem'],
        fixed_in_files: [], discovered_in_session: SCB1, row_type: 'incident',
    },
    {
        bug_class: 'the_eye_passes_a_frame_in_which_one_compared_body_is_hidden_behind_another',
        title: 'THE EYE returned 27/27 with an empty warnings array on a frame with 49 percent body-on-body occlusion',
        severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: 'No gate in the visual pipeline compares the projected screen extents of two solid bodies. work_done_by_constant_force STATE_5 dumped 27/27 with warnings = [] while one crate showed 760 of its normal 1486 visible pixels, behind the other, recurring every loop for a third of the run. Occlusion is invisible to per-frame checks because both meshes are present, visible and correctly positioned in world space.',
        prevention_rule: 'Emit a console warning tag (PM_NLB_LANE_OCCLUSION) from the renderer whenever two non-ghost nlb body screen bboxes intersect, and have THE EYE surface it in manifest.warnings like the existing _CLAMP and _SCALE guards.',
        probe_type: 'js_eval',
        probe_logic: 'Assert manifest.warnings contains a PM_NLB_LANE_OCCLUSION entry for any captured frame in which two non-ghost nlb body screen bounding boxes intersect.',
        status: 'OPEN', concepts_affected: ['work_done_by_constant_force'],
        fixed_in_files: [], discovered_in_session: SCB1, row_type: 'probe_definition',
    },
    // ── Checkpoint B cycle 2 (were ONLY in the agent report) ───────────────
    {
        bug_class: 'nlb_word_body_label_overprints_the_state_focal',
        title: 'A word used as a body label renders a sprite 50 percent wider than the mass-symbol convention the label dodge is tuned for',
        severity: 'CRITICAL', owner_cluster: 'alex:json_author',
        root_cause: 'nlbBodyLabelText appends " = <m> kg" to any authored label that does not already carry a unit, so label:"crate" renders the 12-glyph sprite "crate = 5 kg". Every other newtons_laws_body concept authors the mass SYMBOL, rendering 8 glyphs; nlbInkHalfW own tuning comment states the design envelope as "m1 = 4 kg". Observed on work_done_by_constant_force: STATE_4 the label was drawn through the checkpoint flag post while glow_focal was that very checkpoint; STATE_6 it overprinted the arrowhead and abutted the angle readout, rendering "crate = 5 kgtheta = 60deg" in the sandbox state where the teacher drags theta. Compounding: the same string is already in the HUD, so the loudest 3D text in a concept teaching W = F*d*cos(theta) was the one quantity the concept exists to say is absent from the formula.',
        prevention_rule: 'A newtons_laws_body body label is the mass SYMBOL, never a noun. The noun belongs in the state label, the caption or the HUD. Any authored label wider than "m1 = 4 kg" is outside the label dodge design envelope.',
        probe_type: 'js_eval',
        probe_logic: 'For every state of every concept authoring bodies: compute nlbBodyLabelText for each body and assert the rendered string is <= 9 characters, OR assert its ink rect overlaps no other visible sprite ink rect, arrow head bbox or checkpoint marker by more than 3 px. Fail loudly when the overlapped element is the state glow_focal.',
        status: 'FIXED', concepts_affected: ['work_done_by_constant_force'],
        fixed_in_files: ['src/data/concepts/work_done_by_constant_force.json'],
        discovered_in_session: SCB2, row_type: 'incident',
    },
    {
        bug_class: 'concept_ships_zero_narration_glow_bindings',
        title: 'A concept can pass every gate with 0 of N tts_sentences carrying a glow, so on-canvas emphasis never moves',
        severity: 'MAJOR', owner_cluster: 'alex:physics_author',
        root_cause: 'Nothing in the validator, THE EYE, eye_walker or quality_auditor counts glow bindings on teacher_script.tts_sentences. work_done_by_constant_force ships 0/18 against 18/18 (faraday_law_induction), 17/17 (newton_third_law) and 24/24 (capacitance) — three concepts already treated as shape exemplars. The defect is invisible sound-off (Rule 24 default) and therefore never surfaces in a frozen-frame review, but with narration on the focal element is static for the full 22-26 s of every state.',
        prevention_rule: 'Every tts_sentences entry carries a glow naming exactly one on-canvas element that exists in that state. Zero bindings is an authoring omission, never a design choice; partial bindings name which sentences deliberately carry none and why.',
        probe_type: 'js_eval',
        probe_logic: 'For each concept JSON: count tts_sentences and count those with a truthy glow; assert the ratio is 1.0. For each glow value assert the named id exists among that state scene_composition ids, its field_3d primitives, or the renderer published element ids.',
        status: 'OPEN', concepts_affected: ['work_done_by_constant_force'],
        fixed_in_files: [], discovered_in_session: SCB2, row_type: 'probe_definition',
    },
    {
        bug_class: 'nlb_displacement_vector_is_single_body_so_a_compare_state_measures_only_one',
        title: 'newtons_laws_body accepts one displacement_vector, so a two-body compare state can show a measured d for only one body',
        severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: 'displacement_vector is a single config object and nlbOffAxisMirror resolves exactly one dcfg/dbody pair, while work_accumulators already accepts 1-4 entries each with its own body_id. work_done_by_constant_force STATE_5 renders two live work bars under a formula surface claiming one rule matches BOTH readings — but only one crate carries a d arrow, so a teacher can verify the claim on screen for one of the two bodies. Secondary consequence: because the bodies must be staggered to render disjoint under z-lane separation, the visible gap at the frozen pin is only 43 percent attributable to motion, and a per-body d arrow measuring from each body own release point would remove that ambiguity by construction.',
        prevention_rule: 'Any instrument a state uses to VERIFY a claim about N bodies must be authorable N times. When an existing sibling config in the same block already accepts a list keyed by body_id, a new measuring instrument follows that shape.',
        probe_type: 'js_eval',
        probe_logic: 'In a two-body state carrying work_accumulators, author a displacement_vector per body and assert each renders a visible arrow with a distinct label, and that for every body i |W_i - F_i*d_i*cos(theta_i)| is within display precision.',
        status: 'OPEN', concepts_affected: ['work_done_by_constant_force', 'positive_negative_zero_work'],
        fixed_in_files: [], discovered_in_session: SCB2, row_type: 'incident',
    },
    {
        bug_class: 'nlb_multibody_sandbox_wrap_reanchors_only_the_wrapping_body',
        title: 'A sandbox wrap clears the displacement anchor of every body and restores it for the wrapping body only',
        severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: 'LATENT — found by code read, NOT observed on screen; no state currently exercises it. At the wrap site nlbEnergyOnWrap funnels to nlbSpringPhysReset and clears the displacement anchor for every body in eng.order, and only then restores it for the single wrapping body. Since the wrap re-zeroes EVERY work ledger, a second body in the same sandbox would have its ledger reset to 0 while its displacement origin fell back to the kinematic seed — reintroducing exactly the contradiction the SEAM J fix removed, for the bodies that did not wrap.',
        prevention_rule: 'When a reset path re-zeroes an accumulator for ALL bodies, every surface measuring the same interval must be re-anchored for ALL bodies in the same statement. A per-body restore placed after a fleet-wide clear is correct only while the fleet has one member; write the loop.',
        probe_type: 'js_eval',
        probe_logic: 'Author a sandbox state with two bodies of different accelerations, both carrying displacement_vector and work_accumulators. Drive until the faster wraps, then assert for BOTH bodies that |W_i - F_along_i*d_i| = 0 in the same sample.',
        status: 'OPEN', concepts_affected: ['work_done_by_constant_force'],
        fixed_in_files: [], discovered_in_session: SCB2, row_type: 'probe_definition',
    },
];

async function main(): Promise<void> {
    const before = await supabaseAdmin.from('engine_bug_queue').select('*', { count: 'exact', head: true });
    console.log(`engine_bug_queue BEFORE: ${before.count} rows`);
    console.log(`applying ${rows.length} ch6 scar rows (upsert key = bug_class)…\n`);

    let inserted = 0;
    let updated = 0;
    for (const r of rows) {
        const existing = await supabaseAdmin
            .from('engine_bug_queue').select('bug_class').eq('bug_class', r.bug_class).maybeSingle();
        const { error } = await supabaseAdmin
            .from('engine_bug_queue').upsert(r, { onConflict: 'bug_class' });
        if (error) { console.error(`  ✗ ${r.bug_class}: ${error.message}`); continue; }
        if (existing.data) { updated++; console.log(`  ↻ UPDATED ${r.status.padEnd(5)} ${r.bug_class}`); }
        else { inserted++; console.log(`  + INSERT  ${r.status.padEnd(5)} ${r.bug_class}`); }
    }

    const after = await supabaseAdmin.from('engine_bug_queue').select('*', { count: 'exact', head: true });
    console.log(`\ninserted ${inserted} · updated ${updated}`);
    console.log(`engine_bug_queue AFTER: ${after.count} rows (was ${before.count})`);
}

main().catch((err) => { console.error('💥 apply failed:', err); process.exit(1); });
