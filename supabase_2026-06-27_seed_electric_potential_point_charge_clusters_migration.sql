-- supabase_2026-06-27_seed_electric_potential_point_charge_clusters_migration.sql
-- Registers electric_potential_point_charge.json (Class 12 Ch.2 §2.2 — the point-charge
-- FORMULA/VALUE of electric potential: V = kQ/r at distance r, falling off as 1/r — ONE
-- power of r, SLOWER than the field's 1/r². Halving r only DOUBLES V (not ×4 — the ×4 is
-- the field's 1/r² instinct); V rides ABOVE E far out (they meet at r₀=2 then diverge); V
-- is a SIGNED SCALAR (+Q hill, −Q well, no arrow). This is the point-charge VALUE diamond —
-- it declares electric_potential_meaning (what V MEANS, V = W/q) as a prerequisite and does
-- NOT re-teach it.
--
-- Authored 2026-06-27 by json_author. AUTHORED, NOT AUTO-APPLIED (quality_auditor's pre-run
-- step applies it — json_author never runs apply_migration).
--
-- Two writes:
--   (1) concept_panel_config — the panel registration (field_3d / threejs, single).
--   (2) confusion_cluster_registry — the 6 drill-down clusters (3 on STATE_3, 3 on STATE_4),
--       each with 5 student-voice trigger phrasings from the physics block.
--
-- Cluster placement (per the architect skeleton drill_downs arrays):
--   STATE_3 (halve r — the 1/r² instinct says ×4, V only DOUBLES) — 3 clusters:
--     why_one_power_of_r · halve_r_doubles_v · v_nonzero_where_e_dead
--   STATE_4 (V (1/r) curve over E (1/r²) ghost, meet at r=2) — 3 clusters:
--     curve_shape_1r_vs_1r2 · crossover_intuition · sign_on_the_curve
--
-- STATE_3, STATE_4, STATE_5 each carry allow_deep_dive: true in the JSON.
--
-- CUT-LINE GUARD: this concept teaches the point-charge VALUE/FORMULA V = kQ/r and its 1/r
-- falloff. It does NOT teach what V MEANS (V = W/q — that is electric_potential_meaning), the
-- VECTOR field E = kQ/r² (electric_field_point_charge), the superposition of potentials from a
-- SYSTEM of charges, E = −dV/dr, the dipole potential, or capacitance. Any "what does potential
-- mean" / "V = W/q" / "work per unit charge" drill-down belongs to the sibling, not here. The
-- clusters below stay on the 1/r falloff (why one power of r), the halve-r-doubles result, why V
-- survives where the force is dead, the 1/r-vs-1/r² curve shapes, the crossover, and the sign.
--
-- ON CONFLICT idempotent so re-running re-syncs the rows.

-- ── (1) Panel registration ────────────────────────────────────────────────────
INSERT INTO concept_panel_config
  (concept_id, panel_a_renderer, technology_a, default_panel_count, class_level, chapter)
VALUES
  ('electric_potential_point_charge', 'field_3d', 'threejs', 1, '12', 'Electrostatic Potential and Capacitance')
ON CONFLICT (concept_id) DO UPDATE SET
  panel_a_renderer    = EXCLUDED.panel_a_renderer,
  technology_a        = EXCLUDED.technology_a,
  default_panel_count = EXCLUDED.default_panel_count,
  class_level         = EXCLUDED.class_level,
  chapter             = EXCLUDED.chapter;

-- ── (2) Drill-down clusters ───────────────────────────────────────────────────
-- Schema columns: cluster_id, concept_id, state_id, label, description,
--   trigger_examples, status, created_at, updated_at. PRIMARY KEY is (cluster_id).
INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'why_one_power_of_r',
  'electric_potential_point_charge',
  'STATE_3',
  'Why is r not squared in the potential?',
  'student expects V to carry the field''s 1/r² and cannot see why the potential has only ONE power of r downstairs; needs the V = kQ/r vs E = kQ/r² contrast (one power of r is gentler than two)',
  ARRAY[
    'why is r not squared in potential',
    'why one r in V but two r in field',
    'why kq/r not kq/r2 for potential',
    'shouldnt potential also have r squared',
    'where did the second r go in V'
  ],
  'active'
),
(
  'halve_r_doubles_v',
  'electric_potential_point_charge',
  'STATE_3',
  'I halved r — why did V only double, not quadruple?',
  'student applies the field''s 1/r² (×4 on halving r) to the potential and is surprised V goes 6 → 12 not 6 → 24; needs the 1/r falloff (r → r/2 ⇒ V → 2V, never 4V)',
  ARRAY[
    'i halved r why didnt V become 4 times',
    'why does V only double not quadruple',
    'halve distance V doubles only',
    'thought closer means 4x potential',
    'why V went 6 to 12 not 6 to 24'
  ],
  'active'
),
(
  'v_nonzero_where_e_dead',
  'electric_potential_point_charge',
  'STATE_3',
  'Why is V still big where the force is nearly gone?',
  'student cannot reconcile a near-zero force far out with a clearly non-zero potential; needs the 1/r-reaches-farther-than-1/r² argument (V fades slower than E, so V survives where E has died)',
  ARRAY[
    'why is V still big where force is small',
    'field is almost zero but potential still there',
    'far away no push but V not zero why',
    'how can potential exist if no force felt',
    'voltage stays but field gone'
  ],
  'active'
),
(
  'curve_shape_1r_vs_1r2',
  'electric_potential_point_charge',
  'STATE_4',
  'What is the difference between the 1/r and 1/r² graphs?',
  'student cannot tell the potential''s 1/r curve from the field''s 1/r² curve, or which is steeper; needs the side-by-side bright-V-over-dim-E graph (the 1/r curve fades more slowly)',
  ARRAY[
    'difference between 1/r and 1/r2 graph',
    'which curve is steeper V or E',
    'why are the two curves different shape',
    '1/r curve vs 1/r squared curve',
    'what does V vs r graph look like'
  ],
  'active'
),
(
  'crossover_intuition',
  'electric_potential_point_charge',
  'STATE_4',
  'Why do the curves meet then split, with V above E far out?',
  'student does not see why the 1/r and 1/r² curves cross at r₀=2 and then diverge with V on top; needs the falloff-rate intuition (E dies faster, so past the crossing V always rides above E)',
  ARRAY[
    'why do the curves meet then split',
    'why V above E far away',
    'where do V and E cross on graph',
    'potential bigger than field far out why',
    'why does V fade slower than field'
  ],
  'active'
),
(
  'sign_on_the_curve',
  'electric_potential_point_charge',
  'STATE_4',
  'Does the V curve go negative for a negative charge?',
  'student is unsure how the V-vs-r curve changes when Q flips sign; needs the signed-scalar result (the same gentle 1/r shape, just reflected below zero — a well, never a different shape or an arrow)',
  ARRAY[
    'does the V curve go negative for minus charge',
    'what happens to graph when q is negative',
    'is the negative q curve flipped',
    'does sign change the curve shape',
    'minus charge potential below zero on graph'
  ],
  'active'
)
ON CONFLICT (cluster_id) DO UPDATE
  SET concept_id       = EXCLUDED.concept_id,
      state_id         = EXCLUDED.state_id,
      label            = EXCLUDED.label,
      description      = EXCLUDED.description,
      trigger_examples = EXCLUDED.trigger_examples,
      status           = EXCLUDED.status,
      updated_at       = now();

-- Verify:
-- SELECT * FROM concept_panel_config WHERE concept_id = 'electric_potential_point_charge';
--   Should return 1 row with panel_a_renderer = 'field_3d', technology_a = 'threejs'.
-- SELECT cluster_id, state_id FROM confusion_cluster_registry
--   WHERE concept_id = 'electric_potential_point_charge' ORDER BY state_id, cluster_id;
--   Should return 6 rows (3 STATE_3, 3 STATE_4).
