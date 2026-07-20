-- supabase_2026-07-14_seed_combination_of_cells_clusters_migration.sql
-- Seeds confusion_cluster_registry with 4 clusters for combination_of_cells.json
-- — the TWELFTH concept on the particle_field (2D p5.js) renderer, same engine
-- family as drift_velocity/ohms_law/resistivity/combination_of_resistors/
-- emf_definition/internal_resistance/electrical_power_in_resistor/
-- kirchhoff_junction_rule_KCL/kirchhoff_loop_rule_KVL/wheatstone_bridge/
-- potentiometer (REUSES the internal_resistance scenario_type as the renderer
-- selector — no new scenario_type minted, per the approved design's "do NOT
-- mint a new scenario_type" directive; rides NEW per-state flags instead:
-- cell_topology, cell_count, flip_cell2, dock_cell, switch_close_cue,
-- flip_cell, regroup, cycle_compare). Direct sequel of emf_definition +
-- internal_resistance (same charge-pump cell + ladder + terminal voltmeter,
-- now multiplied into 2-3 cells joined in series or parallel).
-- Authored 2026-07-14 by alex:json_author per architect skeleton §6 +
-- physics_author drill-down trigger phrases (verbatim, physics block §5).
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
-- idiomatic, no textbook prose), verbatim from the physics block §5.
-- status='pending_review' per the current cluster-registry convention.
--
-- Candidate cluster_ids (architect skeleton §6 — no has_prebuilt_deep_dive
-- flags authored on the concept itself; V1 ships ZERO authored deep-dives):
--   STATE_5/STATE_6 — "parallel cells always add up like series does" (fired
--             inline via misconception_watch at STATE_5 per Rule 16a founder
--             guardrail — no per-state tic), plus the deeper "why doesn't the
--             pack voltage rise" variant (drill-down only)
--   STATE_7   — "more cells is always more current" (fired inline via
--             misconception_watch), plus the deeper series-loses-on-heavy-load
--             quantitative variant (drill-down only)
--   STATE_4   — "a reversed cell also loses its own resistance" (fired inline
--             via misconception_watch), plus the deeper "does a dead circuit
--             still cost energy" variant (drill-down only)
--   STATE_6   — the SCOPE-deferred NCERT general case (unequal-emf parallel
--             cells, circulating current) — drill-down only, never a guided
--             state (architect §1 SCOPE note)

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_5 parallel_cells_voltage_confusion deep-dive ───────────────
(
  'parallel_cells_voltage_confusion',
  'combination_of_cells',
  'STATE_5',
  'Why doesn''t a parallel pack of cells read a higher voltage, the way a series pack does?',
  'Student assumes joining any two cells always adds their voltages, because that is exactly what happened one state earlier in series (1.50 V to 3.00 V). It doesn''t generalize: when identical cells sit SIDE BY SIDE instead of nose-to-tail, every cell''s positive terminal is tied to every other cell''s positive terminal — there is no second lift for a coulomb to climb, only a second path to take. The open-circuit voltmeter across a parallel bank of identical cells reads exactly one cell''s emf, ε_eq = ε, no matter how many cells are added. The sim makes this concrete: the SAME two cells that just read 3.00 V in series regroup side-by-side and the voltmeter glides back down to 1.50 V and holds, with a struck-through ghost of the old 3.00 V reading beside it. Parallel buys current headroom (via r_eq = r/m, shown the very next state) — it never buys voltage.',
  ARRAY[
    'why doesnt the voltage go up when I add a second battery side by side',
    'two batteries in parallel still show only one batterys voltage, why',
    'shouldnt more cells always mean more volts',
    'I connected two cells side by side and the reading didnt change, is my circuit wrong',
    'why does series double the voltage but parallel doesnt'
  ],
  'pending_review'
),
-- ─── STATE_7 more_cells_less_current deep-dive ────────────────────────
(
  'more_cells_less_current',
  'combination_of_cells',
  'STATE_7',
  'I added an extra cell in series and the current went DOWN — how can more cells give less current?',
  'Student has generalized "more cells always means more current" from an earlier, honestly-true experience (stacking two cells nearly doubled the current on a light load, STATE_3). It fails on a HEAVY load: every added series cell contributes its own emf AND its own internal resistance, and on a small external R the resistance term (n·r) can dominate the current formula i = n·ε/(R + n·r) more than the emf term helps. The sim''s head-to-head grid makes the failure concrete and reversible: on the heavy 0.25 Ω load, switching from a parallel bank (3.00 A) to a series stack of the SAME two cells actually DROPS the current to 2.40 A — stacking made it worse. On the light 4 Ω load the verdict flips: series (0.60 A) beats parallel (0.35 A). The lesson is not "series is bad" or "parallel is good" — it is that the right grouping depends on comparing the load R to each cell''s own internal resistance r.',
  ARRAY[
    'I added an extra cell in series and my motor got weaker, how',
    'more batteries but the bulb is not any brighter, why',
    'why did the current go down when I added a cell in series on a low resistance load',
    'isnt more cells always more current',
    'adding a cell made things worse, that doesnt make sense'
  ],
  'pending_review'
),
-- ─── STATE_4 reversed_cell_bookkeeping deep-dive ──────────────────────
(
  'reversed_cell_bookkeeping',
  'combination_of_cells',
  'STATE_4',
  'One of my cells is in backwards and the circuit is dead — do I just ignore that cell, resistance and all?',
  'Student assumes a cell that has been "cancelled out" by a reversed partner simply drops out of the circuit entirely, as if it were never there — resistance included. It doesn''t: reversing a cell flips the SIGN of its emf in the signed sum (ε_eq = ε₁ − ε₂, which is exactly zero for two identical cells), but its internal resistance r is a fixed physical property of its own electrolyte and electrodes, completely indifferent to which way current would flow through it — so r_eq = r₁ + r₂ is UNCHANGED by the flip. The sim shows both halves of this at once: flipping cell 2 kills the current and voltage to exactly zero (a dead circuit), while the r_eq chip keeps reading 1.0 Ω the entire time and both internal-resistance zigzags stay visibly drawn in the loop — two live cells, wired to produce nothing, still fully "there" resistance-wise.',
  ARRAY[
    'one of my cells is in backwards, do I just ignore it',
    'if two cells cancel out does their resistance also disappear',
    'why is the current zero but the cells are still fresh',
    'does a reversed cell still use up energy even though nothing flows',
    'how can two working batteries make a dead circuit'
  ],
  'pending_review'
),
-- ─── STATE_6 unequal_parallel_cells deep-dive (SCOPE-deferred NCERT general case) ───
(
  'unequal_parallel_cells',
  'combination_of_cells',
  'STATE_6',
  'What if the two cells in parallel aren''t identical — what emf do you even use, and can they push current into each other?',
  'This concept teaches the IDENTICAL-cell parallel result (ε_eq = ε, r_eq = r/m) because that carries the full conceptual payload of parallel grouping — the general unequal-cell case is genuine NCERT §3.12 scope but is deliberately deferred, not guided-state material, because it is Kirchhoff bookkeeping (ε_eq = (ε₁r₂ + ε₂r₁)/(r₁+r₂)) that adds no new motion archetype, and because unequal parallel cells introduce a genuinely separate phenomenon: a small circulating current CAN flow between the two cells even with nothing else connected, driven by their emf mismatch and limited only by their combined internal resistance — the stronger cell very slightly "recharges" the weaker one. This is real, examinable content that deserves its own reactive surface once a student asks for it directly, rather than 55 seconds of guided time inside a concept whose aha is about the grouping DECISION, not the unequal-cell formula.',
  ARRAY[
    'two different cells in parallel, what voltage do I even use',
    'does current flow between the two cells even with nothing else connected',
    'if one cell is stronger will it just recharge the weaker one',
    'whats the emf of the pack when the two cells arent the same',
    'can two unequal cells in parallel damage each other'
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
