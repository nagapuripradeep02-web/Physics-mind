/**
 * engine_bug_queue row for bug_class
 * pcpl_x_domain_precedence_disagreed_with_plane_range_precedence_and_
 * failed_silently (founder Checkpoint B cycle 2, E-2, 2026-08-08).
 *
 * Filed here (not by the fixing desk directly) because no engine desk
 * carries DB credentials — same convention as
 * _seed_engine_bug_queue_pcpl_cartesian_plane_round.ts and this desk's own
 * WP-R6 seed script.
 *
 * Root cause: drawFunctionPlot's x_domain resolution preferred a NUMERIC
 * bound (domainSpec.min/.max) over its *_expr sibling when a primitive
 * authored both — the OPPOSITE of PM_planeResolveBound's own precedence
 * (D3: expression wins, numeric is the fallback), used for every plane's
 * own x_range/y_range. On a magnifier-inset state (STATE_4-style: a
 * function_plot sharing a plane that re-zooms via min_expr/max_expr), a
 * stale numeric x_domain.min silently overrode the live re-zoom
 * expression, and the measured symptom was not "the expression was
 * ignored" but "the curve does not draw at all" (240 samples spread
 * across the WIDE stale domain instead of the plane's own tiny re-zoomed
 * window, so only a sliver of them ever lands inside the visible frame).
 *
 * Fix: unified drawFunctionPlot's domainMin/domainMax resolution onto
 * PM_planeResolveBound itself (the SAME shared precedence function, not a
 * second hand-rolled copy), with the same ranges.xRange fallback preserved
 * for a missing/non-finite result. Additionally: PM_warnIfDualBoundAuthored
 * — a new, dedup-guarded (per state+primitive+bound, never per-frame)
 * console.warn wired into BOTH PM_planeBuildTransform (x_range/y_range)
 * and drawFunctionPlot (x_domain) — makes the "author wrote both" trap
 * VISIBLE the next time it happens, instead of resolving it silently.
 *
 * Blast radius proven, not assumed: a sweep of every concept JSON on this
 * desk (165 files) found ZERO primitives authoring both a numeric bound
 * and its *_expr sibling on the same x_domain/x_range/y_range bound — the
 * precedence change is a strict no-op for every shipped concept. That
 * sweep is now also a PERMANENT regression gate in check_cartesian_plane.ts
 * (the "blast-radius sweep" assertion in the E-2 section), not just a
 * one-off report.
 *
 * Idempotent: upsert onConflict 'bug_class'. Run:
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_pcpl_x_domain_precedence.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION =
    'founder Checkpoint B cycle 2 (E-2), definite_integral_as_accumulated_area STATE_4 magnifier incident, 2026-08-08 (fix landed on desk fix/pcpl-slider-leak-guided-state, same desk as WP-R6, cut from origin/master 05eceff)';

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
        bug_class: 'pcpl_x_domain_precedence_disagreed_with_plane_range_precedence_and_failed_silently',
        title:
            "function_plot's x_domain resolved a dual-authored bound with the OPPOSITE precedence of the plane's own x_range/y_range (numeric wins vs expression wins), and the disagreement's symptom was 'the curve does not draw at all', not 'the expression was ignored'",
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        subject: 'subject_neutral',
        root_cause:
            "PM_planeResolveBound (D3, 2026-08-08) already resolves a rangeObj's bound by preferring its *_expr sibling over a co-authored numeric, falling back to the numeric only when the expression is absent or non-finite — this is what lets a plane's x_range/y_range re-zoom live (the magnifier-inset use case). drawFunctionPlot's x_domain resolution was written independently, before that convention existed, and never updated: it hand-rolled the OPPOSITE precedence, preferring domainSpec.min/.max over domainSpec.min_expr/.max_expr whenever BOTH were authored. Building STATE_4's re-zoom magnifier for definite_integral_as_accumulated_area, an authored numeric x_domain.min:1.75 sat beside a min_expr computing the live shrinking window; the numeric silently won, so the curve's sampled domain stayed WIDE ([1.75, ~2.0]) while the plane's own x_range (correctly using PM_planeResolveBound) zoomed to a tiny window near the far edge. Of the sampler's 240 points spread across the wide domain, only a couple ever land inside the plane's tiny visible window — measured (reconstructed with the exact reported numeric shape, nlog=3.3625 giving n=2304, matching the concept's own documented S4 pin): 2 of 240 samples visible pre-fix vs all 240 post-fix. The author's own workaround (removing the numeric) fixed their case but left the trap fully armed — nothing warned, and the NEXT author to co-author a numeric fallback alongside a live expression on x_domain would hit the identical silent failure.",
        prevention_rule:
            "Every consumer of a {numeric, *_expr} bound pair resolves it through the SAME shared precedence function (PM_planeResolveBound) — never a second hand-rolled copy, however superficially similar. When two code paths answer the same structural question (here: 'which of a numeric/expression pair wins'), a disagreement between them is a defect even if each path is independently defensible; the fix unifies onto whichever direction changes the fewest shipped concepts, proven by a real sweep of the data, not assumed. When an author-facing precedence rule is silently correct-but-surprising (an authored value that reads as live but is actually dead), the renderer warns once per (state, primitive, bound) — visible to the next author, never spamming a per-frame draw loop.",
        probe_type: 'js_eval',
        probe_logic:
            "check_cartesian_plane.ts section 'E-2' — NEGATIVE CONTROL FIRST: a reimplemented pre-fix numeric-wins algorithm is shown to resolve domainMin to the stale numeric (1.75) at the exact STATE_4-style input (min:1.75, min_expr:\"b - 2*(b/round(pow(10,nlog)))\", nlog=3.3625/n=2304 — doc-grounded via docs/MATHEMATICS_PHASE0_CARTESIAN_PLANE.md and the concept's own skeleton doc, never the concept JSON itself), and that resolution is fed through the SHIPPED, unmodified PM_functionPlotSample to show only 2 of 240 samples land inside the plane's own re-zoomed visible window (<1% coverage — the measured 'does not draw' symptom). The SHIPPED PM_planeResolveBound-based resolution is then shown to resolve to the live expression value instead (1.998263...) and land all 240 samples inside the window. STATIC REACHABILITY asserts drawFunctionPlot's source calls PM_planeResolveBound for both min and max, no longer contains the pre-fix numeric-first ternary, and still falls back to ranges.xRange when nothing resolves (degenerate-domain discipline preserved). The dual-bound WARNING is tested via a dedicated sandbox (state reassignment baked as literal statements in one generated function body, since PM_currentState is a value-copied property on the shared test sandbox, not a live binding) proving: fires once for a genuine dual-authored bound naming the primitive id + bound; does not repeat for the same (state, primitive, bound); never fires for a single-authored bound (negative control); DOES re-fire for a genuinely different state. A BLAST-RADIUS SWEEP (now a permanent regression assertion, not just a report) walks every concept JSON under src/data/concepts/** and asserts zero primitives author both a numeric and *_expr sibling on the same x_domain/x_range/y_range bound — measured 0 across 165 files.",
        status: 'FIXED',
        concepts_affected: [
            // No shipped concept was AFFECTED in rendered output (blast-radius
            // sweep: 0 conflicts) — listed here as the concepts that author
            // x_domain / *_expr range bounds at all, so a future dual-bound
            // conflict on any of them is caught by the new warning immediately.
            'derivative_as_secant_limit',
            'graph_transformations',
            'definite_integral_as_accumulated_area', // the incident's own concept — mid-authoring on a parallel desk, not present on this desk's checkout
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
