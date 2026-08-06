/**
 * Schema-aware per-state metadata extraction from a cached simulation's
 * `physics_config` — companion to deriveStateIds.ts (same v1/v2 duality).
 *
 * Feeds the dense-capture motion checks (D5/D6/D7 in pixelGate):
 *   - deriveStateDurationsMs   → how long to densely capture each state
 *   - deriveMotionExpectations → which states DECLARE motion (D5 fails only
 *     when motion is declared but pixels never move; unknown → check skips —
 *     never guess)
 *
 * Feeds the sim-time-aware capture (screenshotter freeze+poll):
 *   - deriveMaxRevealTimeMs    → the state-local sim-time at which every timed
 *     reveal has completed, so the harness pins+polls PM_simTimeMs to THAT time
 *     before capturing (headless rAF is throttled → field_3d's frame-count clock
 *     lags wall-clock → late reveals never photographed → false negatives)
 *   - deriveHoldExpectations   → which states legitimately freeze (reveal-then-
 *     hold) or are user-driven (interactive), so D7/D1 don't false-fail on them
 *
 * Used by:
 *   - src/scripts/visual_eyes.ts (THE EYE protocol)
 *   - src/scripts/smoke_visual_validator.ts (--dense flag)
 */

const DURATION_MIN_MS = 3000;
// 60s cap: Rule-31 guided states run to their NARRATION length (up to ~50s),
// and the dense work is $0 (pixel math only — vision models never see dense
// frames), so follow the declared duration. Raised from 30000 on 2026-07-03 —
// the 30s clamp silently dropped every state's narration tail past 30s, which
// is exactly where the Ch.4 one-shot/narration desyncs lived (scar:
// field3d_state_duration_field_clamps_eye_capture_window). Previously raised
// from 15000 on 2026-06-10 for the same tail-blindness reason.
const DURATION_MAX_MS = 60000;

type StateRecord = Record<string, Record<string, unknown>>;

/** Resolve the per-state object map from either schema location. */
function resolveStates(physicsConfig: Record<string, unknown> | null): StateRecord {
    if (!physicsConfig) return {};

    const topStates = physicsConfig.states as StateRecord | undefined;
    if (topStates && typeof topStates === 'object' && Object.keys(topStates).length > 0) {
        return topStates;
    }

    const elp = physicsConfig.epic_l_path as Record<string, unknown> | undefined;
    if (elp && typeof elp === 'object') {
        const elpStates = elp.states as StateRecord | undefined;
        if (elpStates && typeof elpStates === 'object' && Object.keys(elpStates).length > 0) {
            return elpStates;
        }
    }

    return {};
}

/**
 * Per-state capture duration in ms, clamped to [3000, 30000]. States declare
 * `duration` in SECONDS (v2 epic_l_path) — values that look like seconds
 * (< 120) are converted; values that look like ms pass through.
 */
export function deriveStateDurationsMs(
    physicsConfig: Record<string, unknown> | null,
): Record<string, number> {
    const states = resolveStates(physicsConfig);
    const out: Record<string, number> = {};
    for (const [stateId, state] of Object.entries(states)) {
        const raw = state.duration;
        if (typeof raw !== 'number' || !Number.isFinite(raw) || raw <= 0) continue;
        const ms = raw < 120 ? raw * 1000 : raw;
        out[stateId] = Math.min(DURATION_MAX_MS, Math.max(DURATION_MIN_MS, ms));
    }
    return out;
}

/**
 * Which states DECLARE motion. Three-valued per state:
 *   true      → config declares motion (D5 enforces)
 *   false     → config declares stillness (D5 skips)
 *   undefined → unknown (D5 skips — never guess)
 */
export function deriveMotionExpectations(
    physicsConfig: Record<string, unknown> | null,
): Record<string, boolean | undefined> {
    const out: Record<string, boolean | undefined> = {};

    // particle_field (2D p5 diamonds — drift_velocity class): thermal random-walk
    // motion runs EVERY frame in EVERY state (the electrons never stop jittering,
    // even in the explore state), so all states declare motion unless a state
    // explicitly opts out with `motion: false`.
    const pfMotion = resolveParticleFieldStates(physicsConfig);
    if (pfMotion) {
        for (const [stateId, stateRaw] of Object.entries(pfMotion)) {
            const st = asObj(stateRaw);
            // emf_definition open-circuit states halt the current (i=0 → beads
            // frozen): a legitimately static MEASUREMENT beat (the voltmeter reads
            // the full emf), not a dead animation. Treat like an explicit motion:false
            // so D5 skips it instead of false-failing "motion declared but pixels
            // never move".
            out[stateId] = !(st && (st.motion === false || st.open_circuit === true));
        }
        return out;
    }

    // field_3d (authoritative shape): a gauss block with flow:true declares
    // continuous field-line flow — D5/D6 should expect ongoing pixel motion.
    // Read from field_3d_config.states (or a cached field_3d-as-physics_config)
    // since the gauss block does not live on epic_l_path.states.
    const f3d = resolveField3dStates(physicsConfig);
    if (f3d) {
        const f3dScenarioType = resolveField3dScenarioType(physicsConfig);
        for (const [stateId, stateRaw] of Object.entries(f3d.states)) {
            const state = asObj(stateRaw);
            const gauss = state ? asObj(state.gauss) : null;
            if (gauss && gauss.flow === true) { out[stateId] = true; continue; }
            // amperes_circuital_law: the march / accumulate / unroll modes are
            // continuous-or-one-shot MOTION states (the dl tiles walk round the
            // loop, the B·dl tiles drop in on a stagger, the ring straightens into
            // a bar). Declare motion so D5/D6 expect pixels to move; the post-unroll
            // result states (mode 'unroll' that then HOLDS, or 'static') fall to the
            // reveal_hold classification in deriveHoldExpectations instead. The
            // 'integrated' slider state is user-driven (interactive) — left to the
            // hold pass, never declared motion here.
            const acl = state ? asObj(state.acl_element) : null;
            if (acl && typeof acl.mode === 'string') {
                if (acl.mode === 'march' || acl.mode === 'accumulate') { out[stateId] = true; continue; }
                // PHYSICAL mode (founder video #2): STATE_7 = unroll + show_ienc shows
                // the 3D rod with CONTINUOUS current flow → declare motion (the flow
                // dots march up the wire every frame). STATE_8 (integrated) is the
                // slider explorer — left to deriveHoldExpectations as 'interactive'
                // (it also has flow, but the headless harness freezes its clock), so
                // it's not declared motion here. STATE_6 = unroll + !show_ienc is the
                // 2D ring→bar stage (no 3D flow) → reveal_hold, not motion.
                if (acl.mode === 'unroll' && acl.show_ienc === true) { out[stateId] = true; continue; }
                // STATE_6 'unroll' (no show_ienc) + 'integrated'/'static' → not motion.
            }
            // electric_potential_meaning (scenario point_charge_positive + a per-state
            // `potential` block): STATE_2's two-route animation and STATE_3's release
            // fly-out are continuous/one-shot MOTION states (the test charge travels +
            // the work tally / energy badge ticks every frame) → declare motion so
            // D5/D6 expect pixels to move. The other states (the q→2q grow, the ΔV/∞
            // markers, the shells fade-in, the V=W/q write-in) are one-shot reveals
            // then HOLD → left to deriveHoldExpectations's reveal_hold fallback. STATE_7
            // (draggable_test_charge) is user-driven → handled there as interactive.
            const pot = state ? asObj(state.potential) : null;
            if (pot) {
                const animatesRoute = Array.isArray(pot.animate_route) && pot.animate_route.length > 0;
                if (animatesRoute) { out[stateId] = true; continue; }
                if (typeof pot.release_at_ms === 'number') { out[stateId] = true; continue; }
                // electric_potential_dipole (dipole_potential): STATE_3 `sweep` (the
                // probe travels across the centre at fixed r while V recolors + flips
                // sign) and STATE_5 `theta_sweep` (0→180° angular sweep driving the
                // V-vs-θ live dot) are continuous one-shot MOTION states → declare
                // motion so D5/D6 expect pixels to move. STATE_4 disc reveal + STATE_6
                // curve draw are one-shot reveals-then-HOLD → reveal_hold (below).
                if (asObj(pot.sweep) || asObj(pot.theta_sweep)) { out[stateId] = true; continue; }
                // other potential states fall through to reveal_hold / interactive.
            }
            // parallel_plates (parallel_plate_capacitor_field): the gap-widen state
            // (capacitor.gap_widen) physically separates the plates + re-spaces the
            // field lines over a window → continuous one-shot MOTION (D5/D6 expect
            // pixels to move). The other capacitor states are one-shot timed reveals
            // then HOLD → reveal_hold; STATE_7 (show_sliders) is interactive — both
            // handled in deriveHoldExpectations.
            const cap = state ? asObj(state.capacitor) : null;
            if (cap && asObj(cap.gap_widen)) { out[stateId] = true; continue; }
            // pe_external_field (potential_energy_in_external_field): the per-state `pef`
            // block. MOTION states are STATE_2 (charge slide to a higher-V spot), STATE_3
            // (sign-flip recolor + meter swing + hill->well glyph), and STATE_7/8 (dipole
            // rotation: theta_sweep / oscillation / damped_swing). STATE_6 (collapse to
            // dipole) is a one-shot p-arrow draw-in + formula relabel that completes early
            // and then HOLDS -> reveal_hold, NOT mid-state motion (the ~600ms draw-in
            // finishes before the dense window opens, so declaring it motion false-fails
            // D5). A bare fly-in (enter_from) is likewise a one-shot reveal then HOLD
            // (STATE_4). STATE_1/4/5/6 = reveal_hold; STATE_9 = interactive (show_sliders).
            const pef = state ? asObj(state.pef) : null;
            if (pef) {
                const rm = typeof pef.rotation_mode === 'string' ? pef.rotation_mode : null;
                if (pef.dipole === true && rm && rm !== 'static') { out[stateId] = true; continue; }
                if (typeof pef.flip_at_ms === 'number') { out[stateId] = true; continue; }
                const pcs = Array.isArray(pef.charges) ? pef.charges : [];
                if (pcs.some((c) => { const co = asObj(c); return !!(co && co.slide_to != null); })) { out[stateId] = true; continue; }
                // No motion cue in this pef state -> field_3d reveal_hold / interactive.
                // Decide it HERE as non-motion (false, not undefined) so the epic_l-path
                // advance_mode heuristic below (auto_after_animation => motion) can't
                // false-declare a held pef reveal as motion. STATE_6 (collapse) is
                // auto_after_animation yet only draws p in once and then holds.
                out[stateId] = false; continue;
            }
            // earths_magnetism (the per-state `em` block). The ONLY sustained mid-state
            // motion is the STATE_5 latitude auto-sweep (em.sweep) → declare motion so
            // D5/D6 expect pixels to move. The reveal beats — STATE_1 tilt_reveal,
            // STATE_2 swing_reveal, STATE_3 dive_reveal, STATE_4 decompose_reveal — each
            // animate once then settle to a static-but-live payoff frame → declare them
            // non-motion (false, not undefined) so the settled payoff is not mis-read as
            // "motion died". Their reveal payoff is pinned in maxRevealForField3dState and
            // their hold intent is handled in deriveHoldExpectations (em → interactive).
            const em = state ? asObj(state.em) : null;
            if (em) { out[stateId] = em.sweep ? true : false; continue; }
            // magnetisation: every guided beat animates (current pulse / dipole
            // jitter+slide / alignment sweep / dense-line fade / material cycle);
            // the sandbox (mode 'sandbox') is user-driven → declare static (its
            // frozen tail is relaxed by the show_sliders→interactive hold pass).
            const mag = state ? asObj(state.mag) : null;
            if (mag) { out[stateId] = (mag.mode && mag.mode !== 'sandbox') ? true : false; continue; }
            // faraday: every guided beat animates (flux shimmer / magnet slide-in /
            // slide-out / Lenz approach / rate oscillation); the sandbox (mode
            // 'sandbox') is user-driven → declare static (its frozen tail is relaxed
            // by the show_sliders→interactive hold pass).
            const faraday = state ? asObj(state.faraday) : null;
            if (faraday) { out[stateId] = (faraday.mode && faraday.mode !== 'sandbox') ? true : false; continue; }
            // motional_emf_rod (motional_emf): every guided beat animates (rod
            // slide / charge-drift settle / RHR 3-phase curl / continuous v-driven
            // oscillation); the sandbox (mode 'sandbox') is user-driven → declare
            // static (its frozen tail is relaxed by the show_sliders→interactive
            // hold pass below, via the explicit motional_emf_rod branch).
            const mem = state ? asObj(state.motional_emf_rod) : null;
            if (mem) { out[stateId] = (mem.mode && mem.mode !== 'sandbox') ? true : false; continue; }
            // eddy_currents (eddy_current_pendulum): every guided beat animates
            // (plate swing decay/oscillation, loop-glyph brightness pulse, S4
            // twin decay contrast, S5 furnace/core crossfade); the sandbox
            // (mode 'sandbox') is user-driven → declare static (its frozen tail
            // is relaxed by the show_sliders→interactive hold pass below).
            const ecp = state ? asObj(state.eddy_current_pendulum) : null;
            if (ecp) { out[stateId] = (ecp.mode && ecp.mode !== 'sandbox') ? true : false; continue; }
            // inductance: every guided beat animates (ghost-jump vs real ramp,
            // switch-on/steady/switch-off graph + spark, geometry current loop +
            // core slide, energy reservoir fill/discharge, primary oscillation +
            // secondary needle deflection, coupling swap); the explore state
            // (mode 'explore') is user-driven → declare static (its frozen tail
            // is relaxed by the show_sliders→interactive hold pass below).
            const ind = state ? asObj(state.inductance) : null;
            if (ind) { out[stateId] = (ind.mode && ind.mode !== 'explore') ? true : false; continue; }
            // ac_generator: the coil rotates every guided beat (machine overview,
            // flux-cosine trace, EMF-sine phase, peak-dependence reshape, slip-ring
            // flip) → declare motion so D5/D6 expect ongoing pixel movement; the
            // sandbox explore state (mode 'sandbox') is user-driven → declare static
            // (its frozen tail is relaxed by the show_sliders→interactive hold pass
            // below — but the coil auto-sweeps there too, so it never truly freezes).
            const acg = state ? asObj(state.ac_generator) : null;
            if (acg) { out[stateId] = (acg.mode && acg.mode !== 'sandbox') ? true : false; continue; }
            // displacement_current: every guided beat animates (charge-loop bead
            // flow + dot/flux ramp, surface disk↔balloon morph, probe glide/sweep,
            // throttle on/off, B-ring pulse). STATE_8 (why_epsilon0_dphi_dt) is a
            // reveal_hold frozen snapshot — nothing physically moves, the glow-walk
            // + docking chain carry it → declare non-motion (false) so D5 does not
            // false-fail "motion died". STATE_10 (displacement_sandbox) is user-
            // driven → declare static; its idle I_c auto-sweep still moves pixels,
            // but its frozen tail is relaxed by the show_sliders→interactive hold
            // pass below.
            const dc = state ? asObj(state.displacement_current) : null;
            if (dc) {
                out[stateId] = (dc.reveal_hold === true || dc.mode === 'why_epsilon0_dphi_dt' || dc.mode === 'displacement_sandbox') ? false : true;
                continue;
            }
            // em_wave_propagation: every guided beat is a perpetually-moving wave
            // (the E/B train phase-advances +x every frame — pulse or train), so it
            // DECLARES motion. The explore sandbox (em_wave.interactive) is
            // user-driven → declare static (its self-running train still moves pixels,
            // but its frozen tail is relaxed by the show_sliders→interactive hold pass).
            const emw = state ? asObj(state.em_wave) : null;
            if (emw) { out[stateId] = (emw.interactive === true) ? false : true; continue; }
            // orbital_shapes (ATOMIC ORBITALS — CHEMISTRY): a beat that authors a
            // non-zero spin_rate turns the whole picture forever on the state clock
            // (that perpetual turn IS the 3D-legibility capability) → DECLARE motion
            // so D5/D6 expect ongoing pixel movement. A beat with the spin OFF
            // (every morph/extrude/probe/cutaway state, Rule 32b) is a one-shot ramp
            // that SETTLES — left undefined here so it is classified reveal_hold by
            // the hold pass instead of being false-failed for standing still. The
            // explore sandbox is user-driven → declare static and let the
            // interactive hold classification relax its tail.
            // bonding_scene (CHEMISTRY BONDING WAVE): a beat that authors a
            // non-zero spin_rate turns the whole unit forever on the state clock
            // (that perpetual turn is what makes the 3D count readable, D-4), and
            // a beat with a non-zero thermal.jiggle_scale never stops moving
            // either → DECLARE motion so D5/D6 expect ongoing pixel movement. A
            // still beat (spin off, no jiggle — Rule 32b, only the taught variable
            // moves) is a one-shot ramp that SETTLES: left undefined here so the
            // hold pass classifies it reveal_hold instead of false-failing it for
            // standing still. The explore sandbox is user-driven → declare static
            // and let the interactive hold classification relax its tail (the
            // renderer's idle auto-sweep keeps it moving regardless, Rule 37).
            const bscMotion = state ? asObj(state.bonding_scene) : null;
            if (bscMotion) {
                if (bscMotion.mode === 'explore') { out[stateId] = false; continue; }
                if (typeof bscMotion.spin_rate === 'number' && bscMotion.spin_rate > 0) { out[stateId] = true; continue; }
                const bscTh = asObj(bscMotion.thermal);
                if (bscTh && typeof bscTh.jiggle_scale === 'number' && bscTh.jiggle_scale > 0) { out[stateId] = true; continue; }
                // still beat: fall through to the reveal_hold classification.
            }
            const osMotion = state ? asObj(state.orbital_shapes) : null;
            if (osMotion) {
                if (osMotion.mode === 'explore') { out[stateId] = false; continue; }
                if (typeof osMotion.spin_rate === 'number' && osMotion.spin_rate > 0) { out[stateId] = true; continue; }
                // no spin: fall through to the reveal_hold classification.
            }
            // ac_resistor (v=vm*sin(wt) applied to R — Ch.7 CHAPTER_LOOP Stage-1b
            // engine ask): every guided beat animates continuously (oscillating
            // beads / flipping current arrow / p(t)-modulated heater emissive,
            // all driven by the accumulated phase on the state clock) — declare
            // motion so D5/D6 expect ongoing pixel movement even in S7/S8 where
            // the 3D apparatus itself holds pose (their motion lives on the scope
            // pane, which the pixel-diff motion probe still sees). The S9 sandbox
            // (mode 'explore') is user-driven → declare static (relaxed by the
            // show_sliders→interactive hold pass below — the AC cycle still
            // free-runs per Rule 37, so it never truly freezes either).
            const acr = state ? asObj(state.ac_resistor) : null;
            if (acr) { out[stateId] = (acr.mode && acr.mode !== 'explore') ? true : false; continue; }
            // ac_inductor (i=im*sin(wt-pi/2) LAGS an inductor's applied AC
            // voltage — Ch.7 §7.3, clean standalone sibling of ac_resistor):
            // every guided beat animates continuously (oscillating beads /
            // flipping current arrow / breathing field loops / back-emf
            // arrow pair / U-gauge, all driven by the accumulated/closed-
            // form phase on the state clock) — declare motion so D5/D6
            // expect ongoing pixel movement. S8 (one_integral_derivation)
            // intentionally SKIPS the 3D apparatus (Rule 26 motion carried
            // entirely by the scope-pane fold + derivation dock instead) but
            // STILL declares motion=true, since those panes keep moving. The
            // S9 sandbox (mode 'explore') is user-driven → declare static
            // (relaxed by the show_sliders→interactive hold pass below — the
            // AC cycle still free-runs per Rule 37, so it never truly
            // freezes either).
            const acInd = state ? asObj(state.ac_inductor) : null;
            if (acInd) { out[stateId] = (acInd.mode && acInd.mode !== 'explore') ? true : false; continue; }
            // ac_capacitor (i=im*sin(wt+pi/2) LEADS a capacitor's applied AC
            // voltage — Ch.7 §7.4, clean standalone sibling of ac_resistor/
            // ac_inductor): every guided beat animates continuously
            // (oscillating beads / flipping current arrow / breathing inter-
            // plate field / charge-glyph pools / U-gauge, all driven by the
            // accumulated/closed-form phase on the state clock) — declare
            // motion so D5/D6 expect ongoing pixel movement. S8
            // (one_derivative_derivation) intentionally SKIPS the 3D
            // apparatus (Rule 26 motion carried entirely by the scope-pane
            // fold + derivation dock instead) but STILL declares motion=true,
            // since those panes keep moving. The S9 sandbox (mode 'explore')
            // is user-driven → declare static (relaxed by the show_sliders→
            // interactive hold pass below — the AC cycle still free-runs per
            // Rule 37, so it never truly freezes either).
            const acCap = state ? asObj(state.ac_capacitor) : null;
            if (acCap) { out[stateId] = (acCap.mode && acCap.mode !== 'explore') ? true : false; continue; }
            // ac_phasor (a rotating v-arrow's shadow pen-draws the AC trace; a
            // co-rooted i-arrow rides one shared clock at a locked offset —
            // Ch.7 §7.5, clean standalone sibling of ac_resistor/ac_inductor/
            // ac_capacitor): every guided beat animates continuously (the disc
            // rotates, the pen draws, the beads oscillate — all on the closed-
            // form state clock) — declare motion so D5/D6 expect ongoing pixel
            // movement (the S2/S4 freeze windows are bounded <=1s halts, and
            // S6 eases to a scoreboard hold, both permitted by reveal_hold
            // below). The S8 sandbox (mode 'explore') is user-driven → declare
            // static (relaxed by the show_sliders→interactive hold pass below —
            // Rule 37 free-run keeps it moving anyway).
            const acPhasor = state ? asObj(state.ac_phasor) : null;
            if (acPhasor) { out[stateId] = (acPhasor.mode && acPhasor.mode !== 'explore') ? true : false; continue; }
            // ac_series_lcr (three elements in one series loop; fan / chain /
            // triangle / resonance sweep — Ch.7 §7.6, clean standalone sibling of
            // the scope-pane family): every guided beat animates continuously; the
            // explore state (mode 'explore') is user-driven -> static (relaxed by
            // the show_sliders->interactive hold pass; Rule 37 free-run moves anyway).
            const acSeriesLcr = state ? asObj(state.ac_series_lcr) : null;
            if (acSeriesLcr) { out[stateId] = (acSeriesLcr.mode && acSeriesLcr.mode !== 'explore') ? true : false; continue; }
            // ac_power (p=v*i product wave / averaging wattmeter / current split /
            // power triangle / energy gauges — Ch.7 §7.7, clone-sibling of
            // ac_series_lcr + the element power machinery): every guided beat
            // animates continuously (beads / product-wave p-pane / gauges); the
            // explore state (mode 'explore') is user-driven -> static (relaxed by
            // the show_sliders->interactive hold pass; Rule 37 free-run moves anyway).
            const acPower = state ? asObj(state.ac_power) : null;
            if (acPower) { out[stateId] = (acPower.mode && acPower.mode !== 'explore') ? true : false; continue; }
            // lc_oscillation (source-free L-C loop — Ch.7 §7.8, clone-sibling of
            // ac_power's gauge/band/chrome family): every guided beat animates
            // continuously (charge climb / bead slosh / gauges / strip pen / decay);
            // the explore state (mode 'explore') is user-driven -> static (relaxed
            // by the show_sliders->interactive hold pass; Rule 37 free-run moves anyway).
            const lcOsc = state ? asObj(state.lc_oscillation) : null;
            if (lcOsc) { out[stateId] = (lcOsc.mode && lcOsc.mode !== 'explore') ? true : false; continue; }
            // transformer (two-coil machine — Ch.7 §7.9, clone-sibling of
            // lc_oscillation): every guided beat animates continuously (flux
            // breathe / bead slosh / tick cascade / N_s ramp / power bars /
            // transmission strip / lamination morph / derivation dock); the
            // explore state (mode 'explore', S11) is user-driven -> static (relaxed
            // by the show_sliders->interactive hold pass; Rule 37 free-run moves anyway).
            const tfr = state ? asObj(state.transformer) : null;
            if (tfr) { out[stateId] = (tfr.mode && tfr.mode !== 'explore') ? true : false; continue; }
            // magnetic_field_concept_B (straight_wire_current): every guided beat
            // animates (switch-ramp fade-in / compass approach+swing / multi-hop
            // walk / rings-assemble crossfade / dual-panel reveal); the sandbox
            // (mode 'sandbox') is user-driven → declare static (its frozen tail is
            // relaxed by the show_sliders→interactive hold pass).
            const swc = state ? asObj(state.swc) : null;
            if (swc) { out[stateId] = (swc.mode && swc.mode !== 'sandbox') ? true : false; continue; }
            // kinematics_1d_track (displacement_vs_distance, first 1D-
            // straight-line-motion scenario, greenfield build 2026-07-25):
            // every guided beat animates the runner (step / jog / pivot+
            // return / sign-flip walk / lap sweep); the sandbox explore
            // state (mode: 'sandbox') is user-driven → declare static (its
            // frozen tail is relaxed by the show_sliders→interactive hold
            // pass below, and its own idle-auto-sweep never truly freezes
            // anyway).
            const kt = state ? asObj(state.track) : null;
            if (kt) { out[stateId] = (kt.mode && kt.mode !== 'sandbox') ? true : false; continue; }
            // force_rig (Laws of Motion, off-axis forces — docs/FORCE_RIG_ENGINE_SPEC.md;
            // the per-state `force_rig` block, prefix `fr`). ONE engine, two branches:
            // the force table's damped ring and the whirl's constrained bob.
            //
            // WHY THIS BRANCH EXISTS (2026-08-01): force_rig was wired into the reveal
            // keys, the reveal pins and the hold classification but NOT here, so every
            // force_rig state derived `undefined` and D5 skipped the whole concept — the
            // gate could not fail. It did not: force_rig_not_reproducible_under_set_time_
            // freeze_pin shipped seven MOTIONLESS states of equilibrium_of_particles past
            // a 31/31 green run (114 dense frames, ring centroid sub-pixel identical),
            // and a human, not the machine, caught it.
            //
            // WHAT IS DECLARED. Only what the engine PROVABLY repaints between the dense
            // capture's pinned instants (t = 1 ms, then every 1000 ms — captureDenseSeries).
            // Over-declaring is worse than skipping: a D5 that fails on correct work is a
            // gate people learn to ignore. Everything not listed below is left undefined
            // (D5 skips, exactly as before this branch existed) — never `false`, which
            // would claim the engine asserts stillness.
            const frig = state ? asObj(state.force_rig) : null;
            if (frig) {
                if (frig.apparatus === 'whirl') {
                    // Branch B. The bob is INTEGRATED (frwStep, velocity Verlet + SHAKE/
                    // RATTLE) at the solved ω every micro-step, so it repaints forever —
                    // provided the circle it sweeps is bigger than the bob itself.
                    // r = L·sinθ, and θ is SOLVED, never authored: cosθ = g/(ω²L) for
                    // 'conical' (frwTheta), θ = π/2 for 'flat'. frwClampOmega raises a
                    // conical ω up to ω_min = √(g/L), and AT that clamp cosθ = 1 → θ = 0
                    // → r = 0: the bob hangs dead still. So a conical state authored at or
                    // below ω_min genuinely does not move and must not be declared.
                    // Floor = the bob's own radius (FR_W_BOB_R 0.17 world ÷ FR_W_WORLD_PER_M
                    // 2.40 = 0.0708 m): below that the whole orbit fits inside the bob.
                    const w = asObj(frig.whirl);
                    if (w) {
                        const L = asNum(w.string_length_m, 0) > 0 ? asNum(w.string_length_m, 1) : 1;   // frwPos default
                        const omReq = asNum(w.omega_rad_per_s, 0) > 0 ? asNum(w.omega_rad_per_s, 4) : 4;
                        const flat = w.geometry === 'flat';
                        const omMin = flat ? 0 : Math.sqrt(FR.G / L);
                        const om = omReq < omMin ? omMin : omReq;                       // frwClampOmega
                        const cos = flat ? 0 : Math.min(1, Math.max(0, FR.G / (om * om * L)));
                        const r = L * Math.sqrt(Math.max(0, 1 - cos * cos));            // L·sinθ
                        if (r >= FR.BOB_R_M) { out[stateId] = true; continue; }
                    }
                    // A whirl state with no whirl block, or a collapsed cone: skip.
                } else {
                    // Branch A (force_table). The ring is a damped integrator with GEOMETRIC
                    // restoring stiffness — frStringDir re-aims every string at the ring's
                    // live position — so a displaced or re-tensioned ring always travels.
                    //   (1) param_ramp: one-shot monotonic write through the same
                    //       frApplyParam path a slider drag uses. It repaints (tension
                    //       arrow lengths + the ring's new balance point) only if it
                    //       actually WRITES: frRunParamRamp bails on a sandbox state
                    //       (trusted_drag_seizes), on a value delta under its own 1e-4
                    //       churn guard, and frApplyParam drops a whirl-kind write
                    //       ('omega') on a table engine, leaving an inert ramp.
                    const tbl = asObj(frig.force_table);
                    const ramp = asObj(frig.param_ramp);
                    if (ramp && frig.trusted_drag_seizes !== true
                        && (ramp.param === 'm1' || ramp.param === 'angle1' || ramp.param === 'angle2')
                        && typeof ramp.from === 'number' && Number.isFinite(ramp.from)
                        && typeof ramp.to === 'number' && Number.isFinite(ramp.to)
                        && typeof ramp.end_ms === 'number' && Number.isFinite(ramp.end_ms)
                        && Math.abs(ramp.to - ramp.from) > FR.RAMP_CHURN) {
                        out[stateId] = true; continue;
                    }
                    //   (2) ring_start_offset_m: the state opens with the ring displaced
                    //       and it settles (~0.2 s at the default damping — well inside
                    //       the 1 ms → 1000 ms pair). Declared only when the travel is
                    //       unmistakable: floor = the ring's own DIAMETER in metres
                    //       (2·FR_RING_R 0.15 ÷ FR_WORLD_PER_M 9.6 = 0.03125 m), i.e. the
                    //       start and settled silhouettes do not even overlap. Below it
                    //       the repaint is a couple of pixels of a thin torus, which is
                    //       under D5's calibrated floor — equilibrium_of_particles STATE_6
                    //       opens 2.1 mm off centre and is honestly not visible. The
                    //       sandbox is NOT excluded here: the settle is pure integration,
                    //       nothing seizes it, and the headless capture never drags.
                    const off = tbl && Array.isArray(tbl.ring_start_offset_m) ? tbl.ring_start_offset_m : null;
                    if (off && off.length === 2 && typeof off[0] === 'number' && typeof off[1] === 'number'
                        && Number.isFinite(off[0]) && Number.isFinite(off[1])
                        && Math.sqrt(off[0] * off[0] + off[1] * off[1]) >= FR.RING_D_M) {
                        out[stateId] = true; continue;
                    }
                    //   (3) NOT a motion signal: `phases[]`. frRunPhases only ever rewrites
                    //       eng.glow_focal, so a phase without its own `glow_focal` (every
                    //       phase authored on equilibrium_of_particles) repaints NOTHING —
                    //       it is a reveal-pin marker. A phase that does carry a distinct
                    //       focal changes brightness, which is real but is not the moving-
                    //       body signal D5 was calibrated against, so it is not claimed.
                    //   (4) A settled table with neither a ramp nor a real offset does not
                    //       move, by construction. "No static guided state" is Rule 31, an
                    //       AUTHORING gate — D5 must not demand pixels the engine never
                    //       repaints.
                }
                // Deliberately no `continue` on the not-provable paths: they fall through
                // to the shared epic_l_path pass exactly like acl_element 'integrated'
                // does, so no other scenario's control flow is touched.
            }
            // rigid_body_rotation (Class-11 Ch.7, prefix `rbr`). What this engine
            // PROVABLY repaints between the dense capture's pinned instants
            // (t = 1 ms, then every 1000 ms — captureDenseSeries) is the SPIN:
            // the turntable carries a rotation-marker stripe ~0.99 world units
            // from the axle, and the whole apparatus turns through omega radians
            // every second. At the authored seed omega = L/I = omega0, so the
            // stripe sweeps omega0 radians between the first two dense frames —
            // hundreds of pixels at any classroom-plausible seed.
            //   Declared ONLY above a floor, and only when the seed actually
            // spins: a state seeded at rest genuinely does not move, and
            // over-declaring is worse than skipping — a D5 that fails on correct
            // work is a gate people learn to ignore. Everything else is left
            // undefined (D5 skips), never `false`.
            const rbrMot = state ? asObj(state.rigid_body_rotation) : null;
            if (rbrMot) {
                const w0 = Math.abs(asNum(rbrMot.omega0_rad_s, 1.5));
                // 0.05 rad/s -> the marker stripe travels ~0.05 world units per
                // dense-frame gap, about three pixels at the default framing.
                if (w0 >= 0.05) { out[stateId] = true; continue; }
                //   E4 (rotmech 0c-3) — MOTION MUST READ THE TORQUE, NOT ONLY
                // THE SEED. Before signed torque landed, a state seeded at rest
                // genuinely never moved (the integrator subtracted
                // unconditionally, so L = 0 clamped to 0 forever) and falling
                // through to `undefined` was correct. Now a signed DRIVE torque
                // spins a rest-seeded body up — which is exactly the state
                // class E4 exists to enable — so leaving this on the seed alone
                // would go silent on precisely those states.
                //   Calibrated the SAME way as the w0 floor: over one dense-
                // frame gap (1000 ms) a constant drive reaches omega = tau/I,
                // so it is declared only when tau/I clears the same 0.05 rad/s
                // floor. A 'brake' source is NOT a motion signal on a body at
                // rest — it holds it there.
                const rbrTq = asObj(rbrMot.external_torque);
                if (rbrTq) {
                    let driveTau = 0, brakeTau = 0;
                    const rbrSrcs = Array.isArray(rbrTq.sources) ? rbrTq.sources : null;
                    if (rbrSrcs) {
                        for (const sRaw of rbrSrcs) {
                            const s = asObj(sRaw);
                            if (!s) continue;
                            if (s.kind === 'brake') brakeTau += Math.abs(asNum(s.torque_Nm, 0));
                            else driveTau += asNum(s.torque_Nm, 0);
                        }
                    } else if (rbrTq.source === 'applied_torque' || typeof rbrTq.applied_torque_Nm === 'number') {
                        driveTau = asNum(rbrTq.applied_torque_Nm, 0);
                    }
                    // THE BREAKAWAY CONDITION, mirrored from rbrLStep: a drive
                    // that a co-engaged brake outweighs leaves the body in a
                    // STATIC HOLD, which repaints nothing. Pricing the drive
                    // alone would over-declare exactly that state.
                    driveTau = (Math.abs(driveTau) > brakeTau) ? (Math.abs(driveTau) - brakeTau) : 0;
                    if (driveTau > 0) {
                        const rbrAp = asObj(rbrMot.apparatus);
                        const rbrMs = asObj(rbrMot.masses);
                        const iFrame = rbrAp ? asNum(rbrAp.i_frame_kgm2, 0.5) : 0.5;
                        const nMass = rbrMs ? asNum(rbrMs.count, 2) : 2;
                        const mKg = rbrMs ? asNum(rbrMs.mass_kg, 2.0) : 2.0;
                        const rM = rbrMs ? asNum(rbrMs.r_m, 0.9) : 0.9;
                        const iTot = iFrame + nMass * mKg * rM * rM;
                        if (iTot > 0 && driveTau / iTot >= 0.05) { out[stateId] = true; continue; }
                    }
                }
                // Seeded at rest with no drive: fall through undefined, exactly
                // like the not-provable force_rig paths above.
            }
            // bar_magnet_as_dipole: STATE_2's loop trace + STATE_3's break
            // genuinely CYCLE (the payoff is the repetition — "cut it
            // again, still two dipoles"), so they declare ongoing motion. Every
            // other guided beat (S1 compass settle, S4 flip, S5 solenoid cross-
            // fade, S6 ghost-ratio+orbit, S7 r-sweep+ghost+callout, S8 edipole
            // glide) ALSO moves pixels mid-state before settling — declare
            // motion=true so D5/D6 expect the mid-state movement (the post-
            // payoff hold is handled separately in deriveHoldExpectations as
            // reveal_hold, the same dual classification the pef/dipole_potential
            // sweep states use). STATE_9 (show_sliders, both m+r, no scripted
            // choreography) has none of these keys — it falls through to the
            // generic pass below (undefined; its live-but-static frame is
            // relaxed by the show_sliders->interactive hold pass).
            const bmDipole = state ? asObj(state.extras) : null;
            if (bmDipole && (bmDipole.loop_choreography || bmDipole.break_anim
                || bmDipole.flip_anim || bmDipole.solenoid_crossfade
                || bmDipole.ghost_ratio_pair || bmDipole.compass_settle
                || bmDipole.r_sweep_theta_locked === true || bmDipole.edipole_glide)) {
                out[stateId] = true; continue;
            }
            // bar_magnet_in_uniform_field (Ch.5 rebuild, 2026-07-12): the shared
            // torque-loop engine's rotation_mode lives at the TOP LEVEL of the
            // state object (not nested in a scenario-specific block like pef/
            // mag/faraday), so without this branch every guided state falls
            // through unclassified (undefined = 'unknown, skip' — D5/D6 never
            // enforce motion on ANY of them). STATE_6 (pose_compare, NEW mode)
            // snap-holds through 0deg/90deg/180deg and loops — genuine ongoing
            // motion, so D5/D6 should expect it. STATE_8 (oscillation + a
            // field_step block, NEW) scripts a mid-state B step-up that visibly
            // quickens the swing — also genuine motion. Scoped tightly to this
            // scenario_type so the sibling dipole_in_uniform_field (electric_
            // dipole_in_field) — whose guided states with the SAME rotation_mode
            // values already carry show_sliders:true and are classified
            // 'interactive' in deriveHoldExpectations below — is completely
            // untouched (this branch would never match its states anyway, since
            // neither pose_compare nor field_step are ever authored there, but
            // the scenario_type gate makes the isolation explicit).
            if (f3dScenarioType === 'bar_magnet_in_uniform_field') {
                const bmfRm = state && typeof state.rotation_mode === 'string' ? state.rotation_mode : null;
                if (bmfRm === 'pose_compare') { out[stateId] = true; continue; }
                if (bmfRm === 'oscillation' && state && asObj(state.field_step)) { out[stateId] = true; continue; }
            }
            // Other field_3d states fall through to the epic_l_path-based pass
            // below (trajectory_mode / advance_mode), so don't set them here.
        }
    }

    const states = resolveStates(physicsConfig);
    for (const [stateId, state] of Object.entries(states)) {
        if (out[stateId] !== undefined) continue;   // already decided by the field_3d pass
        // field_3d: trajectory_mode declares the motion contract directly.
        const trajectoryMode = state.trajectory_mode;
        if (typeof trajectoryMode === 'string') {
            out[stateId] = trajectoryMode !== 'static' && trajectoryMode !== 'frozen' && trajectoryMode !== 'none';
            continue;
        }
        // v2 PCPL: an animation-gated advance implies motion.
        const advanceMode = state.advance_mode;
        if (advanceMode === 'auto_after_animation') {
            out[stateId] = true;
            continue;
        }
        // PCPL (WP-T1, 2026-07-23): a looping/ping-ponging variable_choreography
        // entry, a rotate_continuous / pendulum / door_swing / looping-projectile
        // scene primitive, is genuinely ongoing motion (the sweep/spin never
        // settles) — declare motion=true so D5/D6 expect continuous pixel movement
        // instead of D7 demanding stillness from a state that legitimately never
        // stops (e.g. scalar_vs_vector's S2 psi_pointer loop). A 'once' entry is
        // NOT matched here — it settles (reveal_hold below), not ongoing motion.
        if (pcplHasContinuousMotion(state)) {
            out[stateId] = true;
            continue;
        }
        // PCPL parity (2026-07-23): a scene body animation that plays once and
        // SETTLES (free_fall / atwood / translate / slide / one-shot projectile)
        // is real motion during its reveal window — declare motion=true so D5
        // confirms it visibly played; deriveHoldExpectations still marks the
        // settled tail a reveal_hold (dual classification) so D7 stays green.
        if (pcplHasTransientBodyMotion(state)) {
            out[stateId] = true;
            continue;
        }
        out[stateId] = undefined;
    }
    return out;
}

