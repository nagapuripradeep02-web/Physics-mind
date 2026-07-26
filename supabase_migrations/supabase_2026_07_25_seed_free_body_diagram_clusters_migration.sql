-- supabase_2026_07_25_seed_free_body_diagram_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters for free_body_diagram.json —
-- the Laws of Motion (Class 11) RETROFIT concept, now on the newtons_laws_body
-- field_3d engine (docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md), replacing the legacy
-- mechanics_2d JSON. chapter:8, section:"8.2", prerequisites:
-- ["normal_reaction","field_forces"].
--
-- Authored 2026-07-25 by alex:json_author, using the physics_author's
-- drill-down trigger phrases VERBATIM (STATE_2: fbd_which_forces_to_include,
-- third_law_pair_on_same_diagram, internal_forces_cancel_out — STATE_5:
-- normal_not_equal_mg, which_angle_gets_cos, choosing_tilted_axes).
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
-- has_prebuilt_deep_dive picks (architect skeleton §6, metadata only, Rule 18):
-- STATE_2 (contact→arrow, where completeness errors start) and STATE_5 (the
-- trig/decomposition wall) — both states carry a drill_downs array in the
-- concept JSON referencing these cluster_ids.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_2 fbd_which_forces_to_include deep-dive ─────────────────────
(
  'fbd_which_forces_to_include',
  'free_body_diagram',
  'STATE_2',
  'Which forces actually belong on the FBD — do I draw the push force, or forces on things merely touching it?',
  'Student is unsure which of the many forces "in the story" belong on THIS body''s diagram. The rule is narrow and mechanical: a force belongs on the diagram only if it acts directly ON the isolated body — never a force the body exerts on something else, never a force acting on a different object the body happens to touch, and never a force on the hand doing the pushing. If you (the applier) press on the block with your hand, that push IS a real force ON the block (an "applied" arrow) and belongs; but your own weight, or the reaction the block exerts back on your hand, does not belong on the block''s diagram — those act on you, not on it. Air resistance is included only when it is explicitly given as acting on the body; it is never assumed by default in this course.',
  ARRAY[
    'do I draw the push force too',
    'why not include the force I''m applying with my hand',
    'should air resistance go on the diagram',
    'why isn''t the weight of my hand on the block''s FBD',
    'do I draw forces on things touching it or just on it'
  ],
  'pending_review'
),
-- ─── STATE_2 third_law_pair_on_same_diagram deep-dive ──────────────────
(
  'third_law_pair_on_same_diagram',
  'free_body_diagram',
  'STATE_2',
  'Newton''s third law says every force has a pair — so why does my FBD only show one arrow?',
  'Student has just learned that every force comes with an equal-and-opposite partner, and expects both halves of that pair to appear on the same diagram. They act on DIFFERENT bodies by definition, so they can never both appear on one body''s FBD: if the table pushes up on the block with normal force N, the block''s reaction pushes DOWN on the table with force N′ — that second force belongs on the TABLE''s diagram, not the block''s. Drawing both halves on one diagram would double-count a single physical push-back and produce a nonsense equation. The fix, when a problem genuinely needs both halves, is to draw TWO separate free body diagrams, one per body, and let each keep only its own half of every pair.',
  ARRAY[
    'why isn''t the reaction force on my diagram',
    'table pushes back so why only one arrow',
    'shouldn''t both forces of the pair show up',
    'where did the other half of newtons third law go',
    'if every force has a pair why does the FBD only have one'
  ],
  'pending_review'
),
-- ─── STATE_2 internal_forces_cancel_out deep-dive ──────────────────────
(
  'internal_forces_cancel_out',
  'free_body_diagram',
  'STATE_2',
  'The block is made of countless atoms, each pulled by gravity — why is there just ONE weight arrow?',
  'Student pictures the body as a huge collection of parts (atoms, molecules, or in the stacked-block story, separate blocks) and wonders why their individual forces vanish into one arrow. Two different simplifications are actually at work. First, every internal force a body exerts ON ITSELF — one atom pulling another — is an action-reaction pair entirely INSIDE the isolated system, so by Newton''s third law those pairs sum to exactly zero and never appear on the diagram at all; only forces from OUTSIDE the isolated body ever show up. Second, gravity is a genuine external force on every atom, but for a rigid, uniform body those countless tiny weights add up to one single equivalent force, mg, acting through one point — the centre of mass. So "one weight arrow" is not an approximation that ignores anything; it is the exact sum of everything external the body actually feels.',
  ARRAY[
    'why don''t the forces inside the block count',
    'does gravity on each atom show up separately',
    'why is it just one weight arrow not a thousand tiny ones',
    'do internal forces between the block''s own parts matter',
    'why don''t forces the block exerts on itself appear'
  ],
  'pending_review'
),
-- ─── STATE_5 normal_not_equal_mg deep-dive ─────────────────────────────
(
  'normal_not_equal_mg',
  'free_body_diagram',
  'STATE_5',
  'Nothing about the block changed except the tilt — so why did N get smaller?',
  'Student has built "N always equals mg" into a reflex from every flat-surface example and is surprised when tilting the very same block, same mass, changes the reading. On a flat surface the entire weight presses straight into the surface, so N = mg. Once the surface tilts, weight itself never rotates — it still points straight down — but the SURFACE''s orientation now only "sees" the component of that weight perpendicular to itself: N = mg·cosθ. The rest of the weight, mg·sinθ, points along the slope instead, where friction (not the normal force) has to deal with it. Nothing about the block''s mass or gravity changed; only the geometry between the weight and the surface changed, and N tracks that geometry, not the mass alone.',
  ARRAY[
    'why is N not just mg here',
    'isn''t normal force always equal to weight',
    'why did N get smaller when nothing changed but the tilt',
    'shouldn''t the table always push back with the full weight',
    'why does tilting the surface change N if mass didn''t change'
  ],
  'pending_review'
),
-- ─── STATE_5 which_angle_gets_cos deep-dive ────────────────────────────
(
  'which_angle_gets_cos',
  'free_body_diagram',
  'STATE_5',
  'How do I know which component of mg gets cos θ and which gets sin θ?',
  'Student has memorized "N = mg cos θ" for this specific incline but has no rule for the next one, and keeps guessing sin vs cos. The reliable method is geometric, not memorized: weight mg always points straight down, and θ is the angle between the incline''s surface and the horizontal. Draw the right triangle formed by mg and its two components (one along the slope, one perpendicular to it) — the angle INSIDE that triangle, between mg and the perpendicular (normal) direction, is exactly θ (a similar-angles argument from the incline''s own tilt). The side ADJACENT to that angle is the perpendicular component, so it gets cos θ (mg cos θ, feeding the normal force); the side OPPOSITE the angle is the along-slope component, so it gets sin θ (mg sin θ, feeding friction or acceleration down the slope). The rule survives at any incline angle because it comes from the triangle''s geometry, not from a single worked example.',
  ARRAY[
    'why is it cos theta and not sin theta for N',
    'how do I know which one gets sin and which gets cos',
    'why does the along-slope part use sin',
    'I keep mixing up which component is cos and which is sin',
    'is there a rule for cos vs sin on an incline'
  ],
  'pending_review'
),
-- ─── STATE_5 choosing_tilted_axes deep-dive ────────────────────────────
(
  'choosing_tilted_axes',
  'free_body_diagram',
  'STATE_5',
  'Why do we tilt the x and y axes with the incline instead of keeping them horizontal and vertical?',
  'Student has only ever used plain horizontal/vertical axes and wonders why an incline problem suddenly rotates them. Axes are a free choice — they do not change the physics, only how much algebra the physics costs. On an incline, the body''s actual motion (if it slides) runs ALONG the slope, and two of the three forces (normal N and, for a sliding body, the constraint of staying on the surface) already point exactly along or exactly perpendicular to the slope. Choosing tilted axes (x along the slope, y perpendicular to it) makes N sit entirely on the y-axis and any sliding acceleration sit entirely on the x-axis — so only ONE force, weight, needs resolving into components at all. Horizontal/vertical axes are equally valid, but then BOTH N and mg need resolving into two components each, and the equations of motion get needlessly messier without changing the final answer.',
  ARRAY[
    'why do axes tilt with the incline',
    'why not just use normal horizontal and vertical axes',
    'who decided the x axis runs along the slope',
    'does the direction of the axes actually matter',
    'why does tilting the axes make the problem easier'
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
