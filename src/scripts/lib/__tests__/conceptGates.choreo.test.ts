import { describe, it, expect } from 'vitest';
import { checkConceptChoreography } from '../conceptGates';

// Gate 9(d) — locus_trace sweep-parameter vs slider collision (engine_bug_queue:
// pcpl_locus_trace_sweep_parameter_exposed_as_a_slider_collapses_the_curve,
// CRITICAL). The collapse is invisible to every pixel gate, so the STATIC gate
// is the whole defense — this is its negative control.

const concept = (scene: unknown[]): unknown => ({
    physics_engine_config: { variables: { theta: { default: 30 }, phi: { default: 0 } } },
    epic_l_path: { states: { STATE_1: { scene_composition: scene } } },
});

describe('Gate 9(d) — locus_trace sweep parameter must not be a slider', () => {
    it('FAILS (fatal) when a slider variable parameterises a trace in the same state', () => {
        const findings = checkConceptChoreography(concept([
            { type: 'slider', id: 'theta_slider', variable: 'theta' },
            { type: 'locus_trace', id: 'rim', x_expr: '150 + 110*cos(theta*PI/180)', y_expr: '230 - 110*sin(theta*PI/180)' },
        ]));
        const hits = findings.filter((f) => f.message.includes('locus_trace_sweep_parameter_is_a_slider'));
        expect(hits).toHaveLength(1);
        expect(hits[0].fatal).toBe(true);
        expect(hits[0].message).toContain("variable='theta'");
    });

    it('passes the dedicated-sweep-variable design (the unit_circle pattern)', () => {
        const findings = checkConceptChoreography(concept([
            { type: 'slider', id: 'theta_slider', variable: 'theta' },
            { type: 'locus_trace', id: 'rim', x_expr: '150 + 110*cos(phi*PI/180)', y_expr: '230 - 110*sin(phi*PI/180)' },
        ]));
        expect(findings.filter((f) => f.message.includes('locus_trace_sweep_parameter_is_a_slider'))).toHaveLength(0);
    });

    it('does not false-positive on function names sharing letters with variables', () => {
        const findings = checkConceptChoreography(concept([
            { type: 'slider', id: 's', variable: 'theta' },
            { type: 'locus_trace', id: 'tr', x_expr: '300 + 46*phi', y_expr: '230 - min(110, 110*sin(phi))' },
        ]));
        expect(findings.filter((f) => f.message.includes('locus_trace_sweep_parameter_is_a_slider'))).toHaveLength(0);
    });
});

describe('Gate 9(a)/(b) still fire from the shared lib (move regression check)', () => {
    it('flags an anchor_to forward reference and an undeclared choreography variable', () => {
        const findings = checkConceptChoreography({
            physics_engine_config: { variables: { theta: { default: 0 } } },
            epic_l_path: {
                states: {
                    STATE_1: {
                        scene_composition: [
                            { type: 'vector', id: 'arrow', anchor_to: { primitive_id: 'later_body' } },
                            { type: 'body', id: 'later_body' },
                        ],
                        variable_choreography: [{ variable: 'ghost_var', mode: 'once', duration_ms: 1000 }],
                    },
                },
            },
        });
        expect(findings.some((f) => f.fatal && f.message.includes('anchor_to_forward_reference'))).toBe(true);
        expect(findings.some((f) => f.fatal && f.message.includes('choreography_variable_undeclared'))).toBe(true);
    });
});
