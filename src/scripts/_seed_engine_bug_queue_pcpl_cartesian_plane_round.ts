/**
 * engine_bug_queue rows from the Phase-0 `cartesian_plane` engine round
 * (CP-A..CP-D, PRs #36-#40, 2026-08-06).
 *
 * Two rows, both drafted by the building surgeons in their dispatch reports
 * and filed here by the orchestrating session because no engine desk carries
 * DB credentials.
 *
 * Row 1 is the round's durable lesson: a render-pass output (riemann_bars'
 * published sum) lived inside PM_physics, an object a DIFFERENT concern
 * (drag-input handling, choreography) reassigns wholesale mid-frame — so the
 * published key silently vanished and the consuming label rendered the
 * literal {S_n}. Found by CP-C1 (which worked around it by inverting D12's
 * draw order), root-caused and fixed by CP-C2 (PM_riemannPublish, a
 * frame-scoped map outside PM_physics, merged into BOTH expression-scope
 * functions; D12 order restored). Phase-0 doc AMENDMENT 3 records the
 * supersession of the earlier PM_physics.derived ruling.
 *
 * Row 2 records CP-D's build closing the round (secant/tangent with
 * data-space slope), whose gate pins the pixel-slope trap: on the spec
 * driver's own plane (220 px/x-unit vs 62 px/y-unit) a pixel-derived slope
 * reads -0.1521 where the true value is 0.5403.
 *
 * NOTE: the fixes ride PRs #36-#40, which are stacked and UNMERGED at filing
 * time. Status is FIXED because the fix is built, gate-pinned, and verified
 * on its branch; fixed_in_files names the files as they will land.
 *
 * subject='subject_neutral' throughout — the mechanism binds every PCPL
 * concept identically; nothing here is mathematics CONTENT.
 *
 * Idempotent: upsert onConflict 'bug_class'. Run:
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_pcpl_cartesian_plane_round.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'Phase-0 cartesian_plane engine round (CP-A..CP-D), 2026-08-06';

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
        bug_class: 'pcpl_riemann_bars_composition_and_draw_order_undeclared',
        title:
            "A primitive's published value lived inside PM_physics, which the draw pass reassigns wholesale mid-frame — the key vanished and the label rendered the literal {S_n}",
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        subject: 'subject_neutral',
        root_cause:
            "D11 publication originally targeted PM_physics.derived (Checkpoint A cycle-1 F6, measured correctly against the plumbing that existed then). But drawPlotPoint's genuine-drag branch and PM_applyChoreography each reassign PM_physics wholesale (PM_physics = computePhysics(...), fresh object literal, never a mutation) — so a key published earlier in the same frame is silently erased and PM_interpolate's fallback renders the literal {S_n}. CP-C1 worked around it by inverting D12's declared draw order (fill/bars after plot_point), which created a second defect nobody had named: during a drag frame the shaded region and the curve it shades read two DIFFERENT values of the same bound (fill drew post-drag, curve pre-drag). CP-C2 fixed the real defect: publication moved to PM_riemannPublish, a dedicated frame-scoped map OUTSIDE PM_physics, cleared at the top of Pass 0.3 every frame and merged LAST into BOTH expression-scope functions (PM_liveExprVars AND PM_liveVarsWithDerived — the two exist so text and position bindings cannot read two copies that merely happen to agree); D12's order restored. Gate section 12 reproduces the erasure mechanically and proves the new target survives it.",
        prevention_rule:
            'Any value a primitive PUBLISHES for another primitive to read within the same frame goes into a dedicated, frame-scoped map outside PM_physics — never into PM_physics.derived, which the draw pass itself may reassign wholesale mid-frame. When a scope-map ruling is made, re-verify it against every PM_physics reassignment site, including ones inside draw functions. And when two byte-identical scope functions exist, a merge added to one is added to the other in the same edit.',
        probe_type: 'js_eval',
        probe_logic:
            'Publish a key into the claimed target map, then simulate the wholesale PM_physics reassignment pattern (physics = {variables, derived}, a new object) and assert the key still resolves via PM_liveExprVars(); negative-control the pre-fix PM_physics.derived target and assert the key vanishes (undefined). Also assert PM_liveExprVars and PM_liveVarsWithDerived return identical key sets for the same state.',
        status: 'FIXED',
        concepts_affected: [],
        fixed_in_files: [
            'src/lib/renderers/parametric_renderer.ts',
            'src/scripts/check_cartesian_plane.ts',
        ],
        discovered_in_session: SESSION,
        row_type: 'directive',
    },
    {
        bug_class: 'pcpl_cannot_draw_a_secant_or_tangent_with_a_live_slope',
        title:
            'PCPL had no primitive drawing a straight line at a data-space slope; any hand-authored workaround would derive the slope from pixel deltas, silently wrong by the plane aspect ratio',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:renderer_primitives',
        subject: 'subject_neutral',
        root_cause:
            "After CP-A..CP-C2 the renderer had a frame, curve/point sampling, and region/partition primitives, but nothing that draws a chord between two curve points or a declared tangent slope. The numerical trap: the plane's axes carry different scales (spec driver's own layout: 220 px/x-unit vs 62 px/y-unit), so a slope derived from pixel deltas is wrong by the aspect ratio while looking plausible on screen — measured: pixel-derived secant slope -0.1521 vs true cos(1) = 0.5403, wrong sign AND magnitude. CP-D built secant_line (from_expr/to_expr {x,y} pairs) and tangent_line (at_expr + authored slope_expr, never numerically differentiated), extend segment|frame, with the data/pixel separation enforced three ways: pure compute functions that never call PM_planeResolve (static source assertion), draw functions that resolve to pixels strictly after compute (index-order assertion), and a Liang-Barsky clip that takes data in and returns data out.",
        prevention_rule:
            "A slope, angle, or any ratio of coordinate deltas is computed in DATA coordinates, never from pixels — the plane's x and y scales differ, and a pixel-derived ratio is wrong by the aspect ratio in a way that looks plausible on screen. Frame-extension/clipping is a separate, later, pixel-safe step on the already-final data-space geometry. The gate for any such primitive carries a negative control computing the same quantity from pixel deltas and asserting sharp divergence.",
        probe_type: 'js_eval',
        probe_logic:
            "On an aspect-mismatched plane (e.g. 220 px/x-unit vs 62 px/y-unit), assert the secant slope of sin at x0=1, h=0.001 matches cos(1) within 1e-3; negative-control a pixel-delta implementation and assert it diverges (wrong sign or >10x error). Assert extend:'frame' preserves the slope to 1e-9 with at least one endpoint on the boundary; negative-control an independent per-axis clamp and assert it alters the slope.",
        status: 'FIXED',
        concepts_affected: [],
        fixed_in_files: [
            'src/lib/renderers/parametric_renderer.ts',
            'src/scripts/check_cartesian_plane.ts',
        ],
        discovered_in_session: SESSION,
        row_type: 'incident',
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
