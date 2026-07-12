-- supabase_2026-07-12_seed_wheatstone_bridge_clusters_migration.sql
-- Seeds confusion_cluster_registry with 3 clusters for wheatstone_bridge.json
-- — the TENTH concept on the particle_field (2D p5.js) renderer, same engine
-- family as drift_velocity/ohms_law/resistivity/combination_of_resistors/
-- emf_definition/internal_resistance/electrical_power_in_resistor/
-- kirchhoff_junction_rule_KCL/kirchhoff_loop_rule_KVL (REUSES the
-- combination_of_resistors scenario_type as the renderer selector — no new
-- scenario flag, per the approved design's "do NOT mint a new scenario_type"
-- directive; rides a NEW topology:'bridge' per-state flag instead).
-- Authored 2026-07-12 by alex:json_author per architect skeleton §6 +
-- physics_author drill-down trigger phrases (verbatim, physics block §7).
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
--   STATE_3 — the misconception pivot: "current stops everywhere at balance"
--             AND "the bridge only balances when all four resistors are
--             equal" (both are natural drill-down candidates at this state,
--             though only the first is fired inline via misconception_watch
--             per Rule 16a founder guardrail — no per-state tic)
--   STATE_4 — "you need the battery voltage / a meter reading to find the
--             unknown resistance" (fired inline via misconception_watch)

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_3 no_current_anywhere_at_balance deep-dive ─────────────────
(
  'no_current_anywhere_at_balance',
  'wheatstone_bridge',
  'STATE_3',
  'Does a balanced bridge mean the whole circuit has stopped carrying current?',
  'Student sees the galvanometer needle settle dead at zero and concludes the ENTIRE circuit has gone quiet, as though "balanced" meant "off". It doesn''t: balance only silences the bridge WIRE, the branch directly between the two midpoints. The four arms — resistor P then resistor Q on top, resistor R then resistor S on the bottom — are still being driven by the battery the whole time, carrying real, unchanged current (0.2 A and roughly 0.67 A in this sim). The sim shows this explicitly: the bridge-wire beads drain to none and the needle stops, while the arm bead streams never stop flowing.',
  ARRAY[
    'balanced means the whole circuit is off right',
    'if the needle reads zero doesnt that mean no current is flowing anywhere',
    'why do the arms still show current when the bridge is balanced',
    'shouldnt everything stop when its balanced',
    'zero on the galvanometer so the whole bridge has zero current too'
  ],
  'pending_review'
),
-- ─── STATE_3 balance_needs_equal_resistors deep-dive ──────────────────
(
  'balance_needs_equal_resistors',
  'wheatstone_bridge',
  'STATE_3',
  'Does a Wheatstone bridge only balance when all four resistors are equal?',
  'Student assumes balance means "all four arms carry the same resistance", generalizing from the simplest textbook example. The real condition is a RATIO match, P/Q = R/S — not an equality of all four values. The sim is deliberately built to break this belief: resistor P = 10 Ω and resistor Q = 20 Ω are UNEQUAL by design, and the bridge still nulls out perfectly at resistor R = 3 Ω, resistor S = 6 Ω (10/20 = 3/6 = 0.5). The ratio HUD makes this explicit, ticking from "0.5 vs 1.0 ✗" to "0.5 = 0.5 ✓" without any of the four arms ever becoming equal to another.',
  ARRAY[
    'the bridge only balances when all four resistors are equal right',
    'how can it balance when P and Q are different values',
    'isnt a balanced bridge just four equal resistors',
    'why does it null out even though ten and twenty ohms arent the same',
    'i thought balance meant every arm has the same resistance'
  ],
  'pending_review'
),
-- ─── STATE_4 battery_voltage_needed_for_measurement deep-dive ─────────
(
  'battery_voltage_needed_for_measurement',
  'wheatstone_bridge',
  'STATE_4',
  'Do you need to know the battery voltage or read a current to find the unknown resistance?',
  'Student assumes finding S requires measuring something — a current, a voltage, the battery''s own EMF — the way an ordinary meter reading would. It doesn''t: S = R·(Q/P) is read off three KNOWN resistances alone, once the galvanometer null confirms the ratio match. The sim proves the battery is irrelevant by sweeping its voltage from 3 V to 10 V while the bridge stays balanced (resistor R fixed at 3 Ω): both midpoints climb together in lockstep, the needle never leaves zero, and the on-screen formula S = R·(Q/P) = 6 Ω never contains a battery term at all — the battery cancels out of the ratio by construction.',
  ARRAY[
    'dont i need to know the battery voltage to find the unknown resistor',
    'how can you get S without measuring any current',
    'shouldnt changing the battery change the answer for S',
    'you must need a voltmeter reading to work out the unknown right',
    'why doesnt epsilon show up anywhere in the S formula'
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
