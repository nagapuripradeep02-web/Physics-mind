-- supabase_2026-07-12_seed_kirchhoff_loop_rule_KVL_clusters_migration.sql
-- Seeds confusion_cluster_registry with 3 clusters for
-- kirchhoff_loop_rule_KVL.json — the NINTH concept on the particle_field
-- (2D p5.js) renderer, same engine family as drift_velocity/ohms_law/
-- resistivity/combination_of_resistors/emf_definition/internal_resistance/
-- electrical_power_in_resistor/kirchhoff_junction_rule_KCL (REUSES the
-- emf_definition scenario_type as the renderer selector — no new scenario
-- flag, per the approved design's "do NOT mint a new scenario_type"
-- directive).
-- Authored 2026-07-12 by alex:json_author per architect skeleton §6 +
-- physics_author drill-down trigger phrases (verbatim).
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
-- Each trigger_examples array carries 5 real student-voice phrasings (lowercase,
-- idiomatic, no textbook prose), verbatim from the physics block.
-- status='pending_review' per the current cluster-registry convention.
--
-- Candidate cluster_ids (architect skeleton §6 — no has_prebuilt_deep_dive
-- flags authored on the concept itself; V1 ships ZERO authored deep-dives):
--   STATE_3 — the misconception pivot: "leftover voltage after the drops"
--             AND "add all voltages regardless of direction" (both
--             confronted at this one state)
--   STATE_4 — the natural drill-down beyond this diamond's scope: a second
--             / opposing EMF in the same loop (sign of epsilon)

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_3 leftover_voltage_after_drops deep-dive ───────────────────
(
  'leftover_voltage_after_drops',
  'kirchhoff_loop_rule_KVL',
  'STATE_3',
  'Why doesn''t the loop end with some voltage left over after crossing both resistors?',
  'Student imagines the potential ladder ending ABOVE zero after the resistor drops, as though some of the cell''s six volts simply goes unaccounted for. It doesn''t: the rise at the cell and the total of the drops are the SAME quantity viewed two ways — a charge that completes the loop returns to exactly the potential it started at, because potential is a property of POSITION, not of the path taken to reach it. The sim''s ladder is pinned to exactly zero height at loop-close at every resistor setting, however the individual drops (four-and-two, or two-and-four after R2 grows) redistribute between them.',
  ARRAY[
    'why does the loop end at exactly zero',
    'shouldnt some voltage be left after both resistors',
    'where does the leftover voltage go',
    'does the loop always come back to zero exactly',
    'why is nothing left over after crossing both resistors'
  ],
  'pending_review'
),
-- ─── STATE_3 all_voltages_added_positive deep-dive ────────────────────
(
  'all_voltages_added_positive',
  'kirchhoff_loop_rule_KVL',
  'STATE_3',
  'Why can''t I just add the cell voltage and both resistor drops as positive numbers?',
  'Student writes the loop equation as six plus four plus two equals twelve, treating every element''s voltage as a positive contribution regardless of direction. The loop rule needs SIGNED traversal: a source crossed low-to-high is a RISE (positive), a resistor crossed along the current is a DROP (negative) — H-to-L in the DCP convention. Only the signed sum closes the loop: plus-six minus-four minus-two equals zero. The sim shows this as a struck-through naive ghost ("6 + 4 + 2 = 12", pinned and wrong) sitting beside the real, live, signed sum that always reads zero, with H/L tags anchoring which end of each resistor is the higher potential.',
  ARRAY[
    'why cant i just add 6 plus 4 plus 2',
    'i got 12 volts by adding all three is that wrong',
    'why is the resistor drop negative in the equation',
    'should i add or subtract the voltages around the loop',
    'why does the sign flip for the resistor terms'
  ],
  'pending_review'
),
-- ─── STATE_4 second_emf_sign_in_loop deep-dive ────────────────────────
(
  'second_emf_sign_in_loop',
  'kirchhoff_loop_rule_KVL',
  'STATE_4',
  'What happens to the loop equation if there are two batteries (EMFs) in the same loop?',
  'Student asks a natural next question this diamond intentionally defers: this concept ships with exactly ONE ideal EMF in the loop (keeps the atomic claim to a single source). A second EMF adds or subtracts from the loop sum exactly like a resistor drop does — by the SAME sign convention (rise if traversed low-to-high, drop/negative rise if traversed high-to-low along the assumed loop direction) — but whether the two EMFs AID or OPPOSE each other depends on how they are physically oriented in the loop, which needs its own guided state to show rather than explain in passing here. Deferred to a future drill-down once real student confusion data exists.',
  ARRAY[
    'what if there are two batteries in the same loop',
    'does the second emf add or subtract',
    'how do i know the sign of the second cell',
    'what happens if the two cells oppose each other',
    'why would epsilon be negative in the loop equation'
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
