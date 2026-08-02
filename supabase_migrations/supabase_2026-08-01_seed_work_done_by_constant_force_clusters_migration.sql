-- supabase_2026-08-01_seed_work_done_by_constant_force_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters for
-- work_done_by_constant_force.json — Class 11 Ch.6 Work, Energy and Power #1,
-- authored against the newtons_laws_body field_3d engine extended with the
-- SEAM K/L/M/N energy layer (docs/loop_runs/ch6_state.md). chapter:6,
-- section:"6.3", prerequisites: ["newton_second_law","friction_force"].
--
-- Authored 2026-08-01 by alex:json_author, using the physics_author's
-- drill-down trigger phrases VERBATIM (docs/loop_runs/ch6/
-- work_done_by_constant_force/physics_block.md §5):
--   STATE_2 — work_vs_effort, holding_is_not_working, force_needs_displacement;
--   STATE_3 — why_cos_theta, component_does_the_work, same_force_less_work.
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
-- has_prebuilt_deep_dive picks (architect skeleton §5, metadata only, Rule 18):
-- STATE_2 (force_without_motion — the everyday-language collision, the
-- concept's historically stickiest point) and STATE_3 (tilted_pull — the
-- mathematical abstraction of component resolution). Both states carry a
-- drill_downs array in the concept JSON referencing these cluster_ids.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_2 work_vs_effort deep-dive ───────────────────────────────────
(
  'work_vs_effort',
  'work_done_by_constant_force',
  'STATE_2',
  'I got tired pushing — doesn''t that mean I did work?',
  'Student conflates the everyday meaning of "work" (physical effort, tiredness, energy spent by the body) with the physics definition (force acting through a displacement of the object). Pushing hard against something DOES cost the pusher''s own muscles real chemical energy — that is genuine physiological work, and it is why the arms tire. But the physics quantity being measured here is the work done BY THE PUSH ON THE OBJECT, W = F·d·cos θ, and it depends only on how far the OBJECT moved along the direction of the push. If the object''s displacement d is zero — because a heavy crate does not budge — then W = F·d·cos θ is exactly zero no matter how large F is or how tired the pusher becomes. The tiredness is real; the mechanical work done on the object is zero. These are two different quantities, tracked by two completely different accounts.',
  ARRAY[
    'i got tired so i must have done work right',
    'my arms are sore that means i did work',
    'why is holding something not work if it feels like work',
    'work should mean effort not distance',
    'if it takes energy from me why is it zero work'
  ],
  'pending_review'
),
-- ─── STATE_2 holding_is_not_working deep-dive ───────────────────────────
(
  'holding_is_not_working',
  'work_done_by_constant_force',
  'STATE_2',
  'Is holding a heavy bag up really zero work?',
  'Student treats "holding something up" as an obvious case of doing work, because it takes visible, sustained muscular effort — and unlike a quick push, holding continues for a long stretch of time, which feels like it should accumulate into some work total. But the physics definition needs a DISPLACEMENT of the object along the force, and a bag held stationary at one height has zero displacement, however long the holding continues. W = F·d·cos θ with d = 0 gives exactly 0 J, for one second or for one hour — duration never enters the formula for work at all. The holder''s arm muscles are still doing real biological work internally (small constant contractions cost energy, which is why arms tire from holding), but the work done ON THE BAG by the upward hand force is zero, because the bag itself never moves.',
  ARRAY[
    'i am holding a heavy bag and not moving is that zero work',
    'why does standing still with a weight count as no work',
    'does carrying a bag on a flat road do any work',
    'the bag is heavy so there must be some work happening',
    'if i hold it up for an hour is that really 0 joules'
  ],
  'pending_review'
),
-- ─── STATE_2 force_needs_displacement deep-dive ─────────────────────────
(
  'force_needs_displacement',
  'work_done_by_constant_force',
  'STATE_2',
  'Why do you need BOTH force and distance for work to count?',
  'Student is used to thinking of work as a property of the force or the pushing alone, so the requirement for a nonzero displacement feels like an arbitrary extra condition rather than something built into the definition. Work is a PRODUCT of two quantities — force and displacement — not a property of either one alone: W = F·d·cos θ. A product is zero whenever EITHER factor is zero, regardless of how large the other factor is. A huge force through zero displacement gives zero work, in exactly the same way that a huge number multiplied by zero gives zero. This is not a special exception invented for physics; it is what "work" is defined to mean from the start — force acting through a distance, not force acting alone.',
  ARRAY[
    'why do i need both force and distance for work to count',
    'if the force is huge but nothing moves why is work zero',
    'does a tiny push over a big distance count as work',
    'what happens to the force if the object never moves',
    'so work is really about movement not about pushing'
  ],
  'pending_review'
),
-- ─── STATE_3 why_cos_theta deep-dive ─────────────────────────────────────
(
  'why_cos_theta',
  'work_done_by_constant_force',
  'STATE_3',
  'Why cos θ and not sin θ in the work formula?',
  'Student has met both sine and cosine in trigonometry and has no fixed rule for which one belongs in the work formula, especially since sin θ shows up in other force formulas (like the perpendicular lift component that changes the normal force). The angle θ in W = F·d·cos θ is measured BETWEEN the force vector and the displacement vector. Cosine is the trig function that gives the component of one vector ALONG the direction of another — cos θ is exactly 1 when the two vectors point the same way (θ = 0°) and exactly 0 when they are perpendicular (θ = 90°), which is precisely the behaviour work should have: full credit when the pull is fully along the motion, zero credit when it is entirely sideways to the motion. Sine does the opposite — it is 0 when the vectors are aligned and 1 when they are perpendicular — which is why sin θ appears in quantities where the PERPENDICULAR component is what matters, not the aligned one.',
  ARRAY[
    'why cos theta and not sin theta',
    'how do i know when to use cos and when to use sin',
    'why does the angle formula use cosine here',
    'where does cos theta even come from',
    'is cos theta always for work or does it change'
  ],
  'pending_review'
),
-- ─── STATE_3 component_does_the_work deep-dive ──────────────────────────
(
  'component_does_the_work',
  'work_done_by_constant_force',
  'STATE_3',
  'Which part of a tilted force actually does the work?',
  'Student pictures the force as a single indivisible arrow and struggles with the idea that only "part" of it counts, especially since the full arrow length is what the F reading on the HUD shows. Any force at an angle to the motion can be split into two perpendicular pieces: one ALONG the direction of motion (F cos θ) and one PERPENDICULAR to it (F sin θ). Only the along-motion piece, F cos θ, ever appears in the work formula — it is the only part that pushes the object farther in the direction it is already travelling. The perpendicular piece does not vanish or get wasted; on this flat floor it simply changes how hard the floor needs to push back (the normal force), and a force perpendicular to a displacement does zero work on that displacement by definition, because cos 90° = 0.',
  ARRAY[
    'which part of the force actually does the work',
    'does the part of the force pointing up count for anything',
    'why does only part of the force move the crate',
    'what happens to the rest of the force that is not doing work',
    'is the vertical part of the pull wasted'
  ],
  'pending_review'
),
-- ─── STATE_3 same_force_less_work deep-dive ─────────────────────────────
(
  'same_force_less_work',
  'work_done_by_constant_force',
  'STATE_3',
  'How can the same force do less work just by tilting it?',
  'Student expects the work total to depend only on the force''s MAGNITUDE (the number on the HUD), so tilting the same 20 N pull and watching the joules-per-metre drop feels like the force itself has somehow gotten weaker. The force reading does not change at all — it is still 20 N, exactly as before. What changes is how much of that 20 N points along the direction the crate is actually moving. At 0° the whole 20 N is aligned with the motion, so every newton counts fully; tilted to 60°, only F cos 60° = 10 N worth is aligned with the floor, so only that fraction buys work per metre travelled. The force is exactly as strong as it was; less of it is now pointed the way that matters for this particular displacement.',
  ARRAY[
    'same force so why is the work smaller now',
    'how can the same pull do less work just because it is tilted',
    'if the force number did not change why did the work change',
    'does tilting the force make it weaker',
    'why does angle change the work but not the force reading'
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

-- ── concept_panel_config registration (defensive dual-registration) ───────
-- CLAUDE.md §6 registration site 2 offers TWO alternative mechanisms — a SQL
-- INSERT into this table OR CONCEPT_PANEL_MAP in src/config/panelConfig.ts.
-- This concept is already registered in code (CONCEPT_PANEL_MAP in
-- src/config/panelConfig.ts, layout 'single', renderer field_3d) — but per
-- the precedent set by uniform_circular_motion's 2026-08-01 migration, a
-- concept absent from this TABLE is the known silent-failure class "Concept
-- missing from concept_panel_config silently routes to particle_field
-- renderer with no warning" (engine_bug_queue, 2026-04-26). Included here as
-- belt-and-suspenders so the DB and the code registration agree.
--
-- Values mirror the code registration exactly: single panel, field_3d, and
-- sonnet_can_upgrade FALSE because a field_3d diamond is authored config,
-- never an LLM-upgradable panel (Rule 5/18).
INSERT INTO concept_panel_config (
    concept_id, default_panel_count, panel_a_renderer, panel_b_renderer,
    sonnet_can_upgrade, upgrade_max, verified_by_human, reasoning,
    technology_a, class_level, chapter
) VALUES (
    'work_done_by_constant_force',
    1,
    'field_3d',
    NULL,
    FALSE,
    1,
    FALSE,
    'Ch.6 Work, Energy and Power #1 (2026-08-01). Single-panel field_3d diamond on the newtons_laws_body scenario engine, extended with the SEAM K/L/M/N energy layer (docs/loop_runs/ch6_state.md), pure configuration, zero renderer edits (0d). Mirrors CONCEPT_PANEL_MAP in src/config/panelConfig.ts. sonnet_can_upgrade FALSE: field_3d concepts are pure authored configuration and are never upgraded by an LLM at serving time (Rule 5/18).',
    'threejs',
    11,
    '6'
)
ON CONFLICT (concept_id) DO UPDATE
SET default_panel_count = EXCLUDED.default_panel_count,
    panel_a_renderer    = EXCLUDED.panel_a_renderer,
    panel_b_renderer    = EXCLUDED.panel_b_renderer,
    sonnet_can_upgrade  = EXCLUDED.sonnet_can_upgrade,
    upgrade_max         = EXCLUDED.upgrade_max,
    reasoning           = EXCLUDED.reasoning,
    technology_a        = EXCLUDED.technology_a,
    class_level         = EXCLUDED.class_level,
    chapter             = EXCLUDED.chapter;
