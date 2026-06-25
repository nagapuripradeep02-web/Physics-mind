-- supabase_2026-06-25_seed_gauss_law_sphere.sql
-- Seeds the concept_panel_config row for gauss_law_sphere.json
-- (Class 12 Ch.1 — "Field of a Charged Spherical Shell: E=0 inside, kq/r² outside").
-- APPLIES Gauss's law + spherical symmetry to a uniformly charged spherical
-- SHELL to solve for the field E(r): exactly zero everywhere inside (r<R,
-- q_enc=0) and exactly the point-charge field kq/r² = q/(4πε₀r²) outside
-- (r≥R, full charge enclosed). r is measured from the CENTRE; the external
-- field is independent of the shell radius R; E jumps from 0 to the peak
-- kq/R² across the surface. SCOPE: the charged shell only — NOT the Gauss
-- statement Φ=q_enc/ε₀ (gauss_law) and NOT the flux definition Φ=E·A
-- (electric_flux).
--
-- Authored 2026-06-25. Single-panel field_3d (Three.js) concept routed via
-- CONCEPT_RENDERER_MAP → the NEW "gauss_law_sphere" scenario in
-- field_3d_renderer.ts (architect FLAG #R1 — engine work for
-- peter_parker:renderer-primitives, routed via quality-auditor FAIL; THE EYE
-- fails until that scenario ships): a concentric charged shell at radius R, an
-- expandable concentric Gaussian sphere of adjustable r (inside or outside),
-- radial E-arrows that vanish inside and follow 1/r² outside, an E-magnitude
-- readout switching regime at r=R (0 inside, kq/r² outside), an E-vs-r plot for
-- STATE_6, and a STATE_7 r slider with stable explorer id gauss_sphere_explorer.
--
-- Prerequisites gauss_law + electric_flux.
-- NO mode_overrides (conceptual-only directive 2026-06-11).
-- Drill-down clusters ship in the companion *_clusters_migration.sql.
-- This migration touches concept_panel_config only.
--
-- Schema columns (per supabase_2026-06-25_seed_gauss_law.sql):
--   concept_id, panel_a_renderer, technology_a, default_panel_count,
--   class_level, chapter.
-- PRIMARY KEY is (concept_id); ON CONFLICT updates idempotently.
-- field_3d → technology 'threejs'.

INSERT INTO concept_panel_config
  (concept_id, panel_a_renderer, technology_a, default_panel_count, class_level, chapter)
VALUES
  ('gauss_law_sphere', 'field_3d', 'threejs', 1, '12', 'Electric Charges and Fields')
ON CONFLICT (concept_id) DO UPDATE SET
  panel_a_renderer    = EXCLUDED.panel_a_renderer,
  technology_a        = EXCLUDED.technology_a,
  default_panel_count = EXCLUDED.default_panel_count,
  class_level         = EXCLUDED.class_level,
  chapter             = EXCLUDED.chapter;

-- Verify:
-- SELECT * FROM concept_panel_config WHERE concept_id = 'gauss_law_sphere';
-- Should return 1 row with panel_a_renderer = 'field_3d', technology_a = 'threejs'.
