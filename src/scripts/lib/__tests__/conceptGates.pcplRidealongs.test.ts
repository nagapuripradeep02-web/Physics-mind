import { describe, it, expect } from 'vitest';
import { animateInDeadConfigWarnings, renderScopeCollisionWarnings } from '../conceptGates';

// engine_bug_queue: pcpl_animate_in_ms_is_silently_dead_config_on_an_appear_at_
// ms_zero_primitive (founder_proxy Checkpoint B cycle 3, definite_integral_as_
// accumulated_area, 2026-08-09). PM_animationGate's own opening-picture early
// return (parametric_renderer.ts, RULE-37-GAP-B — proven at the renderer level
// by check_cartesian_plane.ts's own section of that name) resolves ANY
// primitive with appear_at_ms<=0 to alpha=1 BEFORE the animate_in_ms ramp is
// ever reached. This suite covers the AUTHORING-side half: the validator
// warning that tells an author the number they just tuned will never run.

const concept = (states: Record<string, { scene_composition: unknown[] }>): unknown => ({
    epic_l_path: { states },
});

describe('animateInDeadConfigWarnings — flags animate_in_ms on an appear_at_ms<=0 primitive', () => {
    it('WARNS when appear_at_ms is absent (defaults to 0) and animate_in_ms > 0', () => {
        const data = concept({
            STATE_4: { scene_composition: [{ type: 'body', id: 'sliver_inset', animate_in_ms: 1200 }] },
        });
        const warnings = animateInDeadConfigWarnings(data, 'f.json');
        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toContain('sliver_inset');
        expect(warnings[0]).toContain('animate_in_ms=1200');
        expect(warnings[0]).toContain('absent (defaults to 0)');
    });

    it('WARNS when appear_at_ms is authored explicitly as 0', () => {
        const data = concept({
            STATE_8: { scene_composition: [{ type: 'region_fill', id: 'region', appear_at_ms: 0, animate_in_ms: 1200 }] },
        });
        const warnings = animateInDeadConfigWarnings(data, 'f.json');
        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toContain('appear_at_ms=0');
    });

    it('WARNS when appear_at_ms is negative (degenerate but legal, resolves the same way per PM_animationGate)', () => {
        const data = concept({
            STATE_1: { scene_composition: [{ type: 'label', id: 'l1', appear_at_ms: -50, animate_in_ms: 500 }] },
        });
        expect(animateInDeadConfigWarnings(data, 'f.json')).toHaveLength(1);
    });

    it('does NOT warn when appear_at_ms > 0 (a genuine mid-state reveal — the fade DOES run)', () => {
        const data = concept({
            STATE_2: { scene_composition: [{ type: 'label', id: 'Sn_chip', appear_at_ms: 18000, animate_in_ms: 800 }] },
        });
        expect(animateInDeadConfigWarnings(data, 'f.json')).toHaveLength(0);
    });

    it('does NOT warn when animate_in_ms is absent or 0 (no fade authored at all)', () => {
        const data = concept({
            STATE_1: { scene_composition: [{ type: 'body', id: 'b1' }, { type: 'body', id: 'b2', animate_in_ms: 0 }] },
        });
        expect(animateInDeadConfigWarnings(data, 'f.json')).toHaveLength(0);
    });

    it('reproduces the exact measured shape of definite_integral_as_accumulated_area STATE_4 (6 primitives) and STATE_6 (1) and STATE_8 (3) = 10 total', () => {
        const data = concept({
            STATE_4: {
                scene_composition: [
                    { type: 'body', id: 'plane_inset', appear_at_ms: 0, animate_in_ms: 1200 },
                    { type: 'body', id: 'curve_inset', appear_at_ms: 0, animate_in_ms: 1200 },
                    { type: 'body', id: 'wedge_inset', appear_at_ms: 0, animate_in_ms: 1200 },
                    { type: 'body', id: 'sliver_inset', appear_at_ms: 0, animate_in_ms: 1200 },
                    { type: 'vector', id: 'zoomlink_1', appear_at_ms: 0, animate_in_ms: 1200 },
                    { type: 'vector', id: 'zoomlink_2', appear_at_ms: 0, animate_in_ms: 1200 },
                ],
            },
            STATE_6: { scene_composition: [{ type: 'riemann_bars', id: 'bars_left', appear_at_ms: 0, animate_in_ms: 400 }] },
            STATE_8: {
                scene_composition: [
                    { type: 'function_plot', id: 'curve', appear_at_ms: 0, animate_in_ms: 1200 },
                    { type: 'region_fill', id: 'region', appear_at_ms: 0, animate_in_ms: 1200 },
                    { type: 'riemann_bars', id: 'bars', appear_at_ms: 0, animate_in_ms: 1200 },
                ],
            },
        });
        expect(animateInDeadConfigWarnings(data, 'definite_integral_as_accumulated_area.json')).toHaveLength(10);
    });

    it('NEGATIVE CONTROL: a gate that never fires is not known to work — this fixture is deliberately correct (STATE_4 convention of an authored appear_at_ms) and must produce ZERO warnings', () => {
        const data = concept({
            STATE_5: { scene_composition: [{ type: 'plot_point', id: 'bound_marker', appear_at_ms: 500, animate_in_ms: 400 }] },
        });
        expect(animateInDeadConfigWarnings(data, 'f.json')).toHaveLength(0);
    });
});

