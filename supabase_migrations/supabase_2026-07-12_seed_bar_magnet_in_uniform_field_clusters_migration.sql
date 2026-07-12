-- supabase_2026-07-12_seed_bar_magnet_in_uniform_field_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for
-- bar_magnet_in_uniform_field.json — Ch.5 concept #2 of the founder's
-- 2026-07-12 Socratic->straightforward rebuild batch (field_3d, reuses the
-- shared torque-loop/applyDipoleInFieldState engine with the electric-dipole
-- sibling). Authored 2026-07-12 by alex:json_author per architect skeleton
-- §5/§6 (has_prebuilt_deep_dive states: STATE_4, STATE_6, STATE_7) +
-- physics_author's drill-down trigger phrases (verbatim, §5 of the physics
-- block).
--
-- Migration is AUTHORED, NOT APPLIED — quality_auditor's pre-run step
-- applies it (json_author is forbidden from apply_migration). Drill-down
-- itself is DEFERRED (Rule 18, 2026-06-10 directive) — the
-- confusion_cluster_registry Gate-8 probe is N/A-DORMANT this phase per the
-- documented false-FAIL scar (memory: auditor-cluster-registry-false-fail).
-- Do not let the auditor re-route json_author to "fix" this.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- Each trigger_examples array carries 5 real student-voice phrasings (lowercase,
-- idiomatic, no textbook prose), verbatim from the physics block.
-- status='pending_review' per the current cluster-registry convention.
--
-- Candidate cluster_ids (architect skeleton §6, physics block §5):
--   STATE_4 — zero_force_but_torque · what_is_a_couple · uniform_vs_nonuniform_field_force
--   STATE_6 — torque_cross_product_geometry · torque_zero_at_alignment · tau_direction_right_hand_rule
--   STATE_7 — stable_vs_unstable_equilibrium · potential_energy_negative_sign · work_to_rotate_dipole

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_4 zero_force_but_torque deep-dive ──────────────────────────
(
  'zero_force_but_torque',
  'bar_magnet_in_uniform_field',
  'STATE_4',
  'How can the magnet turn if the net force on it is zero?',
  'Student conflates "zero net force" with "nothing happens", missing that force and torque are independent quantities. In a uniform field the two pole forces (+mB on N, −mB on S) are equal and opposite, so ΣF = 0 exactly — the sim stamps this with a badge while a centre-pin marker holds fixed, proving the magnet never translates. But the same two forces act on DIFFERENT lines (a couple), and a couple''s torque τ = m × B is entirely independent of whether the net force is zero. The magnet visibly swings toward alignment (STATE_4''s damped-swing motion) at the exact instant the ΣF = 0 badge is showing — both facts true at once, which is this concept''s PRIMARY aha.',
  ARRAY[
    'if forces cancel how does it turn',
    'net force is zero so why does it move',
    'doesnt zero force mean nothing happens',
    'how can something rotate with no force on it',
    'why does the magnet turn if the pushes cancel out'
  ],
  'pending_review'
),
-- ─── STATE_4 what_is_a_couple deep-dive ───────────────────────────────
(
  'what_is_a_couple',
  'bar_magnet_in_uniform_field',
  'STATE_4',
  'What exactly is a couple, and how is it different from just balanced forces?',
  'Student has seen "equal and opposite forces cancel" from ordinary equilibrium problems and does not yet see why a bar magnet''s pole forces are special. A couple is two forces that are equal in magnitude, opposite in direction, AND act along two DIFFERENT parallel lines (here, at the N pole and the S pole, separated by the magnet''s length) — that offset is what produces a net TURNING effect (torque) even though the net force is zero. Ordinary balanced forces acting along the SAME line produce neither translation nor rotation; a couple produces rotation only. STATE_3''s two force arrows growing out from opposite ends of the bar, not from the same point, is the visual that makes this distinction concrete.',
  ARRAY[
    'what exactly is a couple in physics',
    'is a couple just two equal opposite forces',
    'why do the two mB forces not cancel completely',
    'difference between a couple and just balanced forces',
    'why does a couple twist but not push'
  ],
  'pending_review'
),
-- ─── STATE_4 uniform_vs_nonuniform_field_force deep-dive ──────────────
(
  'uniform_vs_nonuniform_field_force',
  'bar_magnet_in_uniform_field',
  'STATE_4',
  'Would a magnet feel a net force in a field that is NOT uniform?',
  'Student generalizes "the magnet doesn''t translate" as a universal rule for any magnet in any field, missing that this concept''s ΣF = 0 result depends specifically on the field being UNIFORM (identical magnitude and direction everywhere the magnet sits). If the field varies with position — stronger near one pole than the other — the two pole forces no longer cancel exactly, leaving a residual net force (a gradient term) that DOES pull the magnet bodily, the way a fridge magnet is pulled toward a stronger source. This concept deliberately covers only the uniform case (the constraint list states it explicitly); the non-uniform case is out of scope but worth naming so the "no net force ever" belief doesn''t over-generalize.',
  ARRAY[
    'would a magnet slide in a field that is not uniform',
    'why only uniform field gives zero net force',
    'does a non uniform field pull the magnet sideways',
    'why does the same magnet behave differently near a pole',
    'so is there ever a real net force on a magnet in a field'
  ],
  'pending_review'
),
-- ─── STATE_6 torque_cross_product_geometry deep-dive ──────────────────
(
  'torque_cross_product_geometry',
  'bar_magnet_in_uniform_field',
  'STATE_6',
  'Why is torque biggest at 90 degrees instead of at 0 degrees?',
  'Student assumes "more aligned = stronger effect" by analogy with force problems, but torque here is a CROSS product (τ = m × B, magnitude mB·sinθ), not a dot product — cross products are LARGEST when the two vectors are perpendicular and ZERO when they are parallel, the opposite of the intuition students bring from projection/component problems. STATE_6''s pose-compare motion makes this a held comparison: at θ = 0° the τ arrow is completely absent; snapped to θ = 90° it springs out fully extended with the HUD reading τ = mB, the maximum. The geometry, not intuition, decides where the effect peaks.',
  ARRAY[
    'why is torque biggest at 90 degrees not 0',
    'how is torque related to cross product geometry',
    'why does sin theta control the torque size',
    'isnt aligned position supposed to be the strongest',
    'why does perpendicular give maximum turning effect'
  ],
  'pending_review'
),
-- ─── STATE_6 torque_zero_at_alignment deep-dive ───────────────────────
(
  'torque_zero_at_alignment',
  'bar_magnet_in_uniform_field',
  'STATE_6',
  'Why is torque zero when the magnet is aligned with the field, at BOTH 0 and 180 degrees?',
  'Student expects only ONE angle to give zero torque (usually guessing it should be where the magnet is "settled"), missing that τ = mB·sinθ vanishes at BOTH θ = 0° (aligned) and θ = 180° (anti-aligned) — sin is zero at both extremes of the pose-compare cycle. The couple''s two pole forces still exist at these angles (they never vanish — F = mB always), but their lines of action collapse onto the SAME line as the magnet''s own axis, so there is no offset left to twist with. STATE_6''s three-pose cycle (0° torque-free, 90° maximum, 180° torque-free again) is designed to make both zero-torque angles visible in the same held comparison, not just the aligned one.',
  ARRAY[
    'why is torque zero when magnet is aligned with field',
    'if m and B are parallel why is there no twist',
    'why does 180 degrees also give zero torque',
    'at 0 degrees the forces are still there so why no turning',
    'why does the couple stop turning exactly at alignment'
  ],
  'pending_review'
),
-- ─── STATE_6 tau_direction_right_hand_rule deep-dive ──────────────────
(
  'tau_direction_right_hand_rule',
  'bar_magnet_in_uniform_field',
  'STATE_6',
  'Which way does the torque vector tau actually point, using the right-hand rule?',
  'Student can compute the MAGNITUDE mB·sinθ but has not connected it to the DIRECTION of τ = m × B, which is perpendicular to BOTH m and B (curl the right-hand fingers from m toward B; the thumb gives τ). The sim draws the purple τ arrow perpendicular to the m–B rotation plane throughout STATE_4-STATE_9 precisely to make this direction visible rather than asserted — the arrow always points out of the plane the magnet is sweeping through, and it flips to the opposite perpendicular sense if the roles of m and B (or the sense of θ) are reversed.',
  ARRAY[
    'which way does torque point using right hand rule',
    'how do i find the direction of tau from m and B',
    'why is torque perpendicular to both m and B',
    'does the direction of tau ever flip',
    'how do i curl my fingers for m cross B'
  ],
  'pending_review'
),
-- ─── STATE_7 stable_vs_unstable_equilibrium deep-dive ─────────────────
(
  'stable_vs_unstable_equilibrium',
  'bar_magnet_in_uniform_field',
  'STATE_7',
  'Why is 180 degrees not just as stable as 0 degrees, if the torque is zero at both?',
  'Student treats "zero torque" as the complete definition of equilibrium, missing that ZERO TORQUE is necessary but not sufficient for STABILITY — stability is decided by the potential energy U = −mB·cosθ, not by τ alone. θ = 0° is an energy MINIMUM (any nudge raises U, so a restoring torque pushes the magnet back); θ = 180° is an energy MAXIMUM (any nudge lowers U, so the torque grows the deviation instead). STATE_7''s single nudge — applied to a magnet released near 180° — is designed to show this asymmetry directly: the magnet does not oscillate gently like a 0°-released magnet would; it lingers, then accelerates away and flips all the way to 0°, with the U-marker falling from the top of the meter to the bottom.',
  ARRAY[
    'why is 180 degrees not stable if torque is zero there too',
    'what makes one equilibrium stable and another unstable',
    'why does a small nudge bring it back at 0 but not at 180',
    'is zero torque enough to call something an equilibrium',
    'why does the magnet flip all the way around from 180'
  ],
  'pending_review'
),
-- ─── STATE_7 potential_energy_negative_sign deep-dive ─────────────────
(
  'potential_energy_negative_sign',
  'bar_magnet_in_uniform_field',
  'STATE_7',
  'Why does the potential energy formula U = -mB cos(theta) have a negative sign?',
  'Student sees the minus sign in U = −mB·cosθ and either drops it or treats it as an arbitrary convention, missing that the sign is what correctly places the STABLE orientation at the ENERGY MINIMUM. Since cosθ = +1 at θ = 0°, U = −mB there is the most NEGATIVE (lowest) value in the whole range — exactly where the magnet naturally settles. Drop the minus sign and the formula would instead predict θ = 180° as the energy minimum, contradicting the observed physics. The U-meter in STATE_7 anchors this concretely: the marker sits at the BOTTOM of the track at θ = 0° (lowest, stable) and at the TOP at θ = 180° (highest, unstable) — the sign is what makes "bottom of the meter" and "stable" the same statement.',
  ARRAY[
    'why does U have a negative sign in the formula',
    'what does negative potential energy actually mean here',
    'why is U lowest exactly where the magnet is stable',
    'does negative U mean negative work is being done',
    'why is U zero at 90 degrees and not at 0'
  ],
  'pending_review'
),
-- ─── STATE_7 work_to_rotate_dipole deep-dive ──────────────────────────
(
  'work_to_rotate_dipole',
  'bar_magnet_in_uniform_field',
  'STATE_7',
  'How much work does it take to flip the magnet from 0 degrees all the way to 180 degrees?',
  'Student wants to connect the τ(θ) and U(θ) pictures to an actual WORK number, a natural next question this diamond intentionally defers past its atomic scope. The work done AGAINST the field to rotate the magnet from θ = 0° to θ = 180° equals the change in potential energy, W = U(180°) − U(0°) = (+mB) − (−mB) = 2mB — twice the maximum torque-energy scale, all of it stored as potential energy at the unstable peak and available to release once let go (which is exactly what STATE_7''s Pair-B nudge-and-flip shows happening in reverse, the stored energy converting back to motion). Deferred to a future drill-down state once real student confusion data exists; the underlying formula is already fully determined by the U(θ) this concept teaches.',
  ARRAY[
    'how much work does it take to flip the magnet from 0 to 180',
    'why does rotating the magnet cost energy at all',
    'is the work done equal to the change in U',
    'where does the energy go when the magnet swings back on its own',
    'why does it take more work to go from 0 to 90 than 90 to 180'
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
