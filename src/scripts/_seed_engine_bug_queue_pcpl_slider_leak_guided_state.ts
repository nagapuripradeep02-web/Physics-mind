/**
 * engine_bug_queue row for bug_class
 * pcpl_teacher_set_live_control_value_leaks_from_explore_state_into_guided_
 * state_on_state_change (founder_proxy Checkpoint B cycle 1,
 * definite_integral_as_accumulated_area, 2026-08-08).
 *
 * Filed here (not by the fixing desk directly) because no engine desk
 * carries DB credentials — same convention as
 * _seed_engine_bug_queue_pcpl_cartesian_plane_round.ts.
 *
 * Root cause: the SET_STATE handler overlaid PM_sliderValues (a durable
 * store, written by a genuine canvas drag and NEVER cleared on state
 * change — only PM_userTouched, the seizure flag, is cleared per-state)
 * onto every incoming state that happens to declare the SAME variable as a
 * live control, with no regard for which state actually last wrote that
 * value. Rule 25d's reorderable/jumpable state rail means a teacher can
 * arrive at ANY guided state from the explore sandbox at any time, so a
 * value dragged on the explore state silently overwrote a guided state's
 * own authored default the instant that guided state was opened.
 *
 * Fix: PM_overlayLiveControlValues(vars, stateData, stateSliderVars) — a
 * new named function replacing the SET_STATE handler's inline overlay loop
 * — gates the overlay on stateData.advance_mode === 'interaction_complete'
 * (Rule 31's teacher sandbox, the ONLY state whose job is open-ended
 * manipulation). Every other advance_mode opens strictly on vars as already
 * resolved (PM_resolveStateVars' authored defaults / an explicit
 * e.data.variables / inline_variables override), with zero PM_sliderValues
 * overlay. PM_liveDragScope (the genuine-drag rebuild used WITHIN the
 * currently-open state) and the PARAM_UPDATE handler (which only ever
 * updates PM_currentState's OWN live control, never a value inherited
 * across a state transition) are both deliberately untouched.
 *
 * Idempotent: upsert onConflict 'bug_class'. Run:
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_pcpl_slider_leak_guided_state.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION =
    'founder_proxy Checkpoint B cycle 1, definite_integral_as_accumulated_area live drive, 2026-08-08 (fix landed on desk fix/pcpl-slider-leak-guided-state, cut from origin/master 05eceff)';

interface Row {
    bug_class: string;
    title: string;
    severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
    owner_cluster: 'peter_parker:renderer_primitives';
    subject: string;
    root_cause: string;
    prevention_rule: string;
    probe_type: 'js_eval';
    probe_logic: string;
    status: 'FIXED';
    concepts_affected: string[];
    fixed_in_files: string[];
    discovered_in_session: string;
    row_type: 'incident' | 'directive';
}

const rows: Row[] = [
    {
        bug_class: 'pcpl_teacher_set_live_control_value_leaks_from_explore_state_into_guided_state_on_state_change',
        title:
            'A teacher-dragged live-control value on the explore state silently overwrote a GUIDED state’s own authored default the instant that state was opened via the state rail',
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:renderer_primitives',
        subject: 'subject_neutral',
        root_cause:
            "PM_sliderValues is a durable store written by a genuine canvas drag (drawCanvasSlider / drawPlotPoint's mouseIsPressed&&isActive branch) or a PARAM_UPDATE, and is NEVER cleared on SET_STATE — only PM_userTouched (the per-state seizure flag) is. The SET_STATE handler's own overlay loop (`for (var svk in PM_sliderValues) { if (stateSliderVars[svk]) vars[svk] = PM_sliderValues[svk]; } `) applied PM_sliderValues to ANY incoming state that happens to declare the SAME variable as a live control (type:'slider' or a plot_point drag.bind_variable), with zero regard for which state actually last wrote that value. Rule 25d's reorderable/jumpable state rail means a teacher can arrive at any GUIDED state from the explore sandbox (advance_mode:'interaction_complete') at any time — so a value dragged in the explore state bled into every OTHER state sharing that variable the moment the teacher clicked it in the rail. Measured on definite_integral_as_accumulated_area: drag bound_marker to b=0.279 on STATE_8 (explore), click STATE_5 (guided) in the rail — STATE_5 opened at b=0.2792 instead of its authored b=2, with touched={} (PM_userTouched correctly cleared, PM_sliderValues silently was not), destroying the above/below-the-axis contrast STATE_5 exists to teach (canvas read ∫ = −0.2719 under narration reading 0.6667).",
        prevention_rule:
            "A value a TEACHER sets interactively belongs to the state it was set in, not to every other state that happens to declare the same variable name as a live control. Only advance_mode:'interaction_complete' (Rule 31's ONE open-ended-manipulation sandbox state) may inherit a value set elsewhere — on both first entry and every re-entry. Every GUIDED state (any other advance_mode, or the field entirely absent) opens strictly on its OWN resolved vars (authored defaults / variable_overrides / an explicit inline override), full stop, regardless of what a teacher last dragged anywhere else or how recently. Any future durable interactive-value store (anything surviving a SET_STATE the way PM_sliderValues does) must be gated the SAME way before it is allowed to cross a state boundary.",
        probe_type: 'js_eval',
        probe_logic:
            "check_cartesian_plane.ts section 'WP-R6' — a dedicated sandbox (grabFn-extracts the SHIPPED PM_overlayLiveControlValues, supplies PM_sliderValues as a literal fixture) asserts: (1) a GUIDED state (advance_mode:'manual_click', and every other non-interaction_complete value including the field omitted entirely) receives its OWN authored vars unchanged even when PM_sliderValues holds a conflicting value for a variable that state declares as a live control; (2) the EXPLORE state (advance_mode:'interaction_complete') DOES inherit, identically on a fresh entry and a re-entry; (3) a variable NOT declared as the incoming state's own live control is never overlaid, on ANY state. NEGATIVE CONTROL: the pre-fix algorithm (an unconditional overlay, no advance_mode gate), reimplemented independently in the test file, IS shown to leak the explore value into the guided state at the exact same input the shipped function does not. STATIC REACHABILITY: the SET_STATE handler source is asserted to call PM_overlayLiveControlValues(vars, newStateData, stateSliderVars) and to no longer contain the old inline 'for (var svk in PM_sliderValues)' loop; the PARAM_UPDATE handler's OWN unconditional overlay loop is asserted UNCHANGED (it never crosses a state boundary, so it is deliberately out of scope for this gate). A full end-to-end Playwright reproduction (real page.mouse.move/down/move/up — not a PARAM_UPDATE shortcut — on a synthetic two-state ParametricConfig) additionally confirmed: pre-fix, STATE_5 opened at the dragged explore value (0.3, not the authored 2); post-fix, STATE_5 opens at 2 and STATE_8 still inherits 0.3 on re-entry.",
        status: 'FIXED',
        concepts_affected: [
            // The reported concept (mathematics namespace, parametric-family
            // fallthrough via isParametricConcept — not yet in PCPL_CONCEPTS).
            'definite_integral_as_accumulated_area',
            // Every OTHER concept sharing the SAME SET_STATE handler / overlay
            // mechanism — enumerated wide (any concept authoring >=2 states
            // that share a live-control variable, one of them
            // interaction_complete, was reachable by this leak). Mathematics
            // namespace:
            'derivative_as_secant_limit', 'unit_circle_to_sine_wave', 'graph_transformations',
            // Chemistry namespace (also parametric-family fallthrough):
            'bohr_model_energy_levels', 'law_of_conservation_of_mass',
            // PCPL_CONCEPTS (physics/vectors), full set per aiSimulationGenerator.ts:
            'field_forces', 'contact_forces', 'normal_reaction',
            'tension_in_string', 'hinge_force', 'free_body_diagram',
            'vector_resolution', 'resultant_formula', 'direction_of_resultant',
            'umbrella_tilt_angle', 'friction_static_kinetic',
            'current_not_vector', 'pressure_scalar',
            'scalar_vs_vector', 'vector_addition_law', 'resultant_direction',
            'vector_head_to_tail', 'newton_second_law_direction',
        ],
        fixed_in_files: [
            'src/lib/renderers/parametric_renderer.ts',
            'src/scripts/check_cartesian_plane.ts',
        ],
        discovered_in_session: SESSION,
        row_type: 'directive',
    },
];

async function main() {
    for (const row of rows) {
        const { error } = await supabaseAdmin
            .from('engine_bug_queue')
            .upsert(row, { onConflict: 'bug_class' });
        if (error) {
            console.error(`FAIL ${row.bug_class}:`, error.message);
            process.exitCode = 1;
        } else {
            console.log(`OK   ${row.bug_class} [${row.status}] (${row.row_type})`);
        }
    }
}

main();
