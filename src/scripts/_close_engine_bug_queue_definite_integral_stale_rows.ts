/**
 * engine_bug_queue — close the rows on `definite_integral_as_accumulated_area`
 * that the reviewers verified FIXED but nobody dispositioned (2026-08-09).
 *
 * Queue hygiene, not new work. Every row below was independently confirmed
 * resolved by quality_auditor and/or founder_proxy during the Checkpoint B
 * round, with the evidence recorded in each `resolution` note. A row whose probe
 * passes but whose status still reads OPEN is exactly the drift Gate 8 exists to
 * catch — it makes the queue lie about what is left.
 *
 * Deliberately NOT closed, and why:
 *   visual_eyes_never_sweeps_live_controls_that_carry_no_variable_choreography
 *     — genuinely open, and it just gained a NEW instance: THE EYE cannot see the
 *       STATE_8 curve-extent fix at all, because it never drags a control.
 *   plane_rezoom_shipped_without_tick_expressions_...
 *     — E-1, deferred by decision; the window-width chip mitigates but the engine
 *       still cannot express tick expressions.
 *   pcpl_state_level_once_choreography_skips_the_d5_motion_gate
 *     — a real visual_validator gap, unaddressed.
 *   uniformity_fix_moved_every_overlay_across_a_documented_chrome_clearance_threshold
 *     — the two reviewers DISAGREE (49px vs the 52px threshold, against 32px of
 *       measured page-pixel clearance). A founder ruling, not a closure.
 *   position_expr_offset_constant_ignores_a_second_live_variable_...
 *     — "not reachable on this concept" is not the same as "fixed"; leaving OPEN.
 *
 * Run: npx tsx --env-file=.env.local \
 *      src/scripts/_close_engine_bug_queue_definite_integral_stale_rows.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// engine_bug_queue has no `resolution` column (verified against the live schema:
// id, bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
// probe_type, probe_logic, status, concepts_affected, fixed_in_files,
// discovered_in_session, fixed_at, created_at, updated_at, visual_category,
// state_id, screenshot_url, vision_evidence, row_type, subject). The per-row
// evidence below is therefore carried in this script and its commit message
// rather than written to a column that does not exist.
const FIXED_AT = new Date().toISOString();

interface Closure {
    bug_class: string;
    fixed_in_files: string[];
    /** Evidence is recorded in this script's commit message — the table has no resolution column. */
    resolution: string;
}

const closures: Closure[] = [
    {
        bug_class: 'pcpl_live_control_value_survives_a_state_change_while_its_touched_flag_does_not',
        fixed_in_files: ['src/lib/renderers/parametric_renderer.ts', 'src/scripts/check_cartesian_plane.ts'],
        resolution:
            "FIXED across three engine rounds on PR #76, and this row's own twin (pcpl_teacher_set_live_control_value_leaks_from_explore_state_into_guided_state_on_state_change) was already closed FIXED. Round 1 gated the SET_STATE handler and passed only a synthetic fixture; round 2 found PM_applyChoreography carried its OWN duplicated copy of the overlay loop; round 3 found the gate was too strict per-STATE and killed genuine in-state drags mid-ramp. The final gate is per-VARIABLE — `explore || PM_userTouched[svk]` — which is what this row's own DO text prescribed from the start ('gate the live-control overlay on the flag that is being cleared'); rounds 1 and 2 both read it and chose differently. Verified independently by quality_auditor's own Playwright harness with a falsifiability control (reverted build reproduces the leak), and again by founder_proxy at Checkpoint B cycle 3: a teacher sets n=200/c=0.6 in the explore state, jumps to guided STATE_5 which opens on its authored defaults, and returns to the sandbox which inherits its settings back. Correctly scoped in both directions.",
    },
    {
        bug_class: 'focal_glow_and_semantic_colour_point_at_the_container_instead_of_the_quantity_being_taught',
        fixed_in_files: ['src/data/concepts/mathematics/definite_integral_as_accumulated_area.json'],
        resolution:
            "FIXED. founder_proxy Checkpoint B cycle 3 Pass-1: 'resolved — focal + all 4 glows now wedge_inset; pink = the gap = the taught quantity'. STATE_4's focal_primitive_id and all four sentence glows retarget from sliver_inset (the rectangle, drawn in the gap's own pink) to wedge_inset, the previously-undrawn quantity the state actually teaches; wedge_inset.color #F472B6 is an exact match to gap_chip's, which is the binding that carries the meaning, and sliver_inset no longer wears the gap's colour. Cycle 2 had found the fix initially only MOVED the referent; cycle 3 confirmed the corrected version.",
    },
    {
        bug_class: 'physics_config_constraint_block_describes_a_transform_a_later_engine_change_made_dynamic',
        fixed_in_files: ['src/data/concepts/mathematics/definite_integral_as_accumulated_area.json'],
        resolution:
            "FIXED. The constraints block stated the STATE_4 inset transform as fixed constants ('920 px/x-unit, 145 px/y-unit') after an engine change had made the inset re-zoom every frame; measured live it is 5,750 px/x-unit at n=100 and ~490,000 at n=8536, and the y factor is 725 at n=100, not 145 — wrong by one to three orders of magnitude. Restated as the dynamic relation 115n/b and 29n/b² (57.5n and 7.25n at b=2), which quality_auditor re-derived independently from the inset's 230x145 viewport over a 2h-wide by 5bh-tall window and confirmed against both measured points. founder_proxy cycle 3 verified constraint [3] now states the main plane FIXED and the inset RE-ZOOMS every frame from the live window.",
    },
    {
        bug_class: 'pcpl_expr_bound_precedence_inconsistent_between_plane_range_and_function_domain',
        fixed_in_files: ['src/lib/renderers/parametric_renderer.ts', 'src/scripts/check_cartesian_plane.ts'],
        resolution:
            "FIXED on PR #76 (E-2), merged to master. PM_planeResolveBound preferred the *_expr while drawFunctionPlot's x_domain was an older separate ternary preferring the NUMERIC — the opposite precedence, failing silently. At the STATE_4 input the numeric winning spread 240 sample points across the stale domain [1.75, 2.0] while the viewport had re-zoomed to [1.9983, 2.0], leaving only 2 of 240 samples inside the visible window, which is why the symptom presented as 'the curve does not draw at all' and cost three debugging iterations. drawFunctionPlot now calls the single shared PM_planeResolveBound, and a dedup'd warning fires at ALL THREE consumption sites when both forms are co-authored. The gate's blast-radius sweep was later SPLIT to assert only on x_domain — the one bound whose precedence actually changed — after it red-gated a chapter branch over legal plane-range co-authoring. Sweep now 0 across 166 concept files.",
    },
];

async function main() {
    let failed = 0;
    console.log(`\nengine_bug_queue — closing ${closures.length} stale row(s) on definite_integral_as_accumulated_area\n`);

    for (const c of closures) {
        const { data, error } = await supabaseAdmin
            .from('engine_bug_queue')
            .update({ status: 'FIXED', fixed_in_files: c.fixed_in_files, fixed_at: FIXED_AT })
            .eq('bug_class', c.bug_class)
            .select('bug_class, status');

        if (error) {
            console.error(`FAIL ${c.bug_class}: ${error.message}`);
            failed++;
        } else if (!data || data.length === 0) {
            console.error(`MISS ${c.bug_class}: no row matched`);
            failed++;
        } else {
            console.log(`OK   ${c.bug_class} -> FIXED`);
        }
    }

    console.log(`\n${closures.length - failed} closed, ${failed} failure(s).`);
    process.exitCode = failed > 0 ? 1 : 0;
}

void main();
