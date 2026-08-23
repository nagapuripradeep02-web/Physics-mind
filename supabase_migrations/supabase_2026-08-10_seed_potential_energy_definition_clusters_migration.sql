-- supabase_2026-08-10_seed_potential_energy_definition_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for
-- potential_energy_definition.json — Class 11 Ch.6 Work, Energy and Power #6,
-- authored against the same newtons_laws_body field_3d engine as #1-#5, and
-- the FIRST concept in the fleet to render the U_grav energy bar and pair it
-- with a work accumulator where the claim IS their numeric CHANGE-identity
-- (delta-U = -W_conservative). chapter:6, section:"6.7",
-- prerequisites: ["conservative_vs_nonconservative_forces",
-- "positive_negative_zero_work","work_done_by_constant_force","block_on_incline"].
--
-- Authored 2026-08-10 by alex:json_author, using the physics_author's
-- drill-down trigger phrases VERBATIM (docs/loop_runs/ch6/
-- potential_energy_definition/physics_block.md §5):
--   STATE_1 — where_negative_work_goes, stored_energy_returns_on_descent,
--             sign_of_delta_u;
--   STATE_2 — why_only_conservative_forces_have_u, friction_work_is_not_stored,
--             round_trip_test_recap;
--   STATE_3 — computing_delta_u_from_work, u_level_vs_u_change,
--             minus_sign_in_the_definition.
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
-- STATE_1, STATE_2 and STATE_3 all carry a drill_downs array in the concept
-- JSON referencing these cluster_ids (Pass-1 cliff states S1/S2 plus S3 for
-- the quantitative abstraction — divergence documented in the skeleton).
--
-- BOUNDARY NOTE, binding on every description below: this concept owns ONE
-- relation, delta-U = -W_conservative, and ONE scope condition (conservative
-- only). It never teaches U = mgh or any formula for U's value, the freedom
-- to choose the h = 0 reference, or path independence itself
-- (gravitational_potential_energy's content); never teaches spring potential
-- energy (elastic_potential_energy_spring's content); never introduces K,
-- E_total or conservation (kinetic_energy_definition /
-- conservation_of_mechanical_energy's content); never does the accounting of
-- where friction's heat goes beyond naming the destination
-- (mechanical_energy_loss_with_friction's content); and never re-derives the
-- work meter, work's sign, or the round-trip test itself — those are
-- work_done_by_constant_force, positive_negative_zero_work and
-- conservative_vs_nonconservative_forces, all consumed as prerequisites. No
-- description here may cross any of those lines.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_1 where_negative_work_goes deep-dive ─────────────────────────
(
  'where_negative_work_goes',
  'potential_energy_definition',
  'STATE_1',
  'If gravity''s work is negative, where did that energy go?',
  'Student watches gravity''s work bar fall to a genuine −128.0 J and expects that energy to have vanished, since "negative" reads as "removed" or "lost." The −128.0 J is real and is not an error — gravity genuinely did negative work on the climbing block. What the belief misses is that the SAME 128.0 J is not gone, it moved: the U bar, right beside the work bar, climbs from 49.0 to 177.0 J in the exact same frames — up by exactly 128.0 J, the identical size, the opposite sign. Negative work by a conservative force does not delete energy from the system; it is the bookkeeping entry for energy being stored by position instead of being carried as motion. Delta-U = -W_gravity is not a coincidence to memorize, it is the definition: whatever a conservative force''s work removes from one ledger appears, joule for joule, in the potential energy ledger.',
  ARRAY[
    'if gravity does negative work where does that energy go',
    'does negative work mean energy disappeared',
    'how can work be negative and energy still increase',
    'gravity did negative work so where did the energy actually go',
    'is negative work the same as losing energy'
  ],
  'pending_review'
),
-- ─── STATE_1 stored_energy_returns_on_descent deep-dive ─────────────────
(
  'stored_energy_returns_on_descent',
  'potential_energy_definition',
  'STATE_1',
  'Does the block get back the same energy it stored?',
  'Student sees U climb on the way up and wonders whether the block gets back the SAME amount on the way down, or only part of it, or whether the return is somehow approximate. On the frictionless slope the return is exact: as the block descends, gravity''s work turns positive and climbs back toward zero at exactly the rate U falls back toward its starting 49.0 J — the same joule-for-joule mirror that stored the energy going up now runs in reverse. Nothing is lost between the two legs because gravity is a conservative force: its work depends only on how high the block is, not on which direction it is travelling, so the descent simply retraces the ascent''s numbers in reverse order. The energy is returned exactly, not approximately — the same U that was stored is the U that comes back as the block loses height.',
  ARRAY[
    'why does the energy come back when it falls',
    'does the block get back the same energy it stored',
    'why does U go down again on the way down',
    'how does the potential energy return to the block',
    'is the energy given back exactly or only part of it'
  ],
  'pending_review'
),
-- ─── STATE_1 sign_of_delta_u deep-dive ──────────────────────────────────
(
  'sign_of_delta_u',
  'potential_energy_definition',
  'STATE_1',
  'Why is ΔU positive going up but negative coming down?',
  'Student wants a shortcut for the sign of ΔU without recomputing the work integral each time, and is unsure why the same block on the same slope gives opposite signs for ΔU depending on which way it is moving. The rule follows directly from the definition delta-U = -W_gravity: going up, gravity''s work is negative (it opposes the climb), so ΔU is the negative of a negative number — positive, U rises. Coming down, gravity''s work is positive (it now acts with the motion), so ΔU is the negative of a positive number — negative, U falls. The sign of ΔU is never a property of the block or the slope alone; it flips exactly when the sign of the conservative force''s work flips, which happens exactly when the direction of motion relative to that force flips. Read gravity''s work sign first, and the sign of ΔU is immediate: they are always opposite.',
  ARRAY[
    'why is delta U positive when the block goes up',
    'why is delta U negative when it comes down',
    'does delta U being negative mean energy is lost',
    'how do i know the sign of delta U without calculating',
    'why does going up make delta U positive but W negative'
  ],
  'pending_review'
),
-- ─── STATE_2 why_only_conservative_forces_have_u deep-dive ──────────────
(
  'why_only_conservative_forces_have_u',
  'potential_energy_definition',
  'STATE_2',
  'Why can''t every force have a potential energy?',
  'Student has just accepted that gravity''s work maps cleanly onto a stored U and reasonably asks why the same trick will not work for ANY force whose work can be computed — after all, friction''s work is just as calculable as gravity''s. The requirement is not computability, it is that the force''s work must depend ONLY on the position reached, never on the path taken to get there — the property called path-independence, or "conservative." Gravity passes this test: its work between two heights is the same number no matter how the block got from one height to the other. Friction fails it: its work depends on the total distance actually slid, not the net displacement, so the SAME start and end position can give wildly different friction work depending on the route. A potential energy needs to be a single number attached to EACH position — and that single-number property only exists for a force whose work is path-independent.',
  ARRAY[
    'why cant every force have a potential energy',
    'why does friction not get its own U',
    'what makes a force conservative or not',
    'why does the definition need the word conservative',
    'can normal force have a potential energy too'
  ],
  'pending_review'
),
-- ─── STATE_2 friction_work_is_not_stored deep-dive ──────────────────────
(
  'friction_work_is_not_stored',
  'potential_energy_definition',
  'STATE_2',
  'Why doesn''t friction''s work come back like gravity''s does?',
  'Student has just watched gravity''s work return on the descent and expects friction''s negative work to behave the same way — fall while sliding one direction, then climb back while sliding the other. On the rough trip friction''s bar does the opposite: it falls on the way up AND keeps falling on the way down, never turning around, because kinetic friction always opposes the instantaneous motion — it never helps the block move, in either direction. There is no partner bar for friction to mirror into, because friction''s work is not a function of position at all; it depends on the total path slid, which only ever grows. The energy friction''s negative work removes does not vanish, either — it becomes heat, warming the block and the surface — but it is not RETURNED the way a conservative force''s work is, because there is no position-only ledger for a path-dependent force to draw from.',
  ARRAY[
    'if friction does negative work why is it not stored like gravity',
    'why doesnt frictions work come back like gravitys does',
    'is frictions work also stored somewhere we cant see',
    'why is frictions negative work different from gravitys negative work',
    'does pushing against friction store energy the same way as lifting'
  ],
  'pending_review'
),
-- ─── STATE_2 round_trip_test_recap deep-dive ────────────────────────────
(
  'round_trip_test_recap',
  'potential_energy_definition',
  'STATE_2',
  'What was that round-trip test again?',
  'Student half-remembers a round-trip check from a previous lesson and wants a quick recap of what it says and why it is the deciding test for whether a force can have a potential energy. The test: send a body around any closed path, back to exactly where it started, and add up that force''s work over the whole trip. If the total is always exactly zero, no matter which closed path was taken, the force is conservative — its work depends only on the endpoints, and since the endpoints are the same point, the total must be zero. Gravity passes: a round trip''s work bar falls on the way out and climbs back to exactly 0.0 J on the way back. Friction fails: it opposes the motion on every leg of every path, so its round-trip work is always more negative than either leg alone, never zero. This is exactly the property that lets a conservative force define a U at every position — and exactly what friction lacks.',
  ARRAY[
    'what was that round trip test again',
    'why does the round trip decide if a force has a U',
    'how do i check if a force is conservative using a round trip',
    'why does frictions work not cancel on a round trip',
    'what happens to gravitys work on a full round trip'
  ],
  'pending_review'
),
-- ─── STATE_3 computing_delta_u_from_work deep-dive ──────────────────────
(
  'computing_delta_u_from_work',
  'potential_energy_definition',
  'STATE_3',
  'How do I calculate ΔU between two points?',
  'Student sees the two-point stamps on screen and is unsure exactly which number to read and what to do with it to get ΔU — do you subtract the U values, subtract the W values, or read one bar directly? The rule is simple and needs only ONE number: delta-U = -W_gravity, where W_gravity is the work gravity did moving the block from the first point to the second. Between point A and point B, gravity did −47.0 J of work (the difference of the two latched W stamps, −86.2 − (−39.2)), so ΔU = −(−47.0) = +47.0 J — which is exactly what the two U stamps confirm directly (135.2 − 88.2 = 47.0). Either route reaches the same answer, because they are the same identity read two ways; the shortcut is to take whichever work value the problem already hands you, negate it, and that is ΔU — no reference height, no absolute U value, is ever needed for this step.',
  ARRAY[
    'how do i calculate delta U between two points',
    'do i just use minus W to get delta U',
    'what work value do i plug into delta U equals minus W',
    'how do i find the change in potential energy from work done',
    'is delta U always equal to minus the work by gravity'
  ],
  'pending_review'
),
-- ─── STATE_3 u_level_vs_u_change deep-dive ──────────────────────────────
(
  'u_level_vs_u_change',
  'potential_energy_definition',
  'STATE_3',
  'Why doesn''t U equal −W at every point?',
  'Student notices that on this state''s screen the U stamp and the W stamp are NOT related by a simple sign flip — 88.2 J beside −39.2 J, 135.2 J beside −86.2 J — and is confused because an earlier state seemed to show exactly that kind of mirror. The resolution is that U''s LEVEL and U''s CHANGE are two different questions. U''s level at a point depends on an arbitrary starting reference (here, the ramp''s foot, chosen once and never changed) — move the reference and every LEVEL shifts by a constant, even though nothing physical changed. U''s CHANGE between two points does NOT depend on that reference at all: 135.2 − 88.2 = 47.0 J is the same 47.0 J no matter where the U = 0 line was drawn, because the reference constant cancels out of any subtraction. So U is not equal to −W as levels (there is an offset), but ΔU = −W as a change, always, exactly. The levels need a reference; the differences never do.',
  ARRAY[
    'why doesnt U equal minus W at every point',
    'if U is not minus W then what is actually true',
    'why do the U and W numbers not match on the screen',
    'is it the level or the change that has to match',
    'why does the difference work but the actual values dont'
  ],
  'pending_review'
),
-- ─── STATE_3 minus_sign_in_the_definition deep-dive ─────────────────────
(
  'minus_sign_in_the_definition',
  'potential_energy_definition',
  'STATE_3',
  'Where does the minus sign in ΔU = −W come from?',
  'Student treats the minus sign in delta-U = -W_conservative as an arbitrary convention to memorize and asks why it is there at all, or what breaks if it is dropped. The sign is not a convention, it is forced by what "stored" has to mean: when a conservative force does POSITIVE work on a body (it helps the motion), that force is spending its own stored capacity, so the potential energy it could still give back must go DOWN — a positive W paired with a falling U. When the force does NEGATIVE work (it opposes the motion, work is being done against it), the body is building UP a reserve the force can release later, so U must RISE. The only relation that pairs positive W with falling U and negative W with rising U is ΔU = −W: drop the minus sign and the definition would say a force doing positive work INCREASES the stored energy it is about to spend, which contradicts what "stored energy" means. The minus sign is the whole content of "stored," not decoration on it.',
  ARRAY[
    'why is there a minus sign in delta U equals minus W',
    'what happens if i forget the minus sign',
    'why is potential energy defined with a negative sign',
    'does the minus sign mean the energy is negative',
    'where does the minus sign in the definition come from'
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
-- agree, mirroring work_energy_theorem's 2026-08-07 and
-- conservative_vs_nonconservative_forces's 2026-08-07 migrations.
--
-- Values mirror the code registration exactly: single panel, field_3d, and
-- sonnet_can_upgrade FALSE because a field_3d diamond is authored config,
-- never an LLM-upgradable panel (Rule 5/18).
INSERT INTO concept_panel_config (
    concept_id, default_panel_count, panel_a_renderer, panel_b_renderer,
    sonnet_can_upgrade, upgrade_max, verified_by_human, reasoning,
    technology_a, class_level, chapter
) VALUES (
    'potential_energy_definition',
    1,
    'field_3d',
    NULL,
    FALSE,
    1,
    FALSE,
    'Ch.6 Work, Energy and Power #6 (2026-08-10). Single-panel field_3d diamond on the newtons_laws_body scenario engine, the FIRST concept in the fleet to render the U_grav energy bar and pair it with a work accumulator where the claim IS their numeric CHANGE-identity. Potential energy U is DEFINED by delta-U = -W_conservative: a block launched up a frictionless slope shows gravity''s work bar falling to -128.0 J while U climbs from 49.0 to 177.0 J in the same frames -- equal joule changes, opposite directions (the PRIMARY aha); on the descent gravity''s work turns positive and U falls back by the same joules, stored not destroyed. On a rough slope a third bar (friction) falls on both legs with no partner, because only a conservative force (path-independent work) can have a potential energy. Two marked points, held under a physics-freezing dwell, show that the LEVELS of U and W differ (offset by the reference height) but only the CHANGE matches: 135.2 - 88.2 = 47.0 J, exactly minus the work gravity did between them. Pure configuration, zero renderer edits (0d). Mirrors CONCEPT_PANEL_MAP in src/config/panelConfig.ts. sonnet_can_upgrade FALSE: field_3d concepts are pure authored configuration and are never upgraded by an LLM at serving time (Rule 5/18).',
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
