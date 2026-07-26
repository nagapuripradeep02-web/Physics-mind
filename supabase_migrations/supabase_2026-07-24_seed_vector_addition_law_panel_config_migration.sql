-- ============================================================
-- vector_addition_law — concept_panel_config routing row
-- (authored-not-applied via the SQL editor convention; already
-- APPLIED via src/scripts/_insert_vector_addition_law_panel_config.ts
-- using supabaseAdmin, since the Supabase MCP needs interactive
-- OAuth and won't run headless — see reference_visual_gate_ops memory).
-- ============================================================
--
-- WHY: jsonModifier.ts fetchTechnologyConfig() (~lines 79-99) reads
-- concept_panel_config.default_panel_count FIRST. vector_addition_law's
-- JSON declares renderer_pair.panel_b = "graph_interactive" with no
-- panel_b_config ever authored (Panel B is NOT rendered for this concept)
-- — so without this row, generateSimulation() would route it dual-panel,
-- hit the runStage2() Sonnet call, and crash whenever the LLM call fails
-- (exactly the scalar_vs_vector_missing_panel_config_row defect class,
-- which already bit the sibling concept in this same session).
--
-- FIX: default_panel_count = 1 makes `panelCount > 1` false, so the entire
-- dual-panel block is skipped. Execution falls through to the
-- "strict-engines bypass" → PCPL_CONCEPTS.has('vector_addition_law')
-- (aiSimulationGenerator.ts PCPL_CONCEPTS set) → assembleParametricHtml(),
-- zero-LLM. panel_a_renderer/technology_a values below are NOT what
-- selects that path (PCPL_CONCEPTS membership is) — they mirror the
-- concept's own JSON renderer_pair.panel_a ("mechanics_2d") and the
-- closest sibling row (scalar_vs_vector — same "Vectors" DAG track,
-- identical renderer_pair shape, same missing-panel_b_config defect
-- fixed this exact way).
--
-- Rule 18 unaffected: this only changes generation-time routing (Sonnet
-- Stage 2 is never invoked either way for the PCPL bypass path); serving
-- stays zero-LLM/cache-first in both cases.

INSERT INTO concept_panel_config
  (concept_id, default_panel_count, panel_a_renderer, panel_b_renderer,
   panel_c_renderer, sonnet_can_upgrade, upgrade_max, verified_by_human,
   reasoning, technology_a, technology_b, sync_required, class_level, chapter)
VALUES
  ('vector_addition_law', 1, 'mechanics_2d', NULL,
   NULL, false, 1, false,
   'Same defect class as scalar_vs_vector_missing_panel_config_row: JSON renderer_pair.panel_b="graph_interactive" has no panel_b_config authored, which would crash the dual-panel Stage-2 Sonnet path. default_panel_count=1 forces the zero-LLM single-panel PCPL bypass (PCPL_CONCEPTS membership) instead — mirrors scalar_vs_vector, current_not_vector, pressure_scalar.',
   'p5js', NULL, false, 11, '1')
ON CONFLICT (concept_id) DO UPDATE SET
  default_panel_count = EXCLUDED.default_panel_count,
  panel_a_renderer = EXCLUDED.panel_a_renderer,
  panel_b_renderer = EXCLUDED.panel_b_renderer,
  panel_c_renderer = EXCLUDED.panel_c_renderer,
  sonnet_can_upgrade = EXCLUDED.sonnet_can_upgrade,
  upgrade_max = EXCLUDED.upgrade_max,
  verified_by_human = EXCLUDED.verified_by_human,
  reasoning = EXCLUDED.reasoning,
  technology_a = EXCLUDED.technology_a,
  technology_b = EXCLUDED.technology_b,
  sync_required = EXCLUDED.sync_required,
  class_level = EXCLUDED.class_level,
  chapter = EXCLUDED.chapter;

-- Verify:
-- SELECT * FROM concept_panel_config WHERE concept_id = 'vector_addition_law';
-- Should return 1 row with default_panel_count = 1, panel_a_renderer = 'mechanics_2d'.