// ── Sim-time-aware capture: reveal-time + hold-intent derivation ─────────────

/** Target for states with no timed reveals — preserves the old fixed 1500ms. */
const DEFAULT_REVEAL_MS = 1500;
/** Safe upper bound when the coil turn count can't be resolved (per_turn stagger
 *  multiplies by turns — over-waiting is harmless, under-waiting re-creates the bug). */
const DEFAULT_COIL_TURNS = 8;

/**
 * Mirror of field_3d_renderer.ts reveal defaults (solenoid reveal-gating block,
 * ~line 4458 + the wire_to_coil_morph block ~line 4411). A config that omits a
 * field MUST gate at the same sim-time the renderer reveals it — lower defaults
 * here would re-introduce the wall-clock false negative.
 */
const F3D = {
    ptReveal: 3500, ptStagger: 250, ptFade: 500,
    rcReveal: 6000, rcFade: 800,
    axReveal: 8500, axArise: 1000,
    morphStraight: 3000, morphDur: 1500,
} as const;

/**
 * Mirror of the force_rig geometry/physics constants in field_3d_renderer.ts
 * (the `fr` block, ~line 43212). Used ONLY by the force_rig motion branch, to
 * decide whether the engine's repaint between two pinned dense instants is big
 * enough for D5 to honestly demand it. Every value is derived from a renderer
 * constant, never tuned to a concept:
 *   G         = FR_G
 *   RING_D_M  = 2 * FR_RING_R (0.15 world) / FR_WORLD_PER_M (FR_TABLE_R_W 2.40 /
 *               FR_TABLE_R_M 0.25 = 9.6)  → the ring's own diameter in metres
 *   BOB_R_M   = FR_W_BOB_R (0.17 world) / FR_W_WORLD_PER_M (2.40)
 *   RAMP_CHURN = frRunParamRamp's own 1e-4 no-write guard
 */
const FR = {
    G: 9.8,
    RING_D_M: (2 * 0.15) / (2.40 / 0.25),
    BOB_R_M: 0.17 / 2.40,
    RAMP_CHURN: 1e-4,
} as const;

function asObj(v: unknown): Record<string, unknown> | null {
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}
function asNum(v: unknown, fallback: number): number {
    return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}
function isEnabled(v: unknown): boolean {
    const o = asObj(v);
    return !!o && o.enabled === true;
}

const F3D_REVEAL_KEYS = [
    'wire_to_coil_morph', 'per_turn_field_circles',
    'radial_cancellation_arrows', 'axial_buildup_arrows',
    'capacitor',
    // capacitance (Q = CV, C = ε₀A/d — 2026-07-21 engine ask): the per-state
    // `capacitance` block (distinct from parallel_plates' `capacitor` block —
    // different shape, a NEW scenario_type). Listed here so a cached
    // physics_config that flattened field_3d_config.states is still recognised
    // as field_3d, not PCPL.
    'capacitance',
    // displacement_current (I_d = ε₀ dΦ_E/dt — Ch.8 §8.2 engine ask): the per-state
    // `displacement_current` block (charge-loop / surface-morph / probe-sweep /
    // chain-link derivation / ledger reveals). Listed here so a cached
    // physics_config that flattened field_3d_config.states is still recognised
    // as field_3d, not PCPL.
    'displacement_current',
    // em_wave_propagation (traveling transverse EM wave — Ch.8 §8.3 engine ask):
    // the per-state `em_wave` block (wave_mode pulse|train, source on/off, motes +
    // vanish cue, receiver gauges, contextual ν/E₀/n/source controls). Listed here
    // so a cached physics_config that flattened field_3d_config.states is still
    // recognised as field_3d, not PCPL.
    'em_wave',
    // molecular_geometry (VSEPR — CHEMISTRY, 2026-07-28 engine ask): the per-state
    // `molecular_geometry` block (assemble / flat→tetrahedral relax / domain spread
    // / lone-pair squeeze / electron-geometry-vs-shape / expanded-geometry beats).
    // Listed here so a cached physics_config that flattened field_3d_config.states
    // is still recognised as field_3d, not PCPL.
    'molecular_geometry',
    // orbital_shapes (ATOMIC ORBITALS — CHEMISTRY, 2026-07-28 engine ask): the
    // per-state `orbital_shapes` block (orbit-dissolve / dot stipple / boundary
    // grow / lobe extrude / probe sweep / axis-populate / clover bloom / 2s
    // cutaway / node-count gallery beats). Listed here so a cached physics_config
    // that flattened field_3d_config.states is still recognised as field_3d, not
    // PCPL.
    'orbital_shapes',
    // bonding_scene (CHEMISTRY BONDING WAVE — Phase-0 E1 engine dispatch,
    // 2026-08-01): the per-state `bonding_scene` block (unit layer / per-atom
    // partial charge + δ labels / bond-dipole arrows + derived resultant / rigid
    // shared-pair electron glyph / deterministic thermal jiggle; E2 adds links,
    // E3 the lattice). Listed here so a cached physics_config that flattened
    // field_3d_config.states is still recognised as field_3d, not PCPL.
    'bonding_scene',
    // electric_potential_dipole (dipole_potential) + the potential siblings: every
    // state carries a `potential` reveal block (so a cached physics_config that
    // flattened field_3d_config.states is still recognised as field_3d, not PCPL).
    'potential',
    // potential_energy_system_of_charges (system_pe_assembly): the per-state
    // `assembly` block. potential_energy_in_external_field (pe_external_field): the
    // per-state `pef` block (charge/dipole phase timed reveals).
    // faraday_law_induction (faraday): the per-state `faraday` block (mode-driven
    // magnet slide / flux change / needle deflection reveals).
    // magnetic_field_concept_B (straight_wire_current): the per-state `swc` block
    // (mode-driven switch ramp / compass swing+hop / rings-assemble / dual-panel
    // compare reveals).
    // motional_emf (motional_emf_rod): the per-state `motional_emf_rod` block
    // (mode-driven rod slide / charge-separation / RHR-hand / open-closed-
    // circuit / energy-balance reveals).
    // eddy_currents (eddy_current_pendulum): the per-state
    // `eddy_current_pendulum` block (mode-driven plate-swing decay/
    // oscillation, loop-glyph reveals, S4 twin-decay contrast, S5 furnace/
    // core reveals).
    // inductance: the per-state `inductance` block (mode-driven self-ramp /
    // switch-graph / geometry / energy / mutual-intro / coupling / explore
    // reveals for self + mutual inductance).
    // ac_generator: the per-state `ac_generator` block (mode-driven machine
    // overview / flux-cosine trace / EMF-sine phase / peak-dependence reshape /
    // slip-ring current flip / sandbox reveals for the rotating-coil AC generator).
    // ac_resistor: the per-state `ac_resistor` block (mode-driven oscillate-
    // track / reveal-build / cycle-compare / trace-product / null-result-hold /
    // twin-compare / square-and-settle / chain-link-derivation / drag-sandbox
    // reveals for AC voltage applied to a resistor — Ch.7 §7.2).
    // ac_inductor: the per-state `ac_inductor` block (mode-driven apparatus-
    // swap / ghost-overlay-compare / cycle-compare / tangent-walk / ramp-
    // response / trace-product / null-result-hold / chain-link-derivation /
    // drag-sandbox reveals for AC voltage applied to an inductor — Ch.7 §7.3.
    // Clean standalone sibling of ac_resistor — see field_3d_renderer.ts's
    // scenario header comment).
    // ac_capacitor: the per-state `ac_capacitor` block (mode-driven
    // apparatus-swap / quarter-cycle-lead ghost-compare / plates-push-back
    // cycle-compare / slope-feeds-current tangent-walk / reactance-ramp /
    // power-swings trace-product / null-average-power / one-derivative-
    // derivation / drag-sandbox reveals for AC voltage applied to a
    // capacitor — Ch.7 §7.4. Clean standalone sibling of ac_resistor/
    // ac_inductor — see field_3d_renderer.ts's scenario header comment).
    // ac_phasor: the per-state `ac_phasor` block (mode-driven spin_draws_sine /
    // arrow_vs_shadow / two_arrows_one_clock / lag_becomes_angle /
    // lead_mirror_flip / reading_order / radians_derivation / explore reveals
    // for the phasor representation of AC — Ch.7 §7.5. Clean standalone sibling
    // of ac_resistor/ac_inductor/ac_capacitor — see field_3d_renderer.ts's
    // scenario header comment).
    'assembly', 'pef', 'mag', 'faraday', 'swc', 'motional_emf_rod', 'eddy_current_pendulum', 'inductance', 'ac_generator', 'ac_resistor', 'ac_inductor', 'ac_capacitor', 'ac_phasor', 'ac_series_lcr', 'ac_power',
    // lc_oscillation: the per-state `lc_oscillation` block (mode-driven charge_up /
    // switch_throw / through_zero / free_run / energy_slosh / shm_twin / damped /
    // derivation / explore reveals for the source-free L-C circuit — Ch.7 §7.8.
    // Clone-sibling of ac_power — see field_3d_renderer.ts's scenario header comment).
    'lc_oscillation',
    // transformer: the per-state `transformer` block (mode-driven flux_link /
    // close_secondary / dc_dead / per_turn / turns_ramp / power_lock /
    // transmission / loss_ledger / lamination / derivation / explore reveals for
    // the two-coil machine — Ch.7 §7.9. Clone-sibling of lc_oscillation — see
    // field_3d_renderer.ts's scenario header comment).
    'transformer',
    // helix_in_uniform_field (helical_motion_charge_in_uniform_B): the per-state
    // `helix` block (ghost-flat-circle / v-decompose / radius-line / pitch-bracket
    // reveals) + the `isolate_perp`/`isolate_par` fades that collapse the coil.
    'helix', 'isolate_perp', 'isolate_par',
    // Laws of Motion (newtons_laws_body): the per-state `newtons_laws_body` block
    // (mode-driven rest/coast/accelerate/compare/action-reaction/FBD/incline/
    // connected beats + its `phases[]` one-shot script). Registered here so a
    // cached physics_config that flattened field_3d_config.states to the top
    // level is still recognised as field_3d rather than falling through to the
    // PCPL branch (which would derive a wall-clock reveal pin and a PCPL hold
    // classification for a field_3d state).
    'newtons_laws_body',
    // Laws of Motion, off-axis forces (force_rig): the per-state `force_rig` block
    // (the force table's damped ring + the whirl's constrained bob, plus its
    // `phases[]` glow script, `param_ramp` reveal and the whirl's cut-the-string
    // `release`). Registered here for the same reason newtons_laws_body is: a
    // cached physics_config that flattened field_3d_config.states to the top level
    // must still be recognised as field_3d rather than falling through to the PCPL
    // branch (which would derive a wall-clock reveal pin and a PCPL hold class).
    'force_rig',
    // Class-11 Ch.7 rotational mechanics (rigid_body_rotation): the per-state
    // `rigid_body_rotation` block — the fixed-axis turntable's `param_ramp`
    // radial slide, its `external_torque` brake engage/release window, its
    // `restart` run-cut, its `reference_marks[]` reveals, its per-row
    // `readout_at_ms` ledger and its `phases[]` glow script. Registered here for
    // the same reason newtons_laws_body and force_rig are: a cached
    // physics_config that flattened field_3d_config.states to the top level must
    // still be recognised as field_3d rather than falling through to the PCPL
    // branch (which would derive a wall-clock reveal pin and a PCPL hold class).
    'rigid_body_rotation',
] as const;

function hasField3dTiming(state: unknown): boolean {
    const o = asObj(state);
    return !!o && F3D_REVEAL_KEYS.some(k => k in o);
}

interface Field3dStates {
    states: StateRecord;
    coilTurns: number;
}

/**
 * Resolve field_3d states + coil turn count from EITHER the concept-JSON shape
 * (`config.field_3d_config.states`, the authoritative source) OR a cached
 * physics_config that already IS the field_3d_config (`config.states` carrying
 * timing sub-objects). Returns null for non-field_3d (PCPL) configs.
 */
function resolveField3dStates(config: Record<string, unknown> | null): Field3dStates | null {
    if (!config) return null;

    const f3dCfg = asObj(config.field_3d_config);
    if (f3dCfg) {
        const states = asObj(f3dCfg.states) as StateRecord | null;
        if (states && Object.keys(states).length > 0) {
            return { states, coilTurns: resolveCoilTurns(asObj(f3dCfg.coil)) };
        }
    }

    // field_3d_config-as-physics_config: top-level states with timing markers.
    const top = asObj(config.states) as StateRecord | null;
    if (top && Object.keys(top).length > 0 && Object.values(top).some(hasField3dTiming)) {
        return { states: top, coilTurns: resolveCoilTurns(asObj(config.coil)) };
    }

    return null;
}

function resolveCoilTurns(coil: Record<string, unknown> | null): number {
    const t = coil ? asNum(coil.turns, DEFAULT_COIL_TURNS) : DEFAULT_COIL_TURNS;
    return t > 0 ? t : DEFAULT_COIL_TURNS;
}

/**
 * Resolve the field_3d `scenario_type` from EITHER the concept-JSON shape
 * (`config.field_3d_config.scenario_type`) OR a cached physics_config that
 * already flattened field_3d_config to the top level (`config.scenario_type`).
 * Used ONLY to scope narrow, scenario-specific classification rules (e.g. the
 * bar_magnet_in_uniform_field damped_swing/damped_pendulum reveal_hold fix)
 * without perturbing every other scenario sharing the same shared rendering
 * engine (dipole_in_uniform_field, pe_external_field, torque_on_loop_uniform_
 * field all reuse the same torque-loop rotation_mode enum at the state level).
 */
function resolveField3dScenarioType(config: Record<string, unknown> | null): string | null {
    if (!config) return null;
    const f3dCfg = asObj(config.field_3d_config);
    if (f3dCfg && typeof f3dCfg.scenario_type === 'string') return f3dCfg.scenario_type;
    if (typeof config.scenario_type === 'string') return config.scenario_type;
    return null;
}

/**
 * particle_field (2D p5 diamonds — drift_velocity class): resolve the per-state
 * map from the authored `particle_field_config.states` (present in the concept
 * JSON and in the seeded physics_config). Returns null for other renderers.
 */
function resolveParticleFieldStates(config: Record<string, unknown> | null): StateRecord | null {
    if (!config) return null;
    const pfCfg = asObj(config.particle_field_config);
    if (pfCfg) {
        const states = asObj(pfCfg.states) as StateRecord | null;
        if (states && Object.keys(states).length > 0) return states;
    }
    return null;
}

/**
 * Mirror of particle_field_renderer.ts cue pacing (FIELD_FADE_MS 600 +
 * CAUSE_BEAT_MS 900 + DRIFT_RAMP_MS 800 — the Rule 32a cause-first choreography):
 * a frozen capture pinned before the drift ramp completes would photograph the
 * pre-payoff scene and false-fail the reveal.
 */
const PF_CUE_PAYOFF_MS = 600 + 900 + 800;

/** Latest sim-time at which every particle_field one-shot cue has paid off. */
function pfRevealMs(state: Record<string, unknown> | null): number {
    if (!state) return DEFAULT_REVEAL_MS;
    const cues: Array<Record<string, unknown>> = [];
    const single = asObj(state.cue);
    if (single) cues.push(single);
    if (Array.isArray(state.cues)) {
        for (const c of state.cues) {
            const co = asObj(c);
            if (co) cues.push(co);
        }
    }
    let maxMs = DEFAULT_REVEAL_MS;
    for (const c of cues) {
        maxMs = Math.max(maxMs, asNum(c.at_ms, 0) + PF_CUE_PAYOFF_MS);
    }
    // combination_of_resistors: the R2 auto-grow (S6/S7) is a clock-driven reveal
    // with no cue — mirror the renderer's cR2 sweep (start 700 + dur 3200) so the
    // frozen frame lands on the SETTLED 12Ω split, not mid-growth.
    if (state.r2_autosweep === true) maxMs = Math.max(maxMs, 700 + 3200 + 400);
    // emf_definition S4: ε auto-glides (start 700 + dur 3200) so "bigger ε, taller
    // lift" self-demonstrates — pin the frozen frame past the settle so it lands on
    // the tall-ε pose (visually distinct from S2), not mid-glide.
    if (state.emf_autosweep === true) maxMs = Math.max(maxMs, 700 + 3200 + 400);
    // internal_resistance one-shots — pin the frozen frame past each settle:
    // droop_intro = cued switch-close at 1500 + 800ms current ramp; two_reading =
    // open-hold → close at 2500 + ramp + the computed-r line at 3600; r_reveal =
    // casing draw-in 700 + 900; R_autosweep_down = the S3/S4 sweep (700 + 3200,
    // mirrors cIrLoadR in the renderer).
    if (state.droop_intro === true) maxMs = Math.max(maxMs, 1500 + 800 + 400);
    if (state.two_reading === true) maxMs = Math.max(maxMs, 3600 + 400);
    if (state.r_reveal === true) maxMs = Math.max(maxMs, 700 + 900 + 400);
    if (state.R_autosweep_down === true) maxMs = Math.max(maxMs, 700 + 3200 + 400);
    // electric_power: S3 energy accumulates on the clock (settle by ~3500ms so the
    // frozen frame shows a non-trivial J count). S5 (parallel) has NO animation ramp —
    // the parallel composition is settled from frame 0 (continuous bead flow, constant
    // brightness); the pin is a conservative capture window so the frozen frame lands
    // well past state entry, distinct from S4's series composition.
    if (state.energy_accumulate === true) maxMs = Math.max(maxMs, 3500 + 400);
    if (state.parallel_flip === true) maxMs = Math.max(maxMs, 1500 + 800 + 400);
    // wheatstone_bridge: the R / emf clock sweeps (mirror r2_autosweep) END after
    // the 1500ms DEFAULT_REVEAL_MS (S2 R→6 ends 1700; S3 R→3 & S4 ε→10 end 2300),
    // so the frozen frame must pin past each sweep's settle or it captures mid-sweep
    // (needle mid-swing, R mid-glide). Pin to start + duration + 300ms buffer so the
    // frozen frame lands on the SETTLED end-state (S2 deflected@R=6, S3 nulled@R=3,
    // S4 pinned@ε=10). Mirrors cBridgeR/cBridgeEmf in particle_field_renderer.ts.
    if (state.bridge_r_sweep === true) {
        maxMs = Math.max(maxMs, asNum(state.bridge_r_sweep_start_ms, 900) + asNum(state.bridge_r_sweep_duration_ms, 800) + 300);
    }
    if (state.bridge_emf_sweep === true) {
        maxMs = Math.max(maxMs, asNum(state.bridge_emf_sweep_start_ms, 900) + asNum(state.bridge_emf_sweep_duration_ms, 1400) + 300);
    }
    // potentiometer: the jockey clock sweep (mirror bridge_r_sweep). S2 slides l 0.5→0.7
    // over [800,1600]; S3 sweeps l 0.7→0.5 over [900,2300]. Pin the frozen frame past
    // the sweep's settle (+300 buffer) so THE EYE lands on the SETTLED end-state (S2
    // needle deflected@l=0.7, S3 needle nulled@l=0.5). Mirrors cPotL in the renderer.
    if (state.jockey_sweep === true) {
        maxMs = Math.max(maxMs, asNum(state.jockey_sweep_start_ms, 800) + asNum(state.jockey_sweep_duration_ms, 800) + 300);
    }
    // meter_bridge S2: the resistance-vs-length highlight sweeps A→C over
    // [segment_sweep_start_ms, +segment_sweep_duration_ms] (default [600, 2200]).
    // Pin the frozen frame past its settle (+300) so THE EYE captures the completed
    // "wire = resistance ruler" reveal, not the marker mid-sweep. Mirrors
    // drawMbSegments in particle_field_renderer.ts. (S3/S4 jockey_sweep + S5
    // cycle_compare are already covered above; S5's jockey_jitter is continuous
    // motion, deterministic in PM_simTimeMs, so no settle pin is needed for it.)
    if (state.segment_sweep === true) {
        maxMs = Math.max(maxMs, asNum(state.segment_sweep_start_ms, 600) + asNum(state.segment_sweep_duration_ms, 1600) + 300);
    }
    // combination_of_cells S7: cycle_compare is a 3-phase clock sequence (topology
    // -> series, then R jump, then topology -> parallel) with NO cue — unlike
    // bridge_r_sweep/jockey_sweep's single sweep, take the AUTHORED total settle
    // time directly (cycle_compare_settle_ms) since it spans 3 sequential phases.
    // Pin the frozen frame past the full cycle so THE EYE lands on the settled S7
    // aha grid (all 4 compare_grid cells revealed, the live topology holding at
    // its final parallel value), not mid-cycle. Mirrors ccCyclePhys in the renderer.
    if (state.cycle_compare === true) {
        maxMs = Math.max(maxMs, asNum(state.cycle_compare_settle_ms, 5400) + 400);
    }
    // combination_of_cells: the plain regroup one-shot (S5-style) is also a
    // clock-driven morph with no cue. S5's early timing (300 + 700) always sat
    // under DEFAULT_REVEAL_MS so the gap never bit — until the S7 split moved a
    // regroup to 4000 + 900 and THE EYE's frozen frame photographed the PRE-morph
    // pose (founder review 2026-07-20). Pin past the morph + effect lag. Same for
    // dock_cell (S2) and flip_cell (S4), which share the ccMechP/ccEffP clock.
    if (state.regroup === true) {
        maxMs = Math.max(maxMs, asNum(state.regroup_start_ms, 300) + asNum(state.regroup_duration_ms, 700) + 700);
    }
    if (state.dock_cell === true) {
        maxMs = Math.max(maxMs, asNum(state.dock_cell_start_ms, 300) + asNum(state.dock_cell_duration_ms, 700) + 700);
    }
    if (state.flip_cell === true) {
        maxMs = Math.max(maxMs, asNum(state.flip_cell_start_ms, 300) + asNum(state.flip_cell_duration_ms, 700) + 700);
    }
    if (state.switch_close_cue === true) {
        maxMs = Math.max(maxMs, asNum(state.switch_close_cue_start_ms, 300) + asNum(state.switch_close_cue_duration_ms, 600) + 700);
    }
    // compare_grid rows reveal on their own authored clocks — the frozen frame
    // must land after the LAST row so THE EYE photographs the completed verdict
    // grid, never a partial one.
    if (Array.isArray(state.compare_grid)) {
        for (const cellRaw of state.compare_grid) {
            const cell = asObj(cellRaw);
            if (cell) maxMs = Math.max(maxMs, asNum(cell.reveal_at_ms, 0) + 400);
        }
    }
    return maxMs;
}

