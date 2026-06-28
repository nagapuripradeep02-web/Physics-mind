-- supabase_2026-06-28_seed_equipotential_surfaces_clusters_migration.sql
-- Registers equipotential_surfaces.json (Class 12 Ch.2 §2.7 — the GEOMETRY of
-- constant-V surfaces: an equipotential surface is the locus of all points at one
-- common potential V; for a point charge these are CONCENTRIC SPHERES (r = kQ/V);
-- the field is everywhere PERPENDICULAR to them and points from high V to low V; NO
-- work is done moving a charge ALONG one (W = F·d·cos90° = 0) while moving BETWEEN
-- surfaces costs W = qΔV; and for EQUAL V-steps the surfaces CROWD where the field
-- is strong (r ~ 1/V). This is the GEOMETRY diamond — it declares
-- electric_potential_meaning (what V MEANS, V = W/q), electric_potential_point_charge
-- (the VALUE/FORMULA V = kQ/r), and electric_field_point_charge (the VECTOR
-- E = kQ/r²) as prerequisites and does NOT re-teach them.
--
-- Authored 2026-06-28 by json_author. AUTHORED, NOT AUTO-APPLIED (quality_auditor's
-- pre-run step applies it — json_author never runs apply_migration).
--
-- Two writes:
--   (1) concept_panel_config — the panel registration (field_3d / threejs, single).
--   (2) confusion_cluster_registry — the 6 drill-down clusters (3 on STATE_3, 3 on
--       STATE_4), each with 5 student-voice trigger phrasings from the physics block.
--
-- Cluster placement (per the architect skeleton drill_downs arrays + physics block §6):
--   STATE_3 (no work along the surface — W = F·d·cos90° = 0) — 3 clusters:
--     cos90_means_zero_work · round_trip_vs_along_path · same_v_means_free_to_move
--   STATE_4 (field crosses every shell at exactly 90°, high-V → low-V) — 3 clusters:
--     why_exactly_ninety_degrees · tangential_component_would_do_work · field_points_high_to_low_v
--
-- STATE_3, STATE_4, STATE_5 each carry allow_deep_dive: true in the JSON.
--
-- CUT-LINE GUARD: this concept teaches the GEOMETRY of constant-V surfaces —
-- concentric spheres, E ⟂ surface, zero work along, spacing↔field-strength. It does
-- NOT teach what V MEANS (V = W/q — that is electric_potential_meaning), the
-- VALUE/FORMULA V = kQ/r (electric_potential_point_charge), the VECTOR field
-- E = kQ/r² (electric_field_point_charge), the equipotentials of a DIPOLE or a
-- UNIFORM field, or conductors / capacitance. Any "what does potential mean" /
-- "V = W/q" drill-down belongs to electric_potential_meaning; any "how big is V at
-- distance r" / "V = kQ/r" belongs to electric_potential_point_charge. The clusters
-- below stay on the GEOMETRY: why sliding along is zero-work, round-trip vs along-path,
-- same-V means free-to-move, why exactly 90°, why no tangential field component, and
-- why the field points high-V → low-V.
--
-- ON CONFLICT idempotent so re-running re-syncs the rows.

-- ── (1) Panel registration ────────────────────────────────────────────────────
INSERT INTO concept_panel_config
  (concept_id, panel_a_renderer, technology_a, default_panel_count, class_level, chapter)
VALUES
  ('equipotential_surfaces', 'field_3d', 'threejs', 1, '12', 'Electrostatic Potential and Capacitance')
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
  'cos90_means_zero_work',
  'equipotential_surfaces',
  'STATE_3',
  'I moved the charge — how can the work be zero?',
  'student cannot accept zero work after a real displacement; needs the angle argument made concrete — the force is radial, the motion is tangential, so W = F*d*cos90 = 0 even though the charge clearly moved a distance d',
  ARRAY[
    'why is work zero if i moved the charge',
    'cos 90 is zero so no work but i still moved it',
    'i moved it some distance how can work be 0',
    'doesnt moving always need work',
    'why does the angle make work zero'
  ],
  'active'
),
(
  'round_trip_vs_along_path',
  'equipotential_surfaces',
  'STATE_3',
  'Is it zero only for a full loop, or for any path on the surface?',
  'student confuses "zero work for a closed loop" with "zero work for any displacement on the surface"; needs that ALL displacement along an equipotential is zero-work (force ⊥ motion the whole way), not only a round trip back to start',
  ARRAY[
    'what if i go around the whole shell back to start',
    'is it zero only for full loop or any path on the surface',
    'round trip vs sliding to one side same thing',
    'does coming back to start make work zero',
    'is going along the surface different from a closed path'
  ],
  'active'
),
(
  'same_v_means_free_to_move',
  'equipotential_surfaces',
  'STATE_3',
  'If V is the same all over the shell, does the charge move for free?',
  'student reads "no work" as "no force / the charge drifts on its own"; needs the distinction — zero NET work along the surface does not mean zero force (the radial force still acts), it means the force has no component along the motion',
  ARRAY[
    'if V is same everywhere on shell can the charge move on its own',
    'no work means the charge moves for free right',
    'same potential means no force on the charge',
    'does zero work mean nothing is holding it',
    'if both ends same V why bother pushing'
  ],
  'active'
),
(
  'why_exactly_ninety_degrees',
  'equipotential_surfaces',
  'STATE_4',
  'Why exactly 90 degrees, not some other angle?',
  'student wants to know what FORCES the right angle; needs the reason — any field component along the surface would do work along an equipotential (impossible, since V is constant), so the only allowed orientation is exactly perpendicular',
  ARRAY[
    'why exactly 90 degrees not some other angle',
    'who decided field is perpendicular to the shell',
    'why cant the field cross at 45 degrees',
    'is it always exactly 90 or just for spheres',
    'what makes the angle exactly a right angle'
  ],
  'active'
),
(
  'tangential_component_would_do_work',
  'equipotential_surfaces',
  'STATE_4',
  'What if the field had a sideways part along the shell?',
  'student imagines a tilted field with a tangential piece; needs to see that a tangential component would push the charge ALONG the surface and do work — but moving along an equipotential is zero-work, so no tangential component can exist',
  ARRAY[
    'what if the field had a sideways part along the shell',
    'if field tilted a bit would it do work along surface',
    'why no component of field along the surface',
    'a slanted field would push it along the shell na',
    'what stops the field from having a tangential piece'
  ],
  'active'
),
(
  'field_points_high_to_low_v',
  'equipotential_surfaces',
  'STATE_4',
  'How do I know the field points to lower V, not higher?',
  'student is unsure of the field direction across the surfaces; needs the downhill rule — the field points from the inner high-V shell to the outer low-V shell, always from high potential toward low (the field is the downhill slope of V)',
  ARRAY[
    'how do i know field points to lower V not higher',
    'why does the field go from high potential to low',
    'which way do the field lines point inner or outer',
    'does field go high V to low V always',
    'why not low to high potential'
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
-- SELECT * FROM concept_panel_config WHERE concept_id = 'equipotential_surfaces';
--   Should return 1 row with panel_a_renderer = 'field_3d', technology_a = 'threejs'.
-- SELECT cluster_id, state_id FROM confusion_cluster_registry
--   WHERE concept_id = 'equipotential_surfaces' ORDER BY state_id, cluster_id;
--   Should return 6 rows (3 STATE_3, 3 STATE_4).
