-- supabase_2026-06-24_seed_charge_distribution_clusters_migration.sql
-- Seeds confusion_cluster_registry with 7 drill-down clusters for
-- charge_distribution.json (Class 12 Ch.1 — continuous charge distributions
-- λ/σ/ρ + the dq-superposition idea). Authored 2026-06-24 by json_author from
-- the physics-author drill-down trigger phrasings.
--
-- Cluster placement:
--   STATE_5 (each piece is a point charge, dE = k·dq/r²) — 3 clusters
--   STATE_6 (E = Σ dE → ∫ dE, the PRIMARY aha) — 3 clusters
--   Concept-level (anchored to STATE_4, the unifying λ/σ/ρ line) — 1 cluster
--
-- STATE_5 + STATE_6 carry allow_deep_dive: true in the JSON.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description,
--   trigger_examples, status, created_at, updated_at.
-- PRIMARY KEY is (cluster_id). ON CONFLICT (cluster_id) DO NOTHING per the
-- json_author output contract for this concept (idempotent, additive-only).

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'dq_is_not_a_real_point',
  'charge_distribution',
  'STATE_5',
  'But dq is a chunk with size — how can it be a point charge?',
  'Student resists treating a finite piece of the body as a point charge because it has physical extent, and cannot accept the idealisation that lets dE = k·dq/r² apply to each element.',
  ARRAY[
    'but dq is not actually a point charge',
    'how can a piece of a rod be a point charge',
    'a chunk has size so its not a point',
    'is dq real or just imaginary',
    'why do we pretend each piece is a point'
  ],
  'pending_review'
),
(
  'de_direction_confusion',
  'charge_distribution',
  'STATE_5',
  'Which way does dE point — along the body or out to P?',
  'Student is unsure of the direction of a single element''s field, confusing the radial-from-the-piece direction (toward P) with a direction along the rod or along the surface.',
  ARRAY[
    'which way does dE point',
    'does the small field point along the rod',
    'why does dE go to P and not sideways',
    'does each piece field point away from the piece',
    'is dE radial or along the surface'
  ],
  'pending_review'
),
(
  'infinitesimal_meaning',
  'charge_distribution',
  'STATE_5',
  'What does dl / dq actually mean — how small is it?',
  'Student does not grasp the meaning of the infinitesimal element: what dl stands for, how small dq is, and why we can take an arbitrarily small piece of charge.',
  ARRAY[
    'what does dl actually mean',
    'is dq a tiny bit of charge',
    'what is the smallest piece you can take',
    'what does the d in dq stand for',
    'how small is dl supposed to be'
  ],
  'pending_review'
),
(
  'why_not_kq_total',
  'charge_distribution',
  'STATE_6',
  'Why isn''t the field just kQ_total/r² at the centre?',
  'Student keeps reaching for the point-charge formula with the total charge, not seeing why an extended body near P cannot be collapsed to a single central point charge.',
  ARRAY[
    'why isnt it just kQ over r squared',
    'why cant i use total charge at the centre',
    'why doesnt the rod act like one point charge',
    'when can i treat it as a point charge',
    'why is the real field different from kQ/r2'
  ],
  'pending_review'
),
(
  'sum_vs_integral',
  'charge_distribution',
  'STATE_6',
  'Why does the sum Σ dE become an integral ∫ dE?',
  'Student does not see the integral as the continuum limit of the discrete vector sum as each element shrinks to zero — treats Σ and ∫ as unrelated operations.',
  ARRAY[
    'why does the sum become an integral',
    'whats the difference between sigma dE and integral dE',
    'why integrate instead of just add',
    'when do i use sum and when integral',
    'is the integral just adding all the pieces'
  ],
  'pending_review'
),
(
  'vector_sum_not_scalar',
  'charge_distribution',
  'STATE_6',
  'Why can''t I just add the dE magnitudes as numbers?',
  'Student adds the element fields as scalars and is surprised the net field is shorter than the plain sum — has not internalised that dE arrows add as vectors, head-to-tail, with directions that partly cancel.',
  ARRAY[
    'do i just add the dE values',
    'why cant i add the field magnitudes',
    'why is net field less than the sum',
    'do the arrows add like numbers',
    'why does direction matter when adding fields'
  ],
  'pending_review'
),
(
  'why_three_densities',
  'charge_distribution',
  'STATE_4',
  'Why are there three densities — when do I use λ vs σ vs ρ?',
  'Concept-level confusion: the student conflates λ, σ, ρ as the same idea and cannot decide which one a given body needs, missing that the unit (C/m vs C/m² vs C/m³) is set by whether the charge is spread along a length, a surface, or a volume.',
  ARRAY[
    'why are there three different densities',
    'whats the difference between lambda sigma and rho',
    'when do i use sigma vs rho',
    'are lambda sigma and rho the same thing',
    'why not just one charge density formula'
  ],
  'pending_review'
)
ON CONFLICT (cluster_id) DO NOTHING;

-- Verify:
-- SELECT cluster_id, state_id FROM confusion_cluster_registry
--   WHERE concept_id = 'charge_distribution' ORDER BY state_id, cluster_id;
-- Should return 7 rows (3 STATE_5, 3 STATE_6, 1 STATE_4).
