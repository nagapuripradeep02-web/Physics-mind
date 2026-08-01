-- supabase_2026-08-01_seed_uniform_circular_motion_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters for
-- uniform_circular_motion.json — Laws of Motion (Class 11), authored against
-- the force_rig field_3d engine, Branch B `whirl`
-- (docs/loop_runs/lom_g/_engine/force_rig_json_contract.md). chapter:8,
-- section:"8.10", prerequisites:
-- ["equilibrium_of_particles","newton_first_law","newton_second_law","tension_force","vector_resolution"].
--
-- Authored 2026-08-01 by alex:json_author, using the physics_author's
-- drill-down trigger phrases VERBATIM (docs/loop_runs/lom_g/
-- uniform_circular_motion/02_physics_block.md §10):
--   STATE_3 — why_tangent_not_outward, what_you_feel_in_a_turning_car,
--             speed_unchanged_after_release;
--   STATE_5 — deriving_cos_theta_g_over_omega2L, why_the_string_never_goes_horizontal,
--             tension_larger_than_weight_on_the_cone.
--
-- Migration is AUTHORED, NOT APPLIED. The lom-g tray forbids DB writes of any
-- kind (docs/loop_runs/lom_g_state.md, "Hard prohibitions"), so this file is
-- authored and left for the founder / quality_auditor's pre-run step. Drill-down
-- itself is DEFERRED (Rule 18, 2026-06-10 directive) — the
-- confusion_cluster_registry Gate-8 probe is N/A-DORMANT this phase per the
-- documented false-FAIL scar (memory: auditor-cluster-registry-false-fail).
-- Do not let the auditor re-route json_author to "fix" this.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- status='pending_review' per the current cluster-registry convention.
--
-- has_prebuilt_deep_dive picks (architect skeleton §5, metadata only, Rule 18):
-- STATE_3 (the cut — the PRIMARY aha, and where the centrifugal intuition
-- fights hardest) and STATE_5 (the solved cone — the exam workhorse, conical
-- pendulum). Both states carry a drill_downs array in the concept JSON
-- referencing these cluster_ids.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_3 why_tangent_not_outward deep-dive ─────────────────────────
(
  'why_tangent_not_outward',
  'uniform_circular_motion',
  'STATE_3',
  'Why does the released ball go straight along the tangent instead of flying outward?',
  'Student expects a "centrifugal" push to fling the ball away from the centre the instant the string lets go, so a straight tangential departure looks like it is missing something. The ball''s velocity is ALWAYS tangent to the circle, at every instant, while it is circling — that is simply the direction the string was steering it in. The string''s only job was to keep bending that velocity inward, moment by moment, into the next tangent direction. Cut the string and there is nothing left to bend it: with no net force acting, the ball keeps the velocity it had at that exact instant, which is tangential, not radial. There is no separate outward force to reveal or to "let go of" — the constraint disappears, and the existing velocity is what carries the ball forward. The dim ghost circle on screen shows the abandoned path; the bright trail is dead straight and leaves it at a tangent, never bulging outward from it.',
  ARRAY[
    'why does it go straight not outward',
    'if the pull stops why doesnt it fly away from the centre',
    'why tangent and not away from where it was going',
    'shouldnt it move away from the circle not along it',
    'why does the ball go sideways when the string breaks'
  ],
  'pending_review'
),
-- ─── STATE_3 what_you_feel_in_a_turning_car deep-dive ──────────────────
(
  'what_you_feel_in_a_turning_car',
  'uniform_circular_motion',
  'STATE_3',
  'If nothing pushes outward, why do I feel flung outward when a car turns?',
  'Student''s own body-memory of leaning against the car door in a turn feels like direct proof that an outward force exists, so the "no outward force" claim seems to contradict lived experience. Inside the turning car, the passenger''s body, by Newton''s first law, tries to keep moving in a STRAIGHT line — the same tangent-line idea as the released ball. The car (and the seat, and eventually the door) turns underneath and around that straight path. What you feel as "being flung outward" is really the door catching up to press INWARD on you, forcing your body to turn with the car instead of continuing straight. The push you feel is real, but it is inward, from the door, not outward from your own body. In the ground frame there is still only one real force in that interaction: the door pushing the passenger toward the centre of the turn — exactly the same inward-only picture the whirl rig shows.',
  ARRAY[
    'why do i feel pushed outward in a turning car',
    'if theres no outward force why does my body lean out',
    'is the outward feeling in a car fake',
    'what is actually pushing me against the door when the car turns',
    'why does it feel like a force is throwing me out'
  ],
  'pending_review'
),
-- ─── STATE_3 speed_unchanged_after_release deep-dive ───────────────────
(
  'speed_unchanged_after_release',
  'uniform_circular_motion',
  'STATE_3',
  'Why does the ball''s speed stay exactly the same right after the string is cut?',
  'Student assumes the string was somehow "powering" the ball''s motion, so removing it should slow the ball down (or, less often, speed it up as something is "released"). The tension force always points from the ball toward the centre — perpendicular to the ball''s velocity at every instant, because the velocity is tangent to the circle and the tension is radial. A force does work only along the direction of motion; a force perpendicular to the motion does ZERO work, however large it is. So the tension, throughout the whole time it acts, never changes the ball''s speed at all — its only job is to keep changing the DIRECTION of the velocity. Cutting the string removes a force that was never contributing to the speed in the first place, so the speed measured the instant before the cut and the instant after are identical: 1.80 m/s both times, on screen, with only the direction now fixed rather than continuously turning.',
  ARRAY[
    'why does the speed stay the same after the string breaks',
    'shouldnt cutting the string slow the ball down',
    'does the ball speed up once its free',
    'why doesnt losing the pull change how fast it goes',
    'the tension was doing something so why no change in speed'
  ],
  'pending_review'
),
-- ─── STATE_5 deriving_cos_theta_g_over_omega2L deep-dive ───────────────
(
  'deriving_cos_theta_g_over_omega2L',
  'uniform_circular_motion',
  'STATE_5',
  'Where does cos θ = g / (ω²L) come from, and why L and not the radius r?',
  'Student either wants the derivation spelled out step by step, or wonders why the string LENGTH L appears in the formula instead of the circle''s radius r, which seems like the more natural quantity for circular motion. The conical pendulum has two balance conditions from the SAME tension: vertically, T cos θ balances the weight, T cos θ = m g; horizontally, T sin θ supplies the net inward force needed for the circle, T sin θ = m ω² r. Dividing the second equation by the first cancels T cleanly, leaving tan θ = ω² r / g. The geometry of the cone then gives r = L sin θ (the radius is the string''s own sideways reach), and substituting turns tan θ into (ω² L sin θ)/g, and after dividing both sides by sin θ, cos θ = g / (ω² L) falls straight out. L appears because it is the one length that is FIXED by the apparatus and independent of θ; r changes as the cone opens or closes, so writing the answer in terms of L, not r, is what makes cos θ a function of ω ALONE at a given L — exactly what lets the state show θ responding cleanly to a spin-rate ramp.',
  ARRAY[
    'where does cos theta equal g over omega squared L come from',
    'why does L appear and not the radius',
    'can you derive the angle formula step by step',
    'why do we divide the two equations',
    'how do you get from the two force equations to that formula'
  ],
  'pending_review'
),
-- ─── STATE_5 why_the_string_never_goes_horizontal deep-dive ────────────
(
  'why_the_string_never_goes_horizontal',
  'uniform_circular_motion',
  'STATE_5',
  'Why can''t the string ever swing all the way to horizontal, however fast it spins?',
  'Student expects that spinning hard enough should eventually flatten the string all the way to horizontal, the way pushing harder eventually gets most things to their limit. Horizontal means θ = 90°, which needs cos θ = 0. From cos θ = g / (ω² L), the ONLY way cos θ reaches zero is if ω² L is infinite — since g and L are both fixed positive numbers, that means ω itself would have to be infinitely large. No real, finite spin rate can ever make the right-hand side exactly zero; it only gets smaller and smaller as ω grows, so θ only gets closer and closer to 90° without ever touching it. Along the way tension keeps climbing too, since T = m ω² L has no upper bound either — on screen, ω = 6.20 rad/s already gives θ = 75.2° and T = 57.7 N, close to the apparatus''s own limit, and reaching 90° would need spinning far beyond anything achievable, in principle or in practice.',
  ARRAY[
    'why cant the string ever become horizontal',
    'what spin would make it exactly horizontal',
    'why does it just get closer and closer but never flat',
    'is there a spin fast enough to make theta 90 degrees',
    'what happens to the tension as it gets close to horizontal'
  ],
  'pending_review'
),
-- ─── STATE_5 tension_larger_than_weight_on_the_cone deep-dive ──────────
(
  'tension_larger_than_weight_on_the_cone',
  'uniform_circular_motion',
  'STATE_5',
  'How can the string''s tension be bigger than the ball''s own weight?',
  'Student reasons that a string holding up a ball should carry, at most, the ball''s weight, so a reading larger than mg looks like it is carrying more than "the whole load" — sometimes phrased as a suspected violation of Newton''s third law. The string''s tension is not devoted entirely to holding the ball up; only its VERTICAL component, T cos θ, does that job, and T cos θ = m g exactly, matching the weight. But T itself is larger, because T = m g / cos θ, and cos θ is always less than 1 for any real cone angle — so T is always somewhat larger than m g, never equal to it and never less. The rest of the tension is horizontal, T sin θ, and it goes entirely into supplying the inward force that keeps the ball circling; it does no work holding anything up. There is no violation of any law here: the SAME single tension is doing two jobs at once, at two different angles, and only one component of it needs to equal the weight.',
  ARRAY[
    'how can the tension be bigger than the weight of the ball',
    'does that break newtons third law',
    'why does the string pull harder than the ball weighs',
    'is the extra tension coming from somewhere',
    'why isnt tension just equal to mg on the cone'
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

-- ── concept_panel_config registration (added 2026-08-01) ──────────────────
-- CLAUDE.md §6 registration site 2. The concept is already registered in code
-- (CONCEPT_PANEL_MAP in src/config/panelConfig.ts:1034, layout 'single',
-- renderer field_3d after this tray's retrofit) — but a concept absent from
-- this TABLE is the known silent-failure class `Concept missing from
-- concept_panel_config silently routes to particle_field renderer with no
-- warning` (engine_bug_queue, 2026-04-26). This concept ALREADY had a stale
-- row here from the retired mechanics_2d-era registration; this migration
-- overwrites it (ON CONFLICT DO UPDATE) rather than adding a duplicate.
--
-- Values mirror the code registration exactly: single panel, field_3d, and
-- sonnet_can_upgrade FALSE because a field_3d diamond is authored config, never
-- an LLM-upgradable panel (Rule 5/18).
INSERT INTO concept_panel_config (
    concept_id, default_panel_count, panel_a_renderer, panel_b_renderer,
    sonnet_can_upgrade, upgrade_max, verified_by_human, reasoning,
    technology_a, class_level, chapter
) VALUES (
    'uniform_circular_motion',
    1,
    'field_3d',
    NULL,
    FALSE,
    1,
    FALSE,
    'lom-g (2026-08-01). Single-panel field_3d diamond on the force_rig scenario engine (branch B, whirl). Retrofit onto a previously stale mechanics_2d-era registration. Mirrors CONCEPT_PANEL_MAP in src/config/panelConfig.ts. sonnet_can_upgrade FALSE: field_3d concepts are pure authored configuration and are never upgraded by an LLM at serving time (Rule 5/18).',
    'threejs',
    11,
    '8'
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
