-- supabase_2026-06-25_seed_gauss_law_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 drill-down clusters for gauss_law.json
-- (Class 12 Ch.1 — Gauss's law statement Φ = q_enc/ε₀). Authored 2026-06-25 by
-- json_author from the physics-author drill-down trigger phrasings
-- (physics block §"drill-down trigger phrases").
--
-- Cluster placement:
--   STATE_2 (the constant is 1/ε₀: Φ = q_enc/ε₀) — 3 clusters
--     epsilon_naught_identity, why_one_over_epsilon, flux_units_and_value
--   STATE_3 (any closed/Gaussian surface — same q_enc/ε₀, the PRIMARY aha) — 3 clusters
--     surface_shape_independence, what_is_a_gaussian_surface, bigger_surface_same_flux
--
-- STATE_2 and STATE_3 carry has_prebuilt_deep_dive: true + allow_deep_dive: true
-- in the JSON.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description,
--   trigger_examples, status, created_at, updated_at.
-- PRIMARY KEY is (cluster_id). ON CONFLICT (cluster_id) DO UPDATE so re-running
-- this migration re-syncs the label/description/triggers idempotently.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'epsilon_naught_identity',
  'gauss_law',
  'STATE_2',
  'What exactly is ε₀ (epsilon-nought)?',
  'Student does not know what the constant ε₀ is — whether it is a fixed number, where it comes from, or whether it can change with the surface or the medium. Answer: ε₀ is the permittivity of free space, one fixed constant of nature 8.854×10⁻¹².',
  ARRAY[
    'what is epsilon naught',
    'what does epsilon zero mean in gauss law',
    'is epsilon naught a constant or does it change',
    'where does epsilon naught come from',
    'what is the permittivity of free space'
  ],
  'active'
),
(
  'why_one_over_epsilon',
  'gauss_law',
  'STATE_2',
  'Why is the constant 1/ε₀ and not just 1?',
  'Student accepts that net flux is proportional to the enclosed charge but cannot see why the proportionality constant is one over ε₀ specifically, rather than the flux simply equalling the charge.',
  ARRAY[
    'why is the constant one over epsilon naught',
    'why divide by epsilon naught and not just equal the charge',
    'why isnt net flux just equal to q enclosed',
    'where does the one over epsilon come from in gauss law',
    'why is there a constant in front of the charge at all'
  ],
  'active'
),
(
  'flux_units_and_value',
  'gauss_law',
  'STATE_2',
  'What are the units of flux and what number does q_enc/ε₀ give?',
  'Student is unsure what units electric flux carries and how to actually compute the numerical value of q_enc/ε₀ from a charge — confusing the demo readout with the true flux value.',
  ARRAY[
    'what are the units of electric flux',
    'how do i calculate q over epsilon naught',
    'what number does the flux come out to',
    'what is the unit of gauss law flux',
    'how do i get the actual value of net flux from the charge'
  ],
  'active'
),
(
  'surface_shape_independence',
  'gauss_law',
  'STATE_3',
  'Why doesn''t the shape of the surface change the net flux?',
  'Student expects the net flux to depend on the closed surface''s shape, not seeing that any closed surface around the same enclosed charge gives the identical q_enc/ε₀.',
  ARRAY[
    'why doesnt the shape of the surface matter',
    'why is the flux the same for a sphere and a cube',
    'how can a lumpy surface give the same flux as a sphere',
    'why doesnt changing the surface shape change the flux',
    'does the surface shape affect the net flux'
  ],
  'active'
),
(
  'what_is_a_gaussian_surface',
  'gauss_law',
  'STATE_3',
  'What exactly is a Gaussian surface?',
  'Student does not know what a Gaussian surface is — whether it is a real physical object, whether it must be a sphere, or whether it is just an imagined closed surface chosen for convenience.',
  ARRAY[
    'what is a gaussian surface',
    'is a gaussian surface a real thing or imaginary',
    'does a gaussian surface have to be a sphere',
    'do i get to choose the gaussian surface',
    'what counts as a gaussian surface'
  ],
  'active'
),
(
  'bigger_surface_same_flux',
  'gauss_law',
  'STATE_3',
  'Doesn''t a bigger surface catch more (or less) flux?',
  'Student believes a larger or more spread-out closed surface should capture more net flux (more area) or less (the flux spreads thinner), not seeing that size makes no difference — only the enclosed charge does.',
  ARRAY[
    'doesnt a bigger surface catch more flux',
    'shouldnt a larger box have more net flux',
    'does the flux spread thinner over a bigger surface',
    'why is the flux the same no matter how big the surface is',
    'does the size of the gaussian surface change the flux'
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
--   WHERE concept_id = 'gauss_law' ORDER BY state_id, cluster_id;
-- Should return 6 rows (3 STATE_2, 3 STATE_3).
