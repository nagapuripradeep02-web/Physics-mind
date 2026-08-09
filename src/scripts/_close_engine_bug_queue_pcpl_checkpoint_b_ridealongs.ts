/**
 * Close the four engine_bug_queue rows fixed by the "PCPL Checkpoint B
 * ride-alongs" round (2026-08-09/10) — the four items filed OPEN by
 * quality_auditor/founder_proxy during definite_integral_as_accumulated_area
 * Checkpoint B cycle 3, fixed before the next mathematics concept started so
 * the next author does not inherit the traps.
 *
 * WHY THIS EXISTS AS A SCRIPT AND NOT A DIRECT DB WRITE: this desk
 * (fix/pcpl-checkpoint-b-ridealongs) carries no DB credentials — the standing
 * convention for every engine desk (see the header of every other
 * _seed_engine_bug_queue_*.ts / _close_engine_bug_queue_*.ts script in this
 * directory). Run this from a desk/session that has .env.local.
 *
 * Sets status FIXED + fixed_in_files for three rows that already existed
 * (filed OPEN by the definite_integral desk from cycle-3 findings) and
 * INSERTs one new row for the fourth (check-layout-overlap.mjs), which was
 * only ever recorded in prose (PROGRESS_MATHEMATICS.md "F8"), never seeded to
 * the table.
 *
 * Every other field (title, severity, root_cause, prevention_rule,
 * probe_type, probe_logic, concepts_affected, discovered_in_session) is left
 * BYTE-UNTOUCHED on the three existing rows — that is the incident's own
 * evidence and must survive its closure so a recurrence is recognisable.
 *
 * Run: npx tsx --env-file=.env.local \
 *      src/scripts/_close_engine_bug_queue_pcpl_checkpoint_b_ridealongs.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION =
    'peter_parker:pcpl_surgeon — the four OPEN ride-along rows from founder_proxy Checkpoint B ' +
    'cycle 3 on definite_integral_as_accumulated_area (2026-08-09), fixed on desk ' +
    'fix/pcpl-checkpoint-b-ridealongs before the next mathematics concept started, 2026-08-10.';

const CONCEPT_GATES = 'src/scripts/lib/conceptGates.ts';
const VALIDATE_MATH = 'src/scripts/validate-mathematics.ts';
const VALIDATE_CONCEPTS = 'src/scripts/validate-concepts.ts';
const REVIEW_SITE = 'src/scripts/build_review_site.ts';
const REVIEW_TIMELINE_CHECK = 'src/scripts/check_review_site_timeline.ts';
const LAYOUT_OVERLAP = 'src/scripts/check-layout-overlap.mjs';
const GATE_TEST = 'src/scripts/lib/__tests__/conceptGates.pcplRidealongs.test.ts';

/** bug_class -> fixed_in_files, for the THREE rows that already exist (UPDATE only). */
const CLOSURES: Record<string, string[]> = {
    // Item 1 — animate_in_ms dead config: WARN-only gate added (not a hard
    // fail — runtime behaviour deliberately unchanged, per founder_proxy's
    // own "make it visible rather than silent" instruction).
    pcpl_animate_in_ms_is_silently_dead_config_on_an_appear_at_ms_zero_primitive: [
        CONCEPT_GATES, VALIDATE_MATH, VALIDATE_CONCEPTS, GATE_TEST,
    ],
    // Item 2 — renderer-output/teacher-control namespace collision: WARN-only
    // assert added (measured: definite_integral_as_accumulated_area itself
    // would FAIL a hard assert today — bars_drawn_var:'n' vs STATE_8's
    // slider variable:'n' — and this desk cannot rename a concept JSON, so
    // the assert stays a warning until the concept is next touched).
    pcpl_renderer_output_variable_shares_its_name_with_a_teacher_control_in_another_state: [
        CONCEPT_GATES, VALIDATE_MATH, VALIDATE_CONCEPTS, GATE_TEST,
    ],
    // Item 3 — #scrubtime stale on rail entry: computeTimeline() now ends by
    // calling updateScrubLabel() itself.
    review_player_scrub_total_label_not_refreshed_on_rail_entry_so_a_state_reads_zero_seconds: [
        REVIEW_SITE, REVIEW_TIMELINE_CHECK,
    ],
};

