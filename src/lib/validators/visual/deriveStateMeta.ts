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
    const states = resolveStates(physicsConfig);
    const out: Record<string, boolean | undefined> = {};
    for (const [stateId, state] of Object.entries(states)) {
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
