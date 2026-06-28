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
                // other potential states fall through to reveal_hold / interactive.
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
            //     in deriveMotionExpectations → keep the strict gate (undefined) so
            //     D5/D6/D7 expect ongoing pixel motion, not a static tail.
            //   the remaining beats (q→2q grow, ΔV/∞ markers, shells, V write-in, the
            //     point_charge halve-r slide+count-up, the V-vs-r curve draw + gap, the
            //     sign-flip recolor) are one-shot reveals then HOLD → reveal_hold via
            //     the fallback below (their maxReveal > DEFAULT_REVEAL_MS via the
            //     `potential` block in maxRevealForField3dState above).
            const potHold = asObj(state.potential);
            if (potHold) {
                if (potHold.draggable_test_charge === true) { out[stateId] = 'interactive'; continue; }
                const routes = Array.isArray(potHold.animate_route) && potHold.animate_route.length > 0;
                if (routes || typeof potHold.release_at_ms === 'number') { out[stateId] = undefined; continue; }
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
