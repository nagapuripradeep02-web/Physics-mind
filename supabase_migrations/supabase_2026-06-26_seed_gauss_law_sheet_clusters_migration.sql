-- supabase_2026-06-26_seed_gauss_law_sheet_clusters_migration.sql
-- Seeds confusion_cluster_registry with 3 drill-down clusters for
-- gauss_law_sheet.json (Class 12 Ch.1 §1.15 — Gauss's law applied to an INFINITE
-- PLANE SHEET of uniform surface charge density σ: planar symmetry makes E
-- perpendicular to the sheet, pointing away on BOTH sides and equal everywhere;
-- choose a Gaussian PILLBOX whose curved WALL carries zero flux (E grazes it) so
-- only the two flat CAPS count, Φ = E·A + E·A = 2EA = σA/ε₀; the A cancels,
-- DERIVING E = σ/(2ε₀) — a CONSTANT field that does NOT fall off with distance at
-- all, because the pillbox encloses the same σA patch however far out the caps sit,
-- while a sphere/cylinder keeps growing).
--
-- This is the deliberately INVERTED sibling of gauss_law_line: the FLUX roles swap
-- (CAPS carry the flux, the WALL is zero — the exact inverse of the cylinder), and
-- the FALLOFF is inverted (the sheet's field is CONSTANT, not 1/r). The ½ comes
-- from flux leaving BOTH caps (2EA), so an isolated sheet gives σ/2ε₀, NOT the
-- conductor-surface / between-two-plates σ/ε₀.
--
-- Authored 2026-06-26 by json_author from the physics-author drill-down trigger
-- phrasings (physics block §9).
--
-- Cluster placement (1 cluster per state, on the three hardest states — the
-- founder-locked subset; physics block §9 authored all nine, the strongest of
-- each hard state is seeded here):
--   STATE_4 (the curved WALL carries zero flux — the INVERSE of the wire's caps)  — 1 cluster
--   STATE_5 (why σ/2ε₀ and not σ/ε₀? — the factor of one-half from two caps)       — 1 cluster
--   STATE_6 (why is the field CONSTANT with distance? — the PRIMARY aha)           — 1 cluster
--
-- STATE_4, STATE_5, STATE_6 each carry allow_deep_dive: true in the JSON (the
-- supporting wall-zero-flux beat + the σ/2ε₀-vs-σ/ε₀ confront + the PRIMARY-aha
-- constant-field state flagged by physics-author).
--
-- CUT-LINE GUARD: this concept teaches Gauss's law for the INFINITE PLANE SHEET
-- ONLY. It does NOT teach the charged spherical SHELL (E=0 inside / kq/r² outside,
-- that is gauss_law_sphere), the uniformly charged SOLID sphere (E∝r inside, that
-- is gauss_law_solid_sphere), the infinite LINE / WIRE (E = λ/2πε₀r, 1/r, that is
-- gauss_law_line), finite-sheet edge effects, the bare Gauss statement Φ = q_enc/ε₀
-- (gauss_law), the flux definition Φ = E·A (electric_flux), or — critically — the
-- σ/ε₀ CONDUCTOR-surface / between-two-plates case (a DIFFERENT concept). Any
-- "field of a charged wire/sphere/ball" or "why σ/ε₀ for a conductor" drill-down
-- belongs to those concepts, not here. The clusters below stay on the zero-flux
-- curved wall (inverse of the wire's caps), the one-half from two caps, and the
-- no-falloff / constant field.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description,
--   trigger_examples, status, created_at, updated_at.
-- PRIMARY KEY is (cluster_id). ON CONFLICT (cluster_id) DO UPDATE so re-running
-- this migration re-syncs the label/description/triggers idempotently.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'inverse_of_the_wire_caps',
  'gauss_law_sheet',
  'STATE_4',
  'Why is the sheet the opposite of the wire — caps carry flux, wall is zero?',
  'student is confused that the flux roles swapped from the cylinder: for the wire the curved wall carried the flux and the caps were zero, but for the sheet the two flat caps carry the flux and the curved wall is zero; needs the E-perpendicular-to-the-sheet-so-E-grazes-the-curved-wall (E·dA_wall = 0) argument that leaves only the two caps (2EA)',
  ARRAY[
    'why is the sheet opposite to the wire',
    'for the wire the wall had flux but here the caps why',
    'why did the caps and wall swap from the cylinder',
    'this is backwards from the line charge case',
    'in the wire the caps were zero now the caps carry flux why'
  ],
  'active'
),
(
  'why_one_half_not_sigma_over_eps0',
  'gauss_law_sheet',
  'STATE_5',
  'Why is it σ/2ε₀ and not σ/ε₀? — the factor of one-half',
  'student drops the factor of one-half and writes E = σ/ε₀; needs to see that the flux leaves through BOTH caps (2EA = σA/ε₀ ⇒ E = σ/2ε₀), and that σ/ε₀ is the conductor-surface / between-two-plates case (one cap, field zero inside the conductor) — twice as large',
  ARRAY[
    'why is it sigma over 2 epsilon not sigma over epsilon',
    'where does the factor of half come from',
    'why divide by 2 epsilon zero',
    'why one half in the sheet formula',
    'when is it sigma over epsilon and when sigma over 2 epsilon'
  ],
  'active'
),
(
  'why_field_is_constant_with_distance',
  'gauss_law_sheet',
  'STATE_6',
  'Why is the sheet field constant — why doesn''t it weaken with distance?',
  'student expects the sheet field to fall off with distance like a point charge (1/r²) or a wire (1/r); needs the same-σA-patch-at-any-distance argument (the pillbox always wraps the same enclosed charge however far out the caps sit, while a sphere/cylinder keeps growing), so E depends only on σ and never on distance',
  ARRAY[
    'why does the sheet field not weaken with distance',
    'why is the field constant no matter how far',
    'how can the field be the same everywhere',
    'why doesnt the sheet field fade like a point charge',
    'shouldnt it get weaker far from the sheet'
  ],
  'active'
)
ON CONFLICT (cluster_id) DO UPDATE
  SET concept_id       = EXCLUDED.concept_id,
      state_id         = EXCLUDED.state_id,
      label            = EXCLUDED.label,
      description      = EXCLUDED.description,
      trigger_examples = EXCLUDED.trigger_examples,
      status           = EXCLUDED.status,
      updated_at       = now();

-- Verify:
-- SELECT cluster_id, state_id FROM confusion_cluster_registry
--   WHERE concept_id = 'gauss_law_sheet' ORDER BY state_id, cluster_id;
-- Should return 3 rows (1 STATE_4, 1 STATE_5, 1 STATE_6).