/** Latest sim-time (state-local ms) at which every timed reveal has completed. */
function maxRevealForField3dState(state: Record<string, unknown>, coilTurns: number): number {
    const candidates: number[] = [];

    const morph = asObj(state.wire_to_coil_morph);
    if (isEnabled(morph) && morph) {
        candidates.push(asNum(morph.straight_duration_ms, F3D.morphStraight) + asNum(morph.morph_duration_ms, F3D.morphDur));
    }
    // charge_distribution: the rod→sheet→solid cross-fade (morph_from) and the
    // STATE_6 dq accumulation are one-shot timed reveals that then HOLD still —
    // pin the frozen frame past their payoff so the capture shows the completed
    // morph / assembled net field, and so deriveHoldExpectations marks them
    // reveal_hold (D7/D1p are otherwise false-failed by the static tail).
    const cd = asObj(state.charge_dist);
    if (cd) {
        if (typeof cd.morph_from === 'string') {
            candidates.push(asNum(cd.morph_at_ms, 0) + asNum(cd.morph_duration_ms, 1500));
        }
        if (cd.accumulate_dE === true) {
            candidates.push(asNum(cd.accumulate_at_ms, 1200) + 6 * asNum(cd.accumulate_stagger_ms, 380) + 500);
        }
    }
    // electric_flux: the open-surface theta_anim tilt sweep and the closed-
    // surface face accumulation are one-shot timed reveals that then HOLD still
    // (mirror charge_distribution) — pin the frozen frame past their payoff and
    // let deriveHoldExpectations mark them reveal_hold, so D7/D1p are not
    // false-failed by the static tail after the sweep / accumulation completes.
    const flux = asObj(state.flux);
    if (flux) {
        const ta = asObj(flux.theta_anim);
        if (ta) candidates.push(asNum(ta.at_ms, 0) + asNum(ta.duration_ms, 2000) + 500);
        if (flux.accumulate_faces === true) {
            candidates.push(asNum(flux.accumulate_at_ms, 1000) + 6 * asNum(flux.accumulate_stagger_ms, 350) + 500);
        }
    }
    // magnetic_flux_loop (Φ = B·A·cosθ): a guided beat's live control(s)
    // (B/A/theta, per `controls`) run a renderer-internal idle sweep-then-HOLD
    // when the headless harness never drags (mirrors electric_flux's
    // theta_anim). The sweep+hold durations default to MFL_SWEEP_MS=3000 /
    // MFL_HOLD_MS=2000 in field_3d_renderer.ts — keep these fallbacks in sync
    // if that renderer file's defaults ever change. The explore state (mode:
    // 'explore') runs a continuous un-ending idle sweep instead — NOT a one-
    // shot reveal, so it's excluded here and caught by the 'interactive'
    // classification in deriveHoldExpectations below.
    const mfl = asObj(state.magnetic_flux_loop);
    if (mfl && mfl.mode !== 'explore' && Array.isArray(mfl.controls) && mfl.controls.length > 0) {
        candidates.push(asNum(mfl.idle_sweep_duration_ms, 3000) + asNum(mfl.idle_sweep_hold_ms, 2000) + 500);
    }
    // earths_magnetism: STATE_1 tilt_reveal / STATE_2 swing_reveal / STATE_4
    // decompose_reveal are one-shot timed reveals that then HOLD (mirror the dive).
    // Pin the frozen frame past each payoff so THE EYE captures the settled pose, not
    // mid-animation (renderer timings, field_3d_renderer.ts: tilt done ~1.3s, decompose
    // triangle in by ~1.8s). STATE_2 swing_reveal (F1, engine_bug_queue:
    // em_state2_declination_camera_edge_on) now RE-PHASES behind a ~1.2s camera lift
    // (hold=1.3s, dur=1.2s ⇒ swing completes ~2.5s, was ~1.5s pre-fix) — the candidate
    // below MUST stay past both the lift and the swing or THE EYE freezes mid-motion.
    // STATE_3 dive_reveal settles ~1.25s (< the 1500 default). STATE_5 sweep is
    // continuous motion (declared in the motion pass, not a one-shot reveal). Keep
    // these in sync with the renderer's constants.
    const em = asObj(state.em);
    if (em) {
        if (em.tilt_reveal === true) candidates.push(1700);
        if (em.swing_reveal === true) candidates.push(2900);
        if (em.decompose_reveal === true) candidates.push(2200);
    }
    // gauss_law: the Gauss's-law STATEMENT scenario (Φ = q_enc/ε₀). Its one-shot
    // timed reveals then HOLD still (mirror electric_flux) — pin the frozen frame
    // past their payoff so the capture photographs the completed reveal, and so
    // deriveHoldExpectations marks the non-slider states reveal_hold (D7/D1p are
    // otherwise false-failed by the static tail). Beats:
    //   • equation_at_ms — STATE_2's "∝ q_enc" → "= q_enc/ε₀" + ε₀ morph (a reveal).
    //   • morph          — STATE_3's sphere→cube→blob surface sweep, readout pinned.
    //   • add_charge     — STATE_5's second −q fades in (q_enc 0 → −1, readout reds,
    //                      lines flip inward); reveal completes at at_ms + fade_ms.
    // NOTE: outside_demo (STATE_4) and flow:true (STATE_1, STATE_4) declare
    // CONTINUOUS field-line flow — handled as motion in deriveMotionExpectations,
    // not as a one-shot reveal_hold here.
    const gauss = asObj(state.gauss);
    if (gauss) {
        if (typeof gauss.equation_at_ms === 'number') {
            candidates.push(asNum(gauss.equation_at_ms, 1200) + 600);
        }
        const morph = asObj(gauss.morph);
        if (morph) candidates.push(asNum(morph.at_ms, 0) + asNum(morph.duration_ms, 4500) + 500);
        const addCharge = asObj(gauss.add_charge);
        if (addCharge) {
            candidates.push(asNum(addCharge.at_ms, 1500) + asNum(addCharge.fade_ms, 1000) + 500);
        }
    }
    // gauss_law_sphere: the E-from-symmetry SHELL scenario (E = 0 inside, kq/r²
    // outside, via Gauss + spherical symmetry). Its per-state `gauss_sphere` beats
    // are one-shot timed reveals that then HOLD (the field is static once revealed;
    // any ambient field-flow glow / interior test-probe is supplementary motion).
    // Pin the frozen frame past each payoff so THE EYE photographs the completed
    // reveal, and so deriveHoldExpectations marks the non-slider states reveal_hold
    // (D7/D1p would otherwise false-fail on the static tail). Beats:
    //   • radial_arrow_at_ms / ghost_rotation — STATE_2 symmetry (P arrow + spin).
    //   • equation_at_ms                      — STATE_3 Φ=E·4πr² ⇒ E=kq/r² write-in.
    //   • shell_appears_at_ms                 — STATE_4 compare-mode: point charge
    //                                           shown first, then the shell fades in
    //                                           on the left (one-shot, then holds).
    //   • shrink_through_R / arrows_collapse_at_ms — STATE_5 inside → q_enc=0 → E=0.
    //   • plot_draw_*                         — STATE_6 E-vs-r curve draw.
    // NOTE: STATE_7's r_gauss slider is user-driven (interactive) — handled in
    // deriveHoldExpectations, not here.
    const gsph = asObj(state.gauss_sphere);
    if (gsph) {
        if (typeof gsph.radial_arrow_at_ms === 'number') {
            candidates.push(asNum(gsph.radial_arrow_at_ms, 3700) + 500);
        }
        const ghost = asObj(gsph.ghost_rotation);
        if (ghost) candidates.push(asNum(ghost.at_ms, 4600) + asNum(ghost.duration_ms, 1200) + 500);
        if (typeof gsph.equation_at_ms === 'number') {
            candidates.push(asNum(gsph.equation_at_ms, 4600) + 600);
        }
        if (typeof gsph.shell_appears_at_ms === 'number') {
            // compare-mode: the shell fades+grows in (~1s) after the point-charge
            // phase. Pin past the fade so the reveal_hold classification sees it.
            candidates.push(asNum(gsph.shell_appears_at_ms, 17000) + 1000 + 500);
        }
        if (typeof gsph.compare_highlight_at_ms === 'number') {
            // the LAST compare-mode beat: both formula captions highlight for the
            // "same answer" comparison — this is the true reveal-complete time.
            candidates.push(asNum(gsph.compare_highlight_at_ms, 26000) + 800);
        }
        // R3: the white horizontal radius lines GROW in (length 0→full over ~0.8s)
        // at a narration-synced cue. When a radius line is a state's LAST reveal
        // (e.g. STATE_1 R ~9s, STATE_2 r ~11s), pin past its growth so reveal_hold
        // classification + the frozen-frame capture see the completed line.
        if (typeof gsph.emerge_R_at_ms === 'number') {
            candidates.push(asNum(gsph.emerge_R_at_ms, 0) + 800);
        }
        if (typeof gsph.emerge_r_at_ms === 'number') {
            candidates.push(asNum(gsph.emerge_r_at_ms, 0) + 800);
        }
        // R4: STATE_6 coordinated sweep — r sweeps inside→outside with the graph
        // dot tracking, then HOLDS at the end. Pin past the sweep end so the
        // post-sweep hold classifies reveal_hold and the capture lands on the
        // completed 1/r² tail.
        if (typeof gsph.sweep_end_at_ms === 'number') {
            candidates.push(asNum(gsph.sweep_end_at_ms, 28000) + 500);
        }
        const shrink = asObj(gsph.shrink_through_R);
        if (shrink) candidates.push(asNum(shrink.at_ms, 0) + asNum(shrink.duration_ms, 900) + 500);
        if (typeof gsph.arrows_collapse_at_ms === 'number') {
            candidates.push(asNum(gsph.arrows_collapse_at_ms, 4500) + 500);
        }
        if (typeof gsph.plot_draw_at_ms === 'number') {
            candidates.push(asNum(gsph.plot_draw_at_ms, 800) + asNum(gsph.plot_draw_duration_ms, 4000) + 500);
        }
    }
    // gauss_law_line (infinite line charge: E = λ/(2πε₀r), radial ring, 1/r falloff).
    // Its per-state `gauss_line` beats are one-shot timed reveals that then HOLD
    // (the field is static once revealed; the flow glow / idle sweep is supplementary).
    // Pin the frozen frame past each payoff so THE EYE photographs the completed
    // reveal and deriveHoldExpectations marks the non-slider states reveal_hold.
    const gln = asObj(state.gauss_line);
    if (gln) {
        if (typeof gln.radial_arrow_at_ms === 'number') {
            candidates.push(asNum(gln.radial_arrow_at_ms, 3700) + 500);
        }
        if (typeof gln.emerge_r_at_ms === 'number') {
            candidates.push(asNum(gln.emerge_r_at_ms, 0) + 800);
        }
        if (typeof gln.emerge_L_at_ms === 'number') {
            candidates.push(asNum(gln.emerge_L_at_ms, 0) + 800);
        }
        if (typeof gln.caps_reveal_at_ms === 'number') {
            candidates.push(asNum(gln.caps_reveal_at_ms, 4000) + 800);
        }
        if (typeof gln.derivation_at_ms === 'number') {
            // stepwise Φ→E write-in; pin past the last sub-step (~+2500ms cushion).
            candidates.push(asNum(gln.derivation_at_ms, 4000) + asNum(gln.derivation_duration_ms, 2500) + 500);
        }
        if (typeof gln.sweep_end_at_ms === 'number') {
            candidates.push(asNum(gln.sweep_end_at_ms, 28000) + 500);
        }
        if (typeof gln.plot_draw_at_ms === 'number') {
            candidates.push(asNum(gln.plot_draw_at_ms, 800) + asNum(gln.plot_draw_duration_ms, 4000) + 500);
        }
        if (typeof gln.gaussian_fade_at_ms === 'number') {
            candidates.push(asNum(gln.gaussian_fade_at_ms, 0) + 600 + 500);
        }
    }
    // gauss_law_sheet (infinite charged sheet: E = σ/(2ε₀), a CONSTANT field — the
    // PLANAR / INVERTED counterpart of gauss_law_line). Its per-state `gauss_sheet`
    // beats are one-shot timed reveals that then HOLD (the field is static once
    // revealed; the flow glow / idle sweep is supplementary). Pin the frozen frame
    // past each payoff so THE EYE photographs the completed reveal — the flux-bearing
    // CAP arrows, the grazing WALL "Φ=0" beat, the A-cancel derivation, the FLAT
    // E-vs-d line + falling ghosts — and so deriveHoldExpectations marks the
    // non-slider states reveal_hold. Mirror of the gln block above with the
    // gauss_sheet key names (caps carry flux here; emerge_d / emerge_H).
    const gss = asObj(state.gauss_sheet);
    if (gss) {
        if (typeof gss.cap_arrow_at_ms === 'number') {
            candidates.push(asNum(gss.cap_arrow_at_ms, 3700) + 500);
        }
        if (typeof gss.emerge_d_at_ms === 'number') {
            candidates.push(asNum(gss.emerge_d_at_ms, 0) + 800);
        }
        if (typeof gss.emerge_H_at_ms === 'number') {
            candidates.push(asNum(gss.emerge_H_at_ms, 0) + 800);
        }
        if (typeof gss.area_label_at_ms === 'number') {
            candidates.push(asNum(gss.area_label_at_ms, 0) + 700);
        }
        if (typeof gss.caps_reveal_at_ms === 'number') {
            // the grazing-wall + "Φ=0" zero-flux beat (caps pulse on the same cue).
            candidates.push(asNum(gss.caps_reveal_at_ms, 4000) + 800);
        }
        if (typeof gss.derivation_at_ms === 'number') {
            // stepwise Φ=2EA → E=σ/(2ε₀) write-in; pin past the last sub-step.
            candidates.push(asNum(gss.derivation_at_ms, 4000) + asNum(gss.derivation_duration_ms, 2500) + 500);
        }
        if (typeof gss.sweep_end_at_ms === 'number') {
            candidates.push(asNum(gss.sweep_end_at_ms, 28000) + 500);
        }
        if (typeof gss.plot_draw_at_ms === 'number') {
            candidates.push(asNum(gss.plot_draw_at_ms, 800) + asNum(gss.plot_draw_duration_ms, 4000) + 500);
        }
        if (typeof gss.gaussian_fade_at_ms === 'number') {
            candidates.push(asNum(gss.gaussian_fade_at_ms, 0) + 600 + 500);
        }
    }
    // electric_potential_meaning (scenario point_charge_positive + a per-state
    // `potential` block): the V = W/q "meaning" arc. Its reveal beats are one-shot
    // timed reveals/animations that then HOLD their end pose (never fade to 0). Pin
    // the frozen frame past each payoff so THE EYE photographs the COMPLETED reveal:
    //   • route_at_ms[] + route_duration_ms — STATE_2 two-route travel + tally tick.
    //   • release_at_ms + release_duration_ms — STATE_3 fly-out + badge drain → "U".
    //   • doubling_at_ms + v_callout_at_ms — STATE_4 q→2q grow + V=W/q write-in.
    //   • reference_at_ms / delta_v_at_ms — STATE_5 ∞-marker + ΔV bracket draw.
    //   • shells_at_ms / e_arrow_at_ms — STATE_6 shells fade-in + ⊥ E draw.
    // STATE_7 (draggable_test_charge) is user-driven → deriveHoldExpectations
    // (interactive), not pinned here; its idle auto-sweep is supplementary motion.
    //
    // electric_potential_point_charge (the V = kQ/r FORMULA sibling, same scenario +
    // potential_meaning block but with the extra V-vs-r-curve and sign-flip beats).
    // Same one-shot-reveal-then-HOLD contract; pin past each NEW payoff:
    //   • shell_relight_at_ms / v_callout_at_ms — STATE_2 shell-relight + V callout.
    //   • predict_reveal_at_ms + halve_r_at_ms/_duration_ms — STATE_3 halve-r predict→
    //     reveal beat: P slides r=2→1 while the live V count climbs count_up_from_v→
    //     count_up_to_v (the 6→12 doubling). Pin past the slide + the count-up land.
    //   • v_curve_draw_at_ms/_duration_ms + e_ghost_fade_at_ms + gap_highlight_at_ms —
    //     STATE_4 PRIMARY aha: the bright 1/r V curve draws left→right, the dim 1/r²
    //     E ghost fades in beneath it, then the divergence gap highlights (the last
    //     payoff). Pin past gap_highlight so the frozen frame photographs the split.
    //   • sign_flip_at_ms/_duration_ms — STATE_5 +Q hill → −Q well recolor + V-label
    //     sign prepend (NO arrow ever — draws_arrow:false). Pin past the flip land.
    // STATE_6 (draggable_test_charge + live_curve_dot + sign_toggle) is user-driven →
    // deriveHoldExpectations (interactive), not pinned here.
    const pot = asObj(state.potential);
    if (pot) {
        const routeDur = asNum(pot.route_duration_ms, 4000);
        if (Array.isArray(pot.route_at_ms) && pot.route_at_ms.length) {
            // last route's start cue + its travel time (+500 cushion).
            const cues = pot.route_at_ms.filter((c): c is number => typeof c === 'number');
            if (cues.length) candidates.push(Math.max(...cues) + routeDur + 500);
        } else if (Array.isArray(pot.animate_route) && pot.animate_route.length) {
            // no explicit cues → both routes run back-to-back (route2 starts after
            // route1 + a 600ms gap); pin past the second route's completion.
            const routes = pot.animate_route.length;
            candidates.push((routes > 1 ? routeDur + 600 : 0) + routeDur + 500);
        }
        if (typeof pot.release_at_ms === 'number') {
            candidates.push(asNum(pot.release_at_ms, 0) + asNum(pot.release_duration_ms, 3500) + 500);
        }
        if (typeof pot.doubling_at_ms === 'number') {
            candidates.push(asNum(pot.doubling_at_ms, 0) + asNum(pot.doubling_duration_ms, 1200) + 500);
        }
        if (typeof pot.v_callout_at_ms === 'number') {
            candidates.push(asNum(pot.v_callout_at_ms, 0) + 600);
        }
        if (typeof pot.reference_at_ms === 'number') {
            candidates.push(asNum(pot.reference_at_ms, 0) + 600 + 300);
        }
        if (typeof pot.delta_v_at_ms === 'number') {
            candidates.push(asNum(pot.delta_v_at_ms, 0) + 700 + 300);
        }
        if (typeof pot.shells_at_ms === 'number') {
            // staggered concentric fade-in: up to 4 shells × 350ms stagger + 700 fade.
            candidates.push(asNum(pot.shells_at_ms, 0) + 4 * 350 + 700);
        }
        if (typeof pot.e_arrow_at_ms === 'number') {
            candidates.push(asNum(pot.e_arrow_at_ms, 0) + 700 + 300);
        }
        // ── electric_potential_point_charge NEW beats ──────────────────────────
        // STATE_2: shell-relight + V callout (shell_relight_at_ms == v_callout_at_ms
        // == 5000). v_callout_at_ms already pins above; add the shell relight cue so
        // the per-state max is never under it.
        if (typeof pot.shell_relight_at_ms === 'number') {
            candidates.push(asNum(pot.shell_relight_at_ms, 0) + 700);
        }
        // STATE_3: halve-r predict→reveal — P slides r=2→1 (halve_r_at_ms +
        // halve_r_duration_ms) while the V count climbs from→to; the predict beat
        // resolves at predict_reveal_at_ms. Pin past the SLIDE completion + a cushion
        // so the frozen frame shows P arrived at r=1 with the count-up landed on 12.
        if (typeof pot.predict_reveal_at_ms === 'number') {
            candidates.push(asNum(pot.predict_reveal_at_ms, 0) + 800);
        }
        if (typeof pot.halve_r_at_ms === 'number') {
            candidates.push(asNum(pot.halve_r_at_ms, 0) + asNum(pot.halve_r_duration_ms, 1600) + 500);
        }
        // STATE_4: V-vs-r curve draw (left→right sweep) → E ghost fade-in → gap
        // highlight (the LAST payoff). Pin past gap_highlight so the frozen frame
        // photographs the bright-V-above-dim-E divergence, not mid-draw.
        if (typeof pot.v_curve_draw_at_ms === 'number') {
            candidates.push(asNum(pot.v_curve_draw_at_ms, 0) + asNum(pot.v_curve_draw_duration_ms, 3000) + 500);
        }
        if (typeof pot.e_ghost_fade_at_ms === 'number') {
            candidates.push(asNum(pot.e_ghost_fade_at_ms, 0) + 700 + 300);
        }
        if (typeof pot.gap_highlight_at_ms === 'number') {
            candidates.push(asNum(pot.gap_highlight_at_ms, 0) + 1200 + 500);
        }
        // STATE_5: sign flip — +Q hill → −Q well recolor + V-label sign prepend, over
        // sign_flip_duration_ms. NO arrow (draws_arrow:false). Pin past the flip land.
        if (typeof pot.sign_flip_at_ms === 'number') {
            candidates.push(asNum(pot.sign_flip_at_ms, 0) + asNum(pot.sign_flip_duration_ms, 1500) + 500);
        }
        // ── equipotential_surfaces NEW beats (session 2026-06-28) ───────────────
        // The renderer animates these on the state clock (PM_simTimeMs); THE EYE MUST
        // pin past their payoff or the frozen/dense capture lands BEFORE the reveal and
        // photographs an empty frame (the bug-2 false negative). Mirrors the renderer:
        //   • show_field_lines_cross_shells.at_ms — STATE_4 radial E lines + right-angle
        //     ticks fade in over ~700ms from at_ms, then HOLD. (updatePotentialMeaningFrame)
        const crossShells = asObj(pot.show_field_lines_cross_shells);
        if (crossShells && typeof crossShells.at_ms === 'number') {
            candidates.push(asNum(crossShells.at_ms, 0) + 700 + 500);
        }
        //   • slide_along_shell.at_ms — STATE_3 tangential slide (constant r ⇒ no work);
        //     the test charge travels over duration_ms, then HOLDS at the end pose.
        const slideShell = asObj(pot.slide_along_shell);
        if (slideShell && typeof slideShell.at_ms === 'number') {
            candidates.push(asNum(slideShell.at_ms, 0) + asNum(slideShell.duration_ms, 3500) + 500);
        }
        // ── electric_potential_dipole (dipole_potential) NEW beats (session 2026-06-29)
        //   The scalar-V arc. Its `potential` block carries one-shot timed reveals +
        //   the STATE_3/5 probe sweeps + the STATE_6 curve draw. THE EYE MUST pin past
        //   each payoff (incl. the sweep END) or the frozen capture lands before the
        //   reveal / mid-sweep and photographs an incomplete frame. Mirrors
        //   updateDipolePotentialFrame's ramps + sweeps:
        //     • two_term_at_ms / v_readout_at_ms — STATE_1 superposition callout + V.
        //     • theta_arc_at_ms / formula_callout_at_ms — STATE_2 θ-arc + collapsed form.
        //     • sweep{at_ms,duration_ms} — STATE_3 probe travels 40°→140° (sign flip).
        //     • disc_at_ms / disc_v_at_ms / e_arrow_at_ms — STATE_4 disc + V=0 + E arrow.
        //     • v_theta_curve_at_ms / theta_sweep{at_ms,duration_ms} — STATE_5 sweep.
        //     • curve_draw_at_ms / ghost_fade_at_ms / split_highlight_at_ms — STATE_6.
        //   STATE_7 (show_sliders + draggable_probe) is user-driven → interactive.
        if (typeof pot.two_term_at_ms === 'number') candidates.push(asNum(pot.two_term_at_ms, 0) + 600 + 300);
        if (typeof pot.v_readout_at_ms === 'number') candidates.push(asNum(pot.v_readout_at_ms, 0) + 600);
        if (typeof pot.theta_arc_at_ms === 'number') candidates.push(asNum(pot.theta_arc_at_ms, 0) + 500 + 300);
        if (typeof pot.formula_callout_at_ms === 'number') candidates.push(asNum(pot.formula_callout_at_ms, 0) + 600 + 300);
        const dpSweep = asObj(pot.sweep);
        if (dpSweep && typeof dpSweep.at_ms === 'number') {
            candidates.push(asNum(dpSweep.at_ms, 0) + asNum(dpSweep.duration_ms, asNum(dpSweep.dur_ms, 3500)) + 500);
        }
        if (typeof pot.disc_at_ms === 'number') candidates.push(asNum(pot.disc_at_ms, 0) + 700 + 300);
        if (typeof pot.disc_v_at_ms === 'number') candidates.push(asNum(pot.disc_v_at_ms, 0) + 600 + 300);
        // (e_arrow_at_ms already pinned above for the potential_meaning sibling.)
        if (typeof pot.v_theta_curve_at_ms === 'number') candidates.push(asNum(pot.v_theta_curve_at_ms, 0) + 600);
        const dpThSweep = asObj(pot.theta_sweep);
        if (dpThSweep && typeof dpThSweep.at_ms === 'number') {
            candidates.push(asNum(dpThSweep.at_ms, 0) + asNum(dpThSweep.duration_ms, 4000) + 500);
        }
        if (typeof pot.curve_draw_at_ms === 'number') candidates.push(asNum(pot.curve_draw_at_ms, 0) + 3500 + 500);
        if (typeof pot.ghost_fade_at_ms === 'number') candidates.push(asNum(pot.ghost_fade_at_ms, 0) + 700 + 300);
        if (typeof pot.split_highlight_at_ms === 'number') candidates.push(asNum(pot.split_highlight_at_ms, 0) + 1200 + 500);
        if (typeof pot.predict_at_ms === 'number') candidates.push(asNum(pot.predict_at_ms, 0) + 800);
        // ── electric_potential_system_of_charges (system_of_charges) NEW beats ──
        //   The N-charge scalar-sum arc (V = Σ k qᵢ/rᵢ). Its `potential` block carries
        //   one-shot timed reveals that play ONCE then HOLD their end pose (Rule 26,
        //   accumulator-free) — no probe sweep, no route travel. THE EYE MUST pin past
        //   each payoff or the frozen capture lands before the reveal and photographs an
        //   incomplete frame. deriveHoldExpectations classifies each non-slider state
        //   reveal_hold directly (the generic `potential` fallback), and STATE_6
        //   (draggable_probe + show_sliders) interactive — so S3/S4/S5's reveal-then-
        //   hold tails are not flagged as dead animations (the D7 lesson). Mirrors
        //   updateSystemOfChargesFrame's ramps:
        //     • per_charge_tags_at_ms      — STATE_1 r-lines fade in.
        //     • contribution_values_at_ms  — STATE_1 the 3 signed per-charge V tags.
        //     • running_sum_at_ms          — STATE_2 stacked signed sum → total.
        //     • far_term_at_ms / total_with_far_at_ms — STATE_3 far-q1 term + total.
        //     • cancellation_at_ms / total_just_q3_at_ms — STATE_4 +/− pair → 0, total.
        //     • field_contrast_at_ms / split_callout_at_ms — STATE_5 E arrows + callout.
        if (typeof pot.per_charge_tags_at_ms === 'number') candidates.push(asNum(pot.per_charge_tags_at_ms, 0) + 600 + 300);
        if (typeof pot.contribution_values_at_ms === 'number') candidates.push(asNum(pot.contribution_values_at_ms, 0) + 600 + 300);
        if (typeof pot.running_sum_at_ms === 'number') candidates.push(asNum(pot.running_sum_at_ms, 0) + 600 + 300);
        if (typeof pot.far_term_at_ms === 'number') candidates.push(asNum(pot.far_term_at_ms, 0) + 600 + 300);
        if (typeof pot.total_with_far_at_ms === 'number') candidates.push(asNum(pot.total_with_far_at_ms, 0) + 600 + 300);
        if (typeof pot.cancellation_at_ms === 'number') candidates.push(asNum(pot.cancellation_at_ms, 0) + 600 + 300);
        if (typeof pot.total_just_q3_at_ms === 'number') candidates.push(asNum(pot.total_just_q3_at_ms, 0) + 600 + 300);
        if (typeof pot.field_contrast_at_ms === 'number') candidates.push(asNum(pot.field_contrast_at_ms, 0) + 700 + 300);
        if (typeof pot.split_callout_at_ms === 'number') candidates.push(asNum(pot.split_callout_at_ms, 0) + 600 + 300);
    }
    // ── potential_energy_system_of_charges (system_pe_assembly) beats ──
    //   The assemble-from-infinity ENERGY arc (U = Σ k qᵢqⱼ/rᵢⱼ). Its per-state
    //   `assembly` block flies charges in (enter[].at_ms + dur_ms), lights pair bonds
    //   (bonds[].at_ms), then fills the signed energy meter (meter_at_ms) + running
    //   sum (sum_at_ms) — all one-shot, then HOLD their end pose (Rule 26,
    //   accumulator-free). THE EYE MUST pin past the LAST payoff or the frozen capture
    //   lands mid-fly-in and photographs an incomplete frame. deriveHoldExpectations
    //   marks each non-slider state reveal_hold and STATE_6 (draggable_id +
    //   show_sliders) interactive — so the post-assembly frozen tail is not flagged a
    //   dead animation (the D7 lesson).
    const asm = asObj(state.assembly);
    if (asm) {
        const enters = Array.isArray(asm.enter) ? asm.enter : [];
        for (const e of enters) {
            const eo = asObj(e);
            if (eo) candidates.push(asNum(eo.at_ms, 0) + asNum(eo.dur_ms, 2400) + 300);
        }
        const bonds = Array.isArray(asm.bonds) ? asm.bonds : [];
        for (const bd of bonds) {
            const bo = asObj(bd);
            if (bo) candidates.push(asNum(bo.at_ms, 0) + 600 + 300);
        }
        if (typeof asm.meter_at_ms === 'number') candidates.push(asNum(asm.meter_at_ms, 0) + 500 + 300);
        if (typeof asm.sum_at_ms === 'number') candidates.push(asNum(asm.sum_at_ms, 0) + 600 + 300);
    }
    // pe_external_field (potential_energy_in_external_field) beats. The per-state `pef`
    // block carries one-shot timed reveals that play ONCE then HOLD their end pose
    // (Rule 26): the field/equipotential fade-ins, the per-charge qV tags, the signed
    // energy meter, the formula overlay, the STATE_5 bonds, the hill/well glyph + its
    // sign FLIP, the STATE_2 charge fly-in + slide, and (DIPOLE phase) the theta_sweep
    // /oscillation/damped_swing rotation END + the STATE_6 p draw-in. THE EYE MUST pin
    // past the LAST payoff or the frozen capture lands mid-reveal. deriveHoldExpectations
    // marks each non-slider pef state reveal_hold and STATE_9 interactive.
    const pef = asObj(state.pef);
    if (pef) {
        if (pef.field_animate_in === true) candidates.push(1000 + 300);
        if (typeof pef.equipotential_at_ms === 'number') candidates.push(asNum(pef.equipotential_at_ms, 0) + 700 + 300);
        if (typeof pef.qv_tags_at_ms === 'number') candidates.push(asNum(pef.qv_tags_at_ms, 0) + 600 + 300);
        if (typeof pef.meter_at_ms === 'number') candidates.push(asNum(pef.meter_at_ms, 0) + 500 + 300);
        if (typeof pef.formula_at_ms === 'number') candidates.push(asNum(pef.formula_at_ms, 0) + 600 + 300);
        if (typeof pef.bonds_at_ms === 'number') candidates.push(asNum(pef.bonds_at_ms, 0) + 600 + 300);
        if (typeof pef.landscape_at_ms === 'number') candidates.push(asNum(pef.landscape_at_ms, 0) + 600 + 300);
        if (typeof pef.flip_at_ms === 'number') candidates.push(asNum(pef.flip_at_ms, 0) + 800 + 500);
        const pcs = Array.isArray(pef.charges) ? pef.charges : [];
        for (const c of pcs) {
            const co = asObj(c);
            if (!co) continue;
            if (co.enter_from != null) candidates.push(asNum(co.enter_at_ms, 0) + asNum(co.enter_dur_ms, 2000) + 300);
            if (co.slide_to != null) candidates.push(asNum(co.slide_at_ms, 0) + asNum(co.slide_dur_ms, 2000) + 500);
        }
        if (pef.dipole === true) {
            const rm = typeof pef.rotation_mode === 'string' ? pef.rotation_mode : null;
            if (rm === 'theta_sweep') candidates.push(asNum(pef.theta_sweep_period_s, 10) * 1000 + 500);
            else if (rm === 'oscillation') candidates.push(asNum(pef.oscillation_period_s, 4) * 1000 * 2 + 500);
            else if (rm === 'damped_swing') candidates.push(asNum(pef.swing_decay_s, 2.2) * 3 * 1000 + 500);
            if (pef.p_animate_in === true) candidates.push(900 + 500);
        }
    }
    // magnetisation: the guided beats animate on the state clock — the align sweep
    // (~2.5s ramp) and the sum-mode dense-line fade (~1.5s) are the latest payoffs;
    // pin the dense window past them so the frozen capture lands on the settled pose.
    const mag = asObj(state.mag);
    if (mag) {
        const mode = typeof mag.mode === 'string' ? mag.mode : '';
        if (mode === 'align') candidates.push(2500 + 600);
        else if (mode === 'sum') candidates.push(1500 + 600);
        else if (mode === 'insert') candidates.push(1100 + 500);
        else if (mode === 'materials') candidates.push(2400 * 3 + 500);
        else candidates.push(1200);
    }
    // faraday (faraday_law_induction): the guided beats animate on the state clock —
    // pin the dense/frozen window at the moment each beat's payoff is strongest so
    // the capture lands on a deflected needle / changing flux, never on the settled
    // eps=0 tail (the magnet-at-rest end pose gives no deflection).
    const faraday = asObj(state.faraday);
    if (faraday) {
        const mode = typeof faraday.mode === 'string' ? faraday.mode : '';
        if (mode === 'push_in') candidates.push(1000);       // mid slide-in, needle deflected
        else if (mode === 'pull_out') candidates.push(1000); // mid slide-out, needle reversed
        else if (mode === 'lenz') candidates.push(1600);     // mid slow approach, push arrow up
        else if (mode === 'rate') candidates.push(400);      // near first |eps| peak (needle swung)
        else candidates.push(1200);                          // flux_steady shimmer / default
    }
    // motional_emf_rod (motional_emf): the guided beats animate on the state
    // clock — pin the dense/frozen window at the moment each beat's payoff is
    // strongest (rod mid-slide with both eps readouts climbing / charges mid-
    // drift / RHR hand mid-curl / voltmeter deflected / beads flowing +
    // F_retard visible / twin power readouts converging), never on a settled
    // zero-motion tail.
    const mem = asObj(state.motional_emf_rod);
    if (mem) {
        const mode = typeof mem.mode === 'string' ? mem.mode : '';
        if (mode === 'flux_crosscheck') candidates.push(15000);        // mid-slide, Φ/ε climbing together
        else if (mode === 'charge_separation') candidates.push(9000);  // mid charge-drift settle
        else if (mode === 'polarity_rhr') candidates.push(6000);       // mid RHR curl (v→B phase)
        else if (mode === 'open_circuit') candidates.push(10000);      // voltmeter deflected, I pinned 0
        else if (mode === 'closed_circuit') candidates.push(10000);    // beads flowing, F_retard visible
        else if (mode === 'energy') candidates.push(18000);            // twin power readouts converged
        else candidates.push(1500);                                    // sandbox / no timed reveal
    }
    // eddy_currents (eddy_current_pendulum): the guided beats animate on the
    // state clock — pin the dense/frozen window at the moment each beat's
    // payoff is strongest (the field-toggle collapse mid-swing / the loop-
    // glyph brightness peak at the bottom of the swing / the grip-hand mid-
    // curl / the twin plates' decay contrast / the furnace-then-core
    // crossfade), never on a settled zero-motion tail.
    const ecp = asObj(state.eddy_current_pendulum);
    if (ecp) {
        const mode = typeof ecp.mode === 'string' ? ecp.mode : '';
        if (mode === 'damping_ab_test') candidates.push(15000);        // mid field-toggle collapse
        else if (mode === 'loop_zoom') candidates.push(4000);          // loop-glyph mid-swing brightness
        else if (mode === 'lenz_grip') candidates.push(12000);         // grip-hand mid-curl
        else if (mode === 'slots_twin') candidates.push(6000);         // twin plates mid-decay-contrast
        else if (mode === 'applications') candidates.push(24000);     // core phase, laminated swap settled
        else candidates.push(1500);                                    // sandbox / no timed reveal
    }
    // inductance: the guided beats animate on the state clock — pin the dense/
    // frozen window at the moment each beat's payoff is strongest (real current
    // mid-ramp with the back-EMF arrow up / steady current with eps_L pinned zero
    // on the graph / core slid in with L jumped / reservoir mid-fill / secondary
    // needle deflected with flux across the gap / coils coupled), never on a
    // settled zero-motion tail.
    const ind = asObj(state.inductance);
    if (ind) {
        const mode = typeof ind.mode === 'string' ? ind.mode : '';
        if (mode === 'self_ramp') candidates.push(3500);          // real current mid-ramp, back-EMF arrow up
        else if (mode === 'switch_graph') candidates.push(10000); // steady interval: I large, eps_L pinned 0
        else if (mode === 'geometry') candidates.push(10000);     // core slid in, L jumped, current re-ramping
        else if (mode === 'energy') candidates.push(6000);        // reservoir mid-fill, U climbing
        else if (mode === 'mutual_intro') candidates.push(5000);  // needle deflected, flux across the gap
        else if (mode === 'coupling') {
            // Shared-core slide-in: the readout/toggle flip to "Shared core:
            // iron, k=0.87" INSTANTLY at cue-fire, but the core mesh takes ~1s
            // to ease into the gap (indUpdateMutual's scp smoothstep). Derive
            // the freeze/H2 pin from the state's configured cue (renderer
            // fallback 6000ms) + the slide ease (~1000ms) + a 500ms cushion —
            // NEVER a fixed literal below the seat time, or the frozen frame
            // photographs the mid-transition contradiction (flipped readout +
            // core still parked outside the coils + stale "air gap" label).
            // Scar: coupling_state_core_reveal_pin_mismatch (session 2026-07-04).
            candidates.push(asNum(ind.shared_core_at_ms, 6000) + 1500);
        }
        else candidates.push(1500);                               // explore / no timed reveal
    }
    // ac_generator: the coil rotates continuously in every guided beat — pin the
    // dense/frozen window a couple of revolutions in, where the graph trace is
    // established and the phase relationship is strongest (never a settled tail;
    // the coil never stops). At omega~1.5 rad/s, T~4.2s, so ~5-6s is 1-1.5 turns.
    const acg = asObj(state.ac_generator);
    if (acg) {
        const mode = typeof acg.mode === 'string' ? acg.mode : '';
        if (mode === 'machine_overview') candidates.push(5000);   // mid-spin, bulb bright
        else if (mode === 'flux_trace') candidates.push(6000);    // cosine drawn (cue fallback 2500ms), dot mid-sweep
        else if (mode === 'emf_mechanism') candidates.push(5500); // slowed coil (omega 0.8) mid-quarter-turn: v + F arrows at a working angle
        else if (mode === 'emf_phase') candidates.push(6500);     // both curves drawn (EMF cue fallback 2000ms), 90 deg visible
        else if (mode === 'peak_dependence') candidates.push(5000); // sine on the fixed axis
        else if (mode === 'slip_rings') candidates.push(5000);    // current arrow mid-cycle, flip pulse (4000ms) mid-fade
        else candidates.push(1500);                               // sandbox / no timed reveal
    }
    // ac_resistor (v=vm*sin(wt) on a resistor — Ch.7 §7.2 CHAPTER_LOOP Stage-1b
    // engine ask): every guided beat's payoff lands on a cue-gated beat
    // (renderer defaults mirrored here — keep in sync if those *_at_ms
    // fallbacks in field_3d_renderer.ts ever change: updateAcResistorFrame /
    // acrDrawViGraph / acrDrawPGraph / acrUpdateDerivation). Pin the frozen
    // frame past the LAST payoff of each mode so THE EYE photographs the
    // completed beat, never a mid-reveal frame.
    const acr = asObj(state.ac_resistor);
    if (acr) {
        const mode = typeof acr.mode === 'string' ? acr.mode : '';
        if (mode === 'ac_swings_both_ways') candidates.push(2000);        // vm peak line landed (~T/4 at default f)
        else if (mode === 'ohm_at_every_instant') {
            // three cursor samples (default 500/2000/3500ms) then the i-sweep
            // (default i_sweep_start_at_ms=5000) — pin past the sweep settle.
            candidates.push(asNum(acr.i_sweep_start_at_ms, 5000) + 1200);
        }
        else if (mode === 'both_halves_heat') candidates.push(3000);      // mid-B-half, glow + E established
        else if (mode === 'power_never_negative') {
            candidates.push(asNum(acr.product_walk_highlight_at_ms, 6500) + 500);
        }
        else if (mode === 'zero_average') {
            candidates.push(asNum(acr.avg_zero_reveal_at_ms, 1500) + 500);
        }
        else if (mode === 'rms_dc_equivalent') {
            // twin dock + the scripted V_dc dial-down window + the match reveal —
            // pin past whichever payoff lands last.
            candidates.push(asNum(acr.dial_down_end_at_ms, 5000) + 700);
            candidates.push(asNum(acr.match_reveal_at_ms, 5200) + 500);
        }
        else if (mode === 'square_mean_root') {
            candidates.push(asNum(acr.avg_power_dock_at_ms, 6000) + 500);
        }
        else if (mode === 'why_half') {
            candidates.push(asNum(acr.identity_dock_at_ms, 3500) + 800);
        }
        else candidates.push(1500);                                       // explore / no timed reveal
    }
    // ac_inductor (i=im*sin(wt-pi/2) on an inductor — Ch.7 §7.3, clean
    // standalone sibling of ac_resistor): every guided beat's payoff lands
    // on a cue-gated beat (renderer defaults mirrored here — keep in sync if
    // those *_at_ms fallbacks in field_3d_renderer.ts ever change:
    // updateAcInductorFrame / aclDrawViGraph / aclDrawPGraph /
    // aclUpdateDerivation). Pin the frozen frame past the LAST payoff of
    // each mode so THE EYE photographs the completed beat, never a mid-
    // reveal frame.
    const acInd = asObj(state.ac_inductor);
    if (acInd) {
        const mode = typeof acInd.mode === 'string' ? acInd.mode : '';
        if (mode === 'apparatus_swap') candidates.push(2000);              // both strangenesses (bead pause / field peak) established
        else if (mode === 'quarter_cycle_lag') {
            candidates.push(asNum(acInd.lag_bracket_land_at_ms, 5000) + 700);
        }
        else if (mode === 'coil_fights_change') candidates.push(4500);     // one full A->B->A' loop (T=4.0s at defaults) established
        else if (mode === 'slope_sets_current') {
            // three cue-gated tangent-walk dwell stops (default [1500,4500,7500]).
            const stops = Array.isArray(acInd.tangent_stops_at_ms) ? acInd.tangent_stops_at_ms as unknown[] : null;
            const lastStop = stops && stops.length === 3 && typeof stops[2] === 'number' ? (stops[2] as number) : 7500;
            candidates.push(lastStop + 800);
        }
        else if (mode === 'reactance_ramp') {
            // scripted f-ramp: rampStart + the full 17.0s multi-leg schedule
            // (physics_block §3 S5 — 4.0+1.5+6.0+1.5+4.0) + a settle cushion.
            candidates.push(asNum(acInd.ramp_window_start_at_ms, 2000) + 17000 + 800);
        }
        else if (mode === 'power_swings') {
            candidates.push(asNum(acInd.area_label_at_ms, 3000) + 600);
        }
        else if (mode === 'null_average_power') candidates.push(3000);     // dead needle + live beads/field/gauge established
        else if (mode === 'one_integral_derivation') {
            candidates.push(asNum(acInd.identity_dock_at_ms, 3500) + 800);
        }
        else candidates.push(1500);                                       // explore / no timed reveal
    }
    // ac_capacitor (i=im*sin(wt+pi/2) on a capacitor — Ch.7 §7.4, clean
    // standalone sibling of ac_resistor/ac_inductor): every guided beat's
    // payoff lands on a cue-gated beat (renderer defaults mirrored here —
    // keep in sync if those *_at_ms fallbacks in field_3d_renderer.ts ever
    // change: updateAcCapacitorFrame / accDrawViGraph / accDrawPGraph /
    // accUpdateDerivation). Pin the frozen frame past the LAST payoff of
    // each mode so THE EYE photographs the completed beat, never a mid-
    // reveal frame.
    const acCap = asObj(state.ac_capacitor);
    if (acCap) {
        const mode = typeof acCap.mode === 'string' ? acCap.mode : '';
        if (mode === 'apparatus_swap') candidates.push(2000);              // both strangenesses (full-flood-at-zero / frozen-at-crest) established
        else if (mode === 'quarter_cycle_lead') {
            candidates.push(asNum(acCap.lead_bracket_land_at_ms, 5000) + 700);
        }
        else if (mode === 'plates_push_back') candidates.push(4500);      // one full A->B->A' loop (T=4.0s at defaults) established
        else if (mode === 'slope_feeds_current') {
            // three cue-gated tangent-walk dwell stops (default [1500,4500,7500]).
            const stops = Array.isArray(acCap.tangent_stops_at_ms) ? acCap.tangent_stops_at_ms as unknown[] : null;
            const lastStop = stops && stops.length === 3 && typeof stops[2] === 'number' ? (stops[2] as number) : 7500;
            candidates.push(lastStop + 800);
        }
        else if (mode === 'reactance_ramp') {
            // scripted f-ramp: rampStart + the full 17.0s multi-leg schedule
            // (physics_block §3 S5 — 4.0+1.5+6.0+1.5+4.0) + a settle cushion.
            candidates.push(asNum(acCap.ramp_window_start_at_ms, 2000) + 17000 + 800);
        }
        else if (mode === 'power_swings') {
            candidates.push(asNum(acCap.area_label_at_ms, 3000) + 600);
        }
        else if (mode === 'null_average_power') candidates.push(3000);     // dead needle + live beads/field/gauge established
        else if (mode === 'one_derivative_derivation') {
            candidates.push(asNum(acCap.identity_dock_at_ms, 3500) + 800);
        }
        else candidates.push(1500);                                       // explore / no timed reveal
    }
    // ac_phasor (a spinning phasor's shadow draws v = vₘ sin(ωt); the i-arrow's
    // constant lead/lag angle IS the phase φ — Ch.7 §7.5, clean standalone
    // sibling of ac_resistor/ac_inductor/ac_capacitor). Every guided beat is a
    // SCRIPTED one-shot (trace-congruence naming / theta freeze demo / mirror
    // flip / crossing-order scoreboard / derivation chain) that plays ONCE then
    // HOLDS on the state's own clock (Rule 26); deriveHoldExpectations marks each
    // guided mode reveal_hold below. Pin the frozen frame PAST the LAST scripted
    // payoff of each mode so THE EYE photographs the SETTLED beat, never a mid-
    // transition frame — the F1 defect this fixes: at the 1500ms DEFAULT_REVEAL_MS
    // fallback the S5 flip is only (1500−800)/1200 = 15/90ths done, so the HUD
    // reads φ = 15° while the static formula overlay reads the relocked 90°.
    // Timings mirror the renderer's ac_phasor block (field_3d_renderer.ts:
    // phsComputeFreeze / the hardcoded flipDur = 1.2s scripted flip) and
    // phasors.json's per-state ac_phasor.*_at_ms — keep in sync if either changes.
    const acPh = asObj(state.ac_phasor);
    if (acPh) {
        const mode = typeof acPh.mode === 'string' ? acPh.mode : '';
        if (mode === 'spin_draws_sine') {
            // S1: the spinning disc's sine trace is NAMED congruent with the live
            // shadow (the payoff) at congruence_named_at_ms; pin just past it.
            candidates.push(asNum(acPh.congruence_named_at_ms, 13000) + 500);
        }
        else if (mode === 'arrow_vs_shadow') {
            // S2: three chronological θ freezes (45/90/180) that ARM at their
            // *_at_ms then FIRE at the next target crossing (up to ~one revolution
            // later) and hold freeze_budget_ms_each. At the captured f_demo = 0.25
            // (T = 4.0s; phsComputeFreeze) the last (180°) stop fires ~16.0s and its
            // 1.0s budget completes ~17.0s — pin past the whole freeze demo.
            candidates.push(asNum(acPh.freeze_180_arm_at_ms, 13000) + 4500);
        }
        else if (mode === 'two_arrows_one_clock') {
            // S3: the φ-arc opens (arc_open_at_ms) then the f-drag invite appears
            // (f_invite_at_ms, the last reveal); pin past the invite.
            candidates.push(asNum(acPh.f_invite_at_ms, 13800) + 500);
        }
        else if (mode === 'lag_becomes_angle') {
            // S4: the freeze TRIO (30/150/240) all ARM together at
            // freeze_trio_arm_at_ms then fire+hold sequentially; at the captured
            // f_demo = 0.25 all three complete ~9.7s (phsComputeFreeze). Pin past.
            candidates.push(asNum(acPh.freeze_trio_arm_at_ms, 4300) + 6000);
        }
        else if (mode === 'lead_mirror_flip') {
            // S5: the SCRIPTED one-shot mirror flip — φ ramps flip_relock_from_deg
            // → _to_deg (−90 → +90) over the renderer's hardcoded flipDur = 1200ms
            // starting at flip_start_at_ms. Pin PAST the settle (800 + 1200 = 2000)
            // so the frozen frame reads the relocked +90°, not a mid-flip +15°.
            candidates.push(asNum(acPh.flip_start_at_ms, 800) + 1200 + 200);
        }
        else if (mode === 'reading_order') {
            // S6: the upper-crossing flashes fire early (i_cross/v_cross_arm), then
            // the R/L/C scoreboard SPLITS (scoreboard_split_at_ms, the last payoff).
            candidates.push(asNum(acPh.scoreboard_split_at_ms, 9000) + 800);
        }
        else if (mode === 'radians_derivation') {
            // S7: the four-line θ = ωt derivation writes in chain_1..chain_4_at_ms;
            // pin past the last chain line's write-in.
            candidates.push(asNum(acPh.chain_4_at_ms, 15700) + 800);
        }
        else candidates.push(1500);                                       // explore (S8) / no timed reveal
    }
    // ac_series_lcr (three elements in one series loop; fan / chain / triangle /
    // resonance sweep — Ch.7 §7.6, clean standalone sibling of the scope-pane
    // family). Every guided beat is a SCRIPTED reveal/ramp/freeze that plays then
    // HOLDS on the state's own clock (Rule 26); pin the frozen frame PAST the LAST
    // payoff of each mode so THE EYE photographs the SETTLED beat. Timings mirror
    // the renderer's ac_series_lcr block — keep in sync if either changes.
    const acSlcr = asObj(state.ac_series_lcr);
    if (acSlcr) {
        const mode = typeof acSlcr.mode === 'string' ? acSlcr.mode : '';
        if (mode === 'series_build') candidates.push(asNum(acSlcr.beads_start_at_ms, 4000) + 1500);
        else if (mode === 'off_home') candidates.push(asNum(acSlcr.f_glide_start_at_ms, 0) + asNum(acSlcr.f_glide_dur_ms, 3000) + 2000);
        else if (mode === 'fan') candidates.push(asNum(acSlcr.source_dock_at_ms, 6000) + 2000);
        else if (mode === 'kvl_stack') candidates.push(asNum(acSlcr.freeze_i_arm_at_ms, 7000) + 2500);
        else if (mode === 'tip_to_tail') candidates.push(asNum(acSlcr.chain_vc_at_ms, 3200) + 1500);
        else if (mode === 'z_triangle') candidates.push(asNum(acSlcr.morph_start_at_ms, 800) + 3000);
        else if (mode === 'lead_lag_flip') candidates.push(asNum(acSlcr.f_step_start_at_ms, 3000) + 2500);
        else if (mode === 'resonance_sweep') candidates.push(asNum(acSlcr.sweep_start_at_ms, 1000) + asNum(acSlcr.sweep_legA_ms, 5000) + asNum(acSlcr.sweep_legB_ms, 3000) + 500);
        // F5: the R-family tween runs 5->2 (idx 1) then 2->10 (idx 2), the LAST
        // step completing at r_step_start + 3*r_step_dur. Pin PAST that (was 2x,
        // which landed mid-tween on the transitional R=7.4/Q=0.7) so THE EYE
        // photographs the SETTLED R=10 / Q=0.5 / im=1.00 A frame.
        else if (mode === 'sharpness') candidates.push(asNum(acSlcr.r_step_start_at_ms, 1200) + 3 * asNum(acSlcr.r_step_dur_ms, 1300) + 800);
        else if (mode === 'derivation') candidates.push(asNum(acSlcr.chain_4_at_ms, 6000) + 2000);
        else candidates.push(1500);                                       // explore / no timed reveal
    }
    // ac_power (p=v*i product wave / averaging wattmeter / current split / power
    // triangle / energy gauges — Ch.7 §7.7, clone-sibling of ac_series_lcr + the
    // element power machinery). Every guided beat is a SCRIPTED reveal/ramp/hold
    // that plays then HOLDS on the state's own clock (Rule 26); pin the frozen
    // frame PAST the LAST payoff of each mode so THE EYE photographs the SETTLED
    // beat. Timings mirror the renderer's ac_power block — keep in sync if either
    // changes.
    const acPow = asObj(state.ac_power);
    if (acPow) {
        const mode = typeof acPow.mode === 'string' ? acPow.mode : '';
        if (mode === 'meter_dock') candidates.push(asNum(acPow.needle_climb_at_ms, 1500) + asNum(acPow.needle_climb_dur_ms, 1500) + 500);
        else if (mode === 'product_wave') candidates.push(asNum(acPow.cursor_walk_at_ms, 2000) + 5000);
        else if (mode === 'wave_sinks') candidates.push(asNum(acPow.f_glide_start_at_ms, 0) + asNum(acPow.f_glide_dur_ms, 3000) + 2000);
        else if (mode === 'apparent_vs_real') candidates.push(asNum(acPow.naming_at_ms, 6000) + 1200);
        else if (mode === 'current_split') candidates.push(asNum(acPow.rotation_resume_at_ms, 3600) + 1500);
        else if (mode === 'wattless') candidates.push(asNum(acPow.r_cycle_start_at_ms, 800) + asNum(acPow.r_down_dur_ms, 1200) + asNum(acPow.r_hold_dur_ms, 1000) + asNum(acPow.r_up_dur_ms, 1200) + 800);
        else if (mode === 'energy_ledger') candidates.push(asNum(acPow.close_chip_at_ms, 4000) + 1000);
        else if (mode === 'power_triangle') candidates.push(asNum(acPow.rescale_morph_at_ms, 800) + 4000);
        else if (mode === 'derivation') candidates.push(asNum(acPow.link5_at_ms, 8000) + 2000);
        else candidates.push(1500);                                       // explore / no timed reveal
    }
    // lc_oscillation (source-free L-C loop — Ch.7 §7.8, clone-sibling of ac_power).
    // Every guided beat is a SCRIPTED reveal/ramp/hold that plays then HOLDS on the
    // state's own clock (Rule 26); pin the frozen frame PAST the LAST payoff of each
    // mode so THE EYE photographs the SETTLED beat. Timings mirror the renderer's
    // lc_oscillation block — keep in sync if either changes.
    const lcOsc = asObj(state.lc_oscillation);
    if (lcOsc) {
        const mode = typeof lcOsc.mode === 'string' ? lcOsc.mode : '';
        if (mode === 'charge_up') candidates.push(asNum(lcOsc.charge_climb_start_at_ms, 0) + asNum(lcOsc.charge_climb_dur_ms, 2000) + 800);
        else if (mode === 'switch_throw') candidates.push(asNum(lcOsc.beads_start_at_ms, 1000) + 3500);
        // S3 (empty_is_not_over — the concept's PRIMARY AHA "q=0 yet i peaks"): the
        // q/i zero-crossing is a RECURRING instantaneous event (theta = 90 deg/270 deg
        // at t=1000/3000/5000 ms; T0=4000 ms). The old "flip_at_ms + 1500" landed at
        // 2500 ms = theta=225 deg = q=-0.90 C / |i|=1.41 A — BETWEEN crossings, the
        // OPPOSITE of the caption. Pin ON the second crossing (strike_at_ms + 2000 =
        // 3000 ms = theta=270 deg = q=0.00 C / |i|=2.00 A, plates reversed, ghost
        // already struck) so THE EYE photographs the crossing the state teaches.
        else if (mode === 'through_zero') candidates.push(asNum(lcOsc.strike_at_ms, 1000) + 2000);
        else if (mode === 'free_run') candidates.push(asNum(lcOsc.f0_chip_at_ms, 5200) + 800);
        else if (mode === 'energy_slosh') candidates.push(asNum(lcOsc.half_split_chip_fire_at_ms, 500) + 2100);
        else if (mode === 'shm_twin') candidates.push(asNum(lcOsc.guard_clause_at_ms, 2600) + 1500);
        else if (mode === 'damped') candidates.push(asNum(lcOsc.er_bar_at_ms, 500) + 8000);
        else if (mode === 'derivation') candidates.push(asNum(lcOsc.link4_at_ms, 6000) + 2000);
        else candidates.push(1500);                                       // explore / no timed reveal
    }
    // transformer (two-coil machine — Ch.7 §7.9, clone-sibling of lc_oscillation).
    // Every guided beat is a SCRIPTED reveal/ramp/cascade/morph that plays then
    // HOLDS on the state's own clock (Rule 26); pin the frozen frame PAST the LAST
    // payoff of each mode so THE EYE photographs the SETTLED beat at a v-extremum /
    // dead-hold / cool phase / laminated half (never a recurring zero-crossing).
    // Timings mirror the renderer's transformer block — keep in sync if either changes.
    const tfr = asObj(state.transformer);
    if (tfr) {
        const mode = typeof tfr.mode === 'string' ? tfr.mode : '';
        if (mode === 'flux_link') candidates.push(asNum(tfr.flux_breathe_start_at_ms, 2500) + 1500);
        else if (mode === 'close_secondary') candidates.push(asNum(tfr.meters_settle_at_ms, 1600) + 1400);
        else if (mode === 'dc_dead') candidates.push(asNum(tfr.fix_clause_at_ms, 2200) + 1500);
        else if (mode === 'per_turn') candidates.push(asNum(tfr.cascade_chip_at_ms, 3500) + 800);
        else if (mode === 'turns_ramp') candidates.push(asNum(tfr.naming_clause_at_ms, 3400) + 1200);
        else if (mode === 'power_lock') candidates.push(asNum(tfr.chip_at_ms, 2700) + 1500);
        else if (mode === 'transmission') candidates.push(asNum(tfr.loss_stepped_chip_at_ms, 10500) + 800);
        else if (mode === 'loss_ledger') candidates.push(asNum(tfr.ledger_close_at_ms, 6000) + asNum(tfr.ledger_close_dur_ms, 1500) + 800);
        else if (mode === 'lamination') candidates.push(asNum(tfr.retro_link_at_ms, 7000) + 1500);
        else if (mode === 'derivation') candidates.push(asNum(tfr.link6_at_ms, 7000) + 2000);
        else candidates.push(1500);                                       // explore / no timed reveal
    }
    // magnetic_field_concept_B (straight_wire_current + a per-state `swc` block):
    // one-shot timed reveals that then HOLD their end pose (Rule 26) — the switch
    // ramp (S1 close / S3 open, mirrors switch_toggle in the renderer's animate
    // loop), the compass approach+swing (or, for S4's multi-hop compass, just the
    // FIRST hop's landing — a representative "the compass moved and the needle
    // re-aligned" frame; the fuller multi-hop cycle plays out across the dense-
    // capture window governed by the state's authored `duration`, not this single
    // frozen-frame pin), and the STATE_6 dual_field_compare reveal. Pin the frozen
    // frame past the LAST payoff so THE EYE photographs the completed reveal, not
    // a mid-ramp/mid-swing/mid-fade frame. Keys mirror the renderer's per-state
    // `extras` (applyExtras / the straight_wire_current animate-loop block).
    const swc = asObj(state.swc);
    if (swc) {
        const swcExtras = asObj(state.extras);
        if (swcExtras) {
            const swToggle = asObj(swcExtras.switch_toggle);
            if (swToggle) {
                const evAt = typeof swToggle.close_at_ms === 'number' ? swToggle.close_at_ms
                    : typeof swToggle.open_at_ms === 'number' ? swToggle.open_at_ms : 0;
                candidates.push(asNum(evAt, 0) + asNum(swToggle.ramp_duration_ms, 300) + 300);
            }
            const cmp = asObj(swcExtras.compass);
            if (cmp) {
                const hopPts = Array.isArray(cmp.hop_points) ? cmp.hop_points : null;
                if (hopPts && hopPts.length > 0) {
                    // Multi-hop (S4) fires on hop_points alone — animate_swing is
                    // irrelevant to that path in the renderer.
                    candidates.push(asNum(cmp.first_hop_at_ms, 0) + 700 + 500);
                } else if (cmp.animate_swing !== false) {
                    // Single-position swing only actually runs when animate_swing
                    // is truthy (the renderer gates it: dud.animate_swing &&
                    // dud.needleGroup && !dud.hop_points). S6's static compare-
                    // panel compass sets animate_swing:false — it resolves
                    // instantly, so it must NOT push this candidate (would over-
                    // pin the frozen frame for no real reveal).
                    const approach = cmp.approach_from != null ? asNum(cmp.approach_duration_ms, 1200) : 0;
                    const swingDelay = asNum(cmp.swing_delay_ms, 1500);
                    candidates.push(approach + swingDelay + 2000 + 400);
                }
                if (cmp.snap_back_to_north === true) {
                    candidates.push(asNum(cmp.snap_back_at_ms, 0) + asNum(cmp.snap_back_duration_ms, 600) + 300);
                }
            }
            const ringsAsm = asObj(swcExtras.rings_assemble);
            if (ringsAsm) {
                // STATE_5 assemble is now a multi-phase build (guide -> appear ->
                // join -> ghostFade; field_3d_renderer.ts swcRaChoreo). The reveal
                // completes when the contrast ghosts have fully dimmed — pin THE
                // EYE's frozen frame just after that. Defaults mirror swcRaChoreo().
                candidates.push(asNum(ringsAsm.ghost_fade_at_ms, 7600) + asNum(ringsAsm.ghost_fade_dur_ms, 4200) + 700);
            }
            const dfc = asObj(swcExtras.dual_field_compare);
            if (dfc) {
                candidates.push(asNum(dfc.reveal_at_ms, 1500) + 600 + 400);
            }
        }
        if (candidates.length === 0) candidates.push(1500); // sandbox / no timed reveal this state
    }
    // parallel_plates (parallel_plate_capacitor_field): the E = V/d uniform-field
    // arc. Its per-state `capacitor` block carries one-shot timed reveals that then
    // HOLD their end pose (Rule 26, accumulator-free), plus the STATE_6 gap-widen
    // morph. THE EYE MUST pin past each payoff or the frozen/dense capture lands
    // BEFORE the reveal (the field3d_time_gated_visual_invisible false negative).
    // Mirrors updateParallelPlatesFrame's ramps:
    //   • gap_bracket_at_ms  — STATE_1 the d bracket fades in (then holds).
    //   • field_lines_at_ms  — STATE_2/4 straight + → − lines reveal (+ STATE_4's
    //                          late re-reveal after the sheet superposition).
    //   • probe_arrows_at_ms — STATE_3 the three equal probe arrows fade in.
    //   • probe_points_at_ms — STATE_2 (probe_points variant) the 3 labeled A/B/C
    //                          points + live E readouts fade in (then hold).
    //   • sheet_fields_at_ms / cancel_outside_at_ms — STATE_4 two-sheet add-inside,
    //                          then the OUTSIDE pair fades to zero (cancel) — the
    //                          last payoff; pin past the cancel fade.
    //   • fringe_at_ms       — STATE_5 the edge fringe curls in (then holds).
    //   • gap_widen{anim_at_ms,duration_ms} — STATE_6 plates separate + E halves;
    //                          pin past the morph end so the captured frame shows the
    //                          WIDE gap + the halved E readout (held).
    // STATE_7 (show_sliders + capacitor.draggable_test_charge) is user-driven →
    // deriveHoldExpectations marks it interactive; not pinned here.
    const cap = asObj(state.capacitor);
    if (cap) {
        if (typeof cap.gap_bracket_at_ms === 'number') {
            candidates.push(asNum(cap.gap_bracket_at_ms, 0) + 500 + 300);
        }
        if (typeof cap.field_lines_at_ms === 'number') {
            candidates.push(asNum(cap.field_lines_at_ms, 0) + 600 + 300);
        }
        if (typeof cap.probe_arrows_at_ms === 'number') {
            candidates.push(asNum(cap.probe_arrows_at_ms, 0) + 600 + 300);
        }
        if (typeof cap.probe_points_at_ms === 'number') {
            candidates.push(asNum(cap.probe_points_at_ms, 0) + 600 + 300);
        }
        if (typeof cap.sheet_fields_at_ms === 'number') {
            candidates.push(asNum(cap.sheet_fields_at_ms, 0) + 600 + 300);
        }
        if (typeof cap.cancel_outside_at_ms === 'number') {
            candidates.push(asNum(cap.cancel_outside_at_ms, 0) + 800 + 300);
        }
        if (typeof cap.fringe_at_ms === 'number') {
            candidates.push(asNum(cap.fringe_at_ms, 0) + 700 + 300);
        }
        const gapWiden = asObj(cap.gap_widen);
        if (gapWiden) {
            candidates.push(asNum(gapWiden.anim_at_ms, 9000) + asNum(gapWiden.duration_ms, 2500) + 500);
        }
    }
    // capacitance (Q = CV, C = ε₀A/d — 2026-07-21 engine ask): the NEW capacitance
    // scenario built alongside parallel_plates. Every guided beat is a one-shot
    // smoothstep ramp (switch-close charge-in / a v_steps sequence / a continuous
    // v_sweep / an area_morph / a gap_morph mirroring parallel_plates' gap_widen
    // EXACTLY) that then HOLDS (updateCapacitanceFrame, accumulator-free — pure
    // fn of state-local t) — pin the frozen frame past the LAST ramp's payoff so
    // THE EYE photographs the settled Q/V/C readout, not a mid-ramp frame. S6
    // (mode:'derivation') has no ramp — its three link_cues gate the chain-link
    // formula reveal instead. S7 (mode:'explore') is user-driven — handled in
    // deriveHoldExpectations as interactive, not pinned here.
    const capState = asObj(state.capacitance);
    if (capState) {
        if (typeof capState.switch_close_at_ms === 'number') {
            candidates.push(asNum(capState.switch_close_at_ms, 0) + asNum(capState.charge_duration_ms, 1800) + 500);
        }
        const vSteps = Array.isArray(capState.v_steps) ? capState.v_steps : [];
        for (const stepRaw of vSteps) {
            const step = asObj(stepRaw);
            if (!step) continue;
            candidates.push(asNum(step.at_ms, 0) + asNum(step.duration_ms, 1200) + 500);
        }
        const vSweep = asObj(capState.v_sweep);
        if (vSweep) candidates.push(asNum(vSweep.at_ms, 0) + asNum(vSweep.duration_ms, 4000) + 500);
        const areaMorph = asObj(capState.area_morph);
        if (areaMorph) candidates.push(asNum(areaMorph.at_ms, 0) + asNum(areaMorph.duration_ms, 2500) + 500);
        const gapMorph = asObj(capState.gap_morph);
        if (gapMorph) candidates.push(asNum(gapMorph.at_ms, 0) + asNum(gapMorph.duration_ms, 2500) + 500);
        const linkCues = Array.isArray(capState.link_cues) ? capState.link_cues : [];
        if (linkCues.length > 0) {
            const lastCue = linkCues[linkCues.length - 1];
            if (typeof lastCue === 'number') candidates.push(lastCue + 800);
        }
    }
    // displacement_current (I_d = ε₀ dΦ_E/dt — Ch.8 §8.2): every guided beat's
    // one-shot cues (switch-close, loop-draw/disk-fill/I_enc-dock, surface morph
    // + I_enc flip, probe glide + needle hold + B-ring appear, peak-marker pin,
    // three derivation link cues) land then HOLD. Pin the frozen frame past the
    // LAST cue's payoff so THE EYE photographs the settled reveal — the docked
    // I_enc, the flipped 0, the pinned peak, the closed chain — not a mid-cue
    // frame. The renderer is accumulator-free (pure fn of state-local t), so the
    // snap-to-pin capture is byte-identical to crawling there. S10
    // (displacement_sandbox) is user-driven — handled in deriveHoldExpectations
    // as interactive, not pinned here.
    const dcState = asObj(state.displacement_current);
    if (dcState) {
        const push = (v: unknown, extra = 500) => { if (typeof v === 'number') candidates.push(v + extra); };
        push(dcState.switch_close_at_ms, 2500);         // land inside the charge window
        push(dcState.loop_draw_at_ms, 400);
        push(dcState.disk_fill_at_ms, 600);
        push(dcState.ienc_dock_at_ms, 800);
        if (typeof dcState.morph_start_at_ms === 'number') {
            candidates.push(asNum(dcState.morph_start_at_ms, 2000) + asNum(dcState.morph_duration_ms, 6000) + 500);
        }
        push(dcState.ienc_flip_at_ms, 800);
        if (typeof dcState.probe_glide_start_at_ms === 'number') {
            candidates.push(asNum(dcState.probe_glide_start_at_ms, 2000) + asNum(dcState.probe_glide_duration_ms, 8000) + 500);
        }
        push(dcState.needle_hold_at_ms, 500);
        push(dcState.bring_gap_appear_at_ms, 700);
        push(dcState.peak_marker_pin_at_ms, 800);
        if (Array.isArray(dcState.link_cues_at_ms) && dcState.link_cues_at_ms.length > 0) {
            const last = dcState.link_cues_at_ms[dcState.link_cues_at_ms.length - 1];
            if (typeof last === 'number') candidates.push(last + 900);
        }
        // S6 throttle: pin inside the FIRST on-window so the frozen frame shows
        // both meters live (I_c = I_d = 1.20), not the off-phase zeros.
        if (dcState.mode === 'flux_acts_as_current') {
            candidates.push(Math.round(asNum(dcState.on_ms, 4500) * 0.6));
        }
    }
    // molecular_geometry (VSEPR — CHEMISTRY, 2026-07-28 engine ask): the molecule
    // turns slowly and perpetually (that IS the 3D-legibility capability), but each
    // state's SHAPE beat is a one-shot closed-form ramp that then holds — the bonds
    // grow out, the flat board sketch relaxes into the real tetrahedron, the domain
    // count steps 2→3→4, a bond converts to a lone pair and the surviving bonds
    // close down, the geometry swaps to the 5-/6-domain case. Pin the frozen frame
    // PAST the last ramp's payoff so THE EYE photographs the SETTLED angle (109.5°
    // → 107° → 104.5°), never a mid-squeeze frame. The renderer is accumulator-free
    // (spin angle included), so the snap-to-pin capture is byte-identical to
    // crawling there. The explore sandbox (mode 'explore') is user-driven — handled
    // in deriveHoldExpectations as interactive, not pinned here.
    const mgState = asObj(state.molecular_geometry);
    if (mgState) {
        if (typeof mgState.assemble_at_ms === 'number') {
            candidates.push(asNum(mgState.assemble_at_ms, 600) + asNum(mgState.assemble_duration_ms, 3200) + 500);
        }
        if (typeof mgState.flat_hold_ms === 'number') {
            candidates.push(asNum(mgState.flat_hold_ms, 4200) + asNum(mgState.relax_duration_ms, 3600) + 600);
        }
        const spreadSteps = Array.isArray(mgState.spread_steps) ? mgState.spread_steps : [];
        for (const rawStep of spreadSteps) {
            const step = asObj(rawStep);
            if (!step) continue;
            candidates.push(asNum(step.at_ms, 0) + asNum(step.duration_ms, 1800) + 500);
        }
        const squeezeSteps = Array.isArray(mgState.squeeze_steps) ? mgState.squeeze_steps : [];
        for (const rawStep of squeezeSteps) {
            const step = asObj(rawStep);
            if (!step) continue;
            candidates.push(asNum(step.at_ms, 0) + asNum(step.convert_ms, 900) + asNum(step.duration_ms, 2200) + 600);
        }
        if (typeof mgState.compare_at_ms === 'number') {
            candidates.push(asNum(mgState.compare_at_ms, 5200) + 1500);
        }
        // the electron-domain cage fade-in (900 ms in the renderer) and the
        // scripted "hide the lone pairs → the shape is what is left" reveal.
        if (typeof mgState.hull_at_ms === 'number') candidates.push(asNum(mgState.hull_at_ms, 0) + 900 + 400);
        if (typeof mgState.hide_lone_at_ms === 'number') candidates.push(asNum(mgState.hide_lone_at_ms, 0) + 900);
    }
    // bonding_scene (CHEMISTRY BONDING WAVE — Phase-0 E1, 2026-08-01): the unit
    // may turn perpetually and jiggle forever, but each state's TEACHING beat is a
    // one-shot cue that then holds — the arrows appear, the shared pair slides to
    // the electronegative end, the resultant resolves, a substitution breaks the
    // symmetry. Pin the frozen frame PAST the LAST authored cue so THE EYE
    // photographs the SETTLED picture, never a mid-slide frame. EVERY cue time the
    // block carries contributes a candidate, so a state that adds a beat cannot
    // silently keep an older pin. The renderer is accumulator-free (spin angle and
    // index-derived jiggle phase included, D-1), so the snap-to-pin capture is
    // byte-identical to crawling there. The explore sandbox (mode 'explore') is
    // user-driven — classified interactive below, never pinned here.
    const bscState = asObj(state.bonding_scene);
    if (bscState) {
        const bscPush = (v: unknown, extra: number) => { if (typeof v === 'number') candidates.push(v + extra); };
        bscPush(bscState.spin_start_ms, 1200);
        bscPush(bscState.arrows_at_ms, 900);
        bscPush(bscState.resultant_at_ms, 900);
        bscPush(bscState.charges_at_ms, 900);
        bscPush(bscState.pair_shift_at_ms, 1200);
        // E1c-A: the compare swap pins past its OWN duration, not past a flat
        // +1500. bond_polarity S7 authors a deliberately slow 7300 ms NH3 -> NF3
        // transformation (the hardest single idea in its arc, played out under
        // the narration that explains it), and a flat offset pinned the frozen
        // frame at 10700 ms — mid-swap, i.e. a baseline of a molecule caught
        // half-way between two species, which is exactly the self-contradictory
        // pin the block above exists to prevent. Reads its sibling the way
        // approach_at_ms / angle_at_ms / transfer.at_ms already do; the 1500
        // default is the previous behaviour for a state that authors no duration.
        if (typeof bscState.compare_at_ms === 'number') {
            candidates.push(asNum(bscState.compare_at_ms, 0) +
                (typeof bscState.compare_duration_ms === 'number'
                    ? asNum(bscState.compare_duration_ms, 1500) + 600 : 1500));
        }
        // E1c: the SCRIPTED BEND (angle_from -> angle_deg over angle_ramp_ms from
        // angle_at_ms). Registered in the same change as the renderer cue, the
        // standing new-scenario rule: a state that ramps an angle with no later
        // reveal cue would otherwise pin at DEFAULT_REVEAL_MS = 1500 ms, i.e.
        // mid-bend, and mint a self-contradictory baseline. Reads its own duration
        // the way approach_at_ms / assemble_at_ms already do, so the pin lands past
        // the SETTLED shape, never inside the transition.
        if (typeof bscState.angle_at_ms === 'number') {
            candidates.push(asNum(bscState.angle_at_ms, 0) + asNum(bscState.angle_ramp_ms, 1600) + 600);
        }
        // E2b: the SCRIPTED HEAT (thermal.T_from -> thermal.T_K over T_ramp_ms
        // from T_at_ms), the exact twin of the scripted bend above and registered
        // in the same change as the renderer cue for the same reason — a state
        // that ramps the temperature with no later reveal cue would otherwise pin
        // at DEFAULT_REVEAL_MS = 1500 ms, i.e. mid-ramp, and mint a
        // self-contradictory baseline (a caption about a heated network over a
        // frame of a half-heated one). The 2000 ms default is BS_T_RAMP_MS in the
        // renderer; the two must stay equal.
        const bscTh2 = asObj(bscState.thermal);
        if (bscTh2 && typeof bscTh2.T_at_ms === 'number') {
            candidates.push(asNum(bscTh2.T_at_ms, 0) + asNum(bscTh2.T_ramp_ms, 2000) + 600);
        }
        // assemble_at_ms / assemble_duration_ms were REMOVED here by E1c-A, and the
        // removal is the decision, not an oversight. E1c-C's cue audit found them
        // registered as pin candidates with NO bonding_scene code reading them (the
        // renderer's only *_at_ms hits for "assemble" belong to molecular_geometry),
        // i.e. the sigma-pi decorative-string defect: a cue key that gates nothing
        // while a second file treats it as real. Mode 'assemble' is live and has its
        // own solved camera, but its actual beats are already cued — the shared-pair
        // slide (pair_shift_at_ms), the approach (approach_at_ms) and the three
        // dipole layers — and no concept authors assemble_at_ms. Implementing a ramp
        // nothing asks for would invent a capability; registering a pin for a ramp
        // that does not exist misreports the settled frame. If E2/E3b ever scripts
        // an assemble ramp it registers the key IN THE SAME CHANGE as the renderer
        // read, which is the rule check:bonding-scene already enforces.
        // E2/E3 cue times, derived here so those dispatches need no meta edit.
        if (typeof bscState.approach_at_ms === 'number') {
            candidates.push(asNum(bscState.approach_at_ms, 0) + asNum(bscState.approach_duration_ms, 2400) + 600);
        }
        const bscTr = asObj(bscState.transfer);
        if (bscTr && typeof bscTr.at_ms === 'number') {
            candidates.push(asNum(bscTr.at_ms, 0) + asNum(bscTr.duration_ms, 2000) + 600);
        }
        const bscSh = asObj(bscState.shift);
        if (bscSh && typeof bscSh.at_ms === 'number') {
            candidates.push(asNum(bscSh.at_ms, 0) + asNum(bscSh.duration_ms, 2000) + 700);
        }
        const bscLat = asObj(bscState.lattice);
        if (bscLat) {
            if (typeof bscLat.grow_at_ms === 'number') {
                candidates.push(asNum(bscLat.grow_at_ms, 0) + asNum(bscLat.grow_duration_ms, 3000) + 600);
            }
            if (typeof bscLat.reveal_at_ms === 'number') candidates.push(asNum(bscLat.reveal_at_ms, 0) + 1200);
        }
    }
    // orbital_shapes (ATOMIC ORBITALS — CHEMISTRY, 2026-07-28 engine ask): every
    // beat is a one-shot closed-form ramp over the state's own clock that then
    // HOLDS — the believed orbit dissolves while the measurement dots accumulate,
    // the 90% boundary fades in over the finished swarm, a lobe extrudes along
    // its axis, the probe plane sweeps lobe-to-lobe through the node, the three
    // p orbitals are stamped on one axis at a time, the clover blooms between the
    // axes, the 2s cutaway slab closes to expose the hidden node shell, the
    // gallery swaps 1s → 2s → 2p → 3d. Pin the frozen frame PAST the last
    // payoff so THE EYE photographs the SETTLED picture (a full cloud, a closed
    // slab, the last gallery member), never a half-drawn stipple. The renderer is
    // accumulator-free (seeded dot table, closed-form spin), so the snap-to-pin
    // capture is byte-identical to crawling there. The explore sandbox
    // (mode 'explore') is user-driven — classified interactive below, not pinned.
    const osState = asObj(state.orbital_shapes);
    if (osState) {
        const push = (v: unknown, extra = 600) => { if (typeof v === 'number') candidates.push(v + extra); };
        // the stipple completes at stipple_at + target * per_dot (the swarm IS
        // the reveal — a pin before that photographs a half-built cloud).
        if (typeof osState.stipple_at_ms === 'number') {
            candidates.push(asNum(osState.stipple_at_ms, 0)
                + asNum(osState.dot_target, 1200) * asNum(osState.per_dot_ms, 3) + 700);
        }
        if (typeof osState.dissolve_at_ms === 'number') {
            candidates.push(asNum(osState.dissolve_at_ms, 0) + asNum(osState.dissolve_duration_ms, 2500) + 600);
        }
        push(osState.surface_at_ms, 1100);          // 900 ms opacity ramp + a beat
        if (typeof osState.extrude_at_ms === 'number') {
            candidates.push(asNum(osState.extrude_at_ms, 0) + asNum(osState.extrude_duration_ms, 2400) + 600);
        }
        if (typeof osState.bloom_at_ms === 'number') {
            // bloom_offsets_ms staggers each member's own window, so the set does
            // not settle until the LAST member's window closes. Without this the
            // derived settle is the first member's, which under-reports a staggered
            // assemble by the whole stagger span — and would pin THE EYE's frozen
            // frame mid-assembly, on a state whose caption counts the finished set.
            const offs = Array.isArray(osState.bloom_offsets_ms) ? (osState.bloom_offsets_ms as unknown[]) : [];
            const maxOff = offs.reduce<number>((m, v) => Math.max(m, asNum(v, 0)), 0);
            candidates.push(asNum(osState.bloom_at_ms, 0) + maxOff + asNum(osState.bloom_duration_ms, 2400) + 600);
        }
        if (typeof osState.grow_at_ms === 'number') {
            candidates.push(asNum(osState.grow_at_ms, 0) + asNum(osState.grow_duration_ms, 1800) + 600);
        }
        if (typeof osState.cutaway_at_ms === 'number') {
            candidates.push(asNum(osState.cutaway_at_ms, 0) + asNum(osState.cutaway_duration_ms, 2200) + 700);
        }
        const probeAuto = asObj(osState.probe_auto);
        if (probeAuto && typeof probeAuto.at_ms === 'number') {
            candidates.push(asNum(probeAuto.at_ms, 0) + asNum(probeAuto.duration_ms, 4000) + 600);
        }
        // z_ramp (EFFECTIVE NUCLEAR CHARGE): Z_eff sweeps and the WHOLE atom
        // contracts to 1/Z with it — the boundary surface, the dot cloud, the node
        // shell and the pm radius readout all move together. Same shape as the
        // ramps above (a one-shot closed-form sweep that then HOLDS) and the same
        // failure if unpinned: THE EYE would photograph a half-contracted atom
        // beside a radius its state's caption contradicts. No shipped concept
        // authors z_ramp, so adding it moves no baseline.
        const osZRamp = asObj(osState.z_ramp);
        if (osZRamp && typeof osZRamp.at_ms === 'number') {
            candidates.push(asNum(osZRamp.at_ms, 0) + asNum(osZRamp.duration_ms, 2600) + 600);
        }
        // morph (HYBRIDISATION, #13): the s-character ramp. It is a one-shot
        // closed-form ramp that then HOLDS, exactly like extrude/bloom above — the
        // dumbbell becomes a hybrid, or the pair's angle opens 90° → 180° — so the
        // frozen frame must be pinned PAST it or THE EYE photographs a half-morphed
        // shape whose live angle readout disagrees with the state's own caption.
        // No shipped concept authors `morph`, so adding it moves no baseline.
        const osMorph = asObj(osState.morph);
        if (osMorph && typeof osMorph.at_ms === 'number') {
            candidates.push(asNum(osMorph.at_ms, 0) + asNum(osMorph.duration_ms, 2600) + 600);
        }
        // mo (SIGMA/PI BONDING, #17): the TORSION ramp — one atom's p orbital
        // turns about the bond axis while the constructive-overlap region shrinks
        // and the live overlap readout falls to 0.000 at 90°. Same shape as morph
        // (a one-shot closed-form ramp off a precomputed ladder that then HOLDS),
        // and the same failure if unpinned: THE EYE would photograph a
        // half-twisted picture beside a readout the state's caption contradicts.
        // Also pins the MO surface's own reveal fade. No shipped concept authors
        // an `mo` block, so adding these moves no baseline.
        const osMo = asObj(osState.mo);
        if (osMo) {
            const osTwist = asObj(osMo.twist_ramp);
            if (osTwist && typeof osTwist.at_ms === 'number') {
                candidates.push(asNum(osTwist.at_ms, 0) + asNum(osTwist.duration_ms, 3000) + 600);
            }
            if (typeof osMo.reveal_at_ms === 'number') {
                candidates.push(asNum(osMo.reveal_at_ms, 0) + asNum(osMo.reveal_duration_ms, 1200) + 600);
            }
            // approach (S2/S5): the two atoms travel together, hold for a readable
            // beat, then cross-fade to the fused MO surface. The settled picture is
            // only reached at the END of that cross-fade — pinning any earlier
            // photographs a half-faded frame showing BOTH the separate atoms and
            // the finished bond, which is the one composition this beat exists to
            // avoid ever presenting as true.
            const osAppr = asObj(osMo.approach);
            if (osAppr && typeof osAppr.at_ms === 'number') {
                candidates.push(asNum(osAppr.at_ms, 0) + asNum(osAppr.duration_ms, 2600)
                    + asNum(osAppr.settle_ms, 600) + asNum(osAppr.fade_ms, 900) + 600);
            }
            // STAGED REVEALS (2026-07-29 audit round). The engine gained explicit
            // per-member timing so that S4/S7/S8 could stop being byte-static, and
            // this derivation did not learn them the same day — so the frozen pin
            // would have photographed each of those states BEFORE its newly
            // authored motion settled, and the re-captured baselines would have
            // locked half-built scenes as the approved picture. Exactly the gap
            // the hybrid path solved with `bloom_offsets_ms` and never ported.
            // The settle time is the LAST member's offset plus its own duration,
            // because a stagger is only finished when its slowest element is.
            const lastOffset = (v: unknown, fallback: number): number => {
                const arr = Array.isArray(v) ? (v as unknown[]) : null;
                if (!arr || arr.length === 0) return fallback;
                return arr.reduce<number>((mx, o) => Math.max(mx, asNum(o, 0)), 0);
            };
            if (Array.isArray(osMo.reveal_offsets_ms)) {
                candidates.push(asNum(osMo.reveal_at_ms, 0)
                    + lastOffset(osMo.reveal_offsets_ms, 0)
                    + asNum(osMo.reveal_duration_ms, 1200) + 600);
            }
            if (Array.isArray(osMo.system_offsets_ms)) {
                candidates.push(asNum(osMo.reveal_at_ms, 0)
                    + lastOffset(osMo.system_offsets_ms, 0)
                    + asNum(osMo.reveal_duration_ms, 1200) + 600);
            }
            if (typeof osMo.atomic_reveal_at_ms === 'number'
                || Array.isArray(osMo.atomic_offsets_ms)) {
                candidates.push(asNum(osMo.atomic_reveal_at_ms, 0)
                    + lastOffset(osMo.atomic_offsets_ms, 0)
                    + asNum(osMo.atomic_duration_ms, 1200) + 600);
            }
        }
        // bond_sticks (2026-07-29): the Rule-16a belief picture. It is NOT under
        // `mo` — it is deliberately outside the MO gate so Lewis/VSEPR concepts
        // can draw rods with no MO build, so it must be read at the state level.
        // The settled picture is after the DISSOLVE, not after the fade-in: the
        // whole point of the beat is that the wrong picture leads and CLEARS.
        const osSticks = asObj(osState.bond_sticks);
        if (osSticks) {
            if (typeof osSticks.dissolve_at_ms === 'number') {
                candidates.push(asNum(osSticks.dissolve_at_ms, 0)
                    + asNum(osSticks.dissolve_duration_ms, 1500) + 600);
            } else if (typeof osSticks.at_ms === 'number') {
                candidates.push(asNum(osSticks.at_ms, 0) + asNum(osSticks.fade_in_ms, 900) + 600);
            }
        }
        // element_steps / charge_steps (ELEMENT IDENTITY + ION CHARGE): the same
        // stepped shape as gallery_steps, and the same failure if unpinned. Each
        // step swaps the atom (or its charge), and BOTH the geometry and every
        // derived readout — the Slater Z_eff, the pm radius, the configuration —
        // move with it, so a pin before the last step photographs one element
        // beside another element's numbers. No shipped concept authors either key,
        // so adding them moves no baseline.
        // ghost_species (THE HELD "BEFORE" PICTURE): each step swaps the species
        // the GHOST holds, and the held boundary draws at THAT species' own Z_eff
        // — so a pin before the last step photographs the wrong "before" beside
        // the right "after", which is the one comparison these states exist to
        // make. Same stepped shape as the four above, same 900 ms settle. No
        // shipped concept authors it, so adding it moves no baseline.
        for (const key of ['populate_steps', 'gallery_steps', 'element_steps', 'charge_steps', 'ghost_species']) {
            const steps = Array.isArray(osState[key]) ? (osState[key] as unknown[]) : [];
            for (const rawStep of steps) {
                const step = asObj(rawStep);
                if (step) candidates.push(asNum(step.at_ms, 0) + 900);
            }
        }
    }
    // em_wave_propagation (traveling transverse EM wave — Ch.8 §8.3): the trains
    // move perpetually, but the STATE's one-shot cues (motes vanish → the "no
    // change" chip pins, the pulse reaches the receiver and the needle kicks) land
    // then HOLD. Pin the frozen frame PAST each cue so THE EYE's __frozen.png shows
    // the settled reveal — the vanished motes + pinned chip (S3), the delivered
    // needle-kick (S1) — the recurrence check for the OPEN scar
    // field3d_scene_composition_annotation_silent_noop (these cues are scenario
    // elements, so they must paint). Accumulator-free (pure fn of state-local t),
    // so the snap-to-pin capture is byte-identical to crawling there.
    const emwState = asObj(state.em_wave);
    if (emwState) {
        const push = (v: unknown, extra = 600) => { if (typeof v === 'number') candidates.push(v + extra); };
        push(emwState.motes_vanish_at_ms, 1000);   // past the ~800 ms fade + a beat
        push(emwState.nochange_at_ms, 700);
        push(emwState.needle_kick_at_ms, 500);
        push(emwState.source_off_at_ms, 1200);
        // increment-2 per-state one-shots: pin the frozen frame PAST each state's
        // LAST settled payoff (scar #5 — never mid-transition) so THE EYE's
        // __frozen.png photographs the settled reveal.
        push(emwState.relay_at_ms, 2000);          // S2: past the first hand-off cycle
        push(emwState.trough_at_ms, 1000);         // S4: past the trough re-sweep
        push(emwState.camera_back_at_ms, 800);     // S4: camera settled home
        push(emwState.match_at_ms, 900);           // S6: the MATCH chip pinned
        push(emwState.gate_b_at_ms, 600);          // S6: gate B ticked, Δt held
        push(emwState.ghost_dissolve_at_ms, 1200); // S5: ghost dissolved, in-phase pose held
        push(emwState.bunch_at_ms, 900);           // S10: crests fully bunched
        push(emwState.slab_slide_at_ms, 1000);     // S10: slab settled in
        // S9 formula-chain derivation: three recall links dock in turn under the
        // GIVEN E_y, then the assembled B_z line lights (renderer emw_formula chain,
        // ~L31440). The pin must land PAST the LAST payoff (assembled) — scar #5,
        // never mid-transition — else it falls back to DEFAULT_REVEAL_MS ≈ 1500 and
        // photographs only E_y with no links docked. +2000 on assembled_at_ms lands
        // at 18000 ms, matching the verified-correct STATE_9 dense_t18000 capture.
        push(emwState.link1_at_ms, 600);           // S9: direction ẑ link docked
        push(emwState.link2_at_ms, 600);           // S9: same-phase link docked
        push(emwState.link3_at_ms, 600);           // S9: amplitude E₀/c link docked
        push(emwState.assembled_at_ms, 2000);      // S9: B_z assembled line settled
    }
    // rhr_force_direction: the DIRECTION-ONLY F = qv×B sibling. Its reveal beats
    // are one-shot timed gestures that then HOLD still — pin the frozen frame
    // past each payoff so the capture photographs the completed reveal, and so
    // deriveHoldExpectations marks the non-moving, non-slider states reveal_hold
    // (D7/D1p would otherwise false-fail on the static tail). Beats:
    //   • f_appear_at_ms        — STATE_1's sideways F pop-in (then it holds).
    //   • show_hand             — STATE_2's v→B→F curl reveal (one 9s cycle).
    //   • camera_orbit_*        — STATE_3's ~30° orbit settles then holds.
    //   • glyph_toggle_at_ms    — STATE_5's ⊗↔⊙ flip (F reverses, then holds).
    //   • show_right_angle_marks / show_ghost_f — short marks that hold.
    const rhr = asObj(state.rhr);
    if (rhr) {
        if (typeof rhr.f_appear_at_ms === 'number') {
            candidates.push(asNum(rhr.f_appear_at_ms, 0) + asNum(rhr.f_appear_fade_ms, 600) + 500);
        }
        if (rhr.show_hand === true) {
            // One full v→B→F hand-curl cycle is 9s in the renderer; pin past it
            // so the frozen frame shows the thumb-along-F payoff, not mid-curl.
            candidates.push(9000);
        }
        if (typeof rhr.camera_orbit_deg === 'number' && rhr.camera_orbit_deg !== 0) {
            candidates.push(asNum(rhr.camera_orbit_duration_ms, 4000) + 500);
        }
        if (typeof rhr.glyph_toggle_at_ms === 'number' && rhr.glyph_toggle_at_ms > 0) {
            candidates.push(asNum(rhr.glyph_toggle_at_ms, 0) + 800);
        }
        if (rhr.show_ghost_f === true) {
            candidates.push(asNum(rhr.ghost_f_fade_ms, 1400) + 300);
        }
        if (rhr.show_right_angle_marks === true) {
            candidates.push(2000);   // marks are drawn ~immediately, then hold
        }
    }
    // magnetic_no_work: the DIRECTION + NO-WORK sibling (F ⊥ v ⇒ W = 0 ⇒ |v|
    // constant). Its reveal beats are one-shot timed gestures + meter/split
    // launches that then HOLD (the orbit keeps moving, but the TEACHING payload —
    // the F arrow, the d-nub + W=0 callout, the |v|/W meters, the split panels —
    // is revealed once and then steady). Pin the frozen frame past each payoff so
    // THE EYE photographs the completed reveal, and so deriveHoldExpectations
    // marks the non-slider, non-continuously-moving states reveal_hold. Beats:
    //   • f_appear_at_ms       — STATE_1/2 F pop-in (then it holds ⊥ to v).
    //   • predict_reveal_at_ms — STATE_2/4 predict-then-reveal beat.
    //   • show_displacement_d  — STATE_3 d-nub + "W = F·d·cos90° = 0" callout.
    //   • show_speed_meter     — STATE_4 |v| meter appears (holds flat).
    //   • split_compare        — STATE_5 split panels fade in, then the contrast
    //                            runs (electric speeds up / magnetic steers).
    const nw = asObj(state.no_work);
    if (nw) {
        if (typeof nw.f_appear_at_ms === 'number') {
            candidates.push(asNum(nw.f_appear_at_ms, 0) + asNum(nw.f_appear_fade_ms, 600) + 500);
        }
        if (typeof nw.predict_reveal_at_ms === 'number' && nw.predict_reveal_at_ms > 0) {
            candidates.push(asNum(nw.predict_reveal_at_ms, 0) + 800);
        }
        if (nw.show_displacement_d === true) {
            candidates.push(2000);   // d-nub + W=0 callout draw ~immediately, then hold
        }
        if (nw.show_speed_meter === true) {
            candidates.push(2500);   // |v| meter appears + holds dead-flat for a beat
        }
        // STATE_4 velocity compass: six ghost v-arrows freeze at one full orbit
        // (velocity_compass_at_ms) then HOLD — pin past the deploy so THE EYE
        // photographs all six equal arrows (the |v| = const proof).
        if (typeof nw.velocity_compass_at_ms === 'number') {
            candidates.push(asNum(nw.velocity_compass_at_ms, 8500) + 800);
        }
        const split = asObj(nw.split_compare);
        if (split) {
            // Both panels fade in at reveal_at_ms (+600 fade); give the contrast a
            // few seconds so the captured frame shows the electric side already
            // speeding up + the magnetic side still steering at constant speed.
            candidates.push(asNum(split.reveal_at_ms, 0) + 600 + 3500);
            // SEQUENTIAL reveal: the magnetic side appears later, at
            // sequential_delay_ms (it stays hidden while the teacher explains the
            // electric side first). Pin past its fade + a few seconds of orbit so
            // the captured frame shows BOTH the electric side speeding up AND the
            // magnetic side steering at constant speed.
            if (typeof split.sequential_delay_ms === 'number') {
                candidates.push(asNum(split.sequential_delay_ms, 5500) + 600 + 4000);
            }
        }
    }
    // radius_in_uniform_field: the RADIUS-ONLY sibling (r = mv/qB). The orbit
    // moves continuously (trajectory_mode: 'circle' → caught by the strict motion
    // gate elsewhere), but the TEACHING payload is a set of one-shot timed reveals
    // that then HOLD — pin the frozen frame past each payoff so THE EYE photographs
    // the completed reveal, and so deriveHoldExpectations marks the non-slider,
    // non-continuously-moving states reveal_hold (D7/D1p would otherwise false-fail
    // on a static tail; for the circle states the strict motion gate runs). Beats:
    //   • circle_close_at_ms      — STATE_1 trail snaps shut + flash, then holds.
    //   • equation_rearrange_at_ms— STATE_3 panel writes qvB=mv²/r → r=mv/qB (holds).
    //   • ghost_compare(_b).reveal_at_ms — STATE_4/5 ghost freezes + the live circle
    //                              ramps over GHOST_RAMP_MS (1400) past/inside it.
    const rad = asObj(state.radius);
    if (rad) {
        const RAD_GHOST_RAMP = 1400;   // mirror updateRadiusInUniformFieldFrame.
        if (typeof rad.circle_close_at_ms === 'number') {
            candidates.push(asNum(rad.circle_close_at_ms, 4500) + 1200);   // flash decays ~1.1s.
        }
        if (typeof rad.equation_rearrange_at_ms === 'number') {
            candidates.push(asNum(rad.equation_rearrange_at_ms, 6500) + 800);
        }
        const gcA = asObj(rad.ghost_compare);
        if (gcA && typeof gcA.reveal_at_ms === 'number') {
            candidates.push(asNum(gcA.reveal_at_ms, 5000) + RAD_GHOST_RAMP + 600);
        }
        const gcB = asObj(rad.ghost_compare_b);
        if (gcB && typeof gcB.reveal_at_ms === 'number') {
            candidates.push(asNum(gcB.reveal_at_ms, 11000) + RAD_GHOST_RAMP + 600);
        }
    }
    // helix_in_uniform_field: the HELIX sibling (helical_motion_charge_in_uniform_B).
    // The coil moves continuously (trajectory_mode helix/circle/straight → strict
    // motion gate elsewhere; the S5/S6 show_sliders states classify interactive in
    // deriveHoldExpectations), but the TEACHING payload is one-shot timed reveals that
    // then HOLD — pin the frozen frame past each so THE EYE photographs the completed
    // reveal. Beats (mirrors the sibling's `radius` block): ghost_flat_circle_at_ms
    // (S1 the coil lifts off), v_decompose_at_ms (S2 v splits into v∥+v⊥), the
    // isolate_perp/isolate_par fade END (S3 collapse to flat circle / S4 straight
    // drift), radius_reveal_at_ms (S3 radius line + bar), pitch_bracket_at_ms (S5).
    const hlx = asObj(state.helix);
    if (hlx) {
        if (typeof hlx.ghost_flat_circle_at_ms === 'number') candidates.push(asNum(hlx.ghost_flat_circle_at_ms, 2500) + 800);
        if (typeof hlx.v_decompose_at_ms === 'number') candidates.push(asNum(hlx.v_decompose_at_ms, 2000) + 800);
        if (typeof hlx.radius_reveal_at_ms === 'number') candidates.push(asNum(hlx.radius_reveal_at_ms, 3000) + 800);
        if (typeof hlx.pitch_bracket_at_ms === 'number') candidates.push(asNum(hlx.pitch_bracket_at_ms, 1500) + 800);
    }
    const iperp = asObj(state.isolate_perp);
    if (iperp) candidates.push(asNum(iperp.fade_start_ms, 1500) + asNum(iperp.fade_duration_ms, 1500) + 700);
    const ipar = asObj(state.isolate_par);
    if (ipar) candidates.push(asNum(ipar.fade_start_ms, 1500) + asNum(ipar.fade_duration_ms, 1500) + 700);
    // cyclotron_period: the PERIOD-ONLY sibling that INVERTS radius_in_uniform_field
    // (a shared ω makes differing-radius charges tie). The orbit moves continuously
    // (trajectory_mode: 'circle' → strict motion gate), but the TEACHING payload is
    // a set of one-shot timed reveals that then HOLD — pin the frozen frame past
    // each payoff so THE EYE photographs the completed reveal, and so the slider
    // state classifies interactive (handled in deriveHoldExpectations via
    // show_sliders). Beats:
    //   • timer_freeze_at_ms / circle_close_at_ms — STATE_1 lap-timer freezes +
    //     relabels T, trail snaps shut + flash, then holds.
    //   • tie_badge_at_ms      — STATE_2 both lap-timers freeze the same instant +
    //     the "= same T" badge writes (the tie payoff), then holds.
    //   • equation_build.*_at_ms — STATE_3 panel builds T=2πr/v → r=mv/qB →
    //     T=2π(mv/qB)/v → (v cancels) → T=2πm/qB · f=qB/2πm (each line persists).
    const cyc = asObj(state.cyclotron);
    if (cyc) {
        if (typeof cyc.timer_freeze_at_ms === 'number') {
            candidates.push(asNum(cyc.timer_freeze_at_ms, 7000) + 1200);   // flash decays ~1.1s.
        }
        if (typeof cyc.circle_close_at_ms === 'number') {
            candidates.push(asNum(cyc.circle_close_at_ms, 7000) + 1200);
        }
        if (typeof cyc.tie_badge_at_ms === 'number') {
            candidates.push(asNum(cyc.tie_badge_at_ms, 8000) + 800);
        }
        const eb = asObj(cyc.equation_build);
        if (eb) {
            // The aside (f = qB/2πm) is the LAST line; pin past it.
            candidates.push(asNum(eb.aside_f_at_ms, 16000) + 800);
            candidates.push(asNum(eb.line4_at_ms, 13000) + 800);
        }
    }
    // amperes_circuital_law: the ∮B·dl = μ₀ I_enc scenario on a long straight
    // wire. Its per-state acl_element beats — the loop draw-in, the dl march, the
    // B·dl tile accumulation, the curve→bar UNROLL, the 2πr ruler, and the
    // "= μ₀ I_enc" equality — are timed reveals; the accumulate/unroll/equality
    // beats then HOLD at end pose (the bar/ring/equation rows PERSIST, never fade
    // to 0). Pin the frozen frame past each payoff so THE EYE photographs the
    // completed reveal, and so deriveHoldExpectations marks the non-slider result
    // states reveal_hold (D7/D1p are otherwise false-failed by the static tail).
    // Defaults MUST match the renderer's asNum/`typeof === "number"` fallbacks.
    const acl = asObj(state.acl_element);
    if (acl) {
        const nSeg = asNum(acl.num_segments, 24);
        // loop draw-in (acl_loop grows over ~700ms).
        if (typeof acl.loop_appear_at_ms === 'number') {
            candidates.push(asNum(acl.loop_appear_at_ms, 1200) + 700);
        }
        // tile accumulation: last tile = accumulate_at_ms + (N-1)·stagger + fade.
        if (acl.show_circulation_accumulation === true || acl.mode === 'accumulate' || acl.mode === 'unroll') {
            candidates.push(
                asNum(acl.accumulate_at_ms, 2000)
                + Math.max(0, nSeg - 1) * asNum(acl.accumulate_stagger_ms, 120)
                + asNum(acl.accumulate_fade_ms, 300),
            );
        }
        // curve→bar unroll completes at unroll_at_ms + unroll_duration_ms (+500).
        if (acl.mode === 'unroll' || acl.mode === 'integrated') {
            candidates.push(asNum(acl.unroll_at_ms, 2000) + asNum(acl.unroll_duration_ms, 2200) + 500);
        }
        // the 2πr ruler reveal (+600 grow).
        if (typeof acl.ruler_reveal_at_ms === 'number') {
            candidates.push(asNum(acl.ruler_reveal_at_ms, 1800) + 600);
        }
        // the "= μ₀ I_enc" equality snap + the STATE_7 divide-by-2πr collapse.
        // The 2D stage's divide beat (strike 2πr, collapse the bar to "B = …")
        // runs from ienc_reveal_at_ms+600 over ~1600ms — pin past its completion
        // (+2400) so THE EYE photographs the isolated-B result, not mid-cancel.
        if (typeof acl.ienc_reveal_at_ms === 'number') {
            candidates.push(asNum(acl.ienc_reveal_at_ms, 1500) + (acl.show_ienc === true && acl.mode === 'unroll' ? 2400 : 800));
        }
    }
    const pt = asObj(state.per_turn_field_circles);
    if (isEnabled(pt) && pt) {
        candidates.push(
            asNum(pt.reveal_at_ms, F3D.ptReveal)
            + Math.max(0, coilTurns - 1) * asNum(pt.reveal_stagger_ms, F3D.ptStagger)
            + asNum(pt.reveal_fade_ms, F3D.ptFade),
        );
    }
    const rc = asObj(state.radial_cancellation_arrows);
    if (isEnabled(rc) && rc) {
        candidates.push(asNum(rc.reveal_at_ms, F3D.rcReveal) + asNum(rc.fade_in_duration_ms, F3D.rcFade));
    }
    const ax = asObj(state.axial_buildup_arrows);
    if (isEnabled(ax) && ax) {
        candidates.push(asNum(ax.reveal_at_ms, F3D.axReveal) + asNum(ax.arise_duration_ms, F3D.axArise));
    }
    // magnetic_field_circular_loop: the B = μ₀NI/2R derivation diamond. Its per-
    // state `extras` drive one-shot timed reveals — the single dB on S2
    // (db_reveal_at_ms), the round-the-ring dB STACK on S3 (db_stack), the
    // bundle→B merge + wire-vs-loop compare on S4 (merge_to_B_at_ms / wire_compare),
    // the grip-rule + current-flip on S5 (flip_at_ms), and a coordinated z-sweep
    // that SETTLES on S6 (sweep_z) — all then HOLD their end pose. Pin the frozen
    // frame past each payoff so THE EYE photographs the completed reveal and
    // deriveHoldExpectations marks S2–S6 reveal_hold (D7/D1p are otherwise false-
    // failed by the static tail). S1 (current dots) needs no pin; S7 is the slider
    // explorer (show_sliders → interactive). Keys mirror the renderer's extras.
    const clx = asObj(state.extras);
    if (clx) {
        if (typeof clx.db_reveal_at_ms === 'number') {
            candidates.push(asNum(clx.db_reveal_at_ms, 9500) + 800);
        }
        const dbStack = asObj(clx.db_stack);
        if (isEnabled(dbStack) && dbStack) {
            candidates.push(
                asNum(dbStack.reveal_at_ms, 8000)
                + Math.max(0, asNum(dbStack.num_elements, 12) - 1) * asNum(dbStack.reveal_stagger_ms, 300)
                + 600,
            );
        }
        if (typeof clx.merge_to_B_at_ms === 'number') {
            candidates.push(asNum(clx.merge_to_B_at_ms, 1500) + 900 + 300);
        }
        const clWire = asObj(clx.wire_compare);
        if (clWire && typeof clWire.reveal_at_ms === 'number') {
            candidates.push(asNum(clWire.reveal_at_ms, 6000) + 800);
        }
        if (typeof clx.flip_at_ms === 'number') {
            candidates.push(asNum(clx.flip_at_ms, 9000) + 1200);
        }
        const clSweep = asObj(clx.sweep_z);
        if (isEnabled(clSweep) && clSweep) {
            candidates.push(asNum(clSweep.reveal_at_ms, 4000) + asNum(clSweep.period_s, 6) * 1000 + 600);
        }
    }

    // biot_savart_law: accumulate_mode:'sequence' assembles the field circle
    // element-by-element over num_elements (STATE_7 the full-assembly aha,
    // STATE_8 the sinθ/r²-weighted variant) — pin the frozen frame past full
    // assembly so THE EYE / visual:approve never captures the empty
    // pre-assembly frame (docs/notes/biot_savart_law-engine-fix-spec.md Finding 1).
    const be = asObj(state.biot_element);
    if (be && be.accumulate_mode === 'sequence') {
        const n = asNum(be.num_elements, 9);
        candidates.push(
            asNum(be.reveal_at_ms, 1500)
            + Math.max(0, n - 1) * asNum(be.reveal_stagger_ms, 350)
            + asNum(be.reveal_fade_ms, 400)
            + 800,
        );
    }

    // moving_coil_galvanometer: the φ = N I A B / k diamond. Per-state `extras`
    // drive one-shot timed choreography that then HOLDS its end pose — the small
    // turn + force/ΣF=0 + τ grow on S2 (phi_target_deg / deflect), the crowded-scale
    // current ladder on S3 (current_step + crowded_scale), the straight→radial field
    // morph + pole reshape on S4 (radial_morph), the hairspring + restoring-τ on S5
    // (spring), the damped settle-to-φ_eq on S6 (settle_phi), the uniform-scale
    // current ladder on S7 (current_step), and the sensitivity sweep on S8
    // (sensitivity_sweep). Pin the frozen frame past each payoff so THE EYE
    // photographs the completed pose and deriveHoldExpectations marks S2–S8
    // reveal_hold (D7/D1 are otherwise false-failed by the post-choreography static
    // tail). S1 (current dots, φ=0) declares no reveal → undefined (the marching
    // dots provide live motion). S9 is the slider explorer (show_sliders →
    // interactive). Keys mirror the renderer's per-state extras.
    const mcgx = asObj(state.extras);
    if (typeof state.phi_target_deg === 'number' && state.phi_target_deg !== 0) {
        const dfl = mcgx ? asObj(mcgx.deflect) : null;
        candidates.push((dfl ? asNum(dfl.at_ms, 0) : 0) + (dfl ? asNum(dfl.duration_ms, 1500) : 1500) + 300);
    }
    if (mcgx) {
        const mcs = asObj(mcgx.current_step);
        if (isEnabled(mcs) && mcs) {
            candidates.push(asNum(mcs.start_at_ms, 800) + (asNum(mcs.steps, 3) + 1) * asNum(mcs.step_interval_ms, 1200) + 400);
        }
        const mrm = asObj(mcgx.radial_morph);
        if (isEnabled(mrm) && mrm) {
            candidates.push(asNum(mrm.at_ms, 600) + asNum(mrm.duration_ms, 1200) + 400);
        }
        const mspr = asObj(mcgx.spring);
        if (isEnabled(mspr) && mspr) {
            candidates.push(asNum(mspr.at_ms, 400) + asNum(mspr.duration_ms, 1500) + 300);
        }
        const mstl = asObj(mcgx.settle_phi);
        if (isEnabled(mstl) && mstl) {
            candidates.push(asNum(mstl.at_ms, 300) + asNum(mstl.duration_ms, 1800) + 600);
        }
        const mssw = asObj(mcgx.sensitivity_sweep);
        if (isEnabled(mssw) && mssw) {
            candidates.push(asNum(mssw.at_ms, 500) + asNum(mssw.duration_ms, 2500) + 400);
        }
    }

    // galvanometer_to_ammeter_voltmeter: the ammeter/voltmeter assembly diamond.
    // STATE_5 cross-fades G ‖ shunt into an "A" meter box (assemble_ammeter) and
    // STATE_7 fades G + R into a "V" box (assemble_voltmeter), each ~1.5s after a
    // late at_ms (8000–9000ms). Pin the frozen frame past the merge so THE EYE
    // photographs the COMPLETED meter box, not the pre-assembly picture — without
    // this the DEFAULT_REVEAL_MS fallback (1500ms) captures long before the assemble
    // fires. The other states are dot-stream watch beats; S4/S6/S9 are show_sliders.
    const gavx = asObj(state.extras);
    if (gavx) {
        const gAmm = asObj(gavx.assemble_ammeter);
        if (isEnabled(gAmm) && gAmm) {
            candidates.push(asNum(gAmm.at_ms, 9000) + asNum(gAmm.duration_ms, 1500) + 400);
        }
        const gVolt = asObj(gavx.assemble_voltmeter);
        if (isEnabled(gVolt) && gVolt) {
            candidates.push(asNum(gVolt.at_ms, 8000) + asNum(gVolt.duration_ms, 1500) + 400);
        }
    }

    const extras = asObj(state.extras);
    const rightHand = extras ? asObj(extras.right_hand) : null;
    if (rightHand) candidates.push(asNum(rightHand.fade_duration_ms, 0));

    // Diamond #4 enrichment sub-objects (2026-06-14): the radial diametric-twin
    // decomposition, the axial head-to-tail stack, and STATE_2's per-turn Biot-
    // Savart reveal all have their own late beats — without these the capture
    // would photograph the radial/axial states before their payoff fires.
    const rd = asObj(state.radial_decomposition);
    if (isEnabled(rd) && rd) {
        // PEAK-CONTENT, not last-beat: the teaching payload is the fully-split
        // 4-arrow decomposition (blue axial pair + red radial pair, equal-and-
        // opposite). After annihilate the red pair is scaled to 0, so pinning at
        // annihilate-complete photographs an empty axis. Capture at split-complete
        // so the frozen frame shows the decomposition (the annihilation reads live).
        candidates.push(asNum(rd.split_at_ms, 4500) + asNum(rd.split_fade_ms, 700));
    }
    const axs = asObj(state.axial_stack);
    if (isEnabled(axs) && axs) {
        candidates.push(Math.max(
            asNum(axs.stack_at_ms, 1200) + asNum(axs.stack_dur_ms, 1000),
            asNum(axs.sum_reveal_at_ms, 2600) + 700,
        ));
    }
    const ptb = asObj(state.per_turn_biot);
    if (isEnabled(ptb) && ptb) {
        candidates.push(asNum(ptb.axial_reveal_at_ms, 1800) + Math.max(0, coilTurns - 1) * asNum(ptb.axial_stagger_ms, 250) + 500);
        candidates.push(asNum(ptb.reveal_at_ms, 500) + asNum(ptb.reveal_fade_ms, 600));
    }
    // Beat 3: along-length axial stack reveals left→right (6 arrows, staggered).
    const ls = asObj(state.length_stack);
    if (isEnabled(ls) && ls) {
        candidates.push(asNum(ls.reveal_at_ms, 1800) + 5 * asNum(ls.stagger_ms, 260) + asNum(ls.fade_ms, 500));
    }
    // Beat 1: N/S pole labels fade in early; small but pin past them.
    const pl = asObj(state.pole_labels);
    if (isEnabled(pl) && pl) {
        candidates.push(asNum(pl.reveal_at_ms, 300) + asNum(pl.fade_ms, 500));
    }

    // bar_magnet_as_dipole (NCERT Ch.5 Sec.5.2 dipole field): per-state `extras`
    // drive one-shot timed choreography that then HOLDS its end pose. STATE_2's
    // loop trace CYCLES forever (the payoff is the repetition) so it is NOT
    // pinned here — it stays in the strict motion gate via
    // deriveMotionExpectations/deriveHoldExpectations below, never a settle
    // time. STATE_3 (break) DOES pin here — pinned to the MIDDLE of the
    // renderer's hold-open window so it lands well clear of either phase
    // boundary. 2026-07-12 round 3: the JSON's `second_cut`/`frozen_pose_ms`
    // extras are no longer read by the renderer (that beat never rendered
    // visibly and was cleanly removed — the symmetric centre cut alone
    // carries STATE_3's PRIMARY aha); this pin now matches the renderer's
    // actual simple split/hold/rejoin/pause cycle unconditionally. Renderer-
    // only timing constants the JSON does not carry (the 1600ms compass-
    // settle ease, the 3000ms post-split hold-open, the 4500ms r-sweep, the
    // 1200ms edipole glide) are hardcoded fallbacks here — they MUST mirror
    // field_3d_renderer.ts's updateBarMagnetAsDipoleFrame (bar_magnet_as_dipole
    // scenario region) if ever changed there.
    const bmx = asObj(state.extras);
    if (bmx) {
        const bmCompass = asObj(bmx.compass_settle);
        if (bmCompass) {
            candidates.push(
                asNum(bmx.field_reveal_ms, 1200)
                + asNum(bmCompass.gap_after_reveal_ms, 600)
                + 1600 // BM_S1_SETTLE_MS
                + 400,
            );
        }
        const bmBreak = asObj(bmx.break_anim);
        if (isEnabled(bmBreak) && bmBreak) {
            // Pin to the MIDDLE of the 3000ms hold-open window (not its start
            // or end) so THE EYE's frozen/dense capture is robust to any small
            // drift between this fallback and the renderer's exact constants.
            candidates.push(asNum(bmBreak.at_ms, 2500) + asNum(bmBreak.duration_ms, 1600) + 1500 /* half of BM_S3_HOLD_OPEN_MS=3000 */ + 400);
        }
        const bmFlip = asObj(bmx.flip_anim);
        if (bmFlip) {
            candidates.push(asNum(bmFlip.at_ms, 800) + asNum(bmFlip.duration_ms, 1400) + 400);
        }
        const bmSol = asObj(bmx.solenoid_crossfade);
        if (isEnabled(bmSol) && bmSol) {
            candidates.push(asNum(bmSol.period_ms, 3200) + 400);
        }
        const bmGhostRatio = asObj(bmx.ghost_ratio_pair);
        if (isEnabled(bmGhostRatio) && bmGhostRatio) {
            const bmOrbit = asObj(bmx.orbit_probe);
            candidates.push(
                asNum(bmGhostRatio.hold_ms, 1500)
                + (bmOrbit ? asNum(bmOrbit.gap_ms, 500) + asNum(bmOrbit.duration_ms, 1800) : 0)
                + 400,
            );
        }
        if (bmx.r_sweep_theta_locked === true) {
            candidates.push(4500 /* BM_S7_SWEEP_MS */ + 500);
        }
        const bmEdipole = asObj(bmx.edipole_glide);
        if (isEnabled(bmEdipole) && bmEdipole) {
            candidates.push(asNum(bmEdipole.gap_ms, 500) + 1200 /* BM_S8_GLIDE_MS */ + asNum(bmEdipole.registration_glow_ms, 700) + 400);
        }
    }

    // kinematics_1d_track (displacement_vs_distance, first 1D-straight-line-
    // motion scenario, greenfield build 2026-07-25): the per-state `track`
    // block's `phases[]` is the full authored choreography timeline (see
    // engine_build_spec in the concept JSON) — each phase carries at_ms/
    // until_ms EXCEPT STATE_5's lap-sweep trio (sweep_laps/final_settle/
    // endpoint_callout), whose renderer-side duration depends on the LIVE
    // extra_laps slider (never a runtime string-eval — the renderer computes
    // this directly; mirrored here using the state's AUTHORED extra_laps
    // default, same convention as every other slider-dependent reveal
    // estimate in this file — keep these three formulas in sync with
    // field_3d_renderer.ts's updateKinematics1dTrackFrame if ever changed).
    // STATE_6 (mode: 'sandbox') is the explore state — its idle-auto-sweep
    // never settles, so it is excluded here and classified 'interactive' in
    // deriveHoldExpectations below.
    const kt = asObj(state.track);
    if (kt && kt.mode !== 'sandbox' && Array.isArray(kt.phases)) {
        const extraLaps = asNum(kt.extra_laps, 1);
        let ktMax = 0;
        for (const rawPhase of kt.phases) {
            const ph = asObj(rawPhase);
            if (!ph) continue;
            if (ph.id === 'sweep_laps') {
                ktMax = Math.max(ktMax, asNum(ph.at_ms, 2100) + 3000 * extraLaps);
                continue;
            }
            if (ph.id === 'final_settle') {
                ktMax = Math.max(ktMax, 2100 + 3000 * extraLaps + asNum(ph.duration_ms, 1000));
                continue;
            }
            if (ph.id === 'endpoint_callout') {
                ktMax = Math.max(ktMax, 2100 + 3000 * extraLaps + 1300 + asNum(ph.duration_ms, 1000));
                continue;
            }
            if (typeof ph.until_ms === 'number') { ktMax = Math.max(ktMax, ph.until_ms); continue; }
            if (typeof ph.at_ms === 'number') { ktMax = Math.max(ktMax, ph.at_ms); continue; }
        }
        if (ktMax > 0) candidates.push(ktMax + 500);
    }

    // newtons_laws_body (the Laws of Motion chapter engine, prefix `nlb`): the
    // guided beats run on the state's OWN clock (`eng.t_ms` — reset to 0 on state
    // entry, advanced only by the dt handed to updateNewtonsLawsBodyFrame, so it
    // freezes with the SET_TIME_FREEZE pin). The scripted script is the per-state
    // `phases[]` array, fired by nlbRunPhases: a phase is ACTIVE over
    // [at_ms, until_ms) — its side effect (action + optional phase-owned
    // glow_focal) lands INSTANTLY at `at_ms` (no ease/fade), and at `until_ms`
    // the window closes and the focal is handed back to the state's base focal.
    // So the state's reveal completes at the LAST phase's fire time.
    //
    // Two scars govern the pin:
    //   • pin PAST the fire instant (+ cushion) so the frozen frame photographs
    //     the fired pose, never the pre-fire scene, and so deriveHoldExpectations
    //     sees a settled beat (field3d_scenario_missing_maxreveal_block_... — a
    //     missing block pins at DEFAULT_REVEAL_MS mid-script);
    //   • but keep the pin INSIDE a windowed phase's own band
    //     (eye_frozen_candidate_offset_falls_outside_engine_display_band) — a
    //     phase with `until_ms` set displays only while open, so overshooting it
    //     would photograph the handed-back pose and lose coverage of that beat.
    const nlb = asObj(state.newtons_laws_body);
    if (nlb) {
        // SEAM L: the reveal FLOOR an energy-layer state raises for itself. 3000 ms
        // matches the incline_slide floor below for the same physical reason — that
        // is roughly how much of the state's own clock the block needs to travel
        // far enough that K and U read as visibly different from their seed values.
        const NLB_ENERGY_SETTLE_MS = 3000;
        const nlbCushion = 500;
        const phases = Array.isArray(nlb.phases) ? nlb.phases : [];
        let phaseFound = false;
        for (const phRaw of phases) {
            const ph = asObj(phRaw);
            if (!ph || typeof ph.id !== 'string' || ph.id.length === 0) continue;   // mirrors nlbRunPhases' skip
            phaseFound = true;
            const at = asNum(ph.at_ms, 0);
            const until = typeof ph.until_ms === 'number' && Number.isFinite(ph.until_ms) ? ph.until_ms : null;
            if (until != null && until > at) {
                // Land inside [at_ms, until_ms): at + cushion, pulled back to
                // 200ms before the window closes when the band is short.
                candidates.push(Math.max(at, Math.min(at + nlbCushion, until - 200)));
            } else {
                candidates.push(at + nlbCushion);
            }
        }
        // §7.1 pre-approved fix — param_ramp (block_on_incline's tilt-until-
        // break-away beat) completes and HOLDS at `to` at end_ms; pin PAST it
        // (+ cushion) so the frozen frame photographs the settled break-away
        // pose, never a mid-ramp angle
        // (field3d_scenario_missing_maxreveal_block_frozen_pin_defaults_1500ms_predates_scripted_reveal).
        // Independent of phases[] — a ramp state may or may not also author a
        // phases[] glow script.
        const pr = asObj(nlb.param_ramp);
        if (pr && typeof pr.end_ms === 'number' && Number.isFinite(pr.end_ms)) {
            phaseFound = true;   // a ramp IS a scripted reveal; skip the mode floor below
            candidates.push(pr.end_ms + nlbCushion);
        }
        // ── SEAM R (rotmech 0c-2) — the TWO bought timed field classes ─────────
        //   Both are scripted reveals on the state's own clock, so both must join
        //   the max-reveal computation or the frozen pin defaults to a time that
        //   PREDATES them and THE EYE mints a self-contradictory baseline —
        //   field3d_scenario_missing_maxreveal_block_frozen_pin_defaults_1500ms_
        //   predates_scripted_reveal, in a new dress.
        //
        //   (1) bodies[].activate_at_ms — the instant a body starts being
        //       integrated (and, in a single_lane state, the instant the previous
        //       body retires). Presence is resolved by typeof, never truthiness:
        //       an authored 0 is a legal instant and, by definition, means the same
        //       as absent (live from entry), so it contributes no candidate.
        const nlbBodies = Array.isArray(nlb.bodies) ? nlb.bodies : [];
        for (const bRaw of nlbBodies) {
            const bd = asObj(bRaw);
            if (!bd) continue;
            const at = bd.activate_at_ms;
            if (typeof at === 'number' && Number.isFinite(at) && at > 0) {
                phaseFound = true;
                candidates.push(at + nlbCushion);
            }
        }
        //   (2) formula_lines[].at_ms — the per-line formula reveal. The LAST line
        //       is the one that matters: it is the answer the derivation state
        //       exists to produce, so the pin must land after it or the frozen frame
        //       photographs a half-built formula and claims it is the lesson.
        const nlbFml = Array.isArray(nlb.formula_lines) ? nlb.formula_lines : [];
        let lastLineMs = -1;
        for (const lnRaw of nlbFml) {
            const ln = asObj(lnRaw);
            if (!ln || typeof ln.text !== 'string' || ln.text.length === 0) continue;   // mirrors nlbRenderStamps' skip
            const at = typeof ln.at_ms === 'number' && Number.isFinite(ln.at_ms) ? ln.at_ms : 0;
            if (at > lastLineMs) lastLineMs = at;
        }
        if (lastLineMs > 0) {
            phaseFound = true;
            candidates.push(lastLineMs + nlbCushion);
        }
        // push_off (docs/NLB_PUSH_OFF_SPEC.md) — the contact-then-release phase.
        // The TAUGHT beat is not the contact, it is the SEPARATION the contact
        // leaves behind: both applied forces go to 0 at release_at_ms and the
        // carts coast apart on the mu = 0 track from there. So the pin must land
        // well PAST release, or the frozen frame photographs two carts still
        // touching under a caption about them flying apart — the mid-transition
        // capture field3d_slcr_reveal_hold_captures_transitional_r_family names,
        // and (with no phases[] authored) it would otherwise fall back to the
        // action_reaction_pair mode floor of DEFAULT_REVEAL_MS, which for a
        // release at ~1200 ms sits INSIDE the contact window
        // (field3d_scenario_missing_maxreveal_block_frozen_pin_defaults_1500ms_...).
        // A push_off IS a scripted reveal, so it also skips the mode floor.
        //
        // REPEATING push_off (`repeat_every_ms`, 2026-07-29 founder review) INVERTS
        // that: when the interaction re-arms every R ms the taught beat is no longer
        // the one separation it leaves behind, it IS the repeating interaction — and
        // the release+coast pin is precisely what produced the empty canonical frame
        // the scar nlb_push_off_interaction_dies_after_release_leaving_96pct_of_the_
        // state_empty names (both arrows hidden, spring hidden, HUD 0.00). So the pin
        // must land DURING a contact window, i.e. at a state-local time whose
        // PHASE (t - floor(t/R)*R, exactly nlbRunPushOff's arithmetic) satisfies
        // contact_from_ms <= phase < release_at_ms. Then the reviewer screenshot
        // always shows the spring compressed and BOTH equal-and-opposite arrows.
        //   Offset = 35% into the contact window. Fractional, not a fixed cushion,
        //   so it scales with any authored window and is clear of BOTH edges by
        //   construction: 35% of the window past contact_from_ms (never the
        //   entry/re-arm frame, whose pose is still the untouched home seed) and
        //   65% of the window before release_at_ms (never the frame where the
        //   forces have just gone to 0 — the mid-transition capture
        //   field3d_slcr_reveal_hold_captures_transitional_r_family names).
        //   Cycle = the FIRST contact window at or after every other candidate this
        //   state raised (phases[]/param_ramp), because the caller returns
        //   Math.max(...candidates): picking cycle 0 unconditionally would let a
        //   late authored phase out-vote the pin and drop it back outside contact.
        // MOTION/HOLD: deliberately unchanged. deriveMotionExpectations has no
        // newtons_laws_body branch (=> undefined => D5 skips: nothing is asserted
        // about a repeating state's pixels), and deriveHoldExpectations' nlb branch
        // gives a non-sandbox state 'reveal_hold', which in pixelGate is a pure
        // RELAXATION of the stuck/static checks and never asserts stillness — so a
        // continuously repeating push-off cannot false-fail on moving pixels in the
        // tail. Nothing to fix in either derivation.
        //
        // spring_action (docs/NLB_SPRING_CHOREOGRAPHY_SPEC.md, 2026-07-30) moves
        // every interesting beat AGAIN: the contact window no longer opens at
        // contact_from_ms but at lead = approach + compress + hold, and it then
        // stays open for (release - contact_from) * slow_factor ms of WALL time
        // (nlbRunPushOff's affine remap — the phase clock is wall time, only the
        // integrator's dt is divided). A 35%-into-contact pin computed from the raw
        // contact window would therefore land in the middle of the COMPRESS stroke:
        // the mid-transition capture field3d_slcr_reveal_hold_captures_transitional_
        // r_family, with a half-loaded coil and half-grown arrows. So with a
        // choreography authored the pin targets the HOLD beat — "latched and loaded:
        // compressed coil, both arrows at full magnitude, HUD live", the beat the
        // spec says a teacher narrates over, and a genuinely SETTLED pose
        // (deriveHoldExpectations' 'reveal_hold'). Mid-hold, so it is clear of both
        // edges by construction. Fallbacks, in order, when a state authors no hold:
        // 35% into the WALL release window, then mid-compress.
        const po = asObj(nlb.push_off);
        if (po) {
            const NLB_PUSH_OFF_COAST_MS = 2000;   // coast window that makes the separation legible
            const release = asNum(po.release_at_ms, 0);
            const contactFrom = asNum(po.contact_from_ms, 0);
            // Mirrors nlbRunPushOff's spring_action guards exactly (nlbSaMs: a
            // non-finite / negative / absent duration is 0; slow_factor >= 1 or the
            // NLB_SPRING_SLOW_DEFAULT = 6 spec default, never a speed-up).
            const sa = asObj(nlb.spring_action);
            const saMs = (v: unknown): number => {
                const n = asNum(v, 0);
                return Number.isFinite(n) && n > 0 ? n : 0;
            };
            const approach = sa ? saMs(sa.approach_ms) : 0;
            const compress = sa ? saMs(sa.compress_ms) : 0;
            const hold = sa ? saMs(sa.hold_ms) : 0;
            const slow = sa
                ? (typeof sa.slow_factor === 'number' && Number.isFinite(sa.slow_factor) && sa.slow_factor >= 1
                    ? sa.slow_factor : 6)
                : 1;
            const lead = approach + compress + hold;
            const releaseWall = Math.max(0, release - contactFrom) * slow;
            // Mirrors nlbRunPushOff's guard exactly: a non-finite, <= 0 or
            // too-short cycle is IGNORED by the renderer, so the pin must stay on
            // the single-fire branch for those too. With a choreography the floor
            // is the whole wall-clock cycle (lead + the slowed release), not just
            // release_at_ms.
            const repFloor = sa ? lead + releaseWall : release;
            const repRaw = po.repeat_every_ms;
            const rep = (typeof repRaw === 'number' && Number.isFinite(repRaw)
                && repRaw > 0 && repRaw > repFloor) ? repRaw : 0;
            phaseFound = true;
            // The beat to photograph, in cycle-local WALL ms. null = this state
            // has no loaded beat at all -> the original release+coast pin.
            let offset: number | null = null;
            if (sa) {
                if (hold > 0) offset = approach + compress + hold * 0.5;          // mid-HOLD (preferred)
                else if (releaseWall > 0) offset = lead + releaseWall * 0.35;     // 35% into the slowed release
                else if (compress > 0) offset = approach + compress * 0.5;        // mid-compress
            } else if (release > contactFrom) {
                offset = contactFrom + (release - contactFrom) * 0.35;            // unchanged single/repeat pin
            }
            if (rep > 0 && offset != null) {
                // The floor matters as much as the other candidates: the caller
                // runs this through clampReveal (Math.max(DEFAULT_REVEAL_MS, ...),
                // Math.min(DURATION_MAX_MS, ...)), so a cycle-0 pin at e.g. 147 ms
                // would be silently RAISED to 1500 ms — a phase of 1500 > release,
                // i.e. straight back into the dead zone this fix exists to remove.
                // Fold both bounds in here so the value that survives the clamp is
                // still inside the target beat.
                const base = Math.max(DEFAULT_REVEAL_MS, ...candidates);
                const wanted = Math.max(0, Math.ceil((base - offset) / rep));
                const ceiling = Math.floor((DURATION_MAX_MS - offset) / rep);
                const cycle = Math.max(0, Math.min(wanted, ceiling));
                candidates.push(cycle * rep + offset);
            } else if (sa && offset != null) {
                // Single-fire choreography: there is no cycle to shift into, so the
                // pin is the beat itself. The DEFAULT_REVEAL_MS floor can still
                // raise it past a very short choreography (a lead under 1.5 s) —
                // the general trap logged as field3d_reveal_pin_inside_a_narrow_
                // window_silently_raised_by_clampreveal_floor. The spec's own
                // choreography (600/1600/1200) puts mid-hold at 2800 ms, well clear.
                candidates.push(offset);
            } else {
                candidates.push(release + NLB_PUSH_OFF_COAST_MS);
            }
        }
        // ── SEAM M — site (i), completed: the `sum_merge` one-shot ──────────────
        //   The bars SLIDE into the stacked column over duration_ms from the cue
        //   (or from at_ms, which is the fallback THE EYE takes because it posts no
        //   cue times). A pin landing mid-slide photographs half-merged bars —
        //   verbatim the mid-transition capture
        //   field3d_slcr_reveal_hold_captures_transitional_r_family — so the pin
        //   must clear the END of the slide, plus the standard cushion.
        //   Deliberately does NOT set phaseFound: the energy-layer settle floor
        //   below is still the right lower bound (a merge that fires at t = 0 with a
        //   900 ms slide would otherwise pull the pin down to 1400 ms, back onto a
        //   picture where the block has barely moved).
        const nlbEnCfgM = asObj(nlb.energy_layer);
        const nlbSm = nlbEnCfgM ? asObj(nlbEnCfgM.sum_merge) : null;
        if (nlbSm) {
            const smAt = asNum(nlbSm.at_ms, 0);
            const smDurRaw = nlbSm.duration_ms;
            const smDur = typeof smDurRaw === 'number' && Number.isFinite(smDurRaw) && smDurRaw > 0
                ? smDurRaw : 900;   // mirrors NLB_SUM_MERGE_MS in the renderer
            candidates.push(smAt + smDur + nlbCushion);
        }
        // ── SEAM M — site (iii), the OWED frozen-pin instant ────────────────────
        //   A `loop_reset_ms` state restarts its own kinematics every R ms, so the
        //   pin is not a time, it is a PHASE: land ~60% into a cycle, which for
        //   every authored loop in this chapter is inside the DESCENT segment (the
        //   block was launched at cycle start, turns near the middle, and is coming
        //   back down through the second half). A pin near a boundary photographs
        //   the restart frame — the home pose, with every bar back at its seed value
        //   and nothing to show — and mints an H2 baseline on it.
        //   The ±150 ms clearance is ASSERTED, not hoped for: the offset is clamped
        //   into [150, R − 150], so the pin is provably that far from BOTH the reset
        //   that starts its cycle and the one that ends it. (A loop shorter than
        //   300 ms cannot satisfy the assertion at all — no such state is authorable
        //   in practice, and it degrades to mid-cycle rather than to a boundary.)
        //   Cycle selection mirrors the repeating-push_off pin exactly: fold both of
        //   clampReveal's bounds in HERE, or a cycle-0 pin gets silently RAISED to
        //   DEFAULT_REVEAL_MS and lands at an arbitrary phase again.
        //   Sets phaseFound: this IS the better-informed candidate SEAM L's energy
        //   floor was written to defer to.
        const nlbLrRaw = nlb.loop_reset_ms;
        const nlbLr = typeof nlbLrRaw === 'number' && Number.isFinite(nlbLrRaw) && nlbLrRaw > 0
            ? nlbLrRaw : 0;
        const nlbModeLr = typeof nlb.mode === 'string' ? nlb.mode : '';
        // Mirrors nlbRunLoopReset's own guards: a push_off state's sealed cycle owns
        // the rewind, and a sandbox never loops (SEAM J's wrap is its loop).
        if (nlbLr > 0 && !asObj(nlb.push_off) && nlbModeLr !== 'sandbox') {
            const NLB_LOOP_EDGE_MS = 150;
            const lo = NLB_LOOP_EDGE_MS;
            const hi = nlbLr - NLB_LOOP_EDGE_MS;
            const offset = hi > lo
                ? Math.min(Math.max(nlbLr * 0.60, lo), hi)
                : nlbLr * 0.5;
            const base = Math.max(DEFAULT_REVEAL_MS, ...candidates);
            const wanted = Math.max(0, Math.ceil((base - offset) / nlbLr));
            const ceiling = Math.floor((DURATION_MAX_MS - offset) / nlbLr);
            const cycle = Math.max(0, Math.min(wanted, ceiling));
            candidates.push(cycle * nlbLr + offset);
            phaseFound = true;
        }
        if (!phaseFound) {
            // No authored script this state: fall back per `mode`. These are pure
            // FLOORS used only when phases[] is absent (an authored phase always
            // decides, so the floor can never push the pin outside a phase band).
            //   • the static/overlay beats (rest_equilibrium, fbd_isolate,
            //     incline_decompose, action_reaction_pair) are correct from t=0 —
            //     nothing to wait for, so DEFAULT_REVEAL_MS stands;
            //   • the integrating beats need a couple of seconds of real
            //     displacement before the picture reads (the mass/force compare
            //     needs visible separation, the incline/Atwood needs travel);
            //   • coast_with_friction's payoff is the body having STOPPED, which
            //     is the latest settle in the chapter;
            //   • sandbox is user-driven (deriveHoldExpectations → 'interactive');
            //     its idle_auto_sweep is supplementary motion, NEVER folded into a
            //     reveal pin.
            // ── SEAM L (energy display layer) — site (i) of the mandatory
            //    deriveStateMeta co-edit (skeleton spec note 15). An energy-layer
            //    state's payoff is the BARS, and at t = 0 every bar still sits at
            //    its seed value: the block has not moved, so K is 0, the split has
            //    not shifted, and a frozen frame taken there photographs a picture
            //    that proves nothing. Worse, an energy state that authors no
            //    phases[]/param_ramp/push_off and whose `mode` is not in the
            //    hardcoded list below falls all the way to DEFAULT_REVEAL_MS
            //    (1500 ms) — the field3d_scenario_missing_maxreveal_block_frozen_
            //    pin_defaults_1500ms_predates_scripted_reveal scar exactly.
            //      So the layer registers its OWN floor: enough of the state's own
            //    clock for the integrator to have visibly traded K against U. It is
            //    a FLOOR, not a choice of instant — the caller returns
            //    Math.max(...candidates), so any later, better-informed candidate
            //    still wins.
            //      NOT DONE HERE, deliberately: site (iii), the frozen-pin instant
            //    itself (land inside a descent segment, provably >= 150 ms clear of
            //    every loop_reset_ms boundary, ~55-65% of the loop period). That
            //    needs the sum_merge cue and the marker beats to exist and belongs
            //    with them in SEAM M. This floor is chosen to be compatible with it.
            const nlbEnergy = asObj(nlb.energy_layer);
            if (nlbEnergy) candidates.push(NLB_ENERGY_SETTLE_MS);
            const nlbMode = typeof nlb.mode === 'string' ? nlb.mode : '';
            if (nlbMode === 'coast_with_friction') candidates.push(4000);
            else if (nlbMode === 'coast_no_force' || nlbMode === 'accelerate_applied_force'
                || nlbMode === 'compare_mass_same_force' || nlbMode === 'compare_force_same_mass'
                || nlbMode === 'incline_slide' || nlbMode === 'connected_atwood'
                || nlbMode === 'connected_incline_hanging') candidates.push(3000);
            else candidates.push(DEFAULT_REVEAL_MS);   // static/overlay beats + sandbox
        }
    }

    // force_rig (the off-axis force engine, prefix `fr`): the guided beats run on
    // the state's OWN clock (`eng.t_ms` — reset to 0 on state entry, advanced only
    // by the dt handed to updateForceRigFrame, so it freezes with the
    // SET_TIME_FREEZE pin). Three scripted reveals can push the pin, and the pin
    // must land past the LAST one:
    //   • `phases[]` — same [at_ms, until_ms) window semantics as
    //     newtons_laws_body above, so the pin lands INSIDE an open window
    //     (eye_frozen_candidate_offset_falls_outside_engine_display_band) and past
    //     a bare fire instant otherwise;
    //   • `param_ramp` — one-shot monotonic, HOLDS at `to` from end_ms;
    //   • `release.at_ms` (whirl) — the cut-the-string beat; the payoff is the
    //     straight tangential departure AFTER the cut, so the pin must clear it.
    // The ring/bob also needs real settling time after the last write, hence the
    // FR_SETTLE_MS floor: a force table pinned the instant a ramp ends photographs
    // a ring still visibly mid-drift, which would mint a self-contradictory H2
    // baseline (field3d_scenario_missing_maxreveal_block_...).
    const frig = asObj(state.force_rig);
    if (frig) {
        const frCushion = 500;
        const FR_SETTLE_MS = 1600;   // damped ring settle, mirrors FR_DEFAULT_DAMPING
        let frFound = false;
        const frPhases = Array.isArray(frig.phases) ? frig.phases : [];
        for (const phRaw of frPhases) {
            const ph = asObj(phRaw);
            if (!ph || typeof ph.id !== 'string' || ph.id.length === 0) continue;   // mirrors frRunPhases' skip
            frFound = true;
            const at = asNum(ph.at_ms, 0);
            const until = typeof ph.until_ms === 'number' && Number.isFinite(ph.until_ms) ? ph.until_ms : null;
            if (until != null && until > at) candidates.push(Math.max(at, Math.min(at + frCushion, until - 200)));
            else candidates.push(at + frCushion);
        }
        const frRamp = asObj(frig.param_ramp);
        if (frRamp && typeof frRamp.end_ms === 'number' && Number.isFinite(frRamp.end_ms)) {
            frFound = true;
            candidates.push(frRamp.end_ms + FR_SETTLE_MS);
        }
        // Registered NOW, so the whirl branch needs no edit here when it lands.
        const frWhirl = asObj(frig.whirl);
        const frRelease = frWhirl ? asObj(frWhirl.release) : null;
        if (frRelease && typeof frRelease.at_ms === 'number' && Number.isFinite(frRelease.at_ms)) {
            frFound = true;
            // 3000, not 1200 (2026-08-01, with force_rig_whirl_post_cut_flight_
            // envelope_too_short_to_watch): the flight used to LAST 1.4 s, so a
            // 1.2 s pin was already near its end. The envelope now supports ~5 s
            // of straight-line travel, and the payoff — a long straight track that
            // is visibly NOT the abandoned circle — only reads once the bob is
            // well clear of it. Still a pure reveal pin: it lands mid-flight, on a
            // beat the engine holds (constant velocity, nothing transitional).
            candidates.push(frRelease.at_ms + 3000);   // past the cut, into the straight departure
        }
        if (!frFound) candidates.push(FR_SETTLE_MS);   // no script: still let the rig settle
    }

    // rigid_body_rotation (Class-11 Ch.7, prefix `rbr`). Every beat runs on the
    // state's OWN clock — eng.t_ms is DERIVED from (time - stateStartTime), so
    // it freezes exactly with the SET_TIME_FREEZE pin. Six scripted reveals can
    // push the pin, and the pin must land past the LAST one (a scenario with no
    // block here pins at DEFAULT_REVEAL_MS = 1500 mid-choreography and mints a
    // self-contradictory H2 baseline — field3d_scenario_missing_maxreveal_block_
    // frozen_pin_defaults_1500ms_predates_scripted_reveal).
    const rbr = asObj(state.rigid_body_rotation);
    if (rbr) {
        const RBR_CUSHION = 900;      // past a ramp's hold, into the settled claim
        const RBR_BLANK_DEFAULT = 500;
        let rbrFound = false;
        //   (1) param_ramp — ONE-SHOT monotonic, HOLDS at `to` from end_ms. The
        //       payoff (S2 spin-up, S3 the readout meeting its chip, S4 the KE
        //       gap standing open) IS the held tail, so the pin clears end_ms.
        const rbrRamp = asObj(rbr.param_ramp);
        if (rbrRamp && typeof rbrRamp.end_ms === 'number' && Number.isFinite(rbrRamp.end_ms)) {
            rbrFound = true;
            candidates.push(rbrRamp.end_ms + RBR_CUSHION);
        }
        //   (2) external_torque — the brake beat. The claim is the HELD post-
        //       release reading (L, omega and KE all changed and stayed changed),
        //       so the pin lands past the release, never inside the decay.
        const rbrTau = asObj(rbr.external_torque);
        if (rbrTau) {
            //   E4 (rotmech 0c-3): external_torque.sources[] carries its OWN
            // engage/release instants, and an unregistered *_at_ms pins the
            // frozen frame at DEFAULT_REVEAL_MS mid-choreography. Each engaged
            // source contributes the same two candidates the scalar form does,
            // so the pin lands past the LAST torque event of the state whether
            // the state authored one torque or the drive-vs-brake tug.
            const rbrSrcList = Array.isArray(rbrTau.sources) ? rbrTau.sources : null;
            const rbrTqWindows: Array<Record<string, unknown>> = rbrSrcList
                ? rbrSrcList.map((s) => asObj(s)).filter((s): s is Record<string, unknown> =>
                    !!s && Math.abs(asNum(s.torque_Nm, 0)) > 0)
                : (Math.abs(asNum(rbrTau.tau_brake_Nm, 0)) || Math.abs(asNum(rbrTau.applied_torque_Nm, 0))
                    ? [rbrTau] : []);
            for (const w of rbrTqWindows) {
                if (typeof w.release_at_ms === 'number' && Number.isFinite(w.release_at_ms)) {
                    rbrFound = true;
                    candidates.push(w.release_at_ms + 2000);
                } else if (typeof w.engage_at_ms === 'number' && Number.isFinite(w.engage_at_ms)) {
                    rbrFound = true;
                    candidates.push(w.engage_at_ms + 3000);   // well into the decay / spin-up
                } else if (rbrSrcList) {
                    // A sources[] entry with no authored window engages at 0 and
                    // never releases, so the settled claim is the held tail.
                    rbrFound = true;
                    candidates.push(3000);
                }
            }
        }
        //   (3) restart — the run-cut. THE PIN MUST NOT LAND IN THE BLANK
        //       WINDOW: across a re-pin the readouts are deliberately blanked
        //       (Addendum C), so a pin there photographs an instrument panel
        //       reading "—" and loses coverage of the payoff entirely
        //       (eye_frozen_candidate_offset_falls_outside_engine_display_band).
        //       Land 1.5 s INTO the run that follows the cut, which is where the
        //       flipped L arrow and the flipped grip hand actually read.
        const rbrRestart = asObj(rbr.restart);
        if (rbrRestart && typeof rbrRestart.at_ms === 'number' && Number.isFinite(rbrRestart.at_ms)) {
            const rbrRepin = asObj(rbr.repin_cue);
            const blank = rbrRepin ? asNum(rbrRepin.blank_ms, RBR_BLANK_DEFAULT) : RBR_BLANK_DEFAULT;
            rbrFound = true;
            candidates.push(rbrRestart.at_ms + blank + 1500);
        }
        //   (4) reference_marks[] — the chip/tick reveals. A chip's own payoff is
        //       the MATCH, which happens when the ramp holds (covered by (1)), so
        //       this only guarantees the mark itself is on screen.
        const rbrMarks = Array.isArray(rbr.reference_marks) ? rbr.reference_marks : [];
        for (const mkRaw of rbrMarks) {
            const mk = asObj(mkRaw);
            if (!mk) continue;
            rbrFound = true;
            candidates.push(asNum(mk.at_ms, 0) + RBR_CUSHION);
        }
        //   (5) readout_at_ms — the term-introduction ledger (a quantity is
        //       printed only after the sentence defining it). S1 is nothing BUT
        //       this, so without it S1 would pin at 1500 ms with two of its three
        //       instruments still unbuilt.
        const rbrRo = asObj(rbr.readout_at_ms);
        if (rbrRo) {
            for (const k of Object.keys(rbrRo)) {
                const at = asNum(rbrRo[k], NaN);
                if (Number.isFinite(at)) { rbrFound = true; candidates.push(at + 1200); }
            }
        }
        //   (6) phases[] — same [at_ms, until_ms) window semantics as force_rig:
        //       land INSIDE an open window, past a bare fire instant otherwise.
        const rbrPhases = Array.isArray(rbr.phases) ? rbr.phases : [];
        for (const phRaw of rbrPhases) {
            const ph = asObj(phRaw);
            if (!ph || typeof ph.id !== 'string' || ph.id.length === 0) continue;
            rbrFound = true;
            const at = asNum(ph.at_ms, 0);
            const until = typeof ph.until_ms === 'number' && Number.isFinite(ph.until_ms) ? ph.until_ms : null;
            if (until != null && until > at) candidates.push(Math.max(at, Math.min(at + 500, until - 200)));
            else candidates.push(at + 500);
        }
        //   (7) formula_lines[].at_ms — the per-line reveal on the ONE formula
        //       surface (#rbr_formula), ported from newtons_laws_body under the
        //       same field name and read the same way here (deriveStateMeta.ts
        //       ~:2829 is the nlb twin). The LAST line is the one that matters: it
        //       is the equation the state exists to assemble, so the pin must land
        //       past it or the frozen frame photographs a half-built formula and
        //       mints it as the baseline — field3d_scenario_missing_maxreveal_
        //       block_frozen_pin_defaults_1500ms_predates_scripted_reveal, again.
        //       Presence is resolved exactly as the renderer resolves it: an empty
        //       or unusable line is SKIPPED (mirrors rbrRenderFormula's skip), and
        //       an authored at_ms of 0 means "from entry" so it pushes no candidate.
        const rbrFml = Array.isArray(rbr.formula_lines) ? rbr.formula_lines : [];
        let rbrLastLineMs = -1;
        for (const lnRaw of rbrFml) {
            const ln = asObj(lnRaw);
            if (!ln || typeof ln.text !== 'string' || ln.text.length === 0) continue;
            const at = typeof ln.at_ms === 'number' && Number.isFinite(ln.at_ms) ? ln.at_ms : 0;
            if (at > rbrLastLineMs) rbrLastLineMs = at;
        }
        if (rbrLastLineMs > 0) {
            rbrFound = true;
            candidates.push(rbrLastLineMs + RBR_CUSHION);
        }
        //   A sandbox (Rule 37 free-run) has no script at all — it is classified
        //   'interactive' in deriveHoldExpectations and needs no reveal pin.
        if (!rbrFound && rbr.mode !== 'sandbox') candidates.push(RBR_CUSHION);
    }

    return candidates.length > 0 ? Math.max(...candidates) : DEFAULT_REVEAL_MS;
}

