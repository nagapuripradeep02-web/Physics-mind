-- supabase_2026-06-26_seed_electric_potential_meaning.sql
-- Registers electric_potential_meaning.json (Class 12 Ch.2 §2.1-2.2 — the MEANING
-- of electric potential: V = W/q, the work done per unit positive test charge to
-- bring it from infinity to a point; a single SCALAR per location (no direction),
-- path-independent because the electrostatic force is conservative, measured against
-- V(∞)=0; ΔV = V_B − V_A is the per-unit-charge work between two points; V is a
-- property of the PLACE, not the test charge that probes it). This is the
-- foundation/meaning diamond — it teaches V = W/q and STOPS SHORT of V = kQ/r (the
-- separate sibling electric_potential_point_charge).
--
-- Authored 2026-06-26 by json_author.
--
-- Two writes:
--   (1) concept_panel_config — the panel registration (field_3d / threejs, single).
--   (2) confusion_cluster_registry — the 3 FOUNDER-LOCKED drill-down clusters (the
--       strongest of each hard state; physics block §11 authored all nine — three
--       per hard state — and the strongest of STATE_2/STATE_4/STATE_6 is seeded here).
--
-- Cluster placement (1 cluster per hard state — the founder-locked subset):
--   STATE_2 (why does the path not matter? — conservative field, SUPPORTING aha) — 1 cluster
--   STATE_4 (why do we divide the work by the charge? — V = W/q definition)        — 1 cluster
--   STATE_6 (is potential a vector or a scalar? — the PRIMARY aha)                  — 1 cluster
--
-- STATE_2, STATE_4, STATE_6 each carry allow_deep_dive: true in the JSON (the two
-- supporting confusion hotspots + the PRIMARY-aha state flagged by physics-author).
--
-- CUT-LINE GUARD: this concept teaches what V MEANS (V = W/q). It does NOT teach
-- the point-charge VALUE/FORMULA V = kQ/r (that is electric_potential_point_charge),
-- the VECTOR field E = kQ/r² (electric_field_point_charge), the potential energy of
-- a SYSTEM of charges, capacitance, or conductor equipotential. Any "what is V at
-- distance r from a point charge" / "V = kQ/r" drill-down belongs to the sibling, not
-- here. The clusters below stay on path-independence, dividing-out-q, and V-is-a-scalar.
--
-- ON CONFLICT idempotent so re-running re-syncs the rows.

-- ── (1) Panel registration ────────────────────────────────────────────────────
INSERT INTO concept_panel_config
  (concept_id, panel_a_renderer, technology_a, default_panel_count, class_level, chapter)
VALUES
  ('electric_potential_meaning', 'field_3d', 'threejs', 1, '12', 'Electrostatic Potential and Capacitance')
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
  'why_path_doesnt_matter',
  'electric_potential_meaning',
  'STATE_2',
  'Why does the path not matter for the work?',
  'student believes a longer or different route to the same point costs different work; needs the conservative-force ⇒ endpoints-only argument (the two equal tallies, W = 6 both routes)',
  ARRAY[
    'why does the path not matter for the work',
    'why is the work same for both routes',
    'why doesnt taking the long way cost more',
    'shouldnt a longer path need more work',
    'why path independent'
  ],
  'active'
),
(
  'why_divide_by_charge',
  'electric_potential_meaning',
  'STATE_4',
  'Why do we divide the work by the charge?',
  'student does not see why potential is W/q rather than just W (or W*q); needs the divide-out-the-prober argument (2q doubles W but W/q stays the same, so V belongs to the place not the charge)',
  ARRAY[
    'why do we divide the work by the charge',
    'why is it W over q and not W times q',
    'whats the point of dividing by q to get potential',
    'why not just use the work as the potential',
    'why divide out the test charge'
  ],
  'active'
),
(
  'is_potential_a_vector',
  'electric_potential_meaning',
  'STATE_6',
  'Is potential a vector or a scalar?',
  'student thinks potential has a direction or IS the field E; needs the scalar-shells-vs-perpendicular-E contrast (one plain number per shell, no arrow; the only arrow is E)',
  ARRAY[
    'is potential a vector or scalar',
    'does potential have a direction',
    'is V an arrow like the field',
    'why is potential not a vector',
    'is electric potential the same as the field'
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
-- SELECT * FROM concept_panel_config WHERE concept_id = 'electric_potential_meaning';
--   Should return 1 row with panel_a_renderer = 'field_3d', technology_a = 'threejs'.
-- SELECT cluster_id, state_id FROM confusion_cluster_registry
--   WHERE concept_id = 'electric_potential_meaning' ORDER BY state_id, cluster_id;
--   Should return 3 rows (1 STATE_2, 1 STATE_4, 1 STATE_6).
