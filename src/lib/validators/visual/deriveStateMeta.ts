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
// 30s cap: real states run 15-20s and the dense work is $0 (pixel math only —
// vision models never see dense frames), so follow the declared duration.
// Raised from 15000 on 2026-06-10 — the old clamp silently dropped the tail
// of any state longer than 15s, blinding D7 to late freezes.
const DURATION_MAX_MS = 30000;

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

    // field_3d (authoritative shape): a gauss block with flow:true declares
    // continuous field-line flow — D5/D6 should expect ongoing pixel motion.
    // Read from field_3d_config.states (or a cached field_3d-as-physics_config)
    // since the gauss block does not live on epic_l_path.states.
    const f3d = resolveField3dStates(physicsConfig);
    if (f3d) {
        for (const [stateId, stateRaw] of Object.entries(f3d.states)) {
            const state = asObj(stateRaw);
            const gauss = state ? asObj(state.gauss) : null;
            if (gauss && gauss.flow === true) { out[stateId] = true; continue; }
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
            // compare-mode: the shell fades in (~0.9s) after the point-charge phase,
            // then both hold side-by-side — pin past the fade so the reveal_hold
            // classification sees the completed comparison.
            candidates.push(asNum(gsph.shell_appears_at_ms, 5000) + 900 + 500);
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

    return candidates.length > 0 ? Math.max(...candidates) : DEFAULT_REVEAL_MS;
}

/** PCPL proxy: narration-complete ≈ sum of the state's tts_sentences pauses. */
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
 * cached physics_config. Clamped to [1500, 30000] ms.
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

    // PCPL fallback (parametric is already wall-clock-correct; this keeps the
    // frozen-frame target consistent across renderers).
    for (const [stateId, state] of Object.entries(resolveStates(config))) {
        out[stateId] = clampReveal(pcplRevealMs(state));
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
export function deriveHoldExpectations(
    config: Record<string, unknown> | null,
): Record<string, 'reveal_hold' | 'interactive' | undefined> {
    const out: Record<string, 'reveal_hold' | 'interactive' | undefined> = {};
    const reveal = deriveMaxRevealTimeMs(config);

    const f3d = resolveField3dStates(config);
    if (f3d) {
        for (const [stateId, stateRaw] of Object.entries(f3d.states)) {
            const state = asObj(stateRaw);
            if (!state) { out[stateId] = undefined; continue; }
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
    // still false-trip the motion gates.
    const motion = deriveMotionExpectations(config);
    for (const [stateId, state] of Object.entries(resolveStates(config))) {
        if (isPcplInteractive(state)) { out[stateId] = 'interactive'; continue; }
        out[stateId] = (reveal[stateId] ?? 0) > DEFAULT_REVEAL_MS && motion[stateId] !== true
            ? 'reveal_hold'
            : undefined;
    }
    return out;
}
