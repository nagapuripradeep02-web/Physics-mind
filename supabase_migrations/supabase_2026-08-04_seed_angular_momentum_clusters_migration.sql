-- supabase_2026-08-04_seed_angular_momentum_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters for angular_momentum.json —
-- Class 11 Ch.7 System of Particles and Rotational Motion, concept #9 (Desk C,
-- feat/rotmech-c). Authored against the rigid_body_rotation field_3d engine
-- (docs/loop_runs/rotmech/APPARATUS_CONTRACT.md), pure configuration, zero
-- renderer edits. chapter:7, section:"7.9", prerequisites:
-- ["rigid_body_rotation","rotational_kinematics","torque","moment_of_inertia"].
--
-- Authored 2026-08-04 by alex:json_author, using the physics_author's
-- drill-down trigger phrases VERBATIM
-- (docs/loop_runs/rotmech/angular_momentum/physics_block.md §5):
--   STATE_3 — l_vs_spin_speed_identity, why_mass_position_matters,
--             stopped_body_zero_L;
--   STATE_4 — which_way_does_L_point, right_hand_rule_how, why_axis_not_tangent.
--
-- Migration is AUTHORED, NOT APPLIED. json_author's own tooling forbids
-- `apply_migration` — this file is left for the founder / quality_auditor's
-- pre-run step. Drill-down itself is DEFERRED (Rule 18, 2026-06-10 directive)
-- — the confusion_cluster_registry Gate-8 probe is N/A-DORMANT this phase per
-- the documented false-FAIL scar (memory: auditor-cluster-registry-false-fail).
-- Do not let the auditor re-route json_author to "fix" this.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- status='pending_review' per the current cluster-registry convention.
--
-- has_prebuilt_deep_dive picks (architect skeleton REV 4 §5, metadata only,
-- Rule 18): STATE_3 (the primary aha — "isn't L just the spin rate?" is where
-- the concept's identity sticks) and STATE_4 (direction/right-hand rule — the
-- historic sticking point for every axial vector). Both states carry a
-- drill_downs array in the concept JSON referencing these cluster_ids.
--
-- REGISTRATION NOTE (Desk C guardrail 4): this desk is READ-ONLY on all 8
-- registration sites — panelConfig.ts, CONCEPT_RENDERER_MAP,
-- VALID_CONCEPT_IDS and CLASSIFIER_PROMPT were pre-registered on master in
-- commit 4b289d4. This migration therefore carries ONLY the
-- confusion_cluster_registry rows — no concept_panel_config dual-registration
-- INSERT, unlike some sibling migrations, to avoid touching a table the
-- pre-registration commit may already own.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_3 l_vs_spin_speed_identity deep-dive ─────────────────────────
(
  'l_vs_spin_speed_identity',
  'angular_momentum',
  'STATE_3',
  'Isn''t angular momentum just the spin rate with a different name?',
  'Student has just watched L track omega in exact lockstep in the previous state (the brake beat), which makes L feel like a rescaled copy of omega rather than its own quantity — "if I already know how fast it spins, why do I need a second number?" Angular momentum is the PRODUCT of two independently legible quantities, L = I.omega, not a renamed copy of either one. In the previous state I was held fixed while omega fell, so the two numbers moved together and the distinction was invisible by design. This state changes I instead of omega — stopping the platform, sliding the masses in, and restarting at the exact same spin speed as before — and L lands at a completely different number even though omega reads identically. Two bodies can spin at the same rate and carry very different angular momentum, because L depends on WHERE the mass sits, not only on how fast it goes around.',
  ARRAY[
    'isnt angular momentum just the spin rate',
    'why do we need L if we already have omega',
    'L and omega feel like the same thing to me',
    'whats different between angular momentum and how fast it spins',
    'if the speed is the same shouldnt L be the same'
  ],
  'pending_review'
),
-- ─── STATE_3 why_mass_position_matters deep-dive ────────────────────────
(
  'why_mass_position_matters',
  'angular_momentum',
  'STATE_3',
  'Why does moving the masses change L if the spin speed didn''t change?',
  'Student accepts that force or speed changes a quantity, but "where the mass sits" feels like a geometry fact, not a physics cause worth changing L — especially once the masses are back to spinning at the familiar 1.50 rad/s. Angular momentum is L = I.omega, and I itself depends on how far the mass sits from the axle: I = I_frame + 2.m.r^2. Sliding the two masses inward from r = 0.80 m to r = 0.20 m shrinks I from 3.06 kg.m^2 down to 0.66 kg.m^2 — nearly a five-fold drop — because moment of inertia weights each bit of mass by the SQUARE of its distance from the axis. Restarting at the identical spin speed then multiplies that smaller I by the same omega, landing L at 0.99 kg.m^2/s instead of 4.59 kg.m^2/s. The mass never left the machine and the spin rate never changed; only its distance from the axle did, and that distance enters the formula for I as directly as force enters Newton''s second law.',
  ARRAY[
    'why does moving the masses change L if the speed didnt change',
    'how can where the mass sits matter as much as speed',
    'the spin rate is identical so why is L different',
    'why does mass position affect angular momentum',
    'does it matter how far the mass is from the axle'
  ],
  'pending_review'
),
-- ─── STATE_3 stopped_body_zero_L deep-dive ──────────────────────────────
(
  'stopped_body_zero_L',
  'angular_momentum',
  'STATE_3',
  'Does a stopped turntable still carry any angular momentum?',
  'Student has just seen the masses slide inward while the platform sits still, and may expect the machine to "remember" some angular momentum from before it stopped — after all, the mass and the machine are both still there, only their arrangement changed. Angular momentum is L = I.omega, and while the platform is braked to a complete stop, omega is exactly zero. A product with one factor equal to zero is zero, whatever the other factor is doing — so L reads 0.00 kg.m^2/s during the entire still interval, even as I is actively falling from 3.06 down to 0.66 kg.m^2 as the masses slide in. There is nothing left over from before the brake acted: L is not a stored quantity that survives a stop, it is a live product recomputed from the body''s CURRENT spin rate and CURRENT mass arrangement, every instant. Only once the platform is spun back up does L become nonzero again — and it lands at a new value set by the new I, not by whatever it read before stopping.',
  ARRAY[
    'does a stopped turntable still have angular momentum',
    'if its not spinning is L zero',
    'can something at rest carry angular momentum',
    'why does L drop to zero when it stops',
    'is angular momentum only there while it spins'
  ],
  'pending_review'
),
-- ─── STATE_4 which_way_does_L_point deep-dive ───────────────────────────
(
  'which_way_does_L_point',
  'angular_momentum',
  'STATE_4',
  'How can a spin have a direction at all?',
  'Student has only ever pictured motion as a straight arrow, and a spinning body doesn''t obviously have one — every point on the turntable is moving in a different direction at every instant, so "which way is it going" seems like an unanswerable question. A spinning body DOES have one single, fixed direction associated with it: the direction of its rotation axis, the one line every part of the body holds still relative to. Angular momentum L is a vector pointing ALONG that axis, not along any point''s changing path around it. On this turntable, that axis is the vertical axle running through the centre — the same line whether you look at the mass on the left arm or the mass on the right arm, at any instant. Flip the spin the other way and the axis line stays exactly where it was; only which END of it L points toward changes.',
  ARRAY[
    'how can a spin have a direction',
    'which way does angular momentum point',
    'a spinning wheel doesnt go anywhere so how does L have a direction',
    'why does L point along the axle and not around the rim',
    'does angular momentum point up or down'
  ],
  'pending_review'
),
-- ─── STATE_4 right_hand_rule_how deep-dive ──────────────────────────────
(
  'right_hand_rule_how',
  'angular_momentum',
  'STATE_4',
  'How do I actually use the right-hand rule for this?',
  'Student has heard "right-hand rule" before, possibly from a different context (like the force on a moving charge), and isn''t sure which fingers curl which way for angular momentum specifically, or whether it''s the same rule at all. For angular momentum, the rule is the GRIP rule: curl the fingers of the right hand in the direction the body is SPINNING — the same sense the masses are sweeping around the axle — and the thumb, sticking straight out, points along the direction of L. Watching the turntable spin one way, curling the fingers along with that spin sends the thumb upward; reverse the spin and curling the fingers the new way sends the thumb downward, along the exact same axle line. It only takes one motion — matching the curl to the visible spin — and the thumb does the rest.',
  ARRAY[
    'how do I actually use the right hand rule here',
    'which fingers curl which way for angular momentum',
    'how do you find the direction of L with your hand',
    'do I curl my fingers with the spin or against it',
    'whats the trick to remembering the right hand rule'
  ],
  'pending_review'
),
-- ─── STATE_4 why_axis_not_tangent deep-dive ─────────────────────────────
(
  'why_axis_not_tangent',
  'angular_momentum',
  'STATE_4',
  'Why doesn''t L point the way the mass is actually moving?',
  'Student is used to linear momentum p = m.v, where the vector points exactly along the object''s own velocity — so it feels natural to expect angular momentum to point along whichever direction a mass on the rim happens to be moving at that instant. But every mass on a spinning body moves in a DIFFERENT and constantly changing direction — the mass on the left arm sweeps one way, the mass on the right arm sweeps the opposite way, and a single mass''s own heading rotates every instant it is in motion. No one tangential direction could ever represent the whole spinning body, because there isn''t just one. The axis, by contrast, is the ONE line every part of the body agrees on — nothing about the rod, the masses, or the platform ever points along it or crosses it as the body turns. Angular momentum is defined along that shared, unchanging axis precisely because a tangential direction could never stay fixed long enough to describe the whole rotating body at once.',
  ARRAY[
    'why doesnt L point the way the mass is moving',
    'shouldnt angular momentum point along the motion of the spinning mass',
    'why is L along the axle and not tangent to the circle',
    'the mass moves in a circle so why is L a straight line',
    'why does L ignore the direction each point is actually moving'
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
