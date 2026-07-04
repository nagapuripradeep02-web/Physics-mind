-- supabase_2026-07-04_seed_inductance_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 drill-down clusters for
-- inductance.json (Class 12 Ch.6 §6.9 Inductance — Self & Mutual). Authored
-- 2026-07-04 by json_author from the physics-author drill-down trigger phrasings.
--
-- Cluster placement:
--   STATE_2 (switch_dynamics — ε_L tracks dI/dt not I; the switch-off spark) — 3 clusters
--   STATE_4 (energy_stored — U = ½LI² lives in the field, released as the spark) — 3 clusters
--   STATE_5 (mutual_intro — SUPPORTING aha: an EMF across empty space, no wire) — 3 clusters
--
-- STATE_2, STATE_4, STATE_5 carry has_prebuilt_deep_dive: true + drill_downs: [...]
-- in the JSON.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description,
--   trigger_examples, status.
-- PRIMARY KEY is (cluster_id). ON CONFLICT (cluster_id) DO NOTHING per the
-- json_author output contract for this concept (idempotent, additive-only).
-- NOT applied here — quality_auditor's pre-run step applies this migration.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'back_emf_opposes_change_not_current',
  'inductance',
  'STATE_2',
  'Does the back-EMF oppose the current, or the change in current?',
  'Student ties the back-EMF to the value of the current I rather than to its rate of change dI/dt, so cannot see why a large steady current has exactly zero back-EMF.',
  ARRAY[
    'does back emf oppose the current or the change',
    'why is back emf zero when the current is steady',
    'if the current is big why is back emf zero',
    'back emf should be big for a big current no',
    'why doesnt back emf depend on how much current there is'
  ],
  'pending_review'
),
(
  'switch_off_spark_origin',
  'inductance',
  'STATE_2',
  'Why does opening the switch on a coil make a spark bigger than the battery?',
  'Student cannot see where the switch-off spark comes from, not connecting the near-instant current collapse (huge dI/dt) to a self-induced back-EMF that far exceeds the source voltage, carrying out the coil''s stored field energy.',
  ARRAY[
    'why do i get a spark when i open the switch',
    'where does the spark come from on switch off',
    'why is the spark bigger than the battery voltage',
    'switch off spark in a coil why so big',
    'is the spark the coils energy coming out'
  ],
  'pending_review'
),
(
  'current_ramp_time_constant',
  'inductance',
  'STATE_2',
  'Why does the current in a coil take time to build up instead of jumping?',
  'Student expects the current to appear at its full value at once (as through a resistor), not seeing that self-inductance forces a continuous ramp whose rate is set by the coil''s L (a jump would need infinite dI/dt).',
  ARRAY[
    'why does the current take time to build up',
    'how long till the current reaches full value',
    'what decides how fast the current ramps in a coil',
    'why cant the current just jump straight to full',
    'does a bigger L make the current build up slower'
  ],
  'pending_review'
),
(
  'where_the_half_comes_from',
  'inductance',
  'STATE_4',
  'Why is there a factor of one-half in ½LI²?',
  'Student memorises the energy formula but cannot justify the ½, not seeing that the current builds up gradually so the average work against the back-EMF over the ramp gives the one-half, exactly as for ½CV² in a capacitor.',
  ARRAY[
    'why is there a half in half L I squared',
    'where does the 1/2 come from in the energy formula',
    'why not just L I squared for the energy',
    'why is inductor energy half L i square',
    'how do you get the half in the coil energy'
  ],
  'pending_review'
),
(
  'energy_stored_in_field_not_wire',
  'inductance',
  'STATE_4',
  'Where is the energy in a current-carrying coil actually stored?',
  'Student pictures the energy as sitting in the wire (like a battery''s chemical energy), not seeing that it lives out in the coil''s magnetic field and can be released the instant the current is interrupted.',
  ARRAY[
    'where is the energy actually stored in a coil',
    'is the energy in the wire or in the field',
    'how can a magnetic field even hold energy',
    'does the coil store energy like a battery does',
    'where does the energy go when i switch off'
  ],
  'pending_review'
),
(
  'spark_energy_equals_field_energy',
  'inductance',
  'STATE_4',
  'Is the switch-off spark literally the coil''s stored energy escaping?',
  'Student does not connect the ½LI² of stored field energy to the energy dumped in the switch-off spark, treating the spark as a separate, unrelated phenomenon rather than the field energy leaving.',
  ARRAY[
    'does the spark energy equal the coils stored energy',
    'is the switch off spark the stored energy escaping',
    'where does the field energy go at switch off',
    'how much energy is in the switch off spark',
    'is the half L i square the same as the spark energy'
  ],
  'pending_review'
),
(
  'emf_with_no_electrical_connection',
  'inductance',
  'STATE_5',
  'How can there be an EMF in the second coil with no wire connecting them?',
  'Student insists the two coils must be electrically connected for anything to happen, not seeing that mutual induction needs only magnetic coupling across space — a changing flux crosses the gap and induces an EMF with no wire between them.',
  ARRAY[
    'how can there be an emf with no wire between the coils',
    'the two coils are not connected so how does it work',
    'emf in a coil without touching it how',
    'why does the second coil react across a gap',
    'no connection but still an emf why'
  ],
  'pending_review'
),
(
  'mutual_inductance_is_the_transformer',
  'inductance',
  'STATE_5',
  'Is mutual inductance the same idea as a transformer or wireless charging?',
  'Student does not connect the two-coil demo to real devices, not seeing that a transformer and a wireless charger are exactly mutual induction — one coil''s changing current inducing an EMF in another across magnetic coupling.',
  ARRAY[
    'is mutual inductance the same thing as a transformer',
    'how does a transformer use mutual inductance',
    'is this the same idea as wireless phone charging',
    'does a transformer work by mutual inductance',
    'how does one coil power another coil without wires'
  ],
  'pending_review'
),
(
  'M_is_symmetric_both_ways',
  'inductance',
  'STATE_5',
  'Is the mutual inductance M the same in both directions?',
  'Student assumes the coupling depends on which coil is chosen as the primary, not trusting the reciprocity result M₁₂ = M₂₁ — swapping primary and secondary gives the identical mutual inductance.',
  ARRAY[
    'is M the same in both directions',
    'does it matter which coil is the primary',
    'why is M12 equal to M21',
    'if i swap the two coils is M still the same',
    'is mutual inductance the same if i reverse the coils'
  ],
  'pending_review'
)
ON CONFLICT (cluster_id) DO NOTHING;

-- Verify:
-- SELECT cluster_id, state_id FROM confusion_cluster_registry
--   WHERE concept_id = 'inductance' ORDER BY state_id, cluster_id;
-- Should return 9 rows (3 STATE_2, 3 STATE_4, 3 STATE_5).
