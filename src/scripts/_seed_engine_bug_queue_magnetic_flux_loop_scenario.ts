/**
 * engine_bug_queue row for the NEW magnetic_flux_loop scenario_type built for the
 * not-yet-authored magnetic_flux (Ch.6 §6.3) concept — routed here by the alex
 * architect (no existing scenario_type covered Φ = B·A·cosθ on a stationary
 * tiltable/resizable loop). This is a 'directive' row (an engine delta, not a
 * reported bug): it records the config-key contract json_author must follow and
 * the scar-list items landed in the SAME change, per the peter_parker:
 * renderer_primitives spec's "Engine bug queue update (post-fix)" step.
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_magnetic_flux_loop_scenario.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-08_magnetic_flux_loop_scenario_build';

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

const RENDERER = 'src/lib/renderers/field_3d_renderer.ts';
const DERIVE = 'src/lib/validators/visual/deriveStateMeta.ts';

const rows: Row[] = [
  {
    bug_class: 'magnetic_flux_loop_scenario_new_build',
    title: 'NEW scenario_type magnetic_flux_loop built for the not-yet-authored magnetic_flux (Ch.6 §6.3) concept — Φ = B·A·cosθ on a stationary tiltable/resizable loop in a uniform B',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      `Not a bug — an engine delta. No existing scenario_type covered a STATIONARY tiltable/resizable loop with a live Φ readout (torque_on_loop_uniform_field rotates continuously; electric_flux's open-disc math was reused for the tilt convention but that scenario is E-field, not B). Built magnetic_flux_loop in ${RENDERER}: buildMagneticFluxLoop() (square wireframe loop, home pose persists across states, never rebuilt — Rule 32d), applyMagneticFluxLoopState() (per-state row visibility: controls[]=live sliders, static_readouts[]=disabled same-position readouts, theta_range bounds), updateMagneticFluxLoopFrame() (idle-sweep-or-drag pose via mflControlValueAt, a LAGGED Phi/projection-shadow feed at MFL_LAG_SEC=0.8s for Rule 32a cause-leads-effect, field-line density ∝ B + through-loop sign tint via colour only — Rule 29). Config-key contract for json_author: per-state field_3d_config.states.<id>.magnetic_flux_loop = { mode?: 'guided'|'explore', controls?: ('B'|'A'|'theta')[], static_readouts?: ('B'|'A'|'theta')[], theta_range?: [number,number], idle_sweep_duration_ms?, idle_sweep_hold_ms?, show_area_vector?, show_theta_arc?, show_projection?, show_hand?, show_unit? }. Top-level config.slider_controls.B / .A / .theta_deg carry min/max/step/default (A key newly added to the Field3DConfig type). Top-level config.field_lines.opacity is REQUIRED (read directly — a missing block is the scar-list "blank scene" trap). Verified: npx tsc --noEmit clean; the runtime FIELD_3D_RENDERER_CODE string re-parsed with new Function() via tsx (confirms no stray backtick / syntax error inside the template-literal-embedded JS — the template-literal trap scar).`,
    prevention_rule:
      'A NEW field_3d scenario_type must land its deriveStateMeta.ts reveal_hold/D7 classification (maxRevealForField3dState candidate + the interactive-vs-reveal_hold explicit split) and its #sliders exclusion-chain entry in the SAME change as the renderer scenario code, or THE EYE false-fails on the first concept authored against it. No literal backtick characters (even inside a `//` comment) may appear anywhere in the FIELD_3D_RENDERER_CODE template-literal body — verify with new Function(FIELD_3D_RENDERER_CODE) via tsx before declaring the scenario done (tsc alone does NOT catch this, since the runtime string is opaque to the TS type-checker).',
    probe_type: 'manual',
    probe_logic:
      'Before json_author authors magnetic_flux against this scenario: (1) npx tsc --noEmit passes; (2) tsx re-parse of FIELD_3D_RENDERER_CODE via new Function() succeeds (no template-literal-trap backtick); (3) once the concept JSON exists, run npm run visual:eyes -- magnetic_flux and confirm every guided state (S1-S5) classifies reveal_hold (not a false-fail static-tail) and S6 classifies interactive; confirm no #sliders panel bleed-through on any state.',
    status: 'FIXED',
    concepts_affected: ['magnetic_flux'],
    fixed_in_files: [RENDERER, DERIVE],
    row_type: 'directive',
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
  return `-- 2026-07-08: NEW magnetic_flux_loop scenario_type engine delta (magnetic_flux, Ch.6 §6.3).\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_magnetic_flux_loop_scenario.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  fixed_in_files = EXCLUDED.fixed_in_files;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-07-08_seed_engine_bug_queue_magnetic_flux_loop_scenario_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} row(s))`);

  const payload = rows.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ upserted ${payload.length} engine_bug_queue row(s)`);
}

main();
