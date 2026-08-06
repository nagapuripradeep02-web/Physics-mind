/**
 * PCPL coverage for the deriveStateMeta brain — the parametric side had 2
 * assertions (both legacy paths) while field_3d had a full suite, and the
 * PCPL_*_ANIM sets are a HAND-MAINTAINED mirror of the renderer's animation
 * dispatch with nothing asserting they stay in sync ("mirror parametric_
 * renderer.ts animatePrimitive" is a comment, not a test).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { deriveMaxRevealTimeMs, deriveMotionExpectations } from '../deriveStateMeta';

const read = (rel: string): string => readFileSync(join(process.cwd(), ...rel.split('/')), 'utf-8');

describe('PCPL animation-kind mirror sync', () => {
    it('PCPL_CONTINUOUS_ANIM ∪ PCPL_TRANSIENT_ANIM ∪ {projectile} equals the renderer dispatch set', () => {
        const meta = read('src/lib/validators/visual/deriveStateMeta.ts');
        const renderer = read('src/lib/renderers/parametric_renderer.ts');

        const setEntries = (name: string): string[] => {
            const m = new RegExp(`${name} = new Set\\(\\[([^\\]]*)\\]`).exec(meta);
            if (!m) throw new Error(`${name} declaration not found in deriveStateMeta.ts`);
            return [...m[1].matchAll(/'([\w]+)'/g)].map((x) => x[1]);
        };
        const mirror = new Set([...setEntries('PCPL_CONTINUOUS_ANIM'), ...setEntries('PCPL_TRANSIENT_ANIM')]);
        // projectile is dual-classified by loop_period_sec, so it lives outside
        // both sets but is handled explicitly — assert that stays true.
        expect(meta).toContain("anim.type === 'projectile'");
        mirror.add('projectile');

        const dispatched = new Set<string>();
        for (const m of renderer.matchAll(/animation\.type\s*===\s*'(\w+)'/g)) dispatched.add(m[1]);

        expect([...dispatched].sort()).toEqual([...mirror].sort());
    });
});

describe('pcplSceneRevealMs paths (via deriveMaxRevealTimeMs)', () => {
    it('variable_choreography once-mode: start + duration + Σholds', () => {
        const cfg = {
            epic_l_path: {
                states: {
                    STATE_1: {
                        variable_choreography: [
                            { variable: 'theta', mode: 'once', start_ms: 1000, duration_ms: 3000, holds: [{ hold_ms: 500 }, { hold_ms: 500 }] },
                        ],
                    },
                },
            },
        };
        expect(deriveMaxRevealTimeMs(cfg).STATE_1).toBe(5000);
    });

    it('ping_pong/loop choreography never contributes a reveal (motion, not reveal)', () => {
        const cfg = {
            epic_l_path: {
                states: {
                    STATE_1: { variable_choreography: [{ variable: 'theta', mode: 'ping_pong', start_ms: 0, duration_ms: 9000 }] },
                },
            },
        };
        expect(deriveMaxRevealTimeMs(cfg).STATE_1).toBe(1500); // DEFAULT floor
    });

    it('locus_trace completes at its own end_ms', () => {
        const cfg = {
            epic_l_path: {
                states: {
                    STATE_1: { scene_composition: [{ type: 'locus_trace', id: 'tr', start_ms: 500, end_ms: 6200 }] },
                },
            },
        };
        expect(deriveMaxRevealTimeMs(cfg).STATE_1).toBe(6200);
    });

    it('rotate_continuous contributes one period (default 2000 when unauthored)', () => {
        const withPeriod = {
            epic_l_path: { states: { STATE_1: { scene_composition: [{ type: 'body', id: 'b', animation: { type: 'rotate_continuous', period_ms: 4000 } }] } } },
        };
        const noPeriod = {
            epic_l_path: { states: { STATE_1: { scene_composition: [{ type: 'body', id: 'b', animation: { type: 'rotate_continuous' } }] } } },
        };
        expect(deriveMaxRevealTimeMs(withPeriod).STATE_1).toBe(4000);
        expect(deriveMaxRevealTimeMs(noPeriod).STATE_1).toBe(2000);
    });

    it('appear_at_ms + animate_in_ms gates contribute their completion time', () => {
        const cfg = {
            epic_l_path: {
                states: { STATE_1: { scene_composition: [{ type: 'vector', id: 'v', appear_at_ms: 2500, animate_in_ms: 800 }] } },
            },
        };
        expect(deriveMaxRevealTimeMs(cfg).STATE_1).toBe(3300);
    });
});

describe('deriveMotionExpectations — parametric predicates', () => {
    it('loop choreography, continuous body anim, and transient body anim all expect motion; a bare state stays unknown', () => {
        const cfg = {
            epic_l_path: {
                states: {
                    STATE_1: { variable_choreography: [{ variable: 'theta', mode: 'loop', duration_ms: 4000 }] },
                    STATE_2: { scene_composition: [{ type: 'body', id: 'p', animation: { type: 'pendulum' } }] },
                    STATE_3: { scene_composition: [{ type: 'body', id: 'f', animation: { type: 'free_fall' } }] },
                    STATE_4: { scene_composition: [{ type: 'body', id: 'still' }] },
                },
            },
        };
        const m = deriveMotionExpectations(cfg);
        expect(m.STATE_1).toBe(true);
        expect(m.STATE_2).toBe(true);
        expect(m.STATE_3).toBe(true);
        expect(m.STATE_4).toBeUndefined();
    });
});
