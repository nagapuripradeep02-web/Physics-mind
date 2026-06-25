-- supabase_2026-06-25_seed_magnetic_force_perpendicular_no_work_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 drill-down clusters for
-- magnetic_force_perpendicular_no_work.json (Class 12 Ch.4 §4.2 — why a magnetic
-- force can NEVER change a charge's speed: F = q(v × B) is perpendicular to v at
-- every instant, so W = F·d·cos90° = 0; by the work-energy theorem ΔKE = 0 and
-- |v| is locked — the force only TURNS the velocity, never adds energy. The
-- electric-vs-magnetic split screen seals the aha "steers, never speeds up").
-- Authored 2026-06-25 by json_author from the physics-author drill-down trigger
-- phrasings (physics block §6).
--
-- Cluster placement (3 clusters per state, on the three allow_deep_dive states):
--   STATE_3 (a sideways push does no work — W = F·d·cos90° = 0)  — 3 clusters
--   STATE_4 (speed locked — the |v| meter never moves, ΔKE = 0)  — 3 clusters
--   STATE_5 (electric vs magnetic — same start, one speeds up)   — 3 clusters
--
-- STATE_3, STATE_4 and STATE_5 each carry allow_deep_dive: true in the JSON.
--
-- CUT-LINE GUARD: this concept teaches the NO-WORK / energy idea only — why the
-- speed cannot change. It does NOT teach the MAGNITUDE F = qvB sin(theta), the
-- radius r = mv/qB, or the period T; any "how big is the force / what is the
-- radius / how long is the orbit" drill-down belongs to magnetic_force_moving_charge,
-- not here. The clusters below stay on perpendicularity, zero work, the
-- work-energy theorem, constant speed, and the electric-vs-magnetic contrast only.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description,
--   trigger_examples, status, created_at, updated_at.
-- PRIMARY KEY is (cluster_id). ON CONFLICT (cluster_id) DO UPDATE so re-running
-- this migration re-syncs the label/description/triggers idempotently.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'why_perpendicular_means_zero_work',
  'magnetic_force_perpendicular_no_work',
  'STATE_3',
  'Why does a perpendicular force do no work?',
  'Student sees a force clearly acting on the charge and cannot accept that it does zero work just because it is at 90° to the motion — the cos 90° = 0 step does not feel physical to them.',
  ARRAY[
    'why does perpendicular force do no work',
    'if force is acting why is work zero',
    'force is there but cos 90 is zero how',
    'how can a force do nothing',
    'sideways force still pushes na how no work'
  ],
  'active'
),
(
  'work_energy_theorem_link',
  'magnetic_force_perpendicular_no_work',
  'STATE_3',
  'How does zero work connect to the energy not changing?',
  'Student has not joined the work-energy theorem to this case — does not see that zero work directly means zero change in kinetic energy, and therefore no change in speed.',
  ARRAY[
    'what is work energy theorem here',
    'how does zero work mean energy not changing',
    'why ke does not change if force is acting',
    'work is zero so what about energy',
    'does no work mean no acceleration'
  ],
  'active'
),
(
  'circular_motion_needs_no_energy',
  'magnetic_force_perpendicular_no_work',
  'STATE_3',
  'Doesn''t going round in a circle need work to keep it going?',
  'Student believes circular motion must be powered — that something has to keep doing work to keep the charge moving in a loop — and cannot see how the loop persists with zero work done.',
  ARRAY[
    'circular motion needs energy to keep going right',
    'if it goes in circle work must be done',
    'doesnt going round need force doing work',
    'why no energy needed for circle',
    'moving in loop forever without energy how'
  ],
  'active'
),
(
  'kinetic_energy_constant_proof',
  'magnetic_force_perpendicular_no_work',
  'STATE_4',
  'How do we know the kinetic energy (and speed) stays constant?',
  'Student wants the proof that the speed is genuinely locked — sees the force acting and the |v| meter staying flat and asks how those can both be true at once.',
  ARRAY[
    'why is kinetic energy constant',
    'prove speed does not change',
    'how do we know ke stays same',
    'if ke is half m v square and force acts why v same',
    'needle is flat but force is acting why'
  ],
  'active'
),
(
  'equal_arc_means_constant_speed',
  'magnetic_force_perpendicular_no_work',
  'STATE_4',
  'What does the equal-arc trail tell us?',
  'Student does not read the evenly spaced trail dots as a measurement of speed — has not connected equal spacing in equal time with constant speed.',
  ARRAY[
    'what does equal arc mean',
    'why are the trail dots equally spaced',
    'how does equal spacing show constant speed',
    'if dots are equal what does it tell',
    'trail spacing same means what'
  ],
  'active'
),
(
  'turn_without_speedup',
  'magnetic_force_perpendicular_no_work',
  'STATE_4',
  'How can it turn without speeding up if the velocity is changing?',
  'Student conflates a changing velocity vector (direction change) with speeding up — believes any acceleration must mean the speed is rising, and cannot separate turning from accelerating.',
  ARRAY[
    'how can it turn without speeding up',
    'turning means accelerating na so speed up',
    'direction changes but speed same how',
    'if velocity changes isnt it speeding up',
    'acceleration there but speed not changing'
  ],
  'active'
),
(
  'why_electric_does_work',
  'magnetic_force_perpendicular_no_work',
  'STATE_5',
  'Why does the electric force do work but the magnetic force not?',
  'Student does not see what is different about the electric force on the left side — why it can speed the charge up while the magnetic force on the right cannot.',
  ARRAY[
    'why does electric force do work but magnetic not',
    'what is different about electric force',
    'why electric speeds it up',
    'electric force also pushes so why work here',
    'why is electric not perpendicular to v'
  ],
  'active'
),
(
  'same_speed_two_paths',
  'magnetic_force_perpendicular_no_work',
  'STATE_5',
  'Both charges start at the same speed — why do they behave so differently?',
  'Student is struck that two charges with the same starting speed take a parabolic path (left) and a curving constant-speed path (right), and wants to know why the same start gives such different motion.',
  ARRAY[
    'both start same speed why different paths',
    'why is one is parabola and other is curve',
    'same start but left goes faster how',
    'why does left one spread out and right one not',
    'same speed two charges why behave different'
  ],
  'active'
),
(
  'magnetic_steers_electric_accelerates',
  'magnetic_force_perpendicular_no_work',
  'STATE_5',
  'What does "magnetic steers but electric accelerates" really mean?',
  'Student wants the steering-wheel-vs-accelerator-pedal idea made concrete — why a magnetic field can only change direction, and why it can never be used to speed a charge up.',
  ARRAY[
    'why magnet only steers and electric accelerates',
    'what does steers but not speed up mean',
    'magnetic turns it electric speeds it explain',
    'is magnetic force like a steering wheel',
    'why cant magnetic field be used to speed up charge'
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
--   WHERE concept_id = 'magnetic_force_perpendicular_no_work' ORDER BY state_id, cluster_id;
-- Should return 9 rows (3 STATE_3, 3 STATE_4, 3 STATE_5).