/**
 * PCPL narration proxy: sum of the state's tts_sentences `pause_after_ms`.
 * LEGACY signal — `pause_after_ms` is forbidden on new concepts (Rule 31), so
 * this is structurally 0 (→ DEFAULT_REVEAL_MS) for every modern PCPL state.
 * Kept as a lower bound for any pre-Rule-31 PCPL concept that still authors
 * pauses; `pcplSceneRevealMs` below is the real signal for current concepts.
 * Combined at the single call site in deriveMaxRevealTimeMs (WP-T1).
 */
function pcplRevealMs(state: Record<string, unknown>): number {
    const ts = asObj(state.teacher_script);
    const sentences = ts && Array.isArray(ts.tts_sentences) ? ts.tts_sentences : null;
    if (!sentences || sentences.length === 0) return DEFAULT_REVEAL_MS;
    let sum = 0;
    for (const s of sentences) {
        const so = asObj(s);
        if (so) sum += asNum(so.pause_after_ms, 0);
    }
    return sum > 0 ? sum : DEFAULT_REVEAL_MS;
}

/**
 * PCPL scene-derived reveal-complete time (WP-T1, 2026-07-23). The real fix
 * for the bug pcplRevealMs() above can't see: `pause_after_ms` is forbidden
 * on new concepts (Rule 31), so pcplRevealMs is always 0 → DEFAULT_REVEAL_MS
 * for every modern PCPL state, which makes the reveal_hold classification
 * (`reveal > DEFAULT_REVEAL_MS`, deriveHoldExpectations below) structurally
 * unreachable and false-fails D7 on every correctly-authored reveal-then-hold
 * state (scar: pcpl_reveal_hold_unreachable_under_rule31).
 *
 * Walks the state's scene_composition + state-level variable_choreography and
 * returns the LATEST sim-time (state-local ms) at which every scripted reveal
 * has settled — mirroring parametric_renderer.ts's OWN timing contracts
 * exactly (re-locate by grep anchor, not line number — that file is edited
 * often):
 *   - PM_animationGate — GENERIC to every primitive type (drawBody,
 *     drawForceArrow, drawSurface, drawAngleArc, drawVector, drawLocusTrace,
 *     drawFormulaBox, ... — 7 call sites, none type-gated): a primitive
 *     authored with appear_at_ms/animate_in_ms finishes fading IN at
 *     appear_at_ms + animate_in_ms; one authored with a finite
 *     disappear_at_ms finishes fading OUT at disappear_at_ms + fade_out_ms.
 *   - spec.animation.{delay_sec, duration_sec} — the one-shot `fade_in` and
 *     `translate` body-animation kinds (the only two ANIMATION_TYPES that
 *     declare these two fields) settle at (delay_sec+duration_sec)*1000. Read
 *     generically off the field NAMES, not gated to a type list — an
 *     animation kind that never sets these fields (rotate_continuous,
 *     pendulum, atwood, door_swing, ...) simply contributes nothing here.
 *   - animation.type === 'rotate_continuous' (WP-R5, PM_rotateContinuousDeg)
 *     — a decorative spin that never settles; contributes one period_ms so
 *     the frozen pin lands a full revolution past state entry rather than at
 *     a meaningless 0.
 *   - type: 'locus_trace' (WP-R5, drawLocusTrace) — a resampled historical
 *     trail, complete at its own end_ms (the renderer never samples past it).
 *   - state-level variable_choreography[] (WP-R5, PM_choreoValue /
 *     PM_choreoBuildSegments — NOT a scene_composition primitive, read off
 *     the state directly): a `mode: 'once'` entry's segments sum to
 *     duration_ms PLUS every hold's hold_ms (each hold is inserted as its OWN
 *     timeline segment, never carved out of duration_ms), so it settles at
 *     start_ms + duration_ms + sum(holds[].hold_ms). `loop`/`ping_pong`
 *     entries never settle — excluded here; deriveMotionExpectations declares
 *     those states in continuous motion instead (pcplHasContinuousChoreography
 *     below).
 *
 * Returns 0 (not DEFAULT_REVEAL_MS) when no timed reveal is found — the
 * single call site takes Math.max(pcplRevealMs, pcplSceneRevealMs) and
 * clampReveal() floors the combined result, so a bare 0 here defers cleanly to
 * whatever the narration proxy (or the floor) contributes.
 */
