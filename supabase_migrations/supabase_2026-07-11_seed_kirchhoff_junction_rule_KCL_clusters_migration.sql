-- supabase_2026-07-11_seed_kirchhoff_junction_rule_KCL_clusters_migration.sql
-- Seeds confusion_cluster_registry with 3 clusters for
-- kirchhoff_junction_rule_KCL.json — the EIGHTH concept on the
-- particle_field (2D p5.js) renderer, same engine family as
-- drift_velocity/ohms_law/resistivity/combination_of_resistors/
-- emf_definition/internal_resistance/electrical_power_in_resistor (REUSES the
-- combination_of_resistors scenario_type verbatim — no new scenario flag).
-- Authored 2026-07-11 by alex:json_author per architect skeleton §6 +
-- physics_author §5 drill-down trigger phrases (verbatim).
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
-- idiomatic, no textbook prose), verbatim from physics_author §5.
-- status='pending_review' per the current cluster-registry convention.
--
-- Candidate cluster_ids (architect skeleton §6 — no has_prebuilt_deep_dive
-- flags authored on the concept itself; V1 ships ZERO authored deep-dives):
--   STATE_3 — the misconception pivot: "current gets used up" AND "a fork
--             always splits fifty-fifty" (both confronted at this one state)
--   STATE_4 — the generalization: sign convention / which current counts as
--             in vs out when applying Sigma i = 0 at an N-wire node

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_3 current_used_up_at_junction deep-dive ────────────────────
(
  'current_used_up_at_junction',
  'kirchhoff_junction_rule_KCL',
  'STATE_3',
  'Why doesn''t current get used up passing through a resistor at a junction?',
  'Student treats current the way they''d treat a consumable — as if a resistor "spends" some of it the way it would spend fuel. A resistor spends ENERGY (as heat), never CHARGE: the number of electrons per second entering a branch equals the number per second leaving it, because charge is strictly conserved at every point in a wire. The sim''s A_in and A_out ammeters make this visible with two instruments — the same reading whether interpreted as current entering the split or leaving after the branches recombine, both at 2.00 A, unmoved by whatever the resistor values are.',
  ARRAY[
    'why doesnt current go down after passing a resistor',
    'shouldnt some current be lost at the junction',
    'why is inflow same as outflow isnt some of it used up',
    'current gets consumed by resistors right so output should be less',
    'if resistor uses up current the ammeter after it should read less no'
  ],
  'pending_review'
),
-- ─── STATE_3 fork_splits_fifty_fifty deep-dive ────────────────────────
(
  'fork_splits_fifty_fifty',
  'kirchhoff_junction_rule_KCL',
  'STATE_3',
  'Why doesn''t current split fifty-fifty at every fork, regardless of the resistors?',
  'Student over-generalizes STATE_2''s equal-branch demo (which genuinely does split 1.0 + 1.0) into a universal rule — "a fork always shares evenly." It doesn''t: current splits by CONDUCTANCE (1/R). The branch with LESS resistance is the easier path and carries MORE current, in exact proportion to 1/R — not an automatic half-and-half share. STATE_3''s sim makes this concrete: with R1=6Ω and R2=2Ω, the naive expectation (1.00+1.00) is wrong; the real split is 0.50+1.50 — still summing to the same 2.00 A total, but nowhere near even.',
  ARRAY[
    'why doesnt it split half half at the fork',
    'shouldnt both branches always get equal current',
    'why is one branch getting more current than the other',
    'isnt a junction always fifty fifty by definition',
    'how can unequal resistors still not give an equal split I thought current always divides evenly'
  ],
  'pending_review'
),
-- ─── STATE_4 sign_convention_at_node deep-dive ────────────────────────
(
  'sign_convention_at_node',
  'kirchhoff_junction_rule_KCL',
  'STATE_4',
  'Which current counts as positive when writing Kirchhoff''s junction equation at a node?',
  'Student is confused about the SIGN CONVENTION once a junction has more than the sim''s two visible branches, or once a problem is phrased algebraically (Σi = 0) instead of physically (Σi_in = Σi_out). The two forms are the SAME statement: currents flowing INTO the node are counted positive (or negative — either convention works, as long as it is applied consistently) and currents flowing OUT are counted with the opposite sign; the equation Σi = 0 simply moves every "out" term to the other side of Σi_in = Σi_out. The physical content never changes: whatever direction you assume for an unknown branch, if the algebra gives a negative number, the current actually flows the opposite way — the MAGNITUDE relationship (in-total = out-total) is what the sim visually pins down, at every junction, regardless of how many wires meet there.',
  ARRAY[
    'which current counts as positive in kirchhoffs junction law',
    'how do i know if a branch current is entering or leaving the node',
    'why is sigma i equal to zero if directions are all mixed up',
    'do i take incoming current as negative or outgoing as negative',
    'im confused about the sign convention when writing the kcl equation'
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
