-- supabase_2026-06-24_seed_electric_flux_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 drill-down clusters for
-- electric_flux.json (Class 12 Ch.1 — electric flux Φ = E·A = EA cosθ and the
-- net flux through a closed surface). Authored 2026-06-24 by json_author from
-- the physics-author drill-down trigger phrasings (physics block §6).
--
-- Cluster placement:
--   STATE_3 (tilt drops flux by cosθ, θ measured to the normal) — 3 clusters
--   STATE_5 (flux is the dot product E·A) — 3 clusters
--   STATE_7 (net flux through a closed box ∝ q_enc, the PRIMARY aha) — 3 clusters
--
-- STATE_7 carries allow_deep_dive: true in the JSON.
--
-- CUT-LINE GUARD: the flux_to_gauss_bridge cluster only BRIDGES toward Gauss's
-- law (net flux ∝ enclosed charge). It does NOT introduce ε₀ or Φ = q/ε₀ —
-- Gauss's law proper is deferred to a separate gauss_law concept.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description,
--   trigger_examples, status, created_at, updated_at.
-- PRIMARY KEY is (cluster_id). ON CONFLICT (cluster_id) DO UPDATE so re-running
-- this migration re-syncs the label/description/triggers idempotently.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'why_tilt_reduces_flux',
  'electric_flux',
  'STATE_3',
  'Why does tilting the area reduce the flux at all?',
  'Student cannot see why tilting changes the flux when neither the field strength E nor the area A has changed — has not connected the tilt to how many lines actually pierce the face.',
  ARRAY[
    'why does tilting change the flux',
    'E and A are the same so why does flux drop',
    'how can tilting reduce flux if nothing changed',
    'why do fewer lines pierce when i tilt it',
    'why isnt the flux the same when i turn the ring'
  ],
  'active'
),
(
  'theta_from_normal_not_surface',
  'electric_flux',
  'STATE_3',
  'Is θ measured to the surface or to the normal n̂?',
  'Student measures the angle θ from the field to the surface itself instead of to the area''s normal, and so gets the wrong angle (and often reaches for sin instead of cos).',
  ARRAY[
    'is theta measured to the surface or the normal',
    'which angle goes in cos theta',
    'do i use the angle to the face or to the arrow',
    'why is theta to the normal and not the plane',
    'what does the normal have to do with the angle'
  ],
  'active'
),
(
  'where_does_cos_come_from',
  'electric_flux',
  'STATE_3',
  'Where does the cosθ in Φ = EA cosθ come from?',
  'Student accepts the formula Φ = EA cosθ but does not see why a cosine appears — has not linked it to projecting the field onto the normal direction.',
  ARRAY[
    'where does cos theta come from in flux',
    'why is there a cosine in the flux formula',
    'why cos and not just E times A',
    'how does the angle turn into a cosine',
    'why does flux scale with cosine of the tilt'
  ],
  'active'
),
(
  'flux_as_dot_product',
  'electric_flux',
  'STATE_5',
  'Why is flux the dot product E·A and not something else?',
  'Student does not see why flux is written as a dot product of the field and the area vector, or what the dot product is doing physically (keeping only the component of E along the normal).',
  ARRAY[
    'why is flux a dot product',
    'what does E dot A actually mean',
    'why write flux as E dot A',
    'what is the dot product doing in flux',
    'how does the dot product give the flux'
  ],
  'active'
),
(
  'cos_vs_sin_in_flux',
  'electric_flux',
  'STATE_5',
  'Why cosθ and not sinθ in the flux?',
  'Student confuses when to use cos versus sin, often because they are thinking of a cross product (sinθ) or measuring the angle to the surface — and ends up with EA sinθ.',
  ARRAY[
    'why cos and not sin in flux',
    'when do i use sin and when cos for flux',
    'is flux EA cos or EA sin',
    'why isnt flux a cross product with sine',
    'why does the dot product give cos not sin'
  ],
  'active'
),
(
  'area_vector_direction',
  'electric_flux',
  'STATE_5',
  'Which way does the area vector A = A n̂ point?',
  'Student is unsure how an area gets a direction and which way the area vector points, and so cannot set up the dot product E·A correctly.',
  ARRAY[
    'which way does the area vector point',
    'how does an area have a direction',
    'why is the area vector along the normal',
    'what direction is A in E dot A',
    'how do i know which way n hat points'
  ],
  'active'
),
(
  'net_flux_independent_of_position',
  'electric_flux',
  'STATE_7',
  'Why doesn''t moving the charge off-centre change the net flux?',
  'Student expects the net flux to change when the charge is dragged off-centre or nearer a face, not seeing that the per-face flux rebalances so the total out of the closed surface stays fixed.',
  ARRAY[
    'why doesnt moving the charge change the net flux',
    'shouldnt the flux change if the charge is off centre',
    'why is the net flux the same when i move the charge',
    'does the charge position change the total flux',
    'why dont the faces matter for the net flux'
  ],
  'active'
),
(
  'flux_through_closed_box',
  'electric_flux',
  'STATE_7',
  'How do you add up the flux over a whole closed box?',
  'Student does not see how the signed flux through six separate faces combines into one net number — how leaving (+) and entering (−) faces are summed for a closed surface.',
  ARRAY[
    'how do i add flux over all six faces',
    'how does the flux through a closed box work',
    'how do you sum flux for a whole closed surface',
    'do entering and leaving faces cancel',
    'how do the faces of the box add up to the net flux'
  ],
  'active'
),
(
  'flux_to_gauss_bridge',
  'electric_flux',
  'STATE_7',
  'If net flux is set by the charge inside, is this Gauss''s law?',
  'Student senses that net-flux-depends-only-on-enclosed-charge is heading somewhere bigger and asks for the bridge to Gauss''s law. Answer stays at "net flux ∝ enclosed charge (steady)"; the ε₀ constant and Φ = q/ε₀ are deferred to the gauss_law concept.',
  ARRAY[
    'is this gauss law',
    'is net flux just the charge inside',
    'does this lead to gauss law',
    'whats the actual formula for net flux',
    'is the net flux proportional to the enclosed charge'
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
--   WHERE concept_id = 'electric_flux' ORDER BY state_id, cluster_id;
-- Should return 9 rows (3 STATE_3, 3 STATE_5, 3 STATE_7).