async function main(): Promise<void> {
    let failed = 0;

    console.log(`\nengine_bug_queue — closing ${Object.keys(CLOSURES).length} existing row(s)\n`);
    for (const bugClass of Object.keys(CLOSURES)) {
        const { data: existing, error: readErr } = await supabaseAdmin
            .from('engine_bug_queue')
            .select('bug_class, status, fixed_in_files')
            .eq('bug_class', bugClass)
            .maybeSingle<{ bug_class: string; status: string; fixed_in_files: string[] | null }>();
        if (readErr) { console.error(`FAIL read ${bugClass}:`, readErr.message); failed++; continue; }
        if (!existing) { console.error(`FAIL ${bugClass}: no existing row — expected one filed OPEN by the definite_integral desk`); failed++; continue; }

        const mergedFiles = Array.from(new Set([...(existing.fixed_in_files ?? []), ...CLOSURES[bugClass]]));
        const { error: updErr } = await supabaseAdmin
            .from('engine_bug_queue')
            .update({ status: 'FIXED', fixed_in_files: mergedFiles })
            .eq('bug_class', bugClass);
        if (updErr) { console.error(`FAIL update ${bugClass}:`, updErr.message); failed++; }
        else console.log(`OK   ${bugClass} -> FIXED (was ${existing.status})`);
    }

    // ── Item 4 — NEW row (never seeded; only recorded in prose as "F8"). ────
    const NEW_ROW = {
        bug_class: 'pcpl_layout_overlap_checker_measures_data_space_labels_against_pixel_space_boxes_and_ignores_temporal_disjointness',
        title: 'check-layout-overlap.mjs read plane-transformed (data-space) label positions as raw pixels and had no time axis, so it both fabricated and missed collisions',
        severity: 'MODERATE' as const,
        owner_cluster: 'peter_parker:renderer_primitives' as const,
        subject: 'subject_neutral',
        root_cause:
            "Two independent causes, both verified live on definite_integral_as_accumulated_area before the fix and absent after it. (a) A label/annotation carrying plane_id lives in a cartesian_plane's DATA-space coordinate system (mirrors PM_planeBuildTransform, parametric_renderer.ts); the checker read p.position.x/.y as PIXEL coordinates unconditionally, reporting boxes like x=-29..30 for a label that actually paints ~290px away, and — for a position_expr-driven label (a choreographed sweep, e.g. STATE_7's accum_curve_label tracking beta 0->2) — evaluated only the LITERAL fallback position, never the swept range. (b) The checker had no time axis: STATE_1's edge_readout_draw (disappear_at_ms:9000) and edge_readout_fill (appear_at_ms:9000) are a scheduled crossfade HANDOFF, never simultaneously on screen, but were flagged as a spatial collision anyway. Full-fleet sweep (165 concepts, physics+mathematics+chemistry) measured 259 total reported collisions before the fix, 148 after — net -111, with the removed set concentrated in graph_transformations (95->0, ALL false) and law_of_conservation_of_mass (11->0, ALL false: crossfade-handoff pairs named *_literal/*_live and reading_N/reading_M).",
        prevention_rule:
            "A layout checker that measures a primitive's authored fields must resolve them through the SAME transform the renderer applies before comparing pixel boxes — a plane_id/position_expr pair is DATA space, not pixel space, and a choreographed position_expr has a swept RANGE of positions, not one instant; sample the swept range (bounded by the state's own variable_choreography from/to) and union the resulting pixel envelope rather than reading only the literal fallback. Separately, ANY layout checker over authored appear_at_ms/disappear_at_ms primitives needs a temporal axis: two primitives whose active windows do not overlap by more than one rendered frame (~16.7ms) are never simultaneously visible, so a spatial overlap between them is not a real collision. An identifier the checker cannot resolve (not a declared variable/formula/choreographed sweep/Math builtin) must be SKIPPED with the exact identifier named — never guessed as pixel space, which was the original defect's own direction of error. A bonus one-line fix landed in the same change: formula_box's real text field is `equation` (verified 76/76 formula_box primitives use it, 0 use text/text_expr) — both this script and its validate-concepts.ts twin previously read only text/text_expr, so EVERY formula_box measured as a near-empty ~16x28px box, a silent UNDER-measurement (missed true collisions) in the opposite direction from causes (a)/(b); fixing it recovered real collisions on direction_of_resultant.json and others (see fixed_in_files' commit for the exact list) that were previously invisible.",
        probe_type: 'manual' as const,
        probe_logic:
            "npm run <no wrapper script — invoke directly> `node src/scripts/check-layout-overlap.mjs <concept-id>`. Regression pair: definite_integral_as_accumulated_area must report 0 collisions (was 2, both false: edge_readout_draw<->edge_readout_fill via cause (b), curve_label<->accum_curve_label via cause (a)). Negative control: `git stash` the fix and re-run — the two false collisions reproduce verbatim. Fleet-wide sweep script (ad hoc, not committed): iterate every concept_id's JSON path through the checker before/after, diff `collision(s)` totals.",
        concepts_affected: [
            'definite_integral_as_accumulated_area', 'derivative_as_secant_limit', 'graph_transformations',
            'unit_circle_to_sine_wave', 'scalar_vs_vector', 'vector_addition_law', 'law_of_conservation_of_mass',
        ],
        fixed_in_files: [LAYOUT_OVERLAP, VALIDATE_CONCEPTS],
        discovered_in_session: SESSION,
        status: 'FIXED' as const,
        row_type: 'incident' as const,
    };

    const { error: insErr } = await supabaseAdmin
        .from('engine_bug_queue')
        .upsert(NEW_ROW, { onConflict: 'bug_class' });
    if (insErr) { console.error('FAIL insert new row:', insErr.message); failed++; }
    else console.log(`OK   ${NEW_ROW.bug_class} [FIXED] (${NEW_ROW.severity}) — NEW row`);

    process.exitCode = failed > 0 ? 1 : 0;
    console.log(`\n${Object.keys(CLOSURES).length} row(s) closed + 1 new row inserted; ${failed} failure(s).`);
}

void main();
