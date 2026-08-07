/**
 * engine_bug_queue — close cartesian_plane_tick_values_enumerate_from_range_min_
 * so_every_axis_label_misreports_its_own_gridline (Rule 40 platform fix,
 * feat/pcpl-tick-label-snap, 2026-08-07).
 *
 * The fix, in the shipped renderer (src/lib/renderers/parametric_renderer.ts):
 *   - PM_planeTickValues no longer walks rangeMin, rangeMin+tick, ... (offsets
 *     from wherever the author happened to set the range). It enumerates
 *     i*tick by INDEX for every integer i with rangeMin <= i*tick <= rangeMax
 *     (+/- 1e-9), i.e. exact multiples of the step measured from 0 — so every
 *     mark IS a round data-space coordinate before either the gridline or the
 *     label is built from it. i=0 always yields an exact 0 (multiplying by
 *     zero is exact in IEEE754), closing the "origin tick missing" defect
 *     (graph_transformations, x_range [-6.5,6.5]/1) without a special case.
 *   - The old `Math.min(t, rangeMax)` boundary clamp is DROPPED, not kept —
 *     RULING: forcing an unsnapped final tick onto rangeMax would have been
 *     the same defect in miniature (an unsnapped mark under a rounded label).
 *     A boundary tick is now drawn only when the range genuinely lands on
 *     one; otherwise the axis stops short of the edge with no tick there.
 *   - PM_formatTickLabel's numeric branch now clamps |value| < 1e-9 to 0
 *     before toFixed(), matching the guard the 'pi' branch already had — so
 *     a near-zero float can never print the sign-preserving '-0' JS's
 *     toFixed() produces on values like -0.4 (verified: (-0.4).toFixed(0)
 *     === '-0'). Gridlines and tick marks/labels share the ONE enumerator
 *     (drawCartesianPlane calls PM_planeTickValues 4x: 2x gridlines, 2x
 *     ticks/labels), so all three move together by construction — no
 *     separate "keep them in sync" step was needed.
 *
 * The founder's own repro (derivative_as_secant_limit's authored plane,
 * x_range [-2.4,2.6] tick 1) now enumerates EXACTLY [-2,-1,0,1,2] with labels
 * "-2 -1 0 1 2" — no origin gap, no '-0'. graph_transformations' x_range
 * [-6.5,6.5] tick 1 now enumerates the 13 integers -6..6 with a genuine tick
 * at 0 (was 14 unsnapped .5-offset marks, none at 0).
 *
 * check:cartesian-plane's section 3 (TICKS) — the row's own PROBE — was
 * updated in the SAME commit:
 *   BEFORE: asserted the DEFECT as correct — tick count 14 on [-6.5,6.5]/1,
 *     first tick -6.5, last tick 6.5, tick[6]=-0.5, tick[7]=0.5 (all
 *     unsnapped values the old enumerator actually produced).
 *   AFTER: asserts the SNAPPED enumeration (13 ticks, -6..6, tick[6]=0,
 *     tick[7]=1); every tick is an exact multiple of the step; the founder's
 *     [-2.4,2.6]/1 repro enumerates exactly [-2,-1,0,1,2] with labels
 *     "-2 -1 0 1 2" and NO '-0' anywhere; a NEGATIVE CONTROL reproduces the
 *     pre-fix enumerator inline (never re-shipped) and demonstrates it FAILS
 *     every one of those assertions, including literally printing '-0' for
 *     the [-2.4,2.6] range's -0.40 mark through the (now-fixed)
 *     PM_formatTickLabel — proving the formatter's own defensive clamp alone
 *     would NOT have been enough; the enumerator had to be fixed too.
 *
 * Blast radius measured BEFORE the fix: zero concepts on master author a
 * cartesian_plane primitive; the only baseline-locked mathematics concept
 * (unit_circle_to_sine_wave) predates the family and does not author a plane.
 * So no fleet re-baseline is required. THE EYE was still run against
 * unit_circle_to_sine_wave (parametric, baseline-locked, non-plane) post-fix
 * to prove no side effect on the shared renderer: 50/50 deterministic checks
 * pass, H2 (visual regression vs approved baseline) unchanged.
 *
 * Verify chain run on feat/pcpl-tick-label-snap:
 *   npm run check:renderer-syntax  -> field_3d/particle_field/parametric all OK
 *   npx tsc --noEmit                -> 0 errors
 *   npm run check:cartesian-plane   -> 255 checks, 0 FAIL (ALL PASS)
 *   npm test                        -> 354/354
 *   npm run validate:concepts       -> 149/149 atomic PASS (unaffected)
 *   npm run visual:eyes -- unit_circle_to_sine_wave -> 50/50, 0 failed
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_close_engine_bug_queue_cartesian_plane_tick_snap.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const BUG_CLASS = 'cartesian_plane_tick_values_enumerate_from_range_min_so_every_axis_label_misreports_its_own_gridline';

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
