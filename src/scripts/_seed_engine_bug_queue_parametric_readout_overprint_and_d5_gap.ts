/**
 * Two rows from the quality_auditor pass on `derivative_as_secant_limit`
 * (2026-08-07). Neither blocks that concept's authoring; both are harness /
 * engine defects that outlive it, and both explain why a defect on 7 of 9
 * pinned frames survived THE EYE (four runs), a full eye_walker frame walk,
 * and a founder review.
 *
 * Row 1 — the readout overprints its own line, and no tool can see it.
 *   secant_line / tangent_line hardcode their readout at +10,-12 px from the
 *   anchor with no author control, while plot_point.readout HAS an authorable
 *   offset. On an equal-scale plane at k=80 a chord of slope ~1.0-1.5 rises
 *   10-15 px over that same 10 px run, so the readout is placed ON the line by
 *   construction — the equal-scale decision that made the geometry honest is
 *   exactly what guarantees the collision. check-layout-overlap.mjs cannot see
 *   any of it: no plane transform, no readout model, no line-ink model, and it
 *   reads data-space coordinates as raw pixels (it placed a label authored at
 *   data (2.1, 2.52) at px (-26..31, -6..11)). It is unreliable in BOTH
 *   directions on any cartesian_plane concept — it missed 10 real overprints
 *   and reported one collision between two labels 240 px apart.
 *   This is the parametric twin of the live field_3d row
 *   `field3d_sprite_label_text_and_ink_box_are_invisible_to_every_dom_probe`:
 *   canvas-drawn text is invisible to DOM probes. Same blindness, different
 *   renderer, no row until now.
 *
 * Row 2 — D5 skips any PCPL state whose motion is a `once` choreography.
 *   deriveStateMeta.ts's PCPL fall-through recognises motion from exactly three
 *   signals: advance_mode === 'auto_after_animation', a loop/ping_pong
 *   choreography, or a scene_composition[].animation.type in
 *   PCPL_TRANSIENT_ANIM. A state-level variable_choreography with mode 'once'
 *   matches none — the source comment says so outright. So the motion gate
 *   reports "motion expectation unknown" and SKIPS, while D6/D7 still pass on
 *   "something moved". Measured on this concept: D5 skipped on 8 of 9 states,
 *   under a green 56/56 headline. The identical G3 hole was closed for BODY
 *   animations (pcplHasTransientBodyMotion) and left open for state-level
 *   choreography, which is the dominant motion driver on every mathematics
 *   concept built so far.
 *
 * NEITHER IS FIXED HERE. Both are Rule 40 platform and land on master as their
 * own work, with the fleet re-verify each implies.
 *
 * Idempotent: upsert on bug_class. Run:
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_parametric_readout_overprint_and_d5_gap.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'quality_auditor on derivative_as_secant_limit, 2026-08-07';

const rows = [
    {
        bug_class: 'parametric_canvas_drawn_readout_overprints_its_own_line_and_is_invisible_to_the_layout_checker',
        title:
            'secant_line/tangent_line readouts are hardcoded at +10,-12 with no offset field, so on an equal-scale plane they land ON the line they annotate — and no gate can see it',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        subject: 'subject_neutral',
        root_cause:
            'drawSecantLine/drawTangentLine place their readout at anchor + (10, -12) px, hardcoded; plot_point.readout exposes an authorable offset but the line primitives do not. At k=80 px/unit a chord of slope 1.0-1.5 climbs 10-15 px across that 10 px horizontal offset, so the text is placed on its own stroke by construction. A constant plot_point.readout.offset has the same class of failure on a MOVING point: no single offset clears the curve, the axis, the tick-label band and the neighbouring label at every position, so P lands on the x-axis wherever its y is small. Detection is absent, not merely weak: check-layout-overlap.mjs models no plane transform, no readout, no vector and no line ink, and interprets data-space coordinates as pixels — so it missed 10 real overprints on 7 of 9 pinned frames and reported one false collision between labels 240 px apart. THE EYE has no overlap gate at all. This is the parametric twin of field3d_sprite_label_text_and_ink_box_are_invisible_to_every_dom_probe.',
        prevention_rule:
            'A primitive that draws its own readout must expose the same placement control as plot_point.readout (an authorable offset), and should default to placing the text PERPENDICULAR to the line it annotates rather than at a fixed screen-axis offset — a fixed offset is exactly what a sloped line is guaranteed to intersect. For a readout on a MOVING anchor, the placement must be collision-aware (flip side when the offset would land on an axis, a curve, or the tick-label band) because no constant can serve every position. Until that exists: on any cartesian_plane concept, treat check-layout-overlap.mjs as unreliable in BOTH directions and verify every label placement by reading frames across the control range, never at one sample and never from the checker.',
        probe_type: 'js_eval',
        probe_logic:
            'For each state at its eye_capture_ms pin: resolve every readout anchor through the plane transform, add the primitive default offset, and measure the rendered text bounding box. Sample the drawn ink of every line/curve primitive (secant, tangent, function_plot, vector, axis) and assert no stroke polyline intersects any text box. Report per-state which string is struck and by what. Independently assert that any primitive drawing a readout exposes an offset field in its spec type.',
        status: 'OPEN',
        concepts_affected: ['derivative_as_secant_limit', 'graph_transformations'],
        fixed_in_files: [] as string[],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
    {
        bug_class: 'pcpl_state_level_once_choreography_skips_the_d5_motion_gate',
        title:
            'A PCPL state whose only motion is a `mode: once` variable_choreography reports "motion expectation unknown" and silently skips D5, under a green all-checks-passed headline',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:visual_validator',
        subject: 'subject_neutral',
        root_cause:
            "deriveStateMeta.ts's PCPL fall-through derives a motion expectation from exactly three signals — advance_mode === 'auto_after_animation', a loop/ping_pong choreography (pcplHasContinuousMotion), or a scene_composition[].animation.type in PCPL_TRANSIENT_ANIM (pcplHasTransientBodyMotion). A state-level variable_choreography entry with mode 'once' matches none of them, and the source comment states it outright. The meta is therefore undefined and D5 skips. The same G3 coverage hole was explicitly closed for BODY animations by pcplHasTransientBodyMotion and left open for state-level choreography — which is the dominant, often the ONLY, motion driver on the cartesian_plane mathematics concepts. Measured on derivative_as_secant_limit: D5 skipped on 8 of 9 states beneath a 56/56 pass. D6 (no-jump) and D7 (frozen-tail) still fire, but both only establish that SOMETHING moved, never that the taught element did.",
        prevention_rule:
            "The PCPL motion derivation must treat a state-level variable_choreography entry as a motion signal regardless of mode — a `once` ramp is motion, and it is the commonest kind on this engine. Until it does, a green THE EYE headline must not be quoted as motion coverage for any PCPL concept: report the D5 skip count alongside the pass count, so 'N/N passed' cannot be read as 'the right things moved'. The eye_walker frame walk is the only standing substitute and must be dispatched with the expected-mover set named per state.",
        probe_type: 'js_eval',
        probe_logic:
            "For every PCPL state carrying a variable_choreography entry, assert deriveStateMeta returns a defined motion expectation. Independently, after any visual:eyes run, count D5 'Skipped — motion expectation unknown' lines and fail the run summary if any state with authored choreography is among them.",
        status: 'OPEN',
        concepts_affected: ['derivative_as_secant_limit', 'graph_transformations', 'unit_circle_to_sine_wave'],
        fixed_in_files: [] as string[],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
];

async function main() {
    const { data, error } = await supabaseAdmin
        .from('engine_bug_queue')
        .upsert(rows, { onConflict: 'bug_class' })
        .select('id, bug_class, severity, status');
    if (error) {
        console.error('FAILED:', error.message);
        process.exit(1);
    }
    console.log(`upserted ${data?.length ?? 0} row(s):`);
    for (const r of data ?? []) console.log(`  [${r.severity}/${r.status}] ${r.bug_class}`);
}

main();
