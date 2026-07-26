-- supabase_2026-07-23_seed_scalar_vs_vector_clusters_migration.sql
-- Seeds confusion_cluster_registry with 5 clusters for scalar_vs_vector.json —
-- the DAG-root concept of the NEW Class 11 Mechanics Ch.1 "Vectors" track
-- (chapter:1, section:"1.1", prerequisites:[]). Authored on the mechanics_2d
-- (parametric_renderer / PCPL) family, matching current_not_vector/pressure_scalar.
--
-- Authored 2026-07-23 by alex:json_author from the concept's own two
-- misconception_watch pivots (STATE_3 "3+4 is always 7", STATE_4 "anything
-- with a direction is a vector") — no separate physics_author drill-down
-- trigger-phrase section was handed off for this concept, so trigger_examples
-- below are synthesized directly from the misconception_watch belief/fix pairs
-- and the concept's own real_world_anchor, in plain student-voice phrasing.
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
-- status='pending_review' per the current cluster-registry convention.
--
-- Candidate cluster_ids (from the concept's own misconception_watch, no
-- has_prebuilt_deep_dive flags authored on the concept itself; V1 ships ZERO
-- authored deep-dives):
--   STATE_3 — "3+4 is always 7" pivot: three_plus_four_always_seven,
--             why_scale_says_seven_but_ground_says_five
--   STATE_4 — "direction alone makes it a vector" pivot: direction_alone_makes_it_a_vector,
--             what_is_the_parallelogram_law, is_current_a_vector_then

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_3 three_plus_four_always_seven deep-dive ───────────────────
(
  'three_plus_four_always_seven',
  'scalar_vs_vector',
  'STATE_3',
  'Why doesn''t 3 km + 4 km always equal 7 km?',
  'Student is applying ordinary arithmetic to a walk that has a turn in it — three and four should add to seven no matter what. It only adds to seven when both legs point the SAME way. Here the hiker turns ninety degrees between the two legs, so the two displacements do not lie along one line; they add tip-to-tail like the two sides of a right triangle, and the straight-line distance back to camp is the triangle''s hypotenuse, sqrt(3² + 4²) = 5 km, not the arithmetic sum. The angle between the two legs is exactly what plain number-addition throws away.',
  ARRAY[
    'why isnt 3 plus 4 equal to 7 on the ground',
    'how can 3 km and 4 km only add up to 5 km',
    'doesnt 3 plus 4 always equal 7',
    'why does turning change how far you end up',
    'where did the extra 2 km go'
  ],
  'pending_review'
),
-- ─── STATE_3 why_scale_says_seven_but_ground_says_five deep-dive ──────
(
  'why_scale_says_seven_but_ground_says_five',
  'scalar_vs_vector',
  'STATE_3',
  'The scale reads 7 with the same numbers 3 and 4 — so why is the walk different?',
  'Student sees the same two numbers, 3 and 4, produce two different-looking answers (7 on the scale, 5 on the ground) and suspects one of the two must be wrong. Neither is wrong — they are two different KINDS of addition. Mass on the scale is a scalar: it has no direction to disagree about, so 3 kg and 4 kg always combine to exactly 7 kg regardless of how the bags are turned or loaded. Displacement on the ground is a vector: its two pieces point in different directions, so they combine by the triangle rule instead of plain arithmetic. Same numbers, genuinely different rules, because one quantity has a direction that matters and the other does not.',
  ARRAY[
    'the scale says 7 so why doesnt the walk also say 7',
    'same 3 and 4 why two different answers',
    'is one of the two sevens and fives wrong',
    'why does mass add differently from distance',
    'how can 3 and 4 give two different totals'
  ],
  'pending_review'
),
-- ─── STATE_4 direction_alone_makes_it_a_vector deep-dive ──────────────
(
  'direction_alone_makes_it_a_vector',
  'scalar_vs_vector',
  'STATE_4',
  'If a quantity has a direction, isn''t that enough to call it a vector?',
  'Student treats "has a direction" as the whole test for being a vector, so anything that visibly points somewhere gets classified as one. Direction is necessary but not sufficient — a real vector must ALSO combine with other vectors by the triangle (parallelogram) rule, the same rule that turned 3 km and 4 km into 5 km on the trail. The pinned card "3 + 4 = 7, always" stays true for mass precisely because mass has no direction to plug into that rule at all; other quantities can look direction-like (current, for instance) yet still fail the addition test, which is why the direction test alone is not enough.',
  ARRAY[
    'if something has a direction isnt it automatically a vector',
    'why isnt having a direction enough to be a vector',
    'whats the second condition for being a vector',
    'i thought direction was the whole definition of a vector',
    'what else does a vector need besides pointing somewhere'
  ],
  'pending_review'
),
-- ─── STATE_4 what_is_the_parallelogram_law deep-dive ──────────────────
(
  'what_is_the_parallelogram_law',
  'scalar_vs_vector',
  'STATE_4',
  'What exactly is this "triangle rule" / "parallelogram law" the vector has to obey?',
  'Student has heard the phrase but cannot connect it to the sliding-angle demo they just watched. It is exactly what the theta slider shows: lay the two vectors tip-to-tail (or, equivalently, as two sides of a parallelogram), and the resultant is the third side (or diagonal) that closes the shape — its length is sqrt(a² + b² + 2ab cos θ), which collapses to plain addition a+b only at θ=0 and to plain subtraction |a−b| at θ=180°. Every other angle gives something strictly between those two extremes, which is exactly the R = 7 → 5 → 1 → 5 → 7 sweep the slider traces out.',
  ARRAY[
    'what is the parallelogram law actually',
    'what does adding by the triangle rule mean',
    'how is the triangle rule different from just adding',
    'what formula is behind the sliding resultant',
    'why does the angle change the total this way'
  ],
  'pending_review'
),
-- ─── STATE_4 is_current_a_vector_then deep-dive ───────────────────────
(
  'is_current_a_vector_then',
  'scalar_vs_vector',
  'STATE_4',
  'Current flows in a direction through a wire — so is current a vector or not?',
  'Student generalizes from the walk/scale demo to a genuinely tricky real case: current visibly flows one way through a wire, so it looks exactly as direction-like as the hiker''s leg. Current fails the SAME second test that pressure and mass pass or fail here: at a junction, currents combine by plain scalar addition (Kirchhoff''s current law, i = i1 + i2, independent of the angle the wires meet at), never by the triangle rule. So current has a direction of flow but is still classified as a scalar — the direct worked-out version of this exact question lives in the sibling concept current_not_vector.',
  ARRAY[
    'current flows somewhere so is current a vector',
    'is electric current a vector or a scalar',
    'current has a direction through the wire doesnt it',
    'why isnt current a vector if it flows one way',
    'does current add like the hiker or like the mass'
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
