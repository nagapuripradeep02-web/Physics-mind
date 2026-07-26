/**
 * WP-G2 (PCPL hardening plan, 2026-07-23) — one-off insert of the missing
 * concept_panel_config row for scalar_vs_vector.
 *
 * WHY: jsonModifier.ts fetchTechnologyConfig() reads concept_panel_config
 * FIRST; with no row, it falls back to the JSON's renderer_pair
 * (panel_b: "graph_interactive") with no panel_b_config ever authored,
 * routing generateSimulation() into the dual-panel Stage-2 Sonnet path,
 * which throws "Dual-panel Stage 2 failed..." whenever the LLM call fails
 * (e.g. low API credits). default_panel_count=1 routes it down the
 * zero-LLM single-panel PCPL bypass instead (PCPL_CONCEPTS membership in
 * aiSimulationGenerator.ts governs the actual renderer choice independent
 * of panel_a_renderer's value).
 *
 * Row shape mirrors the closest siblings (current_not_vector,
 * pressure_scalar — same "vectors vs scalars" family, same
 * renderer_pair = {panel_a: mechanics_2d, panel_b: graph_interactive}
 * JSON shape with no panel_b_config authored, same fix pattern already
 * applied to them), adapted with this concept's own class_level/chapter.
 *
 * Idempotent: ON CONFLICT (concept_id) DO UPDATE, mirroring
 * supabase_vector_addition_panel.sql / supabase_cleanup_and_migrations.sql.
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

async function main(): Promise<void> {
  const row = {
    concept_id: 'scalar_vs_vector',
    default_panel_count: 1,
    panel_a_renderer: 'mechanics_2d',
    panel_b_renderer: null,
    panel_c_renderer: null,
    sonnet_can_upgrade: false,
    upgrade_max: 1,
    verified_by_human: false,
    reasoning:
      'WP-G2 (2026-07-23): JSON renderer_pair.panel_b="graph_interactive" has ' +
      'no panel_b_config authored, which crashed the dual-panel Stage-2 Sonnet ' +
      'path (engine_bug_queue: scalar_vs_vector_missing_panel_config_row). ' +
      'default_panel_count=1 forces the zero-LLM single-panel PCPL bypass ' +
      '(PCPL_CONCEPTS membership) instead — mirrors current_not_vector / ' +
      'pressure_scalar, the same-family concepts already fixed this way.',
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
    console.error('[wp-g2] insert failed:', error.message);
    process.exit(1);
  }
  console.log('[wp-g2] inserted/updated row:', JSON.stringify(data, null, 2));
}

main().catch((err) => {
  console.error('[wp-g2] fatal:', err instanceof Error ? err.stack : err);
  process.exit(1);
});
