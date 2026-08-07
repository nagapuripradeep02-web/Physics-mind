/**
 * engine_bug_queue — NEW row, filed at the CLOSE of the readout-placement
 * round (feat/pcpl-readout-placement, 2026-08-07), for a residual gap this
 * round's own crops surfaced but the brief explicitly scoped OUT of the
 * fix ("Collision-aware side selection for plot_point.readout" — flip only
 * against axis / tick-label band / off-viewport, never against another
 * primitive's ink; "no solver" was the explicit constraint).
 *
 * Two concrete, still-struck strings, both visually confirmed AFTER the
 * readout-placement fix landed (crops taken from THE EYE's own
 * derivative_as_secant_limit run, unchanged pixel-for-pixel from before):
 *   - STATE_2/STATE_7 "y = x^2/2" — a `label` primitive (curve_label), not a
 *     readout at all. The secant_line's stroke geometry is UNCHANGED by this
 *     round's fix (only its readout TEXT position moved); the label was
 *     already sitting where the line's extend:'frame' path crosses it, and
 *     nothing in this round touches label placement.
 *   - STATE_3 "Q = (1.07, 0.57)" — a plot_point readout, but the ink
 *     crossing it is the FUNCTION CURVE / secant line (a DIFFERENT
 *     primitive's stroke), not the plane's own axis or tick-label band. The
 *     new PM_readoutCollides zones (Y_LABEL_BAND/X_LABEL_BAND/off-canvas)
 *     never sampled this ink, so the collision-flip never fires here.
 *
 * The FULL fix (the bug queue's own PROBE, as originally worded, "sample the
 * drawn ink of every line/curve primitive... assert no stroke polyline
 * intersects any text box") needs a general per-frame ink-vs-text collision
 * pass across ALL drawn primitives, not just the plane's own axis geometry —
 * a materially bigger build (a real spatial index or a full second draw
 * pass sampling function_plot/secant_line/tangent_line/vector polylines),
 * correctly deferred by the founder's own "cheap and deterministic, no
 * solver" scoping for the round that just landed.
 *
 * Until it exists: author-side, a `label` or `plot_point` known to sit near
 * a line/curve should carry an explicit offset chosen by reading frames
 * across the state's full control range (same discipline the CLOSED row's
 * DO text already states) — this is NOT a substitute for the general fix,
 * only a stopgap.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_readout_vs_sibling_ink_residual.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const BUG_CLASS = 'parametric_readout_and_label_collision_awareness_does_not_cover_a_sibling_primitives_curve_or_line_ink';

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
        title: 'A readout/label can still overprint a DIFFERENT primitive\'s curve or line ink (only the plane\'s own axis/tick-band/off-canvas are collision-checked)',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: 'PM_readoutCollides (added for bug_class parametric_canvas_drawn_readout_overprints_its_own_line_and_is_invisible_to_the_layout_checker) only samples the registered plane\'s OWN axis-line + tick-label-band zones and the canvas edge — it never samples the drawn ink of function_plot/secant_line/tangent_line/vector or any other sibling primitive, so a plot_point readout (or a static label) that happens to sit on ANOTHER primitive\'s stroke is not detected or flipped. Confirmed still-present post-fix: derivative_as_secant_limit STATE_3 "Q = (1.07, 0.57)" (plot_point readout crossed by the function curve / secant line) and STATE_2/STATE_7 "y = x^2/2" (a `label` primitive, not a readout at all, crossed by the secant line\'s own extend:\'frame\' stroke).',
        prevention_rule: 'A general fix needs a per-frame ink-vs-text collision pass sampling the ACTUAL drawn polylines of every line/curve primitive in the scene (function_plot samples, secant_line/tangent_line drawFrom-drawTo, vector segments) against every readout/label\'s measured text box — not just the plane\'s own static axis geometry. Until that exists, author known-risk plot_point/label placements with an explicit offset chosen by reading frames across the state\'s full control range (never a single static sample), and do not trust an automated layout checker to catch this class.',
        probe_type: 'js_eval',
        probe_logic: 'For each state at its eye_capture_ms pin: resolve every drawn primitive\'s ink into polylines (function_plot samples, secant_line/tangent_line drawFrom/drawTo pairs, vector segments), resolve every readout/label\'s text box (anchor + resolved offset + measured width/height), and assert no polyline segment intersects any OTHER primitive\'s text box (i.e. exclude a primitive\'s own line from its own readout\'s check, which the CLOSED row already covers). Report per-state which string is struck and by which sibling primitive\'s ink.',
        concepts_affected: ['derivative_as_secant_limit', 'graph_transformations'],
        discovered_in_session: 'feat/pcpl-readout-placement (2026-08-07), close-out of parametric_canvas_drawn_readout_overprints_its_own_line_and_is_invisible_to_the_layout_checker',
        status: 'OPEN',
    });
    if (error) throw new Error(`insert ${BUG_CLASS} failed: ${error.message}`);
    console.log(`✅ FILED (OPEN) ${BUG_CLASS}`);
}

main().catch((err) => {
    console.error('💥 seed failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
