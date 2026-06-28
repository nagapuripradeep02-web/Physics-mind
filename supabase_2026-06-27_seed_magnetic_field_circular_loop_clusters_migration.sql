-- supabase_2026-06-27_seed_magnetic_field_circular_loop_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 drill-down clusters for
-- magnetic_field_circular_loop.json (Class 12 Ch.4 §4.6 — the magnetic field a
-- circular current loop PRODUCES: B = μ₀NI/2R at the centre, axial (⊥ the loop
-- plane, grip RHR), built by superposition (every element's dB at the centre is
-- axial and they ADD, never cancel); and on the axis B(z) = μ₀NIR²/2(R²+z²)^{3/2},
-- maximal at the centre). Authored 2026-06-27.
--
-- Cluster placement (the two hardest states get three clusters each):
--   STATE_3 (superposition leap — every dB adds, never cancels; PRIMARY aha)  — 3 clusters
--   STATE_6 (on-axis falloff B(z); the R-vs-z two-length-scale formula)        — 3 clusters
--
-- STATE_3 is the PRIMARY aha (symmetry instinct says "cancel"); STATE_6 carries
-- the two-length-scale formula confusion (R radius vs z axial distance). Both
-- states are flagged has_prebuilt_deep_dive: true in the concept JSON.
--
-- CUT-LINE GUARD: this concept teaches the FIELD a circular loop produces (centre
-- magnitude + direction + on-axis falloff). It does NOT teach the single-element
-- Biot-Savart law (biot_savart_law), the straight-wire field (magnetic_field_wire
-- / amperes_circuital_law), the loop-as-bar-magnet identity or m = NIA
-- (current_loop_acts_as_dipole), the torque on the loop
-- (torque_on_current_loop_in_field), or the solenoid field B = μ₀nI
-- (magnetic_field_solenoid). Any drill-down on those belongs to those concepts.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description,
--   trigger_examples, status, created_at, updated_at.
-- PRIMARY KEY is (cluster_id). ON CONFLICT (cluster_id) DO UPDATE so re-running
-- this migration re-syncs the label/description/triggers idempotently.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'why_dbs_dont_cancel',
  'magnetic_field_circular_loop',
  'STATE_3',
  'Why don''t the dB''s from opposite sides cancel?',
  'student''s symmetry instinct says opposite elements (carrying current the opposite way) should cancel at the centre, and cannot see why the contributions add instead',
  ARRAY[
    'why opposite sides dont cancel',
    'shouldnt the two sides cancel out',
    'left and right element field should subtract na',
    'why does it add and not cancel',
    'opposite current so why is field not zero'
  ],
  'active'
),
(
  'only_axial_survives',
  'magnetic_field_circular_loop',
  'STATE_3',
  'Why does only the axial part of the field survive?',
  'student wonders where the sideways / in-plane parts of each element''s field go and why the centre field is purely along the axis',
  ARRAY[
    'why only the axial part stays',
    'where did the sideways field go',
    'why no field in the plane of the loop',
    'how do the in plane parts cancel',
    'why is center field only up not sideways'
  ],
  'active'
),
(
  'sum_to_clean_number',
  'magnetic_field_circular_loop',
  'STATE_3',
  'How does the messy sum of tiny dB''s become μ₀NI/2R?',
  'student cannot see how adding countless tiny element contributions collapses to the clean closed-form centre field, and why there is no π in it',
  ARRAY[
    'how does the messy sum become mu0 N I by 2R',
    'where does the 2R come from',
    'how does adding tiny dB give a clean formula',
    'why is there no pi in the loop center formula',
    'how do all the dB add to one number'
  ],
  'active'
),
(
  'R_versus_z_in_formula',
  'magnetic_field_circular_loop',
  'STATE_6',
  'What is R and what is z in the on-axis formula?',
  'student conflates the two length scales in B(z) — the loop radius R (in the plane) and the axial distance z — and is unsure which is which',
  ARRAY[
    'what is R and what is z in the formula',
    'is R the same as z',
    'which one is radius which is distance',
    'why are there two distances in B z',
    'confused between R and z in the axis formula'
  ],
  'active'
),
(
  'why_max_at_center',
  'magnetic_field_circular_loop',
  'STATE_6',
  'Why is the field strongest at the centre (z = 0)?',
  'student expects the axial field to peak off-centre or to be uniform, and cannot see why it is maximal at z = 0 and falls as z grows',
  ARRAY[
    'why is the field strongest at the center',
    'why is B maximum at z equals zero',
    'shouldnt it be max somewhere off the center',
    'why does B drop as i move along the axis',
    'is the axial field the same everywhere'
  ],
  'active'
),
(
  'far_field_axial_limit',
  'magnetic_field_circular_loop',
  'STATE_6',
  'What happens to B far along the axis (and why 1/z³)?',
  'student wonders how the axial field behaves far from the loop and why it falls as 1/z³ (the dipole far-field) rather than 1/z²',
  ARRAY[
    'what happens to B far along the axis',
    'why does the field fall as 1 over z cube far away',
    'does a loop look like a dipole far away',
    'field very far from the loop formula',
    'why z cubed not z squared far on the axis'
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
--   WHERE concept_id = 'magnetic_field_circular_loop' ORDER BY state_id, cluster_id;
-- Should return 6 rows (3 STATE_3, 3 STATE_6).
