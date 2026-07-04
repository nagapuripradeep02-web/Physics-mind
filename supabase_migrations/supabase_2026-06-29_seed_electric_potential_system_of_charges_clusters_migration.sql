-- supabase_2026-06-29_seed_electric_potential_system_of_charges_clusters_migration.sql
-- Registers electric_potential_system_of_charges.json (Class 12 Ch.2 §2.5 — the
-- POTENTIAL of a SYSTEM of charges: V = Σ k qᵢ/rᵢ, the algebraic SCALAR sum of each
-- charge's own signed potential. Headlines: V is a SCALAR — add signed NUMBERS
-- directly (no directions/components/angles); EVERY charge contributes a nonzero
-- k q/r term (distance shrinks a term but never zeroes a far charge out of the sum);
-- an equal +q and −q equidistant from the point cancel EXACTLY to zero (signs and
-- distances set the total, not the count of charges); and the aha — the FIELD at the
-- same point needs vector addition by components, while the potential is one easy
-- scalar sum. This is the scalar-superposition diamond — it generalises the single
-- point-charge V = kQ/r and the two-charge dipole sum to N charges. It declares
-- electric_potential_point_charge (V = kQ/r), electric_potential_dipole (the two-charge
-- sum) and electric_potential_meaning (V = W/q) as prerequisites and does NOT
-- re-teach them.
--
-- Authored 2026-06-29 by json_author. AUTHORED, NOT AUTO-APPLIED (quality_auditor's
-- pre-run step applies it — json_author never runs apply_migration).
--
-- Two writes:
--   (1) concept_panel_config — the panel registration (field_3d / threejs, single).
--   (2) confusion_cluster_registry — the 6 drill-down clusters mapped to the
--       predict→reveal misconception states, each with 5 student-voice trigger
--       phrasings drawn from the physics block §3 misconception_watch beliefs.
--
-- Cluster placement (per the architect skeleton drill_downs arrays + physics block §3):
--   STATE_3 (does only the nearest charge matter?)          — does_far_charge_matter
--   STATE_3 (a weak/far charge vs a strong/near one)        — weak_vs_strong_charge
--   STATE_3 (do I really sum ALL the terms?)                — sum_all_terms
--   STATE_4 (why does the equal +/− pair cancel?)           — why_equal_pair_cancels
--   STATE_4 (the role of the signs in the sum)              — signs_in_the_sum
--   STATE_5 (scalar V sum vs vector E sum — the aha)        — scalar_vs_vector_combine
--
-- STATE_3 and STATE_4 carry allow_deep_dive: true in the JSON. STATE_5 is the PRIMARY
-- aha (scalar potential sum vs the field's vector addition); its cluster is seeded here
-- so the contrast belief is canned.
--
-- CUT-LINE GUARD: this concept teaches the system's scalar POTENTIAL — V = Σ k qᵢ/rᵢ,
-- the scalar-sum rule, every-term-counts, the equal-pair cancellation, and the
-- scalar-vs-vector contrast. It does NOT teach the SINGLE point-charge value V = kQ/r
-- (electric_potential_point_charge), the TWO-charge dipole sum / equatorial zero /
-- 1/r² falloff (electric_potential_dipole), what V MEANS (electric_potential_meaning),
-- the force between charges (coulombs_law), continuous charge smears
-- (charge_distribution), the system's vector FIELD, potential energy of a system, or
-- capacitance. Any such drill-down belongs to those concepts, not here. The clusters
-- below stay on the POTENTIAL of a discrete SYSTEM: whether the far charge counts, a
-- weak/far term vs a strong/near one, summing all the terms, why the equal +/− pair
-- cancels, the role of the signs, and the scalar-V-sum vs vector-E-sum contrast.
--
-- ON CONFLICT idempotent so re-running re-syncs the rows.

-- ── (1) Panel registration ────────────────────────────────────────────────────
INSERT INTO concept_panel_config
  (concept_id, panel_a_renderer, technology_a, default_panel_count, class_level, chapter)
VALUES
  ('electric_potential_system_of_charges', 'field_3d', 'threejs', 1, '12', 'Electrostatic Potential and Capacitance')
ON CONFLICT (concept_id) DO UPDATE SET
  panel_a_renderer    = EXCLUDED.panel_a_renderer,
  technology_a        = EXCLUDED.technology_a,
  default_panel_count = EXCLUDED.default_panel_count,
  class_level         = EXCLUDED.class_level,
  chapter             = EXCLUDED.chapter;

-- ── (2) Drill-down clusters ───────────────────────────────────────────────────
-- Schema columns: cluster_id, concept_id, state_id, label, description,
--   trigger_examples, status, created_at, updated_at. PRIMARY KEY is (cluster_id).
INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'does_far_charge_matter',
  'electric_potential_system_of_charges',
  'STATE_3',
  'Does a distant charge still count in the potential, or only the nearest one?',
  'student believes only the nearest charge sets the potential and a far charge contributes nothing; needs the far-term reveal — every charge adds a nonzero k q/r term, and a large distance only shrinks that term (the far q1 still adds +2.8), it never zeroes the charge out of the sum',
  ARRAY[
    'does the far charge still matter for the potential',
    'isnt only the nearest charge important for V',
    'can I ignore the charges that are far away',
    'does a distant charge add anything to the total potential',
    'do far charges drop out of the potential sum'
  ],
  'active'
),
(
  'weak_vs_strong_charge',
  'electric_potential_system_of_charges',
  'STATE_3',
  'Why does a far charge add only a little while a near charge adds a lot?',
  'student cannot rank a weak/far contribution against a strong/near one; needs k q/r — the contribution grows with the charge q and shrinks with the distance r (1/r falloff), so a far charge adds a small but nonzero term and a near charge dominates, yet both stay in the sum',
  ARRAY[
    'why does a far charge add only a small amount to the potential',
    'why does the near charge dominate the potential',
    'how do charge size and distance change a charges contribution',
    'why is the far term small but not zero',
    'does a bigger charge always contribute more to V than a closer one'
  ],
  'active'
),
(
  'sum_all_terms',
  'electric_potential_system_of_charges',
  'STATE_3',
  'Do I really add up ALL the charges'' terms, or just the biggest few?',
  'student wants to keep only the largest term and drop the rest; needs to see that the total is the full signed sum of every k q_i/r_i — dropping the far term changes the total from +4.2 down to +1.4, so every charge belongs in the sum',
  ARRAY[
    'do I add up all the charges or just the biggest one',
    'can I keep only the largest term for the potential',
    'do all the charges go into the potential sum',
    'is it ok to ignore the small terms in V',
    'how many of the charges do I actually have to add'
  ],
  'active'
),
(
  'why_equal_pair_cancels',
  'electric_potential_system_of_charges',
  'STATE_4',
  'Why does an equal +q and −q at equal distance cancel to zero in the potential?',
  'student believes two charges sitting nearby must give a large potential; needs the cancellation reveal — when a +q and a −q are equal in size and equal in distance, their contributions +kq/r and −kq/r are equal and opposite and sum to exactly zero, so that pair adds nothing even though two charges are present',
  ARRAY[
    'why do an equal plus and minus charge cancel the potential',
    'shouldnt two nearby charges give a big potential',
    'how can two charges add up to zero potential',
    'why is V zero when a positive and negative charge are equidistant',
    'do the plus and minus contributions really cancel exactly'
  ],
  'active'
),
(
  'signs_in_the_sum',
  'electric_potential_system_of_charges',
  'STATE_4',
  'How do the signs of the charges decide the total potential?',
  'student ignores the signs or adds magnitudes; needs to see that each term carries its own sign (positive charge → positive term, negative charge → negative term) and you add the SIGNED numbers, so signs and distances — not the count of charges — set the total',
  ARRAY[
    'do I keep the minus signs when adding the potentials',
    'how do the charge signs change the total potential',
    'do I add the magnitudes or the signed numbers for V',
    'does a negative charge subtract from the potential',
    'why does adding more charges not always make V bigger'
  ],
  'active'
),
(
  'scalar_vs_vector_combine',
  'electric_potential_system_of_charges',
  'STATE_5',
  'Do I combine potentials the same way as fields — as vectors — or differently?',
  'student tries to combine the potential like the field, with directions or components; needs the contrast reveal — the potential is a SCALAR, so you add signed numbers directly, while the FIELD at the same point is a vector and must be added with components, which is why the potential is the easier road',
  ARRAY[
    'do potentials add as vectors or as scalars',
    'do I add potentials the same way I add fields',
    'do I need directions or components to add potentials',
    'why is adding the potential easier than adding the field',
    'is the potential combined with components like the electric field'
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
-- SELECT * FROM concept_panel_config WHERE concept_id = 'electric_potential_system_of_charges';
--   Should return 1 row with panel_a_renderer = 'field_3d', technology_a = 'threejs'.
-- SELECT cluster_id, state_id FROM confusion_cluster_registry
--   WHERE concept_id = 'electric_potential_system_of_charges' ORDER BY state_id, cluster_id;
--   Should return 6 rows (STATE_3 ×3, STATE_4 ×2, STATE_5 ×1).
