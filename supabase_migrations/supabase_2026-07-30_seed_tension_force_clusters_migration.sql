-- supabase_2026-07-30_seed_tension_force_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters for tension_force.json —
-- Laws of Motion (Class 11) #7, on the newtons_laws_body field_3d engine
-- (docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md), Branch B pulley (STATE_1-4) then
-- SEAM H train (STATE_5-7). chapter:8, section:"8.4", prerequisites:
-- ["normal_force","newton_second_law","free_body_diagram"].
--
-- Authored 2026-07-30 by alex:json_author, using the physics_author's
-- drill-down trigger phrases VERBATIM (docs/loop_runs/lom/tension_force/
-- physics_block.md §6): STATE_3 — tension_equals_weight_always,
-- string_transmits_weight_not_force, tension_while_accelerating;
-- STATE_5 — same_tension_everywhere_chain, front_string_vs_rear_string,
-- tension_equals_applied_force.
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
-- STATE_3 (T = m2(g-a) < m2g — the supporting aha) and STATE_5 (T1 != T2 in
-- a chain — the PRIMARY aha) — both states carry a drill_downs array in the
-- concept JSON referencing these cluster_ids.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_3 tension_equals_weight_always deep-dive ────────────────────
(
  'tension_equals_weight_always',
  'tension_force',
  'STATE_3',
  'Why doesn''t tension equal the hanging weight anymore, once it starts moving?',
  'Student generalizes the AT-REST reading (T = m2g, earned honestly in STATE_1/2) into a permanent rule, so any change once the system starts accelerating feels like a contradiction. Tension is not a fixed property of the string — it is whatever force Newton''s second law demands, applied to the WHOLE coupled system. At rest, the system''s equation of motion (a = 0) happens to force T = m2g exactly. The moment the table is made frictionless and the block is released, the SAME equation of motion now has a != 0, and solving it (T = m2(g-a)) gives a smaller number: some of the hanging block''s weight now goes into accelerating the whole system instead of being entirely carried by the string. Nothing about the string itself changed — only the constraint it has to satisfy did.',
  ARRAY[
    'why doesnt tension equal the weight anymore',
    'tension is not mg why',
    'shouldnt the string pull with the full weight',
    'why is tension less than 19.6 now',
    'I thought T was just mg'
  ],
  'pending_review'
),
-- ─── STATE_3 string_transmits_weight_not_force deep-dive ───────────────
(
  'string_transmits_weight_not_force',
  'tension_force',
  'STATE_3',
  'Does the string just pass the hanging block''s weight through it, like a pipe?',
  'Student pictures the string as a passive conduit that "carries" the hanging block''s weight straight through to the other end, so the transmitted number should always equal that weight. A string is not a pipe for weight — it is a FORCE whose magnitude is set by solving Newton''s second law for the entire connected system, not by copying a number from one end to the other. While at rest, that solved value happens to equal the hanging weight (a coincidence of the a = 0 case, not a transmission rule). Once the system accelerates, the same solving process yields a smaller number, T = m2(g-a), because some of the weight''s effect is now spent accelerating both bodies rather than sitting statically in the string. The drop is not "less weight getting through" — it is a different equilibrium being solved.',
  ARRAY[
    'does the string send the weight through it',
    'is tension just the weight passing through the rope',
    'why does the string not carry the full weight',
    'how can tension be less than what is hanging',
    'if nothing is added why did tension drop'
  ],
  'pending_review'
),
-- ─── STATE_3 tension_while_accelerating deep-dive ──────────────────────
(
  'tension_while_accelerating',
  'tension_force',
  'STATE_3',
  'Why does starting to accelerate change the tension at all?',
  'Student expects tension to be independent of motion — a property that "belongs" to the string, the load, or the pulley, unaffected by whether the system moves. Tension is instead a CONSTRAINT force: whatever value makes Newton''s second law true for the bodies it acts on. For the hanging block, T - m2g = m2*(-a) (taking a as the acceleration magnitude downward), so T = m2(g - a). When a = 0 this gives T = m2g; the instant a becomes nonzero, the same equation forces T strictly below m2g. Acceleration is not a side effect that happens to reduce tension — it is baked directly into the same equation that defines what tension has to be at every instant.',
  ARRAY[
    'why does acceleration change the tension',
    'does moving make the string weaker',
    'why is T smaller once it starts sliding',
    'what decides tension if not the weight',
    'why does letting go change the number'
  ],
  'pending_review'
),
-- ─── STATE_5 same_tension_everywhere_chain deep-dive ───────────────────
(
  'same_tension_everywhere_chain',
  'tension_force',
  'STATE_5',
  'Shouldn''t every string in a connected chain carry the same tension?',
  'Student over-generalizes the true "one string, one tension" rule (correct for a SINGLE ideal string, earned honestly in STATE_4) into "one PULL, one tension everywhere," even across a chain of SEPARATE strings. Each string in the train is its own free body relationship: cut the system at any one string and apply Newton''s second law to everything on one side of that cut. Cutting at the rear string isolates only the rear cart (2 kg), so that string''s tension is 2 kg times the shared acceleration. Cutting at the front string isolates the rear PLUS middle cart (4 kg), so that string''s tension is 4 kg times the same acceleration — a different number, because a different mass sits behind the cut. "One string, one tension" was always about a SINGLE string''s own two ends, never about every string in a multi-string system reading the same value.',
  ARRAY[
    'why are the two strings different numbers',
    'shouldnt every string in the chain have the same tension',
    'I thought one pull means one tension everywhere',
    'why isnt T the same on both ropes',
    'does every string in a line carry the same pull'
  ],
  'pending_review'
),
-- ─── STATE_5 front_string_vs_rear_string deep-dive ─────────────────────
(
  'front_string_vs_rear_string',
  'tension_force',
  'STATE_5',
  'Why does the string closer to the push carry MORE tension, not less?',
  'Student expects the string nearer the applied force to be "closer to the source" and therefore somehow weaker or unaffected, while the far string does the real work of "catching up." Cutting the train at each string reveals the opposite: the string nearer the push has to accelerate everything BEHIND that cut — for the front string, that is two carts (4 kg); for the rear string, only one cart (2 kg). Proximity to the applied force is not what sets a string''s tension — the total mass it has to keep moving is. Since the front string is responsible for more mass, it necessarily reads a larger number, exactly twice the rear string''s in this equal-mass train.',
  ARRAY[
    'why does the front string read more than the back one',
    'which string should be bigger, the one near the pull or far from it',
    'why is the string closest to the push not the smallest',
    'does the string near the force always carry more',
    'why does the rear string only show half the number'
  ],
  'pending_review'
),
-- ─── STATE_5 tension_equals_applied_force deep-dive ────────────────────
(
  'tension_equals_applied_force',
  'tension_force',
  'STATE_5',
  'Why isn''t the front string''s tension just equal to the total 3 N applied force?',
  'Student assumes the string nearest the push must carry the ENTIRE applied force, since it is the one link "between" the push and the rest of the train. The front cart itself also needs force to accelerate — by Newton''s second law, the front cart''s own share of the 3 N pull (2 kg times the shared 0.5 m/s^2, or 1.00 N) is spent accelerating the front cart directly and never enters the front string at all. Only the remaining 2.00 N is what the front string actually has to supply to drag the two carts behind it, so T2 = 2.00 N, strictly less than the full 3.00 N applied force. The "missing" 1.00 N was never missing — it went straight into the front cart''s own acceleration.',
  ARRAY[
    'why doesnt the front string just equal the 3 newtons',
    'isnt the tension the same as the force we applied',
    'why is T2 only 2 not 3',
    'shouldnt the string touching the push carry the whole force',
    'where did the missing 1 newton go'
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
