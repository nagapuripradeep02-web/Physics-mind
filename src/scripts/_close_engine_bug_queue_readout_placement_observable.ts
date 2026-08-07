/**
 * engine_bug_queue — close the readout/label placement class structurally
 * (pcpl_surgeon engine round, feat/pcpl-readout-placement-observable,
 * 2026-08-07). Founder directive: close the readout/label placement class
 * structurally after three consecutive authoring fix rounds on
 * derivative_as_secant_limit each moved a label and each exposed a new
 * collision; two founder_proxy Checkpoint B cycle-1 reports named the engine
 * as the correct owner.
 *
 * Fixes shipped, in src/lib/renderers/parametric_renderer.ts:
 *   1. Observability — window.__pmDebug.readouts[primitive_id] now exposes
 *      the RESOLVED anchor/offset/bbox for every readout-bearing primitive
 *      (plot_point, secant_line, tangent_line), reset each frame before
 *      Pass 0.25. A placement can now be READ rather than asserted.
 *   2. One resolver, all three call sites — secant_line/tangent_line
 *      readouts now route through PM_readoutResolveOffset (the SAME
 *      collision-aware resolver plot_point already used) before
 *      PM_clampOffsetToCanvas, instead of clamp-only.
 *   3. Widened obstacle set (READOUT side) — PM_readoutDangerZones now folds
 *      in PM_planeInkZones, a per-frame per-plane registry populated by:
 *      drawCartesianPlane's gridlines (when spec.gridlines), drawFunctionPlot's
 *      sampled polyline (per-segment padded rects, never one bbox for a whole
 *      curve), drawSecantLine/drawTangentLine's own chord/tangent ink
 *      (subdivided via PM_registerLineInk — never one bbox for an
 *      extend:'frame' diagonal, which would blanket the viewport), a
 *      plot_point's own marker dot, and every readout's own FINAL resolved
 *      box (so a later-drawn readout on the same plane this frame sees an
 *      earlier one as an obstacle). Draw order is FIXED per Pass 0.3
 *      (function_plot -> secant_line -> tangent_line -> plot_point,
 *      CP-C2/D12), so "what's registered so far" is deterministic and
 *      THE-EYE-stable, never a function of scene_composition array order.
 *      Scoped to READOUTS only — `label`/`annotation` primitives still have
 *      NO ink-collision awareness; that half of the class stays OPEN (see
 *      parametric_readout_and_label_collision_awareness_does_not_cover_a_
 *      sibling_primitives_curve_or_line_ink, left untouched below) and so
 *      does readout-vs-de-overlap-solver
 *      (canvas_drawn_readouts_never_enter_the_de_overlap_solver_so_readout_
 *      vs_authored_label_text_collisions_are_ungated, also untouched).
 *   4. PM_fmtNum(value, decimals) — one shared numeric formatter (toFixed,
 *      then substitute the ASCII hyphen for U+2212, with the same near-zero
 *      EPS clamp PM_formatTickLabel already used) — wired into
 *      PM_plotPointResolve, PM_secantTangentReadout, AND (extension,
 *      evidenced by the graph_transformations founder_proxy P3-2 finding
 *      naming this formatter by name) PM_formatTickLabel's numeric AND
 *      pi-fraction branches. Does NOT touch ascii_minus_in_oncanvas_math_
 *      from_tofixed's own status (alex:json_author, already FIXED,
 *      recurred 3x) — that row is left exactly as-is per the founder's
 *      explicit instruction; this fix closes ONE of its recurring surfaces
 *      but the row's ownership/status decision is the founder's to make.
 *
 * Deliberately NOT done this round (reported, not fixed):
 *   - Item 5 (draw-order — tick labels drawn in a LATE pass after curves,
 *     Pass 0.25 -> some Pass >0.3) — lowest priority per the founder's own
 *     ordering ("if you still have budget"); would touch nearly every
 *     state's baseline in both concepts and needs founder re-approval before
 *     it can ship, so left as a clean follow-up boundary.
 *   - label/annotation ink-collision awareness (the OPEN row above) — a
 *     materially larger mechanism (PM_resolveAnnotationOverlap doesn't even
 *     see `label` primitives today, only `annotation`).
 *   - The resolver's "flip once, no search" doctrine is UNCHANGED (pre-
 *     existing, documented) — a widened obstacle set can still leave a
 *     marginal residual on the mirrored side (observed: derivative_as_
 *     secant_limit STATE_5's flipped "chord slope" readout grazes the
 *     curve at one corner post-flip, vs. sitting squarely on the x-axis
 *     tick row pre-flip — a real, disclosed improvement, not a full fix).
 *
 * Verify chain (fix/pcpl-readout-placement-observable, off master 8c1957f):
 *   npx tsc --noEmit                -> 0 errors
 *   npm run check:renderer-syntax   -> field_3d/particle_field/parametric all OK
 *   npm run visual:eyes -- derivative_as_secant_limit -> 56/56 (against the
 *     REAL committed baselines, original un-borrowed content)
 *   npm run visual:eyes -- graph_transformations        -> 50/50 (same)
 *   npm run visual:eyes -- unit_circle_to_sine_wave      -> 50/50 (isolation
 *     check — no cartesian_plane primitives, zero code path touched)
 *   npm run visual:eyes -- scalar_vs_vector              -> 32/32 (physics
 *     concept on the SAME parametric engine)
 *   npm run visual:eyes -- ohms_law                      -> 38/38 (particle_field
 *     engine, untouched file)
 *   npm run visual:eyes -- newton_first_law              -> 24/26 pre-existing
 *     STATE_4 2.61% H2 diff, CONFIRMED present identically on bare master via
 *     git-stash isolation (unrelated to this change; field_3d_renderer.ts was
 *     never touched)
 *   Ad-hoc verification (Playwright + assembleSimFromSource, borrowed the
 *   unmerged Checkpoint-B-fixed content from the sibling desks for realistic
 *   repro only, reverted before commit): the G-1 repro
 *   (derivative_as_secant_limit STATE_9, x0=1/xq=-1, the symmetric pose)
 *   visually confirmed fixed via window.__pmDebug + screenshot; the G-4
 *   repro (STATE_5 "chord slope" on the x-axis tick row) visually confirmed
 *   fixed via the same method.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_close_engine_bug_queue_readout_placement_observable.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'pcpl_surgeon engine round — readout/label placement observable, 2026-08-07 (fix/pcpl-readout-placement-observable)';
const FIXED_IN = ['src/lib/renderers/parametric_renderer.ts'];

async function closeExisting(bugClass: string, addConcepts: string[]): Promise<void> {
    const { data, error: selErr } = await supabaseAdmin
        .from('engine_bug_queue')
        .select('bug_class,status,concepts_affected,fixed_in_files')
        .eq('bug_class', bugClass)
        .maybeSingle();
    if (selErr) throw new Error(`select ${bugClass} failed: ${selErr.message}`);
    if (!data) { console.log(`⚠ no existing row for ${bugClass} — skipping close.`); return; }

    const affected = data.concepts_affected ?? [];
    const nextAffected = Array.from(new Set([...affected, ...addConcepts]));
    const priorFiles: string[] = data.fixed_in_files ?? [];
    const nextFiles = Array.from(new Set([...priorFiles, ...FIXED_IN]));

    if (data.status === 'FIXED') {
        console.log(`⚠ ${bugClass} already FIXED — appending concepts/files only, status untouched.`);
        const { error } = await supabaseAdmin.from('engine_bug_queue')
            .update({ concepts_affected: nextAffected, fixed_in_files: nextFiles })
            .eq('bug_class', bugClass);
        if (error) throw new Error(`append ${bugClass} failed: ${error.message}`);
        return;
    }

    const { error } = await supabaseAdmin.from('engine_bug_queue')
        .update({
            status: 'FIXED',
            fixed_at: new Date().toISOString(),
            fixed_in_files: nextFiles,
            concepts_affected: nextAffected,
        })
        .eq('bug_class', bugClass);
    if (error) throw new Error(`close ${bugClass} failed: ${error.message}`);
    console.log(`✅ FIXED ${bugClass} (was ${data.status})`);
}

const NEW_ROW = {
    bug_class: 'parametric_readout_obstacle_set_widened_to_curve_gridline_dot_and_sibling_readout_ink',
    title: 'Readout placement (plot_point/secant_line/tangent_line) is now collision-aware against a curve’s own ink, a plane’s gridlines, a point’s own marker dot, and any OTHER readout already drawn this frame — not just the plane’s two static axis bands',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause: 'PM_readoutDangerZones used to return exactly two static rects (the y-axis tick column, the x-axis tick row) regardless of anything else drawn in the scene. Confirmed live collisions this closes: STATE_9’s Q readout landing inside P’s readout at the symmetric pose xq=-x0 (readout-vs-readout — P is registered as an ink zone the moment it draws, so a later-drawn readout on the same plane this frame sees it); a plot_point candidate offset landing partially on the function_plot curve’s own stroke (readout-vs-curve — function_plot registers a small padded rect per already-short sample segment, Pass 0.3’s fixed draw order guarantees it registers before any secant/tangent/plot_point readout resolves); a gridline running through a readout’s row/column when spec.gridlines is true (readout-vs-gridline). Extend:\'frame\' secant/tangent lines are subdivided into 24 short segments (PM_registerLineInk) rather than one bounding box, so a corner-to-corner diagonal does not blanket the whole viewport as a false-positive obstacle.',
    prevention_rule: 'Any NEW ink-producing primitive on a cartesian_plane (a new curve family, a new marker type) should register its drawn pixels into PM_planeInkZones via PM_registerInkZone/PM_registerLineInk as it draws, in the SAME change that adds it — otherwise its ink is invisible to every readout’s collision test, silently reintroducing this bug_class for the new primitive type. The resolver’s “flip once, no iterative search” doctrine is unchanged (Rule 36: deterministic, O(1)) — a widened obstacle set makes MORE collisions detectable, but a flip is still not guaranteed collision-free on the mirrored side; verify any new offset by reading window.__pmDebug.readouts[id].bbox at the actual rendered frame, not by arithmetic. `label`/`annotation` primitives are explicitly OUT of this fix’s scope — they still have zero ink-collision awareness (see the sibling OPEN row parametric_readout_and_label_collision_awareness_does_not_cover_a_sibling_primitives_curve_or_line_ink, left open).',
    probe_type: 'js_eval',
    probe_logic: 'For each state at its eye_capture_ms pin (or any drag/PARAM_UPDATE pose reachable via the state’s authored drag.min/max): read window.__pmDebug.readouts — assert no two entries’ bbox rects overlap (PM_rectsOverlap), and for every function_plot/secant_line/tangent_line on the same plane_id, assert the readout bbox does not intersect that primitive’s sampled/subdivided ink segments. Reference regression: derivative_as_secant_limit STATE_9 at x0=1,xq=-1 (P and Q bboxes must be disjoint); STATE_5 at defaults (the “chord slope” bbox must not overlap the plane’s x-axis tick-label band).',
    concepts_affected: ['derivative_as_secant_limit', 'graph_transformations'],
    fixed_in_files: FIXED_IN,
    discovered_in_session: SESSION,
    status: 'FIXED',
    fixed_at: new Date().toISOString(),
};

async function insertIfAbsent(row: typeof NEW_ROW): Promise<void> {
    const { data: existing } = await supabaseAdmin
        .from('engine_bug_queue').select('bug_class').eq('bug_class', row.bug_class).maybeSingle();
    if (existing) { console.log(`already filed: ${row.bug_class} — skipping insert.`); return; }
    const { error } = await supabaseAdmin.from('engine_bug_queue').insert(row);
    if (error) throw new Error(`insert ${row.bug_class} failed: ${error.message}`);
    console.log(`✅ FILED (FIXED) ${row.bug_class}`);
}

async function main(): Promise<void> {
    await closeExisting(
        'readout_collision_flip_is_wired_at_one_call_site_of_three_so_an_authored_offset_means_different_things_per_primitive',
        ['derivative_as_secant_limit', 'graph_transformations'],
    );
    await insertIfAbsent(NEW_ROW);

    console.log('\nDeliberately left untouched (report only, no DB write):');
    console.log('  - canvas_drawn_readouts_never_enter_the_de_overlap_solver_so_readout_vs_authored_label_text_collisions_are_ungated (still true: readouts do not enter PM_resolveAnnotationOverlap)');
    console.log('  - parametric_readout_and_label_collision_awareness_does_not_cover_a_sibling_primitives_curve_or_line_ink (still true for the LABEL half; the READOUT half is the new row above)');
    console.log('  - ascii_minus_in_oncanvas_math_from_tofixed (alex:json_author, FIXED, recurred 3x) — code fixed at 2 of its recurring surfaces (PM_plotPointResolve, PM_secantTangentReadout) + PM_formatTickLabel; status/ownership NOT flipped, per explicit founder instruction — founder rules.');
}

main().catch((err) => {
    console.error('💥 close failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
