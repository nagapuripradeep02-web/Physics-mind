/**
 * engine_bug_queue row for the parametric_renderer.ts *_expr-vs-derived-scope defect
 * (eye-walker FAIL-routing dispatch, scalar_vs_vector STATE_4/STATE_5 resultant vector).
 *
 * Root cause: drawForceArrow / drawVector / drawAngleArc / drawSurface / drawBody's
 * animation block each built their own `liveVars` scope for PM_safeEval() out of
 * PM_physics.variables (raw slider/input vars) only — never merging PM_physics.derived
 * (computed_outputs like R_mag, force_magnitude, pressure). PM_interpolate (used for
 * {curly} HUD text) already merged .derived correctly, so a primitive's live numeric
 * readout could show the right value while its own vector rendered as a zero-length
 * stub — the bug was invisible to any check that only inspected HUD text.
 *
 * Fix: added PM_liveVarsWithDerived() (copies PM_interpolate's exact merge idiom) and
 * routed all 8 call sites through it. Idempotent: upsert onConflict 'bug_class'. Also
 * writes the archival SQL. Run:
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_parametric_expr_derived_scope.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-23_scalar_vs_vector_resultant_vector_derived_scope_fix';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:json_author'
  | 'peter_parker:renderer_primitives' | 'peter_parker:runtime_generation'
  | 'peter_parker:visual_validator' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'directive';

interface Row {
  bug_class: string; title: string; severity: Severity; owner_cluster: Owner;
  root_cause: string; prevention_rule: string; probe_type: ProbeType; probe_logic: string;
  status: Status; concepts_affected: string[]; fixed_in_files: string[]; row_type: RowType;
}

const RENDERER = 'src/lib/renderers/parametric_renderer.ts';

// Every concept currently authoring a magnitude_expr/direction_deg_expr/to_deg_expr/
// angle_value_expr/angle_expr/accel_expr/sign_expr field on the PCPL/parametric path
// (grep across src/data/concepts/*.json, 2026-07-23) — the whole class of concept that
// depends on the fixed invariant, not just the one empirically confirmed broken.
const CONCEPTS_TOUCHING_EXPR_FIELDS = [
  'contact_forces', 'current_not_vector', 'field_forces', 'friction_static_kinetic',
  'hinge_force', 'newton_second_law_direction', 'normal_reaction', 'pressure_scalar',
  'scalar_vs_vector', 'tension_in_string', 'vector_resolution',
];

const incidents: Row[] = [
  {
    bug_class: 'parametric_expr_field_scope_missing_derived',
    title: 'parametric_renderer.ts: force_arrow/vector/angle_arc/surface/body *_expr fields (magnitude_expr, direction_deg_expr, to_deg_expr, angle_value_expr, angle_expr, accel_expr, sign_expr) evaluate against a liveVars scope built ONLY from PM_physics.variables — never merging PM_physics.derived — so any expr referencing a computed_output (e.g. R_mag, R_dir_deg) silently evaluates to NaN/undefined and the isFinite() guard at the call site falls back to 0, collapsing the primitive to a near-invisible zero-length stub even though the adjacent HUD text (PM_interpolate, which DOES merge .derived) shows the correct value.',
    severity: 'CRITICAL',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      'FIXED 2026-07-23. Each of drawForceArrow (magnitude_expr/direction_deg_expr), drawVector (magnitude_expr/direction_deg_expr), drawAngleArc (to_deg_expr/angle_value_expr), drawSurface (angle_expr), and the drawBody slide_horizontal/slide_when_kinetic/atwood animation block (accel_expr/direction_deg_expr/sign_expr) independently rebuilt the same broken scope: `(PM_physics && PM_physics.variables) || (PM_config && PM_config.default_variables) || {}`. PM_interpolate (used for {R_mag.toFixed(1)}-style HUD text interpolation) already merged PM_physics.derived on top of that same base — proving the merge is the correct/expected behaviour — but the 8 PM_safeEval call sites outside PM_interpolate never did. Confirmed empirically via eye-walker frame read: scalar_vs_vector STATE_4 (resultant_chord, magnitude_expr:"R_mag") and STATE_5 (resultant_chord_live, same) rendered a collapsed arrow while the |R| = 5.0 km HUD text was correct; STATE_3 (literal magnitude:5, no expr) rendered fine, which is what confirmed the diagnosis.',
    prevention_rule:
      'Every *_expr field a primitive draw function evaluates via PM_safeEval (or looks up by key against a vars object, e.g. the to_deg_expr/angle_expr `vars[spec.to_deg_expr]` pattern) MUST build its scope via the shared PM_liveVarsWithDerived() helper (PM_physics.variables / PM_config.default_variables merged with PM_physics.derived on top, matching PM_interpolate exact merge order) — never a local ad-hoc `(PM_physics && PM_physics.variables) || ...` one-liner. When adding a NEW *_expr field to any primitive, grep the file for `PM_liveVarsWithDerived` and reuse it; do not hand-roll the scope.',
    probe_type: 'js_eval',
    probe_logic:
      'For any concept JSON with a physics_engine_config.computed_outputs entry named X, and a scene_composition primitive whose magnitude_expr/direction_deg_expr/to_deg_expr/angle_value_expr/angle_expr literally equals X (or an expression referencing X): render the state, read the drawn endpoint of that primitive (or, for a THE-EYE/Playwright pixel probe, the rendered arrow tip-to-origin pixel distance) and assert it is NOT ~0 when the corresponding HUD/derived numeric readout for X is non-zero. Reference regression check: scalar_vs_vector STATE_4/STATE_5 resultant_chord/resultant_chord_live must render a visible diagonal arrow (~150px chord at defaults) matching the |R| readout, not a zero-length stub.',
    status: 'FIXED',
    concepts_affected: CONCEPTS_TOUCHING_EXPR_FIELDS,
    fixed_in_files: [RENDERER],
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
  return `-- 2026-07-23: parametric_renderer.ts *_expr-vs-derived-scope fix (eye-walker FAIL-routing\n` +
    `-- dispatch on scalar_vs_vector STATE_4/STATE_5 resultant vector). Fleet-wide fix: added\n` +
    `-- PM_liveVarsWithDerived() and routed drawForceArrow/drawVector/drawAngleArc/drawSurface/\n` +
    `-- drawBody's 8 PM_safeEval call sites through it. Generated by\n` +
    `-- src/scripts/_seed_engine_bug_queue_parametric_expr_derived_scope.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files,\n` +
    `  fixed_at = now();\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-07-23_seed_engine_bug_queue_parametric_expr_derived_scope_migration.sql');
  writeFileSync(sqlPath, emitSql(incidents), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${incidents.length} incident row(s))`);

  const payload = incidents.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ ${incidents.length} parametric expr-derived-scope row(s) upserted (FIXED)`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
