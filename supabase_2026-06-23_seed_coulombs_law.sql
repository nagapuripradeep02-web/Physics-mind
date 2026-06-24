-- supabase_2026-06-23_seed_coulombs_law.sql
-- Seeds the concept_panel_config row for coulombs_law.json
-- (Class 12 Ch.1 — "Coulomb's Law — Force Between Two Point Charges").
-- The FOUNDATION of the electrostatics family + the prerequisite the three
-- existing electrostatics diamonds (electric_field_point_charge,
-- force_on_charge_in_field, electric_field_dipole) already point back to.
-- Authored 2026-06-23. Single-panel field_3d (Three.js) concept routed via
-- CONCEPT_RENDERER_MAP → FIELD_3D_SCENARIO_MAP "coulombs_law_force" (new
-- scenario in field_3d_renderer.ts: two-charge equal-and-opposite force pair,
-- sign→attract/repel, 1/r² falloff, ∝q₁q₂, vector form, superposition).
--
-- VACUUM law only — the dielectric-medium / K-factor (F = F_vacuum/K) ships as a
-- SEPARATE simulation per founder decision (2026-06-23).
--
-- NO drill-down clusters: ships EPIC-L-first (founder directive 2026-06-10).
-- Misconceptions are confronted INSIDE EPIC-L via per-state misconception_watch.
-- NO mode_overrides (conceptual-only directive 2026-06-11).
-- This migration touches concept_panel_config only.
--
-- Schema columns (per supabase_2026-06-17_seed_electric_field_point_charge.sql):
--   concept_id, panel_a_renderer, technology_a, default_panel_count,
--   class_level, chapter.
-- PRIMARY KEY is (concept_id); ON CONFLICT updates idempotently.
-- field_3d → technology 'threejs'.

INSERT INTO concept_panel_config
  (concept_id, panel_a_renderer, technology_a, default_panel_count, class_level, chapter)
VALUES
  ('coulombs_law', 'field_3d', 'threejs', 1, '12', 'Electric Charges and Fields')
ON CONFLICT (concept_id) DO UPDATE SET
  panel_a_renderer    = EXCLUDED.panel_a_renderer,
  technology_a        = EXCLUDED.technology_a,
  default_panel_count = EXCLUDED.default_panel_count,
  class_level         = EXCLUDED.class_level,
  chapter             = EXCLUDED.chapter;

-- Verify:
-- SELECT * FROM concept_panel_config WHERE concept_id = 'coulombs_law';
-- Should return 1 row with panel_a_renderer = 'field_3d', technology_a = 'threejs'.
