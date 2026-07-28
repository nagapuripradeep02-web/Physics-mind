-- Scar candidates — vsepr_molecular_shapes / the molecular_geometry 3D surface, 2026-07-28
--
-- ═══════════════════════════════════════════════════════════════════════════
-- STATUS: **APPLIED** 2026-07-28 to dxwpkjfypzxrzgbevfnx (dev) on founder
-- instruction ("apply all 9 to the table"), via
-- src/scripts/_seed_engine_bug_queue_vsepr_3d_surface.ts (idempotent — it skips
-- any bug_class already present, so it is safe to re-run).
-- Verified after: 368 -> 377 rows, chemistry 2 -> 11, all 9 returned by
-- `query_engine_bug_queue.ts vsepr_molecular_shapes`, zero null title/probe_logic.
-- NOT applied to physicsmind-pilot (production) — engine_bug_queue is dev-only.
--
-- THREE DEVIATIONS from the INSERT text below, forced by the live schema and
-- carried in the seed script rather than here:
--   1. `severity` has no 'LOW' (CHECK allows CRITICAL | MAJOR | MODERATE only),
--      so row 9 (backtick) went in as MODERATE.
--   2. `title` and `probe_type`/`probe_logic` are NOT NULL — all three were
--      absent from this draft. Titles were written, and each row got a real
--      probe: five are `js_eval` (runnable inside the page THE EYE already
--      drives), four are `manual`. A scar row without a probe is a note, not a
--      check — CLAUDE.md §2 wants the defect class to become a permanent gate.
--   3. `row_type` set to 'incident', `concepts_affected` to the concept,
--      `discovered_in_session` to 'chemistry-p4-vsepr-3d-surface-2026-07-28'.
-- The INSERT statements below are kept as the human-readable record of the
-- reasoning; the seed script is what actually ran.
-- ═══════════════════════════════════════════════════════════════════════════
--
-- (Draft convention followed initially: files-only, per
--  scar_candidates_law_of_conservation_of_mass.sql, 2026-07-27 — "engine_bug_queue
--  writes are a founder decision". The founder then gave that decision.)
--
-- Why this batch matters more than a normal concept's: this is the FIRST 3D chemistry
-- surface, and rows 2-4 and 7 are failure modes that cannot occur on either 2D engine.
-- They are the price already paid for every future P4 concept (hybridisation, sigma/pi,
-- SN1/SN2, stereochemistry, orbitals) that will run on this same scenario.
--
-- Provenance: found by quality_auditor + eye_walker after THE EYE had returned 31/31
-- green on FOUR consecutive runs. Every row below was re-verified against the frames by
-- the orchestrator before being written here — none is taken on an agent's word.
--
-- Verification commands used:
--   grep -n "createLabelSprite\|pmCreateAutoLabel" src/lib/renderers/field_3d_renderer.ts
--   grep -n "arc_pair_b" src/lib/renderers/field_3d_renderer.ts            -> 0 (dead field removed)
--   node scratch camera solver: min pairwise screen gap of the three shipped cameras
--                               -> 0.05, -0.14, -0.28  (negative = atoms overlapping)
--   frames: .visual_runs/vsepr_molecular_shapes/20260728-021045 (defects)
--           .visual_runs/vsepr_molecular_shapes/20260728-053341 (fixed)

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. RECURRENCE of the already-FIXED `label_sprite_wide_string_clipped`.
--    The fix exists; nothing routes a new caller to it.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO engine_bug_queue (bug_class, owner_cluster, subject, status, severity, prevention_rule) VALUES (
  'field3d_live_text_sprite_must_be_created_autowidth',
  'peter_parker:renderer_primitives',
  'chemistry',
  'FIXED',
  'MAJOR',
  'createLabelSprite() measures its canvas ONCE, from the seed string it is built with. Any sprite '
  'whose text is later changed via updateLabelSpriteText therefore CLIPS as soon as the new string is '
  'wider than the seed — the molecular_geometry arc label was seeded "109.5" and rendered '
  '"-C-H = 109." once it carried "H-C-H = 109.5". This is the SAME class as the already-FIXED '
  'label_sprite_wide_string_clipped (ac_generator, "each half tu"), which is exactly the point: the '
  'remedy (pmCreateAutoLabel, which sets _pmAutoWidth so updateLabelSpriteText re-measures and '
  're-fits) has existed for weeks, and a brand-new scenario still reached for the wrong helper '
  'because both are in scope and the names do not signal the difference. PREVENTION: if a sprite is '
  'ever passed to updateLabelSpriteText, it MUST be built by pmCreateAutoLabel — treat createLabelSprite '
  'as static-text-only. Cheap audit for any new scenario: every id passed to updateLabelSpriteText '
  'should trace back to a pmCreateAutoLabel call.'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. NEW CLASS — 3D only. Extends the FIXED field3d_position_vector_foreshortened_3q_camera
--    from "a vector reads short" to "an object the narration COUNTS disappears".
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO engine_bug_queue (bug_class, owner_cluster, subject, status, severity, prevention_rule) VALUES (
  'field3d_counted_element_occluded_along_view_axis',
  'alex:json_author',
  'chemistry',
  'FIXED',
  'CRITICAL',
  'In a projected 3D scene an element aimed near the view axis foreshortens to nothing and hides '
  'BEHIND the object at the origin. Methane rendered with its fourth C-H bond invisible behind the '
  'carbon while the caption read "Four bonds, one shape" and the HUD read "domains = 4" — the physics '
  'was right, both labels were right, and a student counts three. Nothing in the deterministic gate '
  'suite can catch this: pixels changed, no console error, motion present, H1/H3 clean. PREVENTION: '
  'for any field_3d concept whose narration or HUD COUNTS objects, the authored camera must be checked '
  'so that every counted object is separately countable in the FROZEN frame. State it as a '
  'Definition-of-Done line, not a hope. Related but distinct: '
  'field3d_position_vector_foreshortened_3q_camera (a vector reading short) and '
  'field3d_separation_axis_must_match_authored_edge_on_camera (a compare axis).'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. NEW CLASS — the tool that was supposed to PREVENT row 2 measured the wrong thing.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO engine_bug_queue (bug_class, owner_cluster, subject, status, severity, prevention_rule) VALUES (
  'camera_metric_scored_foreshortening_not_pairwise_screen_separation',
  'alex:json_author',
  'chemistry',
  'FIXED',
  'MAJOR',
  'After row 2 was found, cameras were re-solved numerically against a per-object metric: each '
  'object must project to >= X% of its own length. That metric is INSUFFICIENT and gave false '
  'confidence — it scores each object in isolation and says nothing about whether a DIFFERENT object '
  'lands on top of it. Re-measuring the three "solved" cameras with a pairwise metric (centre-to-centre '
  'screen distance minus the two radii, plus each object against the central object) returned gaps of '
  '0.05, -0.14 and -0.28 scene units: all three were overlapping. PREVENTION: an occlusion metric must '
  'be PAIRWISE over every rendered pair, never per-object. A second trap in the same solve: it '
  'optimised only ONE of the two arc families (methane apex/leg) and left the other (water H-O-H) '
  'edge-on, so 104.5 degrees rendered as almost straight — every angle the concept displays must be a '
  'constraint, not just the first one.'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. NEW CLASS — continuous rotation vs a deterministic pin.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO engine_bug_queue (bug_class, owner_cluster, subject, status, severity, prevention_rule) VALUES (
  'camera_solved_for_home_pose_while_frozen_pin_lands_rotated',
  'alex:json_author',
  'chemistry',
  'FIXED',
  'MAJOR',
  'A scenario that rotates continuously is at spin_rate x pin_time when THE EYE pins it — not at the '
  'home pose the camera was solved for. Water was solved to read clearly bent, then pinned 68 degrees '
  'round, where its 104.5-degree H-O-H projected as nearly straight on the exact frame a teacher '
  'pauses on and the baseline locks. PREVENTION: pick one of two, per state, and record which. '
  '(a) Delay the spin until after the last reveal (spin_start_ms >= maxReveal) so the pin lands at the '
  'home pose — best where the pinned frame carries the teaching claim. (b) Keep the spin and solve the '
  'camera AT the pinned orientation (rate x pin_time), which is deterministic and therefore solvable — '
  'best where the earlier phase would otherwise sit still. Also note the safe rotation window is '
  'narrow: for a tetrahedron at the shipped camera, atom discs begin overlapping about 20 degrees off '
  'home, so "it looks fine at t=0" says nothing about t=8000.'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. GENERALISES the existing slider scar to any DOM control.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO engine_bug_queue (bug_class, owner_cluster, subject, status, severity, prevention_rule) VALUES (
  'scripted_change_desyncs_the_dom_control_that_shares_it',
  'peter_parker:renderer_primitives',
  'chemistry',
  'FIXED',
  'MAJOR',
  'A scripted one-shot hid both lone pairs while the "Show lone pairs" checkbox that also controls them '
  'stayed CHECKED — the instrument contradicted the picture on the frozen frame, and a teacher clicking '
  'it would have seen nothing happen on the first click. This generalises '
  'ghost_compare_cause_invisible_slider_frozen from sliders to every DOM control. PREVENTION: whenever a '
  'scripted cue changes a variable that a DOM control also drives, write the control''s own state back in '
  'lockstep (DOM-only, no dispatched input event, so the isTrusted drag-seize path is not tripped). '
  'Rule 32a''s cause must be visible in the very control a teacher would use to cause it.'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. NEW CLASS — the most transferable row in this batch. Applies to both subjects.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO engine_bug_queue (bug_class, owner_cluster, subject, status, severity, prevention_rule) VALUES (
  'oncanvas_formula_asserts_a_value_the_renderer_cannot_show',
  'alex:architect',
  'chemistry',
  'FIXED',
  'MAJOR',
  'STATE_6''s formula surface read "5 -> 120 and 90" while the scenario draws exactly ONE angle arc, so '
  'the axial-equatorial 90 degrees for PCl5 was asserted on canvas and never rendered anywhere. The '
  'molecule table even carried an arc_pair_b field for it — defined, never read, pure dead code. This is '
  'the inverse of the usual "narrated but not drawn" scar: here the CANVAS makes a numeric claim the '
  'engine is structurally incapable of backing. PREVENTION: every number on a formula surface or HUD '
  'must be produced by something the renderer actually draws or computes for that state; if it cannot '
  'be, descope the text to what is shown. Make it an explicit Definition-of-Done line ("no claim without '
  'a rendered measurement") — that line, added afterwards, is what would have caught this before build.'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. OPEN — the known limitation of the fix for rows 2-4. Recorded, not hidden.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO engine_bug_queue (bug_class, owner_cluster, subject, status, severity, prevention_rule) VALUES (
  'orthographic_separation_metric_underpredicts_perspective_overlap',
  'alex:json_author',
  'chemistry',
  'OPEN',
  'MODERATE',
  'The camera solver that fixed rows 2-4 projects ORTHOGRAPHICALLY while field_3d renders with a '
  'PERSPECTIVE camera. A nearer object is drawn larger and can therefore swallow a farther one even '
  'where the orthographic centre-to-centre gap is comfortably positive — observed on PCl5 mid-rotation, '
  'where the metric reported a positive gap and the frame showed two chlorines merged. Frozen frames are '
  'solved exactly and were verified by eye; transient overlap during rotation is partly inherent to a '
  'turning 3D object. PREVENTION until fixed: treat the metric as a guide that can only be OPTIMISTIC, '
  'and always confirm the frozen frame by eye. Fix would be to divide the projected radius by the '
  'object''s camera-space depth before comparing gaps.'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Tooling — a gate that could not be satisfied. Fixed this session.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO engine_bug_queue (bug_class, owner_cluster, subject, status, severity, prevention_rule) VALUES (
  'validate_chemistry_choreography_measure_blind_to_field3d',
  'peter_parker:runtime_generation',
  'chemistry',
  'FIXED',
  'MODERATE',
  'validate-chemistry''s Rule-31a "narration must not outrun choreography" check read scene_composition '
  'primitive timings only — the PCPL/parametric shape. On field_3d the choreography lives in '
  'field_3d_config.states[*].<scenario block>, and scene_composition is a silent no-op there, so the '
  'check reported "choreography settles ~0ms" for EVERY field_3d chemistry concept no matter how its '
  'motion was timed. A warning that cannot be satisfied trains the author to ignore the gate. FIXED by '
  'also consulting deriveMaxRevealTimeMs (the derivation THE EYE already pins with), taking whichever '
  'signal lands later. It immediately produced two real findings on the new concept and cleared a false '
  'positive standing against the shipped bohr_model_energy_levels STATE_7. PREVENTION / PATTERN: '
  'chemistry keeps inheriting physics tooling that hardcodes the parametric shape (three scripts in '
  'session C2, Gate 9 at convergence, this one). The next such fix should ask whether the tool can be '
  'made renderer-agnostic rather than taught one more special case.'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. Low severity, guard already exists — recorded because it cost two cycles.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO engine_bug_queue (bug_class, owner_cluster, subject, status, severity, prevention_rule) VALUES (
  'backtick_in_renderer_comment_terminates_emitted_template_literal',
  'peter_parker:renderer_primitives',
  'chemistry',
  'FIXED',
  'MODERATE',   -- schema has no LOW; applied as MODERATE
  'The renderer bodies are emitted from a template literal, so a backtick anywhere inside them — '
  'including inside a // comment, e.g. writing an option name as `assemble` — terminates the literal '
  'and produces a syntax error hundreds of lines away from the real cause. Hit TWICE while building '
  'molecular_geometry. The Rule-36c guard (npm run check:renderer-syntax) caught it both times and named '
  'the line, which is the guard doing exactly its job. PREVENTION: never use backticks in renderer '
  'comments — use "double quotes" for option names; and run check:renderer-syntax after every renderer '
  'edit, since tsc alone reports the failure at a misleading location.'
);

-- Not drafted as rows (content decisions, not reusable engine classes):
--   * the STATE_2 span-label / arc-label collision — both were anchored on the same bisector ray, so
--     they overlapped by construction; fixed by moving the span''s NUMBER to the value-only HUD and
--     keeping only its LINE on canvas. Closest existing row is the OPEN field3d_label_sprite_overlap;
--     consider folding this in as evidence there rather than opening a ninth class.
--   * the missing Definition-of-Done block on the skeleton — an authoring omission, correctly caught by
--     Gate 0 doing its job, not an engine defect.