function pcplSceneRevealMs(state: Record<string, unknown>): number {
    const candidates: number[] = [];

    const scene = Array.isArray(state.scene_composition) ? state.scene_composition : [];
    for (const primRaw of scene) {
        const prim = asObj(primRaw);
        if (!prim) continue;

        // PM_animationGate contract — generic across every primitive type.
        candidates.push(asNum(prim.appear_at_ms, 0) + asNum(prim.animate_in_ms, 0));
        const disappearAt = prim.disappear_at_ms;
        if (typeof disappearAt === 'number') {
            candidates.push(disappearAt + asNum(prim.fade_out_ms, 0));
        }

        const anim = asObj(prim.animation);
        if (anim) {
            if (typeof anim.delay_sec === 'number' || typeof anim.duration_sec === 'number') {
                candidates.push(asNum(anim.delay_sec, 0) * 1000 + asNum(anim.duration_sec, 0) * 1000);
            }
            // rotate_continuous (WP-R5): decorative continuous spin, never
            // settles — contribute one period so the pin lands past a full
            // revolution instead of at a meaningless 0.
            if (anim.type === 'rotate_continuous') {
                candidates.push(asNum(anim.period_ms, 2000));
            }
        }

        // locus_trace (WP-R5): a resampled historical trail, complete at its
        // own end_ms (drawLocusTrace never samples past it).
        if (prim.type === 'locus_trace') {
            const startMs = asNum(prim.start_ms, 0);
            candidates.push(asNum(prim.end_ms, startMs + 2000));
        }
    }

    // variable_choreography (WP-R5, state-level — NOT a scene_composition
    // primitive). Mirrors PM_choreoValue's own default: an entry with no
    // `mode` field behaves as 'once' in the renderer, so it's treated as
    // 'once' here too.
    const choreo = Array.isArray(state.variable_choreography) ? state.variable_choreography : [];
    for (const specRaw of choreo) {
        const spec = asObj(specRaw);
        if (!spec) continue;
        const mode = typeof spec.mode === 'string' ? spec.mode : 'once';
        if (mode !== 'once') continue; // loop/ping_pong never settle — motion, not reveal
        const holds = Array.isArray(spec.holds) ? spec.holds : [];
        let holdSum = 0;
        for (const holdRaw of holds) {
            const hold = asObj(holdRaw);
            if (hold) holdSum += asNum(hold.hold_ms, 0);
        }
        candidates.push(asNum(spec.start_ms, 0) + asNum(spec.duration_ms, 0) + holdSum);
    }

    return candidates.length > 0 ? Math.max(...candidates) : 0;
}

