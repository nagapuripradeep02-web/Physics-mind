-- supabase_2026-05-23_seed_magnetic_field_solenoid_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters (3 per has_prebuilt_deep_dive state)
-- for magnetic_field_solenoid.json. Authored 2026-05-23 by alex:json_author per
-- architect skeleton §6 + physics_author Section D (Diamond #4, M4 binary-gate validator).
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- Each trigger_examples array carries 5 real-Indian-11th-grade phrasings (lowercase,
-- idiomatic, no textbook prose). status='pending_review' per cluster-registry convention.
--
-- THREE deep-dive states (architect §5):
--   STATE_3 — axial superposition (PRIMARY aha): 3 clusters
--     radial_cancellation_unclear, axial_addition_unclear, infinite_turns_assumption
--   STATE_5 — RHR-swap (SUPPORTING aha): 3 clusters
--     which_hand_part_is_current, same_rhr_as_wire, curl_direction_ambiguous
--   STATE_6 — formula (n vs N): 3 clusters
--     total_turns_matters, units_of_n, length_effect

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_3 axial-superposition deep-dive ────────────────────────────
(
  'radial_cancellation_unclear',
  'magnetic_field_solenoid',
  'STATE_3',
  'Why do the radial parts cancel between turns?',
  'Student does not see the mirror-image symmetry between adjacent turns that makes the radial field contributions equal-and-opposite.',
  ARRAY[
    'i dont see why the radial parts cancel',
    'why opposite arrows should cancel here',
    'are the radial parts really equal in size',
    'what if the turns are not perfectly aligned',
    'show me the cancellation one more time'
  ],
  'pending_review'
),
(
  'axial_addition_unclear',
  'magnetic_field_solenoid',
  'STATE_3',
  'Why do the axial parts add and not also cancel?',
  'Student conflates "vectors at different points" with "vectors pointing opposite directions"; needs to see that both turns produce axial B in the same sense (set by their common RHR direction).',
  ARRAY[
    'why do the axial parts add and not also cancel',
    'shouldnt axial parts also be opposite',
    'why is one direction surviving and not the other',
    'what makes axial different from radial',
    'both turns should pull the field same way'
  ],
  'pending_review'
),
(
  'infinite_turns_assumption',
  'magnetic_field_solenoid',
  'STATE_3',
  'Does this only work for infinitely many turns?',
  'Student assumes the cancellation requires an infinite number of turns; misses the long-solenoid limit (L >> R) which lets a finite solenoid behave like the ideal case in its central region.',
  ARRAY[
    'doesnt this only work for infinite turns',
    'what about a short solenoid with just 5 turns',
    'is the formula exact or only approximate',
    'how many turns do you need for this to work',
    'does it matter how long the solenoid is'
  ],
  'pending_review'
),
-- ─── STATE_5 RHR-swap deep-dive ───────────────────────────────────────
(
  'which_hand_part_is_current',
  'magnetic_field_solenoid',
  'STATE_5',
  'Is the thumb the current or the field for a solenoid?',
  'Student keeps mixing up which hand part represents which quantity. The wire-RHR maps thumb to I but the solenoid-RHR maps fingers to I; the swap is the lesson.',
  ARRAY[
    'is the thumb the current or the field for a solenoid',
    'i keep mixing up thumb and fingers',
    'what does the thumb represent now',
    'for a solenoid which finger is what',
    'fingers are current or fingers are B'
  ],
  'pending_review'
),
(
  'same_rhr_as_wire',
  'magnetic_field_solenoid',
  'STATE_5',
  'Can I just use the wire right-hand rule here?',
  'Student wants one rule for everything and resists the role-swap. The wire-RHR applies CORRECTLY to one turns local tangent but only gives the per-turn circle, not the axial sum.',
  ARRAY[
    'can i just use the wire right hand rule here',
    'why not use diamond 1 rule for solenoid',
    'is the solenoid rule actually different',
    'isnt it the same right hand same physics',
    'do i really need two separate rules'
  ],
  'pending_review'
),
(
  'curl_direction_ambiguous',
  'magnetic_field_solenoid',
  'STATE_5',
  'Which way am I supposed to curl my fingers?',
  'Student knows fingers = current but cannot pin down the rotational sense; doesnt connect curl direction with the actual flow direction around the coil.',
  ARRAY[
    'which way am i supposed to curl my fingers',
    'with the current loops or against',
    'clockwise or anticlockwise i forget',
    'from outside or inside the coil',
    'is it from the top or bottom'
  ],
  'pending_review'
),
-- ─── STATE_6 formula deep-dive (n vs N) ───────────────────────────────
(
  'total_turns_matters',
  'magnetic_field_solenoid',
  'STATE_6',
  'Why doesnt the total number of turns appear in the formula?',
  'Student looks at B = μ₀nI and asks where N went. The answer: N is hidden inside n = N/L; the formula uses density, not raw count.',
  ARRAY[
    'why doesnt total number of turns appear in formula',
    'if i add more turns shouldnt B grow',
    'n vs N which one matters',
    'does adding turns do nothing',
    'what if i have 1000 turns vs 10 turns'
  ],
  'pending_review'
),
(
  'units_of_n',
  'magnetic_field_solenoid',
  'STATE_6',
  'What are the units of n? Is n dimensionless?',
  'Student treats n as a pure count (dimensionless) and gets the SI-units check wrong. n carries units of inverse length (per metre); the dimensional balance only works with /m in n.',
  ARRAY[
    'what are the units of n',
    'is n dimensionless',
    'n is just a number right',
    'what does turns per metre mean',
    'how do i write n in si units'
  ],
  'pending_review'
),
(
  'length_effect',
  'magnetic_field_solenoid',
  'STATE_6',
  'If I stretch the solenoid with the same turns, does B change?',
  'Student sees that the wire and current are unchanged and concludes the field must be unchanged. Misses the local-density argument: B at any interior point depends on n = N/L, not on total wire.',
  ARRAY[
    'if i make the solenoid longer with same turns does B change',
    'stretching the solenoid what happens to B',
    'what if i compress the coil',
    'longer solenoid stronger or weaker',
    'same wire just spread out more'
  ],
  'pending_review'
)
ON CONFLICT (cluster_id) DO UPDATE
SET concept_id        = EXCLUDED.concept_id,
    state_id          = EXCLUDED.state_id,
    label             = EXCLUDED.label,
    description       = EXCLUDED.description,
    trigger_examples  = EXCLUDED.trigger_examples,
    status            = EXCLUDED.status,
    updated_at        = now();
