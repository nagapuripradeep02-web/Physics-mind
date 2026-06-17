-- supabase_2026-06-16_seed_force_on_current_carrying_wire.sql
-- Seeds the concept_panel_config row for force_on_current_carrying_wire.json
-- (concept A15, Ch.36 — "Magnetic Force on a Current-Carrying Wire, F = I L × B").
-- Authored 2026-06-16 by alex:json_author per the approved architect skeleton +
-- physics block. Mirrors the sibling diamond magnetic_force_moving_charge:
-- a single-panel field_3d (Three.js) concept routed via CONCEPT_RENDERER_MAP.
--
-- NO drill-down clusters: this concept ships EPIC-L-first (founder directive
-- 2026-06-10). Misconceptions are confronted INSIDE EPIC-L via per-state
-- misconception_watch (STATE_4 angle-trap, STATE_5 bent-wire, STATE_6
-- closed-loop). confusion_cluster_registry rows are authored only once real
-- student confusion data exists, so this migration touches concept_panel_config
-- only.
--
-- Schema columns (per supabase_vector_addition_panel.sql + jsonModifier.ts:83):
--   concept_id, panel_a_renderer, technology_a, default_panel_count,
--   class_level, chapter.
-- PRIMARY KEY is (concept_id); ON CONFLICT updates idempotently.
-- field_3d → technology 'threejs' (aiSimulationGenerator.ts:6320 maps
-- rendererTypeForCache 'field_3d' to engine 'threejs').

INSERT INTO concept_panel_config
  (concept_id, panel_a_renderer, technology_a, default_panel_count, class_level, chapter)
VALUES
  ('force_on_current_carrying_wire', 'field_3d', 'threejs', 1, '12', 'Moving Charges and Magnetism')
ON CONFLICT (concept_id) DO UPDATE SET
  panel_a_renderer    = EXCLUDED.panel_a_renderer,
  technology_a        = EXCLUDED.technology_a,
  default_panel_count = EXCLUDED.default_panel_count,
  class_level         = EXCLUDED.class_level,
  chapter             = EXCLUDED.chapter;

-- Verify:
-- SELECT * FROM concept_panel_config WHERE concept_id = 'force_on_current_carrying_wire';
-- Should return 1 row with panel_a_renderer = 'field_3d', technology_a = 'threejs'.
