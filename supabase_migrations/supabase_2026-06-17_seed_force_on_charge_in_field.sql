-- supabase_2026-06-17_seed_force_on_charge_in_field.sql
-- Seeds the concept_panel_config row for force_on_charge_in_field.json
-- (Class 12 Ch.1 — "Force on a Charge in an Electric Field, F = qE").
-- Companion/inverse of electric_field_point_charge (that one BUILDS the field;
-- this one FEELS it). Authored 2026-06-17. Single-panel field_3d (Three.js)
-- concept routed via CONCEPT_RENDERER_MAP → the new uniform_field_force scenario
-- in field_3d_renderer.ts (force_field_explorer path: uniform plate field,
-- constant force F = qE, parabolic deflection of a launched charge, a = qE/m).
--
-- NO drill-down clusters: ships EPIC-L-first (founder directive 2026-06-10).
-- Misconceptions are confronted INSIDE EPIC-L via per-state misconception_watch
-- (STATE_2 sign→direction, STATE_5 force-direction ≠ motion-direction / parabola,
-- STATE_6 same force / different mass). NO mode_overrides (conceptual-only
-- directive 2026-06-11). This migration touches concept_panel_config only.
--
-- Schema columns (per supabase_2026-06-17_seed_electric_field_point_charge.sql):
--   concept_id, panel_a_renderer, technology_a, default_panel_count,
--   class_level, chapter.
-- PRIMARY KEY is (concept_id); ON CONFLICT updates idempotently.
-- field_3d → technology 'threejs'.

INSERT INTO concept_panel_config
  (concept_id, panel_a_renderer, technology_a, default_panel_count, class_level, chapter)
VALUES
  ('force_on_charge_in_field', 'field_3d', 'threejs', 1, '12', 'Electric Charges and Fields')
ON CONFLICT (concept_id) DO UPDATE SET
  panel_a_renderer    = EXCLUDED.panel_a_renderer,
  technology_a        = EXCLUDED.technology_a,
  default_panel_count = EXCLUDED.default_panel_count,
  class_level         = EXCLUDED.class_level,
  chapter             = EXCLUDED.chapter;

-- Verify:
-- SELECT * FROM concept_panel_config WHERE concept_id = 'force_on_charge_in_field';
-- Should return 1 row with panel_a_renderer = 'field_3d', technology_a = 'threejs'.