/**
 * PCPL (WP-T1, WP-R5 field names): does this state declare a scripted
 * variable sweep or spin that runs FOREVER? Two shapes, both pure functions
 * of PM_simClockMs in the renderer so they're genuinely ongoing, not a
 * settle-then-freeze reveal:
 *   - a state-level variable_choreography entry with mode 'loop' or
 *     'ping_pong' (PM_choreoValue cycles it on the state clock indefinitely).
 *   - a scene_composition primitive with animation.type ===
 *     'rotate_continuous' (PM_rotateContinuousDeg — decorative spin, no
 *     settle time).
 * Used by deriveMotionExpectations to declare motion=true instead of letting
 * D7 demand stillness from a state that legitimately never stops (e.g.
 * scalar_vs_vector's S2 psi_pointer loop, once WP-F1 restores it). A 'once'
 * entry is deliberately excluded — it settles (pcplSceneRevealMs above), so
 * its post-settle tail is a reveal_hold, not motion.
 */
function pcplHasContinuousChoreography(state: Record<string, unknown>): boolean {
    const choreo = Array.isArray(state.variable_choreography) ? state.variable_choreography : [];
    for (const specRaw of choreo) {
        const spec = asObj(specRaw);
        if (spec && (spec.mode === 'loop' || spec.mode === 'ping_pong')) return true;
    }
    const scene = Array.isArray(state.scene_composition) ? state.scene_composition : [];
    for (const primRaw of scene) {
        const prim = asObj(primRaw);
        const anim = prim ? asObj(prim.animation) : null;
        if (anim && anim.type === 'rotate_continuous') return true;
    }
    return false;
}

