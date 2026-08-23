-- supabase_20260814_seed_rotational_kinematics_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters for
-- src/data/concepts/rotational_kinematics.json (Class 11 Ch.7, Desk D,
-- rotmech chapter build).
--
-- Authored 2026-08-14 by alex:json_author, using physics_author's
-- drill-down trigger phrasings VERBATIM
-- (docs/loop_runs/rotmech/rotational_kinematics/physics_block.md §5 —
-- 30 phrasings, 5 per cluster, written in genuine student voice):
--   STATE_4 — radians_vs_revolutions, sign_of_alpha, linear_angular_mapping;
--   STATE_6 — same_omega_different_v, which_r_in_v_omega_r, omega_vs_v_confusion.
--
-- label + description are json_author's own composition (the physics
-- block supplied only the trigger phrasings + the cluster names), matching
-- the shape of the definite_integral_as_accumulated_area precedent
-- migration, which this file mirrors byte-for-byte in structure.
--
-- The two states are exactly the concept's has_prebuilt_deep_dive picks
-- (architect skeleton §5): STATE_4 (the PRIMARY aha — omega = omega0 +
-- alpha t, the exam-skill state where rad-vs-rev and sign confusions
-- surface) and STATE_6 (v = omega r — the most documented rotational-
-- kinematics confusion). Each carries a drill_downs array in the concept
-- JSON referencing these cluster_ids.
--
-- WHY THIS FILE EXISTS: scar confusion_cluster_registry_unseeded_for_concept
-- (CRITICAL/FIXED) makes the seeding migration a NAMED json_author deliverable
-- (architect skeleton §6 / §10(f); dispatch requirement).
--
-- MIGRATION IS AUTHORED, NOT APPLIED. Applying is a founder action on the
-- founder's machine (Rule 17). Drill-down itself is DEFERRED (Rule 18 /
-- Rule 22 [D], 2026-06-10 directive), so the registry ROW is dormant this
-- phase; the authored FILE is the deliverable.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description,
-- trigger_examples, status. PRIMARY KEY is (cluster_id) alone; ON CONFLICT
-- updates the other columns idempotently. status='pending_review' per the
-- current cluster-registry convention.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_4 — omega = omega0 + alpha t, the exam-skill state ───────────
(
  'radians_vs_revolutions',
  'rotational_kinematics',
  'STATE_4',
  'Is 6.28 radians the same as one full turn?',
  'A radian is a unit of ANGLE, defined so that 2*pi radians (about 6.28) equals exactly one full revolution — the two describe the same physical rotation, just in different units, the way a metre and a foot describe the same length. Students often treat theta''s running count as if it resets to zero every revolution, the way an odometer''s "trip count" might, and then get confused when the readout keeps climbing past 6.28 instead of restarting. It does not restart: theta is the TOTAL angle turned since the start line, so 12.56 radians after two turns is correct and expected, while the on-screen ARC (which draws theta mod 2*pi) does visually reset every revolution because it is only showing the CURRENT position around the circle, not the total turned. Converting between radians and revolutions is a division by 2*pi, never a unit anyone needs to guess — the formulas omega = omega0 + alpha*t and theta = omega0*t + half*alpha*t*t are both written in radians throughout, and switching to revolutions or degrees mid-calculation is the single most common source of a factor-of-2*pi or factor-of-360 error.',
  ARRAY[
    'is 6.28 the same as one full turn',
    'why do we use radians instead of just counting turns',
    'how many degrees is one radian',
    'do i convert to revolutions or keep it in radians',
    'whats the difference between an angle and a number of turns'
  ],
  'pending_review'
),
(
  'sign_of_alpha',
  'rotational_kinematics',
  'STATE_4',
  'Does negative α always mean slowing down?',
  'Alpha''s sign tells you whether omega is INCREASING or DECREASING, not directly whether the body is "speeding up" or "slowing down" in the everyday sense — those two only match when omega is positive to begin with. In this concept every guided state keeps omega positive (or zero), so a positive alpha does mean speeding up and a negative alpha does mean slowing down, exactly as narrated in STATE_3 (drive, alpha = +0.60) and STATE_5 (brake, alpha = -0.50) — but the general rule a student must carry forward is that alpha is the rate of change of omega, full stop, and its everyday meaning ("faster" or "slower") depends on the sign omega already has. A driven torque can even push omega through zero and reverse the spin (shown only in the STATE_8 sandbox, never in a guided state here) — in that case a "negative" alpha does not mean slowing down at all past the reversal, it means speeding up in the new direction. The single sign-proof habit worth building: compare the sign of alpha to the CURRENT sign of omega, not to the word "slowing" in isolation.',
  ARRAY[
    'does negative alpha mean its slowing down',
    'how do i know if alpha should be positive or negative',
    'is deceleration just negative acceleration',
    'why isnt alpha always positive if the wheel is spinning',
    'whats the sign convention for alpha'
  ],
  'pending_review'
),
(
  'linear_angular_mapping',
  'rotational_kinematics',
  'STATE_4',
  'Which straight-line equation matches which rotation equation?',
  'The three rotational quantities map onto the three straight-line quantities one-for-one, in the SAME roles: theta (angle turned) plays the role x (or s) plays in straight-line motion, omega (turning rate) plays the role v plays, and alpha (rate of change of turning rate) plays the role a plays. Every equation carries straight across with the substitution: v = u + a*t becomes omega = omega0 + alpha*t (STATE_4''s own equation), and x = u*t + half*a*t*t becomes theta = omega0*t + half*alpha*t*t (STATE_7). The mapping is not a coincidence to memorise term by term — it holds because omega IS literally the rate theta changes at, and alpha IS literally the rate omega changes at, the exact same relationship velocity and acceleration have to position in straight-line motion. The one thing that does NOT carry across from this concept is v = omega*r (STATE_6) — that equation has no straight-line analogue at all; it is a separate law connecting the ONE shared omega to a DIFFERENT quantity, a specific point''s linear speed, and confusing it with the omega = omega0 + alpha*t family is a common mis-map.',
  ARRAY[
    'which straight line equation matches which rotation equation',
    'does theta replace x or does omega replace x',
    'how do i know which formula to use for a spinning problem',
    'is omega the same idea as velocity just for spinning things',
    'whats the rotational version of v equals u plus at'
  ],
  'pending_review'
),
-- ─── STATE_6 — v = omega r, the most documented rotational-kinematics confusion ──
(
  'same_omega_different_v',
  'rotational_kinematics',
  'STATE_6',
  'If the whole body spins together, how can speeds differ?',
  'Every point of one rigid turntable DOES share exactly the same angular speed omega — that part of the intuition is correct, and it is exactly why theta and omega are meaningful single numbers for the whole body rather than needing to be tracked per point. What differs from point to point is the LINEAR speed v, because v = omega*r depends on each point''s own distance r from the axis: a point twice as far from the axle sweeps out a proportionally longer arc length in the very same time it takes the whole body to complete one shared rotation, so its linear speed must be proportionally larger even though it shares the identical turning rate. STATE_6''s two marked points prove this directly — both finish one full revolution at exactly the same instant (same omega, same period), yet the outer point''s tangent arrow is measured at exactly twice the length of the inner point''s (1.20 m/s vs 0.60 m/s), because the outer point travelled twice the arc length to complete that same shared turn. "One spin rate" and "one speed for every point" are simply two different claims, and only the first one is true.',
  ARRAY[
    'if the whole thing spins together how can speeds be different',
    'shouldnt every point on a spinning body move at the same speed',
    'why does the outer point go faster if theyre both turning together',
    'does the mass in the middle even move',
    'how can one spin rate give two different speeds'
  ],
  'pending_review'
),
(
  'which_r_in_v_omega_r',
  'rotational_kinematics',
  'STATE_6',
  'Is r the whole wheel''s radius or a specific point''s distance?',
  'In v = omega*r, r is always the distance from the ROTATION AXIS to the SPECIFIC POINT whose linear speed you are computing — never a fixed property of the whole object, and never "the wheel''s radius" unless the point you actually care about happens to sit right on the rim. STATE_6 makes this concrete with two different r values on the very same rigid body at the very same instant: the paint mark on the rod sits at r = 0.40 m from the axle and reads v = 0.60 m/s, while the mass at the rim sits at r = 0.80 m and reads v = 1.20 m/s — same omega, different r, different v, on one object. A point exactly on the axis has r = 0 and therefore v = 0 no matter how fast the body spins (the labelled dot at the axle in this concept, never drawn as a floored or minimum-length arrow — it is an honest, exact zero). The practical habit: before using v = omega*r, always ask "r from the axis to WHICH point" — a problem that only gives "the wheel''s radius" is really asking for the speed of a point ON the rim, and a different point needs a different r substituted in.',
  ARRAY[
    'is r the radius of the wheel or the distance to that point',
    'do i measure r from the edge or from the center',
    'does r change if the point is closer to the axle',
    'why isnt r just the wheels total radius every time',
    'how do i find r for a point thats not on the rim'
  ],
  'pending_review'
),
(
  'omega_vs_v_confusion',
  'rotational_kinematics',
  'STATE_6',
  'What''s the difference between ω and v?',
  'Omega and v are two genuinely different physical quantities, and their units make the difference impossible to lose once you look for it: omega is measured in radians per second (rad/s) and describes how fast the WHOLE rigid body is turning — one single number that is the same at every point of the body, because it describes the shared rotation itself, not any one location on it. v is measured in metres per second (m/s) and describes how fast one SPECIFIC point is physically moving through space — a genuinely different number at every different radius, because it depends on both omega and that point''s own distance r from the axis (v = omega*r). A student who says "the angular speed of the outer mass is bigger than the angular speed of the inner mass" has actually mixed the two up: both marks share the identical omega (they complete the same revolution in the same time), and it is only their v that differs. The reliable check whenever the two get confused: look at the units on the number you are quoting — rad/s can only ever be omega (or alpha, for rad/s squared), and m/s can only ever be a linear speed like v.',
  ARRAY[
    'whats the difference between omega and v',
    'are rad/s and m/s the same kind of speed',
    'why do we need two different speeds for one spin',
    'is angular speed the same as regular speed',
    'how do the units tell omega and v apart'
  ],
  'pending_review'
)
ON CONFLICT (cluster_id) DO UPDATE SET
  concept_id       = EXCLUDED.concept_id,
  state_id         = EXCLUDED.state_id,
  label            = EXCLUDED.label,
  description      = EXCLUDED.description,
  trigger_examples = EXCLUDED.trigger_examples,
  status           = EXCLUDED.status;

-- Verification after applying (expect 6):
--   SELECT count(*) FROM confusion_cluster_registry
--    WHERE concept_id = 'rotational_kinematics';
-- And that every cluster_id here appears in the concept JSON's drill_downs:
--   STATE_4 radians_vs_revolutions | sign_of_alpha | linear_angular_mapping
--   STATE_6 same_omega_different_v | which_r_in_v_omega_r | omega_vs_v_confusion
