/**
 * engine_bug_queue — close parametric_canvas_drawn_readout_overprints_its_own_
 * line_and_is_invisible_to_the_layout_checker (Rule 40 platform fix,
 * feat/pcpl-readout-placement, 2026-08-07).
 *
 * The fix, in the shipped renderer (src/lib/renderers/parametric_renderer.ts):
 *   - New shared readout-placement idiom (mirrors F7's "one funnel"):
 *     PM_readoutAuthoredOffset(spec) resolves spec.readout.offset.{x,y} with
 *     the same non-finite/type-fallback discipline every other *_expr/offset
 *     field on this engine uses (present-but-malformed -> treated as absent,
 *     never a crash, never a silent NaN draw).
 *   - secant_line / tangent_line now expose readout.offset (PARITY with
 *     plot_point.readout.offset, which already had it) — ZERO schema change
 *     needed, since scene_composition primitives are an open
 *     z.record(z.string(), z.unknown()) record.
 *   - Without an authored offset, secant_line/tangent_line default to
 *     PM_perpendicularOffset(p0, p1, 13) — the readout sits PERPENDICULAR to
 *     the line's own pixel-space direction (13px along the "upward" screen
 *     normal) instead of a fixed screen-axis {+10,-12}. A fixed offset is
 *     exactly what a sloped line is guaranteed to intersect: on an
 *     equal-scale plane, a chord near slope 1.5 climbs ~10-15px across that
 *     same 10px horizontal offset, so the readout sat ON its own stroke BY
 *     CONSTRUCTION. Verified on the founder's own numbers (derivative_as_
 *     secant_limit STATE_2's real chord, pixel slope -1.5): the OLD fixed
 *     offset is 99.4% PARALLEL to the stroke (|cos|=0.994); the NEW default
 *     is exactly perpendicular (|cos|<1e-9).
 *   - plot_point.readout gets a collision-aware side-flip layered UNDER
 *     whatever offset it already resolves to (authored or the {10,-12}
 *     default): PM_readoutResolveOffset tests the candidate placement's
 *     (real, textWidth()-measured) box against three known ink zones — the
 *     plane's y-axis + its left tick-label column, its x-axis + its
 *     under-axis tick-label row, and the 760x500 canvas edge — and mirrors
 *     the offset to the anchor's OPPOSITE side ONCE if it collides. Cheap,
 *     deterministic (Rule 36), a SAFETY NET only: a placement with no
 *     collision is returned completely unchanged (verified in
 *     check:cartesian-plane section 17). Scoped to axis/tick-band/off-canvas
 *     ONLY (not general curve/other-primitive ink) — deliberately narrower
 *     than the probe's full "no stroke of any primitive" ambition, per the
 *     brief's own "cheap and deterministic, no solver" instruction.
 *
 * Judgment calls made, with evidence:
 *   - AUTOMATIC (not opt-in) collision-flip for plot_point: it rides on top
 *     of the EXISTING authored offset, only overriding it when that exact
 *     candidate would collide — proven to be a safety net, not a blanket
 *     repositioning (check:cartesian-plane section 17 asserts a
 *     non-colliding placement is returned byte-identical).
 *   - Perpendicular default distance 13px (within the brief's 12-14px band).
 *
 * Blast radius measured (not assumed) via THE EYE's own H2 byte-level
 * regression gate, run from each concept's real desk with this patch applied
 * ON TOP of that desk's own (unmerged) renderer additions — never a bare
 * file-copy, which would have silently dropped derivative_as_secant_limit's
 * own computePhysics_derivative_as_secant_limit registration and produced a
 * false PM_physics-null stall (caught, diagnosed, and discarded before this
 * measurement — see PROGRESS.md for the full trace):
 *   - derivative_as_secant_limit (feat/mathematics-derivative, 9 states):
 *     STATE_1/4/8 0.00% (no collision at THEIR OWN pinned eye_capture_ms —
 *     STATE_8's tangent has no readout at all); STATE_2/3/5/6/7/9 0.11%-0.19%
 *     (the secant/plot_point readout moved, EXACTLY the reported defect
 *     resolving) — 56/56 deterministic checks pass. Visually confirmed
 *     per-string (crops taken before/after):
 *       S2 "slope = 1.5000" (secant readout) — struck before, clear after
 *         (soft focal-GLOW halo, not the opaque stroke, lightly grazes "s" —
 *         Rule 29 glow radius is a separate, out-of-scope concern).
 *       S2 "y = x^2/2" (a `label` primitive, NOT a readout) — STILL struck,
 *         UNCHANGED — different primitive type, outside this bug_class
 *         (labels don't draw a "readout"; flagged as a residual/related gap,
 *         not fixed here).
 *       S3 "slope = 1.0325" (secant readout) — struck before, clear after.
 *       S3 "Q = (1.07, 0.57)" (plot_point readout vs the FUNCTION CURVE's
 *         ink, not the plane's axis/tick-band) — STILL struck, UNCHANGED —
 *         plot_point's collision-flip is scoped to axis/tick-band/off-canvas
 *         only, per the brief; a readout colliding with a DIFFERENT
 *         primitive's curve ink needs the probe's fuller ink-sampling
 *         approach, deliberately deferred (flagged as a residual gap).
 *       S5 "slope = 1.0020" — the "s" was fully hidden under the P-marker;
 *         fully legible after.
 *       S6 "P = (0.75, 0.28)" — THE FOUNDER'S OWN REPRO (axis ran between
 *         "P" and "="): flips to sit cleanly above the axis, fully legible.
 *   - graph_transformations (feat/mathematics-graph-transformations, 8
 *     states, no secant/tangent primitives at all): 0.00% pixel difference
 *     on EVERY state (both static and frozen variants) — 50/50 deterministic
 *     checks pass. Its plot_point readouts are all hand-tuned with an
 *     authored offset and none of its states' OWN choreography ever drives a
 *     collision at their pinned capture instant (confirmed by direct
 *     PM_choreoValue replay, not assumed) — NO RE-BASELINE NEEDED for this
 *     concept.
 *   - Fleet check: zero concepts on master author cartesian_plane / plot_point
 *     / secant_line / tangent_line (grep across src/data/concepts/), so the
 *     blast radius is fully contained to these two unmerged branches.
 *
 * Verify chain run on feat/pcpl-readout-placement:
 *   npm run check:renderer-syntax  -> field_3d/particle_field/parametric all OK
 *   npx tsc --noEmit                -> 0 errors
 *   npm run check:cartesian-plane   -> section 17 added (offset parity,
 *                                       perpendicular default, collision
 *                                       flip, negative controls incl. the
 *                                       founder's own repro numbers) — ALL PASS
 *   npm test                        -> 354/354
 *   npm run validate:concepts       -> 149/149 atomic PASS (unaffected)
 *   npm run visual:eyes -- derivative_as_secant_limit  -> 56/56, H2 above
 *   npm run visual:eyes -- graph_transformations        -> 50/50, H2 0.00% x8
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_close_engine_bug_queue_readout_overprint.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const BUG_CLASS = 'parametric_canvas_drawn_readout_overprints_its_own_line_and_is_invisible_to_the_layout_checker';

async function main(): Promise<void> {
    const { data, error: selectError } = await supabaseAdmin
        .from('engine_bug_queue')
        .select('bug_class,status,concepts_affected')
        .eq('bug_class', BUG_CLASS)
        .maybeSingle();
    if (selectError) throw new Error(`select failed: ${selectError.message}`);
    if (!data) throw new Error(`no existing row for ${BUG_CLASS} — expected one filed by the founder already.`);

    const { error } = await supabaseAdmin
        .from('engine_bug_queue')
        .update({
            status: 'FIXED',
            fixed_at: new Date().toISOString(),
            fixed_in_files: [
                'src/lib/renderers/parametric_renderer.ts',
                'src/scripts/check_cartesian_plane.ts',
            ],
        })
        .eq('bug_class', BUG_CLASS);
    if (error) throw new Error(`update ${BUG_CLASS} failed: ${error.message}`);
    console.log(`✅ FIXED ${BUG_CLASS}`);
    console.log(`   concepts_affected (unchanged): ${(data.concepts_affected ?? []).join(', ')}`);
}

main().catch((err) => {
    console.error('💥 close failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
