/**
 * deriveMaxRevealTimeMs + deriveHoldExpectations — the sim-time-aware capture
 * brain. Locks in the solenoid STATE_3 reveal math (7300ms) that caused the
 * wall-clock false negative, the per_turn stagger×turns arithmetic, both config
 * shapes (concept-JSON field_3d_config + field_3d_config-as-physics_config), and
 * the PCPL fallback.
 */
import { describe, it, expect } from 'vitest';
import { deriveMaxRevealTimeMs, deriveHoldExpectations } from '../deriveStateMeta';

// Mirrors magnetic_field_solenoid.json field_3d_config (turns: 6).
const SOLENOID = {
    field_3d_config: {
        coil: { turns: 6, radius: 0.8 },
        states: {
            STATE_1: { wire_to_coil_morph: { enabled: true, straight_duration_ms: 3000, morph_duration_ms: 1500 } },
            STATE_2: { per_turn_field_circles: { enabled: true, highlight_first: true, reveal_at_ms: 1500, reveal_stagger_ms: 250, reveal_fade_ms: 500 } },
            STATE_3: {
                per_turn_field_circles: { enabled: true, reveal_at_ms: 0, reveal_stagger_ms: 0, reveal_fade_ms: 0 },
                radial_cancellation_arrows: { enabled: true, reveal_at_ms: 4500, fade_in_duration_ms: 800 },
                axial_buildup_arrows: { enabled: true, reveal_at_ms: 6500, arise_duration_ms: 800 },
            },
            STATE_4: { visible_elements: ['solenoid_coil'] },
            STATE_5: { extras: { right_hand: { case: 'solenoid', fade_duration_ms: 1400 } } },
            STATE_8: { show_sliders: true, formula_overlay: 'B = μ₀ n I' },
        },
    },
};

describe('deriveMaxRevealTimeMs — field_3d', () => {
    it('computes morph / per-turn-stagger / radial / axial reveal-complete times', () => {
        const r = deriveMaxRevealTimeMs(SOLENOID);
        expect(r.STATE_1).toBe(4500);            // 3000 straight + 1500 morph
        expect(r.STATE_2).toBe(3250);            // 1500 + (6-1)*250 + 500
        expect(r.STATE_3).toBe(7300);            // max(per_turn≈0, radial 5300, axial 7300) — the aha payoff
        expect(r.STATE_4).toBe(1500);            // no timed reveals → DEFAULT floor
        expect(r.STATE_5).toBe(1500);            // right_hand fade 1400 < floor → 1500
        expect(r.STATE_8).toBe(1500);            // explorer, no timed reveals
    });

    it('falls back to a safe upper-bound turn count when coil.turns is absent', () => {
        const noTurns = { field_3d_config: { states: { STATE_2: SOLENOID.field_3d_config.states.STATE_2 } } };
        // 1500 + (8-1)*250 + 500 = 3750 (DEFAULT_COIL_TURNS = 8, over-waits not under-waits)
        expect(deriveMaxRevealTimeMs(noTurns).STATE_2).toBe(3750);
    });

    it('resolves the field_3d_config-as-physics_config shape (top-level states with timing)', () => {
        const flat = { coil: { turns: 6 }, states: SOLENOID.field_3d_config.states };
        expect(deriveMaxRevealTimeMs(flat).STATE_3).toBe(7300);
    });

    it('clamps to the 60s ceiling (DURATION_MAX_MS, raised 2026-07-03)', () => {
        const huge = { field_3d_config: { states: { STATE_1: { axial_buildup_arrows: { enabled: true, reveal_at_ms: 99000, arise_duration_ms: 5000 } } } } };
        expect(deriveMaxRevealTimeMs(huge).STATE_1).toBe(60000);
    });
});

describe('deriveHoldExpectations — field_3d', () => {
    it('flags reveal-then-hold and interactive states; leaves plain/short states strict', () => {
        const h = deriveHoldExpectations(SOLENOID);
        expect(h.STATE_1).toBe('reveal_hold');   // 4500 > 1500, not moving
        expect(h.STATE_2).toBe('reveal_hold');
        expect(h.STATE_3).toBe('reveal_hold');
        expect(h.STATE_4).toBeUndefined();        // no reveals → strict
        expect(h.STATE_8).toBe('interactive');    // show_sliders
    });

    it('keeps a moving trajectory_mode strict (not reveal_hold)', () => {
        const moving = { field_3d_config: { states: { STATE_1: { trajectory_mode: 'animated', axial_buildup_arrows: { enabled: true, reveal_at_ms: 4000, arise_duration_ms: 800 } } } } };
        expect(deriveHoldExpectations(moving).STATE_1).toBeUndefined();
    });
});

describe('PCPL fallback', () => {
    const PCPL = {
        epic_l_path: {
            states: {
                STATE_1: { teacher_script: { tts_sentences: [{ pause_after_ms: 1000 }, { pause_after_ms: 3000 }] } },
                STATE_2: { advance_mode: 'interaction_complete' },
            },
        },
    };

    it('sums tts pause_after_ms as the narration-complete proxy', () => {
        expect(deriveMaxRevealTimeMs(PCPL).STATE_1).toBe(4000);
    });

    it('marks an interaction_complete PCPL state interactive', () => {
        expect(deriveHoldExpectations(PCPL).STATE_2).toBe('interactive');
    });
});

describe('null-safety', () => {
    it('returns empty maps for null config', () => {
        expect(deriveMaxRevealTimeMs(null)).toEqual({});
        expect(deriveHoldExpectations(null)).toEqual({});
    });
});
