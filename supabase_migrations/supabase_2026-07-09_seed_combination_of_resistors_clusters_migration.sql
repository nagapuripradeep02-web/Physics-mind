-- supabase_2026-07-09_seed_combination_of_resistors_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for combination_of_resistors.json —
-- the FOURTH concept on the particle_field (2D p5.js) renderer, same engine
-- family as drift_velocity/ohms_law/resistivity (dedicated circuit scenario).
-- Authored 2026-07-09 by alex:json_author per architect skeleton §6 +
-- physics_author drill-down trigger phrases §6. Migration is AUTHORED, not
-- applied — quality_auditor's pre-run step applies it (json_author is
-- forbidden from apply_migration).
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- Each trigger_examples array carries 5 real-Indian-11th/12th-grade phrasings
-- (lowercase, idiomatic, no textbook prose). status='pending_review' per the
-- current cluster-registry convention (mirrors the ohms_law/resistivity migrations).
--
-- THREE has_prebuilt_deep_dive-flagged states (json_author §5, drill-down is a
-- DEFERRED feature — Rule 18 — hand-authored only after analytics flag the state),
-- 3 candidate clusters each (json_author §6 / architect skeleton §6):
--   STATE_5 — PRIMARY aha: a parallel path LOWERS total resistance, the ammeter climbs
--   STATE_6 — current division: branches share VOLTAGE equally, never current
--   STATE_7 — the reciprocal formula: 1/R_eq = 1/R1 + 1/R2, remember to invert

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_5 why_more_paths_less_resistance deep-dive ─────────────────
(
  'why_more_paths_less_resistance',
  'combination_of_resistors',
  'STATE_5',
  'How does adding a resistor DECREASE the resistance?',
  'Student is confused because in series, adding R2 raised the resistance and lowered the current — but the same R2, moved ACROSS R1 instead of in-line, does the opposite. Adding a resistor in-line adds an obstacle on the ONLY path; adding one across the first gives the current a SECOND path, and more paths always means less overall resistance, never more.',
  ARRAY[
    'how does adding a resistor decrease the resistance',
    'more resistors should mean more resistance na',
    'why did the current increase when i added another resistor',
    'adding resistance should reduce current not increase it',
    'this makes no sense more parts more resistance right'
  ],
  'pending_review'
),
-- ─── STATE_5 parallel_req_below_smallest deep-dive ────────────────────
(
  'parallel_req_below_smallest',
  'combination_of_resistors',
  'STATE_5',
  'Why is the equivalent resistance smaller than even the smallest resistor?',
  'Student expects R_eq to land somewhere between R1 and R2 (like an average), not below both. Because 1/R_eq = 1/R1 + 1/R2 adds CONDUCTANCES (ease of flow), not resistances, R_eq is always pulled below the smaller of the two branches — as a limiting case, adding an infinite resistor in parallel changes nothing (R_eq stays R1), so R_eq can only fall, never rise, as branches are added.',
  ARRAY[
    'why is req smaller than the smallest resistor',
    'how can equivalent resistance be less than 6 ohms when both resistors are 6 and 12',
    'req is less than even the smaller resistor how',
    'shouldnt equivalent resistance be somewhere between the two values',
    'why does parallel resistance go below both resistors'
  ],
  'pending_review'
),
-- ─── STATE_5 battery_supplies_more_current deep-dive ──────────────────
(
  'battery_supplies_more_current',
  'combination_of_resistors',
  'STATE_5',
  'Where does the extra current come from when a branch is added?',
  'Student wonders if the battery is "working harder." An ideal battery holds V fixed; adding a lower-resistance path simply lets it push more total current at the SAME voltage (i_total = V/R_eq climbs because R_eq fell) — the battery is not straining, it is just meeting a lower-resistance demand. This is the seed for electric_power_heating (deferred): more current at the same V does mean the battery delivers more power.',
  ARRAY[
    'where does the extra current come from',
    'does the battery drain faster in parallel',
    'battery is giving more current suddenly how',
    'is the battery working harder in a parallel circuit',
    'more current means battery dies faster right'
  ],
  'pending_review'
),
-- ─── STATE_6 current_division_ratio deep-dive ─────────────────────────
(
  'current_division_ratio',
  'combination_of_resistors',
  'STATE_6',
  'How much current goes through each parallel branch?',
  'Student often writes the ratio the wrong way round (i1/i2 = R1/R2). Because both branches share the SAME voltage V, i1 = V/R1 and i2 = V/R2, so i1/i2 = R2/R1 — the INVERSE resistance ratio: the smaller resistor gets the BIGGER share of current, not the other way round.',
  ARRAY[
    'how much current goes through each branch',
    'why does the smaller resistor get more current',
    'i did r1/r2 for the ratio is that wrong',
    'how to find current in each branch of parallel',
    'which branch gets more current the bigger or smaller resistor'
  ],
  'pending_review'
),
-- ─── STATE_6 same_voltage_across_branches deep-dive ───────────────────
(
  'same_voltage_across_branches',
  'combination_of_resistors',
  'STATE_6',
  'Why do both parallel branches get the full battery voltage?',
  'Student expects voltage to divide across branches the way it divides across series resistors. Both branches connect directly across the SAME two nodes (the battery terminals, via ideal zero-resistance wire), so by definition of potential difference both branches see the identical V — voltage divides in series (different points along one path) but NOT in parallel (same two endpoints for every branch).',
  ARRAY[
    'why do both branches get the full battery voltage',
    'shouldnt voltage split in parallel like it does in series',
    'why is voltage same across both resistors here',
    'each branch has different resistance so why same voltage',
    'does voltage divide in parallel circuits or not'
  ],
  'pending_review'
),
-- ─── STATE_6 junction_current_conservation deep-dive ──────────────────
(
  'junction_current_conservation',
  'combination_of_resistors',
  'STATE_6',
  'Why is the total current exactly i1 plus i2 at the junction?',
  'Student wants to know why current adds (not averages, not stays constant) at a junction. This is charge conservation (Kirchhoff''s junction rule): in steady state no charge accumulates at the junction node, so everything flowing IN must flow OUT — i_total splits into i1 and i2 on the way out, and i1 + i2 = i_total always, exactly. This is the seed for kirchhoffs_laws (deferred).',
  ARRAY[
    'why is total current equal to i1 plus i2',
    'at the junction where does the current go',
    'how do you know current splits and doesnt get used up',
    'is current conserved at the junction point',
    'why does current entering the junction equal current leaving'
  ],
  'pending_review'
),
-- ─── STATE_7 reciprocal_invert_slip deep-dive ─────────────────────────
(
  'reciprocal_invert_slip',
  'combination_of_resistors',
  'STATE_7',
  'I computed 1/6 + 1/12 = 1/4 — is R_eq 0.25 Ω?',
  'Student computes 1/R_eq correctly but forgets the final inversion step. 1/R1 + 1/R2 gives you 1/R_eq, NOT R_eq — you must flip the fraction: 1/6 + 1/12 = 1/4 means 1/R_eq = 1/4, so R_eq = 4 Ω, not 0.25 Ω. This is the single most common mechanical slip on the reciprocal formula.',
  ARRAY[
    'i added 1/6 plus 1/12 and got 1/4 is that the answer',
    'do i need to invert after adding the reciprocals',
    'why is req not 0.25 ohms',
    'i keep forgetting to flip the fraction at the end',
    '1 over req is 0.25 so req is 0.25 right'
  ],
  'pending_review'
),
-- ─── STATE_7 product_over_sum_shortcut deep-dive ──────────────────────
(
  'product_over_sum_shortcut',
  'combination_of_resistors',
  'STATE_7',
  'When can I use R1R2/(R1+R2) instead of the reciprocal formula?',
  'Student wants the fast two-resistor shortcut and its limits. R_eq = R1R2/(R1+R2) is algebraically IDENTICAL to 1/R_eq = 1/R1 + 1/R2 but ONLY for exactly two resistors — for three or more, either combine pairwise (reduce two at a time, chaining the shortcut) or use the general 1/R_eq = sum(1/Rk) form directly.',
  ARRAY[
    'when can i use r1r2 over r1 plus r2',
    'does the product over sum trick work for three resistors',
    'is r1r2 over r1 plus r2 only for two resistors',
    'can i chain the shortcut formula for more resistors',
    'why does this shortcut only work for two at a time'
  ],
  'pending_review'
),
-- ─── STATE_7 n_equal_resistors_pattern deep-dive ──────────────────────
(
  'n_equal_resistors_pattern',
  'combination_of_resistors',
  'STATE_7',
  'For n equal resistors, why is the series/parallel ratio n squared?',
  'Student has seen the n² shortcut for identical resistors and wants the derivation. n equal resistors R in series give R_eq = nR (each adds its full value); the same n resistors in parallel give R_eq = R/n (each identical branch divides the conductance). The ratio of series to parallel is therefore nR / (R/n) = n² — a clean JEE-style pattern that falls straight out of the two combination laws already taught here.',
  ARRAY[
    'for n equal resistors why is series parallel ratio n squared',
    'if all resistors are equal is there a shortcut formula',
    'n resistors in series vs n in parallel what is the ratio',
    'why is it nR for series and R/n for parallel',
    'is there a pattern when all the resistors are the same value'
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
