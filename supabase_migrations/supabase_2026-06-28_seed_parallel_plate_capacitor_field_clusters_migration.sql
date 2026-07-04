-- supabase_2026-06-28_seed_parallel_plate_capacitor_field_clusters_migration.sql
-- Registers parallel_plate_capacitor_field.json (Class 12 Ch.2 §2.12 — the UNIFORM
-- FIELD between two oppositely charged parallel plates: straight, parallel,
-- equally-spaced field lines from + to −; the SAME magnitude E = V/d = σ/ε₀ at every
-- interior point, independent of position; ≈0 OUTSIDE the plates (the two sheet-fields
-- cancel) with only a small edge fringe; and at fixed V, E ∝ 1/d. Built by superposing
-- two charged-sheet fields (each σ/2ε₀: add inside, cancel outside). This is the
-- UNIFORM-FIELD diamond — it declares electric_field_point_charge (the radial 1/r²
-- field it is NOT), gauss_law_sheet (the single isolated sheet's σ/2ε₀), and
-- electric_potential_meaning (V = W/q) as prerequisites and does NOT re-teach them.
--
-- Authored 2026-06-28 by json_author. AUTHORED, NOT AUTO-APPLIED (quality_auditor's
-- pre-run step applies it — json_author never runs apply_migration).
--
-- Two writes:
--   (1) concept_panel_config — the panel registration (field_3d / threejs, single).
--   (2) confusion_cluster_registry — the 4 drill-down clusters mapped to the
--       predict→reveal misconception states, each with 5 student-voice trigger
--       phrasings drawn from the physics block §3 misconception_watch beliefs.
--
-- Cluster placement (per the architect skeleton drill_downs arrays + physics block §3):
--   STATE_2 (does the field fan out, or stay parallel?)         — why_field_doesnt_fan_out
--   STATE_3 (probe three points — stronger near the plates?)    — field_same_in_middle
--   STATE_5 (edge-on — is the field confined to the gap?)       — field_zero_outside_capacitor
--   STATE_6 (hold V, double d — does E stay, double, or halve?) — e_inverse_d_at_fixed_v
--
-- STATE_3, STATE_5, STATE_6 each carry allow_deep_dive: true in the JSON; STATE_4 also
-- carries allow_deep_dive (the σ/2ε₀ superposition derivation), but its drill-downs are
-- left for analytics to surface — no canned cluster seeded here.
--
-- CUT-LINE GUARD: this concept teaches the UNIFORM FIELD between two parallel plates —
-- straight parallel lines, E = V/d = σ/ε₀ uniform inside, ≈0 outside, E ∝ 1/d. It does
-- NOT teach the radial point-charge field E = kQ/r² (electric_field_point_charge), the
-- single isolated sheet's σ/2ε₀ (gauss_law_sheet), what V MEANS (electric_potential_meaning),
-- or capacitance C = ε₀A/d / stored energy ½CV² / dielectrics (later concepts). Any
-- "what is capacitance" / "C = ε₀A/d" / "energy stored in a capacitor" drill-down belongs
-- to a capacitance concept, not here. The clusters below stay on the FIELD: why the lines
-- don't fan out, why E is the same in the middle, why E ≈ 0 outside, and why E halves when
-- d doubles at fixed V.
--
-- ON CONFLICT idempotent so re-running re-syncs the rows.

-- ── (1) Panel registration ────────────────────────────────────────────────────
INSERT INTO concept_panel_config
  (concept_id, panel_a_renderer, technology_a, default_panel_count, class_level, chapter)
VALUES
  ('parallel_plate_capacitor_field', 'field_3d', 'threejs', 1, '12', 'Electrostatic Potential and Capacitance')
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
  'why_field_doesnt_fan_out',
  'parallel_plate_capacitor_field',
  'STATE_2',
  'Why don''t the field lines fan out like around a point charge?',
  'student expects a radial fanning field between the plates (the point-charge instinct); needs to see that two extended plates make straight, parallel, equally-spaced lines from + to −, not a radial spray from a point',
  ARRAY[
    'why dont the field lines spread out between the plates',
    'shouldnt the field fan out like around a charge',
    'why are the lines straight and not radial',
    'is the field between plates like a point charge field',
    'why parallel lines and not a spreading field'
  ],
  'active'
),
(
  'field_same_in_middle',
  'parallel_plate_capacitor_field',
  'STATE_3',
  'Isn''t the field stronger near the plates and weaker in the middle?',
  'student believes the field is concentrated near the plates and fades in the centre; needs the three-probe reveal — the field is UNIFORM, identical magnitude and direction at the +edge, the centre, and the −edge (E = V/d everywhere inside)',
  ARRAY[
    'is the field stronger near the plates than in the middle',
    'does the field get weaker in the centre of the gap',
    'why is the field the same everywhere between the plates',
    'shouldnt E be bigger close to a plate',
    'is E really equal at the middle and at the edges'
  ],
  'active'
),
(
  'field_zero_outside_capacitor',
  'parallel_plate_capacitor_field',
  'STATE_5',
  'Why is there no field outside the plates?',
  'student expects the capacitor''s field to spread into the surrounding space like an isolated charge; needs the edge-on view — the two plates'' fields cancel outside, leaving E ≈ 0 with only a small fringe curling at the edges, the field is confined to the gap',
  ARRAY[
    'why is there no field outside the plates',
    'doesnt the field leak out into the room',
    'where does the field go outside the capacitor',
    'why is E zero just outside the plates',
    'is the field really confined to the gap only'
  ],
  'active'
),
(
  'e_inverse_d_at_fixed_v',
  'parallel_plate_capacitor_field',
  'STATE_6',
  'If V is fixed, why does moving the plates apart change the field?',
  'student thinks the field depends only on the voltage, so widening the gap at fixed V should leave E unchanged; needs E = V/d — at fixed V the field is inversely proportional to d, so doubling the separation halves the field (E ∝ 1/d)',
  ARRAY[
    'if voltage is fixed why does E change when i move the plates',
    'doesnt the field depend only on the voltage',
    'why does doubling d halve the field at fixed V',
    'why does E drop when the gap gets bigger',
    'how can E change if V stays the same'
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
-- SELECT * FROM concept_panel_config WHERE concept_id = 'parallel_plate_capacitor_field';
--   Should return 1 row with panel_a_renderer = 'field_3d', technology_a = 'threejs'.
-- SELECT cluster_id, state_id FROM confusion_cluster_registry
--   WHERE concept_id = 'parallel_plate_capacitor_field' ORDER BY state_id, cluster_id;
--   Should return 4 rows (STATE_2, STATE_3, STATE_5, STATE_6).
