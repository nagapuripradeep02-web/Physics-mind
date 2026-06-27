-- supabase_2026-06-25_seed_circular_motion_charge_in_uniform_B_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 drill-down clusters for
-- circular_motion_charge_in_uniform_B.json (Class 12 Ch.4 §4.2 — how BIG the
-- circle is: a charge moving perpendicular to a uniform magnetic field travels in
-- a CLOSED circle whose radius is r = mv/qB — bigger with momentum (m or v, the
-- numerator), tighter with grip (q or B, the denominator). The single surfaced
-- quantity is r, and only as a RELATIVE readout).
-- Authored 2026-06-25 by json_author from the physics-author drill-down trigger
-- phrasings (physics block §6).
--
-- Cluster placement (3 clusters per state, on the three allow_deep_dive states):
--   STATE_3 (the magnetic force IS the centripetal force -> r = mv/qB)  — 3 clusters
--   STATE_5 (more charge or stronger field -> tighter circle; M1)       — 3 clusters
--   STATE_6 (your turn — set the circle; interactive)                   — 3 clusters
--
-- STATE_3, STATE_5 and STATE_6 each carry allow_deep_dive: true in the JSON.
--
-- CUT-LINE GUARD: this concept teaches the SIZE / radius r = mv/qB only. It does
-- NOT teach the PERIOD T = 2 pi m / (q B) (that is the future
-- cyclotron_period_independent_of_speed), the force MAGNITUDE F = qvB sin(theta)
-- (that is magnetic_force_moving_charge), or any current-loop / Ampere / dipole
-- content; any "how long is one orbit / how often / how strong is the force / how
-- many Newtons" drill-down belongs to those concepts, not here. The clusters
-- below stay on the centripetal balance, the rearrangement to r = mv/qB, the
-- numerator (momentum) vs denominator (grip) intuition, and the slider behaviour.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description,
--   trigger_examples, status, created_at, updated_at.
-- PRIMARY KEY is (cluster_id). ON CONFLICT (cluster_id) DO UPDATE so re-running
-- this migration re-syncs the label/description/triggers idempotently.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'why_force_equals_centripetal',
  'circular_motion_charge_in_uniform_B',
  'STATE_3',
  'Why is the magnetic force the centripetal force?',
  'Student does not see why the magnetic force can be SET EQUAL to the centripetal force mv^2/r — treats them as two separate forces rather than one and the same.',
  ARRAY[
    'why is magnetic force the centripetal force',
    'how can qvb be equal to mv2/r',
    'is magnetic force same as centripetal force',
    'where does centripetal force come from here',
    'why do we put qvb equal to mv square by r'
  ],
  'active'
),
(
  'where_does_r_come_from',
  'circular_motion_charge_in_uniform_B',
  'STATE_3',
  'How is r = mv/qB obtained?',
  'Student cannot follow the algebra that turns the balance qvB = mv^2/r into r = mv/qB — wants the rearrangement step made explicit.',
  ARRAY[
    'how did we get r equals mv by qb',
    'where does the radius formula come from',
    'how to derive r mv qb',
    'how is r mv upon qb obtained',
    'how do you solve qvb mv2 r for r'
  ],
  'active'
),
(
  'is_this_circular_motion_real',
  'circular_motion_charge_in_uniform_B',
  'STATE_3',
  'Is it really a perfect circle, or just approximately one?',
  'Student is not convinced the path is a genuine, exact circle — suspects it might be a spiral or an approximation that only looks circular.',
  ARRAY[
    'is it really a perfect circle',
    'is this actual circular motion or just looks like it',
    'does the charge really go in a complete circle',
    'why is it exactly circular and not spiral',
    'is the circle perfect or approximate'
  ],
  'active'
),
(
  'stronger_field_smaller_circle',
  'circular_motion_charge_in_uniform_B',
  'STATE_5',
  'Why does a stronger field make a SMALLER circle?',
  'Student holds the strongest misconception (M1): expects a bigger B to give a bigger circle, and cannot accept that turning the field up shrinks the radius.',
  ARRAY[
    'why does stronger field make smaller circle',
    'shouldnt bigger b give bigger circle',
    'why does more magnetic field reduce radius',
    'if field is stronger why does circle shrink',
    'more b should mean wider circle right'
  ],
  'active'
),
(
  'charge_in_denominator',
  'circular_motion_charge_in_uniform_B',
  'STATE_5',
  'Why does more charge make a tighter circle?',
  'Student reasons that more charge means more force and therefore a bigger circle, and is surprised that q sits in the DENOMINATOR and tightens the turn instead.',
  ARRAY[
    'why does more charge make tighter circle',
    'why is charge in the bottom of the formula',
    'why does increasing q decrease radius',
    'more charge should be more force so smaller circle',
    'why does q being bigger shrink the radius'
  ],
  'active'
),
(
  'grip_intuition_qB',
  'circular_motion_charge_in_uniform_B',
  'STATE_5',
  'What does qB mean physically — the "grip"?',
  'Student wants the meaning of the product q times B made concrete — why qB is called the grip and how it decides how tightly the charge turns.',
  ARRAY[
    'what does qb mean physically',
    'why is qb called the grip',
    'what is the meaning of q times b together',
    'how does qb decide how tight the turn is',
    'why does qb being big make it turn harder'
  ],
  'active'
),
(
  'same_radius_different_knobs',
  'circular_motion_charge_in_uniform_B',
  'STATE_6',
  'How can two different settings give the same circle?',
  'Student is surprised that doubling m and q (or m and B) returns the circle to its original size, and wants to see how the cancellation in r = mv/qB works.',
  ARRAY[
    'how can two different settings give same circle',
    'why does doubling m and q give same radius',
    'different sliders but same circle size why',
    'can i get the same radius with different values',
    'why doesnt the circle change when i double m and b'
  ],
  'active'
),
(
  'momentum_vs_grip_balance',
  'circular_motion_charge_in_uniform_B',
  'STATE_6',
  'What wins — momentum (mv) or grip (qB)?',
  'Student is unsure how the numerator (momentum mv) and denominator (grip qB) trade off, and whether it is the ratio of the two that fixes the size.',
  ARRAY[
    'what wins momentum or grip',
    'how does mv fight against qb',
    'what happens if i increase top and bottom together',
    'is it the ratio of mv to qb that matters',
    'if i make everything bigger does the circle stay same'
  ],
  'active'
),
(
  'extreme_slider_cases',
  'circular_motion_charge_in_uniform_B',
  'STATE_6',
  'What happens at the extreme slider settings?',
  'Student pushes the sliders to their limits and asks why the circle stops growing or shrinking — surfaces the visual clamp on the radius at the edges of the range.',
  ARRAY[
    'what happens if mass is very high',
    'why does the circle stop growing at the edge',
    'what if i put speed to maximum',
    'does the circle get infinitely big',
    'why does the circle stay same at the highest setting'
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
--   WHERE concept_id = 'circular_motion_charge_in_uniform_B' ORDER BY state_id, cluster_id;
-- Should return 9 rows (3 STATE_3, 3 STATE_5, 3 STATE_6).
