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
 * Used by:
 *   - src/scripts/visual_eyes.ts (THE EYE protocol)
 *   - src/scripts/smoke_visual_validator.ts (--dense flag)
 */

const DURATION_MIN_MS = 3000;
const DURATION_MAX_MS = 15000;

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
 * Per-state capture duration in ms, clamped to [3000, 15000]. States declare
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
