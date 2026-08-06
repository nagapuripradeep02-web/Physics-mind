/**
 * engine_bug_queue — drawAnnotation shares the exact gap drawLabel just had
 * (found by the drawLabel position_expr dispatch, 2026-08-06, while checking
 * every _solverPosition-consuming drawer; filed rather than fixed — one
 * bug_class per dispatch).
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_pcpl_drawannotation_position_expr.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const row = {
    bug_class: 'pcpl_drawannotation_has_no_position_expr_so_a_callout_cannot_track',
    title: 'drawAnnotation reads only a literal position, so a callout naming a moving object cannot follow it — the exact class just fixed on drawLabel',
    severity: 'MODERATE' as const,
    owner_cluster: 'peter_parker:renderer_primitives' as const,
    subject: 'subject_neutral',
    root_cause:
        "drawAnnotation (parametric_renderer.ts, immediately after drawLabel) opens `if (!spec || !(spec._solverPosition || spec.position)) return;` and reads `var pos = spec._solverPosition || spec.position;` with no position_expr branch — the same structural gap drawLabel carried until 2026-08-06 (pcpl_drawlabel_has_no_position_expr_so_object_anchored_text_cannot_track, FIXED). An authored position_expr on an annotation is silently ignored, so a callout that names a moving object drifts apart from it. Fleet check at filing time: of the four _solverPosition-consuming drawers, drawLabel is fixed, drawFormulaBox is a fixed position BY DESIGN (documented in its own comment), and drawAnnotation is the one remaining real gap.",
    prevention_rule:
        "ENGINE: mirror the drawLabel fix onto drawAnnotation — same PM_liveExprVars() scope, same finite-eval guard, same documented precedence (position_expr beats _solverPosition beats position). AUTHORING until then: annotations are FIXED-position text; a callout that must name a moving object rides the owning primitive's own label field or waits for this row.",
    probe_type: 'js_eval' as const,
    probe_logic:
        "Static: flag any annotation primitive authoring position_expr while this row is OPEN (it is silently ignored today). Fix-verification: extend _verify_label_position_expr_probe.ts with an annotation TRACK/STAY/WIN triplet and assert the same three pixel outcomes drawLabel now passes.",
    status: 'OPEN' as const,
    concepts_affected: [] as string[],
    fixed_in_files: [] as string[],
    discovered_in_session: 'drawLabel position_expr dispatch, 2026-08-06',
    row_type: 'incident' as const,
};

async function main(): Promise<void> {
    const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(row, { onConflict: 'bug_class' });
    if (error) throw new Error(`upsert ${row.bug_class} failed: ${error.message}`);
    console.log(`✅ OPEN ${row.bug_class}`);
}

main().catch((err) => {
    console.error('💥 seed failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
