-- supabase_2026-07-29_seed_normal_force_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters for normal_force.json —
-- Laws of Motion (Class 11) #4, on the newtons_laws_body field_3d engine
-- (docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md), Branch A only (independent
-- bodies, no pulley), zero renderer edits. chapter:8, section:"8.3",
-- prerequisites: ["newton_second_law","free_body_diagram","newton_third_law","vector_resolution"].
--
-- Authored 2026-07-29 by alex:json_author, using the physics_author's
-- drill-down trigger phrases VERBATIM (docs/loop_runs/lom/normal_force/
-- physics_block.md §8): STATE_2 — n_equals_mg_conditions,
-- mg_cos_theta_geometry, why_the_block_never_sinks; STATE_4 —
-- grip_ceiling_mu_n, heavier_is_harder_to_slide,
-- normal_vs_weight_in_friction_formulas.
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
-- STATE_2 (the core abstraction + the PRIMARY aha — N detaches from mg, the
-- mg cos theta geometry, and why the block never sinks) and STATE_4 (the
-- friction-link wall, feeder into block_on_incline / friction_static_kinetic)
-- — both states carry a drill_downs array in the concept JSON referencing
-- these cluster_ids.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_2 n_equals_mg_conditions deep-dive (PRIMARY aha) ────────────
(
  'n_equals_mg_conditions',
  'normal_force',
  'STATE_2',
  'Is N always equal to mg, or only sometimes?',
  'Student generalizes the flat-ground special case (N = mg) to every surface, since it is the only case most textbook problems ever show. N is fundamentally the surface''s ANSWER to whatever component of weight (or any other force) presses perpendicular into it — on a flat, level surface, the ENTIRE weight mg presses straight in, so N happens to equal mg exactly. The instant the surface tilts, only mg·cos θ presses in; the rest, mg·sin θ, acts along the surface and never loads the normal direction. So N = mg is not a law of nature, it is the theta = 0 degenerate case of the general rule N = mg·cos θ, and it stops holding the moment the surface is no longer flat.',
  ARRAY[
    'when is N actually just mg',
    'is N always equal to mg or only sometimes',
    'does N equal mg only on flat ground',
    'why did N equal mg before but not now',
    'is flat ground the only time N is mg'
  ],
  'pending_review'
),
-- ─── STATE_2 mg_cos_theta_geometry deep-dive ───────────────────────────
(
  'mg_cos_theta_geometry',
  'normal_force',
  'STATE_2',
  'Why is it mg cos theta and not just mg once the surface tilts?',
  'Student is unsure why tilting the surface introduces a cosine at all, rather than simply reducing N by some vague amount. Weight mg always points straight down, no matter how the surface underneath is oriented — gravity never rotates with the surface. To find how much of that weight presses PERPENDICULAR into the tilted surface, the weight vector must be resolved into two components relative to the surface: one along the slope (mg·sin θ) and one perpendicular into it (mg·cos θ). Only the perpendicular component is what the surface must resist to stop the body sinking through it — that component is, by the geometry of resolving a vector at angle θ from vertical, exactly mg·cos θ. At θ = 0 (flat), cos θ = 1 and the whole weight presses in; as θ grows, cos θ shrinks continuously, and less of the weight presses in.',
  ARRAY[
    'why is it mg cos theta and not just mg',
    'why does only part of gravity press into the incline',
    'where does the cos theta actually come from',
    'why does tilting change how much gravity presses in',
    'why isnt the whole weight pressing into the tilted surface'
  ],
  'pending_review'
),
-- ─── STATE_2 why_the_block_never_sinks deep-dive ───────────────────────
(
  'why_the_block_never_sinks',
  'normal_force',
  'STATE_2',
  'How does the surface know exactly how hard to push back?',
  'Student wonders whether the surface is somehow "measuring" the block and computing a force, or whether it might occasionally push too hard or too little, letting the block bounce or sink. The normal force is modeled as an idealized RIGID-BODY CONSTRAINT force: the surface is treated as perfectly rigid and non-penetrable, and physics simply asserts that whatever force is needed to prevent penetration is supplied, up to the point the material would actually deform or break (outside this concept''s scope). It is not computed from a spring-like compression law here — it is solved FOR, exactly like a constraint equation, by requiring the body''s acceleration perpendicular to the surface to be zero (as long as it stays in contact). This is why N always comes out to exactly the press-in component, never more, never less — it is defined as the value that keeps the block from sinking or lifting off.',
  ARRAY[
    'why doesnt the block just sink into the surface a little',
    'how does the surface know how hard to push back',
    'is the surface actually squishing to create N',
    'why is N always exactly enough and never too much',
    'does the surface calculate the force somehow'
  ],
  'pending_review'
),
-- ─── STATE_4 grip_ceiling_mu_n deep-dive ───────────────────────────────
(
  'grip_ceiling_mu_n',
  'normal_force',
  'STATE_4',
  'Why is there a maximum amount of friction, and why does it depend on N?',
  'Student assumes friction can grow indefinitely to resist whatever push is applied, since on a flat floor friction usually "just works" against small forces. Real static friction is a RESPONSE force up to a ceiling, f_max = μₛN, set by how tightly the two surfaces are pressed together (N) and how rough they are (μₛ). A larger N means more microscopic contact points are engaged and pressed more firmly, so the maximum resisting force the surface can supply is genuinely larger. Once the applied push exceeds that ceiling, there is no more friction available to give — the body must accelerate, because the net force is no longer zero. The ceiling exists because friction is a real, finite physical interaction between two surfaces, not an unlimited safety net.',
  ARRAY[
    'why is there a maximum amount of friction',
    'why does the grip limit depend on N and not just weight',
    'whats stopping friction from being unlimited',
    'why is mu_s times N the biggest friction can get',
    'does friction have some kind of ceiling'
  ],
  'pending_review'
),
-- ─── STATE_4 heavier_is_harder_to_slide deep-dive ──────────────────────
(
  'heavier_is_harder_to_slide',
  'normal_force',
  'STATE_4',
  'Why is a heavier box harder to push across the floor with the same push?',
  'Student notices the everyday fact that a fully loaded box needs far more effort to start sliding than an empty one, and often attributes this vaguely to "it just weighs more" without connecting it to the normal force specifically. On a flat floor the heavier box''s larger weight produces a larger normal force N (since N = mg here), and because the friction ceiling scales as f_max = μₛN, a bigger N directly means a bigger maximum grip the floor can supply. The SAME applied push that easily beats the light box''s smaller ceiling may not beat the heavy box''s larger one at all — the heavy box simply never receives an unbalanced net force, so it never accelerates. This is precisely why movers instinctively unload furniture before sliding it: they are lowering N, and therefore the grip ceiling, not just "removing weight" in the abstract.',
  ARRAY[
    'why is a heavier box harder to push across the floor',
    'does a full box really need more force to start sliding',
    'why do i have to push harder on the heavy box',
    'is it just the weight thats making it harder to slide',
    'why does loading a box make it grip the floor more'
  ],
  'pending_review'
),
-- ─── STATE_4 normal_vs_weight_in_friction_formulas deep-dive ───────────
(
  'normal_vs_weight_in_friction_formulas',
  'normal_force',
  'STATE_4',
  'Why do some friction formulas use mg and others use N — is f = mu mg always correct?',
  'Student memorizes f = μmg as THE friction formula from flat-ground problems and applies it unmodified to tilted or force-loaded situations where it silently breaks. The universally correct relationship is f_max = μₛN (or f_k = μₖN), where N is whatever the actual normal force is in that situation — f = μmg is only the flat-ground SHORTCUT, valid exactly because N happens to equal mg when theta = 0 and there is no perpendicular applied force. The instant the surface tilts (N = mg·cos θ) or a force pushes into or away from the surface at an angle, N changes and f = μmg silently gives the wrong answer, while f = μN remains correct because it is built directly on whatever the real normal force is. The exam-safe habit is to always find N first, from the actual force balance perpendicular to the surface, and only then multiply by μ.',
  ARRAY[
    'why do some formulas use mg for friction and others use N',
    'is f equals mu mg always correct',
    'when does mu times mg stop being the right formula',
    'why cant i just use weight instead of N in friction',
    'why does the friction formula change on a tilted surface'
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
