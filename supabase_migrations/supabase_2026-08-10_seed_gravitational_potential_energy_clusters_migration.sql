-- supabase_2026-08-10_seed_gravitational_potential_energy_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters for
-- gravitational_potential_energy.json — Class 11 Ch.6 Work, Energy and Power
-- #7, authored against the same newtons_laws_body field_3d engine as #1-#6,
-- and the first concept to exercise energy_layer.h_ref_m as a genuine
-- authored CHOICE that moves between two states showing the identical climb.
-- chapter:6, section:"6.8", prerequisites: ["potential_energy_definition",
-- "conservative_vs_nonconservative_forces","work_done_by_constant_force"].
--
-- Authored 2026-08-10 by alex:json_author, using the physics_author's
-- drill-down trigger phrases VERBATIM (docs/loop_runs/ch6/
-- gravitational_potential_energy/physics_block.md §5):
--   STATE_3 — zero_reference_choice, negative_potential_energy,
--             delta_u_vs_u;
--   STATE_4 — path_independence_gravity, ramp_vs_vertical_lift_work,
--             longer_ramp_less_force_same_energy.
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
-- STATE_3 (the PRIMARY aha — the classic "how can the zero be arbitrary?"
-- confusion, historically the highest stuck-rate in this concept family) and
-- STATE_4 (path independence — the piece exam questions test hardest: ramp
-- vs ladder vs lift, and the one students argue with).
--
-- BOUNDARY NOTE, binding on every description below: this concept owns THREE
-- invariances of U = mgh under a chosen reference — same place gives the same
-- U, a moved zero shifts every U but never ΔU, and a different slope to the
-- same height gives the same U. It never re-teaches the general definition of
-- potential energy or ΔU = -W_conservative itself (potential_energy_definition's
-- content, cited by concept_id only, never by state number); never teaches
-- spring potential energy, kinetic energy, total mechanical energy,
-- conservation, or friction losses; and never touches the general -GMm/r far-
-- field form (a later, unbuilt Gravitation-chapter concept -- see the
-- disambiguation note left in CONCEPT_RENDERER_MAP,
-- src/lib/aiSimulationGenerator.ts, 2026-08-10). No description here may
-- cross any of those lines.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_3 zero_reference_choice deep-dive ────────────────────────────
(
  'zero_reference_choice',
  'gravitational_potential_energy',
  'STATE_3',
  'Why can we just pick where zero is?',
  'Student watches the identical climb re-run with the dashed h = 0 line moved to the cart''s own start height and the U bar opens at 0.0 J instead of 8.8 J, and wants to know how the "real" potential energy of the exact same cart at the exact same spot can legitimately be a different number just because a line moved. The reference height is not a fact about the cart or the ramp -- it is a bookkeeping choice made once, before the count begins, exactly like choosing which floor of a building to call the ground floor. Nothing physical about the cart changes when the line moves: not its mass, not its height above the floor it actually stands on, not any force acting on it. What DOES stay fixed under any choice is the DIFFERENCE between two readings, DeltaU = mgDeltah -- the state confirms this directly: every individual stamped U value moved (8.8 to 0.0, 14.7 to 5.9, 44.1 to 35.3), yet the gain between point A and point B held at exactly 29.4 J both times. The freedom to choose is not a flaw in the definition, it is a feature of it: U''s LEVEL is bookkeeping, U''s CHANGE is physics.',
  ARRAY[
    'why can we just pick where zero is',
    'how is height zero not always the ground',
    'doesnt changing the zero point change the real energy',
    'why did the energy become 0 when nothing moved',
    'is the potential energy value even real if we can choose it'
  ],
  'pending_review'
),
-- ─── STATE_3 negative_potential_energy deep-dive ────────────────────────
(
  'negative_potential_energy',
  'gravitational_potential_energy',
  'STATE_3',
  'Can potential energy be negative, and what would that mean?',
  'Student notices the U bar in this state opens at exactly 0.0 J -- right at the boundary -- and wonders what would happen if the cart started BELOW the chosen h = 0 line: would U go negative, and if so, does that mean the cart has "less than no" energy? The formula U = mgh has no built-in floor at zero -- if h is measured as negative (the body sits below the chosen reference), U genuinely comes out negative, and that is not a contradiction, only the same bookkeeping freedom running in the other direction. A negative U simply means: relative to the height you chose to call zero, this body would need MORE work done against gravity to reach that reference than it currently has stored above it. It is exactly as real, and exactly as arbitrary, as a positive U -- both are read against the same chosen line. (This engine''s energy bar happens to be built as an unsigned display, so a negative U is not rendered on THIS instrument -- every state in this concept keeps h at or above its own chosen zero for exactly that reason -- but the physics itself, U = mg times a signed height, permits it freely; nothing about the definition forbids a negative reading.) The energy is not "lost" or "used up" by being negative -- it is simply counted from a reference above the body''s own position.',
  ARRAY[
    'can potential energy be negative',
    'what does negative U even mean',
    'is energy below zero still energy',
    'why would something have less than no energy',
    'does negative U mean the object lost energy forever'
  ],
  'pending_review'
),
-- ─── STATE_3 delta_u_vs_u deep-dive ─────────────────────────────────────
(
  'delta_u_vs_u',
  'gravitational_potential_energy',
  'STATE_3',
  'Which one do I actually use in a problem -- U or ΔU?',
  'Student has just watched every individual U stamp change under the moved reference while the gain, DeltaU, held fixed at 29.4 J both times, and is unsure which of the two -- the LEVEL or the CHANGE -- is the number a real problem is asking for. The rule is simple once the distinction is clear: whenever a question asks for "the potential energy AT a point" as an absolute number, it has silently assumed or stated a reference, and the LEVEL U depends on that reference. Whenever a question asks "how much energy was gained or lost going from A to B," it wants the CHANGE, DeltaU = mgDeltah, and that number needs no reference at all -- it is the same 29.4 J whether the chosen zero sits at the ramp''s foot, at the cart''s own start, or anywhere else. Almost every exam question that matters physically -- how much energy did lifting the crate store, how much can be recovered on the way down -- is secretly asking for DeltaU, because DeltaU is the piece that is actually physical and measurable. A LEVEL of U by itself, with no stated reference, is not yet a complete answer to anything.',
  ARRAY[
    'which one do i use in the formula, U or delta U',
    'why does only the change matter and not the total',
    'is delta U the same as U',
    'why do two different U values give the same answer',
    'when do i need the actual U instead of just the change'
  ],
  'pending_review'
),
-- ─── STATE_4 path_independence_gravity deep-dive ────────────────────────
(
  'path_independence_gravity',
  'gravitational_potential_energy',
  'STATE_4',
  'Does the path taken change how much energy gets stored?',
  'Student watches the ramp rotate to a much steeper 48.6 degrees and the same cart reach the same 1.5 m height by a shorter path -- d = 1.40 m instead of 2.40 m -- and the stamped U still reads the identical 44.1 J, and wants to understand why the path apparently does not matter at all. U = mgh depends on exactly three things: the mass, gravity, and the HEIGHT gained above the chosen reference -- nothing in that formula has a term for the distance travelled, the shape of the route, or how many turns it took. Two routes that start and end at the same two heights, however different their geometry, produce the identical mgDeltah, because the vertical rise is the only geometric fact the formula reads. This is the same property -- path independence -- that makes gravity a CONSERVATIVE force, the property potential_energy_definition builds the whole idea of "stored energy" from: a force can only have a potential energy if its work depends solely on where you end up, never on how you got there. Whether you go straight up, along a gentle ramp, along a steep ramp, or in a zig-zag, the height gained is the only thing gravity''s stored energy ever counts.',
  ARRAY[
    'does the path taken change the energy stored',
    'why is a longer ramp not more energy',
    'does it matter if i go straight up or along a slope',
    'why does zigzagging not add extra potential energy',
    'is climbing stairs different from taking a lift energy wise'
  ],
  'pending_review'
),
-- ─── STATE_4 ramp_vs_vertical_lift_work deep-dive ───────────────────────
(
  'ramp_vs_vertical_lift_work',
  'gravitational_potential_energy',
  'STATE_4',
  'Why does a ramp need less force but the same energy?',
  'Student has correctly noticed that the steeper ramp in this state needed a LARGER applied force (22.05 N instead of 14.7 N) to hold the cart at constant speed, and reasonably assumes a bigger force must mean more work, more energy stored -- yet the stamp reads the same 44.1 J both times, and the apparent contradiction needs resolving. Work is force times DISTANCE along the direction of the force, not force alone -- W = F times d. The steeper ramp needs a force closer to the full weight (more force), but the cart travels a SHORTER distance to reach the same height (less distance); the gentler ramp needs less force, but the cart travels FARTHER to reach that same height (more distance). The two effects trade off exactly: a bigger force over a shorter distance and a smaller force over a longer distance multiply out to the identical work, and that work is what becomes the identical stored energy. A ramp is a tool that trades force for distance -- it never changes the total work needed to reach a given height, only how that work is delivered.',
  ARRAY[
    'why does a ramp need less force but the same energy',
    'if the ramp uses less force why isnt the work less',
    'how can two different paths store the same energy',
    'does pushing something up a ramp do less work than lifting it',
    'why bother with a ramp if the energy is the same'
  ],
  'pending_review'
),
-- ─── STATE_4 longer_ramp_less_force_same_energy deep-dive ───────────────
(
  'longer_ramp_less_force_same_energy',
  'gravitational_potential_energy',
  'STATE_4',
  'What is the actual point of using a ramp, if the stored energy never changes?',
  'Student has absorbed that ΔU is the same on every ramp to the same height and now asks the practical question: if the ENERGY is identical either way, what is a ramp actually good for? The answer is that ramps do not exist to save energy -- they exist to save FORCE, which is a completely different, and often more important, practical constraint. A worker or a machine may be able to sustain a steady 15 N push for a long distance far more easily than a single 30 N lift for a short one, even though both eventually store the identical energy -- this is exactly why loading ramps, wheelchair ramps, and mountain roads that switch back and forth all use gentle slopes: not to cheat physics out of energy, but to keep the FORCE required at every instant within what a person, a vehicle, or a motor can actually supply. A gentler slope genuinely saves force (spread thinner, over more distance); it never saves or loses one joule of the energy that ends up stored, because that number is fixed the moment the start and end heights are fixed.',
  ARRAY[
    'whats the point of a ramp if energy stored is the same',
    'why do trucks use ramps instead of lifting straight up',
    'if force is less on a ramp where does the energy difference go',
    'does a gentler slope save energy or just save force',
    'why does pushing longer not mean storing more'
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
-- agree, mirroring potential_energy_definition's 2026-08-10 migration and the
-- earlier work_energy_theorem / conservative_vs_nonconservative_forces
-- precedent.
--
-- Values mirror the code registration exactly: single panel, field_3d, and
-- sonnet_can_upgrade FALSE because a field_3d diamond is authored config,
-- never an LLM-upgradable panel (Rule 5/18).
INSERT INTO concept_panel_config (
    concept_id, default_panel_count, panel_a_renderer, panel_b_renderer,
    sonnet_can_upgrade, upgrade_max, verified_by_human, reasoning,
    technology_a, class_level, chapter
) VALUES (
    'gravitational_potential_energy',
    1,
    'field_3d',
    NULL,
    FALSE,
    1,
    FALSE,
    'Ch.6 Work, Energy and Power #7 (2026-08-10). Single-panel field_3d diamond on the newtons_laws_body scenario engine. Near the Earth''s surface a body''s gravitational potential energy is U = mgh, measured from a height you CHOOSE to call zero -- the choice moves every U value but never the difference DeltaU = mgDeltah, and that difference depends only on the start and end heights, never the path between them. One canonical apparatus (a cart on a ramp, a U bar, a dashed h = 0 line) carries three invariances: same place gives the same U (a launched-and-returned round trip); a moved zero shifts every U but never DeltaU (the PRIMARY aha -- the bar opens at 0.0 J instead of 8.8 J, yet the stamped gain still reads 29.4 J); and a steeper ramp to the same height gives the same U (path independence -- d = 1.40 m instead of 2.40 m, still 44.1 J). The final state derives U = mgh by applying potential_energy_definition''s own DeltaU = -W_conservative relation to gravity, with two latched checkpoint stamps proving the subtraction on screen (8.6 J each way). Pure configuration, zero renderer edits (0d). Mirrors CONCEPT_PANEL_MAP in src/config/panelConfig.ts. sonnet_can_upgrade FALSE: field_3d concepts are pure authored configuration and are never upgraded by an LLM at serving time (Rule 5/18).',
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
