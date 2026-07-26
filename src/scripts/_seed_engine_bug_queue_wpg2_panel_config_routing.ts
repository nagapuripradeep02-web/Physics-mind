/**
 * engine_bug_queue rows for WP-G2 (PCPL hardening plan, 2026-07-23) —
 * concept_panel_config routing gap.
 *
 * Row 1 (FIXED): scalar_vs_vector had no concept_panel_config row. Its JSON
 * declares renderer_pair.panel_b="graph_interactive" with no panel_b_config
 * ever authored, so jsonModifier.ts fetchTechnologyConfig()'s JSON-fallback
 * path set panel_count=2 and generateSimulation() routed it into the
 * dual-panel Stage-2 Sonnet block (aiSimulationGenerator.ts ~5838-6298),
 * which throws "Dual-panel Stage 2 failed..." whenever the runStage2() call
 * fails (e.g. low API credits). Fixed by inserting a concept_panel_config
 * row with default_panel_count=1 (see
 * supabase_migrations/supabase_2026-07-23_seed_scalar_vs_vector_panel_config_migration.sql),
 * which short-circuits the ENTIRE panelCount>1 block and routes to the
 * zero-LLM single-panel PCPL bypass instead. Verified end-to-end via
 * src/scripts/regen_sim_cache.ts (awaited cache write at aiSimulationGenerator.ts
 * ~6562, not the fire-and-forget EPIC-L-bypass upsert WP-G1 is fixing).
 *
 * Row 2 (OPEN — discovered as a side effect of Row 1's investigation, NOT
 * fixed by WP-G2, needs its own dispatch): the exact same
 * missing-concept_panel_config-row + fetchTechnologyConfig JSON-fallback
 * mechanism affects 45 CURRENT live-product field_3d/particle_field
 * concepts (Ch.1-7 diamonds + Ch.3 circuit concepts) whose JSON authors
 * `renderer_pair: {panel_a: "field_3d"|"particle_field", panel_b: <same
 * value>}` — a vestigial same-renderer "dual" declaration (NOT genuine
 * dual-panel intent) left over from an older authoring template, with no
 * panel_b_config and no concept_panel_config row. Any of them, on a
 * simulation_cache MISS (e.g. after a routine cache clear — CLAUDE.md §6
 * instructs clearing simulation_cache before every test), would ALSO
 * compute panel_count=2 via the JSON fallback and enter the same
 * mechanics_2d-shaped dual-panel Stage-2 block, which has no field_3d/
 * particle_field awareness at all — even a successful Stage-2 call would
 * feed Sonnet-hallucinated JSON to assembleField3DHtml instead of the
 * authored field_3d_config/particle_field_config (a Rule 18 risk stacked
 * on top of the crash risk). Confirmed empirically for all 45 (JSON scan
 * cross-referenced against a live SELECT concept_id FROM
 * concept_panel_config, 2026-07-23) — every one has an authored
 * field_3d_config or particle_field_config, so the fix is identical in
 * shape to Row 1: insert one concept_panel_config row per concept with
 * default_panel_count=1, panel_a_renderer/technology_a mirroring the JSON's
 * own renderer_pair.panel_a, panel_b_renderer=NULL.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_wpg2_panel_config_routing.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-23_wpg2_scalar_vs_vector_panel_config_row';

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

const FIELD3D_PARTICLE_FIELD_AT_RISK = [
  'amperes_circuital_law', 'bar_magnet_as_dipole', 'bar_magnet_in_uniform_field', 'biot_savart_law',
  'charge_distribution', 'circular_motion_charge_in_uniform_B', 'combination_of_cells',
  'combination_of_resistors', 'current_loop_acts_as_dipole', 'cyclotron_period_independent_of_speed',
  'earths_magnetism', 'eddy_currents', 'electrical_power_in_resistor', 'electric_dipole_in_field',
  'electric_field_dipole', 'electric_flux', 'electric_potential_dipole', 'electric_potential_meaning',
  'electric_potential_point_charge', 'electric_potential_system_of_charges', 'emf_definition',
  'equipotential_surfaces', 'faraday_law_induction', 'force_on_charge_in_field',
  'force_on_current_carrying_wire', 'gauss_law', 'gauss_law_line', 'gauss_law_magnetism',
  'gauss_law_sheet', 'gauss_law_solid_sphere', 'gauss_law_sphere', 'helical_motion_charge_in_uniform_B',
  'inductance', 'kirchhoff_junction_rule_KCL', 'kirchhoff_loop_rule_KVL', 'magnetic_field_circular_loop',
  'magnetic_field_concept_B', 'magnetic_flux', 'magnetic_force_direction_right_hand_rule',
  'magnetic_force_perpendicular_no_work', 'magnetisation_and_intensity', 'moving_coil_galvanometer',
  'parallel_currents_force', 'potential_energy_in_external_field', 'potential_energy_system_of_charges',
  'torque_on_current_loop_in_field',
];

const rows: Row[] = [
  {
    bug_class: 'scalar_vs_vector_missing_panel_config_row',
    title: 'scalar_vs_vector had no concept_panel_config row; JSON renderer_pair.panel_b="graph_interactive" with no panel_b_config authored made jsonModifier.ts fetchTechnologyConfig() JSON-fallback set panel_count=2, routing generateSimulation() into the dual-panel Stage-2 Sonnet block, which threw "Dual-panel Stage 2 failed..." whenever runStage2() failed (e.g. low API credits).',
    severity: 'CRITICAL',
    owner_cluster: 'peter_parker:runtime_generation',
    root_cause:
      'FIXED 2026-07-23 (WP-G2). fetchTechnologyConfig() (jsonModifier.ts ~65-139) reads concept_panel_config.default_panel_count FIRST; with no row it falls back to the concept JSON\'s renderer_pair, setting panel_count = panel_b ? 2 : 1 regardless of whether panel_b_config was ever authored. scalar_vs_vector\'s JSON declared panel_b="graph_interactive" with no panel_b_config, so panelCount>1 fired and isEpicLBypass (which needs panel_b_config) was false, falling through to runStage2() (aiSimulationGenerator.ts ~6064) unconditionally — a crash whenever that Sonnet call failed. The concept was already correctly registered in PCPL_CONCEPTS and passed hasCompleteAtomicPayload, so its ONLY problem was the missing DB row forcing it down the wrong (dual-panel) branch instead of the zero-LLM single-panel "strict-engines bypass" (~6396) it was actually built for.',
    prevention_rule:
      'Every PCPL_CONCEPTS-registered (or otherwise atomic-gate-passing) single-panel concept MUST have a concept_panel_config row with default_panel_count=1 — do not rely on the JSON renderer_pair fallback, which assumes any truthy panel_b means panel_b_config was authored. When authoring a new concept whose renderer_pair.panel_b is set but panel_b_config is NOT part of the design, insert the concept_panel_config row (default_panel_count=1) in the SAME session the JSON is authored, mirroring the sibling shape (see current_not_vector/pressure_scalar).',
    probe_type: 'sql',
    probe_logic:
      "SELECT concept_id FROM concept_panel_config WHERE concept_id = 'scalar_vs_vector' AND default_panel_count = 1; -- must return exactly 1 row. Companion regen probe: after clearing simulation_cache WHERE concept_id='scalar_vs_vector' and calling generateSimulation('scalar_vs_vector', ...), the resulting logs must show '[pcpl] strict-engines bypass' and never 'runStage2'/'Dual-panel Stage 2 failed', and the fresh simulation_cache row must have renderer_type='parametric'.",
    status: 'FIXED',
    concepts_affected: ['scalar_vs_vector'],
    fixed_in_files: [
      'supabase_migrations/supabase_2026-07-23_seed_scalar_vs_vector_panel_config_migration.sql',
      'src/scripts/_wpg2_insert_scalar_vs_vector_panel_config.ts',
    ],
    row_type: 'incident',
  },
  {
    bug_class: 'field3d_particle_field_vestigial_dual_panel_config_gap',
    title: '45 CURRENT live-product field_3d/particle_field concepts have NO concept_panel_config row and a vestigial JSON renderer_pair (panel_a===panel_b, e.g. {field_3d, field_3d} or {particle_field, particle_field}) — on any simulation_cache miss, fetchTechnologyConfig()\'s JSON fallback would set panel_count=2 and route them into the mechanics_2d-shaped dual-panel Stage-2 block, which has zero field_3d/particle_field awareness (would feed Sonnet-hallucinated JSON to assembleField3DHtml instead of the authored field_3d_config/particle_field_config — crash risk + a Rule 18 risk stacked on top).',
    severity: 'CRITICAL',
    owner_cluster: 'peter_parker:runtime_generation',
    root_cause:
      'NOT YET FIXED — discovered 2026-07-23 as a side effect of the scalar_vs_vector WP-G2 investigation, out of that dispatch\'s scope (scoped to scalar_vs_vector only). Same mechanism as scalar_vs_vector_missing_panel_config_row: fetchTechnologyConfig() JSON-fallback computes panel_count = renderer_pair.panel_b ? 2 : 1 with NO check that panel_b_config exists or that panel_a !== panel_b. All 45 concepts below declare renderer_pair with panel_a===panel_b (an older authoring template artifact, not genuine dual-panel intent) and have neither panel_b_config nor a concept_panel_config row, so panelCount>1 would fire on any cache miss. Verified quiescent today only because these concepts are near-always served from a warm simulation_cache row (seeded via their own _seed_<id>_cache.ts scripts); the risk activates on the FIRST cache miss after a cache clear (which CLAUDE.md §6 instructs before every test) combined with any runStage2() failure (low credits, malformed Sonnet output, etc.) or, even on a nominal Stage-2 success, a Rule-18 violation (Sonnet inventing field_3d/particle_field config Stage2 was never designed to produce).',
    prevention_rule:
      'Insert a concept_panel_config row (default_panel_count=1, panel_a_renderer/technology_a mirroring the concept\'s existing renderer_pair.panel_a, panel_b_renderer=NULL) for every concept in concepts_affected below, using the same pattern as scalar_vs_vector_missing_panel_config_row. Requires a dedicated follow-up WP (45 rows > this dispatch\'s scope) — do not silently expand an unrelated dispatch to cover it. Going forward: authoring a field_3d_config/particle_field_config concept should insert its concept_panel_config row in the SAME session (mirrors the sibling convention already used for PCPL concepts), not leave it to the JSON-fallback default.',
    probe_type: 'js_eval',
    probe_logic:
      "For each concept_id in concepts_affected: read src/data/concepts/<id>.json, confirm renderer_pair.panel_a === renderer_pair.panel_b (the vestigial marker) and either field_3d_config or particle_field_config is present; then SELECT concept_id FROM concept_panel_config WHERE concept_id = <id> — assert a row EXISTS with default_panel_count = 1. Any concept failing this (no row, or a row with default_panel_count > 1) is exposed to the dual-panel Stage-2 crash/Rule-18 risk on its next cache miss.",
    status: 'OPEN',
    concepts_affected: FIELD3D_PARTICLE_FIELD_AT_RISK,
    fixed_in_files: [],
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
  return `-- 2026-07-23 (WP-G2): scalar_vs_vector concept_panel_config row fix (FIXED) +\n` +
    `-- the wider field_3d/particle_field vestigial-dual-panel routing gap it surfaced (OPEN,\n` +
    `-- needs its own follow-up WP — 45 concepts, out of WP-G2's scope). Generated by\n` +
    `-- src/scripts/_seed_engine_bug_queue_wpg2_panel_config_routing.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files,\n` +
    `  fixed_at = CASE WHEN EXCLUDED.status = 'FIXED' THEN now() ELSE engine_bug_queue.fixed_at END;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-07-23_seed_engine_bug_queue_wpg2_panel_config_routing_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} row(s))`);

  const payload = rows.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ ${rows.length} row(s) upserted (1 FIXED, 1 OPEN)`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
