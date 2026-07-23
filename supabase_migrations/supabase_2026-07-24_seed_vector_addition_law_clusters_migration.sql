-- supabase_2026-07-24_seed_vector_addition_law_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters for vector_addition_law.json —
-- concept #2 of the Class 11 Mechanics Ch.1 "Vectors" DAG track
-- (chapter:1, section:"1.2", prerequisites:["scalar_vs_vector"]). Authored
-- on the mechanics_2d (parametric_renderer / PCPL) family, matching
-- scalar_vs_vector/current_not_vector/pressure_scalar.
--
-- Authored 2026-07-24 by alex:json_author, using the physics_author's
-- drill-down trigger phrases VERBATIM (STATE_2: why_tail_on_head_not_tail_to_tail,
-- does_sliding_change_the_vector, resultant_from_start_or_junction — STATE_4:
-- where_does_2ab_cos_theta_come_from, when_is_the_sum_smaller_than_both,
-- resultant_range_bounds).
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
-- has_prebuilt_deep_dive: true is tagged (metadata only, Rule 18) on
-- STATE_2 and STATE_4 in the concept JSON itself, referencing these
-- cluster_ids via each state's drill_downs array.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_2 why_tail_on_head_not_tail_to_tail deep-dive ───────────────
(
  'why_tail_on_head_not_tail_to_tail',
  'vector_addition_law',
  'STATE_2',
  'Why does the tail go on the head, not tail to tail?',
  'Student expects the two arrows to start from the same point, the way two forces are usually drawn acting on one body. Vector addition is a different question: it asks "where do you END UP if you experience A, then B?" — so B must be carried to START where A LEFT OFF (its head), not where A began. Joining tail-to-tail instead would answer a different question (the two vectors as seen from one shared origin, which is exactly the parallelogram''s OTHER pair of sides, not the sum). The physical answer is the walk: you cannot start leg two from the trailhead — you start it from wherever leg one left you.',
  ARRAY[
    'why does the tail go on the head not on the tail',
    'why not just touch the two tails together',
    'why cant both arrows start from the same point and add',
    'does it matter where the second arrow starts',
    'why do we join tip to tail instead of tail to tail'
  ],
  'pending_review'
),
-- ─── STATE_2 does_sliding_change_the_vector deep-dive ──────────────────
(
  'does_sliding_change_the_vector',
  'vector_addition_law',
  'STATE_2',
  'If I slide the arrow to a new spot, is it still the same vector B?',
  'Student worries that moving vector B''s starting point to dock onto A''s head somehow changes what B IS. A vector is defined completely by its length and its direction — nothing else. Carrying it anywhere in the plane without rotating it or stretching it (a rigid parallel translation) leaves both of those unchanged, so it is still exactly the same vector B, just relocated so it can be added. This is precisely why the construction is legal: you are allowed to slide a vector freely as long as you never change how long it is or which way it points.',
  ARRAY[
    'if i slide the arrow does it become a different vector',
    'does moving the arrow around change what it means',
    'why is a vector still the same after i drag it somewhere else',
    'does the vector care where it starts',
    'if i carry b to a new spot is it still the same b'
  ],
  'pending_review'
),
-- ─── STATE_2 resultant_from_start_or_junction deep-dive ────────────────
(
  'resultant_from_start_or_junction',
  'vector_addition_law',
  'STATE_2',
  'Does the resultant start from the very beginning, or from where the two vectors join?',
  'Student sees the join point (A''s head / B''s tail) as a natural "middle" and wonders if the answer should be measured from there instead. The resultant answers "where did I net end up, starting from my ORIGINAL starting point" — so it always runs from the tail of the FIRST vector (the true start) to the head of the LAST vector (the true finish), skipping over the join entirely. The join point is just scaffolding for the construction; it never appears in the final answer, R.',
  ARRAY[
    'does the resultant start from the beginning or from where they join',
    'why does R start at the first arrows tail not the middle',
    'shouldnt the answer start where the vectors meet',
    'why is the resultant not drawn from the junction point',
    'does R go from start to finish or just across the last arrow'
  ],
  'pending_review'
),
-- ─── STATE_4 where_does_2ab_cos_theta_come_from deep-dive ──────────────
(
  'where_does_2ab_cos_theta_come_from',
  'vector_addition_law',
  'STATE_4',
  'Where does the "+2AB cos θ" term in the resultant formula come from?',
  'Student has memorized R = sqrt(A² + B² + 2AB cos θ) but expects plain Pythagoras (A² + B²) because that is the only triangle formula they have seen before. Pythagoras only works for a RIGHT triangle; the triangle formed by A, B, and R is right-angled only at θ = 90°. For any other angle, the law of cosines governs the triangle, and the 2AB cos θ term is exactly the correction that Pythagoras is missing — it vanishes at θ = 90° (cos 90° = 0, recovering plain Pythagoras exactly) and becomes the dominant term as θ moves toward 0° or 180°.',
  ARRAY[
    'where does the 2ab cos theta part come from',
    'why is there a cos theta in the formula at all',
    'how did they get root a squared plus b squared plus that extra term',
    'why isnt it just pythagoras a squared plus b squared',
    'where does that cos theta term in the formula actually come from'
  ],
  'pending_review'
),
-- ─── STATE_4 when_is_the_sum_smaller_than_both deep-dive ───────────────
(
  'when_is_the_sum_smaller_than_both',
  'vector_addition_law',
  'STATE_4',
  'How can the resultant of 3 and 4 end up smaller than BOTH of them?',
  'Student generalizes from ordinary number addition, where a sum is always at least as big as its largest part. Vectors are different: when the angle between them opens past 90°, the two vectors start working AGAINST each other, and by θ = 180° they point in exactly opposite directions and PARTIALLY CANCEL — leaving a resultant of only |A − B|, here 4 − 3 = 1 km, genuinely smaller than either input. The angle is not a decoration on the formula; it is what decides whether the vectors reinforce or oppose each other.',
  ARRAY[
    'how can the total be smaller than both vectors',
    'how can 3 and 4 add up to only 1',
    'why does the resultant shrink when the angle is bigger',
    'can the sum ever be less than either vector',
    'how does adding two things make something smaller'
  ],
  'pending_review'
),
-- ─── STATE_4 resultant_range_bounds deep-dive ──────────────────────────
(
  'resultant_range_bounds',
  'vector_addition_law',
  'STATE_4',
  'What are the absolute biggest and smallest the resultant can ever be?',
  'Student wants the general boundary rule, not just the two demonstrated extremes. The resultant R is bounded on both sides: R can never exceed A + B (reached only when θ = 0°, both vectors pointing the same way, straight addition) and R can never fall below |A − B| (reached only when θ = 180°, the vectors pointing exactly opposite, straight subtraction). Every angle in between produces some value strictly inside that range, sliding continuously from one extreme to the other as θ sweeps from 0° to 180°.',
  ARRAY[
    'whats the biggest the resultant can ever be',
    'whats the smallest possible value for R',
    'can R ever be bigger than a plus b',
    'can R ever be less than a minus b',
    'what are the limits on how big or small the sum can get'
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
