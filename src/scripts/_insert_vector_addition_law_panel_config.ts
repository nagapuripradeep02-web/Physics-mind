/**
 * One-off insert of the concept_panel_config row for vector_addition_law —
 * mirrors src/scripts/_wpg2_insert_scalar_vs_vector_panel_config.ts exactly
 * (same "vectors" family, same defect class documented as
 * scalar_vs_vector_missing_panel_config_row in engine_bug_queue).
 *
 * WHY: jsonModifier.ts fetchTechnologyConfig() reads concept_panel_config
 * FIRST; with no row, it falls back to the JSON's renderer_pair
 * (panel_b: "graph_interactive") with no panel_b_config ever authored,
 * routing generateSimulation() into the dual-panel Stage-2 Sonnet path,
 * which throws whenever the LLM call fails. default_panel_count=1 routes
 * it down the zero-LLM single-panel PCPL bypass instead (PCPL_CONCEPTS
 * membership in aiSimulationGenerator.ts governs the actual renderer
 * choice independent of panel_a_renderer's value).
 *
 * Idempotent: ON CONFLICT (concept_id) DO UPDATE.
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

async function main(): Promise<void> {
  const row = {
    concept_id: 'vector_addition_law',
    default_panel_count: 1,
    panel_a_renderer: 'mechanics_2d',
    panel_b_renderer: null,
    panel_c_renderer: null,
    sonnet_can_upgrade: false,
    upgrade_max: 1,
    verified_by_human: false,
    reasoning:
      'Same defect class as scalar_vs_vector_missing_panel_config_row: JSON ' +
      'renderer_pair.panel_b="graph_interactive" has no panel_b_config authored, ' +
      'which would crash the dual-panel Stage-2 Sonnet path. ' +
      'default_panel_count=1 forces the zero-LLM single-panel PCPL bypass ' +
      '(PCPL_CONCEPTS membership) instead — mirrors scalar_vs_vector, ' +
      'current_not_vector, pressure_scalar.',
    technology_a: 'p5js',
    technology_b: null,
    sync_required: false,
    class_level: 11,
    chapter: '1',
  };

  const { data, error } = await supabaseAdmin
    .from('concept_panel_config')
    .upsert(row, { onConflict: 'concept_id' })
    .select('*');

  if (error) {
    console.error('[insert] failed:', error.message);
    process.exit(1);
  }
  console.log('[insert] inserted/updated row:', JSON.stringify(data, null, 2));
}

main().catch((err) => {
  console.error('[insert] fatal:', err instanceof Error ? err.stack : err);
  process.exit(1);
});
