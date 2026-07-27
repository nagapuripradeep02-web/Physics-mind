-- supabase_2026-07-25_seed_newton_second_law_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters (3 per has_prebuilt_deep_dive state)
-- for newton_second_law.json. Authored 2026-07-25 by alex:json_author per
-- architect skeleton §5/§6 + physics_author §5 (Laws of Motion, lom-b worktree).
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- Each trigger_examples array carries 5 real-student phrasings (lowercase, idiomatic,
-- no textbook prose) taken VERBATIM from the physics_author handoff. status='pending_review'
-- per cluster-registry convention.
--
-- TWO deep-dive states (architect §5, cross-referenced with the Pass-1 cliff sentences):
--   STATE_1 — steady force from rest (PRIMARY aha): 3 clusters
--     force_gives_acceleration_not_velocity, what_if_the_force_stops, net_force_vs_applied_force
--   STATE_2 — mass compare, same force (SUPPORTING aha): 3 clusters
--     mass_as_inertia, mass_vs_weight_confusion, proportionality_reasoning
--
-- NOTE: this migration is authored but NOT applied here (json_author does not run
-- apply_migration). quality_auditor's pre-run step applies it.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_1 steady-force-from-rest deep-dive ─────────────────────────
(
  'force_gives_acceleration_not_velocity',
  'newton_second_law',
  'STATE_1',
  'Shouldn''t a constant force mean a constant speed?',
  'Student holds the everyday default: a steadily applied push should produce a steady speed, because in lived experience hidden friction usually cancels the push. Needs to see that the acceleration reading a is pinned constant from frame 1 while the velocity reading v climbs every second without limit.',
  ARRAY[
    'if the force never changes why does the speed keep going up',
    'shouldnt a constant force mean a constant speed',
    'why does v keep climbing when F stays the same',
    'isnt force just how fast something moves',
    'why does a stay the same number the whole time'
  ],
  'pending_review'
),
(
  'what_if_the_force_stops',
  'newton_second_law',
  'STATE_1',
  'What happens to the speed the moment the force turns off?',
  'Student wants the bridge back to newton_first_law: cutting the applied force drops the acceleration to zero, but the velocity already gained is KEPT, not undone. Needs the two-law connection made explicit — a = 0 does not mean v = 0.',
  ARRAY[
    'what happens to the speed the moment you turn the force off',
    'does it stop instantly if F goes to zero',
    'does the block keep the speed it already has',
    'why would a drop to zero but not v',
    'so cutting the force doesnt undo the speed already gained'
  ],
  'pending_review'
),
(
  'net_force_vs_applied_force',
  'newton_second_law',
  'STATE_1',
  'Why is the applied force treated as the net force here?',
  'Student questions why F_applied and F_net read identically throughout this concept. Needs the frictionless, flat-floor scope made explicit: with no incline component and no friction to subtract, the applied force IS the entire net force — a special case, not a general rule.',
  ARRAY[
    'why is F applied the same as the net force here',
    'wheres the other forces that should be subtracted',
    'does frictionless mean applied force is automatically the net force',
    'when would applied force not equal net force',
    'why doesnt gravity show up in F net here'
  ],
  'pending_review'
),
-- ─── STATE_2 mass-compare deep-dive ───────────────────────────────────
(
  'mass_as_inertia',
  'newton_second_law',
  'STATE_2',
  'Why does the heavier block get less acceleration from the same push?',
  'Student has not internalized mass as resistance to a CHANGE in motion (inertia), only as "heaviness". Needs the two-lane race: identical force arrows, only mass differs, and the double-mass block''s acceleration reading is exactly half at every instant.',
  ARRAY[
    'why does the heavier block get less acceleration from the same push',
    'is mass just about how much something weighs',
    'why doesnt the heavier one just need more time not less acceleration',
    'whats actually resisting the push in the heavier block',
    'why call mass inertia instead of just weight'
  ],
  'pending_review'
),
(
  'mass_vs_weight_confusion',
  'newton_second_law',
  'STATE_2',
  'Isn''t mass the same thing as weight?',
  'Student conflates the m in a = F/m (kilograms, the inertia term) with weight (the force of gravity, m*g). Needs the distinction made explicit: mass is what resists acceleration under ANY force, weight is one particular force acting on that mass.',
  ARRAY[
    'isnt mass the same thing as weight',
    'why do we use kg here and not the force of gravity',
    'would this block have less mass on the moon',
    'does m in F equals ma change if gravity changes',
    'why does doubling mass matter if gravity is the same'
  ],
  'pending_review'
),
(
  'proportionality_reasoning',
  'newton_second_law',
  'STATE_2',
  'Does doubling the mass always exactly halve the acceleration?',
  'Student is unsure whether the inverse relationship between mass and acceleration is exact or approximate, and whether it generalizes to other ratios (tripling, quadrupling). Needs the a = F/m proportionality stated as an exact, general inverse relationship.',
  ARRAY[
    'if mass doubles does acceleration always exactly halve',
    'how do you know its exactly half without doing the math',
    'does tripling the mass do the same kind of thing',
    'why is it inverse and not some other relationship',
    'can I just eyeball the ratio from the two accelerations'
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
