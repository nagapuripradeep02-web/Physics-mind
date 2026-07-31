-- supabase_2026-07-29_seed_friction_force_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters for friction_force.json —
-- Laws of Motion (Class 11) #4, on the newtons_laws_body field_3d engine
-- (docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md), Branch A, FLAT push only (theta = 0
-- throughout — zero incline states, that arc belongs to sibling
-- block_on_incline). chapter:8, section:"8.6", prerequisites:
-- ["normal_reaction","newton_first_law","newton_second_law","free_body_diagram"].
--
-- Authored 2026-07-29 by alex:json_author, using the physics_author's
-- drill-down trigger phrases VERBATIM (docs/loop_runs/lom/friction_force/
-- physics_block.md §11): STATE_2 — friction_self_adjusting_mechanism,
-- mu_n_is_ceiling_not_value, static_friction_zero_without_push;
-- STATE_3 — limiting_friction_breakaway, static_to_kinetic_drop,
-- f_vs_applied_force_graph_story.
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
-- STATE_2 (the self-adjustment abstraction — "how does a passive surface
-- 'know' how hard to push?") and STATE_3 (the threshold + drop, the exam
-- staple and PRIMARY aha) — both states carry a drill_downs array in the
-- concept JSON referencing these cluster_ids.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_2 friction_self_adjusting_mechanism deep-dive ───────────────
(
  'friction_self_adjusting_mechanism',
  'friction_force',
  'STATE_2',
  'How does a passive surface "know" exactly how hard to push back?',
  'Student pictures friction as something the surface actively "decides," which feels mysterious for a passive object. In reality static friction is not a computation the surface performs — it is a CONSTRAINT force, the leftover the surface supplies to keep the block from accelerating, exactly the same way a table''s normal force is whatever value is needed to stop a book falling through it. Microscopically, the applied push shifts the block by an imperceptible amount, straining the microscopic contact points (asperities) between the two surfaces like tiny springs; that strain grows until it exactly balances the applied push (Newton''s second law with a = 0 demands it), and the resulting reaction force IS the friction we measure. There is no "decision" — just an elastic microscopic response that necessarily lands wherever equilibrium requires, right up until the contacts can no longer stretch further and let go.',
  ARRAY[
    'how does the floor know how hard to push back',
    'does friction think about how much force to give',
    'why does friction match the push exactly every time',
    'how can a surface adjust itself like that',
    'is friction reacting or is it just always there'
  ],
  'pending_review'
),
-- ─── STATE_2 mu_n_is_ceiling_not_value deep-dive ───────────────────────
(
  'mu_n_is_ceiling_not_value',
  'friction_force',
  'STATE_2',
  'Is μₛN the actual friction force, or just the biggest it could ever be?',
  'Student treats the formula μₛN as if it were friction''s VALUE, so any applied force should immediately "produce" μₛN of friction. μₛN is a CEILING — the maximum static friction the surface is capable of supplying — not the amount actually supplied at any given moment. The actual static friction at any instant is whatever value is needed to keep the block at rest, found from equilibrium (f = F while stuck), and it can be anywhere from 0 up to μₛN. Using μₛN in a calculation is only correct at the single instant of impending motion (the break-away threshold); using it for any smaller applied force overstates the friction and gives a wrong (impossibly large) answer for f.',
  ARRAY[
    'is mu times N the actual friction or just the max',
    'why isnt friction always mu s N',
    'is the friction force a fixed number or does it change',
    'when do I actually use mu s N in a calculation',
    'why does the formula give a bigger number than what I see'
  ],
  'pending_review'
),
-- ─── STATE_2/STATE_1 static_friction_zero_without_push deep-dive ───────
(
  'static_friction_zero_without_push',
  'friction_force',
  'STATE_2',
  'Why is there no friction at all if nothing is pushing the block?',
  'Student assumes friction is a background property that is always "on" whenever two rough surfaces touch, so a nonzero μₛN should mean some nonzero friction exists even with no push. Static friction is fundamentally a RESPONSE force: it exists only to oppose an actual or impending tendency to slide. With no applied horizontal force, there is no sliding tendency to resist, so the equilibrium condition (f = |drive| = |F|) gives f = 0 exactly — regardless of how large μₛN happens to be. μₛN describes the surface''s CAPABILITY, not a standing force; capability without demand produces zero actual friction, the same way a fire extinguisher''s unused capacity does not mean it is currently spraying.',
  ARRAY[
    'why is there no friction if nothing is pushing',
    'shouldnt there always be some friction just sitting there',
    'does friction exist even when nothing moves or pushes',
    'why does f read zero when mu s N isnt zero',
    'is friction on standby or is it actually off'
  ],
  'pending_review'
),
-- ─── STATE_3 limiting_friction_breakaway deep-dive ─────────────────────
(
  'limiting_friction_breakaway',
  'friction_force',
  'STATE_3',
  'Why does the block let go at exactly one number, F = μₛN, and not gradually before or after it?',
  'Student expects break-away to be a fuzzy, gradual transition rather than a sharp threshold. The stick condition is |drive| <= μₛN, i.e. F <= μₛ·m·g — a single inequality with a single crossing point. Below that force the ceiling always exceeds the demand, so the block never moves at all; there is no partial sliding, no fractional grip. The instant F exceeds μₛ·m·g, the demand permanently exceeds every possible static friction value the surface can supply, and the block accelerates from that instant on. The sharpness is not a modeling simplification — it falls directly out of comparing two quantities (a fixed ceiling and a rising demand) that cross at exactly one point.',
  ARRAY[
    'why does it let go at exactly that number and not before',
    'is there a formula for when it will start to slide',
    'why does the block hold so long then suddenly move',
    'what decides the exact push where it breaks free',
    'does every object have its own breaking point like this'
  ],
  'pending_review'
),
-- ─── STATE_3 static_to_kinetic_drop deep-dive ──────────────────────────
(
  'static_to_kinetic_drop',
  'friction_force',
  'STATE_3',
  'Why does friction get weaker the instant the block starts moving, when it just took a huge push to make it slip?',
  'Student expects friction to be a single continuous quantity across the stick-to-slip transition, so a large force needed to overcome it should still be needed to keep it going. In reality, static and kinetic friction are governed by two DIFFERENT coefficients (μₛ and μₖ), with μₖ < μₛ always, because a surface at rest has microscopic contact points that have settled and interlocked more thoroughly than a surface already sliding, where contact is more fleeting. Once the block breaks away, the resisting force drops from its ceiling μₛN to the smaller μₖN — a real, measurable step down — which is exactly why break-away looks like a sudden lurch rather than a gentle release: the driving force that was JUST barely losing to μₛN now decisively beats the smaller μₖN, so the block does not just start moving, it accelerates immediately and does not re-stick at that same force.',
  ARRAY[
    'why does friction get weaker the moment it starts moving',
    'shouldnt friction stay the same once it slips',
    'why is sliding friction less than what was holding it',
    'if it needed that much force to move why less now',
    'why does the grip not come back once it starts sliding'
  ],
  'pending_review'
),
-- ─── STATE_3 f_vs_applied_force_graph_story deep-dive ──────────────────
(
  'f_vs_applied_force_graph_story',
  'friction_force',
  'STATE_3',
  'What does the graph of friction versus applied force actually look like?',
  'Student has not connected the numbers in the sim to the classic textbook picture: a straight 45-degree line, then a sudden drop, then a flat line. As F rises from zero, f = F exactly — a line of slope 1 (the 45-degree segment), because friction is copying the push newton for newton. That line runs until F reaches μₛN, its highest point on the graph — the peak of the "hump." The instant F exceeds that value, f falls in a single vertical step down to μₖN, and from there f stays FLAT at μₖN no matter how much further F rises, because kinetic friction depends only on N and the surfaces, never on F or v. The whole story the sim shows in numbers (f tracking F, then snapping down, then holding steady) is exactly this graph, traced out live rather than drawn on paper.',
  ARRAY[
    'is there a graph that shows friction rising then dropping',
    'what does the friction versus push graph actually look like',
    'why does the line go straight up then fall down',
    'how would I draw friction against applied force on paper',
    'does the graph flatten out after it starts sliding'
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
