-- supabase_2026-06-28_seed_electric_potential_dipole_clusters_migration.sql
-- Registers electric_potential_dipole.json (Class 12 Ch.2 §2.4 — the POTENTIAL of a
-- DIPOLE: V = kp cosθ/r², the SCALAR sum of the two charge potentials
-- (V = kq/r₊ − kq/r₋). Its SIGN follows cos θ, i.e. POSITION (positive on the +q
-- side, negative on the −q side — not decided by which charge "wins"); it is ZERO
-- across the WHOLE equatorial plane (θ=90°, every point equidistant from ±q), where
-- the field E is nonetheless NON-zero (E = −grad V — potential is height, field is
-- slope); and it falls as 1/r², one power STEEPER than a single charge's 1/r (because
-- +q and −q nearly cancel far away). This is the dipole POTENTIAL/VALUE diamond — it
-- declares electric_potential_point_charge (V = kQ/r), electric_potential_meaning
-- (V = W/q) and electric_field_dipole (the dipole's vector FIELD) as prerequisites
-- and does NOT re-teach them.
--
-- Authored 2026-06-28 by json_author. AUTHORED, NOT AUTO-APPLIED (quality_auditor's
-- pre-run step applies it — json_author never runs apply_migration).
--
-- Two writes:
--   (1) concept_panel_config — the panel registration (field_3d / threejs, single).
--   (2) confusion_cluster_registry — the 5 drill-down clusters mapped to the
--       predict→reveal misconception states, each with 5 student-voice trigger
--       phrasings drawn from the physics block §3 misconception_watch beliefs.
--
-- Cluster placement (per the architect skeleton drill_downs arrays + physics block §3):
--   STATE_4 (V = 0 only at the midpoint, or the whole plane?)   — why_whole_plane_zero
--   STATE_4 (V = 0 so the field must be zero too?)              — zero_v_nonzero_e
--   STATE_4 (equatorial plane vs the dead centre point)         — equatorial_vs_centre
--   STATE_6 (dipole V fades as 1/r like a point charge?)        — why_1_over_r2
--   STATE_6 (dipole vs point-charge falloff side by side)       — dipole_vs_point_falloff
--
-- STATE_3, STATE_4, STATE_5, STATE_6 carry allow_deep_dive: true in the JSON.
-- STATE_4 is the PRIMARY aha and carries THREE clusters (it confronts two distinct
-- beliefs — "zero only at the midpoint" and "zero V means zero field" — plus the
-- equatorial-vs-centre framing). STATE_3's sign-by-position drill-downs are left for
-- analytics to surface — no canned cluster seeded here.
--
-- CUT-LINE GUARD: this concept teaches the dipole's scalar POTENTIAL — V = kp cosθ/r²,
-- the cos θ sign rule, the equatorial zero, V≠0 vs E≠0, and the 1/r² falloff. It does
-- NOT teach the single point-charge potential V = kQ/r (electric_potential_point_charge),
-- what V MEANS (electric_potential_meaning), the dipole's vector FIELD or torque
-- τ = pE sinθ (electric_field_dipole / electric_dipole_in_field), or capacitance. Any
-- "what is the dipole's field" / "torque on a dipole" / "V = kQ/r for one charge"
-- drill-down belongs to those concepts, not here. The clusters below stay on the
-- POTENTIAL: why V is zero on the whole equatorial plane, why E is still alive there,
-- the equatorial-plane vs centre-point distinction, and the 1/r² (not 1/r) falloff.
--
-- ON CONFLICT idempotent so re-running re-syncs the rows.

-- ── (1) Panel registration ────────────────────────────────────────────────────
INSERT INTO concept_panel_config
  (concept_id, panel_a_renderer, technology_a, default_panel_count, class_level, chapter)
VALUES
  ('electric_potential_dipole', 'field_3d', 'threejs', 1, '12', 'Electrostatic Potential and Capacitance')
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
  'why_whole_plane_zero',
  'electric_potential_dipole',
  'STATE_4',
  'Why is the dipole potential zero across the WHOLE equatorial plane, not just at the centre?',
  'student believes V = 0 only at the single midpoint between the charges; needs the equatorial-disc reveal — every point on the plane is equidistant from +q and −q, so the +kq/r_plus and −kq/r_minus terms cancel at every point (cos 90° = 0), making V = 0 across the entire plane',
  ARRAY[
    'isnt the potential zero only at the midpoint of the dipole',
    'why is V zero everywhere on the equatorial plane not just the centre',
    'how can the potential be zero across a whole plane',
    'why does the dipole potential vanish on the perpendicular bisector',
    'is the potential really zero at every equatorial point or just the middle'
  ],
  'active'
),
(
  'zero_v_nonzero_e',
  'electric_potential_dipole',
  'STATE_4',
  'If V = 0 on the equatorial plane, why isn''t the field E zero there too?',
  'student assumes zero potential means zero field; needs E = −grad V — the field is the SLOPE of V, and V changes as you step off the plane, so a non-zero E arrow stays drawn across the equatorial plane (antiparallel to p) even though V is exactly zero on it',
  ARRAY[
    'if the potential is zero why is the field not zero',
    'doesnt zero voltage mean zero electric field',
    'how can E be nonzero where V is zero on the dipole equator',
    'why is there still a field where the potential is zero',
    'no potential should mean no field right'
  ],
  'active'
),
(
  'equatorial_vs_centre',
  'electric_potential_dipole',
  'STATE_4',
  'What is the difference between the equatorial PLANE and the centre POINT of a dipole?',
  'student conflates the single midpoint with the whole equatorial plane; needs to see that the equatorial plane is the entire flat sheet at θ=90° (every point equidistant from ±q, all reading V=0), not merely the one centre point between the charges',
  ARRAY[
    'is the equatorial plane the same as the centre of the dipole',
    'whats the difference between the midpoint and the equatorial plane',
    'where exactly is the equatorial plane of a dipole',
    'does equatorial mean the point right between the two charges',
    'is the perpendicular bisector a point or a whole plane'
  ],
  'active'
),
(
  'why_1_over_r2',
  'electric_potential_dipole',
  'STATE_6',
  'Why does a dipole''s potential fall off as 1/r² instead of 1/r like a single charge?',
  'student expects the dipole potential to fade as 1/r, the same as a point charge; needs the falloff curve — from far away +q and −q almost overlap so their potentials nearly cancel, leaving only the faint 1/r² remainder, one power steeper than a single charge',
  ARRAY[
    'why does the dipole potential fall as 1 over r squared',
    'shouldnt a dipoles potential fade as 1/r like a point charge',
    'why is the dipole potential steeper than a single charge',
    'why does the dipole voltage die faster with distance',
    'how does cancellation make the potential fall as 1/r squared'
  ],
  'active'
),
(
  'dipole_vs_point_falloff',
  'electric_potential_dipole',
  'STATE_6',
  'How does a dipole''s potential falloff compare with a single point charge''s?',
  'student cannot rank the two falloffs; needs the side-by-side graph — the bright dipole 1/r² curve dives below the dimmed point-charge 1/r ghost and keeps dropping, so the dipole potential is weaker at every distance and steeper by one power of r',
  ARRAY[
    'does a dipole or a point charge potential fall off faster',
    'compare dipole potential and point charge potential with distance',
    'which is steeper 1/r or 1/r squared for potential',
    'why is the dipole curve below the point charge curve',
    'is a dipoles voltage weaker than a single charges far away'
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
-- SELECT * FROM concept_panel_config WHERE concept_id = 'electric_potential_dipole';
--   Should return 1 row with panel_a_renderer = 'field_3d', technology_a = 'threejs'.
-- SELECT cluster_id, state_id FROM confusion_cluster_registry
--   WHERE concept_id = 'electric_potential_dipole' ORDER BY state_id, cluster_id;
--   Should return 5 rows (STATE_4 ×3, STATE_6 ×2).
