/**
 * engine_bug_queue — close pcpl_no_primitive_draws_a_circle_or_arc_at_a_live_radius
 * (peter_parker:renderer_primitives dispatch, 2026-08-06).
 *
 * Original row (queued 2026-08-04, founder-approved to start 2026-08-06):
 * drawBody read a circle body's `size` as a literal number at every call site
 * (the isCircle guard and the bw/bh derivation), and drawAngleArc read
 * `radius` the same way. A body's POSITION was already expression-driven
 * (position_expr, evaluated against PM_liveExprVars() — added for the Bohr
 * electron riding between energy rungs), so an author reasonably assumed SIZE
 * was too. It was not. Both workarounds an author might reach for instead
 * failed: a locus_trace under a ramping radius accumulates history and draws
 * a spiral, not a circle; scaling only the radius VECTOR via to_expr leaves a
 * shrinking radius inside a fixed outline. This cost `unit_circle_to_sine_wave`
 * its designed STATE_7 ("The Radius Sets the Wave Height"), cut from v1.0 by
 * founder decision, and blocked the whole radius-responds-to-a-slider family
 * (`conic_sections_as_loci` needs it to morph a conic — not yet authored).
 *
 * What shipped (parametric_renderer.ts only, 2026-08-06):
 *   - drawBody: a `size_expr` field resolved ONCE near the top of the
 *     function (immediately after the existing position_expr block, same
 *     PM_liveExprVars() scope, same opt-in non-finite-eval fallback to the
 *     authored literal spec.size) into a new `resolvedSize` local. The
 *     EXISTING bw/bh derivation switch (isRect/isCircle/isStickman/isTree/
 *     isPulley/isDoor) now reads resolvedSize instead of spec.size, and every
 *     downstream draw call that previously re-read spec.size directly (the
 *     circle/pulley/stickman draw + label-offset call sites) now reads the
 *     already-resolved bw/bh — so every shape inherits the live size without
 *     re-deriving the expression at each call site, exactly as the
 *     prevention_rule specified. size_expr mirrors spec.size's own literal
 *     shape: a single expression string for the scalar shapes (circle/
 *     stickman/pulley), a {w, h} object of expression strings for the boxed
 *     ones (rect/tree/door).
 *   - drawAngleArc: a `radius_expr` (string) sibling, same PM_liveExprVars()
 *     scope and non-finite fallback, resolved immediately after the existing
 *     literal `radius` assignment and before every downstream use (endpoint
 *     registry, arc(), label placement).
 *   - Fully opt-in: a primitive that never authors size_expr/radius_expr
 *     resolves resolvedSize === spec.size / radius === spec.radius exactly as
 *     before — byte-identical rendering for the whole fleet. Confirmed via
 *     THE EYE on 3 concepts: scalar_vs_vector (baseline-locked, all H2 within
 *     tolerance — max 1.54% vs 2.0%), vector_head_to_tail (no baseline, 23/23
 *     deterministic checks clean), bohr_model_energy_levels (56 checks, same
 *     2 STATE_1 H2 failures — 4.83% vs 2.0% tolerance — reproduced IDENTICALLY
 *     against the pre-fix renderer via git stash A/B, so that regression is a
 *     PRE-EXISTING stale baseline unrelated to this fix; filed as a separate
 *     candidate scar, not touched here per the one-bug_class dispatch scope).
 *
 * Verified: functional probe (src/scripts/_verify_size_expr_probe.ts) built a
 * synthetic ParametricConfig with a circle body bound via size_expr and an
 * angle_arc bound via radius_expr, drove PARAM_UPDATE to change the backing
 * variable, and measured the RENDERED PIXEL EXTENT (canvas getImageData
 * bounding-box / max-radius scan) before and after: circle diameter 40px ->
 * 90px, arc radius ~61px -> ~136px, matching the driven variable exactly. A
 * third circle with a syntactically malformed size_expr stayed at its literal
 * 54-55px in both frames, proving the fallback.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_close_engine_bug_queue_pcpl_size_expr.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const row = {
  bug_class: 'pcpl_no_primitive_draws_a_circle_or_arc_at_a_live_radius',
  title:
    'No PCPL primitive could draw a circle body or angle_arc at a size/radius bound to a live variable — only POSITION was expression-driven, size/radius were literal-only',
  severity: 'MAJOR' as const,
  owner_cluster: 'peter_parker:renderer_primitives' as const,
  subject: 'subject_neutral' as const,
  root_cause:
    "drawBody's isCircle guard and its bw/bh derivation (and every downstream circle/pulley/stickman draw + label-offset call site) read spec.size as a literal number, and drawAngleArc read spec.radius the same way. position_expr already existed on drawBody (added for the Bohr electron riding between energy rungs, evaluated against PM_liveExprVars()), so an author reasonably assumed size was expression-capable too — it was not, and there was no honest workaround: a locus_trace under a ramping radius draws a spiral, not a circle; scaling only a to_expr vector on the radius leaves a shrinking arrow inside a fixed outline. Cost unit_circle_to_sine_wave its designed STATE_7 ('The Radius Sets the Wave Height'), cut from v1.0 by founder decision, and blocked the whole radius-responds-to-a-slider family (conic_sections_as_loci needs it to morph a conic).",
  prevention_rule:
    "A body's size (size_expr) and an angle_arc's radius (radius_expr) are now expression-driven, mirroring position_expr's exact contract: read PM_liveExprVars() (the same merged variables+derived scope every other *_expr field uses, so a size binding and a text/position binding in one state can never disagree), resolved ONCE near the top of the function before being fed into the existing bw/bh derivation (drawBody) or into every downstream use of `radius` (drawAngleArc) — never re-derived per draw-call-site — and opt-in/last-resort by construction: a non-finite eval (malformed expression, or a size_expr shape that doesn't match spec.size's own literal shape) keeps the static authored literal, so a broken expression degrades to the old layout rather than vanishing. Any NEW *_expr field added to a PCPL primitive going forward should follow this same three-part contract (shared live-scope function, single early resolution point feeding existing derived locals, non-finite fallback to the authored literal) rather than inventing a parallel evaluation path.",
  probe_type: 'js_eval' as const,
  probe_logic:
    "src/scripts/_verify_size_expr_probe.ts (throwaway, safe to re-derive): assembleParametricHtml() a synthetic ParametricConfig with (a) a circle body carrying size_expr bound to a declared variable and (b) an angle_arc carrying radius_expr, load it in a headless Playwright page, drive a PARAM_UPDATE postMessage changing the backing variable, and assert via canvas getImageData that (1) the circle's rendered pixel bounding-box width/height changes proportionally with the variable, (2) the arc's max-pixel-distance-from-center (scoped to a local window around its known center to avoid unrelated same-tolerance canvas regions) changes proportionally, and (3) a third circle with a syntactically malformed size_expr keeps an UNCHANGED rendered diameter across the same PARAM_UPDATE (fallback proof). Re-run after any future edit to drawBody/drawAngleArc's size or radius resolution.",
  status: 'FIXED' as const,
  concepts_affected: ['unit_circle_to_sine_wave', 'conic_sections_as_loci'],
  fixed_in_files: ['src/lib/renderers/parametric_renderer.ts'],
  discovered_in_session:
    'queued 2026-08-04 (unit_circle_to_sine_wave STATE_7 cut from v1.0 for lack of a live-radius primitive); fixed 2026-08-06 (peter_parker:renderer_primitives engine dispatch, founder-approved same day)',
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
