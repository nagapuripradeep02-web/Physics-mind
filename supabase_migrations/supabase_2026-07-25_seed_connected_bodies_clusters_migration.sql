-- supabase_2026-07-25_seed_connected_bodies_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters for connected_bodies.json —
-- Laws of Motion (Class 11) #2, on the newtons_laws_body field_3d engine
-- (docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md), pure configuration, zero renderer
-- edits. chapter:8, section:"8.3", prerequisites:
-- ["free_body_diagram","newton_second_law","normal_reaction","tension_in_string"].
--
-- Authored 2026-07-25 by alex:json_author, using the physics_author's
-- drill-down trigger phrases VERBATIM (docs/loop_runs/lom/connected_bodies/
-- physics_block.md §7): STATE_3 — tension_equals_hanging_weight,
-- tension_same_throughout_massless_string, rope_pulls_both_ends_equally;
-- STATE_4 — which_body_gets_which_equation, sign_convention_along_the_string,
-- system_method_vs_free_body_method.
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
-- STATE_3 (the tension wall, PRIMARY aha) and STATE_4 (the method wall) — both
-- states carry a drill_downs array in the concept JSON referencing these
-- cluster_ids.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_3 tension_equals_hanging_weight deep-dive (PRIMARY aha) ─────
(
  'tension_equals_hanging_weight',
  'connected_bodies',
  'STATE_3',
  'Shouldn''t the rope''s tension just equal the hanging block''s weight, since that''s what it''s holding up?',
  'Student has generalized "a rope holds up whatever hangs from it, so its tension equals that weight" from static, non-accelerating examples (a lamp on a cord, a bucket at rest). That reflex is correct ONLY when the hanging body is not accelerating — a = 0, so Newton''s second law for the hanging body reduces to T − m₂g = 0. The instant the system is released and the whole coupled pair accelerates, the hanging body''s own equation of motion is m₂g − T = m₂a, which rearranges to T = m₂(g − a): the tension is the weight MINUS the mass times the acceleration, not the weight itself. Acceleration is exactly the amount the rope is "failing" to fully support the hanging weight, because some of that net downward force is going into speeding the whole system up rather than being held in equilibrium. The frozen-ghost contrast makes this concrete: if T truly equalled m₂g always, the system pictured in that belief would never move at all — the observed acceleration and the belief are mutually exclusive.',
  ARRAY[
    'why isnt the tension just the weight of the hanging block',
    'shouldnt the rope pull with exactly mg since thats whats hanging',
    'the rope holds the weight so why is T less than mg',
    'if the block weighs 19.6 N why does the rope only feel 13 N',
    'doesnt the string always match the weight its carrying'
  ],
  'pending_review'
),
-- ─── STATE_3 tension_same_throughout_massless_string deep-dive ─────────
(
  'tension_same_throughout_massless_string',
  'connected_bodies',
  'STATE_3',
  'Why does one single tension number describe the pull on two completely different masses?',
  'Student intuits that a heavier attached mass should somehow "feel" a different, larger pull from the rope than a lighter one, expecting tension to scale with whichever mass is on that end. But tension is a property of the ROPE itself, not of what it is attached to. For an ideal massless, inextensible rope, Newton''s second law applied to any tiny segment of the rope gives (mass of segment) × (its acceleration) = (net force on it) — and with zero mass, the net force must be exactly zero at every point along the rope''s length, which forces the pull to be identical everywhere along it, all the way from one end to the other. The two attached masses do not change the rope''s own internal force-balance requirement; they only help DETERMINE what that single shared tension value numerically works out to be, through their own separate equations of motion.',
  ARRAY[
    'why is the tension the same on both sides of the pulley',
    'does the rope pull harder on the heavy side',
    'shouldnt the string near the block have more tension than near the other block',
    'how can one number be the tension when two different things are attached',
    'if the masses are different why isnt the pull different too'
  ],
  'pending_review'
),
-- ─── STATE_3 rope_pulls_both_ends_equally deep-dive ────────────────────
(
  'rope_pulls_both_ends_equally',
  'connected_bodies',
  'STATE_3',
  'How does a single rope pull one block forward and another block upward at the same time?',
  'Student is confused by direction, not magnitude: it seems strange that "one tension" can act in two completely different directions on the two bodies. The resolution is that tension always acts ALONG the rope at the point where it touches a body, pulling that body toward the rope — it is not one arrow copied twice, it is the same scalar magnitude applied along two different local directions, set entirely by the rope''s own geometry at each end. Where the rope runs horizontally to the block on the table, it pulls that block horizontally; where it runs vertically down to the pulley and then vertically to the hanging block, it pulls that block vertically upward. The pulley''s only job is to change the rope''s DIRECTION without changing its tension — an ideal (frictionless, massless) pulley does no work on the rope and adds no extra force, it simply redirects the same pull around a corner.',
  ARRAY[
    'does the rope choose which end to pull harder on',
    'why does the same rope pull one block forward and the other one up',
    'if its one rope shouldnt it split its pull between the two blocks',
    'how does a single tension act in two different directions at once',
    'why doesnt the pulley change how much force the rope carries'
  ],
  'pending_review'
),
-- ─── STATE_4 which_body_gets_which_equation deep-dive ──────────────────
(
  'which_body_gets_which_equation',
  'connected_bodies',
  'STATE_4',
  'Do I write one equation for the whole system, or one for each block separately?',
  'Student is unsure whether "system method" (treat both masses as one lump) and "per-body method" (write Newton''s second law separately for each isolated body) are alternatives to pick from at random, or whether they always need both. Both methods are valid and give the identical acceleration, but they answer different questions: the system method (net external force on both bodies together, divided by total mass) is the fast route to acceleration ALONE, because it never introduces tension as an unknown in the first place — internal forces like tension cancel automatically since they act equally and oppositely between the two bodies. But it CANNOT tell you the tension itself, because tension is an internal force invisible to the whole-system view. The per-body method writes ΣF = ma for EACH body separately, keeping tension as an explicit unknown in both equations; solving that pair (usually by adding them, which is exactly why the system method''s shortcut works) gives you both the acceleration AND the tension. Use the system method when you only need acceleration; use two per-body equations whenever tension itself is part of the question.',
  ARRAY[
    'how do i know which block gets which equation',
    'do i write one equation for the whole system or one for each block',
    'why cant i just add both masses and use one big equation',
    'which blocks forces do i write down first',
    'do the two equations have to look different for each block'
  ],
  'pending_review'
),
-- ─── STATE_4 sign_convention_along_the_string deep-dive ────────────────
(
  'sign_convention_along_the_string',
  'connected_bodies',
  'STATE_4',
  'Why does block A''s "forward" count as block B''s "up," and how do I keep the signs straight across the pulley?',
  'Student is used to one shared x-axis for every body in a problem and is thrown by a system where "positive" means something different for each body. The rule is to pick, for EACH body, its own positive direction along its OWN natural axis of motion — for the table block, along the table toward the pulley; for the hanging block, downward, since that is the direction it actually moves as the rope pays out over the pulley. The key constraint that ties the two choices together is the inextensible string itself: whatever length the table block advances toward the pulley, the hanging block must descend by that exact same length, because the total rope length is fixed. So the sign convention is not arbitrary — it is FORCED by choosing each body''s own positive direction to be "the direction it moves when the system accelerates the way you expect," which automatically makes the two accelerations numerically equal (not oppositely signed against some single shared axis) even though geometrically the two motions point in visually different directions in the room.',
  ARRAY[
    'why does one blocks forward count as the other blocks up',
    'how do i keep the signs straight when the rope turns a corner',
    'why is tension positive for one block and negative for the other',
    'does the pulley flip the sign of the acceleration',
    'how do i decide which direction is positive for each block'
  ],
  'pending_review'
),
-- ─── STATE_4 system_method_vs_free_body_method deep-dive ───────────────
(
  'system_method_vs_free_body_method',
  'connected_bodies',
  'STATE_4',
  'Why does adding the two per-body equations together make the tension vanish, and is that a shortcut or a loss of information?',
  'Student sees the two-equation elimination step (add block A''s equation to block B''s equation, tension cancels) and wonders whether they are somehow throwing away real information about the system by doing it, or whether this is "cheating" compared to solving each equation individually first. Nothing is lost: tension appears in the two equations with OPPOSITE signs (it pulls block A forward but pulls back against block B''s fall, or equivalently drags upward on B), which is precisely the physical statement that the string''s pull is an internal, equal-and-opposite force between the two bodies — the same reason internal forces always cancel when you view two connected bodies as one system. Adding the equations is mathematically identical to switching from the per-body view to the whole-system view for the PURPOSE OF ELIMINATING TENSION ONLY; the acceleration you get out is exact, not approximate. If tension itself is still needed afterward, substitute the now-known acceleration back into EITHER of the original two per-body equations to solve for it — no information from the individual equations is ever discarded, only temporarily set aside during the elimination step.',
  ARRAY[
    'whats the difference between treating them as one system and drawing two free bodies',
    'why does adding the equations make the tension disappear',
    'when should i use the whole system shortcut instead of two separate equations',
    'do i lose information if i just add the masses together',
    'why does the system method give the same acceleration faster'
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
