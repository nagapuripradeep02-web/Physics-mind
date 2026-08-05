/**
 * Close the engine_bug_queue rows fixed by the 2026-08-05 "fix all" pass.
 *
 * WHY THIS EXISTS AS A SCRIPT: a row that is fixed but left OPEN is the exact
 * defect this session already reported once — `parametric_from_expr_to_expr_
 * never_consumed` sat OPEN for two weeks after drawVector started consuming
 * both fields, and an author consulting the scar list would have avoided the
 * very fields the first mathematics concept is built on. Fixing the code and
 * leaving the row is half a fix.
 *
 * Sets status FIXED + fixed_in_files. Every other field is left byte-untouched:
 * root_cause and probe_logic are the incident's evidence and must survive its
 * closure, so a recurrence can be recognised.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_close_engine_bug_queue_unit_circle_fixes.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const RENDERER = 'src/lib/renderers/parametric_renderer.ts';
const CONCEPT_JSON = 'src/data/concepts/mathematics/unit_circle_to_sine_wave.json';
const OVERLAP = 'src/scripts/check-layout-overlap.mjs';

/** bug_class -> the files that actually carry the fix. */
const CLOSURES: Record<string, string[]> = {
    // ── Platform, master 084f06c ──────────────────────────────────────────
    pcpl_slider_label_stale_under_choreography: [RENDERER],
    pcpl_vector_and_angle_arc_ignore_appear_at_ms_so_authored_reveal_chains_no_op: [RENDERER],
    pcpl_drawvector_has_no_focal_glow_channel: [RENDERER],
    pcpl_vector_label_at_segment_midpoint_is_bisected_by_a_vertical_segment: [RENDERER],
    // Stale-OPEN: drawVector has consumed from_expr/to_expr via PM_safeEvalPoint
    // since the fix whose own comment sits at the call site. Closed on evidence,
    // not on a new edit.
    parametric_from_expr_to_expr_never_consumed: [RENDERER],

    // ── Tooling, master e0734a9 ───────────────────────────────────────────
    formula_surface_footprint_overlaps_an_authored_curve_end_label: [CONCEPT_JSON, OVERLAP],

    // ── Authoring, desk ───────────────────────────────────────────────────
    pcpl_position_expr_authored_as_an_object_literal_string_pins_the_body_to_the_renderer_default: [CONCEPT_JSON],
    skeleton_budgeted_frozen_pins_are_never_transcribed_into_eye_capture_ms: [CONCEPT_JSON],
    hud_prints_negative_zero_on_a_value_only_instrument: [CONCEPT_JSON],
    state_opens_on_the_degenerate_value_of_the_identity_it_teaches: [CONCEPT_JSON],
    narration_names_a_reference_line_the_scene_never_draws: [CONCEPT_JSON],
    authoring_side_do_clause_of_an_open_scar_is_not_re_checked_against_the_finished_json: [CONCEPT_JSON],
    angle_arc_label_collides_with_the_segment_that_shares_its_angular_band: [CONCEPT_JSON],
    axis_tick_labels_reveal_before_the_axis_they_annotate: [CONCEPT_JSON],
    ping_pong_endpoint_is_the_degenerate_case_of_the_identity_being_taught: [CONCEPT_JSON],
};

/**
 * Deliberately LEFT OPEN, with the reason, so nobody has to re-derive it:
 *
 *   pcpl_glow_focus_cannot_resolve_an_expression_driven_vector_or_a_locus_trace
 *     PM_resolvePrimitiveCenter still reads literal from/to only and still has
 *     no locus_trace branch. The concept works around it in AUTHORING (every
 *     halo names a body); the engine is unchanged.
 *   pcpl_glow_focus_renders_a_halo_before_its_target_body_has_appeared
 *     Same shape: the JSON now gates each halo on its target's appear_at_ms,
 *     but drawGlowFocus still never consults the target's own gate.
 *   angle_arc_label_lands_on_the_reference_line_when_the_arc_is_degenerate_or_full
 *     The S6 instance is gone (that arc's label was dropped), but the renderer
 *     still places a label at mid-angle with no awareness of what is drawn
 *     there, so any future full/degenerate arc reproduces it.
 *   eye_pixel_gates_pass_over_a_body_frozen_at_the_renderer_default_coordinate
 *     THE EYE is unchanged. This is the row that most deserves its gate.
 *   eye_walker_dispatched_against_a_run_dir_a_newer_run_has_superseded
 *     Process, not code. No `latest` symlink exists yet.
 */
async function main(): Promise<void> {
    const names = Object.keys(CLOSURES);
    console.log(`\nengine_bug_queue — closing ${names.length} fixed row(s)\n`);
    let closed = 0;
    for (const bugClass of names) {
        const { data, error } = await supabaseAdmin
            .from('engine_bug_queue')
            .select('bug_class, status')
            .eq('bug_class', bugClass)
            .maybeSingle<{ bug_class: string; status: string }>();
        if (error) throw new Error(`read ${bugClass} failed: ${error.message}`);
        if (!data) {
            console.log(`⚠️  not found, skipped: ${bugClass}`);
            continue;
        }
        if (data.status === 'FIXED') {
            console.log(`•  already FIXED: ${bugClass}`);
            continue;
        }
        const { error: upErr } = await supabaseAdmin
            .from('engine_bug_queue')
            .update({ status: 'FIXED', fixed_in_files: CLOSURES[bugClass] })
            .eq('bug_class', bugClass);
        if (upErr) throw new Error(`update ${bugClass} failed: ${upErr.message}`);
        console.log(`✅ ${data.status} → FIXED   ${bugClass}`);
        closed += 1;
    }
    console.log(`\nDone. ${closed} row(s) closed.`);
}

main().catch((err) => {
    console.error('💥 close failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