// PCPL body-animation categories — mirror parametric_renderer.ts animatePrimitive
// (~L1027). CONTINUOUS types oscillate/spin forever (never settle → D7 stays strict,
// no still tail allowed); TRANSIENT types play once and settle (free_fall lands, a
// block slides to rest → the settled tail is a reveal_hold, D7 tolerant, but D5 still
// enforces the animation visibly PLAYED). A 'projectile' loops iff loop_period_sec>0.
const PCPL_CONTINUOUS_ANIM = new Set(['rotate_continuous', 'pendulum', 'door_swing']);
// fade_in (found by the mirror-sync test 2026-08-06): an opacity ramp on the
// state clock that plays once and settles — transient by D5 semantics. No live
// concept authors it today (53 hits are all dormant old-architecture JSONs),
// so adding it switches no existing gate ON.
const PCPL_TRANSIENT_ANIM = new Set(['free_fall', 'atwood', 'translate', 'slide_horizontal', 'slide_when_kinetic', 'fade_in']);

/** Scene-primitive animation blocks with a string type, for the categorizers below. */
function pcplSceneAnims(state: Record<string, unknown>): Array<Record<string, unknown>> {
    const scene = Array.isArray(state.scene_composition) ? state.scene_composition : [];
    const anims: Array<Record<string, unknown>> = [];
    for (const primRaw of scene) {
        const prim = asObj(primRaw);
        const anim = prim ? asObj(prim.animation) : null;
        if (anim && typeof anim.type === 'string') anims.push(anim);
    }
    return anims;
}

/** A scene body animation that oscillates/spins forever (never settles). */
function pcplHasContinuousBodyAnim(state: Record<string, unknown>): boolean {
    for (const anim of pcplSceneAnims(state)) {
        if (PCPL_CONTINUOUS_ANIM.has(anim.type as string)) return true;
        if (anim.type === 'projectile' && asNum(anim.loop_period_sec, 0) > 0) return true;
    }
    return false;
}

/**
 * A scene body animation that plays ONCE and settles (free_fall / atwood / translate /
 * slide / one-shot projectile). Declared motion=true so D5 confirms it visibly moved,
 * while deriveHoldExpectations keeps the settled tail a reveal_hold (dual classification,
 * mirroring the field_3d pef/dipole sweep). Closes the G3 coverage hole where an animated
 * PCPL state with neither auto_after_animation nor a loop silently skipped D5.
 */
function pcplHasTransientBodyMotion(state: Record<string, unknown>): boolean {
    for (const anim of pcplSceneAnims(state)) {
        if (PCPL_TRANSIENT_ANIM.has(anim.type as string)) return true;
        if (anim.type === 'projectile' && asNum(anim.loop_period_sec, 0) <= 0) return true;
    }
    return false;
}

/** Motion that never settles — state-level loop/ping_pong choreography OR a continuous body anim. */
function pcplHasContinuousMotion(state: Record<string, unknown>): boolean {
    return pcplHasContinuousChoreography(state) || pcplHasContinuousBodyAnim(state);
}

function clampReveal(ms: number): number {
    return Math.min(DURATION_MAX_MS, Math.max(DEFAULT_REVEAL_MS, ms));
}

/**
 * Per-state "all-reveals-complete" sim-time in ms (state-local). The screenshotter
 * pins the renderer clock here (SET_TIME_FREEZE) and polls window.PM_simTimeMs to
 * actually reach it before capturing — so a frame is photographed only once its
 * timed reveals have fired, regardless of headless rAF throttling.
 *
 * `config` may be the concept JSON (authoritative — has field_3d_config) or a
 * cached physics_config. Clamped to [1500, 60000] ms (DURATION_MAX_MS).
 */
export function deriveMaxRevealTimeMs(
    config: Record<string, unknown> | null,
): Record<string, number> {
    const out: Record<string, number> = {};

    const f3d = resolveField3dStates(config);
    if (f3d) {
        for (const [stateId, state] of Object.entries(f3d.states)) {
            const o = asObj(state);
            if (o) out[stateId] = clampReveal(maxRevealForField3dState(o, f3d.coilTurns));
        }
        return out;
    }

    // particle_field: the only timed reveals are the one-shot cues (field_on
    // etc.) — pin the frozen frame past the cue payoff (fade + cause-beat +
    // drift ramp, mirroring the renderer's Rule 32a choreography).
    const pfReveal = resolveParticleFieldStates(config);
    if (pfReveal) {
        for (const [stateId, stateRaw] of Object.entries(pfReveal)) {
            out[stateId] = clampReveal(pfRevealMs(asObj(stateRaw)));
        }
        return out;
    }

    // PCPL fallback (parametric is already wall-clock-correct; this keeps the
    // frozen-frame target consistent across renderers). WP-T1 (2026-07-23):
    // pcplRevealMs alone is structurally 0 (→ DEFAULT_REVEAL_MS) on every
    // Rule-31 concept, so take the scene-derived reveal time too and pin to
    // whichever signal lands later.
    for (const [stateId, state] of Object.entries(resolveStates(config))) {
        out[stateId] = clampReveal(Math.max(pcplRevealMs(state), pcplSceneRevealMs(state)));
    }
    return out;
}

function isPcplInteractive(state: Record<string, unknown>): boolean {
    return state.show_sliders === true || state.advance_mode === 'interaction_complete';
}

/**
 * Which states legitimately go still — so D7 (stuck-tail) / D1 (frozen) don't
 * false-fail on them:
 *   'reveal_hold' → one-shot timed reveal then holds (the payoff frame is static
 *                   by design once the reveal completes)
 *   'interactive' → user-driven (sliders/explorer); static until a drag the
 *                   headless harness never performs
 *   undefined     → unknown / genuinely continuous motion → keep the strict gate
 */

/**
 * combination_of_cells (particle_field, scenario_type 'internal_resistance'
 * EXTENDED with cell_topology/cell_count/flip_cell2 grouped-cell sliders — see
 * ccMode()/ccCombo()/ccFormula() in particle_field_renderer.ts): does this
 * guided state's grouped-cell circuit settle with i=0 (no bead flow) once its
 * one-shot (dock_cell/switch_close_cue/flip_cell/regroup/cycle_compare) has
 * landed? Re-derived from the AUTHORED post-one-shot TARGET fields
 * (dock_cell_topology_to, flip_cell2_to, regroup_topology_to, the
 * cycle_phase*_target_topology chain, switch_close_cue_to) — never the entry
 * pose alone — so a state whose one-shot CLOSES the loop (S3) or restores the
 * flip doesn't false-positive into reveal_hold, and a state whose one-shot
 * leaves it open/dead (S2 post-dock, S4's reversed-pair dead circuit, S5
 * post-regroup) correctly does. Gated by the caller on `cell_topology` being a
 * per-state field at all, so every other particle_field concept (no such
 * field) never reaches this function.
 */
function ccGroupedCellsEndsDead(st: Record<string, unknown>): boolean {
    // Final switch state: switch_close_cue's target overrides the entry lock;
    // otherwise the entry `switch` field; default closed if neither is authored.
    let switchOpen = typeof st.switch === 'number' ? st.switch < 0.5 : false;
    if (st.switch_close_cue === true) {
        const to = typeof st.switch_close_cue_to === 'number' ? st.switch_close_cue_to : 1;
        switchOpen = to < 0.5;
    }
    if (switchOpen) return true;   // no current can flow with the loop open

    // Final topology: dock_cell / regroup / cycle_compare's LAST topology-
    // changing phase (phase3, falling back to phase1) override the entry value.
    let topology = typeof st.cell_topology === 'string' ? st.cell_topology : 'single';
    if (st.dock_cell === true && typeof st.dock_cell_topology_to === 'string') {
        topology = st.dock_cell_topology_to;
    } else if (st.regroup === true && typeof st.regroup_topology_to === 'string') {
        topology = st.regroup_topology_to;
    } else if (st.cycle_compare === true) {
        if (typeof st.cycle_phase3_target_topology === 'string') topology = st.cycle_phase3_target_topology;
        else if (typeof st.cycle_phase1_target_topology === 'string') topology = st.cycle_phase1_target_topology;
    }

    // Final flip_cell2: flip_cell's target overrides the entry lock.
    let flip = typeof st.flip_cell2 === 'number' ? st.flip_cell2 : 0;
    if (st.flip_cell === true) {
        flip = typeof st.flip_cell2_to === 'number' ? st.flip_cell2_to : 1;
    }

    // eps_eq = 0 only in the series signed-sum reversed-pair dead zone; parallel/
    // single always keep eps_eq = emf > 0 (the identical-cells idealization).
    if (topology !== 'series') return false;
    const emf = typeof st.emf === 'number' ? st.emf : 1.5;
    const count = typeof st.cell_count === 'number' ? st.cell_count : 1;
    const epsEq = emf * (count - 2 * flip);
    return Math.abs(epsEq) < 1e-9;
}

