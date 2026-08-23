-- supabase_2026-08-04_seed_conservation_of_angular_momentum_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters for
-- conservation_of_angular_momentum.json — Class 11 Ch.7 System of Particles and
-- Rotational Motion #9 (rotmech desk A), authored against the rigid_body_rotation
-- field_3d engine (0c-1, docs/loop_runs/rotmech/APPARATUS_CONTRACT.md). chapter:9,
-- section:"9.9", prerequisites: ["angular_momentum","moment_of_inertia",
-- "tau_eq_i_alpha","rotational_work_energy"] (all pre-registered ids, none yet
-- shipped as concept JSONs — see the open founder ruling in
-- docs/loop_runs/rotmech_a_state.md).
--
-- Authored 2026-08-04 by alex:json_author, using the physics_author's
-- drill-down trigger phrases VERBATIM (docs/loop_runs/rotmech/
-- conservation_of_angular_momentum/physics_block.md §5):
--   STATE_2 — why_omega_rises, L_vs_omega_confusion, internal_forces_no_torque;
--   STATE_4 — ke_not_conserved, who_does_the_work, ke_ratio_formula.
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
-- has_prebuilt_deep_dive picks (skeleton §5, metadata only, Rule 18):
-- STATE_2 (the primary aha — "why does it speed up" is the historic sticking
-- point) and STATE_4 (energy bookkeeping, where exam mistakes concentrate).
-- Both states carry a drill_downs array in the concept JSON referencing these
-- cluster_ids.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_2 why_omega_rises deep-dive ──────────────────────────────────
(
  'why_omega_rises',
  'conservation_of_angular_momentum',
  'STATE_2',
  'Why does the spin speed up when nothing pushed it?',
  'Student is used to Newton''s first law in its everyday translational form — a spin rate should not change unless a motor or some external push acts — and the pull that slides the masses inward looks, at first glance, like exactly such a push. The key distinction is INTERNAL versus EXTERNAL: the inward pull is applied by one part of the system (the mechanism holding the masses) onto another part of the same system (the masses themselves), and it points directly AT the rotation axis. A force that points straight at the axis has zero moment arm about that axis, so it exerts zero TORQUE, even though it is a perfectly real, nonzero force. Angular momentum L = Iω only has to stay constant when the net EXTERNAL torque is zero — and it does stay exactly constant here. What changes is the moment of inertia I, and because L = Iω is fixed, a falling I forces ω to rise to compensate. Nothing violates any conservation law; the spin-up is the direct, required consequence of L staying fixed while I falls.',
  ARRAY[
    'why does it spin faster when nothing pushed it',
    'how can speed increase with no force',
    'nothing touched it so why did the spin change',
    'where does the extra speed come from',
    'isnt this against newtons first law'
  ],
  'pending_review'
),
-- ─── STATE_2 L_vs_omega_confusion deep-dive ─────────────────────────────
(
  'L_vs_omega_confusion',
  'conservation_of_angular_momentum',
  'STATE_2',
  'If L stays the same, why does omega change?',
  'Student has just learned L = Iω and expects that if one side of an equation is constant, every symbol on the other side should also individually stay constant — collapsing L, I and ω into "the same thing" rather than treating L as a PRODUCT of two independently varying quantities. L = Iω is a relationship, not an identity that freezes I and ω together. When the masses slide inward, the moment of inertia I genuinely falls (mass redistributes closer to the axis), and because the product I times ω is held fixed by the absence of external torque, ω must rise by exactly the same factor that I fell. L staying constant is precisely WHY ω has to change — the two facts are not in tension, they are cause and effect of the same conservation law.',
  ARRAY[
    'if L stays the same why does omega change',
    'L is constant so shouldnt the spin stay the same too',
    'whats the difference between L and omega here',
    'why is L fixed but the speed isnt',
    'I thought L and omega always move together'
  ],
  'pending_review'
),
-- ─── STATE_2 internal_forces_no_torque deep-dive ────────────────────────
(
  'internal_forces_no_torque',
  'conservation_of_angular_momentum',
  'STATE_2',
  'The pull is a force, so why is there no torque?',
  'Student correctly identifies that a real, nonzero force (the visible inward pull arrows) is acting on each mass, and reasonably expects any acting force to produce SOME torque and therefore some change to angular momentum. Torque is not just "a force acting" — it is τ = r × F, and its size depends on the PERPENDICULAR distance between the force''s line of action and the rotation axis (the moment arm). The pull arrows point directly along the radial line, straight at the axle: their line of action passes THROUGH the axis itself, so the moment arm is exactly zero. A force with zero moment arm produces exactly zero torque about that axis, no matter how large the force is. That is precisely why this particular force is able to change the mass distribution (and hence I) while leaving the axis''s angular momentum completely untouched — it does work on radial motion but contributes nothing to rotation about the axis.',
  ARRAY[
    'the pull is a force so why is there no torque',
    'doesnt pulling the masses in count as a push',
    'why doesnt the inward pull twist the turntable',
    'the arrows are forces so where is the torque',
    'how can a force act with zero torque'
  ],
  'pending_review'
),
-- ─── STATE_4 ke_not_conserved deep-dive ─────────────────────────────────
(
  'ke_not_conserved',
  'conservation_of_angular_momentum',
  'STATE_4',
  'If L is conserved, why isnt kinetic energy conserved too?',
  'Student generalizes "conserved" into a single blanket property of the whole system, assuming that once one quantity (angular momentum L) is shown to stay fixed, every other quantity associated with the same motion must also stay fixed. Conservation laws are quantity-SPECIFIC, not system-wide: angular momentum is conserved here because the net external TORQUE is zero, while kinetic energy is conserved only when the net WORK done on the system is zero. Those are two different conditions, and only one of them holds in this scenario. The masses are pulled inward by a real force through a real displacement, so that force does real work on the system — exactly the definition of energy being added. The kinetic-energy bar visibly climbs from 3.44 J to 15.96 J while the L readout stays perfectly flat, because the two quantities answer to two different physical requirements, and only the torque-based one is satisfied here.',
  ARRAY[
    'if L is conserved why isnt energy conserved too',
    'L stays the same so why does KE change',
    'doesnt conservation mean everything stays constant',
    'why does kinetic energy go up when nothing new pushed it',
    'I thought conserved quantities dont change ever'
  ],
  'pending_review'
),
-- ─── STATE_4 who_does_the_work deep-dive ────────────────────────────────
(
  'who_does_the_work',
  'conservation_of_angular_momentum',
  'STATE_4',
  'Who is doing the work that raises the kinetic energy?',
  'Student sees the energy total rise with no obviously "new" energy source (no motor is switched on, no external torque acts), so the extra kinetic energy feels like it appeared from nowhere or was somehow free. The agent doing the work is fully rendered on screen: the visible inward-pull arrows on each mass are a real, nonzero force, and as the masses move inward under that force, the force acts through a real displacement. Work equals force times displacement along the force''s direction, and here both factors are nonzero and aligned — the pull is radial, and the masses move radially. That mechanical work is exactly what shows up as the extra kinetic energy. The torque about the rotation axis is zero (the force points straight at the axis), which is why angular momentum is untouched, but the WORK done along the radial direction is very much nonzero, which is why kinetic energy rises. Zero torque and zero work are two different conditions, and only the first one is true here.',
  ARRAY[
    'where does the extra kinetic energy come from',
    'who is doing the work here',
    'nothing external acted so what added the energy',
    'is the pull force actually doing work',
    'if torque is zero how can there be work'
  ],
  'pending_review'
),
-- ─── STATE_4 ke_ratio_formula deep-dive ─────────────────────────────────
(
  'ke_ratio_formula',
  'conservation_of_angular_momentum',
  'STATE_4',
  'Is there a shortcut for the kinetic energy ratio?',
  'Student wants a fast way to get the new kinetic energy after a radius change without recomputing the new angular speed omega from scratch each time, especially under exam time pressure. Because angular momentum L stays EXACTLY constant while the moment of inertia I changes, kinetic energy can be rewritten entirely in terms of the conserved quantity: KE = L squared over two I, instead of the more familiar one half I omega squared. Since L is the same constant number before and after, the ratio of the two kinetic energies collapses to the ratio of the INVERTED moment-of-inertia values: KE two over KE one equals I one over I two. For this apparatus, I one over I two equals three point zero six over zero point six six, which is four point six four — matching the observed jump from three point four four joules to fifteen point nine six joules without ever needing to compute the intermediate angular speed.',
  ARRAY[
    'how do you find the new kinetic energy without recomputing omega',
    'is there a shortcut formula for the energy ratio',
    'why does KE equal L squared over 2I',
    'how is the KE ratio just I1 over I2',
    'can I get the energy change straight from the inertia values'
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
-- This concept is already registered in code (CONCEPT_PANEL_MAP in
-- src/config/panelConfig.ts:1858-1866, layout 'single', renderer field_3d,
-- landed on master in 4b289d4) — but per the precedent set by
-- uniform_circular_motion's / work_done_by_constant_force's 2026-08-01
-- migrations, a concept absent from this TABLE is the known silent-failure
-- class "Concept missing from concept_panel_config silently routes to
-- particle_field renderer with no warning" (engine_bug_queue, 2026-04-26).
-- Included here as belt-and-suspenders so the DB and the code registration
-- agree.
--
-- Values mirror the code registration exactly: single panel, field_3d, and
-- sonnet_can_upgrade FALSE because a field_3d diamond is authored config,
-- never an LLM-upgradable panel (Rule 5/18).
INSERT INTO concept_panel_config (
    concept_id, default_panel_count, panel_a_renderer, panel_b_renderer,
    sonnet_can_upgrade, upgrade_max, verified_by_human, reasoning,
    technology_a, class_level, chapter
) VALUES (
    'conservation_of_angular_momentum',
    1,
    'field_3d',
    NULL,
    FALSE,
    1,
    FALSE,
    'Class 11 Ch.7 System of Particles and Rotational Motion #9, rotmech desk A (2026-08-04). Single-panel field_3d diamond on the rigid_body_rotation scenario engine (0c-1, docs/loop_runs/rotmech/), pure configuration, zero renderer edits. Mirrors CONCEPT_PANEL_MAP in src/config/panelConfig.ts. sonnet_can_upgrade FALSE: field_3d concepts are pure authored configuration and are never upgraded by an LLM at serving time (Rule 5/18).',
    'threejs',
    11,
    '9'
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
