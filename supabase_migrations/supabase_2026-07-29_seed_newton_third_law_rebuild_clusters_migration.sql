-- supabase_2026-07-29_seed_newton_third_law_rebuild_clusters_migration.sql
-- REBUILD (feat/lom-b, founder diagnosis 2026-07-29): replaces the 6 drill-down
-- clusters seeded by supabase_2026-07-25_seed_newton_third_law_clusters_migration.sql.
-- The 5-state arc changed (spring/push_off/wall apparatus, misconceptions now
-- confronted at STATE_2 and STATE_4, not STATE_2/STATE_3), so the cluster ids
-- themselves changed to match the new physics_author drill-down phrasings
-- (docs/loop_runs/lom/newton_third_law/physics_block.md §5). This migration
-- does NOT delete the old 6 rows (heavier_pushes_harder_myth,
-- equal_forces_unequal_effects, who_exerts_the_force, action_reaction_never_cancel,
-- pair_vs_balanced_forces, identify_the_pair) — they become orphaned/unreferenced
-- by the new concept JSON but are left in place per the "sacred, never delete
-- confusion data" convention; a human reviewer may prune them later.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- Each trigger_examples array carries 5 real-student phrasings (lowercase, idiomatic,
-- no textbook prose) taken VERBATIM from the physics_author handoff. status='pending_review'
-- per cluster-registry convention.
--
-- TWO deep-dive states (skeleton §5, cross-referenced with physics_block §5):
--   STATE_2 — unequal masses, equal forces (PRIMARY aha): 3 clusters
--     heavier_pushes_harder, truck_car_collision_forces, action_reaction_magnitude_equality
--   STATE_4 — isolate each cart's own diagram (SUPPORTING aha): 3 clusters
--     action_reaction_cancel_fallacy, third_law_pair_identification,
--     internal_forces_cannot_self_accelerate
--
-- NOTE: this migration is authored but NOT applied here (json_author does not run
-- apply_migration). quality_auditor's pre-run step applies it.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_2 unequal-masses-equal-forces deep-dive ────────────────────
(
  'heavier_pushes_harder',
  'newton_third_law',
  'STATE_2',
  'Doesn''t the heavier cart push less?',
  'Student holds the everyday default: whoever "wins" a shoving match must be exerting the greater force, since the heavier cart visibly moves the lighter one less. Needs to see that the two applied-force arrows stay pixel-identical (30.0 N) however unequal the masses -- only the accelerations differ, exactly 3:1 with the 1:3 mass ratio.',
  ARRAY[
    'why does the heavier cart push less',
    'shouldnt the big cart exert more force',
    'the truck is heavier so it must push harder right',
    'if masses are different how can the forces be equal',
    'does a bigger object always push with more force'
  ],
  'pending_review'
),
(
  'truck_car_collision_forces',
  'newton_third_law',
  'STATE_2',
  'In a car-truck crash, does the truck really hit harder?',
  'Student generalizes the mass-blind force pair to a real-world collision and doubts it, because the damage outcome is so lopsided. Needs the same a = F/m read-off extended to a collision: equal forces, wildly different accelerations (and therefore wildly different damage), because mass -- not force -- decides the response.',
  ARRAY[
    'in a car truck crash does the truck hit harder',
    'why does the car get destroyed if forces are equal',
    'the truck barely moves so it must have pushed more',
    'equal force but unequal damage how',
    'why does the smaller vehicle always lose if force is the same'
  ],
  'pending_review'
),
(
  'action_reaction_magnitude_equality',
  'newton_third_law',
  'STATE_2',
  'Is the force pair exactly equal, or just approximately equal?',
  'Student is unsure whether the third-law equality is an exact, instant-by-instant statement or an approximation that only roughly holds. Needs the readouts shown holding EXACTLY equal (30.0 N = 30.0 N) at every single frame throughout the push, including while both carts are actively accelerating.',
  ARRAY[
    'is the equality exact or just approximate',
    'are the forces equal even while the cart is speeding up',
    'does the equal and opposite hold at every single instant',
    'what if one cart accelerates faster does the force change',
    'is F on A always exactly F on B no matter what'
  ],
  'pending_review'
),
-- ─── STATE_4 isolate-each-cart's-own-diagram deep-dive ────────────────
(
  'action_reaction_cancel_fallacy',
  'newton_third_law',
  'STATE_4',
  'If forces are equal and opposite, why doesn''t everything just stay still?',
  'Student sums the third-law pair to zero as if it were a single body''s net force. Needs the different-bodies argument made explicit: cart one''s own diagram carries only ONE half of the pair (F21) plus its own grip (f1), which cancel on that SAME body -- the partner force F12 acts on cart two, a different body entirely.',
  ARRAY[
    'equal and opposite so why does anything move at all',
    'if forces cancel how does the cart go anywhere',
    'action equals reaction so shouldnt everything stay still',
    'why doesnt the pair just cancel out to zero',
    'if they are always equal and opposite whats the point of pushing'
  ],
  'pending_review'
),
(
  'third_law_pair_identification',
  'newton_third_law',
  'STATE_4',
  'How do I know which two forces are a genuine third-law pair?',
  'Student lacks a general procedure for identifying a force''s third-law partner and often conflates a same-body balanced-force pair (weight and normal, which cancel because both act on the same body) with a genuine third-law pair (which never shares a body). Needs the distinguishing test named explicitly.',
  ARRAY[
    'is weight and normal force a third law pair',
    'why isnt mg and N an action reaction pair',
    'how do i know which two forces are the real pair',
    'are gravity and normal reaction equal and opposite so they are partners',
    'whats the test for a genuine third law pair'
  ],
  'pending_review'
),
(
  'internal_forces_cannot_self_accelerate',
  'newton_third_law',
  'STATE_4',
  'Why can''t I push or pull myself to get moving?',
  'Student wonders why an internal push/pull (pulling your own arm, pushing against your own body) can never produce net motion. Needs the same-body-cancellation lesson extended: any force pair entirely internal to one system sums to zero on that system, so genuine motion always needs an external partner (an outside body to push against).',
  ARRAY[
    'why cant i lift myself by pulling my own arm',
    'can i push myself forward while standing still on the same spot',
    'why doesnt pulling on your own shirt move you',
    'if i push against myself why dont i accelerate',
    'why do you need something outside yourself to get moving'
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
