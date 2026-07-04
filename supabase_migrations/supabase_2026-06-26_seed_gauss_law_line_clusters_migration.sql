-- supabase_2026-06-26_seed_gauss_law_line_clusters_migration.sql
-- Seeds confusion_cluster_registry with 3 drill-down clusters for
-- gauss_law_line.json (Class 12 Ch.1 §1.15 — Gauss's law applied to an INFINITE
-- LINE / WIRE of uniform linear charge density λ: cylindrical symmetry makes E
-- radial and constant on a coaxial ring; choose a coaxial Gaussian CYLINDER whose
-- two flat end caps carry zero flux (E grazes them) so only the curved wall counts,
-- Φ = E·(2πrL) = λL/ε₀; the L cancels, DERIVING E = λ/(2πε₀r) — a field that falls
-- off as 1/r, NOT 1/r² like a point charge, because the cylinder area 2πrL grows
-- LINEARLY with r).
-- Authored 2026-06-26 by json_author from the physics-author drill-down trigger
-- phrasings (physics block §10).
--
-- Cluster placement (1 cluster per state, on the three hardest states — the
-- founder-locked subset; physics block §10 authored all nine, the strongest of
-- each hard state is seeded here):
--   STATE_4 (why do the flat end caps carry zero flux?)                  — 1 cluster
--   STATE_5 (where did L go? — the length cancels)                        — 1 cluster
--   STATE_6 (why 1/r and not 1/r²? — the PRIMARY aha)                     — 1 cluster
--
-- STATE_4, STATE_5, STATE_6 each carry allow_deep_dive: true in the JSON (the two
-- supporting confusion hotspots + the PRIMARY-aha state flagged by physics-author).
--
-- CUT-LINE GUARD: this concept teaches Gauss's law for the INFINITE LINE / WIRE
-- ONLY. It does NOT teach the charged spherical SHELL (E=0 inside / kq/r² outside,
-- that is gauss_law_sphere), the uniformly charged SOLID sphere (E∝r inside, that
-- is gauss_law_solid_sphere), the infinite plane/sheet, finite-line end effects,
-- the bare Gauss statement Φ = q_enc/ε₀ (gauss_law), or the flux definition
-- Φ = E·A (electric_flux). Any "field inside/outside a charged sphere/ball/shell"
-- or "field of a charged sheet/plane" drill-down belongs to those concepts, not
-- here. The clusters below stay on the zero-flux end caps, the L-cancellation, and
-- the 1/r-vs-1/r² falloff.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description,
--   trigger_examples, status, created_at, updated_at.
-- PRIMARY KEY is (cluster_id). ON CONFLICT (cluster_id) DO UPDATE so re-running
-- this migration re-syncs the label/description/triggers idempotently.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'why_caps_zero_flux',
  'gauss_law_line',
  'STATE_4',
  'Why do the two flat end caps carry zero flux?',
  'student thinks the end caps of the Gaussian cylinder carry flux too; needs the E-radial-so-E-grazes-the-cap (E·dA = 0) argument that leaves only the curved wall',
  ARRAY[
    'why do the end caps have zero flux',
    'why no flux through the flat ends of cylinder',
    'do the top and bottom of the gaussian cylinder count',
    'why we ignore the two circle faces',
    'shouldnt the caps also have field passing'
  ],
  'active'
),
(
  'where_did_L_go',
  'gauss_law_line',
  'STATE_5',
  'Where did L go? — the cylinder height cancels out',
  'student is confused that the height L disappears from E; needs to see that q_enc = λL and the wall area 2πrL both scale with L, so L divides out',
  ARRAY[
    'where did L go in the formula',
    'why L cancels out',
    'why is there no L in E equation',
    'the height L just disappeared how',
    'what happened to length L'
  ],
  'active'
),
(
  'why_1_over_r_not_r_squared',
  'gauss_law_line',
  'STATE_6',
  'Why is it 1/r and not 1/r² like a point charge?',
  'student expects the wire field to fall off as 1/r² like a point charge; needs the cylinder-area-grows-linearly (2πrL ∝ r) vs sphere-area-grows-quadratically (4πr² ∝ r²) contrast',
  ARRAY[
    'why is it 1 by r not 1 by r squared',
    'why line charge is not inverse square',
    'why does wire fall off slower than point charge',
    'shouldnt it be r squared like coulomb',
    'why 1 over r for wire but 1 over r2 for point'
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
--   WHERE concept_id = 'gauss_law_line' ORDER BY state_id, cluster_id;
-- Should return 3 rows (1 STATE_4, 1 STATE_5, 1 STATE_6).
