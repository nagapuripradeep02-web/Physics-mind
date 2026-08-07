/**
 * engine_bug_queue — close pcpl_drawlabel_has_no_position_expr_so_object_anchored_text_cannot_track
 * (peter_parker:renderer_primitives dispatch, 2026-08-06).
 *
 * Original row (OPEN, MAJOR; founder-approved to fix 2026-08-06):
 * drawLabel read only a literal position (`spec._solverPosition || spec.position`)
 * — unlike drawBody, which grew a position_expr branch (evaluated against
 * PM_liveExprVars()) so a body could ride a variable-driven point. The
 * asymmetry was the trap: an author who knew a body's position could be
 * expression-driven reasonably assumed a label's could too, but a `label`
 * primitive carrying position_expr was SILENTLY IGNORED — a symbol naming a
 * moving object (the unit-circle angle glyph beside the point riding the rim,
 * the height symbol beside its live segment, the arc-length symbol riding
 * the rim) had no anchored option and had to be faked via the owning
 * primitive's own label field instead of a real `label`.
 *
 * What shipped (parametric_renderer.ts only, 2026-08-06):
 *   - drawLabel: a `position_expr` field mirroring drawBody's exact contract
 *     — read PM_liveExprVars() (the SAME merged variables+derived scope
 *     PM_interpolate and drawBody's position_expr already use, so a label's
 *     text and its own position can never disagree about the value they
 *     describe), resolved right after the existing
 *     `pos = spec._solverPosition || spec.position` line and before every
 *     downstream use of `pos` (the multi-line text draw loop).
 *   - Precedence decision (documented inline, because it is not obvious):
 *     an authored position_expr WINS over _solverPosition. The de-overlap
 *     solver resolves from the state's static layout and cannot see
 *     expression-driven geometry at all (separate OPEN scar:
 *     pcpl_solver_cannot_register_expression_driven_vector_primitives_as_obstacles
 *     — NOT touched by this fix, left exactly as-is), so its stamped slot for
 *     an expression-driven label is stale the instant the driving variable
 *     moves; a label that explicitly asks to track a live value must beat a
 *     stale solver slot. spec.position remains the last-resort fallback
 *     exactly like drawBody's size_expr: a non-finite eval (malformed
 *     expression, or missing vars) keeps today's static authored position
 *     rather than vanishing the label.
 *   - Fully opt-in: a label that never authors position_expr resolves
 *     pos === (spec._solverPosition || spec.position) exactly as before —
 *     byte-identical rendering for the whole fleet. The top-of-function guard
 *     (`if (!spec || !(spec._solverPosition || spec.position)) return;`) is
 *     UNCHANGED — position_expr is a live override of that authored/solver
 *     position, not a replacement for authoring one, mirroring drawBody's own
 *     requirement that size_expr always mirrors an authored spec.size shape.
 *
 * Verified: functional probe
 * (src/scripts/_verify_label_position_expr_probe.ts) built a synthetic
 * ParametricConfig with three labels sharing one driving variable and drove
 * PARAM_UPDATE, measuring the RENDERED PIXEL CENTER (canvas getImageData
 * bounding-box center) before/after: (1) a plain position_expr label moved
 * its center by exactly the driven delta (300,250 -> 450,250 for label_x
 * 0->150); (2) a label with a syntactically malformed position_expr.x stayed
 * at its authored literal position in both frames; (3) a label carrying BOTH
 * a hand-set _solverPosition (300 away from the truth) AND a valid
 * position_expr rendered at the position_expr's coordinate in both frames,
 * never at _solverPosition nor at its own authored fallback — proving the
 * documented precedence end to end, in pixels.
 *
 * Regression: THE EYE on scalar_vs_vector (baseline-locked PCPL, 32/32
 * deterministic checks, H2 within tolerance) and unit_circle_to_sine_wave
 * (baseline-locked mathematics-namespace PCPL, all deterministic checks
 * green, H2 within tolerance) — zero new engine_bug_queue rows, zero
 * regression on the fleet's only two concepts that exercise position_expr
 * today.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_close_engine_bug_queue_pcpl_drawlabel_position_expr.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const row = {
  bug_class: 'pcpl_drawlabel_has_no_position_expr_so_object_anchored_text_cannot_track',
  title:
    'drawLabel had no position_expr — a label naming a moving object could not follow it, only literal/solver positions worked',
  severity: 'MAJOR' as const,
  owner_cluster: 'peter_parker:renderer_primitives' as const,
  subject: 'subject_neutral' as const,
  root_cause:
    "drawLabel opened with a guard requiring spec._solverPosition || spec.position and read `var pos = spec._solverPosition || spec.position;` with no position_expr branch and no anchor resolution — unlike drawBody, whose position_expr already existed so a body could ride a variable. The asymmetry was the trap: an author who knew body position was expression-driven reasonably assumed a label's was too, and the unit_circle_to_sine_wave skeleton typed three symbols as object-anchored `label` primitives (the angle glyph on the arc, the height symbol beside its segment, the arc-length symbol riding the rim) that could not track — a `label` primitive carrying position_expr was SILENTLY IGNORED.",
  prevention_rule:
    "AUTHORING: object-anchored text should ride the OWNING primitive's own label field when one exists; a `label` primitive is for text whose position is either fixed or explicitly expression-driven via position_expr. ENGINE (now shipped): drawLabel carries the same position_expr branch drawBody has — same PM_liveExprVars() scope, same non-finite-eval fallback to the authored spec.position/_solverPosition — so a symbol and the geometry it names can never disagree about where they are. Precedence: an authored position_expr (when both x and y evaluate finite) WINS over _solverPosition, because the de-overlap solver cannot see expression-driven geometry and its stamped slot for such a label is stale the instant the driving variable moves; spec.position is the last-resort fallback exactly like drawBody's size_expr. Any NEW *_expr field added to a PCPL primitive going forward should follow this same three-part contract (shared live-scope function, single early resolution point feeding the existing pos/size local, non-finite fallback to the authored literal) rather than inventing a parallel evaluation path.",
  probe_type: 'js_eval' as const,
  probe_logic:
    "src/scripts/_verify_label_position_expr_probe.ts (throwaway, safe to re-derive): assembleParametricHtml() a synthetic ParametricConfig with three `label` primitives sharing one driving variable — (a) a plain position_expr label, (b) a label with a syntactically malformed position_expr.x alongside a valid authored spec.position, (c) a label carrying BOTH a hand-set _solverPosition AND a valid position_expr — load it in a headless Playwright page, drive a PARAM_UPDATE postMessage changing the driving variable, and assert via canvas getImageData bounding-box CENTER that (1) label (a)'s rendered center moves by exactly the driven delta, (2) label (b)'s rendered center is UNCHANGED across the PARAM_UPDATE (fallback proof), and (3) label (c) renders at the position_expr's coordinate in both frames, never at _solverPosition nor at its own authored fallback (precedence proof). Re-run after any future edit to drawLabel's position resolution.",
  status: 'FIXED' as const,
  concepts_affected: ['unit_circle_to_sine_wave'],
  fixed_in_files: ['src/lib/renderers/parametric_renderer.ts'],
  discovered_in_session:
    'queued during the unit_circle_to_sine_wave build (object-anchored symbols had no tracking option); fixed 2026-08-06 (peter_parker:renderer_primitives engine dispatch, founder-approved same day)',
  fixed_at: new Date().toISOString(),
  row_type: 'incident' as const,
};

async function main(): Promise<void> {
  const { error } = await supabaseAdmin
    .from('engine_bug_queue')
    .upsert(row, { onConflict: 'bug_class' });
  if (error) throw new Error(`upsert ${row.bug_class} failed: ${error.message}`);
  console.log(`✅ FIXED ${row.bug_class}`);
  console.log(`   ${row.concepts_affected.length} concepts affected, ${row.fixed_in_files.length} files in the fix`);
}

main().catch((err) => {
  console.error('💥 close failed:', err instanceof Error ? err.stack : err);
  process.exit(1);
});
