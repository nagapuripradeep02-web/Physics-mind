-- supabase_2026-07-25_seed_newton_third_law_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters (3 per has_prebuilt_deep_dive state)
-- for newton_third_law.json. Authored 2026-07-25 by alex:json_author per
-- architect skeleton §5/§6 + physics_author §8 (Laws of Motion, lom-b worktree).
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- Each trigger_examples array carries 5 real-student phrasings (lowercase, idiomatic,
-- no textbook prose) taken VERBATIM from the physics_author handoff. status='pending_review'
-- per cluster-registry convention.
--
-- TWO deep-dive states (architect §5, cross-referenced with the Pass-1 cliff sentences):
--   STATE_2 — unequal masses, equal forces (SUPPORTING aha): 3 clusters
--     heavier_pushes_harder_myth, equal_forces_unequal_effects, who_exerts_the_force
--   STATE_3 — isolate one body, why the pair never cancels (PRIMARY aha): 3 clusters
--     action_reaction_never_cancel, pair_vs_balanced_forces, identify_the_pair
--
-- NOTE: this migration is authored but NOT applied here (json_author does not run
-- apply_migration). quality_auditor's pre-run step applies it.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_2 unequal-masses-equal-forces deep-dive ────────────────────
(
  'heavier_pushes_harder_myth',
  'newton_third_law',
  'STATE_2',
  'Doesn''t the heavier thing push harder?',
  'Student holds the everyday default: whoever "wins" a shoving match must be exerting the greater force, since the heavier person visibly moves the lighter one more. Needs to see that the two applied-force arrows stay pixel-identical however unequal the masses -- only the accelerations differ, exactly 3:1 with the 1:3 mass ratio.',
  ARRAY[
    'doesnt the heavier thing push harder',
    'shouldnt the bigger block win the push',
    'why is the force the same if the masses arent',
    'if one is 3 times heavier shouldnt its push be 3 times bigger',
    'why do they feel different if the force is equal'
  ],
  'pending_review'
),
(
  'equal_forces_unequal_effects',
  'newton_third_law',
  'STATE_2',
  'Why does the light one fly off if the force is the same?',
  'Student sees the dramatically different motion outcomes (one block shoots away, the other barely creeps) and assumes the CAUSE (force) must differ too. Needs the a = F/m read-off made explicit: identical force, different mass, therefore different acceleration -- the motion difference lives entirely in a, never in F.',
  ARRAY[
    'why does the light one fly off if the force is the same',
    'same push so why is one barely moving',
    'how can equal forces cause such different motion',
    'if forces are equal why isnt the speed',
    'why does mass change the outcome if the force didnt change'
  ],
  'pending_review'
),
(
  'who_exerts_the_force',
  'newton_third_law',
  'STATE_2',
  'Does a wall or a much bigger object really push back exactly as hard?',
  'Student doubts that an inanimate or vastly more massive object (a wall, the floor, a truck) can exert a real, equal-magnitude force back on a much smaller pusher. Needs the third-law pair generalized beyond two comparable bodies: any interaction, however mismatched, trades equal and opposite forces.',
  ARRAY[
    'does a wall push back on me',
    'how can a wall push if it isnt even moving',
    'does the floor really push up on me as hard as I push down',
    'why does a lighter object still push back on something huge',
    'does a fly really push back on a truck'
  ],
  'pending_review'
),
-- ─── STATE_3 isolate-one-body deep-dive ───────────────────────────────
(
  'action_reaction_never_cancel',
  'newton_third_law',
  'STATE_3',
  'If forces are equal and opposite, why doesn''t everything just stay still?',
  'Student sums the third-law pair to zero as if it were a single body''s net force. Needs the different-bodies argument made explicit: block one''s own diagram carries only ONE of the two forces (F₁₂); its partner (F₂₁) acts on block two, so block one''s net force is genuinely nonzero.',
  ARRAY[
    'if forces are equal and opposite why doesnt everything just stay still',
    'shouldnt equal and opposite mean zero net force',
    'why does anything move if every force has an equal opposite',
    'doesnt equal and opposite mean they cancel out',
    'why can I still push a wall and move if it pushes back equally'
  ],
  'pending_review'
),
(
  'pair_vs_balanced_forces',
  'newton_third_law',
  'STATE_3',
  'Aren''t weight and the normal force a third-law pair too?',
  'Student conflates a SAME-BODY balanced-force pair (mg and N, which genuinely cancel because both act on block one) with a genuine third-law pair (which never shares a body). Needs the distinguishing test named explicitly: same body that cancels vs different bodies that never do.',
  ARRAY[
    'arent weight and normal force the third law pair',
    'why dont mg and N count as action reaction',
    'if mg and N cancel arent they the same kind of pair as the push',
    'whats the difference between balanced forces and a third law pair',
    'why does it matter what body a force acts on'
  ],
  'pending_review'
),
(
  'identify_the_pair',
  'newton_third_law',
  'STATE_3',
  'How do I find the partner force for any given force?',
  'Student lacks a general procedure for identifying a force''s third-law partner (same interaction type, same magnitude, opposite direction, acting on the OTHER body). Needs the swap rule stated explicitly: "A on B" always pairs with "B on A" of the identical force type.',
  ARRAY[
    'how do I know which force is the reaction to which',
    'is the reaction always the opposite type of force',
    'does gravity have a reaction force too',
    'so what pulls the earth up when it pulls me down',
    'how do I find the partner force for any given force'
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
