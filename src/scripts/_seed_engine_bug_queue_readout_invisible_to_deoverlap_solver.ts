/**
 * engine_bug_queue — NEW row, filed at the close of the readout-placement
 * ROUND 2 (feat/pcpl-readout-placement, 2026-08-07).
 *
 * Round 2 made the secant/tangent readout default width-aware, which finally
 * frees the "slope = …" string from the stroke it annotates in all six
 * secant-readout states of derivative_as_secant_limit. Clearing a ~79px-wide
 * label from a STEEP line necessarily moves it ~70px sideways — and on
 * STATE_2 the freed readout lands on `slope_dual_label` ("slope (gradient)"),
 * an authored caption pinned at raw canvas pixel (382,166) with drawLabel's
 * textAlign(CENTER) — i.e. spanning x 340..424, against the readout's new box
 * at x 297..375. A 34px text-on-text overlap, verified in the rendered frame,
 * NOT merely modelled.
 *
 * Root cause is structural, and is the other half of the ORIGINAL bug_class
 * title ("...and is invisible to the layout checker"): canvas-drawn readouts
 * are painted inside drawPlotPoint / drawSecantLine / drawTangentLine at
 * runtime, so they never enter the offline de-overlap solver
 * (src/lib/subSimSolverHost.ts + src/lib/constraintSolver.ts) that resolves
 * `label` primitive positions and writes _solverPosition. The solver
 * registers force_arrow / vector / angle_arc as fixed obstacles but has no
 * knowledge of any readout box, so an authored caption cannot be placed out
 * of a readout's way — and a readout cannot be placed out of a caption's way.
 * Every such collision is therefore invisible to every automated gate and
 * survives until a human reads the frame at zoom.
 *
 * Distinct from the already-OPEN row
 * parametric_readout_and_label_collision_awareness_does_not_cover_a_sibling_
 * primitives_curve_or_line_ink: that one is text-vs-INK (a curve/line stroke
 * crossing a string). This one is text-vs-TEXT, and has a cheaper, better
 * defined remedy — register readout boxes as solver obstacles — which is why
 * it is tracked separately rather than folded in.
 *
 * IMMEDIATE WORKAROUND (content, one line, on the derivative desk — NOT
 * applied here: this desk is engine-only per Rule 40): move
 * slope_dual_label's authored position off the readout's new box, e.g.
 * further right or up. The caption already carries a _design_note recording
 * an earlier move for exactly this class of reason.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_readout_invisible_to_deoverlap_solver.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const BUG_CLASS = 'canvas_drawn_readouts_never_enter_the_de_overlap_solver_so_readout_vs_authored_label_text_collisions_are_ungated';

async function main(): Promise<void> {
    const { data: existing } = await supabaseAdmin
        .from('engine_bug_queue')
        .select('bug_class')
        .eq('bug_class', BUG_CLASS)
        .maybeSingle();
    if (existing) {
        console.log(`already filed: ${BUG_CLASS} — nothing to do.`);
        return;
    }

    const { error } = await supabaseAdmin.from('engine_bug_queue').insert({
        bug_class: BUG_CLASS,
        title: 'A canvas-drawn readout can overprint an authored label\'s TEXT, and no gate can see it — readouts are not obstacles in the de-overlap solver',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: 'plot_point / secant_line / tangent_line readouts are drawn at runtime inside their own draw functions and are never registered with the offline de-overlap solver (src/lib/subSimSolverHost.ts registers force_arrow / vector / angle_arc as fixed obstacles and resolves `label` positions into _solverPosition). The solver therefore cannot move an authored caption out of a readout\'s way, and the renderer cannot move a readout out of a caption\'s way, because neither knows the other exists. Surfaced concretely when the round-2 width-aware secant default moved derivative_as_secant_limit STATE_2\'s "slope = 1.5000" clear of its own stroke (the fix) and onto `slope_dual_label` "slope (gradient)" at raw pixel (382,166): drawLabel uses textAlign(CENTER) so that caption spans canvas x 340..424 against the readout\'s new box at x 297..375 — a 34px overlap, confirmed in the rendered frame at 4x zoom.',
        prevention_rule: 'Readout boxes must participate in the same layout pass as labels: register each readout\'s resolved bbox (anchor + final offset + measured text width) as a fixed obstacle before the de-overlap solver places `label` primitives, so an authored caption is pushed clear automatically. Until that exists, any state placing a caption near a readout must be verified by reading the FRAME at zoom across the control range — a 1x full-frame view does not show a text-on-text overlap reliably, and no automated gate covers it in either direction. Corollary for authors: a caption pinned at a raw canvas pixel near a readout is fragile by construction, because the readout\'s placement is computed from live geometry and legitimately moves.',
        probe_type: 'js_eval',
        probe_logic: 'For each state at its eye_capture_ms pin: resolve every readout box (plot_point / secant_line / tangent_line: anchor + authored-or-computed offset + measured text width, textAlign LEFT/CENTER) and every `label` primitive box (position or _solverPosition or position_expr, transformed through plane_id when present, textAlign CENTER/CENTER at spec.font_size). Assert no readout box overlaps any label box. Report per-state which pair collides and by how many pixels. Known-failing at filing time: derivative_as_secant_limit STATE_2 ("slope = 1.5000" vs "slope (gradient)", 34px).',
        concepts_affected: ['derivative_as_secant_limit'],
        discovered_in_session: 'feat/pcpl-readout-placement round 2 (2026-08-07) — surfaced by the width-aware secant/tangent readout default',
        status: 'OPEN',
    });
    if (error) throw new Error(`insert ${BUG_CLASS} failed: ${error.message}`);
    console.log(`✅ FILED (OPEN) ${BUG_CLASS}`);
}

main().catch((err) => {
    console.error('💥 seed failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
