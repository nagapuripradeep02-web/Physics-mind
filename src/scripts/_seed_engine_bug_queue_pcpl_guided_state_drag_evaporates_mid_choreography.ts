/**
 * engine_bug_queue row for bug_class
 * pcpl_guided_state_drag_evaporates_mid_choreography (quality_auditor
 * round 3, 2026-08-09) — a MAJOR REGRESSION introduced by the cycle-2 fix
 * for pcpl_teacher_set_live_control_value_leaks_from_explore_state_into_
 * guided_state_on_state_change (see the sibling seed script
 * _seed_engine_bug_queue_pcpl_slider_leak_guided_state.ts). Filed as its
 * OWN bug_class, not folded into that row: this is a distinct defect (the
 * cross-state FIX being too strict in the OTHER direction), found by a
 * DIFFERENT audit, with its OWN root cause and its OWN fix — cross-
 * referenced, not merged, so the scar list keeps the causal chain legible.
 *
 * Filed here (not by the fixing desk directly) because no engine desk
 * carries DB credentials — same convention as every other _seed_engine_
 * bug_queue_*.ts script on this desk.
 *
 * ROOT CAUSE: cycle 2's fix (PM_overlayLiveControlValues gated ONLY on
 * advance_mode==='interaction_complete') closed the cross-state leak but
 * created a new, worse-shaped defect: PM_applyChoreography rebuilds vars
 * from PM_resolveStateVars on every frame in which ANY choreographed
 * variable in the CURRENT state moves, and re-runs
 * PM_overlayLiveControlValues each time. On a guided state (never
 * interaction_complete), that gate now ALWAYS refused the overlay — so a
 * drag-seized live control that is NOT ITSELF the choreographed variable
 * had nothing keeping it alive: the very next unrelated choreography tick
 * silently evaporated it back to the authored default. PM_userTouched[b]
 * was already true (a genuine mouse drag correctly seized it), but that
 * flag only protected CHOREOGRAPHED variables via the separate PM_choreoValues
 * merge loop — it was never consulted by the overlay itself. Once the
 * OTHER variable's choreography settled (its ramp finished, PM_applyChoreography's
 * own `if (!changed) return` stopped rebuilding at all), the LAST value a
 * genuine drag branch had set (via its own direct computePhysics call,
 * untouched by any of this) happened to survive — so the SAME drag held
 * or evaporated depending ENTIRELY on whether the teacher happened to drag
 * during or after an unrelated ramp. A value surviving or dying depending
 * on timing is worse than a consistent failure: it looks like a flaky sim,
 * not a bug with a describable trigger. Measured end-to-end on the REAL
 * definite_integral_as_accumulated_area, real iframe embedding, real mouse
 * drag (pre-fix): STATE_5 drag DURING STATE_5's own c-ramp (pin 6000,
 * start_ms:2000/duration_ms:12000, so active 2000-14000ms) evaporated to
 * the authored default within the SAME drag gesture (during-drag already
 * read back the default, not the just-set value); the IDENTICAL drag
 * AFTER the ramp settled (pin 16000) held correctly. The explore state's
 * own drag control is unaffected either way (its gate was never the
 * advance_mode-only one).
 *
 * FIX: PM_overlayLiveControlValues now gates each variable independently
 * on `explore || PM_userTouched[svk]` instead of `explore` alone.
 * PM_userTouched is the exactly-right admission flag: it is wiped to {}
 * ONLY on a genuine isNewState SET_STATE (the SET_STATE handler's own
 * `PM_userTouched = {}`, which always runs BEFORE this function is called
 * again), and set true ONLY by a real mouse-drag claim on the CURRENT
 * state's own primitive (drawCanvasSlider / drawPlotPoint's genuine-drag
 * branches — the ONLY two write sites in the whole file). So
 * PM_userTouched[svk]===true encodes exactly "svk was dragged during THIS
 * visit to the current state" — it can never carry across a real state
 * change (closing the cross-state door stays closed by construction, not
 * by coincidence), but it now correctly keeps an in-state drag alive
 * across that SAME state's own unrelated choreography ticks for the rest
 * of that one visit. Re-entering the state later (a fresh isNewState)
 * still opens on its authored default — seizure never survives an actual
 * state change, guided or explore, unchanged from cycle 2.
 *
 * COLLATERAL FINDING (same audit, NOT a defect, do not "fix"): the explore
 * state's OWN choreographed-and-seizable variable (STATE_8's 'b',
 * ping_pong, seizable) is overwritten back to its live choreographed value
 * on RE-ENTRY to that state (PM_userTouched wiped fresh, so the
 * choreo-merge loop's `if (!PM_userTouched[ck])` no longer excludes it) —
 * a non-choreographed control (STATE_8's 'c') correctly inherits on the
 * SAME re-entry. This is arguably the authored intent (the sandbox
 * restarts its own demo) and was explicitly left unchanged; the
 * check_cartesian_plane.ts assertion that PREVIOUSLY claimed a blanket
 * "explore state inherits, entry and re-entry, no distinction" was
 * rewritten to state the per-variable truth instead (the SAME synthetic-
 * fixture blind spot that hid the cycle-2 door: a fixture testing
 * PM_overlayLiveControlValues in isolation cannot see the choreo-merge
 * loop composed after it).
 *
 * Idempotent: upsert onConflict 'bug_class'. Run:
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_pcpl_guided_state_drag_evaporates_mid_choreography.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION =
    'quality_auditor round 3 on PR #76 (cross-state fix confirmed via founder_proxy probe, then a stricter-than-intended gate found in the OTHER direction), 2026-08-09 (fix landed on desk fix/pcpl-slider-leak-guided-state, cut from origin/master 05eceff, PR #76, same desk as cycles 1/2)';

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
        bug_class: 'pcpl_guided_state_drag_evaporates_mid_choreography',
        title:
            'The cycle-2 cross-state-leak fix over-corrected: a genuine in-state drag on a guided state now evaporated back to its authored default the instant ANY unrelated choreographed variable in the SAME state ticked — but only while that OTHER ramp was still active, so the same drag held or died purely by timing',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        subject: 'subject_neutral',
        root_cause:
            "PM_overlayLiveControlValues (cycle 2) gated its overlay purely on stateData.advance_mode==='interaction_complete' — correct for the cross-state leak, but it meant a GUIDED state's overlay was ALWAYS refused, with no exception for a variable genuinely seized WITHIN that same state's own visit. PM_applyChoreography rebuilds vars (via this SAME function) on every frame in which ANY choreographed variable in the CURRENT state moves, not just the dragged one — so a guided state authoring BOTH a plot_point.drag.bind_variable (e.g. 'b') AND an unrelated variable_choreography entry (e.g. 'c') had its drag-seized 'b' silently clobbered back to default by 'c's own ramp stepping, on every frame the ramp was still active. Once the ramp settled, PM_applyChoreography's own early-return ('if (!changed) return') stopped rebuilding entirely, so the drag branch's own last-set value (from its direct, ungated computePhysics call) happened to survive. Measured end-to-end (real iframe, real mouse drag) on definite_integral_as_accumulated_area's real STATE_5 (drags 'b', choreographs 'c', ramp active 2000-14000ms): dragging DURING the ramp (pin 6000) evaporated the drag WITHIN THE SAME GESTURE; the identical drag AFTER the ramp settled (pin 16000) held correctly.",
        prevention_rule:
            "A per-state cross-boundary gate (advance_mode alone) and a per-variable within-state seizure gate (PM_userTouched) answer DIFFERENT questions and must both be checked, independently, per variable: 'is this the ONE state allowed to blanket-inherit' OR 'was THIS SPECIFIC variable seized during THIS visit'. Gating on only the first starves any live control that survives its own drag but is not the sandbox state. The admission flag for the second question must be the SAME flag that is provably wiped on every real state boundary (here PM_userTouched, cleared exactly once, at the SET_STATE handler's own isNewState branch, before this function can run again) — reusing an existing, already-correctly-scoped flag is safer than inventing a new one. When a fix changes a gate's STRICTNESS in one direction, explicitly drive a same-visit in-state interaction afterward (not just a cross-state jump) before declaring the fix complete — the two failure directions (leaks too much / refuses too much) are both real and must both be tested.",
        probe_type: 'js_eval',
        probe_logic:
            "check_cartesian_plane.ts section 'WP-R6' (round 3 additions) — a GUIDED-state fixture with PM_userTouched.b=true asserts the drag value applies (was previously refused); a NEGATIVE CONTROL reimplementing the round-1-only gate (advance_mode alone) is shown to refuse it at the same input. Section 'WP-R6 REOPENED' (round 3 additions) — the SAME distinction driven through the FULL PM_applyChoreography pipeline (a state dragging 'b' while choreographing an unrelated 'c', simClockMs mid-ramp): the shipped code holds the drag at 1.2, the reimplemented pre-round-3 algorithm evaporates it back to 2, at the identical input. A DISTINGUISHING PAIR fixture (both drag-bound AND choreographed 'b' vs a non-choreographed 'c' control) demonstrates the collateral, deliberately-unchanged re-entry behaviour explicitly, replacing a prior assertion that made an inaccurate blanket claim. Reverting the actual renderer fix and re-running the suite flips 4 assertions to FAIL, proving the gate non-vacuous. A full end-to-end Playwright reproduction against the REAL concept JSON (git-show'd read-only, never checked into this desk's tracked tree), inside a REAL <iframe> embedding, using SET_TIME_FREEZE to reach each pin deterministically before a REAL mouse drag: pre-fix, pin 6000 (mid-ramp) evaporates the drag to the default WITHIN the drag gesture itself; pin 16000 (post-ramp) holds; post-fix, BOTH pins hold at the dragged value (1.2), and the explore-state control is unaffected either way. The cross-state bleed probe (cycle 2's own end-to-end reproduction) was re-run unchanged afterward and remains clean — the regression risk of this fix is that it could reopen cycle 2's door; it does not.",
        status: 'FIXED',
        concepts_affected: [
            'definite_integral_as_accumulated_area',
            'derivative_as_secant_limit', 'unit_circle_to_sine_wave', 'graph_transformations',
            'bohr_model_energy_levels', 'law_of_conservation_of_mass',
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