export function deriveHoldExpectations(
    config: Record<string, unknown> | null,
): Record<string, 'reveal_hold' | 'interactive' | undefined> {
    const out: Record<string, 'reveal_hold' | 'interactive' | undefined> = {};
    const reveal = deriveMaxRevealTimeMs(config);

    // particle_field: thermal motion never stops, so guided states keep the
    // strict motion gate (undefined — D5/D6/D7 expect ongoing pixel movement).
    // The explore state (show_sliders: true = ALL control rows) is user-driven
    // → interactive, relaxing D7/D1 (its background jitter still moves anyway).
    const pfHold = resolveParticleFieldStates(config);
    if (pfHold) {
        for (const [stateId, stateRaw] of Object.entries(pfHold)) {
            const st = asObj(stateRaw);
            if (st && st.show_sliders === true) { out[stateId] = 'interactive'; continue; }
            // combination_of_cells: some guided states correctly settle to a
            // STATIC-but-live payoff pose after their one-shot lands — the switch
            // ends open (S2 post-dock, S5 post-regroup: i=0, no bead flow) or the
            // switch stays closed but the group's OWN eps_eq lands on exactly 0
            // (S4's reversed-pair "dead circuit, two live cells" — the state's own
            // teaching point). Declare those reveal_hold so D7's stuck-tail check
            // doesn't misread the settled payoff as "animation died". Every other
            // guided state (S1/S3/S6/S7) ends with current genuinely flowing →
            // keep the strict gate. Every other particle_field concept has no
            // `cell_topology` field at all, so this never fires for them.
            if (st && typeof st.cell_topology === 'string' && ccGroupedCellsEndsDead(st)) {
                out[stateId] = 'reveal_hold'; continue;
            }
            out[stateId] = undefined;
        }
        return out;
    }

    const f3d = resolveField3dStates(config);
    if (f3d) {
        const f3dScenarioType = resolveField3dScenarioType(config);
        for (const [stateId, stateRaw] of Object.entries(f3d.states)) {
            const state = asObj(stateRaw);
            if (!state) { out[stateId] = undefined; continue; }
            // earths_magnetism: every state is a live instrument (show_sliders true)
            // — the latitude/declination sliders + STATE_3 auto-sweep settle to a
            // static-but-live frame the headless harness never drags. Classify as
            // interactive so D7 (stuck-tail) / D1 (frozen) don't false-fail.
            const emHold = asObj(state.em);
            if (emHold) { out[stateId] = 'interactive'; continue; }
            // magnetic_field_concept_B (straight_wire_current): every state is
            // LIVE (show_sliders true — Rule 31), so the generic show_sliders
            // catch below would swallow S1-S6's genuine reveal-then-hold beats
            // into 'interactive' before they ever reach it. Classify explicitly
            // per mode instead (mirrors the mag/faraday guided-vs-sandbox split in
            // deriveMotionExpectations above): the sandbox explore state (S7) is
            // user-driven → interactive; every other mode is a one-shot reveal
            // (switch ramp / compass swing+hop / rings-assemble / dual-compare)
            // that then HOLDS → reveal_hold, so D7/D1p permit the settled tail.
            const swcHold = asObj(state.swc);
            if (swcHold) {
                out[stateId] = (swcHold.mode === 'sandbox') ? 'interactive' : 'reveal_hold';
                continue;
            }
            // motional_emf_rod (motional_emf): every state is LIVE (show_sliders
            // true — Rule 31), so the generic show_sliders catch below would
            // swallow S1-S6's genuine reveal-then-hold beats into 'interactive'
            // before they ever reach it. Classify explicitly per mode instead
            // (mirrors the mag/faraday/swc guided-vs-sandbox split above): the
            // sandbox explore state (S7) is user-driven → interactive; every
            // other mode is a guided beat that settles to a HOLD, so D7/D1p
            // permit the settled tail.
            const memHold = asObj(state.motional_emf_rod);
            if (memHold) {
                out[stateId] = (memHold.mode === 'sandbox') ? 'interactive' : 'reveal_hold';
                continue;
            }
            // eddy_currents (eddy_current_pendulum): every state is LIVE
            // (show_sliders true — Rule 31), so the generic show_sliders catch
            // below would swallow S1-S5's genuine reveal-then-hold beats into
            // 'interactive' before they ever reach it. Classify explicitly per
            // mode instead (mirrors the mag/faraday/swc/mem guided-vs-sandbox
            // split above): the sandbox explore state (S6) is user-driven →
            // interactive; every other mode is a guided beat (continuous decay/
            // oscillation/contrast/crossfade) that never truly settles static,
            // but is still treated as a reveal-then-hold class for D7/D1p
            // purposes since the pacing is on the state's own clock.
            const ecpHold = asObj(state.eddy_current_pendulum);
            if (ecpHold) {
                out[stateId] = (ecpHold.mode === 'sandbox') ? 'interactive' : 'reveal_hold';
                continue;
            }
            // inductance: every state is LIVE (show_sliders true — Rule 31), so
            // the generic show_sliders catch below would swallow S1-S6's genuine
            // reveal-then-hold beats into 'interactive' before they ever reach it.
            // Classify explicitly per mode (mirrors the faraday/swc/mem/ecp split
            // above): the explore state (S7) is user-driven → interactive; every
            // other mode is a guided beat that settles to a HOLD (or runs a
            // continuous ambient on its own clock), so D7/D1p permit the tail.
            const indHold = asObj(state.inductance);
            if (indHold) {
                out[stateId] = (indHold.mode === 'explore') ? 'interactive' : 'reveal_hold';
                continue;
            }
            // ac_generator: every state is LIVE (show_sliders true — Rule 31), so
            // the generic show_sliders catch below would swallow S1-S5's genuine
            // reveal-then-hold beats into 'interactive' before they ever reach it.
            // Classify explicitly per mode (mirrors the inductance/faraday/swc split
            // above): the sandbox explore state (S6) is user-driven → interactive;
            // every other mode is a guided beat whose payoff (the graph trace, the
            // phase relationship) is established and then runs steadily on the
            // state's own clock → reveal_hold, so D7/D1p permit the settled tail.
            const acgHold = asObj(state.ac_generator);
            if (acgHold) {
                out[stateId] = (acgHold.mode === 'sandbox') ? 'interactive' : 'reveal_hold';
                continue;
            }
            // ac_resistor: every state is LIVE (show_sliders true — Rule 31), so
            // the generic show_sliders catch below would swallow S1-S8's genuine
            // reveal-then-hold beats into 'interactive' before they ever reach
            // it. Classify explicitly (mirrors the ac_generator/inductance/mfl/
            // capacitance guided-vs-explore split above): the S9 sandbox (mode
            // 'explore') is user-driven → interactive; every other mode is a
            // guided beat whose payoff (cursor sample / product walk / twin
            // match / square-settle / fold) is established and then runs
            // steadily on the state's own clock (beads/heater keep moving even
            // after the payoff, per the checklist's "no frozen tail" —
            // reveal_hold permits exactly that settled-but-still-live tail).
            const acrHold = asObj(state.ac_resistor);
            if (acrHold) {
                out[stateId] = (acrHold.mode === 'explore') ? 'interactive' : 'reveal_hold';
                continue;
            }
            // ac_inductor: every state is LIVE (show_sliders true — Rule 31),
            // so the generic show_sliders catch below would swallow S1-S8's
            // genuine reveal-then-hold beats into 'interactive' before they
            // ever reach it. Classify explicitly (mirrors the ac_resistor/
            // ac_generator/inductance split above): the S9 sandbox (mode
            // 'explore') is user-driven → interactive; every other mode is a
            // guided beat whose payoff (ghost-compare / tangent stop / ramp
            // plateau / product walk / fold) is established and then runs
            // steadily on the state's own clock → reveal_hold, so D7/D1p
            // permit the settled-but-still-live tail (S8's own 3D apparatus
            // intentionally holds a static dimmed pose per physics_block §3
            // S8, but its scope panes keep moving — still a legitimate
            // reveal_hold, not a frozen tail).
            const acIndHold = asObj(state.ac_inductor);
            if (acIndHold) {
                out[stateId] = (acIndHold.mode === 'explore') ? 'interactive' : 'reveal_hold';
                continue;
            }
            // ac_capacitor: every state is LIVE (show_sliders true — Rule 31),
            // so the generic show_sliders catch below would swallow S1-S8's
            // genuine reveal-then-hold beats into 'interactive' before they
            // ever reach it. Classify explicitly (mirrors the ac_inductor/
            // ac_resistor/ac_generator/inductance split above): the S9
            // sandbox (mode 'explore') is user-driven → interactive; every
            // other mode is a guided beat whose payoff (ghost-compare / lead
            // bracket / fill-spill loop / tangent stop / ramp plateau /
            // product walk / fold) is established and then runs steadily on
            // the state's own clock → reveal_hold, so D7/D1p permit the
            // settled-but-still-live tail (S8's own 3D apparatus
            // intentionally holds a static dimmed pose per physics_block §3
            // S8, but its scope panes keep moving — still a legitimate
            // reveal_hold, not a frozen tail).
            const acCapHold = asObj(state.ac_capacitor);
            if (acCapHold) {
                out[stateId] = (acCapHold.mode === 'explore') ? 'interactive' : 'reveal_hold';
                continue;
            }
            // ac_phasor: every state is LIVE (show_sliders true — Rule 31), so
            // the generic show_sliders catch below would swallow S1-S7's genuine
            // reveal/freeze-then-hold beats into 'interactive' before they ever
            // reach it. Classify explicitly (mirrors the ac_capacitor/ac_inductor
            // split above): the S8 sandbox (mode 'explore') is user-driven →
            // interactive; every other mode is a guided beat whose payoff (the
            // congruent trace / frozen 90° angle / mirror flip / crossing order /
            // scoreboard / chain) is established and then holds on the state's
            // own clock → reveal_hold, so D7/D1p permit the settled-but-live tail
            // (the S2/S4 bounded freezes + S6's scoreboard hold are legitimate
            // reveal_hold, not frozen tails).
            const acPhasorHold = asObj(state.ac_phasor);
            if (acPhasorHold) {
                out[stateId] = (acPhasorHold.mode === 'explore') ? 'interactive' : 'reveal_hold';
                continue;
            }
            // ac_series_lcr: every guided beat is a reveal/ramp/freeze-then-hold on
            // the state's own clock; the explore state (mode 'explore') is
            // user-driven -> interactive.
            const acSeriesLcrHold = asObj(state.ac_series_lcr);
            if (acSeriesLcrHold) {
                out[stateId] = (acSeriesLcrHold.mode === 'explore') ? 'interactive' : 'reveal_hold';
                continue;
            }
            // ac_power: every guided beat is a reveal/ramp/hold on the state's own
            // clock (the meter climb / product-wave build / f-glide / ghost-strike /
            // component split / R-cycle / energy ledger / triangle morph / chain all
            // settle then hold); the explore state (mode 'explore') is user-driven
            // -> interactive.
            const acPowerHold = asObj(state.ac_power);
            if (acPowerHold) {
                out[stateId] = (acPowerHold.mode === 'explore') ? 'interactive' : 'reveal_hold';
                continue;
            }
            // lc_oscillation: every state exposes at least the relevant slider
            // row(s) (Rule 31 controls), so the generic show_sliders catch below
            // would swallow S1-S8's guided reveal/ramp/hold beats into 'interactive'
            // before they ever reach it. Classify explicitly (mirrors the ac_power/
            // magnetic_flux_loop split above): the explore state (mode 'explore', S9)
            // is user-driven -> interactive; every other mode is a guided beat that
            // plays then settles to a HOLD (caught by maxRevealForField3dState
            // above) -> reveal_hold.
            const lcOscHold = asObj(state.lc_oscillation);
            if (lcOscHold) {
                out[stateId] = (lcOscHold.mode === 'explore') ? 'interactive' : 'reveal_hold';
                continue;
            }
            // transformer (Ch.7 §7.9): every state exposes at least the relevant
            // slider row(s) (Rule 31 controls), so the generic show_sliders catch
            // below would swallow S1-S10's guided reveal/ramp/hold beats into
            // 'interactive' before they ever reach it. Classify explicitly (mirrors
            // the lc_oscillation split above): the explore state (mode 'explore',
            // S11) is user-driven -> interactive; every other mode is a guided beat
            // that plays then settles to a HOLD (caught by maxRevealForField3dState
            // above) -> reveal_hold.
            const tfrHold = asObj(state.transformer);
            if (tfrHold) {
                out[stateId] = (tfrHold.mode === 'explore') ? 'interactive' : 'reveal_hold';
                continue;
            }
            // magnetic_flux_loop: every state exposes at least the relevant
            // slider row(s) (Rule 31), so the generic show_sliders catch below
            // would swallow S1-S5's guided idle-sweep-then-HOLD beats into
            // 'interactive' before they ever reach it. Classify explicitly
            // (mirrors the ac_generator/inductance split above): the explore
            // state (mode: 'explore', S6) is user-driven → interactive; every
            // other mode is a guided beat that idle-sweeps then settles to a
            // HOLD (caught by maxRevealForField3dState above) → reveal_hold.
            const mflHold = asObj(state.magnetic_flux_loop);
            if (mflHold) {
                out[stateId] = (mflHold.mode === 'explore') ? 'interactive' : 'reveal_hold';
                continue;
            }
            // kinematics_1d_track (displacement_vs_distance): every state is
            // LIVE (show_sliders true — Rule 31), so the generic show_sliders
            // catch below would swallow S1-S5's guided choreograph-then-HOLD
            // beats into 'interactive' before they ever reach it. Classify
            // explicitly (mirrors the ac_generator/inductance/mfl guided-vs-
            // sandbox split above): the explore state (mode: 'sandbox', S6)
            // is user-driven → interactive; every other mode is a guided beat
            // that settles to a HOLD (caught by maxRevealForField3dState
            // above) → reveal_hold.
            const ktHold = asObj(state.track);
            if (ktHold) {
                out[stateId] = (ktHold.mode === 'sandbox') ? 'interactive' : 'reveal_hold';
                continue;
            }
            // capacitance (Q = CV, C = ε₀A/d — 2026-07-21 engine ask): every state
            // exposes at least the relevant slider row(s) (Rule 31 controls/
            // static_readouts), so the generic show_sliders catch below would
            // swallow S1-S6's genuine ramp-then-HOLD beats into 'interactive'
            // before they ever reach it. Classify explicitly (mirrors the
            // magnetic_flux_loop/inductance/ac_generator split above): the
            // explore state (mode:'explore', S7) is user-driven -> interactive;
            // every other mode is a guided beat that ramps then settles to a
            // HOLD (caught by maxRevealForField3dState above) -> reveal_hold.
            const capHold = asObj(state.capacitance);
            if (capHold) {
                out[stateId] = (capHold.mode === 'explore') ? 'interactive' : 'reveal_hold';
                continue;
            }
            // displacement_current: every state is LIVE (show_sliders true — Rule
            // 31), so the generic show_sliders catch below would swallow S1-S9's
            // genuine reveal-then-hold beats into 'interactive' before they ever
            // reach it. Classify explicitly (mirrors the capacitance/ac_generator
            // split above): the sandbox explore state (displacement_sandbox, S10)
            // is user-driven → interactive; every other mode is a guided beat whose
            // one-shot payoff (pinned in maxRevealForField3dState) then settles to a
            // HOLD → reveal_hold, so D7/D1p permit the settled tail (S8 is a
            // reveal_hold frozen snapshot by construction).
            const dcHold = asObj(state.displacement_current);
            if (dcHold) {
                out[stateId] = (dcHold.mode === 'displacement_sandbox') ? 'interactive' : 'reveal_hold';
                continue;
            }
            // em_wave_propagation: every guided beat is LIVE (Rule 31 contextual
            // rows on S6+), so the generic show_sliders catch below would swallow
            // their genuine reveal-then-hold cues (motes vanish + chip pin, gate
            // dock) into 'interactive' before they reach it. Classify explicitly
            // (mirrors the displacement_current/capacitance split above): the explore
            // sandbox (em_wave.interactive) is user-driven → interactive; every other
            // beat's one-shot cue payoff (pinned in maxRevealForField3dState) settles
            // to a HOLD over the perpetually-running train → reveal_hold, so D7/D1p
            // permit the settled overlay tail.
            const emwHold = asObj(state.em_wave);
            if (emwHold) {
                out[stateId] = (emwHold.interactive === true) ? 'interactive' : 'reveal_hold';
                continue;
            }
            // molecular_geometry (VSEPR — CHEMISTRY): every state exposes at least a
            // static readout row (Rule 31 controls/static_readouts), so the generic
            // show_sliders catch below would swallow the guided shape beats into
            // 'interactive' before they reach it. Classify explicitly (mirrors the
            // capacitance/em_wave guided-vs-explore split above): the sandbox
            // (mode 'explore') is user-driven → interactive; every other mode is a
            // guided beat whose one-shot ramp payoff (pinned in
            // maxRevealForField3dState) settles to a HOLD over the perpetual slow
            // turn → reveal_hold, so D7/D1p permit the settled tail.
            const mgHold = asObj(state.molecular_geometry);
            if (mgHold) {
                out[stateId] = (mgHold.mode === 'explore') ? 'interactive' : 'reveal_hold';
                continue;
            }
            // orbital_shapes (ATOMIC ORBITALS — CHEMISTRY): several guided beats
            // expose a live contextual row (the dots slider on S2, the probe on
            // S4), so the generic show_sliders catch below would swallow them into
            // 'interactive' before they reach it. Classify explicitly (mirrors the
            // capacitance / molecular_geometry guided-vs-explore split above): the
            // sandbox (mode 'explore') is user-driven → interactive; every other
            // mode is a guided beat whose one-shot ramp payoff (pinned in
            // maxRevealForField3dState) settles to a HOLD — over a perpetual slow
            // turn where the state authors one — so D7/D1p permit the settled tail.
            // bonding_scene (CHEMISTRY BONDING WAVE): every state exposes at
            // least a contextual control row (Rule 31 ring-gated `controls`), so
            // the generic show_sliders catch below would swallow the guided beats
            // into 'interactive' before they reach it. Classify explicitly
            // (mirrors the capacitance / molecular_geometry / orbital_shapes
            // guided-vs-explore split above): the sandbox (mode 'explore') is
            // user-driven → interactive; every other mode is a guided beat whose
            // one-shot payoff (pinned in maxRevealForField3dState) settles to a
            // HOLD over the perpetual turn/jiggle → reveal_hold, so D7/D1p permit
            // the settled tail instead of false-failing it.
            const bscHold = asObj(state.bonding_scene);
            if (bscHold) {
                out[stateId] = (bscHold.mode === 'explore') ? 'interactive' : 'reveal_hold';
                continue;
            }
            const osHold = asObj(state.orbital_shapes);
            if (osHold) {
                out[stateId] = (osHold.mode === 'explore') ? 'interactive' : 'reveal_hold';
                continue;
            }
            // newtons_laws_body (Laws of Motion): every state exposes its own
            // contextual slider row(s) (Rule 31 `controls_visible`), so a generic
            // catch must never decide these. Classify explicitly per mode (mirrors
            // the ac_generator/inductance/mfl guided-vs-sandbox split above): the
            // final sandbox state (mode: 'sandbox', trusted_drag_seizes, Rule 37
            // free-run) is user-driven → interactive; every other mode is a guided
            // beat that either settles to a HOLD (rest_equilibrium, coast_with_
            // friction's stop, the FBD/incline arrow overlays) or runs its
            // integrator steadily on the state's own clock after the phases[]
            // script has fired → reveal_hold, so D7 (stuck tail) / D1p (frozen)
            // permit the settled tail instead of false-failing it. Both branches
            // are pure RELAXATIONS in pixelGate — neither asserts stillness, so a
            // continuously-accelerating beat is not mis-gated by reveal_hold.
            //   SEAM L — site (ii) of the mandatory deriveStateMeta co-edit
            //   (skeleton spec note 15). SEAM K added a THIRD shape to this
            //   scenario that the two-way split above did not anticipate: a state
            //   with `loop_reset_ms` LOOPS. A genuine integrator has no phase to
            //   wrap — a slide that ends is over — so loop_reset_ms restarts the
            //   kinematics every R ms and the state runs forever. Its payoff IS the
            //   repetition, exactly as bar_magnet_as_dipole STATE_2's loop trace is
            //   (see that branch below), and it has no settled tail at all.
            //     It is classified 'reveal_hold' ANYWAY, deliberately, and this is
            //   the considered call rather than an omission: 'reveal_hold' is a
            //   pure RELAXATION in pixelGate (it never asserts stillness, so a
            //   perpetually looping state cannot false-fail on moving pixels),
            //   while the strict gate `undefined` WOULD assert motion — and a
            //   spring state legitimately passes through v = 0 at the turnaround,
            //   where a dense frame pair would read as stuck. Relaxing is safe in
            //   both directions here; asserting is not.
            //     The sandbox (Rule 37 free-run under the teacher, trusted_drag_
            //   seizes) stays 'interactive' — user-driven, D1p must not pin it.
            const nlbHold = asObj(state.newtons_laws_body);
            if (nlbHold) {
                out[stateId] = (nlbHold.mode === 'sandbox') ? 'interactive' : 'reveal_hold';
                continue;
            }
            // force_rig (Laws of Motion, off-axis forces): every state exposes its
            // own contextual slider row(s) (Rule 31 `controls_visible`), so the
            // generic show_sliders catch must never decide these. The explore
            // sandbox is the state that declares `trusted_drag_seizes` (Rule 37
            // free-run under the teacher) → interactive; every other state is a
            // guided beat whose ramp/phase payoff settles to a HOLD (the ring stops
            // where the pulls balance) → reveal_hold, so D7 (stuck tail) / D1p
            // (frozen) permit the settled tail instead of false-failing it. Both
            // branches are pure RELAXATIONS in pixelGate — neither asserts
            // stillness, so a still-settling beat is not mis-gated.
            const frigHold = asObj(state.force_rig);
            if (frigHold) {
                out[stateId] = frigHold.trusted_drag_seizes === true ? 'interactive' : 'reveal_hold';
                continue;
            }
            // rigid_body_rotation (Class-11 Ch.7): every state exposes its own
            // contextual control row(s) (Rule 31 `controls_visible`), so the
            // generic show_sliders catch must never decide these. The explore
            // sandbox (mode 'sandbox' / trusted_drag_seizes, Rule 37 free-run) is
            // user-driven -> interactive; every other state is a guided beat
            // whose ramp / brake / restart payoff HOLDS for the rest of the state
            // (the one-shot-hold contract) -> reveal_hold, so D7 (stuck tail) and
            // D1p (frozen) permit the held tail instead of false-failing it.
            //   Both branches are pure RELAXATIONS in pixelGate — neither asserts
            // stillness — which is what makes reveal_hold the right call even for
            // the LOOPING run-cut state (S6): a looping beat can never false-fail
            // on moving pixels, whereas the strict `undefined` gate would ASSERT
            // motion and a state braked to rest legitimately has none.
            const rbrHold = asObj(state.rigid_body_rotation);
            if (rbrHold) {
                out[stateId] = (rbrHold.mode === 'sandbox' || rbrHold.trusted_drag_seizes === true)
                    ? 'interactive' : 'reveal_hold';
                continue;
            }
            // bar_magnet_as_dipole: S4 (flip) and S7 (r-sweep) are LIVE
            // (show_sliders true — Rule 31 contextual m/r rows), so the generic
            // show_sliders catch below would swallow their genuine reveal-then-
            // hold beats into 'interactive' before they ever reach it. Classify
            // explicitly (mirrors the ac_generator/inductance/mfl guided-vs-
            // sandbox split above): STATE_2's loop trace genuinely cycles
            // forever (the payoff IS the repetition) so it stays in the strict
            // motion gate (undefined, mirrors gauss flow:true) rather than
            // reveal_hold; every other state with one of these unique bar-
            // magnet extras keys (S1 compass settle, S3 break+hold-open
            // payoff, S4 flip, S5 solenoid cross-fade, S6 ghost-ratio+orbit, S7
            // r-sweep+ghost+callout, S8 edipole glide) is a one-shot
            // choreography that then HOLDS -> reveal_hold. STATE_9 (both m AND
            // r, no scripted choreography, none of these keys) falls through to
            // the generic show_sliders catch right below -> interactive.
            const bmDipoleHold = asObj(state.extras);
            if (bmDipoleHold && (bmDipoleHold.loop_choreography || bmDipoleHold.break_anim
                || bmDipoleHold.flip_anim || bmDipoleHold.solenoid_crossfade
                || bmDipoleHold.ghost_ratio_pair || bmDipoleHold.compass_settle
                || bmDipoleHold.r_sweep_theta_locked === true || bmDipoleHold.edipole_glide)) {
                out[stateId] = bmDipoleHold.loop_choreography ? undefined : 'reveal_hold';
                continue;
            }
            // bar_magnet_in_uniform_field (Ch.5 rebuild, 2026-07-12): STATE_4
            // (damped_swing) and STATE_7 (damped_pendulum) are genuine one-shot
            // settle choreographies that then HOLD their end pose (the compass-
            // needle spring-back / the unstable-to-stable flip) — but the shared
            // torque-loop engine's rotation_mode lives at the TOP LEVEL of the
            // state (not nested in a block like pef/mag/swc), so without this
            // branch they fall through this entire dispatch chain unclassified
            // and land on the generic reveal[]-based fallback below, which has
            // no candidate push for this scenario's rotation_mode (maxReveal
            // defaults to DEFAULT_REVEAL_MS) — so they land on 'undefined'
            // (strict motion gate) and D7 false-fails "animation died mid-state"
            // once the settle finishes (~6-7s) well before the state's declared
            // duration (24s/28s). Classify these TWO settling modes reveal_hold
            // directly (bypassing the reveal-time fallback, same as the emHold/
            // swcHold/memHold/etc. direct-classification pattern above). Scoped
            // tightly to this scenario_type so the sibling dipole_in_uniform_
            // field (electric_dipole_in_field) is untouched — its own guided
            // states using these same rotation_mode values already carry
            // show_sliders:true and are caught 'interactive' by the check right
            // below (verified live: electric_dipole_in_field.json STATE_7
            // damped_pendulum has show_sliders:true), so it never relied on the
            // old undefined/strict classification in the first place.
            if (f3dScenarioType === 'bar_magnet_in_uniform_field') {
                const bmfRmHold = typeof state.rotation_mode === 'string' ? state.rotation_mode : null;
                if (bmfRmHold === 'damped_swing' || bmfRmHold === 'damped_pendulum') {
                    out[stateId] = 'reveal_hold'; continue;
                }
            }
            if (state.show_sliders === true) { out[stateId] = 'interactive'; continue; }
            // charge_distribution explore state: the density slider drives the
            // net-field arrow; static until a drag the headless harness never does.
            const cdHold = asObj(state.charge_dist);
            if (cdHold && cdHold.density_slider === true) { out[stateId] = 'interactive'; continue; }
            // electric_flux: theta/charge sliders are user-driven (static until a
            // drag the headless harness never performs). The theta_anim / face-
            // accumulate states are caught by the reveal_hold fallback below
            // (their maxReveal > DEFAULT_REVEAL_MS via maxRevealForField3dState).
            const fluxHold = asObj(state.flux);
            if (fluxHold && (fluxHold.charge_slider === true || fluxHold.theta_slider === true)) { out[stateId] = 'interactive'; continue; }
            // gauss_law explore state: the q_enc / surface_shape / charge_x
            // sliders drive the live Φ = q_enc/ε₀ readout; static until a drag the
            // headless harness never performs.
            const gaussHold = asObj(state.gauss);
            if (gaussHold && gaussHold.sliders === true) { out[stateId] = 'interactive'; continue; }
            // gauss_law flow:true states (STATE_1 hook, STATE_4 outside-charge):
            // the field lines flow continuously, so this is ongoing motion — NOT a
            // reveal-then-hold. Mark undefined to keep the strict motion gate, so
            // D5/D6/D7 expect ongoing pixel motion rather than a static tail.
            if (gaussHold && gaussHold.flow === true) { out[stateId] = undefined; continue; }
            // gauss_law_sphere explore state: the r_gauss slider drives the live
            // readout / arrows / E-vs-r plot — static until a drag the headless
            // harness never performs (its idle auto-sweep is supplementary). The
            // STATE_2/3/4/5/6 reveal beats are one-shot reveals then hold — caught
            // by the reveal_hold fallback below (their maxReveal > DEFAULT_REVEAL_MS
            // via the gauss_sphere block in maxRevealForField3dState above).
            const gsphHold = asObj(state.gauss_sphere);
            if (gsphHold && gsphHold.sliders === true) { out[stateId] = 'interactive'; continue; }
            // gauss_law_line explore state: the λ / r sliders drive the live readout /
            // ring arrows / E-vs-r plot — static until a drag the headless harness
            // never performs (the idle auto-sweep is supplementary). The guided
            // reveal states (ring, end-cap-zero-flux, derivation, coordinated sweep)
            // are one-shot reveals then hold — caught by the reveal_hold fallback
            // below (maxReveal > DEFAULT_REVEAL_MS via the gauss_line block in
            // maxRevealForField3dState above).
            const glnHold = asObj(state.gauss_line);
            if (glnHold && glnHold.sliders === true) { out[stateId] = 'interactive'; continue; }
            // gauss_law_sheet explore state: the σ / d sliders drive the live readout /
            // CONSTANT cap arrows / FLAT E-vs-d plot — static until a drag the headless
            // harness never performs (the idle auto-sweep MOVES the field-point geometry
            // hands-free, but is supplementary to the hold-intent). The guided reveal
            // states (cap-pierce, wall-zero-flux, A-cancel derivation, coordinated
            // d-sweep) are one-shot reveals then hold — caught by the reveal_hold
            // fallback below (maxReveal > DEFAULT_REVEAL_MS via the gauss_sheet block
            // in maxRevealForField3dState above).
            const gssHold = asObj(state.gauss_sheet);
            if (gssHold && gssHold.sliders === true) { out[stateId] = 'interactive'; continue; }
            // electric_potential_meaning / electric_potential_point_charge: classify
            // per the `potential` block —
            //   draggable_test_charge → the explorer state (STATE_7 in the meaning
            //     sibling, STATE_6 here with live_curve_dot + sign_toggle). The test
            //     charge renders at full + idle auto-sweeps, but a real DRAG / toggle
            //     is user-driven and the headless harness never performs it →
            //     interactive.
            //   animate_route / release_at_ms → STATE_2/3 (meaning) are declared MOTION
            //     in deriveMotionExpectations (D5/D6 expect the travel/fly-out to move
            //     pixels), but the choreography plays ONCE and then HOLDS its end pose
            //     (route 2 lands its tally ~16.5s into a 22s state; the release drains
            //     the badge ~8.7s into an 18s state) → reveal_hold, the same
            //     motion+hold pairing as the dipole_potential sweep/theta_sweep branch
            //     below, so D7 permits the authored post-choreography tail instead of
            //     false-failing "animation died" (seen live 2026-07-06, THE EYE run
            //     20260706 electric_potential_meaning S2/S3).
            //   the remaining beats (q→2q grow, ΔV/∞ markers, shells, V write-in, the
            //     point_charge halve-r slide+count-up, the V-vs-r curve draw + gap, the
            //     sign-flip recolor) are one-shot reveals then HOLD → reveal_hold via
            //     the fallback below (their maxReveal > DEFAULT_REVEAL_MS via the
            //     `potential` block in maxRevealForField3dState above).
            const potHold = asObj(state.potential);
            if (potHold) {
                if (potHold.draggable_test_charge === true) { out[stateId] = 'interactive'; continue; }
                // electric_potential_dipole STATE_7: draggable_probe + θ/r sliders →
                // user-driven (the headless harness never drags) → interactive.
                if (potHold.draggable_probe === true) { out[stateId] = 'interactive'; continue; }
                const routes = Array.isArray(potHold.animate_route) && potHold.animate_route.length > 0;
                if (routes || typeof potHold.release_at_ms === 'number') { out[stateId] = 'reveal_hold'; continue; }
                // dipole_potential STATE_3 `sweep` / STATE_5 `theta_sweep`: both are
                // one-shot probe sweeps that play ONCE then HOLD their end pose (STATE_5
                // holds the finished cosine curve; STATE_3 holds the probe at θ=140° with
                // V settled at its negative value). They ARE declared motion (they move
                // mid-state — deriveMotionExpectations), but the only thing moving is a
                // small probe dot + a sub-0.1% V-readout recolor, so once the sweep ends
                // the frame is legitimately static. Their hold intent is therefore
                // reveal_hold so D7 permits the expected post-sweep frozen tail (the same
                // relaxation parallel_plates reveal states get) instead of a stuck-
                // animation false-fail.
                if (asObj(potHold.theta_sweep) || asObj(potHold.sweep)) { out[stateId] = 'reveal_hold'; continue; }
                // Any OTHER potential state has NO continuous driver (no drag, no
                // route travel, no release fly-out — those are the only motion sources
                // in the potential arc). It is therefore a reveal-THEN-HOLD state: it
                // fades its elements in on the state/TTS clock (the faint shells + V
                // labels of a RECALL HOOK like STATE_1, or the one-shot reveal beats of
                // STATE_2/4/5) and then holds a static payoff frame. Classify it
                // reveal_hold directly — not via the maxReveal>DEFAULT fallback, which
                // mis-classifies a static hook (e.g. STATE_1, whose only reveals are
                // TTS appear_at_ms shell fades, NOT keys the potential block exposes to
                // maxRevealForField3dState) as motion and false-fails D7. Generic: true
                // for every non-drag, non-route, non-release potential state.
                out[stateId] = 'reveal_hold'; continue;
            }
            // amperes_circuital_law: classify per acl_element.mode —
            //   'integrated' → slider explore (user-driven; the renderer renders at
            //                  full immediately + tracks I/r, but the headless
            //                  harness never drags) → interactive.
            //   'march'/'accumulate' → continuous/one-shot MOTION (declared in
            //                  deriveMotionExpectations) → keep the strict gate
            //                  (undefined), so D5/D6/D7 expect pixels to move.
            //   'unroll'/'static' → the ring straightens then HOLDS, or is a static
            //                  result frame → reveal_hold (caught by the fallback
            //                  below since maxReveal > DEFAULT_REVEAL_MS via the
            //                  acl_element block in maxRevealForField3dState).
            // potential_energy_system_of_charges (system_pe_assembly): the per-state
            // `assembly` block flies charges in then lights pair bonds + fills the
            // signed meter, all one-shot reveals that HOLD their end pose (Rule 26).
            // STATE_6 (draggable_id + show_sliders) is user-driven → interactive
            // (already caught by the show_sliders check above); every other state is a
            // reveal-then-hold, so D7/D1p must permit the post-assembly frozen tail.
            const asmHold = asObj(state.assembly);
            if (asmHold) {
                if (asmHold.draggable_id != null) { out[stateId] = 'interactive'; continue; }
                out[stateId] = 'reveal_hold'; continue;
            }
            // pe_external_field: STATE_9 (show_sliders) is already caught above
            // (interactive). Every other pef state is a one-shot reveal / fly-in /
            // slide / sign-flip / collapse / bounded rotation that then HOLDS its end
            // pose - so D7 must permit the post-motion frozen tail (the same relaxation
            // the dipole_potential sweep + system_pe assembly states get). The motion
            // ones are ALSO declared motion in deriveMotionExpectations (dual
            // classification, mirroring the theta_sweep pattern) so D5/D6 still expect
            // mid-state pixel movement.
            const pefHold = asObj(state.pef);
            if (pefHold) { out[stateId] = 'reveal_hold'; continue; }
            const aclHold = asObj(state.acl_element);
            if (aclHold && typeof aclHold.mode === 'string') {
                if (aclHold.mode === 'integrated') { out[stateId] = 'interactive'; continue; }
                if (aclHold.mode === 'march' || aclHold.mode === 'accumulate') { out[stateId] = undefined; continue; }
                // PHYSICAL mode (founder video #2): STATE_7 = unroll + show_ienc shows
                // the 3D rod with CONTINUOUS current flow (declared motion above) →
                // keep the strict motion gate (undefined), like the gauss flow:true
                // states, so D5/D6/D7 expect ongoing pixel motion rather than a static
                // tail. (STATE_6 unroll without show_ienc is the 2D ring→bar stage
                // that HOLDS → reveal_hold via the fallback below.)
                if (aclHold.mode === 'unroll' && aclHold.show_ienc === true) { out[stateId] = undefined; continue; }
                // STATE_6 'unroll' (no show_ienc) / 'static' → reveal_hold fallback.
            }
            // The gauss equation_at_ms / morph / add_charge states are one-shot
            // reveals then hold — caught by the reveal_hold fallback below (their
            // maxReveal > DEFAULT_REVEAL_MS via maxRevealForField3dState above).
            const tm = state.trajectory_mode;
            const moves = typeof tm === 'string' && tm !== 'static' && tm !== 'frozen' && tm !== 'none';
            if (moves) { out[stateId] = undefined; continue; }
            out[stateId] = (reveal[stateId] ?? 0) > DEFAULT_REVEAL_MS ? 'reveal_hold' : undefined;
        }
        return out;
    }

    // PCPL — parametric is wall-clock-correct, but interactive/reveal-hold states
    // still false-trip the motion gates. Classification by settle behaviour:
    //   • never settles (loop/ping_pong choreography, or an oscillating/spinning
    //     body anim) → D7 stays STRICT (undefined) — expect ongoing motion.
    //   • SETTLES (a one-shot body anim, or auto_after_animation, or any timed
    //     reveal past the floor) → reveal_hold, so D7 tolerates the still tail
    //     even when the state is ALSO declared motion=true (dual classification,
    //     mirroring the field_3d pef/dipole sweep). D5 reads the motion map, not
    //     this one, so the two coexist.
    for (const [stateId, state] of Object.entries(resolveStates(config))) {
        if (isPcplInteractive(state)) { out[stateId] = 'interactive'; continue; }
        if (pcplHasContinuousMotion(state)) { out[stateId] = undefined; continue; }
        const settles = pcplHasTransientBodyMotion(state) || state.advance_mode === 'auto_after_animation';
        out[stateId] = settles || (reveal[stateId] ?? 0) > DEFAULT_REVEAL_MS
            ? 'reveal_hold'
            : undefined;
    }
    return out;
}
