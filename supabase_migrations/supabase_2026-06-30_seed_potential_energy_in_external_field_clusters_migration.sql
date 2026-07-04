-- supabase_2026-06-30_seed_potential_energy_in_external_field_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 drill-down clusters for
-- potential_energy_in_external_field.json (Class 12 Ch.2 §2.8 — the EXTERNAL-field
-- energy: U = qV, U = q₁V₁+q₂V₂, U = −p·E). Authored 2026-06-30 by json_author from
-- the physics-author drill-down trigger phrasings.
--
-- Cluster placement:
--   STATE_3 (flip the sign — the energy hill inverts to a well; PRIMARY aha) — 3 clusters
--   STATE_6 (collapse two qV terms into U = −p·E) — 3 clusters
--   STATE_7 (sweep θ — aligned is the energy MINIMUM, torque ≠ energy) — 3 clusters
--
-- STATE_3, STATE_6, STATE_7 carry has_prebuilt_deep_dive: true + allow_deep_dive: true
-- in the JSON.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description,
--   trigger_examples, status.
-- PRIMARY KEY is (cluster_id). ON CONFLICT (cluster_id) DO NOTHING per the
-- json_author output contract for this concept (idempotent, additive-only).

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'negative_charge_energy_well',
  'potential_energy_in_external_field',
  'STATE_3',
  'Why does a negative charge give negative energy?',
  'Student cannot accept that the potential energy goes below zero for a negative charge, resisting that U = qV can be negative and that the energy hill becomes a well.',
  ARRAY[
    'why does negative charge give negative energy',
    'negative charge me energy minus kyun',
    'shouldnt energy still be positive',
    'why is U below zero for minus charge',
    'negative charge energy well meaning'
  ],
  'pending_review'
),
(
  'does_sign_of_V_or_q_decide_U',
  'potential_energy_in_external_field',
  'STATE_3',
  'Is it q or V that makes U negative?',
  'Student is unsure which factor sets the sign of the energy — the charge or the potential — and does not see that U = qV takes the sign of the PRODUCT q·V.',
  ARRAY[
    'is it q or V that makes U negative',
    'what decides the sign of U',
    'if V is positive how is U negative',
    'does sign come from charge or potential',
    'U sign depends on q or V'
  ],
  'pending_review'
),
(
  'dna_slides_toward_anode',
  'potential_energy_in_external_field',
  'STATE_3',
  'Why does DNA move to the positive electrode?',
  'Student does not connect the electrophoresis anchor to the energy landscape — that a negative charge slides toward higher V because that LOWERS its U = qV, rolling down the energy hill.',
  ARRAY[
    'why does dna move to positive electrode',
    'electrophoresis charge goes to which side',
    'why negative charge slides to anode',
    'does charge go to lower energy automatically',
    'why charge moves down the U landscape'
  ],
  'pending_review'
),
(
  'where_does_minus_p_dot_E_come_from',
  'potential_energy_in_external_field',
  'STATE_6',
  'Where does the −p·E come from?',
  'Student cannot derive the dipole energy and does not see why the minus sign appears or how U = −pE·cosθ follows from the two qV terms.',
  ARRAY[
    'where does minus p dot E come from',
    'why is dipole energy negative p E',
    'how qV becomes minus pE',
    'derive U = -pE cos theta',
    'why the minus sign in p dot E'
  ],
  'pending_review'
),
(
  'two_qV_terms_to_one_formula',
  'potential_energy_in_external_field',
  'STATE_6',
  'How do two qV terms become one formula?',
  'Student does not follow the collapse of the +q and −q contributions into a single dipole formula, losing track of how V₊ − V₋ becomes −E·d.',
  ARRAY[
    'how do two qV terms become one',
    'why qV plus qV is minus p E',
    'two charges one formula how',
    'collapse two charges into dipole energy',
    'where did V plus minus V minus go'
  ],
  'pending_review'
),
(
  'p_equals_qd_meaning',
  'potential_energy_in_external_field',
  'STATE_6',
  'What is p = q·d, and why does it point minus to plus?',
  'Student does not grasp the dipole moment physically — what p = q·d means, why it points from the negative to the positive charge, and how it scales with d.',
  ARRAY[
    'what is p equals q d',
    'why p points minus to plus',
    'does p change if d changes',
    'what is dipole moment physically',
    'p = qd meaning simple'
  ],
  'pending_review'
),
(
  'aligned_is_minimum_not_maximum',
  'potential_energy_in_external_field',
  'STATE_7',
  'Isn''t energy maximum when the dipole is aligned?',
  'Student holds the belief that alignment with the field is the highest-energy state, not seeing that θ = 0° is the energy MINIMUM (the most stable, comfortable pose).',
  ARRAY[
    'isnt energy max when aligned',
    'why is aligned the minimum energy',
    'i thought lined up means most energy',
    'why U lowest at theta zero',
    'aligned dipole energy max or min'
  ],
  'pending_review'
),
(
  'energy_vs_torque_which_peaks_where',
  'potential_energy_in_external_field',
  'STATE_7',
  'Why don''t energy and torque peak at the same angle?',
  'Student conflates the energy extrema with the torque peak, not separating U (extreme at 0°/180°) from τ = pE·sinθ (peaks at 90°).',
  ARRAY[
    'torque max at 90 but energy max at 180 why',
    'why dont energy and torque peak together',
    'difference between energy and torque angle',
    'where torque highest vs energy highest',
    'energy vs torque which is at 90'
  ],
  'pending_review'
),
(
  'stable_vs_unstable_equilibrium',
  'potential_energy_in_external_field',
  'STATE_7',
  'Why is θ=180° unstable but θ=0° stable?',
  'Student treats both zero-torque orientations as equally stable, not seeing that θ = 0° is the stable energy minimum and θ = 180° the unstable maximum.',
  ARRAY[
    'why is 180 unstable but 0 stable',
    'both have zero torque so why different',
    'what makes equilibrium stable here',
    'why dipole flips from 180',
    'stable vs unstable dipole difference'
  ],
  'pending_review'
)
ON CONFLICT (cluster_id) DO NOTHING;

-- Verify:
-- SELECT cluster_id, state_id FROM confusion_cluster_registry
--   WHERE concept_id = 'potential_energy_in_external_field' ORDER BY state_id, cluster_id;
-- Should return 9 rows (3 STATE_3, 3 STATE_6, 3 STATE_7).
