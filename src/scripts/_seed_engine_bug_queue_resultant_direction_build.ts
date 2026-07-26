/**
 * engine_bug_queue rows from the resultant_direction build session (2026-07-24).
 *
 * Sources: quality_auditor's Gate-8 audit + eye-walker's two frame walks + a
 * main-session Playwright runtime probe (PM_focalEmphasis verified working for
 * force_arrow focals — the arc gap below is the drawer's, not the function's).
 *
 * 4 upserted rows:
 *   1. pcpl_radians_helper_missing            probe_definition OPEN   (physics_author's finding, auditor-endorsed)
 *   2. pcpl_locus_trace_no_visible_mover      incident         FIXED  (S3 invisible-tracer, fixed via body+translate beads)
 *   3. pcpl_solver_blind_label_hand_placement_collisions incident FIXED (S2/S3/S6 label collisions, fix rounds 1+2)
 *   4. pcpl_angle_arc_no_focal_glow_channel   incident         OPEN   (drawAngleArc never consumes PM_focalEmphasis)
 * plus one UPDATE: append resultant_direction to the existing OPEN
 * pcpl_slider_label_stale_under_choreography row's concepts_affected.
 *
 * Idempotent: upsert onConflict 'bug_class'; the append is presence-guarded. Run:
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_resultant_direction_build.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-24_resultant_direction_build';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:json_author'
  | 'peter_parker:renderer_primitives' | 'peter_parker:runtime_generation'
  | 'peter_parker:visual_validator' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'directive' | 'probe_definition';

interface Row {
  bug_class: string; title: string; severity: Severity; owner_cluster: Owner;
  root_cause: string; prevention_rule: string; probe_type: ProbeType; probe_logic: string;
  status: Status; concepts_affected: string[]; fixed_in_files: string[]; row_type: RowType;
}

const RENDERER = 'src/lib/renderers/parametric_renderer.ts';
const CONCEPT = 'src/data/concepts/resultant_direction.json';

const rows: Row[] = [
  {
    bug_class: 'pcpl_radians_helper_missing',
    title: 'PCPL eval scope has no radians() — the generic "wrap angles in radians()" guidance is field_3d/mechanics_2d dialect only; radians(x) in a PCPL expression throws inside PM_safeEval and silently becomes NaN → isFinite fallback 0 → invisible zero-length primitive',
    severity: 'MODERATE',
    owner_cluster: 'alex:physics_author',
    root_cause:
      'PM_buildEvalScope (parametric_renderer.ts ~line 719) injects exactly sqrt,atan2,atan,asin,acos,sin,cos,tan,abs,min,max,pow,log,exp,PI,E,round,floor,ceil,sign as bare names — no radians(). The generic physics_author spec instruction "always wrap angle variables in radians()" is correct for the field_3d/mechanics_2d dialect but WRONG for PCPL: any *_expr / formulas / computed_outputs string calling radians() throws inside PM_safeEval\'s try/catch, returns NaN, and the caller\'s isFinite() guard falls back to 0 — an invisible zero-length arrow/arc with no surfaced error (same NaN→0→invisible failure mode as the parametric_expr_field_scope_missing_derived scar; cross-link). Surfaced pre-ship during the resultant_direction physics block (physics_author read the renderer source instead of trusting the spec); zero incidents shipped. Endorsed as a permanent probe by quality_auditor 2026-07-24.',
    prevention_rule:
      'In PCPL/parametric expressions ALWAYS convert degrees with `theta * PI / 180`, never radians(theta). radians() is the field_3d/mechanics_2d dialect. Applies to every *_expr field, physics_engine_config.formulas, and computed_outputs string in any concept routed through PCPL_CONCEPTS, and to the Math.-prefixed computePhysics_<id> functions (use `deg * Math.PI / 180`).',
    probe_type: 'js_eval',
    probe_logic:
      'Static scan: for every concept id in PCPL_CONCEPTS (aiSimulationGenerator.ts), load src/data/concepts/<id>.json and flag any occurrence of the substring "radians(" in any string value under physics_engine_config (variables/formulas/computed_outputs/constraints) or any *_expr field in any state\'s scene_composition / variable_choreography. Zero matches expected fleet-wide. Also flag "radians(" inside any computePhysics_* function body in parametric_renderer.ts.',
    status: 'OPEN',
    concepts_affected: [],
    fixed_in_files: [],
    row_type: 'probe_definition',
  },
  {
    bug_class: 'pcpl_locus_trace_no_visible_mover',
    title: 'locus_trace is a trail, not a mover — a flow-along-path beat authored as locus_trace alone, retracing geometry already drawn by static arrows, renders invisibly (resultant_direction STATE_3, the PRIMARY-aha tracer)',
    severity: 'MODERATE',
    owner_cluster: 'alex:json_author',
    root_cause:
      'FIXED 2026-07-24 (same session, fix round 1). drawLocusTrace (parametric_renderer.ts ~line 2037) draws only line segments between resampled points — it has no "current position" bead/head. resultant_direction STATE_3 authored its derivation tracer as a locus_trace whose x_expr/y_expr retrace exactly the base + riser segments already occupied by the static shadow_arrow_s3/riser_arrow_s3 pixels, so the trail computed and drew CORRECTLY but was optically indistinguishable from the arrows under it — eye-walker found zero visible motion across 17 dense frames in the concept\'s PRIMARY-aha state. The parent vector_addition_law\'s own "walk the path" beat already used the correct pattern (a moving body with animation.type:"translate" as the visible mover + locus_trace only as a secondary fading trail); the authoring here copied the trail without the mover.',
    prevention_rule:
      'A flow-along-path archetype REQUIRES a visible moving primitive (body with animation.type:"translate", or an arrow with the translate carry) — locus_trace alone is only a trail and is invisible whenever its path retraces already-drawn geometry. Verification duty (eye-walker + author self-check): for any tracer/flow state, confirm the mover is visible mid-motion in at least 2 consecutive dense frames and absent before its appear_at_ms.',
    probe_type: 'vision_model',
    probe_logic:
      'For any state whose declared motion archetype is flow-along-path (or whose scene contains a locus_trace with time-windowed start_ms/end_ms): sample THE EYE dense frames inside the trace window and assert a visible moving element (pixel diff cluster tracking along the authored path) distinct from static geometry. If the only path-shaped pixels coincide with pre-existing arrows/lines, FAIL the state as invisible-motion.',
    status: 'FIXED',
    concepts_affected: ['resultant_direction'],
    fixed_in_files: [CONCEPT],
    row_type: 'incident',
  },
  {
    bug_class: 'pcpl_solver_blind_label_hand_placement_collisions',
    title: 'Labels on solver-blind (anchor_to/*_expr) PCPL arrows collide invisibly to all tooling — resultant_direction shipped its first EYE run with "A = 3.0 km" and "B cos θ" merged into one illegible string across 3 states',
    severity: 'MODERATE',
    owner_cluster: 'alex:json_author',
    root_cause:
      'FIXED 2026-07-24 (fix rounds 1+2, same session). The PCPL label solver cannot register anchor_to/*_expr-driven force_arrows as obstacles ("Could not register ... as obstacle (unresolved geometry)" — 31 warnings at assembly), so hand-placed labels on such arrows are checked by NOTHING: validate:concepts layout gate EXIT=0 and check-layout-overlap both passed while the actual pixels showed "A = 3.0 kmB cos θ" merged text in STATE_2/3/6 (every state sharing the triangle geometry). Round 1 moved the shadow label perpendicular (label_position:"perpendicular", label_perp_offset:20 — tracks the arrow\'s live direction, not a hardcoded pixel); round 2 cleared the residual collision the round-1 move exposed (A\'s own label sitting on the shadow arrowhead glyph). Only eye-walker\'s pixel read caught either.',
    prevention_rule:
      'A solver "could not register as obstacle" warning on a PCPL arrow is BINDING, not advisory: every label on or near that arrow must be hand-placed AND visually verified in THE EYE frames of EVERY state sharing the geometry (not just the state it was authored in), and re-verified after ANY label move (repositioning one label can expose a new collision on a neighbor — round 2\'s lesson). Prefer label_position:"perpendicular"/label_perp_offset (live-direction-tracking) over hardcoded pixel offsets so explore-state slider drags cannot re-collide the label.',
    probe_type: 'vision_model',
    probe_logic:
      'For every PCPL concept whose assembly emits "Could not register ... as obstacle": OCR/inspect each affected state\'s frozen frame for merged/overlapping text runs in the band around the affected arrows (adjacent glyph bounding boxes from different labels overlapping or separated by <4px). Any hit = FAIL back to alex:json_author with the specific label pair.',
    status: 'FIXED',
    concepts_affected: ['resultant_direction'],
    fixed_in_files: [CONCEPT],
    row_type: 'incident',
  },
  {
    bug_class: 'pcpl_angle_arc_no_focal_glow_channel',
    title: 'drawAngleArc never consumes PM_focalEmphasis — a state whose declared focal is an angle_arc dims every peer but the arc itself can never glow (resultant_direction S3 alpha_arc_true, S5 alpha_arc_live)',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      'FIXED 2026-07-24 (same session, founder-directed renderer_primitives dispatch). PM_focalEmphasis (parametric_renderer.ts ~line 607) was consumed by exactly four drawers: drawLabel (~1392), drawAnnotation (~1427), drawForceArrow (~1607), drawFormulaBox (~2384). drawAngleArc (~2229), drawBody (~954), and drawLocusTrace (~2037) never called it — so when a state declared an angle_arc as focal_primitive_id (resultant_direction STATE_3 alpha_arc_true, STATE_5 alpha_arc_live — the arc IS the taught element in both), all force_arrow/label/formula peers correctly dimmed to alphaMul 0.6 but the arc rendered flat with no glow/brightness lift: dimmed periphery, no lit focal. Runtime probe (Playwright) confirmed PM_focalEmphasis itself resolves arc focal ids correctly — the gap was purely the drawers not asking. Fix: all three drawers now fetch emph after their visibility gate, multiply emph.alphaMul into their existing alpha channels (geometry untouched, Rule 29), and bracket their draws with drawingContext.shadowBlur/shadowColor set+reset when glowPx>0. Verified live: STATE_3 alpha_arc_true draws with shadowBlur 12 (halo pixel sample 20 vs 0 pre-fix), theta_arc_s3 peer dims 0.6, zero shadow leak to subsequent draws; vitest string guards 13/13; THE EYE 27/27.',
    prevention_rule:
      'Every PCPL primitive drawer that can be a taught element must consume PM_focalEmphasis the same way drawForceArrow does: fetch emph after the animation gate, multiply emph.alphaMul into the primitive\'s alpha, and when emph.glowPx > 0 set drawingContext.shadowBlur/shadowColor around the draw and RESET after (a leaked shadow bleeds into every later primitive). When adding emphasis to a new drawer, mirror the existing four call sites — never invent a second emphasis mechanism.',
    probe_type: 'js_eval',
    probe_logic:
      'Static: for each drawer function in parametric_renderer.ts corresponding to a primitive type that appears as any state\'s focal_primitive_id anywhere in the fleet (angle_arc, body, locus_trace, force_arrow, label, annotation, formula_box), assert the function body contains PM_focalEmphasis. Current expected failures: drawAngleArc, drawBody, drawLocusTrace. Runtime spot-check: in a state whose focal is an angle_arc, sample the arc\'s stroke pixels vs a peer\'s — peer at 0.6 dim with the arc flat/no-halo = the gap live.',
    status: 'FIXED',
    concepts_affected: ['resultant_direction'],
    fixed_in_files: [RENDERER, 'src/lib/renderers/__tests__/parametric_renderer.test.ts'],
    row_type: 'incident',
  },
];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length === 0 ? `ARRAY[]::text[]` : `ARRAY[${a.map(sqlStr).join(', ')}]`; }
function sqlRow(r: Row): string {
  return `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(SESSION)}, ${sqlStr(r.row_type)})`;
}
function emitSql(all: Row[]): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type';
  return `-- 2026-07-24: resultant_direction build-session scars (radians probe, invisible\n` +
    `-- locus_trace mover, solver-blind label collisions, angle_arc glow gap) +\n` +
    `-- concepts_affected append on pcpl_slider_label_stale_under_choreography.\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_resultant_direction_build.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files,\n` +
    `  fixed_at = CASE WHEN EXCLUDED.status = 'FIXED' THEN now() ELSE engine_bug_queue.fixed_at END;\n\n` +
    `UPDATE engine_bug_queue\n` +
    `SET concepts_affected = array_append(concepts_affected, 'resultant_direction'), updated_at = now()\n` +
    `WHERE bug_class = 'pcpl_slider_label_stale_under_choreography'\n` +
    `  AND NOT ('resultant_direction' = ANY(concepts_affected));\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-07-24_seed_engine_bug_queue_resultant_direction_build_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} row(s) + 1 append)`);

  const payload = rows.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ ${rows.length} row(s) upserted (2 FIXED, 1 OPEN incident, 1 OPEN probe_definition)`);

  // Presence-guarded append on the pre-existing OPEN slider-caption scar.
  const { data: existing, error: selErr } = await supabaseAdmin
    .from('engine_bug_queue')
    .select('concepts_affected')
    .eq('bug_class', 'pcpl_slider_label_stale_under_choreography')
    .maybeSingle();
  if (selErr) { console.error(`✗ select failed: ${selErr.message}`); process.exit(1); }
  if (!existing) { console.log('… pcpl_slider_label_stale_under_choreography row not found — append skipped'); return; }
  const arr: string[] = existing.concepts_affected ?? [];
  if (arr.includes('resultant_direction')) {
    console.log('… concepts_affected already lists resultant_direction — append skipped');
    return;
  }
  const { error: updErr } = await supabaseAdmin
    .from('engine_bug_queue')
    .update({ concepts_affected: [...arr, 'resultant_direction'], updated_at: new Date().toISOString() })
    .eq('bug_class', 'pcpl_slider_label_stale_under_choreography');
  if (updErr) { console.error(`✗ append failed: ${updErr.message}`); process.exit(1); }
  console.log('✓ appended resultant_direction to pcpl_slider_label_stale_under_choreography.concepts_affected');
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
