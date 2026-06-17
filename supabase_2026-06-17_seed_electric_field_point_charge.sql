-- supabase_2026-06-17_seed_electric_field_point_charge.sql
-- Seeds the concept_panel_config row for electric_field_point_charge.json
-- (Class 12 Ch.1 — "Electric Field due to a Point Charge (and its Field Lines)").
-- First electrostatics diamond. Authored 2026-06-17 per the approved architect
-- skeleton. Single-panel field_3d (Three.js) concept routed via
-- CONCEPT_RENDERER_MAP → FIELD_3D_SCENARIO_MAP "point_charge_positive" with the
-- new electric_explorer dual-field path in field_3d_renderer.ts.
--
-- NO drill-down clusters: ships EPIC-L-first (founder directive 2026-06-10).
-- Misconceptions are confronted INSIDE EPIC-L via per-state misconception_watch
-- (STATE_3 sign→direction, STATE_5 density=strength, STATE_6 never-cross /
-- line-is-not-a-path). NO mode_overrides (conceptual-only directive 2026-06-11).
-- This migration touches concept_panel_config only.
--
-- Schema columns (per supabase_vector_addition_panel.sql + jsonModifier.ts:83):
--   concept_id, panel_a_renderer, technology_a, default_panel_count,
--   class_level, chapter.
-- PRIMARY KEY is (concept_id); ON CONFLICT updates idempotently.
-- field_3d → technology 'threejs'.

INSERT INTO concept_panel_config
  (concept_id, panel_a_renderer, technology_a, default_panel_count, class_level, chapter)
VALUES
  ('electric_field_point_charge', 'field_3d', 'threejs', 1, '12', 'Electric Charges and Fields')
ON CONFLICT (concept_id) DO UPDATE SET
  panel_a_renderer    = EXCLUDED.panel_a_renderer,
  technology_a        = EXCLUDED.technology_a,
  default_panel_count = EXCLUDED.default_panel_count,
  class_level         = EXCLUDED.class_level,
  chapter             = EXCLUDED.chapter;

-- Verify:
-- SELECT * FROM concept_panel_config WHERE concept_id = 'electric_field_point_charge';
-- Should return 1 row with panel_a_renderer = 'field_3d', technology_a = 'threejs'.
