-- supabase_2026-06-26_seed_gauss_law_solid_sphere.sql
-- Seeds the concept_panel_config row for gauss_law_solid_sphere.json
-- (Class 12 Ch.1 — "Field of a Uniformly Charged Solid Sphere: E ∝ r inside,
-- kq/r² outside"). APPLIES Gauss's law + spherical symmetry to a uniformly
-- charged SOLID (insulating) sphere to solve for E(r): inside (r<R) only the
-- volume fraction q_enc = q·(r/R)³ is enclosed, so E = kq·r/R³ grows LINEARLY
-- from 0 at the centre to the peak kq/R² at the surface; outside (r≥R) E = kq/r²
-- as for a point charge. The two branches meet at r=R (both kq/R²), so the field
-- is CONTINUOUS — no jump, peak AT the surface. SCOPE: the solid ball only — NOT
-- the hollow shell (gauss_law_sphere), the Gauss statement Φ=q_enc/ε₀ (gauss_law),
-- or the flux definition Φ=E·A (electric_flux).
--
-- Authored 2026-06-26. Single-panel field_3d (Three.js) concept routed via
-- CONCEPT_RENDERER_MAP → the existing "gauss_law_sphere" scenario in
-- field_3d_renderer.ts with gauss_sphere.distribution = 'solid' (the engine
-- branch: a linear inside ramp instead of zero, and a continuous peak at r=R
-- instead of a jump). Live r slider with stable explorer id
-- gauss_solid_sphere_explorer.
--
-- Prerequisites gauss_law + electric_flux.
-- NO mode_overrides (conceptual-only directive 2026-06-11).
-- Drill-down clusters ship in the companion *_clusters_migration.sql.
-- This migration touches concept_panel_config only.
--
-- Schema columns (per supabase_2026-06-25_seed_gauss_law_sphere.sql):
--   concept_id, panel_a_renderer, technology_a, default_panel_count,
--   class_level, chapter.
-- PRIMARY KEY is (concept_id); ON CONFLICT updates idempotently.
-- field_3d → technology 'threejs'.

INSERT INTO concept_panel_config
  (concept_id, panel_a_renderer, technology_a, default_panel_count, class_level, chapter)
VALUES
  ('gauss_law_solid_sphere', 'field_3d', 'threejs', 1, '12', 'Electric Charges and Fields')
ON CONFLICT (concept_id) DO UPDATE SET
  panel_a_renderer    = EXCLUDED.panel_a_renderer,
  technology_a        = EXCLUDED.technology_a,
  default_panel_count = EXCLUDED.default_panel_count,
  class_level         = EXCLUDED.class_level,
  chapter             = EXCLUDED.chapter;

-- Verify:
-- SELECT * FROM concept_panel_config WHERE concept_id = 'gauss_law_solid_sphere';
-- Should return 1 row with panel_a_renderer = 'field_3d', technology_a = 'threejs'.
