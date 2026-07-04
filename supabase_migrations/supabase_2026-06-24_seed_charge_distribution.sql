-- supabase_2026-06-24_seed_charge_distribution.sql
-- Seeds the concept_panel_config row for charge_distribution.json
-- (Class 12 Ch.1 — "Charge Densities (λ, σ, ρ) and the dq-Superposition Idea").
-- Continuous charge distributions: linear λ (C/m), surface σ (C/m²), volume
-- ρ (C/m³) charge density + the dq-superposition idea — an extended body's
-- field is NOT kQ/r² of a point at its centre; each piece dq is a Coulomb
-- point charge dE = k·dq/r², and the body's field is the vector sum
-- E = Σ dE → ∫ dE.
--
-- Authored 2026-06-24. Single-panel field_3d (Three.js) concept routed via
-- CONCEPT_RENDERER_MAP → the new unified "charge_distribution" scenario in
-- field_3d_renderer.ts: ONE morphing body (rod → sheet → solid) with dq
-- highlights, a field point P, and dynamic ghost / dE / net-E arrows driven
-- by per-state charge_dist flags.
--
-- Prerequisites coulombs_law + electric_field_point_charge.
-- NO mode_overrides (conceptual-only directive 2026-06-11).
-- Drill-down clusters ship in the companion *_clusters_migration.sql.
-- This migration touches concept_panel_config only.
--
-- Schema columns (per supabase_2026-06-23_seed_coulombs_law.sql):
--   concept_id, panel_a_renderer, technology_a, default_panel_count,
--   class_level, chapter.
-- PRIMARY KEY is (concept_id); ON CONFLICT updates idempotently.
-- field_3d → technology 'threejs'.

INSERT INTO concept_panel_config
  (concept_id, panel_a_renderer, technology_a, default_panel_count, class_level, chapter)
VALUES
  ('charge_distribution', 'field_3d', 'threejs', 1, '12', 'Electric Charges and Fields')
ON CONFLICT (concept_id) DO UPDATE SET
  panel_a_renderer    = EXCLUDED.panel_a_renderer,
  technology_a        = EXCLUDED.technology_a,
  default_panel_count = EXCLUDED.default_panel_count,
  class_level         = EXCLUDED.class_level,
  chapter             = EXCLUDED.chapter;

-- Verify:
-- SELECT * FROM concept_panel_config WHERE concept_id = 'charge_distribution';
-- Should return 1 row with panel_a_renderer = 'field_3d', technology_a = 'threejs'.
