-- supabase_2026-08-07_seed_conservative_vs_nonconservative_forces_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for
-- conservative_vs_nonconservative_forces.json — Class 11 Ch.6 Work, Energy and
-- Power #5, authored against the same newtons_laws_body field_3d engine +
-- SEAM K/L/M/N energy layer as #1-#4 (docs/loop_runs/ch6_state.md), and the
-- FIRST concept in the fleet to exercise a checkpoint seeded exactly at the
-- home pose (capture_mode 'first' — adopts side without firing, then fires
-- once on the RETURN crossing and latches) alongside capture_mode 'every'
-- pass-1/pass-2 interior stamps. chapter:6, section:"6.6", prerequisites:
-- ["work_done_by_constant_force","positive_negative_zero_work",
-- "friction_force","block_on_incline","normal_force"].
--
-- Authored 2026-08-07 by alex:json_author, using the physics_author's
-- drill-down trigger phrases VERBATIM (docs/loop_runs/ch6/
-- conservative_vs_nonconservative_forces/physics_block.md §5):
--   STATE_2 — why_friction_work_never_cancels, round_trip_work_test,
--             friction_work_out_and_back;
--   STATE_3 — friction_direction_follows_motion, gravity_direction_is_fixed,
--             angle_to_motion_decides_sign;
--   STATE_4 — path_independence_of_gravity_work, work_as_a_number_per_place,
--             closed_path_zero_equals_path_independence.
--
-- Migration is AUTHORED, NOT APPLIED. json_author's own tooling forbids
-- `apply_migration` — this file is left for the founder / quality_auditor's
-- pre-run step. Drill-down itself is DEFERRED (Rule 18, 2026-06-10 directive)
-- — the confusion_cluster_registry Gate-8 probe is N/A-DORMANT this phase per
-- the documented false-FAIL scar (memory: auditor-cluster-registry-false-fail).
-- Do not let the auditor re-route json_author to "fix" this.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- status='pending_review' per the current cluster-registry convention.
--
-- has_prebuilt_deep_dive picks (architect skeleton §5, metadata only, Rule 18):
-- STATE_2 (the PRIMARY aha — "why doesn't the return trip cancel friction's
-- work?" is the documented core confusion of this topic), STATE_3 (the
-- mechanism abstraction — friction's motion-dependent direction, why it
-- differs from gravity), and STATE_4 (the path-independence abstraction #6
-- leans on directly). All three states carry a drill_downs array in the
-- concept JSON referencing these cluster_ids.
--
-- BOUNDARY NOTE, binding on every description below: this concept owns the
-- CLOSED-PATH TEST and the friction-vs-gravity direction contrast. It never
-- defines potential energy, never states energy conservation, and never
-- accounts for where friction's lost joules go — those are
-- potential_energy_definition (#6), conservation_of_mechanical_energy (#9)
-- and mechanical_energy_loss_with_friction (#10) respectively. No description
-- here may cross any of those three lines.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_2 why_friction_work_never_cancels deep-dive ──────────────────
(
  'why_friction_work_never_cancels',
  'conservative_vs_nonconservative_forces',
  'STATE_2',
  'Why doesn''t friction cancel on the way back, the way gravity does?',
  'Student has just watched gravity''s round-trip work bar fall and climb back to exactly zero, and reasonably expects any force acting on a round trip to behave the same way — retrace the path, undo the work. Friction breaks that expectation because of WHAT it responds to: kinetic friction always opposes the body''s instantaneous VELOCITY, never a fixed compass direction. On the way up the block moves up-slope, so friction points down-slope and its work is negative; on the way down the block moves down-slope, so friction points up-slope — but that arrow is still opposing the CURRENT motion, so its work is negative again. Retracing the path reverses the block''s direction of travel, and friction''s direction reverses right along with it, which is exactly why the opposition — and the negative sign — never goes away. The two legs do not cancel because they were never opposite in sign to begin with: both are negative, so a round trip adds them, producing a loss roughly twice the size of either leg alone rather than zero.',
  ARRAY[
    'why doesnt friction cancel on the way back',
    'shouldnt going back undo the loss from going out',
    'if I retrace my path why does friction still take more',
    'why does friction add up instead of cancelling',
    'going there and back should be zero work right'
  ],
  'pending_review'
),
-- ─── STATE_2 round_trip_work_test deep-dive ─────────────────────────────
(
  'round_trip_work_test',
  'conservative_vs_nonconservative_forces',
  'STATE_2',
  'What does it mean for work to be zero over a closed loop, and how is that the test for a conservative force?',
  'A closed path is any trip that starts and ends at the same physical point — up a slope and back to the same start line is the simplest example. The round-trip work test asks one question: add up the work done by a given force over the ENTIRE trip, out and back, and see whether that sum is exactly zero. If it is — for every possible closed path, not just this one — the force is called conservative; gravity passes this test because its work depends only on the net change in position, and a closed path has zero net change in position by definition, so the total collapses to zero identically. If the sum comes out non-zero for some closed path, the force is non-conservative; friction fails the test on every closed path with any sliding at all, because its work is negative on every leg regardless of direction, so the total is always some negative number, never zero. The test is deliberately about the WHOLE trip, not any one leg: a conservative force can absolutely do negative work on the outbound leg (gravity does, going up); what makes it conservative is that the return leg''s work exactly cancels it.',
  ARRAY[
    'what does it mean for work to be zero over a loop',
    'how do you test if a force is conservative',
    'why is the round trip test the definition',
    'if it doesnt return to zero what does that tell you',
    'is a closed path just going back to where you started'
  ],
  'pending_review'
),
-- ─── STATE_2 friction_work_out_and_back deep-dive ───────────────────────
(
  'friction_work_out_and_back',
  'conservative_vs_nonconservative_forces',
  'STATE_2',
  'How do you calculate friction''s total work over a whole round trip?',
  'Each leg of a round trip contributes the same simple form: friction''s work over one leg is minus the friction force times the distance covered on that leg, W = −f·d, because friction is constant in magnitude (f = μ·N) and always opposes the direction of travel on a straight track. If the outbound leg covers a distance d_up before the block turns, the return leg — on the same straight track, back to the same start line — covers that identical distance d_up again, just in the opposite direction. Both legs subtract the same amount, −f·d_up each, so the round-trip total is −f·d_up + (−f·d_up) = −2·f·d_up = −2·μ·m·g·cos θ·d_up. The factor of two is not a coincidence or a rule to memorize separately — it falls straight out of adding two equal negative numbers. This is also why the round-trip loss is always LARGER in size than either leg alone, which is the opposite of what a cancelling pattern would predict: two negatives never partially cancel each other, they only ever add.',
  ARRAY[
    'how do you calculate friction work for the whole trip',
    'why do you multiply by two for friction over a round trip',
    'is the total friction work just twice the one way loss',
    'why does the up trip and the down trip both count negative',
    'how is minus two mu mg cos theta d calculated'
  ],
  'pending_review'
),
-- ─── STATE_3 friction_direction_follows_motion deep-dive ────────────────
(
  'friction_direction_follows_motion',
  'conservative_vs_nonconservative_forces',
  'STATE_3',
  'Why does the friction arrow flip direction at the top of the slope?',
  'Kinetic friction is defined by a rule about motion, not a rule about geometry: it always points opposite to the body''s CURRENT velocity, whatever that velocity happens to be at this instant. While the block climbs, its velocity points up-slope, so friction points down-slope, opposing the climb. At the very top of its flight the block momentarily has zero velocity — the turnaround — and the instant after that, as it begins sliding back down, its velocity now points down-slope, so friction immediately flips to point up-slope, opposing the descent. The flip is not a special event or a discontinuity in the physics; it is the same rule (friction opposes velocity) applied continuously as the velocity itself changes sign. This is genuinely different behaviour from a force like gravity or a fixed applied pull, whose direction is set by something OUTSIDE the motion (the vertical, or the angle a rope is held at) and stays fixed no matter which way the body happens to be travelling at the moment.',
  ARRAY[
    'why does friction flip direction',
    'does friction always point the opposite way youre moving',
    'how does friction know which way to point',
    'why does the friction arrow turn around at the top',
    'does friction change direction only when you reverse or also when you slow down'
  ],
  'pending_review'
),
-- ─── STATE_3 gravity_direction_is_fixed deep-dive ───────────────────────
(
  'gravity_direction_is_fixed',
  'conservative_vs_nonconservative_forces',
  'STATE_3',
  'Why doesn''t gravity change direction the way friction does?',
  'Gravity''s direction is set by something that has nothing to do with the block''s own motion: it always points straight down, toward the centre of the Earth, because it is a property of the block''s mass and the planet''s pull, not a reaction to how the block happens to be moving right now. Whether the block is climbing, at rest at the turnaround, or sliding back down, the arrow for mg never rotates even one degree — only its along-slope COMPONENT (mg·sin θ) changes sign relative to the direction of travel, and that component''s sign flip is exactly why gravity''s work is negative going up and positive coming down. This is the structural reason gravity passes the round-trip test and friction does not: a force whose direction is fixed relative to the world (like gravity, or a steady pull at a fixed angle) can have its work exactly cancel over a closed loop, because the SAME fixed direction combined with a REVERSED displacement flips the sign of the work on the return leg. A force whose direction instead tracks the motion (like kinetic friction) can never get that cancellation, because reversing the displacement also reverses the force, leaving the sign of the work unchanged.',
  ARRAY[
    'why doesnt gravity change direction like friction does',
    'gravity always points down so why does that matter here',
    'why is gravity the same arrow going up and coming down',
    'how come one force flips and the other doesnt',
    'is gravity conservative just because it never changes direction'
  ],
  'pending_review'
),
-- ─── STATE_3 angle_to_motion_decides_sign deep-dive ─────────────────────
(
  'angle_to_motion_decides_sign',
  'conservative_vs_nonconservative_forces',
  'STATE_3',
  'Why is friction''s work negative on both the way up and the way down?',
  'The sign of the work done by any force comes from the angle between that force and the body''s displacement, W = F·d·cos θ (the rule this concept''s own prerequisite, positive_negative_zero_work, already established). Kinetic friction is, by definition, always aimed at exactly 180 degrees to the body''s instantaneous velocity — directly opposite it — and cos 180° = −1 identically, on every leg, regardless of which way the block happens to be sliding. On the way up, friction points down-slope while the displacement is up-slope: 180° apart, negative work. On the way down, friction has flipped to point up-slope while the displacement is now down-slope: still 180° apart, still negative work. The angle between friction and the motion is never anything OTHER than 180° while the block is actually sliding, which is precisely why friction''s work can never be positive during sliding and why the two legs of a round trip both subtract instead of one adding and one subtracting.',
  ARRAY[
    'why is friction work negative both times',
    'does the angle between force and motion decide the sign',
    'why is cos 180 the reason friction is always negative',
    'if force and motion are opposite is work always negative',
    'how do you tell if work is positive or negative from the angle'
  ],
  'pending_review'
),
-- ─── STATE_4 path_independence_of_gravity_work deep-dive ────────────────
(
  'path_independence_of_gravity_work',
  'conservative_vs_nonconservative_forces',
  'STATE_4',
  'Why doesn''t the path matter for gravity''s work — only the start and end points?',
  'Gravity''s work along the incline is W = −m·g·sin θ·(s − s₀), a formula that depends on exactly two numbers: the block''s current position s and its starting position s₀. Nothing about HOW the block got from s₀ to s — how fast it was moving, whether it paused, whether it overshot and came back — appears anywhere in that formula. That is what "path independence" means in practice: two journeys between the same two points, however different the journeys look, produce the identical gravity work, because the formula was never sensitive to the journey in the first place. This is the flip side of the round-trip result from earlier states: a round trip is just the special case where the end point equals the start point, so s − s₀ = 0 and the work is zero regardless of path; the general statement is that ANY two trips sharing the same start and end give the same work, whether or not they return to the start. It is also exactly what makes it possible to assign gravity a single work-based NUMBER to every position on the slope, independent of how a body might arrive there — the property the next concept, potential energy, is built on.',
  ARRAY[
    'why doesnt the path matter for gravitys work',
    'does it matter how you get from a to b for gravity',
    'if I go the long way does gravity do more work',
    'why is work by gravity only about start and end point',
    'two different routes same height change same work?'
  ],
  'pending_review'
),
-- ─── STATE_4 work_as_a_number_per_place deep-dive ───────────────────────
(
  'work_as_a_number_per_place',
  'conservative_vs_nonconservative_forces',
  'STATE_4',
  'What does it mean that each point along the slope has one fixed work reading?',
  'Because gravity''s work depends only on position (s − s₀), every point on the track can be assigned a single work-relative-to-start number that never changes no matter when or how the block visits that point. Flag A, sitting 0.6 m up the slope from the start line, ALWAYS reads −14.7 J the instant the block crosses it — the first time going up, the second time coming back down, or if the block somehow made ten more passes across it in a longer sandbox run. This is a genuinely different kind of statement from "the block is currently moving at some speed" or "the friction force right now is some value" — those quantities depend on the instant you check them. A conservative force''s work-from-a-reference-point does not: it is a property of WHERE you are, not of when you got there or how. That is what lets a single number be attached to every position along the slope, turning a force (something that acts moment to moment) into a value that can be looked up by location alone — precisely the idea potential energy formalizes.',
  ARRAY[
    'what do you mean each point has one number',
    'is work like a value stored at every position',
    'why does the same spot always give the same reading',
    'how can a place have a fixed work value',
    'is this like height has one value no matter how you get there'
  ],
  'pending_review'
),
-- ─── STATE_4 closed_path_zero_equals_path_independence deep-dive ────────
(
  'closed_path_zero_equals_path_independence',
  'conservative_vs_nonconservative_forces',
  'STATE_4',
  'How is "zero work around a closed loop" the same idea as "the path doesn''t matter"?',
  'These sound like two different claims but they are the same claim viewed from two angles. Start from path independence: the work between any two points A and B is the same number no matter which route is taken. Now build a closed loop out of two different routes between the same two points — go from A to B along route 1, then come back from B to A along route 2 (reversed). Because reversing a route flips the sign of the work done over it, the work along "route 2 reversed" is exactly minus the work along "route 2 forwards" — and since route 1 and route 2 give the SAME work from A to B (path independence), the total around the loop is (work via route 1) + (−work via route 2) = 0. Conversely, if every closed loop gives zero total work, then any two routes between the same two points must agree, because their DIFFERENCE forms a closed loop and a zero-total loop is exactly the statement that difference vanishes. Neither statement is more fundamental than the other; each one is provable from the other, which is why this concept can demonstrate either one (the round trip returning to zero, or the same reading appearing at the same spot on both passes) and be teaching the identical underlying property of a conservative force.',
  ARRAY[
    'how is zero on a loop the same idea as path doesnt matter',
    'why are closed loop zero and path independence the same rule',
    'if two paths give different work does that break the loop test too',
    'are these just two ways of saying the same thing',
    'does path independence prove the loop total is zero'
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

-- ── concept_panel_config registration (defensive dual-registration) ───────
-- CLAUDE.md §6 registration site 2 offers TWO alternative mechanisms — a SQL
-- INSERT into this table OR CONCEPT_PANEL_MAP in src/config/panelConfig.ts.
-- This concept is ALSO registered in code (CONCEPT_PANEL_MAP in
-- src/config/panelConfig.ts, layout 'single', renderer field_3d — required by
-- Gate 8b's registration cross-check in validate-concepts.ts, which asserts
-- every concept_id parses out of panelConfig.ts or FAILs the fleet run).
-- Included here as belt-and-suspenders so the DB and the code registration
-- agree, mirroring work_done_by_constant_force's 2026-08-01,
-- positive_negative_zero_work's and kinetic_energy_definition's 2026-08-02
-- migrations.
--
-- Values mirror the code registration exactly: single panel, field_3d, and
-- sonnet_can_upgrade FALSE because a field_3d diamond is authored config,
-- never an LLM-upgradable panel (Rule 5/18).
INSERT INTO concept_panel_config (
    concept_id, default_panel_count, panel_a_renderer, panel_b_renderer,
    sonnet_can_upgrade, upgrade_max, verified_by_human, reasoning,
    technology_a, class_level, chapter
) VALUES (
    'conservative_vs_nonconservative_forces',
    1,
    'field_3d',
    NULL,
    FALSE,
    1,
    FALSE,
    'Ch.6 Work, Energy and Power #5 (2026-08-07). Single-panel field_3d diamond on the newtons_laws_body scenario engine, and the FIRST concept in the fleet to seed a checkpoint exactly at the home pose (capture_mode "first" — adopts side without firing, fires once on the return crossing, latches) alongside capture_mode "every" pass-1/pass-2 interior stamps. A force is conservative when its total work around any closed path is zero (gravity: a round-trip work bar falls then climbs back to a latched 0.0 J start-line stamp); friction is non-conservative because it always opposes the instantaneous motion, so a round trip adds two negative legs instead of cancelling them (latched -27.4 J, the PRIMARY aha). The friction arrow debuts flipping 180 degrees at the turnaround (the mechanism), and two flags on a frictionless slope stamp an identical gravity reading on both passes (the endpoint-only property potential_energy_definition builds on next). Pure configuration, zero renderer edits (0d). Mirrors CONCEPT_PANEL_MAP in src/config/panelConfig.ts. sonnet_can_upgrade FALSE: field_3d concepts are pure authored configuration and are never upgraded by an LLM at serving time (Rule 5/18).',
    'threejs',
    11,
    '6'
)
ON CONFLICT (concept_id) DO UPDATE
SET default_panel_count = EXCLUDED.default_panel_count,
    panel_a_renderer    = EXCLUDED.panel_a_renderer,
    panel_b_renderer    = EXCLUDED.panel_b_renderer,
    sonnet_can_upgrade  = EXCLUDED.sonnet_can_upgrade,
    upgrade_max         = EXCLUDED.upgrade_max,
    reasoning           = EXCLUDED.reasoning,
    technology_a        = EXCLUDED.technology_a,
    class_level         = EXCLUDED.class_level,
    chapter             = EXCLUDED.chapter;
