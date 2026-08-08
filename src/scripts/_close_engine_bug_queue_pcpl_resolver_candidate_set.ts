/**
 * engine_bug_queue — pcpl_surgeon engine round, "PCPL readout-resolver
 * candidate set" (branch fix/pcpl-resolver-candidate-set, 2026-08-08).
 * Founder directive, closing the readout-placement class PR #59 half-solved:
 * two independent founder_proxy Checkpoint B cycle-2 reviews (on
 * graph_transformations and derivative_as_secant_limit) converged on the
 * same root cause, verified in source by the dispatching session.
 *
 * Fixes shipped, in src/lib/renderers/parametric_renderer.ts:
 *   1. Gridline ink demoted to a SOFT obstacle tier (PM_planeGridInkZones,
 *      read only by the least-overlap-area tie-break) — no longer folded
 *      into the HARD PM_planeInkZones set PM_readoutCollides tests. On any
 *      plane whose gridline pitch is smaller than a readout's own width
 *      (graph_transformations: ~51px pitch vs ~87-94px readouts), the old
 *      unified hard set made PM_readoutCollides return true for EVERY
 *      candidate everywhere — a predicate true for all inputs is not a
 *      predicate. Proven both ways in check:cartesian-plane section 17
 *      (gridline-as-hard negative control: saturated; gridline-as-soft:
 *      the same authored offset survives unchanged).
 *   2. PM_readoutResolveOffset rebuilt from a single unconditional blind
 *      full-mirror flip into an ORDERED, ALL-TESTED candidate set: authored
 *      -> x-mirror -> y-mirror -> full-mirror -> (+/-)normal-to-local-ink
 *      (when a localInk segment is supplied — plot_point's own curve
 *      tangent, or secant/tangent's own chord). Returns the FIRST candidate
 *      clear of every HARD obstacle; if none is clear, returns the
 *      LEAST-total-overlap-area candidate (PM_readoutOverlapArea, hard-
 *      weighted + a light grid tie-break) — never an untested guess. O(1),
 *      deterministic, Rule-36-safe (fixed candidate count, no iteration to
 *      convergence, no wall-clock, no randomness).
 *   3. PM_fmtNum's near-zero clamp changed from a fixed 1e-9 epsilon to
 *      0.5 * 10^-decimals — the pre-round-2 fixed epsilon sat three orders
 *      of magnitude below anything a 0-4dp readout ever displays, so a
 *      value that rounds to a false "-0" at the AUTHORED precision (e.g.
 *      -0.4 at 0dp, -0.003 at 2dp) still printed a fabricated negative —
 *      the same rule as ascii_minus_in_oncanvas_math_from_tofixed, defeated
 *      by a magnitude instead of a glyph.
 *   4. plot_point's default readout-offset direction changed from a fixed
 *      screen-axis constant ({10,-12}) to the outward normal of the LOCAL
 *      CURVE TANGENT (PM_plotPointCurveTangentPx: numerically differentiates
 *      the plane's registered function_plot y_expr at the point's own data-x
 *      — never the point's own x_expr/y_expr, so a reparameterised point
 *      like Q="x0+1" still gets the CURVE's true tangent, not an artifact of
 *      its own parameterisation rate), fed through the same width-aware
 *      PM_labelClearOffset support-function displacement secant_line/
 *      tangent_line already use. Lets authors delete offsets rather than
 *      tune them, per the founder brief.
 *   5. check_cartesian_plane.ts hardened against the sign-blind gate class
 *      named at this round's own call sites: an ASCII-only [-\d.] regex
 *      char class and raw parseFloat() both silently fail to recognise
 *      PM_fmtNum's real U+2212 output, so a POSITIVE-only fixture set (the
 *      gate's own prior state) passed vacuously without ever exercising the
 *      sign path. Added asciiMinus()/parseSignedFloat()/SIGNED_NUM_RE_SRC
 *      shared helpers plus dedicated NEGATIVE fixtures (negative x0, negative
 *      slope) at both named call sites, each with its own negative control
 *      demonstrating the OLD ASCII-only tooling does NOT catch what the new
 *      fixture catches.
 *
 * Verify chain (branch fix/pcpl-resolver-candidate-set, off master 94ed2a5):
 *   npx tsc --noEmit                 -> 0 errors
 *   npm run check:renderer-syntax    -> field_3d/particle_field/parametric all OK
 *   npm run check:cartesian-plane    -> ALL CHECKS PASS (19 new/updated
 *     assertions covering the ordered candidate set, the gridline-saturation
 *     negative control + positive proof, PM_fmtNum's clamp at every
 *     authored decimals precision, the curve-tangent default-offset probe
 *     incl. a reparameterisation-independence proof, and both sign-blind
 *     gate fixtures)
 *   src/scripts/_verify_pcpl_resolver_candidate_set_sweep.ts — a dedicated
 *     680-pose (derivative_as_secant_limit STATE_9, offsets stripped) +
 *     121-pose (STATE_3, offsets intact) sweep against the REAL committed
 *     JSON, replicating the renderer's own fixed Pass-0.3 draw order with
 *     the SHIPPED pure functions (not a re-derivation). Results:
 *       STATE_9: 128/680 poses still show >=1 overlapping readout bbox pair
 *         (down from 312/680 under the reconstructed pre-round OLD blind-
 *         flip + constant-default behaviour on the SAME 680 poses — a 59%
 *         reduction). G-1's own named reproduction (x0=1.00, xq=-1.00, the
 *         symmetric chord-slope-0 pose) is now CLEAN.
 *       STATE_3: 77/121 poses still overlap (down from 89/121 under the
 *         reconstructed OLD behaviour — a 13% reduction). The
 *         ORIGINALLY-REPORTED defect window (6500-8800ms) is CONFIRMED
 *         CLOSED at a 25ms re-sweep (0 violations across 93 samples); the
 *         residual is a NEW, LARGER, structurally different regime
 *         (9400-24000ms, as Q's data-position converges toward P's — see
 *         the new OPEN row below) that a fixed 6-candidate O(1) set cannot
 *         separate once two ~85-94px-wide readouts' own anchors sit closer
 *         together than roughly their combined half-widths, independent of
 *         which 6 directions are tried.
 *
 * Deliberately NOT done this round (reported, not fixed — see the NEW OPEN
 * row filed below):
 *   - The anchor-convergence residual above. This is NOT the bug this round
 *     was dispatched to fix (gridline saturation + blind flip, both CLOSED
 *     and verified) and is demonstrably a PRE-EXISTING, LARGER structural
 *     limitation (present, worse, on the reconstructed old design too) that
 *     the founder's own enumerated 6-candidate set cannot solve by
 *     construction under the Rule-36 O(1)/no-iteration constraint. Filed as
 *     its own row rather than silently folded into this "CLOSED" summary.
 *   - Extra candidate directions (larger-magnitude pushes, diagonal offsets)
 *     beyond the founder's own literal enumeration (authored -> x-mirror ->
 *     y-mirror -> full-mirror -> +/-normal) were deliberately NOT added —
 *     the brief specified this exact ordered list; inventing more candidates
 *     is a design decision for the next dispatch, not this one to freelance.
 *   - No concept JSON edited (Rule 40: platform file, own PR).
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'pcpl_surgeon engine round — resolver candidate set, 2026-08-08 (fix/pcpl-resolver-candidate-set)';
const FIXED_IN = ['src/lib/renderers/parametric_renderer.ts', 'src/scripts/check_cartesian_plane.ts'];
// unit_circle_to_sine_wave is on the SAME parametric engine but authors zero
// cartesian_plane/plot_point/secant_line/tangent_line primitives (verified
// by grep before filing) — it is a THE-EYE isolation/negative-control target
// for this round, never a concept these bug_classes actually touch, so it is
// deliberately excluded from concepts_affected.
const AFFECTED_CONCEPTS = ['derivative_as_secant_limit', 'graph_transformations'];

async function insertIfAbsent(row: Record<string, unknown>): Promise<void> {
    const { data: existing } = await supabaseAdmin
        .from('engine_bug_queue').select('bug_class,status').eq('bug_class', row.bug_class).maybeSingle();
    if (existing) {
        console.log(`already filed: ${row.bug_class} (status ${existing.status}) — updating concepts/files/status only.`);
        const { error } = await supabaseAdmin.from('engine_bug_queue').update({
            status: row.status, fixed_at: row.fixed_at, fixed_in_files: row.fixed_in_files, concepts_affected: row.concepts_affected,
        }).eq('bug_class', row.bug_class);
        if (error) throw new Error(`update ${row.bug_class} failed: ${error.message}`);
        return;
    }
    const { error } = await supabaseAdmin.from('engine_bug_queue').insert(row);
    if (error) throw new Error(`insert ${row.bug_class} failed: ${error.message}`);
    console.log(`FILED (${row.status}) ${row.bug_class}`);
}

const NOW = new Date().toISOString();

const ROWS: Record<string, unknown>[] = [
    {
        bug_class: 'readout_resolver_predicate_saturated_by_gridline_ink_so_it_always_returns_true',
        title: 'PM_readoutCollides folded gridline ink into the SAME hard obstacle set as axis lines/curves — on a plane whose gridline pitch is narrower than a readout’s own width, the predicate returns true for EVERY candidate, so the flip fires unconditionally even on placements that were never actually broken',
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: 'drawCartesianPlane registered each gridline as a HARD PM_planeInkZones entry (a thin, full-plane-height/width band). On graph_transformations’ authored plane (x_tick pitch ≈51px, 660px/13-unit viewport), a 2-decimal coordinate-pair readout (~87-94px wide) exceeds the pitch, so by the pigeonhole principle every horizontal box position straddles at least one gridline column — measured: 9 of 9 authored plot_point offsets inverted on that concept, the curve running through the P′ readout in 7 of 8 states.',
        prevention_rule: 'Gridline ink is registered SOFT (PM_planeGridInkZones), never folded into the HARD PM_planeInkZones/PM_readoutDangerZones set PM_readoutCollides tests — it participates only in PM_readoutOverlapArea’s least-overlap tie-break. Any FUTURE decorative/low-priority ink-producing primitive (a second gridline family, a background hatch pattern) must be registered via PM_registerGridInkZone, never PM_registerInkZone, or this saturation recurs for that primitive.',
        probe_type: 'js_eval',
        probe_logic: 'On a plane with gridlines:true and x_tick pitch < a typical 2-decimal readout width, sweep an authored-style offset across >=40 positions clear of the plane’s 2 static axis/tick-label zones: assert PM_readoutCollides returns false for at least one position (the predicate can return false) and that PM_readoutResolveOffset returns an otherwise-hard-clear authored offset UNCHANGED even when it visibly crosses a gridline column. See check:cartesian-plane section 17 ("GRIDLINE SATURATION") for the full sweep + its own negative control (treating grid ink as hard reproduces 100% saturation on the same 59-offset sweep).',
        concepts_affected: AFFECTED_CONCEPTS,
        fixed_in_files: FIXED_IN,
        discovered_in_session: SESSION,
        status: 'FIXED',
        fixed_at: NOW,
    },
    {
        bug_class: 'readout_resolver_flips_blind_without_testing_the_mirrored_candidate',
        title: 'PM_readoutResolveOffset negated BOTH offset components unconditionally the instant any collision fired, never testing whether the mirrored placement was itself clear — or whether a smaller flip (x-only / y-only) would have escaped without moving as far',
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: 'The pre-round resolver was `if (!plane) return candidate; if (!PM_readoutCollides(...)) return candidate; return {-x,-y};` — a single, unconditional, UNTESTED full-mirror answer. Compounded by (1) above (a saturated predicate meant the flip fired on placements that were never actually broken) and produced worse outcomes than the original: derivative_as_secant_limit STATE_6’s dragged P repro (data (0.75,0.28), authored offset {12,20}) collides with the x-axis band; the blind full-mirror {-12,-20} happens to also clear it, but on OTHER poses the full mirror lands somewhere WORSE than a smaller, order-preferred alternative would have (STATE_9’s Q readout landing inside P’s readout at the symmetric xq=-x0 pose).',
        prevention_rule: 'PM_readoutResolveOffset now walks a FIXED, ORDERED, ALL-TESTED candidate list (authored -> x-mirror -> y-mirror -> full-mirror -> optional +/-normal-to-localInk) and returns the FIRST one PM_readoutCollides reports clear, falling back to the LEAST PM_readoutOverlapArea candidate only when none are clear — never an untested guess, still O(1)/Rule-36-safe (fixed candidate count, no iteration to convergence). Any future change to this function MUST preserve "every returned candidate was one of the fixed set AND was tested" — verified by check:cartesian-plane section 17’s reordering negative control (swapping y-mirror and full-mirror in the tested order changes the returned answer, proving the documented order is load-bearing).',
        probe_type: 'js_eval',
        probe_logic: 'Reproduce the founder’s STATE_6 repro (equal_scale plane, viewport {60,78,400,372}, x_range[-2.4,2.6], y_range[-1.95,2.7], anchor data (0.75,0.28), authored offset {12,20}, textW ~119px): assert the FIRST hard-collision-free candidate in order (authored, x-mirror, y-mirror, full-mirror) is returned, and assert that reordering the SAME 4 candidates changes the answer. See check:cartesian-plane section 17’s "founder repro (engine round 2026-08-07/08)" block.',
        concepts_affected: AFFECTED_CONCEPTS,
        fixed_in_files: FIXED_IN,
        discovered_in_session: SESSION,
        status: 'FIXED',
        fixed_at: NOW,
    },
    {
        bug_class: 'pm_fmtnum_near_zero_clamp_is_a_fixed_epsilon_not_scaled_to_decimals',
        title: 'PM_fmtNum’s near-zero clamp was a fixed 1e-9, three orders of magnitude below anything a 0-4dp readout ever prints, so a value that rounds to a false "-0" at the AUTHORED precision (e.g. -0.4 at 0dp, -0.003 at 2dp) still emitted a fabricated negative sign — real Unicode U+2212, correctly glyphed, but numerically wrong',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: 'Number.prototype.toFixed() sign-preserves through zero: (-0.4).toFixed(0) === "-0" in JS. PM_fmtNum’s clamp only zeroes values with |v| < 1e-9, so any genuinely-computed-but-rounds-to-zero-at-this-precision value (float noise near an axis crossing, or a choreographed variable that legitimately passes through a small negative on its way to 0) still printed a "−0" — the same class as ascii_minus_in_oncanvas_math_from_tofixed (alex:json_author, FIXED, recurred 3x), this time defeated by a magnitude rather than a glyph.',
        prevention_rule: 'The clamp threshold is 0.5 * 10^-decimals (half the smallest printable increment at the REQUESTED precision), computed fresh per call — never a single borrowed constant shared across every decimals value. Any future numeric formatter on this engine that clamps near-zero must scale its own epsilon to its own decimals parameter the same way, or it silently regresses this exact class at whatever precision it was authored for.',
        probe_type: 'js_eval',
        probe_logic: "assert PM_fmtNum(-0.003, 2) === '0.00' and PM_fmtNum(-0.4, 0) === '0' (the founder brief's own two literal cases); assert a genuine negative that merely rounds small (PM_fmtNum(-0.006, 2) -> '−0.01') is NOT clamped away; assert the threshold is correctly decimals-scaled at every value 0-4dp (see check:cartesian-plane section 18).",
        concepts_affected: AFFECTED_CONCEPTS,
        fixed_in_files: FIXED_IN,
        discovered_in_session: SESSION,
        status: 'FIXED',
        fixed_at: NOW,
    },
    {
        bug_class: 'plot_point_default_offset_is_a_screen_axis_constant_not_the_curves_own_tangent',
        title: 'A plot_point with no authored readout.offset always defaulted to the fixed screen-space {10,-12}, regardless of the curve’s own local slope at that point — so the SAME default aims a readout straight into a steep curve at one anchor and floats it uselessly far from a shallow one at another',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: 'Unlike secant_line/tangent_line (which already default via PM_labelClearOffset against their OWN drawn segment’s direction), drawPlotPoint’s only default was a literal {x:10,y:-12} — the exact defect class the founder brief names: "the readout aimed along the curve its own point rides", forcing every author to hand-tune an offset per point per state rather than being able to delete it and trust the default.',
        prevention_rule: 'drawPlotPoint’s default now derives PM_plotPointCurveTangentPx (numeric differentiation of the plane’s REGISTERED function_plot y_expr at the point’s own data-x, never the point’s own x_expr/y_expr — reparameterisation-independent, verified by a dedicated negative control) and feeds it through the SAME PM_labelClearOffset support-function displacement secant/tangent already use. A plot_point authored with no accompanying function_plot on its plane still falls back to the constant {10,-12}, never a crash. Any NEW curve-riding primitive should reuse PM_plotPointCurveTangentPx rather than inventing a second screen-axis constant.',
        probe_type: 'js_eval',
        probe_logic: 'At the parabola vertex (curve slope 0) the tangent probe’s own PM_upwardNormal is near-vertical; at a steep point (slope 2) it differs measurably; two probes at the SAME (x,y) but different unrelated `vars` scopes agree exactly (reparameterisation-independence); a probe on a plane with no registered function_plot returns null (constant-default fallback). See check:cartesian-plane section 19.',
        concepts_affected: AFFECTED_CONCEPTS,
        fixed_in_files: FIXED_IN,
        discovered_in_session: SESSION,
        status: 'FIXED',
        fixed_at: NOW,
    },
    {
        bug_class: 'check_cartesian_plane_sign_parsing_is_ascii_only_so_negative_fixtures_never_exercise_the_sign_path',
        title: 'check:cartesian-plane’s own sign-parsing (an ASCII-only [-\\d.] regex char class + raw parseFloat()) silently fails to recognise PM_fmtNum’s real U+2212 output — every existing fixture at both call sites was POSITIVE-only, so the gate never actually exercised the code path it claimed to test',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: 'Section 7 (plot_point readout parse-back) and section 10 (secant readoutText vs computed slope) both re-parsed a PM_fmtNum-produced string with an ASCII-only regex and JS’s native parseFloat(), neither of which recognises U+2212 as a sign character — parseFloat("−1.50") is NaN, not -1.5. Both fixture sets (x0=1.5; x0=1,h=0.001, slope +0.54) were positive, so the vacuous pass was invisible until deliberately tested with a negative value.',
        prevention_rule: 'Any check:cartesian-plane assertion (or future gate on this engine) that parses a PM_fmtNum-produced string back into a number MUST use the shared asciiMinus()/parseSignedFloat()/SIGNED_NUM_RE_SRC helpers (normalise U+2212 -> ASCII \'-\' BEFORE parseFloat/regex), and must include at least one NEGATIVE fixture per call site — a positive-only fixture set can never prove the sign path works, only that it was never asked to.',
        probe_type: 'js_eval',
        probe_logic: 'check:cartesian-plane sections 7 and 10 each carry a dedicated negative fixture (x0=-1.5; x0=2, cos(2)~-0.42) parsed via the sign-aware helpers, PLUS a NEGATIVE CONTROL demonstrating the OLD ASCII-only regex/raw parseFloat do NOT match/parse the same U+2212 string (Number.isNaN(parseFloat(...)) === true).',
        concepts_affected: AFFECTED_CONCEPTS,
        fixed_in_files: FIXED_IN,
        discovered_in_session: SESSION,
        status: 'FIXED',
        fixed_at: NOW,
    },
    {
        bug_class: 'readout_resolver_candidate_set_cannot_separate_two_anchors_closer_than_their_own_combined_label_half_widths',
        title: 'When two plot_points’ own DATA anchors converge close together (a chord shrinking toward h=0, or an explore-drag symmetric pose), no fixed 6-candidate O(1) offset set can guarantee their ~85-94px-wide readouts stay separated — discovered via the mandated sweep verification for this round, NOT the bug this round fixed, and demonstrably PRE-EXISTING (worse under the reconstructed pre-round design)',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: 'PM_readoutResolveOffset’s candidate set is a FIXED, SMALL, geometrically-bounded set of directions (4 mirrors + 2 normals) at a magnitude derived from the authored/default offset. When two points’ own anchor pixels sit closer together than roughly their combined label half-widths (~45px each for an ~90px box), EVERY tested direction still places at least one box’s span across the other’s, regardless of which of the 6 is chosen — a structural limit of independent-per-point small-offset placement, not a resolvable ordering/tiebreak defect. Measured via a dedicated sweep script (src/scripts/_verify_pcpl_resolver_candidate_set_sweep.ts, run against the REAL committed derivative_as_secant_limit JSON with the SHIPPED pure functions): STATE_9 explore (authored offsets stripped, 680-pose x0*xq drag grid) shows 128/680 (18.8%) poses with an overlapping readout-bbox pair, concentrated where |xq-x0| is small (Q approaching P) but not exclusively (91/128 have |xq-x0|>=0.35, e.g. a secant-readout-vs-point collision as the chord midpoint drifts near a point); STATE_3 guided (authored offsets intact, 121-pose 0-24000ms time sweep) shows 77/121 (64%) poses overlapping, concentrated in the state’s own back half (9400ms onward) as its OWN choreography deliberately shrinks h toward 0 (the state’s pedagogical climax: "the point Q slides toward point P"). Both regimes are PRE-EXISTING and WORSE on the reconstructed pre-round design (a locally-rebuilt blind-full-mirror-flip + constant-{10,-12}-default resolver run on the identical 680/121 poses): STATE_9 312/680 (45.9%), STATE_3 89/121 (73.6%, first violation at t=6400ms — matching the ORIGINALLY-REPORTED 6500-8800ms window this round’s fix DOES confirm-close at a 25ms re-sweep, 0/93 violations). This round’s fix reduced STATE_9 by 59% and STATE_3 by 13%; it did not (and, by the O(1)/fixed-candidate-set design the founder brief itself specified, structurally cannot) reach zero.',
        prevention_rule: 'A genuine fix needs a DIFFERENT mechanism than "try more offset directions" — candidates: (a) a leader-line that displaces a readout FAR from its anchor once a proximity threshold is crossed, with a thin connector line back to the dot; (b) merging/collapsing two converging points’ readouts into one shared "P ≈ Q = (...)" string below a proximity threshold; (c) fading one readout’s alpha as its anchor approaches another’s, restoring it once separated. None of these fit inside PM_readoutResolveOffset’s existing O(1)-fixed-candidate-set contract — this is new primitive/authoring-contract design, not a resolver tuning pass. Any future round attempting this MUST re-run src/scripts/_verify_pcpl_resolver_candidate_set_sweep.ts (or its successor) as the acceptance bar, not hand-picked poses — three prior rounds on this exact defect class each verified at samples and each missed a family.',
        probe_type: 'js_eval',
        probe_logic: 'src/scripts/_verify_pcpl_resolver_candidate_set_sweep.ts — Sweep 1 (STATE_9, x0 in [-1.6,1.6] step 0.2 x xq in [-1.9,2.0] step 0.1, offsets stripped): assert 0/680 poses have an overlapping window.__pmDebug.readouts-equivalent bbox pair. Sweep 2 (STATE_3, t in [0,24000] step 200ms, offsets intact): assert 0/121 poses overlap. BOTH currently FAIL (128/680, 77/121 respectively) — this row stays OPEN until a future round changes that.',
        concepts_affected: ['derivative_as_secant_limit'],
        fixed_in_files: [],
        discovered_in_session: SESSION,
        status: 'OPEN',
    },
];

async function main(): Promise<void> {
    for (const row of ROWS) await insertIfAbsent(row);
    console.log('\nExisting related OPEN rows deliberately left untouched (not this round’s ownership/scope):');
    console.log('  - readout_offset_authored_from_one_sample_aims_the_text_into_the_curve_the_point_rides (alex:json_author, CRITICAL, OPEN) — its cycle-1 root-cause narrative names PM_readoutResolveOffset’s blind flip directly; this round’s fix (row 2 above) addresses that root cause, but closing/reclassifying a json_author-owned authoring row is founder_proxy/alex’s call against rendered pixels, not this cluster’s to flip unilaterally.');
    console.log('  - canvas_drawn_readouts_never_enter_the_de_overlap_solver_so_readout_vs_authored_label_text_collisions_are_ungated (peter_parker:renderer_primitives, MAJOR, OPEN) — unrelated to this round: label/annotation primitives, not plot_point/secant/tangent readouts.');
    console.log('  - parametric_readout_and_label_collision_awareness_does_not_cover_a_sibling_primitives_curve_or_line_ink (peter_parker:renderer_primitives, MODERATE, OPEN) — the LABEL half of this class; the READOUT half was already closed by the prior round (parametric_readout_obstacle_set_widened_to_curve_gridline_dot_and_sibling_readout_ink).');
}

main().catch((err) => {
    console.error('close failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
