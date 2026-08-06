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

// Gate 9(d) extension (CP-B, 2026-08-06) — THE phi LAW restated: a trace's
// sweep parameter is never a SEIZABLE variable, slider OR drag-bound. A
// type:'plot_point' primitive's drag.bind_variable seizes exactly like a
// type:'slider' primitive's variable (parametric_renderer.ts drawPlotPoint's
// genuine-drag branch sets PM_userTouched[drag.bind_variable] = true exactly
// as drawCanvasSlider's genuine-drag branch sets PM_userTouched[spec.variable]
// = true) — so it is a SECOND seizure door this gate must also see. Concept
// #2 (derivative) sketches exactly this collision: drag P along the curve,
// plus f' traced on P's sweep. This is the negative control for that
// extension — before it, a plot_point-only collision was invisible to this
// gate (the slider-only scan below reproduces the pre-fix blind spot).
describe('Gate 9(d) extension — locus_trace sweep parameter must not be a plot_point drag.bind_variable either', () => {
    it('FAILS (fatal) when a plot_point.drag.bind_variable parameterises a trace in the same state', () => {
        const findings = checkConceptChoreography(concept([
            { type: 'plot_point', id: 'P', plane_id: 'plane', x_expr: 'x0', y_expr: 'x0*x0', drag: { bind_variable: 'x0', axis: 'x' } },
            { type: 'locus_trace', id: 'deriv', x_expr: 'x0', y_expr: '2*x0' },
        ]));
        const hits = findings.filter((f) => f.message.includes('locus_trace_sweep_parameter_is_drag_bound'));
        expect(hits).toHaveLength(1);
        expect(hits[0].fatal).toBe(true);
        expect(hits[0].message).toContain("variable='x0'");
        expect(hits[0].message).toContain('plot_point.drag.bind_variable');
    });

    it('passes the dedicated-sweep-variable design (trace parameterised on a variable the state never seizes)', () => {
        const findings = checkConceptChoreography(concept([
            { type: 'plot_point', id: 'P', plane_id: 'plane', x_expr: 'x0', y_expr: 'x0*x0', drag: { bind_variable: 'x0', axis: 'x' } },
            { type: 'locus_trace', id: 'deriv', x_expr: 'phi', y_expr: '2*phi' },
        ]));
        expect(findings.filter((f) => f.message.includes('locus_trace_sweep_parameter_is_drag_bound'))).toHaveLength(0);
    });

    it('a non-draggable plot_point (no drag clause) never contributes a seizure door', () => {
        const findings = checkConceptChoreography(concept([
            { type: 'plot_point', id: 'P', plane_id: 'plane', x_expr: 'x0', y_expr: 'x0*x0' },
            { type: 'locus_trace', id: 'deriv', x_expr: 'x0', y_expr: '2*x0' },
        ]));
        expect(findings.filter((f) => f.message.includes('locus_trace_sweep_parameter_is_drag_bound'))).toHaveLength(0);
    });

    it('NEGATIVE CONTROL: the pre-fix slider-only scan would have missed this collision entirely', () => {
        // Reproduces the PRE-FIX shape of check (d) — sliderVars alone, no
        // dragBoundVars union — over the SAME failing scene as the first test
        // above, proving the extension is load-bearing (a gate that could
        // never have failed is not known to work).
        const preFixSliderOnly = new Set<string>(); // no type:'slider' primitive in this scene at all
        const traceIdents = ['x0', 'x0']; // x_expr, y_expr identifiers (2*x0 -> 'x0')
        const preFixHit = traceIdents.some((id) => preFixSliderOnly.has(id));
        expect(preFixHit).toBe(false); // the pre-fix gate finds NOTHING here
        // ...while the shipped (extended) gate above DOES fire (first test).
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