// engine_bug_queue: pcpl_renderer_output_variable_shares_its_name_with_a_
// teacher_control_in_another_state (founder_proxy Checkpoint B cycle 3,
// 2026-08-09). riemann_bars.sum_var / .bars_drawn_var publish into
// PM_riemannPublish, merged into the SAME expression scope PM_sliderValues
// writes teacher slider / plot_point-drag values into.
describe('renderScopeCollisionWarnings — renderer-output vs teacher-control namespace', () => {
    it('WARNS when bars_drawn_var in one state equals a slider variable in another state (the measured definite_integral shape)', () => {
        const data = concept({
            STATE_3: { scene_composition: [{ type: 'riemann_bars', id: 'bars', bars_drawn_var: 'n' }] },
            STATE_6: { scene_composition: [{ type: 'riemann_bars', id: 'bars_left', sum_var: 'S_left', bars_drawn_var: 'n' }] },
            STATE_8: {
                scene_composition: [
                    { type: 'slider', id: 'n_slider', variable: 'n', label: 'n' },
                    { type: 'slider', id: 'c_slider', variable: 'c', label: 'c' },
                ],
            },
        });
        const warnings = renderScopeCollisionWarnings(data, 'definite_integral_as_accumulated_area.json');
        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toContain("'n'");
        expect(warnings[0]).toContain('STATE_3');
        expect(warnings[0]).toContain('STATE_6');
        expect(warnings[0]).toContain('STATE_8');
    });

    it('does NOT warn on the safe spelling (STATE_4 convention: bars_drawn_var "n_drawn" vs slider variable "n")', () => {
        const data = concept({
            STATE_4: { scene_composition: [{ type: 'riemann_bars', id: 'bars', sum_var: 'S_n', bars_drawn_var: 'n_drawn' }] },
            STATE_8: { scene_composition: [{ type: 'slider', id: 'n_slider', variable: 'n', label: 'n' }] },
        });
        expect(renderScopeCollisionWarnings(data, 'f.json')).toHaveLength(0);
    });

    it('WARNS on a plot_point.drag.bind_variable collision, not just slider.variable', () => {
        const data = concept({
            STATE_1: { scene_composition: [{ type: 'riemann_bars', id: 'bars', sum_var: 'b' }] },
            STATE_2: { scene_composition: [{ type: 'plot_point', id: 'P', drag: { bind_variable: 'b' } }] },
        });
        const warnings = renderScopeCollisionWarnings(data, 'f.json');
        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toContain("'b'");
        expect(warnings[0]).toContain('sum_var');
        expect(warnings[0]).toContain('plot_point.drag.bind_variable');
    });

    it('does NOT collide on a slider LABEL that merely happens to differ from its variable (label is display text, never a scope key)', () => {
        const data = concept({
            STATE_3: { scene_composition: [{ type: 'riemann_bars', id: 'bars', bars_drawn_var: 'rectangles' }] },
            STATE_8: { scene_composition: [{ type: 'slider', id: 'n_slider', variable: 'n', label: 'rectangles' }] },
        });
        expect(renderScopeCollisionWarnings(data, 'f.json')).toHaveLength(0);
    });

    it('NEGATIVE CONTROL: a gate that never fires is not known to work — sum_var/bars_drawn_var names disjoint from every control name produce ZERO warnings', () => {
        const data = concept({
            STATE_2: { scene_composition: [{ type: 'riemann_bars', id: 'bars', sum_var: 'S_n' }] },
            STATE_8: { scene_composition: [{ type: 'slider', id: 'n_slider', variable: 'n', label: 'n' }] },
        });
        expect(renderScopeCollisionWarnings(data, 'f.json')).toHaveLength(0);
    });
});
