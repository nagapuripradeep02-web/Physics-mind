-- supabase_2026-06-25_seed_gauss_law.sql
-- Seeds the concept_panel_config row for gauss_law.json
-- (Class 12 Ch.1 — "Gauss's Law: Φ = q_enc/ε₀").
-- Gauss's law STATEMENT: the net electric flux through ANY closed surface
-- equals the enclosed charge divided by the permittivity of free space,
-- Φ = q_enc/ε₀, with ε₀ = 8.854×10⁻¹² C²/(N·m²) a fixed constant of nature.
-- The value is set ONLY by q_enc and is independent of the closed (Gaussian)
-- surface's shape or size; a charge outside contributes exactly zero; and
-- q_enc is the signed algebraic sum Σ qᵢ. STATEMENT only — no E-from-symmetry
-- derivation (that is deferred to gauss_law_sphere etc.).
--
-- Authored 2026-06-25. Single-panel field_3d (Three.js) concept routed via
-- CONCEPT_RENDERER_MAP → the new "gauss_law" scenario in field_3d_renderer.ts:
-- a closed-surface morph (sphere → cube → blob) with the readout pinned at
-- q_enc/ε₀, inside/outside charge, a signed multi-charge sum, and a live
-- Φ = q_enc/ε₀ readout driven by per-state gauss flags. Reuses the eflux
-- closed-surface machinery but flips the net-flux label from "∝ q_enc" to
-- "= q_enc/ε₀" and writes ε₀ on-canvas from STATE_2 (this intentionally
-- inverts electric_flux's "no ε₀" cut-line guard — architect FLAG #1).
--
-- Prerequisites electric_flux + charge_distribution.
-- NO mode_overrides (conceptual-only directive 2026-06-11).
-- Drill-down clusters ship in the companion *_clusters_migration.sql.
-- This migration touches concept_panel_config only.
--
-- Schema columns (per supabase_2026-06-24_seed_charge_distribution.sql):
--   concept_id, panel_a_renderer, technology_a, default_panel_count,
--   class_level, chapter.
-- PRIMARY KEY is (concept_id); ON CONFLICT updates idempotently.
-- field_3d → technology 'threejs'.

INSERT INTO concept_panel_config
  (concept_id, panel_a_renderer, technology_a, default_panel_count, class_level, chapter)
VALUES
  ('gauss_law', 'field_3d', 'threejs', 1, '12', 'Electric Charges and Fields')
ON CONFLICT (concept_id) DO UPDATE SET
  panel_a_renderer    = EXCLUDED.panel_a_renderer,
  technology_a        = EXCLUDED.technology_a,
  default_panel_count = EXCLUDED.default_panel_count,
  class_level         = EXCLUDED.class_level,
  chapter             = EXCLUDED.chapter;

-- Verify:
-- SELECT * FROM concept_panel_config WHERE concept_id = 'gauss_law';
-- Should return 1 row with panel_a_renderer = 'field_3d', technology_a = 'threejs'.
