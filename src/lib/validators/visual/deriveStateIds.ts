/**
 * Schema-aware state ID extraction from a cached simulation's `physics_config`.
 *
 * PhysicsMind has two coexisting concept schemas:
 *   - **v1 mechanics_2d** — `physics_config.states: { STATE_1: {...}, ... }`
 *     Used by area_vector, dot_product, unit_vector, etc.
 *   - **v2 PCPL** — `physics_config.epic_l_path.states: { STATE_1: {...}, ... }`
 *     Used by normal_reaction and other board-mode-aware concepts.
 *
 * This helper checks both locations and returns sorted state IDs.
 * Returns [] if neither location yields a non-empty object.
 *
 * Used by:
 *   - src/scripts/smoke_visual_validator.ts (smoke pipeline)
 *   - src/app/admin/sim-viewer/page.tsx (manual viewer list)
 *   - src/app/admin/sim-viewer/[id]/page.tsx (manual viewer detail)
 */
export function deriveStateIds(physicsConfig: Record<string, unknown> | null): string[] {
    if (!physicsConfig) return [];

    // v1/legacy mechanics_2d schema — states at top level
    const topStates = physicsConfig.states as Record<string, unknown> | undefined;
    if (topStates && typeof topStates === 'object') {
        const keys = Object.keys(topStates);
        if (keys.length > 0) return keys.sort();
    }

    // v2 PCPL schema — states nested under epic_l_path
    const elp = physicsConfig.epic_l_path as Record<string, unknown> | undefined;
    if (elp && typeof elp === 'object') {
        const elpStates = elp.states as Record<string, unknown> | undefined;
        if (elpStates && typeof elpStates === 'object') {
            const keys = Object.keys(elpStates);
            if (keys.length > 0) return keys.sort();
        }
    }

    return [];
}
