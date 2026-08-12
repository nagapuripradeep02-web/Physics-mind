/**
 * engine_bug_queue — ONE new row, found during the founder-directed offset-
 * deletion round on `graph_transformations` (2026-08-08) and independently
 * confirmed by the dispatching session at parametric_renderer.ts:3231.
 *
 * Not a review finding — a latent engine defect surfaced only because deleting
 * an authored offset forced the tangent-default path to run on a state where
 * it had never been exercised.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_ghost_curve_tangent_probe.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const BUG_CLASS = 'ghost_styled_curve_never_registers_so_the_tangent_default_probes_a_different_curve_than_the_point_rides';

async function main(): Promise<void> {
    const { data: existing } = await supabaseAdmin
        .from('engine_bug_queue').select('bug_class').eq('bug_class', BUG_CLASS).maybeSingle();
    if (existing) { console.log(`already filed: ${BUG_CLASS}`); return; }

    const { error } = await supabaseAdmin.from('engine_bug_queue').insert({
        bug_class: BUG_CLASS,
        title: "A plot_point's tangent-derived default offset can be computed from a DIFFERENT curve's slope, silently, when the point's own curve is ghost-styled",
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: "parametric_renderer.ts:3231 registers a function_plot's y_expr into PM_planeCurveExpr under `if (spec.style !== 'ghost' || !PM_planeCurveExpr[plane_id])` — i.e. a ghost curve registers ONLY if nothing has registered yet. On graph_transformations STATE_7 BOTH curves are ghost-styled, so parent_ghost registers first and wins, and transform_curve — the curve the plot_point actually rides — never registers. PM_plotPointCurveTangentPx (:3742) then evaluates the PARENT's expression at the transform point's x to derive the tangent direction, producing a near-vertical garbage slope: instrumented, the probe's p0/p1 jump ~13.6px in y across a ~0.005px x-step, which is an artifact, not a local slope. The bad direction places the default readout offset badly: measured 2px foreign ink at the pin but 336px mid-sweep at t=4500ms, versus 0px/0px for every other state in the concept.",
        prevention_rule: "PM_planeCurveExpr is a per-plane SINGLETON, but a plane routinely carries several curves and a plot_point rides exactly one of them. A point's tangent probe must resolve the curve it is actually anchored to — by explicit primitive reference, not by whichever function_plot happened to register first on that plane. Until that lands, the 'ghost registers only if empty' rule silently picks a winner among ghosts by draw order, which is authoring-invisible: nothing in the concept JSON expresses which curve the tangent default will use.",
        probe_type: 'js_eval',
        probe_logic: "For every state with more than one function_plot on the same plane_id, assert PM_planeCurveExpr[plane_id] equals the y_expr of the curve each plot_point is anchored to; and assert the tangent probe's |dy/dx| is finite and bounded (reject a p0->p1 y-delta more than 100x the x-step, which indicates the probe evaluated a foreign expression).",
        concepts_affected: ['graph_transformations'],
        discovered_in_session: 'founder-directed offset-deletion round after PR #64, graph_transformations 2026-08-08',
        status: 'OPEN',
    });
    if (error) throw new Error(`insert failed: ${error.message}`);
    console.log(`✅ FILED (OPEN) ${BUG_CLASS}`);
}

main().catch((e) => { console.error('💥', e instanceof Error ? e.stack : e); process.exit(1); });
