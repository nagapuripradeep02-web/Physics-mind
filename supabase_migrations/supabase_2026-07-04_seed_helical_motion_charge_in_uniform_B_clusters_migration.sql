-- supabase_2026-07-04_seed_helical_motion_charge_in_uniform_B_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 drill-down clusters for
-- helical_motion_charge_in_uniform_B.json (Class 12 Ch.4 §4.3.1 — a charge
-- entering a uniform magnetic field at an ANGLE theta traces a HELIX: the
-- across-field part v_perp = v sin(theta) circles (r = m v_perp / qB) while the
-- along-field part v_par = v cos(theta) sails straight (v_par x B = 0, B does no
-- work on it), so each turn advances one PITCH p = v_par * T. theta alone sets
-- the SHAPE (p/r = 2 pi cot theta); v and B only resize the coil).
-- Authored 2026-07-04 by json_author from the concept's natural drill-down
-- confusion points (deep-dive DORMANT — this file is authored, NOT applied; the
-- quality_auditor's pre-run step applies it if/when deep-dive is re-activated).
--
-- Cluster placement (3 clusters per state, on the three allow_deep_dive states):
--   STATE_3 (only the across-field part makes the circle -> r = m v sin(theta)/qB) — 3 clusters
--   STATE_5 (pitch p = v_par * T; the PRIMARY aha)                                 — 3 clusters
--   STATE_6 (your turn — shape it with theta, size it with v and B; interactive)   — 3 clusters
--
-- STATE_3, STATE_5 and STATE_6 each carry allow_deep_dive: true in the JSON.
--
-- CUT-LINE GUARD: this concept teaches the HELIX DECOMPOSITION and the PITCH
-- only. It CITES the radius r = mv/qB (that is circular_motion_charge_in_uniform_B),
-- the period T = 2 pi m / (qB) (that is cyclotron_period_independent_of_speed) and
-- the force magnitude F = qvB sin(theta) (that is magnetic_force_moving_charge)
-- without re-deriving them; any "how is r/T derived / how many Newtons is the
-- force / velocity-selector / cyclotron device / toroid" drill-down belongs to
-- those concepts, not here. The clusters below stay on the velocity
-- decomposition (v_par vs v_perp), why only v_perp circles, why v_par sails
-- straight, what the pitch is and why p = v_par * T, and the shape-vs-size split
-- (p/r = 2 pi cot theta).
--
-- Schema columns: cluster_id, concept_id, state_id, label, description,
--   trigger_examples, status, created_at, updated_at.
-- PRIMARY KEY is (cluster_id). ON CONFLICT (cluster_id) DO UPDATE so re-running
-- this migration re-syncs the label/description/triggers idempotently.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'radius_uses_vperp_not_full_speed',
  'helical_motion_charge_in_uniform_B',
  'STATE_3',
  'Why does the radius use v sin(theta) and not the full speed v?',
  'Student expects the circle radius to use the whole speed v, and cannot see why only the across-field part v_perp = v sin(theta) enters r = m v_perp / (qB).',
  ARRAY[
    'why does the radius use v sin theta not v',
    'why is the radius smaller than mv over qb',
    'shouldnt the circle use the full speed',
    'why only v perpendicular in the radius formula',
    'where does the sin theta come from in the radius'
  ],
  'active'
),
(
  'why_only_vperp_circles',
  'helical_motion_charge_in_uniform_B',
  'STATE_3',
  'Why does only the across-field part circle?',
  'Student does not see why the along-field part is ignored when forming the circle — treats the whole velocity as circling rather than just v_perp.',
  ARRAY[
    'why does only the across field part circle',
    'why does only v perpendicular bend',
    'why is the along field part left out of the circle',
    'why does part of the velocity go in a circle and part not',
    'why does the field only act on v perpendicular'
  ],
  'active'
),
(
  'why_collapse_to_flat_circle',
  'helical_motion_charge_in_uniform_B',
  'STATE_3',
  'Why does removing the along-field part make it a flat circle?',
  'Student is unsure why holding v_par still collapses the helix into a flat circle lying perpendicular to B, rather than just a smaller helix.',
  ARRAY[
    'why does it become a flat circle when v parallel is removed',
    'why does the helix collapse to a circle',
    'why is the circle perpendicular to the field',
    'why flat and not tilted circle',
    'what makes it a plane circle instead of a helix'
  ],
  'active'
),
(
  'what_is_the_pitch',
  'helical_motion_charge_in_uniform_B',
  'STATE_5',
  'What exactly is the pitch of the helix?',
  'Student wants the meaning of the pitch made concrete — that it is the forward advance ALONG B per one complete turn, not the radius or the circumference.',
  ARRAY[
    'what is the pitch of a helix',
    'what does pitch mean here',
    'is pitch the same as radius',
    'how far does the charge move forward in one turn',
    'what is the distance along the field per turn'
  ],
  'active'
),
(
  'why_pitch_equals_vpar_times_T',
  'helical_motion_charge_in_uniform_B',
  'STATE_5',
  'Why is pitch = v-parallel times the period T?',
  'Student cannot see why the pitch equals v_par * T — does not connect the constant along-field drift over exactly one period to the forward advance per turn.',
  ARRAY[
    'why is pitch v parallel times t',
    'how do you get p equals v cos theta times t',
    'why multiply v parallel by the period',
    'where does the pitch formula come from',
    'how is the pitch related to the time for one turn'
  ],
  'active'
),
(
  'period_independent_of_angle',
  'helical_motion_charge_in_uniform_B',
  'STATE_5',
  'Why does the period not change with the entry angle?',
  'Student expects the lap time to depend on the angle theta (since the circle changes size), and is surprised the period T = 2 pi m/(qB) is the same at every angle, so the pitch tracks only v_par.',
  ARRAY[
    'does the period depend on the angle',
    'why is the period the same at every angle',
    'shouldnt a bigger circle take longer',
    'why does theta not change the lap time',
    'why is t independent of the entry angle'
  ],
  'active'
),
(
  'theta_sets_shape_not_v_or_B',
  'helical_motion_charge_in_uniform_B',
  'STATE_6',
  'Why does only theta change the shape of the helix?',
  'Student expects speed v or field B to change the shape, and is surprised that v and B only resize the whole coil while theta alone stretches or flattens it.',
  ARRAY[
    'why does only theta change the shape',
    'why does speed not change the shape of the helix',
    'why does the field only resize the coil',
    'what actually changes the shape of the helix',
    'why do v and b keep the same shape'
  ],
  'active'
),
(
  'why_p_over_r_is_2pi_cot_theta',
  'helical_motion_charge_in_uniform_B',
  'STATE_6',
  'Why is the pitch-to-radius ratio 2 pi cot(theta)?',
  'Student wants to see why the ratio p/r depends on theta alone, with m, q, v and B all cancelling out.',
  ARRAY[
    'why is p over r equal to 2 pi cot theta',
    'why do m q v and b cancel in the ratio',
    'why does the shape depend only on the angle',
    'how do you get pitch over radius equals 2 pi cot theta',
    'why is the ratio independent of speed and field'
  ],
  'active'
),
(
  'extreme_angle_cases',
  'helical_motion_charge_in_uniform_B',
  'STATE_6',
  'What happens at theta = 90 degrees or theta near zero?',
  'Student pushes the angle slider to its limits and asks why the helix becomes a flat circle at 90 degrees (pitch to zero) and a straight line near zero (radius to zero).',
  ARRAY[
    'what happens at 90 degrees',
    'why is it a flat circle at ninety degrees',
    'what happens when the angle is very small',
    'why does it become a straight line at small angle',
    'why does the pitch go to zero at 90 degrees'
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
--   WHERE concept_id = 'helical_motion_charge_in_uniform_B' ORDER BY state_id, cluster_id;
-- Should return 9 rows (3 STATE_3, 3 STATE_5, 3 STATE_6).
