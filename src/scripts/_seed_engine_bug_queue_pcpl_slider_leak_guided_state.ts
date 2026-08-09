/**
 * engine_bug_queue row for bug_class
 * pcpl_teacher_set_live_control_value_leaks_from_explore_state_into_guided_
 * state_on_state_change (founder_proxy Checkpoint B cycle 1, 2026-08-08;
 * REOPENED — a SECOND door found by quality_auditor's live drive on the
 * REAL concept, 2026-08-08/09).
 *
 * Filed here (not by the fixing desk directly) because no engine desk
 * carries DB credentials — same convention as
 * _seed_engine_bug_queue_pcpl_cartesian_plane_round.ts. UPDATES the SAME
 * row (upsert onConflict 'bug_class') rather than filing a second bug_class
 * — it is the same defect, found to have a second, independent path.
 *
 * ROOT CAUSE, door 1 (SET_STATE handler, fixed cycle 1): the SET_STATE
 * handler overlaid PM_sliderValues (a durable store, written by a genuine
 * canvas drag and NEVER cleared on state change — only PM_userTouched, the
 * seizure flag, is cleared per-state) onto every incoming state that
 * happens to declare the SAME variable as a live control, with no regard
 * for which state actually last wrote that value.
 *
 * ROOT CAUSE, door 2 (PM_applyChoreography, THE ONE THAT SURVIVED CYCLE 1):
 * door 1's fix (PM_overlayLiveControlValues, gated on
 * advance_mode==='interaction_complete') was applied ONLY at the SET_STATE
 * handler's own overlay site. PM_applyChoreography — which runs every
 * frame whenever the CURRENT state authors ANY variable_choreography at
 * all, on ANY variable, not necessarily the leaking one — had an
 * INDEPENDENT, hand-rolled COPY of the identical unconditional overlay
 * loop, never gated, never touched by cycle 1's fix. On a guided state
 * that BOTH drags a variable (its own plot_point.drag.bind_variable) AND
 * choreographs a DIFFERENT variable (definite_integral_as_accumulated_
 * area's real STATE_5: drags 'b', choreographs 'c'), the SET_STATE
 * handler's gate correctly resolved b=2 for one frame, and
 * PM_applyChoreography's very next tick (triggered by 'c' stepping,
 * unrelated to 'b') silently clobbered PM_physics back to the leaked
 * PM_sliderValues.b. A synthetic slider-only fixture (cycle 1's own
 * regression test) could not have caught this: PM_applyChoreography's
 * rebuild-and-clobber only ever runs at all when the state authors
 * variable_choreography, which cycle 1's fixture never did. Found by
 * DIRECT INSTRUMENTATION on the REAL concept (wrapping computePhysics
 * itself and capturing every caller's stack), inside a REAL <iframe>
 * embedding (mirroring build_review_site.ts's own <iframe id="sim"
 * src="sim.html">) — a bare page.setContent() probe (no real iframe,
 * window.parent===window) initially reproduced a DIFFERENT, SPURIOUS
 * self-loop artifact (drawPlotPoint's outgoing PARAM_UPDATE looping back
 * into its own window) that a real iframe embedding does not share; that
 * false lead was explicitly identified and discarded before the real
 * mechanism was found. The coordinator's own leading hypothesis
 * (e.data.variables arriving via a SET_STATE the review-site player
 * posts) was directly instrumented and REFUTED: build_review_site.ts's
 * sendState() never carries a variables field; the iframe was observed to
 * receive ONLY bare {type:'SET_STATE', state} messages throughout.
 *
 * FIX: PM_applyChoreography's own overlay loop now calls the SAME
 * PM_overlayLiveControlValues(vars, stateData, stateSliderVars) the
 * SET_STATE handler already used — one centralised, gated function, every
 * caller, never a second hand-rolled copy again. The choreography-merge
 * loop (unrelated to this fix) is untouched. PM_liveDragScope (the
 * genuine-drag rebuild used WITHIN the currently-open state) and the
 * PARAM_UPDATE handler (which only ever updates PM_currentState's OWN live
 * control, never a value inherited across a state transition) remain
 * deliberately untouched — neither crosses a state boundary.
 *
 * CROSS-REFERENCE (2026-08-09): the cycle-2 fix here (advance_mode-only
 * gate) itself introduced a MAJOR regression in the opposite direction —
 * a guided-state in-state drag could now evaporate mid-choreography. Filed
 * as its OWN bug_class (a distinct defect, not folded into this row):
 * pcpl_guided_state_drag_evaporates_mid_choreography, see
 * _seed_engine_bug_queue_pcpl_guided_state_drag_evaporates_mid_choreography.ts.
 *
 * Idempotent: upsert onConflict 'bug_class'. Run:
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_pcpl_slider_leak_guided_state.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION =
    'founder_proxy Checkpoint B cycle 1, definite_integral_as_accumulated_area live drive, 2026-08-08; REOPENED by quality_auditor live-drive on the REAL concept (real iframe embedding, real mouse drag), 2026-08-08/09 (fix landed on desk fix/pcpl-slider-leak-guided-state, cut from origin/master 05eceff, PR #76)';

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
            'A teacher-dragged live-control value on the explore state silently overwrote a GUIDED state’s own authored default the instant that state was opened — TWO independent code paths did this; cycle 1 fixed one, cycle 2 found the second',
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:renderer_primitives',
        subject: 'subject_neutral',
        root_cause:
            "PM_sliderValues is a durable store written by a genuine canvas drag (drawCanvasSlider / drawPlotPoint's mouseIsPressed&&isActive branch) or a PARAM_UPDATE, and is NEVER cleared on SET_STATE — only PM_userTouched (the per-state seizure flag) is. TWO separate call sites independently rebuilt a state's vars by overlaying PM_sliderValues for any variable the CURRENT state declares as a live control, with zero regard for which state actually last wrote that value: (1) the SET_STATE handler's own inline loop (fixed cycle 1, gated via the new PM_overlayLiveControlValues on advance_mode==='interaction_complete'); (2) PM_applyChoreography's OWN independent copy of the identical loop (found cycle 2 — reopened after cycle 1's fix shipped) — this one runs every frame whenever the current state authors ANY variable_choreography, on ANY variable, and clobbers PM_physics back to the leaked value one frame after the SET_STATE handler's gate had correctly resolved it, whenever the state ALSO drags a DIFFERENT (or the same) variable as a live control. Measured on the REAL definite_integral_as_accumulated_area (real iframe embedding, real mouse drag, cycle 1's synthetic fixture could not reproduce this because it authored no variable_choreography): drag bound_marker to b=1.0909 on STATE_8 (explore), click STATE_5 (guided, drags 'b', choreographs 'c') in the rail — STATE_5's SET_STATE handler correctly resolved b=2, but PM_applyChoreography's very next tick (triggered by 'c', unrelated to 'b') clobbered it back to 1.0909, with touched={} throughout (PM_userTouched correctly cleared both times; PM_sliderValues silently was not, and a SECOND code path re-read it). STATE_2 (no choreography) and STATE_3/STATE_1 (choreograph OTHER variables but never author 'b' as their own live control) never triggered it — exactly matching the audit's own selective 'only STATE_5 bleeds' pattern.",
        prevention_rule:
            "A value a TEACHER sets interactively belongs to the state it was set in, not to every other state that happens to declare the same variable name as a live control. Only advance_mode:'interaction_complete' (Rule 31's ONE open-ended-manipulation sandbox state) may inherit a value set elsewhere — on both first entry and every re-entry. Every GUIDED state (any other advance_mode, or the field entirely absent) opens strictly on its OWN resolved vars (authored defaults / variable_overrides / an explicit inline override), full stop, regardless of what a teacher last dragged anywhere else or how recently. CYCLE-2 LESSON: this gate must be enforced at ONE centralised choke point every caller routes through (now PM_overlayLiveControlValues), never re-implemented per call site — a fix applied to only ONE of several structurally-identical copies is not a fix, it is a false sense of closure. When auditing a fix, grep for every OTHER place the SAME raw pattern (`for (... in PM_sliderValues) { if (stateSliderVars[...]) ... }`) still appears, not just the one the bug report named. And: a synthetic regression fixture must reproduce the REAL primitive's SHAPE (here: a plot_point.drag on a state that ALSO authors variable_choreography), not just the SAME function in isolation — a fixture that only calls the fixed function directly cannot see a second, independent caller that bypasses it entirely.",
        probe_type: 'js_eval',
        probe_logic:
            "check_cartesian_plane.ts sections 'WP-R6' and 'WP-R6 REOPENED'. WP-R6 (cycle 1): a dedicated sandbox (grabFn-extracts the SHIPPED PM_overlayLiveControlValues, supplies PM_sliderValues as a literal fixture) asserts the SET_STATE-handler door is closed, with negative controls and static reachability, as before. WP-R6 REOPENED (cycle 2): a SECOND dedicated sandbox (grabFn-extracts PM_applyChoreography + its real dependencies — PM_choreoValue/PM_choreoBuildSegments/PM_choreoSampleSegments/PM_overlayLiveControlValues/PM_resolveStateVars/PM_stateLiveControlVars — with computePhysics stubbed to a transparent vars-capturing echo) drives the REAL binding shape: a guided state authoring BOTH a plot_point.drag.bind_variable AND an unrelated variable_choreography entry. Asserts: the guided state resolves the dragged variable to its authored default, not the leaked PM_sliderValues value; the explore (interaction_complete) state still inherits (requirement 2 preserved); a seized choreography variable is still correctly excluded from the merge loop (regression guard, unrelated to this fix). NEGATIVE CONTROL FIRST: the pre-fix PM_applyChoreography (its own old raw overlay loop), reimplemented independently, IS shown to leak at the exact measured input; the shipped function is shown not to, at the SAME input; reverting the actual renderer fix and re-running the suite was ALSO confirmed to flip 5 assertions to FAIL, proving the gate non-vacuous. STATIC REACHABILITY: PM_applyChoreography's source is asserted to call PM_overlayLiveControlValues and to no longer contain its own inline overlay loop. A full end-to-end Playwright reproduction against the REAL concept JSON (git-show'd read-only from the parallel authoring branch, never checked into this desk's tracked tree) — inside a REAL <iframe> embedding (window.parent !== window, verified), with a real mouse drag (not a PARAM_UPDATE shortcut) — additionally confirmed: pre-fix, STATE_5 opened with b leaked to the dragged value (1.0909...); post-fix, STATE_5 opens at its authored default (2), and STATE_2/STATE_3/STATE_1 (the audit's own 'ok' states) are unaffected either way. A bare page.setContent() harness (no real iframe) was explicitly tried first, found to reproduce a DIFFERENT self-loop artifact unrelated to the real bug, and discarded before trusting any result from it.",
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
