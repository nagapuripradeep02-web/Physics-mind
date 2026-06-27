-- supabase_2026-06-26_seed_current_loop_acts_as_dipole_clusters_migration.sql
-- Seeds confusion_cluster_registry with 3 drill-down clusters for
-- current_loop_acts_as_dipole.json (Class 12 Ch.4 §4.10 — a current loop acts as
-- a magnetic dipole: it SOURCES a field identical to a bar magnet's, has moment
-- m = NIA (vector along the axis, RHR), has a north face and a south face, and
-- aligns like a compass in an external field; atomic current loops are the origin
-- of all magnetism). Authored 2026-06-26.
--
-- Cluster placement (1 cluster per state, on the three hardest states):
--   STATE_3 (the loop has two poles, never a single one)             — 1 cluster
--   STATE_4 (loop field ≡ bar-magnet field — the AHA)                — 1 cluster
--   STATE_8 (origin of magnetism; no magnetic monopoles)            — 1 cluster
--
-- STATE_4 is the PRIMARY aha (field equivalence); STATE_3 and STATE_8 are the
-- other two confusion hotspots.
--
-- CUT-LINE GUARD: this concept teaches the FIELD-EQUIVALENCE / dipole identity of
-- a current loop. It does NOT teach the τ = μ × B rotational dynamics derivation
-- (that is torque_on_current_loop_in_field), the solenoid field B = μ₀nI
-- (magnetic_field_solenoid), or the Biot-Savart on-axis field of a loop. Any
-- "how big is the torque / couple derivation" or "field inside a solenoid"
-- drill-down belongs to those concepts, not here. The clusters below stay on the
-- two-pole structure, the loop ≡ bar-magnet equivalence, and the origin of
-- magnetism / no-monopole point.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description,
--   trigger_examples, status, created_at, updated_at.
-- PRIMARY KEY is (cluster_id). ON CONFLICT (cluster_id) DO UPDATE so re-running
-- this migration re-syncs the label/description/triggers idempotently.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'loop_two_poles_not_one',
  'current_loop_acts_as_dipole',
  'STATE_3',
  'Why does the loop have two poles instead of one?',
  'student expects a single magnetic pole on the loop and cannot see why both a north and a south face always appear together',
  ARRAY[
    'why does the loop have two poles',
    'can i get just a north pole from the loop',
    'is the loop a single magnetic pole',
    'why is it called a dipole and not a monopole',
    'how does one loop have both north and south'
  ],
  'active'
),
(
  'loop_field_identical_to_bar_magnet',
  'current_loop_acts_as_dipole',
  'STATE_4',
  'How can a current loop have the same field as a bar magnet?',
  'student thinks a loop and a bar magnet are fundamentally different and is surprised their external fields are identical',
  ARRAY[
    'why is a loop field same as a bar magnet',
    'how can a current loop be a magnet',
    'is a current loop really a dipole',
    'how do two different things make the same field',
    'difference between a current loop and a bar magnet'
  ],
  'active'
),
(
  'origin_of_magnetism_no_monopole',
  'current_loop_acts_as_dipole',
  'STATE_8',
  'Where does a bar magnet''s magnetism come from, and do single poles exist?',
  'student believes magnetism needs a permanent magnet or that isolated magnetic monopoles exist, missing the atomic-current-loop origin',
  ARRAY[
    'where does magnetism actually come from',
    'do magnetic monopoles exist',
    'why is there no single magnetic pole',
    'how do atoms make a magnet',
    'is a bar magnet made of tiny current loops'
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
--   WHERE concept_id = 'current_loop_acts_as_dipole' ORDER BY state_id, cluster_id;
-- Should return 3 rows (1 STATE_3, 1 STATE_4, 1 STATE_8).
